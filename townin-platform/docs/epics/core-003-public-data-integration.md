# Epic: CORE-003 - Public Data Integration

## Epic Overview

| Field | Value |
|-------|-------|
| **Epic ID** | CORE-003 |
| **Epic Title** | Public Data Integration |
| **Priority** | P0 (Critical) |
| **Status** | 📋 PLANNED |
| **Estimated Effort** | 10 days |
| **Actual Effort** | - |
| **Start Date** | TBD |
| **End Date** | TBD |
| **Phase** | Phase 1 - Traffic Acquisition (Core Infrastructure) |
| **Category** | CORE - Core Infrastructure |
| **Owner** | Backend Team |

## Business Value

### Problem Statement
타운인의 Phase 1 전략은 **"Traffic Anchor"**로, 무료 공공 데이터를 제공하여 사용자를 유입시키는 것입니다. CCTV, 주차장, 재난 정보 등을 서울 열린데이터광장 API에서 가져와 지도에 표시해야 합니다.

### Business Value
- **무료 트래픽 확보**: 공공 데이터로 광고 없이 사용자 유입
- **신뢰도 구축**: 공식 데이터로 플랫폼 신뢰성 확보
- **SEO 최적화**: 안전맵, 주차맵 등으로 검색 노출 증대
- **데이터 자산 축적**: Phase 3 GraphRAG 엔진의 기반 데이터

### Target Users
- **일반 사용자**: 내 동네 CCTV, 주차장, 재난 정보 조회
- **보안관**: 지역 안전 데이터 모니터링
- **지자체**: 공공 데이터 활용 현황 파악

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| 데이터 수집 성공률 | ≥ 99% | API 호출 성공 비율 |
| 데이터 동기화 주기 | 일 1회 | Cron Job 실행 성공률 |
| API 응답 시간 | < 500ms | 공공 데이터 조회 평균 응답 시간 |
| 데이터 커버리지 | 100% | 서울 25개 구 전체 데이터 수집 |
| 데이터 최신성 | < 24시간 | 마지막 업데이트 이후 경과 시간 |

## Epic Scope

### In Scope
✅ **서울 열린데이터광장 API 연동**
- CCTV 위치 데이터
- 공영 주차장 위치 및 실시간 주차 가능 대수
- 재난 대피소 위치
- 안전 신고 (불법 주정차, 쓰레기 무단 투기)

✅ **데이터 수집 자동화**
- Cron Job (일 1회, 새벽 3시)
- Incremental Update (변경 분만 업데이트)
- 에러 핸들링 및 재시도 로직

✅ **데이터 검증**
- 좌표 유효성 검증 (서울 영역 내)
- 중복 데이터 제거
- 데이터 품질 로깅

✅ **데이터 저장**
- PostgreSQL + PostGIS
- 공간 인덱스 (GiST)
- 지역(Region) 매핑

✅ **Public Data API**
- CCTV 조회 (반경/지역별)
- 주차장 조회 (반경/지역별, 실시간 가용 대수)
- 재난 대피소 조회 (반경/지역별)

### Out of Scope
❌ 실시간 CCTV 영상 스트리밍 - Phase 3
❌ 부산, 인천 등 타 지역 공공 데이터 - Phase 2
❌ 날씨 API 연동 - Phase 2
❌ 교통 정보 (실시간 버스, 지하철) - Phase 2

## User Stories

### Story 3.1: 서울 열린데이터광장 API 키 발급 및 설정
**As a** 백엔드 개발자
**I want to** 서울 열린데이터광장 API 키를 발급받고
**So that** 공공 데이터를 가져올 수 있다

**Acceptance Criteria:**
- [ ] 서울 열린데이터광장 회원가입
- [ ] API 키 발급 (무료)
- [ ] API 키 환경 변수 설정
- [ ] API 호출 제한 확인 (일 1,000회)

**Tasks:**
- [ ] 서울 열린데이터광장 계정 생성
- [ ] API 키 발급
- [ ] .env 파일에 SEOUL_OPEN_DATA_API_KEY 추가
- [ ] API 문서 리뷰 (https://data.seoul.go.kr/)

**Story Points:** 1

---

### Story 3.2: CCTV 위치 데이터 수집
**As a** 시스템 관리자
**I want to** 서울시 CCTV 위치 데이터를 자동 수집하고
**So that** 사용자에게 안전맵을 제공할 수 있다

**Acceptance Criteria:**
- [ ] API: 서울시 CCTV 위치 정보 (http://openapi.seoul.go.kr:8088/{api_key}/json/CCTV/)
- [ ] 데이터 필드: CCTV ID, 위치명, 좌표, 설치 기관, 설치 목적
- [ ] 총 약 50,000개 CCTV 데이터 수집
- [ ] 좌표 → H3 Cell ID 변환
- [ ] 지역(Region) 매핑 (PostGIS ST_Contains)

**Tasks:**
- [ ] CctvCollectorService 생성
- [ ] API 호출 함수 구현 (Pagination 처리)
- [ ] Cctv 엔티티 생성 (TypeORM)
- [ ] 데이터 검증 로직 (좌표 범위, 중복 제거)
- [ ] Bulk Insert (배치 삽입)

**Story Points:** 5

---

### Story 3.3: 공영 주차장 위치 및 실시간 데이터 수집
**As a** 시스템 관리자
**I want to** 서울시 공영 주차장 위치 및 실시간 주차 가능 대수를 수집하고
**So that** 사용자에게 주차맵을 제공할 수 있다

**Acceptance Criteria:**
- [ ] API 1: 주차장 정보 (http://openapi.seoul.go.kr:8088/{api_key}/json/GetParkingInfo/)
- [ ] API 2: 실시간 주차 현황 (http://openapi.seoul.go.kr:8088/{api_key}/json/GetParkingAvailable/)
- [ ] 데이터 필드: 주차장명, 주소, 좌표, 총 주차 면수, 현재 주차 가능 대수, 운영 시간, 요금
- [ ] 총 약 1,000개 공영 주차장 데이터 수집
- [ ] 실시간 데이터 30분마다 업데이트

**Tasks:**
- [ ] ParkingCollectorService 생성
- [ ] Parking 엔티티 생성 (location, total_spaces, available_spaces)
- [ ] 정적 데이터 수집 (일 1회)
- [ ] 실시간 데이터 수집 (30분마다 Cron)
- [ ] 주차 가능 대수 업데이트 로직

**Story Points:** 5

---

### Story 3.4: 재난 대피소 위치 데이터 수집
**As a** 시스템 관리자
**I want to** 서울시 재난 대피소 위치 데이터를 수집하고
**So that** 사용자에게 재난 정보를 제공할 수 있다

**Acceptance Criteria:**
- [ ] API: 서울시 지진 옥외 대피소 (http://openapi.seoul.go.kr:8088/{api_key}/json/TlEarthquakeShelter/)
- [ ] 데이터 필드: 대피소명, 주소, 좌표, 수용 인원, 시설 유형
- [ ] 총 약 500개 대피소 데이터 수집

**Tasks:**
- [ ] ShelterCollectorService 생성
- [ ] Shelter 엔티티 생성
- [ ] 데이터 수집 및 검증

**Story Points:** 3

---

### Story 3.5: 데이터 수집 자동화 (Cron Job)
**As a** 시스템 관리자
**I want to** 공공 데이터를 매일 자동으로 업데이트하고
**So that** 사용자에게 최신 데이터를 제공할 수 있다

**Acceptance Criteria:**
- [ ] Cron Job: 매일 새벽 3시 실행
- [ ] CCTV 데이터 업데이트 (변경 분만)
- [ ] 주차장 정적 데이터 업데이트
- [ ] 실시간 주차 데이터 30분마다 업데이트
- [ ] 재난 대피소 데이터 업데이트
- [ ] 에러 발생 시 Slack 알림

**Tasks:**
- [ ] NestJS @Cron 데코레이터 사용
- [ ] PublicDataSyncService 생성
- [ ] 각 Collector 서비스 호출
- [ ] 에러 핸들링 및 재시도 로직 (최대 3회)
- [ ] Slack Webhook 통합

**Story Points:** 5

---

### Story 3.6: CCTV 조회 API
**As a** 사용자
**I want to** 내 주변 CCTV 위치를 조회하고
**So that** 안전한 경로를 선택할 수 있다

**Acceptance Criteria:**
- [ ] GET /api/public-data/cctv?lat=37.5665&lng=126.9780&radius=500
- [ ] 반경 검색 (기본 500m, 최대 2km)
- [ ] 지역별 검색 (GET /api/public-data/cctv?regionId=...)
- [ ] Pagination (page, limit)
- [ ] GeoJSON 형식 응답 (optional)

**Tasks:**
- [ ] CctvController 생성
- [ ] 반경 검색 쿼리 (ST_DWithin)
- [ ] 지역별 검색 쿼리 (ST_Contains)
- [ ] GeoJSON 변환 로직

**Story Points:** 3

---

### Story 3.7: 주차장 조회 API
**As a** 사용자
**I want to** 내 주변 공영 주차장과 실시간 주차 가능 대수를 조회하고
**So that** 주차 공간을 빠르게 찾을 수 있다

**Acceptance Criteria:**
- [ ] GET /api/public-data/parking?lat=37.5665&lng=126.9780&radius=1000
- [ ] 주차 가능 대수 포함 (availableSpaces)
- [ ] 거리순 정렬
- [ ] 주차 가능 여부 필터 (availableOnly=true)

**Tasks:**
- [ ] ParkingController 생성
- [ ] 반경 검색 + 거리 계산 쿼리
- [ ] 주차 가능 여부 필터링

**Story Points:** 3

---

### Story 3.8: 재난 대피소 조회 API
**As a** 사용자
**I want to** 내 주변 재난 대피소를 조회하고
**So that** 긴급 상황에 대비할 수 있다

**Acceptance Criteria:**
- [ ] GET /api/public-data/shelters?lat=37.5665&lng=126.9780&radius=2000
- [ ] 거리순 정렬
- [ ] 수용 인원 정보 포함

**Tasks:**
- [ ] ShelterController 생성
- [ ] 반경 검색 쿼리
- [ ] 거리 계산 및 정렬

**Story Points:** 2

---

### Story 3.9: 데이터 품질 모니터링
**As a** 시스템 관리자
**I want to** 공공 데이터 수집 상태를 모니터링하고
**So that** 데이터 품질을 유지할 수 있다

**Acceptance Criteria:**
- [ ] 수집 이력 테이블 (DataSyncLog)
- [ ] 필드: sync_type (cctv/parking/shelter), total_count, success_count, error_count, started_at, ended_at
- [ ] 대시보드 API (GET /api/admin/public-data/sync-logs)
- [ ] 에러 로그 저장

**Tasks:**
- [ ] DataSyncLog 엔티티 생성
- [ ] 각 Collector에 로깅 추가
- [ ] Admin 대시보드 API 구현

**Story Points:** 3

---

### Story 3.10: 공공 데이터 통합 지도 API
**As a** 프론트엔드 개발자
**I want to** CCTV, 주차장, 대피소를 통합 조회하고
**So that** 단일 지도에 모든 데이터를 표시할 수 있다

**Acceptance Criteria:**
- [ ] GET /api/public-data/map?lat=...&lng=...&radius=...&types=cctv,parking,shelter
- [ ] GeoJSON FeatureCollection 응답
- [ ] 각 Feature의 properties에 type 포함 (cctv/parking/shelter)
- [ ] 성능: 1,000개 마커 < 500ms

**Tasks:**
- [ ] MapController 생성
- [ ] 다중 타입 쿼리 (UNION)
- [ ] GeoJSON 통합 변환

**Story Points:** 3

## Technical Specifications

### Technology Stack
- **API**: 서울 열린데이터광장 Open API
- **Database**: PostgreSQL + PostGIS
- **Scheduler**: NestJS @Cron
- **Notification**: Slack Webhook
- **Monitoring**: Winston Logger + Sentry

### Architecture Decisions

#### 1. 데이터 동기화 전략
**Decision**: Incremental Update (변경 분만 업데이트)

**Rationale**:
- **성능**: 50,000개 CCTV 전체 업데이트 불필요
- **API 호출 제한**: 일 1,000회 제한 준수
- **비용 절감**: DB I/O 최소화

**구현**:
- 각 데이터에 last_synced_at 컬럼 추가
- API에서 수정일(modifiedDate) 필드 비교
- 변경된 데이터만 UPDATE/INSERT

#### 2. 실시간 주차 데이터 수집 주기
**Decision**: 30분마다 업데이트

**Rationale**:
- **실시간성**: 주차 가능 대수는 빠르게 변화
- **API 호출 제한**: 일 1,000회 제한 (30분마다 = 48회/일)
- **사용자 경험**: 30분 이내 데이터면 충분히 유용

#### 3. 에러 핸들링
**Decision**: 재시도 3회 + Slack 알림

**Rationale**:
- **안정성**: 일시적 네트워크 오류 대응
- **모니터링**: 관리자가 즉시 인지 가능

### Database Schema

#### Cctv Table
```sql
CREATE TABLE cctv (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id VARCHAR(100) UNIQUE NOT NULL, -- API에서 제공하는 CCTV ID
  name VARCHAR(255) NOT NULL, -- CCTV 위치명

  -- Geospatial
  location GEOMETRY(POINT, 4326) NOT NULL,
  h3_cell_id VARCHAR(20),
  address VARCHAR(500),

  -- Metadata
  region_id UUID REFERENCES regions(id),
  installation_agency VARCHAR(100), -- 설치 기관 (예: 서울시, 종로구청)
  installation_purpose VARCHAR(100), -- 설치 목적 (예: 방범, 교통)

  -- Sync
  last_synced_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_cctv_location ON cctv USING GIST(location);
CREATE INDEX idx_cctv_h3_cell_id ON cctv(h3_cell_id);
CREATE INDEX idx_cctv_region_id ON cctv(region_id);
CREATE INDEX idx_cctv_external_id ON cctv(external_id);
```

#### Parking Table
```sql
CREATE TABLE parking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,

  -- Geospatial
  location GEOMETRY(POINT, 4326) NOT NULL,
  h3_cell_id VARCHAR(20),
  address VARCHAR(500),

  -- Parking Info
  total_spaces INT NOT NULL, -- 총 주차 면수
  available_spaces INT, -- 현재 주차 가능 대수
  operation_hours VARCHAR(100), -- 운영 시간
  fee_info TEXT, -- 요금 정보

  -- Metadata
  region_id UUID REFERENCES regions(id),
  phone VARCHAR(20),

  -- Sync
  static_data_synced_at TIMESTAMP, -- 정적 데이터 (주소, 요금 등)
  realtime_data_synced_at TIMESTAMP, -- 실시간 데이터 (주차 가능 대수)
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_parking_location ON parking USING GIST(location);
CREATE INDEX idx_parking_h3_cell_id ON parking(h3_cell_id);
CREATE INDEX idx_parking_region_id ON parking(region_id);
CREATE INDEX idx_parking_available_spaces ON parking(available_spaces);
```

#### Shelter Table
```sql
CREATE TABLE shelters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,

  -- Geospatial
  location GEOMETRY(POINT, 4326) NOT NULL,
  h3_cell_id VARCHAR(20),
  address VARCHAR(500),

  -- Shelter Info
  capacity INT, -- 수용 인원
  facility_type VARCHAR(100), -- 시설 유형 (예: 학교, 공원)
  area_sqm DECIMAL(10, 2), -- 면적

  -- Metadata
  region_id UUID REFERENCES regions(id),

  -- Sync
  last_synced_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_shelters_location ON shelters USING GIST(location);
CREATE INDEX idx_shelters_h3_cell_id ON shelters(h3_cell_id);
CREATE INDEX idx_shelters_region_id ON shelters(region_id);
```

#### DataSyncLog Table
```sql
CREATE TABLE data_sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sync_type VARCHAR(50) NOT NULL, -- 'cctv', 'parking', 'shelter'
  status VARCHAR(20) NOT NULL CHECK (status IN ('success', 'failed')),

  -- Statistics
  total_count INT, -- API에서 받은 전체 데이터 수
  inserted_count INT, -- 신규 삽입
  updated_count INT, -- 업데이트
  error_count INT, -- 에러 발생 수
  error_message TEXT,

  -- Timing
  started_at TIMESTAMP NOT NULL,
  ended_at TIMESTAMP,
  duration_ms INT, -- 소요 시간 (밀리초)

  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_data_sync_logs_sync_type ON data_sync_logs(sync_type);
CREATE INDEX idx_data_sync_logs_created_at ON data_sync_logs(created_at);
```

### API Endpoints

#### Public Data Query APIs

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/public-data/cctv` | CCTV 조회 (반경/지역) | No |
| GET | `/api/public-data/parking` | 주차장 조회 (반경/지역) | No |
| GET | `/api/public-data/shelters` | 대피소 조회 (반경/지역) | No |
| GET | `/api/public-data/map` | 통합 지도 데이터 (GeoJSON) | No |

#### Admin APIs

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/api/admin/public-data/sync-logs` | 데이터 동기화 이력 | Yes | super_admin |
| POST | `/api/admin/public-data/sync` | 수동 동기화 트리거 | Yes | super_admin |

### Request/Response Examples

#### GET /api/public-data/cctv?lat=37.5665&lng=126.9780&radius=500
**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "cctv-uuid",
      "externalId": "CCTV-12345",
      "name": "종로구청 앞 교차로",
      "location": {
        "type": "Point",
        "coordinates": [126.9780, 37.5665]
      },
      "address": "서울특별시 종로구 세종대로 209",
      "distance": 125,
      "installationAgency": "종로구청",
      "installationPurpose": "방범"
    }
  ],
  "pagination": {
    "total": 42,
    "page": 1,
    "limit": 20
  }
}
```

#### GET /api/public-data/parking?lat=37.5665&lng=126.9780&radius=1000&availableOnly=true
**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "parking-uuid",
      "name": "광화문 공영주차장",
      "location": {
        "type": "Point",
        "coordinates": [126.9769, 37.5706]
      },
      "address": "서울특별시 종로구 세종대로 172",
      "distance": 450,
      "totalSpaces": 100,
      "availableSpaces": 23,
      "operationHours": "24시간",
      "feeInfo": "10분당 500원",
      "phone": "02-1234-5678",
      "lastUpdated": "2025-02-01T10:30:00Z"
    }
  ],
  "pagination": {
    "total": 15,
    "page": 1,
    "limit": 20
  }
}
```

### Environment Variables
```env
# Seoul Open Data API
SEOUL_OPEN_DATA_API_KEY=your_seoul_open_data_api_key
SEOUL_OPEN_DATA_BASE_URL=http://openapi.seoul.go.kr:8088

# Data Sync
DATA_SYNC_CRON=0 3 * * * # 매일 새벽 3시
PARKING_REALTIME_SYNC_CRON=*/30 * * * * # 30분마다

# Slack Notification
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL

# API Rate Limiting
SEOUL_API_DAILY_LIMIT=1000
```

## Testing Strategy

### Unit Tests
- [ ] CCTV Collector 데이터 파싱 테스트
- [ ] Parking Collector 데이터 파싱 테스트
- [ ] 좌표 유효성 검증 테스트
- [ ] H3 Cell ID 변환 테스트

### Integration Tests
- [ ] 서울 Open API 호출 테스트 (Mocked)
- [ ] 데이터 수집 → DB 삽입 플로우 테스트
- [ ] Incremental Update 로직 테스트
- [ ] Region 매핑 정확도 테스트

### E2E Tests
- [ ] CCTV 조회 API 반경 검색 테스트
- [ ] 주차장 조회 API 주차 가능 여부 필터링 테스트
- [ ] 통합 지도 API GeoJSON 형식 검증

### Performance Tests
- [ ] CCTV 50,000건 수집 < 10분
- [ ] 주차장 실시간 데이터 1,000건 업데이트 < 1분
- [ ] 반경 검색 1,000개 결과 < 500ms

## Deployment Checklist

### Pre-Deployment
- [ ] 서울 열린데이터광장 API 키 발급
- [ ] Slack Webhook URL 설정
- [ ] Cron Job 스케줄 확인
- [ ] PostGIS 공간 인덱스 생성

### Deployment
- [ ] 환경 변수 설정
- [ ] Database Migration 실행
- [ ] 초기 데이터 수집 (수동 실행)
- [ ] Cron Job 활성화

### Post-Deployment
- [ ] 데이터 수집 성공 확인
- [ ] 지도 API 응답 시간 모니터링
- [ ] Slack 알림 테스트

## Risks & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| 서울 Open API 장애 | High | Low | 재시도 로직, 에러 알림 |
| API 호출 제한 초과 | Medium | Medium | 호출 횟수 모니터링, 캐싱 |
| 좌표 데이터 오류 | Medium | Low | 좌표 유효성 검증 (서울 영역) |
| 데이터 동기화 지연 | Low | Medium | 성능 최적화, 배치 삽입 |
| 주차장 실시간 데이터 부정확 | Medium | Medium | 업데이트 시간 표시 |

## Dependencies

### Depends On (Prerequisites)
- **CORE-001**: Authentication & Authorization System (Admin API 인증)
- **CORE-002**: Geospatial Data Infrastructure (PostGIS, H3, Region)

### Blocks (Dependent Epics)
- **USR-003**: Safety Map (CCTV) (CCTV 데이터 사용)
- **USR-004**: Safety Map (Parking) (주차장 데이터 사용)
- **USR-005**: Safety Map (Disaster) (대피소 데이터 사용)

## Related Epics

- **USR-006**: Integrated Safety Map (통합 지도 UI)
- **ADM-004**: Region Management (지역별 데이터 통계)

## Future Enhancements

### Phase 2
- 부산, 인천 등 타 지역 공공 데이터 통합
- 날씨 API 연동 (기상청)
- 실시간 버스/지하철 정보 (서울시 TOPIS)

### Phase 3
- CCTV 영상 스트리밍 (라이브뷰)
- AI 기반 안전 점수 계산 (CCTV 밀도, 조명)
- 사고 다발 지역 분석

### Phase 4
- 국제 지도 (Vietnam, Japan)
- Google Places API 통합

## Notes

### 서울 열린데이터광장 API 주요 엔드포인트

#### CCTV
```
http://openapi.seoul.go.kr:8088/{api_key}/json/CCTV/{start}/{end}
```

#### 주차장 (정적)
```
http://openapi.seoul.go.kr:8088/{api_key}/json/GetParkingInfo/{start}/{end}
```

#### 주차장 (실시간)
```
http://openapi.seoul.go.kr:8088/{api_key}/json/GetParkingAvailable/{start}/{end}
```

#### 재난 대피소
```
http://openapi.seoul.go.kr:8088/{api_key}/json/TlEarthquakeShelter/{start}/{end}
```

### Cron Job 설정 예제
```typescript
@Injectable()
export class PublicDataSyncService {
  private readonly logger = new Logger(PublicDataSyncService.name);

  @Cron('0 3 * * *') // 매일 새벽 3시
  async syncStaticData() {
    this.logger.log('Starting static data sync...');
    await this.syncCctv();
    await this.syncParkingStatic();
    await this.syncShelters();
    this.logger.log('Static data sync completed');
  }

  @Cron('*/30 * * * *') // 30분마다
  async syncRealtimeParking() {
    this.logger.log('Starting realtime parking sync...');
    await this.syncParkingRealtime();
    this.logger.log('Realtime parking sync completed');
  }
}
```

### References
- 서울 열린데이터광장: https://data.seoul.go.kr/
- PostGIS Spatial Queries: https://postgis.net/docs/
- NestJS Cron: https://docs.nestjs.com/techniques/task-scheduling
