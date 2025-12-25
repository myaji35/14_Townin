# Townin Platform - Deployment Checklist

## Pre-Deployment Checklist

### 1. GCP Account & Billing ✅
- [ ] GCP account created
- [ ] Billing account linked
- [ ] Free tier credits available ($300 for 90 days)
- [ ] Budget alerts configured

### 2. Local Environment Setup ✅
- [ ] Google Cloud SDK installed (`gcloud` command available)
- [ ] Docker installed and running
- [ ] `gcloud auth login` completed
- [ ] GitHub CLI installed (optional)

### 3. Domain & DNS (Optional) 🌐
- [ ] Domain purchased (e.g., townin.kr)
- [ ] DNS provider configured
- [ ] Ready to create DNS records

---

## GCP Infrastructure Setup

### Step 1: Run Setup Script
```bash
cd backend
./scripts/setup-gcp.sh
```

This script will:
- [x] Create GCP project configuration
- [x] Enable required APIs (Cloud Run, SQL, Secret Manager, Storage)
- [x] Create Cloud SQL PostgreSQL instance
- [x] Create database and user
- [x] Set up Secret Manager with JWT secrets and database URL
- [x] Create Cloud Storage buckets
- [x] Create GitHub Actions service account
- [x] Generate service account key

**Expected time**: 10-15 minutes

### Step 2: Install PostgreSQL Extensions
```bash
# Connect to Cloud SQL
gcloud sql connect townin-db --user=postgres

# Inside PostgreSQL shell
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS h3;

# Verify installation
\dx

# Exit
\q
```

### Step 3: Run Database Migrations
```bash
# Option A: Using TypeORM CLI
npm run typeorm migration:run

# Option B: Using Cloud SQL Proxy locally
# Terminal 1: Start proxy
./cloud_sql_proxy -instances=PROJECT_ID:REGION:townin-db=tcp:5432

# Terminal 2: Run migrations
DATABASE_URL="postgresql://townin:PASSWORD@localhost:5432/townin_db" \
  npm run typeorm migration:run
```

---

## GitHub Configuration

### Step 4: Add GitHub Secrets
Go to: `GitHub Repository → Settings → Secrets and variables → Actions`

Add the following secrets:

| Secret Name | Value | Source |
|-------------|-------|--------|
| `GCP_PROJECT_ID` | `townin-platform` | Your GCP project ID |
| `GCP_SA_KEY` | `{...JSON...}` | Contents of `~/gcp-key-*.json` |

```bash
# Display the service account key
cat ~/gcp-key-townin-platform.json
```

Copy the entire JSON content and paste into GitHub secret `GCP_SA_KEY`.

---

## Initial Deployment

### Step 5: Deploy Backend to Cloud Run
```bash
cd backend
./scripts/deploy-to-cloudrun.sh
```

This will:
- Build Docker image
- Push to Google Container Registry
- Deploy to Cloud Run
- Run health check

**Expected time**: 5-10 minutes

### Step 6: Verify Deployment
```bash
# Get service URL
SERVICE_URL=$(gcloud run services describe townin-backend \
  --region asia-northeast3 \
  --format 'value(status.url)')

echo "Service URL: $SERVICE_URL"

# Test health endpoint
curl $SERVICE_URL/health

# Test API docs
open $SERVICE_URL/api/docs  # Opens Swagger UI
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-12-01T...",
  "database": "connected"
}
```

---

## CI/CD Activation

### Step 7: Verify GitHub Actions Workflow
The workflow is already configured at `.github/workflows/deploy-backend.yml`

Triggers:
- Push to `main` or `production` branch
- Changes in `backend/**` directory
- Manual trigger via `workflow_dispatch`

Test automatic deployment:
```bash
git add .
git commit -m "chore: trigger first automated deployment"
git push origin main
```

Monitor deployment:
- Go to GitHub → Actions tab
- Watch the "Deploy Backend to GCP Cloud Run" workflow

---

## Post-Deployment Configuration

### Step 8: Configure Custom Domain (Optional)
```bash
# Map custom domain
gcloud run domain-mappings create \
  --service townin-backend \
  --domain api.townin.kr \
  --region asia-northeast3

# Get DNS records to add
gcloud run domain-mappings describe \
  --domain api.townin.kr \
  --region asia-northeast3
```

Add the provided DNS records to your domain provider.

### Step 9: Set Up Monitoring
```bash
# Create uptime check
gcloud monitoring uptime create-http townin-health-check \
  --display-name="Townin Backend Health Check" \
  --resource-url="$SERVICE_URL/health" \
  --check-interval=60s

# Create alert policy
gcloud alpha monitoring policies create \
  --notification-channels=YOUR_CHANNEL_ID \
  --display-name="Townin Backend Down" \
  --condition-display-name="Health Check Failed" \
  --condition-threshold-value=1 \
  --condition-threshold-duration=300s
```

### Step 10: Enable Cloud Logging
```bash
# View recent logs
gcloud logging read "resource.type=cloud_run_revision \
  AND resource.labels.service_name=townin-backend" \
  --limit 50 \
  --format json

# Set up log-based metrics (optional)
gcloud logging metrics create error_rate \
  --description="Error rate for Townin Backend" \
  --log-filter='severity>=ERROR'
```

---

## Frontend Deployment (Flutter Web)

### Step 11: Build Flutter Web App
```bash
cd frontend

# Update API endpoint in environment
echo "const API_BASE_URL = '$SERVICE_URL';" > lib/core/config/environment.dart

# Build for production
flutter build web --release
```

### Step 12: Deploy Frontend to Cloud Run (or Firebase Hosting)

**Option A: Cloud Run (Simple)**
```bash
cd frontend

# Build Docker image
docker build -t gcr.io/PROJECT_ID/townin-frontend:latest .
docker push gcr.io/PROJECT_ID/townin-frontend:latest

# Deploy
gcloud run deploy townin-frontend \
  --image gcr.io/PROJECT_ID/townin-frontend:latest \
  --region asia-northeast3 \
  --platform managed \
  --allow-unauthenticated
```

**Option B: Firebase Hosting (Recommended)**
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize
firebase init hosting

# Deploy
firebase deploy --only hosting
```

---

## Testing & Validation

### Step 13: Run Integration Tests
```bash
cd backend

# Set API URL
export API_URL=$SERVICE_URL

# Run integration tests
./scripts/test-integration.sh
```

Expected: All 18 test cases should pass ✅

### Step 14: Load Testing (Optional)
```bash
# Install k6
brew install k6  # macOS

# Create load test script
cat > load-test.js <<EOF
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 50 },
    { duration: '3m', target: 50 },
    { duration: '1m', target: 0 },
  ],
};

export default function () {
  const res = http.get('$SERVICE_URL/health');
  check(res, { 'status is 200': (r) => r.status === 200 });
  sleep(1);
}
EOF

# Run load test
k6 run load-test.js
```

---

## Security Hardening

### Step 15: Security Checklist
- [ ] Secrets stored in Secret Manager (not env vars)
- [ ] Cloud SQL uses private IP (if needed)
- [ ] IAM roles follow least privilege
- [ ] CORS configured properly
- [ ] Rate limiting enabled
- [ ] SQL injection prevention (using TypeORM parameterized queries)
- [ ] XSS prevention (input validation)
- [ ] HTTPS enforced (Cloud Run default)

### Step 16: Enable Cloud Armor (Optional - for DDoS protection)
```bash
# Create security policy
gcloud compute security-policies create townin-policy \
  --description "Townin Platform Security Policy"

# Add rate limiting rule
gcloud compute security-policies rules create 1000 \
  --security-policy townin-policy \
  --expression "true" \
  --action "rate-based-ban" \
  --rate-limit-threshold-count 100 \
  --rate-limit-threshold-interval-sec 60
```

---

## Backup & Disaster Recovery

### Step 17: Configure Automated Backups
```bash
# Enable automated backups for Cloud SQL
gcloud sql instances patch townin-db \
  --backup-start-time=03:00 \
  --retained-backups-count=7 \
  --retained-transaction-log-days=7

# Verify backup configuration
gcloud sql instances describe townin-db \
  --format="value(settings.backupConfiguration)"
```

### Step 18: Test Backup Restoration
```bash
# List available backups
gcloud sql backups list --instance=townin-db

# Create test instance from backup
gcloud sql backups restore BACKUP_ID \
  --backup-instance=townin-db \
  --backup-id=BACKUP_ID \
  --target-instance=townin-db-test
```

---

## Final Verification

### Deployment Success Criteria ✅

- [ ] Backend deployed to Cloud Run
- [ ] Health check returns 200 OK
- [ ] API documentation accessible at `/api/docs`
- [ ] Database migrations applied
- [ ] PostGIS and H3 extensions installed
- [ ] Secrets properly configured
- [ ] GitHub Actions CI/CD working
- [ ] Monitoring and logging enabled
- [ ] All integration tests passing
- [ ] Frontend deployed (web or mobile)

### Performance Metrics

Monitor these metrics in the first week:
- **Response Time**: < 500ms (p95)
- **Error Rate**: < 1%
- **Uptime**: > 99.9%
- **Cold Start**: < 2s

---

## Troubleshooting

### Issue: Cloud SQL Connection Failed
```bash
# Check Cloud SQL instance status
gcloud sql instances describe townin-db

# Check Cloud Run service has SQL instance attached
gcloud run services describe townin-backend \
  --region asia-northeast3 \
  --format="value(spec.template.spec.containers.volumeMounts)"

# Verify database URL secret
gcloud secrets versions access latest --secret=database-url
```

### Issue: Secret Manager Access Denied
```bash
# Check IAM policy
gcloud secrets get-iam-policy jwt-secret

# Grant access if needed
gcloud secrets add-iam-policy-binding jwt-secret \
  --member="serviceAccount:PROJECT_ID@appspot.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

### Issue: Container Build Failed
```bash
# Check Cloud Build logs
gcloud builds list --limit=5
gcloud builds log BUILD_ID

# Test Docker build locally
cd backend
docker build -t test .
```

### Issue: Health Check Failing
```bash
# Check application logs
gcloud run services logs read townin-backend \
  --region asia-northeast3 \
  --limit 100

# Check database connectivity
gcloud sql operations list --instance=townin-db
```

---

## Cost Monitoring

### Expected Monthly Costs (Development)
- Cloud SQL (db-f1-micro): $7-10
- Cloud Run (low traffic): $5-15
- Cloud Storage: $1-5
- **Total**: ~$15-30/month

### Set Up Budget Alerts
```bash
# Create budget
gcloud billing budgets create \
  --billing-account=BILLING_ACCOUNT_ID \
  --display-name="Townin Platform Budget" \
  --budget-amount=50USD \
  --threshold-rule=percent=50 \
  --threshold-rule=percent=90 \
  --threshold-rule=percent=100
```

---

## Next Steps After Deployment

1. **Monitor Performance**: Watch Cloud Monitoring dashboard for 24-48 hours
2. **Gather User Feedback**: Share URL with beta testers
3. **Optimize**: Based on real usage patterns, adjust Cloud Run instances
4. **Scale**: Increase Cloud SQL tier if needed (db-g1-small)
5. **Implement Phase 2 Features**: IoT, GraphRAG, AI Scanner

---

## Support & Resources

- **GCP Documentation**: https://cloud.google.com/run/docs
- **Cloud SQL Docs**: https://cloud.google.com/sql/docs
- **Deployment Guide**: `docs/GCP-Deployment-Guide.md`
- **Issues**: Create GitHub issue or contact support

---

**Deployment Date**: _____________
**Deployed By**: _____________
**Production URL**: _____________
**Version**: _____________
