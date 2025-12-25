import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('analytics_stats')
@Index(['date'], { unique: true })
export class AnalyticsStats {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'date', type: 'date', unique: true })
  date: Date;

  // User Metrics
  @Column({ name: 'dau', type: 'int', default: 0 })
  dau: number; // Daily Active Users

  @Column({ name: 'new_users', type: 'int', default: 0 })
  newUsers: number;

  @Column({ name: 'returning_users', type: 'int', default: 0 })
  returningUsers: number;

  // Engagement Metrics
  @Column({ name: 'total_flyer_views', type: 'int', default: 0 })
  totalFlyerViews: number;

  @Column({ name: 'total_searches', type: 'int', default: 0 })
  totalSearches: number;

  @Column({ name: 'avg_session_duration_seconds', type: 'int', nullable: true })
  avgSessionDurationSeconds: number;

  // Retention
  @Column({ name: 'd1_retention_rate', type: 'decimal', precision: 5, scale: 2, nullable: true })
  d1RetentionRate: number;

  @Column({ name: 'd7_retention_rate', type: 'decimal', precision: 5, scale: 2, nullable: true })
  d7RetentionRate: number;

  @Column({ name: 'd30_retention_rate', type: 'decimal', precision: 5, scale: 2, nullable: true })
  d30RetentionRate: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
