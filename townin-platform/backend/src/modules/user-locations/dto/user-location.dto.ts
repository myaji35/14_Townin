import { IsNotEmpty, IsString, IsEnum, IsOptional, IsBoolean, IsNumber } from 'class-validator';
import { LocationHubType } from '../entities/user-location.entity';

/**
 * DTO for setting user location by coordinates
 */
export class SetUserLocationDto {
  @IsNotEmpty()
  @IsEnum(LocationHubType)
  hubType: LocationHubType;

  @IsNotEmpty()
  @IsNumber()
  lat: number;

  @IsNotEmpty()
  @IsNumber()
  lng: number;

  @IsOptional()
  @IsString()
  label?: string; // User-defined label

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}

/**
 * DTO for setting user location by address
 */
export class SetUserLocationByAddressDto {
  @IsNotEmpty()
  @IsEnum(LocationHubType)
  hubType: LocationHubType;

  @IsNotEmpty()
  @IsString()
  address: string;

  @IsOptional()
  @IsString()
  label?: string;

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}

/**
 * DTO for updating user location
 */
export class UpdateUserLocationDto {
  @IsOptional()
  @IsString()
  label?: string;

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}

/**
 * Response for user location
 */
export interface UserLocationResponse {
  id: string;
  userId: string;
  hubType: LocationHubType;
  h3Index: string;
  region?: {
    id: string;
    code: string;
    nameKo: string;
    level: string;
  };
  label?: string;
  isPrimary: boolean;
  createdAt: Date;
  updatedAt: Date;
}
