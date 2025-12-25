import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cctv } from '../../modules/public-data/entities/cctv.entity';
import { Parking } from '../../modules/public-data/entities/parking.entity';
import { Shelter } from '../../modules/public-data/entities/shelter.entity';
import {
  generateSampleCctvData,
  generateSampleParkingData,
  generateSampleShelterData,
} from './public-data-samples';

@Injectable()
export class PublicDataSeeder {
  private readonly logger = new Logger(PublicDataSeeder.name);

  constructor(
    @InjectRepository(Cctv)
    private cctvRepository: Repository<Cctv>,
    @InjectRepository(Parking)
    private parkingRepository: Repository<Parking>,
    @InjectRepository(Shelter)
    private shelterRepository: Repository<Shelter>,
  ) {}

  /**
   * Seed sample public data (CCTV, Parking, Shelter)
   */
  async seed(): Promise<void> {
    this.logger.log('Starting public data seeding...');

    // Check if data already exists
    const cctvCount = await this.cctvRepository.count();
    const parkingCount = await this.parkingRepository.count();
    const shelterCount = await this.shelterRepository.count();

    if (cctvCount > 0 || parkingCount > 0 || shelterCount > 0) {
      this.logger.log(
        `Public data already exists (CCTV: ${cctvCount}, Parking: ${parkingCount}, Shelter: ${shelterCount}). Skipping seed.`,
      );
      return;
    }

    try {
      // Seed CCTV data
      this.logger.log('Seeding CCTV data...');
      const cctvData = generateSampleCctvData();
      await this.cctvRepository.save(cctvData);
      this.logger.log(`✓ Seeded ${cctvData.length} CCTV locations`);

      // Seed Parking data
      this.logger.log('Seeding parking data...');
      const parkingData = generateSampleParkingData();
      await this.parkingRepository.save(parkingData);
      this.logger.log(`✓ Seeded ${parkingData.length} parking lots`);

      // Seed Shelter data
      this.logger.log('Seeding shelter data...');
      const shelterData = generateSampleShelterData();
      await this.shelterRepository.save(shelterData);
      this.logger.log(`✓ Seeded ${shelterData.length} shelters`);

      this.logger.log('Public data seeding completed successfully');
    } catch (error) {
      this.logger.error(`Public data seeding failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Clear all public data
   */
  async clear(): Promise<void> {
    this.logger.log('Clearing public data...');

    try {
      await this.cctvRepository.delete({});
      await this.parkingRepository.delete({});
      await this.shelterRepository.delete({});

      this.logger.log('Public data cleared successfully');
    } catch (error) {
      this.logger.error(`Failed to clear public data: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get statistics
   */
  async getStats(): Promise<{
    cctv: number;
    parking: number;
    shelter: number;
  }> {
    const cctv = await this.cctvRepository.count();
    const parking = await this.parkingRepository.count();
    const shelter = await this.shelterRepository.count();

    return { cctv, parking, shelter };
  }
}
