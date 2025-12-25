import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { AdminDashboardService } from '../services/admin-dashboard.service';
import { UserRole } from '../../../common/enums/user-role.enum';

@ApiTags('admin')
@ApiBearerAuth('JWT-auth')
@Controller('admin/dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN)
export class AdminDashboardController {
  constructor(private readonly dashboardService: AdminDashboardService) {}

  @Get('stats')
  @ApiOperation({
    summary: 'Get comprehensive admin dashboard statistics',
    description:
      'Returns complete overview including users, merchants, flyers, points, and activity metrics',
  })
  @ApiResponse({
    status: 200,
    description: 'Dashboard statistics retrieved successfully',
  })
  async getDashboardStats() {
    return await this.dashboardService.getDashboardStats();
  }

  @Get('active-users')
  @ApiOperation({
    summary: 'Get DAU/MAU metrics',
    description: 'Returns Daily Active Users and Monthly Active Users with stickiness ratio',
  })
  @ApiResponse({
    status: 200,
    description: 'Active user metrics retrieved successfully',
  })
  async getActiveUserMetrics() {
    return await this.dashboardService.getActiveUserMetrics();
  }

  @Get('regional-stats')
  @ApiOperation({
    summary: 'Get regional statistics',
    description: 'Returns merchant and engagement distribution by H3 grid cells',
  })
  @ApiResponse({
    status: 200,
    description: 'Regional statistics retrieved successfully',
  })
  async getRegionalStats() {
    return await this.dashboardService.getRegionalStats();
  }
}
