import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DataSyncLog, SyncType, SyncStatus } from '../entities/data-sync-log.entity';
import { CctvCollectorService } from '../collectors/cctv-collector.service';
import { ParkingCollectorService } from '../collectors/parking-collector.service';
import { ShelterCollectorService } from '../collectors/shelter-collector.service';

@Injectable()
export class PublicDataSyncService {
  private readonly logger = new Logger(PublicDataSyncService.name);
  private isSyncing = false;

  constructor(
    @InjectRepository(DataSyncLog)
    private dataSyncLogRepository: Repository<DataSyncLog>,
    private readonly cctvCollector: CctvCollectorService,
    private readonly parkingCollector: ParkingCollectorService,
    private readonly shelterCollector: ShelterCollectorService,
  ) {}

  /**
   * Sync all static public data (CCTV, Parking, Shelter)
   * Runs daily at 3:00 AM KST
   */
  @Cron('0 3 * * *', {
    name: 'sync-static-public-data',
    timeZone: 'Asia/Seoul',
  })
  async syncStaticData() {
    if (this.isSyncing) {
      this.logger.warn('Sync already in progress, skipping...');
      return;
    }

    this.isSyncing = true;
    this.logger.log('Starting daily static public data sync...');

    try {
      // Sync CCTV data
      await this.syncCctv();

      // Sync Parking static data
      await this.syncParkingStatic();

      // Sync Shelter data
      await this.syncShelter();

      this.logger.log('Daily static public data sync completed successfully');
    } catch (error) {
      this.logger.error(`Static data sync failed: ${error.message}`, error.stack);
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Sync realtime parking availability
   * Runs every 30 minutes
   */
  @Cron(CronExpression.EVERY_30_MINUTES, {
    name: 'sync-realtime-parking',
    timeZone: 'Asia/Seoul',
  })
  async syncRealtimeParking() {
    this.logger.log('Starting realtime parking data sync...');

    const startedAt = new Date();
    let log: DataSyncLog;

    try {
      // Create log
      log = this.dataSyncLogRepository.create({
        syncType: SyncType.PARKING,
        status: SyncStatus.SUCCESS,
        startedAt,
      });

      // Collect realtime parking data
      const result = await this.parkingCollector.collectRealtimeData();

      // Update log
      const endedAt = new Date();
      log.endedAt = endedAt;
      log.durationMs = endedAt.getTime() - startedAt.getTime();
      log.totalCount = result.totalCount;
      log.updatedCount = result.updatedCount;
      log.errorCount = result.errorCount;

      if (result.errorCount > 0) {
        log.status = result.errorCount > result.updatedCount ? SyncStatus.FAILED : SyncStatus.SUCCESS;
      }

      await this.dataSyncLogRepository.save(log);

      this.logger.log(`Realtime parking sync completed: ${result.updatedCount}/${result.totalCount} updated`);
    } catch (error) {
      this.logger.error(`Realtime parking sync failed: ${error.message}`, error.stack);

      if (log) {
        log.status = SyncStatus.FAILED;
        log.errorMessage = error.message;
        log.endedAt = new Date();
        log.durationMs = log.endedAt.getTime() - startedAt.getTime();
        await this.dataSyncLogRepository.save(log);
      }
    }
  }

  /**
   * Sync CCTV data
   */
  async syncCctv(): Promise<void> {
    const startedAt = new Date();
    let log: DataSyncLog;

    try {
      this.logger.log('Syncing CCTV data...');

      log = this.dataSyncLogRepository.create({
        syncType: SyncType.CCTV,
        status: SyncStatus.SUCCESS,
        startedAt,
      });

      const result = await this.cctvCollector.collectCctvData();

      const endedAt = new Date();
      log.endedAt = endedAt;
      log.durationMs = endedAt.getTime() - startedAt.getTime();
      log.totalCount = result.totalCount;
      log.insertedCount = result.insertedCount;
      log.updatedCount = result.updatedCount;
      log.errorCount = result.errorCount;

      if (result.errorCount > 0) {
        log.status = result.errorCount > result.insertedCount + result.updatedCount ? SyncStatus.FAILED : SyncStatus.SUCCESS;
      }

      await this.dataSyncLogRepository.save(log);

      this.logger.log(`CCTV sync completed: ${result.insertedCount} inserted, ${result.updatedCount} updated, ${result.errorCount} errors`);
    } catch (error) {
      this.logger.error(`CCTV sync failed: ${error.message}`, error.stack);

      if (log) {
        log.status = SyncStatus.FAILED;
        log.errorMessage = error.message;
        log.endedAt = new Date();
        log.durationMs = log.endedAt.getTime() - startedAt.getTime();
        await this.dataSyncLogRepository.save(log);
      }

      throw error;
    }
  }

  /**
   * Sync Parking static data
   */
  async syncParkingStatic(): Promise<void> {
    const startedAt = new Date();
    let log: DataSyncLog;

    try {
      this.logger.log('Syncing parking static data...');

      log = this.dataSyncLogRepository.create({
        syncType: SyncType.PARKING,
        status: SyncStatus.SUCCESS,
        startedAt,
      });

      const result = await this.parkingCollector.collectStaticData();

      const endedAt = new Date();
      log.endedAt = endedAt;
      log.durationMs = endedAt.getTime() - startedAt.getTime();
      log.totalCount = result.totalCount;
      log.insertedCount = result.insertedCount;
      log.updatedCount = result.updatedCount;
      log.errorCount = result.errorCount;

      if (result.errorCount > 0) {
        log.status = result.errorCount > result.insertedCount + result.updatedCount ? SyncStatus.FAILED : SyncStatus.SUCCESS;
      }

      await this.dataSyncLogRepository.save(log);

      this.logger.log(`Parking static sync completed: ${result.insertedCount} inserted, ${result.updatedCount} updated, ${result.errorCount} errors`);
    } catch (error) {
      this.logger.error(`Parking static sync failed: ${error.message}`, error.stack);

      if (log) {
        log.status = SyncStatus.FAILED;
        log.errorMessage = error.message;
        log.endedAt = new Date();
        log.durationMs = log.endedAt.getTime() - startedAt.getTime();
        await this.dataSyncLogRepository.save(log);
      }

      throw error;
    }
  }

  /**
   * Sync Shelter data
   */
  async syncShelter(): Promise<void> {
    const startedAt = new Date();
    let log: DataSyncLog;

    try {
      this.logger.log('Syncing shelter data...');

      log = this.dataSyncLogRepository.create({
        syncType: SyncType.SHELTER,
        status: SyncStatus.SUCCESS,
        startedAt,
      });

      const result = await this.shelterCollector.collectShelterData();

      const endedAt = new Date();
      log.endedAt = endedAt;
      log.durationMs = endedAt.getTime() - startedAt.getTime();
      log.totalCount = result.totalCount;
      log.insertedCount = result.insertedCount;
      log.updatedCount = result.updatedCount;
      log.errorCount = result.errorCount;

      if (result.errorCount > 0) {
        log.status = result.errorCount > result.insertedCount + result.updatedCount ? SyncStatus.FAILED : SyncStatus.SUCCESS;
      }

      await this.dataSyncLogRepository.save(log);

      this.logger.log(`Shelter sync completed: ${result.insertedCount} inserted, ${result.updatedCount} updated, ${result.errorCount} errors`);
    } catch (error) {
      this.logger.error(`Shelter sync failed: ${error.message}`, error.stack);

      if (log) {
        log.status = SyncStatus.FAILED;
        log.errorMessage = error.message;
        log.endedAt = new Date();
        log.durationMs = log.endedAt.getTime() - startedAt.getTime();
        await this.dataSyncLogRepository.save(log);
      }

      throw error;
    }
  }

  /**
   * Manual trigger for sync (for admin)
   */
  async triggerManualSync(syncType: 'all' | 'cctv' | 'parking' | 'shelter' | 'parking-realtime') {
    this.logger.log(`Manual sync triggered for: ${syncType}`);

    switch (syncType) {
      case 'all':
        await this.syncStaticData();
        break;
      case 'cctv':
        await this.syncCctv();
        break;
      case 'parking':
        await this.syncParkingStatic();
        break;
      case 'shelter':
        await this.syncShelter();
        break;
      case 'parking-realtime':
        await this.syncRealtimeParking();
        break;
      default:
        throw new Error(`Unknown sync type: ${syncType}`);
    }

    return { message: `Sync completed for: ${syncType}` };
  }

  /**
   * Get sync logs (for monitoring dashboard)
   */
  async getSyncLogs(limit: number = 100): Promise<DataSyncLog[]> {
    return this.dataSyncLogRepository.find({
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  /**
   * Get latest sync status for each type
   */
  async getLatestSyncStatus() {
    const cctvLog = await this.dataSyncLogRepository.findOne({
      where: { syncType: SyncType.CCTV },
      order: { createdAt: 'DESC' },
    });

    const parkingLog = await this.dataSyncLogRepository.findOne({
      where: { syncType: SyncType.PARKING },
      order: { createdAt: 'DESC' },
    });

    const shelterLog = await this.dataSyncLogRepository.findOne({
      where: { syncType: SyncType.SHELTER },
      order: { createdAt: 'DESC' },
    });

    return {
      cctv: cctvLog,
      parking: parkingLog,
      shelter: shelterLog,
    };
  }
}
