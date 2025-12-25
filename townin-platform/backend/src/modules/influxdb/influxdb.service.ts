import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InfluxDB, Point, WriteApi, QueryApi } from '@influxdata/influxdb-client';

export interface SensorData {
  deviceId: string;
  sensorType: 'motion' | 'door' | 'temperature' | 'humidity';
  value: number;
  metadata?: Record<string, any>;
  timestamp?: Date;
}

export interface AnomalyDetectionResult {
  deviceId: string;
  anomalyType: string;
  severity: 'low' | 'medium' | 'high';
  detectedAt: Date;
  description: string;
}

@Injectable()
export class InfluxDBService {
  private readonly org: string;
  private readonly bucket: string;
  private writeApi: WriteApi;
  private queryApi: QueryApi;

  constructor(
    @Inject('INFLUXDB_CLIENT')
    private readonly influxDB: InfluxDB,
    private readonly configService: ConfigService,
  ) {
    this.org = this.configService.get<string>('INFLUXDB_ORG') || 'townin';
    this.bucket = this.configService.get<string>('INFLUXDB_BUCKET') || 'iot_events';

    this.writeApi = this.influxDB.getWriteApi(this.org, this.bucket, 'ms');
    this.queryApi = this.influxDB.getQueryApi(this.org);
  }

  /**
   * Write sensor data point
   */
  async writeSensorData(data: SensorData): Promise<void> {
    const point = new Point('sensor_reading')
      .tag('deviceId', data.deviceId)
      .tag('sensorType', data.sensorType)
      .floatField('value', data.value);

    // Add metadata as fields
    if (data.metadata) {
      Object.entries(data.metadata).forEach(([key, value]) => {
        if (typeof value === 'number') {
          point.floatField(key, value);
        } else if (typeof value === 'string') {
          point.stringField(key, value);
        } else if (typeof value === 'boolean') {
          point.booleanField(key, value);
        }
      });
    }

    // Set timestamp if provided
    if (data.timestamp) {
      point.timestamp(data.timestamp);
    }

    this.writeApi.writePoint(point);
    await this.writeApi.flush();
  }

  /**
   * Write multiple sensor data points in batch
   */
  async writeSensorDataBatch(dataArray: SensorData[]): Promise<void> {
    const points = dataArray.map((data) => {
      const point = new Point('sensor_reading')
        .tag('deviceId', data.deviceId)
        .tag('sensorType', data.sensorType)
        .floatField('value', data.value);

      if (data.metadata) {
        Object.entries(data.metadata).forEach(([key, value]) => {
          if (typeof value === 'number') {
            point.floatField(key, value);
          } else if (typeof value === 'string') {
            point.stringField(key, value);
          } else if (typeof value === 'boolean') {
            point.booleanField(key, value);
          }
        });
      }

      if (data.timestamp) {
        point.timestamp(data.timestamp);
      }

      return point;
    });

    this.writeApi.writePoints(points);
    await this.writeApi.flush();
  }

  /**
   * Write anomaly detection result
   */
  async writeAnomaly(anomaly: AnomalyDetectionResult): Promise<void> {
    const point = new Point('anomaly_detected')
      .tag('deviceId', anomaly.deviceId)
      .tag('anomalyType', anomaly.anomalyType)
      .tag('severity', anomaly.severity)
      .stringField('description', anomaly.description)
      .timestamp(anomaly.detectedAt);

    this.writeApi.writePoint(point);
    await this.writeApi.flush();
  }

  /**
   * Query sensor data for a specific device within a time range
   */
  async querySensorData(
    deviceId: string,
    sensorType: string,
    startTime: Date,
    endTime: Date = new Date(),
  ): Promise<any[]> {
    const query = `
      from(bucket: "${this.bucket}")
        |> range(start: ${startTime.toISOString()}, stop: ${endTime.toISOString()})
        |> filter(fn: (r) => r._measurement == "sensor_reading")
        |> filter(fn: (r) => r.deviceId == "${deviceId}")
        |> filter(fn: (r) => r.sensorType == "${sensorType}")
        |> filter(fn: (r) => r._field == "value")
        |> sort(columns: ["_time"])
    `;

    const results: any[] = [];
    return new Promise((resolve, reject) => {
      this.queryApi.queryRows(query, {
        next(row, tableMeta) {
          const obj = tableMeta.toObject(row);
          results.push({
            timestamp: obj._time,
            value: obj._value,
            deviceId: obj.deviceId,
            sensorType: obj.sensorType,
          });
        },
        error(error) {
          reject(error);
        },
        complete() {
          resolve(results);
        },
      });
    });
  }

  /**
   * Get latest sensor reading for a device
   */
  async getLatestReading(deviceId: string, sensorType: string): Promise<any | null> {
    const query = `
      from(bucket: "${this.bucket}")
        |> range(start: -24h)
        |> filter(fn: (r) => r._measurement == "sensor_reading")
        |> filter(fn: (r) => r.deviceId == "${deviceId}")
        |> filter(fn: (r) => r.sensorType == "${sensorType}")
        |> filter(fn: (r) => r._field == "value")
        |> sort(columns: ["_time"], desc: true)
        |> limit(n: 1)
    `;

    const results: any[] = [];
    return new Promise((resolve, reject) => {
      this.queryApi.queryRows(query, {
        next(row, tableMeta) {
          const obj = tableMeta.toObject(row);
          results.push({
            timestamp: obj._time,
            value: obj._value,
            deviceId: obj.deviceId,
            sensorType: obj.sensorType,
          });
        },
        error(error) {
          reject(error);
        },
        complete() {
          resolve(results.length > 0 ? results[0] : null);
        },
      });
    });
  }

  /**
   * Calculate average sensor value over time period
   */
  async getAverageReading(
    deviceId: string,
    sensorType: string,
    startTime: Date,
    endTime: Date = new Date(),
  ): Promise<number | null> {
    const query = `
      from(bucket: "${this.bucket}")
        |> range(start: ${startTime.toISOString()}, stop: ${endTime.toISOString()})
        |> filter(fn: (r) => r._measurement == "sensor_reading")
        |> filter(fn: (r) => r.deviceId == "${deviceId}")
        |> filter(fn: (r) => r.sensorType == "${sensorType}")
        |> filter(fn: (r) => r._field == "value")
        |> mean()
    `;

    return new Promise((resolve, reject) => {
      let avgValue: number | null = null;

      this.queryApi.queryRows(query, {
        next(row, tableMeta) {
          const obj = tableMeta.toObject(row);
          avgValue = obj._value;
        },
        error(error) {
          reject(error);
        },
        complete() {
          resolve(avgValue);
        },
      });
    });
  }

  /**
   * Detect inactivity (no motion detected for extended period)
   */
  async detectInactivity(
    deviceId: string,
    thresholdHours: number = 12,
  ): Promise<boolean> {
    const startTime = new Date(Date.now() - thresholdHours * 60 * 60 * 1000);
    const readings = await this.querySensorData(deviceId, 'motion', startTime);

    // If no motion events in threshold period, return true
    return readings.length === 0 || readings.every((r) => r.value === 0);
  }

  /**
   * Detect unusual activity patterns (e.g., midnight activity)
   */
  async detectUnusualActivity(
    deviceId: string,
    startHour: number = 23, // 11 PM
    endHour: number = 5, // 5 AM
  ): Promise<any[]> {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const readings = await this.querySensorData(deviceId, 'motion', yesterday);

    // Filter readings that occurred during unusual hours
    return readings.filter((reading) => {
      const hour = new Date(reading.timestamp).getHours();
      return hour >= startHour || hour <= endHour;
    });
  }

  /**
   * Get activity summary for a device
   */
  async getActivitySummary(
    deviceId: string,
    date: Date = new Date(),
  ): Promise<{
    totalEvents: number;
    activeHours: number;
    inactiveHours: number;
    averageValue: number | null;
  }> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const readings = await this.querySensorData(deviceId, 'motion', startOfDay, endOfDay);
    const average = await this.getAverageReading(deviceId, 'motion', startOfDay, endOfDay);

    // Calculate active/inactive hours
    const hourlyActivity = new Array(24).fill(false);
    readings.forEach((reading) => {
      const hour = new Date(reading.timestamp).getHours();
      if (reading.value > 0) {
        hourlyActivity[hour] = true;
      }
    });

    const activeHours = hourlyActivity.filter(Boolean).length;

    return {
      totalEvents: readings.length,
      activeHours,
      inactiveHours: 24 - activeHours,
      averageValue: average,
    };
  }

  /**
   * Close write API connection
   */
  async close(): Promise<void> {
    await this.writeApi.close();
  }
}
