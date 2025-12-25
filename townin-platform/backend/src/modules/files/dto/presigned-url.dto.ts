import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsInt, IsOptional, Min, Max } from 'class-validator';
import { EntityType } from './upload-file.dto';

export class PresignedUrlDto {
  @ApiProperty({
    description: 'Original file name',
    example: 'flyer-image.jpg',
  })
  @IsString()
  fileName: string;

  @ApiProperty({
    description: 'MIME type',
    example: 'image/jpeg',
  })
  @IsString()
  fileType: string;

  @ApiProperty({
    description: 'File size in bytes',
    example: 5242880,
  })
  @IsInt()
  @Min(1)
  @Max(10485760) // 10MB
  fileSize: number;

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
