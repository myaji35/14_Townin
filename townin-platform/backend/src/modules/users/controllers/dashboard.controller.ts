import { Controller, Get, UseGuards, Request, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { DashboardService } from '../services/dashboard.service';

@Controller('users/me/dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  /**
   * Get user dashboard summary
   * GET /api/users/me/dashboard
   */
  @Get()
  async getDashboard(@Request() req) {
    return await this.dashboardService.getUserDashboard(req.user.sub);
  }

  /**
   * Get personalized recommendations
   * GET /api/users/me/dashboard/recommendations
   */
  @Get('recommendations')
  async getRecommendations(
    @Request() req,
    @Query('limit') limit?: number,
  ) {
    return await this.dashboardService.getRecommendations(
      req.user.sub,
      limit ? parseInt(limit.toString()) : 10,
    );
  }
}
