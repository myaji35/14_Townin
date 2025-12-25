# Epic 012: Merchant Onboarding

## Epic Overview

**Epic ID**: MRC-001
**Title**: Merchant Onboarding
**Priority**: P0 (Critical)
**Status**: 📋 Planned
**Estimated Effort**: 5 days
**Phase**: Phase 1 - Merchant App

## Business Value

상인(사장님)이 Townin 플랫폼에 쉽게 가입하고, 상점 정보를 등록하여 디지털 전단지를 배포할 수 있도록 전용 온보딩 플로우를 제공합니다. 사업자 등록증 인증을 통해 신뢰성을 확보하고, 상점 위치를 H3 Grid Cell로 저장하여 지역 기반 마케팅을 가능하게 합니다.

### Target Users
- **Merchants**: 동네 소상공인, 자영업자

### Success Metrics
- 상인 회원가입 완료율 > 60%
- 사업자 인증 완료율 > 80%
- 상점 정보 완성도 > 90%
- 첫 전단지 등록까지 소요 시간 < 10분

## Epic Scope

### In Scope
1. ✅ 상인 회원가입 (Merchant 역할)
2. ✅ 사업자 등록 번호 입력 및 검증
3. ✅ 상점 정보 입력
   - 상호명, 업종, 주소, 전화번호
4. ✅ 상점 위치 설정 (H3 Grid Cell)
5. ✅ 영업 시간 설정
6. ✅ 상점 프로필 사진 업로드
7. ✅ 약관 동의 (상인용)

### Out of Scope
- ❌ 사업자 등록증 OCR (Phase 2)
- ❌ 결제 수단 등록 (Phase 3)
- ❌ 상점 인증 배지 (Phase 2)

## User Stories

### Story 12.1: Merchant Registration
**As a** merchant
**I want to** register as a business owner
**So that** I can create digital flyers

**Acceptance Criteria**:
- [ ] 역할 선택 시 "상인" 선택
- [ ] 이메일/비밀번호 입력
- [ ] 사업자 등록 번호 입력
- [ ] 역할 자동 설정 (Merchant)
- [ ] 인증 이메일 발송

**Tasks**:
- [ ] Frontend: Merchant registration flow
- [ ] Frontend: Business registration number input
- [ ] Backend: POST /auth/register (role: merchant)
- [ ] Backend: Business number validation

**Story Points**: 3
**Status**: 📋 Planned

---

### Story 12.2: Business Registration Verification
**As a** merchant
**I want to** verify my business registration
**So that** the platform trusts my account

**Acceptance Criteria**:
- [ ] 사업자 등록 번호 형식 검증 (10자리)
- [ ] 국세청 API 연동 (선택적)
- [ ] 수동 검증 프로세스
- [ ] 인증 완료 배지 표시

**Tasks**:
- [ ] Frontend: Business number validation
- [ ] Backend: Korea Tax API integration (선택)
- [ ] Backend: Manual verification workflow
- [ ] Migration: Add businessRegistrationNumber to users

**Story Points**: 4
**Status**: 📋 Planned

---

### Story 12.3: Store Information Setup
**As a** merchant
**I want to** enter my store information
**So that** users can find my business

**Acceptance Criteria**:
- [ ] 상호명 입력
- [ ] 업종 선택 (드롭다운)
- [ ] 주소 검색 및 입력
- [ ] 상세 주소 입력
- [ ] 전화번호 입력 (형식 검증)
- [ ] 상점 소개 입력 (선택)

**Tasks**:
- [ ] Frontend: Store info form
- [ ] Frontend: Business type dropdown
- [ ] Frontend: Address search integration
- [ ] Backend: Store entity creation
- [ ] Migration: stores table

**Story Points**: 4
**Status**: 📋 Planned

---

### Story 12.4: Store Location Setup
**As a** merchant
**I want to** set my store location on a map
**So that** customers can find me

**Acceptance Criteria**:
- [ ] 지도 기반 위치 선택
- [ ] 주소 → 좌표 변환
- [ ] H3 Grid Cell 자동 계산
- [ ] 지역(시/군/구) 자동 매핑
- [ ] 위치 확인 및 저장

**Tasks**:
- [ ] Frontend: Map location picker
- [ ] Backend: Geocoding integration
- [ ] Backend: H3 cell assignment
- [ ] Backend: Region mapping
- [ ] Migration: Add gridCellH3Index to stores

**Story Points**: 4
**Status**: 📋 Planned

---

### Story 12.5: Operating Hours Setup
**As a** merchant
**I want to** set my business hours
**So that** customers know when I'm open

**Acceptance Criteria**:
- [ ] 요일별 영업 시간 설정
- [ ] 휴무일 선택
- [ ] 24시간 영업 옵션
- [ ] 브레이크 타임 설정 (선택)
- [ ] 공휴일 영업 여부

**Tasks**:
- [ ] Frontend: Operating hours UI
- [ ] Frontend: Time picker components
- [ ] Backend: Store operating hours model
- [ ] Migration: operating_hours column (JSON)

**Story Points**: 3
**Status**: 📋 Planned

---

### Story 12.6: Store Profile Photo Upload
**As a** merchant
**I want to** upload my store photo
**So that** customers recognize my business

**Acceptance Criteria**:
- [ ] 이미지 업로드 (JPG, PNG)
- [ ] 이미지 크기 제한 (5MB)
- [ ] 이미지 자동 리사이징
- [ ] S3 업로드
- [ ] 프로필 사진 미리보기

**Tasks**:
- [ ] Frontend: Image upload component
- [ ] Frontend: Image preview
- [ ] Backend: Image upload to S3
- [ ] Backend: Image resizing (Sharp)
- [ ] Migration: Add profileImageUrl to stores

**Story Points**: 3
**Status**: 📋 Planned

---

### Story 12.7: Merchant Dashboard Access
**As a** merchant
**I want to** access my merchant dashboard
**So that** I can manage my flyers and store

**Acceptance Criteria**:
- [ ] 로그인 후 Merchant Dashboard로 리다이렉트
- [ ] 상점 정보 요약 표시
- [ ] Quick actions (전단지 생성, 상점 수정)
- [ ] 통계 카드 (전단지 수, 조회 수)

**Tasks**:
- [ ] Frontend: Merchant dashboard screen
- [ ] Frontend: Store summary component
- [ ] Frontend: Quick actions menu
- [ ] Backend: GET /merchants/me/stats

**Story Points**: 3
**Status**: 📋 Planned

---

### Story 12.8: Merchant Terms Agreement
**As a** merchant
**I want to** agree to merchant-specific terms
**So that** I comply with platform policies

**Acceptance Criteria**:
- [ ] 상인용 약관 표시
  - 서비스 이용약관
  - 전단지 게시 정책
  - 수수료 정책 (미래)
- [ ] 필수 약관 동의 필수
- [ ] 약관 상세 보기
- [ ] 동의 기록 저장

**Tasks**:
- [ ] Frontend: Merchant terms UI
- [ ] Frontend: Terms detail modal
- [ ] Backend: Merchant agreement tracking
- [ ] Legal: Merchant terms content

**Story Points**: 2
**Status**: 📋 Planned

---

## Technical Specifications

### Architecture

```
┌─────────────────────────────────────────┐
│      Merchant Onboarding Flow           │
├─────────────────────────────────────────┤
│                                         │
│  1. Role Selection                      │
│     ○ User   ● Merchant                │
│                                         │
│  2. Email/Password Sign Up              │
│     Email: [____________]               │
│     Password: [________]                │
│     사업자등록번호: [__________]         │
│                                         │
│  3. Store Information                   │
│     상호명: [____________]              │
│     업종: [음식점 ▼]                    │
│     주소: [서울시 강남구...]            │
│     전화: [02-1234-5678]                │
│                                         │
│  4. Location Setup                      │
│     [🗺️ Map View]                      │
│     H3: 8930062838fffff                 │
│                                         │
│  5. Operating Hours                     │
│     월-금: 09:00 ~ 21:00               │
│     토: 09:00 ~ 18:00                  │
│     일: 휴무                           │
│                                         │
│  6. Profile Photo                       │
│     [Upload Image]                      │
│                                         │
│  7. Terms Agreement                     │
│     ☑ 서비스 이용약관                   │
│     ☑ 전단지 게시 정책                  │
│                                         │
│  [Complete Registration]                │
└─────────────────────────────────────────┘
```

### Data Models

```typescript
// Store Entity
@Entity('stores')
export class Store {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User)
  @JoinColumn()
  owner: User;

  @Column()
  ownerId: string;

  @Column()
  name: string; // 상호명

  @Column()
  businessRegistrationNumber: string; // 사업자등록번호 (encrypted)

  @Column({ type: 'enum', enum: BusinessType })
  businessType: BusinessType;

  @Column()
  address: string;

  @Column({ nullable: true })
  addressDetail: string;

  @Column()
  phone: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326,
  })
  @Index({ spatial: true })
  location: Point;

  @Column({ length: 15 })
  gridCellH3Index: string;

  @ManyToOne(() => Region)
  region: Region;

  @Column()
  regionId: string;

  @Column({ nullable: true })
  profileImageUrl: string;

  @Column({ type: 'json', nullable: true })
  operatingHours: {
    monday: { open: string; close: string; closed: boolean };
    tuesday: { open: string; close: string; closed: boolean };
    wednesday: { open: string; close: string; closed: boolean };
    thursday: { open: string; close: string; closed: boolean };
    friday: { open: string; close: string; closed: boolean };
    saturday: { open: string; close: string; closed: boolean };
    sunday: { open: string; close: string; closed: boolean };
  };

  @Column({ default: false })
  isVerified: boolean;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

enum BusinessType {
  RESTAURANT = 'restaurant',
  CAFE = 'cafe',
  RETAIL = 'retail',
  BEAUTY = 'beauty',
  HEALTH = 'health',
  EDUCATION = 'education',
  SERVICE = 'service',
  OTHER = 'other',
}
```

### API Endpoints

| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| POST | /auth/register | Merchant registration | `{ email, password, role: 'merchant', businessRegNumber }` |
| POST | /merchants/stores | Create store | `{ name, businessType, address, phone, ... }` |
| PATCH | /merchants/stores/:id | Update store info | `{ name?, address?, operatingHours?, ... }` |
| POST | /merchants/stores/:id/profile-image | Upload profile image | multipart/form-data |
| GET | /merchants/me | Get merchant profile | - |
| GET | /merchants/me/store | Get merchant store | - |
| GET | /merchants/me/stats | Get merchant statistics | - |

## Dependencies

### Prerequisites
- ✅ CORE-001 (Authentication)
- ✅ CORE-002 (Geospatial)
- ✅ CORE-005 (File Upload & CDN)
- ✅ Kakao Local API

### External Libraries
- `multer` (File upload)
- `sharp` (Image resizing)
- `aws-sdk` (S3 upload)

## Testing Strategy

### Unit Tests
- [ ] Business registration number validation
- [ ] Operating hours parsing
- [ ] Image upload validation

### Integration Tests
- [ ] Complete merchant registration flow
- [ ] Store creation
- [ ] Profile image upload

### E2E Tests
- [ ] Merchant sign up → store setup → dashboard
- [ ] Store information update
- [ ] Profile image upload

## Deployment Checklist

- [ ] S3 bucket for store images
- [ ] CloudFront CDN setup
- [ ] Business registration validation
- [ ] Merchant terms finalized
- [ ] Database migrations
- [ ] Documentation

## Risks & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| 사업자 인증 실패 | Medium | Medium | Manual verification fallback |
| 이미지 업로드 실패 | Low | Low | Retry logic, error handling |
| 주소 검색 오류 | Medium | Low | Manual address input |

## Related Epics

- **Depends on**: CORE-001, CORE-002
- **Blocks**: MRC-003 (Flyer Creation)

## Notes

- 사업자등록번호는 암호화 저장
- 국세청 API 연동은 선택적 (수동 검증 우선)
- 프로필 사진은 선택 사항
- 상점 정보는 나중에 수정 가능
- Phase 2에서 상점 인증 배지 추가 예정

## Changelog

- **2025-12-24**: Epic created
  - Merchant Onboarding planned
  - 8 user stories defined (26 story points)
  - Store registration & verification designed
