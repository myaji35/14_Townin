import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Region } from '../regions/entities/region.entity';
import { GridCell } from '../grid-cells/entities/grid-cell.entity';
import { UserLocation } from '../user-locations/entities/user-location.entity';
import { StatisticsService } from './statistics.service';
import { StatisticsController } from './statistics.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Region, GridCell, UserLocation])],
  controllers: [StatisticsController],
  providers: [StatisticsService],
  exports: [StatisticsService],
})
export class StatisticsModule {}
