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

export enum Platform {
  IOS = 'ios',
  ANDROID = 'android',
}

@Entity('device_tokens')
@Index(['userId'])
@Index(['token'])
@Index(['isActive'])
export class DeviceToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'token', type: 'text', unique: true })
  token: string;

  @Column({
    name: 'platform',
    type: 'varchar',
    length: 10,
    enum: Platform,
  })
  platform: Platform;

  @Column({ name: 'device_name', type: 'varchar', length: 100, nullable: true })
  deviceName: string;

  @Column({ name: 'app_version', type: 'varchar', length: 20, nullable: true })
  appVersion: string;

  @Column({ name: 'os_version', type: 'varchar', length: 20, nullable: true })
  osVersion: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'last_used_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  lastUsedAt: Date;

  @Column({ name: 'expires_at', type: 'timestamp', nullable: true })
  expiresAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
