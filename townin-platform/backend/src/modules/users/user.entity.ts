import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
} from 'typeorm';
import { UserRole } from '../../common/enums/user-role.enum';
import { Exclude } from 'class-transformer';

// Re-export UserRole for other modules
export { UserRole };

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, name: 'hashed_id' })
  hashedId: string;

  @Column({ unique: true, nullable: true })
  email: string;

  @Column({ name: 'password_hash', nullable: true })
  @Exclude()
  passwordHash: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  phone: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({ name: 'kakao_id', unique: true, nullable: true })
  kakaoId: string;

  @Column({ name: 'naver_id', unique: true, nullable: true })
  naverId: string;

  @Column({ name: 'google_id', unique: true, nullable: true })
  googleId: string;

  @Column({ name: 'profile_image_url', nullable: true })
  profileImageUrl: string;

  @Column({ name: 'is_email_verified', default: false })
  isEmailVerified: boolean;

  @Column({ name: 'age_range', nullable: true })
  ageRange: string;

  @Column({ name: 'birth_year', nullable: true })
  birthYear: number;

  @Column({ name: 'gender', type: 'varchar', length: 10, nullable: true })
  gender: string; // 'M', 'F', 'OTHER'

  @Column({ name: 'household_type', nullable: true })
  householdType: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'last_login_at', nullable: true })
  lastLoginAt: Date;

  @Column({ name: 'fcm_token', nullable: true })
  fcmToken: string;
}
