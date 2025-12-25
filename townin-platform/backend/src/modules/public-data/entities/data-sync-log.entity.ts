import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';

export enum SyncType {
  CCTV = 'cctv',
  PARKING = 'parking',
  SHELTER = 'shelter',
}

export enum SyncStatus {
  SUCCESS = 'success',
  FAILED = 'failed',
}

@Entity('data_sync_logs')
@Index('idx_data_sync_logs_sync_type', ['syncType'])
@Index('idx_data_sync_logs_created_at', ['createdAt'])
export class DataSyncLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'sync_type',
    type: 'varchar',
    length: 50,
    enum: SyncType,
  })
  syncType: SyncType;

  @Column({
    name: 'status',
    type: 'varchar',
    length: 20,
    enum: SyncStatus,
  })
  status: SyncStatus;

  // Statistics
  @Column({ name: 'total_count', type: 'int', nullable: true })
  totalCount: number; // API에서 받은 전체 데이터 수

  @Column({ name: 'inserted_count', type: 'int', nullable: true })
  insertedCount: number; // 신규 삽입

  @Column({ name: 'updated_count', type: 'int', nullable: true })
  updatedCount: number; // 업데이트

  @Column({ name: 'error_count', type: 'int', nullable: true })
  errorCount: number; // 에러 발생 수

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage: string;

  // Timing
  @Column({ name: 'started_at', type: 'timestamp' })
  startedAt: Date;

  @Column({ name: 'ended_at', type: 'timestamp', nullable: true })
  endedAt: Date;

  @Column({ name: 'duration_ms', type: 'int', nullable: true })
  durationMs: number; // 소요 시간 (밀리초)

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
