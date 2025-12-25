#!/bin/bash

# Townin Platform - GCP Setup Script (Existing Project)
# This script sets up infrastructure in existing GCP project: sd-kanban-api

set -e

echo "========================================="
echo "Townin Graph - GCP Setup"
echo "Using existing project: sd-kanban-api"
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

# Use existing project
PROJECT_ID="sd-kanban-api"
REGION="asia-northeast3"  # Seoul
SERVICE_NAME="townin-backend"

echo ""
echo -e "${YELLOW}Step 1: Updating project display name...${NC}"
gcloud projects update $PROJECT_ID --name="Townin Graph"
echo -e "${GREEN}✓ Project name updated to 'Townin Graph'${NC}"

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
echo -e "${YELLOW}Step 4: Installing PostGIS extension...${NC}"
echo "Connecting to database to install extensions..."

# Create temp SQL file
cat > /tmp/install-extensions.sql <<EOF
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;
-- Note: h3-pg extension requires manual installation
-- See: https://github.com/zachasme/h3-pg
\dx
EOF

echo "Please run the following command manually after setup:"
echo -e "${YELLOW}gcloud sql connect townin-db --user=postgres${NC}"
echo "Then paste these commands:"
cat /tmp/install-extensions.sql

# Create Secret Manager secrets
echo ""
echo -e "${YELLOW}Step 5: Setting up Secret Manager...${NC}"

read -p "Enter JWT Secret (leave empty to auto-generate): " JWT_SECRET
JWT_SECRET=${JWT_SECRET:-$(openssl rand -base64 32)}

read -p "Enter JWT Refresh Secret (leave empty to auto-generate): " JWT_REFRESH_SECRET
JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET:-$(openssl rand -base64 32)}

# Database URL
DATABASE_URL="postgresql://townin:${DB_USER_PASSWORD}@/townin_db?host=/cloudsql/${PROJECT_ID}:${REGION}:townin-db"

# Create secrets
echo "$JWT_SECRET" | gcloud secrets create jwt-secret --data-file=- 2>/dev/null || \
  (echo "$JWT_SECRET" | gcloud secrets versions add jwt-secret --data-file=-)

echo "$JWT_REFRESH_SECRET" | gcloud secrets create jwt-refresh-secret --data-file=- 2>/dev/null || \
  (echo "$JWT_REFRESH_SECRET" | gcloud secrets versions add jwt-refresh-secret --data-file=-)

echo "$DATABASE_URL" | gcloud secrets create database-url --data-file=- 2>/dev/null || \
  (echo "$DATABASE_URL" | gcloud secrets versions add database-url --data-file=-)

echo -e "${GREEN}✓ Secrets created/updated${NC}"

# Grant Secret Manager access to default service account
echo ""
echo -e "${YELLOW}Granting Secret Manager access...${NC}"

# Get the Compute Engine default service account
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format='value(projectNumber)')
SERVICE_ACCOUNT="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"

echo "Using service account: $SERVICE_ACCOUNT"

for SECRET in jwt-secret jwt-refresh-secret database-url; do
  gcloud secrets add-iam-policy-binding $SECRET \
    --member="serviceAccount:${SERVICE_ACCOUNT}" \
    --role="roles/secretmanager.secretAccessor" 2>/dev/null || true
done

echo -e "${GREEN}✓ Permissions granted${NC}"

# Create Cloud Storage buckets
echo ""
echo -e "${YELLOW}Step 6: Creating Cloud Storage buckets...${NC}"

gsutil mb -c STANDARD -l $REGION gs://${PROJECT_ID}-flyer-images 2>/dev/null || echo "Flyer bucket already exists"
gsutil mb -c STANDARD -l $REGION gs://${PROJECT_ID}-public-data 2>/dev/null || echo "Public data bucket already exists"

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

echo -e "${GREEN}✓ Storage buckets configured${NC}"

# Create GitHub Actions service account
echo ""
echo -e "${YELLOW}Step 7: Creating GitHub Actions service account...${NC}"

gcloud iam service-accounts create github-actions \
  --display-name="GitHub Actions Deployer" 2>/dev/null || echo "Service account already exists"

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

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${GITHUB_SA}" \
  --role="roles/cloudbuild.builds.builder"

echo -e "${GREEN}✓ Service account created${NC}"

# Generate service account key
echo ""
echo -e "${YELLOW}Generating service account key...${NC}"
KEY_FILE="$HOME/gcp-key-townin-graph.json"

# Delete old keys if exist
OLD_KEYS=$(gcloud iam service-accounts keys list \
  --iam-account="${GITHUB_SA}" \
  --filter="keyType=USER_MANAGED" \
  --format="value(name)" 2>/dev/null || true)

if [ ! -z "$OLD_KEYS" ]; then
  echo "Cleaning up old keys..."
  echo "$OLD_KEYS" | while read KEY; do
    gcloud iam service-accounts keys delete "$KEY" \
      --iam-account="${GITHUB_SA}" \
      --quiet 2>/dev/null || true
  done
fi

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
echo "Project Configuration:"
echo "  Project ID: $PROJECT_ID"
echo "  Project Name: Townin Graph"
echo "  Region: $REGION"
echo "  Service Name: $SERVICE_NAME"
echo ""
echo "Infrastructure Created:"
echo "  ✓ Cloud SQL Instance: townin-db"
echo "  ✓ Database: townin_db"
echo "  ✓ Secrets: jwt-secret, jwt-refresh-secret, database-url"
echo "  ✓ Storage Buckets: ${PROJECT_ID}-flyer-images, ${PROJECT_ID}-public-data"
echo "  ✓ GitHub Service Account: github-actions"
echo ""
echo "Next Steps:"
echo ""
echo "1. Install PostgreSQL extensions:"
echo "   ${YELLOW}gcloud sql connect townin-db --user=postgres${NC}"
echo "   Then run:"
echo "   ${YELLOW}CREATE EXTENSION IF NOT EXISTS postgis;${NC}"
echo "   ${YELLOW}CREATE EXTENSION IF NOT EXISTS postgis_topology;${NC}"
echo ""
echo "2. Add GitHub Secrets (Repository → Settings → Secrets):"
echo "   - GCP_PROJECT_ID: ${YELLOW}sd-kanban-api${NC}"
echo "   - GCP_SA_KEY: (contents of ${YELLOW}$KEY_FILE${NC})"
echo ""
echo "3. Display service account key:"
echo "   ${YELLOW}cat $KEY_FILE${NC}"
echo ""
echo "4. Build and deploy:"
echo "   ${YELLOW}cd backend${NC}"
echo "   ${YELLOW}./scripts/deploy-to-cloudrun.sh${NC}"
echo ""
echo "5. Verify deployment:"
echo "   ${YELLOW}./scripts/verify-deployment.sh${NC}"
echo ""
echo "========================================="
echo ""
echo "Save these credentials securely:"
echo "  DB Root Password: (you entered above)"
echo "  DB User Password: (you entered above)"
echo "  JWT Secret: $JWT_SECRET"
echo "  JWT Refresh Secret: $JWT_REFRESH_SECRET"
echo ""
echo "Database Connection String:"
echo "  $DATABASE_URL"
echo ""
echo "========================================="
