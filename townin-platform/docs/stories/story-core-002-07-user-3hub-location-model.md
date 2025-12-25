# Story CORE-002-07: User 3-Hub Location Model

**Epic**: CORE-002 Geospatial Data Infrastructure
**Priority**: P0 (Critical)
**Story Points**: 2
**Status**: 📋 Planned

## User Story

**As a** developer
**I want to** store user's 3 hub locations
**So that** users can set home/work/family locations

## Acceptance Criteria

- [ ] User 엔티티에 3개 h3Index 컬럼 추가
  - homeH3Index
  - workH3Index
  - familyH3Index
- [ ] 각 Hub에 대한 regionId 저장
- [ ] 최대 3개 Hub만 설정 가능
- [ ] Hub 수정/삭제 API

## Tasks

### Backend
- [ ] Migration: Add hub columns to users table
- [ ] Add homeH3Index, workH3Index, familyH3Index columns
- [ ] Add homeRegionId, workRegionId, familyRegionId columns
- [ ] Add hubsLastUpdated timestamp
- [ ] User entity enhancement
- [ ] Validation: 3-hub limit
- [ ] API: PATCH /users/:id/hubs
- [ ] API: DELETE /users/:id/hubs/:type

### Testing
- [ ] Unit tests: Hub validation
- [ ] Integration test: Hub CRUD operations
- [ ] Integration test: 3-hub limit enforcement
- [ ] E2E test: User hub setup flow

## Technical Notes

```typescript
// User Entity with 3 Hubs
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Region } from './region.entity';

export enum HubType {
  HOME = 'home',
  WORK = 'work',
  FAMILY = 'family',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  email: string;

  // Home Hub
  @Column({ nullable: true, length: 15 })
  homeH3Index: string;

  @Column({ nullable: true })
  homeAddress: string; // For display only

  @ManyToOne(() => Region, { nullable: true })
  homeRegion: Region;

  @Column({ nullable: true })
  homeRegionId: string;

  // Work Hub
  @Column({ nullable: true, length: 15 })
  workH3Index: string;

  @Column({ nullable: true })
  workAddress: string;

  @ManyToOne(() => Region, { nullable: true })
  workRegion: Region;

  @Column({ nullable: true })
  workRegionId: string;

  // Family Hub
  @Column({ nullable: true, length: 15 })
  familyH3Index: string;

  @Column({ nullable: true })
  familyAddress: string;

  @ManyToOne(() => Region, { nullable: true })
  familyRegion: Region;

  @Column({ nullable: true })
  familyRegionId: string;

  // Metadata
  @Column({ type: 'timestamp', nullable: true })
  hubsLastUpdated: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

// Migration
import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserHubs1234567890 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE users
      ADD COLUMN home_h3_index VARCHAR(15),
      ADD COLUMN home_address VARCHAR(255),
      ADD COLUMN home_region_id UUID,
      ADD COLUMN work_h3_index VARCHAR(15),
      ADD COLUMN work_address VARCHAR(255),
      ADD COLUMN work_region_id UUID,
      ADD COLUMN family_h3_index VARCHAR(15),
      ADD COLUMN family_address VARCHAR(255),
      ADD COLUMN family_region_id UUID,
      ADD COLUMN hubs_last_updated TIMESTAMP,
      ADD CONSTRAINT fk_home_region FOREIGN KEY (home_region_id) REFERENCES regions(id),
      ADD CONSTRAINT fk_work_region FOREIGN KEY (work_region_id) REFERENCES regions(id),
      ADD CONSTRAINT fk_family_region FOREIGN KEY (family_region_id) REFERENCES regions(id)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE users
      DROP COLUMN IF EXISTS home_h3_index,
      DROP COLUMN IF EXISTS home_address,
      DROP COLUMN IF EXISTS home_region_id,
      DROP COLUMN IF EXISTS work_h3_index,
      DROP COLUMN IF EXISTS work_address,
      DROP COLUMN IF EXISTS work_region_id,
      DROP COLUMN IF EXISTS family_h3_index,
      DROP COLUMN IF EXISTS family_address,
      DROP COLUMN IF EXISTS family_region_id,
      DROP COLUMN IF EXISTS hubs_last_updated
    `);
  }
}

// DTOs
export class UpdateUserHubDto {
  @IsNumber()
  @Min(-90)
  @Max(90)
  lat: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  lng: number;

  @IsOptional()
  @IsString()
  address?: string;
}

export class UpdateUserHubsDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateUserHubDto)
  home?: UpdateUserHubDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateUserHubDto)
  work?: UpdateUserHubDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateUserHubDto)
  family?: UpdateUserHubDto;
}

// Service
@Injectable()
export class UserHubService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly h3Service: H3Service,
    private readonly regionRepo: RegionRepository,
  ) {}

  /**
   * Update user hubs
   */
  async updateHubs(userId: string, dto: UpdateUserHubsDto): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Update home hub
    if (dto.home) {
      const h3Index = this.h3Service.latLngToH3(dto.home.lat, dto.home.lng);
      const region = await this.regionRepo.findByPoint(dto.home.lat, dto.home.lng);

      user.homeH3Index = h3Index;
      user.homeAddress = dto.home.address || null;
      user.homeRegionId = region?.id || null;
    }

    // Update work hub
    if (dto.work) {
      const h3Index = this.h3Service.latLngToH3(dto.work.lat, dto.work.lng);
      const region = await this.regionRepo.findByPoint(dto.work.lat, dto.work.lng);

      user.workH3Index = h3Index;
      user.workAddress = dto.work.address || null;
      user.workRegionId = region?.id || null;
    }

    // Update family hub
    if (dto.family) {
      const h3Index = this.h3Service.latLngToH3(dto.family.lat, dto.family.lng);
      const region = await this.regionRepo.findByPoint(dto.family.lat, dto.family.lng);

      user.familyH3Index = h3Index;
      user.familyAddress = dto.family.address || null;
      user.familyRegionId = region?.id || null;
    }

    user.hubsLastUpdated = new Date();

    return this.userRepo.save(user);
  }

  /**
   * Delete a specific hub
   */
  async deleteHub(userId: string, hubType: HubType): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    switch (hubType) {
      case HubType.HOME:
        user.homeH3Index = null;
        user.homeAddress = null;
        user.homeRegionId = null;
        break;
      case HubType.WORK:
        user.workH3Index = null;
        user.workAddress = null;
        user.workRegionId = null;
        break;
      case HubType.FAMILY:
        user.familyH3Index = null;
        user.familyAddress = null;
        user.familyRegionId = null;
        break;
    }

    user.hubsLastUpdated = new Date();

    return this.userRepo.save(user);
  }

  /**
   * Get user hubs
   */
  async getUserHubs(userId: string): Promise<{
    home: UserHub | null;
    work: UserHub | null;
    family: UserHub | null;
  }> {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['homeRegion', 'workRegion', 'familyRegion'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      home: user.homeH3Index
        ? this.formatHub(user.homeH3Index, user.homeAddress, user.homeRegion)
        : null,
      work: user.workH3Index
        ? this.formatHub(user.workH3Index, user.workAddress, user.workRegion)
        : null,
      family: user.familyH3Index
        ? this.formatHub(user.familyH3Index, user.familyAddress, user.familyRegion)
        : null,
    };
  }

  private formatHub(h3Index: string, address: string | null, region: Region | null): UserHub {
    const [lat, lng] = this.h3Service.h3ToLatLng(h3Index);

    return {
      h3Index,
      address,
      region: region
        ? {
            id: region.id,
            name: region.name,
            level: region.level,
          }
        : null,
      coordinates: { lat, lng },
    };
  }
}

// UserHub Response DTO
export interface UserHub {
  h3Index: string;
  address: string | null;
  region: {
    id: string;
    name: string;
    level: RegionLevel;
  } | null;
  coordinates: {
    lat: number;
    lng: number;
  };
}

// Controller
@Controller('users')
export class UsersController {
  constructor(private readonly userHubService: UserHubService) {}

  @Patch(':id/hubs')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update user hubs' })
  async updateHubs(@Param('id') id: string, @Body() dto: UpdateUserHubsDto) {
    return this.userHubService.updateHubs(id, dto);
  }

  @Delete(':id/hubs/:type')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete a hub' })
  async deleteHub(@Param('id') id: string, @Param('type') type: HubType) {
    return this.userHubService.deleteHub(id, type);
  }

  @Get(':id/hubs')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get user hubs' })
  async getUserHubs(@Param('id') id: string) {
    return this.userHubService.getUserHubs(id);
  }
}
```

## Dependencies

- **Depends on**: CORE-002-02 (H3 Service), CORE-002-04 (Region), User entity
- **Blocks**: USR-002 (3-Hub Setup UI)

## Definition of Done

- [ ] All acceptance criteria met
- [ ] All tasks completed
- [ ] Migration run successfully
- [ ] User entity enhanced
- [ ] Hub CRUD APIs implemented
- [ ] 3-hub limit validated
- [ ] Unit tests passing
- [ ] Integration tests passing
- [ ] Code reviewed and merged
- [ ] API documentation updated

## Notes

- H3 Index는 privacy-first 위치 저장
- address는 사용자 편의를 위한 표시용 (선택적)
- regionId는 지역 기반 필터링 최적화
- 최대 3개 Hub 제한 (프라이버시 보호)
- Hub 수정 시 hubsLastUpdated 자동 업데이트
- 각 Hub는 독립적으로 수정/삭제 가능
- 미설정 Hub는 NULL 허용
- 향후 Hub별 알림 설정 추가 가능 (Phase 2)
