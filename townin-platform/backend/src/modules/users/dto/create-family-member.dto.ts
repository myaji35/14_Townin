import {
  IsEnum,
  IsOptional,
  IsString,
  IsInt,
  IsBoolean,
  Min,
  Max,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FamilyRelationship } from '../entities/family-member.entity';

/**
 * DTO for creating a new family member
 * 가족 구성원 생성 DTO
 *
 * Privacy-First Design:
 * - NO real names
 * - NO resident registration numbers
 * - ONLY optional birthYear and gender
 */
export class CreateFamilyMemberDto {
  @ApiProperty({
    description: 'Relationship to the user (가족 관계)',
    enum: FamilyRelationship,
    example: FamilyRelationship.PARENT,
  })
  @IsEnum(FamilyRelationship)
  relationship: FamilyRelationship;

  @ApiPropertyOptional({
    description: 'Birth year of family member (optional, 생년)',
    example: 1960,
    minimum: 1900,
    maximum: 2024,
  })
  @IsOptional()
  @IsInt()
  @Min(1900)
  @Max(2024)
  birthYear?: number;

  @ApiPropertyOptional({
    description: 'Gender (optional, 성별): M, F, OTHER',
    example: 'F',
    enum: ['M', 'F', 'OTHER'],
  })
  @IsOptional()
  @IsString()
  @IsEnum(['M', 'F', 'OTHER'])
  gender?: string;

  @ApiPropertyOptional({
    description:
      'Nickname for this family member (e.g., "Mom", "Grandma", 별칭)',
    example: '어머니',
    minLength: 1,
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  nickname?: string;

  @ApiPropertyOptional({
    description: 'Whether IoT sensors are installed for this family member',
    example: true,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  hasIotSensors?: boolean;

  @ApiPropertyOptional({
    description: 'Enable notifications for this family member',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  notificationsEnabled?: boolean;
}
