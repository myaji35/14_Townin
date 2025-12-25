# Epic: CORE-001 - Authentication & Authorization System

## Epic Overview

| Field | Value |
|-------|-------|
| **Epic ID** | CORE-001 |
| **Epic Title** | Authentication & Authorization System |
| **Priority** | P0 (Critical) |
| **Status** | ✅ COMPLETED |
| **Estimated Effort** | 5 days |
| **Actual Effort** | 3 days (Part of Admin Dashboard) |
| **Start Date** | 2025-01-10 |
| **End Date** | 2025-01-12 |
| **Phase** | Phase 1 - Traffic Acquisition (Core Infrastructure) |
| **Category** | CORE - Core Infrastructure |
| **Owner** | Backend Team |

## Business Value

### Problem Statement
Townin 플랫폼은 다양한 사용자 유형(일반 사용자, 상인, 보안관, 지자체 담당자, FP 전문가)을 지원해야 하며, 각 사용자 유형에 따라 접근 권한과 기능이 달라야 합니다. 안전하고 확장 가능한 인증/인가 시스템이 필요합니다.

### Business Value
- **보안**: JWT 기반 토큰 인증으로 안전한 API 접근 제어
- **확장성**: RBAC(Role-Based Access Control)로 역할별 권한 관리
- **사용자 편의성**: 소셜 로그인(카카오, 네이버, 구글) 지원으로 가입 장벽 최소화
- **규정 준수**: 세션 타임아웃, 리프레시 토큰으로 보안 정책 준수

### Target Users
- **일반 사용자 (user)**: 지역 정보 조회, 전단지 열람
- **상인 (merchant)**: 디지털 간판, 전단지 등록
- **보안관 (security_guard)**: 지역 커뮤니티 관리
- **지자체 담당자 (municipality)**: 공공 데이터 관리
- **관리자 (super_admin)**: 플랫폼 전체 관리

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| 로그인 성공률 | ≥ 99% | 총 로그인 시도 대비 성공 비율 |
| 토큰 검증 성능 | < 50ms | JWT 검증 평균 응답 시간 |
| 소셜 로그인 완료율 | ≥ 85% | 소셜 로그인 시작 대비 완료 비율 |
| 보안 이벤트 탐지 | 100% | 무효 토큰, 권한 위반 감지율 |
| 세션 타임아웃 준수 | 100% | 2시간 후 자동 로그아웃 비율 |

## Epic Scope

### In Scope
✅ **Authentication (인증)**
- 이메일/비밀번호 로그인
- JWT Access Token 발급 (2시간 만료)
- JWT Refresh Token 발급 (30일 만료)
- 토큰 갱신 (Refresh Token Rotation)
- 소셜 로그인 (카카오, 네이버, 구글)
- 로그아웃 (토큰 블랙리스트)

✅ **Authorization (인가)**
- RBAC (Role-Based Access Control)
- 5가지 역할: user, merchant, security_guard, municipality, super_admin
- Role Guard (NestJS Guard)
- Permission Decorator (@Roles)

✅ **User Management**
- 회원가입 (이메일 인증)
- 비밀번호 암호화 (bcrypt)
- 비밀번호 찾기/재설정
- 프로필 조회/수정

✅ **Security Features**
- 세션 타임아웃 (2시간)
- 토큰 블랙리스트 (Redis)
- Rate Limiting (로그인 시도 제한)
- CORS 설정

### Out of Scope
❌ 2FA (Two-Factor Authentication) - Phase 2
❌ OAuth Provider 기능 (외부 앱에 Townin 계정 제공) - Phase 3
❌ 지문/얼굴 인식 (Biometric Auth) - Phase 4
❌ SSO (Single Sign-On) for Enterprise - Phase 4

## User Stories

### Story 1.1: 이메일/비밀번호 회원가입
**As a** 신규 사용자
**I want to** 이메일과 비밀번호로 회원가입하고
**So that** Townin 서비스를 이용할 수 있다

**Acceptance Criteria:**
- [ ] 이메일 형식 검증 (RFC 5322)
- [ ] 비밀번호 강도 검증 (최소 8자, 영문+숫자+특수문자)
- [ ] 비밀번호 bcrypt 해싱 (saltRounds=10)
- [ ] 중복 이메일 확인
- [ ] 역할 선택 (user/merchant)
- [ ] 이메일 인증 링크 발송
- [ ] 회원가입 완료 후 JWT 토큰 발급

**Tasks:**
- [ ] POST /api/auth/register 엔드포인트 구현
- [ ] 이메일 발송 서비스 통합 (SendGrid/AWS SES)
- [ ] 회원가입 유효성 검증 DTO 작성
- [ ] User 엔티티 생성 (TypeORM)
- [ ] 비밀번호 해싱 유틸리티 작성

**Story Points:** 5

---

### Story 1.2: 이메일/비밀번호 로그인
**As a** 등록된 사용자
**I want to** 이메일과 비밀번호로 로그인하고
**So that** 내 계정에 접근할 수 있다

**Acceptance Criteria:**
- [ ] 이메일/비밀번호 검증
- [ ] 로그인 성공 시 Access Token (2시간) + Refresh Token (30일) 발급
- [ ] 로그인 실패 5회 시 계정 잠금 (15분)
- [ ] 로그인 이력 기록 (IP, User-Agent, 시간)
- [ ] Rate Limiting (IP당 분당 10회)

**Tasks:**
- [ ] POST /api/auth/login 엔드포인트 구현
- [ ] Passport LocalStrategy 구현
- [ ] JWT 토큰 생성 유틸리티 작성
- [ ] Rate Limiter Guard 구현
- [ ] 로그인 이력 테이블 설계

**Story Points:** 5

---

### Story 1.3: JWT 토큰 검증 및 인가
**As a** 인증된 사용자
**I want to** API 요청 시 JWT 토큰으로 자동 인증되고
**So that** 매번 로그인할 필요 없이 서비스를 이용할 수 있다

**Acceptance Criteria:**
- [ ] Authorization Header에서 Bearer Token 추출
- [ ] JWT 서명 검증
- [ ] 토큰 만료 시간 검증
- [ ] 토큰 블랙리스트 확인 (Redis)
- [ ] Request 객체에 user 정보 주입
- [ ] 역할별 접근 제어 (@Roles 데코레이터)

**Tasks:**
- [ ] Passport JwtStrategy 구현
- [ ] JwtAuthGuard 구현
- [ ] RolesGuard 구현
- [ ] @Roles 데코레이터 작성
- [ ] Redis 토큰 블랙리스트 서비스 구현

**Story Points:** 5

---

### Story 1.4: Refresh Token을 이용한 토큰 갱신
**As a** 로그인한 사용자
**I want to** Access Token 만료 시 자동으로 갱신되고
**So that** 2시간마다 로그인할 필요 없이 서비스를 이용할 수 있다

**Acceptance Criteria:**
- [ ] Refresh Token 유효성 검증
- [ ] 새로운 Access Token 발급
- [ ] Refresh Token Rotation (새 Refresh Token 발급)
- [ ] 이전 Refresh Token 블랙리스트 추가
- [ ] Refresh Token 재사용 방지

**Tasks:**
- [ ] POST /api/auth/refresh 엔드포인트 구현
- [ ] Refresh Token 검증 로직 작성
- [ ] Token Rotation 로직 구현
- [ ] 프론트엔드 Axios Interceptor 설정 가이드 작성

**Story Points:** 3

---

### Story 1.5: 로그아웃
**As a** 로그인한 사용자
**I want to** 로그아웃하고
**So that** 내 계정을 안전하게 보호할 수 있다

**Acceptance Criteria:**
- [ ] Access Token 블랙리스트 추가 (Redis, TTL=2시간)
- [ ] Refresh Token 블랙리스트 추가 (Redis, TTL=30일)
- [ ] 로그아웃 이력 기록
- [ ] 프론트엔드 로컬 스토리지 토큰 삭제 안내

**Tasks:**
- [ ] POST /api/auth/logout 엔드포인트 구현
- [ ] Redis 블랙리스트 서비스 확장
- [ ] 로그아웃 이력 로깅

**Story Points:** 2

---

### Story 1.6: 카카오 소셜 로그인
**As a** 신규/기존 사용자
**I want to** 카카오 계정으로 간편 로그인하고
**So that** 별도 회원가입 없이 빠르게 서비스를 이용할 수 있다

**Acceptance Criteria:**
- [ ] 카카오 OAuth 2.0 인증 플로우 구현
- [ ] 카카오 로그인 버튼 클릭 시 카카오 인증 페이지로 리다이렉트
- [ ] 인증 코드로 Access Token 교환
- [ ] 카카오 사용자 정보 조회 (이메일, 프로필)
- [ ] 기존 사용자: 로그인 처리
- [ ] 신규 사용자: 자동 회원가입 후 로그인
- [ ] JWT 토큰 발급

**Tasks:**
- [ ] 카카오 개발자 앱 등록
- [ ] GET /api/auth/kakao 엔드포인트 구현
- [ ] GET /api/auth/kakao/callback 엔드포인트 구현
- [ ] Passport KakaoStrategy 구현
- [ ] 소셜 로그인 사용자 매핑 로직 구현

**Story Points:** 5

---

### Story 1.7: 네이버 소셜 로그인
**As a** 신규/기존 사용자
**I want to** 네이버 계정으로 간편 로그인하고
**So that** 별도 회원가입 없이 빠르게 서비스를 이용할 수 있다

**Acceptance Criteria:**
- [ ] 네이버 OAuth 2.0 인증 플로우 구현
- [ ] 네이버 로그인 버튼 클릭 시 네이버 인증 페이지로 리다이렉트
- [ ] 인증 코드로 Access Token 교환
- [ ] 네이버 사용자 정보 조회 (이메일, 프로필)
- [ ] 기존 사용자: 로그인 처리
- [ ] 신규 사용자: 자동 회원가입 후 로그인
- [ ] JWT 토큰 발급

**Tasks:**
- [ ] 네이버 개발자 앱 등록
- [ ] GET /api/auth/naver 엔드포인트 구현
- [ ] GET /api/auth/naver/callback 엔드포인트 구현
- [ ] Passport NaverStrategy 구현

**Story Points:** 5

---

### Story 1.8: 구글 소셜 로그인
**As a** 신규/기존 사용자
**I want to** 구글 계정으로 간편 로그인하고
**So that** 별도 회원가입 없이 빠르게 서비스를 이용할 수 있다

**Acceptance Criteria:**
- [ ] 구글 OAuth 2.0 인증 플로우 구현
- [ ] 구글 로그인 버튼 클릭 시 구글 인증 페이지로 리다이렉트
- [ ] 인증 코드로 Access Token 교환
- [ ] 구글 사용자 정보 조회 (이메일, 프로필)
- [ ] 기존 사용자: 로그인 처리
- [ ] 신규 사용자: 자동 회원가입 후 로그인
- [ ] JWT 토큰 발급

**Tasks:**
- [ ] 구글 개발자 콘솔 앱 등록
- [ ] GET /api/auth/google 엔드포인트 구현
- [ ] GET /api/auth/google/callback 엔드포인트 구현
- [ ] Passport GoogleStrategy 구현

**Story Points:** 5

---

### Story 1.9: 비밀번호 찾기/재설정
**As a** 비밀번호를 잊은 사용자
**I want to** 이메일로 재설정 링크를 받고
**So that** 새 비밀번호로 다시 로그인할 수 있다

**Acceptance Criteria:**
- [ ] 이메일 입력 시 재설정 링크 발송 (1시간 유효)
- [ ] 링크에 임시 토큰 포함 (JWT 또는 UUID)
- [ ] 토큰 검증 후 새 비밀번호 설정
- [ ] 비밀번호 재설정 이력 기록
- [ ] 재설정 완료 후 이메일 알림

**Tasks:**
- [ ] POST /api/auth/forgot-password 엔드포인트 구현
- [ ] POST /api/auth/reset-password 엔드포인트 구현
- [ ] 임시 토큰 생성 및 Redis 저장 (TTL=1시간)
- [ ] 비밀번호 재설정 이메일 템플릿 작성

**Story Points:** 3

---

### Story 1.10: 역할 기반 접근 제어 (RBAC)
**As a** 시스템 관리자
**I want to** 사용자 역할별로 API 접근 권한을 제어하고
**So that** 권한 없는 사용자가 민감한 기능에 접근할 수 없도록 한다

**Acceptance Criteria:**
- [ ] 5가지 역할 정의: user, merchant, security_guard, municipality, super_admin
- [ ] @Roles 데코레이터로 엔드포인트별 역할 제한
- [ ] RolesGuard에서 역할 검증
- [ ] 권한 없는 접근 시 403 Forbidden 응답
- [ ] 감사 로그 기록 (누가, 언제, 어떤 리소스에 접근 시도)

**Tasks:**
- [ ] UserRole enum 정의
- [ ] @Roles 데코레이터 구현
- [ ] RolesGuard 구현
- [ ] 감사 로그 미들웨어 구현
- [ ] 역할별 접근 권한 매트릭스 문서화

**Story Points:** 3

## Technical Specifications

### Technology Stack
- **Framework**: NestJS 10.x
- **Authentication**: Passport.js (Local, JWT, Kakao, Naver, Google strategies)
- **Token**: jsonwebtoken (JWT)
- **Password Hashing**: bcrypt
- **Cache/Session**: Redis 7.x
- **Email**: SendGrid or AWS SES
- **Database**: PostgreSQL 15.x (User, AuthLog 테이블)

### Architecture Decisions

#### 1. JWT vs Session-Based Auth
**Decision**: JWT (Access + Refresh Token)

**Rationale**:
- **확장성**: Stateless 인증으로 수평 확장 용이
- **모바일 앱 지원**: Flutter 앱에서 토큰 관리 간편
- **마이크로서비스 준비**: Phase 3에서 GraphRAG 엔진 분리 시 유리

**Trade-offs**:
- 토큰 취소가 어려움 → Redis 블랙리스트로 해결
- 토큰 크기 증가 → Payload 최소화 (userId, role만 포함)

#### 2. Refresh Token Rotation
**Decision**: 리프레시 시 새 Refresh Token 발급

**Rationale**:
- 보안 강화: Refresh Token 탈취 시 피해 최소화
- 재사용 방지: 이전 Refresh Token 블랙리스트 추가

#### 3. 소셜 로그인 Provider
**Decision**: 카카오 > 네이버 > 구글 우선순위

**Rationale**:
- **카카오**: 한국 점유율 1위 (80%+), 전단지 알림톡 연동 가능
- **네이버**: 중장년층 사용자 확보
- **구글**: 해외 확장 대비 (Phase 4)

### Database Schema

#### User Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255), -- bcrypt hash, NULL for social login
  role VARCHAR(50) NOT NULL CHECK (role IN ('user', 'merchant', 'security_guard', 'municipality', 'super_admin')),
  name VARCHAR(100),
  phone VARCHAR(20),
  profile_image_url TEXT,

  -- Social Login
  kakao_id VARCHAR(100) UNIQUE,
  naver_id VARCHAR(100) UNIQUE,
  google_id VARCHAR(100) UNIQUE,

  -- Status
  is_email_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  failed_login_attempts INT DEFAULT 0,
  locked_until TIMESTAMP,

  -- Metadata
  last_login_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_kakao_id ON users(kakao_id) WHERE kakao_id IS NOT NULL;
CREATE INDEX idx_users_naver_id ON users(naver_id) WHERE naver_id IS NOT NULL;
CREATE INDEX idx_users_google_id ON users(google_id) WHERE google_id IS NOT NULL;
```

#### AuthLog Table (로그인 이력)
```sql
CREATE TABLE auth_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL, -- 'login', 'logout', 'token_refresh', 'password_reset'
  ip_address INET,
  user_agent TEXT,
  success BOOLEAN NOT NULL,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_auth_logs_user_id ON auth_logs(user_id);
CREATE INDEX idx_auth_logs_created_at ON auth_logs(created_at);
CREATE INDEX idx_auth_logs_action ON auth_logs(action);
```

#### PasswordResetToken Table
```sql
CREATE TABLE password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
```

### API Endpoints

#### Authentication Endpoints

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| POST | `/api/auth/register` | 이메일 회원가입 | No | - |
| POST | `/api/auth/login` | 이메일 로그인 | No | - |
| POST | `/api/auth/logout` | 로그아웃 | Yes | All |
| POST | `/api/auth/refresh` | 토큰 갱신 | Yes (Refresh Token) | All |
| GET | `/api/auth/me` | 내 정보 조회 | Yes | All |
| PATCH | `/api/auth/me` | 내 정보 수정 | Yes | All |
| POST | `/api/auth/forgot-password` | 비밀번호 찾기 | No | - |
| POST | `/api/auth/reset-password` | 비밀번호 재설정 | No | - |

#### Social Login Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/auth/kakao` | 카카오 로그인 시작 |
| GET | `/api/auth/kakao/callback` | 카카오 콜백 |
| GET | `/api/auth/naver` | 네이버 로그인 시작 |
| GET | `/api/auth/naver/callback` | 네이버 콜백 |
| GET | `/api/auth/google` | 구글 로그인 시작 |
| GET | `/api/auth/google/callback` | 구글 콜백 |

### Request/Response Examples

#### POST /api/auth/register
**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "홍길동",
  "role": "user"
}
```

**Response (201 Created):**
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "name": "홍길동",
    "role": "user",
    "isEmailVerified": false
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 7200
}
```

#### POST /api/auth/login
**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (200 OK):**
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "name": "홍길동",
    "role": "user"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 7200
}
```

#### POST /api/auth/refresh
**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200 OK):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 7200
}
```

### Environment Variables
```env
# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRATION=2h
JWT_REFRESH_SECRET=your_refresh_secret_key
JWT_REFRESH_EXPIRATION=30d

# Kakao OAuth
KAKAO_CLIENT_ID=your_kakao_client_id
KAKAO_CLIENT_SECRET=your_kakao_client_secret
KAKAO_CALLBACK_URL=http://localhost:3000/api/auth/kakao/callback

# Naver OAuth
NAVER_CLIENT_ID=your_naver_client_id
NAVER_CLIENT_SECRET=your_naver_client_secret
NAVER_CALLBACK_URL=http://localhost:3000/api/auth/naver/callback

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

# Email Service
EMAIL_SERVICE=sendgrid # or 'ses'
SENDGRID_API_KEY=your_sendgrid_api_key
FROM_EMAIL=noreply@townin.kr

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
```

## Testing Strategy

### Unit Tests
- [ ] AuthService 단위 테스트 (회원가입, 로그인, 토큰 생성)
- [ ] JwtStrategy 토큰 검증 테스트
- [ ] RolesGuard 역할 검증 테스트
- [ ] 비밀번호 해싱/검증 유틸리티 테스트

### Integration Tests
- [ ] POST /api/auth/register 엔드포인트 테스트
- [ ] POST /api/auth/login 성공/실패 시나리오
- [ ] POST /api/auth/refresh 토큰 갱신 테스트
- [ ] 소셜 로그인 플로우 테스트 (Mocked OAuth Providers)
- [ ] Rate Limiting 테스트

### E2E Tests
- [ ] 전체 회원가입 → 로그인 → API 호출 → 로그아웃 플로우
- [ ] 소셜 로그인 플로우 (카카오, 네이버, 구글)
- [ ] 토큰 만료 → 자동 갱신 시나리오
- [ ] 권한 없는 사용자 접근 차단 테스트

### Security Tests
- [ ] SQL Injection 방지 테스트
- [ ] XSS 방지 테스트
- [ ] CSRF 방지 테스트 (CSRF Token)
- [ ] Rate Limiting 우회 테스트
- [ ] 토큰 탈취 시나리오 테스트

## Deployment Checklist

### Pre-Deployment
- [ ] JWT_SECRET, REFRESH_SECRET 프로덕션 키로 변경
- [ ] 소셜 로그인 콜백 URL 프로덕션 도메인으로 변경
- [ ] CORS 허용 도메인 설정
- [ ] Rate Limiting 설정 확인
- [ ] Redis 연결 테스트
- [ ] 이메일 발송 서비스 테스트

### Deployment
- [ ] Database Migration 실행
- [ ] 환경 변수 설정 (AWS Secrets Manager / Kubernetes Secrets)
- [ ] 로드밸런서 HTTPS 인증서 설정
- [ ] Health Check 엔드포인트 설정 (GET /health)

### Post-Deployment
- [ ] 로그인/회원가입 기능 테스트 (프로덕션 환경)
- [ ] 소셜 로그인 플로우 테스트
- [ ] CloudWatch/Sentry 에러 모니터링 설정
- [ ] 로그인 성공률 모니터링 대시보드 생성

## Risks & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| JWT Secret 유출 | High | Low | AWS Secrets Manager 사용, 주기적 키 로테이션 |
| 소셜 로그인 OAuth 변경 | Medium | Medium | Passport Strategy 추상화, 버전 모니터링 |
| Redis 장애 시 토큰 검증 불가 | High | Low | Redis Cluster 구성, Fallback to DB 구현 |
| Rate Limiting 우회 (IP 변경) | Medium | Medium | User-Agent, Fingerprinting 추가 검증 |
| 이메일 발송 실패 | Medium | Low | SendGrid + AWS SES Fallback 구성 |

## Dependencies

### Depends On (Prerequisites)
- None (First Epic)

### Blocks (Dependent Epics)
- **CORE-002**: Geospatial Data Infrastructure (사용자 위치 기반 서비스)
- **USR-001**: User Onboarding (사용자 회원가입 플로우)
- **MRC-001**: Merchant Onboarding (상인 회원가입 플로우)
- **SGD-001**: Security Guard Recruitment (보안관 회원가입)
- **FP-001**: FP Expert Registration (FP 전문가 회원가입)
- **ADM-001**: Admin Dashboard Foundation (관리자 로그인)

## Related Epics

- **CORE-006**: Logging & Monitoring - 로그인 이력, 감사 로그 연동
- **USR-009**: User Points & Rewards - 회원가입 포인트 적립
- **MRC-002**: Digital Signboard Management - 상인 계정 인증 연동

## Future Enhancements

### Phase 2
- 2FA (Two-Factor Authentication) - SMS/TOTP
- 디바이스 지문 인증 (Fingerprint/Face ID)
- 로그인 알림 (새 디바이스 로그인 시 이메일 알림)

### Phase 3
- OAuth Provider 기능 (외부 앱에 Townin 계정 제공)
- Federated Identity (연합 인증)
- Passwordless Login (Magic Link)

### Phase 4
- SSO (Single Sign-On) for Enterprise
- SAML 2.0 지원
- WebAuthn (FIDO2) 지원

## Notes

### Implementation Status
✅ **COMPLETED** - Admin Dashboard 구현 중 완료됨 (Epic ADM-001의 일부)

**구현된 기능:**
- 이메일/비밀번호 로그인
- JWT Access Token (2시간)
- RBAC (5가지 역할)
- RolesGuard, @Roles 데코레이터
- 세션 타임아웃

**미구현 기능 (Phase 1에서 추가 필요):**
- Refresh Token 로직
- 소셜 로그인 (카카오, 네이버, 구글)
- 회원가입 플로우
- 비밀번호 찾기/재설정
- Redis 토큰 블랙리스트
- Rate Limiting
- 이메일 인증

### References
- NestJS Authentication Documentation: https://docs.nestjs.com/security/authentication
- Passport.js Strategies: http://www.passportjs.org/packages/
- JWT Best Practices: https://tools.ietf.org/html/rfc8725
- 카카오 로그인 API: https://developers.kakao.com/docs/latest/ko/kakaologin/rest-api
- 네이버 로그인 API: https://developers.naver.com/docs/login/api/
- Google OAuth 2.0: https://developers.google.com/identity/protocols/oauth2
