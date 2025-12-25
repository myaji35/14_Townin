import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { Cctv } from './entities/cctv.entity';
import { Parking } from './entities/parking.entity';
import { Shelter } from './entities/shelter.entity';
import { DataSyncLog } from './entities/data-sync-log.entity';
import { PublicDataService } from './public-data.service';
import { PublicDataController } from './public-data.controller';
import { CctvCollectorService } from './collectors/cctv-collector.service';
import { ParkingCollectorService } from './collectors/parking-collector.service';
import { ShelterCollectorService } from './collectors/shelter-collector.service';
import { PublicDataSyncService } from './services/public-data-sync.service';
import { GridCellsModule } from '../grid-cells/grid-cells.module';
import { RegionsModule } from '../regions/regions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Cctv, Parking, Shelter, DataSyncLog]),
    HttpModule,
    ConfigModule,
    ScheduleModule.forRoot(),
    GridCellsModule,
    RegionsModule,
  ],
  controllers: [PublicDataController],
  providers: [
    PublicDataService,
    CctvCollectorService,
    ParkingCollectorService,
    ShelterCollectorService,
    PublicDataSyncService,
  ],
  exports: [
    PublicDataService,
    CctvCollectorService,
    ParkingCollectorService,
    ShelterCollectorService,
    PublicDataSyncService,
  ],
})
export class PublicDataModule {}
