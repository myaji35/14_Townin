import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../user.entity';

/**
 * Family Member Relationship Types
 * 가족 관계 유형
 */
export enum FamilyRelationship {
  PARENT = 'parent',       // 부모
  CHILD = 'child',         // 자녀
  SPOUSE = 'spouse',       // 배우자
  SIBLING = 'sibling',     // 형제/자매
  GRANDPARENT = 'grandparent', // 조부모
  GRANDCHILD = 'grandchild',   // 손자/손녀
  OTHER = 'other',         // 기타
}

/**
 * Family Member Entity
 *
 * Privacy-First Design:
 * - NO real names (성명 미수집)
 * - NO resident registration numbers (주민번호 미수집)
 * - NO detailed addresses (상세주소 미수집)
 * - ONLY: familyMemberId (hashed ID), birthYear (optional), gender (optional)
 *
 * Use Cases:
 * - IoT sensor monitoring for elderly family members
 * - Family care notifications (효도 리포터)
 * - Anomaly detection alerts for guardian
 */
@Entity('family_members')
export class FamilyMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * Guardian/Caregiver User
   * 보호자/돌보미 사용자
   */
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: string;

  /**
   * Hashed ID for family member (Privacy-First)
   * 가족 구성원의 해시 ID (개인정보 최소화)
   */
  @Column({ name: 'family_member_id', unique: true })
  familyMemberId: string;

  /**
   * Relationship to the user
   * 사용자와의 관계
   */
  @Column({
    type: 'enum',
    enum: FamilyRelationship,
    name: 'relationship',
  })
  relationship: FamilyRelationship;

  /**
   * Birth year (optional, for age-based recommendations)
   * 생년 (선택사항, 연령 기반 추천용)
   */
  @Column({ name: 'birth_year', nullable: true })
  birthYear: number;

  /**
   * Gender (optional)
   * 성별 (선택사항)
   */
  @Column({ name: 'gender', type: 'varchar', length: 10, nullable: true })
  gender: string; // 'M', 'F', 'OTHER'

  /**
   * Nickname for this family member (e.g., "Mom", "Dad", "Grandma")
   * 가족 구성원 별칭 (예: "어머니", "아버지", "할머니")
   */
  @Column({ name: 'nickname', nullable: true })
  nickname: string;

  /**
   * Whether this family member has IoT sensors installed
   * IoT 센서 설치 여부
   */
  @Column({ name: 'has_iot_sensors', default: false })
  hasIotSensors: boolean;

  /**
   * Whether to send notifications for this family member
   * 이 가족 구성원에 대한 알림 발송 여부
   */
  @Column({ name: 'notifications_enabled', default: true })
  notificationsEnabled: boolean;

  /**
   * Whether this family member record is active
   * 활성 상태
   */
  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
