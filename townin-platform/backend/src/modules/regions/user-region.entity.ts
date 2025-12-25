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
import { Region } from './entities/region.entity';

export enum HubType {
  RESIDENCE = 'residence',   // 거주지
  WORKPLACE = 'workplace',   // 직장
  FAMILY_HOME = 'family_home', // 본가 (케어)
}

@Entity('user_regions')
@Index(['user_id', 'hub_type'], { unique: true }) // 사용자당 각 허브 타입은 하나씩만
export class UserRegion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'uuid' })
  user_id: string;

  @ManyToOne(() => Region, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'region_id' })
  region: Region;

  @Column({ type: 'uuid' })
  region_id: string;

  @Column({
    type: 'enum',
    enum: HubType,
  })
  hub_type: HubType;

  // 이 지역에서 주로 활동하는지
  @Column({ type: 'boolean', default: true })
  isPrimary: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
