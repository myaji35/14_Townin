import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { InfluxDBService } from './influxdb.service';
import { InfluxDB } from '@influxdata/influxdb-client';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'INFLUXDB_CLIENT',
      useFactory: (configService: ConfigService) => {
        const url = configService.get<string>('INFLUXDB_URL') || 'http://localhost:8086';
        const token = configService.get<string>('INFLUXDB_TOKEN') || 'townin_influx_admin_token';

        const influxDB = new InfluxDB({ url, token });

        console.log('InfluxDB Client Connected');
        return influxDB;
      },
      inject: [ConfigService],
    },
    InfluxDBService,
  ],
  exports: ['INFLUXDB_CLIENT', InfluxDBService],
})
export class InfluxDBModule {}
