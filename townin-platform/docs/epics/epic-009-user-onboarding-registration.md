# Epic 009: User Onboarding & Registration

## Epic Overview

**Epic ID**: USR-001
**Title**: User Onboarding & Registration
**Priority**: P0 (Critical)
**Status**: 📋 Planned
**Estimated Effort**: 5 days
**Phase**: Phase 1 - User App

## Business Value

일반 사용자가 Townin 플랫폼에 쉽고 빠르게 가입하고, 개인 프로필을 설정할 수 있도록 직관적인 온보딩 플로우를 제공합니다. 소셜 로그인을 통한 간편 가입으로 진입 장벽을 낮추고, 초기 설정 단계에서 사용자 니즈를 파악하여 개인화된 서비스를 제공합니다.

### Target Users
- **New Users**: Townin을 처음 사용하는 일반 시민
- **Existing Social Users**: 카카오/네이버/구글 계정 보유자

### Success Metrics
- 회원가입 완료율 > 70%
- 소셜 로그인 전환율 > 80%
- 온보딩 완료 시간 < 3분
- 프로필 완성도 > 85%
- 7일 retention rate > 40%

## Epic Scope

### In Scope
1. ✅ 이메일/비밀번호 회원가입 (User 역할)
2. ✅ 소셜 로그인 (카카오/네이버/구글)
3. ✅ 온보딩 플로우 (5단계)
   - Welcome 화면
   - 역할 선택 (일반사용자 확인)
   - 개인정보 입력 (이름, 생년월일, 성별)
   - 관심 카테고리 선택
   - 알림 설정
4. ✅ 프로필 설정 및 수정
5. ✅ 이메일 인증
6. ✅ 약관 동의

### Out of Scope
- ❌ 3-Hub 위치 설정 (별도 Epic USR-002)
- ❌ 상인 회원가입 (별도 Epic MRC-001)
- ❌ 프로필 사진 업로드 (Phase 2)
- ❌ 친구 추천 기능

## User Stories

### Story 9.1: Welcome & Role Selection
**As a** new user
**I want to** see a welcoming introduction
**So that** I understand what Townin offers

**Acceptance Criteria**:
- [ ] Welcome 스플래시 화면
- [ ] Townin 소개 (3-4 슬라이드)
- [ ] 역할 선택 (일반사용자/상인)
- [ ] Skip 버튼

**Tasks**:
- [ ] Frontend: Welcome screen component
- [ ] Frontend: Intro carousel (3 slides)
- [ ] Frontend: Role selection UI
- [ ] Assets: Intro images/illustrations

**Story Points**: 2
**Status**: 📋 Planned

---

### Story 9.2: Email/Password Registration
**As a** new user
**I want to** register with email and password
**So that** I can create my account

**Acceptance Criteria**:
- [ ] 이메일 입력 및 검증
- [ ] 비밀번호 입력 (8자 이상, 영문+숫자)
- [ ] 비밀번호 확인
- [ ] 중복 이메일 체크 (실시간)
- [ ] 인증 이메일 발송
- [ ] 역할 자동 설정 (User)

**Tasks**:
- [ ] Frontend: Registration form
- [ ] Frontend: Form validation
- [ ] Frontend: Real-time email check
- [ ] Backend: POST /auth/register (재사용)
- [ ] Backend: Send verification email

**Story Points**: 3
**Status**: 📋 Planned

---

### Story 9.3: Social Login Integration
**As a** new user
**I want to** sign up with Kakao/Naver/Google
**So that** I don't need to remember another password

**Acceptance Criteria**:
- [ ] 카카오 로그인 버튼
- [ ] 네이버 로그인 버튼
- [ ] 구글 로그인 버튼
- [ ] 자동 프로필 정보 가져오기
- [ ] 자동 회원가입 (첫 로그인 시)
- [ ] 약관 동의 화면 (소셜 로그인 시)

**Tasks**:
- [ ] Frontend: Social login buttons
- [ ] Frontend: OAuth callback handling
- [ ] Backend: Social auth (재사용 CORE-001)
- [ ] Backend: Auto-create user profile

**Story Points**: 3
**Status**: 📋 Planned

---

### Story 9.4: Personal Information Input
**As a** new user
**I want to** enter my basic information
**So that** Townin can personalize services

**Acceptance Criteria**:
- [ ] 이름 입력 (선택)
- [ ] 생년월일 입력 (선택)
- [ ] 성별 선택 (선택)
- [ ] Skip 가능
- [ ] 프로필 저장

**Tasks**:
- [ ] Frontend: Personal info form
- [ ] Frontend: Date picker (birthdate)
- [ ] Frontend: Gender selection
- [ ] Backend: PATCH /users/:id/profile
- [ ] Migration: Add profile fields to users

**Story Points**: 2
**Status**: 📋 Planned

---

### Story 9.5: Interest Category Selection
**As a** new user
**I want to** select my interest categories
**So that** I receive relevant flyer recommendations

**Acceptance Criteria**:
- [ ] 카테고리 목록 표시 (8-10개)
  - 음식/외식, 쇼핑, 건강/뷰티, 교육, 서비스, 여가/문화 등
- [ ] 다중 선택 가능 (최소 1개)
- [ ] 선택 항목 시각적 표시
- [ ] 저장 및 다음 단계

**Tasks**:
- [ ] Frontend: Category selection UI
- [ ] Frontend: Multi-select logic
- [ ] Backend: User interests table
- [ ] Backend: POST /users/:id/interests
- [ ] Migration: user_interests table

**Story Points**: 2
**Status**: 📋 Planned

---

### Story 9.6: Notification Preferences
**As a** new user
**I want to** set my notification preferences
**So that** I only receive alerts I want

**Acceptance Criteria**:
- [ ] 푸시 알림 권한 요청
- [ ] 알림 타입별 설정
  - 새 전단지 알림
  - 포인트 적립 알림
  - 마케팅 알림
- [ ] 알림 시간대 설정 (선택)
- [ ] 저장 및 온보딩 완료

**Tasks**:
- [ ] Frontend: Notification preferences UI
- [ ] Frontend: Push permission request
- [ ] Backend: User notification settings
- [ ] Backend: PATCH /users/:id/notifications
- [ ] Migration: Add notification_settings to users

**Story Points**: 3
**Status**: 📋 Planned

---

### Story 9.7: Terms & Conditions Agreement
**As a** new user
**I want to** review and agree to terms
**So that** I comply with legal requirements

**Acceptance Criteria**:
- [ ] 약관 목록
  - 서비스 이용약관 (필수)
  - 개인정보 처리방침 (필수)
  - 위치정보 이용약관 (필수)
  - 마케팅 정보 수신 (선택)
- [ ] 전체 동의 체크박스
- [ ] 개별 약관 상세 보기
- [ ] 필수 약관 미동의 시 진행 불가

**Tasks**:
- [ ] Frontend: Terms agreement UI
- [ ] Frontend: Terms detail modal
- [ ] Frontend: All-agree checkbox logic
- [ ] Backend: User agreements table
- [ ] Backend: POST /users/:id/agreements
- [ ] Legal: Terms content creation

**Story Points**: 3
**Status**: 📋 Planned

---

### Story 9.8: User Profile Management
**As a** registered user
**I want to** view and edit my profile
**So that** I can keep my information up to date

**Acceptance Criteria**:
- [ ] 프로필 조회 화면
- [ ] 프로필 수정 화면
- [ ] 이메일 변경 (재인증 필요)
- [ ] 비밀번호 변경
- [ ] 관심 카테고리 수정
- [ ] 알림 설정 수정
- [ ] 계정 탈퇴

**Tasks**:
- [ ] Frontend: Profile view screen
- [ ] Frontend: Profile edit screen
- [ ] Backend: GET /users/me
- [ ] Backend: PATCH /users/me
- [ ] Backend: DELETE /users/me (soft delete)

**Story Points**: 4
**Status**: 📋 Planned

---

## Technical Specifications

### Onboarding Flow

```
┌────────────────────────────────────────────────┐
│                 Splash Screen                  │
│      "Welcome to Townin OS"                    │
└──────────────────┬─────────────────────────────┘
                   │
                   ▼
┌────────────────────────────────────────────────┐
│         Intro Carousel (3 slides)              │
│  1. "광고 없는 클린한 생존 지도"                │
│  2. "무료 디지털 전단지"                        │
│  3. "하이퍼로컬 생활 OS"                        │
└──────────────────┬─────────────────────────────┘
                   │
                   ▼
┌────────────────────────────────────────────────┐
│          Role Selection                        │
│  ┌──────────┐      ┌──────────┐               │
│  │ 일반사용자 │      │   상인    │               │
│  └──────────┘      └──────────┘               │
└──────────────────┬─────────────────────────────┘
                   │
           (User 선택시)
                   │
                   ▼
┌────────────────────────────────────────────────┐
│         Sign Up / Login                        │
│  ┌──────────────────────────────────────┐     │
│  │ 이메일/비밀번호 회원가입               │     │
│  └──────────────────────────────────────┘     │
│  ┌──────────────────────────────────────┐     │
│  │  [카카오]  [네이버]  [구글]           │     │
│  └──────────────────────────────────────┘     │
└──────────────────┬─────────────────────────────┘
                   │
                   ▼
┌────────────────────────────────────────────────┐
│       Terms & Conditions Agreement             │
│  ☑ 서비스 이용약관 (필수)                       │
│  ☑ 개인정보 처리방침 (필수)                     │
│  ☑ 위치정보 이용약관 (필수)                     │
│  ☐ 마케팅 정보 수신 (선택)                      │
└──────────────────┬─────────────────────────────┘
                   │
                   ▼
┌────────────────────────────────────────────────┐
│      Personal Information (Optional)           │
│  이름: [____________]                          │
│  생년월일: [____-__-__]                        │
│  성별: ○ 남성  ○ 여성  ○ 선택안함              │
│                            [Skip]  [Next]      │
└──────────────────┬─────────────────────────────┘
                   │
                   ▼
┌────────────────────────────────────────────────┐
│       Interest Category Selection              │
│  ☑ 음식/외식    ☑ 쇼핑    ☐ 건강/뷰티         │
│  ☐ 교육        ☑ 서비스   ☐ 여가/문화          │
│  ☐ 생활용품     ☐ 기타                         │
│                            [Skip]  [Next]      │
└──────────────────┬─────────────────────────────┘
                   │
                   ▼
┌────────────────────────────────────────────────┐
│       Notification Preferences                 │
│  ☑ 새 전단지 알림                              │
│  ☑ 포인트 적립 알림                            │
│  ☐ 마케팅 알림                                 │
│  알림 시간: 09:00 ~ 21:00                      │
│                                   [Complete]   │
└──────────────────┬─────────────────────────────┘
                   │
                   ▼
┌────────────────────────────────────────────────┐
│             Onboarding Complete!               │
│        "환영합니다, {사용자명}님!"              │
│          [Go to Dashboard]                     │
└────────────────────────────────────────────────┘
```

### Data Models

```typescript
// Enhanced User Entity
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  password: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  // Profile Information
  @Column({ nullable: true })
  name: string;

  @Column({ type: 'date', nullable: true })
  birthdate: Date;

  @Column({ type: 'enum', enum: Gender, nullable: true })
  gender: Gender;

  // Onboarding Status
  @Column({ default: false })
  isOnboardingComplete: boolean;

  @Column({ default: false })
  isEmailVerified: boolean;

  @Column({ default: true })
  isActive: boolean;

  // Social Login IDs
  @Column({ nullable: true })
  kakaoId: string;

  @Column({ nullable: true })
  naverId: string;

  @Column({ nullable: true })
  googleId: string;

  // Notification Settings
  @Column({ type: 'json', nullable: true })
  notificationSettings: {
    newFlyers: boolean;
    pointsEarned: boolean;
    marketing: boolean;
    quietHoursStart: string; // "09:00"
    quietHoursEnd: string; // "21:00"
  };

  // Relations
  @OneToMany(() => UserInterest, interest => interest.user)
  interests: UserInterest[];

  @OneToMany(() => UserAgreement, agreement => agreement.user)
  agreements: UserAgreement[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
  PREFER_NOT_TO_SAY = 'prefer_not_to_say',
}

// User Interest Entity
@Entity('user_interests')
export class UserInterest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, user => user.interests)
  user: User;

  @Column()
  userId: string;

  @Column({ type: 'enum', enum: InterestCategory })
  category: InterestCategory;

  @CreateDateColumn()
  createdAt: Date;
}

enum InterestCategory {
  FOOD_DINING = 'food_dining',
  SHOPPING = 'shopping',
  HEALTH_BEAUTY = 'health_beauty',
  EDUCATION = 'education',
  SERVICES = 'services',
  LEISURE_CULTURE = 'leisure_culture',
  HOUSEHOLD = 'household',
  OTHER = 'other',
}

// User Agreement Entity
@Entity('user_agreements')
export class UserAgreement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, user => user.agreements)
  user: User;

  @Column()
  userId: string;

  @Column({ type: 'enum', enum: AgreementType })
  type: AgreementType;

  @Column()
  agreed: boolean;

  @Column({ type: 'timestamp' })
  agreedAt: Date;

  @Column({ nullable: true })
  version: string; // e.g., "v1.0"
}

enum AgreementType {
  TERMS_OF_SERVICE = 'terms_of_service',
  PRIVACY_POLICY = 'privacy_policy',
  LOCATION_TERMS = 'location_terms',
  MARKETING = 'marketing',
}
```

### API Endpoints

| Method | Endpoint | Description | Auth | Body |
|--------|----------|-------------|------|------|
| POST | /auth/register | Email/password registration | Public | `{ email, password, role: 'user' }` |
| POST | /auth/social/:provider | Social login (kakao/naver/google) | Public | OAuth callback |
| GET | /users/me | Get current user profile | JWT | - |
| PATCH | /users/me | Update user profile | JWT | `{ name?, birthdate?, gender? }` |
| POST | /users/:id/interests | Set user interests | JWT | `{ categories: string[] }` |
| PATCH | /users/:id/notifications | Update notification settings | JWT | `{ newFlyers, pointsEarned, marketing, quietHours }` |
| POST | /users/:id/agreements | Record user agreements | JWT | `{ agreements: [{ type, agreed }] }` |
| PATCH | /users/:id/complete-onboarding | Mark onboarding as complete | JWT | - |
| DELETE | /users/me | Delete account (soft delete) | JWT | - |

## Dependencies

### Prerequisites
- ✅ CORE-001 (Authentication & Authorization)
- ✅ Email service configured

### External Libraries
- `class-validator` (Form validation)
- `date-fns` (Date handling)

## Testing Strategy

### Unit Tests
- [ ] Form validation logic
- [ ] Interest category selection
- [ ] Notification settings update

### Integration Tests
- [ ] Complete onboarding flow
- [ ] Social login onboarding
- [ ] Profile update

### E2E Tests
- [ ] New user registration → onboarding → dashboard
- [ ] Social login → onboarding → dashboard
- [ ] Skip onboarding steps
- [ ] Profile editing

## Deployment Checklist

- [ ] Terms & conditions content finalized
- [ ] Privacy policy finalized
- [ ] Email templates created
- [ ] Social OAuth configured
- [ ] Database migrations
- [ ] Frontend assets (images)
- [ ] Analytics tracking
- [ ] Documentation

## Risks & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| 온보딩 이탈률 높음 | High | High | Skip 버튼, 단계 최소화 |
| 소셜 로그인 실패 | Medium | Low | Email login fallback |
| 약관 동의 거부 | High | Medium | 명확한 설명, 필수/선택 구분 |
| 프로필 정보 누락 | Low | High | 선택 항목 처리, 나중에 수정 가능 |

## Related Epics

- **Depends on**: CORE-001 (Authentication)
- **Blocks**: USR-002 (3-Hub Location Setup)
- **Related**: USR-007 (Digital Flyer Viewer)

## Notes

- 온보딩 단계는 최소화하여 이탈률 방지
- 모든 개인정보 입력은 선택 사항 (Skip 가능)
- 소셜 로그인 시 자동 프로필 정보 활용
- 온보딩 미완료 사용자도 기본 기능 사용 가능
- 추후 프로필 완성도에 따른 인센티브 제공 고려

## Changelog

- **2025-12-24**: Epic created
  - User Onboarding & Registration planned
  - 8 user stories defined (22 story points)
  - 5-step onboarding flow designed
  - Privacy-first optional profile system
