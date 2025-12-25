import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Region } from '../regions/entities/region.entity';
import { GridCell } from '../grid-cells/entities/grid-cell.entity';
import { UserLocation } from '../user-locations/entities/user-location.entity';
import {
  RegionStatisticsResponse,
  GridCellHeatmapData,
  RegionLeaderboardEntry,
  StatsPeriod,
} from './dto/statistics.dto';

@Injectable()
export class StatisticsService {
  constructor(
    @InjectRepository(Region)
    private regionsRepository: Repository<Region>,
    @InjectRepository(GridCell)
    private gridCellRepository: Repository<GridCell>,
    @InjectRepository(UserLocation)
    private userLocationRepository: Repository<UserLocation>,
  ) {}

  /**
   * Get comprehensive statistics for a region
   * @param regionId Region UUID
   * @returns RegionStatisticsResponse
   */
  async getRegionStatistics(regionId: string): Promise<RegionStatisticsResponse> {
    // Use materialized view for fast aggregation
    const stats = await this.regionsRepository.query(
      `SELECT * FROM region_stats WHERE region_id = $1`,
      [regionId],
    );

    if (!stats || stats.length === 0) {
      throw new Error(`Statistics not found for region: ${regionId}`);
    }

    const data = stats[0];

    // Get region details
    const region = await this.regionsRepository.findOne({ where: { id: regionId } });

    const gridCellCount = parseInt(data.grid_cell_count) || 0;
    const totalUsers = parseInt(data.total_users) || 0;
    const totalFlyers = parseInt(data.total_flyers) || 0;

    // Calculate density score (users per km²)
    const densityScore = region?.areaSqm
      ? (totalUsers / (region.areaSqm / 1_000_000)).toFixed(2)
      : 0;

    return {
      regionId: data.region_id,
      code: data.code,
      nameKo: data.name_ko,
      level: data.level,
      gridCellCount,
      totalUsers,
      totalFlyers,
      averageUsersPerCell: gridCellCount > 0 ? totalUsers / gridCellCount : 0,
      averageFlyersPerCell: gridCellCount > 0 ? totalFlyers / gridCellCount : 0,
      lastActivityAt: data.last_activity_at,
      population: region?.population,
      areaSqm: region?.areaSqm,
      densityScore: parseFloat(densityScore as string),
    };
  }

  /**
   * Get statistics for all regions (sorted by activity)
   * @param limit Number of results
   * @returns Array of RegionStatisticsResponse
   */
  async getAllRegionsStatistics(limit: number = 50): Promise<RegionStatisticsResponse[]> {
    const stats = await this.regionsRepository.query(
      `
      SELECT * FROM region_stats
      ORDER BY total_users DESC, total_flyers DESC
      LIMIT $1
      `,
      [limit],
    );

    return stats.map(data => ({
      regionId: data.region_id,
      code: data.code,
      nameKo: data.name_ko,
      level: data.level,
      gridCellCount: parseInt(data.grid_cell_count) || 0,
      totalUsers: parseInt(data.total_users) || 0,
      totalFlyers: parseInt(data.total_flyers) || 0,
      averageUsersPerCell:
        data.grid_cell_count > 0 ? data.total_users / data.grid_cell_count : 0,
      averageFlyersPerCell:
        data.grid_cell_count > 0 ? data.total_flyers / data.grid_cell_count : 0,
      lastActivityAt: data.last_activity_at,
    }));
  }

  /**
   * Get heatmap data for grid cells in a region
   * @param regionId Region UUID
   * @returns Array of GridCellHeatmapData
   */
  async getRegionHeatmap(regionId: string): Promise<GridCellHeatmapData[]> {
    const cells = await this.gridCellRepository
      .createQueryBuilder('gc')
      .select([
        'gc.h3_index',
        'gc.user_count',
        'gc.flyer_count',
        'ST_Y(gc.center_point) as lat',
        'ST_X(gc.center_point) as lng',
      ])
      .where('gc.region_id = :regionId', { regionId })
      .andWhere('(gc.user_count > 0 OR gc.flyer_count > 0)')
      .getRawMany();

    if (cells.length === 0) {
      return [];
    }

    // Find max values for normalization
    const maxUsers = Math.max(...cells.map(c => c.user_count || 0));
    const maxFlyers = Math.max(...cells.map(c => c.flyer_count || 0));

    return cells.map(cell => ({
      h3Index: cell.h3_index,
      lat: parseFloat(cell.lat),
      lng: parseFloat(cell.lng),
      userCount: cell.user_count || 0,
      flyerCount: cell.flyer_count || 0,
      intensity:
        maxUsers > 0
          ? ((cell.user_count || 0) / maxUsers) * 0.7 + ((cell.flyer_count || 0) / maxFlyers) * 0.3
          : 0,
    }));
  }

  /**
   * Get leaderboard of top regions by metric
   * @param metric Metric to rank by ('users', 'flyers', 'density')
   * @param limit Number of results
   * @returns Array of RegionLeaderboardEntry
   */
  async getRegionLeaderboard(
    metric: 'users' | 'flyers' | 'density' = 'users',
    limit: number = 10,
  ): Promise<RegionLeaderboardEntry[]> {
    let orderBy = 'total_users';
    if (metric === 'flyers') orderBy = 'total_flyers';
    if (metric === 'density') orderBy = 'total_users / NULLIF(grid_cell_count, 0)';

    const results = await this.regionsRepository.query(
      `
      SELECT
        ROW_NUMBER() OVER (ORDER BY ${orderBy} DESC) as rank,
        region_id,
        code,
        name_ko,
        level,
        CASE
          WHEN $1 = 'users' THEN total_users
          WHEN $1 = 'flyers' THEN total_flyers
          WHEN $1 = 'density' THEN total_users / NULLIF(grid_cell_count, 0)
          ELSE 0
        END as score
      FROM region_stats
      WHERE total_users > 0 OR total_flyers > 0
      ORDER BY ${orderBy} DESC
      LIMIT $2
      `,
      [metric, limit],
    );

    return results.map(r => ({
      rank: parseInt(r.rank),
      regionId: r.region_id,
      code: r.code,
      nameKo: r.name_ko,
      level: r.level,
      score: parseFloat(r.score) || 0,
      metric,
    }));
  }

  /**
   * Get user location distribution by hub type
   * @returns Distribution statistics
   */
  async getUserLocationDistribution() {
    const distribution = await this.userLocationRepository
      .createQueryBuilder('ul')
      .select([
        'ul.hub_type',
        'COUNT(*) as count',
        'COUNT(DISTINCT ul.region_id) as unique_regions',
        'COUNT(DISTINCT ul.h3_index) as unique_cells',
      ])
      .groupBy('ul.hub_type')
      .getRawMany();

    return distribution.map(d => ({
      hubType: d.hub_type,
      count: parseInt(d.count),
      uniqueRegions: parseInt(d.unique_regions),
      uniqueCells: parseInt(d.unique_cells),
    }));
  }

  /**
   * Get global platform statistics
   * @returns Global stats
   */
  async getGlobalStatistics() {
    const regionStats = await this.regionsRepository.query(`
      SELECT
        COUNT(*) as total_regions,
        COUNT(CASE WHEN level = 'city' THEN 1 END) as cities,
        COUNT(CASE WHEN level = 'district' THEN 1 END) as districts,
        COUNT(CASE WHEN level = 'neighborhood' THEN 1 END) as neighborhoods
      FROM regions
    `);

    const gridStats = await this.gridCellRepository.query(`
      SELECT
        COUNT(*) as total_cells,
        COUNT(CASE WHEN user_count > 0 THEN 1 END) as active_cells,
        SUM(user_count) as total_users,
        SUM(flyer_count) as total_flyers
      FROM grid_cells
    `);

    const locationStats = await this.userLocationRepository.query(`
      SELECT
        COUNT(DISTINCT user_id) as users_with_locations,
        COUNT(*) as total_locations
      FROM user_locations
    `);

    return {
      regions: {
        total: parseInt(regionStats[0].total_regions),
        cities: parseInt(regionStats[0].cities),
        districts: parseInt(regionStats[0].districts),
        neighborhoods: parseInt(regionStats[0].neighborhoods),
      },
      gridCells: {
        total: parseInt(gridStats[0].total_cells) || 0,
        active: parseInt(gridStats[0].active_cells) || 0,
        totalUsers: parseInt(gridStats[0].total_users) || 0,
        totalFlyers: parseInt(gridStats[0].total_flyers) || 0,
      },
      userLocations: {
        usersWithLocations: parseInt(locationStats[0].users_with_locations) || 0,
        totalLocations: parseInt(locationStats[0].total_locations) || 0,
      },
    };
  }

  /**
   * Refresh materialized view (should be called by cron)
   * @returns Refresh status
   */
  async refreshMaterializedView() {
    await this.regionsRepository.query('REFRESH MATERIALIZED VIEW CONCURRENTLY region_stats;');
    return { message: 'Materialized view refreshed successfully' };
  }
}
