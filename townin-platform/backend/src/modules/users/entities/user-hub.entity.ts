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
import { User } from '../user.entity';
// Simple Point type definition (GeoJSON compatible)
type Point = {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
};

export enum HubType {
  HOME = 'home',
  WORK = 'work',
  FAMILY = 'family',
}

@Entity('user_hubs')
@Index(['userId', 'hubType'], { unique: true }) // One hub per type per user
export class UserHub {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    type: 'enum',
    enum: HubType,
    name: 'hub_type',
  })
  hubType: HubType;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  latitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  longitude: number;

  @Column({ type: 'text' })
  address: string;

  @Column({ name: 'h3_cell_id', nullable: true })
  h3CellId: string;

  @Column({ nullable: true })
  nickname: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
