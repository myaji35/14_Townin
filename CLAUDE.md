# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Townin (타운인)** is a hyper-local Life OS & Insurance GraphRAG Platform for the Korean market. It combines public safety data, digital flyers, and IoT sensors to provide contextualized insurance, care, and lifestyle services. The platform operates on a "Privacy-First" principle using H3 grid cells instead of exact addresses.

## Repository Structure

This is a monorepo containing multiple applications:

```
├── townin-platform/          # Main platform implementation
│   ├── backend/             # NestJS API server
│   ├── frontend/            # Flutter mobile app (legacy)
│   ├── townin_app/          # Flutter mobile app (current)
│   └── web/                 # React web dashboard (Vite)
├── validation-mvp/          # Technical validation experiments
│   ├── flyer-ai/           # Vision + OCR + LLM pipeline
│   ├── graphrag/           # Neo4j + LangChain inference
│   └── iot-sensors/        # Anomaly detection
├── pm4py-action-items/      # Next.js process mining dashboard
└── .bmad/                   # BMAD Method framework for planning
```

## Development Commands

### Backend (NestJS)
```bash
cd townin-platform/backend
npm install
npm run start:dev          # Development server (http://localhost:3000)
npm run build              # Production build
npm run lint               # ESLint with auto-fix
npm run test               # Unit tests
npm run test:watch         # Watch mode
npm run test:e2e           # E2E tests
npm run migration:run      # Run TypeORM migrations
npm run seed               # Seed all data
npm run seed:regions       # Seed region data only
```

### Flutter App (townin_app)
```bash
cd townin-platform/townin_app
flutter pub get
flutter pub run build_runner build --delete-conflicting-outputs  # Generate code
flutter run -d chrome      # Web development
flutter run -d ios         # iOS simulator
flutter run -d android     # Android emulator
flutter test               # Run tests
```

### React Web (Vite)
```bash
cd townin-platform/web
npm install
npm run dev                # Development server
npm run build              # Production build
npm run lint               # ESLint
```

### Database Services (Docker)
```bash
cd townin-platform
docker-compose up -d       # Start PostgreSQL, Redis, Neo4j, InfluxDB
docker-compose --profile tools up -d  # Include pgAdmin
```

Service ports:
- PostgreSQL: 15432 (PostGIS enabled)
- Redis: 16379
- Neo4j: 7474 (HTTP), 7687 (Bolt)
- InfluxDB: 8086
- pgAdmin: 5050

## Architecture

### Backend Modules
The NestJS backend follows a modular architecture in `backend/src/modules/`:
- **auth**: JWT authentication with Kakao/Naver/Google OAuth
- **users**: User management with privacy-first hashed IDs
- **grid-cells**: H3 geospatial grid management
- **regions**: Administrative region hierarchy
- **flyers**: Digital flyer CRUD and AI processing
- **merchants**: Partner business management
- **public-data**: Seoul Open Data API integration (CCTV, parking, safety)
- **maps**: Map tile and overlay services
- **notifications**: Push notification via FCM/APNS
- **analytics**: Usage metrics and insights

### Flutter App Structure
The Flutter app uses Clean Architecture + BLoC pattern:
```
lib/
├── core/           # Constants, enums, shared models
└── features/       # Feature modules (auth, dashboard, flyers, maps, etc.)
    └── {feature}/
        ├── data/          # Repository implementations, data sources
        ├── domain/        # Entities, use cases
        └── presentation/  # Screens, widgets, BLoC
```

### Key Technologies
- **Geospatial**: H3-js for hexagonal grid indexing, PostGIS for spatial queries
- **AI**: Anthropic Claude 3.5 (flyer parsing, care messages), Google Cloud Vision (OCR)
- **GraphRAG**: Neo4j knowledge graph with LangChain orchestration
- **Real-time**: WebSocket via Socket.io, Bull queue for async jobs

## BMAD Method Workflows

This project uses BMAD for AI-assisted planning. Available slash commands:
- `/po` - Product Owner agent
- `/architect` - Technical architecture
- `/dev` - Developer agent
- `/qa` - Quality assurance
- `/pm` - Project Manager
- `/analyst` - Business Analyst

## Key Concepts

### Three-Hub Model
Users register up to 3 location hubs (home, work, family_home) stored as H3 grid cells, not exact addresses.

### Privacy-First Design
- User IDs are hashed (no real names stored)
- Locations stored as 500m x 500m grid cells
- IoT sensors capture motion patterns only (no cameras/audio)

### User Roles
- **User**: General consumer
- **SecurityGuard**: Local area manager (보안관)
- **Merchant**: Business partner
- **Municipality**: City government admin
- **SuperAdmin**: Platform admin

### Revenue Model (Phase 1)
Flyer click attribution: User gets 25 points, Guard gets 5 points, Platform gets 20 points.

## Language Notes

- PRD and user-facing content: Korean
- Code, comments, technical docs: English
- Target market: South Korea (starting with 의정부시, Uijeongbu City)

## ulw! Protocol (Ultra Light Weight Orchestration)

We use the **ulw!** agentic workflow for efficient collaboration:
1.  **Gemini (The Orchestrator)**: Defines "What" to build (Architecture, PRD).
2.  **Open Code (The Builder)**: Implements "How" it works (Code, DB).
3.  **Oh My Open Code (The Fixer)**: Verifies and fixes (QA, Refactoring).

## Integrated Projects
- **FLUSH**: Zero-Data Backend Infrastructure principles are integrated into the `FlushModule`.
  - **Flush Address**: Temporary address tokenization
  - **Flush Mail**: Relay email system with kill-switch

