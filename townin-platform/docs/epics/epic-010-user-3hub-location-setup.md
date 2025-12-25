# Epic 010: User 3-Hub Location Setup

## Epic Overview

**Epic ID**: USR-002
**Title**: 3-Hub Location Setup
**Priority**: P0 (Critical)
**Status**: 📋 Planned
**Estimated Effort**: 3 days
**Phase**: Phase 1 - User App

## Business Value

Townin의 핵심 차별화 기능인 "3-Hub 위치 시스템"을 구현합니다. 사용자는 집(Home), 회사(Work), 본가(Family Home) 최대 3곳의 거점을 설정하여, Privacy-First H3 Grid Cell 기반으로 위치를 저장하고 각 거점 주변의 하이퍼로컬 정보를 받을 수 있습니다.

### Target Users
- **All Users**: 일상생활에서 여러 지역을 오가는 모든 사용자

### Success Metrics
- 3-Hub 설정 완료율 > 60%
- 평균 Hub 설정 수: 2.3개
- 위치 검색 정확도 > 95%
- Hub 수정 빈도: 월 0.5회 (안정성 지표)

## Epic Scope

### In Scope
1. ✅ 3-Hub 위치 선택 UI
2. ✅ 주소 검색 및 좌표 변환
3. ✅ H3 Grid Cell 자동 매핑
4. ✅ 지도 기반 위치 선택
5. ✅ Hub 별칭 설정 (Home/Work/Family)
6. ✅ Hub 수정/삭제
7. ✅ Hub별 맞춤 콘텐츠 제공

### Out of Scope
- ❌ 4개 이상 Hub 설정
- ❌ GPS 실시간 위치 추적
- ❌ 경로 기록 및 분석

## User Stories

### Story 10.1: Hub Setup Flow
**As a** new user
**I want to** set up my 3 location hubs
**So that** I can receive hyper-local information

**Acceptance Criteria**:
- [ ] Hub 설정 화면 진입 (온보딩 or 설정)
- [ ] 3가지 Hub 타입 선택 (Home/Work/Family)
- [ ] 주소 검색 또는 지도 클릭
- [ ] H3 Grid Cell 자동 변환
- [ ] 프리뷰 화면 (선택된 위치 확인)
- [ ] 저장 및 완료

**Tasks**:
- [ ] Frontend: Hub setup screen
- [ ] Frontend: Hub type selection
- [ ] Frontend: Address search integration
- [ ] Frontend: Map integration (Kakao/Naver)
- [ ] Backend: PATCH /users/:id/hubs

**Story Points**: 5
**Status**: 📋 Planned

---

### Story 10.2: Address Search & Geocoding
**As a** user
**I want to** search for addresses
**So that** I can easily find my locations

**Acceptance Criteria**:
- [ ] 주소 검색 입력 필드
- [ ] 자동완성 제안
- [ ] 도로명/지번 주소 지원
- [ ] 검색 결과 리스트
- [ ] 선택 시 좌표 변환
- [ ] H3 Grid Cell 계산

**Tasks**:
- [ ] Frontend: Address search UI
- [ ] Frontend: Autocomplete integration
- [ ] Backend: Kakao Local API integration
- [ ] Backend: latLngToCell conversion
- [ ] Backend: RegionId mapping

**Story Points**: 3
**Status**: 📋 Planned

---

### Story 10.3: Map-Based Location Selection
**As a** user
**I want to** pick my location on a map
**So that** I can choose the exact spot

**Acceptance Criteria**:
- [ ] 지도 UI (Kakao/Naver Map)
- [ ] 지도 클릭으로 위치 선택
- [ ] 마커 표시
- [ ] 주소 역지오코딩 (좌표 → 주소)
- [ ] Grid Cell boundary overlay
- [ ] 확인 버튼

**Tasks**:
- [ ] Frontend: Map component
- [ ] Frontend: Click event handling
- [ ] Frontend: Marker placement
- [ ] Backend: Reverse geocoding
- [ ] Frontend: H3 boundary visualization

**Story Points**: 5
**Status**: 📋 Planned

---

### Story 10.4: Hub Management
**As a** user
**I want to** view, edit, and delete my hubs
**So that** I can keep my locations up to date

**Acceptance Criteria**:
- [ ] Hub 목록 조회
- [ ] Hub별 정보 표시 (타입, 주소, 설정일)
- [ ] Hub 수정 (주소 변경)
- [ ] Hub 삭제
- [ ] 최대 3개 제한 표시

**Tasks**:
- [ ] Frontend: Hub list screen
- [ ] Frontend: Hub edit modal
- [ ] Frontend: Hub delete confirmation
- [ ] Backend: GET /users/me/hubs
- [ ] Backend: DELETE /users/:id/hubs/:hubId

**Story Points**: 3
**Status**: 📋 Planned

---

### Story 10.5: Hub-Based Content Filtering
**As a** user
**I want to** see flyers near my hubs
**So that** I get relevant local information

**Acceptance Criteria**:
- [ ] Hub 선택 드롭다운
- [ ] 선택한 Hub 기준 콘텐츠 필터링
- [ ] 반경 설정 (기본 2km)
- [ ] Hub별 전단지 개수 표시
- [ ] 전체 Hub 통합 보기

**Tasks**:
- [ ] Frontend: Hub selector dropdown
- [ ] Frontend: Content filtering logic
- [ ] Backend: GET /flyers?hubId=&radius=
- [ ] Backend: Spatial query optimization

**Story Points**: 3
**Status**: 📋 Planned

---

## Technical Specifications

### Architecture

```
┌─────────────────────────────────────────┐
│         User Hub Setup Flow             │
├─────────────────────────────────────────┤
│                                         │
│  1. Select Hub Type                     │
│     ○ Home  ○ Work  ○ Family           │
│                                         │
│  2. Search Address or Pick on Map       │
│     [Search: "서울시 강남구..."]         │
│          OR                             │
│     [🗺️ Map View]                      │
│                                         │
│  3. Confirm & Save                      │
│     Address: OO구 OO동                  │
│     Grid Cell: 8930062838fffff          │
│     [Save]                              │
│                                         │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│      Backend Processing                 │
│  1. Address → Coordinates (Kakao API)   │
│  2. Coordinates → H3 Cell (h3-js)       │
│  3. H3 Cell → Region (ST_Contains)      │
│  4. Save to User table                  │
└─────────────────────────────────────────┘
```

### Data Models

```typescript
// User Entity (Hub columns)
@Entity('users')
export class User {
  @Column({ nullable: true, length: 15 })
  homeH3Index: string;

  @Column({ nullable: true })
  homeAddress: string;

  @ManyToOne(() => Region)
  homeRegion: Region;

  @Column({ nullable: true, length: 15 })
  workH3Index: string;

  @Column({ nullable: true })
  workAddress: string;

  @ManyToOne(() => Region)
  workRegion: Region;

  @Column({ nullable: true, length: 15 })
  familyH3Index: string;

  @Column({ nullable: true })
  familyAddress: string;

  @ManyToOne(() => Region)
  familyRegion: Region;

  @Column({ type: 'timestamp', nullable: true })
  hubsLastUpdated: Date;
}

// Hub DTO
export interface UserHub {
  type: 'home' | 'work' | 'family';
  h3Index: string;
  address: string;
  region: {
    id: string;
    name: string;
  };
  coordinates: {
    lat: number;
    lng: number;
  };
  updatedAt: Date;
}
```

### API Endpoints

| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| GET | /users/me/hubs | Get user's 3 hubs | - |
| PATCH | /users/:id/hubs | Update hubs | `{ home?, work?, family? }` |
| DELETE | /users/:id/hubs/:type | Delete a hub | - |
| POST | /geocoding/address-to-coords | Convert address to coordinates | `{ address }` |
| POST | /geocoding/coords-to-address | Convert coordinates to address | `{ lat, lng }` |
| POST | /geocoding/coords-to-h3 | Convert coordinates to H3 | `{ lat, lng }` |

### Kakao Local API Integration

```typescript
// Address Search
async searchAddress(query: string): Promise<AddressResult[]> {
  const response = await axios.get('https://dapi.kakao.com/v2/local/search/address.json', {
    headers: { Authorization: `KakaoAK ${process.env.KAKAO_REST_API_KEY}` },
    params: { query }
  });
  return response.data.documents;
}

// Reverse Geocoding
async reverseGeocode(lat: number, lng: number): Promise<string> {
  const response = await axios.get('https://dapi.kakao.com/v2/local/geo/coord2address.json', {
    headers: { Authorization: `KakaoAK ${process.env.KAKAO_REST_API_KEY}` },
    params: { x: lng, y: lat }
  });
  return response.data.documents[0].address.address_name;
}
```

## Dependencies

### Prerequisites
- ✅ CORE-002 (Geospatial Infrastructure)
- ✅ USR-001 (User Onboarding)
- ✅ Kakao REST API Key

### External Libraries
- `h3-js` (Grid cell conversion)
- Kakao Map SDK (Frontend)

## Testing Strategy

### Unit Tests
- [ ] H3 cell conversion
- [ ] Address validation
- [ ] Hub limit enforcement (max 3)

### Integration Tests
- [ ] Address search → coordinates
- [ ] Coordinates → H3 cell → region
- [ ] Hub CRUD operations

### E2E Tests
- [ ] Complete hub setup flow
- [ ] Hub-based content filtering
- [ ] Hub modification

## Deployment Checklist

- [ ] Kakao API key configured
- [ ] Map SDK loaded
- [ ] Database migration
- [ ] H3 boundary visualization assets
- [ ] Documentation

## Risks & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Kakao API 장애 | High | Low | Fallback to manual input |
| 부정확한 주소 매핑 | Medium | Medium | Manual correction option |
| Grid Cell 경계 혼란 | Low | Medium | Clear visualization |

## Related Epics

- **Depends on**: CORE-002, USR-001
- **Blocks**: USR-007 (Flyer Viewer)

## Notes

- Hub는 H3 Grid Cell로 저장 (정확한 주소 미저장)
- 주소는 표시용으로만 사용
- 최대 3개 제한으로 프라이버시 보호
- Phase 2에서 Hub별 알림 설정 추가 예정

## Changelog

- **2025-12-24**: Epic created
  - 3-Hub Location Setup planned
  - 5 user stories defined (19 story points)
  - Privacy-first H3-based location system
