import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/user.entity';

@Entity('analytics_events')
@Index(['userId'])
@Index(['eventType'])
@Index(['createdAt'])
@Index(['sessionId'])
export class AnalyticsEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'session_id', type: 'varchar', length: 100, nullable: true })
  sessionId: string;

  // Event Info
  @Column({ name: 'event_type', type: 'varchar', length: 100 })
  eventType: string; // flyer_view, flyer_search, user_signup

  @Column({ name: 'event_category', type: 'varchar', length: 50, nullable: true })
  eventCategory: string; // engagement, conversion, retention

  @Column({ name: 'metadata', type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  // Context
  @Column({ name: 'ip_address', type: 'inet', nullable: true })
  ipAddress: string;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent: string;

  @Column({ name: 'platform', type: 'varchar', length: 20, nullable: true })
  platform: string; // web, ios, android

  @Column({ name: 'app_version', type: 'varchar', length: 20, nullable: true })
  appVersion: string;

  // Geolocation
  @Column({ name: 'region_id', type: 'uuid', nullable: true })
  regionId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
