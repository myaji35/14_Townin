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

@Entity('parking')
@Index('idx_parking_external_id', ['externalId'], { unique: true })
@Index('idx_parking_h3_cell_id', ['h3CellId'])
@Index('idx_parking_region_id', ['regionId'])
@Index('idx_parking_available_spaces', ['availableSpaces'])
export class Parking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'external_id', type: 'varchar', length: 100, unique: true })
  externalId: string; // PARKING_CODE

  @Column({ name: 'name', type: 'varchar', length: 255 })
  name: string;

  // Geospatial
  @Column({ name: 'latitude', type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude: number;

  @Column({ name: 'longitude', type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude: number;

  @Column({ name: 'h3_cell_id', type: 'varchar', length: 20, nullable: true })
  h3CellId: string;

  @Column({ name: 'address', type: 'varchar', length: 500, nullable: true })
  address: string;

  // Parking Info
  @Column({ name: 'total_spaces', type: 'int' })
  totalSpaces: number; // 총 주차 면수

  @Column({ name: 'available_spaces', type: 'int', nullable: true })
  availableSpaces: number; // 현재 주차 가능 대수

  @Column({ name: 'operation_hours', type: 'varchar', length: 100, nullable: true })
  operationHours: string; // 운영 시간

  @Column({ name: 'fee_info', type: 'text', nullable: true })
  feeInfo: string; // 요금 정보

  @Column({ name: 'parking_type', type: 'varchar', length: 50, nullable: true })
  parkingType: string; // 주차장 유형

  @Column({ name: 'is_paid', type: 'boolean', default: true })
  isPaid: boolean; // 유/무료

  // Metadata
  @Column({ name: 'region_id', type: 'uuid', nullable: true })
  regionId: string;

  @ManyToOne(() => Region, { nullable: true })
  @JoinColumn({ name: 'region_id' })
  region: Region;

  @Column({ name: 'phone', type: 'varchar', length: 20, nullable: true })
  phone: string;

  // Sync timestamps
  @Column({ name: 'static_data_synced_at', type: 'timestamp', nullable: true })
  staticDataSyncedAt: Date; // 정적 데이터 (주소, 요금 등)

  @Column({ name: 'realtime_data_synced_at', type: 'timestamp', nullable: true })
  realtimeDataSyncedAt: Date; // 실시간 데이터 (주차 가능 대수)

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // GraphRAG
  @Column({ name: 'entity_type', type: 'varchar', length: 50, default: 'Parking' })
  entityType: string;

  @Column({ name: 'tags', type: 'jsonb', nullable: true })
  tags: Record<string, any>;
}
