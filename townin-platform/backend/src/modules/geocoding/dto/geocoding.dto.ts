import { IsNotEmpty, IsNumber, IsString, IsOptional } from 'class-validator';

/**
 * DTO for Address to Coordinates request
 */
export class AddressToCoordinatesDto {
  @IsNotEmpty()
  @IsString()
  address: string; // Full address in Korean (예: 서울특별시 강남구 테헤란로 152)
}

/**
 * DTO for Coordinates to Address request
 */
export class CoordinatesToAddressDto {
  @IsNotEmpty()
  @IsNumber()
  lat: number; // Latitude (WGS84)

  @IsNotEmpty()
  @IsNumber()
  lng: number; // Longitude (WGS84)
}

/**
 * Response structure for Address to Coordinates
 */
export interface AddressToCoordinatesResponse {
  address: string;
  lat: number;
  lng: number;
  region: {
    city?: string; // 시/도
    district?: string; // 구/군
    neighborhood?: string; // 동/읍/면
  };
  roadAddress?: string; // 도로명 주소
  source: 'kakao' | 'cache';
}

/**
 * Response structure for Coordinates to Address
 */
export interface CoordinatesToAddressResponse {
  lat: number;
  lng: number;
  address: string; // 지번 주소
  roadAddress?: string; // 도로명 주소
  region: {
    city?: string;
    district?: string;
    neighborhood?: string;
  };
  source: 'kakao' | 'cache';
}

/**
 * Kakao Local API Response interfaces
 */
export interface KakaoAddressSearchResponse {
  meta: {
    total_count: number;
    pageable_count: number;
    is_end: boolean;
  };
  documents: Array<{
    address_name: string;
    x: string; // longitude
    y: string; // latitude
    address: {
      address_name: string;
      region_1depth_name: string; // 시/도
      region_2depth_name: string; // 구/군
      region_3depth_name: string; // 동/읍/면
    };
    road_address?: {
      address_name: string;
      region_1depth_name: string;
      region_2depth_name: string;
      region_3depth_name: string;
    };
  }>;
}

export interface KakaoCoord2AddressResponse {
  meta: {
    total_count: number;
  };
  documents: Array<{
    address: {
      address_name: string;
      region_1depth_name: string;
      region_2depth_name: string;
      region_3depth_name: string;
    };
    road_address?: {
      address_name: string;
      region_1depth_name: string;
      region_2depth_name: string;
      region_3depth_name: string;
    };
  }>;
}
