import { IsEnum, IsNumber, IsString, IsOptional, Min, Max } from 'class-validator';
import { HubType } from '../entities/user-hub.entity';

export class CreateUserHubDto {
  @IsEnum(HubType, {
    message: 'hubType must be one of: home, work, family',
  })
  hubType: HubType;

  @IsNumber()
  @Min(-90)
  @Max(90)
  lat: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  lng: number;

  @IsString()
  address: string;

  @IsOptional()
  @IsString()
  nickname?: string;
}
