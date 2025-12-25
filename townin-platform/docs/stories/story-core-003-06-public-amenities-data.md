# Story CORE-003-06: Public Amenities Data

**Epic**: CORE-003 Public Data Integration
**Priority**: P0 (Critical)
**Story Points**: 4
**Status**: 📋 Planned

## User Story

**As a** user
**I want to** see public amenities
**So that** I can use them conveniently

## Acceptance Criteria

- [ ] 공공 와이파이 엔티티
- [ ] 무더위 쉼터 엔티티
- [ ] 전기차 충전소 엔티티
- [ ] 공중 화장실 엔티티
- [ ] 운영 시간 및 가용성 정보
- [ ] 일별 자동 업데이트

## Tasks

### Backend
- [ ] Create PublicWifi entity
- [ ] Create CoolingShelter entity
- [ ] Create EVChargingStation entity
- [ ] Create PublicToilet entity
- [ ] Migration: public_amenities tables
- [ ] Implement fetchPublicWifi()
- [ ] Implement fetchCoolingShelters()
- [ ] Implement fetchEVChargingStations()
- [ ] Implement fetchPublicToilets()
- [ ] Operating hours parser

### Scheduler
- [ ] Daily cron: @Cron('0 3 * * *')

### Testing
- [ ] Unit tests: Data parsing
- [ ] Integration test: Complete flow
- [ ] Spatial query tests

## Technical Notes

```typescript
// PublicWifi Entity
@Entity('public_wifi')
export class PublicWifi {
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

  @Column({ nullable: true })
  installLocation: string; // 설치 장소 상세

  @Column({ nullable: true })
  serviceProvider: string; // 제공 기관

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

// CoolingShelter Entity
@Entity('cooling_shelters')
export class CoolingShelter {
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

  @Column({ type: 'json', nullable: true })
  operatingPeriod: {
    startDate: string; // MM-DD
    endDate: string;   // MM-DD
  };

  @Column({ type: 'json', nullable: true })
  operatingHours: {
    weekday: { open: string; close: string };
    weekend: { open: string; close: string };
  };

  @Column({ type: 'int', nullable: true })
  capacity: number; // 수용 인원

  @Column({ type: 'float', nullable: true })
  area: number; // m²

  @Column({ type: 'boolean', default: true })
  hasAirConditioner: boolean;

  @Column({ type: 'boolean', default: false })
  hasDrinkingWater: boolean;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;
}

// EVChargingStation Entity
@Entity('ev_charging_stations')
export class EVChargingStation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  stationId: string; // 충전소 ID

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

  @Column({ type: 'enum', enum: ChargerType })
  chargerType: ChargerType;

  @Column({ type: 'int' })
  totalChargers: number;

  @Column({ type: 'int', nullable: true })
  availableChargers: number; // 실시간 가용

  @Column({ type: 'float', nullable: true })
  powerKW: number; // 충전 용량

  @Column({ type: 'varchar', nullable: true })
  operator: string; // 운영 기관

  @Column({ type: 'boolean', default: true })
  isPaid: boolean;

  @Column({ type: 'json', nullable: true })
  operatingHours: {
    is24Hours: boolean;
    weekday?: { open: string; close: string };
    weekend?: { open: string; close: string };
  };

  @Column({ type: 'timestamp', nullable: true })
  lastAvailabilityUpdate: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

enum ChargerType {
  SLOW = 'slow',       // 완속 (7kW)
  FAST = 'fast',       // 급속 (50kW)
  SUPERFAST = 'superfast', // 초급속 (100kW+)
}

// PublicToilet Entity
@Entity('public_toilets')
export class PublicToilet {
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

  @Column({ type: 'int', nullable: true })
  maleToilets: number;

  @Column({ type: 'int', nullable: true })
  femaleToilets: number;

  @Column({ type: 'int', nullable: true })
  disabledToilets: number;

  @Column({ type: 'boolean', default: false })
  hasDiaperChangingStation: boolean;

  @Column({ type: 'boolean', default: false })
  hasEmergencyBell: boolean;

  @Column({ type: 'varchar', nullable: true })
  managementAgency: string;

  @Column({ type: 'json', nullable: true })
  operatingHours: {
    is24Hours: boolean;
    hours?: { open: string; close: string };
  };

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

// Public Amenities Service
@Injectable()
export class PublicAmenitiesService {
  async fetchPublicWifi(): Promise<{ created: number; updated: number }> {
    const response = await this.publicDataService.fetchData('공공와이파이/getWifiInfo/1/20000');

    const wifiList = response.공공와이파이?.row || [];
    let created = 0, updated = 0;

    for (const item of wifiList) {
      const lat = parseFloat(item.위도);
      const lng = parseFloat(item.경도);

      if (!lat || !lng) continue;

      const existing = await this.publicWifiRepo.findOne({
        where: {
          location: Raw(alias => `ST_Equals(${alias}, ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326))`),
        },
      });

      const h3Index = this.h3Service.latLngToH3(lat, lng);
      const region = await this.regionService.findByPoint(lat, lng);

      const wifiData = {
        name: item.와이파이명,
        location: { type: 'Point', coordinates: [lng, lat] },
        h3Index,
        address: item.소재지,
        installLocation: item.설치장소,
        serviceProvider: item.서비스제공기관,
        regionId: region?.id,
      };

      if (existing) {
        await this.publicWifiRepo.update(existing.id, wifiData);
        updated++;
      } else {
        await this.publicWifiRepo.save(wifiData);
        created++;
      }
    }

    return { created, updated };
  }

  async fetchEVChargingStations(): Promise<{ created: number; updated: number }> {
    const response = await this.publicDataService.fetchData('전기차충전소/getChargerInfo/1/10000');

    // Parse charger data, update availability
    // ...
  }

  async fetchPublicToilets(): Promise<{ created: number; updated: number }> {
    const response = await this.publicDataService.fetchData('공중화장실/getToiletInfo/1/5000');

    // Parse toilet data
    // ...
  }

  async fetchCoolingShelters(): Promise<{ created: number; updated: number }> {
    const response = await this.publicDataService.fetchData('무더위쉼터/getShelterInfo/1/3000');

    // Parse shelter data
    // ...
  }
}
```

## Dependencies

- **Depends on**: CORE-003-01
- **Blocks**: Life Map, Convenience features

## Definition of Done

- [ ] All acceptance criteria met
- [ ] All entities created
- [ ] Migrations run
- [ ] All fetch methods working
- [ ] Operating hours parsing working
- [ ] Daily scheduler configured
- [ ] Tests passing
- [ ] Code reviewed and merged
- [ ] Initial data seeded

## Notes

- 공공 와이파이: 약 20,000개 (서울시)
- 전기차 충전소: 약 8,000개 (전국)
- 공중 화장실: 약 5,000개
- 무더위 쉼터: 약 3,000개 (여름철만 운영)
- EV 충전소는 실시간 가용성 정보 제공
- 운영 시간은 JSON 구조로 유연하게 저장
- 장애인 편의시설 정보 포함 (공중화장실)
