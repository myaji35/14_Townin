import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Parking } from '../entities/parking.entity';
import { GridCellService } from '../../grid-cells/grid-cell.service';
import { RegionsService } from '../../regions/regions.service';

interface SeoulParkingRow {
  PARKING_CODE: string;
  PARKING_NAME: string;
  ADDR: string;
  LAT: string;
  LNG: string;
  CAPACITY: string;
  OPERATION_RULE_NAME?: string;
  RATES?: string;
  TEL?: string;
}

interface SeoulParkingAvailableRow {
  PARKING_CODE: string;
  CUR_PARKING: string; // 현재 주차 대수
}

@Injectable()
export class ParkingCollectorService {
  private readonly logger = new Logger(ParkingCollectorService.name);
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly batchSize = 1000;

  constructor(
    @InjectRepository(Parking)
    private parkingRepository: Repository<Parking>,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly gridCellService: GridCellService,
    private readonly regionsService: RegionsService,
  ) {
    this.apiKey = this.configService.get<string>('SEOUL_OPEN_DATA_API_KEY');
    this.baseUrl = this.configService.get<string>('SEOUL_OPEN_DATA_BASE_URL');
  }

  /**
   * Collect static parking data (location, capacity, fees, etc.)
   * @returns Collection statistics
   */
  async collectStaticData(): Promise<{
    totalCount: number;
    insertedCount: number;
    updatedCount: number;
    errorCount: number;
  }> {
    this.logger.log('Starting parking static data collection...');

    let insertedCount = 0;
    let updatedCount = 0;
    let errorCount = 0;
    let startIndex = 1;
    let totalCount = 0;

    try {
      // First, get total count
      const initialResponse = await this.fetchParkingInfo(1, 1);
      const responseKey = Object.keys(initialResponse)[0];
      totalCount = initialResponse[responseKey].list_total_count;

      this.logger.log(`Total parking lots from API: ${totalCount}`);

      // Fetch in batches
      while (startIndex <= totalCount) {
        const endIndex = Math.min(startIndex + this.batchSize - 1, totalCount);
        this.logger.log(`Fetching parking data: ${startIndex} - ${endIndex}`);

        try {
          const response = await this.fetchParkingInfo(startIndex, endIndex);
          const data = response[responseKey];

          if (data.RESULT.CODE !== 'INFO-000') {
            this.logger.warn(`API returned error: ${data.RESULT.MESSAGE}`);
            break;
          }

          // Process batch
          for (const row of data.row) {
            try {
              const result = await this.processParkingRow(row);
              if (result === 'inserted') insertedCount++;
              else if (result === 'updated') updatedCount++;
            } catch (error) {
              this.logger.error(`Failed to process parking row: ${error.message}`, error.stack);
              errorCount++;
            }
          }

          startIndex += this.batchSize;
        } catch (error) {
          this.logger.error(`Failed to fetch batch ${startIndex}-${endIndex}: ${error.message}`);
          errorCount += this.batchSize;
          startIndex += this.batchSize;
        }
      }

      this.logger.log(
        `Parking static data collection completed. Total: ${totalCount}, Inserted: ${insertedCount}, Updated: ${updatedCount}, Errors: ${errorCount}`,
      );

      return {
        totalCount,
        insertedCount,
        updatedCount,
        errorCount,
      };
    } catch (error) {
      this.logger.error(`Parking static data collection failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Collect realtime parking availability data
   * @returns Update statistics
   */
  async collectRealtimeData(): Promise<{
    totalCount: number;
    updatedCount: number;
    errorCount: number;
  }> {
    this.logger.log('Starting parking realtime data collection...');

    let updatedCount = 0;
    let errorCount = 0;
    let startIndex = 1;
    let totalCount = 0;

    try {
      // First, get total count
      const initialResponse = await this.fetchParkingAvailable(1, 1);
      const responseKey = Object.keys(initialResponse)[0];
      totalCount = initialResponse[responseKey].list_total_count;

      this.logger.log(`Total parking realtime records from API: ${totalCount}`);

      // Fetch in batches
      while (startIndex <= totalCount) {
        const endIndex = Math.min(startIndex + this.batchSize - 1, totalCount);
        this.logger.log(`Fetching parking realtime data: ${startIndex} - ${endIndex}`);

        try {
          const response = await this.fetchParkingAvailable(startIndex, endIndex);
          const data = response[responseKey];

          if (data.RESULT.CODE !== 'INFO-000') {
            this.logger.warn(`API returned error: ${data.RESULT.MESSAGE}`);
            break;
          }

          // Process batch
          for (const row of data.row) {
            try {
              const result = await this.updateParkingAvailability(row);
              if (result) updatedCount++;
            } catch (error) {
              this.logger.error(`Failed to update parking availability: ${error.message}`);
              errorCount++;
            }
          }

          startIndex += this.batchSize;
        } catch (error) {
          this.logger.error(`Failed to fetch realtime batch ${startIndex}-${endIndex}: ${error.message}`);
          errorCount += this.batchSize;
          startIndex += this.batchSize;
        }
      }

      this.logger.log(
        `Parking realtime data collection completed. Total: ${totalCount}, Updated: ${updatedCount}, Errors: ${errorCount}`,
      );

      return {
        totalCount,
        updatedCount,
        errorCount,
      };
    } catch (error) {
      this.logger.error(`Parking realtime data collection failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Fetch parking info from Seoul Open Data API
   */
  private async fetchParkingInfo(start: number, end: number): Promise<any> {
    const url = `${this.baseUrl}/${this.apiKey}/json/GetParkingInfo/${start}/${end}`;

    const response = await firstValueFrom(
      this.httpService.get(url, { timeout: 30000 }),
    );

    return response.data;
  }

  /**
   * Fetch parking availability from Seoul Open Data API
   */
  private async fetchParkingAvailable(start: number, end: number): Promise<any> {
    const url = `${this.baseUrl}/${this.apiKey}/json/GetParkingAvailable/${start}/${end}`;

    const response = await firstValueFrom(
      this.httpService.get(url, { timeout: 30000 }),
    );

    return response.data;
  }

  /**
   * Process single parking row from API
   */
  private async processParkingRow(row: SeoulParkingRow): Promise<'inserted' | 'updated' | 'skipped'> {
    // Validate required fields
    if (!row.PARKING_CODE || !row.LAT || !row.LNG) {
      this.logger.warn(`Skipping parking with missing required fields: ${JSON.stringify(row)}`);
      return 'skipped';
    }

    const lat = parseFloat(row.LAT);
    const lng = parseFloat(row.LNG);

    // Validate coordinates (Seoul area)
    if (lat < 37.0 || lat > 38.0 || lng < 126.0 || lng > 128.0) {
      this.logger.warn(`Invalid coordinates for parking ${row.PARKING_CODE}: (${lat}, ${lng})`);
      return 'skipped';
    }

    // Convert to H3 cell
    const h3CellId = this.gridCellService.latLngToCell(lat, lng);

    // Find region
    let regionId: string | null = null;
    try {
      const region = await this.regionsService.findRegionByCoordinates(lat, lng);
      regionId = region?.id || null;
    } catch (error) {
      this.logger.warn(`Failed to find region for parking ${row.PARKING_CODE}: ${error.message}`);
    }

    // Parse capacity
    const totalSpaces = parseInt(row.CAPACITY) || 0;

    // Check if exists
    const existing = await this.parkingRepository.findOne({
      where: { externalId: row.PARKING_CODE },
    });

    if (existing) {
      // Update existing
      existing.name = row.PARKING_NAME || existing.name;
      existing.latitude = lat;
      existing.longitude = lng;
      existing.h3CellId = h3CellId;
      existing.address = row.ADDR || existing.address;
      existing.regionId = regionId;
      existing.totalSpaces = totalSpaces;
      existing.operationHours = row.OPERATION_RULE_NAME || existing.operationHours;
      existing.feeInfo = row.RATES || existing.feeInfo;
      existing.phone = row.TEL || existing.phone;
      existing.staticDataSyncedAt = new Date();

      await this.parkingRepository.save(existing);
      return 'updated';
    } else {
      // Insert new
      const parking = this.parkingRepository.create({
        externalId: row.PARKING_CODE,
        name: row.PARKING_NAME || 'Unknown Parking',
        latitude: lat,
        longitude: lng,
        h3CellId,
        address: row.ADDR,
        regionId,
        totalSpaces,
        availableSpaces: 0, // Will be updated by realtime sync
        operationHours: row.OPERATION_RULE_NAME,
        feeInfo: row.RATES,
        phone: row.TEL,
        staticDataSyncedAt: new Date(),
      });

      await this.parkingRepository.save(parking);
      return 'inserted';
    }
  }

  /**
   * Update parking availability
   */
  private async updateParkingAvailability(row: SeoulParkingAvailableRow): Promise<boolean> {
    const parking = await this.parkingRepository.findOne({
      where: { externalId: row.PARKING_CODE },
    });

    if (!parking) {
      this.logger.warn(`Parking not found for code: ${row.PARKING_CODE}`);
      return false;
    }

    const currentParking = parseInt(row.CUR_PARKING) || 0;
    parking.availableSpaces = Math.max(0, parking.totalSpaces - currentParking);
    parking.realtimeDataSyncedAt = new Date();

    await this.parkingRepository.save(parking);
    return true;
  }

  /**
   * Get parking statistics
   */
  async getStatistics() {
    const total = await this.parkingRepository.count();
    const withRealtime = await this.parkingRepository
      .createQueryBuilder('parking')
      .where('parking.realtime_data_synced_at IS NOT NULL')
      .getCount();

    return {
      total,
      withRealtime,
      withoutRealtime: total - withRealtime,
    };
  }
}
