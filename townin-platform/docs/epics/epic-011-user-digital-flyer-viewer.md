# Epic 011: Digital Flyer Viewer

## Epic Overview

**Epic ID**: USR-007
**Title**: Digital Flyer Viewer
**Priority**: P0 (Critical)
**Status**: 📋 Planned
**Estimated Effort**: 7 days
**Phase**: Phase 1 - User App

## Business Value

Townin의 핵심 서비스인 "디지털 전단지 열람"을 구현합니다. 사용자는 3-Hub 거점 주변의 지역 상점 전단지를 광고 없이 깨끗하게 확인하고, 관심 있는 전단지를 클릭하여 포인트를 적립하며, 저장/공유 기능을 통해 편리하게 이용할 수 있습니다.

### Target Users
- **All Users**: 지역 정보와 혜택을 찾는 일반 사용자

### Success Metrics
- 일 평균 전단지 조회 수 > 10개/사용자
- 전단지 클릭률 (CTR) > 15%
- 전단지 저장률 > 5%
- 포인트 적립 완료율 > 95%
- 앱 체류 시간 > 8분/세션

## Epic Scope

### In Scope
1. ✅ 전단지 피드 (카드 UI)
2. ✅ Hub 기반 전단지 필터링
3. ✅ 카테고리별 필터링
4. ✅ 정렬 옵션 (최신순, 거리순, 인기순)
5. ✅ 전단지 상세 보기
6. ✅ 전단지 클릭 시 포인트 적립 (25P)
7. ✅ 전단지 저장 (북마크)
8. ✅ 전단지 공유
9. ✅ 무한 스크롤 (Infinite Scroll)
10. ✅ 지도 뷰 전환

### Out of Scope
- ❌ 전단지 검색 (Phase 1.5)
- ❌ AI 추천 (Phase 2)
- ❌ 전단지 평가/리뷰 (Phase 2)

## User Stories

### Story 11.1: Flyer Feed Display
**As a** user
**I want to** see nearby flyers in a feed
**So that** I can browse local offers

**Acceptance Criteria**:
- [ ] 카드 기반 전단지 목록
- [ ] 전단지 이미지, 제목, 할인율, 거리 표시
- [ ] Hub 선택 드롭다운
- [ ] 기본 정렬: 최신순
- [ ] 스켈레톤 로딩
- [ ] 빈 상태 UI

**Tasks**:
- [ ] Frontend: Flyer feed screen
- [ ] Frontend: Flyer card component
- [ ] Frontend: Loading skeleton
- [ ] Frontend: Empty state
- [ ] Backend: GET /flyers?hubId=&category=&sort=

**Story Points**: 5
**Status**: 📋 Planned

---

### Story 11.2: Category & Sorting Filters
**As a** user
**I want to** filter and sort flyers
**So that** I can find relevant offers quickly

**Acceptance Criteria**:
- [ ] 카테고리 탭 (전체, 음식, 쇼핑, 건강, 서비스 등)
- [ ] 정렬 드롭다운 (최신순, 거리순, 인기순)
- [ ] 필터 적용 시 즉시 반영
- [ ] 선택된 필터 표시

**Tasks**:
- [ ] Frontend: Category tabs
- [ ] Frontend: Sort dropdown
- [ ] Frontend: Filter state management
- [ ] Backend: Category filter logic
- [ ] Backend: Sort logic (createdAt, distance, clickCount)

**Story Points**: 3
**Status**: 📋 Planned

---

### Story 11.3: Flyer Detail View
**As a** user
**I want to** see detailed flyer information
**So that** I can understand the offer

**Acceptance Criteria**:
- [ ] 전단지 상세 모달/페이지
- [ ] 이미지 전체 크기 표시
- [ ] 상점 정보 (이름, 주소, 거리)
- [ ] 전단지 설명
- [ ] 유효 기간 표시
- [ ] 카테고리 배지
- [ ] 조회수 표시

**Tasks**:
- [ ] Frontend: Flyer detail screen
- [ ] Frontend: Image viewer
- [ ] Frontend: Merchant info section
- [ ] Backend: GET /flyers/:id
- [ ] Backend: Increment viewCount

**Story Points**: 4
**Status**: 📋 Planned

---

### Story 11.4: Points Earning on Click
**As a** user
**I want to** earn points when I click flyers
**So that** I get rewarded for engagement

**Acceptance Criteria**:
- [ ] 전단지 클릭 시 25P 적립
- [ ] 중복 클릭 방지 (1회만)
- [ ] 포인트 적립 알림 (토스트)
- [ ] 적립 내역 기록
- [ ] 상인에게 5P 분배

**Tasks**:
- [ ] Backend: POST /flyers/:id/click
- [ ] Backend: Points transaction service
- [ ] Backend: Deduplication logic
- [ ] Frontend: Click handler
- [ ] Frontend: Toast notification

**Story Points**: 4
**Status**: 📋 Planned

---

### Story 11.5: Bookmark/Save Flyer
**As a** user
**I want to** save flyers for later
**So that** I can revisit them easily

**Acceptance Criteria**:
- [ ] 북마크 버튼 (하트 아이콘)
- [ ] 북마크 토글 (저장/해제)
- [ ] 저장된 전단지 목록
- [ ] 저장 개수 제한 (100개)

**Tasks**:
- [ ] Frontend: Bookmark button
- [ ] Frontend: Saved flyers screen
- [ ] Backend: POST /flyers/:id/bookmark
- [ ] Backend: DELETE /flyers/:id/bookmark
- [ ] Backend: GET /users/me/bookmarks
- [ ] Migration: user_bookmarks table

**Story Points**: 3
**Status**: 📋 Planned

---

### Story 11.6: Share Flyer
**As a** user
**I want to** share flyers with friends
**So that** they can also benefit

**Acceptance Criteria**:
- [ ] 공유 버튼
- [ ] 네이티브 공유 시트 (모바일)
- [ ] 공유 옵션 (카카오톡, SMS, 링크 복사)
- [ ] 공유 링크 생성
- [ ] 공유 횟수 기록

**Tasks**:
- [ ] Frontend: Share button
- [ ] Frontend: Native share API
- [ ] Frontend: Deep link handling
- [ ] Backend: GET /flyers/shared/:shareId
- [ ] Backend: Share count tracking

**Story Points**: 3
**Status**: 📋 Planned

---

### Story 11.7: Infinite Scroll Pagination
**As a** user
**I want to** scroll endlessly through flyers
**So that** I can discover more offers

**Acceptance Criteria**:
- [ ] 무한 스크롤 구현
- [ ] 20개씩 로드
- [ ] 로딩 인디케이터
- [ ] 끝 도달 시 메시지
- [ ] 성능 최적화 (가상 스크롤)

**Tasks**:
- [ ] Frontend: Infinite scroll component
- [ ] Frontend: Intersection Observer
- [ ] Frontend: Virtual scrolling (선택)
- [ ] Backend: Pagination support (limit, offset)

**Story Points**: 3
**Status**: 📋 Planned

---

### Story 11.8: Map View Toggle
**As a** user
**I want to** see flyers on a map
**So that** I can find nearby stores visually

**Acceptance Criteria**:
- [ ] 리스트/지도 뷰 토글
- [ ] 지도에 전단지 마커 표시
- [ ] 마커 클릭 → 전단지 미리보기
- [ ] 지도 이동 → 해당 영역 전단지 로드
- [ ] 현재 위치 표시

**Tasks**:
- [ ] Frontend: Map view component
- [ ] Frontend: Flyer markers
- [ ] Frontend: Marker clustering
- [ ] Frontend: Map event handling
- [ ] Frontend: View toggle button

**Story Points**: 5
**Status**: 📋 Planned

---

## Technical Specifications

### Architecture

```
┌─────────────────────────────────────────┐
│       Digital Flyer Viewer              │
├─────────────────────────────────────────┤
│  Header:                                │
│   [Hub: Home ▼]  [Category Tabs]       │
│                                         │
│  Flyer Feed (Infinite Scroll):          │
│  ┌───────────────┐ ┌───────────────┐   │
│  │ [Image]       │ │ [Image]       │   │
│  │ 50% OFF       │ │ Free Trial    │   │
│  │ Title         │ │ Title         │   │
│  │ 0.5km · 음식  │ │ 1.2km · 헬스  │   │
│  │ 💰 25P        │ │ 💰 25P        │   │
│  │ [❤️ Save]    │ │ [❤️ Save]    │   │
│  └───────────────┘ └───────────────┘   │
│                                         │
│  [Load More...]                         │
│                                         │
│  Bottom Nav:                            │
│  [List View] [Map View]                 │
└─────────────────────────────────────────┘
```

### Data Models

```typescript
// Flyer Entity (from backend)
@Entity('flyers')
export class Flyer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  merchantId: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column()
  imageUrl: string;

  @Column({ type: 'enum', enum: FlyerCategory })
  category: FlyerCategory;

  @Column({ length: 15 })
  gridCellH3Index: string;

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
}

// User Bookmark
@Entity('user_bookmarks')
export class UserBookmark {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  flyerId: string;

  @CreateDateColumn()
  createdAt: Date;
}

// Flyer Click (for points)
@Entity('flyer_clicks')
export class FlyerClick {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  flyerId: string;

  @Column({ type: 'int', default: 25 })
  pointsEarned: number;

  @CreateDateColumn()
  clickedAt: Date;
}
```

### API Endpoints

| Method | Endpoint | Description | Query Params |
|--------|----------|-------------|--------------|
| GET | /flyers | Get flyers feed | `hubId, category, sort, limit, offset` |
| GET | /flyers/:id | Get flyer details | - |
| POST | /flyers/:id/click | Record click & earn points | - |
| POST | /flyers/:id/bookmark | Bookmark flyer | - |
| DELETE | /flyers/:id/bookmark | Remove bookmark | - |
| GET | /users/me/bookmarks | Get saved flyers | `limit, offset` |
| POST | /flyers/:id/share | Generate share link | - |
| GET | /flyers/shared/:shareId | Access shared flyer | - |

### Points System

```typescript
// Points Distribution (per click)
const POINTS_DISTRIBUTION = {
  user: 25,           // 클릭한 사용자
  securityGuard: 5,   // 해당 지역 보안관
  platform: 20,       // 플랫폼 수익
};

// Deduplication
// - 동일 사용자가 동일 전단지 중복 클릭 방지
// - flyer_clicks 테이블에 (userId, flyerId) unique constraint
```

## Dependencies

### Prerequisites
- ✅ CORE-002 (Geospatial)
- ✅ USR-001 (User Onboarding)
- ✅ USR-002 (3-Hub Setup)
- ✅ MRC-003 (Flyer Creation)

### External Libraries
- `react-infinite-scroll-component`
- Kakao/Naver Map SDK

## Testing Strategy

### Unit Tests
- [ ] Points calculation
- [ ] Deduplication logic
- [ ] Distance calculation
- [ ] Sorting logic

### Integration Tests
- [ ] Flyer feed loading
- [ ] Click & points earning
- [ ] Bookmark operations
- [ ] Share link generation

### E2E Tests
- [ ] Browse flyers → click → earn points
- [ ] Save flyer → view saved list
- [ ] Share flyer → open shared link
- [ ] Map view → marker click → detail

## Deployment Checklist

- [ ] Database migrations
- [ ] Image CDN setup
- [ ] Points system activation
- [ ] Analytics tracking
- [ ] Performance monitoring
- [ ] Documentation

## Risks & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| 대량 전단지 로딩 느림 | High | Medium | Pagination, caching, CDN |
| 포인트 중복 지급 | High | Low | Unique constraint, idempotency |
| 이미지 로딩 실패 | Medium | Medium | Placeholder, lazy loading |
| 무한 스크롤 메모리 | Medium | High | Virtual scrolling, limit |

## Related Epics

- **Depends on**: USR-002, MRC-003
- **Related**: USR-008 (Points & Rewards)

## Notes

- 전단지 이미지는 CDN으로 제공 (S3 + CloudFront)
- 포인트는 첫 클릭만 지급 (중복 방지)
- 무한 스크롤은 성능 최적화 필수
- 지도 뷰는 모바일에서 선택적 제공
- Phase 2에서 AI 추천 기능 추가 예정

## Changelog

- **2025-12-24**: Epic created
  - Digital Flyer Viewer planned
  - 8 user stories defined (30 story points)
  - Core flyer browsing & points system designed
