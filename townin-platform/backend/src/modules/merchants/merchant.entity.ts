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
import { User } from '../users/user.entity';
// Simple Point type definition (GeoJSON compatible)
type Point = {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
};

export enum MerchantStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  SUSPENDED = 'suspended',
}

@Entity('merchants')
@Index(['userId'], { unique: true }) // One merchant per user
export class Merchant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'business_name' })
  businessName: string;

  @Column({ name: 'business_number', nullable: true })
  businessNumber: string;

  @Column({ nullable: true })
  phone: string;

  @Column()
  category: string;

  @Column({ name: 'grid_cell' })
  gridCell: string;

  @Column({ nullable: true })
  address: string;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude: number;

  @Column({ name: 'opening_hours', type: 'jsonb', nullable: true })
  openingHours: Record<string, any>;

  @Column({ name: 'logo_file_id', nullable: true })
  logoFileId: string;

  @Column({
    type: 'enum',
    enum: MerchantStatus,
    default: MerchantStatus.PENDING,
  })
  status: MerchantStatus;

  @Column({ name: 'rejection_reason', type: 'text', nullable: true })
  rejectionReason: string;

  @Column({ name: 'signboard_status', default: 'closed' })
  signboardStatus: string;

  @Column({ name: 'total_flyers', default: 0 })
  totalFlyers: number;

  @Column({ name: 'total_views', default: 0 })
  totalViews: number;

  @Column({ name: 'total_clicks', default: 0 })
  totalClicks: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'approved_at', nullable: true })
  approvedAt: Date;
}
