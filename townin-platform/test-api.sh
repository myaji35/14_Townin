#!/bin/bash

echo "Testing Townin API Login Endpoints"
echo "===================================="
echo ""

echo "1. Testing Super Admin Login..."
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@townin.kr","password":"townin2025!"}' \
  -w "\n\n"

echo "2. Testing Municipality Login..."
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"municipality@uijeongbu.go.kr","password":"townin2025!"}' \
  -w "\n\n"

echo "3. Testing Security Guard Login..."
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"guard1@townin.kr","password":"townin2025!"}' \
  -w "\n\n"

echo "4. Testing User Login..."
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user1@example.com","password":"townin2025!"}' \
  -w "\n\n"
