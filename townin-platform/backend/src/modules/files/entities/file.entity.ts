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

@Entity('files')
@Index(['entityType', 'entityId'])
export class File {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'original_name', type: 'varchar', length: 255 })
  originalName: string;

  @Column({ name: 'key', type: 'varchar', length: 500, unique: true })
  key: string; // S3 Key (예: flyers/2025/02/uuid.jpg)

  @Column({ name: 'url', type: 'text' })
  url: string; // CloudFront URL

  // File Info
  @Column({ name: 'size_bytes', type: 'bigint' })
  sizeBytes: number;

  @Column({ name: 'mime_type', type: 'varchar', length: 100 })
  mimeType: string;

  @Column({ name: 'extension', type: 'varchar', length: 10, nullable: true })
  extension: string;

  // Variants
  @Column({ name: 'has_thumbnail', type: 'boolean', default: false })
  hasThumbnail: boolean;

  @Column({ name: 'has_medium', type: 'boolean', default: false })
  hasMedium: boolean;

  @Column({ name: 'has_large', type: 'boolean', default: false })
  hasLarge: boolean;

  @Column({ name: 'has_webp', type: 'boolean', default: false })
  hasWebp: boolean;

  // Metadata
  @Column({ name: 'uploaded_by', type: 'uuid', nullable: true })
  uploadedBy: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'uploaded_by' })
  uploader: User;

  @Column({
    name: 'entity_type',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  entityType: string; // 'user_profile', 'flyer', 'merchant_logo'

  @Column({ name: 'entity_id', type: 'uuid', nullable: true })
  entityId: string;

  // Status
  @Column({ name: 'is_deleted', type: 'boolean', default: false })
  @Index()
  isDeleted: boolean;

  @Column({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
