import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Cctv } from '../entities/cctv.entity';
import { SeoulApiResponse, SeoulCctvRow } from '../dto/seoul-api.dto';
import { GridCellService } from '../../grid-cells/grid-cell.service';
import { RegionsService } from '../../regions/regions.service';

@Injectable()
export class CctvCollectorService {
  private readonly logger = new Logger(CctvCollectorService.name);
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly batchSize = 1000; // API pagination size

  constructor(
    @InjectRepository(Cctv)
    private cctvRepository: Repository<Cctv>,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly gridCellService: GridCellService,
    private readonly regionsService: RegionsService,
  ) {
    this.apiKey = this.configService.get<string>('SEOUL_OPEN_DATA_API_KEY');
    this.baseUrl = this.configService.get<string>('SEOUL_OPEN_DATA_BASE_URL');
  }

  /**
   * Collect CCTV data from Seoul Open Data API
   * @returns Collection statistics
   */
  async collectCctvData(): Promise<{
    totalCount: number;
    insertedCount: number;
    updatedCount: number;
    errorCount: number;
  }> {
    this.logger.log('Starting CCTV data collection...');

    let insertedCount = 0;
    let updatedCount = 0;
    let errorCount = 0;
    let startIndex = 1;
    let totalCount = 0;

    try {
      // First, get total count
      const initialResponse = await this.fetchCctvData(1, 1);
      const responseKey = Object.keys(initialResponse)[0];
      totalCount = initialResponse[responseKey].list_total_count;

      this.logger.log(`Total CCTV count from API: ${totalCount}`);

      // Fetch in batches
      while (startIndex <= totalCount) {
        const endIndex = Math.min(startIndex + this.batchSize - 1, totalCount);
        this.logger.log(`Fetching CCTV data: ${startIndex} - ${endIndex}`);

        try {
          const response = await this.fetchCctvData(startIndex, endIndex);
          const data = response[responseKey];

          if (data.RESULT.CODE !== 'INFO-000') {
            this.logger.warn(`API returned error: ${data.RESULT.MESSAGE}`);
            break;
          }

          // Process batch
          for (const row of data.row) {
            try {
              const result = await this.processCctvRow(row);
              if (result === 'inserted') insertedCount++;
              else if (result === 'updated') updatedCount++;
            } catch (error) {
              this.logger.error(`Failed to process CCTV row: ${error.message}`, error.stack);
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
        `CCTV data collection completed. Total: ${totalCount}, Inserted: ${insertedCount}, Updated: ${updatedCount}, Errors: ${errorCount}`,
      );

      return {
        totalCount,
        insertedCount,
        updatedCount,
        errorCount,
      };
    } catch (error) {
      this.logger.error(`CCTV data collection failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Fetch CCTV data from Seoul Open Data API
   */
  private async fetchCctvData(start: number, end: number): Promise<SeoulApiResponse<SeoulCctvRow>> {
    const url = `${this.baseUrl}/${this.apiKey}/json/CCTV/${start}/${end}`;

    const response = await firstValueFrom(
      this.httpService.get<SeoulApiResponse<SeoulCctvRow>>(url, {
        timeout: 30000,
      }),
    );

    return response.data;
  }

  /**
   * Process single CCTV row from API
   */
  private async processCctvRow(row: SeoulCctvRow): Promise<'inserted' | 'updated' | 'skipped'> {
    // Validate required fields
    if (!row.CCTV_ID || !row.LATITUDE || !row.LONGITUDE) {
      this.logger.warn(`Skipping CCTV with missing required fields: ${JSON.stringify(row)}`);
      return 'skipped';
    }

    const lat = parseFloat(row.LATITUDE);
    const lng = parseFloat(row.LONGITUDE);

    // Validate coordinates (Seoul area approximately)
    if (lat < 37.0 || lat > 38.0 || lng < 126.0 || lng > 128.0) {
      this.logger.warn(`Invalid coordinates for CCTV ${row.CCTV_ID}: (${lat}, ${lng})`);
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
      this.logger.warn(`Failed to find region for CCTV ${row.CCTV_ID}: ${error.message}`);
    }

    // Check if exists
    const existing = await this.cctvRepository.findOne({
      where: { externalId: row.CCTV_ID },
    });

    if (existing) {
      // Update existing
      existing.name = row.CCTV_NAME || existing.name;
      existing.latitude = lat;
      existing.longitude = lng;
      existing.h3CellId = h3CellId;
      existing.address = row.LOCATION || existing.address;
      existing.regionId = regionId;
      existing.installationAgency = row.MANAGE_AGENCY || existing.installationAgency;
      existing.installationPurpose = row.PURPOSE || existing.installationPurpose;
      existing.lastSyncedAt = new Date();

      await this.cctvRepository.save(existing);
      return 'updated';
    } else {
      // Insert new
      const cctv = this.cctvRepository.create({
        externalId: row.CCTV_ID,
        name: row.CCTV_NAME || 'Unknown CCTV',
        latitude: lat,
        longitude: lng,
        h3CellId,
        address: row.LOCATION,
        regionId,
        installationAgency: row.MANAGE_AGENCY,
        installationPurpose: row.PURPOSE,
        lastSyncedAt: new Date(),
      });

      await this.cctvRepository.save(cctv);
      return 'inserted';
    }
  }

  /**
   * Get CCTV statistics
   */
  async getStatistics() {
    const total = await this.cctvRepository.count();
    const withRegion = await this.cctvRepository.count({ where: { regionId: (await this.cctvRepository.createQueryBuilder('cctv').where('cctv.region_id IS NOT NULL').getCount()) as any } });

    return {
      total,
      withRegion,
      withoutRegion: total - withRegion,
    };
  }
}
