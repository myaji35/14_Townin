#!/bin/bash

# Integration Test Script for Townin Platform
# Tests complete user flows end-to-end

set -e

API_URL="${API_URL:-http://localhost:3000/api/v1}"

echo "========================================="
echo "Townin Platform Integration Tests"
echo "========================================="
echo ""
echo "API URL: $API_URL"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

passed=0
failed=0

test_case() {
    local name=$1
    local command=$2

    echo -n "Testing: $name... "

    if eval "$command" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ PASS${NC}"
        ((passed++))
    else
        echo -e "${RED}✗ FAIL${NC}"
        ((failed++))
    fi
}

echo "========================================="
echo "Flow 1: User Authentication & Profile"
echo "========================================="

# Test 1: User Login
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "user@townin.kr", "password": "password123"}')

ACCESS_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)

if [ -z "$ACCESS_TOKEN" ]; then
    echo -e "${RED}✗ Login failed - cannot proceed${NC}"
    exit 1
fi

echo -e "${GREEN}✓ User logged in successfully${NC}"
echo ""

# Test 2: Get Profile
test_case "Get user profile" \
  "curl -s -X GET '$API_URL/auth/profile' \
    -H 'Authorization: Bearer $ACCESS_TOKEN' \
    | grep -q 'email'"

echo ""
echo "========================================="
echo "Flow 2: Flyer Discovery & Favorites"
echo "========================================="

# Test 3: Search Flyers by Location
H3_INDEX="891f1d4aa3fffff"
test_case "Search flyers by H3 location" \
  "curl -s -X GET '$API_URL/flyers/location/$H3_INDEX?radius=1&page=1&limit=10' \
    -H 'Authorization: Bearer $ACCESS_TOKEN' \
    | grep -q 'data'"

# Test 4: Get Featured Flyers
test_case "Get featured flyers" \
  "curl -s -X GET '$API_URL/flyers/featured?limit=5' \
    -H 'Authorization: Bearer $ACCESS_TOKEN' \
    | grep -q 'id'"

# Test 5: Search Flyers by Keyword
test_case "Search flyers by keyword" \
  "curl -s -X GET '$API_URL/flyers/search?q=할인&page=1&limit=10' \
    -H 'Authorization: Bearer $ACCESS_TOKEN' \
    | grep -q 'data'"

# Get a flyer ID for testing
FLYER_RESPONSE=$(curl -s -X GET "$API_URL/flyers/featured?limit=1" \
  -H "Authorization: Bearer $ACCESS_TOKEN")
FLYER_ID=$(echo $FLYER_RESPONSE | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$FLYER_ID" ]; then
    echo -e "${YELLOW}⚠ No flyers found for testing favorites${NC}"
else
    echo -e "${GREEN}✓ Found flyer: $FLYER_ID${NC}"

    # Test 6: Add to Favorites
    test_case "Add flyer to favorites" \
      "curl -s -X POST '$API_URL/favorites/$FLYER_ID' \
        -H 'Authorization: Bearer $ACCESS_TOKEN' \
        | grep -q 'message'"

    # Test 7: Check Favorite Status
    test_case "Check if flyer is favorited" \
      "curl -s -X GET '$API_URL/favorites/check/$FLYER_ID' \
        -H 'Authorization: Bearer $ACCESS_TOKEN' \
        | grep -q '\"isFavorited\":true'"

    # Test 8: Get Favorites List
    test_case "Get favorites list" \
      "curl -s -X GET '$API_URL/favorites?page=1&limit=10' \
        -H 'Authorization: Bearer $ACCESS_TOKEN' \
        | grep -q 'data'"

    # Test 9: Get Favorite IDs
    test_case "Get favorite IDs" \
      "curl -s -X GET '$API_URL/favorites/ids' \
        -H 'Authorization: Bearer $ACCESS_TOKEN' \
        | grep -q 'favoriteIds'"

    # Test 10: Track Flyer View
    test_case "Track flyer view" \
      "curl -s -X POST '$API_URL/flyers/$FLYER_ID/view' \
        -H 'Authorization: Bearer $ACCESS_TOKEN'"

    # Test 11: Track Flyer Click
    test_case "Track flyer click" \
      "curl -s -X POST '$API_URL/flyers/$FLYER_ID/click' \
        -H 'Authorization: Bearer $ACCESS_TOKEN'"

    # Test 12: Remove from Favorites
    test_case "Remove from favorites" \
      "curl -s -X DELETE '$API_URL/favorites/$FLYER_ID' \
        -H 'Authorization: Bearer $ACCESS_TOKEN' \
        | grep -q 'message'"
fi

echo ""
echo "========================================="
echo "Flow 3: Merchant Dashboard"
echo "========================================="

# Login as Merchant
MERCHANT_LOGIN=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "merchant@townin.kr", "password": "password123"}')

MERCHANT_TOKEN=$(echo $MERCHANT_LOGIN | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)

if [ -z "$MERCHANT_TOKEN" ]; then
    echo -e "${YELLOW}⚠ Merchant login failed${NC}"
else
    echo -e "${GREEN}✓ Merchant logged in${NC}"

    # Test 13: Merchant Profile
    test_case "Get merchant profile" \
      "curl -s -X GET '$API_URL/auth/profile' \
        -H 'Authorization: Bearer $MERCHANT_TOKEN' \
        | grep -q 'merchant'"
fi

echo ""
echo "========================================="
echo "Flow 4: Admin Approval Workflow"
echo "========================================="

# Login as Admin
ADMIN_LOGIN=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@townin.kr", "password": "password123"}')

ADMIN_TOKEN=$(echo $ADMIN_LOGIN | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)

if [ -z "$ADMIN_TOKEN" ]; then
    echo -e "${YELLOW}⚠ Admin login failed${NC}"
else
    echo -e "${GREEN}✓ Admin logged in${NC}"

    # Test 14: Get Pending Flyers
    test_case "Get pending flyers" \
      "curl -s -X GET '$API_URL/flyers/admin/pending?page=1&limit=10' \
        -H 'Authorization: Bearer $ADMIN_TOKEN' \
        | grep -q 'data'"

    # Note: Approval/Rejection tests would need a pending flyer ID
fi

echo ""
echo "========================================="
echo "Flow 5: Analytics & Statistics"
echo "========================================="

# Test 15: Track Analytics Event
test_case "Track analytics event" \
  "curl -s -X POST '$API_URL/analytics/track' \
    -H 'Authorization: Bearer $ACCESS_TOKEN' \
    -H 'Content-Type: application/json' \
    -d '{\"eventType\":\"screen_view\",\"metadata\":{\"screen\":\"home\"}}' \
    | grep -q 'success'"

# Test 16: Get Analytics Summary
test_case "Get analytics summary" \
  "curl -s -X GET '$API_URL/analytics/summary' \
    -H 'Authorization: Bearer $ACCESS_TOKEN' \
    | grep -q 'totalEvents'"

echo ""
echo "========================================="
echo "Flow 6: File Upload"
echo "========================================="

# Test 17: Get Presigned URL
test_case "Get presigned upload URL" \
  "curl -s -X GET '$API_URL/files/presigned-url?fileName=test.jpg&fileType=image/jpeg' \
    -H 'Authorization: Bearer $ACCESS_TOKEN' \
    | grep -q 'uploadUrl'"

echo ""
echo "========================================="
echo "Flow 7: Public Data (No Auth Required)"
echo "========================================="

# Test 18: Get Safety Data
test_case "Get safety data by H3 index" \
  "curl -s -X GET '$API_URL/public-data/safety/$H3_INDEX' \
    | grep -q 'h3Index'"

echo ""
echo "========================================="
echo "Test Results Summary"
echo "========================================="
echo ""
echo -e "Total Tests: $((passed + failed))"
echo -e "${GREEN}Passed: $passed${NC}"
echo -e "${RED}Failed: $failed${NC}"
echo ""

if [ $failed -eq 0 ]; then
    echo -e "${GREEN}✓ All integration tests passed!${NC}"
    exit 0
else
    echo -e "${RED}✗ Some tests failed${NC}"
    exit 1
fi
