import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GridCellsController } from './grid-cells.controller';
import { GridCellsService } from './grid-cells.service';
import { GridCell } from './entities/grid-cell.entity';
import { GridCellService } from './grid-cell.service';

@Module({
  imports: [TypeOrmModule.forFeature([GridCell])],
  controllers: [GridCellsController],
  providers: [GridCellsService, GridCellService],
  exports: [GridCellsService, GridCellService],
})
export class GridCellsModule {}
