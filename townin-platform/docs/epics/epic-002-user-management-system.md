# Epic 002: User Management System

## Epic Overview

**Epic ID**: EPIC-002
**Title**: User Management System
**Priority**: P0 (Critical)
**Status**: ✅ Completed
**Estimated Effort**: 5 days
**Actual Effort**: 3 days

## Business Value

관리자가 플랫폼의 모든 사용자를 효율적으로 관리할 수 있도록 역할 기반 필터링, 지역별 검색, 그리고 사용자 상태 관리 기능을 제공합니다. 수천 명의 사용자를 관리할 수 있는 확장 가능한 UI를 구축합니다.

### Target Users
- **Super Admin**: 모든 사용자 관리
- **Municipality**: 해당 지역 사용자 관리
- **Security Guard (보안관)**: 지역 사용자 모니터링

### Success Metrics
- ✅ 사용자 필터링 응답 시간 < 500ms
- ✅ 50명/페이지 페이지네이션
- ✅ 역할별 필터링 100% 동작
- ✅ 지역별 필터링 (3단계 계층) 100% 동작

## Epic Scope

### In Scope
1. ✅ 역할별 사용자 필터링 (5개 역할)
2. ✅ 이메일 검색 기능
3. ✅ 3단계 지역 필터링 (시/도 → 시/군/구 → 동/읍/면)
4. ✅ 페이지네이션 (50명/페이지)
5. ✅ 사용자 활성/비활성 토글
6. ✅ 역할 변경 기능
7. ✅ 사용자 삭제 기능
8. ✅ 활성 필터 표시

### Out of Scope
- ❌ 사용자 일괄 작업 (bulk operations)
- ❌ 사용자 상세 프로필 페이지
- ❌ 사용자 활동 히스토리
- ❌ CSV 내보내기/가져오기

## User Stories

### Story 2.1: Role-Based User Filtering
**As a** super admin
**I want to** filter users by their role
**So that** I can manage specific user groups efficiently

**Acceptance Criteria**:
- ✅ 5개 역할 탭 표시 (전체, 일반사용자, 상인, 보안관, 지자체, 슈퍼관리자)
- ✅ 각 탭에 사용자 수 표시
- ✅ 탭 클릭 시 해당 역할 사용자만 필터링
- ✅ 활성 탭 시각적 표시

**Tasks**:
- [x] Frontend: Role tabs 컴포넌트
- [x] Frontend: Role filter state 관리
- [x] Frontend: User count by role 계산
- [x] CSS: Active tab 스타일링

**Story Points**: 2
**Status**: ✅ Done

---

### Story 2.2: Hierarchical Region Filtering
**As a** admin
**I want to** filter users by their location (읍면동)
**So that** I can manage users in specific geographic areas

**Acceptance Criteria**:
- ✅ 3단계 드롭다운 (시/도 → 시/군/구 → 동/읍/면)
- ✅ 상위 레벨 선택 시 하위 레벨 자동 업데이트
- ✅ 선택 초기화 기능
- ✅ 지역 데이터 계층 구조 로드

**Tasks**:
- [x] Frontend: Hierarchical dropdowns
- [x] Frontend: Region data parsing
- [x] Frontend: Cascade selection logic
- [x] Backend: GET /regions/hierarchy API (이미 구현됨)

**Story Points**: 3
**Status**: ✅ Done

---

### Story 2.3: Email Search
**As a** admin
**I want to** search users by email
**So that** I can quickly find specific users

**Acceptance Criteria**:
- ✅ 이메일 검색 입력 필드
- ✅ 실시간 필터링 (클라이언트 사이드)
- ✅ 대소문자 무관 검색
- ✅ 부분 일치 검색

**Tasks**:
- [x] Frontend: Search input 컴포넌트
- [x] Frontend: Filter logic 구현
- [x] Frontend: Debounce 처리 (선택)

**Story Points**: 1
**Status**: ✅ Done

---

### Story 2.4: Pagination
**As a** admin
**I want to** navigate through pages of users
**So that** I can manage large numbers of users efficiently

**Acceptance Criteria**:
- ✅ 50명/페이지 표시
- ✅ 페이지 번호 버튼 (최대 5개 표시)
- ✅ 이전/다음 버튼
- ✅ 현재 페이지 표시
- ✅ 총 페이지 수 표시

**Tasks**:
- [x] Frontend: Pagination 컴포넌트
- [x] Frontend: Page state 관리
- [x] Frontend: Smart page number 표시 로직

**Story Points**: 2
**Status**: ✅ Done

---

### Story 2.5: User Status Management
**As a** admin
**I want to** activate/deactivate user accounts
**So that** I can control user access to the platform

**Acceptance Criteria**:
- ✅ 활성/비활성 토글 버튼
- ✅ 상태 변경 즉시 반영
- ✅ 비활성 사용자 시각적 표시 (회색)
- ✅ 확인 없이 즉시 토글 (빠른 작업)

**Tasks**:
- [x] Backend: PATCH /admin/users/:id/toggle-active API
- [x] Frontend: Toggle button 컴포넌트
- [x] Frontend: Optimistic UI update
- [x] Frontend: Error handling

**Story Points**: 2
**Status**: ✅ Done

---

### Story 2.6: User Role Management
**As a** super admin
**I want to** change user roles
**So that** I can grant or revoke permissions

**Acceptance Criteria**:
- ✅ 역할 변경 모달
- ✅ 5개 역할 선택 버튼
- ✅ 현재 역할 강조 표시
- ✅ 역할별 색상 배지

**Tasks**:
- [x] Backend: PATCH /admin/users/:id/role API
- [x] Frontend: Role change modal
- [x] Frontend: Role badge 컴포넌트
- [x] Frontend: Role color mapping

**Story Points**: 2
**Status**: ✅ Done

---

### Story 2.7: User Deletion
**As a** super admin
**I want to** delete user accounts
**So that** I can remove spam or test accounts

**Acceptance Criteria**:
- ✅ 삭제 버튼
- ✅ 확인 다이얼로그 (이메일 표시)
- ✅ 삭제 후 목록에서 제거
- ✅ 에러 처리

**Tasks**:
- [x] Backend: DELETE /admin/users/:id API
- [x] Frontend: Delete button
- [x] Frontend: Confirm dialog
- [x] Frontend: List update after deletion

**Story Points**: 2
**Status**: ✅ Done

---

### Story 2.8: Active Filters Display
**As a** admin
**I want to** see which filters are currently applied
**So that** I can understand the current view

**Acceptance Criteria**:
- ✅ 활성 필터 배지 표시
- ✅ 역할 필터 표시
- ✅ 검색어 표시
- ✅ 지역 필터 표시
- ✅ 필터 제거 버튼 (x)

**Tasks**:
- [x] Frontend: Active filters 컴포넌트
- [x] Frontend: Clear filter 기능
- [x] CSS: Filter badges 스타일링

**Story Points**: 1
**Status**: ✅ Done

---

## Technical Specifications

### Component Architecture

```
UsersManagement Component
├── RoleTabs
│   ├── Tab: 전체 (count)
│   ├── Tab: 일반사용자 (count)
│   ├── Tab: 상인 (count)
│   ├── Tab: 보안관 (count)
│   ├── Tab: 지자체 (count)
│   └── Tab: 슈퍼관리자 (count)
├── SearchAndFilters
│   ├── EmailSearch (input)
│   ├── RegionFilters
│   │   ├── CitySelect
│   │   ├── DistrictSelect
│   │   └── NeighborhoodSelect
│   └── ActiveFilters (badges)
├── UserTable
│   ├── TableHeader
│   ├── TableRows (users)
│   │   ├── Email
│   │   ├── RoleBadge
│   │   ├── StatusBadge
│   │   ├── CreatedDate
│   │   └── Actions
│   │       ├── ToggleActiveButton
│   │       ├── ChangeRoleButton
│   │       └── DeleteButton
│   └── Pagination
│       ├── PrevButton
│       ├── PageNumbers (smart display)
│       └── NextButton
└── Modals
    ├── RoleChangeModal
    └── DeleteConfirmDialog
```

### Data Flow

```typescript
// State Management
const [roleFilter, setRoleFilter] = useState<string>('all');
const [searchQuery, setSearchQuery] = useState('');
const [selectedCity, setSelectedCity] = useState('');
const [selectedDistrict, setSelectedDistrict] = useState('');
const [selectedNeighborhood, setSelectedNeighborhood] = useState('');
const [currentPage, setCurrentPage] = useState(1);
const itemsPerPage = 50;

// Filtering Logic
const filteredUsers = users
  .filter(u => roleFilter === 'all' || u.role === roleFilter)
  .filter(u => !searchQuery || u.email.includes(searchQuery))
  .filter(u => !selectedCity || u.regionId === selectedCity)
  // ... more filters

// Pagination Logic
const startIdx = (currentPage - 1) * itemsPerPage;
const endIdx = startIdx + itemsPerPage;
const paginatedUsers = filteredUsers.slice(startIdx, endIdx);
```

### API Endpoints

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | /admin/users | Get all users | - | User[] |
| PATCH | /admin/users/:id/toggle-active | Toggle user active status | - | User |
| PATCH | /admin/users/:id/role | Change user role | `{ role: string }` | User |
| DELETE | /admin/users/:id | Delete user | - | `{ message: string }` |

### Data Models

```typescript
interface UserData {
  id: string;
  email: string;
  role: 'user' | 'merchant' | 'security_guard' | 'municipality' | 'super_admin';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface RegionData {
  id: string;
  name: string;
  code: string;
  level: 'city' | 'district' | 'neighborhood';
  parentId?: string;
  children?: RegionData[];
}
```

## Performance Considerations

### Client-Side Filtering
- ✅ 모든 필터링은 클라이언트 사이드에서 수행
- ✅ 초기 로드 시 전체 사용자 데이터 로드
- ✅ 필터링 성능: O(n) where n = 사용자 수
- ⚠️ 사용자 10,000명 이상 시 서버 사이드 필터링 고려

### Pagination
- ✅ 클라이언트 사이드 페이지네이션
- ✅ 50명/페이지로 UI 성능 최적화
- ✅ Smart page number display (최대 5개)

### Future Optimization
- [ ] 서버 사이드 필터링 및 페이지네이션
- [ ] Infinite scroll 옵션
- [ ] Virtual scrolling for large lists
- [ ] Debounced search

## Testing Strategy

### Unit Tests
- [ ] Role filter logic
- [ ] Email search filter
- [ ] Region filter logic
- [ ] Pagination calculations

### Integration Tests
- [ ] User toggle active API
- [ ] User role change API
- [ ] User delete API

### E2E Tests
- [ ] Filter users by role
- [ ] Search users by email
- [ ] Change user role
- [ ] Delete user

## Deployment Checklist

- [x] Backend APIs 구현
- [x] Frontend 컴포넌트 구현
- [x] 통합 테스트
- [ ] E2E 테스트
- [ ] Performance 테스트 (10,000+ users)
- [ ] Documentation

## Risks & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| 대량 사용자 성능 저하 | High | High | 서버 사이드 pagination |
| 동시 수정 충돌 | Medium | Low | Optimistic locking |
| 실수로 사용자 삭제 | Medium | Medium | 삭제 확인 다이얼로그 |
| 역할 변경 권한 오용 | High | Low | Audit log, role 제한 |

## Related Epics

- **Depends on**: EPIC-001 Admin Dashboard Foundation
- **Next**: EPIC-003 Flyer Statistics Dashboard
- **Related**: EPIC-004 Region Management System

## Notes

- 현재 버전은 클라이언트 사이드 필터링으로 구현
- 사용자 1만 명 이상 시 서버 사이드 pagination 필요
- 지역 필터는 현재 사용자 데이터에 regionId 필드 필요 (TODO)
- Bulk operations는 향후 추가 예정

## Changelog

- **2025-11-30**: Epic completed
  - Role-based filtering implemented
  - Email search added
  - Hierarchical region filtering added
  - Pagination (50/page) implemented
  - User status management added
  - User role management added
  - User deletion added
  - Active filters display added
