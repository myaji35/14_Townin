# Epic 001: Admin Dashboard Foundation

## Epic Overview

**Epic ID**: EPIC-001
**Title**: Admin Dashboard Foundation
**Priority**: P0 (Critical)
**Status**: ✅ Completed
**Estimated Effort**: 3 days
**Actual Effort**: 2 days

## Business Value

관리자가 Townin 플랫폼의 전체 현황을 모니터링하고 기본적인 관리 작업을 수행할 수 있는 중앙 집중식 대시보드를 제공합니다.

### Target Users
- **Super Admin**: 전체 플랫폼 관리자
- **Municipality**: 지자체 담당자

### Success Metrics
- ✅ 관리자 로그인 성공률 100%
- ✅ 대시보드 로딩 시간 < 2초
- ✅ 5개 핵심 탭 모두 접근 가능
- ✅ 반응형 UI 지원 (데스크톱, 태블릿)

## Epic Scope

### In Scope
1. ✅ 관리자 인증 및 권한 관리
2. ✅ 대시보드 레이아웃 및 네비게이션
3. ✅ 5개 핵심 기능 탭
4. ✅ 기본 통계 카드
5. ✅ 사용자 세션 관리

### Out of Scope
- ❌ 상세 분석 및 리포트 생성
- ❌ 알림 및 경고 시스템
- ❌ 대시보드 커스터마이제이션
- ❌ 모바일 앱 버전

## User Stories

### Story 1.1: Admin Authentication
**As a** super admin
**I want to** log in to the admin dashboard securely
**So that** I can access platform management features

**Acceptance Criteria**:
- ✅ JWT 기반 인증 구현
- ✅ Role-based access control (RBAC)
- ✅ Session timeout (2시간)
- ✅ 로그아웃 기능

**Tasks**:
- [x] Backend: JWT auth guard 구현
- [x] Backend: Role decorator 구현
- [x] Frontend: Login page 구현
- [x] Frontend: Auth service 구현
- [x] Frontend: Protected routes 설정

**Story Points**: 3
**Status**: ✅ Done

---

### Story 1.2: Dashboard Layout & Navigation
**As a** admin
**I want to** navigate between different management sections easily
**So that** I can efficiently perform my tasks

**Acceptance Criteria**:
- ✅ 반응형 헤더 (사용자 정보, 로그아웃)
- ✅ 5개 탭 네비게이션 (대시보드, 사용자, 전단지, 지역, 활동로그)
- ✅ 탭 활성 상태 표시
- ✅ 그라디언트 디자인 (#667eea ~ #764ba2)

**Tasks**:
- [x] Frontend: Dashboard header 컴포넌트
- [x] Frontend: Tab navigation 컴포넌트
- [x] Frontend: Responsive layout (max-width: 1200px)
- [x] CSS: 디자인 시스템 적용

**Story Points**: 2
**Status**: ✅ Done

---

### Story 1.3: Overview Statistics Cards
**As a** admin
**I want to** see key platform metrics at a glance
**So that** I can quickly assess platform health

**Acceptance Criteria**:
- ✅ 총 사용자 수 카드
- ✅ 총 상인 수 카드
- ✅ 활성 전단지 수 카드
- ✅ 총 지역 수 카드
- ✅ 자동 새로고침 (탭 전환 시)

**Tasks**:
- [x] Backend: GET /admin/stats API
- [x] Frontend: Stats cards 컴포넌트
- [x] Frontend: Data loading 상태 처리
- [x] Frontend: Error handling

**Story Points**: 2
**Status**: ✅ Done

---

## Technical Specifications

### Architecture

```
┌─────────────────────────────────────┐
│     Admin Dashboard (React)         │
├─────────────────────────────────────┤
│  Header  │  User Info │  Logout     │
├─────────────────────────────────────┤
│  Tab Navigation (5 tabs)            │
├─────────────────────────────────────┤
│  Tab Content Area                   │
│  ┌───────────────────────────────┐  │
│  │  Dynamic Component Loading    │  │
│  │  - Overview Stats             │  │
│  │  - User Management            │  │
│  │  - Flyer Stats                │  │
│  │  - Region Management          │  │
│  │  - Activity Feed              │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

### API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /auth/login | Admin login | Public |
| GET | /admin/stats | Get platform statistics | Admin |
| GET | /admin/users | Get all users | Admin |
| GET | /admin/flyers | Get all flyers | Admin |
| GET | /regions/hierarchy | Get region tree | Admin |

### Data Models

```typescript
interface AdminStats {
  totalUsers: number;
  totalMerchants: number;
  totalFlyers: number;
  activeFlyers: number;
  totalRegions: number;
}

interface UserData {
  id: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}
```

### Security

- ✅ JWT token 인증
- ✅ Role-based access control
- ✅ CORS 설정
- ✅ Input validation
- ✅ SQL injection 방지 (TypeORM)

## Dependencies

### Prerequisites
- ✅ NestJS backend with TypeORM
- ✅ PostgreSQL database
- ✅ React frontend with React Router
- ✅ JWT authentication module

### External Dependencies
- ✅ @nestjs/jwt
- ✅ @nestjs/passport
- ✅ react-router-dom
- ✅ axios

## Testing Strategy

### Unit Tests
- [ ] Auth guard 테스트
- [ ] Role decorator 테스트
- [ ] Auth service 테스트

### Integration Tests
- [ ] Admin login flow
- [ ] Protected route access
- [ ] Stats API 호출

### E2E Tests
- [ ] Admin login → Dashboard 진입
- [ ] Tab navigation
- [ ] 로그아웃

## Deployment Checklist

- [x] Backend API 배포
- [x] Frontend build & deploy
- [x] Database migration
- [x] Environment variables 설정
- [ ] Monitoring 설정
- [ ] Documentation 업데이트

## Risks & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| 인증 토큰 탈취 | High | Low | HTTPS only, short expiry |
| 권한 우회 | High | Low | Role guard 강화, 테스트 |
| 성능 저하 (대량 데이터) | Medium | Medium | Pagination, caching |

## Related Epics

- **Next**: EPIC-002 User Management System
- **Next**: EPIC-003 Flyer Statistics Dashboard
- **Next**: EPIC-004 Region Management System
- **Next**: EPIC-005 Platform Activity Monitoring

## Notes

- 초기 버전은 최소 기능으로 구현 (MVP)
- 향후 대시보드 커스터마이제이션 기능 추가 예정
- 실시간 업데이트는 Phase 2에서 WebSocket으로 구현 예정

## Changelog

- **2025-11-30**: Epic completed
  - Admin authentication implemented
  - Dashboard layout created
  - 5 tabs navigation added
  - Overview statistics cards implemented
