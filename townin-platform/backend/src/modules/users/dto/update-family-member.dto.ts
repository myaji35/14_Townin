import { PartialType } from '@nestjs/swagger';
import { CreateFamilyMemberDto } from './create-family-member.dto';
import { IsBoolean, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for updating an existing family member
 * 가족 구성원 수정 DTO
 *
 * All fields from CreateFamilyMemberDto are optional, plus isActive
 */
export class UpdateFamilyMemberDto extends PartialType(
  CreateFamilyMemberDto,
) {
  @ApiPropertyOptional({
    description: 'Whether this family member record is active',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
