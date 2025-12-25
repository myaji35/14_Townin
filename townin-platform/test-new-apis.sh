#!/bin/bash

echo "Testing Townin New API Endpoints"
echo "=================================="
echo ""

# First login to get a token
echo "1. Logging in as Security Guard..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"guard1@townin.kr","password":"townin2025!"}')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)

echo "Token obtained: ${TOKEN:0:30}..."
echo ""

echo "2. Testing Security Guard My Profile..."
curl -s -X GET http://localhost:3000/api/v1/security-guards/my-profile \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
echo ""

echo "3. Testing Security Guard Performance..."
curl -s -X GET http://localhost:3000/api/v1/security-guards/my-performance \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
echo ""

echo "4. Testing Grid Cells for Uijeongbu..."
curl -s -X GET "http://localhost:3000/api/v1/grid-cells?city=의정부시" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
echo ""

echo "5. Testing Merchants in uijeongbu_01..."
curl -s -X GET http://localhost:3000/api/v1/merchants/grid-cell/uijeongbu_01 \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
echo ""

echo "6. Testing Merchant Statistics for uijeongbu_01..."
curl -s -X GET http://localhost:3000/api/v1/merchants/stats/uijeongbu_01 \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
