# Story CORE-003-05: Disaster Safety Data

**Epic**: CORE-003 Public Data Integration
**Priority**: P0 (Critical)
**Story Points**: 4
**Status**: 📋 Planned

## User Story

**As a** user
**I want to** see disaster safety information
**So that** I can prepare for emergencies

## Acceptance Criteria

- [ ] 침수 흔적도 엔티티 (Polygon)
- [ ] 제설함 위치 엔티티
- [ ] 급경사지 엔티티
- [ ] 지진 대피소 엔티티
- [ ] 위험 레벨 표시
- [ ] 월간 자동 업데이트

## Tasks

### Backend
- [ ] Create FloodHistory entity (Polygon geometry)
- [ ] Create SnowRemovalBox entity
- [ ] Create SteepSlope entity
- [ ] Create EarthquakeShelter entity
- [ ] Migration: disaster_safety tables
- [ ] Implement fetchFloodHistory()
- [ ] Implement fetchSnowRemovalBoxes()
- [ ] Implement fetchSteepSlopes()
- [ ] Implement fetchEarthquakeShelters()
- [ ] Risk level calculation logic

### Scheduler
- [ ] Monthly cron: @Cron('0 5 1 * *')

### Testing
- [ ] Unit tests: Polygon parsing
- [ ] Unit tests: Risk level calculation
- [ ] Integration test: Complete flow
- [ ] Spatial query tests

## Technical Notes

```typescript
// FloodHistory Entity
@Entity('flood_history')
export class FloodHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'geometry', spatialFeatureType: 'Polygon', srid: 4326 })
  @Index({ spatial: true })
  area: Polygon;

  @Column()
  district: string; // 자치구

  @Column({ nullable: true })
  neighborhood: string; // 동

  @Column({ type: 'int' })
  year: number;

  @Column({ type: 'float' })
  maxDepth: number; // cm

  @Column({ type: 'varchar', nullable: true })
  cause: string; // 원인

  @Column({ type: 'enum', enum: FloodRiskLevel })
  riskLevel: FloodRiskLevel;

  @CreateDateColumn()
  createdAt: Date;
}

enum FloodRiskLevel {
  LOW = 'low',           // < 10cm
  MEDIUM = 'medium',     // 10-30cm
  HIGH = 'high',         // 30-50cm
  VERY_HIGH = 'very_high', // > 50cm
}

// SnowRemovalBox Entity
@Entity('snow_removal_boxes')
export class SnowRemovalBox {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  boxId: string;

  @Column({ type: 'geometry', spatialFeatureType: 'Point', srid: 4326 })
  @Index({ spatial: true })
  location: Point;

  @Column({ length: 15 })
  h3Index: string;

  @Column()
  address: string;

  @ManyToOne(() => Region)
  region: Region;

  @Column()
  regionId: string;

  @Column({ type: 'int', nullable: true })
  capacity: number; // 용량 (리터)

  @CreateDateColumn()
  createdAt: Date;
}

// SteepSlope Entity
@Entity('steep_slopes')
export class SteepSlope {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  slopeName: string;

  @Column({ type: 'geometry', spatialFeatureType: 'Polygon', srid: 4326 })
  @Index({ spatial: true })
  area: Polygon;

  @Column({ type: 'float' })
  height: number; // meters

  @Column({ type: 'float' })
  angle: number; // degrees

  @Column({ type: 'enum', enum: SlopeRiskLevel })
  riskLevel: SlopeRiskLevel;

  @Column({ type: 'boolean', default: false })
  hasRetainingWall: boolean;

  @Column({ nullable: true })
  lastInspection: Date;

  @CreateDateColumn()
  createdAt: Date;
}

enum SlopeRiskLevel {
  A = 'a', // 매우 위험
  B = 'b', // 위험
  C = 'c', // 주의
  D = 'd', // 관심
}

// EarthquakeShelter Entity
@Entity('earthquake_shelters')
export class EarthquakeShelter {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'geometry', spatialFeatureType: 'Point', srid: 4326 })
  @Index({ spatial: true })
  location: Point;

  @Column({ length: 15 })
  h3Index: string;

  @Column()
  address: string;

  @ManyToOne(() => Region)
  region: Region;

  @Column()
  regionId: string;

  @Column({ type: 'int' })
  capacity: number; // 수용 인원

  @Column({ type: 'float', nullable: true })
  area: number; // 면적 (m²)

  @Column({ type: 'enum', enum: ShelterType })
  shelterType: ShelterType;

  @Column({ type: 'varchar', nullable: true })
  facilityName: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;
}

enum ShelterType {
  OUTDOOR = 'outdoor', // 실외 대피소
  INDOOR = 'indoor',   // 실내 대피소
  CIVIL_DEFENSE = 'civil_defense', // 민방위 대피소
}

// Disaster Safety Service
@Injectable()
export class DisasterSafetyService {
  async fetchFloodHistory(): Promise<{ created: number }> {
    const response = await this.publicDataService.fetchData('침수흔적도/getFloodHistory/1/1000');

    const floods = response.침수흔적도?.row || [];
    let created = 0;

    for (const item of floods) {
      // Parse polygon coordinates from API
      const coordinates = JSON.parse(item.좌표);

      const riskLevel = this.calculateFloodRisk(parseFloat(item.최대침수깊이));

      await this.floodHistoryRepo.save({
        area: {
          type: 'Polygon',
          coordinates,
        },
        district: item.자치구,
        neighborhood: item.법정동,
        year: parseInt(item.발생연도),
        maxDepth: parseFloat(item.최대침수깊이),
        cause: item.원인,
        riskLevel,
      });

      created++;
    }

    return { created };
  }

  private calculateFloodRisk(depth: number): FloodRiskLevel {
    if (depth < 10) return FloodRiskLevel.LOW;
    if (depth < 30) return FloodRiskLevel.MEDIUM;
    if (depth < 50) return FloodRiskLevel.HIGH;
    return FloodRiskLevel.VERY_HIGH;
  }

  async fetchEarthquakeShelters(): Promise<{ created: number; updated: number }> {
    const response = await this.publicDataService.fetchData('지진대피소/getShelter/1/5000');

    // Parse and save shelters
    // ...
  }

  /**
   * Check if a point is in a flood risk area
   */
  async isInFloodRiskArea(lat: number, lng: number): Promise<{
    isRisk: boolean;
    riskLevel?: FloodRiskLevel;
    history?: FloodHistory[];
  }> {
    const floods = await this.floodHistoryRepo
      .createQueryBuilder('flood')
      .where(
        `ST_Contains(flood.area, ST_SetSRID(ST_MakePoint(:lng, :lat), 4326))`,
        { lat, lng },
      )
      .orderBy('flood.year', 'DESC')
      .getMany();

    if (floods.length === 0) {
      return { isRisk: false };
    }

    const highestRisk = floods.reduce((max, flood) =>
      flood.riskLevel > max ? flood.riskLevel : max
    , FloodRiskLevel.LOW);

    return {
      isRisk: true,
      riskLevel: highestRisk,
      history: floods,
    };
  }
}
```

## Dependencies

- **Depends on**: CORE-003-01
- **Blocks**: Risk Map, Emergency features

## Definition of Done

- [ ] All acceptance criteria met
- [ ] All entities created
- [ ] Migrations run
- [ ] Polygon geometry working
- [ ] Risk level calculation working
- [ ] Monthly scheduler configured
- [ ] Tests passing
- [ ] Code reviewed and merged
- [ ] Initial data seeded

## Notes

- 침수 흔적도는 Polygon geometry
- 급경사지는 정기 점검 필요
- 지진 대피소는 수용 인원 정보 중요
- 위험 레벨은 사용자 알림에 활용
- 제설함은 겨울철 중요 정보
- 월간 업데이트로 최신 정보 유지
