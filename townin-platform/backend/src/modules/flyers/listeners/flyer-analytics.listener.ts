import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { AnalyticsService } from '../../analytics/analytics.service';

@Injectable()
export class FlyerAnalyticsListener {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @OnEvent('flyer.viewed')
  async handleFlyerViewed(payload: {
    flyerId: string;
    userId?: string;
    timestamp: Date;
  }) {
    await this.analyticsService.trackEvent({
      userId: payload.userId,
      sessionId: '', // TODO: Get from request context
      eventType: 'flyer_view',
      eventCategory: 'engagement',
      metadata: {
        flyerId: payload.flyerId,
        timestamp: payload.timestamp,
      },
      platform: 'web', // TODO: Get from request
    });
  }

  @OnEvent('flyer.clicked')
  async handleFlyerClicked(payload: {
    flyerId: string;
    userId?: string;
    timestamp: Date;
  }) {
    await this.analyticsService.trackEvent({
      userId: payload.userId,
      sessionId: '', // TODO: Get from request context
      eventType: 'flyer_click',
      eventCategory: 'engagement',
      metadata: {
        flyerId: payload.flyerId,
        timestamp: payload.timestamp,
      },
      platform: 'web', // TODO: Get from request
    });
  }
}
