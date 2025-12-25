# Townin Platform - Project Overview

**Generated:** 2025-11-30
**Version:** 1.0.0
**Project Type:** Multi-part Platform (Backend + Mobile + Web)

---

## Executive Summary

Townin is a **privacy-first hyperlocal community platform** combining public and private local data to provide contextualized insurance, care, and lifestyle services. The platform operates on location and behavior patterns instead of personally identifiable information.

**Core Value Propositions:**
- **For Users**: Get family updates and local information; AI connects needed services
- **For Partners**: Take a photo of a flyer; AI creates an online store and sends customers
- **For Experts (FP)**: Sell data, not products; AI co-pilot helps with compliance and consultation

---

## Repository Structure

**Type:** Multi-part repository
**Parts:** 3 (Backend API, Mobile App, Web App)

```
townin-platform/
├── backend/          # NestJS API Server (Primary Implementation)
├── frontend/         # Flutter Mobile App
├── web/              # React Web Application
├── database/         # Database schemas and migrations
├── docs/             # Epic documentation and implementation reports
└── scripts/          # Utility scripts
```

---

## Technology Stack Summary

### Backend API (NestJS)
| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| **Framework** | NestJS | 10.3+ | RESTful API server |
| **Language** | TypeScript | 5.3 | Type-safe development |
| **Database** | PostgreSQL | - | Primary relational DB (TypeORM) |
| **Graph DB** | Neo4j | 5.16+ | GraphRAG engine |
| **Cache** | Redis | 4.6+ | Caching & queue backend |
| **AI/ML** | Anthropic Claude SDK | 0.20+ | LLM integration |
| **AI/ML** | Google Cloud Vision | 4.2+ | OCR & image analysis |
| **AI/ML** | LangChain | 0.1+ | AI orchestration |
| **Auth** | Passport (JWT + Local) | - | Authentication & authorization |
| **Queue** | Bull | 4.12+ | Background job processing |
| **API Docs** | Swagger/OpenAPI | 7.1+ | API documentation |
| **Testing** | Jest | 29.7+ | Unit & integration tests |

### Mobile App (Flutter)
| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| **Framework** | Flutter | 3.2+ | Cross-platform mobile |
| **Language** | Dart | 3.2+ | App development |
| **State** | flutter_bloc | 8.1+ | BLoC pattern state management |
| **Network** | Dio + Retrofit | 5.4+ / 4.0+ | HTTP client & code generation |
| **Maps** | Google Maps Flutter | 2.5+ | Map visualization |
| **Location** | Geolocator | 11.0+ | GPS & location services |
| **Storage** | SQLite | 2.3+ | Local database |
| **Storage** | Flutter Secure Storage | 9.0+ | Encrypted credential storage |
| **Push** | Firebase Messaging | 14.7+ | Push notifications |
| **Routing** | go_router | 13.0+ | Declarative navigation |
| **Testing** | bloc_test + mockito | 9.1+ / 5.4+ | Widget & BLoC testing |

### Web Application (React + Vite)
| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| **Framework** | React | - | UI component library |
| **Language** | TypeScript | - | Type-safe development |
| **Build** | Vite | - | Fast build tool & dev server |
| **Linting** | ESLint | - | Code quality |

---

## Architecture Patterns

### Backend
- **Pattern**: Layered Architecture (Controller → Service → Repository)
- **Style**: RESTful API with JWT authentication
- **Key Features**:
  - Role-based access control (RBAC)
  - Multi-tenant architecture (Grid Cell system)
  - Event-driven background jobs (Bull queues)
  - AI integration for flyer scanning and analysis

### Mobile App
- **Pattern**: BLoC (Business Logic Component)
- **Style**: Clean Architecture (Data ← Domain → Presentation)
- **Key Features**:
  - Offline-first with local SQLite cache
  - Role-based dashboard routing
  - Real-time push notifications
  - Map-based safety features

### Web
- **Pattern**: Component-based (React)
- **Style**: Modern SPA with Vite HMR
- **Status**: Minimal setup (template-based)

---

## Implemented Features (Phase 0 - Admin Dashboard)

**Completed Epics:** 5/89 (6%)

| Epic ID | Title | Status |
|---------|-------|--------|
| ADM-001 | Admin Dashboard Foundation | ✅ Complete |
| ADM-002 | User Management System | ✅ Complete |
| ADM-003 | Flyer Statistics Dashboard | ✅ Complete |
| ADM-004 | Region Management System | ✅ Complete |
| ADM-005 | Platform Activity Monitoring | ✅ Complete |

**Modules Implemented:**
- `auth/` - JWT authentication with role-based guards
- `users/` - User CRUD with role management
- `regions/` - Grid Cell hierarchy and user location tracking
- `merchants/` - Merchant onboarding and management
- `flyers/` - Digital flyer CRUD with products
- `security-guards/` - Security guard recruitment and assignment
- `admin/` - Admin dashboard statistics and platform monitoring
- `grid-cells/` - Geospatial grid cell system

---

## Development Status

### Backend
- **Implementation**: ~40% complete
- **Files**: 45+ TypeScript files
- **Modules**: 8 functional modules
- **Database**: PostgreSQL with TypeORM entities
- **API**: RESTful endpoints with Swagger documentation

### Mobile App
- **Implementation**: ~30% complete
- **Files**: 20+ Dart files
- **Features**: Multi-role dashboards, auth, safety map (partial)
- **Architecture**: BLoC pattern with repository layer

### Web
- **Implementation**: ~5% complete
- **Status**: Template setup, minimal customization

---

## Next Development Phases

### Phase 1: Traffic Acquisition (24 Epics)
- Core Infrastructure (CORE-001 ~ CORE-006)
- User App safety maps and digital flyers
- Merchant app digital signboard
- Security guard approval workflow

### Phase 2: Lock-in & Data Collection (18 Epics)
- IoT sensor integration for family care
- AI flyer scanner (multimodal)
- Smart pickup commerce
- Municipality dashboard

### Phase 3: Monetization (26 Epics)
- GraphRAG engine implementation
- Insurance module with AI co-pilot
- FP (Financial Planner) app
- Targeted advertising

### Phase 4: Global Expansion (11 Epics)
- Multi-language support
- Vietnam & Japan market entry
- Compliance adaptations

---

## Key Documentation

- **Epic Roadmap**: `docs/epic-roadmap.md` - Complete feature breakdown
- **Implementation Reports**: `docs/implementation-reports/` - Completed epic details
- **Epic Specifications**: `docs/epics/` - Individual epic requirements
- **API Integration**: `API_INTEGRATION_COMPLETE.md` - Backend API status
- **Product Requirements**: `../prd.md` - Complete PRD

---

## Integration Architecture

### Backend ↔ Mobile
- **Protocol**: REST API over HTTPS
- **Auth**: JWT Bearer tokens
- **Endpoints**: `/api/auth`, `/api/users`, `/api/flyers`, `/api/regions`
- **Response Format**: JSON

### Backend ↔ Web
- **Status**: Not yet integrated
- **Planned**: Same REST API as mobile

### Backend ↔ External Services
- **PostgreSQL**: Primary data storage
- **Neo4j**: GraphRAG knowledge graph (planned)
- **Redis**: Cache & job queue
- **Firebase**: Push notifications (mobile)
- **Google Cloud Vision**: OCR & image analysis (planned)
- **Anthropic Claude**: LLM for content generation (planned)

---

## Quick Start

### Backend
```bash
cd backend
npm install
cp .env.example .env
npm run start:dev
# API: http://localhost:3000
# Swagger: http://localhost:3000/api
```

### Mobile
```bash
cd frontend
flutter pub get
flutter run
```

### Web
```bash
cd web
npm install
npm run dev
```

---

## Project Goals

1. **Privacy-First**: No PII collection; location/behavior-based inference
2. **Hyperlocal**: 3-hub model (residence, work, family home)
3. **AI-Powered**: GraphRAG for insurance matching, LLM for content
4. **Multi-sided Platform**: Users, merchants, security guards, municipalities, FPs
5. **Social Impact**: Support welfare organizations and blind spot detection

---

**Last Updated:** 2025-11-30
**Maintained By:** Townin Development Team
