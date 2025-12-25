#!/bin/bash

# Townin Platform - Deployment Verification Script
# Checks GCP infrastructure and deployment status

set -e

echo "========================================="
echo "Townin Platform - Deployment Verification"
echo "========================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Get project info
PROJECT_ID=$(gcloud config get-value project)
REGION=${GCP_REGION:-asia-northeast3}
SERVICE_NAME=${SERVICE_NAME:-townin-backend}

echo ""
echo "Verifying deployment for:"
echo "  Project: $PROJECT_ID"
echo "  Region: $REGION"
echo "  Service: $SERVICE_NAME"
echo ""

# Test results
PASSED=0
FAILED=0

# Test function
test_check() {
    local test_name=$1
    local test_command=$2

    echo -n "Checking $test_name... "

    if eval "$test_command" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ PASS${NC}"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}✗ FAIL${NC}"
        ((FAILED++))
        return 1
    fi
}

# 1. Check if APIs are enabled
echo ""
echo "=== API Services ==="
test_check "Cloud Run API" "gcloud services list --enabled | grep -q run.googleapis.com"
test_check "Cloud SQL Admin API" "gcloud services list --enabled | grep -q sqladmin.googleapis.com"
test_check "Secret Manager API" "gcloud services list --enabled | grep -q secretmanager.googleapis.com"
test_check "Cloud Build API" "gcloud services list --enabled | grep -q cloudbuild.googleapis.com"
test_check "Container Registry API" "gcloud services list --enabled | grep -q containerregistry.googleapis.com"

# 2. Check Cloud SQL
echo ""
echo "=== Cloud SQL ==="
test_check "Cloud SQL instance exists" "gcloud sql instances describe townin-db --format='value(name)'"

if gcloud sql instances describe townin-db > /dev/null 2>&1; then
    SQL_STATUS=$(gcloud sql instances describe townin-db --format='value(state)')
    echo "  Instance State: $SQL_STATUS"

    SQL_IP=$(gcloud sql instances describe townin-db --format='value(ipAddresses[0].ipAddress)')
    echo "  IP Address: $SQL_IP"
fi

test_check "Database 'townin_db' exists" "gcloud sql databases list --instance=townin-db | grep -q townin_db"
test_check "User 'townin' exists" "gcloud sql users list --instance=townin-db | grep -q townin"

# 3. Check Secret Manager
echo ""
echo "=== Secret Manager ==="
test_check "Secret 'jwt-secret' exists" "gcloud secrets describe jwt-secret --format='value(name)'"
test_check "Secret 'jwt-refresh-secret' exists" "gcloud secrets describe jwt-refresh-secret --format='value(name)'"
test_check "Secret 'database-url' exists" "gcloud secrets describe database-url --format='value(name)'"

# 4. Check Cloud Storage
echo ""
echo "=== Cloud Storage ==="
test_check "Flyer images bucket exists" "gsutil ls | grep -q ${PROJECT_ID}-flyer-images"
test_check "Public data bucket exists" "gsutil ls | grep -q ${PROJECT_ID}-public-data"

# 5. Check Cloud Run
echo ""
echo "=== Cloud Run ==="
test_check "Cloud Run service exists" "gcloud run services describe $SERVICE_NAME --region $REGION --format='value(metadata.name)'"

if gcloud run services describe $SERVICE_NAME --region $REGION > /dev/null 2>&1; then
    SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region $REGION --format='value(status.url)')
    echo "  Service URL: $SERVICE_URL"

    LATEST_REVISION=$(gcloud run services describe $SERVICE_NAME --region $REGION --format='value(status.latestReadyRevisionName)')
    echo "  Latest Revision: $LATEST_REVISION"

    # Check service configuration
    ENV_VARS=$(gcloud run services describe $SERVICE_NAME --region $REGION --format='value(spec.template.spec.containers[0].env)')
    if echo "$ENV_VARS" | grep -q "NODE_ENV"; then
        echo -e "  Environment: ${GREEN}✓ Configured${NC}"
    else
        echo -e "  Environment: ${RED}✗ Missing${NC}"
    fi

    # Test health endpoint
    echo ""
    echo "=== Health Check ==="
    echo -n "Testing $SERVICE_URL/health... "

    HEALTH_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $SERVICE_URL/health)

    if [ "$HEALTH_RESPONSE" = "200" ]; then
        echo -e "${GREEN}✓ PASS (HTTP $HEALTH_RESPONSE)${NC}"
        ((PASSED++))

        # Get detailed health info
        HEALTH_DATA=$(curl -s $SERVICE_URL/health)
        echo "  Response: $HEALTH_DATA"
    else
        echo -e "${RED}✗ FAIL (HTTP $HEALTH_RESPONSE)${NC}"
        ((FAILED++))
    fi

    # Test API docs endpoint
    echo -n "Testing $SERVICE_URL/api/docs... "
    DOCS_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $SERVICE_URL/api/docs)

    if [ "$DOCS_RESPONSE" = "200" ] || [ "$DOCS_RESPONSE" = "301" ] || [ "$DOCS_RESPONSE" = "302" ]; then
        echo -e "${GREEN}✓ PASS (HTTP $DOCS_RESPONSE)${NC}"
        ((PASSED++))
    else
        echo -e "${RED}✗ FAIL (HTTP $DOCS_RESPONSE)${NC}"
        ((FAILED++))
    fi
fi

# 6. Check GitHub Actions Service Account
echo ""
echo "=== GitHub Actions ==="
GITHUB_SA="github-actions@${PROJECT_ID}.iam.gserviceaccount.com"
test_check "GitHub Actions service account exists" "gcloud iam service-accounts describe $GITHUB_SA --format='value(email)'"

# 7. Check Container Images
echo ""
echo "=== Container Registry ==="
if gcloud container images list --repository=gcr.io/$PROJECT_ID 2>/dev/null | grep -q $SERVICE_NAME; then
    echo -e "Container images: ${GREEN}✓ EXISTS${NC}"

    LATEST_IMAGE=$(gcloud container images list-tags gcr.io/$PROJECT_ID/$SERVICE_NAME --limit=1 --format='value(tags)')
    echo "  Latest tag: $LATEST_IMAGE"
    ((PASSED++))
else
    echo -e "Container images: ${YELLOW}⚠ NOT FOUND${NC}"
    echo "  Note: First deployment will create the image"
    ((FAILED++))
fi

# Summary
echo ""
echo "========================================="
echo "Verification Summary"
echo "========================================="
echo -e "Passed: ${GREEN}$PASSED${NC}"
echo -e "Failed: ${RED}$FAILED${NC}"
echo "Total: $((PASSED + FAILED))"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All checks passed! Deployment is healthy.${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠ Some checks failed. Review the output above.${NC}"
    echo ""
    echo "Common solutions:"
    echo "  - Run setup script: ./scripts/setup-gcp.sh"
    echo "  - Deploy service: ./scripts/deploy-to-cloudrun.sh"
    echo "  - Check logs: gcloud run services logs read $SERVICE_NAME --region $REGION"
    exit 1
fi
