import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * GridCell - H3 Hexagonal Grid System
 *
 * Uses H3 Resolution 9 (~500m radius per cell)
 * Stores spatial data without revealing exact user addresses (Privacy-First)
 */
@Entity('grid_cells')
@Index('idx_grid_cells_h3_index', ['h3Index'])
@Index('idx_grid_cells_location', { synchronize: false }) // PostGIS spatial index
export class GridCell {
  /**
   * H3 Index (Primary Key)
   * Example: "8928308280fffff"
   */
  @PrimaryColumn({ name: 'h3_index', type: 'varchar', length: 15 })
  h3Index: string;

  /**
   * H3 Resolution (default: 9 for ~500m radius)
   */
  @Column({ name: 'resolution', type: 'int', default: 9 })
  resolution: number;

  /**
   * Center Point (PostGIS GEOMETRY)
   * SRID 4326 (WGS 84)
   */
  @Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326,
    nullable: true,
  })
  location: string; // Will be stored as POINT(lng lat)

  /**
   * Cell Boundary (PostGIS GEOMETRY)
   * Hexagon Polygon
   */
  @Column({
    type: 'geometry',
    spatialFeatureType: 'Polygon',
    srid: 4326,
    nullable: true,
  })
  boundary: string; // Will be stored as POLYGON

  /**
   * Center Latitude
   */
  @Column({ name: 'center_lat', type: 'decimal', precision: 10, scale: 7 })
  centerLat: number;

  /**
   * Center Longitude
   */
  @Column({ name: 'center_lng', type: 'decimal', precision: 10, scale: 7 })
  centerLng: number;

  /**
   * Administrative Region Info
   */
  @Column({ nullable: true })
  province: string; // 시/도 (e.g., "경기도")

  @Column({ nullable: true })
  city: string; // 시/군/구 (e.g., "의정부시")

  @Column({ nullable: true })
  district: string; // 읍/면/동 (e.g., "신곡동")

  /**
   * Metadata
   */
  @Column({ name: 'property_value_tier', type: 'int', nullable: true })
  propertyValueTier: number; // 1-5 (부동산 가격 티어)

  @Column({ name: 'population_density', type: 'int', nullable: true })
  populationDensity: number; // 인구 밀도

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
