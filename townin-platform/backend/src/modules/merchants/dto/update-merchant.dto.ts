import {
  IsString,
  IsNumber,
  IsOptional,
  Min,
  Max,
  IsObject,
} from 'class-validator';

export class UpdateMerchantDto {
  @IsOptional()
  @IsString()
  businessName?: string;

  @IsOptional()
  @IsString()
  businessNumber?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  lat?: number;

  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  lng?: number;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsObject()
  openingHours?: Record<string, any>;

  @IsOptional()
  @IsString()
  logoFileId?: string;
}
