# Story CORE-003-04: Street Light & Emergency Bell Data

**Epic**: CORE-003 Public Data Integration
**Priority**: P0 (Critical)
**Story Points**: 3
**Status**: 📋 Planned

## User Story

**As a** user
**I want to** see street lights and emergency bells
**So that** I can choose safe routes

## Acceptance Criteria

- [ ] 가로등 엔티티 생성
- [ ] 비상벨 엔티티 생성
- [ ] 위치 데이터 수집
- [ ] H3 Grid Cell 매핑
- [ ] 지역별 집계 (safety score 계산용)
- [ ] 주간 자동 업데이트

## Tasks

### Backend
- [ ] Create StreetLight entity
- [ ] Create EmergencyBell entity
- [ ] Migration: safety_infrastructure tables
- [ ] Implement fetchStreetLights()
- [ ] Implement fetchEmergencyBells()
- [ ] H3 cell assignment
- [ ] Region mapping
- [ ] Safety score aggregation service

### Scheduler
- [ ] Weekly cron: @Cron('0 4 * * 0')
- [ ] Job logging

### Testing
- [ ] Unit tests: Data parsing
- [ ] Integration test: Data fetch and save
- [ ] Integration test: Spatial queries

## Technical Notes

```typescript
// StreetLight Entity
@Entity('street_lights')
export class StreetLight {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  lightId: string; // 관리번호

  @Column({ type: 'geometry', spatialFeatureType: 'Point', srid: 4326 })
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
  wattage: number; // 와트

  @Column({ type: 'varchar', nullable: true })
  lampType: string; // LED, 나트륨 등

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'timestamp', nullable: true })
  lastMaintenance: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

// EmergencyBell Entity
@Entity('emergency_bells')
export class EmergencyBell {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'geometry', spatialFeatureType: 'Point', srid: 4326 })
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

  @Column({ type: 'varchar', nullable: true })
  installLocation: string; // 설치 위치 상세

  @Column({ type: 'boolean', default: true })
  isOperational: boolean;

  @Column({ type: 'timestamp', nullable: true })
  lastInspection: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

// Safety Infrastructure Service
@Injectable()
export class SafetyInfraService {
  async fetchStreetLights(): Promise<{ created: number; updated: number }> {
    const response = await this.publicDataService.fetchData('가로등정보/getStreetLight/1/50000');

    const lights = response.가로등정보?.row || [];
    let created = 0, updated = 0;

    for (const item of lights) {
      const lat = parseFloat(item.위도);
      const lng = parseFloat(item.경도);

      if (!lat || !lng) continue;

      const existing = await this.streetLightRepo.findOne({
        where: { lightId: item.관리번호 },
      });

      const h3Index = this.h3Service.latLngToH3(lat, lng);
      const region = await this.regionService.findByPoint(lat, lng);

      const lightData = {
        lightId: item.관리번호,
        location: { type: 'Point', coordinates: [lng, lat] },
        h3Index,
        address: item.소재지,
        wattage: parseInt(item.용량) || null,
        lampType: item.등종류,
        regionId: region?.id,
      };

      if (existing) {
        await this.streetLightRepo.update(existing.id, lightData);
        updated++;
      } else {
        await this.streetLightRepo.save(lightData);
        created++;
      }
    }

    return { created, updated };
  }

  async fetchEmergencyBells(): Promise<{ created: number; updated: number }> {
    const response = await this.publicDataService.fetchData('비상벨정보/getEmergencyBell/1/10000');

    // Similar logic to street lights
    // ...
  }

  /**
   * Calculate safety score for a region based on infrastructure density
   */
  async calculateSafetyScore(regionId: string): Promise<number> {
    const [cctvCount, lightCount, bellCount] = await Promise.all([
      this.cctvRepo.count({ where: { regionId } }),
      this.streetLightRepo.count({ where: { regionId } }),
      this.emergencyBellRepo.count({ where: { regionId } }),
    ]);

    // Weighted score (0-100)
    const cctvScore = Math.min(cctvCount / 10, 1) * 40;
    const lightScore = Math.min(lightCount / 50, 1) * 40;
    const bellScore = Math.min(bellCount / 5, 1) * 20;

    return Math.round(cctvScore + lightScore + bellScore);
  }
}
```

## Dependencies

- **Depends on**: CORE-003-01, CORE-003-02 (CCTV)
- **Blocks**: Safety Map, Route Safety Score

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Entities created
- [ ] Migrations run
- [ ] Fetch methods working
- [ ] Safety score calculation working
- [ ] Weekly scheduler configured
- [ ] Tests passing
- [ ] Code reviewed and merged
- [ ] Initial data seeded

## Notes

- 가로등: 약 300,000개 (서울시 전체)
- 비상벨: 약 5,000개
- 안전 점수는 CCTV, 가로등, 비상벨 밀도 기반
- 주간 업데이트로 신규/철거 반영
- 가로등 타입별 조명 효과 차이 고려 가능
