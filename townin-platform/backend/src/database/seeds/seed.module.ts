import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Region } from '../../modules/regions/entities/region.entity';
import { GridCell } from '../../modules/grid-cells/entities/grid-cell.entity';
import { Cctv } from '../../modules/public-data/entities/cctv.entity';
import { Parking } from '../../modules/public-data/entities/parking.entity';
import { Shelter } from '../../modules/public-data/entities/shelter.entity';
import { RegionsSeeder } from './regions.seeder';
import { GridCellsSeeder } from './grid-cells.seeder';
import { PublicDataSeeder } from './public-data.seeder';

/**
 * Seed Module
 * Contains all seeder services for database initialization
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Region, GridCell, Cctv, Parking, Shelter]),
  ],
  providers: [RegionsSeeder, GridCellsSeeder, PublicDataSeeder],
  exports: [RegionsSeeder, GridCellsSeeder, PublicDataSeeder],
})
export class SeedModule {}
