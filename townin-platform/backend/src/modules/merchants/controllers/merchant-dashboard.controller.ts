import { Controller, Get, UseGuards, Request, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { MerchantDashboardService } from '../services/merchant-dashboard.service';

@Controller('merchants/me/dashboard')
@UseGuards(JwtAuthGuard)
export class MerchantDashboardController {
  constructor(
    private readonly merchantDashboardService: MerchantDashboardService,
  ) {}

  /**
   * Get merchant dashboard overview
   * GET /api/merchants/me/dashboard
   */
  @Get()
  async getDashboard(@Request() req) {
    return await this.merchantDashboardService.getMerchantDashboard(
      req.user.sub,
    );
  }

  /**
   * Get flyer analytics
   * GET /api/merchants/me/dashboard/flyers/analytics
   */
  @Get('flyers/analytics')
  async getFlyerAnalytics(
    @Request() req,
    @Query('days') days?: number,
  ) {
    // TODO: Get merchantId from merchant profile
    const merchant = await this.merchantDashboardService.getMerchantDashboard(
      req.user.sub,
    );

    return await this.merchantDashboardService.getFlyerAnalytics(
      merchant.merchant.id,
      days ? parseInt(days.toString()) : 30,
    );
  }

  /**
   * Get revenue estimation
   * GET /api/merchants/me/dashboard/revenue
   */
  @Get('revenue')
  async getRevenueEstimation(@Request() req) {
    const merchant = await this.merchantDashboardService.getMerchantDashboard(
      req.user.sub,
    );

    return await this.merchantDashboardService.getRevenueEstimation(
      merchant.merchant.id,
    );
  }
}
