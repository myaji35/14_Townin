import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  CreateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/user.entity';

@Entity('user_points')
export class UserPoints {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', unique: true })
  userId: string;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'total_points', type: 'int', default: 0 })
  totalPoints: number; // Current available points

  @Column({ name: 'lifetime_earned', type: 'int', default: 0 })
  lifetimeEarned: number; // Total points ever earned

  @Column({ name: 'lifetime_spent', type: 'int', default: 0 })
  lifetimeSpent: number; // Total points ever spent

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
