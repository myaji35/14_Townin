# Epic 008: Public Data Integration

## Epic Overview

**Epic ID**: CORE-003
**Title**: Public Data Integration
**Priority**: P0 (Critical)
**Status**: 📋 Planned
**Estimated Effort**: 10 days
**Phase**: Phase 1 - Core Infrastructure

## Business Value

서울 열린데이터광장 API와 연동하여 CCTV, 주차, 재난 안전 등 공공데이터를 실시간으로 수집하고 제공합니다. 이를 통해 Townin은 "광고 없는 클린한 생존 지도"라는 핵심 가치를 실현하고, 사용자에게 실질적인 생활 편의 정보를 제공합니다.

### Target Users
- **All Users**: 안전하고 편리한 생활을 원하는 모든 시민
- **Municipality**: 지역 데이터 관리 담당자
- **Platform**: 데이터 기반 서비스 제공

### Success Metrics
- API 연동 성공률 > 99%
- 데이터 업데이트 주기: 1일 1회
- CCTV 데이터 정확도 > 98%
- 주차장 실시간 데이터 반영 < 5분
- 사용자 데이터 조회 속도 < 200ms

## Epic Scope

### In Scope
1. ✅ 서울 열린데이터광장 API 연동
2. ✅ CCTV 위치 데이터 수집 및 저장
3. ✅ 주정차 단속 카메라 데이터
4. ✅ 공영 주차장 데이터 (실시간 잔여)
5. ✅ 가로등 위치 데이터
6. ✅ 비상벨 위치 데이터
7. ✅ 재난 안전 데이터
   - 침수 흔적도
   - 제설함 위치
   - 급경사지 위치
   - 지진 대피소
8. ✅ 생활 편의 데이터
   - 공공 와이파이
   - 무더위 쉼터
   - 전기차 충전소
   - 공중 화장실
9. ✅ 데이터 자동 업데이트 스케줄러
10. ✅ 공간 데이터 인덱싱

### Out of Scope
- ❌ 실시간 교통 정보 (Phase 2)
- ❌ 날씨 정보 (Phase 2)
- ❌ 대기질 정보 (Phase 2)
- ❌ 타 지역 공공데이터 (서울 외)

## User Stories

### Story 8.1: Seoul Open Data API Integration
**As a** developer
**I want to** integrate with Seoul Open Data API
**So that** I can fetch public data

**Acceptance Criteria**:
- [ ] API 키 발급 및 설정
- [ ] HTTP client 설정 (axios)
- [ ] Rate limiting 처리
- [ ] Error handling 및 재시도 로직
- [ ] API 응답 로깅

**Tasks**:
- [ ] Backend: PublicDataService 생성
- [ ] Backend: Axios instance 설정
- [ ] Backend: Rate limiter middleware
- [ ] Backend: Retry logic (exponential backoff)
- [ ] Config: API keys in .env

**Story Points**: 2
**Status**: 📋 Planned

---

### Story 8.2: CCTV Data Collection
**As a** platform
**I want to** collect CCTV location data
**So that** users can see safe areas

**Acceptance Criteria**:
- [ ] CCTV 엔티티 생성
- [ ] API 호출 및 파싱
- [ ] 위치 데이터를 H3 Grid Cell로 변환
- [ ] 중복 제거 (좌표 기반)
- [ ] 일별 업데이트

**Tasks**:
- [ ] Backend: CCTV entity
- [ ] Backend: Seoul CCTV API integration
- [ ] Backend: Data parsing logic
- [ ] Backend: H3 cell assignment
- [ ] Migration: cctv table
- [ ] Scheduler: Daily update job

**Story Points**: 3
**Status**: 📋 Planned

---

### Story 8.3: Parking Data Collection
**As a** user
**I want to** see parking camera and public parking data
**So that** I can avoid fines and find parking

**Acceptance Criteria**:
- [ ] 주정차 단속 카메라 엔티티
- [ ] 공영 주차장 엔티티
- [ ] 실시간 잔여 대수 업데이트
- [ ] 운영 시간 정보
- [ ] 요금 정보

**Tasks**:
- [ ] Backend: ParkingCamera entity
- [ ] Backend: PublicParking entity
- [ ] Backend: Seoul parking API integration
- [ ] Backend: Real-time availability update
- [ ] Migration: parking tables
- [ ] Scheduler: 5-minute update job (availability)

**Story Points**: 4
**Status**: 📋 Planned

---

### Story 8.4: Street Light & Emergency Bell Data
**As a** user
**I want to** see street lights and emergency bells
**So that** I can choose safe routes

**Acceptance Criteria**:
- [ ] 가로등 엔티티
- [ ] 비상벨 엔티티
- [ ] 위치 데이터 수집
- [ ] H3 Grid Cell 매핑
- [ ] 지역별 집계

**Tasks**:
- [ ] Backend: StreetLight entity
- [ ] Backend: EmergencyBell entity
- [ ] Backend: Seoul API integration
- [ ] Migration: safety_infrastructure tables
- [ ] Scheduler: Weekly update job

**Story Points**: 3
**Status**: 📋 Planned

---

### Story 8.5: Disaster Safety Data
**As a** user
**I want to** see disaster safety information
**So that** I can prepare for emergencies

**Acceptance Criteria**:
- [ ] 침수 흔적도 엔티티
- [ ] 제설함 위치 엔티티
- [ ] 급경사지 엔티티
- [ ] 지진 대피소 엔티티
- [ ] 위험 레벨 표시

**Tasks**:
- [ ] Backend: FloodHistory entity
- [ ] Backend: SnowRemovalBox entity
- [ ] Backend: SteepSlope entity
- [ ] Backend: EarthquakeShelter entity
- [ ] Backend: Seoul disaster API integration
- [ ] Migration: disaster_safety tables
- [ ] Scheduler: Monthly update job

**Story Points**: 4
**Status**: 📋 Planned

---

### Story 8.6: Public Amenities Data
**As a** user
**I want to** see public amenities
**So that** I can use them conveniently

**Acceptance Criteria**:
- [ ] 공공 와이파이 엔티티
- [ ] 무더위 쉼터 엔티티
- [ ] 전기차 충전소 엔티티
- [ ] 공중 화장실 엔티티
- [ ] 운영 시간 및 가용성 정보

**Tasks**:
- [ ] Backend: PublicWifi entity
- [ ] Backend: CoolingShelter entity
- [ ] Backend: EVChargingStation entity
- [ ] Backend: PublicToilet entity
- [ ] Backend: Seoul amenities API integration
- [ ] Migration: public_amenities tables
- [ ] Scheduler: Daily update job

**Story Points**: 4
**Status**: 📋 Planned

---

### Story 8.7: Data Update Scheduler
**As a** platform
**I want to** automatically update public data
**So that** data stays fresh without manual intervention

**Acceptance Criteria**:
- [ ] NestJS Scheduler 설정
- [ ] Cron jobs 정의
  - Daily: CCTV, Wifi, Toilet, Parking cameras
  - Hourly: Parking availability
  - Weekly: Street lights, Emergency bells
  - Monthly: Disaster data
- [ ] Job 실행 로그
- [ ] 실패 시 재시도
- [ ] 관리자 알림 (실패 시)

**Tasks**:
- [ ] Backend: @nestjs/schedule 설정
- [ ] Backend: Cron jobs 정의
- [ ] Backend: Job logging service
- [ ] Backend: Error notification
- [ ] Config: Cron expressions

**Story Points**: 3
**Status**: 📋 Planned

---

### Story 8.8: Public Data Query APIs
**As a** developer
**I want to** query public data by location
**So that** I can show nearby facilities to users

**Acceptance Criteria**:
- [ ] GET /public-data/cctv/nearby
- [ ] GET /public-data/parking/nearby
- [ ] GET /public-data/safety/nearby
- [ ] GET /public-data/amenities/nearby
- [ ] 반경 검색 지원
- [ ] H3 Grid Cell 기반 검색

**Tasks**:
- [ ] Backend: PublicDataController
- [ ] Backend: Nearby query implementation
- [ ] Backend: Spatial indexing
- [ ] API Documentation (Swagger)
- [ ] Frontend: Public data service

**Story Points**: 5
**Status**: 📋 Planned

---

## Technical Specifications

### Architecture

```
┌──────────────────────────────────────────────────┐
│       Seoul Open Data Platform (External)        │
│  https://data.seoul.go.kr/                       │
└────────────────┬─────────────────────────────────┘
                 │
                 │ HTTP/REST API
                 │ (with API Key)
                 ▼
┌──────────────────────────────────────────────────┐
│         PublicDataService (NestJS)               │
├──────────────────────────────────────────────────┤
│  - fetchCCTV()                                   │
│  - fetchParkingCameras()                         │
│  - fetchPublicParking()                          │
│  - fetchStreetLights()                           │
│  - fetchEmergencyBells()                         │
│  - fetchDisasterData()                           │
│  - fetchAmenities()                              │
└────────────────┬─────────────────────────────────┘
                 │
                 │ Parse & Transform
                 │ H3 Cell Assignment
                 ▼
┌──────────────────────────────────────────────────┐
│           PostgreSQL + PostGIS                   │
├──────────────────────────────────────────────────┤
│  ┌────────────┐  ┌──────────────────┐           │
│  │   cctv     │  │ parking_cameras  │           │
│  ├────────────┤  ├──────────────────┤           │
│  │ location ● │  │ location ●       │           │
│  │ h3Index    │  │ h3Index          │           │
│  └────────────┘  └──────────────────┘           │
│                                                  │
│  ┌────────────────┐  ┌──────────────────┐       │
│  │ public_parking │  │ street_lights    │       │
│  ├────────────────┤  ├──────────────────┤       │
│  │ location ●     │  │ location ●       │       │
│  │ availability   │  │ h3Index          │       │
│  └────────────────┘  └──────────────────┘       │
│                       GIST Indexes               │
└──────────────────────────────────────────────────┘
                 │
                 │ Query APIs
                 ▼
┌──────────────────────────────────────────────────┐
│        PublicDataController (REST APIs)          │
│  GET /public-data/cctv/nearby?lat=&lng=&radius=  │
│  GET /public-data/parking/nearby                 │
│  GET /public-data/safety/nearby                  │
│  GET /public-data/amenities/nearby               │
└──────────────────────────────────────────────────┘
```

### Data Models

```typescript
// CCTV Entity
@Entity('cctv')
export class CCTV {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326,
  })
  @Index({ spatial: true })
  location: Point;

  @Column({ length: 15 })
  h3Index: string;

  @Column({ nullable: true })
  address: string;

  @ManyToOne(() => Region)
  region: Region;

  @Column()
  regionId: string;

  @Column({ type: 'enum', enum: CCTVType })
  type: CCTVType; // 방범, 교통, etc

  @Column({ type: 'timestamp', nullable: true })
  lastUpdated: Date;
}

enum CCTVType {
  SECURITY = 'security',
  TRAFFIC = 'traffic',
  DISASTER = 'disaster',
}

// Public Parking Entity
@Entity('public_parking')
export class PublicParking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326,
  })
  @Index({ spatial: true })
  location: Point;

  @Column({ length: 15 })
  h3Index: string;

  @Column()
  address: string;

  @Column({ type: 'int' })
  totalSpaces: number;

  @Column({ type: 'int', nullable: true })
  availableSpaces: number; // Real-time

  @Column({ type: 'json', nullable: true })
  operatingHours: {
    weekday: string;
    weekend: string;
  };

  @Column({ type: 'json', nullable: true })
  fees: {
    baseTime: number; // minutes
    baseFee: number; // KRW
    additionalFee: number; // per 10min
  };

  @Column({ type: 'timestamp', nullable: true })
  lastAvailabilityUpdate: Date;
}

// Street Light Entity
@Entity('street_lights')
export class StreetLight {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326,
  })
  @Index({ spatial: true })
  location: Point;

  @Column({ length: 15 })
  h3Index: string;

  @Column({ nullable: true })
  address: string;

  @ManyToOne(() => Region)
  region: Region;

  @Column()
  regionId: string;

  @Column({ type: 'int', nullable: true })
  wattage: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;
}

// Flood History Entity
@Entity('flood_history')
export class FloodHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'geometry',
    spatialFeatureType: 'Polygon',
    srid: 4326,
  })
  @Index({ spatial: true })
  area: Polygon;

  @Column({ type: 'int' })
  year: number;

  @Column({ type: 'float' })
  maxDepth: number; // cm

  @Column({ type: 'enum', enum: FloodRiskLevel })
  riskLevel: FloodRiskLevel;
}

enum FloodRiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  VERY_HIGH = 'very_high',
}
```

### Seoul Open Data API Endpoints

| Data Type | API Endpoint | Update Frequency |
|-----------|--------------|------------------|
| CCTV | `/CCTV정보조회서비스/getCCTVInfo/` | Daily |
| 주차 단속 | `/주정차단속카메라조회/getParking` | Weekly |
| 공영 주차장 | `/공영주차장정보/getParkingInfo/` | Hourly (availability) |
| 가로등 | `/가로등정보조회/getStreetLight/` | Weekly |
| 비상벨 | `/비상벨위치정보/getEmergencyBell/` | Monthly |
| 침수 흔적 | `/침수흔적정보/getFloodHistory/` | Yearly |
| 전기차 충전소 | `/전기차충전소정보/getEVCharger/` | Daily |

### Scheduler Configuration

```typescript
// Cron Jobs
@Injectable()
export class PublicDataScheduler {
  constructor(private readonly publicDataService: PublicDataService) {}

  // Every day at 3 AM
  @Cron('0 3 * * *')
  async updateDailyData() {
    await this.publicDataService.fetchCCTV();
    await this.publicDataService.fetchPublicWifi();
    await this.publicDataService.fetchEVChargers();
  }

  // Every hour at :05
  @Cron('5 * * * *')
  async updateParkingAvailability() {
    await this.publicDataService.fetchParkingAvailability();
  }

  // Every Sunday at 4 AM
  @Cron('0 4 * * 0')
  async updateWeeklyData() {
    await this.publicDataService.fetchStreetLights();
    await this.publicDataService.fetchParkingCameras();
  }

  // First day of month at 5 AM
  @Cron('0 5 1 * *')
  async updateMonthlyData() {
    await this.publicDataService.fetchDisasterData();
    await this.publicDataService.fetchEmergencyBells();
  }
}
```

## Dependencies

### Prerequisites
- ✅ Seoul Open Data API Key
- ✅ CORE-002 (Geospatial Infrastructure)
- ✅ PostgreSQL + PostGIS

### External Libraries
- `@nestjs/schedule` (Cron jobs)
- `axios` (HTTP client)
- `@nestjs/axios`
- `xml2js` (Seoul API returns XML)

### API Keys Required
```env
SEOUL_OPEN_DATA_API_KEY=your-api-key
SEOUL_API_BASE_URL=http://openapi.seoul.go.kr:8088
```

## Testing Strategy

### Unit Tests
- [ ] API response parsing
- [ ] H3 cell assignment logic
- [ ] Data deduplication
- [ ] Scheduler job execution

### Integration Tests
- [ ] Seoul API integration (with mock)
- [ ] Data storage and retrieval
- [ ] Spatial queries performance
- [ ] Cron job execution

### E2E Tests
- [ ] Complete data update flow
- [ ] User query nearby facilities
- [ ] Real-time parking availability

## Deployment Checklist

- [ ] Seoul Open Data API key 발급
- [ ] API key environment variable 설정
- [ ] Database migrations 실행
- [ ] Initial data seeding (1회)
- [ ] Scheduler jobs 활성화
- [ ] Monitoring setup (job failures)
- [ ] API documentation
- [ ] Rate limiting 설정

## Risks & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| API 서비스 중단 | High | Low | Fallback data, caching |
| API 응답 형식 변경 | High | Medium | Version validation, alerts |
| Rate limit 초과 | Medium | Medium | Request throttling |
| 데이터 정확도 문제 | Medium | Medium | Data validation, manual review |
| 스케줄러 실패 | High | Low | Retry logic, monitoring, alerts |

## Related Epics

- **Depends on**: CORE-002 (Geospatial Infrastructure)
- **Blocks**: USR-003 (Safety Map)
- **Blocks**: USR-004 (Parking Map)
- **Blocks**: USR-005 (Risk Map)
- **Blocks**: USR-006 (Life Map)

## Notes

- 서울시 데이터로 시작, 향후 타 지역 확대
- API 응답이 XML 형식인 경우 파싱 필요
- 실시간 데이터(주차 잔여)는 5분마다 업데이트
- 데이터 저장 시 중복 제거 필수 (좌표 기반)
- 초기 데이터 수집에 시간 소요 예상 (1-2일)

## Changelog

- **2025-12-24**: Epic created
  - Public Data Integration planned
  - 8 user stories defined (28 story points)
  - Seoul Open Data API architecture designed
  - Multi-category data collection specified
