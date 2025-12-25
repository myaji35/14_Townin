import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserLocation } from './entities/user-location.entity';
import { UserLocationsService } from './user-locations.service';
import { UserLocationsController } from './user-locations.controller';
import { GridCellsModule } from '../grid-cells/grid-cells.module';
import { RegionsModule } from '../regions/regions.module';
import { GeocodingModule } from '../geocoding/geocoding.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserLocation]),
    GridCellsModule,
    RegionsModule,
    GeocodingModule,
  ],
  controllers: [UserLocationsController],
  providers: [UserLocationsService],
  exports: [UserLocationsService],
})
export class UserLocationsModule {}
