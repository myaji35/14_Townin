import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { PointSpendReason } from '../entities/point-transaction.entity';

export class SpendPointsDto {
  @IsEnum(PointSpendReason)
  reason: PointSpendReason;

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
