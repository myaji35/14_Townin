import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AdminDashboardController } from './controllers/admin-dashboard.controller';
import { AdminManagementController } from './controllers/admin-management.controller';
import { AdminDashboardService } from './services/admin-dashboard.service';
import { AdminManagementService } from './services/admin-management.service';
import { User } from '../users/user.entity';
import { Merchant } from '../merchants/merchant.entity';
import { Flyer } from '../flyers/flyer.entity';
import { PointTransaction } from '../points/entities/point-transaction.entity';
import { UserPoints } from '../points/entities/user-points.entity';
import { AnalyticsEvent } from '../analytics/entities/analytics-event.entity';
import { PointsModule } from '../points/points.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Merchant,
      Flyer,
      PointTransaction,
      UserPoints,
      AnalyticsEvent,
    ]),
    PointsModule,
  ],
  controllers: [
    AdminController,
    AdminDashboardController,
    AdminManagementController,
  ],
  providers: [
    AdminService,
    AdminDashboardService,
    AdminManagementService,
  ],
  exports: [
    AdminService,
    AdminDashboardService,
    AdminManagementService,
  ],
})
export class AdminModule {}
