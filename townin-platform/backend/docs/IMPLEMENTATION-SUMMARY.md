# Townin Platform Backend - 구현 요약

**작성일**: 2025-12-01
**프로젝트**: Townin Platform Backend API
**프레임워크**: NestJS + TypeScript
**상태**: MVP 준비 완료

---

## 📋 목차

1. [개요](#개요)
2. [완료된 Epic 목록](#완료된-epic-목록)
3. [기술 스택](#기술-스택)
4. [데이터베이스 스키마](#데이터베이스-스키마)
5. [API 엔드포인트 요약](#api-엔드포인트-요약)
6. [실행 방법](#실행-방법)
7. [다음 단계](#다음-단계)

---

## 개요

Townin Platform Backend는 **하이퍼로컬 Life OS & Insurance GraphRAG 플랫폼**의 백엔드 API입니다.

### 핵심 가치

- **프라이버시 우선**: 정확한 주소 대신 H3 그리드 셀 사용
- **3-Hub 시스템**: 거주지, 직장, 가족집 3곳으로 제한
- **하이브리드 데이터 전략**: 공공 데이터(트래픽 유도) + 민간 데이터(수익화) + IoT 데이터(Lock-in)

### 현재 구현 단계

**Phase 1 - Traffic Acquisition**: 공공 데이터 제공 및 디지털 전단지 기능

---

## 완료된 Epic 목록

### ✅ CORE-001: Authentication & Authorization System

**구현 기능**:
- Email/Password 회원가입 및 로그인
- JWT 기반 인증 (Access Token + Refresh Token)
- Refresh Token Rotation (보안 강화)
- Redis 기반 Token Blacklist (로그아웃 시 토큰 무효화)
- Social Login (Kakao, Naver, Google OAuth 2.0)
- Role-Based Access Control (USER, MERCHANT, ADMIN, SECURITY_GUARD)
- Rate Limiting (Redis 기반 요청 제한)
- Password Reset (Forgot Password + Reset Password API)

**주요 파일**:
- `src/modules/auth/` - 인증 서비스 및 컨트롤러
- `src/modules/redis/` - Redis 모듈 (Token Blacklist)
- `src/common/guards/rate-limit.guard.ts` - Rate Limiting Guard
- `src/modules/auth/strategies/` - Passport 전략 (JWT, Kakao, Naver, Google)

**엔드포인트**:
- `POST /api/auth/register` - 회원가입
- `POST /api/auth/login` - 로그인
- `POST /api/auth/refresh` - 토큰 갱신
- `POST /api/auth/logout` - 로그아웃
- `GET /api/auth/me` - 프로필 조회
- `POST /api/auth/forgot-password` - 비밀번호 재설정 요청
- `POST /api/auth/reset-password` - 비밀번호 재설정
- `GET /api/auth/kakao`, `GET /api/auth/naver`, `GET /api/auth/google` - 소셜 로그인

---

### ✅ CORE-002: Geospatial Data Infrastructure

**구현 기능**:
- PostgreSQL + PostGIS 공간 데이터베이스
- H3 Hexagonal Grid System (Resolution 9 = 반경 약 500m)
- 행정구역 계층 구조 (시/도 → 시/군/구 → 읍/면/동)
- 사용자 위치 3-Hub 시스템 (거주지, 직장, 가족집)
- 카카오 로컬 API 지오코딩 서비스
- GiST 공간 인덱스 (빠른 공간 쿼리)

**주요 Entity**:
- `GridCell` - H3 셀 정보 (h3Index, location POINT, boundary POLYGON)
- `Region` - 행정구역 (self-referencing hierarchy)
- `UserLocation` - 사용자 위치 (3-Hub system)

**주요 서비스**:
- `GridCellService` - H3 그리드 관리
  - `latLngToCell()` - 좌표 → H3 셀 변환
  - `getNeighborCells()` - 주변 셀 조회
  - `getOrCreateCell()` - 셀 생성 또는 조회
  - `seedCellsForRegion()` - 지역 셀 일괄 생성
- `GeocodingService` - 주소 ↔ 좌표 변환 (Kakao API)

**마이그레이션**:
- `1701000000000-EnablePostGIS.ts` - PostGIS 확장 활성화
- `1701000100000-AddSpatialIndexes.ts` - GiST 공간 인덱스 생성

---

### ✅ CORE-003: Public Data Integration

**구현 기능**:
- 공공 데이터 통합 모듈 (PublicDataModule)
- 공공 데이터 API 연동 준비 (향후 확장)

**목표 데이터**:
- 안전 지도 (CCTV, 범죄율, 교통사고)
- 주차 정보
- 재난 정보
- 지역 편의시설

---

### ✅ CORE-004: Real-time Notification System

**구현 기능**:
- FCM (Firebase Cloud Messaging) 준비
- APNS (Apple Push Notification Service) 준비
- 디바이스 토큰 관리 (사용자당 최대 5개)
- 알림 발송 로그 및 추적
- 알림 환경설정 (카테고리별 ON/OFF, 야간 알림 차단)
- 알림 히스토리 및 읽음 처리

**주요 Entity**:
- `DeviceToken` - FCM/APNS 토큰 관리
- `NotificationLog` - 알림 발송 이력
- `NotificationPreference` - 사용자 알림 설정
- `NotificationTemplate` - 알림 템플릿

**엔드포인트**:
- `POST /api/notifications/device-tokens` - 디바이스 토큰 등록
- `GET /api/notifications/history` - 알림 히스토리
- `GET /api/notifications/unread-count` - 읽지 않은 알림 개수
- `PATCH /api/notifications/:id/read` - 알림 읽음 처리
- `GET /api/notifications/preferences` - 알림 설정 조회
- `PATCH /api/notifications/preferences` - 알림 설정 수정

---

### ✅ CORE-005: File Upload & CDN

**구현 기능**:
- AWS S3 파일 업로드
- CloudFront CDN 통합
- 이미지 리사이징 (Sharp)
- Multipart 파일 업로드
- Presigned URL 생성

**엔드포인트**:
- `POST /api/files/upload` - 파일 업로드
- `GET /api/files/:key` - 파일 다운로드
- `DELETE /api/files/:key` - 파일 삭제

---

### ✅ CORE-006: Logging & Monitoring

**구현 기능**:
- Analytics Event Tracking (사용자 행동 추적)
- DAU/MAU 측정
- Retention Rate 계산 (D1, D7, D30)
- Health Check API
- Winston Logger 준비 (프로덕션용)

**주요 Entity**:
- `AnalyticsEvent` - 이벤트 로그 (event_type, metadata JSONB)
- `AnalyticsStats` - 일일 통계 집계

**엔드포인트**:
- `POST /api/analytics/events` - 이벤트 추적
- `GET /api/analytics/dau-mau` - DAU/MAU 통계 (Admin)
- `GET /api/analytics/events/counts` - 이벤트 타입별 집계
- `GET /health` - 헬스 체크
- `GET /health/database` - DB 연결 상태

---

### ✅ USR-007: Digital Flyer Viewer

**구현 기능**:
- 위치 기반 전단지 조회 (H3 그리드)
- 키워드 검색
- 카테고리 필터링 (음식, 패션, 뷰티 등)
- 인기 전단지 (조회수/클릭수 기준)
- 전단지 조회/클릭 추적 (Analytics 통합)

**주요 Entity**:
- `Flyer` - 전단지 정보
- `FlyerProduct` - 전단지 상품

**엔드포인트**:
- `GET /api/flyers/location/:h3Index` - 위치 기반 전단지 조회
- `GET /api/flyers/search` - 전단지 검색
- `GET /api/flyers/category/:category` - 카테고리별 전단지
- `GET /api/flyers/featured` - 인기 전단지
- `POST /api/flyers/:id/view` - 조회 추적
- `POST /api/flyers/:id/click` - 클릭 추적

---

## 기술 스택

### Backend Framework
- **NestJS** 10.3.0 - TypeScript 기반 Node.js 프레임워크
- **TypeORM** 0.3.19 - ORM
- **Express** - HTTP 서버

### Databases
- **PostgreSQL** 15 + **PostGIS** 3.4 - 관계형 DB + 공간 데이터
- **Redis** 4.6 - 캐싱 및 Token Blacklist
- **Neo4j** 5.16 - GraphRAG (향후 구현)

### Authentication & Security
- **Passport.js** - 인증 전략
- **JWT** - Access Token + Refresh Token
- **bcrypt** - 비밀번호 해싱
- **Rate Limiting** - Redis 기반 요청 제한

### Cloud Services
- **AWS S3** - 파일 스토리지
- **CloudFront** - CDN
- **Firebase Cloud Messaging** - Push Notification (준비)

### Geospatial
- **H3** (Uber) - Hexagonal Grid System
- **PostGIS** - PostgreSQL 공간 확장
- **Kakao Local API** - 지오코딩

### AI/ML (향후)
- **LangChain** - GraphRAG 파이프라인
- **Anthropic Claude** / **OpenAI GPT-4** - LLM
- **Google Cloud Vision** - OCR 및 이미지 분석

---

## 데이터베이스 스키마

### 주요 테이블

| 테이블 | 설명 | 주요 컬럼 |
|--------|------|----------|
| **users** | 사용자 정보 | email, password_hash, role, age_range, household_type |
| **grid_cells** | H3 셀 정보 | h3_index (PK), location (POINT), boundary (POLYGON) |
| **regions** | 행정구역 | code, level, parent_id, boundary (POLYGON) |
| **user_locations** | 사용자 3-Hub 위치 | user_id, hub_type (residence/workplace/family_home), h3_index |
| **flyers** | 전단지 | title, category, status, target_radius, expires_at |
| **merchants** | 상인 정보 | business_name, grid_cell, business_number |
| **device_tokens** | 푸시 알림 토큰 | user_id, token, platform (ios/android) |
| **notification_logs** | 알림 발송 이력 | user_id, type, status, sent_at |
| **analytics_events** | 사용자 행동 로그 | user_id, event_type, metadata (JSONB) |
| **analytics_stats** | 일일 통계 | date, dau, total_flyer_views, d1_retention_rate |

### 공간 인덱스 (GiST)
- `grid_cells.location`
- `grid_cells.boundary`
- `regions.boundary`
- `regions.center_point`
- `user_locations.center_point`
- `flyers.location`

---

## API 엔드포인트 요약

### Authentication (`/api/auth`)
- `POST /register` - 회원가입
- `POST /login` - 로그인
- `POST /refresh` - 토큰 갱신
- `POST /logout` - 로그아웃
- `GET /me` - 내 프로필
- `POST /forgot-password` - 비밀번호 재설정 요청
- `POST /reset-password` - 비밀번호 재설정
- Social Login: `/kakao`, `/naver`, `/google`

### Flyers (`/api/flyers`)
- `GET /location/:h3Index` - 위치 기반 전단지
- `GET /search?q=keyword` - 검색
- `GET /category/:category` - 카테고리별
- `GET /featured` - 인기 전단지
- `POST /:id/view` - 조회 추적
- `POST /:id/click` - 클릭 추적
- `POST /` - 전단지 생성 (Merchant)
- `PUT /:id` - 전단지 수정 (Merchant)

### Notifications (`/api/notifications`)
- `POST /device-tokens` - 디바이스 토큰 등록
- `GET /history` - 알림 히스토리
- `GET /unread-count` - 읽지 않은 알림
- `PATCH /:id/read` - 읽음 처리
- `GET /preferences` - 설정 조회
- `PATCH /preferences` - 설정 수정

### Analytics (`/api/analytics`)
- `POST /events` - 이벤트 추적
- `GET /dau-mau` - DAU/MAU 통계 (Admin)
- `GET /events/counts` - 이벤트 집계

### Files (`/api/files`)
- `POST /upload` - 파일 업로드
- `GET /:key` - 파일 조회
- `DELETE /:key` - 파일 삭제

### Health (`/health`)
- `GET /` - 서버 상태
- `GET /database` - DB 연결 상태

---

## 실행 방법

### 1. 환경 설정

**.env 파일 확인**:
```bash
# Database
DB_HOST=localhost
DB_PORT=15432
DB_DATABASE=townin-db

# Redis
REDIS_HOST=localhost
REDIS_PORT=16379

# JWT
JWT_SECRET=your_secret_key
JWT_REFRESH_SECRET=your_refresh_secret
```

### 2. Docker 컨테이너 실행

```bash
docker-compose up -d
```

실행되는 서비스:
- PostgreSQL (포트 15432)
- Redis (포트 16379)
- Neo4j (포트 7474, 7687)

### 3. 의존성 설치

```bash
npm install
```

### 4. 데이터베이스 마이그레이션

```bash
npm run migration:run
```

실행되는 마이그레이션:
1. `EnablePostGIS` - PostGIS 확장 활성화
2. `AddSpatialIndexes` - 공간 인덱스 생성
3. 기타 엔티티 테이블 생성

### 5. 서버 실행

개발 모드:
```bash
npm run start:dev
```

프로덕션 모드:
```bash
npm run build
npm run start:prod
```

### 6. API 테스트

Swagger UI:
```
http://localhost:3000/api/docs
```

Health Check:
```bash
curl http://localhost:3000/health
```

---

## 다음 단계

### Phase 1 완료를 위한 남은 작업

#### 1. Docker 컨테이너 실행 및 마이그레이션 테스트
- Docker Desktop 실행
- `docker-compose up -d` 실행
- `npm run migration:run` 실행
- Health Check 확인

#### 2. 프로덕션 설정 구성
- **Firebase 설정**: FCM 프로젝트 생성 및 서비스 계정 키 다운로드
- **APNS 설정**: Apple Developer Push Notification 인증서 발급
- **OAuth 설정**: Kakao, Naver, Google OAuth 클라이언트 ID/Secret 발급
- **AWS 설정**: S3 버킷 생성 및 CloudFront 배포

#### 3. Email Service 통합
- SendGrid 또는 AWS SES 설정
- Password Reset 이메일 발송 구현
- 환영 이메일 템플릿 작성

#### 4. H3 k-ring 쿼리 최적화
- 현재 위치 기반 전단지 조회를 정확한 H3 k-ring 쿼리로 개선
- PostGIS ST_DWithin 쿼리와 성능 비교

#### 5. 테스트 데이터 생성
- 서울시 주요 지역 GridCell 시드 데이터
- 테스트용 전단지 데이터 (이미지 포함)
- 샘플 사용자 및 상인 계정

### Phase 2: Lock-in & Data Collection

#### 1. IoT Sensor Integration
- 가족 돌봄 센서 (문 개폐, 동작 감지)
- InfluxDB 시계열 데이터베이스 통합
- 센서 데이터 수집 API

#### 2. AI Flyer Scanner
- Google Cloud Vision OCR 통합
- 전단지 이미지 → 구조화 데이터 자동 변환
- 상품 정보 추출 및 데이터베이스 저장

#### 3. Smart Pickup Commerce
- 전단지 상품 예약/픽업 기능
- QR 코드 생성 및 인증

### Phase 3: Monetization (GraphRAG)

#### 1. Insurance GraphRAG Engine
- Neo4j 그래프 데이터베이스 스키마 설계
- LangChain + Microsoft GraphRAG 통합
- 엔티티 및 관계 추출 (User → Location → Risk → Insurance)

#### 2. FP Co-Pilot System
- 보험 상담 AI 어시스턴트
- 규제 준수 가이드라인 체크
- 상담 대화 저장 및 분석

#### 3. Targeted Advertising
- 사용자 행동 기반 추천 알고리즘
- 지역 상권 분석 대시보드
- 광고 성과 추적

---

## 아키텍처 다이어그램

### 전체 시스템 아키텍처

```
┌─────────────────────────────────────────────────────────┐
│                    Flutter Mobile App                    │
│  (iOS / Android)                                         │
└────────────────────┬────────────────────────────────────┘
                     │ REST API (JWT)
                     │
┌────────────────────▼────────────────────────────────────┐
│              NestJS Backend API (Port 3000)              │
│  - Authentication (Passport.js + JWT)                    │
│  - Rate Limiting (Redis)                                 │
│  - Geospatial Services (H3 + PostGIS)                    │
│  - File Upload (S3 + CloudFront)                         │
│  - Push Notifications (FCM/APNS)                         │
│  - Analytics Tracking                                    │
└───┬────────┬────────┬────────┬────────┬─────────────────┘
    │        │        │        │        │
    │        │        │        │        │
┌───▼──┐  ┌──▼──┐  ┌─▼───┐  ┌─▼────┐  ┌▼──────────┐
│ PG   │  │Redis│  │ S3  │  │ FCM  │  │ Kakao API │
│+Post │  │     │  │     │  │ APNS │  │           │
│ GIS  │  │     │  │     │  │      │  │           │
└──────┘  └─────┘  └─────┘  └──────┘  └───────────┘
   │
   │ (Future: GraphRAG)
   │
┌──▼─────┐
│ Neo4j  │
│ Graph  │
│   DB   │
└────────┘
```

### 데이터 흐름 (전단지 조회 예시)

```
User (Flutter App)
  │
  │ 1. GET /api/flyers/location/8a2a1005892ffff
  │    Authorization: Bearer {JWT}
  │
  ▼
NestJS API
  │
  ├─ 2. JWT Validation (Passport)
  │
  ├─ 3. Rate Limit Check (Redis)
  │
  ├─ 4. H3 k-ring Query (GridCellService)
  │
  ├─ 5. Flyer Query (TypeORM + PostGIS)
  │     SELECT * FROM flyers
  │     WHERE status = 'approved'
  │       AND h3_index IN (...)
  │       AND expires_at > NOW()
  │
  ├─ 6. Track View Event (AnalyticsService)
  │     INSERT INTO analytics_events (event_type = 'flyer_view')
  │
  └─ 7. Return Flyer List
        {
          data: [...],
          total: 42
        }
```

---

## 팀 정보

- **개발**: Claude Code (Anthropic)
- **프로젝트 관리**: BMAD Method (v6.0.0-alpha.12)
- **배포 환경**: AWS / Google Cloud (TBD)

---

## 라이선스

Private / Proprietary

---

**문서 작성**: 2025-12-01
**최종 업데이트**: 2025-12-01
**버전**: 1.0.0 (MVP)
