import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MerchantsController } from './merchants.controller';
import { MerchantsAdminController } from './controllers/merchants-admin.controller';
import {
  SignboardController,
  MerchantSignboardController,
} from './controllers/signboard.controller';
import { MerchantDashboardController } from './controllers/merchant-dashboard.controller';
import { MerchantsService } from './merchants.service';
import { SignboardService } from './services/signboard.service';
import { MerchantDashboardService } from './services/merchant-dashboard.service';
import { Merchant } from './merchant.entity';
import { DigitalSignboard } from './entities/digital-signboard.entity';
import { Flyer } from '../flyers/flyer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Merchant, DigitalSignboard, Flyer])],
  controllers: [
    MerchantsController,
    MerchantsAdminController,
    SignboardController,
    MerchantSignboardController,
    MerchantDashboardController,
  ],
  providers: [MerchantsService, SignboardService, MerchantDashboardService],
  exports: [MerchantsService, SignboardService, MerchantDashboardService],
})
export class MerchantsModule {}
