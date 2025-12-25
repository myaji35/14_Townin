# Story CORE-002-05: Spatial Query APIs

**Epic**: CORE-002 Geospatial Data Infrastructure
**Priority**: P0 (Critical)
**Story Points**: 5
**Status**: 📋 Planned

## User Story

**As a** developer
**I want to** query grid cells by location
**So that** I can find nearby data

## Acceptance Criteria

- [ ] GET /grid-cells/nearby?lat=&lng=&radius= (반경 검색)
- [ ] GET /grid-cells/neighbors/:h3Index (인접 셀)
- [ ] GET /grid-cells/region/:regionId (지역 내 셀)
- [ ] GET /grid-cells/:h3Index (단일 셀 조회)
- [ ] POST /grid-cells (셀 생성)
- [ ] 응답 속도 < 100ms (인덱스 최적화)

## Tasks

### Backend
- [ ] Create GridCellController
- [ ] Create GridCellService
- [ ] Implement GET /grid-cells/nearby (ST_DWithin query)
- [ ] Implement GET /grid-cells/neighbors (H3 kRing)
- [ ] Implement GET /grid-cells/region (ST_Contains)
- [ ] Implement GET /grid-cells/:h3Index
- [ ] Implement POST /grid-cells
- [ ] Implement POST /grid-cells/batch
- [ ] Add pagination support
- [ ] Add Swagger documentation

### Testing
- [ ] Integration test: Nearby query
- [ ] Integration test: Neighbors query
- [ ] Integration test: Region query
- [ ] Integration test: Single cell query
- [ ] Integration test: Cell creation
- [ ] Performance test: Query response time < 100ms
- [ ] E2E test: Complete API workflows

## Technical Notes

```typescript
// DTOs
import { IsNumber, IsString, IsOptional, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetNearbyCellsDto {
  @ApiProperty({ example: 37.5665 })
  @IsNumber()
  @Min(-90)
  @Max(90)
  lat: number;

  @ApiProperty({ example: 126.9780 })
  @IsNumber()
  @Min(-180)
  @Max(180)
  lng: number;

  @ApiProperty({ example: 1000, description: 'Radius in meters' })
  @IsNumber()
  @Min(0)
  radius: number;

  @ApiProperty({ example: 20, required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiProperty({ example: 0, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  offset?: number = 0;
}

export class GetNeighborsDto {
  @ApiProperty({ example: 1, description: 'k-ring distance' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  k?: number = 1;
}

export class CreateGridCellDto {
  @ApiProperty({ example: 37.5665 })
  @IsNumber()
  lat: number;

  @ApiProperty({ example: 126.9780 })
  @IsNumber()
  lng: number;
}

export class BatchCreateGridCellsDto {
  @ApiProperty({
    example: [
      { lat: 37.5665, lng: 126.9780 },
      { lat: 37.5664, lng: 126.9781 },
    ],
  })
  coordinates: Array<{ lat: number; lng: number }>;
}

// Controller
import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Grid Cells')
@Controller('grid-cells')
export class GridCellController {
  constructor(private readonly gridCellService: GridCellService) {}

  @Get('nearby')
  @ApiOperation({ summary: 'Get grid cells within radius' })
  @ApiResponse({ status: 200, description: 'Returns grid cells within specified radius' })
  async getNearby(@Query() dto: GetNearbyCellsDto) {
    return this.gridCellService.findNearby(
      dto.lat,
      dto.lng,
      dto.radius,
      dto.limit,
      dto.offset,
    );
  }

  @Get('neighbors/:h3Index')
  @ApiOperation({ summary: 'Get k-ring neighbors of a grid cell' })
  @ApiResponse({ status: 200, description: 'Returns neighboring grid cells' })
  async getNeighbors(
    @Param('h3Index') h3Index: string,
    @Query() dto: GetNeighborsDto,
  ) {
    return this.gridCellService.findNeighbors(h3Index, dto.k);
  }

  @Get('region/:regionId')
  @ApiOperation({ summary: 'Get grid cells in a region' })
  @ApiResponse({ status: 200, description: 'Returns grid cells within region boundary' })
  async getInRegion(
    @Param('regionId') regionId: string,
    @Query('limit') limit: number = 100,
    @Query('offset') offset: number = 0,
  ) {
    return this.gridCellService.findInRegion(regionId, limit, offset);
  }

  @Get(':h3Index')
  @ApiOperation({ summary: 'Get grid cell by H3 index' })
  @ApiResponse({ status: 200, description: 'Returns grid cell details' })
  @ApiResponse({ status: 404, description: 'Grid cell not found' })
  async getByH3Index(@Param('h3Index') h3Index: string) {
    const cell = await this.gridCellService.findByH3Index(h3Index);
    if (!cell) {
      throw new NotFoundException('Grid cell not found');
    }
    return cell;
  }

  @Post()
  @ApiOperation({ summary: 'Create a grid cell from coordinates' })
  @ApiResponse({ status: 201, description: 'Grid cell created successfully' })
  async create(@Body() dto: CreateGridCellDto) {
    return this.gridCellService.getOrCreate(dto.lat, dto.lng);
  }

  @Post('batch')
  @ApiOperation({ summary: 'Batch create grid cells' })
  @ApiResponse({ status: 201, description: 'Grid cells created successfully' })
  async batchCreate(@Body() dto: BatchCreateGridCellsDto) {
    return this.gridCellService.batchGetOrCreate(dto.coordinates);
  }
}

// Service Implementation
@Injectable()
export class GridCellService {
  constructor(
    private readonly gridCellRepo: GridCellRepository,
    private readonly h3Service: H3Service,
  ) {}

  async findNearby(
    lat: number,
    lng: number,
    radiusMeters: number,
    limit: number = 20,
    offset: number = 0,
  ): Promise<{ data: GridCell[]; total: number }> {
    const [data, total] = await this.gridCellRepo.findNearbyWithCount(
      lat,
      lng,
      radiusMeters,
      limit,
      offset,
    );

    return { data, total };
  }

  async findNeighbors(h3Index: string, k: number = 1): Promise<GridCell[]> {
    // Get neighbor H3 indices
    const neighborIndices = this.h3Service.getKRing(h3Index, k);

    // Fetch existing cells
    const existingCells = await this.gridCellRepo.findByH3Indices(neighborIndices);

    // Create missing cells
    const existingIndices = existingCells.map(cell => cell.h3Index);
    const missingIndices = neighborIndices.filter(idx => !existingIndices.includes(idx));

    if (missingIndices.length > 0) {
      const newCells = await this.gridCellRepo.batchCreate(missingIndices);
      return [...existingCells, ...newCells];
    }

    return existingCells;
  }

  async findInRegion(
    regionId: string,
    limit: number = 100,
    offset: number = 0,
  ): Promise<{ data: GridCell[]; total: number }> {
    const [data, total] = await this.gridCellRepo.findInRegionWithCount(
      regionId,
      limit,
      offset,
    );

    return { data, total };
  }

  async findByH3Index(h3Index: string): Promise<GridCell | null> {
    return this.gridCellRepo.findByH3Index(h3Index);
  }

  async getOrCreate(lat: number, lng: number): Promise<GridCell> {
    return this.gridCellRepo.findOrCreateFromCoordinates(lat, lng);
  }

  async batchGetOrCreate(coordinates: Array<{ lat: number; lng: number }>): Promise<GridCell[]> {
    const h3Indices = coordinates.map(({ lat, lng }) =>
      this.h3Service.latLngToH3(lat, lng),
    );

    // Remove duplicates
    const uniqueIndices = [...new Set(h3Indices)];

    // Find existing
    const existing = await this.gridCellRepo.findByH3Indices(uniqueIndices);
    const existingIndices = existing.map(cell => cell.h3Index);

    // Create missing
    const missingIndices = uniqueIndices.filter(idx => !existingIndices.includes(idx));
    if (missingIndices.length > 0) {
      const newCells = await this.gridCellRepo.batchCreate(missingIndices);
      return [...existing, ...newCells];
    }

    return existing;
  }
}

// Repository Extensions
async findNearbyWithCount(
  lat: number,
  lng: number,
  radiusMeters: number,
  limit: number,
  offset: number,
): Promise<[GridCell[], number]> {
  const queryBuilder = this.repository
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
    .orderBy(`ST_Distance(gc.center::geography, ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography)`)
    .limit(limit)
    .offset(offset);

  return queryBuilder.getManyAndCount();
}

async findByH3Indices(h3Indices: string[]): Promise<GridCell[]> {
  return this.repository
    .createQueryBuilder('gc')
    .where('gc.h3Index IN (:...indices)', { indices: h3Indices })
    .leftJoinAndSelect('gc.region', 'region')
    .getMany();
}

async findInRegionWithCount(
  regionId: string,
  limit: number,
  offset: number,
): Promise<[GridCell[], number]> {
  return this.repository.findAndCount({
    where: { regionId },
    relations: ['region'],
    take: limit,
    skip: offset,
  });
}
```

## Dependencies

- **Depends on**: CORE-002-03 (GridCell Entity), CORE-002-02 (H3 Service)
- **Blocks**: Flyer search, User location setup

## Definition of Done

- [ ] All acceptance criteria met
- [ ] All tasks completed
- [ ] All endpoints implemented
- [ ] Swagger documentation complete
- [ ] Unit tests passing (>85% coverage)
- [ ] Integration tests passing
- [ ] Performance test < 100ms
- [ ] Pagination working correctly
- [ ] Error handling implemented
- [ ] Code reviewed and merged
- [ ] API documentation published

## Notes

- Nearby 검색은 ST_DWithin (PostGIS) 사용 → GIST 인덱스 필수
- Neighbors 검색은 H3 kRing 사용 (순수 계산, DB 불필요)
- Region 검색은 FK 조인으로 빠른 성능
- Pagination으로 대량 데이터 처리
- 반환 데이터에 region 정보 포함 (eager loading)
- 거리 정렬은 ST_Distance 사용
- Batch API로 대량 셀 생성 효율화
- 캐싱 추가 고려 (Redis, 자주 조회되는 셀)
