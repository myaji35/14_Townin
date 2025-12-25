import { IsOptional, IsNumber, IsBoolean, Min, Max } from 'class-validator';

/**
 * Query DTO for nearby public data search
 */
export class NearbyQueryDto {
  @IsNumber()
  lat: number;

  @IsNumber()
  lng: number;

  @IsOptional()
  @IsNumber()
  @Min(100)
  @Max(5000)
  radius?: number = 500; // meters

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number = 1;
}

/**
 * Query DTO for parking with availability filter
 */
export class ParkingQueryDto extends NearbyQueryDto {
  @IsOptional()
  @IsBoolean()
  availableOnly?: boolean = false;
}

/**
 * Response interfaces
 */
export interface CctvResponse {
  id: string;
  externalId: string;
  name: string;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  address?: string;
  distance?: number; // meters
  installationAgency?: string;
  installationPurpose?: string;
}

export interface ParkingResponse {
  id: string;
  externalId: string;
  name: string;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  address?: string;
  distance?: number;
  totalSpaces: number;
  availableSpaces?: number;
  operationHours?: string;
  feeInfo?: string;
  phone?: string;
  lastUpdated?: Date;
}

export interface ShelterResponse {
  id: string;
  externalId: string;
  name: string;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  address?: string;
  distance?: number;
  capacity?: number;
  facilityType?: string;
  areaSqm?: number;
}
