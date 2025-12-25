#!/bin/bash

# Townin Platform - Cloud Run Deployment Script
# This script deploys the backend to GCP Cloud Run

set -e

echo "========================================="
echo "Townin Platform - Cloud Run Deployment"
echo "========================================="

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}Error: gcloud CLI is not installed.${NC}"
    exit 1
fi

# Get current project
CURRENT_PROJECT=$(gcloud config get-value project)
echo "Current GCP Project: $CURRENT_PROJECT"
echo ""

read -p "Continue with this project? (y/n): " CONFIRM
if [ "$CONFIRM" != "y" ]; then
    echo "Deployment cancelled."
    exit 0
fi

# Configuration
PROJECT_ID=$CURRENT_PROJECT
REGION=${GCP_REGION:-asia-northeast3}
SERVICE_NAME=${SERVICE_NAME:-townin-backend}
IMAGE_TAG=${IMAGE_TAG:-latest}

echo ""
echo "Deployment Configuration:"
echo "  Project: $PROJECT_ID"
echo "  Region: $REGION"
echo "  Service: $SERVICE_NAME"
echo "  Image Tag: $IMAGE_TAG"
echo ""

# Authenticate Docker with GCR
echo -e "${YELLOW}Step 1: Authenticating Docker with GCR...${NC}"
gcloud auth configure-docker

# Build Docker image
echo ""
echo -e "${YELLOW}Step 2: Building Docker image...${NC}"
cd "$(dirname "$0")/.."
docker build -t gcr.io/$PROJECT_ID/$SERVICE_NAME:$IMAGE_TAG .

echo -e "${GREEN}✓ Docker image built${NC}"

# Push to Google Container Registry
echo ""
echo -e "${YELLOW}Step 3: Pushing image to GCR...${NC}"
docker push gcr.io/$PROJECT_ID/$SERVICE_NAME:$IMAGE_TAG

echo -e "${GREEN}✓ Image pushed to GCR${NC}"

# Deploy to Cloud Run
echo ""
echo -e "${YELLOW}Step 4: Deploying to Cloud Run...${NC}"

gcloud run deploy $SERVICE_NAME \
  --image gcr.io/$PROJECT_ID/$SERVICE_NAME:$IMAGE_TAG \
  --region $REGION \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars "NODE_ENV=production,PORT=3000" \
  --set-secrets "JWT_SECRET=jwt-secret:latest,JWT_REFRESH_SECRET=jwt-refresh-secret:latest,DATABASE_URL=database-url:latest" \
  --add-cloudsql-instances $PROJECT_ID:$REGION:townin-db \
  --max-instances 10 \
  --min-instances 1 \
  --memory 512Mi \
  --cpu 1 \
  --timeout 300 \
  --port 3000

echo -e "${GREEN}✓ Deployed to Cloud Run${NC}"

# Get service URL
echo ""
echo -e "${YELLOW}Step 5: Getting service URL...${NC}"
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region $REGION --format 'value(status.url)')

echo -e "${GREEN}✓ Service URL: $SERVICE_URL${NC}"

# Run health check
echo ""
echo -e "${YELLOW}Step 6: Running health check...${NC}"
sleep 5  # Wait for service to be ready

HEALTH_CHECK=$(curl -s -o /dev/null -w "%{http_code}" $SERVICE_URL/health)

if [ "$HEALTH_CHECK" = "200" ]; then
    echo -e "${GREEN}✓ Health check passed (HTTP $HEALTH_CHECK)${NC}"
else
    echo -e "${RED}✗ Health check failed (HTTP $HEALTH_CHECK)${NC}"
    echo "Check logs: gcloud run services logs read $SERVICE_NAME --region $REGION"
fi

# Summary
echo ""
echo "========================================="
echo -e "${GREEN}Deployment Complete!${NC}"
echo "========================================="
echo ""
echo "Service URL: $SERVICE_URL"
echo ""
echo "Test endpoints:"
echo "  Health: $SERVICE_URL/health"
echo "  API Docs: $SERVICE_URL/api/docs"
echo ""
echo "View logs:"
echo "  gcloud run services logs read $SERVICE_NAME --region $REGION --limit 50"
echo ""
echo "Update deployment:"
echo "  Re-run this script with new IMAGE_TAG"
echo ""
echo "========================================="
