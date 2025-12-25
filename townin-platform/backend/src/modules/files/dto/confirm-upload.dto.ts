import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt, Min } from 'class-validator';

export class ConfirmUploadDto {
  @ApiProperty({
    description: 'Upload ID from presigned URL response',
    example: 'upload-uuid',
  })
  @IsString()
  uploadId: string;

  @ApiProperty({
    description: 'S3 key',
    example: 'flyers/2025/02/uuid.jpg',
  })
  @IsString()
  key: string;

  @ApiProperty({
    description: 'Original file name',
    example: 'flyer-image.jpg',
  })
  @IsString()
  originalName: string;

  @ApiProperty({
    description: 'File size in bytes',
    example: 5242880,
  })
  @IsInt()
  @Min(1)
  size: number;

  @ApiProperty({
    description: 'MIME type',
    example: 'image/jpeg',
  })
  @IsString()
  mimeType: string;
}
