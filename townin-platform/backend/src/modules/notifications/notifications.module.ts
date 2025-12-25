import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { NotificationsController } from './notifications.controller';
import { NotificationsAdminController } from './controllers/notifications-admin.controller';
import { NotificationsService } from './notifications.service';
import { DeviceToken } from './entities/device-token.entity';
import { NotificationLog } from './entities/notification-log.entity';
import { NotificationPreference } from './entities/notification-preference.entity';
import { NotificationTemplate } from './entities/notification-template.entity';
import { NotificationsGateway } from './gateways/notifications.gateway';
import { PushService } from './services/push.service';
import { NotificationListener } from './listeners/notification.listener';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DeviceToken,
      NotificationLog,
      NotificationPreference,
      NotificationTemplate,
    ]),
    ConfigModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [NotificationsController, NotificationsAdminController],
  providers: [
    NotificationsService,
    NotificationsGateway,
    PushService,
    NotificationListener,
  ],
  exports: [NotificationsService, NotificationsGateway],
})
export class NotificationsModule {}
