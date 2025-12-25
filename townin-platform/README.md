# Townin Platform - Full Stack Implementation
**Privacy-First Local Life OS**

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    TOWNIN PLATFORM                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐     ┌──────────────┐     ┌────────────┐ │
│  │   Flutter    │────▶│   NestJS     │────▶│ PostgreSQL │ │
│  │  Mobile App  │     │   Backend    │     │  + PostGIS │ │
│  └──────────────┘     └──────────────┘     └────────────┘ │
│         │                    │                              │
│         │                    ├──────────────▶ Neo4j        │
│         │                    │                (GraphRAG)    │
│         │                    │                              │
│         │                    ├──────────────▶ InfluxDB      │
│         │                    │                (IoT Data)    │
│         │                    │                              │
│         │                    └──────────────▶ Redis         │
│         │                                     (Cache)       │
│         │                                                   │
│         └────────────────────────────────────▶ AWS S3       │
│                                                (Images)     │
└─────────────────────────────────────────────────────────────┘

External APIs:
├── Anthropic Claude 3.5 (Flyer AI, Care Messages)
├── Google Cloud Vision (OCR)
├── Seoul Open Data Portal (Public Safety Data)
└── Naver/Kakao Maps API (Base Layer)
```

---

## 📁 Project Structure

```
townin-platform/
├── backend/                    # NestJS API Server
│   ├── src/
│   │   ├── main.ts
│   │   ├── app.module.ts
│   │   ├── auth/              # Authentication & Authorization
│   │   ├── users/             # User Management
│   │   ├── locations/         # Location Grid Management
│   │   ├── safety-maps/       # Public Safety Data
│   │   ├── flyers/            # Digital Flyer Management
│   │   ├── flyer-ai/          # AI Flyer Processing Service
│   │   ├── graphrag/          # GraphRAG Insurance Engine
│   │   ├── iot/               # IoT Sensor Data
│   │   ├── merchants/         # Merchant/Partner Management
│   │   ├── analytics/         # Analytics & Insights
│   │   └── common/            # Shared utilities
│   ├── test/
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                   # Flutter Mobile App
│   ├── lib/
│   │   ├── main.dart
│   │   ├── screens/
│   │   │   ├── home/          # Home Dashboard
│   │   │   ├── safety_map/    # Safety Map View
│   │   │   ├── flyers/        # Digital Flyers
│   │   │   ├── care/          # Family Care
│   │   │   └── profile/       # User Profile
│   │   ├── widgets/           # Reusable Widgets
│   │   ├── services/          # API Services
│   │   ├── models/            # Data Models
│   │   └── utils/             # Utilities
│   ├── assets/
│   ├── pubspec.yaml
│   └── android/ios/
│
├── database/                   # Database Schemas & Migrations
│   ├── postgresql/
│   │   ├── migrations/
│   │   └── seeds/
│   ├── neo4j/
│   │   └── cypher-scripts/
│   └── influxdb/
│       └── schemas/
│
├── docs/                       # Documentation
│   ├── api/                   # API Documentation
│   ├── architecture/          # Architecture Diagrams
│   └── deployment/            # Deployment Guides
│
├── scripts/                    # Utility Scripts
│   ├── setup-dev.sh           # Development Setup
│   ├── seed-data.sh           # Seed Sample Data
│   └── deploy.sh              # Deployment Script
│
├── docker-compose.yml          # Local Development Environment
├── .env.example               # Environment Variables Template
└── README.md                  # This File
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ (for NestJS backend)
- **Flutter** 3.16+ (for mobile app)
- **Docker** & Docker Compose (for databases)
- **API Keys:**
  - Anthropic API key
  - Google Cloud Vision credentials
  - Neo4j Aura account (or local Neo4j)

### 1. Clone & Install

```bash
# Navigate to platform directory
cd townin-platform

# Install backend dependencies
cd backend
npm install

# Install Flutter dependencies
cd ../frontend
flutter pub get
```

### 2. Start Development Databases

```bash
# Start PostgreSQL, Redis, InfluxDB with Docker Compose
docker-compose up -d

# Neo4j: Use Neo4j Aura (cloud) or local Docker instance
```

### 3. Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your API keys and database URLs
```

### 4. Run Database Migrations

```bash
cd backend
npm run migration:run

# Seed sample data
npm run seed
```

### 5. Start Backend Server

```bash
cd backend
npm run start:dev

# Server runs on http://localhost:3000
# API docs: http://localhost:3000/api/docs
```

### 6. Start Flutter App

```bash
cd frontend
flutter run

# For iOS simulator
flutter run -d ios

# For Android emulator
flutter run -d android
```

---

## 🔑 Core Features (Phase 1 MVP)

### 1. Safety Maps (Traffic Anchor)
- **CCTV Locations:** Real-time CCTV coverage visualization
- **Street Lighting:** Brightness map for safe walking routes
- **Parking Enforcement:** Camera locations + public parking availability
- **Flood Risk Zones:** Historical flood data overlay

### 2. Digital Flyers (Commerce)
- **Merchant Upload:** Photo → AI parsing → Online store
- **User Discovery:** Location-based flyer feed
- **Click Tracking:** Revenue attribution (₩25 user, ₩5 guard, ₩20 platform)

### 3. User Management
- **Privacy-First Auth:** Grid-based location (not exact address)
- **Three-Hub Model:** Home, Work, Family Home (max 3 locations)
- **Anonymous IDs:** Hashed user identifiers

### 4. Merchant Portal (Partner App)
- **Digital Signboard:** Open/Close/Away toggle
- **Flyer Scanner:** Upload flyer photo for AI processing
- **Analytics Dashboard:** Views, clicks, conversions

---

## 🛠️ Technology Stack

### Backend
- **Framework:** NestJS (TypeScript)
- **API:** RESTful + GraphQL (for complex queries)
- **Auth:** JWT + Passport.js
- **Validation:** class-validator
- **ORM:** TypeORM (PostgreSQL)
- **Queue:** Bull (Redis-backed job queue for AI processing)

### Frontend
- **Framework:** Flutter 3.16+
- **State Management:** Riverpod
- **Maps:** Google Maps Flutter (with custom overlays)
- **HTTP:** Dio
- **Local Storage:** Hive
- **UI:** Material Design 3

### Databases
- **PostgreSQL 15:** User data, flyers, merchants, transactions
- **PostGIS:** Geospatial queries (location grids, proximity)
- **Neo4j 5:** Knowledge graph for GraphRAG
- **InfluxDB 2:** Time-series IoT sensor data
- **Redis 7:** Cache + job queue

### AI/ML
- **Claude 3.5 Sonnet:** Flyer parsing, care messages, compliance
- **Google Cloud Vision:** OCR for Korean text
- **LangChain:** GraphRAG orchestration
- **Neo4j:** Graph database for relationship inference

### Infrastructure
- **Local Dev:** Docker Compose
- **Production:** AWS (ECS Fargate for backend, S3 for images, RDS for PostgreSQL)
- **CI/CD:** GitHub Actions
- **Monitoring:** Sentry (errors), DataDog (performance)

---

## 🗄️ Database Schemas

### PostgreSQL Tables

#### users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hashed_id VARCHAR(64) UNIQUE NOT NULL, -- Privacy: no real names
  age_range VARCHAR(10),                 -- e.g., "30-39"
  household_type VARCHAR(20),            -- single, couple, family_young, family_senior
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### user_locations (Three-Hub Model)
```sql
CREATE TABLE user_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  hub_type VARCHAR(20) NOT NULL,        -- home, work, family_home
  grid_cell VARCHAR(50) NOT NULL,       -- e.g., "gangnam_03" (not exact address)
  property_value_tier INTEGER,          -- 1-5 (inferred from grid)
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, hub_type)             -- Max 1 of each hub type per user
);

CREATE INDEX idx_user_locations_grid ON user_locations(grid_cell);
```

#### merchants
```sql
CREATE TABLE merchants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name VARCHAR(255) NOT NULL,
  grid_cell VARCHAR(50) NOT NULL,
  category VARCHAR(50),                 -- grocery, restaurant, cosmetics, etc.
  signboard_status VARCHAR(20),         -- open, closed, away
  last_status_update TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### flyers
```sql
CREATE TABLE flyers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID REFERENCES merchants(id),
  title VARCHAR(255),
  image_url TEXT NOT NULL,
  ai_processing_status VARCHAR(20),     -- pending, processing, completed, failed
  ai_extracted_data JSONB,              -- Structured product data from AI
  view_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP
);

CREATE INDEX idx_flyers_merchant ON flyers(merchant_id);
CREATE INDEX idx_flyers_grid ON flyers USING GIN ((ai_extracted_data->'grid_cells'));
```

#### flyer_products (Extracted by AI)
```sql
CREATE TABLE flyer_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flyer_id UUID REFERENCES flyers(id),
  product_name VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2),
  unit VARCHAR(20),
  original_price DECIMAL(10, 2),
  promotion VARCHAR(100),               -- "1+1", "50% off", etc.
  description TEXT,
  category VARCHAR(50),
  image_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### safety_data (Public Data)
```sql
CREATE TABLE safety_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data_type VARCHAR(50) NOT NULL,       -- cctv, street_light, parking, flood_zone
  grid_cell VARCHAR(50) NOT NULL,
  location GEOGRAPHY(POINT),            -- PostGIS point
  metadata JSONB,                       -- Type-specific data (camera angle, brightness, etc.)
  source VARCHAR(100),                  -- e.g., "Seoul Open Data Portal"
  last_updated TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_safety_data_grid ON safety_data(grid_cell);
CREATE INDEX idx_safety_data_location ON safety_data USING GIST(location);
```

### Neo4j Graph Schema (GraphRAG)

```cypher
// Node Types
(:User {id, age_range, household_type})
(:Location {grid_cell, district, property_value_tier, flood_risk, crime_rate})
(:Behavior {category})  // grocery, health, home_improvement, senior_care
(:IoTPattern {activity_level, anomaly_count, last_updated})
(:RiskFactor {type, severity, description})
(:InsuranceProduct {id, name, category, coverage_type, target_age})

// Relationship Types
(:User)-[:LIVES_IN]->(:Location)
(:User)-[:EXHIBITS]->(:Behavior)
(:User)-[:HAS_PATTERN]->(:IoTPattern)
(:Location)-[:HAS_RISK]->(:RiskFactor)
(:Behavior)-[:INDICATES]->(:RiskFactor)
(:IoTPattern)-[:INDICATES]->(:RiskFactor)
(:RiskFactor)-[:COVERED_BY]->(:InsuranceProduct)
```

---

## 🔐 Security & Privacy

### Privacy-First Design Principles

1. **No PII Collection:**
   - User IDs are hashed (not linked to real names)
   - Locations stored as grid cells (500m×500m), not exact addresses
   - No phone numbers or email required (optional for notifications)

2. **Data Minimization:**
   - Collect only data with clear inference purpose
   - IoT sensors: Motion events only (no cameras, no audio)
   - Flyer views: Aggregate analytics (no individual tracking)

3. **User Control:**
   - Easy opt-out for all data collection types
   - Export all user data (PIPA compliance)
   - Delete account = hard delete (not soft delete)

4. **Encryption:**
   - At rest: PostgreSQL encryption, Neo4j encryption
   - In transit: TLS 1.3 for all API calls
   - API keys: AWS Secrets Manager (not in code)

---

## 📊 API Endpoints (Key Routes)

### Authentication
```
POST   /api/auth/register          # Register new user (grid-based)
POST   /api/auth/login             # Login (returns JWT)
POST   /api/auth/refresh           # Refresh access token
```

### Safety Maps
```
GET    /api/safety-maps/:gridCell  # Get all safety data for grid
GET    /api/safety-maps/cctv       # CCTV locations (with filters)
GET    /api/safety-maps/lighting   # Street lighting data
GET    /api/safety-maps/parking    # Parking enforcement + availability
```

### Flyers
```
GET    /api/flyers/feed            # User's personalized flyer feed
POST   /api/flyers/upload          # Merchant uploads flyer photo
GET    /api/flyers/:id             # Get flyer details
POST   /api/flyers/:id/view        # Track view (revenue attribution)
POST   /api/flyers/:id/click       # Track click
```

### Flyer AI Processing
```
POST   /api/flyer-ai/process       # Trigger AI processing (async job)
GET    /api/flyer-ai/status/:jobId # Check processing status
```

### GraphRAG Insurance
```
POST   /api/graphrag/recommend     # Get insurance recommendations for user
GET    /api/graphrag/explain/:id   # Explain recommendation reasoning
```

### IoT Sensors
```
POST   /api/iot/events             # IoT sensor posts motion event
GET    /api/iot/patterns/:userId   # Get activity patterns
GET    /api/iot/anomalies/:userId  # Get detected anomalies
GET    /api/iot/messages/:userId   # Get AI-generated care messages
```

---

## 🧪 Testing

### Unit Tests
```bash
cd backend
npm run test

# Coverage report
npm run test:cov
```

### E2E Tests
```bash
npm run test:e2e
```

### Flutter Tests
```bash
cd frontend
flutter test
```

---

## 🚢 Deployment

### Development
```bash
docker-compose up
npm run start:dev
```

### Staging
```bash
npm run build
npm run start:prod
```

### Production (AWS)
```bash
# Build Docker image
docker build -t townin-backend:latest .

# Push to ECR
aws ecr get-login-password | docker login --username AWS --password-stdin <ECR_URL>
docker tag townin-backend:latest <ECR_URL>/townin-backend:latest
docker push <ECR_URL>/townin-backend:latest

# Deploy to ECS (via GitHub Actions)
```

---

## 📈 Monitoring & Observability

### Metrics
- **Backend:** DataDog APM (response times, error rates)
- **Database:** PostgreSQL slow query log, Neo4j query profiling
- **API:** Request/response logging (structured JSON logs)

### Error Tracking
- **Sentry:** Real-time error alerts
- **Log Aggregation:** CloudWatch Logs (AWS)

### Uptime
- **Pingdom:** API endpoint monitoring
- **StatusPage:** Public status page for users

---

## 🤝 Contributing

### Development Workflow
1. Create feature branch: `git checkout -b feature/flyer-ai-improvements`
2. Make changes, write tests
3. Run linter: `npm run lint`
4. Commit with conventional commits: `git commit -m "feat: add flyer category detection"`
5. Push and create PR

### Code Style
- **TypeScript:** Follow Airbnb style guide
- **Dart:** Follow Flutter/Dart style guide
- **Commits:** Conventional Commits (feat, fix, docs, refactor, test)

---

## 📝 License

Proprietary - Townin Platform
Copyright (c) 2025 Townin Inc.

---

## 📞 Contact & Support

- **Developer:** [Your Name]
- **Email:** [Your Email]
- **Slack:** [Team Slack Channel]
- **Docs:** [Internal Docs URL]

---

**Built with ❤️ for Korea's local communities**
