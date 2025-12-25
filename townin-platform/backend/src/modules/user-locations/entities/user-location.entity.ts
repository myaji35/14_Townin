import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { User } from '../../users/user.entity';
import { Region } from '../../regions/entities/region.entity';
import { GridCell } from '../../grid-cells/entities/grid-cell.entity';

export enum LocationHubType {
  RESIDENCE = 'residence', // 거주지
  WORKPLACE = 'workplace', // 직장
  FAMILY_HOME = 'family_home', // 가족집
}

@Entity('user_locations')
@Unique('uq_user_hub_type', ['userId', 'hubType'])
@Index('idx_user_locations_user_id', ['userId'])
@Index('idx_user_locations_hub_type', ['hubType'])
@Index('idx_user_locations_region_id', ['regionId'])
@Index('idx_user_locations_h3_index', ['h3Index'])
export class UserLocation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    name: 'hub_type',
    type: 'varchar',
    length: 20,
    enum: LocationHubType,
  })
  hubType: LocationHubType;

  // H3 Grid Cell (Privacy-first: only store grid cell, not exact coordinates)
  @Column({ name: 'h3_index', type: 'varchar', length: 20 })
  h3Index: string;

  @ManyToOne(() => GridCell, { nullable: true })
  @JoinColumn({ name: 'h3_index', referencedColumnName: 'h3Index' })
  gridCell: GridCell;

  // Region association
  @Column({ name: 'region_id', type: 'uuid', nullable: true })
  regionId: string;

  @ManyToOne(() => Region, { nullable: true })
  @JoinColumn({ name: 'region_id' })
  region: Region;

  // Approximate center point of the H3 cell (for display only)
  @Column({ name: 'center_lat', type: 'decimal', precision: 10, scale: 7, nullable: true })
  centerLat: number;

  @Column({ name: 'center_lng', type: 'decimal', precision: 10, scale: 7, nullable: true })
  centerLng: number;

  // Optional metadata
  @Column({ name: 'label', type: 'varchar', length: 100, nullable: true })
  label: string; // User-defined label (e.g., "우리집", "회사")

  @Column({ name: 'is_primary', type: 'boolean', default: false })
  isPrimary: boolean; // Primary location for notifications

  @Column({ name: 'tags', type: 'jsonb', nullable: true })
  tags: Record<string, any>; // Additional metadata

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // GraphRAG preparation
  @Column({ name: 'entity_type', type: 'varchar', length: 50, default: 'UserLocation' })
  entityType: string;
}
