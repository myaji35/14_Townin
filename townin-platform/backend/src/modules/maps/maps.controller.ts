import { Controller, Get, Param, Query } from '@nestjs/common';
import { MapsService } from './maps.service';
import { MapQueryDto } from './dto/map.dto';

@Controller('maps')
export class MapsController {
  constructor(private readonly mapsService: MapsService) {}

  /**
   * GET /maps/regions
   * Get GeoJSON for all regions
   */
  @Get('regions')
  async getRegionsGeoJSON(@Query() query: MapQueryDto) {
    return this.mapsService.getRegionsGeoJSON(query.includeStatistics);
  }

  /**
   * GET /maps/regions/:regionId
   * Get GeoJSON for a specific region
   */
  @Get('regions/:regionId')
  async getRegionGeoJSON(@Param('regionId') regionId: string, @Query() query: MapQueryDto) {
    return this.mapsService.getRegionGeoJSON(regionId, query.includeStatistics);
  }

  /**
   * GET /maps/grid-cells
   * Get GeoJSON for all grid cells (limited to 1000)
   */
  @Get('grid-cells')
  async getGridCellsGeoJSON(@Query('regionId') regionId?: string) {
    return this.mapsService.getGridCellsGeoJSON(regionId);
  }

  /**
   * GET /maps/heatmap
   * Get GeoJSON heatmap data (center points with intensity)
   */
  @Get('heatmap')
  async getHeatmapGeoJSON(@Query('regionId') regionId?: string) {
    return this.mapsService.getHeatmapGeoJSON(regionId);
  }

  /**
   * GET /maps/bbox
   * Get GeoJSON for grid cells within bounding box
   */
  @Get('bbox')
  async getGridCellsInBoundingBoxGeoJSON(
    @Query('minLat') minLat: number,
    @Query('minLng') minLng: number,
    @Query('maxLat') maxLat: number,
    @Query('maxLng') maxLng: number,
  ) {
    return this.mapsService.getGridCellsInBoundingBoxGeoJSON(minLat, minLng, maxLat, maxLng);
  }
}
