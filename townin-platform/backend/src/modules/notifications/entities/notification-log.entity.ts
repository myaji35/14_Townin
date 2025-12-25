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
import { DeviceToken } from './device-token.entity';

export enum NotificationStatus {
  PENDING = 'pending',
  SENT = 'sent',
  FAILED = 'failed',
}

@Entity('notification_logs')
@Index(['userId'])
@Index(['type'])
@Index(['status'])
@Index(['sentAt'])
export class NotificationLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'device_token_id', type: 'uuid', nullable: true })
  deviceTokenId: string;

  @ManyToOne(() => DeviceToken, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'device_token_id' })
  deviceToken: DeviceToken;

  // Notification Content
  @Column({ name: 'type', type: 'varchar', length: 50 })
  type: string;

  @Column({ name: 'title', type: 'varchar', length: 100 })
  title: string;

  @Column({ name: 'body', type: 'text' })
  body: string;

  @Column({ name: 'data', type: 'jsonb', nullable: true })
  data: Record<string, any>;

  // Delivery
  @Column({
    name: 'status',
    type: 'varchar',
    length: 20,
    enum: NotificationStatus,
    default: NotificationStatus.PENDING,
  })
  status: NotificationStatus;

  @Column({ name: 'platform', type: 'varchar', length: 10, nullable: true })
  platform: string;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage: string;

  @Column({ name: 'sent_at', type: 'timestamp', nullable: true })
  sentAt: Date;

  // Engagement
  @Column({ name: 'is_opened', type: 'boolean', default: false })
  isOpened: boolean;

  @Column({ name: 'opened_at', type: 'timestamp', nullable: true })
  openedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
