import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PointsService } from '../points.service';
import { PointEarnReason } from '../entities/point-transaction.entity';

@Injectable()
export class PointsEventListener {
  constructor(private readonly pointsService: PointsService) {}

  /**
   * Award points when user views a flyer
   */
  @OnEvent('flyer.viewed')
  async handleFlyerViewed(payload: {
    flyerId: string;
    userId?: string;
    timestamp: Date;
  }) {
    if (!payload.userId) return;

    // Award 1 point for viewing a flyer
    await this.pointsService.earnPoints(payload.userId, {
      reason: PointEarnReason.FLYER_VIEW,
      amount: 1,
      description: 'Viewed a flyer',
      referenceId: payload.flyerId,
      referenceType: 'flyer',
    });
  }

  /**
   * Award points when user clicks a flyer
   */
  @OnEvent('flyer.clicked')
  async handleFlyerClicked(payload: {
    flyerId: string;
    userId?: string;
    timestamp: Date;
  }) {
    if (!payload.userId) return;

    // Award 5 points for clicking a flyer
    await this.pointsService.earnPoints(payload.userId, {
      reason: PointEarnReason.FLYER_CLICK,
      amount: 5,
      description: 'Clicked on a flyer',
      referenceId: payload.flyerId,
      referenceType: 'flyer',
    });
  }

  /**
   * Award points when user completes profile
   */
  @OnEvent('user.profile.completed')
  async handleProfileCompleted(payload: { userId: string; timestamp: Date }) {
    // Award 50 points for completing profile
    await this.pointsService.earnPoints(payload.userId, {
      reason: PointEarnReason.PROFILE_COMPLETE,
      amount: 50,
      description: 'Completed profile setup',
    });
  }

  /**
   * Award points when user sets up a hub
   */
  @OnEvent('user.hub.created')
  async handleHubCreated(payload: {
    userId: string;
    hubId: string;
    timestamp: Date;
  }) {
    // Award 20 points for setting up a hub
    await this.pointsService.earnPoints(payload.userId, {
      reason: PointEarnReason.HUB_SETUP,
      amount: 20,
      description: 'Set up a location hub',
      referenceId: payload.hubId,
      referenceType: 'hub',
    });
  }
}
