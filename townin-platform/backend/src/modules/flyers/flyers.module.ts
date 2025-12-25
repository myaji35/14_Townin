import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FlyersController } from './flyers.controller';
import { FlyerInteractionsController } from './controllers/flyer-interactions.controller';
import { TargetAreaController } from './controllers/target-area.controller';
import { FlyersService } from './flyers.service';
import { FlyerInteractionsService } from './services/flyer-interactions.service';
import { TargetAreaService } from './services/target-area.service';
import { Flyer } from './flyer.entity';
import { FlyerProduct } from './flyer-product.entity';
import { FlyerLike } from './entities/flyer-like.entity';
import { FlyerBookmark } from './entities/flyer-bookmark.entity';
import { FlyerTargetArea } from './entities/flyer-target-area.entity';
import { UserHub } from '../users/entities/user-hub.entity';
import { FlyerAnalyticsListener } from './listeners/flyer-analytics.listener';
import { AnalyticsModule } from '../analytics/analytics.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Flyer,
      FlyerProduct,
      FlyerLike,
      FlyerBookmark,
      FlyerTargetArea,
      UserHub,
    ]),
    AnalyticsModule,
  ],
  controllers: [
    FlyersController,
    FlyerInteractionsController,
    TargetAreaController,
  ],
  providers: [
    FlyersService,
    FlyerInteractionsService,
    TargetAreaService,
    FlyerAnalyticsListener,
  ],
  exports: [FlyersService, FlyerInteractionsService, TargetAreaService],
})
export class FlyersModule {}
