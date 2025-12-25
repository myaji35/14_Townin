import { IsOptional, IsBoolean, IsEnum, IsString } from 'class-validator';

export enum MapLayerType {
  REGIONS = 'regions',
  GRID_CELLS = 'grid_cells',
  USER_LOCATIONS = 'user_locations',
  FLYERS = 'flyers',
}

export class MapQueryDto {
  @IsOptional()
  @IsBoolean()
  includeBoundaries?: boolean = true;

  @IsOptional()
  @IsBoolean()
  includeStatistics?: boolean = false;

  @IsOptional()
  @IsEnum(MapLayerType)
  layer?: MapLayerType = MapLayerType.REGIONS;
}

/**
 * GeoJSON Feature properties for Region
 */
export interface RegionFeatureProperties {
  id: string;
  code: string;
  nameKo: string;
  nameEn?: string;
  level: string;
  population?: number;
  areaSqm?: number;
  gridCellCount?: number;
  totalUsers?: number;
  totalFlyers?: number;
}

/**
 * GeoJSON Feature properties for GridCell
 */
export interface GridCellFeatureProperties {
  h3Index: string;
  resolution: number;
  regionId?: string;
  userCount: number;
  flyerCount: number;
  intensity: number;
  lastActivityAt?: Date;
}

/**
 * GeoJSON Feature
 */
export interface GeoJSONFeature {
  type: 'Feature';
  geometry: {
    type: 'Polygon' | 'Point' | 'MultiPolygon';
    coordinates: any;
  };
  properties: RegionFeatureProperties | GridCellFeatureProperties | Record<string, any>;
}

/**
 * GeoJSON FeatureCollection
 */
export interface GeoJSONFeatureCollection {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
  metadata?: {
    count: number;
    layer: string;
    generatedAt: Date;
  };
}
