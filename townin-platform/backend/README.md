# Townin Platform Backend

타운인 플랫폼의 백엔드 API 서버입니다.

## Tech Stack

- **Framework**: NestJS (Node.js)
- **Database**: PostgreSQL + PostGIS (Geospatial)
- **Cache**: Redis
- **Time-Series DB**: InfluxDB (IoT 센서 데이터)
- **ORM**: TypeORM
- **Authentication**: JWT + OAuth (Kakao, Naver, Google)
- **File Storage**: AWS S3
- **Monitoring**: Sentry + Winston
- **Real-time**: Socket.io (WebSocket)

## Prerequisites

- Node.js 18+
- Docker & Docker Compose
- npm or yarn

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

```bash
cp .env.example .env
# Edit .env with your configuration
```

### 3. Start Infrastructure (Docker)

```bash
# Start all services (PostgreSQL, Redis, InfluxDB, pgAdmin)
docker-compose up -d

# Check services status
docker-compose ps

# View logs
docker-compose logs -f postgres
```

Services will be available at:
- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`
- InfluxDB: `http://localhost:8086`
- pgAdmin: `http://localhost:5050` (admin@townin.com / admin)

### 4. Run Migrations

```bash
# Generate migration from entities
npm run migration:generate -- src/database/migrations/InitialSchema

# Run migrations
npm run migration:run

# Revert last migration (if needed)
npm run migration:revert
```

### 5. Seed Database (Optional)

```bash
npm run seed
```

### 6. Start Development Server

```bash
# Development mode with hot-reload
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

API will be available at: `http://localhost:3000/api`

### 7. API Documentation

Swagger documentation available at: `http://localhost:3000/api/docs`

## Database Management

### Using pgAdmin

1. Open `http://localhost:5050`
2. Login: `admin@townin.com` / `admin`
3. Add Server:
   - Host: `postgres` (Docker network name)
   - Port: `5432`
   - Database: `townin`
   - Username: `townin`
   - Password: `townin123`

### Using psql

```bash
# Connect to PostgreSQL
docker exec -it townin-postgres psql -U townin -d townin

# Verify PostGIS
SELECT PostGIS_version();

# List tables
\dt

# Exit
\q
```

## Project Structure

```
src/
├── common/              # Shared utilities, guards, decorators
│   ├── config/         # Winston, Sentry configuration
│   ├── decorators/     # Custom decorators (Roles, etc.)
│   ├── filters/        # Exception filters
│   ├── guards/         # Auth guards (JWT, Roles)
│   └── interceptors/   # Logging interceptor
├── modules/
│   ├── auth/           # Authentication & Authorization
│   ├── users/          # User management
│   ├── merchants/      # Merchant management
│   ├── flyers/         # Flyer CRUD & interactions
│   ├── points/         # Points & rewards system
│   ├── public-data/    # CCTV, Parking, Shelter data
│   ├── notifications/  # Push & WebSocket notifications
│   ├── files/          # File upload & S3 management
│   └── analytics/      # Analytics & aggregation
├── database/
│   ├── migrations/     # TypeORM migrations
│   └── seeds/          # Seed data
└── main.ts             # Application entry point
```

## Available Scripts

```bash
# Development
npm run start:dev          # Start with hot-reload
npm run start:debug        # Start with debugging

# Build
npm run build              # Build for production
npm run start:prod         # Run production build

# Database
npm run migration:generate # Generate migration
npm run migration:run      # Run migrations
npm run migration:revert   # Revert last migration
npm run seed               # Seed database

# Testing
npm run test               # Run unit tests
npm run test:e2e           # Run E2E tests
npm run test:cov           # Generate coverage report

# Code Quality
npm run lint               # Run ESLint
npm run format             # Format with Prettier
```

## API Endpoints Overview

### Authentication
- `POST /api/auth/login` - Email/Password login
- `GET /api/auth/kakao` - Kakao OAuth
- `GET /api/auth/naver` - Naver OAuth
- `GET /api/auth/google` - Google OAuth
- `POST /api/auth/refresh` - Refresh JWT token

### Users
- `GET /api/users/me` - Get current user
- `POST /api/users/me/hubs` - Create location hub
- `GET /api/users/me/dashboard` - Get dashboard data

### Merchants
- `POST /api/merchants` - Create merchant profile
- `GET /api/merchants/me` - Get my merchant
- `POST /api/merchants/me/signboard` - Create signboard
- `GET /api/merchants/me/dashboard` - Get dashboard

### Flyers
- `GET /api/flyers` - List flyers
- `POST /api/flyers` - Create flyer (Merchant)
- `GET /api/flyers/:id` - Get flyer details
- `POST /api/flyers/:id/like` - Like flyer
- `POST /api/flyers/:id/bookmark` - Bookmark flyer
- `POST /api/flyers/:id/target-areas` - Set target areas

### Points
- `GET /api/points/balance` - Get points balance
- `POST /api/points/earn` - Earn points
- `POST /api/points/spend` - Spend points
- `GET /api/points/transactions` - Get transaction history

### Public Data
- `GET /api/public-data/cctv` - Get nearby CCTVs
- `GET /api/public-data/parking` - Get nearby parking
- `GET /api/public-data/shelters` - Get nearby shelters
- `GET /api/public-data/map` - Get integrated GeoJSON

### Signboards
- `GET /api/signboards` - List open signboards
- `POST /api/signboards/:id/view` - Track view
- `POST /api/signboards/:id/click` - Track click

## Environment Variables

See `.env.example` for all available environment variables.

## Docker Commands

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f [service_name]

# Restart service
docker-compose restart [service_name]

# Remove volumes (⚠️ deletes all data)
docker-compose down -v
```

## Troubleshooting

### PostgreSQL Connection Error

```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# Check logs
docker-compose logs postgres

# Restart PostgreSQL
docker-compose restart postgres
```

### Port Already in Use

```bash
# Find process using port 3000
lsof -ti:3000

# Kill process
kill -9 <PID>
```

### PostGIS Extension Not Found

```bash
# Connect to database and create extension manually
docker exec -it townin-postgres psql -U townin -d townin -c "CREATE EXTENSION postgis;"
```

## Production Deployment

### Build Docker Image

```bash
# Build backend image
docker build -t townin-backend .

# Run container
docker run -p 3000:3000 --env-file .env townin-backend
```

### Deploy to Cloud

- AWS ECS/Fargate
- Google Cloud Run
- Azure Container Instances
- Railway/Render (for quick deployment)

## License

Private - Townin Platform

## Contact

For questions or issues, contact the development team.
