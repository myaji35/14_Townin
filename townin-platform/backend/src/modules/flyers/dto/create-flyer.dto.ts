import { IsString, IsNotEmpty, IsOptional, IsArray, ValidateNested, IsNumber, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateFlyerProductDto {
  @IsString()
  @IsNotEmpty()
  productName: string;

  @IsNumber()
  @IsOptional()
  price?: number;

  @IsNumber()
  @IsOptional()
  originalPrice?: number;

  @IsString()
  @IsOptional()
  promotion?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsNumber()
  @IsOptional()
  displayOrder?: number;
}

export class CreateFlyerDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsDateString()
  @IsNotEmpty()
  validFrom: string;

  @IsDateString()
  @IsNotEmpty()
  validUntil: string;

  @IsString()
  @IsNotEmpty()
  gridCell: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateFlyerProductDto)
  @IsOptional()
  products?: CreateFlyerProductDto[];
}
