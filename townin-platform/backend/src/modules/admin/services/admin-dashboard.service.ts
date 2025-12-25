import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/user.entity';
import { Merchant } from '../../merchants/merchant.entity';
import { Flyer, FlyerStatus } from '../../flyers/flyer.entity';
import { PointTransaction } from '../../points/entities/point-transaction.entity';
import { AnalyticsEvent } from '../../analytics/entities/analytics-event.entity';
import { UserRole } from '../../../common/enums/user-role.enum';

@Injectable()
export class AdminDashboardService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Merchant)
    private readonly merchantRepository: Repository<Merchant>,
    @InjectRepository(Flyer)
    private readonly flyerRepository: Repository<Flyer>,
    @InjectRepository(PointTransaction)
    private readonly pointTransactionRepository: Repository<PointTransaction>,
    @InjectRepository(AnalyticsEvent)
    private readonly analyticsEventRepository: Repository<AnalyticsEvent>,
  ) {}

  /**
   * Get comprehensive admin dashboard statistics
   */
  async getDashboardStats() {
    const [
      userStats,
      merchantStats,
      flyerStats,
      pointsStats,
      todayActivity,
    ] = await Promise.all([
      this.getUserStats(),
      this.getMerchantStats(),
      this.getFlyerStats(),
      this.getPointsStats(),
      this.getTodayActivity(),
    ]);

    return {
      users: userStats,
      merchants: merchantStats,
      flyers: flyerStats,
      points: pointsStats,
      activity: todayActivity,
      timestamp: new Date(),
    };
  }

  /**
   * Get user statistics
   */
  private async getUserStats() {
    const totalUsers = await this.userRepository.count();
    const activeUsers = await this.userRepository.count({
      where: { isActive: true },
    });

    // Users by role
    const [regularUsers, merchantUsers, adminUsers] = await Promise.all([
      this.userRepository.count({ where: { role: UserRole.USER } }),
      this.userRepository.count({ where: { role: UserRole.MERCHANT } }),
      this.userRepository.count({ where: { role: UserRole.SUPER_ADMIN } }),
    ]);

    // New users in last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const newUsers = await this.userRepository.count({
      where: {
        createdAt: new Date(sevenDaysAgo.getTime()),
      },
    });

    return {
      total: totalUsers,
      active: activeUsers,
      verified: activeUsers, // Using active users as proxy for verified
      byRole: {
        users: regularUsers,
        merchants: merchantUsers,
        admins: adminUsers,
      },
      newInLast7Days: newUsers,
    };
  }

  /**
   * Get merchant statistics
   */
  private async getMerchantStats() {
    const totalMerchants = await this.merchantRepository.count();

    // Merchants with open signboards
    const openSignboards = await this.merchantRepository.count({
      where: { signboardStatus: 'open' },
    });

    return {
      total: totalMerchants,
      verified: totalMerchants, // All merchants considered verified for now
      pending: 0,
      withOpenSignboards: openSignboards,
    };
  }

  /**
   * Get flyer statistics
   */
  private async getFlyerStats() {
    const totalFlyers = await this.flyerRepository.count();

    // Flyers by status
    const [draft, pending, approved, rejected, expired] = await Promise.all([
      this.flyerRepository.count({ where: { status: FlyerStatus.DRAFT } }),
      this.flyerRepository.count({ where: { status: FlyerStatus.PENDING_APPROVAL } }),
      this.flyerRepository.count({ where: { status: FlyerStatus.APPROVED } }),
      this.flyerRepository.count({ where: { status: FlyerStatus.REJECTED } }),
      this.flyerRepository.count({ where: { status: FlyerStatus.EXPIRED } }),
    ]);

    // Active flyers
    const activeFlyers = await this.flyerRepository.count({
      where: { isActive: true, status: FlyerStatus.APPROVED },
    });

    // Total engagement metrics
    const engagementMetrics = await this.flyerRepository
      .createQueryBuilder('flyer')
      .select('SUM(flyer.view_count)', 'totalViews')
      .addSelect('SUM(flyer.click_count)', 'totalClicks')
      .addSelect('SUM(flyer.share_count)', 'totalShares')
      .getRawOne();

    return {
      total: totalFlyers,
      active: activeFlyers,
      byStatus: { draft, pending, approved, rejected, expired },
      engagement: {
        totalViews: parseInt(engagementMetrics.totalViews) || 0,
        totalClicks: parseInt(engagementMetrics.totalClicks) || 0,
        totalShares: parseInt(engagementMetrics.totalShares) || 0,
      },
    };
  }

  /**
   * Get points statistics
   */
  private async getPointsStats() {
    const pointsMetrics = await this.pointTransactionRepository
      .createQueryBuilder('pt')
      .select('COUNT(*)', 'totalTransactions')
      .addSelect(
        `SUM(CASE WHEN pt.type = 'earned' THEN pt.amount ELSE 0 END)`,
        'totalEarned',
      )
      .addSelect(
        `SUM(CASE WHEN pt.type = 'spent' THEN pt.amount ELSE 0 END)`,
        'totalSpent',
      )
      .addSelect(
        `SUM(CASE WHEN pt.type = 'expired' THEN pt.amount ELSE 0 END)`,
        'totalExpired',
      )
      .getRawOne();

    return {
      totalTransactions: parseInt(pointsMetrics.totalTransactions) || 0,
      totalEarned: parseInt(pointsMetrics.totalEarned) || 0,
      totalSpent: parseInt(pointsMetrics.totalSpent) || 0,
      totalExpired: parseInt(pointsMetrics.totalExpired) || 0,
    };
  }

  /**
   * Get today's activity
   */
  private async getTodayActivity() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // New users today
    const newUsersToday = await this.userRepository.count({
      where: {
        createdAt: new Date(today.getTime()),
      },
    });

    // New flyers today
    const newFlyersToday = await this.flyerRepository.count({
      where: {
        createdAt: new Date(today.getTime()),
      },
    });

    // Points earned today
    const pointsEarnedToday = await this.pointTransactionRepository
      .createQueryBuilder('pt')
      .select('SUM(pt.amount)', 'total')
      .where('pt.type = :type', { type: 'earned' })
      .andWhere('pt.created_at >= :today', { today })
      .getRawOne();

    // Events today
    const eventsToday = await this.analyticsEventRepository.count({
      where: {
        createdAt: new Date(today.getTime()),
      },
    });

    return {
      newUsers: newUsersToday,
      newFlyers: newFlyersToday,
      pointsEarned: parseInt(pointsEarnedToday?.total) || 0,
      analyticsEvents: eventsToday,
    };
  }

  /**
   * Get DAU/MAU metrics (Daily/Monthly Active Users)
   */
  async getActiveUserMetrics() {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // DAU - users who logged in last 24 hours
    const dau = await this.userRepository.count({
      where: {
        lastLoginAt: new Date(oneDayAgo.getTime()),
      },
    });

    // MAU - users who logged in last 30 days
    const mau = await this.userRepository.count({
      where: {
        lastLoginAt: new Date(thirtyDaysAgo.getTime()),
      },
    });

    // DAU/MAU ratio (stickiness)
    const stickiness = mau > 0 ? (dau / mau) * 100 : 0;

    return {
      dau,
      mau,
      stickiness: parseFloat(stickiness.toFixed(2)),
    };
  }

  /**
   * Get regional statistics
   */
  async getRegionalStats() {
    // Get merchant distribution by grid cell
    const merchantsByRegion = await this.merchantRepository
      .createQueryBuilder('merchant')
      .select('merchant.grid_cell', 'gridCell')
      .addSelect('COUNT(*)', 'count')
      .where('merchant.grid_cell IS NOT NULL')
      .groupBy('merchant.grid_cell')
      .orderBy('count', 'DESC')
      .limit(10)
      .getRawMany();

    // Get flyer views by merchant region
    const flyerViewsByRegion = await this.flyerRepository
      .createQueryBuilder('flyer')
      .leftJoin('flyer.merchant', 'merchant')
      .select('merchant.grid_cell', 'gridCell')
      .addSelect('SUM(flyer.view_count)', 'totalViews')
      .addSelect('SUM(flyer.click_count)', 'totalClicks')
      .where('merchant.grid_cell IS NOT NULL')
      .groupBy('merchant.grid_cell')
      .orderBy('totalViews', 'DESC')
      .limit(10)
      .getRawMany();

    return {
      topMerchantRegions: merchantsByRegion.map((r) => ({
        gridCell: r.gridCell,
        merchantCount: parseInt(r.count),
      })),
      topEngagementRegions: flyerViewsByRegion.map((r) => ({
        gridCell: r.gridCell,
        totalViews: parseInt(r.totalViews) || 0,
        totalClicks: parseInt(r.totalClicks) || 0,
      })),
    };
  }
}
