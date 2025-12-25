import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserHub } from './entities/user-hub.entity';
import { FamilyMember } from './entities/family-member.entity';
import { UserPoints } from '../points/entities/user-points.entity';
import { Flyer } from '../flyers/flyer.entity';
import { DigitalSignboard } from '../merchants/entities/digital-signboard.entity';
import { UsersService } from './users.service';
import { UserHubsService } from './services/user-hubs.service';
import { FamilyMembersService } from './services/family-members.service';
import { DashboardService } from './services/dashboard.service';
import { UsersController } from './users.controller';
import { UserHubsController } from './controllers/user-hubs.controller';
import { FamilyMembersController } from './controllers/family-members.controller';
import { DashboardController } from './controllers/dashboard.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      UserHub,
      FamilyMember,
      UserPoints,
      Flyer,
      DigitalSignboard,
    ]),
  ],
  controllers: [
    UsersController,
    UserHubsController,
    FamilyMembersController,
    DashboardController,
  ],
  providers: [
    UsersService,
    UserHubsService,
    FamilyMembersService,
    DashboardService,
  ],
  exports: [
    TypeOrmModule,
    UsersService,
    UserHubsService,
    FamilyMembersService,
    DashboardService,
  ],
})
export class UsersModule {}
