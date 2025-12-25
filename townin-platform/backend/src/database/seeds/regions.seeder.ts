import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Region, RegionLevel } from '../../modules/regions/entities/region.entity';
import { seoulRegionData, RegionSeedData } from './seoul-regions.data';

/**
 * Regions Seeder Service
 * Seeds Korean administrative region data into the database
 */
@Injectable()
export class RegionsSeeder {
  private readonly logger = new Logger(RegionsSeeder.name);

  constructor(
    @InjectRepository(Region)
    private regionsRepository: Repository<Region>,
  ) {}

  /**
   * Main seeding method
   */
  async seed(): Promise<void> {
    this.logger.log('Starting regions seeding...');

    try {
      // Check if regions already exist
      const existingCount = await this.regionsRepository.count();
      if (existingCount > 0) {
        this.logger.warn(
          `Database already contains ${existingCount} regions. Skipping seeding.`,
        );
        this.logger.log(
          'To re-seed, please truncate the regions table first.',
        );
        return;
      }

      // Phase 1: Seed City level (Seoul)
      await this.seedCityLevel();

      // Phase 2: Seed District level (25 districts)
      await this.seedDistrictLevel();

      // Phase 3: Seed Neighborhood level (sample neighborhoods)
      await this.seedNeighborhoodLevel();

      const finalCount = await this.regionsRepository.count();
      this.logger.log(
        `✅ Regions seeding completed successfully! Total regions: ${finalCount}`,
      );
    } catch (error) {
      this.logger.error('❌ Error during regions seeding:', error);
      throw error;
    }
  }

  /**
   * Seed city level (Seoul)
   */
  private async seedCityLevel(): Promise<void> {
    this.logger.log('Seeding city level (Seoul)...');

    const cityData = seoulRegionData.filter(
      (region) => region.level === 'city',
    );

    for (const data of cityData) {
      const region = this.regionsRepository.create({
        code: data.code,
        nameKo: data.nameKo,
        nameEn: data.nameEn,
        level: data.level as RegionLevel,
        parentId: null,
        centerPointLat: data.centerPointLat,
        centerPointLng: data.centerPointLng,
        population: data.population,
        areaSqm: data.areaSqm,
      });

      await this.regionsRepository.save(region);
      this.logger.log(`✓ Created city: ${data.nameKo} (${data.code})`);
    }
  }

  /**
   * Seed district level (25 districts)
   */
  private async seedDistrictLevel(): Promise<void> {
    this.logger.log('Seeding district level (25 districts)...');

    const districtData = seoulRegionData.filter(
      (region) => region.level === 'district',
    );

    for (const data of districtData) {
      // Find parent (Seoul city)
      const parent = await this.regionsRepository.findOne({
        where: { code: data.parentCode },
      });

      if (!parent) {
        this.logger.warn(
          `Parent not found for district ${data.nameKo} (${data.parentCode})`,
        );
        continue;
      }

      const region = this.regionsRepository.create({
        code: data.code,
        nameKo: data.nameKo,
        nameEn: data.nameEn,
        level: data.level as RegionLevel,
        parentId: parent.id,
        centerPointLat: data.centerPointLat,
        centerPointLng: data.centerPointLng,
        population: data.population,
        areaSqm: data.areaSqm,
      });

      await this.regionsRepository.save(region);
      this.logger.debug(`  ✓ Created district: ${data.nameKo}`);
    }

    this.logger.log(`✓ Created ${districtData.length} districts`);
  }

  /**
   * Seed neighborhood level (sample neighborhoods)
   */
  private async seedNeighborhoodLevel(): Promise<void> {
    this.logger.log('Seeding neighborhood level (sample neighborhoods)...');

    const neighborhoodData = seoulRegionData.filter(
      (region) => region.level === 'neighborhood',
    );

    for (const data of neighborhoodData) {
      // Find parent district
      const parent = await this.regionsRepository.findOne({
        where: { code: data.parentCode },
      });

      if (!parent) {
        this.logger.warn(
          `Parent not found for neighborhood ${data.nameKo} (${data.parentCode})`,
        );
        continue;
      }

      const region = this.regionsRepository.create({
        code: data.code,
        nameKo: data.nameKo,
        nameEn: data.nameEn,
        level: data.level as RegionLevel,
        parentId: parent.id,
        centerPointLat: data.centerPointLat,
        centerPointLng: data.centerPointLng,
        population: data.population,
        areaSqm: data.areaSqm,
      });

      await this.regionsRepository.save(region);
      this.logger.debug(`  ✓ Created neighborhood: ${data.nameKo}`);
    }

    this.logger.log(`✓ Created ${neighborhoodData.length} neighborhoods`);
  }

  /**
   * Clear all regions (useful for testing)
   */
  async clear(): Promise<void> {
    this.logger.log('Clearing all regions...');
    await this.regionsRepository.delete({});
    this.logger.log('✅ All regions cleared');
  }

  /**
   * Get seeding statistics
   */
  async getStats(): Promise<{
    total: number;
    cities: number;
    districts: number;
    neighborhoods: number;
  }> {
    const total = await this.regionsRepository.count();
    const cities = await this.regionsRepository.count({
      where: { level: RegionLevel.CITY },
    });
    const districts = await this.regionsRepository.count({
      where: { level: RegionLevel.DISTRICT },
    });
    const neighborhoods = await this.regionsRepository.count({
      where: { level: RegionLevel.NEIGHBORHOOD },
    });

    return { total, cities, districts, neighborhoods };
  }
}
