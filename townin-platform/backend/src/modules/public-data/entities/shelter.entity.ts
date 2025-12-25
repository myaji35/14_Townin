import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Region } from '../../regions/entities/region.entity';

@Entity('shelters')
@Index('idx_shelters_external_id', ['externalId'], { unique: true })
@Index('idx_shelters_h3_cell_id', ['h3CellId'])
@Index('idx_shelters_region_id', ['regionId'])
export class Shelter {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'external_id', type: 'varchar', length: 100, unique: true })
  externalId: string; // OBJECTID

  @Column({ name: 'name', type: 'varchar', length: 255 })
  name: string; // 시설명

  // Geospatial
  @Column({ name: 'latitude', type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude: number;

  @Column({ name: 'longitude', type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude: number;

  @Column({ name: 'h3_cell_id', type: 'varchar', length: 20, nullable: true })
  h3CellId: string;

  @Column({ name: 'address', type: 'varchar', length: 500, nullable: true })
  address: string;

  // Shelter Info
  @Column({ name: 'capacity', type: 'int', nullable: true })
  capacity: number; // 수용 인원

  @Column({ name: 'facility_type', type: 'varchar', length: 100, nullable: true })
  facilityType: string; // 시설 유형 (예: 학교, 공원)

  @Column({ name: 'area_sqm', type: 'decimal', precision: 10, scale: 2, nullable: true })
  areaSqm: number; // 면적

  // Metadata
  @Column({ name: 'region_id', type: 'uuid', nullable: true })
  regionId: string;

  @ManyToOne(() => Region, { nullable: true })
  @JoinColumn({ name: 'region_id' })
  region: Region;

  // Sync
  @Column({ name: 'last_synced_at', type: 'timestamp', nullable: true })
  lastSyncedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // GraphRAG
  @Column({ name: 'entity_type', type: 'varchar', length: 50, default: 'Shelter' })
  entityType: string;

  @Column({ name: 'tags', type: 'jsonb', nullable: true })
  tags: Record<string, any>;
}
