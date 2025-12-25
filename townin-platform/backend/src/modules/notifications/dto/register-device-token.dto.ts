import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional } from 'class-validator';
import { Platform } from '../entities/device-token.entity';

export class RegisterDeviceTokenDto {
  @ApiProperty({
    description: 'FCM/APNS device token',
    example: 'eXampleFCMToken123...',
  })
  @IsString()
  token: string;

  @ApiProperty({
    description: 'Device platform',
    enum: Platform,
    example: Platform.IOS,
  })
  @IsEnum(Platform)
  platform: Platform;

  @ApiProperty({
    description: 'Device name',
    example: 'iPhone 15 Pro',
    required: false,
  })
  @IsOptional()
  @IsString()
  deviceName?: string;

  @ApiProperty({
    description: 'App version',
    example: '1.0.0',
    required: false,
  })
  @IsOptional()
  @IsString()
  appVersion?: string;

  @ApiProperty({
    description: 'OS version',
    example: '17.2',
    required: false,
  })
  @IsOptional()
  @IsString()
  osVersion?: string;
}
