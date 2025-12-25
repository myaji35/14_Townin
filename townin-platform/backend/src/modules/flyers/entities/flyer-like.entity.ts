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
import { Flyer } from '../flyer.entity';

@Entity('flyer_likes')
@Index(['userId', 'flyerId'], { unique: true }) // One like per user per flyer
export class FlyerLike {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'flyer_id' })
  flyerId: string;

  @ManyToOne(() => Flyer, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'flyer_id' })
  flyer: Flyer;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
