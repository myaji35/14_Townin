# Epic 003: Flyer Statistics Dashboard

## Epic Overview

**Epic ID**: EPIC-003
**Title**: Flyer Statistics Dashboard
**Priority**: P0 (Critical)
**Status**: ✅ Completed
**Estimated Effort**: 4 days
**Actual Effort**: 2 days

## Business Value

관리자가 플랫폼의 전단지 성과를 한눈에 파악하고, 데이터 기반 의사결정을 내릴 수 있도록 통계 중심의 시각화 대시보드를 제공합니다. 기존의 단순 목록 관리 방식에서 통계/분석 중심으로 전환하여 비즈니스 인사이트를 제공합니다.

### Target Users
- **Super Admin**: 플랫폼 전체 성과 모니터링
- **Municipality**: 지역별 전단지 효과 분석
- **Security Guard (보안관)**: 담당 지역 전단지 현황 파악

### Success Metrics
- ✅ KPI 카드 4개 표시
- ✅ 카테고리별 분포 시각화
- ✅ 지역별 분포 시각화
- ✅ TOP 5 순위표 3종 제공
- ✅ 최근 전단지 목록 (상태만 표시, 관리 기능 제거)

## Epic Scope

### In Scope
1. ✅ KPI 통계 카드 (총 전단지, 조회수, 클릭수, CTR)
2. ✅ 카테고리별 전단지 분포
3. ✅ 지역별 전단지 분포 (상위 10개)
4. ✅ 조회수 TOP 5 전단지
5. ✅ 클릭수 TOP 5 전단지
6. ✅ CTR TOP 5 전단지
7. ✅ 최근 등록 전단지 목록 (10개)
8. ✅ 활성/비활성 상태 표시만 (관리 기능은 지역 마스터에게 위임)

### Out of Scope
- ❌ 전단지 활성/비활성 토글 (지역 마스터 권한)
- ❌ 전단지 삭제 기능
- ❌ 전단지 수정 기능
- ❌ 시계열 그래프 (전단지 관련)
- ❌ 상세 분석 리포트

## User Stories

### Story 3.1: KPI Statistics Cards
**As a** admin
**I want to** see key flyer performance metrics at a glance
**So that** I can quickly assess overall performance

**Acceptance Criteria**:
- ✅ 총 전단지 수 (활성 전단지 수 포함)
- ✅ 총 조회수 (평균 조회수 포함)
- ✅ 총 클릭수 (평균 클릭수 포함)
- ✅ 평균 CTR (Click Through Rate) %

**Tasks**:
- [x] Frontend: 통계 계산 로직
- [x] Frontend: KPI cards 컴포넌트
- [x] CSS: 색상 코딩 (조회=녹색, 클릭=주황, CTR=보라)

**Story Points**: 2
**Status**: ✅ Done

---

### Story 3.2: Category Distribution
**As a** admin
**I want to** see flyer distribution by category
**So that** I can understand which categories are most popular

**Acceptance Criteria**:
- ✅ 카테고리별 전단지 개수
- ✅ 카테고리별 조회수, 클릭수
- ✅ 개수 순으로 정렬
- ✅ 시각적 구분 (카드 UI)

**Tasks**:
- [x] Frontend: Category aggregation logic
- [x] Frontend: Category cards 컴포넌트
- [x] Frontend: Sorting by count

**Story Points**: 2
**Status**: ✅ Done

---

### Story 3.3: Region Distribution
**As a** admin
**I want to** see flyer distribution by region
**So that** I can identify active regions

**Acceptance Criteria**:
- ✅ 지역별 전단지 개수
- ✅ 지역별 조회수, 클릭수
- ✅ 상위 10개 지역만 표시
- ✅ 개수 순으로 정렬

**Tasks**:
- [x] Frontend: Region aggregation logic
- [x] Frontend: Region cards 컴포넌트
- [x] Frontend: Top 10 filtering

**Story Points**: 2
**Status**: ✅ Done

---

### Story 3.4: Top Performing Flyers
**As a** admin
**I want to** see top performing flyers
**So that** I can understand what makes successful flyers

**Acceptance Criteria**:
- ✅ 조회수 TOP 5 (1등 금색 배경)
- ✅ 클릭수 TOP 5 (1등 금색 배경)
- ✅ CTR TOP 5 (1등 금색 배경)
- ✅ 각 전단지 제목, 카테고리, 상인 표시

**Tasks**:
- [x] Frontend: Sorting logic (views, clicks, CTR)
- [x] Frontend: TOP 5 cards 컴포넌트
- [x] CSS: 1st place highlight (#fef3c7)

**Story Points**: 3
**Status**: ✅ Done

---

### Story 3.5: Recent Flyers List
**As a** admin
**I want to** see recently registered flyers
**So that** I can monitor new content

**Acceptance Criteria**:
- ✅ 최근 10개 전단지
- ✅ 제목, 카테고리, 상인, 지역, 조회, 클릭, 상태, 등록일 표시
- ✅ 활성/비활성 상태 배지 (관리 기능 없음)
- ✅ 등록일 순 정렬 (최신순)

**Tasks**:
- [x] Frontend: Recent flyers sorting
- [x] Frontend: Flyer table 컴포넌트
- [x] Frontend: Status badge (read-only)

**Story Points**: 2
**Status**: ✅ Done

---

## Technical Specifications

### Component Architecture

```
FlyersStatsDashboard Component
├── Header
│   ├── Title: "전단지 통계 대시보드"
│   └── RefreshButton
├── KPICards (grid 4 columns)
│   ├── TotalFlyersCard
│   ├── TotalViewsCard
│   ├── TotalClicksCard
│   └── AvgCTRCard
├── DistributionSection (grid 2 columns)
│   ├── CategoryDistribution
│   │   └── CategoryCards[]
│   └── RegionDistribution
│       └── RegionCards[] (top 10)
├── TopPerformingSection (grid 3 columns)
│   ├── TopByViews
│   │   └── FlyerCards[] (top 5)
│   ├── TopByClicks
│   │   └── FlyerCards[] (top 5)
│   └── TopByCTR
│       └── FlyerCards[] (top 5)
└── RecentFlyersSection
    ├── Title: "최근 등록된 전단지"
    └── FlyerTable
        ├── TableHeader
        └── TableRows[] (latest 10)
```

### Data Calculations

```typescript
// KPI Calculations
const totalFlyers = flyers.length;
const activeFlyers = flyers.filter(f => f.isActive).length;
const totalViews = flyers.reduce((sum, f) => sum + (f.viewCount || 0), 0);
const totalClicks = flyers.reduce((sum, f) => sum + (f.clickCount || 0), 0);
const avgCTR = totalViews > 0
  ? ((totalClicks / totalViews) * 100).toFixed(2)
  : '0.00';

// Category Stats
const categoryStats = flyers.reduce((acc, flyer) => {
  const cat = flyer.category || '기타';
  if (!acc[cat]) {
    acc[cat] = { count: 0, views: 0, clicks: 0 };
  }
  acc[cat].count++;
  acc[cat].views += flyer.viewCount || 0;
  acc[cat].clicks += flyer.clickCount || 0;
  return acc;
}, {});

// Top Flyers
const topByViews = [...flyers]
  .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
  .slice(0, 5);

const topByCTR = [...flyers]
  .filter(f => (f.viewCount || 0) > 0)
  .sort((a, b) => {
    const ctrA = (a.clickCount || 0) / (a.viewCount || 1);
    const ctrB = (b.clickCount || 0) / (b.viewCount || 1);
    return ctrB - ctrA;
  })
  .slice(0, 5);
```

### Color Coding

| Metric | Color | Hex |
|--------|-------|-----|
| Total Flyers | Purple | #667eea |
| Views | Green | #10b981 |
| Clicks | Orange | #f59e0b |
| CTR | Purple | #8b5cf6 |
| 1st Place | Gold | #fef3c7 |

### Data Models

```typescript
interface Flyer {
  id: string;
  merchantId: string;
  merchantEmail: string;
  title: string;
  description?: string;
  category: string;
  gridCell: string;
  viewCount: number;
  clickCount: number;
  isActive: boolean;
  createdAt: string;
  expiresAt: string;
}

interface CategoryStats {
  count: number;
  views: number;
  clicks: number;
}

interface RegionStats {
  count: number;
  views: number;
  clicks: number;
}
```

## Design Specifications

### Layout
- ✅ 반응형 그리드 (auto-fit, minmax)
- ✅ 카드 기반 UI
- ✅ 그라디언트 배경 (헤더)
- ✅ 그림자 효과 (cards)

### Typography
- Title: 24px, weight: 700
- Card value: 32px, weight: 700
- Section heading: 18px, weight: 700
- Table text: 13px

### Spacing
- Section margin: 32px
- Card gap: 20-24px
- Card padding: 24px
- Table cell padding: 12px 8px

## Performance Considerations

### Client-Side Calculations
- ✅ 모든 통계 계산은 클라이언트에서 수행
- ✅ 계산 복잡도: O(n) where n = 전단지 수
- ⚠️ 전단지 10,000개 이상 시 성능 테스트 필요

### Rendering Optimization
- ✅ React functional components
- ✅ Memoization 가능 (useMemo)
- ✅ Virtual scrolling 고려 (대량 데이터)

## Testing Strategy

### Unit Tests
- [ ] KPI calculation logic
- [ ] Category aggregation
- [ ] Region aggregation
- [ ] Sorting logic (views, clicks, CTR)

### Integration Tests
- [ ] Flyer data loading
- [ ] Statistics display

### E2E Tests
- [ ] View flyers statistics
- [ ] Verify TOP 5 rankings
- [ ] Check recent flyers list

## Deployment Checklist

- [x] Frontend 컴포넌트 구현
- [x] 통계 계산 로직 구현
- [x] 시각화 UI 구현
- [ ] Unit tests
- [ ] E2E tests
- [ ] Performance testing
- [ ] Documentation

## Risks & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| 대량 전단지 성능 저하 | Medium | Medium | Memoization, pagination |
| 잘못된 통계 계산 | High | Low | Unit tests, validation |
| 빈 데이터 표시 | Low | Medium | Empty state UI |

## Related Epics

- **Depends on**: EPIC-001 Admin Dashboard Foundation
- **Related**: EPIC-002 User Management System
- **Next**: EPIC-004 Region Management System
- **Next**: EPIC-005 Platform Activity Monitoring

## Notes

- 전단지 활성/비활성 관리는 지역 마스터 권한으로 위임
- 관리자 화면은 통계 및 모니터링에 집중
- 실시간 업데이트는 향후 WebSocket으로 추가 예정
- 상세 분석 리포트는 별도 Epic으로 계획

## Changelog

- **2025-11-30**: Epic completed
  - KPI statistics cards implemented (4 cards)
  - Category distribution visualization added
  - Region distribution visualization added (top 10)
  - Top performing flyers rankings added (3 types, top 5 each)
  - Recent flyers list added (read-only, 10 items)
  - Removed active/inactive toggle (delegated to regional masters)
