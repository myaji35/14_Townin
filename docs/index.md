# Townin Platform - Documentation Index

**Generated:** 2025-11-30
**Project:** Townin Hyper-local Life OS & Insurance GraphRAG Platform
**Repository Type:** Multi-part (Backend + Mobile + Web)

---

## 🎯 Quick Navigation

### For AI-Assisted Development
👉 **Start Here:** [Project Overview](./project-overview.md) - Complete project summary
👉 **Architecture Context:** [Source Tree Analysis](./source-tree-analysis.md) - Codebase structure

### For Product Planning
📋 **Epic Roadmap:** [Epic Roadmap](./epic-roadmap.md) - All 89 epics across 4 phases
📝 **Product Requirements:** [PRD](../prd.md) - Complete product requirements document

---

## Project Overview

- **Type:** Multi-part repository with 3 distinct parts
- **Primary Language:** TypeScript (Backend), Dart (Mobile), TypeScript (Web)
- **Development Status:** Phase 0 complete (5/89 epics), Phase 1 in planning

### Quick Reference

#### Backend (NestJS)
- **Type:** backend
- **Tech Stack:** NestJS 10.3 + TypeScript 5.3 + PostgreSQL + Neo4j + Redis
- **Root:** `townin-platform/backend/`
- **Entry Point:** `src/main.ts`
- **Status:** ~40% implemented (8 modules complete)

#### Frontend (Flutter)
- **Type:** mobile
- **Tech Stack:** Flutter 3.2 + Dart + BLoC + SQLite
- **Root:** `townin-platform/frontend/`
- **Entry Point:** `lib/main.dart` _(To be generated)_
- **Status:** ~30% implemented (auth, dashboards, partial safety map)

#### Web (React + Vite)
- **Type:** web
- **Tech Stack:** React + TypeScript + Vite
- **Root:** `townin-platform/web/`
- **Entry Point:** `src/main.tsx` _(To be generated)_
- **Status:** ~5% implemented (template only)

---

## Generated Documentation

### Core Documents
- [Project Overview](./project-overview.md) - Executive summary, tech stack, status
- [Source Tree Analysis](./source-tree-analysis.md) - Complete directory structure & file inventory
- [Tech Stack Summary](#technology-stack) - See Project Overview for detailed breakdown

### Architecture Documents
- [Architecture - Backend](./architecture-backend.md) _(To be generated)_
- [Architecture - Frontend](./architecture-frontend.md) _(To be generated)_
- [Architecture - Web](./architecture-web.md) _(To be generated)_
- [Integration Architecture](./integration-architecture.md) _(To be generated)_

### API & Data
- [API Contracts - Backend](./api-contracts-backend.md) _(To be generated)_
- [Data Models - Backend](./data-models-backend.md) _(To be generated)_

### Development Guides
- [Development Guide - Backend](./development-guide-backend.md) _(To be generated)_
- [Development Guide - Frontend](./development-guide-frontend.md) _(To be generated)_
- [Development Guide - Web](./development-guide-web.md) _(To be generated)_

---

## Existing Documentation

### Project Documentation
- [Epic Roadmap](./epic-roadmap.md) - Complete epic breakdown (89 epics across 4 phases)
- [Main README](../townin-platform/README.md) - Project introduction
- [API Integration Complete](../townin-platform/API_INTEGRATION_COMPLETE.md) - Backend API status

### Epic Specifications (20+ files)
Located in `docs/epics/`:
- `epic-001-admin-dashboard-foundation.md` - ✅ Complete
- `epic-002-user-management-system.md` - ✅ Complete
- `epic-003-flyer-statistics-dashboard.md` - ✅ Complete
- `epic-004-region-management-system.md` - ✅ Complete
- `epic-005-platform-activity-monitoring.md` - ✅ Complete
- `core-001-authentication-authorization-system.md` - 🚧 Planned (P0)
- `usr-001-user-onboarding.md` - 🚧 Planned (P0)
- `usr-003-safety-map-cctv-lighting.md` - 🚧 Planned (P0)
- ...and 12+ more planned epics

### Implementation Reports (5 files)
Located in `docs/implementation-reports/`:
- `admin-dashboard-summary.md` - Admin dashboard overview
- `epic-001-implementation-report.md` - ADM-001 details
- `epic-002-implementation-report.md` - ADM-002 details
- `epic-003-implementation-report.md` - ADM-003 details
- `epic-004-implementation-report.md` - ADM-004 details
- `epic-005-implementation-report.md` - ADM-005 details

### Product Planning
- [Product Requirements Document](../prd.md) - Complete PRD with vision, features, phases
- [PRD v01](../prd01.md) - Earlier PRD version

---

## Technology Stack

### Backend API Stack
| Category | Technology | Version |
|----------|------------|---------|
| Framework | NestJS | 10.3+ |
| Language | TypeScript | 5.3 |
| Database | PostgreSQL + TypeORM | - |
| Graph DB | Neo4j | 5.16+ |
| Cache/Queue | Redis + Bull | 4.6+ |
| AI/ML | Anthropic Claude SDK | 0.20+ |
| AI/ML | Google Cloud Vision | 4.2+ |
| AI/ML | LangChain | 0.1+ |
| Auth | Passport (JWT + Local) | - |
| API Docs | Swagger/OpenAPI | 7.1+ |
| Testing | Jest | 29.7+ |

### Mobile App Stack
| Category | Technology | Version |
|----------|------------|---------|
| Framework | Flutter | 3.2+ |
| Language | Dart | 3.2+ |
| State | flutter_bloc + equatable | 8.1+ |
| Network | Dio + Retrofit | 5.4+ / 4.0+ |
| Maps | Google Maps Flutter | 2.5+ |
| Storage | SQLite + Secure Storage | 2.3+ / 9.0+ |
| Push | Firebase Messaging | 14.7+ |
| Routing | go_router | 13.0+ |
| Testing | bloc_test + mockito | 9.1+ / 5.4+ |

### Web App Stack
| Category | Technology |
|----------|------------|
| Framework | React |
| Language | TypeScript |
| Build | Vite |
| Linting | ESLint |

---

## Getting Started

### Backend Quick Start
```bash
cd townin-platform/backend
npm install
cp .env.example .env
# Configure .env with database credentials
npm run start:dev
# API: http://localhost:3000
# Swagger Docs: http://localhost:3000/api
```

### Mobile Quick Start
```bash
cd townin-platform/frontend
flutter pub get
flutter run
# Select device/emulator
```

### Web Quick Start
```bash
cd townin-platform/web
npm install
npm run dev
# Dev server: http://localhost:5173
```

---

## Development Phases

### ✅ Phase 0: Admin Dashboard (COMPLETE)
- 5/5 epics complete
- Backend modules: auth, users, regions, merchants, flyers, security-guards, admin
- Mobile: Role-based dashboard routing

### 🚧 Phase 1: Traffic Acquisition (IN PLANNING)
- 24 epics planned
- Focus: Public data safety maps, digital flyers, merchant signboard
- Priority epics: CORE-001 (Auth), CORE-002 (Geospatial), CORE-003 (Public Data)

### 📋 Phase 2: Lock-in & Data Collection (PLANNED)
- 18 epics planned
- Focus: IoT sensors, AI flyer scanner, smart pickup, municipality dashboard

### 📋 Phase 3: Monetization (PLANNED)
- 26 epics planned
- Focus: GraphRAG engine, insurance module, FP co-pilot

### 📋 Phase 4: Global Expansion (PLANNED)
- 11 epics planned
- Focus: Multi-language, Vietnam/Japan markets

---

## For BMM Architecture Workflow

When running the BMM Architecture workflow, use these documents as input:

1. **Primary Context**: [Project Overview](./project-overview.md)
2. **Code Structure**: [Source Tree Analysis](./source-tree-analysis.md)
3. **Product Vision**: [PRD](../prd.md)
4. **Epic Details**: [Epic Roadmap](./epic-roadmap.md)

**Recommended Architecture Workflow Inputs:**
- Existing codebase: `townin-platform/backend/src/` (NestJS modules)
- Planned features: See Epic Roadmap Phase 1 (24 epics)
- Integration points: Backend ↔ Mobile (REST API), Backend ↔ External Services (PostgreSQL, Neo4j, Redis)

---

## Key Architectural Decisions Needed

For the upcoming Architecture workflow, focus on:

1. **Geospatial Infrastructure** (CORE-002)
   - PostGIS setup for location data
   - Grid Cell hierarchy implementation
   - 3-hub location model

2. **Public Data Integration** (CORE-003)
   - Seoul Open Data API integration strategy
   - Data refresh & caching strategy
   - Real-time vs batch processing

3. **AI/ML Pipeline** (Future)
   - LangChain orchestration architecture
   - Claude API integration patterns
   - Vision AI for flyer scanning (MRC-006)

4. **GraphRAG Engine** (Phase 3)
   - Neo4j schema design
   - Entity extraction pipeline
   - Hierarchical clustering approach

5. **Multi-tenant Data Isolation**
   - Grid Cell-based data partitioning
   - User → Region → Grid Cell relationships
   - RBAC enforcement at data layer

---

## Project Contact & Ownership

**Project:** Townin (타운인)
**Team:** Townin Development Team
**Documentation Maintained By:** BMad Method workflows
**Last Updated:** 2025-11-30

---

**💡 Tip for AI Agents:** This index provides comprehensive project context. For detailed implementation, refer to the source code in `townin-platform/backend/src/` and `townin-platform/frontend/lib/`.
