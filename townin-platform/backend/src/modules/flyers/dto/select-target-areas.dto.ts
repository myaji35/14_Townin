import { IsArray, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class SelectTargetAreasDto {
  @IsArray()
  @IsString({ each: true })
  h3CellIds: string[]; // Array of H3 cell IDs

  @IsOptional()
  @IsNumber()
  @Min(7)
  h3Resolution?: number; // Default: 9 (~174m hexagons)
}

export class TargetAreaEstimateDto {
  @IsNumber()
  lat: number;

  @IsNumber()
  lng: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  radiusKm?: number; // Radius in kilometers (default: 1km)

  @IsOptional()
  @IsNumber()
  @Min(7)
  h3Resolution?: number; // Default: 9
}
