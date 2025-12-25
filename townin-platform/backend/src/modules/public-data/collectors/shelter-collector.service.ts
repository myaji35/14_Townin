import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Shelter } from '../entities/shelter.entity';
import { GridCellService } from '../../grid-cells/grid-cell.service';
import { RegionsService } from '../../regions/regions.service';

interface SeoulShelterRow {
  EQUP_NM: string; // 대피소명
  ADDR: string; // 주소
  LAT: string; // 위도
  LOT: string; // 경도
  XCORD?: string; // X좌표 (backup)
  YCORD?: string; // Y좌표 (backup)
  ARCD_AREA?: string; // 면적
  ACMD_PSBL_NMPR?: string; // 수용 가능 인원
  FAC_KIND?: string; // 시설 종류
}

@Injectable()
export class ShelterCollectorService {
  private readonly logger = new Logger(ShelterCollectorService.name);
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly batchSize = 1000;

  constructor(
    @InjectRepository(Shelter)
    private shelterRepository: Repository<Shelter>,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly gridCellService: GridCellService,
    private readonly regionsService: RegionsService,
  ) {
    this.apiKey = this.configService.get<string>('SEOUL_OPEN_DATA_API_KEY');
    this.baseUrl = this.configService.get<string>('SEOUL_OPEN_DATA_BASE_URL');
  }

  /**
   * Collect shelter data from Seoul Open Data API
   * @returns Collection statistics
   */
  async collectShelterData(): Promise<{
    totalCount: number;
    insertedCount: number;
    updatedCount: number;
    errorCount: number;
  }> {
    this.logger.log('Starting shelter data collection...');

    let insertedCount = 0;
    let updatedCount = 0;
    let errorCount = 0;
    let startIndex = 1;
    let totalCount = 0;

    try {
      // First, get total count
      const initialResponse = await this.fetchShelterData(1, 1);
      const responseKey = Object.keys(initialResponse)[0];
      totalCount = initialResponse[responseKey].list_total_count;

      this.logger.log(`Total shelters from API: ${totalCount}`);

      // Fetch in batches
      while (startIndex <= totalCount) {
        const endIndex = Math.min(startIndex + this.batchSize - 1, totalCount);
        this.logger.log(`Fetching shelter data: ${startIndex} - ${endIndex}`);

        try {
          const response = await this.fetchShelterData(startIndex, endIndex);
          const data = response[responseKey];

          if (data.RESULT.CODE !== 'INFO-000') {
            this.logger.warn(`API returned error: ${data.RESULT.MESSAGE}`);
            break;
          }

          // Process batch
          for (const row of data.row) {
            try {
              const result = await this.processShelterRow(row);
              if (result === 'inserted') insertedCount++;
              else if (result === 'updated') updatedCount++;
            } catch (error) {
              this.logger.error(`Failed to process shelter row: ${error.message}`, error.stack);
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
        `Shelter data collection completed. Total: ${totalCount}, Inserted: ${insertedCount}, Updated: ${updatedCount}, Errors: ${errorCount}`,
      );

      return {
        totalCount,
        insertedCount,
        updatedCount,
        errorCount,
      };
    } catch (error) {
      this.logger.error(`Shelter data collection failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Fetch shelter data from Seoul Open Data API
   */
  private async fetchShelterData(start: number, end: number): Promise<any> {
    const url = `${this.baseUrl}/${this.apiKey}/json/TlEarthquakeShelter/${start}/${end}`;

    const response = await firstValueFrom(
      this.httpService.get(url, { timeout: 30000 }),
    );

    return response.data;
  }

  /**
   * Process single shelter row from API
   */
  private async processShelterRow(row: SeoulShelterRow): Promise<'inserted' | 'updated' | 'skipped'> {
    // Validate required fields
    if (!row.EQUP_NM || (!row.LAT && !row.YCORD) || (!row.LOT && !row.XCORD)) {
      this.logger.warn(`Skipping shelter with missing required fields: ${JSON.stringify(row)}`);
      return 'skipped';
    }

    // Parse coordinates (prefer LAT/LOT, fallback to YCORD/XCORD)
    const lat = parseFloat(row.LAT || row.YCORD);
    const lng = parseFloat(row.LOT || row.XCORD);

    // Validate coordinates (Seoul area)
    if (isNaN(lat) || isNaN(lng) || lat < 37.0 || lat > 38.0 || lng < 126.0 || lng > 128.0) {
      this.logger.warn(`Invalid coordinates for shelter ${row.EQUP_NM}: (${lat}, ${lng})`);
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
      this.logger.warn(`Failed to find region for shelter ${row.EQUP_NM}: ${error.message}`);
    }

    // Parse capacity and area
    const capacity = parseInt(row.ACMD_PSBL_NMPR) || null;
    const areaSqm = parseFloat(row.ARCD_AREA) || null;

    // Generate unique externalId from name + address
    const externalId = `${row.EQUP_NM}_${row.ADDR}`.replace(/\s/g, '_').substring(0, 100);

    // Check if exists
    const existing = await this.shelterRepository.findOne({
      where: { externalId },
    });

    if (existing) {
      // Update existing
      existing.name = row.EQUP_NM || existing.name;
      existing.latitude = lat;
      existing.longitude = lng;
      existing.h3CellId = h3CellId;
      existing.address = row.ADDR || existing.address;
      existing.regionId = regionId;
      existing.capacity = capacity;
      existing.facilityType = row.FAC_KIND || existing.facilityType;
      existing.areaSqm = areaSqm;
      existing.lastSyncedAt = new Date();

      await this.shelterRepository.save(existing);
      return 'updated';
    } else {
      // Insert new
      const shelter = this.shelterRepository.create({
        externalId,
        name: row.EQUP_NM,
        latitude: lat,
        longitude: lng,
        h3CellId,
        address: row.ADDR,
        regionId,
        capacity,
        facilityType: row.FAC_KIND || '일반대피소',
        areaSqm,
        lastSyncedAt: new Date(),
      });

      await this.shelterRepository.save(shelter);
      return 'inserted';
    }
  }

  /**
   * Get shelter statistics
   */
  async getStatistics() {
    const total = await this.shelterRepository.count();
    const withRegion = await this.shelterRepository
      .createQueryBuilder('shelter')
      .where('shelter.region_id IS NOT NULL')
      .getCount();

    return {
      total,
      withRegion,
      withoutRegion: total - withRegion,
    };
  }
}
