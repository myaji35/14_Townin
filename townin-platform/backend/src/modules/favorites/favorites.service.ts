import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FavoriteFlyer } from './favorite.entity';
import { Flyer } from '../flyers/flyer.entity';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(FavoriteFlyer)
    private favoriteRepository: Repository<FavoriteFlyer>,
    @InjectRepository(Flyer)
    private flyerRepository: Repository<Flyer>,
  ) {}

  /**
   * Add flyer to favorites
   */
  async addFavorite(userId: string, flyerId: string): Promise<FavoriteFlyer> {
    // Check if flyer exists
    const flyer = await this.flyerRepository.findOne({
      where: { id: flyerId, isActive: true },
    });

    if (!flyer) {
      throw new NotFoundException('Flyer not found');
    }

    // Check if already favorited
    const existing = await this.favoriteRepository.findOne({
      where: { userId, flyerId },
    });

    if (existing) {
      throw new ConflictException('Flyer already in favorites');
    }

    const favorite = this.favoriteRepository.create({
      userId,
      flyerId,
    });

    return await this.favoriteRepository.save(favorite);
  }

  /**
   * Remove flyer from favorites
   */
  async removeFavorite(userId: string, flyerId: string): Promise<void> {
    const favorite = await this.favoriteRepository.findOne({
      where: { userId, flyerId },
    });

    if (!favorite) {
      throw new NotFoundException('Favorite not found');
    }

    await this.favoriteRepository.remove(favorite);
  }

  /**
   * Get all favorites for user
   */
  async getFavorites(
    userId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ data: Flyer[]; total: number }> {
    const skip = (page - 1) * limit;

    const [favorites, total] = await this.favoriteRepository
      .createQueryBuilder('favorite')
      .leftJoinAndSelect('favorite.flyer', 'flyer')
      .leftJoinAndSelect('flyer.merchant', 'merchant')
      .where('favorite.user_id = :userId', { userId })
      .andWhere('flyer.is_active = :isActive', { isActive: true })
      .andWhere('flyer.deleted_at IS NULL')
      .orderBy('favorite.created_at', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const data = favorites.map((f) => f.flyer);

    return { data, total };
  }

  /**
   * Check if flyer is favorited by user
   */
  async isFavorited(userId: string, flyerId: string): Promise<boolean> {
    const favorite = await this.favoriteRepository.findOne({
      where: { userId, flyerId },
    });

    return !!favorite;
  }

  /**
   * Get favorite IDs for user (for batch checking)
   */
  async getFavoriteIds(userId: string): Promise<string[]> {
    const favorites = await this.favoriteRepository.find({
      where: { userId },
      select: ['flyerId'],
    });

    return favorites.map((f) => f.flyerId);
  }

  /**
   * Get favorite count for flyer
   */
  async getFavoriteCount(flyerId: string): Promise<number> {
    return await this.favoriteRepository.count({
      where: { flyerId },
    });
  }
}
