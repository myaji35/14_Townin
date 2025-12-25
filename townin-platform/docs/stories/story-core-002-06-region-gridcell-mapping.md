# Story CORE-002-06: Region-GridCell Mapping

**Epic**: CORE-002 Geospatial Data Infrastructure
**Priority**: P0 (Critical)
**Story Points**: 3
**Status**: 📋 Planned

## User Story

**As a** developer
**I want to** map grid cells to administrative regions
**So that** I can filter by region

## Acceptance Criteria

- [ ] Grid Cell 생성 시 자동 regionId 매핑
- [ ] ST_Contains 쿼리로 포함 지역 판별
- [ ] 계층적 지역 정보 (city → district → neighborhood)
- [ ] Batch mapping 스크립트
- [ ] 매핑 정확도 > 95%

## Tasks

### Backend
- [ ] Auto-assign regionId logic in GridCell creation
- [ ] ST_Contains query implementation
- [ ] Batch mapping service for existing cells
- [ ] Region hierarchy resolver
- [ ] Migration: Add FK constraint for regionId

### Scripts
- [ ] Create batch mapping script
- [ ] Dry-run mode for validation
- [ ] Progress logging
- [ ] Error handling for unmapped cells

### Testing
- [ ] Unit tests: Region containment logic
- [ ] Integration test: Auto-assignment on cell creation
- [ ] Integration test: Batch mapping
- [ ] Integration test: Hierarchy resolution
- [ ] Data validation: Mapping accuracy

## Technical Notes

```typescript
// GridCell Service with Auto Region Assignment
@Injectable()
export class GridCellService {
  constructor(
    private readonly gridCellRepo: GridCellRepository,
    private readonly regionRepo: RegionRepository,
    private readonly h3Service: H3Service,
  ) {}

  /**
   * Create grid cell with automatic region assignment
   */
  async createWithRegion(lat: number, lng: number): Promise<GridCell> {
    const h3Index = this.h3Service.latLngToH3(lat, lng);

    // Check if cell already exists
    let gridCell = await this.gridCellRepo.findByH3Index(h3Index);
    if (gridCell) {
      return gridCell;
    }

    // Find region containing this point
    const region = await this.regionRepo.findByPoint(lat, lng);

    // Create grid cell with regionId
    const [centerLat, centerLng] = this.h3Service.h3ToLatLng(h3Index);
    const boundary = this.h3Service.h3ToBoundary(h3Index);

    gridCell = await this.gridCellRepo.create({
      h3Index,
      center: {
        type: 'Point',
        coordinates: [centerLng, centerLat],
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
      regionId: region?.id, // Auto-assigned
    });

    return gridCell;
  }

  /**
   * Get region hierarchy for a grid cell
   */
  async getCellHierarchy(h3Index: string): Promise<{
    cell: GridCell;
    hierarchy: {
      city?: Region;
      district?: Region;
      neighborhood?: Region;
    };
  }> {
    const cell = await this.gridCellRepo.findByH3Index(h3Index);
    if (!cell) {
      throw new NotFoundException('Grid cell not found');
    }

    const [lat, lng] = this.h3Service.h3ToLatLng(h3Index);
    const regions = await this.regionRepo.findHierarchyByPoint(lat, lng);

    const hierarchy = {
      city: regions.find(r => r.level === RegionLevel.CITY),
      district: regions.find(r => r.level === RegionLevel.DISTRICT),
      neighborhood: regions.find(r => r.level === RegionLevel.NEIGHBORHOOD),
    };

    return { cell, hierarchy };
  }
}

// Region Repository: Find by Point
@Injectable()
export class RegionRepository {
  /**
   * Find the most specific region containing a point
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
   * Find all regions in hierarchy containing a point
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
}

// Batch Mapping Service
@Injectable()
export class GridCellMappingService {
  constructor(
    @InjectRepository(GridCell)
    private readonly gridCellRepo: Repository<GridCell>,
    private readonly regionRepo: RegionRepository,
    private readonly h3Service: H3Service,
  ) {}

  /**
   * Batch update regionId for all grid cells
   */
  async batchMapCellsToRegions(dryRun: boolean = true): Promise<{
    total: number;
    mapped: number;
    unmapped: number;
    errors: number;
  }> {
    const cells = await this.gridCellRepo.find({
      where: { regionId: IsNull() },
    });

    let mapped = 0;
    let unmapped = 0;
    let errors = 0;

    for (const cell of cells) {
      try {
        const [lat, lng] = this.h3Service.h3ToLatLng(cell.h3Index);
        const region = await this.regionRepo.findByPoint(lat, lng);

        if (region) {
          if (!dryRun) {
            cell.regionId = region.id;
            await this.gridCellRepo.save(cell);
          }
          mapped++;
          console.log(`✓ Mapped ${cell.h3Index} → ${region.name}`);
        } else {
          unmapped++;
          console.warn(`✗ No region found for ${cell.h3Index} (${lat}, ${lng})`);
        }
      } catch (error) {
        errors++;
        console.error(`✗ Error mapping ${cell.h3Index}:`, error.message);
      }
    }

    return {
      total: cells.length,
      mapped,
      unmapped,
      errors,
    };
  }

  /**
   * Map cells in a specific region
   */
  async mapCellsInRegion(regionId: string): Promise<number> {
    const region = await this.regionRepo.findOne({
      where: { id: regionId },
    });

    if (!region || !region.geometry) {
      throw new NotFoundException('Region or geometry not found');
    }

    // Find all cells whose center is within region
    const cells = await this.gridCellRepo
      .createQueryBuilder('gc')
      .where(
        `ST_Contains(
          ST_GeomFromText(:geometry, 4326),
          gc.center
        )`,
        { geometry: this.geometryToWKT(region.geometry) },
      )
      .getMany();

    // Update regionId
    for (const cell of cells) {
      cell.regionId = regionId;
    }

    await this.gridCellRepo.save(cells);

    return cells.length;
  }

  private geometryToWKT(geometry: any): string {
    if (geometry.type === 'Polygon') {
      const coords = geometry.coordinates[0]
        .map(([lng, lat]) => `${lng} ${lat}`)
        .join(', ');
      return `POLYGON((${coords}))`;
    }
    throw new Error('Unsupported geometry type');
  }
}

// CLI Script: Map Grid Cells
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const mappingService = app.get(GridCellMappingService);

  console.log('🚀 Starting grid cell to region mapping...\n');

  // Dry run first
  console.log('📋 DRY RUN:');
  const dryRunResult = await mappingService.batchMapCellsToRegions(true);
  console.log('\nDry run results:', dryRunResult);

  // Ask for confirmation
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  readline.question('\nProceed with actual mapping? (yes/no): ', async (answer) => {
    if (answer.toLowerCase() === 'yes') {
      console.log('\n✓ Proceeding with actual mapping...\n');
      const result = await mappingService.batchMapCellsToRegions(false);
      console.log('\n✅ Mapping complete:', result);
    } else {
      console.log('\n❌ Mapping cancelled');
    }

    await app.close();
    readline.close();
  });
}

bootstrap();

// Usage
// npm run script:map-cells
```

## Dependencies

- **Depends on**: CORE-002-03 (GridCell), CORE-002-04 (Region Geometry)
- **Blocks**: Region-based filtering features

## Definition of Done

- [ ] All acceptance criteria met
- [ ] All tasks completed
- [ ] Auto-assignment working on cell creation
- [ ] Batch mapping script created
- [ ] FK constraint added
- [ ] Unit tests passing
- [ ] Integration tests passing
- [ ] Mapping accuracy validated (>95%)
- [ ] Code reviewed and merged
- [ ] Documentation updated

## Notes

- Grid Cell은 가장 구체적인 지역(neighborhood)에 매핑
- 경계에 걸친 셀은 중심점 기준으로 판별
- Unmapped 셀은 경계 밖 또는 데이터 누락 (로그 기록)
- Batch mapping은 초기 데이터 로드 또는 마이그레이션용
- 신규 셀은 생성 시 자동 매핑
- 지역 경계 업데이트 시 재매핑 필요
- ST_Contains 쿼리는 GIST 인덱스로 최적화
- Dry-run 모드로 실행 전 검증
