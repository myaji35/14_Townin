import { IsBoolean, IsNumber, IsOptional, IsEnum, IsArray, IsString, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FlyerAdSettingsDto {
  @ApiProperty({ description: '광고 활성화 여부', required: false })
  @IsBoolean()
  @IsOptional()
  isAdEnabled?: boolean;

  @ApiProperty({ description: '5초 뷰당 광고비 (원)', example: 50, required: false })
  @IsNumber()
  @IsOptional()
  @Min(10)
  @Max(10000)
  adCostPerView?: number;

  @ApiProperty({ description: '광고 총 예산 (원)', example: 100000, required: false })
  @IsNumber()
  @IsOptional()
  @Min(1000)
  adBudget?: number;

  @ApiProperty({ description: '타겟 지역 목록', example: ['의정부동', '의정부시'], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  targetRegions?: string[];

  @ApiProperty({ description: '타겟 최소 연령', example: 20, required: false })
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(100)
  targetAgeMin?: number;

  @ApiProperty({ description: '타겟 최대 연령', example: 50, required: false })
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(100)
  targetAgeMax?: number;

  @ApiProperty({ description: '타겟 성별', example: 'all', required: false })
  @IsEnum(['male', 'female', 'all'])
  @IsOptional()
  targetGender?: 'male' | 'female' | 'all';

  @ApiProperty({
    description: '타겟 관심사 목록',
    example: ['식품', '음식점', '카페', '생활', '교육'],
    required: false
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  targetInterests?: string[];
}

export class TrackFlyerViewDto {
  @ApiProperty({ description: '뷰 시간 (초)', example: 5 })
  @IsNumber()
  @Min(0)
  viewDuration: number;

  @ApiProperty({ description: '사용자 연령', required: false })
  @IsNumber()
  @IsOptional()
  userAge?: number;

  @ApiProperty({ description: '사용자 성별', required: false })
  @IsEnum(['male', 'female'])
  @IsOptional()
  userGender?: 'male' | 'female';

  @ApiProperty({ description: '사용자 지역', required: false })
  @IsString()
  @IsOptional()
  userRegion?: string;
}

export class FlyerAdStatsDto {
  @ApiProperty({ description: '광고 노출 수' })
  adImpressions: number;

  @ApiProperty({ description: '5초 이상 뷰 수' })
  adView5sCount: number;

  @ApiProperty({ description: '클릭 수' })
  clickCount: number;

  @ApiProperty({ description: '클릭률 (%)' })
  adCtr: number;

  @ApiProperty({ description: '현재까지 사용한 광고비 (원)' })
  adSpent: number;

  @ApiProperty({ description: '남은 광고 예산 (원)' })
  remainingBudget: number;

  @ApiProperty({ description: '예상 잔여 노출 수' })
  estimatedRemainingImpressions: number;
}