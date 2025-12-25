import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Region, RegionLevel } from './entities/region.entity';

@Injectable()
export class RegionsService {
  constructor(
    @InjectRepository(Region)
    private regionsRepository: Repository<Region>,
  ) {}

  /**
   * Get all regions with hierarchical structure
   * @returns Array of regions
   */
  async getAllRegions(): Promise<Region[]> {
    return this.regionsRepository.find({
      relations: ['parent', 'children'],
      order: { level: 'ASC', nameKo: 'ASC' },
    });
  }

  /**
   * Get region hierarchy starting from cities
   * @returns Tree structure of regions
   */
  async getRegionHierarchy(): Promise<Region[]> {
    const cities = await this.regionsRepository.find({
      where: { level: RegionLevel.CITY },
      relations: ['children', 'children.children'],
      order: { nameKo: 'ASC' },
    });

    return cities;
  }

  /**
   * Find region by ID
   * @param id Region UUID
   * @returns Region
   */
  async findById(id: string): Promise<Region> {
    const region = await this.regionsRepository.findOne({
      where: { id },
      relations: ['parent', 'children'],
    });

    if (!region) {
      throw new NotFoundException(`Region with ID ${id} not found`);
    }

    return region;
  }

  /**
   * Find region by code
   * @param code Region code (행정구역코드)
   * @returns Region
   */
  async findByCode(code: string): Promise<Region> {
    const region = await this.regionsRepository.findOne({
      where: { code },
      relations: ['parent', 'children'],
    });

    if (!region) {
      throw new NotFoundException(`Region with code ${code} not found`);
    }

    return region;
  }

  /**
   * Search regions by name (Korean)
   * @param query Search query
   * @returns Array of matching regions
   */
  async searchByName(query: string): Promise<Region[]> {
    return this.regionsRepository
      .createQueryBuilder('region')
      .where('region.name_ko LIKE :query', { query: `%${query}%` })
      .orWhere('region.name_en LIKE :query', { query: `%${query}%` })
      .orderBy('region.level', 'ASC')
      .addOrderBy('region.name_ko', 'ASC')
      .limit(20)
      .getMany();
  }

  /**
   * Get children regions
   * @param parentId Parent region UUID
   * @returns Array of child regions
   */
  async getChildren(parentId: string): Promise<Region[]> {
    return this.regionsRepository.find({
      where: { parentId },
      order: { nameKo: 'ASC' },
    });
  }

  /**
   * Find region containing a coordinate point
   * @param lat Latitude
   * @param lng Longitude
   * @returns Region or null
   */
  async findRegionByCoordinates(lat: number, lng: number): Promise<Region | null> {
    const result = await this.regionsRepository
      .createQueryBuilder('region')
      .where(
        'ST_Contains(region.boundary, ST_SetSRID(ST_MakePoint(:lng, :lat), 4326))',
        { lat, lng },
      )
      .orderBy("CASE region.level WHEN 'neighborhood' THEN 1 WHEN 'district' THEN 2 ELSE 3 END")
      .limit(1)
      .getOne();

    return result;
  }

  /**
   * Get regions within bounding box
   * @param minLat Minimum latitude
   * @param minLng Minimum longitude
   * @param maxLat Maximum latitude
   * @param maxLng Maximum longitude
   * @returns Array of regions
   */
  async findInBoundingBox(
    minLat: number,
    minLng: number,
    maxLat: number,
    maxLng: number,
  ): Promise<Region[]> {
    const bbox = `POLYGON((${minLng} ${minLat}, ${maxLng} ${minLat}, ${maxLng} ${maxLat}, ${minLng} ${maxLat}, ${minLng} ${minLat}))`;

    return this.regionsRepository
      .createQueryBuilder('region')
      .where('ST_Intersects(region.boundary, ST_GeomFromText(:bbox, 4326))', { bbox })
      .getMany();
  }

  /**
   * Create a new region
   * @param data Region data
   * @returns Created region
   */
  async create(data: {
    code: string;
    nameKo: string;
    nameEn?: string;
    level: RegionLevel;
    parentId?: string;
    boundary?: string;
    centerPointLat?: number;
    centerPointLng?: number;
    population?: number;
    areaSqm?: number;
    tags?: Record<string, any>;
  }): Promise<Region> {
    const region = this.regionsRepository.create(data);
    return this.regionsRepository.save(region);
  }

  /**
   * Update region
   * @param id Region UUID
   * @param data Update data
   * @returns Updated region
   */
  async update(
    id: string,
    data: {
      nameKo?: string;
      nameEn?: string;
      population?: number;
      areaSqm?: number;
      tags?: Record<string, any>;
    },
  ): Promise<Region> {
    await this.regionsRepository.update(id, data);
    return this.findById(id);
  }

  /**
   * Delete region (soft delete)
   * @param id Region UUID
   */
  async delete(id: string): Promise<void> {
    const region = await this.findById(id);

    // Check if region has children
    const childrenCount = await this.regionsRepository.count({
      where: { parentId: id },
    });

    if (childrenCount > 0) {
      throw new Error('Cannot delete region with children. Delete children first.');
    }

    await this.regionsRepository.remove(region);
  }

  /**
   * Get statistics for a region (optimized with materialized view)
   * @param id Region UUID
   * @returns Statistics object
   */
  async getStatistics(id: string): Promise<{
    region: Region;
    childrenCount: number;
    totalPopulation: number;
    totalArea: number;
    gridCellCount: number;
    totalUsers: number;
    totalFlyers: number;
    lastActivityAt: Date | null;
  }> {
    const region = await this.findById(id);

    // Use materialized view for fast aggregation
    const stats = await this.regionsRepository.query(
      `SELECT * FROM region_stats WHERE region_id = $1`,
      [id],
    );

    // Get direct children count
    const childrenCount = await this.regionsRepository.count({
      where: { parentId: id },
    });

    const statData = stats[0] || {
      grid_cell_count: 0,
      total_users: 0,
      total_flyers: 0,
      last_activity_at: null,
    };

    return {
      region,
      childrenCount,
      totalPopulation: region.population || 0,
      totalArea: region.areaSqm || 0,
      gridCellCount: parseInt(statData.grid_cell_count) || 0,
      totalUsers: parseInt(statData.total_users) || 0,
      totalFlyers: parseInt(statData.total_flyers) || 0,
      lastActivityAt: statData.last_activity_at,
    };
  }

  /**
   * Refresh materialized view for region statistics
   * Should be called periodically via cron job
   */
  async refreshStatistics(): Promise<void> {
    await this.regionsRepository.query('REFRESH MATERIALIZED VIEW CONCURRENTLY region_stats;');
  }

  /**
   * Convert region to GeoJSON Feature
   * @param region Region entity
   * @returns GeoJSON Feature
   */
  toGeoJSONFeature(region: Region): any {
    return {
      type: 'Feature',
      geometry: region.boundary
        ? {
            type: 'Polygon',
            coordinates: this.parseWKTPolygon(region.boundary),
          }
        : region.centerPointLat && region.centerPointLng
        ? {
            type: 'Point',
            coordinates: [region.centerPointLng, region.centerPointLat],
          }
        : null,
      properties: {
        id: region.id,
        code: region.code,
        nameKo: region.nameKo,
        nameEn: region.nameEn,
        level: region.level,
        parentId: region.parentId,
        population: region.population,
        areaSqm: region.areaSqm,
      },
    };
  }

  /**
   * Convert regions to GeoJSON FeatureCollection
   * @param regions Array of regions
   * @returns GeoJSON FeatureCollection
   */
  toGeoJSON(regions: Region[]): any {
    return {
      type: 'FeatureCollection',
      features: regions.map((region) => this.toGeoJSONFeature(region)),
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

  /**
   * Parse WKT Point to GeoJSON coordinates
   * @param wkt WKT Point string
   * @returns GeoJSON coordinates [lng, lat]
   */
  private parseWKTPoint(wkt: string): number[] {
    // Parse "POINT(lng lat)" to [lng, lat]
    const coords = wkt.replace('POINT(', '').replace(')', '').trim().split(' ').map(Number);
    return coords;
  }
}
