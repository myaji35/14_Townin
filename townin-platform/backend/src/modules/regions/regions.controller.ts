import { Controller, Get, UseGuards, Param, Query, ParseFloatPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { RegionsService } from './regions.service';

@ApiTags('regions')
@Controller('regions')
export class RegionsController {
  constructor(private readonly regionsService: RegionsService) {}

  /**
   * Get all regions (hierarchical list)
   */
  @Get()
  @ApiOperation({ summary: 'Get all regions' })
  @ApiResponse({ status: 200, description: 'All regions retrieved successfully' })
  async getAllRegions() {
    return this.regionsService.getAllRegions();
  }

  /**
   * Get region hierarchy (tree structure)
   */
  @Get('hierarchy')
  @ApiOperation({ summary: 'Get region hierarchy tree' })
  @ApiResponse({ status: 200, description: 'Region hierarchy retrieved successfully' })
  async getRegionHierarchy() {
    return this.regionsService.getRegionHierarchy();
  }

  /**
   * Search regions by name
   */
  @Get('search')
  @ApiOperation({ summary: 'Search regions by name' })
  @ApiResponse({ status: 200, description: 'Search results' })
  @ApiQuery({ name: 'q', required: true, description: 'Search query (Korean or English)' })
  async searchRegions(@Query('q') query: string) {
    return this.regionsService.searchByName(query);
  }

  /**
   * Get regions as GeoJSON FeatureCollection
   */
  @Get('map/geojson')
  @ApiOperation({ summary: 'Get regions as GeoJSON FeatureCollection' })
  @ApiResponse({ status: 200, description: 'GeoJSON FeatureCollection' })
  @ApiQuery({ name: 'minLat', required: false, description: 'Minimum latitude (bounding box)' })
  @ApiQuery({ name: 'minLng', required: false, description: 'Minimum longitude (bounding box)' })
  @ApiQuery({ name: 'maxLat', required: false, description: 'Maximum latitude (bounding box)' })
  @ApiQuery({ name: 'maxLng', required: false, description: 'Maximum longitude (bounding box)' })
  async getRegionsGeoJSON(
    @Query('minLat') minLat?: number,
    @Query('minLng') minLng?: number,
    @Query('maxLat') maxLat?: number,
    @Query('maxLng') maxLng?: number,
  ) {
    let regions;

    if (minLat && minLng && maxLat && maxLng) {
      regions = await this.regionsService.findInBoundingBox(
        Number(minLat),
        Number(minLng),
        Number(maxLat),
        Number(maxLng),
      );
    } else {
      regions = await this.regionsService.getAllRegions();
    }

    return this.regionsService.toGeoJSON(regions);
  }

  /**
   * Get region by coordinates
   */
  @Get('coordinates')
  @ApiOperation({ summary: 'Find region containing coordinates' })
  @ApiResponse({ status: 200, description: 'Region found' })
  @ApiQuery({ name: 'lat', required: true, description: 'Latitude' })
  @ApiQuery({ name: 'lng', required: true, description: 'Longitude' })
  async getRegionByCoordinates(
    @Query('lat', ParseFloatPipe) lat: number,
    @Query('lng', ParseFloatPipe) lng: number,
  ) {
    return this.regionsService.findRegionByCoordinates(lat, lng);
  }

  /**
   * Get region by ID
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get region by ID' })
  @ApiResponse({ status: 200, description: 'Region retrieved successfully' })
  async getRegionById(@Param('id') id: string) {
    return this.regionsService.findById(id);
  }

  /**
   * Get region as GeoJSON Feature
   */
  @Get(':id/geojson')
  @ApiOperation({ summary: 'Get region as GeoJSON Feature' })
  @ApiResponse({ status: 200, description: 'GeoJSON Feature' })
  async getRegionGeoJSON(@Param('id') id: string) {
    const region = await this.regionsService.findById(id);
    return this.regionsService.toGeoJSONFeature(region);
  }

  /**
   * Get children regions
   */
  @Get(':id/children')
  @ApiOperation({ summary: 'Get child regions' })
  @ApiResponse({ status: 200, description: 'Child regions retrieved successfully' })
  async getChildren(@Param('id') id: string) {
    return this.regionsService.getChildren(id);
  }

  /**
   * Get region statistics
   */
  @Get(':id/stats')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get region statistics' })
  @ApiResponse({ status: 200, description: 'Region statistics retrieved successfully' })
  async getRegionStatistics(@Param('id') id: string) {
    return this.regionsService.getStatistics(id);
  }
}
