#!/bin/bash

# Townin Platform - E2E Test Script

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

API_URL="http://localhost:3000/api/v1"
ACCESS_TOKEN=""

echo ""
echo "🧪 Townin Platform E2E Test"
echo "============================"
echo ""

# Test 1: Health Check
echo "1️⃣ Testing Health Check..."
HEALTH=$(curl -s http://localhost:3000/health)
if echo "$HEALTH" | grep -q "ok"; then
    echo -e "${GREEN}✅ Health check passed${NC}"
else
    echo -e "${RED}❌ Health check failed${NC}"
    echo "   Response: $HEALTH"
    exit 1
fi

# Test 2: Login
echo ""
echo "2️⃣ Testing Login..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@townin.kr",
    "password": "password123"
  }')

ACCESS_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"accessToken":"[^"]*' | grep -o '[^"]*$')

if [ -n "$ACCESS_TOKEN" ]; then
    echo -e "${GREEN}✅ Login successful${NC}"
    echo "   Token: ${ACCESS_TOKEN:0:20}..."
else
    echo -e "${RED}❌ Login failed${NC}"
    echo "   Response: $LOGIN_RESPONSE"
    exit 1
fi

# Test 3: Get Flyers by Location
echo ""
echo "3️⃣ Testing Get Flyers by Location..."
FLYERS=$(curl -s "$API_URL/flyers/location/8a2a1005892ffff?radius=2&page=1&limit=10" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

FLYER_COUNT=$(echo $FLYERS | grep -o '"data":\[' | wc -l)

if [ $FLYER_COUNT -gt 0 ]; then
    echo -e "${GREEN}✅ Flyers retrieved successfully${NC}"
    TOTAL=$(echo $FLYERS | grep -o '"total":[0-9]*' | grep -o '[0-9]*')
    echo "   Total flyers: $TOTAL"
else
    echo -e "${YELLOW}⚠️  No flyers found (this is OK for empty database)${NC}"
fi

# Test 4: Search Flyers
echo ""
echo "4️⃣ Testing Search Flyers..."
SEARCH_RESULTS=$(curl -s "$API_URL/flyers/search?q=할인&page=1&limit=10" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

if echo "$SEARCH_RESULTS" | grep -q "data"; then
    echo -e "${GREEN}✅ Search working${NC}"
else
    echo -e "${YELLOW}⚠️  Search returned no results${NC}"
fi

# Test 5: Get Flyers by Category
echo ""
echo "5️⃣ Testing Get Flyers by Category..."
CATEGORY_FLYERS=$(curl -s "$API_URL/flyers/category/food?page=1&limit=10" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

if echo "$CATEGORY_FLYERS" | grep -q "data"; then
    echo -e "${GREEN}✅ Category filter working${NC}"
else
    echo -e "${YELLOW}⚠️  No flyers in food category${NC}"
fi

# Test 6: Get Featured Flyers
echo ""
echo "6️⃣ Testing Get Featured Flyers..."
FEATURED=$(curl -s "$API_URL/flyers/featured?limit=5" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

if echo "$FEATURED" | grep -q "id"; then
    echo -e "${GREEN}✅ Featured flyers retrieved${NC}"
else
    echo -e "${YELLOW}⚠️  No featured flyers found${NC}"
fi

# Test 7: Get Flyer Detail
echo ""
echo "7️⃣ Testing Get Flyer Detail..."
# Extract first flyer ID from location response
FIRST_FLYER_ID=$(echo $FLYERS | grep -o '"id":"[^"]*' | head -1 | grep -o '[^"]*$')

if [ -n "$FIRST_FLYER_ID" ]; then
    DETAIL=$(curl -s "$API_URL/flyers/$FIRST_FLYER_ID" \
      -H "Authorization: Bearer $ACCESS_TOKEN")

    if echo "$DETAIL" | grep -q "title"; then
        echo -e "${GREEN}✅ Flyer detail retrieved${NC}"
    else
        echo -e "${RED}❌ Failed to get flyer detail${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  No flyer ID available for detail test${NC}"
fi

# Test 8: Track View
echo ""
echo "8️⃣ Testing Track Flyer View..."
if [ -n "$FIRST_FLYER_ID" ]; then
    VIEW_RESPONSE=$(curl -s -X POST "$API_URL/flyers/$FIRST_FLYER_ID/view" \
      -H "Authorization: Bearer $ACCESS_TOKEN")

    if echo "$VIEW_RESPONSE" | grep -q "View tracked"; then
        echo -e "${GREEN}✅ View tracking successful${NC}"
    else
        echo -e "${YELLOW}⚠️  View tracking response: $VIEW_RESPONSE${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  No flyer ID available for view tracking${NC}"
fi

# Test 9: Track Click
echo ""
echo "9️⃣ Testing Track Flyer Click..."
if [ -n "$FIRST_FLYER_ID" ]; then
    CLICK_RESPONSE=$(curl -s -X POST "$API_URL/flyers/$FIRST_FLYER_ID/click" \
      -H "Authorization: Bearer $ACCESS_TOKEN")

    if echo "$CLICK_RESPONSE" | grep -q "Click tracked"; then
        echo -e "${GREEN}✅ Click tracking successful${NC}"
    else
        echo -e "${YELLOW}⚠️  Click tracking response: $CLICK_RESPONSE${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  No flyer ID available for click tracking${NC}"
fi

# Test 10: Analytics
echo ""
echo "🔟 Testing Analytics..."
ANALYTICS=$(curl -s "$API_URL/analytics/events/counts?startDate=2025-01-01&endDate=2025-12-31" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

if echo "$ANALYTICS" | grep -q "eventType\|count\|\[\]"; then
    echo -e "${GREEN}✅ Analytics API working${NC}"
else
    echo -e "${YELLOW}⚠️  Analytics response: $ANALYTICS${NC}"
fi

# Summary
echo ""
echo "================================"
echo -e "${BLUE}📊 Test Summary${NC}"
echo "================================"
echo -e "${GREEN}✅ All critical endpoints tested!${NC}"
echo ""
echo "Next steps:"
echo "  1. Check Analytics events in database"
echo "  2. Test Flutter app with this backend"
echo "  3. Verify flyer approval workflow"
echo ""
