import {
  Controller,
  Put,
  Delete,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateFcmTokenDto } from './dto/update-fcm-token.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Put('fcm-token')
  async updateFcmToken(@Request() req, @Body() dto: UpdateFcmTokenDto) {
    const user = await this.usersService.updateFcmToken(
      req.user.userId,
      dto.fcmToken,
    );
    return {
      message: 'FCM token updated successfully',
      fcmToken: user.fcmToken,
    };
  }

  @Delete('fcm-token')
  async removeFcmToken(@Request() req) {
    await this.usersService.removeFcmToken(req.user.userId);
    return {
      message: 'FCM token removed successfully',
    };
  }
}
