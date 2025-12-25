import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Flyer } from '../flyers/flyer.entity';

@Entity('favorite_flyers')
@Index(['userId', 'flyerId'], { unique: true })
export class FavoriteFlyer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'flyer_id' })
  flyerId: string;

  @ManyToOne(() => Flyer)
  @JoinColumn({ name: 'flyer_id' })
  flyer: Flyer;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
