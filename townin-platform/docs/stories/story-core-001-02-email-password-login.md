# Story CORE-001-02: Email/Password Login

**Epic**: CORE-001 Authentication & Authorization System
**Priority**: P0 (Critical)
**Story Points**: 3
**Status**: 📋 Planned

## User Story

**As a** registered user
**I want to** log in with email and password
**So that** I can access my account

## Acceptance Criteria

- [ ] 이메일/비밀번호 검증
- [ ] Access Token 발급 (15분 유효)
- [ ] Refresh Token 발급 (2주 유효)
- [ ] Remember Me 옵션
- [ ] 로그인 실패 시 에러 메시지
- [ ] Rate limiting (5 attempts/15min)

## Tasks

### Backend
- [ ] POST /auth/login API 구현
- [ ] Email + password validation
- [ ] bcrypt password comparison
- [ ] JWT Access Token generation (15min)
- [ ] JWT Refresh Token generation (14 days)
- [ ] Refresh Token storage in Redis
- [ ] Rate limiting middleware
- [ ] Login attempt logging

### Frontend
- [ ] Login form component
- [ ] Email/password validation (client-side)
- [ ] Remember Me checkbox
- [ ] Error handling and display
- [ ] Token storage (localStorage for Access, HTTP-only cookie for Refresh)
- [ ] Redirect to dashboard after login

### Testing
- [ ] Unit tests: password validation
- [ ] Unit tests: JWT token generation
- [ ] Integration test: login with valid credentials
- [ ] Integration test: login with invalid credentials
- [ ] E2E test: complete login flow
- [ ] Rate limiting test

## Technical Notes

```typescript
// Login DTO
export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsOptional()
  @IsBoolean()
  rememberMe?: boolean;
}

// Login Response
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    role: UserRole;
    isEmailVerified: boolean;
  };
}

// Password verification
const isPasswordValid = await bcrypt.compare(password, user.password);

// JWT generation
const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
const refreshToken = this.jwtService.sign(payload, {
  secret: process.env.JWT_REFRESH_SECRET,
  expiresIn: rememberMe ? '14d' : '7d'
});

// Redis storage
await this.redis.set(`refresh:${user.id}`, refreshToken, 'EX', 14 * 24 * 60 * 60);
```

## Dependencies

- **Depends on**: Database setup, Redis setup, CORE-001-01 (Registration)
- **Blocks**: All authenticated features

## Definition of Done

- [ ] All acceptance criteria met
- [ ] All tasks completed
- [ ] Unit tests passing (>80% coverage)
- [ ] Integration tests passing
- [ ] Code reviewed and merged
- [ ] API documentation updated (Swagger)
- [ ] Rate limiting configured
- [ ] Security audit passed

## Notes

- Access Token은 짧게 (15분) 유지하여 보안 강화
- Refresh Token은 HTTP-only cookie로 저장 (XSS 방지)
- Remember Me 체크 시 Refresh Token 유효기간 14일
- 로그인 실패 5회 시 15분간 계정 잠금
- 로그인 성공 시 lastLoginAt 업데이트
