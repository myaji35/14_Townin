#!/bin/bash

# Townin Platform - GCP Setup Script
# This script automates the initial GCP infrastructure setup

set -e

echo "========================================="
echo "Townin Platform - GCP Setup Automation"
echo "========================================="

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}Error: gcloud CLI is not installed.${NC}"
    echo "Install it from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Prompt for project configuration
echo ""
echo -e "${YELLOW}Step 1: Project Configuration${NC}"
read -p "Enter your GCP Project ID (e.g., townin-platform): " PROJECT_ID
read -p "Enter region [default: asia-northeast3 (Seoul)]: " REGION
REGION=${REGION:-asia-northeast3}
read -p "Enter service name [default: townin-backend]: " SERVICE_NAME
SERVICE_NAME=${SERVICE_NAME:-townin-backend}

# Set gcloud config
echo ""
echo -e "${YELLOW}Setting gcloud configuration...${NC}"
gcloud config set project $PROJECT_ID
gcloud config set run/region $REGION

# Enable required APIs
echo ""
echo -e "${YELLOW}Step 2: Enabling required GCP APIs...${NC}"
echo "This may take a few minutes..."

gcloud services enable \
  run.googleapis.com \
  sql-component.googleapis.com \
  sqladmin.googleapis.com \
  compute.googleapis.com \
  cloudbuild.googleapis.com \
  secretmanager.googleapis.com \
  storage-api.googleapis.com \
  storage-component.googleapis.com \
  containerregistry.googleapis.com

echo -e "${GREEN}✓ APIs enabled successfully${NC}"

# Create Cloud SQL instance
echo ""
echo -e "${YELLOW}Step 3: Creating Cloud SQL PostgreSQL instance...${NC}"
read -p "Enter a strong root password for PostgreSQL: " -s DB_ROOT_PASSWORD
echo ""
read -p "Enter a strong password for 'townin' user: " -s DB_USER_PASSWORD
echo ""

gcloud sql instances create townin-db \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=$REGION \
  --root-password="$DB_ROOT_PASSWORD" \
  --database-flags=cloudsql.iam_authentication=on

echo -e "${GREEN}✓ Cloud SQL instance created${NC}"

# Create database and user
echo ""
echo -e "${YELLOW}Creating database and user...${NC}"

gcloud sql databases create townin_db --instance=townin-db

gcloud sql users create townin \
  --instance=townin-db \
  --password="$DB_USER_PASSWORD"

echo -e "${GREEN}✓ Database and user created${NC}"

# Install PostGIS extension
echo ""
echo -e "${YELLOW}Installing PostGIS extension...${NC}"
echo "NOTE: You may need to connect manually and run: CREATE EXTENSION postgis; CREATE EXTENSION h3;"
echo "Connection command: gcloud sql connect townin-db --user=postgres"

# Create Secret Manager secrets
echo ""
echo -e "${YELLOW}Step 4: Setting up Secret Manager...${NC}"

read -p "Enter JWT Secret (leave empty to auto-generate): " JWT_SECRET
JWT_SECRET=${JWT_SECRET:-$(openssl rand -base64 32)}

read -p "Enter JWT Refresh Secret (leave empty to auto-generate): " JWT_REFRESH_SECRET
JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET:-$(openssl rand -base64 32)}

# Database URL
DATABASE_URL="postgresql://townin:${DB_USER_PASSWORD}@/townin_db?host=/cloudsql/${PROJECT_ID}:${REGION}:townin-db"

# Create secrets
echo "$JWT_SECRET" | gcloud secrets create jwt-secret --data-file=- || echo "Secret jwt-secret already exists"
echo "$JWT_REFRESH_SECRET" | gcloud secrets create jwt-refresh-secret --data-file=- || echo "Secret jwt-refresh-secret already exists"
echo "$DATABASE_URL" | gcloud secrets create database-url --data-file=- || echo "Secret database-url already exists"

echo -e "${GREEN}✓ Secrets created${NC}"

# Grant Secret Manager access to default service account
echo ""
echo -e "${YELLOW}Granting Secret Manager access...${NC}"

SERVICE_ACCOUNT="${PROJECT_ID}@appspot.gserviceaccount.com"

gcloud secrets add-iam-policy-binding jwt-secret \
  --member="serviceAccount:${SERVICE_ACCOUNT}" \
  --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding jwt-refresh-secret \
  --member="serviceAccount:${SERVICE_ACCOUNT}" \
  --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding database-url \
  --member="serviceAccount:${SERVICE_ACCOUNT}" \
  --role="roles/secretmanager.secretAccessor"

echo -e "${GREEN}✓ Permissions granted${NC}"

# Create Cloud Storage buckets
echo ""
echo -e "${YELLOW}Step 5: Creating Cloud Storage buckets...${NC}"

gsutil mb -c STANDARD -l $REGION gs://${PROJECT_ID}-flyer-images || echo "Bucket already exists"
gsutil mb -c STANDARD -l $REGION gs://${PROJECT_ID}-public-data || echo "Bucket already exists"

# Set CORS for flyer images bucket
cat > /tmp/cors.json <<EOF
[
  {
    "origin": ["*"],
    "method": ["GET", "HEAD", "PUT", "POST", "DELETE"],
    "responseHeader": ["Content-Type"],
    "maxAgeSeconds": 3600
  }
]
EOF

gsutil cors set /tmp/cors.json gs://${PROJECT_ID}-flyer-images
rm /tmp/cors.json

echo -e "${GREEN}✓ Storage buckets created${NC}"

# Create GitHub Actions service account
echo ""
echo -e "${YELLOW}Step 6: Creating GitHub Actions service account...${NC}"

gcloud iam service-accounts create github-actions \
  --display-name="GitHub Actions Deployer" || echo "Service account already exists"

GITHUB_SA="github-actions@${PROJECT_ID}.iam.gserviceaccount.com"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${GITHUB_SA}" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${GITHUB_SA}" \
  --role="roles/storage.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${GITHUB_SA}" \
  --role="roles/iam.serviceAccountUser"

echo -e "${GREEN}✓ Service account created${NC}"

# Generate service account key
echo ""
echo -e "${YELLOW}Generating service account key...${NC}"
KEY_FILE="$HOME/gcp-key-${PROJECT_ID}.json"

gcloud iam service-accounts keys create "$KEY_FILE" \
  --iam-account="${GITHUB_SA}"

echo -e "${GREEN}✓ Key saved to: ${KEY_FILE}${NC}"
echo -e "${YELLOW}IMPORTANT: Add this key to GitHub Secrets as 'GCP_SA_KEY'${NC}"

# Summary
echo ""
echo "========================================="
echo -e "${GREEN}GCP Setup Complete!${NC}"
echo "========================================="
echo ""
echo "Summary:"
echo "  Project ID: $PROJECT_ID"
echo "  Region: $REGION"
echo "  Service Name: $SERVICE_NAME"
echo "  Cloud SQL Instance: townin-db"
echo "  Database: townin_db"
echo ""
echo "Next Steps:"
echo "  1. Connect to Cloud SQL and install extensions:"
echo "     gcloud sql connect townin-db --user=postgres"
echo "     Then run: CREATE EXTENSION IF NOT EXISTS postgis;"
echo "               CREATE EXTENSION IF NOT EXISTS h3;"
echo ""
echo "  2. Add GitHub Secrets:"
echo "     - GCP_PROJECT_ID: $PROJECT_ID"
echo "     - GCP_SA_KEY: (contents of $KEY_FILE)"
echo ""
echo "  3. Build and push Docker image:"
echo "     cd backend"
echo "     docker build -t gcr.io/$PROJECT_ID/$SERVICE_NAME:latest ."
echo "     docker push gcr.io/$PROJECT_ID/$SERVICE_NAME:latest"
echo ""
echo "  4. Deploy to Cloud Run:"
echo "     ./scripts/deploy-to-cloudrun.sh"
echo ""
echo "========================================="
