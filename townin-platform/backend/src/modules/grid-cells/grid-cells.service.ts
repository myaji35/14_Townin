import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GridCell } from './entities/grid-cell.entity';
import { GridCellService } from './grid-cell.service';

@Injectable()
export class GridCellsService {
  constructor(
    @InjectRepository(GridCell)
    private gridCellRepository: Repository<GridCell>,
    private gridCellService: GridCellService,
  ) {}

  /**
   * Create or update a grid cell
   * @param h3Index H3 Cell ID
   * @param regionId Associated region ID (optional)
   * @returns Created or updated GridCell
   */
  async upsertGridCell(h3Index: string, regionId?: string): Promise<GridCell> {
    const existing = await this.gridCellRepository.findOne({
      where: { h3Index },
    });

    const [lat, lng] = this.gridCellService.cellToLatLng(h3Index);
    const boundary = this.gridCellService.cellToBoundary(h3Index);

    // Convert boundary to WKT Polygon
    const boundaryWKT = `POLYGON((${boundary.map(([lat, lng]) => `${lng} ${lat}`).join(',')}, ${boundary[0][1]} ${boundary[0][0]}))`;
    const centerPointWKT = `POINT(${lng} ${lat})`;

    if (existing) {
      existing.boundary = boundaryWKT;
      existing.centerPointLat = lat;
      existing.centerPointLng = lng;
      if (regionId) existing.regionId = regionId;
      return this.gridCellRepository.save(existing);
    }

    const gridCell = this.gridCellRepository.create({
      h3Index,
      resolution: 9,
      boundary: boundaryWKT,
      centerPointLat: lat,
      centerPointLng: lng,
      regionId,
      userCount: 0,
      flyerCount: 0,
    });

    return this.gridCellRepository.save(gridCell);
  }

  /**
   * Find grid cell by H3 index
   * @param h3Index H3 Cell ID
   * @returns GridCell or null
   */
  async findByH3Index(h3Index: string): Promise<GridCell> {
    const gridCell = await this.gridCellRepository.findOne({
      where: { h3Index },
      relations: ['region'],
    });

    if (!gridCell) {
      throw new NotFoundException(`GridCell with H3 index ${h3Index} not found`);
    }

    return gridCell;
  }

  /**
   * Find grid cells by region
   * @param regionId Region UUID
   * @returns Array of GridCells
   */
  async findByRegion(regionId: string): Promise<GridCell[]> {
    return this.gridCellRepository.find({
      where: { regionId },
      relations: ['region'],
      order: { createdAt: 'ASC' },
    });
  }

  /**
   * Find grid cells within bounding box (optimized)
   * @param minLat Minimum latitude
   * @param minLng Minimum longitude
   * @param maxLat Maximum latitude
   * @param maxLng Maximum longitude
   * @returns Array of GridCells
   */
  async findInBoundingBox(
    minLat: number,
    minLng: number,
    maxLat: number,
    maxLng: number,
  ): Promise<GridCell[]> {
    // Use PostGIS ST_Intersects for spatial query instead of H3 pre-computation
    const bbox = `POLYGON((${minLng} ${minLat}, ${maxLng} ${minLat}, ${maxLng} ${maxLat}, ${minLng} ${maxLat}, ${minLng} ${minLat}))`;

    return this.gridCellRepository
      .createQueryBuilder('grid_cell')
      .where('ST_Intersects(grid_cell.boundary, ST_GeomFromText(:bbox, 4326))', { bbox })
      .orderBy('grid_cell.user_count', 'DESC')
      .addOrderBy('grid_cell.flyer_count', 'DESC')
      .getMany();
  }

  /**
   * Find active grid cells (with users or flyers)
   * @param regionId Optional region filter
   * @returns Array of active GridCells
   */
  async findActiveCells(regionId?: string): Promise<GridCell[]> {
    const query = this.gridCellRepository
      .createQueryBuilder('grid_cell')
      .where('(grid_cell.user_count > 0 OR grid_cell.flyer_count > 0)');

    if (regionId) {
      query.andWhere('grid_cell.region_id = :regionId', { regionId });
    }

    return query
      .orderBy('grid_cell.last_activity_at', 'DESC')
      .limit(100)
      .getMany();
  }

  /**
   * Increment user count for a grid cell
   * @param h3Index H3 Cell ID
   */
  async incrementUserCount(h3Index: string): Promise<void> {
    await this.gridCellRepository.increment({ h3Index }, 'userCount', 1);
    await this.gridCellRepository.update({ h3Index }, { lastActivityAt: new Date() });
  }

  /**
   * Increment flyer count for a grid cell
   * @param h3Index H3 Cell ID
   */
  async incrementFlyerCount(h3Index: string): Promise<void> {
    await this.gridCellRepository.increment({ h3Index }, 'flyerCount', 1);
    await this.gridCellRepository.update({ h3Index }, { lastActivityAt: new Date() });
  }

  /**
   * Get statistics for all grid cells in a region
   * @param regionId Region UUID
   * @returns Statistics object
   */
  async getRegionStatistics(regionId: string) {
    const cells = await this.findByRegion(regionId);

    return {
      regionId,
      totalGridCells: cells.length,
      totalUsers: cells.reduce((sum, c) => sum + c.userCount, 0),
      totalFlyers: cells.reduce((sum, c) => sum + c.flyerCount, 0),
      averageUsersPerCell: cells.length > 0 ? cells.reduce((sum, c) => sum + c.userCount, 0) / cells.length : 0,
      averageFlyersPerCell: cells.length > 0 ? cells.reduce((sum, c) => sum + c.flyerCount, 0) / cells.length : 0,
    };
  }

  /**
   * Find grid cells within radius of a point (PostGIS ST_DWithin)
   * @param lat Latitude of center point
   * @param lng Longitude of center point
   * @param radiusMeters Radius in meters (default: 500m)
   * @returns Array of GridCells within radius, ordered by distance
   */
  async findWithinRadius(
    lat: number,
    lng: number,
    radiusMeters: number = 500,
  ): Promise<GridCell[]> {
    const point = `POINT(${lng} ${lat})`;

    return this.gridCellRepository
      .createQueryBuilder('grid_cell')
      .where(
        'ST_DWithin(grid_cell.center_point::geography, ST_GeogFromText(:point), :radius)',
        {
          point,
          radius: radiusMeters,
        },
      )
      .orderBy(
        'ST_Distance(grid_cell.center_point::geography, ST_GeogFromText(:point))',
        'ASC',
      )
      .setParameter('point', point)
      .getMany();
  }

  /**
   * Find grid cells whose center points are within a polygon (PostGIS ST_Contains)
   * @param polygonWKT Polygon in WKT format (e.g., "POLYGON((lng1 lat1, lng2 lat2, ...))")
   * @returns Array of GridCells within polygon
   */
  async findPointsInPolygon(polygonWKT: string): Promise<GridCell[]> {
    return this.gridCellRepository
      .createQueryBuilder('grid_cell')
      .where('ST_Contains(ST_GeomFromText(:polygon, 4326), grid_cell.center_point)', {
        polygon: polygonWKT,
      })
      .orderBy('grid_cell.user_count', 'DESC')
      .addOrderBy('grid_cell.flyer_count', 'DESC')
      .getMany();
  }

  /**
   * Find grid cells by region's boundary polygon
   * @param regionId Region UUID
   * @returns Array of GridCells within region boundary
   */
  async findCellsInRegionBoundary(regionId: string): Promise<GridCell[]> {
    return this.gridCellRepository
      .createQueryBuilder('grid_cell')
      .innerJoin('grid_cell.region', 'region')
      .where('region.id = :regionId', { regionId })
      .andWhere(
        'ST_Contains((SELECT boundary FROM regions WHERE id = :regionId), grid_cell.center_point)',
        { regionId },
      )
      .getMany();
  }

  /**
   * Convert grid cells to GeoJSON FeatureCollection
   * @param gridCells Array of GridCells
   * @returns GeoJSON FeatureCollection
   */
  toGeoJSON(gridCells: GridCell[]): any {
    return {
      type: 'FeatureCollection',
      features: gridCells.map((cell) => ({
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: this.parseWKTPolygon(cell.boundary),
        },
        properties: {
          h3Index: cell.h3Index,
          resolution: cell.resolution,
          regionId: cell.regionId,
          userCount: cell.userCount,
          flyerCount: cell.flyerCount,
          lastActivityAt: cell.lastActivityAt,
        },
      })),
    };
  }

  /**
   * Parse WKT Polygon to GeoJSON coordinates
   * @param wkt WKT Polygon string
   * @returns GeoJSON coordinates array
   */
  private parseWKTPolygon(wkt: string): number[][][] {
    // Parse "POLYGON((lng1 lat1, lng2 lat2, ...))" to [[[lng1, lat1], [lng2, lat2], ...]]
    const coords = wkt
      .replace('POLYGON((', '')
      .replace('))', '')
      .split(',')
      .map((pair) => {
        const [lng, lat] = pair.trim().split(' ').map(Number);
        return [lng, lat];
      });

    return [coords];
  }
}
