# Story CORE-002-01: PostGIS Setup

**Epic**: CORE-002 Geospatial Data Infrastructure
**Priority**: P0 (Critical)
**Story Points**: 1
**Status**: 📋 Planned

## User Story

**As a** developer
**I want to** use PostGIS spatial extensions
**So that** I can perform efficient geospatial queries

## Acceptance Criteria

- [ ] PostGIS 확장 설치
- [ ] GEOMETRY 및 GEOGRAPHY 타입 사용 가능
- [ ] 공간 인덱스 (GIST) 생성 가능
- [ ] ST_ 함수 사용 가능 (ST_Distance, ST_Contains, ST_DWithin 등)
- [ ] PostGIS 버전 3.3+ 확인

## Tasks

### Database
- [ ] CREATE EXTENSION postgis
- [ ] Verify PostGIS version (SELECT PostGIS_Version())
- [ ] Test GEOMETRY type creation
- [ ] Test GEOGRAPHY type creation
- [ ] Test GIST index creation

### Backend
- [ ] Migration: Enable PostGIS extension
- [ ] Migration: Create spatial_ref_sys table check
- [ ] TypeORM configuration for spatial types
- [ ] Test spatial query performance

### Testing
- [ ] Integration test: PostGIS extension loaded
- [ ] Integration test: Spatial types working
- [ ] Integration test: GIST index working
- [ ] Performance test: Spatial query benchmark

## Technical Notes

```sql
-- Enable PostGIS Extension
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;

-- Verify Installation
SELECT PostGIS_Version();
-- Expected output: 3.3.x or higher

SELECT PostGIS_Full_Version();

-- Test GEOMETRY Type
CREATE TABLE test_spatial (
  id SERIAL PRIMARY KEY,
  location GEOMETRY(Point, 4326),
  area GEOMETRY(Polygon, 4326)
);

-- Test GEOGRAPHY Type (for accurate distance calculations)
CREATE TABLE test_geography (
  id SERIAL PRIMARY KEY,
  location GEOGRAPHY(Point, 4326)
);

-- Create Spatial Index (GIST)
CREATE INDEX idx_location_gist ON test_spatial USING GIST(location);

-- Test Spatial Functions
SELECT ST_Distance(
  ST_GeomFromText('POINT(126.9780 37.5665)', 4326),
  ST_GeomFromText('POINT(127.0276 37.4979)', 4326)
); -- Distance in degrees

SELECT ST_Distance(
  ST_GeogFromText('POINT(126.9780 37.5665)'),
  ST_GeogFromText('POINT(127.0276 37.4979)')
); -- Distance in meters (~7km)

-- Test ST_DWithin (within radius)
SELECT *
FROM test_spatial
WHERE ST_DWithin(
  location::geography,
  ST_SetSRID(ST_MakePoint(126.9780, 37.5665), 4326)::geography,
  1000 -- 1km radius
);

-- Test ST_Contains
SELECT *
FROM regions r
JOIN grid_cells gc ON ST_Contains(r.geometry, gc.center);
```

```typescript
// TypeORM Migration
import { MigrationInterface, QueryRunner } from 'typeorm';

export class EnablePostGIS1234567890 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Enable PostGIS extension
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS postgis`);
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS postgis_topology`);

    // Verify installation
    const result = await queryRunner.query(`SELECT PostGIS_Version()`);
    console.log('PostGIS version:', result[0].postgis_version);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP EXTENSION IF EXISTS postgis_topology`);
    await queryRunner.query(`DROP EXTENSION IF EXISTS postgis`);
  }
}

// TypeORM Entity with Spatial Types
import { Entity, Column, Index } from 'typeorm';
import { Point, Polygon } from 'geojson';

@Entity('test_spatial')
export class TestSpatial {
  @Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326,
  })
  @Index({ spatial: true })
  location: Point;

  @Column({
    type: 'geometry',
    spatialFeatureType: 'Polygon',
    srid: 4326,
  })
  @Index({ spatial: true })
  area: Polygon;
}
```

## Dependencies

- **Depends on**: PostgreSQL 14+ installed
- **External**: PostGIS 3.3+
- **Blocks**: All geospatial features

## Definition of Done

- [ ] All acceptance criteria met
- [ ] All tasks completed
- [ ] PostGIS extension installed and verified
- [ ] Spatial types working in TypeORM
- [ ] GIST indexes created successfully
- [ ] Integration tests passing
- [ ] Performance benchmark documented
- [ ] Code reviewed and merged
- [ ] Documentation updated

## Notes

- SRID 4326 = WGS84 (GPS 좌표계)
- GEOMETRY: 평면 좌표계 (빠르지만 덜 정확)
- GEOGRAPHY: 구면 좌표계 (느리지만 정확, 거리 계산용)
- GIST 인덱스는 공간 쿼리 성능에 필수
- PostGIS 3.3+ 권장 (성능 개선, 새 함수 추가)
- Docker Compose에서 postgis/postgis:15-3.3 이미지 사용
