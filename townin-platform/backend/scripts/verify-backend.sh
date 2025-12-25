#!/bin/bash
# Backend Verification Script
# Verifies that all backend services are running correctly

set -e

echo "🔍 Townin Backend Verification Script"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Docker services
echo "📦 1. Checking Docker Services..."
echo "-----------------------------------"

check_service() {
    local service=$1
    local port=$2

    if docker ps | grep -q "$service"; then
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
            echo -e "${GREEN}✓${NC} $service is running (port $port)"
            return 0
        else
            echo -e "${YELLOW}⚠${NC} $service container is running but port $port is not accessible"
            return 1
        fi
    else
        echo -e "${RED}✗${NC} $service is not running"
        return 1
    fi
}

check_service "townin-postgres" 5432
check_service "townin-redis" 6379
check_service "townin-influxdb" 8086
check_service "townin-pgadmin" 5050

echo ""

# Check database connectivity
echo "🗄️  2. Checking Database Connectivity..."
echo "-----------------------------------"

if docker exec townin-postgres psql -U townin -d townin -c "SELECT 1;" > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} PostgreSQL connection successful"
else
    echo -e "${RED}✗${NC} PostgreSQL connection failed"
fi

# Check PostGIS extension
if docker exec townin-postgres psql -U townin -d townin -c "SELECT PostGIS_version();" > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} PostGIS extension installed"
else
    echo -e "${RED}✗${NC} PostGIS extension not found"
fi

# Check migrations
MIGRATION_COUNT=$(docker exec townin-postgres psql -U townin -d townin -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public';" 2>/dev/null | tr -d ' ')
if [ "$MIGRATION_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✓${NC} Database tables exist (${MIGRATION_COUNT} tables)"
else
    echo -e "${YELLOW}⚠${NC} No tables found - migrations may not have been run"
fi

echo ""

# Check backend server
echo "🚀 3. Checking Backend Server..."
echo "-----------------------------------"

if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Backend server is running on port 3000"

    # Check health endpoint
    if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} Health endpoint responding"
    else
        echo -e "${YELLOW}⚠${NC} Health endpoint not responding (may not be implemented)"
    fi

    # Check Swagger docs
    if curl -s http://localhost:3000/api/docs > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} Swagger documentation accessible at http://localhost:3000/api/docs"
    else
        echo -e "${RED}✗${NC} Swagger documentation not accessible"
    fi
else
    echo -e "${RED}✗${NC} Backend server is not running on port 3000"
    echo -e "${YELLOW}→${NC} Run: npm run start:dev"
fi

echo ""

# Check environment variables
echo "⚙️  4. Checking Environment Configuration..."
echo "-----------------------------------"

if [ -f ".env" ]; then
    echo -e "${GREEN}✓${NC} .env file exists"
else
    echo -e "${YELLOW}⚠${NC} .env file not found - using .env.example values"
fi

echo ""

# Summary
echo "======================================"
echo "📊 Verification Summary"
echo "======================================"

DOCKER_RUNNING=$(docker ps | grep townin | wc -l | tr -d ' ')
echo "Docker Services: ${DOCKER_RUNNING}/4 running"

if [ -f ".env" ]; then
    ENV_STATUS="configured"
else
    ENV_STATUS="using defaults"
fi
echo "Environment: ${ENV_STATUS}"

if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    SERVER_STATUS="running"
else
    SERVER_STATUS="stopped"
fi
echo "Backend Server: ${SERVER_STATUS}"

echo ""

# Next steps
echo "📋 Next Steps:"
echo "-----------------------------------"
if [ "$DOCKER_RUNNING" -lt 4 ]; then
    echo "1. Start Docker services: docker-compose up -d"
fi
if [ "$MIGRATION_COUNT" -eq 0 ]; then
    echo "2. Run migrations: npm run migration:run"
    echo "3. Seed database: npm run seed"
fi
if [ "$SERVER_STATUS" = "stopped" ]; then
    echo "4. Start backend server: npm run start:dev"
fi
echo "5. Test APIs at: http://localhost:3000/api/docs"
echo "6. Access pgAdmin at: http://localhost:5050"

echo ""
echo "✨ Verification complete!"
