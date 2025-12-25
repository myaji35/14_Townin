import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Platform } from '../entities/device-token.entity';

export interface PushPayload {
  title: string;
  body: string;
  data?: Record<string, any>;
  icon?: string;
  sound?: string;
}

export interface SendPushResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

@Injectable()
export class PushService {
  private readonly logger = new Logger(PushService.name);
  private fcmEnabled: boolean;
  private apnsEnabled: boolean;

  constructor(private configService: ConfigService) {
    this.fcmEnabled = !!this.configService.get<string>('FCM_PROJECT_ID');
    this.apnsEnabled = !!this.configService.get<string>('APNS_KEY_ID');

    if (!this.fcmEnabled) {
      this.logger.warn('FCM is not configured. Push notifications for Android will not work.');
    }
    if (!this.apnsEnabled) {
      this.logger.warn('APNS is not configured. Push notifications for iOS will not work.');
    }
  }

  /**
   * Send push notification to device
   */
  async sendToDevice(
    token: string,
    platform: Platform,
    payload: PushPayload,
  ): Promise<SendPushResult> {
    try {
      if (platform === Platform.ANDROID) {
        return await this.sendFCM(token, payload);
      } else if (platform === Platform.IOS) {
        return await this.sendAPNS(token, payload);
      }

      return { success: false, error: 'Unknown platform' };
    } catch (error) {
      this.logger.error(`Failed to send push notification: ${error.message}`, error.stack);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send push to multiple devices
   */
  async sendToMultipleDevices(
    tokens: Array<{ token: string; platform: Platform }>,
    payload: PushPayload,
  ): Promise<{ total: number; success: number; failed: number }> {
    const results = await Promise.allSettled(
      tokens.map(({ token, platform }) => this.sendToDevice(token, platform, payload)),
    );

    const total = results.length;
    const success = results.filter(
      (r) => r.status === 'fulfilled' && r.value.success,
    ).length;
    const failed = total - success;

    this.logger.log(`Batch send completed: ${success}/${total} successful`);

    return { total, success, failed };
  }

  /**
   * Send FCM notification (Android)
   * TODO: Implement actual FCM integration using firebase-admin
   */
  private async sendFCM(token: string, payload: PushPayload): Promise<SendPushResult> {
    if (!this.fcmEnabled) {
      this.logger.warn('FCM not configured, skipping notification');
      return { success: false, error: 'FCM not configured' };
    }

    // TODO: Implement Firebase Admin SDK
    // Example:
    // const message = {
    //   notification: {
    //     title: payload.title,
    //     body: payload.body,
    //   },
    //   data: payload.data,
    //   token: token,
    // };
    // const response = await admin.messaging().send(message);
    // return { success: true, messageId: response };

    this.logger.log(`[FCM MOCK] Sending to token: ${token.substring(0, 20)}...`);
    this.logger.log(`[FCM MOCK] Title: ${payload.title}`);
    this.logger.log(`[FCM MOCK] Body: ${payload.body}`);

    // Mock success for development
    return { success: true, messageId: `fcm-mock-${Date.now()}` };
  }

  /**
   * Send APNS notification (iOS)
   * TODO: Implement actual APNS integration using @parse/node-apn or similar
   */
  private async sendAPNS(token: string, payload: PushPayload): Promise<SendPushResult> {
    if (!this.apnsEnabled) {
      this.logger.warn('APNS not configured, skipping notification');
      return { success: false, error: 'APNS not configured' };
    }

    // TODO: Implement APNS integration
    // Example:
    // const notification = new apn.Notification({
    //   alert: { title: payload.title, body: payload.body },
    //   topic: 'com.townin.app',
    //   payload: payload.data,
    //   sound: payload.sound || 'default',
    // });
    // const result = await apnProvider.send(notification, token);

    this.logger.log(`[APNS MOCK] Sending to token: ${token.substring(0, 20)}...`);
    this.logger.log(`[APNS MOCK] Title: ${payload.title}`);
    this.logger.log(`[APNS MOCK] Body: ${payload.body}`);

    // Mock success for development
    return { success: true, messageId: `apns-mock-${Date.now()}` };
  }

  /**
   * Validate device token format
   */
  validateToken(token: string, platform: Platform): boolean {
    if (!token || token.length < 10) {
      return false;
    }

    // Basic validation (can be enhanced)
    if (platform === Platform.ANDROID && token.length < 100) {
      return false; // FCM tokens are typically 150+ chars
    }

    if (platform === Platform.IOS && token.length !== 64) {
      // APNS tokens are 64 hex chars (or base64 for new format)
      // This is a simplified check
    }

    return true;
  }
}
