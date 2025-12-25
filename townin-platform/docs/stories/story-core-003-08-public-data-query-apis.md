# Story CORE-003-08: Public Data Query APIs

**Epic**: CORE-003 Public Data Integration
**Priority**: P0 (Critical)
**Story Points**: 5
**Status**: 📋 Planned

## User Story

**As a** developer
**I want to** query public data by location
**So that** I can show nearby facilities to users

## Acceptance Criteria

- [ ] GET /public-data/cctv/nearby
- [ ] GET /public-data/parking/nearby
- [ ] GET /public-data/safety/nearby
- [ ] GET /public-data/amenities/nearby
- [ ] 반경 검색 지원
- [ ] H3 Grid Cell 기반 검색
- [ ] 응답 속도 < 200ms

## Tasks

### Backend
- [ ] Create PublicDataController
- [ ] Implement nearby queries for all data types
- [ ] Spatial indexing optimization
- [ ] Response pagination
- [ ] API Documentation (Swagger)
- [ ] Caching layer (Redis)

### Frontend
- [ ] PublicDataService (API client)
- [ ] Type definitions

### Testing
- [ ] Unit tests: Query builders
- [ ] Integration test: All endpoints
- [ ] Performance test: Response time < 200ms
- [ ] Load test: Concurrent requests

## Technical Notes

```typescript
// DTOs
export class GetNearbyDto {
  @IsNumber()
  @Min(-90)
  @Max(90)
  lat: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  lng: number;

  @IsNumber()
  @Min(0)
  @Max(10000)
  radius: number = 1000; // meters

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @IsNumber()
  @Min(0)
  offset?: number = 0;
}

export class GetByH3Dto {
  @IsString()
  @Length(15, 15)
  h3Index: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  k?: number = 1; // k-ring distance
}

// Public Data Controller
@ApiTags('Public Data')
@Controller('public-data')
export class PublicDataController {
  constructor(
    private readonly cctvService: CCTVService,
    private readonly parkingService: ParkingService,
    private readonly safetyInfraService: SafetyInfraService,
    private readonly amenitiesService: PublicAmenitiesService,
    private readonly cacheManager: Cache,
  ) {}

  /**
   * Get CCTVs nearby
   */
  @Get('cctv/nearby')
  @ApiOperation({ summary: 'Get CCTVs within radius' })
  @ApiResponse({ status: 200, description: 'Returns nearby CCTVs' })
  async getCCTVsNearby(@Query() dto: GetNearbyDto) {
    const cacheKey = `cctv:nearby:${dto.lat},${dto.lng}:${dto.radius}`;

    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      return cached;
    }

    const cctvs = await this.cctvService.findNearby(
      dto.lat,
      dto.lng,
      dto.radius,
    );

    const result = {
      data: cctvs.slice(dto.offset, dto.offset + dto.limit),
      total: cctvs.length,
      limit: dto.limit,
      offset: dto.offset,
    };

    await this.cacheManager.set(cacheKey, result, 3600); // 1 hour cache

    return result;
  }

  /**
   * Get parking facilities nearby
   */
  @Get('parking/nearby')
  @ApiOperation({ summary: 'Get parking cameras and public parking lots nearby' })
  async getParkingNearby(@Query() dto: GetNearbyDto) {
    const [cameras, parkingLots] = await Promise.all([
      this.parkingService.findCamerasNearby(dto.lat, dto.lng, dto.radius),
      this.parkingService.findParkingLotsNearby(dto.lat, dto.lng, dto.radius),
    ]);

    return {
      cameras: {
        data: cameras.slice(dto.offset, dto.offset + dto.limit),
        total: cameras.length,
      },
      parkingLots: {
        data: parkingLots.slice(dto.offset, dto.offset + dto.limit),
        total: parkingLots.length,
      },
    };
  }

  /**
   * Get safety infrastructure nearby
   */
  @Get('safety/nearby')
  @ApiOperation({ summary: 'Get street lights, emergency bells, and CCTVs nearby' })
  async getSafetyInfraNearby(@Query() dto: GetNearbyDto) {
    const [cctvs, streetLights, emergencyBells] = await Promise.all([
      this.cctvService.findNearby(dto.lat, dto.lng, dto.radius),
      this.safetyInfraService.findStreetLightsNearby(dto.lat, dto.lng, dto.radius),
      this.safetyInfraService.findEmergencyBellsNearby(dto.lat, dto.lng, dto.radius),
    ]);

    return {
      cctv: { data: cctvs, total: cctvs.length },
      streetLights: { data: streetLights, total: streetLights.length },
      emergencyBells: { data: emergencyBells, total: emergencyBells.length },
      safetyScore: this.calculateSafetyScore(cctvs.length, streetLights.length, emergencyBells.length),
    };
  }

  /**
   * Get amenities nearby
   */
  @Get('amenities/nearby')
  @ApiOperation({ summary: 'Get public amenities nearby' })
  async getAmenitiesNearby(@Query() dto: GetNearbyDto) {
    const [wifi, toilets, evChargers, shelters] = await Promise.all([
      this.amenitiesService.findWifiNearby(dto.lat, dto.lng, dto.radius),
      this.amenitiesService.findToiletsNearby(dto.lat, dto.lng, dto.radius),
      this.amenitiesService.findEVChargersNearby(dto.lat, dto.lng, dto.radius),
      this.amenitiesService.findCoolingSheltersNearby(dto.lat, dto.lng, dto.radius),
    ]);

    return {
      wifi: { data: wifi, total: wifi.length },
      toilets: { data: toilets, total: toilets.length },
      evChargers: { data: evChargers, total: evChargers.length },
      coolingShelters: { data: shelters, total: shelters.length },
    };
  }

  /**
   * Get disaster risk info for a location
   */
  @Get('disaster/check')
  @ApiOperation({ summary: 'Check disaster risks at location' })
  async checkDisasterRisk(@Query() dto: { lat: number; lng: number }) {
    const [floodRisk, nearestShelter, nearestSlope] = await Promise.all([
      this.disasterService.isInFloodRiskArea(dto.lat, dto.lng),
      this.disasterService.findNearestEarthquakeShelter(dto.lat, dto.lng),
      this.disasterService.findNearestSteepSlope(dto.lat, dto.lng),
    ]);

    return {
      flood: floodRisk,
      nearestShelter,
      nearestSlope,
    };
  }

  /**
   * Get all public data by H3 cell
   */
  @Get('by-cell/:h3Index')
  @ApiOperation({ summary: 'Get all public data in H3 cell' })
  async getByH3Cell(@Param('h3Index') h3Index: string, @Query() dto: GetByH3Dto) {
    const [cctvs, streetLights, parkingLots, wifi, toilets] = await Promise.all([
      this.cctvService.findByH3Cell(h3Index, dto.k),
      this.safetyInfraService.findStreetLightsByH3Cell(h3Index, dto.k),
      this.parkingService.findParkingLotsByH3Cell(h3Index, dto.k),
      this.amenitiesService.findWifiByH3Cell(h3Index, dto.k),
      this.amenitiesService.findToiletsByH3Cell(h3Index, dto.k),
    ]);

    return {
      h3Index,
      kRing: dto.k,
      cctv: cctvs,
      streetLights,
      parkingLots,
      wifi,
      toilets,
    };
  }

  /**
   * Calculate safety score (0-100)
   */
  private calculateSafetyScore(cctvCount: number, lightCount: number, bellCount: number): number {
    const cctvScore = Math.min(cctvCount / 5, 1) * 40;
    const lightScore = Math.min(lightCount / 20, 1) * 40;
    const bellScore = Math.min(bellCount / 2, 1) * 20;

    return Math.round(cctvScore + lightScore + bellScore);
  }
}

// Service Example: findNearby implementation
async findNearby(lat: number, lng: number, radiusMeters: number): Promise<CCTV[]> {
  return this.cctvRepo
    .createQueryBuilder('cctv')
    .where(
      `ST_DWithin(
        cctv.location::geography,
        ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography,
        :radius
      )`,
      { lat, lng, radius: radiusMeters },
    )
    .leftJoinAndSelect('cctv.region', 'region')
    .orderBy(`ST_Distance(cctv.location::geography, ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography)`)
    .limit(100)
    .getMany();
}

// H3 Cell-based query
async findByH3Cell(h3Index: string, k: number = 1): Promise<CCTV[]> {
  const neighbors = this.h3Service.getGridDisk(h3Index, k);

  return this.cctvRepo
    .createQueryBuilder('cctv')
    .where('cctv.h3Index IN (:...indices)', { indices: neighbors })
    .leftJoinAndSelect('cctv.region', 'region')
    .getMany();
}
```

## Dependencies

- **Depends on**: All data collection stories
- **Blocks**: Frontend map features

## Definition of Done

- [ ] All acceptance criteria met
- [ ] All endpoints implemented
- [ ] Swagger documentation complete
- [ ] Caching implemented
- [ ] Tests passing
- [ ] Performance benchmark < 200ms
- [ ] Code reviewed and merged
- [ ] API documentation published

## Notes

- 모든 응답은 pagination 지원
- Redis 캐싱으로 성능 최적화 (1시간 TTL)
- Spatial index (GIST) 필수
- 거리 정렬은 ST_Distance 사용
- H3 Cell 기반 검색은 빠른 인덱스 조회
- Safety Score 계산 로직 포함
- 복합 쿼리는 Promise.all로 병렬화
- 에러 처리 및 빈 결과 처리
