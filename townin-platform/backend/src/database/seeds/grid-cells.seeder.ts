import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GridCell } from '../../modules/grid-cells/entities/grid-cell.entity';
import { Region, RegionLevel } from '../../modules/regions/entities/region.entity';
import { latLngToCell, cellToLatLng, cellToBoundary, gridDisk } from 'h3-js';

/**
 * Grid Cells Seeder Service
 * Seeds H3 grid cells for Seoul regions
 */
@Injectable()
export class GridCellsSeeder {
  private readonly logger = new Logger(GridCellsSeeder.name);
  private readonly H3_RESOLUTION = 9; // ~174m hexagon edge

  constructor(
    @InjectRepository(GridCell)
    private gridCellRepository: Repository<GridCell>,
    @InjectRepository(Region)
    private regionsRepository: Repository<Region>,
  ) {}

  /**
   * Main seeding method
   */
  async seed(): Promise<void> {
    this.logger.log('Starting grid cells seeding...');

    try {
      // Check if grid cells already exist
      const existingCount = await this.gridCellRepository.count();
      if (existingCount > 0) {
        this.logger.warn(
          `Database already contains ${existingCount} grid cells. Skipping seeding.`,
        );
        return;
      }

      // Get all districts from Seoul
      const districts = await this.regionsRepository.find({
        where: { level: RegionLevel.DISTRICT },
      });

      if (districts.length === 0) {
        this.logger.warn(
          '⚠️  No districts found. Please run regions seeder first.',
        );
        return;
      }

      this.logger.log(`Found ${districts.length} districts. Generating grid cells...`);

      let totalCreated = 0;

      // For each district, generate grid cells based on center point
      for (const district of districts) {
        if (!district.centerPointLat || !district.centerPointLng) {
          this.logger.debug(
            `Skipping ${district.nameKo} - no center point defined`,
          );
          continue;
        }

        const cellsCreated = await this.seedDistrictCells(district);
        totalCreated += cellsCreated;

        this.logger.debug(
          `  ✓ ${district.nameKo}: ${cellsCreated} cells`,
        );
      }

      this.logger.log(
        `✅ Grid cells seeding completed! Total cells created: ${totalCreated}`,
      );
    } catch (error) {
      this.logger.error('❌ Error during grid cells seeding:', error);
      throw error;
    }
  }

  /**
   * Seed grid cells for a specific district
   */
  private async seedDistrictCells(district: Region): Promise<number> {
    const centerLat = Number(district.centerPointLat);
    const centerLng = Number(district.centerPointLng);

    // Get center H3 cell
    const centerH3 = latLngToCell(centerLat, centerLng, this.H3_RESOLUTION);

    // Get neighboring cells (k=2 means 2 rings of neighbors, ~1km radius)
    const h3Indices = gridDisk(centerH3, 2);

    let created = 0;

    for (const h3Index of h3Indices) {
      // Check if cell already exists
      const exists = await this.gridCellRepository.findOne({
        where: { h3Index },
      });

      if (exists) {
        continue;
      }

      // Get cell center coordinates
      const [cellLat, cellLng] = cellToLatLng(h3Index);

      // Get cell boundary
      const boundary = cellToBoundary(h3Index);

      // Convert boundary to WKT Polygon
      const boundaryCoords = boundary
        .map(([lat, lng]) => `${lng} ${lat}`)
        .join(', ');
      const firstCoord = `${boundary[0][1]} ${boundary[0][0]}`;
      const polygonWKT = `POLYGON((${boundaryCoords}, ${firstCoord}))`;

      // Create grid cell
      const cell = this.gridCellRepository.create({
        h3Index,
        resolution: this.H3_RESOLUTION,
        centerPointLat: cellLat,
        centerPointLng: cellLng,
        boundary: polygonWKT,
        regionId: district.id,
        userCount: 0,
        flyerCount: 0,
      });

      await this.gridCellRepository.save(cell);
      created++;
    }

    return created;
  }

  /**
   * Clear all grid cells
   */
  async clear(): Promise<void> {
    this.logger.log('Clearing all grid cells...');
    await this.gridCellRepository.delete({});
    this.logger.log('✅ All grid cells cleared');
  }

  /**
   * Get seeding statistics
   */
  async getStats(): Promise<{
    total: number;
    active: number;
  }> {
    const total = await this.gridCellRepository.count();
    const active = await this.gridCellRepository
      .createQueryBuilder('grid_cell')
      .where('grid_cell.user_count > 0 OR grid_cell.flyer_count > 0')
      .getCount();

    return { total, active };
  }
}
