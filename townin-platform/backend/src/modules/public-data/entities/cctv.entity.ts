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

@Entity('cctv')
@Index('idx_cctv_external_id', ['externalId'], { unique: true })
@Index('idx_cctv_h3_cell_id', ['h3CellId'])
@Index('idx_cctv_region_id', ['regionId'])
export class Cctv {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'external_id', type: 'varchar', length: 100, unique: true })
  externalId: string; // API에서 제공하는 CCTV ID

  @Column({ name: 'name', type: 'varchar', length: 255 })
  name: string; // CCTV 위치명

  // Geospatial
  @Column({ name: 'latitude', type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude: number;

  @Column({ name: 'longitude', type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude: number;

  @Column({ name: 'h3_cell_id', type: 'varchar', length: 20, nullable: true })
  h3CellId: string;

  @Column({ name: 'address', type: 'varchar', length: 500, nullable: true })
  address: string;

  // Metadata
  @Column({ name: 'region_id', type: 'uuid', nullable: true })
  regionId: string;

  @ManyToOne(() => Region, { nullable: true })
  @JoinColumn({ name: 'region_id' })
  region: Region;

  @Column({ name: 'installation_agency', type: 'varchar', length: 100, nullable: true })
  installationAgency: string; // 설치 기관 (예: 서울시, 종로구청)

  @Column({ name: 'installation_purpose', type: 'varchar', length: 100, nullable: true })
  installationPurpose: string; // 설치 목적 (예: 방범, 교통)

  // Sync
  @Column({ name: 'last_synced_at', type: 'timestamp', nullable: true })
  lastSyncedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // GraphRAG
  @Column({ name: 'entity_type', type: 'varchar', length: 50, default: 'Cctv' })
  entityType: string;

  @Column({ name: 'tags', type: 'jsonb', nullable: true })
  tags: Record<string, any>;
}
