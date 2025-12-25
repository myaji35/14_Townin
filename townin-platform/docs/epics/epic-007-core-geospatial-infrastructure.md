# Epic 007: Geospatial Data Infrastructure

## Epic Overview

**Epic ID**: CORE-002
**Title**: Geospatial Data Infrastructure
**Priority**: P0 (Critical)
**Status**: 📋 Planned
**Estimated Effort**: 7 days
**Phase**: Phase 1 - Core Infrastructure

## Business Value

Townin의 핵심 차별화 요소인 "Privacy-First" H3 Grid Cell 시스템을 구축합니다. 정확한 주소 대신 500m × 500m 육각형 그리드로 위치를 관리하여 사용자 프라이버시를 보호하면서도, 하이퍼로컬 서비스를 제공할 수 있는 지리공간 인프라를 제공합니다.

### Target Users
- **All Platform Users**: 위치 기반 서비스 사용자
- **Developers**: 지리공간 쿼리 API 사용
- **Data Team**: 지역별 통계 및 분석

### Success Metrics
- H3 Grid Cell 변환 속도 < 50ms
- PostGIS 공간 쿼리 속도 < 100ms
- 지역 계층 구조 로딩 < 200ms
- 반경 검색 정확도 > 99%
- 3-Hub 위치 설정 완료율 > 85%

## Epic Scope

### In Scope
1. ✅ PostGIS 확장 설치 및 설정
2. ✅ H3 Grid Cell 시스템 구현
   - H3 Resolution 9 (500m × 500m)
   - 위도/경도 → H3 Cell 변환
   - H3 Cell → 중심 좌표 변환
3. ✅ 지역 계층 구조 (시/도 → 시/군/구 → 동/읍/면)
4. ✅ Grid Cell 엔티티 및 인덱싱
5. ✅ 공간 쿼리 API
   - 반경 내 Grid Cells 검색
   - 인접 Grid Cells 검색
   - 지역 내 Grid Cells 검색
6. ✅ 지역-Grid Cell 매핑
7. ✅ 3-Hub 위치 저장 모델

### Out of Scope
- ❌ 실시간 위치 추적
- ❌ 경로 탐색 (Route Navigation)
- ❌ 지오펜싱 (Geofencing)
- ❌ 3D 지형 데이터

## User Stories

### Story 7.1: PostGIS Setup
**As a** developer
**I want to** use PostGIS spatial extensions
**So that** I can perform efficient geospatial queries

**Acceptance Criteria**:
- [ ] PostGIS 확장 설치
- [ ] GEOMETRY 및 GEOGRAPHY 타입 사용 가능
- [ ] 공간 인덱스 (GIST) 생성 가능
- [ ] ST_ 함수 사용 가능

**Tasks**:
- [ ] Database: CREATE EXTENSION postgis
- [ ] Migration: Enable PostGIS
- [ ] Test: Spatial query performance

**Story Points**: 1
**Status**: 📋 Planned

---

### Story 7.2: H3 Grid Cell System
**As a** developer
**I want to** convert coordinates to H3 grid cells
**So that** I can implement privacy-first location system

**Acceptance Criteria**:
- [ ] H3 라이브러리 통합 (h3-js)
- [ ] 위도/경도 → H3 Cell ID 변환
- [ ] H3 Cell ID → 중심 좌표 변환
- [ ] H3 Resolution 9 (500m × 500m)
- [ ] H3 Cell boundary polygon 생성

**Tasks**:
- [ ] Backend: Install h3-js library
- [ ] Backend: H3Service 생성
- [ ] Backend: latLngToCell() 함수
- [ ] Backend: cellToLatLng() 함수
- [ ] Backend: cellToBoundary() 함수
- [ ] Unit tests: H3 conversions

**Story Points**: 3
**Status**: 📋 Planned

---

### Story 7.3: Grid Cell Entity & Storage
**As a** developer
**I want to** store grid cell metadata
**So that** I can associate data with locations

**Acceptance Criteria**:
- [ ] GridCell 엔티티 생성
- [ ] h3Index (unique) 컬럼
- [ ] center (POINT) geometry
- [ ] boundary (POLYGON) geometry
- [ ] regionId (FK) 컬럼
- [ ] GIST 인덱스 생성

**Tasks**:
- [ ] Backend: GridCell entity
- [ ] Migration: grid_cells table
- [ ] Migration: Spatial indexes
- [ ] Backend: GridCellRepository

**Story Points**: 2
**Status**: 📋 Planned

---

### Story 7.4: Region Hierarchy Enhancement
**As a** developer
**I want to** enhance region entities with spatial data
**So that** I can perform region-based queries

**Acceptance Criteria**:
- [ ] Region 엔티티에 geometry 컬럼 추가
- [ ] 시/도, 시/군/구, 동/읍/면 경계 polygon
- [ ] center (POINT) 중심 좌표
- [ ] 공간 인덱스 생성

**Tasks**:
- [ ] Migration: Add geometry to regions table
- [ ] Backend: Region boundary seeding
- [ ] Backend: Spatial index creation
- [ ] Data: Import region boundaries (GeoJSON)

**Story Points**: 3
**Status**: 📋 Planned

---

### Story 7.5: Spatial Query APIs
**As a** developer
**I want to** query grid cells by location
**So that** I can find nearby data

**Acceptance Criteria**:
- [ ] GET /grid-cells/nearby?lat=&lng=&radius= (반경 검색)
- [ ] GET /grid-cells/neighbors/:h3Index (인접 셀)
- [ ] GET /grid-cells/region/:regionId (지역 내 셀)
- [ ] GET /grid-cells/:h3Index (단일 셀 조회)
- [ ] POST /grid-cells (셀 생성)

**Tasks**:
- [ ] Backend: GridCellController
- [ ] Backend: GridCellService
- [ ] Backend: Nearby query (ST_DWithin)
- [ ] Backend: Neighbor query (H3 kRing)
- [ ] Backend: Region query (ST_Contains)
- [ ] API Documentation (Swagger)

**Story Points**: 5
**Status**: 📋 Planned

---

### Story 7.6: Region-GridCell Mapping
**As a** developer
**I want to** map grid cells to administrative regions
**So that** I can filter by region

**Acceptance Criteria**:
- [ ] Grid Cell 생성 시 자동 regionId 매핑
- [ ] ST_Contains 쿼리로 포함 지역 판별
- [ ] 계층적 지역 정보 (city → district → neighborhood)
- [ ] Batch mapping 스크립트

**Tasks**:
- [ ] Backend: Auto-assign regionId logic
- [ ] Backend: ST_Contains query
- [ ] Script: Batch map existing cells
- [ ] Migration: Add regionId FK constraint

**Story Points**: 3
**Status**: 📋 Planned

---

### Story 7.7: User 3-Hub Location Model
**As a** developer
**I want to** store user's 3 hub locations
**So that** users can set home/work/family locations

**Acceptance Criteria**:
- [ ] User 엔티티에 3개 h3Index 컬럼
  - homeH3Index
  - workH3Index
  - familyH3Index
- [ ] 각 Hub에 대한 regionId 저장
- [ ] 최대 3개 Hub만 설정 가능
- [ ] Hub 수정/삭제 API

**Tasks**:
- [ ] Migration: Add hub columns to users table
- [ ] Backend: User hub update logic
- [ ] Backend: Validate 3-hub limit
- [ ] API: PATCH /users/:id/hubs

**Story Points**: 2
**Status**: 📋 Planned

---

### Story 7.8: Geospatial Utility Functions
**As a** developer
**I want to** use common geospatial utilities
**So that** I can perform spatial operations easily

**Acceptance Criteria**:
- [ ] calculateDistance(lat1, lng1, lat2, lng2) - Haversine
- [ ] isWithinRadius(point, center, radius)
- [ ] getCellsInRadius(center, radius, resolution)
- [ ] kRing(h3Index, k) - k-distance neighbors
- [ ] gridDisk(h3Index, k) - filled disk

**Tasks**:
- [ ] Backend: GeoUtils service
- [ ] Backend: Haversine distance
- [ ] Backend: H3 kRing wrapper
- [ ] Backend: GridDisk wrapper
- [ ] Unit tests: Geospatial functions

**Story Points**: 3
**Status**: 📋 Planned

---

## Technical Specifications

### Architecture

```
┌─────────────────────────────────────────────┐
│         Geospatial Infrastructure           │
├─────────────────────────────────────────────┤
│                                             │
│  ┌─────────────┐        ┌───────────────┐  │
│  │   H3-js     │        │   PostGIS     │  │
│  │ (Client)    │        │  (Server)     │  │
│  └──────┬──────┘        └───────┬───────┘  │
│         │                       │          │
│         ▼                       ▼          │
│  ┌──────────────────────────────────────┐  │
│  │       GridCellService                │  │
│  │  - latLngToCell()                    │  │
│  │  - cellToLatLng()                    │  │
│  │  - getCellsNearby()                  │  │
│  │  - getNeighbors()                    │  │
│  │  - getCellsInRegion()                │  │
│  └──────────────────────────────────────┘  │
│                   │                        │
│                   ▼                        │
│  ┌──────────────────────────────────────┐  │
│  │         PostgreSQL + PostGIS         │  │
│  │                                      │  │
│  │  ┌────────────┐   ┌──────────────┐  │  │
│  │  │ grid_cells │   │   regions    │  │  │
│  │  ├────────────┤   ├──────────────┤  │  │
│  │  │ h3Index    │   │ id           │  │  │
│  │  │ center ●   │   │ name         │  │  │
│  │  │ boundary ▭ │   │ geometry ▭   │  │  │
│  │  │ regionId   │   │ center ●     │  │  │
│  │  └────────────┘   └──────────────┘  │  │
│  │        GIST           GIST          │  │
│  └──────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

### H3 Configuration

```typescript
// H3 Resolution 9
{
  resolution: 9,
  avgHexagonEdgeLength: 174.38 meters,
  avgHexagonArea: 0.105 km² (~500m × 500m),
  totalCells: 4,842,432,842 (global)
}

// South Korea Coverage (approximate)
const koreaH3Cells = ~350,000 cells at resolution 9

// Usage
import { latLngToCell, cellToLatLng, cellToBoundary, gridDisk, kRing } from 'h3-js';

const h3Index = latLngToCell(37.5665, 126.9780, 9); // Seoul City Hall
// => '8930062838fffff'

const center = cellToLatLng(h3Index);
// => [37.566536, 126.978013]

const neighbors = kRing(h3Index, 1); // 1-ring neighbors (6 cells)
// => ['8930062838fffff', '8930062839bffff', ...]
```

### Data Models

```typescript
// GridCell Entity
@Entity('grid_cells')
export class GridCell {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 15 })
  h3Index: string; // H3 cell identifier

  @Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326,
  })
  @Index({ spatial: true })
  center: Point; // WGS84 center point

  @Column({
    type: 'geometry',
    spatialFeatureType: 'Polygon',
    srid: 4326,
  })
  @Index({ spatial: true })
  boundary: Polygon; // Hexagon boundary

  @ManyToOne(() => Region, { nullable: true })
  region: Region;

  @Column({ nullable: true })
  regionId: string;

  @CreateDateColumn()
  createdAt: Date;
}

// Enhanced Region Entity
@Entity('regions')
export class Region {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  code: string;

  @Column({ type: 'enum', enum: RegionLevel })
  level: RegionLevel;

  @Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326,
    nullable: true,
  })
  @Index({ spatial: true })
  center: Point;

  @Column({
    type: 'geometry',
    spatialFeatureType: 'Polygon',
    srid: 4326,
    nullable: true,
  })
  @Index({ spatial: true })
  geometry: Polygon; // Region boundary

  @ManyToOne(() => Region, region => region.children, { nullable: true })
  parent: Region;

  @OneToMany(() => Region, region => region.parent)
  children: Region[];

  @OneToMany(() => GridCell, gridCell => gridCell.region)
  gridCells: GridCell[];
}

// User with 3 Hubs
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true, length: 15 })
  homeH3Index: string;

  @Column({ nullable: true, length: 15 })
  workH3Index: string;

  @Column({ nullable: true, length: 15 })
  familyH3Index: string;

  @ManyToOne(() => Region, { nullable: true })
  homeRegion: Region;

  @ManyToOne(() => Region, { nullable: true })
  workRegion: Region;

  @ManyToOne(() => Region, { nullable: true })
  familyRegion: Region;
}
```

### API Endpoints

| Method | Endpoint | Description | Query Params | Response |
|--------|----------|-------------|--------------|----------|
| GET | /grid-cells/nearby | Get cells within radius | `lat, lng, radius` (meters) | GridCell[] |
| GET | /grid-cells/neighbors/:h3Index | Get k-ring neighbors | `k` (default: 1) | GridCell[] |
| GET | /grid-cells/region/:regionId | Get cells in region | `limit, offset` | GridCell[] |
| GET | /grid-cells/:h3Index | Get cell by H3 index | - | GridCell |
| POST | /grid-cells | Create grid cell | `{ lat, lng }` | GridCell |
| POST | /grid-cells/batch | Create multiple cells | `{ coordinates: [lat, lng][] }` | GridCell[] |

### Spatial Queries

```sql
-- Find grid cells within radius (PostGIS)
SELECT gc.*
FROM grid_cells gc
WHERE ST_DWithin(
  gc.center::geography,
  ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography,
  :radius -- meters
);

-- Find cells within region boundary
SELECT gc.*
FROM grid_cells gc
JOIN regions r ON r.id = :regionId
WHERE ST_Contains(r.geometry, gc.center);

-- Find nearest grid cell to a point
SELECT gc.*
FROM grid_cells gc
ORDER BY gc.center <-> ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)
LIMIT 1;
```

## Dependencies

### Prerequisites
- ✅ PostgreSQL 14+
- ✅ PostGIS 3.3+
- ✅ TypeORM configured

### External Libraries
- `h3-js` (Uber H3 hexagonal grid)
- `@turf/turf` (Geospatial analysis)
- `typeorm` (Spatial types support)

### Data Sources
- 행정안전부 행정구역 경계 GeoJSON
- 서울시 법정동 경계 데이터

## Testing Strategy

### Unit Tests
- [ ] H3 conversion functions
- [ ] Distance calculations (Haversine)
- [ ] kRing neighbor generation
- [ ] Region containment logic

### Integration Tests
- [ ] PostGIS spatial queries
- [ ] Grid cell CRUD operations
- [ ] Nearby search performance
- [ ] Region-cell mapping

### E2E Tests
- [ ] User 3-hub setup flow
- [ ] Flyer location assignment
- [ ] Radius-based flyer search

### Performance Tests
- [ ] 1M grid cells query performance
- [ ] Spatial index effectiveness
- [ ] Concurrent spatial queries

## Deployment Checklist

- [ ] PostGIS extension installed
- [ ] Spatial indexes created
- [ ] Region boundary data imported
- [ ] Grid cell seed data (major cities)
- [ ] H3 library dependency installed
- [ ] Environment variables set
- [ ] Documentation updated
- [ ] Performance benchmarks run

## Risks & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| PostGIS 성능 저하 | High | Medium | Spatial indexes, query optimization |
| H3 라이브러리 버전 변경 | Medium | Low | Lock version, integration tests |
| 경계 데이터 부정확 | Medium | Medium | 공식 데이터 사용, validation |
| Grid cell 중복 생성 | Medium | Medium | Unique constraint on h3Index |
| 대용량 공간 쿼리 | High | High | Pagination, caching, indexes |

## Related Epics

- **Blocks**: USR-002 (3-Hub Location Setup)
- **Blocks**: USR-003~006 (All map features)
- **Blocks**: USR-007 (Digital Flyer Viewer)
- **Blocks**: MRC-003 (Flyer location assignment)
- **Related**: CORE-003 (Public Data Integration)

## Notes

- H3 Resolution 9 선택 이유: 프라이버시(500m)와 서비스 정밀도 균형
- 전국 데이터는 점진적으로 추가 (서울 → 수도권 → 전국)
- Grid Cell은 on-demand 생성 (실제 사용되는 셀만 DB 저장)
- 향후 Resolution 조정 가능 (10: 250m, 8: 1km)
- 경계 데이터는 정기적으로 업데이트 필요

## Changelog

- **2025-12-24**: Epic created
  - Geospatial Data Infrastructure planned
  - 8 user stories defined (22 story points)
  - H3 + PostGIS architecture designed
  - Privacy-first location system specified
