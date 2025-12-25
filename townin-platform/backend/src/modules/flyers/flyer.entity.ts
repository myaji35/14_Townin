import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Merchant } from '../merchants/merchant.entity';

export enum FlyerCategory {
  FOOD = 'food',
  FASHION = 'fashion',
  BEAUTY = 'beauty',
  EDUCATION = 'education',
  HEALTH = 'health',
  ENTERTAINMENT = 'entertainment',
  SERVICE = 'service',
  OTHER = 'other',
}

export enum FlyerStatus {
  DRAFT = 'draft',
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
}

@Entity('flyers')
export class Flyer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'merchant_id' })
  merchantId: string;

  @ManyToOne(() => Merchant)
  @JoinColumn({ name: 'merchant_id' })
  merchant: Merchant;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'image_url' })
  imageUrl: string;

  @Column({
    name: 'category',
    type: 'enum',
    enum: FlyerCategory,
    default: FlyerCategory.OTHER,
  })
  @Index()
  category: FlyerCategory;

  @Column({
    name: 'status',
    type: 'enum',
    enum: FlyerStatus,
    default: FlyerStatus.DRAFT,
  })
  @Index()
  status: FlyerStatus;

  @Column({ name: 'target_radius', type: 'int', default: 1000 })
  targetRadius: number; // meters

  @Column({ name: 'start_date', type: 'timestamp', nullable: true })
  startDate: Date;

  @Column({ name: 'end_date', type: 'timestamp', nullable: true })
  endDate: Date;

  @Column({ name: 'region_id', type: 'uuid', nullable: true })
  regionId: string;

  @Column({
    name: 'ai_processing_status',
    type: 'enum',
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending',
  })
  aiProcessingStatus: string;

  @Column({ name: 'ai_extracted_data', type: 'jsonb', nullable: true })
  aiExtractedData: any;

  @Column({ name: 'ai_processing_started_at', type: 'timestamp', nullable: true })
  aiProcessingStartedAt: Date;

  @Column({ name: 'ai_processing_completed_at', type: 'timestamp', nullable: true })
  aiProcessingCompletedAt: Date;

  @Column({ name: 'ai_processing_error', type: 'text', nullable: true })
  aiProcessingError: string;

  @Column({ name: 'view_count', default: 0 })
  viewCount: number;

  @Column({ name: 'click_count', default: 0 })
  clickCount: number;

  @Column({ name: 'conversion_count', default: 0 })
  conversionCount: number;

  @Column({ name: 'revenue_generated', type: 'decimal', precision: 10, scale: 2, default: 0 })
  revenueGenerated: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @Column({ name: 'expires_at', type: 'timestamp', nullable: true })
  expiresAt: Date;

  @Column({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt: Date;

  // 광고 설정 필드들
  @Column({ name: 'is_ad_enabled', default: false })
  isAdEnabled: boolean;

  @Column({ name: 'ad_cost_per_view', type: 'decimal', precision: 10, scale: 2, default: 50 })
  adCostPerView: number; // 5초 뷰당 50원 기본값

  @Column({ name: 'ad_budget', type: 'decimal', precision: 10, scale: 2, nullable: true })
  adBudget: number; // 광고 총 예산

  @Column({ name: 'ad_spent', type: 'decimal', precision: 10, scale: 2, default: 0 })
  adSpent: number; // 현재까지 사용한 광고비

  // 타겟 광고 설정
  @Column({ name: 'target_regions', type: 'jsonb', nullable: true })
  targetRegions: string[]; // 타겟 지역들

  @Column({ name: 'target_age_min', type: 'int', nullable: true })
  targetAgeMin: number;

  @Column({ name: 'target_age_max', type: 'int', nullable: true })
  targetAgeMax: number;

  @Column({ name: 'target_gender', type: 'enum', enum: ['male', 'female', 'all'], default: 'all' })
  targetGender: string;

  @Column({ name: 'target_interests', type: 'jsonb', nullable: true })
  targetInterests: string[]; // 타겟 관심사들

  // 광고 성과 지표
  @Column({ name: 'ad_view_5s_count', default: 0 })
  adView5sCount: number; // 5초 이상 본 횟수

  @Column({ name: 'ad_impressions', default: 0 })
  adImpressions: number; // 광고 노출 횟수

  @Column({ name: 'ad_ctr', type: 'decimal', precision: 5, scale: 2, default: 0 })
  adCtr: number; // 클릭률
}
