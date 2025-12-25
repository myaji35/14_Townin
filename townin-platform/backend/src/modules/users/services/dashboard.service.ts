import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserHub } from '../entities/user-hub.entity';
import { UserPoints } from '../../points/entities/user-points.entity';
import { Flyer } from '../../flyers/flyer.entity';
import { DigitalSignboard } from '../../merchants/entities/digital-signboard.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(UserHub)
    private userHubRepository: Repository<UserHub>,
    @InjectRepository(UserPoints)
    private userPointsRepository: Repository<UserPoints>,
    @InjectRepository(Flyer)
    private flyerRepository: Repository<Flyer>,
    @InjectRepository(DigitalSignboard)
    private signboardRepository: Repository<DigitalSignboard>,
  ) {}

  /**
   * Get user home dashboard data
   */
  async getUserDashboard(userId: string): Promise<{
    points: {
      totalPoints: number;
      lifetimeEarned: number;
    };
    hubs: {
      totalHubs: number;
      hubs: Array<{ hubType: string; address: string }>;
    };
    nearbyFlyers: {
      total: number;
      new: number;
    };
    nearbySignboards: {
      total: number;
      open: number;
    };
  }> {
    // Get user points
    const userPoints = await this.userPointsRepository.findOne({
      where: { userId },
    });

    // Get user hubs
    const hubs = await this.userHubRepository.find({
      where: { userId },
      select: ['hubType', 'address'],
    });

    // Get user's H3 cells from hubs
    const h3CellIds = hubs.map((hub) => hub.h3CellId).filter(Boolean);

    // Count nearby flyers (approved and active)
    let nearbyFlyersTotal = 0;
    let nearbyFlyersNew = 0;

    if (h3CellIds.length > 0) {
      // Get merchants in user's areas
      const nearbyFlyers = await this.flyerRepository
        .createQueryBuilder('flyer')
        .leftJoin('flyer.merchant', 'merchant')
        .where('flyer.is_active = :isActive', { isActive: true })
        .andWhere('flyer.status = :status', { status: 'approved' })
        .andWhere('merchant.grid_cell IN (:...h3CellIds)', { h3CellIds })
        .getMany();

      nearbyFlyersTotal = nearbyFlyers.length;

      // Count new flyers (created within last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      nearbyFlyersNew = nearbyFlyers.filter(
        (f) => f.createdAt >= sevenDaysAgo,
      ).length;
    }

    // Count nearby signboards
    let nearbySignboardsTotal = 0;
    let nearbySignboardsOpen = 0;

    if (h3CellIds.length > 0) {
      const nearbySignboards = await this.signboardRepository
        .createQueryBuilder('signboard')
        .leftJoin('signboard.merchant', 'merchant')
        .where('signboard.is_active = :isActive', { isActive: true })
        .andWhere('merchant.grid_cell IN (:...h3CellIds)', { h3CellIds })
        .getMany();

      nearbySignboardsTotal = nearbySignboards.length;
      nearbySignboardsOpen = nearbySignboards.filter(
        (s) => s.status === 'open',
      ).length;
    }

    return {
      points: {
        totalPoints: userPoints?.totalPoints || 0,
        lifetimeEarned: userPoints?.lifetimeEarned || 0,
      },
      hubs: {
        totalHubs: hubs.length,
        hubs: hubs.map((h) => ({
          hubType: h.hubType,
          address: h.address,
        })),
      },
      nearbyFlyers: {
        total: nearbyFlyersTotal,
        new: nearbyFlyersNew,
      },
      nearbySignboards: {
        total: nearbySignboardsTotal,
        open: nearbySignboardsOpen,
      },
    };
  }

  /**
   * Get personalized recommendations
   */
  async getRecommendations(userId: string, limit: number = 10) {
    // Get user's H3 cells
    const hubs = await this.userHubRepository.find({
      where: { userId },
    });

    const h3CellIds = hubs.map((hub) => hub.h3CellId).filter(Boolean);

    if (h3CellIds.length === 0) {
      return { flyers: [], signboards: [] };
    }

    // Get recommended flyers (popular in user's areas)
    const recommendedFlyers = await this.flyerRepository
      .createQueryBuilder('flyer')
      .leftJoinAndSelect('flyer.merchant', 'merchant')
      .where('flyer.is_active = :isActive', { isActive: true })
      .andWhere('flyer.status = :status', { status: 'approved' })
      .andWhere('merchant.grid_cell IN (:...h3CellIds)', { h3CellIds })
      .orderBy('flyer.view_count', 'DESC')
      .addOrderBy('flyer.created_at', 'DESC')
      .take(limit)
      .getMany();

    // Get recommended signboards (open in user's areas)
    const recommendedSignboards = await this.signboardRepository
      .createQueryBuilder('signboard')
      .leftJoinAndSelect('signboard.merchant', 'merchant')
      .where('signboard.is_active = :isActive', { isActive: true })
      .andWhere('signboard.status = :status', { status: 'open' })
      .andWhere('merchant.grid_cell IN (:...h3CellIds)', { h3CellIds })
      .orderBy('signboard.total_views', 'DESC')
      .take(limit)
      .getMany();

    return {
      flyers: recommendedFlyers,
      signboards: recommendedSignboards,
    };
  }
}
