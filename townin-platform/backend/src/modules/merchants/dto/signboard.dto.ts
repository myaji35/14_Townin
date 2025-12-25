import { IsString, IsOptional, IsEnum } from 'class-validator';
import { SignboardStatus } from '../entities/digital-signboard.entity';

export class CreateSignboardDto {
  @IsString()
  displayName: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  backgroundColor?: string;

  @IsOptional()
  @IsString()
  textColor?: string;

  @IsOptional()
  @IsString()
  logoFileId?: string;
}

export class UpdateSignboardDto {
  @IsOptional()
  @IsString()
  displayName?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  backgroundColor?: string;

  @IsOptional()
  @IsString()
  textColor?: string;

  @IsOptional()
  @IsString()
  logoFileId?: string;
}

export class UpdateSignboardStatusDto {
  @IsEnum(SignboardStatus)
  status: SignboardStatus;
}
