import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

@Entity('security_guards')
export class SecurityGuard {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'badge_name' })
  badgeName: string;

  @Column({ name: 'assigned_district' })
  assignedDistrict: string;

  @Column({ name: 'assigned_grid_cell' })
  assignedGridCell: string;

  @Column({ name: 'total_earnings', type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalEarnings: number;

  @Column({ name: 'total_ad_views', default: 0 })
  totalAdViews: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'commission_rate', type: 'decimal', precision: 5, scale: 2, default: 5.00 })
  commissionRate: number;

  @Column({ name: 'appointed_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  appointedAt: Date;

  @Column({ name: 'appointed_by', nullable: true })
  appointedBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
