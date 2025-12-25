import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { FavoritesService } from './favorites.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('favorites')
@ApiBearerAuth()
@Controller('favorites')
@UseGuards(JwtAuthGuard)
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post(':flyerId')
  @ApiOperation({ summary: 'Add flyer to favorites' })
  async addFavorite(@Request() req, @Param('flyerId') flyerId: string) {
    const userId = req.user.userId;
    const favorite = await this.favoritesService.addFavorite(userId, flyerId);

    return {
      message: 'Added to favorites',
      favorite,
    };
  }

  @Delete(':flyerId')
  @ApiOperation({ summary: 'Remove flyer from favorites' })
  async removeFavorite(@Request() req, @Param('flyerId') flyerId: string) {
    const userId = req.user.userId;
    await this.favoritesService.removeFavorite(userId, flyerId);

    return {
      message: 'Removed from favorites',
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all favorite flyers' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getFavorites(
    @Request() req,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const userId = req.user.userId;
    return await this.favoritesService.getFavorites(
      userId,
      page ? parseInt(page.toString()) : 1,
      limit ? parseInt(limit.toString()) : 20,
    );
  }

  @Get('check/:flyerId')
  @ApiOperation({ summary: 'Check if flyer is favorited' })
  async checkFavorite(@Request() req, @Param('flyerId') flyerId: string) {
    const userId = req.user.userId;
    const isFavorited = await this.favoritesService.isFavorited(userId, flyerId);

    return {
      isFavorited,
    };
  }

  @Get('ids')
  @ApiOperation({ summary: 'Get all favorite flyer IDs' })
  async getFavoriteIds(@Request() req) {
    const userId = req.user.userId;
    const ids = await this.favoritesService.getFavoriteIds(userId);

    return {
      favoriteIds: ids,
    };
  }
}
