import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

export enum RegionLevel {
  CITY = 'city',           // 시
  DISTRICT = 'district',   // 구
  NEIGHBORHOOD = 'neighborhood', // 동/읍/면
}

@Entity('regions')
export class Region {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({
    type: 'enum',
    enum: RegionLevel,
    default: RegionLevel.NEIGHBORHOOD,
  })
  level: RegionLevel;

  @Column({ type: 'varchar', length: 20, nullable: true })
  code: string; // 행정구역 코드 (법정동 코드)

  // 계층 구조: parent region
  @ManyToOne(() => Region, (region) => region.children, { nullable: true })
  @JoinColumn({ name: 'parent_id' })
  parent: Region;

  @Column({ type: 'uuid', nullable: true })
  parent_id: string;

  // 하위 지역들
  @OneToMany(() => Region, (region) => region.parent)
  children: Region[];

  // 마스터 (Master User)
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'master_id' })
  master: User;

  @Column({ type: 'uuid', nullable: true })
  master_id: string;

  // 지역 통계
  @Column({ type: 'int', default: 0 })
  totalUsers: number;

  @Column({ type: 'int', default: 0 })
  totalMerchants: number;

  @Column({ type: 'int', default: 0 })
  totalFlyers: number;

  // Livability Index (살기 좋은 동네 지수)
  @Column({ name: 'livability_index', type: 'decimal', precision: 5, scale: 2, default: 0 })
  livabilityIndex: number;

  // Safety Score (안전 점수)
  @Column({ name: 'safety_score', type: 'decimal', precision: 5, scale: 2, default: 0 })
  safetyScore: number;

  // 활성화 여부
  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  // 좌표 (중심점)
  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude: number;

  // 메타데이터
  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
