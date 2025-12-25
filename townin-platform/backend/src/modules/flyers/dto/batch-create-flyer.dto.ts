import { IsString, IsNotEmpty, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class BatchFlyerItemDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsString()
  @IsOptional()
  price?: string;

  @IsString()
  @IsOptional()
  originalPrice?: string;

  @IsString()
  @IsOptional()
  promotion?: string;
}

export class BatchCreateFlyerDto {
  @IsString()
  @IsNotEmpty()
  gridCell: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BatchFlyerItemDto)
  @IsNotEmpty()
  flyers: BatchFlyerItemDto[];
}
