import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RegionsController } from './regions.controller';
import { RegionsService } from './regions.service';
import { Region } from './entities/region.entity';
import { UserRegion } from './user-region.entity';
import { User } from '../users/user.entity';
import { Flyer } from '../flyers/flyer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Region, UserRegion, User, Flyer])],
  controllers: [RegionsController],
  providers: [RegionsService],
  exports: [RegionsService],
})
export class RegionsModule {}
