import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { AnalyticsEvent } from './entities/analytics-event.entity';
import { AnalyticsStats } from './entities/analytics-stats.entity';

export interface TrackEventDto {
  userId?: string;
  sessionId?: string;
  eventType: string;
  eventCategory?: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  platform?: string;
  appVersion?: string;
  regionId?: string;
}

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(
    @InjectRepository(AnalyticsEvent)
    private eventRepository: Repository<AnalyticsEvent>,
    @InjectRepository(AnalyticsStats)
    private statsRepository: Repository<AnalyticsStats>,
  ) {}

  /**
   * Track analytics event
   */
  async trackEvent(dto: TrackEventDto): Promise<AnalyticsEvent> {
    const event = this.eventRepository.create({
      userId: dto.userId,
      sessionId: dto.sessionId,
      eventType: dto.eventType,
      eventCategory: dto.eventCategory,
      metadata: dto.metadata,
      ipAddress: dto.ipAddress,
      userAgent: dto.userAgent,
      platform: dto.platform,
      appVersion: dto.appVersion,
      regionId: dto.regionId,
    });

    const saved = await this.eventRepository.save(event);

    this.logger.log(`Event tracked: ${dto.eventType} (${dto.userId || 'anonymous'})`);

    return saved;
  }

  /**
   * Get DAU (Daily Active Users)
   */
  async getDau(date: Date): Promise<number> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const result = await this.eventRepository
      .createQueryBuilder('event')
      .select('COUNT(DISTINCT event.user_id)', 'count')
      .where('event.created_at BETWEEN :start AND :end', {
        start: startOfDay,
        end: endOfDay,
      })
      .andWhere('event.user_id IS NOT NULL')
      .getRawOne();

    return parseInt(result.count, 10);
  }

  /**
   * Get MAU (Monthly Active Users)
   */
  async getMau(year: number, month: number): Promise<number> {
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

    const result = await this.eventRepository
      .createQueryBuilder('event')
      .select('COUNT(DISTINCT event.user_id)', 'count')
      .where('event.created_at BETWEEN :start AND :end', {
        start: startOfMonth,
        end: endOfMonth,
      })
      .andWhere('event.user_id IS NOT NULL')
      .getRawOne();

    return parseInt(result.count, 10);
  }

  /**
   * Get analytics stats for date range
   */
  async getStats(startDate: Date, endDate: Date): Promise<{
    data: AnalyticsStats[];
    summary: {
      avgDau: number;
      mau: number;
      totalEvents: number;
    };
  }> {
    const data = await this.statsRepository.find({
      where: {
        date: Between(startDate, endDate),
      },
      order: { date: 'ASC' },
    });

    // Calculate summary
    const avgDau = data.length > 0
      ? Math.round(data.reduce((sum, stat) => sum + stat.dau, 0) / data.length)
      : 0;

    const mau = await this.getMau(endDate.getFullYear(), endDate.getMonth() + 1);

    const totalEvents = await this.eventRepository.count({
      where: {
        createdAt: Between(startDate, endDate),
      },
    });

    return {
      data,
      summary: { avgDau, mau, totalEvents },
    };
  }

  /**
   * Get event counts by type
   */
  async getEventCounts(
    startDate: Date,
    endDate: Date,
  ): Promise<{ eventType: string; count: number }[]> {
    const results = await this.eventRepository
      .createQueryBuilder('event')
      .select('event.event_type', 'eventType')
      .addSelect('COUNT(*)', 'count')
      .where('event.created_at BETWEEN :start AND :end', {
        start: startDate,
        end: endDate,
      })
      .groupBy('event.event_type')
      .orderBy('count', 'DESC')
      .getRawMany();

    return results.map((r) => ({
      eventType: r.eventType,
      count: parseInt(r.count, 10),
    }));
  }
}
