import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PointsService } from './points.service';
import { EarnPointsDto } from './dto/earn-points.dto';
import { SpendPointsDto } from './dto/spend-points.dto';

@Controller('points')
@UseGuards(JwtAuthGuard)
export class PointsController {
  constructor(private readonly pointsService: PointsService) {}

  /**
   * Get user's points balance
   * GET /api/points/balance
   */
  @Get('balance')
  async getBalance(@Request() req) {
    const userPoints = await this.pointsService.getUserPoints(req.user.sub);
    return {
      totalPoints: userPoints.totalPoints,
      lifetimeEarned: userPoints.lifetimeEarned,
      lifetimeSpent: userPoints.lifetimeSpent,
    };
  }

  /**
   * Get points summary
   * GET /api/points/summary
   */
  @Get('summary')
  async getSummary(@Request() req) {
    return await this.pointsService.getPointsSummary(req.user.sub);
  }

  /**
   * Get transaction history
   * GET /api/points/transactions
   */
  @Get('transactions')
  async getTransactionHistory(
    @Request() req,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return await this.pointsService.getTransactionHistory(
      req.user.sub,
      page || 1,
      limit || 20,
    );
  }

  /**
   * Earn points (internal use - called by other services via EventEmitter)
   * POST /api/points/earn
   */
  @Post('earn')
  async earnPoints(@Request() req, @Body() dto: EarnPointsDto) {
    const transaction = await this.pointsService.earnPoints(
      req.user.sub,
      dto,
    );
    return {
      message: 'Points earned successfully',
      transaction,
    };
  }

  /**
   * Spend points
   * POST /api/points/spend
   */
  @Post('spend')
  async spendPoints(@Request() req, @Body() dto: SpendPointsDto) {
    const transaction = await this.pointsService.spendPoints(
      req.user.sub,
      dto,
    );
    return {
      message: 'Points spent successfully',
      transaction,
    };
  }
}
