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
import { Merchant } from '../merchant.entity';

export enum SignboardStatus {
  CLOSED = 'closed',
  OPEN = 'open',
  SUSPENDED = 'suspended',
}

@Entity('digital_signboards')
export class DigitalSignboard {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'merchant_id' })
  merchantId: string;

  @ManyToOne(() => Merchant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'merchant_id' })
  merchant: Merchant;

  @Column({
    type: 'enum',
    enum: SignboardStatus,
    default: SignboardStatus.CLOSED,
  })
  @Index()
  status: SignboardStatus;

  @Column({ name: 'display_name' })
  displayName: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'background_color', default: '#FFFFFF' })
  backgroundColor: string;

  @Column({ name: 'text_color', default: '#000000' })
  textColor: string;

  @Column({ name: 'logo_file_id', nullable: true })
  logoFileId: string;

  @Column({ name: 'total_views', type: 'int', default: 0 })
  totalViews: number;

  @Column({ name: 'total_clicks', type: 'int', default: 0 })
  totalClicks: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'opened_at', nullable: true })
  openedAt: Date;

  @Column({ name: 'closed_at', nullable: true })
  closedAt: Date;
}
