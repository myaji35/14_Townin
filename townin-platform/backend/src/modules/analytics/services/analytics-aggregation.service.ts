import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { AnalyticsEvent } from '../entities/analytics-event.entity';
import { AnalyticsStats } from '../entities/analytics-stats.entity';

@Injectable()
export class AnalyticsAggregationService {
  private readonly logger = new Logger(AnalyticsAggregationService.name);

  constructor(
    @InjectRepository(AnalyticsEvent)
    private eventRepository: Repository<AnalyticsEvent>,
    @InjectRepository(AnalyticsStats)
    private statsRepository: Repository<AnalyticsStats>,
  ) {}

  /**
   * Aggregate daily analytics stats
   * Runs daily at 4:00 AM KST
   */
  @Cron('0 4 * * *', {
    name: 'aggregate-daily-analytics',
    timeZone: 'Asia/Seoul',
  })
  async aggregateDailyStats() {
    this.logger.log('Starting daily analytics aggregation...');

    try {
      // Aggregate yesterday's data
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);

      const endOfYesterday = new Date(yesterday);
      endOfYesterday.setHours(23, 59, 59, 999);

      await this.aggregateStatsForDate(yesterday);

      this.logger.log(`Daily analytics aggregation completed for ${yesterday.toISOString().split('T')[0]}`);
    } catch (error) {
      this.logger.error(`Daily analytics aggregation failed: ${error.message}`, error.stack);
    }
  }

  /**
   * Aggregate stats for a specific date
   */
  async aggregateStatsForDate(date: Date): Promise<void> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Calculate DAU (Daily Active Users)
    const dauResult = await this.eventRepository
      .createQueryBuilder('event')
      .select('COUNT(DISTINCT event.user_id)', 'count')
      .where('event.created_at BETWEEN :start AND :end', {
        start: startOfDay,
        end: endOfDay,
      })
      .andWhere('event.user_id IS NOT NULL')
      .getRawOne();

    const dau = parseInt(dauResult.count, 10);

    // Calculate new users (users who had their first event on this day)
    const newUsersResult = await this.eventRepository
      .createQueryBuilder('event')
      .select('COUNT(DISTINCT event.user_id)', 'count')
      .where((qb) => {
        const subQuery = qb
          .subQuery()
          .select('MIN(e.created_at)', 'first_event')
          .from(AnalyticsEvent, 'e')
          .where('e.user_id = event.user_id')
          .getQuery();

        return `${subQuery} BETWEEN :start AND :end`;
      })
      .setParameter('start', startOfDay)
      .setParameter('end', endOfDay)
      .getRawOne();

    const newUsers = parseInt(newUsersResult.count, 10);

    // Calculate returning users
    const returningUsers = dau - newUsers;

    // Count flyer views
    const flyerViewsResult = await this.eventRepository
      .createQueryBuilder('event')
      .select('COUNT(*)', 'count')
      .where('event.created_at BETWEEN :start AND :end', {
        start: startOfDay,
        end: endOfDay,
      })
      .andWhere("event.event_type = 'flyer_view'")
      .getRawOne();

    const totalFlyerViews = parseInt(flyerViewsResult.count, 10);

    // Count searches
    const searchesResult = await this.eventRepository
      .createQueryBuilder('event')
      .select('COUNT(*)', 'count')
      .where('event.created_at BETWEEN :start AND :end', {
        start: startOfDay,
        end: endOfDay,
      })
      .andWhere("event.event_type = 'flyer_search'")
      .getRawOne();

    const totalSearches = parseInt(searchesResult.count, 10);

    // Calculate average session duration (if available in metadata)
    const avgSessionResult = await this.eventRepository
      .createQueryBuilder('event')
      .select("AVG(CAST(event.metadata->>'duration' AS INTEGER))", 'avg')
      .where('event.created_at BETWEEN :start AND :end', {
        start: startOfDay,
        end: endOfDay,
      })
      .andWhere("event.metadata->>'duration' IS NOT NULL")
      .getRawOne();

    const avgSessionDurationSeconds = avgSessionResult.avg
      ? Math.round(parseFloat(avgSessionResult.avg) / 1000) // Convert ms to seconds
      : null;

    // Calculate retention rates
    const d1RetentionRate = await this.calculateRetentionRate(date, 1);
    const d7RetentionRate = await this.calculateRetentionRate(date, 7);
    const d30RetentionRate = await this.calculateRetentionRate(date, 30);

    // Upsert stats
    const dateString = date.toISOString().split('T')[0];

    let stats = await this.statsRepository.findOne({
      where: { date: dateString as any },
    });

    if (stats) {
      // Update existing
      stats.dau = dau;
      stats.newUsers = newUsers;
      stats.returningUsers = returningUsers;
      stats.totalFlyerViews = totalFlyerViews;
      stats.totalSearches = totalSearches;
      stats.avgSessionDurationSeconds = avgSessionDurationSeconds;
      stats.d1RetentionRate = d1RetentionRate;
      stats.d7RetentionRate = d7RetentionRate;
      stats.d30RetentionRate = d30RetentionRate;
    } else {
      // Create new
      stats = this.statsRepository.create({
        date: dateString as any,
        dau,
        newUsers,
        returningUsers,
        totalFlyerViews,
        totalSearches,
        avgSessionDurationSeconds,
        d1RetentionRate,
        d7RetentionRate,
        d30RetentionRate,
      });
    }

    await this.statsRepository.save(stats);

    this.logger.log(
      `Stats aggregated for ${dateString}: DAU=${dau}, New=${newUsers}, Returning=${returningUsers}`,
    );
  }

  /**
   * Calculate retention rate (D+N)
   * Percentage of users from 'date' who returned N days later
   */
  private async calculateRetentionRate(date: Date, days: number): Promise<number | null> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const targetDate = new Date(date);
    targetDate.setDate(targetDate.getDate() + days);
    targetDate.setHours(0, 0, 0, 0);

    const endOfTargetDate = new Date(targetDate);
    endOfTargetDate.setHours(23, 59, 59, 999);

    // Get users active on the original date
    const originalUsersResult = await this.eventRepository
      .createQueryBuilder('event')
      .select('DISTINCT event.user_id', 'userId')
      .where('event.created_at BETWEEN :start AND :end', {
        start: startOfDay,
        end: endOfDay,
      })
      .andWhere('event.user_id IS NOT NULL')
      .getRawMany();

    const originalUserIds = originalUsersResult.map((r) => r.userId);

    if (originalUserIds.length === 0) {
      return null;
    }

    // Get users from original date who returned on target date
    const returnedUsersResult = await this.eventRepository
      .createQueryBuilder('event')
      .select('COUNT(DISTINCT event.user_id)', 'count')
      .where('event.created_at BETWEEN :start AND :end', {
        start: targetDate,
        end: endOfTargetDate,
      })
      .andWhere('event.user_id IN (:...userIds)', { userIds: originalUserIds })
      .getRawOne();

    const returnedCount = parseInt(returnedUsersResult.count, 10);

    const retentionRate = (returnedCount / originalUserIds.length) * 100;

    return parseFloat(retentionRate.toFixed(2));
  }

  /**
   * Backfill stats for a date range (for testing or recovery)
   */
  async backfillStats(startDate: Date, endDate: Date): Promise<void> {
    this.logger.log(`Backfilling stats from ${startDate.toISOString()} to ${endDate.toISOString()}`);

    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      await this.aggregateStatsForDate(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    this.logger.log('Backfill completed');
  }
}
