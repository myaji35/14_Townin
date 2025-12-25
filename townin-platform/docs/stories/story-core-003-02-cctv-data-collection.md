# Story CORE-003-02: CCTV Data Collection

**Epic**: CORE-003 Public Data Integration
**Priority**: P0 (Critical)
**Story Points**: 3
**Status**: 📋 Planned

## User Story

**As a** platform
**I want to** collect CCTV location data
**So that** users can see safe areas

## Acceptance Criteria

- [ ] CCTV 엔티티 생성
- [ ] Seoul API 호출 및 파싱
- [ ] 위치 데이터를 H3 Grid Cell로 변환
- [ ] 중복 제거 (좌표 기반)
- [ ] 일별 자동 업데이트
- [ ] Region 자동 매핑

## Tasks

### Backend
- [ ] Create CCTV entity
- [ ] Migration: cctv table
- [ ] Implement fetchCCTV() method
- [ ] Parse Seoul CCTV API response
- [ ] H3 cell assignment
- [ ] Region mapping
- [ ] Deduplication logic
- [ ] Batch insert/update

### Scheduler
- [ ] Daily cron job (@Cron('0 3 * * *'))
- [ ] Job logging
- [ ] Error handling

### Testing
- [ ] Unit tests: Data parsing
- [ ] Unit tests: Deduplication
- [ ] Integration test: CCTV data fetch
- [ ] Integration test: Database insert

## Technical Notes

```typescript
// CCTV Entity
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Index, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Point } from 'geojson';
import { Region } from '../regions/region.entity';

export enum CCTVType {
  SECURITY = 'security',    // 방범
  TRAFFIC = 'traffic',      // 교통
  DISASTER = 'disaster',    // 재난
  GENERAL = 'general',      // 일반
}

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
  @Index()
  h3Index: string;

  @Column({ nullable: true })
  address: string;

  @ManyToOne(() => Region, { nullable: true })
  region: Region;

  @Column({ nullable: true })
  regionId: string;

  @Column({ type: 'enum', enum: CCTVType, default: CCTVType.GENERAL })
  type: CCTVType;

  @Column({ nullable: true })
  purpose: string; // 설치 목적

  @Column({ nullable: true })
  managementAgency: string; // 관리 기관

  @Column({ type: 'timestamp', nullable: true })
  lastUpdated: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

// CCTV Service
@Injectable()
export class CCTVService {
  private readonly logger = new Logger(CCTVService.name);

  constructor(
    @InjectRepository(CCTV)
    private readonly cctvRepo: Repository<CCTV>,
    private readonly publicDataService: PublicDataService,
    private readonly h3Service: H3Service,
    private readonly regionService: RegionService,
  ) {}

  /**
   * Fetch and save CCTV data from Seoul Open Data API
   */
  async fetchAndSaveCCTVData(): Promise<{ created: number; updated: number; errors: number }> {
    this.logger.log('Starting CCTV data fetch...');

    try {
      // Fetch from Seoul API
      const response = await this.publicDataService.fetchData('CCTV정보조회서비스/getCCTVInfo/1/5000');

      const cctvList = response.CCTV정보조회서비스?.row || [];
      this.logger.log(`Fetched ${cctvList.length} CCTV records`);

      let created = 0;
      let updated = 0;
      let errors = 0;

      for (const item of cctvList) {
        try {
          const lat = parseFloat(item.위도);
          const lng = parseFloat(item.경도);

          if (!lat || !lng) {
            this.logger.warn(`Invalid coordinates for CCTV: ${item.CCTV명}`);
            errors++;
            continue;
          }

          // Check for duplicate by coordinates
          const existing = await this.cctvRepo.findOne({
            where: {
              location: Raw(alias => `ST_Equals(${alias}, ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326))`),
            },
          });

          const h3Index = this.h3Service.latLngToH3(lat, lng);
          const region = await this.regionService.findByPoint(lat, lng);

          const cctvData = {
            name: item.CCTV명,
            location: {
              type: 'Point',
              coordinates: [lng, lat],
            },
            h3Index,
            address: item.소재지도로명주소 || item.소재지지번주소,
            type: this.mapCCTVType(item.설치목적구분),
            purpose: item.설치목적구분,
            managementAgency: item.관리기관명,
            regionId: region?.id,
            lastUpdated: new Date(),
          };

          if (existing) {
            await this.cctvRepo.update(existing.id, cctvData);
            updated++;
          } else {
            await this.cctvRepo.save(this.cctvRepo.create(cctvData));
            created++;
          }

        } catch (error) {
          this.logger.error(`Error processing CCTV: ${item.CCTV명}`, error);
          errors++;
        }
      }

      this.logger.log(`CCTV data sync complete: ${created} created, ${updated} updated, ${errors} errors`);

      return { created, updated, errors };

    } catch (error) {
      this.logger.error('Failed to fetch CCTV data:', error);
      throw error;
    }
  }

  /**
   * Map Seoul API CCTV type to our enum
   */
  private mapCCTVType(purpose: string): CCTVType {
    if (purpose?.includes('방범')) return CCTVType.SECURITY;
    if (purpose?.includes('교통')) return CCTVType.TRAFFIC;
    if (purpose?.includes('재난')) return CCTVType.DISASTER;
    return CCTVType.GENERAL;
  }

  /**
   * Get CCTVs near a location
   */
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
      .orderBy(`ST_Distance(cctv.location::geography, ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography)`)
      .limit(50)
      .getMany();
  }
}

// Scheduler
@Injectable()
export class CCTVScheduler {
  private readonly logger = new Logger(CCTVScheduler.name);

  constructor(private readonly cctvService: CCTVService) {}

  @Cron('0 3 * * *') // Every day at 3 AM
  async updateCCTVData() {
    this.logger.log('Starting scheduled CCTV data update...');
    try {
      const result = await this.cctvService.fetchAndSaveCCTVData();
      this.logger.log('CCTV data update completed:', result);
    } catch (error) {
      this.logger.error('CCTV data update failed:', error);
      // TODO: Send alert notification
    }
  }
}
```

## Dependencies

- **Depends on**: CORE-003-01 (PublicDataService), CORE-002 (H3, Region)
- **Blocks**: Safety Map features

## Definition of Done

- [ ] All acceptance criteria met
- [ ] CCTV entity created
- [ ] Database migration run
- [ ] fetchCCTV method working
- [ ] Deduplication working
- [ ] H3 and Region mapping working
- [ ] Daily scheduler configured
- [ ] Unit tests passing
- [ ] Integration tests passing
- [ ] Code reviewed and merged
- [ ] Initial data seeded

## Notes

- 서울시 CCTV 약 50,000개 예상
- 중복 방지: 좌표 기반 (ST_Equals)
- 일일 업데이트로 신규/폐기 CCTV 반영
- CCTV 타입 분류로 필터링 가능
- 관리기관 정보로 문의처 제공 가능
- lastUpdated로 데이터 신선도 확인
