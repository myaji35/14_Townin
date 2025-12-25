import { Module } from '@nestjs/common';
import { IoTSensorsService } from './iot-sensors.service';
import { IoTSensorsController } from './iot-sensors.controller';
import { InfluxDBModule } from '../influxdb/influxdb.module';

@Module({
  imports: [InfluxDBModule],
  controllers: [IoTSensorsController],
  providers: [IoTSensorsService],
  exports: [IoTSensorsService],
})
export class IoTSensorsModule {}
