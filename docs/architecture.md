# Townin Platform - Architecture Decision Document

**Generated:** 2025-11-30
**Project:** Townin Hyper-local Life OS & Insurance GraphRAG Platform
**Version:** 1.0
**Status:** Phase 0 Complete, Phase 1 In Planning

---

## Executive Summary

Townin은 **brownfield multi-part architecture**로 구성되며, 기존 NestJS backend와 Flutter mobile app을 확장하여 Phase 1 핵심 기능(지오스페이셜 인프라, 공공데이터 통합, 안전 지도)을 구현합니다.

**핵심 아키텍처 원칙:**
- **Privacy-First by Design**: Grid Cell 기반 익명화, PII 수집 금지
- **Multi-tenant Isolation**: Grid Cell 단위 데이터 파티셔닝
- **Event-Driven Scalability**: Redis Bull queues로 비동기 처리
- **GraphRAG-Ready**: Phase 3 Neo4j 통합을 위한 Entity 설계
- **AI-First Integration**: Claude/Vision API와 LangChain 오케스트레이션

이 문서는 **AI 에이전트 간 일관성 보장**을 목표로 하며, 모든 구현 결정이 명시되어 있습니다.

---

## Project Initialization

### Existing Codebase (Brownfield)

이 프로젝트는 **기존 구현 위에 확장**합니다:

```bash
# Backend (이미 존재)
cd townin-platform/backend
npm install
cp .env.example .env
npm run start:dev

# Frontend (이미 존재)
cd townin-platform/frontend
flutter pub get
flutter run

# Web (템플릿만 존재)
cd townin-platform/web
npm install
npm run dev
```

**Phase 1 새 구현 시작점:**
- Backend에 새 모듈 추가: `src/modules/public-data/`, `src/modules/geospatial/`
- Frontend에 새 피처 추가: `lib/features/safety_maps/`, `lib/features/onboarding/`

---

## Decision Summary

| Category | Decision | Version | Affects Epics | Rationale |
| -------- | -------- | ------- | ------------- | --------- |
| **Backend Framework** | NestJS | 10.3+ | All Backend Epics | TypeScript, modular, enterprise-grade |
| **Backend Language** | TypeScript | 5.3 | All Backend Epics | Type safety, IDE support |
| **Primary Database** | PostgreSQL + TypeORM | Latest | All data epics | Relational, ACID, proven |
| **Geospatial** | PostGIS Extension | Latest | CORE-002, USR-003~006 | Industry standard for geo queries |
| **Graph Database** | Neo4j | 5.16+ | Phase 3 GRA-001~008 | GraphRAG, relationship inference |
| **Cache/Queue** | Redis + Bull | 4.6+ | CORE-004, background jobs | Performance, job processing |
| **Mobile Framework** | Flutter | 3.2+ | All USR/MRC/SGD mobile epics | Cross-platform, native performance |
| **Mobile Language** | Dart | 3.2+ | All mobile epics | Flutter native |
| **State Management** | BLoC (flutter_bloc) | 8.1+ | All mobile epics | Predictable, testable state |
| **Web Framework** | React + Vite | Latest | Web epics (minimal) | Modern, fast dev server |
| **Authentication** | Passport (JWT + Local) | Latest | CORE-001, all auth | Industry standard, secure |
| **API Documentation** | Swagger/OpenAPI | 7.1+ | All API epics | Auto-generated docs |
| **AI/LLM (Primary)** | Anthropic Claude SDK | 0.20+ | MRC-006, Phase 3 | Multimodal, reliable |
| **AI/Vision** | Google Cloud Vision | 4.2+ | MRC-006 (flyer OCR) | Best-in-class OCR |
| **AI Orchestration** | LangChain | 0.1+ | Phase 3 GraphRAG | Agent coordination |
| **Push Notifications** | Firebase Messaging | 14.7+ | CORE-004, alerts | Reliable, cross-platform |
| **Testing (Backend)** | Jest | 29.7+ | All backend epics | NestJS native |
| **Testing (Mobile)** | bloc_test + mockito | 9.1+, 5.4+ | All mobile epics | BLoC testing, mocking |
| **ORM** | TypeORM | 0.3.19 | All data epics | NestJS integration |
| **Validation** | class-validator | 0.14 | All input validation | Decorator-based |
| **API Client (Mobile)** | Dio + Retrofit | 5.4+, 4.0+ | All API calls | Type-safe, code generation |
| **Local Storage (Mobile)** | SQLite (sqflite) | 2.3+ | Offline-first features | Relational, proven |
| **Secure Storage (Mobile)** | flutter_secure_storage | 9.0+ | Credentials, tokens | Platform keychain |
| **Maps** | Google Maps Flutter | 2.5+ | USR-003~006, USR-014 | Best coverage in Korea |
| **Location Services** | Geolocator | 11.0+ | 3-hub setup, routing | GPS, permissions |

---

## Project Structure

```
townin-platform/
├── backend/                          # NestJS API Server
│   ├── src/
│   │   ├── main.ts                   # Entry point
│   │   ├── app.module.ts             # Root module
│   │   │
│   │   ├── config/                   # Configuration
│   │   │   ├── database.config.ts    # TypeORM config
│   │   │   └── redis.config.ts       # NEW: Redis config
│   │   │
│   │   ├── common/                   # Shared utilities
│   │   │   ├── decorators/
│   │   │   ├── enums/
│   │   │   ├── guards/
│   │   │   └── interceptors/
│   │   │
│   │   └── modules/                  # Feature modules
│   │       │
│   │       ├── auth/                 # ✅ Authentication (JWT)
│   │       ├── users/                # ✅ User management
│   │       ├── regions/              # ✅ Region hierarchy
│   │       ├── grid-cells/           # ✅ Geospatial grid system
│   │       ├── merchants/            # ✅ Merchant management
│   │       ├── flyers/               # ✅ Digital flyers
│   │       ├── security-guards/      # ✅ Security guard system
│   │       ├── admin/                # ✅ Admin dashboard
│   │       │
│   │       ├── geospatial/           # 🆕 CORE-002: PostGIS operations
│   │       │   ├── geospatial.module.ts
│   │       │   ├── geospatial.service.ts
│   │       │   ├── grid-cell.entity.ts      # Enhanced with PostGIS
│   │       │   └── dto/
│   │       │
│   │       ├── public-data/          # 🆕 CORE-003: Seoul Open Data integration
│   │       │   ├── public-data.module.ts
│   │       │   ├── services/
│   │       │   │   ├── cctv.service.ts
│   │       │   │   ├── parking.service.ts
│   │       │   │   └── disaster.service.ts
│   │       │   ├── entities/
│   │       │   └── dto/
│   │       │
│   │       ├── notifications/        # 🆕 CORE-004: FCM/APNS
│   │       │   ├── notifications.module.ts
│   │       │   ├── notifications.service.ts
│   │       │   └── dto/
│   │       │
│   │       ├── files/                # 🆕 CORE-005: S3/CDN
│   │       │   ├── files.module.ts
│   │       │   ├── files.service.ts
│   │       │   └── dto/
│   │       │
│   │       └── graphrag/             # 📋 Phase 3: Neo4j GraphRAG
│   │           ├── graphrag.module.ts
│   │           ├── services/
│   │           └── entities/
│   │
│   ├── prisma/                       # Future: Prisma schema (optional migration from TypeORM)
│   ├── migrations/                   # TypeORM migrations
│   ├── test/                         # E2E tests
│   └── package.json
│
├── frontend/                         # Flutter Mobile App
│   ├── lib/
│   │   ├── main.dart                 # Entry point
│   │   │
│   │   ├── core/                     # Core infrastructure
│   │   │   ├── database/
│   │   │   │   └── database_helper.dart
│   │   │   ├── network/
│   │   │   │   └── dio_client.dart
│   │   │   ├── constants/
│   │   │   │   └── api_constants.dart
│   │   │   ├── models/
│   │   │   ├── services/
│   │   │   └── widgets/
│   │   │
│   │   └── features/                 # Feature modules (BLoC)
│   │       │
│   │       ├── auth/                 # ✅ Authentication
│   │       │   ├── data/
│   │       │   ├── domain/
│   │       │   ├── presentation/
│   │       │   └── bloc/
│   │       │
│   │       ├── onboarding/           # 🆕 USR-001: User onboarding
│   │       │   ├── data/
│   │       │   ├── presentation/
│   │       │   └── bloc/
│   │       │
│   │       ├── hub_setup/            # 🆕 USR-002: 3-Hub location setup
│   │       │   ├── data/
│   │       │   ├── presentation/
│   │       │   └── bloc/
│   │       │
│   │       ├── safety_maps/          # 🆕 USR-003~006: Safety/Parking/Risk/Life maps
│   │       │   ├── data/
│   │       │   │   ├── repositories/
│   │       │   │   └── models/
│   │       │   ├── presentation/
│   │       │   │   ├── screens/
│   │       │   │   │   ├── safety_map_screen.dart
│   │       │   │   │   ├── parking_map_screen.dart
│   │       │   │   │   ├── risk_map_screen.dart
│   │       │   │   │   └── life_map_screen.dart
│   │       │   │   └── widgets/
│   │       │   └── bloc/
│   │       │
│   │       ├── flyers/               # 🆕 USR-007~010: Digital flyer viewer
│   │       │   ├── data/
│   │       │   ├── presentation/
│   │       │   └── bloc/
│   │       │
│   │       └── dashboard/            # ✅ Role-based dashboards
│   │           ├── user/
│   │           ├── merchant/
│   │           ├── security_guard/
│   │           ├── municipality/
│   │           └── super_admin/
│   │
│   ├── assets/
│   ├── test/
│   └── pubspec.yaml
│
├── web/                              # React Web App (minimal)
│   ├── src/
│   ├── public/
│   └── package.json
│
├── database/                         # Database scripts
│   └── migrations/
│
├── docs/                             # Documentation
│   ├── architecture.md               # This file
│   ├── index.md                      # Documentation index
│   ├── project-overview.md
│   ├── source-tree-analysis.md
│   ├── epic-roadmap.md
│   └── epics/
│
└── scripts/                          # Utility scripts
    └── seed-data.sh
```

---

## Epic to Architecture Mapping

### Phase 0 (Complete)
| Epic ID | Module/Feature | Location |
|---------|----------------|----------|
| ADM-001 | Admin Dashboard Foundation | `backend/src/modules/admin/` |
| ADM-002 | User Management System | `backend/src/modules/users/` |
| ADM-003 | Flyer Statistics Dashboard | `backend/src/modules/admin/` + `flyers/` |
| ADM-004 | Region Management System | `backend/src/modules/regions/` |
| ADM-005 | Platform Activity Monitoring | `backend/src/modules/admin/` |

### Phase 1 - Core Infrastructure
| Epic ID | Module/Feature | Location |
|---------|----------------|----------|
| CORE-001 | Authentication & Authorization | `backend/src/modules/auth/` (exists), enhance with social login |
| CORE-002 | Geospatial Data Infrastructure | `backend/src/modules/geospatial/` (NEW) |
| CORE-003 | Public Data Integration | `backend/src/modules/public-data/` (NEW) |
| CORE-004 | Real-time Notification System | `backend/src/modules/notifications/` (NEW) |
| CORE-005 | File Upload & CDN | `backend/src/modules/files/` (NEW) |
| CORE-006 | Logging & Monitoring | `backend/src/common/interceptors/logging.interceptor.ts` (NEW) |

### Phase 1 - User App
| Epic ID | Module/Feature | Location |
|---------|----------------|----------|
| USR-001 | User Onboarding & Registration | `frontend/lib/features/onboarding/` (NEW) |
| USR-002 | 3-Hub Location Setup | `frontend/lib/features/hub_setup/` (NEW) |
| USR-003 | Safety Map (CCTV & Lighting) | `frontend/lib/features/safety_maps/` (NEW) |
| USR-004 | Parking Map | `frontend/lib/features/safety_maps/` (NEW) |
| USR-005 | Risk Map (Disaster Safety) | `frontend/lib/features/safety_maps/` (NEW) |
| USR-006 | Life Map (Public Amenities) | `frontend/lib/features/safety_maps/` (NEW) |
| USR-007 | Digital Flyer Viewer | `frontend/lib/features/flyers/` (NEW) |
| USR-008 | Flyer Interaction & Points | `frontend/lib/features/flyers/` + `backend/src/modules/points/` (NEW) |
| USR-009 | Flyer Search & Discovery | `frontend/lib/features/flyers/` |
| USR-010 | Point System & Rewards | `backend/src/modules/points/` (NEW) |

### Phase 1 - Merchant App
| Epic ID | Module/Feature | Location |
|---------|----------------|----------|
| MRC-001 | Merchant Onboarding | `backend/src/modules/merchants/` (exists), enhance |
| MRC-002 | Digital Signboard | `backend/src/modules/merchants/` + mobile merchant feature |
| MRC-003 | Basic Flyer Creation | `frontend/lib/features/merchant_flyers/` (NEW) |
| MRC-004 | Flyer Management Dashboard | `frontend/lib/features/merchant_flyers/` |
| MRC-005 | Basic Analytics | `backend/src/modules/analytics/` (NEW) |

### Phase 1 - Security Guard App
| Epic ID | Module/Feature | Location |
|---------|----------------|----------|
| SGD-001 | Security Guard Dashboard | `frontend/lib/features/dashboard/security_guard/` (exists) |
| SGD-002 | Flyer Approval Workflow | `backend/src/modules/flyers/` (approval logic) + mobile UI |
| SGD-003 | Local Activity Monitoring | `frontend/lib/features/security_guard/monitoring/` (NEW) |

---

## Technology Stack Details

### Core Technologies

#### Backend (NestJS)
```typescript
// package.json dependencies (key selections)
{
  "@nestjs/common": "^10.3.0",
  "@nestjs/core": "^10.3.0",
  "@nestjs/typeorm": "^10.0.1",
  "@nestjs/jwt": "^10.2.0",
  "@nestjs/passport": "^10.0.3",
  "@nestjs/swagger": "^7.1.17",
  "@nestjs/bull": "^10.0.1",

  "typeorm": "^0.3.19",
  "pg": "^8.11.3",              // PostgreSQL driver
  "redis": "^4.6.12",
  "bull": "^4.12.0",

  "@anthropic-ai/sdk": "^0.20.0",
  "@google-cloud/vision": "^4.2.0",
  "langchain": "^0.1.9",
  "neo4j-driver": "^5.16.0",

  "passport-jwt": "^4.0.1",
  "passport-local": "^1.0.0",
  "bcrypt": "^5.1.1",

  "class-validator": "^0.14.0",
  "class-transformer": "^0.5.1"
}
```

**Rationale:**
- NestJS: Enterprise-grade TypeScript framework with dependency injection
- TypeORM: Mature ORM with PostgreSQL/PostGIS support
- Bull: Robust job queue for background processing (AI tasks, data sync)
- Anthropic/Google/LangChain: AI/ML capabilities for Phase 2-3

#### Frontend (Flutter)
```yaml
# pubspec.yaml dependencies (key selections)
dependencies:
  flutter_bloc: ^8.1.3         # State management
  equatable: ^2.0.5            # Value equality for BLoC

  dio: ^5.4.0                  # HTTP client
  retrofit: ^4.0.3             # Type-safe API client
  json_annotation: ^4.8.1      # JSON serialization

  flutter_secure_storage: ^9.0.0
  shared_preferences: ^2.2.2
  sqflite: ^2.3.0              # Local SQLite

  google_maps_flutter: ^2.5.0
  geolocator: ^11.0.0

  firebase_messaging: ^14.7.10
  flutter_local_notifications: ^16.3.0

  go_router: ^13.0.0           # Routing
```

**Rationale:**
- BLoC: Predictable state management, testable
- Dio/Retrofit: Type-safe API calls with code generation
- SQLite: Offline-first capabilities
- Google Maps: Best coverage for Korean POI data
- Firebase: Reliable push notifications

### Integration Points

#### Backend ↔ Frontend (Mobile)
- **Protocol**: REST API over HTTPS
- **Base URL**: `https://api.townin.com/v1` (production), `http://localhost:3000` (dev)
- **Authentication**: JWT Bearer token in `Authorization` header
- **Request Format**: JSON with camelCase keys
- **Response Format**:
  ```json
  {
    "data": { ... },       // Success data
    "meta": { ... },       // Pagination, etc
    "error": null
  }
  ```
- **Error Format**:
  ```json
  {
    "data": null,
    "error": {
      "code": "ERR_001",
      "message": "Human-readable error",
      "details": { ... }
    }
  }
  ```

#### Backend ↔ PostgreSQL
- **Connection**: TypeORM with connection pooling
- **Entities**: Decorators (`@Entity`, `@Column`, `@ManyToOne`)
- **Migrations**: TypeORM CLI (`npm run migration:generate`)
- **Extensions**: PostGIS for geospatial (CORE-002)

#### Backend ↔ Neo4j
- **Driver**: `neo4j-driver` (official)
- **Connection**: Bolt protocol
- **Use Case**: GraphRAG (Phase 3)
- **Schema**: Property graph with labeled nodes (User, Location, Product, Risk, Insurance)

#### Backend ↔ Redis
- **Use Cases**:
  1. Session cache (optional, JWT is stateless)
  2. API rate limiting
  3. Bull job queue backend
  4. Real-time pub/sub for notifications

#### Backend ↔ External APIs
- **Seoul Open Data**: REST API with API key
- **Google Cloud Vision**: gRPC/REST for OCR
- **Anthropic Claude**: REST API for LLM
- **Firebase Admin SDK**: For push notification sending

---

## Novel Pattern Designs

### Pattern 1: Grid Cell-Based Multi-Tenancy

**Purpose**: Hyper-local data isolation without exposing exact addresses (Privacy-First)

**Challenge**: Traditional multi-tenant systems use `tenant_id`. Townin uses **geographic grid cells** as implicit tenants to prevent PII exposure.

**Components**:
1. **GridCell Entity** (Backend)
   - `id`: UUID
   - `level`: Integer (1=광역시, 2=구, 3=동, 4=세부 grid)
   - `parent_id`: Self-reference for hierarchy
   - `geometry`: PostGIS POLYGON (boundary)
   - `code`: String (행정구역 코드)

2. **User-GridCell Association** (3-Hub Model)
   - UserRegion Entity: `user_id`, `grid_cell_id`, `hub_type` (HOME/WORK/FAMILY)
   - Limit: 3 hubs per user

3. **Data Scoping Pattern**
   - All public data (CCTV, parking) tagged with `grid_cell_id`
   - Queries filtered by user's active hub: `WHERE grid_cell_id IN (SELECT grid_cell_id FROM user_regions WHERE user_id = ?)`
   - Frontend shows "current hub" selector

**Data Flow**:
```
User logs in → Selects hub (HOME/WORK/FAMILY)
  ↓
App fetches grid_cell_id for that hub
  ↓
All API calls include ?gridCellId=xxx
  ↓
Backend filters data: WHERE grid_cell_id = xxx OR parent_grid_cell_id = xxx
  ↓
Response contains ONLY data visible to that grid cell
```

**Implementation Guide**:
- **Backend**: All queries in `public-data/*` modules MUST filter by `grid_cell_id`
- **Frontend**: Hub selector widget in app bar, persisted in `SharedPreferences`
- **Database**: Add `grid_cell_id` column to: `cctv`, `parking_lots`, `disaster_zones`, `flyers`, etc.

**Affects Epics**: CORE-002, USR-002, USR-003~006, USR-007, all data display epics

---

### Pattern 2: GraphRAG Entity-First Design

**Purpose**: Prepare entities NOW (Phase 1) for GraphRAG integration later (Phase 3)

**Challenge**: Phase 3 will build a knowledge graph. If Phase 1 entities aren't designed with graph relationships in mind, massive refactoring will be required.

**Components**:
1. **Entity Metadata** (Phase 1 TypeORM entities)
   - Add `entity_type` field to key entities: `USER`, `LOCATION`, `PRODUCT`, `FLYER`, `MERCHANT`
   - Add `created_at`, `updated_at` for temporal graph edges
   - Add `tags` JSONB field for future semantic indexing

2. **Relationship Hints**
   - FlowEntity: `user_id` → `grid_cell_id` → `merchant_id` (implicit graph: User→Views→Flyer→BelongsTo→Merchant)
   - UserRegion: `user_id` → `grid_cell_id` (User→LivesIn→Location)

3. **Future Neo4j Sync**
   - Bull queue job: `sync-to-neo4j`
   - Triggered on entity create/update
   - Maps TypeORM entities to Neo4j nodes/edges

**Implementation Guide**:
- When creating new entities in Phase 1, ask: "How will this be a Node or Edge in GraphRAG?"
- Example: `FlyerView` entity (tracks user views) becomes Edge: `(User)-[:VIEWED]->(Flyer)` in Phase 3
- Add `@Column({ type: 'jsonb' })` for unstructured metadata that GraphRAG might need

**Affects Epics**: All data epics (prepares for GRA-001~008, INS-001~006)

---

### Pattern 3: Public Data Incremental Sync

**Purpose**: Efficiently sync large public datasets (CCTV, parking) without blocking API

**Challenge**: Seoul Open Data API returns 10,000+ CCTVs. Can't fetch on every request, can't block user waiting.

**Components**:
1. **Scheduler Service** (NestJS Cron)
   - Daily at 3 AM KST: Fetch full dataset from Seoul API
   - Store in PostgreSQL: `cctv`, `parking_lots`, `disaster_zones` tables

2. **Diff Detection**
   - Compare API response with DB using `external_id` (Seoul's ID)
   - Insert new, update changed, soft-delete removed (mark `is_active=false`)

3. **Spatial Indexing** (PostGIS)
   - Create GIST index on `geometry` column
   - Queries use `ST_Contains(grid_cell.geometry, cctv.location)`

4. **Client Cache**
   - Mobile app fetches data for current grid cell
   - Stores in SQLite for offline access
   - Refreshes on grid cell change or daily

**Data Flow**:
```
[3 AM] Backend Cron Job
  ↓
Fetch Seoul Open Data API (all CCTVs)
  ↓
Diff with DB (INSERT/UPDATE/DELETE)
  ↓
[User opens Safety Map]
  ↓
Mobile app calls GET /api/public-data/cctv?gridCellId=xxx
  ↓
Backend: SELECT * FROM cctv WHERE ST_Contains(?, location) AND is_active=true
  ↓
Response cached in mobile SQLite
```

**Implementation Guide**:
- **Backend**: Create `PublicDataSyncService` with `@Cron('0 3 * * *')` decorator
- **Frontend**: Check SQLite `last_sync_at`, refetch if >24 hours
- **PostGIS**: Enable extension: `CREATE EXTENSION postgis;`

**Affects Epics**: CORE-003, USR-003~006

---

## Implementation Patterns

### REST API Patterns

**Endpoint Naming**:
- Resource plural: `/api/users`, `/api/flyers`, `/api/grid-cells`
- Hyphen-separated: `/api/public-data`, `/api/user-regions`
- Version prefix: `/api/v1/...` (implicit v1 for now)

**Route Parameters**:
- UUID format: `/api/users/:id` where `:id` is UUID
- Query filters: `/api/flyers?gridCellId=xxx&category=food`

**HTTP Methods**:
- `GET`: Read (idempotent)
- `POST`: Create
- `PATCH`: Partial update (preferred over PUT)
- `DELETE`: Soft delete (set `deleted_at`, keep in DB)

**Response Status Codes**:
- `200 OK`: Success (GET, PATCH)
- `201 Created`: Success (POST)
- `204 No Content`: Success (DELETE)
- `400 Bad Request`: Validation error
- `401 Unauthorized`: Missing/invalid token
- `403 Forbidden`: Valid token, insufficient permissions
- `404 Not Found`: Resource doesn't exist
- `500 Internal Server Error`: Unhandled exception

**Example**:
```typescript
@Get(':id')
async findOne(@Param('id') id: string): Promise<ResponseDto<FlyerDto>> {
  const flyer = await this.flyersService.findOne(id);
  return { data: flyer, error: null };
}
```

---

### Database Patterns

**Table Naming**:
- Lowercase, underscore-separated: `users`, `grid_cells`, `user_regions`
- Plural for main entities: `flyers`, `merchants`
- Singular for join tables: `user_region` (one record per user-region pair)

**Column Naming**:
- Snake_case: `user_id`, `grid_cell_id`, `created_at`
- Foreign keys: `{table}_id` (e.g., `user_id` references `users.id`)
- Booleans: `is_active`, `is_approved`, `has_*`
- Timestamps: `created_at`, `updated_at`, `deleted_at` (for soft deletes)

**Primary Keys**:
- UUIDs for all entities (security, distribution)
- TypeORM: `@PrimaryGeneratedColumn('uuid')`

**Indexes**:
- Foreign keys: Automatic index
- Query-heavy columns: `@Index()` on `grid_cell_id`, `user_id`, `merchant_id`
- PostGIS: GIST index on `geometry` columns

**Soft Deletes**:
- Add `deleted_at` column (nullable timestamp)
- TypeORM: `@DeleteDateColumn()`
- Queries automatically exclude soft-deleted (except with `withDeleted()`)

---

### Mobile (Flutter) Patterns

**File Naming**:
- Snake_case: `safety_map_screen.dart`, `flyer_card.dart`, `user_repository.dart`
- Suffix by type: `*_screen.dart`, `*_bloc.dart`, `*_event.dart`, `*_state.dart`, `*_repository.dart`, `*_model.dart`

**Class Naming**:
- PascalCase: `SafetyMapScreen`, `FlyerBloc`, `UserRepository`

**Directory Structure** (per feature):
```
features/safety_maps/
  ├── data/
  │   ├── models/           # DTOs (from JSON)
  │   └── repositories/     # API calls
  ├── domain/
  │   └── entities/         # Business objects (if clean arch)
  ├── presentation/
  │   ├── screens/
  │   ├── widgets/
  │   └── bloc/
  └── README.md
```

**BLoC Event Naming**:
- Verb + Subject: `LoadSafetyMapData`, `FilterFlyersByCategory`, `SelectHub`

**BLoC State Naming**:
- Noun + Status: `SafetyMapInitial`, `SafetyMapLoading`, `SafetyMapLoaded`, `SafetyMapError`

**API Call Pattern**:
```dart
// Repository
@GET('/api/public-data/cctv')
Future<List<CctvModel>> getCctvList(@Query('gridCellId') String gridCellId);

// BLoC
on<LoadSafetyMapData>((event, emit) async {
  emit(SafetyMapLoading());
  try {
    final data = await repository.getCctvList(event.gridCellId);
    emit(SafetyMapLoaded(data));
  } catch (e) {
    emit(SafetyMapError(e.toString()));
  }
});
```

---

## Consistency Rules

### Naming Conventions

**Backend (TypeScript)**:
- Files: `kebab-case.ts` (e.g., `users.service.ts`, `flyer-product.entity.ts`)
- Classes: `PascalCase` (e.g., `UsersService`, `FlyerProductEntity`)
- Methods: `camelCase` (e.g., `findOne()`, `createFlyer()`)
- Constants: `UPPER_SNAKE_CASE` (e.g., `MAX_HUBS_PER_USER = 3`)

**Frontend (Dart)**:
- Files: `snake_case.dart`
- Classes: `PascalCase`
- Methods: `camelCase`
- Constants: `camelCase` (Dart convention, not UPPER)

**Database**:
- Tables: `snake_case` plural
- Columns: `snake_case`
- Indexes: `idx_{table}_{column}`
- Foreign keys: `fk_{table}_{column}`

---

### Code Organization

**Backend Module Structure** (example: `public-data`):
```
public-data/
  ├── public-data.module.ts       # NestJS module
  ├── services/
  │   ├── cctv.service.ts         # Business logic
  │   ├── parking.service.ts
  │   └── public-data-sync.service.ts
  ├── controllers/
  │   ├── cctv.controller.ts      # HTTP endpoints
  │   └── parking.controller.ts
  ├── entities/
  │   ├── cctv.entity.ts          # TypeORM entity
  │   └── parking-lot.entity.ts
  ├── dto/
  │   ├── cctv.dto.ts             # Response DTOs
  │   └── parking-lot.dto.ts
  └── interfaces/
      └── seoul-api.interface.ts  # External API types
```

**Mobile Feature Structure** (example: `safety_maps`):
```
safety_maps/
  ├── data/
  │   ├── models/
  │   │   ├── cctv_model.dart     # JSON serializable
  │   │   ├── cctv_model.g.dart   # Generated
  │   │   └── parking_model.dart
  │   └── repositories/
  │       └── safety_map_repository.dart
  ├── presentation/
  │   ├── screens/
  │   │   └── safety_map_screen.dart
  │   ├── widgets/
  │   │   ├── map_marker.dart
  │   │   └── filter_chip.dart
  │   └── bloc/
  │       ├── safety_map_bloc.dart
  │       ├── safety_map_event.dart
  │       └── safety_map_state.dart
  └── README.md
```

---

### Error Handling

**Backend** (NestJS):
```typescript
// Use built-in HTTP exceptions
import { NotFoundException, BadRequestException } from '@nestjs/common';

// Example
async findOne(id: string): Promise<User> {
  const user = await this.usersRepository.findOne({ where: { id } });
  if (!user) {
    throw new NotFoundException(`User with ID ${id} not found`);
  }
  return user;
}

// Global exception filter handles formatting
```

**Frontend** (Flutter):
```dart
// Repository layer: Throw specific exceptions
class ApiException implements Exception {
  final String message;
  final int? statusCode;
  ApiException(this.message, this.statusCode);
}

// BLoC layer: Catch and emit error state
on<LoadData>((event, emit) async {
  try {
    final data = await repository.getData();
    emit(DataLoaded(data));
  } on ApiException catch (e) {
    emit(DataError(e.message));
  } catch (e) {
    emit(DataError('An unexpected error occurred'));
  }
});

// UI layer: Show error message
BlocBuilder<DataBloc, DataState>(
  builder: (context, state) {
    if (state is DataError) {
      return ErrorWidget(message: state.message);
    }
    // ...
  },
)
```

---

### Logging Strategy

**Backend** (NestJS):
- **Library**: Winston (or NestJS built-in Logger)
- **Levels**: `error`, `warn`, `info`, `debug`
- **Format**: JSON structured logs
  ```json
  {
    "level": "info",
    "timestamp": "2025-11-30T10:00:00Z",
    "context": "UsersService",
    "message": "User created",
    "userId": "uuid",
    "metadata": { ... }
  }
  ```
- **Sensitive Data**: NEVER log passwords, tokens, PII
- **Best Practice**: Log at service layer, not controller

**Frontend** (Flutter):
- **Library**: `logger` package
- **Levels**: `verbose`, `debug`, `info`, `warning`, `error`, `wtf` (what a terrible failure)
- **Usage**:
  ```dart
  final logger = Logger();
  logger.i('User logged in', userId);
  logger.e('API call failed', error: e, stackTrace: st);
  ```
- **Production**: Set level to `warning` and above

---

## Data Architecture

### Core Entities & Relationships

```
User (users)
  ├─ id: UUID (PK)
  ├─ email: String (unique)
  ├─ password_hash: String
  ├─ role: Enum (USER, MERCHANT, SECURITY_GUARD, MUNICIPALITY, SUPER_ADMIN, FP)
  ├─ created_at: Timestamp
  ├─ updated_at: Timestamp
  └─ deleted_at: Timestamp (nullable)

UserRegion (user_regions) - 3-Hub Model
  ├─ id: UUID (PK)
  ├─ user_id: UUID (FK → users)
  ├─ grid_cell_id: UUID (FK → grid_cells)
  ├─ hub_type: Enum (HOME, WORK, FAMILY)
  ├─ is_active: Boolean
  └─ Constraint: Max 3 hubs per user

GridCell (grid_cells) - Hierarchical Geospatial
  ├─ id: UUID (PK)
  ├─ parent_id: UUID (FK → grid_cells, nullable)
  ├─ level: Integer (1=시, 2=구, 3=동, 4=세부그리드)
  ├─ code: String (행정구역 코드)
  ├─ name: String (e.g., "강남구", "역삼동")
  ├─ geometry: GEOMETRY(POLYGON, 4326) -- PostGIS
  └─ Index: GIST on geometry

Merchant (merchants)
  ├─ id: UUID (PK)
  ├─ user_id: UUID (FK → users, nullable if separate auth)
  ├─ business_name: String
  ├─ business_number: String (사업자 등록번호)
  ├─ grid_cell_id: UUID (FK → grid_cells)
  ├─ location: GEOMETRY(POINT, 4326)
  ├─ is_verified: Boolean
  └─ created_at: Timestamp

Flyer (flyers)
  ├─ id: UUID (PK)
  ├─ merchant_id: UUID (FK → merchants)
  ├─ grid_cell_id: UUID (FK → grid_cells) -- Visibility scope
  ├─ title: String
  ├─ description: Text
  ├─ start_date: Date
  ├─ end_date: Date
  ├─ status: Enum (DRAFT, PENDING, APPROVED, REJECTED, ACTIVE, EXPIRED)
  ├─ approved_by: UUID (FK → security_guards, nullable)
  ├─ image_url: String
  └─ created_at: Timestamp

FlyerProduct (flyer_products)
  ├─ id: UUID (PK)
  ├─ flyer_id: UUID (FK → flyers)
  ├─ product_name: String
  ├─ price: Decimal
  ├─ discount_price: Decimal (nullable)
  ├─ quantity: Integer (nullable)
  └─ image_url: String (nullable)

SecurityGuard (security_guards)
  ├─ id: UUID (PK)
  ├─ user_id: UUID (FK → users)
  ├─ assigned_grid_cell_id: UUID (FK → grid_cells)
  ├─ commission_rate: Decimal (e.g., 0.05 for 5%)
  ├─ status: Enum (ACTIVE, INACTIVE)
  └─ hired_at: Timestamp

CCTV (cctv)  -- Public Data
  ├─ id: UUID (PK)
  ├─ external_id: String (Seoul API ID)
  ├─ grid_cell_id: UUID (FK → grid_cells)
  ├─ location: GEOMETRY(POINT, 4326)
  ├─ installation_date: Date
  ├─ is_active: Boolean
  ├─ last_synced_at: Timestamp
  └─ Index: GIST on location

ParkingLot (parking_lots)  -- Public Data
  ├─ id: UUID (PK)
  ├─ external_id: String
  ├─ grid_cell_id: UUID (FK → grid_cells)
  ├─ name: String
  ├─ location: GEOMETRY(POINT, 4326)
  ├─ capacity: Integer
  ├─ available_spots: Integer (updated real-time)
  ├─ is_active: Boolean
  └─ last_synced_at: Timestamp
```

**Relationship Summary**:
- User 1:N UserRegion (max 3)
- UserRegion N:1 GridCell
- GridCell self-referencing hierarchy (parent_id)
- Merchant N:1 GridCell
- Flyer N:1 Merchant, N:1 GridCell
- Flyer 1:N FlyerProduct
- SecurityGuard N:1 GridCell (assigned territory)
- CCTV/ParkingLot N:1 GridCell

---

## API Contracts

### Authentication

**POST /api/auth/login**
```json
Request:
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}

Response (200):
{
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "Bearer",
    "expires_in": 3600,
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "role": "USER"
    }
  },
  "error": null
}
```

**POST /api/auth/register**
```json
Request:
{
  "email": "newuser@example.com",
  "password": "SecurePass123!",
  "role": "USER"
}

Response (201): Same as login
```

---

### Public Data (New - CORE-003)

**GET /api/public-data/cctv?gridCellId={uuid}**
```json
Response (200):
{
  "data": [
    {
      "id": "uuid",
      "location": {
        "lat": 37.4979,
        "lng": 127.0276
      },
      "installationDate": "2020-01-15",
      "isActive": true
    },
    ...
  ],
  "meta": {
    "total": 150,
    "gridCellId": "uuid"
  },
  "error": null
}
```

**GET /api/public-data/parking?gridCellId={uuid}**
```json
Response (200):
{
  "data": [
    {
      "id": "uuid",
      "name": "강남역 공영주차장",
      "location": { "lat": 37.498, "lng": 127.028 },
      "capacity": 200,
      "availableSpots": 45,
      "isActive": true
    },
    ...
  ],
  "meta": { "total": 20 },
  "error": null
}
```

---

### Grid Cells (New - CORE-002)

**GET /api/grid-cells/search?lat={lat}&lng={lng}**

Find grid cell at a specific coordinate.

```json
Response (200):
{
  "data": {
    "id": "uuid",
    "level": 3,
    "code": "11680",
    "name": "강남구",
    "parentId": "uuid"
  },
  "error": null
}
```

**GET /api/grid-cells/{id}/children**

Get sub-grid cells (e.g., 구 → 동).

```json
Response (200):
{
  "data": [
    { "id": "uuid", "name": "역삼동", "level": 4 },
    { "id": "uuid", "name": "삼성동", "level": 4 }
  ],
  "error": null
}
```

---

### User Regions (3-Hub)

**POST /api/user-regions**
```json
Request:
{
  "gridCellId": "uuid",
  "hubType": "HOME"
}

Response (201):
{
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "gridCellId": "uuid",
    "hubType": "HOME",
    "isActive": true
  },
  "error": null
}
```

**GET /api/user-regions**

Get current user's 3 hubs.

```json
Response (200):
{
  "data": [
    { "id": "uuid", "hubType": "HOME", "gridCell": { "name": "역삼동" } },
    { "id": "uuid", "hubType": "WORK", "gridCell": { "name": "삼성동" } },
    { "id": "uuid", "hubType": "FAMILY", "gridCell": { "name": "송파구" } }
  ],
  "error": null
}
```

---

## Security Architecture

### Authentication Flow

1. **User Login**:
   - Frontend: POST /api/auth/login with email/password
   - Backend: Validate with bcrypt, generate JWT
   - JWT payload: `{ sub: userId, role: 'USER', iat, exp }`
   - Frontend: Store token in `flutter_secure_storage`

2. **Subsequent Requests**:
   - Frontend: Add header `Authorization: Bearer {token}`
   - Backend: JWT guard validates token, extracts user

3. **Social Login** (CORE-001 enhancement):
   - Google/Kakao OAuth flow
   - Exchange OAuth token for Townin JWT

### Authorization (RBAC)

**Roles**:
- `USER`: Standard user
- `MERCHANT`: Business owner
- `SECURITY_GUARD`: Local moderator
- `MUNICIPALITY`: Government official
- `FP`: Financial planner
- `SUPER_ADMIN`: Platform admin

**Guards**:
```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN', 'MUNICIPALITY')
@Get('admin/stats')
async getStats() { ... }
```

### Data Protection

**PII Minimization**:
- NO storage of: Full addresses, real names (optional nickname only)
- Grid Cell IDs used instead of exact lat/lng
- User identifiable only by email (for login)

**Encryption**:
- Passwords: bcrypt (salt rounds: 10)
- Tokens: Stored in secure storage (iOS Keychain, Android KeyStore)
- HTTPS enforced in production

**SQL Injection Prevention**:
- TypeORM parameterized queries (never string concat)
- class-validator on all DTOs

---

## Performance Considerations

### Backend Optimization

1. **Database Indexing**:
   - Indexes on: `grid_cell_id`, `user_id`, `merchant_id`, `created_at`
   - PostGIS GIST index on `geometry` columns
   - Partial indexes: `WHERE is_active = true`

2. **Caching Strategy**:
   - Public data (CCTV, parking): Redis cache, TTL 1 hour
   - Grid cell hierarchy: Redis cache, TTL 24 hours
   - API responses: Consider Redis for hot paths

3. **Pagination**:
   - Default page size: 20
   - Max page size: 100
   - Cursor-based for infinite scroll (flyer feed)

4. **Async Processing**:
   - Bull queues for:
     - Public data sync (daily 3 AM)
     - Image upload/resize (S3 + CDN)
     - AI flyer scanning (Phase 2)
     - Neo4j sync (Phase 3)

### Frontend Optimization

1. **Lazy Loading**:
   - Map markers: Load on viewport bounds change
   - Flyer images: Lazy load with placeholder

2. **Local Caching**:
   - SQLite for offline-first:
     - Safety map data (CCTV, parking) per grid cell
     - Flyers viewed in last 7 days
   - Cache invalidation: Check `last_synced_at` timestamp

3. **Image Optimization**:
   - CDN-served images with multiple resolutions
   - Thumbnail: 200x200, Full: 1200x1200
   - Flutter `cached_network_image` package

---

## Deployment Architecture

### Production Environment

**Backend**:
- **Hosting**: AWS ECS (Fargate) or Google Cloud Run
- **Load Balancer**: ALB (Application Load Balancer)
- **Auto-scaling**: CPU >70% → add container
- **Database**: AWS RDS PostgreSQL with PostGIS extension
  - Multi-AZ deployment
  - Read replicas for analytics queries
- **Neo4j**: AWS EC2 or Neo4j Aura (managed)
- **Redis**: AWS ElastiCache
- **File Storage**: AWS S3 + CloudFront CDN
- **Monitoring**: AWS CloudWatch, Sentry

**Mobile**:
- **Stores**: Google Play Store, Apple App Store
- **OTA Updates**: CodePush (optional for non-native changes)
- **Crash Reporting**: Firebase Crashlytics

**CI/CD**:
- **Backend**: GitHub Actions → Build Docker → Push to ECR → Deploy to ECS
- **Mobile**: GitHub Actions → Flutter build → Upload to TestFlight/Play Console

---

## Development Environment

### Prerequisites

**Backend**:
- Node.js 18+ LTS
- PostgreSQL 14+ with PostGIS
- Redis 6+
- Docker (for local services)

**Mobile**:
- Flutter SDK 3.2+
- Dart SDK 3.2+
- Android Studio or VS Code
- Xcode (macOS, for iOS)

**Shared**:
- Git
- VS Code (recommended) with extensions:
  - ESLint, Prettier (backend)
  - Dart, Flutter (mobile)

### Setup Commands

**Backend**:
```bash
cd townin-platform/backend

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env: DATABASE_URL, REDIS_URL, JWT_SECRET, etc.

# Start PostgreSQL + Redis (Docker)
docker-compose up -d postgres redis

# Enable PostGIS extension (run once)
psql -U postgres -d townin -c "CREATE EXTENSION IF NOT EXISTS postgis;"

# Run migrations
npm run migration:run

# Seed initial data (optional)
npm run seed

# Start dev server
npm run start:dev
# API: http://localhost:3000
# Swagger: http://localhost:3000/api
```

**Mobile**:
```bash
cd townin-platform/frontend

# Install dependencies
flutter pub get

# Run code generation (Retrofit, JSON serialization)
flutter pub run build_runner build --delete-conflicting-outputs

# Run on emulator/device
flutter run

# Run tests
flutter test
```

---

## Architecture Decision Records (ADRs)

### ADR-001: Use Grid Cells for Multi-Tenancy Instead of User Addresses

**Status**: Accepted
**Date**: 2025-11-30
**Context**: Townin requires hyper-local data scoping without exposing user PII (full addresses).
**Decision**: Implement hierarchical grid cell system with PostGIS, limit users to 3 hubs.
**Consequences**:
- ✅ Privacy-first: No address storage
- ✅ Scalable: Grid cells are reusable across users
- ❌ Complexity: Requires PostGIS and spatial queries
- ❌ Learning curve: Developers must understand geospatial concepts

---

### ADR-002: Prepare TypeORM Entities for GraphRAG (Phase 3)

**Status**: Accepted
**Date**: 2025-11-30
**Context**: Phase 3 will add Neo4j GraphRAG. Refactoring entities later is costly.
**Decision**: Add `entity_type`, `tags` JSONB, and temporal fields NOW in Phase 1.
**Consequences**:
- ✅ Smooth Phase 3 transition
- ✅ Enables future semantic search
- ❌ Slight overhead in Phase 1 (extra columns)

---

### ADR-003: Use Bull Queues for All Async Processing

**Status**: Accepted
**Date**: 2025-11-30
**Context**: Public data sync, AI tasks, and future Neo4j sync require background processing.
**Decision**: Standardize on Bull (Redis-backed) for all queues.
**Consequences**:
- ✅ Unified queue system
- ✅ Retry, priority, and scheduling support
- ❌ Redis dependency (but already needed for caching)

---

### ADR-004: Flutter BLoC for State Management

**Status**: Accepted
**Date**: 2025-11-30
**Context**: Mobile app has complex state (map layers, filters, offline sync).
**Decision**: Use flutter_bloc for all features.
**Consequences**:
- ✅ Predictable state flow
- ✅ Testable (bloc_test package)
- ✅ Community support
- ❌ Boilerplate (events, states, blocs)

---

### ADR-005: Soft Deletes for All Entities

**Status**: Accepted
**Date**: 2025-11-30
**Context**: Hard deletes lose audit trail and break GraphRAG temporal queries.
**Decision**: Use `deleted_at` column for all entities.
**Consequences**:
- ✅ Audit trail preserved
- ✅ GraphRAG can query historical data
- ❌ Queries must filter `WHERE deleted_at IS NULL`
- ❌ Disk usage increases (but acceptable)

---

### ADR-006: Daily Batch Sync for Public Data

**Status**: Accepted
**Date**: 2025-11-30
**Context**: Seoul Open Data changes infrequently (CCTVs don't move daily).
**Decision**: Cron job at 3 AM KST daily, not real-time polling.
**Consequences**:
- ✅ Reduces API calls to Seoul (cost, rate limits)
- ✅ Predictable DB load
- ❌ Up to 24-hour lag for new CCTVs (acceptable)

---

_Generated by BMAD Decision Architecture Workflow v1.0_
_Date: 2025-11-30_
_For: BMad_
