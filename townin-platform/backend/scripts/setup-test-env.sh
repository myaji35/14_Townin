#!/bin/bash

# Townin Platform - Test Environment Setup Script

set -e

echo "🚀 Townin Platform Test Environment Setup"
echo "=========================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
else
    echo -e "${RED}❌ .env file not found${NC}"
    exit 1
fi

echo ""
echo "📋 Configuration:"
echo "  DB Host: $DB_HOST"
echo "  DB Port: $DB_PORT"
echo "  DB Name: $DB_DATABASE"
echo "  DB User: $DB_USERNAME"
echo ""

# Check PostgreSQL
echo "1️⃣ Checking PostgreSQL..."
if ! command -v psql &> /dev/null; then
    echo -e "${RED}❌ PostgreSQL not found. Please install PostgreSQL.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ PostgreSQL found${NC}"

# Check if PostgreSQL is running
echo ""
echo "2️⃣ Checking if PostgreSQL is running..."
if pg_isready -h $DB_HOST -p $DB_PORT > /dev/null 2>&1; then
    echo -e "${GREEN}✅ PostgreSQL is running${NC}"
else
    echo -e "${YELLOW}⚠️  PostgreSQL is not running on port $DB_PORT${NC}"
    echo "   You may need to start PostgreSQL:"
    echo "   brew services start postgresql@14"
    echo ""
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Create database if not exists
echo ""
echo "3️⃣ Creating database..."
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USERNAME -tc "SELECT 1 FROM pg_database WHERE datname = '$DB_DATABASE'" | grep -q 1 || \
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USERNAME -c "CREATE DATABASE $DB_DATABASE"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Database '$DB_DATABASE' ready${NC}"
else
    echo -e "${RED}❌ Failed to create database${NC}"
    echo "   Try creating manually:"
    echo "   createdb -h $DB_HOST -p $DB_PORT -U $DB_USERNAME $DB_DATABASE"
    exit 1
fi

# Install dependencies
echo ""
echo "4️⃣ Checking npm dependencies..."
if [ ! -d "node_modules" ]; then
    echo "   Installing dependencies..."
    npm install
else
    echo -e "${GREEN}✅ Dependencies already installed${NC}"
fi

# Run migrations (if needed)
echo ""
echo "5️⃣ Database schema..."
echo -e "${YELLOW}⚠️  Note: Migrations may need to be run manually${NC}"
echo "   Run: npm run migration:run"

echo ""
echo -e "${GREEN}✅ Test environment setup complete!${NC}"
echo ""
echo "📝 Next steps:"
echo "   1. Run migrations: npm run migration:run"
echo "   2. Start server: npm run start:dev"
echo "   3. Test API: curl http://localhost:3000/health"
echo ""
