import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationsService } from '../notifications.service';
import { NotificationsGateway } from '../gateways/notifications.gateway';

/**
 * Notification Event Listener
 * Listens to business events and triggers push/websocket notifications
 */
@Injectable()
export class NotificationListener {
  private readonly logger = new Logger(NotificationListener.name);

  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  /**
   * Event: flyer.created
   * Triggered when a new flyer is created
   */
  @OnEvent('flyer.created')
  async handleFlyerCreated(payload: {
    flyerId: string;
    merchantName: string;
    title: string;
    regionId?: string;
    targetUserIds?: string[];
  }) {
    this.logger.log(`Handling flyer.created event: ${payload.flyerId}`);

    try {
      // Send push notification to targeted users
      if (payload.targetUserIds && payload.targetUserIds.length > 0) {
        for (const userId of payload.targetUserIds) {
          await this.notificationsService.sendNotification({
            userId,
            type: 'flyer_new',
            title: '새 전단지가 도착했어요!',
            body: `${payload.merchantName}에서 ${payload.title} 전단지를 등록했어요`,
            data: {
              action: 'open_flyer',
              flyerId: payload.flyerId,
            },
          });

          // Send WebSocket notification
          this.notificationsGateway.sendToUser(userId, 'new_flyer', {
            flyerId: payload.flyerId,
            merchantName: payload.merchantName,
            title: payload.title,
          });
        }
      }

      // Send to admin room
      this.notificationsGateway.sendToAdmins('new_flyer', {
        flyerId: payload.flyerId,
        merchantName: payload.merchantName,
        title: payload.title,
      });
    } catch (error) {
      this.logger.error(`Failed to handle flyer.created event: ${error.message}`, error.stack);
    }
  }

  /**
   * Event: flyer.approved
   * Triggered when admin approves a flyer
   */
  @OnEvent('flyer.approved')
  async handleFlyerApproved(payload: {
    flyerId: string;
    title: string;
    merchantId: string;
  }) {
    this.logger.log(`Handling flyer.approved event: ${payload.flyerId}`);

    try {
      await this.notificationsService.sendNotification({
        userId: payload.merchantId,
        type: 'flyer_approved',
        title: '전단지가 승인되었습니다',
        body: `${payload.title} 전단지가 승인되어 사용자에게 노출됩니다`,
        data: {
          action: 'view_my_flyers',
          flyerId: payload.flyerId,
        },
      });

      // Send WebSocket notification
      this.notificationsGateway.sendToUser(payload.merchantId, 'flyer_approved', {
        flyerId: payload.flyerId,
        title: payload.title,
      });
    } catch (error) {
      this.logger.error(`Failed to handle flyer.approved event: ${error.message}`, error.stack);
    }
  }

  /**
   * Event: flyer.rejected
   * Triggered when admin rejects a flyer
   */
  @OnEvent('flyer.rejected')
  async handleFlyerRejected(payload: {
    flyerId: string;
    title: string;
    merchantId: string;
    reason?: string;
  }) {
    this.logger.log(`Handling flyer.rejected event: ${payload.flyerId}`);

    try {
      await this.notificationsService.sendNotification({
        userId: payload.merchantId,
        type: 'flyer_rejected',
        title: '전단지가 반려되었습니다',
        body: payload.reason || `${payload.title} 전단지가 반려되었습니다`,
        data: {
          action: 'view_my_flyers',
          flyerId: payload.flyerId,
        },
      });

      // Send WebSocket notification
      this.notificationsGateway.sendToUser(payload.merchantId, 'flyer_rejected', {
        flyerId: payload.flyerId,
        title: payload.title,
        reason: payload.reason,
      });
    } catch (error) {
      this.logger.error(`Failed to handle flyer.rejected event: ${error.message}`, error.stack);
    }
  }

  /**
   * Event: points.earned
   * Triggered when user earns points
   */
  @OnEvent('points.earned')
  async handlePointsEarned(payload: {
    userId: string;
    points: number;
    reason: string;
  }) {
    this.logger.log(`Handling points.earned event: User ${payload.userId}, Points: ${payload.points}`);

    try {
      await this.notificationsService.sendNotification({
        userId: payload.userId,
        type: 'points_earned',
        title: '포인트가 적립되었습니다',
        body: `${payload.points}P가 적립되었습니다. ${payload.reason}`,
        data: {
          action: 'open_points',
          points: payload.points,
        },
      });

      // Send WebSocket notification
      this.notificationsGateway.sendToUser(payload.userId, 'points_earned', {
        points: payload.points,
        reason: payload.reason,
      });
    } catch (error) {
      this.logger.error(`Failed to handle points.earned event: ${error.message}`, error.stack);
    }
  }

  /**
   * Event: user.registered
   * Triggered when a new user registers
   */
  @OnEvent('user.registered')
  async handleUserRegistered(payload: {
    userId: string;
    name: string;
    email: string;
  }) {
    this.logger.log(`Handling user.registered event: ${payload.userId}`);

    try {
      // Send to admin room
      this.notificationsGateway.sendToAdmins('new_user', {
        userId: payload.userId,
        name: payload.name,
        email: payload.email,
        registeredAt: new Date().toISOString(),
      });
    } catch (error) {
      this.logger.error(`Failed to handle user.registered event: ${error.message}`, error.stack);
    }
  }

  /**
   * Event: merchant.registered
   * Triggered when a new merchant registers
   */
  @OnEvent('merchant.registered')
  async handleMerchantRegistered(payload: {
    merchantId: string;
    businessName: string;
  }) {
    this.logger.log(`Handling merchant.registered event: ${payload.merchantId}`);

    try {
      // Send to admin room
      this.notificationsGateway.sendToAdmins('new_merchant', {
        merchantId: payload.merchantId,
        businessName: payload.businessName,
        registeredAt: new Date().toISOString(),
      });
    } catch (error) {
      this.logger.error(`Failed to handle merchant.registered event: ${error.message}`, error.stack);
    }
  }

  /**
   * Event: system.announcement
   * Triggered for system-wide announcements
   */
  @OnEvent('system.announcement')
  async handleSystemAnnouncement(payload: {
    title: string;
    body: string;
    targetUserIds?: string[];
  }) {
    this.logger.log(`Handling system.announcement event: ${payload.title}`);

    try {
      if (payload.targetUserIds && payload.targetUserIds.length > 0) {
        // Send to specific users
        for (const userId of payload.targetUserIds) {
          await this.notificationsService.sendNotification({
            userId,
            type: 'system_announcement',
            title: payload.title,
            body: payload.body,
            data: {
              action: 'open_announcement',
            },
          });

          this.notificationsGateway.sendToUser(userId, 'system_announcement', {
            title: payload.title,
            body: payload.body,
          });
        }
      } else {
        // Broadcast to all connected users
        this.notificationsGateway.broadcast('system_announcement', {
          title: payload.title,
          body: payload.body,
        });
      }
    } catch (error) {
      this.logger.error(`Failed to handle system.announcement event: ${error.message}`, error.stack);
    }
  }
}
