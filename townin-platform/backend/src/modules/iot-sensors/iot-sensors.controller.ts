import { Controller, Post, Get, Body, Param, Query } from '@nestjs/common';
import { IoTSensorsService, SensorEvent } from './iot-sensors.service';

@Controller('iot-sensors')
export class IoTSensorsController {
  constructor(private readonly iotSensorsService: IoTSensorsService) {}

  /**
   * Ingest single sensor event
   */
  @Post('events')
  async ingestEvent(@Body() event: SensorEvent) {
    await this.iotSensorsService.ingestSensorEvent(event);
    return { success: true, message: 'Sensor event ingested' };
  }

  /**
   * Ingest batch of sensor events
   */
  @Post('events/batch')
  async ingestBatch(@Body() events: SensorEvent[]) {
    await this.iotSensorsService.ingestBatch(events);
    return { success: true, message: `${events.length} sensor events ingested` };
  }

  /**
   * Get device statistics
   */
  @Get('devices/:deviceId/stats')
  async getDeviceStats(
    @Param('deviceId') deviceId: string,
    @Query('days') days: number = 7,
  ) {
    return await this.iotSensorsService.getDeviceStatistics(deviceId, days);
  }

  /**
   * Generate daily care message
   */
  @Post('devices/:deviceId/care-message')
  async generateCareMessage(
    @Param('deviceId') deviceId: string,
    @Body('userId') userId: string,
  ) {
    return await this.iotSensorsService.generateDailyCareMessage(userId, deviceId);
  }
}
