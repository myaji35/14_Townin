import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/user.entity';

export enum PointTransactionType {
  EARNED = 'earned',
  SPENT = 'spent',
  EXPIRED = 'expired',
  REFUNDED = 'refunded',
}

export enum PointEarnReason {
  FLYER_VIEW = 'flyer_view',
  FLYER_CLICK = 'flyer_click',
  DAILY_LOGIN = 'daily_login',
  PROFILE_COMPLETE = 'profile_complete',
  HUB_SETUP = 'hub_setup',
  REFERRAL = 'referral',
  EVENT = 'event',
  ADMIN_GRANT = 'admin_grant',
}

export enum PointSpendReason {
  PREMIUM_FEATURE = 'premium_feature',
  COUPON_REDEMPTION = 'coupon_redemption',
  GIFT = 'gift',
  ADMIN_DEDUCT = 'admin_deduct',
}

@Entity('point_transactions')
@Index(['userId', 'createdAt'])
export class PointTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    type: 'enum',
    enum: PointTransactionType,
  })
  @Index()
  type: PointTransactionType;

  @Column({ type: 'int' })
  amount: number; // Always positive, type determines if added or deducted

  @Column({ name: 'balance_after', type: 'int' })
  balanceAfter: number;

  @Column({ nullable: true })
  reason: string; // PointEarnReason or PointSpendReason

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'reference_id', nullable: true })
  referenceId: string; // e.g., flyerId, eventId

  @Column({ name: 'reference_type', nullable: true })
  referenceType: string; // e.g., 'flyer', 'event'

  @Column({ name: 'expires_at', type: 'timestamp', nullable: true })
  expiresAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
