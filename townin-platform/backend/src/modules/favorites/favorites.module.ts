import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FavoritesController } from './favorites.controller';
import { FavoritesService } from './favorites.service';
import { FavoriteFlyer } from './favorite.entity';
import { Flyer } from '../flyers/flyer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FavoriteFlyer, Flyer])],
  controllers: [FavoritesController],
  providers: [FavoritesService],
  exports: [FavoritesService],
})
export class FavoritesModule {}
