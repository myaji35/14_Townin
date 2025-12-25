import { IsOptional, IsString, IsEnum, IsNumber, Min } from 'class-validator';

export enum StatsPeriod {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  ALL_TIME = 'all_time',
}

export class RegionStatsQueryDto {
  @IsOptional()
  @IsEnum(StatsPeriod)
  period?: StatsPeriod = StatsPeriod.ALL_TIME;

  @IsOptional()
  @IsNumber()
  @Min(1)
  limit?: number = 10;
}

/**
 * Region statistics response
 */
export interface RegionStatisticsResponse {
  regionId: string;
  code: string;
  nameKo: string;
  level: string;
  gridCellCount: number;
  totalUsers: number;
  totalFlyers: number;
  averageUsersPerCell: number;
  averageFlyersPerCell: number;
  lastActivityAt: Date | null;
  population?: number;
  areaSqm?: number;
  densityScore?: number; // users per km²
}

/**
 * Grid cell heatmap data
 */
export interface GridCellHeatmapData {
  h3Index: string;
  lat: number;
  lng: number;
  userCount: number;
  flyerCount: number;
  intensity: number; // normalized 0-1
}

/**
 * Leaderboard entry
 */
export interface RegionLeaderboardEntry {
  rank: number;
  regionId: string;
  code: string;
  nameKo: string;
  level: string;
  score: number;
  metric: string;
}
