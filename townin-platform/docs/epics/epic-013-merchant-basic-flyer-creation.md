# Epic 013: Basic Flyer Creation

## Epic Overview

**Epic ID**: MRC-003
**Title**: Basic Flyer Creation
**Priority**: P0 (Critical)
**Status**: 📋 Planned
**Estimated Effort**: 7 days
**Phase**: Phase 1 - Merchant App

## Business Value

상인이 간단하게 디지털 전단지를 생성하여 지역 고객에게 배포할 수 있는 핵심 기능을 제공합니다. 템플릿 기반의 직관적인 편집 도구로 비전문가도 쉽게 전단지를 만들 수 있으며, 자동으로 H3 Grid Cell에 매핑되어 주변 사용자에게 노출됩니다.

### Target Users
- **Merchants**: 디지털 전단지로 마케팅하려는 상인

### Success Metrics
- 첫 전단지 생성 완료율 > 70%
- 전단지 생성 소요 시간 < 5분
- 템플릿 사용률 > 85%
- 전단지 재사용/수정률 > 40%

## Epic Scope

### In Scope
1. ✅ 전단지 템플릿 선택
2. ✅ 전단지 편집기
   - 제목, 설명 입력
   - 이미지 업로드
   - 할인율/프로모션 입력
3. ✅ 카테고리 선택
4. ✅ 유효 기간 설정
5. ✅ 미리보기
6. ✅ 전단지 발행
7. ✅ 전단지 목록 및 관리
8. ✅ 전단지 수정/삭제

### Out of Scope
- ❌ AI 이미지 생성 (Phase 2)
- ❌ 종이 전단지 스캔 (Phase 2 - MRC-006)
- ❌ 고급 디자인 편집 (Phase 2)
- ❌ A/B 테스트 (Phase 3)

## User Stories

### Story 13.1: Template Selection
**As a** merchant
**I want to** choose from flyer templates
**So that** I can create a professional-looking flyer quickly

**Acceptance Criteria**:
- [ ] 템플릿 갤러리 (6-10개)
- [ ] 템플릿 프리뷰
- [ ] 카테고리별 템플릿 (음식, 쇼핑, 서비스 등)
- [ ] 빈 템플릿 옵션
- [ ] 템플릿 선택 → 편집기 이동

**Tasks**:
- [ ] Frontend: Template gallery UI
- [ ] Frontend: Template preview modal
- [ ] Frontend: Template data (JSON)
- [ ] Assets: Template images

**Story Points**: 3
**Status**: 📋 Planned

---

### Story 13.2: Flyer Editor - Basic Information
**As a** merchant
**I want to** enter flyer information
**So that** customers understand my offer

**Acceptance Criteria**:
- [ ] 제목 입력 (최대 50자)
- [ ] 설명 입력 (최대 500자)
- [ ] 카테고리 선택
- [ ] 할인율 입력 (선택)
- [ ] 가격 정보 입력 (선택)
- [ ] 실시간 미리보기

**Tasks**:
- [ ] Frontend: Flyer editor form
- [ ] Frontend: Character counter
- [ ] Frontend: Category dropdown
- [ ] Frontend: Real-time preview
- [ ] Frontend: Form validation

**Story Points**: 4
**Status**: 📋 Planned

---

### Story 13.3: Image Upload
**As a** merchant
**I want to** upload product/service images
**So that** my flyer is visually appealing

**Acceptance Criteria**:
- [ ] 이미지 업로드 (드래그 앤 드롭)
- [ ] 이미지 크기 제한 (10MB)
- [ ] 이미지 자동 리사이징
- [ ] 이미지 크롭/회전 (선택)
- [ ] 최대 3장 업로드
- [ ] S3 업로드

**Tasks**:
- [ ] Frontend: Image upload component
- [ ] Frontend: Drag & drop
- [ ] Frontend: Image cropper (선택)
- [ ] Backend: Image upload to S3
- [ ] Backend: Image resizing (Sharp)

**Story Points**: 4
**Status**: 📋 Planned

---

### Story 13.4: Validity Period Setting
**As a** merchant
**I want to** set flyer expiration date
**So that** outdated offers don't show

**Acceptance Criteria**:
- [ ] 유효 기간 선택 (날짜 피커)
- [ ] 기본값: 7일 후
- [ ] 최소: 1일, 최대: 30일
- [ ] 만료일 시각적 표시
- [ ] 만료 전 알림 (Phase 2)

**Tasks**:
- [ ] Frontend: Date picker component
- [ ] Frontend: Validation (1-30 days)
- [ ] Backend: expiresAt column
- [ ] Backend: Auto-deactivate expired flyers (cron)

**Story Points**: 2
**Status**: 📋 Planned

---

### Story 13.5: Flyer Preview & Publish
**As a** merchant
**I want to** preview and publish my flyer
**So that** I can ensure it looks good before going live

**Acceptance Criteria**:
- [ ] 실시간 미리보기
- [ ] 모바일/데스크톱 뷰 전환
- [ ] 발행 버튼
- [ ] 발행 확인 다이얼로그
- [ ] 자동 H3 Grid Cell 매핑
- [ ] 발행 성공 알림

**Tasks**:
- [ ] Frontend: Preview component
- [ ] Frontend: Responsive preview
- [ ] Frontend: Publish dialog
- [ ] Backend: POST /flyers
- [ ] Backend: H3 cell assignment (from store)

**Story Points**: 3
**Status**: 📋 Planned

---

### Story 13.6: Flyer List Management
**As a** merchant
**I want to** view all my flyers
**So that** I can track and manage them

**Acceptance Criteria**:
- [ ] 전단지 목록 (테이블 or 카드)
- [ ] 필터: 활성/만료/전체
- [ ] 정렬: 최신순, 조회수 순
- [ ] 전단지별 통계 표시 (조회, 클릭, 북마크)
- [ ] Quick actions (수정, 삭제, 활성/비활성)

**Tasks**:
- [ ] Frontend: Flyer list screen
- [ ] Frontend: Filter & sort UI
- [ ] Frontend: Action buttons
- [ ] Backend: GET /merchants/me/flyers

**Story Points**: 4
**Status**: 📋 Planned

---

### Story 13.7: Flyer Edit
**As a** merchant
**I want to** edit my existing flyers
**So that** I can update information

**Acceptance Criteria**:
- [ ] 편집 버튼 → 편집기로 이동
- [ ] 기존 데이터 로드
- [ ] 모든 필드 수정 가능
- [ ] 이미지 변경 가능
- [ ] 저장 시 버전 기록 (선택)

**Tasks**:
- [ ] Frontend: Load flyer data to editor
- [ ] Frontend: Update mode UI
- [ ] Backend: PATCH /flyers/:id
- [ ] Backend: Version history (선택)

**Story Points**: 3
**Status**: 📋 Planned

---

### Story 13.8: Flyer Delete & Archive
**As a** merchant
**I want to** delete or deactivate flyers
**So that** I can remove outdated offers

**Acceptance Criteria**:
- [ ] 삭제 버튼 (소프트 삭제)
- [ ] 삭제 확인 다이얼로그
- [ ] 활성/비활성 토글
- [ ] 삭제된 전단지 복원 (30일 이내)
- [ ] 완전 삭제 (30일 후 자동)

**Tasks**:
- [ ] Frontend: Delete confirmation
- [ ] Frontend: Toggle active status
- [ ] Backend: DELETE /flyers/:id (soft delete)
- [ ] Backend: PATCH /flyers/:id/toggle-active
- [ ] Backend: Cron job for permanent deletion

**Story Points**: 2
**Status**: 📋 Planned

---

## Technical Specifications

### Architecture

```
┌─────────────────────────────────────────┐
│       Flyer Creation Flow               │
├─────────────────────────────────────────┤
│                                         │
│  1. Template Selection                  │
│     [Template Gallery]                  │
│     ┌─────┐ ┌─────┐ ┌─────┐            │
│     │ T1  │ │ T2  │ │ T3  │            │
│     └─────┘ └─────┘ └─────┘            │
│                                         │
│  2. Flyer Editor                        │
│     ┌──────────────────────────────┐   │
│     │ [Live Preview]               │   │
│     │ ┌──────────────┐             │   │
│     │ │   [Image]    │             │   │
│     │ │   50% OFF    │             │   │
│     │ │   Title      │             │   │
│     │ └──────────────┘             │   │
│     └──────────────────────────────┘   │
│                                         │
│     Title: [___________________]        │
│     Description: [______________]       │
│     Category: [음식/외식 ▼]             │
│     Discount: [__%]                     │
│     Expires: [2025-12-31]               │
│                                         │
│     [Upload Image]                      │
│                                         │
│  3. Preview & Publish                   │
│     [👁️ Preview] [✓ Publish]           │
│                                         │
└─────────────────────────────────────────┘
```

### Data Models

```typescript
// Flyer Entity (Complete)
@Entity('flyers')
export class Flyer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  merchant: User;

  @Column()
  merchantId: string;

  @ManyToOne(() => Store)
  store: Store;

  @Column()
  storeId: string;

  @Column()
  title: string; // max 50 chars

  @Column({ type: 'text', nullable: true })
  description: string; // max 500 chars

  @Column({ type: 'simple-array', nullable: true })
  imageUrls: string[]; // Up to 3 images

  @Column({ type: 'enum', enum: FlyerCategory })
  category: FlyerCategory;

  @Column({ type: 'int', nullable: true })
  discountPercent: number; // e.g., 50 for 50% off

  @Column({ type: 'int', nullable: true })
  originalPrice: number;

  @Column({ type: 'int', nullable: true })
  discountedPrice: number;

  @Column({ length: 15 })
  gridCellH3Index: string; // From store location

  @ManyToOne(() => Region)
  region: Region;

  @Column()
  regionId: string;

  @Column({ type: 'int', default: 0 })
  viewCount: number;

  @Column({ type: 'int', default: 0 })
  clickCount: number;

  @Column({ type: 'int', default: 0 })
  bookmarkCount: number;

  @Column({ type: 'int', default: 0 })
  shareCount: number;

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isDeleted: boolean;

  @Column({ type: 'timestamp', nullable: true })
  deletedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

enum FlyerCategory {
  FOOD_DINING = 'food_dining',
  SHOPPING = 'shopping',
  HEALTH_BEAUTY = 'health_beauty',
  EDUCATION = 'education',
  SERVICES = 'services',
  LEISURE_CULTURE = 'leisure_culture',
  HOUSEHOLD = 'household',
  OTHER = 'other',
}

// Template (Frontend only)
interface FlyerTemplate {
  id: string;
  name: string;
  category: FlyerCategory;
  thumbnailUrl: string;
  layout: {
    imagePosition: 'top' | 'background';
    titleStyle: object;
    descriptionStyle: object;
  };
}
```

### API Endpoints

| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| GET | /flyers/templates | Get flyer templates | - |
| POST | /flyers | Create new flyer | `{ title, description, category, images, expiresAt, ... }` |
| GET | /merchants/me/flyers | Get merchant's flyers | `?status=active/expired/all&sort=` |
| GET | /flyers/:id | Get flyer details | - |
| PATCH | /flyers/:id | Update flyer | `{ title?, description?, images?, ... }` |
| DELETE | /flyers/:id | Soft delete flyer | - |
| PATCH | /flyers/:id/toggle-active | Toggle active status | - |
| POST | /flyers/:id/restore | Restore deleted flyer | - |

### Image Upload Workflow

```typescript
// Frontend
1. User selects image
2. Validate size (< 10MB)
3. Optional: Crop/resize on client
4. Upload to /flyers/upload-image
5. Receive imageUrl
6. Add to flyer.imageUrls array

// Backend
1. Receive multipart/form-data
2. Validate file type (JPG, PNG, WebP)
3. Resize to multiple sizes
   - Thumbnail: 300x300
   - Medium: 800x800
   - Original: max 1920x1920
4. Upload to S3
5. Return CDN URLs
```

## Dependencies

### Prerequisites
- ✅ MRC-001 (Merchant Onboarding)
- ✅ CORE-002 (Geospatial)
- ✅ CORE-005 (File Upload & CDN)

### External Libraries
- `react-image-crop` (Image cropping)
- `multer` (File upload)
- `sharp` (Image processing)
- `aws-sdk` (S3 upload)

## Testing Strategy

### Unit Tests
- [ ] Form validation
- [ ] Image size validation
- [ ] Date range validation
- [ ] H3 cell assignment

### Integration Tests
- [ ] Complete flyer creation flow
- [ ] Image upload to S3
- [ ] Flyer CRUD operations
- [ ] Auto-expiration cron job

### E2E Tests
- [ ] Create flyer → publish → view in user app
- [ ] Edit flyer → update → verify changes
- [ ] Delete flyer → restore → delete permanently

## Deployment Checklist

- [ ] S3 bucket for flyer images
- [ ] CloudFront CDN setup
- [ ] Image processing service
- [ ] Expiration cron job
- [ ] Template assets
- [ ] Database migrations
- [ ] Documentation

## Risks & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| 대용량 이미지 업로드 | Medium | High | Size limit, compression |
| 템플릿 부족 | Medium | Medium | 초기 10개 제공, Phase 2 확장 |
| 전단지 스팸 | High | Medium | Rate limiting, 승인 프로세스 (Phase 1.5) |
| 이미지 저작권 | High | Low | 약관 명시, 신고 기능 |

## Related Epics

- **Depends on**: MRC-001, CORE-005
- **Blocks**: USR-007 (Flyer Viewer)
- **Related**: MRC-004 (Flyer Management)

## Notes

- 초기 버전은 템플릿 기반 간단 편집만 지원
- AI 이미지 생성은 Phase 2 (MRC-006)
- 종이 전단지 스캔은 Phase 2
- 전단지 승인 프로세스는 Phase 1.5 추가 예정
- 상인당 동시 활성 전단지 제한: 10개
- 이미지는 CDN으로 제공 (S3 + CloudFront)

## Changelog

- **2025-12-24**: Epic created
  - Basic Flyer Creation planned
  - 8 user stories defined (25 story points)
  - Template-based editor designed
  - Image upload & CDN workflow specified
