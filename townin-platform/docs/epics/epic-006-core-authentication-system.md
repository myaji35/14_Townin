# Epic 006: Authentication & Authorization System

## Epic Overview

**Epic ID**: CORE-001
**Title**: Authentication & Authorization System
**Priority**: P0 (Critical)
**Status**: 📋 Planned
**Estimated Effort**: 5 days
**Phase**: Phase 1 - Core Infrastructure

## Business Value

모든 플랫폼 사용자(일반, 상인, 보안관, 지자체, 관리자)에게 안전하고 편리한 인증 시스템을 제공합니다. JWT 기반 stateless 인증과 소셜 로그인을 통해 사용자 진입 장벽을 낮추고, RBAC로 역할별 권한을 관리합니다.

### Target Users
- **All Users**: 일반 사용자, 상인, 보안관, 지자체, 관리자
- **Platform**: 전체 시스템의 보안 기반

### Success Metrics
- 로그인 성공률 > 98%
- 소셜 로그인 전환율 > 70%
- JWT 토큰 검증 속도 < 10ms
- 세션 유지 시간: 2주 (Remember Me)
- 역할별 권한 검증 100% 동작

## Epic Scope

### In Scope
1. ✅ 이메일/비밀번호 회원가입 및 로그인
2. ✅ 소셜 로그인 (카카오, 네이버, 구글)
3. ✅ JWT 기반 인증 (Access Token + Refresh Token)
4. ✅ Role-Based Access Control (RBAC)
   - User, Merchant, SecurityGuard, Municipality, SuperAdmin
5. ✅ 비밀번호 찾기/재설정
6. ✅ 이메일 인증
7. ✅ 로그아웃 및 토큰 무효화
8. ✅ Remember Me 기능

### Out of Scope
- ❌ 2단계 인증 (2FA)
- ❌ 생체 인증 (지문, Face ID)
- ❌ OAuth 제공자 역할 (타사 앱에 인증 제공)
- ❌ Single Sign-On (SSO)

## User Stories

### Story 6.1: Email/Password Registration
**As a** new user
**I want to** register with email and password
**So that** I can create an account on the platform

**Acceptance Criteria**:
- [ ] 이메일 형식 검증
- [ ] 비밀번호 강도 검증 (최소 8자, 영문+숫자)
- [ ] 중복 이메일 체크
- [ ] 비밀번호 해싱 (bcrypt)
- [ ] 이메일 인증 메일 발송
- [ ] 역할 선택 (일반사용자/상인)

**Tasks**:
- [ ] Backend: POST /auth/register API
- [ ] Backend: Email validation
- [ ] Backend: Password hashing
- [ ] Backend: Send verification email
- [ ] Frontend: Registration form
- [ ] Frontend: Form validation

**Story Points**: 3
**Status**: 📋 Planned

---

### Story 6.2: Email/Password Login
**As a** registered user
**I want to** log in with email and password
**So that** I can access my account

**Acceptance Criteria**:
- [ ] 이메일/비밀번호 검증
- [ ] Access Token 발급 (15분 유효)
- [ ] Refresh Token 발급 (2주 유효)
- [ ] Remember Me 옵션
- [ ] 로그인 실패 시 에러 메시지

**Tasks**:
- [ ] Backend: POST /auth/login API
- [ ] Backend: JWT token generation
- [ ] Backend: Refresh token storage (Redis)
- [ ] Frontend: Login form
- [ ] Frontend: Token storage (localStorage/cookie)

**Story Points**: 3
**Status**: 📋 Planned

---

### Story 6.3: Social Login (Kakao/Naver/Google)
**As a** new user
**I want to** log in with social accounts
**So that** I don't need to remember another password

**Acceptance Criteria**:
- [ ] 카카오 OAuth 2.0 연동
- [ ] 네이버 OAuth 2.0 연동
- [ ] 구글 OAuth 2.0 연동
- [ ] 소셜 계정 프로필 정보 가져오기
- [ ] 자동 회원가입 (첫 로그인 시)
- [ ] 기존 이메일 계정과 연동

**Tasks**:
- [ ] Backend: Passport.js 설정
- [ ] Backend: Kakao strategy
- [ ] Backend: Naver strategy
- [ ] Backend: Google strategy
- [ ] Backend: Social profile mapping
- [ ] Frontend: Social login buttons
- [ ] Frontend: OAuth callback handling

**Story Points**: 5
**Status**: 📋 Planned

---

### Story 6.4: JWT Token Refresh
**As a** logged-in user
**I want to** refresh my access token automatically
**So that** I don't have to log in frequently

**Acceptance Criteria**:
- [ ] Access Token 만료 감지
- [ ] Refresh Token으로 새 Access Token 발급
- [ ] Refresh Token 자동 갱신 (sliding window)
- [ ] 401 에러 시 자동 재시도
- [ ] Refresh Token 만료 시 로그아웃

**Tasks**:
- [ ] Backend: POST /auth/refresh API
- [ ] Backend: Refresh token validation
- [ ] Backend: Sliding window refresh
- [ ] Frontend: Axios interceptor
- [ ] Frontend: Token refresh logic

**Story Points**: 3
**Status**: 📋 Planned

---

### Story 6.5: Role-Based Access Control (RBAC)
**As a** platform administrator
**I want to** control access based on user roles
**So that** users only access authorized features

**Acceptance Criteria**:
- [ ] 5개 역할 정의 (User, Merchant, SecurityGuard, Municipality, SuperAdmin)
- [ ] Role guard decorator (@Roles)
- [ ] API endpoint별 role 제한
- [ ] Frontend route별 role 제한
- [ ] 권한 없음 에러 (403 Forbidden)

**Tasks**:
- [ ] Backend: Roles enum 정의
- [ ] Backend: @Roles decorator
- [ ] Backend: RolesGuard 구현
- [ ] Frontend: Role-based routing
- [ ] Frontend: Conditional UI rendering

**Story Points**: 3
**Status**: 📋 Planned

---

### Story 6.6: Password Reset
**As a** user who forgot password
**I want to** reset my password via email
**So that** I can regain access to my account

**Acceptance Criteria**:
- [ ] 비밀번호 찾기 요청 (이메일 입력)
- [ ] 재설정 링크 이메일 발송
- [ ] 토큰 기반 비밀번호 재설정 (1시간 유효)
- [ ] 새 비밀번호 설정
- [ ] 재설정 후 자동 로그인

**Tasks**:
- [ ] Backend: POST /auth/forgot-password API
- [ ] Backend: POST /auth/reset-password/:token API
- [ ] Backend: Reset token generation
- [ ] Backend: Send reset email
- [ ] Frontend: Forgot password form
- [ ] Frontend: Reset password form

**Story Points**: 3
**Status**: 📋 Planned

---

### Story 6.7: Email Verification
**As a** new user
**I want to** verify my email address
**So that** the platform knows I'm a real user

**Acceptance Criteria**:
- [ ] 회원가입 시 인증 이메일 발송
- [ ] 이메일 링크 클릭으로 인증
- [ ] 인증 토큰 검증 (24시간 유효)
- [ ] 인증 완료 후 리다이렉트
- [ ] 재전송 기능

**Tasks**:
- [ ] Backend: Email verification token
- [ ] Backend: GET /auth/verify-email/:token API
- [ ] Backend: POST /auth/resend-verification API
- [ ] Backend: Send verification email
- [ ] Frontend: Verification success page
- [ ] Frontend: Resend button

**Story Points**: 2
**Status**: 📋 Planned

---

### Story 6.8: Logout & Token Invalidation
**As a** logged-in user
**I want to** log out securely
**So that** my session is properly terminated

**Acceptance Criteria**:
- [ ] 로그아웃 API 호출
- [ ] Refresh Token 삭제 (Redis)
- [ ] Frontend 토큰 제거
- [ ] 로그인 페이지로 리다이렉트
- [ ] 로그아웃 후 API 접근 불가

**Tasks**:
- [ ] Backend: POST /auth/logout API
- [ ] Backend: Redis token removal
- [ ] Frontend: Logout button
- [ ] Frontend: Token cleanup
- [ ] Frontend: Redirect to login

**Story Points**: 2
**Status**: 📋 Planned

---

## Technical Specifications

### Architecture

```
┌─────────────────────────────────────────────┐
│            Client (Web/Mobile)              │
├─────────────────────────────────────────────┤
│  Login Form / Social Login Buttons          │
│  Token Storage (LocalStorage/Cookie)        │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│         NestJS Auth Module                  │
├─────────────────────────────────────────────┤
│  AuthController                             │
│  - POST /auth/register                      │
│  - POST /auth/login                         │
│  - POST /auth/refresh                       │
│  - POST /auth/logout                        │
│  - GET /auth/kakao (redirect)               │
│  - GET /auth/kakao/callback                 │
│  - GET /auth/naver (redirect)               │
│  - GET /auth/naver/callback                 │
│  - GET /auth/google (redirect)              │
│  - GET /auth/google/callback                │
│  - POST /auth/forgot-password               │
│  - POST /auth/reset-password/:token         │
│  - GET /auth/verify-email/:token            │
├─────────────────────────────────────────────┤
│  AuthService                                │
│  - register()                               │
│  - login()                                  │
│  - validateUser()                           │
│  - generateTokens()                         │
│  - refreshToken()                           │
│  - socialLogin()                            │
├─────────────────────────────────────────────┤
│  JwtStrategy / Guards                       │
│  - JwtAuthGuard                             │
│  - RolesGuard                               │
│  - @Roles decorator                         │
└──────────────┬────────────┬─────────────────┘
               │            │
               ▼            ▼
        ┌──────────┐  ┌──────────┐
        │PostgreSQL│  │  Redis   │
        │ (Users)  │  │(Refresh  │
        │          │  │ Tokens)  │
        └──────────┘  └──────────┘
```

### API Endpoints

| Method | Endpoint | Description | Auth | Body |
|--------|----------|-------------|------|------|
| POST | /auth/register | Email/Password registration | Public | `{ email, password, role }` |
| POST | /auth/login | Email/Password login | Public | `{ email, password, rememberMe? }` |
| POST | /auth/refresh | Refresh access token | Public | `{ refreshToken }` |
| POST | /auth/logout | Logout and invalidate token | JWT | `{ refreshToken }` |
| GET | /auth/kakao | Redirect to Kakao OAuth | Public | - |
| GET | /auth/kakao/callback | Kakao OAuth callback | Public | - |
| GET | /auth/naver | Redirect to Naver OAuth | Public | - |
| GET | /auth/naver/callback | Naver OAuth callback | Public | - |
| GET | /auth/google | Redirect to Google OAuth | Public | - |
| GET | /auth/google/callback | Google OAuth callback | Public | - |
| POST | /auth/forgot-password | Request password reset | Public | `{ email }` |
| POST | /auth/reset-password/:token | Reset password | Public | `{ password }` |
| GET | /auth/verify-email/:token | Verify email address | Public | - |
| POST | /auth/resend-verification | Resend verification email | JWT | - |

### Data Models

```typescript
// User Entity
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  password: string; // hashed, null for social login only

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Column({ default: false })
  isEmailVerified: boolean;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  kakaoId: string;

  @Column({ nullable: true })
  naverId: string;

  @Column({ nullable: true })
  googleId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

// User Role Enum
export enum UserRole {
  USER = 'user',
  MERCHANT = 'merchant',
  SECURITY_GUARD = 'security_guard',
  MUNICIPALITY = 'municipality',
  SUPER_ADMIN = 'super_admin',
}

// JWT Payload
export interface JwtPayload {
  sub: string; // user id
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

// Auth Response
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    role: UserRole;
  };
}
```

### JWT Configuration

```typescript
// Access Token
{
  secret: process.env.JWT_SECRET,
  expiresIn: '15m', // 15 minutes
  algorithm: 'HS256'
}

// Refresh Token
{
  secret: process.env.JWT_REFRESH_SECRET,
  expiresIn: '14d', // 14 days (Remember Me)
  algorithm: 'HS256'
}

// Email Verification Token
{
  secret: process.env.JWT_EMAIL_SECRET,
  expiresIn: '24h', // 24 hours
  algorithm: 'HS256'
}

// Password Reset Token
{
  secret: process.env.JWT_RESET_SECRET,
  expiresIn: '1h', // 1 hour
  algorithm: 'HS256'
}
```

### Security Best Practices

- ✅ 비밀번호 해싱: bcrypt (salt rounds: 10)
- ✅ HTTPS only (production)
- ✅ HTTP-only cookies (Refresh Token)
- ✅ CORS 설정
- ✅ Rate limiting (login: 5 attempts/15min)
- ✅ SQL injection 방지 (TypeORM parameterized queries)
- ✅ XSS 방지 (input sanitization)
- ✅ CSRF 방지 (SameSite cookie)

## Dependencies

### Prerequisites
- ✅ NestJS framework
- ✅ PostgreSQL database
- ✅ Redis (for refresh tokens)
- ✅ Email service (NodeMailer / SendGrid)

### External Libraries
- `@nestjs/jwt`
- `@nestjs/passport`
- `passport`
- `passport-jwt`
- `passport-kakao`
- `passport-naver`
- `passport-google-oauth20`
- `bcrypt`
- `class-validator`
- `class-transformer`

### Environment Variables
```env
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
JWT_EMAIL_SECRET=your-email-secret
JWT_RESET_SECRET=your-reset-secret

KAKAO_CLIENT_ID=your-kakao-client-id
KAKAO_CLIENT_SECRET=your-kakao-secret
KAKAO_CALLBACK_URL=http://localhost:3000/auth/kakao/callback

NAVER_CLIENT_ID=your-naver-client-id
NAVER_CLIENT_SECRET=your-naver-secret
NAVER_CALLBACK_URL=http://localhost:3000/auth/naver/callback

GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-email-password
```

## Testing Strategy

### Unit Tests
- [ ] Password hashing and validation
- [ ] JWT token generation and verification
- [ ] Email validation logic
- [ ] Role guard logic
- [ ] Refresh token rotation

### Integration Tests
- [ ] User registration flow
- [ ] Login with valid credentials
- [ ] Login with invalid credentials
- [ ] Social login flow (Kakao/Naver/Google)
- [ ] Token refresh flow
- [ ] Password reset flow
- [ ] Email verification flow
- [ ] Logout flow

### E2E Tests
- [ ] Complete registration → verification → login
- [ ] Social login → auto registration → dashboard
- [ ] Forgot password → reset → login
- [ ] Role-based access control
- [ ] Token expiration and refresh

## Deployment Checklist

- [ ] Environment variables 설정
- [ ] OAuth app 등록 (Kakao/Naver/Google)
- [ ] Email service 설정
- [ ] Redis 설정
- [ ] Database migration (users table)
- [ ] HTTPS 인증서 설정
- [ ] Rate limiting 설정
- [ ] Monitoring (login attempts, failures)
- [ ] Documentation 업데이트

## Risks & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Token 탈취 | High | Medium | HTTP-only cookie, short expiry, HTTPS |
| Brute force 공격 | High | High | Rate limiting, account lockout |
| Social login 장애 | Medium | Low | Email login fallback |
| Email 전송 실패 | Medium | Medium | Retry logic, queue system |
| Refresh token 탈취 | High | Low | Rotation, device fingerprint |

## Related Epics

- **Blocks**: USR-001, MRC-001, SGD-001 (모든 앱 인증 필요)
- **Related**: CORE-004 Real-time Notification System

## Notes

- OAuth 소셜 로그인은 카카오 우선 구현 (한국 시장 점유율 1위)
- 네이버, 구글은 Phase 1.5에서 추가 가능
- Remember Me는 보안상 최대 2주로 제한
- 비밀번호 없는 소셜 전용 계정 지원
- 향후 2FA는 Phase 2에서 추가 예정

## Changelog

- **2025-12-24**: Epic created
  - Authentication & Authorization System planned
  - 8 user stories defined (24 story points)
  - JWT + Social Login + RBAC architecture designed
