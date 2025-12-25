import {
  IsString,
  IsNumber,
  IsOptional,
  Min,
  Max,
  IsObject,
} from 'class-validator';

export class CreateMerchantDto {
  @IsString()
  businessName: string;

  @IsOptional()
  @IsString()
  businessNumber?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsString()
  category: string;

  @IsNumber()
  @Min(-90)
  @Max(90)
  lat: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  lng: number;

  @IsString()
  address: string;

  @IsOptional()
  @IsObject()
  openingHours?: Record<string, any>;

  @IsOptional()
  @IsString()
  logoFileId?: string;
}
