import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum } from 'class-validator';

export enum EntityType {
  USER_PROFILE = 'user_profile',
  FLYER = 'flyer',
  MERCHANT_LOGO = 'merchant_logo',
  MERCHANT_PHOTO = 'merchant_photo',
}

export class UploadFileDto {
  @ApiProperty({
    description: 'Entity type (user_profile, flyer, merchant_logo, merchant_photo)',
    enum: EntityType,
    required: false,
  })
  @IsOptional()
  @IsEnum(EntityType)
  entityType?: EntityType;

  @ApiProperty({
    description: 'Entity ID (optional)',
    required: false,
  })
  @IsOptional()
  @IsString()
  entityId?: string;
}
