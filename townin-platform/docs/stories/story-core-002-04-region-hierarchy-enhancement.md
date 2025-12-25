# Story CORE-002-04: Region Hierarchy Enhancement

**Epic**: CORE-002 Geospatial Data Infrastructure
**Priority**: P0 (Critical)
**Story Points**: 3
**Status**: 📋 Planned

## User Story

**As a** developer
**I want to** enhance region entities with spatial data
**So that** I can perform region-based queries

## Acceptance Criteria

- [ ] Region 엔티티에 geometry 컬럼 추가
- [ ] 시/도, 시/군/구, 동/읍/면 경계 polygon
- [ ] center (POINT) 중심 좌표
- [ ] 공간 인덱스 생성
- [ ] 지역 경계 데이터 임포트 (GeoJSON)

## Tasks

### Backend
- [ ] Migration: Add geometry columns to regions table
- [ ] Migration: Add center column (Point)
- [ ] Migration: Create spatial indexes
- [ ] Enhance Region entity with spatial columns
- [ ] Create RegionRepository with spatial queries

### Data Import
- [ ] Download region boundary data (행정안전부 GeoJSON)
- [ ] Create seed script for region boundaries
- [ ] Import Seoul region boundaries
- [ ] Import other major cities
- [ ] Validate imported data

### Testing
- [ ] Integration test: Region boundary queries
- [ ] Integration test: ST_Contains queries
- [ ] Integration test: Find region by point
- [ ] Performance test: Spatial index effectiveness

## Technical Notes

```typescript
// Enhanced Region Entity
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, Index } from 'typeorm';
import { Point, Polygon } from 'geojson';
import { GridCell } from './grid-cell.entity';

export enum RegionLevel {
  CITY = 'city',           // 시/도 (서울특별시, 경기도 등)
  DISTRICT = 'district',   // 시/군/구 (강남구, 의정부시 등)
  NEIGHBORHOOD = 'neighborhood', // 동/읍/면 (역삼동, 신곡동 등)
}

@Entity('regions')
export class Region {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string; // 한글 이름 (예: 서울특별시, 강남구, 역삼동)

  @Column({ unique: true })
  code: string; // 행정구역코드 (10자리)

  @Column({ type: 'enum', enum: RegionLevel })
  level: RegionLevel;

  @Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326,
    nullable: true,
  })
  @Index({ spatial: true })
  center: Point; // Region 중심 좌표

  @Column({
    type: 'geometry',
    spatialFeatureType: 'Polygon',
    srid: 4326,
    nullable: true,
  })
  @Index({ spatial: true })
  geometry: Polygon; // Region 경계 (MultiPolygon도 가능)

  @Column({ type: 'float', nullable: true })
  area: number; // 면적 (km²)

  @ManyToOne(() => Region, region => region.children, { nullable: true })
  parent: Region;

  @Column({ nullable: true })
  parentId: string;

  @OneToMany(() => Region, region => region.parent)
  children: Region[];

  @OneToMany(() => GridCell, gridCell => gridCell.region)
  gridCells: GridCell[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

// Migration: Add Spatial Columns
import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRegionGeometry1234567890 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add geometry columns
    await queryRunner.query(`
      ALTER TABLE regions
      ADD COLUMN center GEOMETRY(Point, 4326),
      ADD COLUMN geometry GEOMETRY(Polygon, 4326),
      ADD COLUMN area FLOAT
    `);

    // Create spatial indexes
    await queryRunner.query(`
      CREATE INDEX idx_regions_center_gist ON regions USING GIST(center)
    `);

    await queryRunner.query(`
      CREATE INDEX idx_regions_geometry_gist ON regions USING GIST(geometry)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE regions
      DROP COLUMN IF EXISTS center,
      DROP COLUMN IF EXISTS geometry,
      DROP COLUMN IF EXISTS area
    `);
  }
}

// Region Repository with Spatial Queries
@Injectable()
export class RegionRepository {
  constructor(
    @InjectRepository(Region)
    private readonly repository: Repository<Region>,
  ) {}

  /**
   * Find region containing a point
   */
  async findByPoint(lat: number, lng: number): Promise<Region | null> {
    return this.repository
      .createQueryBuilder('r')
      .where(
        `ST_Contains(r.geometry, ST_SetSRID(ST_MakePoint(:lng, :lat), 4326))`,
        { lat, lng },
      )
      .orderBy(`
        CASE r.level
          WHEN 'neighborhood' THEN 1
          WHEN 'district' THEN 2
          WHEN 'city' THEN 3
        END
      `)
      .getOne();
  }

  /**
   * Find all regions containing a point (hierarchy)
   */
  async findHierarchyByPoint(lat: number, lng: number): Promise<Region[]> {
    return this.repository
      .createQueryBuilder('r')
      .where(
        `ST_Contains(r.geometry, ST_SetSRID(ST_MakePoint(:lng, :lat), 4326))`,
        { lat, lng },
      )
      .orderBy(`
        CASE r.level
          WHEN 'city' THEN 1
          WHEN 'district' THEN 2
          WHEN 'neighborhood' THEN 3
        END
      `)
      .getMany();
  }

  /**
   * Find regions intersecting with a boundary
   */
  async findIntersecting(polygon: any): Promise<Region[]> {
    const polygonWKT = `POLYGON((${polygon.coordinates[0].map(([lng, lat]) => `${lng} ${lat}`).join(', ')}))`;

    return this.repository
      .createQueryBuilder('r')
      .where(`ST_Intersects(r.geometry, ST_GeomFromText(:polygon, 4326))`, { polygon: polygonWKT })
      .getMany();
  }
}

// Region Boundary Seed Script
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class RegionBoundarySeedService {
  constructor(
    @InjectRepository(Region)
    private readonly regionRepo: Repository<Region>,
  ) {}

  /**
   * Import region boundaries from GeoJSON file
   */
  async importFromGeoJSON(filePath: string) {
    const geoJSON = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    for (const feature of geoJSON.features) {
      const { properties, geometry } = feature;

      // Find existing region by code
      let region = await this.regionRepo.findOne({
        where: { code: properties.code },
      });

      if (!region) {
        console.warn(`Region not found: ${properties.code}`);
        continue;
      }

      // Calculate center point
      const center = this.calculateCentroid(geometry.coordinates);

      // Calculate area (km²)
      const area = this.calculateArea(geometry.coordinates);

      // Update region with spatial data
      region.geometry = geometry;
      region.center = {
        type: 'Point',
        coordinates: center,
      };
      region.area = area;

      await this.regionRepo.save(region);
      console.log(`Updated region: ${region.name} (${region.code})`);
    }
  }

  private calculateCentroid(coordinates: any[]): [number, number] {
    // Simple centroid calculation (can use PostGIS ST_Centroid for accuracy)
    const points = coordinates[0];
    const sumLng = points.reduce((sum, [lng]) => sum + lng, 0);
    const sumLat = points.reduce((sum, [_, lat]) => sum + lat, 0);
    return [sumLng / points.length, sumLat / points.length];
  }

  private calculateArea(coordinates: any[]): number {
    // Use Turf.js or PostGIS for accurate area calculation
    // This is a placeholder
    return 0;
  }
}

// Data Source Examples
// 1. 행정안전부 법정동 코드 및 경계: https://www.mois.go.kr/frt/sub/a05/openData/openData.do
// 2. 서울시 행정구역 경계: https://data.seoul.go.kr
// 3. 통계청 센서스 경계: https://sgis.kostat.go.kr
```

## Dependencies

- **Depends on**: CORE-002-01 (PostGIS), Region entity exists
- **External**: Region boundary GeoJSON data
- **Blocks**: CORE-002-06 (Region-GridCell Mapping)

## Definition of Done

- [ ] All acceptance criteria met
- [ ] All tasks completed
- [ ] Migration run successfully
- [ ] Spatial indexes created
- [ ] Region entity enhanced
- [ ] GeoJSON data imported (at least Seoul)
- [ ] Unit tests passing
- [ ] Integration tests passing
- [ ] Spatial queries working
- [ ] Code reviewed and merged
- [ ] Documentation updated

## Notes

- GeoJSON 데이터는 외부 소스에서 다운로드 (행정안전부, 서울시 등)
- 초기에는 서울시 데이터만 임포트 (Phase 1)
- 전국 데이터는 점진적으로 확대 (Phase 2)
- geometry 컬럼은 POLYGON 또는 MULTIPOLYGON 타입
- ST_Contains 쿼리로 "점이 어느 지역에 속하는지" 판별
- center는 region의 대표 좌표 (시각화, 검색 최적화)
- area는 통계 및 분석용 (선택적)
- 경계 데이터 업데이트는 정기적으로 필요 (행정구역 변경 시)
