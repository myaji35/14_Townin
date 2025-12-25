import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export interface SlackMessage {
  channel?: string;
  text: string;
  blocks?: any[];
  attachments?: any[];
}

@Injectable()
export class SlackService {
  private readonly logger = new Logger(SlackService.name);
  private readonly webhookUrl: string;
  private readonly defaultChannel: string;
  private readonly enabled: boolean;

  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
  ) {
    this.webhookUrl = this.configService.get<string>('SLACK_WEBHOOK_URL') || '';
    this.defaultChannel = this.configService.get<string>('SLACK_ALERT_CHANNEL') || '#townin-alerts';
    this.enabled = !!this.webhookUrl;

    if (!this.enabled) {
      this.logger.warn('Slack webhook URL not configured. Slack notifications disabled.');
    }
  }

  /**
   * Send message to Slack
   */
  async sendMessage(message: SlackMessage): Promise<void> {
    if (!this.enabled) {
      this.logger.debug(`[Slack Disabled] Would send: ${message.text}`);
      return;
    }

    try {
      const payload = {
        channel: message.channel || this.defaultChannel,
        ...message,
      };

      await firstValueFrom(
        this.httpService.post(this.webhookUrl, payload, {
          headers: { 'Content-Type': 'application/json' },
        }),
      );

      this.logger.log(`Slack message sent to ${payload.channel}`);
    } catch (error) {
      this.logger.error(`Failed to send Slack message: ${error.message}`, error.stack);
    }
  }

  /**
   * Send error alert to Slack
   */
  async sendErrorAlert(error: Error, context?: Record<string, any>): Promise<void> {
    const message: SlackMessage = {
      text: ':rotating_light: *Error Alert*',
      attachments: [
        {
          color: 'danger',
          fields: [
            {
              title: 'Error Message',
              value: error.message,
              short: false,
            },
            {
              title: 'Stack Trace',
              value: `\`\`\`${error.stack?.substring(0, 500) || 'N/A'}\`\`\``,
              short: false,
            },
            ...(context
              ? [
                  {
                    title: 'Context',
                    value: `\`\`\`${JSON.stringify(context, null, 2).substring(0, 500)}\`\`\``,
                    short: false,
                  },
                ]
              : []),
            {
              title: 'Timestamp',
              value: new Date().toISOString(),
              short: true,
            },
            {
              title: 'Environment',
              value: process.env.NODE_ENV || 'development',
              short: true,
            },
          ],
        },
      ],
    };

    await this.sendMessage(message);
  }

  /**
   * Send performance alert (slow API)
   */
  async sendPerformanceAlert(
    method: string,
    url: string,
    duration: number,
  ): Promise<void> {
    const message: SlackMessage = {
      text: ':snail: *Slow API Alert*',
      attachments: [
        {
          color: 'warning',
          fields: [
            {
              title: 'Endpoint',
              value: `${method} ${url}`,
              short: false,
            },
            {
              title: 'Duration',
              value: `${duration}ms`,
              short: true,
            },
            {
              title: 'Threshold',
              value: '3000ms',
              short: true,
            },
            {
              title: 'Timestamp',
              value: new Date().toISOString(),
              short: true,
            },
          ],
        },
      ],
    };

    await this.sendMessage(message);
  }

  /**
   * Send custom alert
   */
  async sendAlert(title: string, message: string, severity: 'info' | 'warning' | 'error' = 'info'): Promise<void> {
    const icons = {
      info: ':information_source:',
      warning: ':warning:',
      error: ':rotating_light:',
    };

    const colors = {
      info: '#36a64f',
      warning: '#ff9800',
      error: '#f44336',
    };

    const slackMessage: SlackMessage = {
      text: `${icons[severity]} *${title}*`,
      attachments: [
        {
          color: colors[severity],
          text: message,
          ts: Math.floor(Date.now() / 1000),
        },
      ],
    };

    await this.sendMessage(slackMessage);
  }
}
