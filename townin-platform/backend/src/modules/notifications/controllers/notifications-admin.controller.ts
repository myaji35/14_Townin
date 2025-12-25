import { Controller, Post, Get, Body, Query, UseGuards } from '@nestjs/common';
import { NotificationsService } from '../notifications.service';
import { NotificationsGateway } from '../gateways/notifications.gateway';

export class BroadcastNotificationDto {
  title: string;
  body: string;
  targetType: 'all' | 'region' | 'role';
  targetRegionId?: string;
  targetRole?: string;
  data?: Record<string, any>;
}

/**
 * Admin Notification Management APIs
 * Requires super_admin role (TODO: Add RoleGuard)
 */
@Controller('admin/notifications')
// @UseGuards(JwtAuthGuard, RolesGuard)
// @Roles('super_admin')
export class NotificationsAdminController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  /**
   * Broadcast notification to users
   * POST /api/admin/notifications/broadcast
   */
  @Post('broadcast')
  async broadcast(@Body() dto: BroadcastNotificationDto) {
    // TODO: Implement target user selection based on targetType
    // For now, just broadcast via WebSocket

    if (dto.targetType === 'all') {
      this.notificationsGateway.broadcast('system_announcement', {
        title: dto.title,
        body: dto.body,
        data: dto.data,
      });
    } else if (dto.targetType === 'region' && dto.targetRegionId) {
      this.notificationsGateway.sendToRoom(`region:${dto.targetRegionId}`, 'system_announcement', {
        title: dto.title,
        body: dto.body,
        data: dto.data,
      });
    } else if (dto.targetType === 'role' && dto.targetRole) {
      this.notificationsGateway.sendToRoom(dto.targetRole, 'system_announcement', {
        title: dto.title,
        body: dto.body,
        data: dto.data,
      });
    }

    return {
      message: 'Notification broadcast initiated',
      estimatedRecipients: this.notificationsGateway.getConnectedClientsCount(),
    };
  }

  /**
   * Get notification statistics
   * GET /api/admin/notifications/stats
   */
  @Get('stats')
  async getStats(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    // TODO: Implement proper statistics aggregation
    return {
      totalSent: 0,
      totalFailed: 0,
      successRate: 0,
      avgDeliveryTime: 0,
      byType: {},
      byPlatform: {
        ios: 0,
        android: 0,
      },
      connectedClients: this.notificationsGateway.getConnectedClientsCount(),
    };
  }

  /**
   * Get WebSocket connection status
   * GET /api/admin/notifications/connections
   */
  @Get('connections')
  async getConnections() {
    return {
      connectedClients: this.notificationsGateway.getConnectedClientsCount(),
      timestamp: new Date().toISOString(),
    };
  }
}
