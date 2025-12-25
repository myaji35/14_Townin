# Epic: CORE-002 - Geospatial Data Infrastructure

## Epic Overview

| Field | Value |
|-------|-------|
| **Epic ID** | CORE-002 |
| **Epic Title** | Geospatial Data Infrastructure |
| **Priority** | P0 (Critical) |
| **Status** | 📋 PLANNED |
| **Estimated Effort** | 7 days |
| **Actual Effort** | - |
| **Start Date** | TBD |
| **End Date** | TBD |
| **Phase** | Phase 1 - Traffic Acquisition (Core Infrastructure) |
| **Category** | CORE - Core Infrastructure |
| **Owner** | Backend Team |

## Business Value

### Problem Statement
Townin은 **하이퍼로컬 서비스**로, 사용자의 위치(거주지, 직장, 가족집)를 기반으로 전단지, 안전맵, 보험 추천 등을 제공합니다. 이를 위해 효율적인 지리공간 데이터 저장, 쿼리, 분석 인프라가 필요합니다.

### Business Value
- **정확한 지역 타겟팅**: 사용자에게 반경 500m 내 전단지만 노출
- **성능**: PostGIS 공간 인덱스로 위치 기반 쿼리 < 100ms
- **확장성**: Grid Cell 시스템으로 전국 데이터 효율적 관리
- **개인정보 보호**: 주소 저장 없이 Grid Cell ID만 저장 (Privacy-First)

### Target Users
- **일반 사용자**: 내 동네 전단지, 안전맵 조회
- **상인**: 특정 지역 타겟팅 광고
- **보안관**: 담당 지역(아파트 단지) 관리
- **지자체**: 구/동 단위 통계 조회

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| 위치 기반 쿼리 성능 | < 100ms | PostGIS 공간 쿼리 평균 응답 시간 |
| Grid Cell 커버리지 | 100% | 전국 주요 도시 Grid Cell 생성률 |
| 좌표 → 주소 변환 정확도 | ≥ 95% | Reverse Geocoding 정확도 |
| 지역 계층 구조 조회 성능 | < 50ms | 시 → 구 → 동 계층 쿼리 |
| 공간 인덱스 적용률 | 100% | 모든 지리공간 테이블 GiST 인덱스 |

## Epic Scope

### In Scope
✅ **PostGIS 설정**
- PostgreSQL + PostGIS 확장 설치
- 공간 데이터 타입 (POINT, POLYGON, GEOMETRY)
- 공간 인덱스 (GiST Index)

✅ **Grid Cell 시스템**
- H3 or S2 Geometry 기반 Grid Cell
- Grid Cell ID → 좌표 변환
- 좌표 → Grid Cell ID 변환
- Cell Level: 500m 반경 (Hexagon)

✅ **지역 계층 구조**
- 3-Level Hierarchy: City (시) → District (구) → Neighborhood (동)
- Region 테이블 설계 (self-referencing)
- 지역 경계 Polygon 데이터 (법정동 경계)

✅ **Geocoding/Reverse Geocoding**
- 주소 → 좌표 (Kakao Local API)
- 좌표 → 주소 (Kakao Local API)
- 캐싱 (Redis)

✅ **공간 쿼리 최적화**
- ST_DWithin (반경 내 검색)
- ST_Contains (Polygon 내 Point 검색)
- ST_Intersects (교차 검색)

### Out of Scope
❌ 실시간 GPS 트래킹 - Phase 2 (IoT)
❌ 3D 지도 (고도 데이터) - Phase 4
❌ 실내 측위 (Indoor Positioning) - Phase 4
❌ 국제 지도 (Vietnam, Japan) - Phase 4

## User Stories

### Story 2.1: PostGIS 설정 및 공간 데이터 타입
**As a** 백엔드 개발자
**I want to** PostgreSQL에 PostGIS를 설치하고 공간 데이터 타입을 사용하고
**So that** 위치 기반 쿼리를 효율적으로 처리할 수 있다

**Acceptance Criteria:**
- [ ] PostgreSQL 15.x + PostGIS 3.4.x 설치
- [ ] `CREATE EXTENSION postgis;` 실행
- [ ] 공간 참조 시스템(SRID) 4326 (WGS 84) 사용
- [ ] POINT, POLYGON, GEOMETRY 데이터 타입 사용 가능
- [ ] GiST 인덱스 생성 및 성능 테스트

**Tasks:**
- [ ] Docker Compose에 PostGIS 이미지 추가
- [ ] TypeORM Migration으로 PostGIS 확장 활성화
- [ ] 공간 데이터 샘플 삽입 및 쿼리 테스트
- [ ] PostGIS 함수 성능 벤치마크

**Story Points:** 2

---

### Story 2.2: Grid Cell 시스템 설계 및 구현
**As a** 시스템 설계자
**I want to** H3 Grid Cell 시스템을 도입하고
**So that** 사용자 위치를 개인정보 보호하면서 지역 데이터를 효율적으로 관리할 수 있다

**Acceptance Criteria:**
- [ ] H3 Resolution 9 사용 (평균 반경 ~500m)
- [ ] 좌표(lat, lng) → H3 Cell ID 변환 함수
- [ ] H3 Cell ID → 중심 좌표 변환 함수
- [ ] H3 Cell 이웃 Cell 조회 (k-ring)
- [ ] 전국 주요 도시 H3 Cell 생성 (Seoul, Busan, Incheon)

**Tasks:**
- [ ] h3-js 라이브러리 설치
- [ ] GridCellService 생성
- [ ] latLngToCell(lat, lng, resolution) 함수 구현
- [ ] cellToLatLng(h3Index) 함수 구현
- [ ] gridDisk(h3Index, k) 이웃 Cell 조회 구현
- [ ] H3 Cell → Polygon 변환 (시각화용)

**Story Points:** 5

---

### Story 2.3: 지역 계층 구조 (Region) 테이블 설계
**As a** 데이터 모델러
**I want to** 시/구/동 3단계 지역 계층 구조를 설계하고
**So that** 지역별 데이터 집계 및 필터링을 지원할 수 있다

**Acceptance Criteria:**
- [ ] Region 테이블 self-referencing (parent_id)
- [ ] 3가지 레벨: city (시), district (구/군), neighborhood (동/읍/면)
- [ ] 각 Region의 경계 Polygon 저장 (법정동 경계)
- [ ] 지역 코드 (행정구역코드 10자리)
- [ ] 지역명 (한글, 영문)

**Tasks:**
- [ ] Region 엔티티 설계 (TypeORM)
- [ ] 법정동 경계 데이터 수집 (공공데이터포털)
- [ ] GeoJSON → PostgreSQL Polygon 변환 스크립트
- [ ] Region Seed 데이터 생성 (서울 25개 구, 동)
- [ ] 지역 계층 조회 API 구현

**Story Points:** 5

---

### Story 2.4: Kakao Local API 연동 (Geocoding)
**As a** 사용자
**I want to** 주소를 입력하면 좌표로 변환되고
**So that** 내 위치를 지도에 표시할 수 있다

**Acceptance Criteria:**
- [ ] Kakao REST API 키 발급
- [ ] 주소 → 좌표 API (Kakao Address Search)
- [ ] 좌표 → 주소 API (Kakao Reverse Geocoding)
- [ ] API 응답 캐싱 (Redis, TTL=30일)
- [ ] Rate Limiting (일 300,000건 무료)

**Tasks:**
- [ ] Kakao 개발자 앱 등록
- [ ] GeocodingService 생성
- [ ] addressToCoords(address) 함수 구현
- [ ] coordsToAddress(lat, lng) 함수 구현
- [ ] Redis 캐싱 레이어 추가
- [ ] 에러 핸들링 (API 장애 시 Fallback)

**Story Points:** 3

---

### Story 2.5: 공간 쿼리 최적화 및 인덱스
**As a** 백엔드 개발자
**I want to** 위치 기반 쿼리를 최적화하고
**So that** 반경 검색이 100ms 이내에 완료된다

**Acceptance Criteria:**
- [ ] GiST 인덱스 생성 (모든 GEOMETRY 컬럼)
- [ ] ST_DWithin 쿼리 성능 < 100ms
- [ ] ST_Contains 쿼리 성능 < 50ms
- [ ] EXPLAIN ANALYZE로 쿼리 플랜 검증
- [ ] 쿼리 결과 캐싱 (Redis, TTL=5분)

**Tasks:**
- [ ] Flyer, User, Merchant 테이블에 location GEOMETRY 컬럼 추가
- [ ] CREATE INDEX idx_flyers_location ON flyers USING GIST(location);
- [ ] TypeORM Repository에 공간 쿼리 메서드 추가
- [ ] findWithinRadius(lat, lng, radius) 함수 구현
- [ ] 성능 벤치마크 (10,000건 데이터)

**Story Points:** 5

---

### Story 2.6: 사용자 3-Hub 위치 저장
**As a** 사용자
**I want to** 거주지, 직장, 가족집 3곳의 위치를 등록하고
**So that** 각 지역의 전단지와 정보를 받을 수 있다

**Acceptance Criteria:**
- [ ] UserLocation 테이블 설계 (user_id, location_type, h3_cell_id, lat, lng)
- [ ] location_type: home, work, family (ENUM)
- [ ] 사용자당 최대 3개 위치 제한
- [ ] 위치 등록 시 H3 Cell ID 자동 계산
- [ ] 위치 수정/삭제 API

**Tasks:**
- [ ] UserLocation 엔티티 생성
- [ ] POST /api/users/me/locations 엔드포인트
- [ ] PATCH /api/users/me/locations/:id 엔드포인트
- [ ] DELETE /api/users/me/locations/:id 엔드포인트
- [ ] 최대 3개 제한 검증 로직

**Story Points:** 3

---

### Story 2.7: 지역별 통계 집계 API
**As a** 지자체 담당자
**I want to** 구/동 단위 전단지, 사용자 통계를 조회하고
**So that** 지역별 활동을 모니터링할 수 있다

**Acceptance Criteria:**
- [ ] GET /api/regions/:regionId/stats 엔드포인트
- [ ] 통계 항목: 사용자 수, 전단지 수, 상인 수
- [ ] 하위 지역 집계 (구 → 동 롤업)
- [ ] 캐싱 (Redis, TTL=1시간)

**Tasks:**
- [ ] RegionStatsService 생성
- [ ] PostgreSQL Aggregate 쿼리 작성
- [ ] 지역 계층 트리 순회 로직
- [ ] 통계 API 구현

**Story Points:** 3

---

### Story 2.8: 지도 시각화 GeoJSON API
**As a** 프론트엔드 개발자
**I want to** 전단지, 사용자 위치를 GeoJSON으로 조회하고
**So that** 지도에 마커/Polygon을 표시할 수 있다

**Acceptance Criteria:**
- [ ] GET /api/map/flyers?bounds=... GeoJSON 응답
- [ ] GET /api/map/regions/:id GeoJSON Polygon
- [ ] FeatureCollection 형식 준수
- [ ] 성능: 1,000개 마커 < 200ms

**Tasks:**
- [ ] MapService 생성
- [ ] ST_AsGeoJSON() 함수 사용
- [ ] GeoJSON Feature 변환 로직
- [ ] Bounding Box 필터링

**Story Points:** 3

## Technical Specifications

### Technology Stack
- **Database**: PostgreSQL 15.x + PostGIS 3.4.x
- **Grid System**: H3 (Uber's Hexagonal Hierarchical Spatial Index)
- **Geocoding**: Kakao Local API
- **Cache**: Redis 7.x
- **Framework**: NestJS + TypeORM

### Architecture Decisions

#### 1. H3 vs S2 Geometry
**Decision**: H3 (Uber)

**Rationale**:
- **Hexagon**: 이웃 Cell 간 거리 균일 (S2는 정사각형)
- **한국 지원**: Resolution 9 (~500m) 최적
- **성능**: 좌표 → Cell ID 변환 < 1ms
- **라이브러리**: h3-js (JavaScript), h3-py (Python)

**Trade-offs**:
- 글로벌 확장 시 S2가 더 유리 → Phase 4에서 재검토

#### 2. Geocoding Provider
**Decision**: Kakao Local API

**Rationale**:
- **무료 할당량**: 일 300,000건 (Phase 1 충분)
- **한국 주소 정확도**: 99%+ (도로명+지번 지원)
- **카카오맵 연동**: 향후 카카오맵 임베딩 가능

**Fallback**:
- Phase 2: Naver Maps API
- Phase 3: Google Maps Geocoding (해외 확장)

#### 3. 지역 경계 데이터 소스
**Decision**: 국가공간정보포털 법정동 경계

**Rationale**:
- **공식 데이터**: 행정안전부 제공
- **GeoJSON 형식**: PostGIS 변환 용이
- **정기 업데이트**: 분기별 경계 변경 반영

### Database Schema

#### Region Table (지역 계층 구조)
```sql
CREATE TABLE regions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(10) UNIQUE NOT NULL, -- 행정구역코드 (예: 1111000000)
  name_ko VARCHAR(100) NOT NULL, -- 한글명 (예: 종로구)
  name_en VARCHAR(100), -- 영문명 (Jongno-gu)
  level VARCHAR(20) NOT NULL CHECK (level IN ('city', 'district', 'neighborhood')),
  parent_id UUID REFERENCES regions(id), -- Self-referencing

  -- Geospatial
  boundary GEOMETRY(POLYGON, 4326), -- 지역 경계 (법정동)
  center_point GEOMETRY(POINT, 4326), -- 중심점

  -- Metadata
  population INT, -- 인구수 (통계청 데이터)
  area_sqm DECIMAL(12, 2), -- 면적 (제곱미터)
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_regions_code ON regions(code);
CREATE INDEX idx_regions_parent_id ON regions(parent_id);
CREATE INDEX idx_regions_level ON regions(level);
CREATE INDEX idx_regions_boundary ON regions USING GIST(boundary);
CREATE INDEX idx_regions_center_point ON regions USING GIST(center_point);
```

#### UserLocation Table (사용자 3-Hub 위치)
```sql
CREATE TABLE user_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  location_type VARCHAR(20) NOT NULL CHECK (location_type IN ('home', 'work', 'family')),

  -- Geospatial
  location GEOMETRY(POINT, 4326) NOT NULL,
  h3_cell_id VARCHAR(20) NOT NULL, -- H3 Resolution 9

  -- Address (optional, for display)
  address_full TEXT,
  address_city VARCHAR(50),
  address_district VARCHAR(50),
  address_neighborhood VARCHAR(50),

  -- Metadata
  region_id UUID REFERENCES regions(id),
  is_primary BOOLEAN DEFAULT FALSE, -- 주 활동 지역
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(user_id, location_type) -- 사용자당 각 타입 1개씩
);

CREATE INDEX idx_user_locations_user_id ON user_locations(user_id);
CREATE INDEX idx_user_locations_h3_cell_id ON user_locations(h3_cell_id);
CREATE INDEX idx_user_locations_location ON user_locations USING GIST(location);
CREATE INDEX idx_user_locations_region_id ON user_locations(region_id);
```

#### GridCell Table (H3 Cell Metadata)
```sql
CREATE TABLE grid_cells (
  h3_index VARCHAR(20) PRIMARY KEY, -- H3 Cell ID
  resolution INT NOT NULL, -- H3 Resolution (9)

  -- Geospatial
  boundary GEOMETRY(POLYGON, 4326), -- Hexagon Boundary
  center_point GEOMETRY(POINT, 4326), -- Center

  -- Metadata
  region_id UUID REFERENCES regions(id), -- 속한 행정구역
  user_count INT DEFAULT 0, -- 해당 Cell의 사용자 수
  flyer_count INT DEFAULT 0, -- 해당 Cell의 전단지 수
  last_activity_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_grid_cells_region_id ON grid_cells(region_id);
CREATE INDEX idx_grid_cells_boundary ON grid_cells USING GIST(boundary);
CREATE INDEX idx_grid_cells_center_point ON grid_cells USING GIST(center_point);
```

### API Endpoints

#### Region APIs

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/api/regions` | 전체 지역 목록 (계층 트리) | No | - |
| GET | `/api/regions/:id` | 특정 지역 상세 | No | - |
| GET | `/api/regions/:id/children` | 하위 지역 목록 | No | - |
| GET | `/api/regions/:id/stats` | 지역별 통계 | Yes | municipality, super_admin |
| GET | `/api/regions/search?q=종로구` | 지역 검색 | No | - |

#### Geocoding APIs

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/geocoding/address-to-coords?address=서울특별시 종로구` | 주소 → 좌표 | Yes |
| GET | `/api/geocoding/coords-to-address?lat=37.5665&lng=126.9780` | 좌표 → 주소 | Yes |
| POST | `/api/geocoding/batch-address-to-coords` | 주소 배치 변환 | Yes |

#### User Location APIs

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/api/users/me/locations` | 내 위치 목록 | Yes | user, merchant |
| POST | `/api/users/me/locations` | 위치 등록 | Yes | user, merchant |
| PATCH | `/api/users/me/locations/:id` | 위치 수정 | Yes | user, merchant |
| DELETE | `/api/users/me/locations/:id` | 위치 삭제 | Yes | user, merchant |

#### Map APIs

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/map/flyers?bounds=...` | 전단지 GeoJSON | No |
| GET | `/api/map/regions/:id` | 지역 경계 GeoJSON | No |
| GET | `/api/map/grid-cells?region=...` | H3 Cell GeoJSON | Yes |

### Request/Response Examples

#### POST /api/users/me/locations
**Request:**
```json
{
  "locationType": "home",
  "lat": 37.5665,
  "lng": 126.9780,
  "address": "서울특별시 종로구 세종대로 209"
}
```

**Response (201 Created):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "userId": "user-uuid",
  "locationType": "home",
  "location": {
    "type": "Point",
    "coordinates": [126.9780, 37.5665]
  },
  "h3CellId": "89754e64993ffff",
  "address": {
    "full": "서울특별시 종로구 세종대로 209",
    "city": "서울특별시",
    "district": "종로구",
    "neighborhood": "세종로"
  },
  "regionId": "region-uuid",
  "isPrimary": true,
  "createdAt": "2025-02-01T10:00:00Z"
}
```

#### GET /api/map/flyers?bounds=126.9,37.5,127.1,37.6
**Response (200 OK):**
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [126.9780, 37.5665]
      },
      "properties": {
        "id": "flyer-uuid",
        "title": "신선한 과일 할인",
        "merchantName": "과일가게",
        "category": "food",
        "distance": 250
      }
    }
  ]
}
```

### Environment Variables
```env
# PostGIS
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=townin
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres

# Kakao API
KAKAO_REST_API_KEY=your_kakao_rest_api_key

# H3 Configuration
H3_RESOLUTION=9 # ~500m radius

# Redis Cache
REDIS_HOST=localhost
REDIS_PORT=6379
GEOCODING_CACHE_TTL=2592000 # 30 days
```

## Testing Strategy

### Unit Tests
- [ ] H3 좌표 → Cell ID 변환 테스트
- [ ] H3 Cell ID → 좌표 변환 테스트
- [ ] H3 이웃 Cell 조회 테스트
- [ ] Geocoding 캐싱 로직 테스트

### Integration Tests
- [ ] Region 계층 구조 조회 테스트
- [ ] UserLocation CRUD 테스트
- [ ] Kakao API 연동 테스트 (Mocked)
- [ ] 공간 쿼리 성능 테스트 (10,000건)

### E2E Tests
- [ ] 사용자 위치 등록 → H3 Cell ID 자동 계산 확인
- [ ] 전단지 반경 검색 (ST_DWithin) 정확도 테스트
- [ ] 지역별 통계 집계 테스트

### Performance Tests
- [ ] ST_DWithin 쿼리 10,000건 < 100ms
- [ ] GeoJSON 변환 1,000개 마커 < 200ms
- [ ] H3 변환 1,000개 좌표 < 50ms

## Deployment Checklist

### Pre-Deployment
- [ ] PostGIS Docker 이미지 빌드
- [ ] 법정동 경계 데이터 다운로드
- [ ] Kakao REST API 키 발급
- [ ] H3 라이브러리 설치 확인

### Deployment
- [ ] PostgreSQL 15 + PostGIS 3.4 설치
- [ ] CREATE EXTENSION postgis; 실행
- [ ] Region Seed 데이터 삽입
- [ ] GiST 인덱스 생성
- [ ] Geocoding 캐시 Redis 설정

### Post-Deployment
- [ ] 공간 쿼리 성능 모니터링
- [ ] Kakao API 호출량 모니터링
- [ ] Region 데이터 무결성 검증

## Risks & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Kakao API 장애 | High | Low | Naver/Google API Fallback 구현 |
| 법정동 경계 변경 | Medium | Medium | 분기별 데이터 업데이트 자동화 |
| PostGIS 성능 저하 (대용량) | High | Low | 파티셔닝, 읽기 전용 복제본 |
| H3 Cell ID 중복 | Low | Very Low | UNIQUE 제약 조건 |
| 좌표 정확도 문제 | Medium | Low | SRID 4326 (WGS 84) 일관성 유지 |

## Dependencies

### Depends On (Prerequisites)
- **CORE-001**: Authentication & Authorization System (사용자 위치 등록 시 인증 필요)

### Blocks (Dependent Epics)
- **USR-001**: User Onboarding (3-Hub 위치 등록 플로우)
- **USR-003**: Safety Map (CCTV) (지역별 CCTV 조회)
- **USR-004**: Safety Map (Parking) (지역별 주차장 조회)
- **USR-007**: Digital Flyer Viewer (반경 내 전단지 검색)
- **MRC-003**: Flyer Creation & Management (전단지 위치 등록)
- **SGD-001**: Security Guard Recruitment (담당 지역 설정)

## Related Epics

- **CORE-003**: Public Data Integration (지역별 공공 데이터 매핑)
- **USR-002**: User Profile & Hub Management (3-Hub 위치 UI)
- **MRC-004**: Target Area Selection (상인 광고 지역 선택)

## Future Enhancements

### Phase 2
- H3 Resolution 동적 조정 (도심: Res 10, 교외: Res 8)
- 실시간 GPS 트래킹 (IoT 센서 연동)
- Indoor Positioning (실내 측위)

### Phase 3
- 3D 지도 (고도 데이터)
- 도보 경로 최적화 (GraphHopper)
- 인구 밀도 히트맵

### Phase 4
- 글로벌 지도 (Vietnam, Japan)
- S2 Geometry 전환 (글로벌 최적화)
- Satellite Imagery Integration

## Notes

### H3 Resolution Guide
| Resolution | Average Hexagon Edge | Use Case |
|------------|---------------------|----------|
| 7 | ~5.16 km | 시/구 단위 |
| 8 | ~1.95 km | 동/읍/면 단위 |
| 9 | ~732 m | 타운인 기본 (500m 반경) |
| 10 | ~277 m | 아파트 단지 |
| 11 | ~105 m | 건물 단위 |

**타운인 선택**: Resolution 9 (~500m 반경)
- 프라이버시 보호: 정확한 주소 노출 방지
- 전단지 노출 범위: 도보 5분 거리

### PostGIS 공간 함수 Reference
```sql
-- 반경 검색 (500m)
SELECT * FROM flyers
WHERE ST_DWithin(
  location,
  ST_SetSRID(ST_MakePoint(126.9780, 37.5665), 4326)::geography,
  500
);

-- Polygon 내 Point 검색
SELECT * FROM users
WHERE ST_Contains(
  (SELECT boundary FROM regions WHERE id = 'region-uuid'),
  location
);

-- 거리 계산
SELECT ST_Distance(
  ST_SetSRID(ST_MakePoint(126.9780, 37.5665), 4326)::geography,
  location::geography
) AS distance_meters
FROM flyers;
```

### References
- H3 Documentation: https://h3geo.org/
- PostGIS Documentation: https://postgis.net/docs/
- Kakao Local API: https://developers.kakao.com/docs/latest/ko/local/dev-guide
- 국가공간정보포털 법정동 경계: http://data.nsdi.go.kr/
