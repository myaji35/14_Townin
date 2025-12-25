import {
  Controller,
  Post,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/enums/user-role.enum';
import { PointsService } from '../points.service';

@Controller('admin/points')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN)
export class PointsAdminController {
  constructor(private readonly pointsService: PointsService) {}

  /**
   * Admin: Grant points to user
   * POST /api/admin/points/:userId/grant
   */
  @Post(':userId/grant')
  async grantPoints(
    @Param('userId') userId: string,
    @Body() body: { amount: number; description: string },
  ) {
    const transaction = await this.pointsService.adminGrantPoints(
      userId,
      body.amount,
      body.description,
    );

    return {
      message: 'Points granted successfully',
      transaction,
    };
  }

  /**
   * Admin: Deduct points from user
   * POST /api/admin/points/:userId/deduct
   */
  @Post(':userId/deduct')
  async deductPoints(
    @Param('userId') userId: string,
    @Body() body: { amount: number; description: string },
  ) {
    const transaction = await this.pointsService.adminDeductPoints(
      userId,
      body.amount,
      body.description,
    );

    return {
      message: 'Points deducted successfully',
      transaction,
    };
  }
}
