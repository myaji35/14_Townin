# MLflow Cloud Run Deployment Guide

Complete guide for deploying production-grade MLflow to Google Cloud Run.

## Prerequisites

- Google Cloud SDK (gcloud) installed
- Docker Desktop installed
- GCP Project: `msccruises`
- Billing enabled on GCP project

## Architecture Overview

```
┌─────────────────┐
│  Cloud Run      │
│  MLflow Server  │ ──┐
└─────────────────┘   │
         │            │
         │            ├──> Cloud SQL (PostgreSQL)
         │            │    - Metadata storage
         │            │
         └────────────┴──> Cloud Storage
                           - Artifact storage
```

## Step 1: Set Up GCP Project

```bash
# Set project ID
export PROJECT_ID=msccruises
export REGION=asia-northeast3

gcloud config set project $PROJECT_ID
gcloud config set compute/region $REGION

# Enable required APIs
gcloud services enable \
  run.googleapis.com \
  sqladmin.googleapis.com \
  storage.googleapis.com \
  containerregistry.googleapis.com \
  cloudbuild.googleapis.com
```

## Step 2: Create Cloud SQL Instance

### Option A: Development (Low Cost)
```bash
gcloud sql instances create townin-mlflow-postgres \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=$REGION \
  --network=default \
  --no-assign-ip \
  --backup-start-time=03:00 \
  --maintenance-window-day=SUN \
  --maintenance-window-hour=04 \
  --database-flags=max_connections=100
```

**Cost:** ~$10-15/month

### Option B: Production (Recommended)
```bash
gcloud sql instances create townin-mlflow-postgres \
  --database-version=POSTGRES_15 \
  --tier=db-custom-2-8192 \
  --region=$REGION \
  --network=default \
  --no-assign-ip \
  --backup-start-time=03:00 \
  --maintenance-window-day=SUN \
  --maintenance-window-hour=04 \
  --enable-bin-log \
  --database-flags=max_connections=200
```

**Cost:** ~$100-120/month

### Create Database and User
```bash
# Set root password
gcloud sql users set-password postgres \
  --instance=townin-mlflow-postgres \
  --password=YOUR_STRONG_PASSWORD_HERE

# Create MLflow database
gcloud sql databases create mlflow \
  --instance=townin-mlflow-postgres

# Create MLflow user
gcloud sql users create mlflow_user \
  --instance=townin-mlflow-postgres \
  --password=YOUR_MLFLOW_USER_PASSWORD_HERE
```

**Save these credentials securely!**

## Step 3: Create Cloud Storage Bucket

```bash
# Create bucket for MLflow artifacts
gsutil mb -p $PROJECT_ID -c STANDARD -l $REGION gs://townin-mlflow-artifacts

# Set lifecycle policy to delete old artifacts (optional)
cat > lifecycle.json << EOF
{
  "lifecycle": {
    "rule": [
      {
        "action": {"type": "Delete"},
        "condition": {"age": 180}
      }
    ]
  }
}
EOF

gsutil lifecycle set lifecycle.json gs://townin-mlflow-artifacts
```

**Cost:** ~$0.02/GB/month + transfer costs

## Step 4: Build and Push Docker Image

### Method A: Local Build (Requires Docker Desktop)

```bash
# Navigate to mlflow-docker directory
cd mlflow-docker

# Build the image
docker build -f Dockerfile.production -t gcr.io/$PROJECT_ID/mlflow-server:latest .

# Authenticate with GCR
gcloud auth configure-docker

# Push to Google Container Registry
docker push gcr.io/$PROJECT_ID/mlflow-server:latest

# Verify
gcloud container images list --repository=gcr.io/$PROJECT_ID
```

### Method B: Cloud Build (No Docker Required)

```bash
# Navigate to mlflow-docker directory
cd mlflow-docker

# Build using Cloud Build
gcloud builds submit --tag gcr.io/$PROJECT_ID/mlflow-server:latest .

# Verify
gcloud container images list --repository=gcr.io/$PROJECT_ID
```

**Note:** Cloud Build has free tier of 120 build-minutes/day.

## Step 5: Deploy to Cloud Run

### 5.1 Get Cloud SQL Connection Name

```bash
export SQL_CONNECTION=$(gcloud sql instances describe townin-mlflow-postgres \
  --format='value(connectionName)')

echo "Cloud SQL Connection: $SQL_CONNECTION"
```

### 5.2 Create Service Account

```bash
# Create service account for Cloud Run
gcloud iam service-accounts create mlflow-cloudrun \
  --display-name="MLflow Cloud Run Service Account"

# Grant Cloud SQL Client role
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:mlflow-cloudrun@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/cloudsql.client"

# Grant Storage Object Admin role
gsutil iam ch \
  serviceAccount:mlflow-cloudrun@$PROJECT_ID.iam.gserviceaccount.com:objectAdmin \
  gs://townin-mlflow-artifacts
```

### 5.3 Deploy Cloud Run Service

```bash
# Set environment variables
export MLFLOW_BACKEND_STORE_URI="postgresql://mlflow_user:YOUR_MLFLOW_USER_PASSWORD@/mlflow?host=/cloudsql/$SQL_CONNECTION"
export MLFLOW_ARTIFACT_ROOT="gs://townin-mlflow-artifacts"

# Deploy
gcloud run deploy mlflow-server \
  --image gcr.io/$PROJECT_ID/mlflow-server:latest \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --service-account mlflow-cloudrun@$PROJECT_ID.iam.gserviceaccount.com \
  --add-cloudsql-instances $SQL_CONNECTION \
  --set-env-vars "MLFLOW_BACKEND_STORE_URI=$MLFLOW_BACKEND_STORE_URI,MLFLOW_ARTIFACT_ROOT=$MLFLOW_ARTIFACT_ROOT" \
  --cpu 2 \
  --memory 4Gi \
  --timeout 300 \
  --concurrency 80 \
  --min-instances 0 \
  --max-instances 10 \
  --port 5000
```

### Alternative: Deploy with Authentication (IAM)

For production security, deploy with authentication:

```bash
gcloud run deploy mlflow-server \
  --image gcr.io/$PROJECT_ID/mlflow-server:latest \
  --platform managed \
  --region $REGION \
  --no-allow-unauthenticated \
  --service-account mlflow-cloudrun@$PROJECT_ID.iam.gserviceaccount.com \
  --add-cloudsql-instances $SQL_CONNECTION \
  --set-env-vars "MLFLOW_BACKEND_STORE_URI=$MLFLOW_BACKEND_STORE_URI,MLFLOW_ARTIFACT_ROOT=$MLFLOW_ARTIFACT_ROOT" \
  --cpu 2 \
  --memory 4Gi \
  --timeout 300 \
  --concurrency 80 \
  --min-instances 0 \
  --max-instances 10 \
  --port 5000
```

Then grant access to specific users:

```bash
gcloud run services add-iam-policy-binding mlflow-server \
  --region=$REGION \
  --member="user:your-email@example.com" \
  --role="roles/run.invoker"
```

## Step 6: Verify Deployment

```bash
# Get service URL
export SERVICE_URL=$(gcloud run services describe mlflow-server \
  --region=$REGION \
  --format='value(status.url)')

echo "MLflow Server URL: $SERVICE_URL"

# Test health endpoint
curl $SERVICE_URL/health

# Open in browser
open $SERVICE_URL
```

## Cost Estimation

### Development Setup
- Cloud SQL (db-f1-micro): ~$10-15/month
- Cloud Storage: ~$1-5/month
- Cloud Run: ~$5-10/month (with free tier)
- **Total: ~$16-30/month**

### Production Setup
- Cloud SQL (db-custom-2-8192): ~$100-120/month
- Cloud Storage: ~$10-20/month
- Cloud Run: ~$20-50/month
- **Total: ~$130-190/month**

### Cloud Run Pricing Details
- **CPU**: $0.00002400/vCPU-second
- **Memory**: $0.00000250/GiB-second
- **Requests**: $0.40/million requests
- **Free Tier**: 2 million requests/month, 360,000 GiB-seconds, 180,000 vCPU-seconds

## Using MLflow from Python

```python
import mlflow
import os

# Set tracking URI to Cloud Run service
mlflow.set_tracking_uri("YOUR_CLOUD_RUN_URL")

# If using IAM authentication, use gcloud credentials
# os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "/path/to/service-account-key.json"

# Log experiment
with mlflow.start_run(run_name="townin_graphrag_experiment"):
    mlflow.log_param("chunk_size", 512)
    mlflow.log_param("embedding_model", "text-embedding-ada-002")
    mlflow.log_metric("faithfulness", 0.92)
    mlflow.log_artifact("results/graph.png")
```

## Monitoring and Logs

```bash
# View Cloud Run logs
gcloud run services logs read mlflow-server --region=$REGION --limit=50

# Stream logs in real-time
gcloud run services logs tail mlflow-server --region=$REGION

# View Cloud SQL logs
gcloud sql operations list --instance=townin-mlflow-postgres

# Monitor Cloud Run metrics
gcloud monitoring dashboards list
```

## Updating the Deployment

```bash
# Rebuild and push new image
cd mlflow-docker
gcloud builds submit --tag gcr.io/$PROJECT_ID/mlflow-server:latest .

# Deploy new revision
gcloud run deploy mlflow-server \
  --image gcr.io/$PROJECT_ID/mlflow-server:latest \
  --region $REGION

# Rollback if needed
gcloud run services update-traffic mlflow-server \
  --region=$REGION \
  --to-revisions=PREVIOUS_REVISION=100
```

## Backup and Recovery

### PostgreSQL Backup
```bash
# Manual backup
gcloud sql backups create --instance=townin-mlflow-postgres

# List backups
gcloud sql backups list --instance=townin-mlflow-postgres

# Restore from backup
gcloud sql backups restore BACKUP_ID --backup-instance=townin-mlflow-postgres
```

### Cloud Storage Backup
```bash
# Create versioning
gsutil versioning set on gs://townin-mlflow-artifacts

# Copy to backup bucket
gsutil -m cp -r gs://townin-mlflow-artifacts gs://townin-mlflow-artifacts-backup
```

## Cleanup (Development Only)

```bash
# Delete Cloud Run service
gcloud run services delete mlflow-server --region=$REGION

# Delete Cloud SQL instance (CAUTION: Data will be lost!)
gcloud sql instances delete townin-mlflow-postgres

# Delete Cloud Storage bucket (CAUTION: Artifacts will be lost!)
gsutil -m rm -r gs://townin-mlflow-artifacts

# Delete service account
gcloud iam service-accounts delete mlflow-cloudrun@$PROJECT_ID.iam.gserviceaccount.com
```

## Troubleshooting

### Issue: Cloud Run can't connect to Cloud SQL
**Solution:** Ensure Cloud SQL connection name is correct and service account has `roles/cloudsql.client`

```bash
# Check connection name
gcloud sql instances describe townin-mlflow-postgres --format='value(connectionName)'

# Verify IAM binding
gcloud projects get-iam-policy $PROJECT_ID \
  --flatten="bindings[].members" \
  --filter="bindings.role:roles/cloudsql.client"
```

### Issue: MLflow can't write artifacts to Cloud Storage
**Solution:** Verify service account has Storage permissions

```bash
# Check bucket IAM
gsutil iam get gs://townin-mlflow-artifacts

# Grant permissions
gsutil iam ch serviceAccount:mlflow-cloudrun@$PROJECT_ID.iam.gserviceaccount.com:objectAdmin gs://townin-mlflow-artifacts
```

### Issue: Cloud Run 503 errors
**Solution:** Increase timeout and resources

```bash
gcloud run services update mlflow-server \
  --region=$REGION \
  --timeout=300 \
  --cpu=2 \
  --memory=4Gi
```

## Next Steps

1. Set up CI/CD pipeline with Cloud Build
2. Configure custom domain with Cloud Run
3. Set up monitoring and alerting
4. Implement automated backups
5. Configure VPC peering for enhanced security

## References

- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Cloud SQL for PostgreSQL](https://cloud.google.com/sql/docs/postgres)
- [MLflow Tracking](https://mlflow.org/docs/latest/tracking.html)
- [Google Cloud Storage](https://cloud.google.com/storage/docs)
