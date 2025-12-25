import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { FlyerTargetArea } from '../entities/flyer-target-area.entity';
import { Flyer } from '../flyer.entity';
import { UserHub } from '../../users/entities/user-hub.entity';
import { SelectTargetAreasDto, TargetAreaEstimateDto } from '../dto/select-target-areas.dto';
import { latLngToCell, gridDisk, cellToBoundary } from 'h3-js';

@Injectable()
export class TargetAreaService {
  private readonly DEFAULT_H3_RESOLUTION = 9; // ~174m hexagons
  private readonly BASE_COST_PER_CELL = 100; // Base cost in points or currency

  constructor(
    @InjectRepository(FlyerTargetArea)
    private targetAreaRepository: Repository<FlyerTargetArea>,
    @InjectRepository(Flyer)
    private flyerRepository: Repository<Flyer>,
    @InjectRepository(UserHub)
    private userHubRepository: Repository<UserHub>,
  ) {}

  /**
   * Set target areas for a flyer
   */
  async setTargetAreas(
    flyerId: string,
    merchantId: string,
    dto: SelectTargetAreasDto,
  ): Promise<FlyerTargetArea[]> {
    // Verify flyer ownership
    const flyer = await this.flyerRepository.findOne({
      where: { id: flyerId, merchantId },
    });

    if (!flyer) {
      throw new NotFoundException('Flyer not found or access denied');
    }

    const resolution = dto.h3Resolution || this.DEFAULT_H3_RESOLUTION;

    // Delete existing target areas
    await this.targetAreaRepository.delete({ flyerId });

    // Create new target areas with estimated reach
    const targetAreas = await Promise.all(
      dto.h3CellIds.map(async (h3CellId) => {
        const estimatedReach = await this.estimateReachForCell(h3CellId);
        const costPerCell = this.calculateCostPerCell(estimatedReach);

        return this.targetAreaRepository.create({
          flyerId,
          h3CellId,
          h3Resolution: resolution,
          estimatedReach,
          costPerCell,
        });
      }),
    );

    return await this.targetAreaRepository.save(targetAreas);
  }

  /**
   * Get target areas for a flyer
   */
  async getTargetAreas(flyerId: string): Promise<FlyerTargetArea[]> {
    return await this.targetAreaRepository.find({
      where: { flyerId },
      order: { createdAt: 'ASC' },
    });
  }

  /**
   * Get estimated reach for target areas
   */
  async getTargetAreasWithEstimate(dto: TargetAreaEstimateDto): Promise<{
    h3CellIds: string[];
    totalCells: number;
    estimatedTotalReach: number;
    estimatedCost: number;
    centerCell: string;
  }> {
    const resolution = dto.h3Resolution || this.DEFAULT_H3_RESOLUTION;
    const radiusKm = dto.radiusKm || 1;

    // Convert center point to H3 cell
    const centerCell = latLngToCell(dto.lat, dto.lng, resolution);

    // Calculate k-ring based on radius
    // H3 resolution 9: ~174m per cell edge, so k = radiusKm * 1000 / 174
    const k = Math.ceil((radiusKm * 1000) / 174);

    // Get all cells within radius using k-ring
    const h3CellIds = gridDisk(centerCell, k);

    // Calculate estimated reach and cost
    const estimates = await Promise.all(
      h3CellIds.map((cellId) => this.estimateReachForCell(cellId)),
    );

    const estimatedTotalReach = estimates.reduce((sum, reach) => sum + reach, 0);
    const estimatedCost = h3CellIds.length * this.BASE_COST_PER_CELL;

    return {
      h3CellIds,
      totalCells: h3CellIds.length,
      estimatedTotalReach,
      estimatedCost,
      centerCell,
    };
  }

  /**
   * Get H3 cells with boundaries (for map rendering)
   */
  async getCellBoundaries(h3CellIds: string[]): Promise<
    Array<{
      h3CellId: string;
      boundary: Array<[number, number]>;
      estimatedReach: number;
    }>
  > {
    return await Promise.all(
      h3CellIds.map(async (h3CellId) => {
        const boundary = cellToBoundary(h3CellId);
        const estimatedReach = await this.estimateReachForCell(h3CellId);

        return {
          h3CellId,
          boundary: boundary.map(([lat, lng]) => [lat, lng]),
          estimatedReach,
        };
      }),
    );
  }

  /**
   * Estimate number of users in a H3 cell
   * (Based on UserHub data)
   */
  private async estimateReachForCell(h3CellId: string): Promise<number> {
    // Count users who have a hub in this H3 cell
    const count = await this.userHubRepository.count({
      where: { h3CellId },
    });

    // Apply multiplier for total population estimate
    // Assuming registered users are ~10% of actual population
    const populationMultiplier = 10;

    return count * populationMultiplier;
  }

  /**
   * Calculate cost based on estimated reach
   */
  private calculateCostPerCell(estimatedReach: number): number {
    // Base cost + dynamic pricing based on reach
    const baseCost = this.BASE_COST_PER_CELL;
    const reachFactor = Math.floor(estimatedReach / 100) * 10; // +10 per 100 users

    return baseCost + reachFactor;
  }

  /**
   * Get popular target areas (most used H3 cells)
   */
  async getPopularTargetAreas(limit: number = 10): Promise<
    Array<{
      h3CellId: string;
      usageCount: number;
      avgEstimatedReach: number;
    }>
  > {
    const result = await this.targetAreaRepository
      .createQueryBuilder('target')
      .select('target.h3_cell_id', 'h3CellId')
      .addSelect('COUNT(*)', 'usageCount')
      .addSelect('AVG(target.estimated_reach)', 'avgEstimatedReach')
      .groupBy('target.h3_cell_id')
      .orderBy('COUNT(*)', 'DESC')
      .limit(limit)
      .getRawMany();

    return result.map((r) => ({
      h3CellId: r.h3CellId,
      usageCount: parseInt(r.usageCount, 10),
      avgEstimatedReach: Math.round(parseFloat(r.avgEstimatedReach)),
    }));
  }

  /**
   * Get total reach for a flyer
   */
  async getTotalReachForFlyer(flyerId: string): Promise<{
    totalCells: number;
    estimatedTotalReach: number;
    estimatedTotalCost: number;
  }> {
    const targetAreas = await this.getTargetAreas(flyerId);

    const totalCells = targetAreas.length;
    const estimatedTotalReach = targetAreas.reduce(
      (sum, area) => sum + area.estimatedReach,
      0,
    );
    const estimatedTotalCost = targetAreas.reduce(
      (sum, area) => sum + Number(area.costPerCell),
      0,
    );

    return {
      totalCells,
      estimatedTotalReach,
      estimatedTotalCost,
    };
  }
}
