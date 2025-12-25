import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeviceToken, Platform } from './entities/device-token.entity';
import { NotificationLog, NotificationStatus } from './entities/notification-log.entity';
import { NotificationPreference } from './entities/notification-preference.entity';
import { NotificationTemplate } from './entities/notification-template.entity';
import { RegisterDeviceTokenDto } from './dto/register-device-token.dto';
import { PushService } from './services/push.service';

export interface SendNotificationDto {
  userId: string;
  type: string;
  title: string;
  body: string;
  data?: Record<string, any>;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(DeviceToken)
    private deviceTokenRepository: Repository<DeviceToken>,
    @InjectRepository(NotificationLog)
    private notificationLogRepository: Repository<NotificationLog>,
    @InjectRepository(NotificationPreference)
    private preferenceRepository: Repository<NotificationPreference>,
    @InjectRepository(NotificationTemplate)
    private templateRepository: Repository<NotificationTemplate>,
    private pushService: PushService,
  ) {}

  /**
   * Register device token
   */
  async registerDeviceToken(
    userId: string,
    dto: RegisterDeviceTokenDto,
  ): Promise<DeviceToken> {
    // Check if token already exists
    let deviceToken = await this.deviceTokenRepository.findOne({
      where: { token: dto.token },
    });

    if (deviceToken) {
      // Update existing token
      deviceToken.userId = userId;
      deviceToken.platform = dto.platform;
      deviceToken.deviceName = dto.deviceName;
      deviceToken.appVersion = dto.appVersion;
      deviceToken.osVersion = dto.osVersion;
      deviceToken.isActive = true;
      deviceToken.lastUsedAt = new Date();
      deviceToken.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

      return this.deviceTokenRepository.save(deviceToken);
    }

    // Create new token
    deviceToken = this.deviceTokenRepository.create({
      userId,
      token: dto.token,
      platform: dto.platform,
      deviceName: dto.deviceName,
      appVersion: dto.appVersion,
      osVersion: dto.osVersion,
      isActive: true,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    const saved = await this.deviceTokenRepository.save(deviceToken);

    this.logger.log(`Device token registered: ${saved.id} (${dto.platform})`);

    return saved;
  }

  /**
   * Delete device token
   */
  async deleteDeviceToken(token: string, userId: string): Promise<void> {
    const deviceToken = await this.deviceTokenRepository.findOne({
      where: { token, userId },
    });

    if (!deviceToken) {
      throw new NotFoundException('Device token not found');
    }

    await this.deviceTokenRepository.update(deviceToken.id, { isActive: false });

    this.logger.log(`Device token deactivated: ${deviceToken.id}`);
  }

  /**
   * Get user's devices
   */
  async getUserDevices(userId: string): Promise<DeviceToken[]> {
    return this.deviceTokenRepository.find({
      where: { userId, isActive: true },
      order: { lastUsedAt: 'DESC' },
    });
  }

  /**
   * Send notification to user
   */
  async sendNotification(dto: SendNotificationDto): Promise<NotificationLog> {
    this.logger.log(`Sending notification to user ${dto.userId}: ${dto.title}`);

    // Check user preferences
    const preference = await this.getOrCreatePreference(dto.userId);
    if (!this.shouldSendNotification(preference, dto.type)) {
      this.logger.log(`Notification blocked by user preference: ${dto.type}`);
      return null;
    }

    // Get user's active device tokens
    const devices = await this.getUserDevices(dto.userId);

    if (devices.length === 0) {
      this.logger.warn(`No active devices for user ${dto.userId}`);
      return null;
    }

    // Send to all user devices (or just the first one for now)
    const device = devices[0];

    // Create notification log
    const log = this.notificationLogRepository.create({
      userId: dto.userId,
      deviceTokenId: device.id,
      type: dto.type,
      title: dto.title,
      body: dto.body,
      data: dto.data,
      status: NotificationStatus.PENDING,
      platform: device.platform,
    });

    const savedLog = await this.notificationLogRepository.save(log);

    // Send push notification via FCM/APNS
    try {
      const result = await this.pushService.sendToDevice(
        device.token,
        device.platform,
        {
          title: dto.title,
          body: dto.body,
          data: dto.data,
        },
      );

      if (result.success) {
        await this.notificationLogRepository.update(savedLog.id, {
          status: NotificationStatus.SENT,
          sentAt: new Date(),
        });
        this.logger.log(`Notification sent successfully: ${savedLog.id}`);
      } else {
        await this.notificationLogRepository.update(savedLog.id, {
          status: NotificationStatus.FAILED,
          errorMessage: result.error,
        });
        this.logger.error(`Failed to send notification: ${result.error}`);
      }
    } catch (error) {
      await this.notificationLogRepository.update(savedLog.id, {
        status: NotificationStatus.FAILED,
        errorMessage: error.message,
      });
      this.logger.error(`Exception while sending notification: ${error.message}`, error.stack);
    }

    return savedLog;
  }

  /**
   * Get notification history
   */
  async getNotificationHistory(
    userId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{
    data: NotificationLog[];
    total: number;
    page: number;
    limit: number;
  }> {
    const [data, total] = await this.notificationLogRepository.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total, page, limit };
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationLogRepository.count({
      where: { userId, isOpened: false },
    });
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string, userId: string): Promise<void> {
    const notification = await this.notificationLogRepository.findOne({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    await this.notificationLogRepository.update(notificationId, {
      isOpened: true,
      openedAt: new Date(),
    });
  }

  /**
   * Get or create notification preference
   */
  async getOrCreatePreference(userId: string): Promise<NotificationPreference> {
    let preference = await this.preferenceRepository.findOne({
      where: { userId },
    });

    if (!preference) {
      preference = this.preferenceRepository.create({ userId });
      preference = await this.preferenceRepository.save(preference);
    }

    return preference;
  }

  /**
   * Update notification preference
   */
  async updatePreference(
    userId: string,
    updates: Partial<NotificationPreference>,
  ): Promise<NotificationPreference> {
    const preference = await this.getOrCreatePreference(userId);

    Object.assign(preference, updates);

    return this.preferenceRepository.save(preference);
  }

  /**
   * Check if notification should be sent based on preferences
   */
  private shouldSendNotification(
    preference: NotificationPreference,
    type: string,
  ): boolean {
    // Check category
    if (type.startsWith('flyer') && !preference.flyerEnabled) return false;
    if (type.startsWith('points') && !preference.pointsEnabled) return false;
    if (type.startsWith('system') && !preference.systemEnabled) return false;
    if (type.startsWith('care') && !preference.careEnabled) return false;

    // Check quiet hours
    if (preference.quietHoursEnabled) {
      const now = new Date();
      const currentTime = now.toTimeString().slice(0, 5); // HH:MM
      const start = preference.quietHoursStart;
      const end = preference.quietHoursEnd;

      if (start < end) {
        // Same day (e.g., 09:00 - 17:00)
        if (currentTime >= start && currentTime < end) {
          return false;
        }
      } else {
        // Spans midnight (e.g., 22:00 - 08:00)
        if (currentTime >= start || currentTime < end) {
          return false;
        }
      }
    }

    return true;
  }
}
