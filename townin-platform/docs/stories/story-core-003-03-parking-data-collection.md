# Story CORE-003-03: Parking Data Collection

**Epic**: CORE-003 Public Data Integration
**Priority**: P0 (Critical)
**Story Points**: 4
**Status**: 📋 Planned

## User Story

**As a** user
**I want to** see parking camera and public parking data
**So that** I can avoid fines and find parking

## Acceptance Criteria

- [ ] 주정차 단속 카메라 엔티티
- [ ] 공영 주차장 엔티티
- [ ] 실시간 잔여 대수 업데이트
- [ ] 운영 시간 정보
- [ ] 요금 정보
- [ ] H3 Grid Cell 매핑

## Tasks

### Backend
- [ ] Create ParkingCamera entity
- [ ] Create PublicParking entity
- [ ] Migration: parking tables
- [ ] Implement fetchParkingCameras()
- [ ] Implement fetchPublicParking()
- [ ] Implement fetchParkingAvailability()
- [ ] Real-time availability update logic
- [ ] Operating hours parser
- [ ] Fee structure parser

### Scheduler
- [ ] Weekly cron (cameras): @Cron('0 4 * * 0')
- [ ] Daily cron (parking lots): @Cron('0 3 * * *')
- [ ] Hourly cron (availability): @Cron('5 * * * *')

### Testing
- [ ] Unit tests: Data parsing
- [ ] Unit tests: Availability updates
- [ ] Integration test: Complete flow
- [ ] Performance test: Hourly updates

## Technical Notes

```typescript
// ParkingCamera Entity
@Entity('parking_cameras')
export class ParkingCamera {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  location_name: string;

  @Column({ type: 'geometry', spatialFeatureType: 'Point', srid: 4326 })
  @Index({ spatial: true })
  location: Point;

  @Column({ length: 15 })
  h3Index: string;

  @Column({ nullable: true })
  address: string;

  @ManyToOne(() => Region)
  region: Region;

  @Column({ nullable: true })
  regionId: string;

  @Column({ type: 'timestamp', nullable: true })
  lastUpdated: Date;

  @CreateDateColumn()
  createdAt: Date;
}

// PublicParking Entity
@Entity('public_parking')
export class PublicParking {
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
  totalSpaces: number;

  @Column({ type: 'int', nullable: true })
  availableSpaces: number;

  @Column({ type: 'json', nullable: true })
  operatingHours: {
    weekday: { open: string; close: string };
    saturday: { open: string; close: string };
    sunday: { open: string; close: string };
    holiday: { open: string; close: string };
  };

  @Column({ type: 'json', nullable: true })
  fees: {
    basicTime: number; // minutes
    basicFee: number; // KRW
    additionalTime: number; // minutes
    additionalFee: number; // KRW
    dayMaxFee: number; // KRW
  };

  @Column({ type: 'enum', enum: ParkingType })
  parkingType: ParkingType;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'timestamp', nullable: true })
  lastAvailabilityUpdate: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

enum ParkingType {
  OUTDOOR = 'outdoor',
  INDOOR = 'indoor',
  MECHANICAL = 'mechanical',
}

// Parking Service
@Injectable()
export class ParkingService {
  async fetchParkingCameras(): Promise<{ created: number; updated: number }> {
    const response = await this.publicDataService.fetchData('주정차단속카메라/getParkingCamera/1/5000');
    // Parse and save...
  }

  async fetchPublicParking(): Promise<{ created: number; updated: number }> {
    const response = await this.publicDataService.fetchData('공영주차장정보/getParkingInfo/1/2000');
    // Parse metadata, operating hours, fees...
  }

  async fetchParkingAvailability(): Promise<{ updated: number }> {
    const parkingLots = await this.publicParkingRepo.find();
    let updated = 0;

    for (const lot of parkingLots) {
      try {
        const availability = await this.publicDataService.fetchData(`주차장실시간정보/${lot.id}`);
        lot.availableSpaces = parseInt(availability.잔여대수);
        lot.lastAvailabilityUpdate = new Date();
        await this.publicParkingRepo.save(lot);
        updated++;
      } catch (error) {
        this.logger.warn(`Failed to update availability for ${lot.name}`);
      }
    }

    return { updated };
  }
}
```

## Dependencies

- **Depends on**: CORE-003-01 (PublicDataService)
- **Blocks**: Parking Map features

## Definition of Done

- [ ] All acceptance criteria met
- [ ] All entities created
- [ ] Migrations run
- [ ] All fetch methods working
- [ ] Schedulers configured
- [ ] Tests passing
- [ ] Code reviewed and merged
- [ ] Initial data seeded

## Notes

- 주차 카메라: 약 2,000개 (서울시)
- 공영 주차장: 약 1,500개
- 실시간 잔여 데이터는 5분마다 업데이트
- 운영시간/요금은 JSON 구조로 저장
- 주차장 타입별 필터링 가능
