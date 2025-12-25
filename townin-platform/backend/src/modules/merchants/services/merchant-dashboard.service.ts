import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Merchant } from '../merchant.entity';
import { Flyer } from '../../flyers/flyer.entity';
import { DigitalSignboard } from '../entities/digital-signboard.entity';

@Injectable()
export class MerchantDashboardService {
  constructor(
    @InjectRepository(Merchant)
    private merchantRepository: Repository<Merchant>,
    @InjectRepository(Flyer)
    private flyerRepository: Repository<Flyer>,
    @InjectRepository(DigitalSignboard)
    private signboardRepository: Repository<DigitalSignboard>,
  ) {}

  /**
   * Get merchant dashboard overview
   */
  async getMerchantDashboard(userId: string): Promise<{
    merchant: {
      id: string;
      businessName: string;
      status: string;
      category: string;
    };
    flyers: {
      total: number;
      draft: number;
      pending: number;
      approved: number;
      totalViews: number;
      totalClicks: number;
    };
    signboard: {
      status: string;
      totalViews: number;
      totalClicks: number;
      clickThroughRate: number;
    } | null;
    performance: {
      totalReach: number;
      averageCTR: number;
      topPerformingFlyer: any;
    };
  }> {
    // Get merchant profile
    const merchant = await this.merchantRepository.findOne({
      where: { userId },
    });

    if (!merchant) {
      throw new NotFoundException('Merchant profile not found');
    }

    // Get flyer statistics
    const allFlyers = await this.flyerRepository.find({
      where: { merchantId: merchant.id, isActive: true },
    });

    const flyerStats = {
      total: allFlyers.length,
      draft: allFlyers.filter((f) => f.status === 'draft').length,
      pending: allFlyers.filter((f) => f.status === 'pending_approval').length,
      approved: allFlyers.filter((f) => f.status === 'approved').length,
      totalViews: allFlyers.reduce((sum, f) => sum + f.viewCount, 0),
      totalClicks: allFlyers.reduce((sum, f) => sum + f.clickCount, 0),
    };

    // Get signboard statistics
    const signboard = await this.signboardRepository.findOne({
      where: { merchantId: merchant.id },
    });

    let signboardStats = null;

    if (signboard) {
      const clickThroughRate =
        signboard.totalViews > 0
          ? (signboard.totalClicks / signboard.totalViews) * 100
          : 0;

      signboardStats = {
        status: signboard.status,
        totalViews: signboard.totalViews,
        totalClicks: signboard.totalClicks,
        clickThroughRate: parseFloat(clickThroughRate.toFixed(2)),
      };
    }

    // Calculate performance metrics
    const totalReach = flyerStats.totalViews + (signboard?.totalViews || 0);
    const totalClicks = flyerStats.totalClicks + (signboard?.totalClicks || 0);
    const averageCTR =
      totalReach > 0 ? (totalClicks / totalReach) * 100 : 0;

    // Find top performing flyer
    const topPerformingFlyer = allFlyers.reduce(
      (top, current) => {
        const currentCTR =
          current.viewCount > 0
            ? (current.clickCount / current.viewCount) * 100
            : 0;
        const topCTR =
          top && top.viewCount > 0
            ? (top.clickCount / top.viewCount) * 100
            : 0;

        return currentCTR > topCTR ? current : top;
      },
      null as Flyer | null,
    );

    return {
      merchant: {
        id: merchant.id,
        businessName: merchant.businessName,
        status: merchant.status,
        category: merchant.category,
      },
      flyers: flyerStats,
      signboard: signboardStats,
      performance: {
        totalReach,
        averageCTR: parseFloat(averageCTR.toFixed(2)),
        topPerformingFlyer: topPerformingFlyer
          ? {
              id: topPerformingFlyer.id,
              title: topPerformingFlyer.title,
              viewCount: topPerformingFlyer.viewCount,
              clickCount: topPerformingFlyer.clickCount,
              ctr: parseFloat(
                (
                  (topPerformingFlyer.clickCount /
                    topPerformingFlyer.viewCount) *
                  100
                ).toFixed(2),
              ),
            }
          : null,
      },
    };
  }

  /**
   * Get flyer performance analytics
   */
  async getFlyerAnalytics(
    merchantId: string,
    days: number = 30,
  ): Promise<{
    period: { start: Date; end: Date };
    totalViews: number;
    totalClicks: number;
    totalFlyers: number;
    topFlyers: Array<{
      id: string;
      title: string;
      views: number;
      clicks: number;
      ctr: number;
    }>;
  }> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const flyers = await this.flyerRepository
      .createQueryBuilder('flyer')
      .where('flyer.merchant_id = :merchantId', { merchantId })
      .andWhere('flyer.is_active = :isActive', { isActive: true })
      .andWhere('flyer.created_at >= :startDate', { startDate })
      .andWhere('flyer.created_at <= :endDate', { endDate })
      .getMany();

    const totalViews = flyers.reduce((sum, f) => sum + f.viewCount, 0);
    const totalClicks = flyers.reduce((sum, f) => sum + f.clickCount, 0);

    const topFlyers = flyers
      .map((f) => ({
        id: f.id,
        title: f.title,
        views: f.viewCount,
        clicks: f.clickCount,
        ctr: f.viewCount > 0 ? (f.clickCount / f.viewCount) * 100 : 0,
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 5)
      .map((f) => ({
        ...f,
        ctr: parseFloat(f.ctr.toFixed(2)),
      }));

    return {
      period: { start: startDate, end: endDate },
      totalViews,
      totalClicks,
      totalFlyers: flyers.length,
      topFlyers,
    };
  }

  /**
   * Get revenue estimation (based on flyer performance)
   */
  async getRevenueEstimation(merchantId: string): Promise<{
    estimatedReach: number;
    estimatedConversions: number;
    estimatedRevenue: number;
  }> {
    const flyers = await this.flyerRepository.find({
      where: { merchantId, isActive: true },
    });

    const totalViews = flyers.reduce((sum, f) => sum + f.viewCount, 0);
    const totalClicks = flyers.reduce((sum, f) => sum + f.clickCount, 0);
    const totalConversions = flyers.reduce(
      (sum, f) => sum + f.conversionCount,
      0,
    );
    const totalRevenue = flyers.reduce(
      (sum, f) => sum + Number(f.revenueGenerated),
      0,
    );

    // Estimation logic (simplified)
    // Assume 10% of clicks convert, average order value 30,000 KRW
    const estimatedConversions =
      totalConversions > 0 ? totalConversions : totalClicks * 0.1;
    const estimatedRevenue =
      totalRevenue > 0 ? totalRevenue : estimatedConversions * 30000;

    return {
      estimatedReach: totalViews,
      estimatedConversions: Math.round(estimatedConversions),
      estimatedRevenue: Math.round(estimatedRevenue),
    };
  }
}
