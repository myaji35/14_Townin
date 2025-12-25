import { Injectable } from '@nestjs/common';
import { InfluxDBService, SensorData } from '../influxdb/influxdb.service';
import Anthropic from '@anthropic-ai/sdk';
import { ConfigService } from '@nestjs/config';

export interface SensorEvent {
  deviceId: string;
  userId: string;
  sensorType: 'motion' | 'door' | 'temperature' | 'humidity';
  value: number;
  location?: string;
  timestamp: Date;
}

export interface CareMessage {
  userId: string;
  message: string;
  type: 'positive' | 'alert' | 'info';
  generatedAt: Date;
  basedOn: string; // Description of data that generated this message
}

@Injectable()
export class IoTSensorsService {
  private readonly anthropic: Anthropic;

  constructor(
    private readonly influxDBService: InfluxDBService,
    private readonly configService: ConfigService,
  ) {
    const apiKey = this.configService.get<string>('ANTHROPIC_API_KEY');
    this.anthropic = new Anthropic({ apiKey });
  }

  /**
   * Ingest sensor event
   */
  async ingestSensorEvent(event: SensorEvent): Promise<void> {
    const sensorData: SensorData = {
      deviceId: event.deviceId,
      sensorType: event.sensorType,
      value: event.value,
      metadata: {
        userId: event.userId,
        location: event.location,
      },
      timestamp: event.timestamp,
    };

    await this.influxDBService.writeSensorData(sensorData);

    // Check for anomalies
    await this.detectAnomalies(event);
  }

  /**
   * Detect anomalies in sensor data
   */
  private async detectAnomalies(event: SensorEvent): Promise<void> {
    // Check for inactivity (no motion for 12 hours)
    if (event.sensorType === 'motion') {
      const isInactive = await this.influxDBService.detectInactivity(
        event.deviceId,
        12,
      );

      if (isInactive) {
        await this.influxDBService.writeAnomaly({
          deviceId: event.deviceId,
          anomalyType: 'prolonged_inactivity',
          severity: 'high',
          detectedAt: new Date(),
          description: 'No motion detected for over 12 hours',
        });

        // Generate alert care message
        await this.generateAlertCareMessage(event.userId, 'inactivity');
      }
    }

    // Check for unusual night activity
    const hour = event.timestamp.getHours();
    if (event.sensorType === 'motion' && (hour >= 23 || hour <= 5) && event.value > 0) {
      const unusualActivity = await this.influxDBService.detectUnusualActivity(
        event.deviceId,
        23,
        5,
      );

      if (unusualActivity.length > 5) {
        // Multiple night activities
        await this.influxDBService.writeAnomaly({
          deviceId: event.deviceId,
          anomalyType: 'unusual_night_activity',
          severity: 'medium',
          detectedAt: new Date(),
          description: 'Unusual activity pattern detected during nighttime',
        });
      }
    }
  }

  /**
   * Generate daily care message using AI
   */
  async generateDailyCareMessage(userId: string, deviceId: string): Promise<CareMessage> {
    // Get activity summary for today
    const summary = await this.influxDBService.getActivitySummary(deviceId);

    const prompt = `You are a caring AI assistant for a family member monitoring system.

Generate a warm, empathetic message for a family member based on this activity data:
- Total motion events today: ${summary.totalEvents}
- Active hours: ${summary.activeHours}
- Inactive hours: ${summary.inactiveHours}

Guidelines:
- Keep it positive and encouraging
- Use warm, familial language (in Korean)
- Make it personal and specific to the data
- Keep it under 100 characters
- Do NOT mention technical details like "motion events" or sensors

Example good messages:
- "어머니가 오늘 아침 일찍 활동적이시네요! 😊"
- "오늘 하루도 건강하게 보내셨어요 💪"
- "평소보다 조용한 하루를 보내셨네요. 괜찮으신가요?"

Generate only the message text in Korean, nothing else:`;

    const response = await this.anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 200,
      temperature: 0.8,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = response.content[0];
    const messageText = content.type === 'text' ? content.text.trim() : '';

    return {
      userId,
      message: messageText,
      type: 'positive',
      generatedAt: new Date(),
      basedOn: `${summary.totalEvents} events, ${summary.activeHours}h active`,
    };
  }

  /**
   * Generate alert care message for anomalies
   */
  private async generateAlertCareMessage(
    userId: string,
    anomalyType: string,
  ): Promise<CareMessage> {
    let messageText = '';

    switch (anomalyType) {
      case 'inactivity':
        messageText = '어머니의 활동이 12시간 이상 감지되지 않았어요. 안부를 확인해보세요.';
        break;
      case 'unusual_night_activity':
        messageText = '어젯밤 평소와 다른 활동 패턴이 감지되었어요. 괜찮으신지 확인해보세요.';
        break;
      default:
        messageText = '평소와 다른 패턴이 감지되었어요.';
    }

    return {
      userId,
      message: messageText,
      type: 'alert',
      generatedAt: new Date(),
      basedOn: `Anomaly: ${anomalyType}`,
    };
  }

  /**
   * Get sensor statistics for a device
   */
  async getDeviceStatistics(deviceId: string, days: number = 7): Promise<any> {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const summaries = [];
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const summary = await this.influxDBService.getActivitySummary(deviceId, date);
      summaries.push({
        date: date.toISOString().split('T')[0],
        ...summary,
      });
    }

    return {
      deviceId,
      period: `${days} days`,
      dailySummaries: summaries,
      averageActiveHours:
        summaries.reduce((sum, s) => sum + s.activeHours, 0) / summaries.length,
    };
  }

  /**
   * Batch ingest sensor events
   */
  async ingestBatch(events: SensorEvent[]): Promise<void> {
    const sensorDataArray: SensorData[] = events.map(event => ({
      deviceId: event.deviceId,
      sensorType: event.sensorType,
      value: event.value,
      metadata: {
        userId: event.userId,
        location: event.location,
      },
      timestamp: event.timestamp,
    }));

    await this.influxDBService.writeSensorDataBatch(sensorDataArray);
  }
}
