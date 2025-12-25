import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/user.entity';

@Entity('notification_preferences')
@Index(['userId'], { unique: true })
export class NotificationPreference {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid', unique: true })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  // Category Preferences
  @Column({ name: 'flyer_enabled', type: 'boolean', default: true })
  flyerEnabled: boolean;

  @Column({ name: 'points_enabled', type: 'boolean', default: true })
  pointsEnabled: boolean;

  @Column({ name: 'system_enabled', type: 'boolean', default: true })
  systemEnabled: boolean;

  @Column({ name: 'care_enabled', type: 'boolean', default: true })
  careEnabled: boolean; // Phase 2

  // Quiet Hours
  @Column({ name: 'quiet_hours_enabled', type: 'boolean', default: true })
  quietHoursEnabled: boolean;

  @Column({ name: 'quiet_hours_start', type: 'time', default: '22:00' })
  quietHoursStart: string;

  @Column({ name: 'quiet_hours_end', type: 'time', default: '08:00' })
  quietHoursEnd: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
