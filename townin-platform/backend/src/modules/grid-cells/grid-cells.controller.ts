import { Controller, Get, UseGuards, Param, Query, ParseFloatPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { GridCellsService } from './grid-cells.service';

@ApiTags('grid-cells')
@Controller('grid-cells')
export class GridCellsController {
  constructor(private readonly gridCellsService: GridCellsService) {}

  /**
   * Get grid cell by H3 index
   */
  @Get(':h3Index')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get grid cell by H3 index' })
  @ApiResponse({ status: 200, description: 'Grid cell retrieved successfully' })
  async findByH3Index(@Param('h3Index') h3Index: string) {
    return this.gridCellsService.findByH3Index(h3Index);
  }

  /**
   * Get grid cells within bounding box as GeoJSON
   */
  @Get('map/geojson')
  @ApiOperation({ summary: 'Get grid cells as GeoJSON FeatureCollection' })
  @ApiResponse({ status: 200, description: 'GeoJSON FeatureCollection' })
  @ApiQuery({ name: 'minLat', required: true, description: 'Minimum latitude' })
  @ApiQuery({ name: 'minLng', required: true, description: 'Minimum longitude' })
  @ApiQuery({ name: 'maxLat', required: true, description: 'Maximum latitude' })
  @ApiQuery({ name: 'maxLng', required: true, description: 'Maximum longitude' })
  async getGridCellsGeoJSON(
    @Query('minLat', ParseFloatPipe) minLat: number,
    @Query('minLng', ParseFloatPipe) minLng: number,
    @Query('maxLat', ParseFloatPipe) maxLat: number,
    @Query('maxLng', ParseFloatPipe) maxLng: number,
  ) {
    const gridCells = await this.gridCellsService.findInBoundingBox(
      minLat,
      minLng,
      maxLat,
      maxLng,
    );
    return this.gridCellsService.toGeoJSON(gridCells);
  }

  /**
   * Get grid cells within radius of a point
   */
  @Get('map/radius')
  @ApiOperation({ summary: 'Get grid cells within radius' })
  @ApiResponse({ status: 200, description: 'Grid cells within radius' })
  @ApiQuery({ name: 'lat', required: true, description: 'Center latitude' })
  @ApiQuery({ name: 'lng', required: true, description: 'Center longitude' })
  @ApiQuery({ name: 'radius', required: false, description: 'Radius in meters (default: 500)' })
  async getGridCellsInRadius(
    @Query('lat', ParseFloatPipe) lat: number,
    @Query('lng', ParseFloatPipe) lng: number,
    @Query('radius') radius?: number,
  ) {
    const radiusMeters = radius ? Number(radius) : 500;
    return this.gridCellsService.findWithinRadius(lat, lng, radiusMeters);
  }

  /**
   * Get grid cells by region ID
   */
  @Get('region/:regionId')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get grid cells by region' })
  @ApiResponse({ status: 200, description: 'Grid cells retrieved successfully' })
  async getGridCellsByRegion(@Param('regionId') regionId: string) {
    return this.gridCellsService.findByRegion(regionId);
  }

  /**
   * Get region statistics
   */
  @Get('region/:regionId/stats')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get region statistics' })
  @ApiResponse({ status: 200, description: 'Region statistics retrieved successfully' })
  async getRegionStatistics(@Param('regionId') regionId: string) {
    return this.gridCellsService.getRegionStatistics(regionId);
  }

  /**
   * Get active grid cells (with users or flyers)
   */
  @Get('active')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get active grid cells' })
  @ApiResponse({ status: 200, description: 'Active grid cells retrieved successfully' })
  @ApiQuery({ name: 'regionId', required: false, description: 'Filter by region ID' })
  async getActiveCells(@Query('regionId') regionId?: string) {
    return this.gridCellsService.findActiveCells(regionId);
  }
}
