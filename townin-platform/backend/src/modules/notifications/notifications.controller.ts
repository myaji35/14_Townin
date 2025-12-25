import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { RegisterDeviceTokenDto } from './dto/register-device-token.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/user.entity';

@ApiTags('notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  /**
   * Register device token
   */
  @Post('device-tokens')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Register device token for push notifications' })
  @ApiResponse({ status: 201, description: 'Device token registered successfully' })
  async registerDeviceToken(
    @Body() dto: RegisterDeviceTokenDto,
    @CurrentUser() user: User,
  ) {
    const deviceToken = await this.notificationsService.registerDeviceToken(user.id, dto);

    return {
      id: deviceToken.id,
      platform: deviceToken.platform,
      deviceName: deviceToken.deviceName,
      isActive: deviceToken.isActive,
      createdAt: deviceToken.createdAt,
    };
  }

  /**
   * Delete device token
   */
  @Delete('device-tokens/:token')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete device token' })
  @ApiResponse({ status: 200, description: 'Device token deleted successfully' })
  async deleteDeviceToken(@Param('token') token: string, @CurrentUser() user: User) {
    await this.notificationsService.deleteDeviceToken(token, user.id);
    return { message: 'Device token deleted successfully' };
  }

  /**
   * Get my devices
   */
  @Get('devices')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get my registered devices' })
  @ApiResponse({ status: 200, description: 'Devices retrieved successfully' })
  async getMyDevices(@CurrentUser() user: User) {
    return this.notificationsService.getUserDevices(user.id);
  }

  /**
   * Get notification history
   */
  @Get('history')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get notification history' })
  @ApiResponse({ status: 200, description: 'Notification history retrieved successfully' })
  async getHistory(
    @CurrentUser() user: User,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.notificationsService.getNotificationHistory(user.id, page, limit);
  }

  /**
   * Get unread count
   */
  @Get('unread-count')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get unread notification count' })
  @ApiResponse({ status: 200, description: 'Unread count retrieved successfully' })
  async getUnreadCount(@CurrentUser() user: User) {
    const count = await this.notificationsService.getUnreadCount(user.id);
    return { count };
  }

  /**
   * Mark notification as read
   */
  @Patch(':id/read')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Mark notification as read' })
  @ApiResponse({ status: 200, description: 'Notification marked as read' })
  async markAsRead(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    await this.notificationsService.markAsRead(id, user.id);
    return { message: 'Notification marked as read' };
  }

  /**
   * Get notification preferences
   */
  @Get('preferences')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get notification preferences' })
  @ApiResponse({ status: 200, description: 'Preferences retrieved successfully' })
  async getPreferences(@CurrentUser() user: User) {
    return this.notificationsService.getOrCreatePreference(user.id);
  }

  /**
   * Update notification preferences
   */
  @Patch('preferences')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update notification preferences' })
  @ApiResponse({ status: 200, description: 'Preferences updated successfully' })
  async updatePreferences(@Body() updates: any, @CurrentUser() user: User) {
    return this.notificationsService.updatePreference(user.id, updates);
  }
}
