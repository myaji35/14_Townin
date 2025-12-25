import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Region } from '../regions/entities/region.entity';
import { GridCell } from '../grid-cells/entities/grid-cell.entity';
import { GridCellService } from '../grid-cells/grid-cell.service';
import {
  GeoJSONFeatureCollection,
  GeoJSONFeature,
  RegionFeatureProperties,
  GridCellFeatureProperties,
} from './dto/map.dto';

@Injectable()
export class MapsService {
  constructor(
    @InjectRepository(Region)
    private regionsRepository: Repository<Region>,
    @InjectRepository(GridCell)
    private gridCellRepository: Repository<GridCell>,
    private gridCellService: GridCellService,
  ) {}

  /**
   * Get GeoJSON for all regions
   * @param includeStatistics Include statistics in properties
   * @returns GeoJSON FeatureCollection
   */
  async getRegionsGeoJSON(includeStatistics: boolean = false): Promise<GeoJSONFeatureCollection> {
    const query = `
      SELECT
        r.id,
        r.code,
        r.name_ko,
        r.name_en,
        r.level,
        r.population,
        r.area_sqm,
        ST_AsGeoJSON(r.boundary) as boundary_geojson,
        ST_AsGeoJSON(r.center_point) as center_geojson
        ${
          includeStatistics
            ? `,
        rs.grid_cell_count,
        rs.total_users,
        rs.total_flyers`
            : ''
        }
      FROM regions r
      ${includeStatistics ? 'LEFT JOIN region_stats rs ON rs.region_id = r.id' : ''}
      WHERE r.boundary IS NOT NULL
      ORDER BY r.level ASC, r.name_ko ASC
    `;

    const results = await this.regionsRepository.query(query);

    const features: GeoJSONFeature[] = results.map(row => ({
      type: 'Feature' as const,
      geometry: JSON.parse(row.boundary_geojson),
      properties: {
        id: row.id,
        code: row.code,
        nameKo: row.name_ko,
        nameEn: row.name_en,
        level: row.level,
        population: row.population,
        areaSqm: row.area_sqm,
        ...(includeStatistics && {
          gridCellCount: parseInt(row.grid_cell_count) || 0,
          totalUsers: parseInt(row.total_users) || 0,
          totalFlyers: parseInt(row.total_flyers) || 0,
        }),
      } as RegionFeatureProperties,
    }));

    return {
      type: 'FeatureCollection',
      features,
      metadata: {
        count: features.length,
        layer: 'regions',
        generatedAt: new Date(),
      },
    };
  }

  /**
   * Get GeoJSON for a specific region
   * @param regionId Region UUID
   * @param includeStatistics Include statistics
   * @returns GeoJSON Feature
   */
  async getRegionGeoJSON(
    regionId: string,
    includeStatistics: boolean = false,
  ): Promise<GeoJSONFeature> {
    const query = `
      SELECT
        r.id,
        r.code,
        r.name_ko,
        r.name_en,
        r.level,
        r.population,
        r.area_sqm,
        ST_AsGeoJSON(r.boundary) as boundary_geojson
        ${
          includeStatistics
            ? `,
        rs.grid_cell_count,
        rs.total_users,
        rs.total_flyers`
            : ''
        }
      FROM regions r
      ${includeStatistics ? 'LEFT JOIN region_stats rs ON rs.region_id = r.id' : ''}
      WHERE r.id = $1
    `;

    const results = await this.regionsRepository.query(query, [regionId]);

    if (!results || results.length === 0) {
      throw new NotFoundException(`Region with ID ${regionId} not found`);
    }

    const row = results[0];

    return {
      type: 'Feature',
      geometry: JSON.parse(row.boundary_geojson),
      properties: {
        id: row.id,
        code: row.code,
        nameKo: row.name_ko,
        nameEn: row.name_en,
        level: row.level,
        population: row.population,
        areaSqm: row.area_sqm,
        ...(includeStatistics && {
          gridCellCount: parseInt(row.grid_cell_count) || 0,
          totalUsers: parseInt(row.total_users) || 0,
          totalFlyers: parseInt(row.total_flyers) || 0,
        }),
      } as RegionFeatureProperties,
    };
  }

  /**
   * Get GeoJSON for grid cells in a region
   * @param regionId Region UUID
   * @returns GeoJSON FeatureCollection
   */
  async getGridCellsGeoJSON(regionId?: string): Promise<GeoJSONFeatureCollection> {
    let query = `
      SELECT
        gc.h3_index,
        gc.resolution,
        gc.region_id,
        gc.user_count,
        gc.flyer_count,
        gc.last_activity_at,
        ST_AsGeoJSON(gc.boundary) as boundary_geojson
      FROM grid_cells gc
      WHERE gc.boundary IS NOT NULL
    `;

    const params: any[] = [];
    if (regionId) {
      query += ` AND gc.region_id = $1`;
      params.push(regionId);
    }

    query += ` ORDER BY gc.user_count DESC, gc.flyer_count DESC LIMIT 1000`;

    const results = await this.gridCellRepository.query(query, params);

    // Calculate max values for intensity normalization
    const maxUsers = Math.max(...results.map(r => r.user_count || 0), 1);
    const maxFlyers = Math.max(...results.map(r => r.flyer_count || 0), 1);

    const features: GeoJSONFeature[] = results.map(row => ({
      type: 'Feature' as const,
      geometry: JSON.parse(row.boundary_geojson),
      properties: {
        h3Index: row.h3_index,
        resolution: row.resolution,
        regionId: row.region_id,
        userCount: row.user_count || 0,
        flyerCount: row.flyer_count || 0,
        intensity:
          ((row.user_count || 0) / maxUsers) * 0.7 + ((row.flyer_count || 0) / maxFlyers) * 0.3,
        lastActivityAt: row.last_activity_at,
      } as GridCellFeatureProperties,
    }));

    return {
      type: 'FeatureCollection',
      features,
      metadata: {
        count: features.length,
        layer: 'grid_cells',
        generatedAt: new Date(),
      },
    };
  }

  /**
   * Get GeoJSON for active grid cells (heatmap)
   * @param regionId Optional region filter
   * @returns GeoJSON FeatureCollection
   */
  async getHeatmapGeoJSON(regionId?: string): Promise<GeoJSONFeatureCollection> {
    let query = `
      SELECT
        gc.h3_index,
        gc.resolution,
        gc.region_id,
        gc.user_count,
        gc.flyer_count,
        ST_AsGeoJSON(gc.center_point) as center_geojson
      FROM grid_cells gc
      WHERE (gc.user_count > 0 OR gc.flyer_count > 0)
        AND gc.center_point IS NOT NULL
    `;

    const params: any[] = [];
    if (regionId) {
      query += ` AND gc.region_id = $1`;
      params.push(regionId);
    }

    query += ` ORDER BY gc.user_count DESC, gc.flyer_count DESC LIMIT 5000`;

    const results = await this.gridCellRepository.query(query, params);

    // Calculate max values for intensity
    const maxUsers = Math.max(...results.map(r => r.user_count || 0), 1);
    const maxFlyers = Math.max(...results.map(r => r.flyer_count || 0), 1);

    const features: GeoJSONFeature[] = results.map(row => ({
      type: 'Feature' as const,
      geometry: JSON.parse(row.center_geojson),
      properties: {
        h3Index: row.h3_index,
        resolution: row.resolution,
        regionId: row.region_id,
        userCount: row.user_count || 0,
        flyerCount: row.flyer_count || 0,
        intensity:
          ((row.user_count || 0) / maxUsers) * 0.7 + ((row.flyer_count || 0) / maxFlyers) * 0.3,
      } as GridCellFeatureProperties,
    }));

    return {
      type: 'FeatureCollection',
      features,
      metadata: {
        count: features.length,
        layer: 'heatmap',
        generatedAt: new Date(),
      },
    };
  }

  /**
   * Get GeoJSON for grid cells within bounding box
   * @param minLat Minimum latitude
   * @param minLng Minimum longitude
   * @param maxLat Maximum latitude
   * @param maxLng Maximum longitude
   * @returns GeoJSON FeatureCollection
   */
  async getGridCellsInBoundingBoxGeoJSON(
    minLat: number,
    minLng: number,
    maxLat: number,
    maxLng: number,
  ): Promise<GeoJSONFeatureCollection> {
    const bbox = `POLYGON((${minLng} ${minLat}, ${maxLng} ${minLat}, ${maxLng} ${maxLat}, ${minLng} ${maxLat}, ${minLng} ${minLat}))`;

    const query = `
      SELECT
        gc.h3_index,
        gc.resolution,
        gc.region_id,
        gc.user_count,
        gc.flyer_count,
        ST_AsGeoJSON(gc.boundary) as boundary_geojson
      FROM grid_cells gc
      WHERE ST_Intersects(gc.boundary, ST_GeomFromText($1, 4326))
      ORDER BY gc.user_count DESC
      LIMIT 500
    `;

    const results = await this.gridCellRepository.query(query, [bbox]);

    const maxUsers = Math.max(...results.map(r => r.user_count || 0), 1);
    const maxFlyers = Math.max(...results.map(r => r.flyer_count || 0), 1);

    const features: GeoJSONFeature[] = results.map(row => ({
      type: 'Feature' as const,
      geometry: JSON.parse(row.boundary_geojson),
      properties: {
        h3Index: row.h3_index,
        resolution: row.resolution,
        regionId: row.region_id,
        userCount: row.user_count || 0,
        flyerCount: row.flyer_count || 0,
        intensity:
          ((row.user_count || 0) / maxUsers) * 0.7 + ((row.flyer_count || 0) / maxFlyers) * 0.3,
      } as GridCellFeatureProperties,
    }));

    return {
      type: 'FeatureCollection',
      features,
      metadata: {
        count: features.length,
        layer: 'grid_cells_bbox',
        generatedAt: new Date(),
      },
    };
  }
}
