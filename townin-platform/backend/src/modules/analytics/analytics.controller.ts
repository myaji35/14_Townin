import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AnalyticsService, TrackEventDto } from './analytics.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/user.entity';
import { Request } from 'express';

@ApiTags('analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  /**
   * Track event
   */
  @Post('events')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Track analytics event' })
  @ApiResponse({ status: 201, description: 'Event tracked successfully' })
  async trackEvent(
    @Body() dto: TrackEventDto,
    @CurrentUser() user: User,
    @Req() req: Request,
  ) {
    const event = await this.analyticsService.trackEvent({
      ...dto,
      userId: user?.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    return {
      id: event.id,
      eventType: event.eventType,
      createdAt: event.createdAt,
    };
  }

  /**
   * Get DAU/MAU (Admin only)
   */
  @Get('dau-mau')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get DAU/MAU statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getDauMau(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    return this.analyticsService.getStats(start, end);
  }

  /**
   * Get event counts
   */
  @Get('events/counts')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get event counts by type' })
  @ApiResponse({ status: 200, description: 'Event counts retrieved successfully' })
  async getEventCounts(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    return this.analyticsService.getEventCounts(start, end);
  }
}
