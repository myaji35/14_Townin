# Story CORE-002-03: Grid Cell Entity & Storage

**Epic**: CORE-002 Geospatial Data Infrastructure
**Priority**: P0 (Critical)
**Story Points**: 2
**Status**: 📋 Planned

## User Story

**As a** developer
**I want to** store grid cell metadata
**So that** I can associate data with locations

## Acceptance Criteria

- [ ] GridCell 엔티티 생성
- [ ] h3Index (unique) 컬럼
- [ ] center (POINT) geometry
- [ ] boundary (POLYGON) geometry
- [ ] regionId (FK) 컬럼
- [ ] GIST 인덱스 생성
- [ ] CRUD operations 구현

## Tasks

### Backend
- [ ] Create GridCell entity
- [ ] Create GridCellRepository
- [ ] Implement findByH3Index()
- [ ] Implement findNearby()
- [ ] Implement findInRegion()
- [ ] Implement createFromCoordinates()

### Database
- [ ] Migration: grid_cells table
- [ ] Migration: Unique constraint on h3Index
- [ ] Migration: GIST spatial indexes
- [ ] Migration: Foreign key to regions

### Testing
- [ ] Unit tests: GridCell entity validation
- [ ] Integration test: CRUD operations
- [ ] Integration test: Spatial queries
- [ ] Integration test: Unique constraint
- [ ] Performance test: Index effectiveness

## Technical Notes

```typescript
// GridCell Entity
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Index, CreateDateColumn } from 'typeorm';
import { Point, Polygon } from 'geojson';
import { Region } from './region.entity';

@Entity('grid_cells')
export class GridCell {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 15 })
  @Index()
  h3Index: string; // H3 cell identifier (resolution 9)

  @Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326,
  })
  @Index({ spatial: true })
  center: Point; // WGS84 center point

  @Column({
    type: 'geometry',
    spatialFeatureType: 'Polygon',
    srid: 4326,
  })
  @Index({ spatial: true })
  boundary: Polygon; // Hexagon boundary

  @ManyToOne(() => Region, region => region.gridCells, { nullable: true })
  region: Region;

  @Column({ nullable: true })
  regionId: string;

  @CreateDateColumn()
  createdAt: Date;
}

// Migration
import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateGridCellsTable1234567890 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE grid_cells (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        h3_index VARCHAR(15) NOT NULL UNIQUE,
        center GEOMETRY(Point, 4326) NOT NULL,
        boundary GEOMETRY(Polygon, 4326) NOT NULL,
        region_id UUID,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        CONSTRAINT fk_region FOREIGN KEY (region_id) REFERENCES regions(id)
      )
    `);

    // Create spatial indexes (GIST)
    await queryRunner.query(`
      CREATE INDEX idx_grid_cells_center_gist ON grid_cells USING GIST(center)
    `);

    await queryRunner.query(`
      CREATE INDEX idx_grid_cells_boundary_gist ON grid_cells USING GIST(boundary)
    `);

    // Create index on h3Index for fast lookups
    await queryRunner.query(`
      CREATE INDEX idx_grid_cells_h3_index ON grid_cells(h3_index)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE grid_cells`);
  }
}

// GridCell Repository
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GridCell } from './grid-cell.entity';
import { H3Service } from '../h3/h3.service';

@Injectable()
export class GridCellRepository {
  constructor(
    @InjectRepository(GridCell)
    private readonly repository: Repository<GridCell>,
    private readonly h3Service: H3Service,
  ) {}

  /**
   * Find grid cell by H3 index
   */
  async findByH3Index(h3Index: string): Promise<GridCell | null> {
    return this.repository.findOne({
      where: { h3Index },
      relations: ['region'],
    });
  }

  /**
   * Find or create grid cell from coordinates
   */
  async findOrCreateFromCoordinates(lat: number, lng: number): Promise<GridCell> {
    const h3Index = this.h3Service.latLngToH3(lat, lng);

    let gridCell = await this.findByH3Index(h3Index);

    if (!gridCell) {
      gridCell = await this.createFromH3Index(h3Index);
    }

    return gridCell;
  }

  /**
   * Create grid cell from H3 index
   */
  async createFromH3Index(h3Index: string): Promise<GridCell> {
    const [lat, lng] = this.h3Service.h3ToLatLng(h3Index);
    const boundary = this.h3Service.h3ToBoundary(h3Index);

    const gridCell = this.repository.create({
      h3Index,
      center: {
        type: 'Point',
        coordinates: [lng, lat], // GeoJSON: [lng, lat]
      },
      boundary: {
        type: 'Polygon',
        coordinates: [
          [
            ...boundary.map(([lat, lng]) => [lng, lat]),
            [boundary[0][1], boundary[0][0]], // Close polygon
          ],
        ],
      },
    });

    return this.repository.save(gridCell);
  }

  /**
   * Find grid cells within radius
   */
  async findNearby(lat: number, lng: number, radiusMeters: number): Promise<GridCell[]> {
    return this.repository
      .createQueryBuilder('gc')
      .where(
        `ST_DWithin(
          gc.center::geography,
          ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography,
          :radius
        )`,
        { lat, lng, radius: radiusMeters },
      )
      .leftJoinAndSelect('gc.region', 'region')
      .getMany();
  }

  /**
   * Find grid cells in region
   */
  async findInRegion(regionId: string): Promise<GridCell[]> {
    return this.repository.find({
      where: { regionId },
      relations: ['region'],
    });
  }

  /**
   * Batch create grid cells
   */
  async batchCreate(h3Indices: string[]): Promise<GridCell[]> {
    const gridCells = h3Indices.map(h3Index => {
      const [lat, lng] = this.h3Service.h3ToLatLng(h3Index);
      const boundary = this.h3Service.h3ToBoundary(h3Index);

      return this.repository.create({
        h3Index,
        center: {
          type: 'Point',
          coordinates: [lng, lat],
        },
        boundary: {
          type: 'Polygon',
          coordinates: [
            [
              ...boundary.map(([lat, lng]) => [lng, lat]),
              [boundary[0][1], boundary[0][0]],
            ],
          ],
        },
      });
    });

    return this.repository.save(gridCells);
  }
}

// GridCell Service
@Injectable()
export class GridCellService {
  constructor(
    private readonly gridCellRepo: GridCellRepository,
    private readonly h3Service: H3Service,
  ) {}

  async getOrCreate(lat: number, lng: number): Promise<GridCell> {
    return this.gridCellRepo.findOrCreateFromCoordinates(lat, lng);
  }

  async findNearby(lat: number, lng: number, radiusMeters: number): Promise<GridCell[]> {
    return this.gridCellRepo.findNearby(lat, lng, radiusMeters);
  }

  async findByH3Index(h3Index: string): Promise<GridCell | null> {
    return this.gridCellRepo.findByH3Index(h3Index);
  }
}
```

## Dependencies

- **Depends on**: CORE-002-01 (PostGIS), CORE-002-02 (H3 Service)
- **Blocks**: All location-based features

## Definition of Done

- [ ] All acceptance criteria met
- [ ] All tasks completed
- [ ] GridCell entity created
- [ ] Database migration run successfully
- [ ] GIST indexes created and verified
- [ ] CRUD operations working
- [ ] Unit tests passing (>85% coverage)
- [ ] Integration tests passing
- [ ] Performance benchmark documented
- [ ] Code reviewed and merged
- [ ] API documentation updated

## Notes

- Grid Cell은 on-demand 생성 (실제 사용되는 셀만 DB 저장)
- h3Index에 UNIQUE constraint로 중복 방지
- center는 빠른 거리 검색용, boundary는 시각화용
- GIST 인덱스는 공간 쿼리 성능에 필수
- regionId는 나중에 자동 매핑 (CORE-002-06)
- 전국 모든 셀을 미리 생성하지 않음 (메모리 효율)
- GeoJSON 포맷: [lng, lat] 순서 주의 (PostGIS와 다름)
