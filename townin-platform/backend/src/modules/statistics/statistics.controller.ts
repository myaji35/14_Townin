import { Controller, Get, Param, Query, Post } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { RegionStatsQueryDto } from './dto/statistics.dto';

@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  /**
   * GET /statistics/global
   * Get global platform statistics
   */
  @Get('global')
  async getGlobalStatistics() {
    return this.statisticsService.getGlobalStatistics();
  }

  /**
   * GET /statistics/regions
   * Get statistics for all regions (sorted by activity)
   */
  @Get('regions')
  async getAllRegionsStatistics(@Query() query: RegionStatsQueryDto) {
    return this.statisticsService.getAllRegionsStatistics(query.limit);
  }

  /**
   * GET /statistics/regions/:regionId
   * Get comprehensive statistics for a specific region
   */
  @Get('regions/:regionId')
  async getRegionStatistics(@Param('regionId') regionId: string) {
    return this.statisticsService.getRegionStatistics(regionId);
  }

  /**
   * GET /statistics/regions/:regionId/heatmap
   * Get heatmap data for grid cells in a region
   */
  @Get('regions/:regionId/heatmap')
  async getRegionHeatmap(@Param('regionId') regionId: string) {
    return this.statisticsService.getRegionHeatmap(regionId);
  }

  /**
   * GET /statistics/leaderboard
   * Get leaderboard of top regions by metric
   */
  @Get('leaderboard')
  async getRegionLeaderboard(
    @Query('metric') metric: 'users' | 'flyers' | 'density' = 'users',
    @Query('limit') limit: number = 10,
  ) {
    return this.statisticsService.getRegionLeaderboard(metric, limit);
  }

  /**
   * GET /statistics/user-locations/distribution
   * Get user location distribution by hub type
   */
  @Get('user-locations/distribution')
  async getUserLocationDistribution() {
    return this.statisticsService.getUserLocationDistribution();
  }

  /**
   * POST /statistics/refresh
   * Refresh materialized view (admin only - TODO: add auth guard)
   */
  @Post('refresh')
  async refreshMaterializedView() {
    return this.statisticsService.refreshMaterializedView();
  }
}
