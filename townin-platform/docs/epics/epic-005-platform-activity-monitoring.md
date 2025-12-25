# Epic 005: Platform Activity Monitoring

## Epic Overview

**Epic ID**: EPIC-005
**Title**: Platform Activity Monitoring
**Priority**: P1 (High)
**Status**: ✅ Completed
**Estimated Effort**: 3 days
**Actual Effort**: 2 days

## Business Value

관리자가 플랫폼의 모든 사용자 활동을 실시간으로 모니터링하고, 트렌드를 파악할 수 있도록 활동 피드와 시계열 그래프를 제공합니다. 플랫폼 활성도를 측정하고 비정상적인 패턴을 조기에 발견할 수 있습니다.

### Target Users
- **Super Admin**: 전체 플랫폼 활동 모니터링
- **Municipality**: 지역 활동 트렌드 파악

### Success Metrics
- ✅ 실시간 활동 피드 (50개까지)
- ✅ 시간 필터 (오늘, 이번 주, 이번 달, 전체)
- ✅ 활동 타입별 집계
- ✅ 시계열 그래프 (카테고리별 라인 차트)
- ✅ 일별 통계 요약

## Epic Scope

### In Scope
1. ✅ 플랫폼 활동 피드
   - 신규 사용자 가입
   - 전단지 등록
   - 마일스톤 달성 (조회수 1,000회, 5,000회)
2. ✅ 시간 필터 (오늘/이번주/이번달/전체)
3. ✅ 활동 통계 카드 (4개)
4. ✅ 활동 추이 시계열 그래프
   - 3개 라인 (신규가입, 전단지등록, 마일스톤)
   - 날짜별 집계
   - Y축 자동 스케일링
5. ✅ 활동 타임라인
   - 최근 50개 활동
   - 상대적 시간 표시
   - 아이콘 및 색상 구분
6. ✅ 일별 통계 요약

### Out of Scope
- ❌ 사용자별 활동 필터링
- ❌ 활동 상세 페이지
- ❌ 활동 알림 설정
- ❌ 활동 CSV 내보내기
- ❌ 실시간 WebSocket 업데이트

## User Stories

### Story 5.1: Activity Type Statistics
**As a** admin
**I want to** see activity counts by type
**So that** I can understand platform engagement

**Acceptance Criteria**:
- ✅ 총 활동 수 카드
- ✅ 신규 가입 수 카드
- ✅ 전단지 등록 수 카드
- ✅ 마일스톤 달성 수 카드
- ✅ 시간 필터 적용

**Tasks**:
- [x] Frontend: Activity aggregation logic
- [x] Frontend: Stats cards 컴포넌트
- [x] Frontend: Time filter integration
- [x] CSS: Card styling

**Story Points**: 2
**Status**: ✅ Done

---

### Story 5.2: Time Range Filtering
**As a** admin
**I want to** filter activities by time range
**So that** I can focus on recent or specific periods

**Acceptance Criteria**:
- ✅ 4개 시간 필터 버튼 (오늘, 이번 주, 이번 달, 전체)
- ✅ 활성 필터 시각적 표시
- ✅ 필터 변경 시 즉시 반영
- ✅ 그래프 및 피드 동시 업데이트

**Tasks**:
- [x] Frontend: Time filter buttons
- [x] Frontend: Date range calculation
- [x] Frontend: Filter state management
- [x] CSS: Active filter styling

**Story Points**: 2
**Status**: ✅ Done

---

### Story 5.3: Activity Trend Chart
**As a** admin
**I want to** see activity trends over time
**So that** I can identify patterns and growth

**Acceptance Criteria**:
- ✅ SVG 기반 라인 차트
- ✅ 3개 라인 (신규가입, 전단지등록, 마일스톤)
- ✅ 색상 구분 (파란색, 녹색, 주황색)
- ✅ X축: 날짜 레이블
- ✅ Y축: 활동 수 (자동 스케일)
- ✅ 그리드 라인
- ✅ 범례 표시

**Tasks**:
- [x] Frontend: Chart data preparation
- [x] Frontend: SVG path generation
- [x] Frontend: Axis labels rendering
- [x] Frontend: Responsive viewBox
- [x] CSS: Chart styling

**Story Points**: 5
**Status**: ✅ Done

---

### Story 5.4: Daily Statistics Summary
**As a** admin
**I want to** see daily averages and peak activity day
**So that** I can understand typical activity levels

**Acceptance Criteria**:
- ✅ 일평균 신규 가입
- ✅ 일평균 전단지 등록
- ✅ 최고 활동일 표시

**Tasks**:
- [x] Frontend: Daily average calculation
- [x] Frontend: Peak day detection
- [x] Frontend: Summary stats 컴포넌트
- [x] CSS: Summary section styling

**Story Points**: 2
**Status**: ✅ Done

---

### Story 5.5: Activity Timeline Feed
**As a** admin
**I want to** see a chronological list of recent activities
**So that** I can monitor what's happening on the platform

**Acceptance Criteria**:
- ✅ 최근 50개 활동 표시
- ✅ 활동별 아이콘 (👤 가입, 📄 전단지, 🎉 마일스톤)
- ✅ 활동별 색상 코딩
- ✅ 상대적 시간 표시 (방금 전, N분 전, N일 전)
- ✅ 호버 효과 (배경 변경, 슬라이드)
- ✅ 전체 개수 표시

**Tasks**:
- [x] Frontend: Activity list 컴포넌트
- [x] Frontend: Relative time formatting
- [x] Frontend: Icon mapping
- [x] Frontend: Hover animations
- [x] CSS: Timeline styling

**Story Points**: 3
**Status**: ✅ Done

---

### Story 5.6: Activity Data Generation
**As a** developer
**I want to** generate activity data from existing data
**So that** admins can see meaningful activities

**Acceptance Criteria**:
- ✅ 사용자 생성 → 신규 가입 활동
- ✅ 전단지 생성 → 전단지 등록 활동
- ✅ 조회수 1,000회 → 마일스톤 활동
- ✅ 조회수 5,000회 → 마일스톤 활동
- ✅ 타임스탬프 기반 정렬

**Tasks**:
- [x] Frontend: Activity generation logic
- [x] Frontend: Milestone detection
- [x] Frontend: Activity sorting
- [x] Frontend: Deduplication

**Story Points**: 3
**Status**: ✅ Done

---

## Technical Specifications

### Component Architecture

```
PlatformActivityFeed Component
├── Header
│   ├── Title: "플랫폼 활동 피드"
│   └── TimeFilters (4 buttons)
├── StatisticsCards (grid 4 columns)
│   ├── TotalActivityCard
│   ├── UserRegistrationCard
│   ├── FlyerCreationCard
│   └── MilestoneCard
├── ActivityTrendChart
│   ├── ChartHeader
│   │   └── Legend
│   ├── SVGChart
│   │   ├── GridLines
│   │   ├── XAxis
│   │   ├── YAxis
│   │   ├── DataLines (3 lines)
│   │   └── DataPoints
│   └── DailySummary (3 stats)
└── ActivityTimeline
    ├── TimelineHeader
    └── ActivityList
        └── ActivityItems[] (max 50)
```

### Data Models

```typescript
interface Activity {
  id: string;
  type: 'user_registered' | 'flyer_created' | 'milestone_views';
  timestamp: Date;
  icon: string;
  title: string;
  description: string;
  color: string;
}

interface ChartDataPoint {
  date: string;
  user_registered: number;
  flyer_created: number;
  milestone_views: number;
}
```

### Chart Specifications

```typescript
// Time Range Mapping
const timeRangeConfig = {
  today: { days: 1, label: '오늘' },
  week: { days: 7, label: '이번 주' },
  month: { days: 30, label: '이번 달' },
  all: { days: 90, label: '전체' }
};

// Line Colors
const lineColors = {
  user_registered: '#667eea',   // Blue
  flyer_created: '#10b981',     // Green
  milestone_views: '#f59e0b'    // Orange
};

// Chart Dimensions
const chartHeight = 300; // pixels
const padding = { top: 20, right: 20, bottom: 40, left: 50 };
```

### Activity Generation Logic

```typescript
// Generate activities from data
const activities = [];

// User registrations
users.forEach(user => {
  activities.push({
    id: `user-${user.id}`,
    type: 'user_registered',
    timestamp: new Date(user.createdAt),
    icon: '👤',
    title: '새 사용자 가입',
    description: `${user.email} (${role})`,
    color: '#667eea'
  });
});

// Flyer creations
flyers.forEach(flyer => {
  activities.push({
    id: `flyer-${flyer.id}`,
    type: 'flyer_created',
    timestamp: new Date(flyer.createdAt),
    icon: '📄',
    title: '새 전단지 등록',
    description: `${flyer.merchantEmail} - "${flyer.title}"`,
    color: '#10b981'
  });
});

// Milestones
flyers.forEach(flyer => {
  if (flyer.viewCount >= 1000 && flyer.viewCount < 1010) {
    activities.push({
      id: `milestone-view-${flyer.id}`,
      type: 'milestone_views',
      timestamp: new Date(flyer.updatedAt),
      icon: '🎉',
      title: '조회수 1,000회 돌파',
      description: `"${flyer.title}"`,
      color: '#f59e0b'
    });
  }
});

// Sort by timestamp (most recent first)
activities.sort((a, b) => b.timestamp - a.timestamp);
```

### Relative Time Formatting

```typescript
function getRelativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return '방금 전';
  if (minutes < 60) return `${minutes}분 전`;
  if (hours < 24) return `${hours}시간 전`;
  if (days < 7) return `${days}일 전`;
  return date.toLocaleDateString('ko-KR');
}
```

## Design Specifications

### Activity Timeline
- Card padding: 16px
- Icon size: 32px × 32px
- Border-left: 4px solid (activity color)
- Hover: background #f3f4f6, translateX(4px)

### Chart
- SVG viewBox: 0 0 100 300
- Grid lines: #f3f4f6, dashed
- Line width: 2px
- Point radius: 1.5px
- Labels: 11px, #6b7280

### Colors
| Activity Type | Color | Icon |
|---------------|-------|------|
| User Registered | #667eea | 👤 |
| Flyer Created | #10b981 | 📄 |
| Milestone 1K | #f59e0b | 🎉 |
| Milestone 5K | #8b5cf6 | 🌟 |

## Performance Considerations

### Data Processing
- ✅ 활동 생성: O(n) where n = users + flyers
- ✅ 시간 필터링: O(n) where n = activities
- ✅ 차트 데이터 준비: O(n + d) where d = days in range

### Rendering
- ✅ Timeline: 최대 50개 활동 표시
- ✅ Chart: SVG 기반 (고성능)
- ✅ Memoization 가능 (useMemo)

### Future Optimization
- [ ] 백엔드에서 활동 이벤트 생성 및 저장
- [ ] 서버 사이드 집계
- [ ] WebSocket 실시간 업데이트
- [ ] Infinite scroll for timeline

## Testing Strategy

### Unit Tests
- [ ] Activity generation logic
- [ ] Time range filtering
- [ ] Daily statistics calculation
- [ ] Relative time formatting

### Integration Tests
- [ ] Activity data loading
- [ ] Chart rendering
- [ ] Timeline rendering

### E2E Tests
- [ ] View activity feed
- [ ] Change time filter
- [ ] Verify chart updates
- [ ] Scroll timeline

## Deployment Checklist

- [x] Frontend 컴포넌트 구현
- [x] 활동 생성 로직 구현
- [x] 시계열 차트 구현
- [x] 타임라인 피드 구현
- [ ] Unit tests
- [ ] E2E tests
- [ ] Performance testing
- [ ] Documentation

## Risks & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| 대량 활동 성능 저하 | Medium | Medium | Pagination, server-side |
| 실시간 데이터 누락 | Medium | High | WebSocket (Phase 2) |
| 차트 렌더링 오류 | Low | Low | SVG validation, tests |
| 메모리 사용 증가 | Medium | Medium | 활동 수 제한 (50개) |

## Related Epics

- **Depends on**: EPIC-001 Admin Dashboard Foundation
- **Related**: EPIC-002 User Management System
- **Related**: EPIC-003 Flyer Statistics Dashboard

## Future Enhancements

### Phase 2
- [ ] 백엔드 활동 이벤트 테이블
- [ ] WebSocket 실시간 업데이트
- [ ] 사용자별 활동 필터
- [ ] 지역별 활동 필터

### Phase 3
- [ ] 활동 알림 시스템
- [ ] 활동 상세 페이지
- [ ] CSV 내보내기
- [ ] 활동 리포트 생성

## Notes

- 현재 버전은 기존 데이터에서 활동 생성 (클라이언트 사이드)
- 실제 프로덕션에서는 백엔드에서 활동 이벤트 저장 권장
- 마일스톤 감지는 view count 범위로 구현 (1000-1010, 5000-5010)
- WebSocket 실시간 업데이트는 Phase 2에서 구현 예정

## Changelog

- **2025-11-30**: Epic completed
  - Platform activity feed implemented
  - Time range filtering added (today, week, month, all)
  - Activity statistics cards added (4 cards)
  - Time-series activity trend chart implemented
    - 3 lines (user registration, flyer creation, milestones)
    - SVG-based responsive chart
    - Auto-scaling Y-axis
    - Grid lines and labels
  - Daily statistics summary added
  - Activity timeline feed implemented
    - Recent 50 activities
    - Icon and color coding
    - Relative time display
    - Hover animations
