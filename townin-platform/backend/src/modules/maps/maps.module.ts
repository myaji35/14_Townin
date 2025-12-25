import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Region } from '../regions/entities/region.entity';
import { GridCell } from '../grid-cells/entities/grid-cell.entity';
import { MapsService } from './maps.service';
import { MapsController } from './maps.controller';
import { GridCellsModule } from '../grid-cells/grid-cells.module';

@Module({
  imports: [TypeOrmModule.forFeature([Region, GridCell]), GridCellsModule],
  controllers: [MapsController],
  providers: [MapsService],
  exports: [MapsService],
})
export class MapsModule {}
