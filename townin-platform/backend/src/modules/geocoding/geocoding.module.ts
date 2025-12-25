import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { GeocodingService } from './geocoding.service';
import { GeocodingController } from './geocoding.controller';

@Module({
  imports: [
    HttpModule,
    ConfigModule,
  ],
  controllers: [GeocodingController],
  providers: [GeocodingService],
  exports: [GeocodingService],
})
export class GeocodingModule {}
