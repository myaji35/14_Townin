# Epic 004: Region Management System

## Epic Overview

**Epic ID**: EPIC-004
**Title**: Region Management System
**Priority**: P1 (High)
**Status**: ✅ Completed
**Estimated Effort**: 4 days
**Actual Effort**: 2 days

## Business Value

관리자가 전국 지역 정보를 효율적으로 관리할 수 있도록 계층적 선택 UI를 제공합니다. 기존 트리 뷰 방식에서 선택 기반 UI로 전환하여 사용성을 개선하고, 지역 마스터 배정 및 지역 정보 수정 기능을 제공합니다.

### Target Users
- **Super Admin**: 전국 지역 관리
- **Municipality**: 담당 지역 정보 관리

### Success Metrics
- ✅ 계층적 지역 선택 (시/도 → 시/군/구 → 동/읍/면)
- ✅ 지역 정보 테이블 뷰
- ✅ 마스터 배정 기능
- ✅ 지역 정보 수정 기능
- ✅ Breadcrumb 네비게이션

## Epic Scope

### In Scope
1. ✅ 계층적 지역 선택 UI (2단계: 시/도 → 시/군/구)
2. ✅ 지역 검색 기능
3. ✅ Breadcrumb 네비게이션
4. ✅ 지역 정보 테이블
   - 지역명 (하위 개수 배지)
   - 레벨 배지
   - 지역 코드
   - 사용자/상인/전단지 수
   - 마스터 배정 상태
   - 살기좋은동네지수 & 안전점수
   - 활성/비활성 상태
5. ✅ 지역 정보 편집 모달
6. ✅ 마스터 배정 모달
7. ✅ 새 지역 추가 기능

### Out of Scope
- ❌ 지역 일괄 업로드
- ❌ 지역 삭제 기능 (데이터 무결성)
- ❌ 지역 병합 기능
- ❌ 지역 통계 그래프

## User Stories

### Story 4.1: Hierarchical Region Selection
**As a** admin
**I want to** select regions hierarchically
**So that** I can navigate the region tree easily

**Acceptance Criteria**:
- ✅ 시/도 선택 드롭다운
- ✅ 시/군/구 선택 드롭다운 (동적 로드)
- ✅ 선택 시 하위 지역 목록 표시
- ✅ 선택 초기화 버튼

**Tasks**:
- [x] Frontend: Region selector dropdowns
- [x] Frontend: Dynamic children loading
- [x] Frontend: Clear selection button
- [x] CSS: Dropdown styling

**Story Points**: 3
**Status**: ✅ Done

---

### Story 4.2: Breadcrumb Navigation
**As a** admin
**I want to** see my current location in the region hierarchy
**So that** I can navigate back easily

**Acceptance Criteria**:
- ✅ Breadcrumb 경로 표시 (Home → 시/도 → 시/군/구)
- ✅ 클릭 가능한 breadcrumb
- ✅ 현재 위치 강조

**Tasks**:
- [x] Frontend: Breadcrumb 컴포넌트
- [x] Frontend: Navigation logic
- [x] CSS: Active breadcrumb styling

**Story Points**: 2
**Status**: ✅ Done

---

### Story 4.3: Region Search
**As a** admin
**I want to** search regions by name
**So that** I can quickly find specific regions

**Acceptance Criteria**:
- ✅ 지역명 검색 입력 필드
- ✅ 실시간 필터링
- ✅ 대소문자 무관 검색
- ✅ 부분 일치 검색

**Tasks**:
- [x] Frontend: Search input 컴포넌트
- [x] Frontend: Filter logic
- [x] CSS: Search box styling

**Story Points**: 1
**Status**: ✅ Done

---

### Story 4.4: Region Information Table
**As a** admin
**I want to** see detailed region information in a table
**So that** I can understand region status at a glance

**Acceptance Criteria**:
- ✅ 테이블 컬럼: 지역명, 레벨, 코드, 사용자수, 상인수, 전단지수, 마스터, 지수, 상태
- ✅ 하위 지역 개수 배지
- ✅ 레벨별 배지 색상 (시/도, 시/군/구, 동/읍/면)
- ✅ 활성/비활성 상태 표시

**Tasks**:
- [x] Frontend: Region table 컴포넌트
- [x] Frontend: Badge 컴포넌트
- [x] Frontend: Data formatting
- [x] CSS: Table styling

**Story Points**: 3
**Status**: ✅ Done

---

### Story 4.5: Region Edit Modal
**As a** admin
**I want to** edit region information
**So that** I can update indices and status

**Acceptance Criteria**:
- ✅ 모달 UI (지역명 표시)
- ✅ 살기좋은동네지수 입력 (number)
- ✅ 안전점수 입력 (number)
- ✅ 활성/비활성 토글
- ✅ 저장 버튼

**Tasks**:
- [x] Frontend: Edit modal 컴포넌트
- [x] Frontend: Form validation
- [x] Frontend: Save logic
- [x] Backend: PATCH /regions/:id API (이미 구현됨)

**Story Points**: 2
**Status**: ✅ Done

---

### Story 4.6: Master Assignment Modal
**As a** admin
**I want to** assign a master to a region
**So that** regional management can be delegated

**Acceptance Criteria**:
- ✅ 모달 UI (지역명 표시)
- ✅ 사용자 목록 (security_guard 역할만)
- ✅ 현재 마스터 강조 표시
- ✅ 배정 버튼

**Tasks**:
- [x] Frontend: Master assignment modal
- [x] Frontend: User filtering (by role)
- [x] Frontend: Current master highlight
- [x] Backend: POST /regions/:id/master API (이미 구현됨)

**Story Points**: 2
**Status**: ✅ Done

---

### Story 4.7: Add New Region
**As a** super admin
**I want to** add a new region
**So that** I can expand coverage

**Acceptance Criteria**:
- ✅ 새 지역 추가 버튼
- ✅ 모달 UI (상위 지역 선택, 지역명, 코드 입력)
- ✅ 레벨 자동 설정
- ✅ 생성 버튼

**Tasks**:
- [x] Frontend: Add region modal
- [x] Frontend: Parent selection
- [x] Frontend: Form validation
- [x] Backend: POST /regions API (이미 구현됨)

**Story Points**: 3
**Status**: ✅ Done

---

## Technical Specifications

### Component Architecture

```
RegionsManagement Component
├── Header
│   ├── SearchInput
│   └── AddNewRegionButton
├── RegionSelector
│   ├── Breadcrumb (clickable)
│   ├── CitySelect
│   └── DistrictSelect
├── RegionTable
│   ├── TableHeader
│   └── TableRows[]
│       ├── RegionName (+ children count badge)
│       ├── LevelBadge
│       ├── RegionCode
│       ├── UserCount
│       ├── MerchantCount
│       ├── FlyerCount
│       ├── MasterInfo
│       ├── LivabilityIndex
│       ├── SafetyScore
│       ├── ActiveStatus
│       └── Actions
│           ├── EditButton
│           └── AssignMasterButton
└── Modals
    ├── RegionEditModal
    ├── MasterAssignmentModal
    └── AddRegionModal
```

### Data Flow

```typescript
// State Management
const [searchQuery, setSearchQuery] = useState('');
const [selectedCity, setSelectedCity] = useState<RegionData | null>(null);
const [selectedDistrict, setSelectedDistrict] = useState<RegionData | null>(null);

// Region Hierarchy
const cities = regions; // Top-level regions
const districts = selectedCity?.children || [];
const neighborhoods = selectedDistrict?.children || [];

// Display Logic
const displayRegions = selectedDistrict
  ? neighborhoods
  : selectedCity
  ? districts
  : cities;

// Search Filter
const filteredRegions = displayRegions.filter(r =>
  r.name.toLowerCase().includes(searchQuery.toLowerCase())
);
```

### API Endpoints

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | /regions/hierarchy | Get region tree | - | RegionData[] |
| PATCH | /regions/:id | Update region | `{ livabilityIndex?, safetyScore?, isActive? }` | RegionData |
| POST | /regions/:id/master | Assign master | `{ userId: string }` | RegionData |
| POST | /regions | Create region | `{ name, code, parentId?, level }` | RegionData |

### Data Models

```typescript
interface RegionData {
  id: string;
  name: string;
  code: string;
  level: 'city' | 'district' | 'neighborhood';
  parentId?: string;
  masterId?: string;
  master?: {
    id: string;
    email: string;
  };
  livabilityIndex: number;
  safetyScore: number;
  totalUsers: number;
  totalMerchants: number;
  totalFlyers: number;
  isActive: boolean;
  children?: RegionData[];
}
```

### UI Components

```typescript
// Level Badge Colors
const levelColors = {
  'city': '#3b82f6',        // Blue
  'district': '#10b981',    // Green
  'neighborhood': '#f59e0b' // Orange
};

// Level Labels
const levelLabels = {
  'city': '시/도',
  'district': '시/군/구',
  'neighborhood': '동/읍/면'
};
```

## Design Specifications

### Breadcrumb
- Font: 14px, weight: 500
- Separator: "→"
- Active: #667eea, weight: 600
- Inactive: #6b7280, clickable

### Table
- Row height: auto
- Cell padding: 16px
- Border: 1px solid #e5e7eb
- Hover: background #f9fafb

### Badges
- Level badge: padding 4px 8px, borderRadius 12px
- Children count: background #e0e7ff, color #3730a3
- Status badge: active (green), inactive (red)

## Performance Considerations

### Data Loading
- ✅ 초기 로드: 전체 계층 구조 (1회)
- ✅ 지역 선택: 메모리에서 필터링
- ✅ 검색: 클라이언트 사이드 필터링

### Rendering
- ✅ 조건부 렌더링 (선택된 레벨만 표시)
- ✅ 가상 스크롤 고려 (대량 지역)
- ✅ Memoization 가능 (useMemo)

## Testing Strategy

### Unit Tests
- [ ] Region filtering logic
- [ ] Breadcrumb navigation
- [ ] Search filtering
- [ ] Level badge rendering

### Integration Tests
- [ ] Region hierarchy loading
- [ ] Region update API
- [ ] Master assignment API

### E2E Tests
- [ ] Navigate region hierarchy
- [ ] Edit region information
- [ ] Assign master to region
- [ ] Add new region

## Deployment Checklist

- [x] Frontend 컴포넌트 구현
- [x] 지역 선택 UI 구현
- [x] 편집 모달 구현
- [x] 마스터 배정 모달 구현
- [ ] Unit tests
- [ ] E2E tests
- [ ] Documentation

## Risks & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| 대량 지역 성능 저하 | Medium | Low | Virtual scrolling |
| 계층 구조 손상 | High | Low | Validation, constraints |
| 마스터 중복 배정 | Medium | Low | Unique constraint |
| 지역 삭제 요구 | Medium | Medium | Soft delete only |

## Related Epics

- **Depends on**: EPIC-001 Admin Dashboard Foundation
- **Related**: EPIC-002 User Management System
- **Next**: EPIC-005 Platform Activity Monitoring

## Notes

- 지역 삭제는 데이터 무결성 때문에 지원하지 않음 (비활성화만 가능)
- 마스터는 security_guard 역할만 배정 가능
- 살기좋은동네지수와 안전점수는 수동 입력
- 향후 지역 통계 자동 계산 기능 추가 예정

## Changelog

- **2025-11-30**: Epic completed
  - Hierarchical region selection UI implemented (city → district)
  - Region search added
  - Breadcrumb navigation added
  - Region information table implemented
  - Region edit modal added
  - Master assignment modal added
  - Add new region functionality added
  - Transformed from tree view to selection-based UI
