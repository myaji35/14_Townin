# Story CORE-001-01: Email/Password Registration

**Epic**: CORE-001 Authentication & Authorization System
**Priority**: P0 (Critical)
**Story Points**: 3
**Status**: 📋 Planned

## User Story

**As a** new user
**I want to** register with email and password
**So that** I can create an account on the platform

## Acceptance Criteria

- [ ] 이메일 형식 검증 (example@domain.com)
- [ ] 비밀번호 강도 검증 (최소 8자, 영문+숫자)
- [ ] 중복 이메일 체크
- [ ] 비밀번호 해싱 (bcrypt, salt rounds: 10)
- [ ] 이메일 인증 메일 발송
- [ ] 역할 선택 (일반사용자/상인)

## Tasks

### Backend
- [ ] POST /auth/register API 구현
- [ ] Email validation (class-validator)
- [ ] Password hashing (bcrypt)
- [ ] Duplicate email check
- [ ] Send verification email (NodeMailer)
- [ ] Create user record in database

### Frontend
- [ ] Registration form component
- [ ] Form validation (client-side)
- [ ] Password strength indicator
- [ ] Role selection UI
- [ ] Error handling and display
- [ ] Success message and redirect

### Testing
- [ ] Unit tests: password hashing
- [ ] Unit tests: email validation
- [ ] Integration test: registration flow
- [ ] E2E test: complete registration

## Technical Notes

```typescript
// Password hashing
import * as bcrypt from 'bcrypt';
const hashedPassword = await bcrypt.hash(password, 10);

// Email validation
@IsEmail()
@IsNotEmpty()
email: string;

// Password validation
@MinLength(8)
@Matches(/^(?=.*[A-Za-z])(?=.*\d)/, {
  message: 'Password must contain letters and numbers'
})
password: string;
```

## Dependencies

- **Depends on**: Database setup, Email service configuration

## Definition of Done

- [ ] All acceptance criteria met
- [ ] All tasks completed
- [ ] Unit tests passing
- [ ] Integration tests passing
- [ ] Code reviewed and merged
- [ ] API documentation updated (Swagger)
- [ ] Email templates created

## Notes

- 비밀번호는 절대 평문으로 저장하지 않음
- 이메일 인증은 24시간 유효
- 역할은 회원가입 시 선택하거나 기본값(User) 사용
