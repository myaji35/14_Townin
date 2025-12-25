# Townin Platform - Source Tree Analysis

**Generated:** 2025-11-30
**Repository Type:** Multi-part
**Scan Level:** Exhaustive (focused)

---

## Project Structure Overview

```
townin-platform/
├── backend/              # NestJS API Server (PRIMARY IMPLEMENTATION)
├── frontend/             # Flutter Mobile App
├── web/                  # React Web Application
├── database/             # Database schemas
├── docs/                 # Epic documentation
├── scripts/              # Utility scripts
├── docker-compose.yml    # Docker orchestration
├── README.md             # Project documentation
└── *.md                  # Implementation status docs
```

---

## Part 1: Backend (NestJS)

**Root:** `backend/`
**Type:** Backend API
**Framework:** NestJS + TypeScript
**Status:** ~40% implemented

### Directory Structure

```
backend/
├── src/
│   ├── main.ts                    # 🚀 Application entry point
│   ├── app.module.ts              # Root module
│   │
│   ├── config/                    # Configuration management
│   │   └── database.config.ts     # TypeORM database configuration
│   │
│   ├── common/                    # Shared utilities
│   │   ├── decorators/            # Custom decorators
│   │   │   ├── current-user.decorator.ts
│   │   │   └── roles.decorator.ts
│   │   ├── enums/                 # Shared enumerations
│   │   │   └── user-role.enum.ts  # User roles (SUPER_ADMIN, ADMIN, etc.)
│   │   └── guards/                # Authentication guards
│   │       └── roles.guard.ts     # RBAC authorization
│   │
│   └── modules/                   # Feature modules
│       │
│       ├── auth/                  # ✅ Authentication & Authorization
│       │   ├── auth.controller.ts # Login, register endpoints
│       │   ├── auth.service.ts    # JWT token generation
│       │   ├── auth.module.ts
│       │   ├── jwt-auth.guard.ts  # JWT validation guard
│       │   ├── strategies/
│       │   │   └── jwt.strategy.ts
│       │   └── dto/
│       │       └── login.dto.ts
│       │
│       ├── users/                 # ✅ User Management
│       │   ├── user.entity.ts     # User database entity
│       │   ├── users.controller.ts
│       │   ├── users.service.ts   # CRUD operations
│       │   └── users.module.ts
│       │
│       ├── regions/               # ✅ Region & Grid Cell Management
│       │   ├── region.entity.ts   # Administrative regions
│       │   ├── user-region.entity.ts # User's 3-hub locations
│       │   ├── regions.controller.ts
│       │   ├── regions.service.ts
│       │   └── regions.module.ts
│       │
│       ├── grid-cells/            # ✅ Geospatial Grid System
│       │   ├── grid-cell.entity.ts
│       │   ├── grid-cells.controller.ts
│       │   ├── grid-cells.service.ts
│       │   └── grid-cells.module.ts
│       │
│       ├── merchants/             # ✅ Merchant/Partner Management
│       │   ├── merchant.entity.ts
│       │   ├── merchants.controller.ts
│       │   ├── merchants.service.ts
│       │   └── merchants.module.ts
│       │
│       ├── flyers/                # ✅ Digital Flyer System
│       │   ├── flyer.entity.ts    # Flyer metadata
│       │   ├── flyer-product.entity.ts # Products in flyers
│       │   ├── flyers.controller.ts
│       │   ├── flyers.service.ts
│       │   ├── flyers.module.ts
│       │   └── dto/
│       │       ├── create-flyer.dto.ts
│       │       └── update-flyer.dto.ts
│       │
│       ├── security-guards/       # ✅ Security Guard System
│       │   ├── security-guard.entity.ts
│       │   ├── security-guards.controller.ts
│       │   ├── security-guards.service.ts
│       │   └── security-guards.module.ts
│       │
│       └── admin/                 # ✅ Admin Dashboard
│           ├── admin.controller.ts # Platform statistics
│           ├── admin.service.ts
│           └── admin.module.ts
│
├── dist/                          # Compiled JavaScript output
├── node_modules/                  # Dependencies
├── scripts/                       # Database seeds & utilities
├── package.json                   # Dependencies & scripts
├── tsconfig.json                  # TypeScript configuration
├── nest-cli.json                  # NestJS CLI config
├── .env                           # Environment variables
└── .env.example                   # Environment template
```

### Key Entry Points

- **Main Entry**: `src/main.ts` - Boots NestJS app on port 3000
- **Root Module**: `src/app.module.ts` - Imports all feature modules
- **Database Config**: `src/config/database.config.ts` - TypeORM setup

### Implemented Modules (8)

| Module | Entity | Controller | Service | Status |
|--------|--------|------------|---------|--------|
| auth | - | ✅ | ✅ | Complete |
| users | user.entity | ✅ | ✅ | Complete |
| regions | region.entity, user-region.entity | ✅ | ✅ | Complete |
| grid-cells | grid-cell.entity | ✅ | ✅ | Complete |
| merchants | merchant.entity | ✅ | ✅ | Complete |
| flyers | flyer.entity, flyer-product.entity | ✅ | ✅ | Complete |
| security-guards | security-guard.entity | ✅ | ✅ | Complete |
| admin | - | ✅ | ✅ | Complete |

### Planned Modules (Not Yet Implemented)

- `public-data/` - Seoul Open Data API integration (CORE-003)
- `iot-sensors/` - IoT device data collection (USR-011)
- `ai-scanner/` - Vision AI for flyer OCR (MRC-006)
- `graphrag/` - Neo4j GraphRAG engine (GRA-001 ~ GRA-008)
- `insurance/` - Insurance recommendation (INS-001 ~ INS-006)
- `notifications/` - Push notification system (CORE-004)
- `files/` - S3/CDN file management (CORE-005)

---

## Part 2: Frontend (Flutter)

**Root:** `frontend/`
**Type:** Mobile App
**Framework:** Flutter + Dart
**Status:** ~30% implemented

### Directory Structure

```
frontend/
├── lib/
│   ├── core/                      # Core utilities & infrastructure
│   │   ├── database/
│   │   │   └── database_helper.dart # SQLite helper
│   │   ├── constants/
│   │   │   └── api_constants.dart # Backend API endpoints
│   │   ├── network/
│   │   │   └── dio_client.dart    # HTTP client setup
│   │   ├── enums/
│   │   │   └── user_role.dart     # Mirrors backend roles
│   │   ├── models/
│   │   │   ├── user_model.dart    # User data model
│   │   │   └── user_model.g.dart  # JSON serialization
│   │   ├── services/
│   │   │   ├── notification_service.dart # FCM integration
│   │   │   └── connectivity_service.dart # Network status
│   │   └── widgets/
│   │       └── stat_card.dart     # Reusable dashboard card
│   │
│   └── features/                  # Feature modules (BLoC pattern)
│       │
│       ├── auth/                  # ✅ Authentication
│       │   ├── data/
│       │   │   └── auth_repository.dart
│       │   └── presentation/
│       │       ├── login_screen.dart
│       │       └── dashboard_router.dart # Role-based routing
│       │
│       ├── user/                  # ✅ User Management
│       │   └── data/
│       │       └── users_repository.dart
│       │
│       ├── dashboard/             # ✅ Role-based Dashboards
│       │   ├── user/
│       │   │   └── user_dashboard.dart
│       │   ├── merchant/
│       │   │   └── merchant_dashboard.dart
│       │   ├── security_guard/
│       │   │   └── security_guard_dashboard.dart
│       │   ├── municipality/
│       │   │   └── municipality_dashboard.dart
│       │   └── super_admin/
│       │       └── super_admin_dashboard.dart
│       │
│       ├── safety_map/            # 🚧 Partial Implementation
│       │   └── presentation/
│       │       └── safety_map_screen.dart
│       │
│       └── security_guard/        # ✅ Security Guard Features
│           └── data/
│               └── security_guard_repository.dart
│
├── assets/                        # Static assets
│   ├── images/
│   ├── icons/
│   └── fonts/
│       └── Pretendard-*.ttf       # Korean font
│
├── pubspec.yaml                   # Dependencies
└── README.md                      # Setup instructions
```

### Key Architecture Patterns

- **State Management**: BLoC (flutter_bloc)
- **Data Layer**: Repository pattern with Retrofit
- **Routing**: go_router for declarative navigation
- **Storage**: SQLite (offline), Secure Storage (credentials)
- **Network**: Dio + Retrofit for type-safe API calls

### Implemented Features

| Feature | Screen | Repository | Status |
|---------|--------|------------|--------|
| Authentication | login_screen | auth_repository | ✅ |
| Dashboard Routing | dashboard_router | - | ✅ |
| User Dashboard | user_dashboard | users_repository | ✅ |
| Merchant Dashboard | merchant_dashboard | - | ✅ |
| Security Guard Dashboard | security_guard_dashboard | security_guard_repository | ✅ |
| Municipality Dashboard | municipality_dashboard | - | ✅ |
| Super Admin Dashboard | super_admin_dashboard | - | ✅ |
| Safety Map | safety_map_screen | - | 🚧 Partial |

### Planned Features (Not Yet Implemented)

- Digital flyer viewer (USR-007)
- User onboarding & 3-hub setup (USR-001, USR-002)
- Full safety maps (CCTV, parking, disaster) (USR-003 ~ USR-006)
- IoT family care monitoring (USR-011 ~ USR-013)
- Smart pickup commerce (USR-015)

---

## Part 3: Web (React + Vite)

**Root:** `web/`
**Type:** Web Application
**Framework:** React + TypeScript + Vite
**Status:** ~5% implemented (template only)

### Directory Structure

```
web/
├── src/                           # Source code (minimal)
├── public/                        # Static assets
├── package.json                   # Dependencies
├── vite.config.ts                 # Vite configuration
├── tsconfig.json                  # TypeScript config
├── .gitignore
└── README.md                      # React + Vite template docs
```

**Status:** Template setup with no custom implementation yet.

**Planned Use:** Admin dashboard, merchant portal, public-facing website.

---

## Supporting Directories

### database/
- Database migration scripts
- SQL schema definitions
- **Status:** Minimal setup

### docs/
- `epic-roadmap.md` - Complete epic breakdown (89 epics)
- `epics/*.md` - Individual epic specifications (20+ files)
- `implementation-reports/*.md` - Completed epic reports (5 files)

### scripts/
- Utility scripts for setup and maintenance
- API testing scripts (`test-api.sh`, `test-new-apis.sh`)

---

## Critical Folders Summary

| Part | Critical Directories | Purpose |
|------|---------------------|---------|
| **Backend** | `src/modules/` | Feature modules (auth, users, flyers, etc.) |
| | `src/common/` | Shared guards, decorators, enums |
| | `src/config/` | Configuration (database, env) |
| **Frontend** | `lib/core/` | Infrastructure (network, database, models) |
| | `lib/features/` | Feature modules (BLoC pattern) |
| | `assets/` | Images, icons, fonts |
| **Web** | `src/` | React components (minimal) |

---

## Integration Points

### Backend → Frontend (Mobile)
- **API Base**: Configured in `lib/core/constants/api_constants.dart`
- **Auth Flow**: JWT tokens stored in Flutter Secure Storage
- **Data Sync**: SQLite local cache with periodic backend sync

### Backend → Web
- **Status**: Not yet integrated
- **Planned**: Same REST API endpoints

### Backend → External Services
- **PostgreSQL**: TypeORM entities in each module
- **Neo4j**: Planned for GraphRAG (not yet connected)
- **Redis**: Bull queue for background jobs
- **Firebase**: Push notifications via Firebase Admin SDK

---

## Development Workflow

### Backend Development
```bash
npm run start:dev    # Dev server with hot-reload
npm run build        # Production build
npm run test         # Run Jest tests
npm run migration:generate  # Create DB migration
npm run migration:run       # Apply migrations
```

### Mobile Development
```bash
flutter pub get      # Install dependencies
flutter run          # Run on emulator/device
flutter test         # Run widget tests
flutter build apk    # Build Android APK
```

### Web Development
```bash
npm run dev          # Dev server
npm run build        # Production build
npm run lint         # ESLint check
```

---

**Last Updated:** 2025-11-30
**Total Files Analyzed:** 65+ source files
**Lines of Code (est.):** ~15,000 LOC (backend + frontend)
