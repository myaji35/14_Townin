import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('notification_templates')
export class NotificationTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'type', type: 'varchar', length: 50, unique: true })
  type: string; // flyer_new, flyer_approved, points_earned, system_announcement

  @Column({ name: 'title', type: 'varchar', length: 100 })
  title: string;

  @Column({ name: 'body', type: 'text' })
  body: string;

  @Column({ name: 'data', type: 'jsonb', nullable: true })
  data: Record<string, any>;

  @Column({ name: 'icon', type: 'varchar', length: 255, nullable: true })
  icon: string;

  @Column({ name: 'sound', type: 'varchar', length: 50, default: 'default' })
  sound: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
