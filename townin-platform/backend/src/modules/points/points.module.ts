import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PointsController } from './points.controller';
import { PointsAdminController } from './controllers/points-admin.controller';
import { PointsService } from './points.service';
import { PointsEventListener } from './listeners/points-event.listener';
import { UserPoints } from './entities/user-points.entity';
import { PointTransaction } from './entities/point-transaction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserPoints, PointTransaction])],
  controllers: [PointsController, PointsAdminController],
  providers: [PointsService, PointsEventListener],
  exports: [PointsService],
})
export class PointsModule {}
