import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { AnalyticsAggregationService } from './services/analytics-aggregation.service';
import { AnalyticsEvent } from './entities/analytics-event.entity';
import { AnalyticsStats } from './entities/analytics-stats.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AnalyticsEvent, AnalyticsStats])],
  controllers: [AnalyticsController],
  providers: [AnalyticsService, AnalyticsAggregationService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
