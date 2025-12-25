import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { PointEarnReason } from '../entities/point-transaction.entity';

export class EarnPointsDto {
  @IsEnum(PointEarnReason)
  reason: PointEarnReason;

  @IsInt()
  @Min(1)
  amount: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  referenceId?: string;

  @IsOptional()
  @IsString()
  referenceType?: string;
}
