import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Region } from '../../regions/entities/region.entity';

@Entity('grid_cells')
@Index('idx_grid_cells_region_id', ['regionId'])
export class GridCell {
  @PrimaryColumn({ name: 'h3_index', type: 'varchar', length: 20 })
  h3Index: string;

  @Column({ name: 'resolution', type: 'int' })
  resolution: number;

  @Column({
    name: 'boundary',
    type: 'text',
    nullable: true,
  })
  boundary: string; // WKT or GeoJSON format

  @Column({
    name: 'center_point_lat',
    type: 'decimal',
    precision: 10,
    scale: 7,
    nullable: true,
  })
  centerPointLat: number;

  @Column({
    name: 'center_point_lng',
    type: 'decimal',
    precision: 10,
    scale: 7,
    nullable: true,
  })
  centerPointLng: number;

  @Column({ name: 'region_id', type: 'uuid', nullable: true })
  regionId: string;

  @ManyToOne(() => Region, { nullable: true })
  @JoinColumn({ name: 'region_id' })
  region: Region;

  @Column({ name: 'user_count', type: 'int', default: 0 })
  userCount: number;

  @Column({ name: 'flyer_count', type: 'int', default: 0 })
  flyerCount: number;

  @Column({ name: 'last_activity_at', type: 'timestamp', nullable: true })
  lastActivityAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // GraphRAG preparation fields
  @Column({ name: 'entity_type', type: 'varchar', length: 50, default: 'GridCell' })
  entityType: string;

  @Column({ name: 'tags', type: 'jsonb', nullable: true })
  tags: Record<string, any>;
}
