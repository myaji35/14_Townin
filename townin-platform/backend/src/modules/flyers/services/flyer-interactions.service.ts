import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FlyerLike } from '../entities/flyer-like.entity';
import { FlyerBookmark } from '../entities/flyer-bookmark.entity';
import { Flyer } from '../flyer.entity';

@Injectable()
export class FlyerInteractionsService {
  constructor(
    @InjectRepository(FlyerLike)
    private flyerLikeRepository: Repository<FlyerLike>,
    @InjectRepository(FlyerBookmark)
    private flyerBookmarkRepository: Repository<FlyerBookmark>,
    @InjectRepository(Flyer)
    private flyerRepository: Repository<Flyer>,
  ) {}

  // =====================================
  // Likes
  // =====================================

  /**
   * Like a flyer
   */
  async likeFlyer(userId: string, flyerId: string): Promise<FlyerLike> {
    // Check if flyer exists
    const flyer = await this.flyerRepository.findOne({
      where: { id: flyerId, isActive: true },
    });

    if (!flyer) {
      throw new NotFoundException('Flyer not found');
    }

    // Check if already liked
    const existing = await this.flyerLikeRepository.findOne({
      where: { userId, flyerId },
    });

    if (existing) {
      throw new ConflictException('You have already liked this flyer');
    }

    // Create like
    const like = this.flyerLikeRepository.create({
      userId,
      flyerId,
    });

    return await this.flyerLikeRepository.save(like);
  }

  /**
   * Unlike a flyer
   */
  async unlikeFlyer(userId: string, flyerId: string): Promise<void> {
    const like = await this.flyerLikeRepository.findOne({
      where: { userId, flyerId },
    });

    if (!like) {
      throw new NotFoundException('Like not found');
    }

    await this.flyerLikeRepository.remove(like);
  }

  /**
   * Check if user liked a flyer
   */
  async hasUserLiked(userId: string, flyerId: string): Promise<boolean> {
    const count = await this.flyerLikeRepository.count({
      where: { userId, flyerId },
    });

    return count > 0;
  }

  /**
   * Get like count for a flyer
   */
  async getLikeCount(flyerId: string): Promise<number> {
    return await this.flyerLikeRepository.count({
      where: { flyerId },
    });
  }

  /**
   * Get user's liked flyers
   */
  async getUserLikedFlyers(
    userId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ data: Flyer[]; total: number }> {
    const skip = (page - 1) * limit;

    const [likes, total] = await this.flyerLikeRepository.findAndCount({
      where: { userId },
      relations: ['flyer', 'flyer.merchant'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    const data = likes.map((like) => like.flyer).filter((f) => f.isActive);

    return { data, total };
  }

  // =====================================
  // Bookmarks
  // =====================================

  /**
   * Bookmark a flyer
   */
  async bookmarkFlyer(userId: string, flyerId: string): Promise<FlyerBookmark> {
    // Check if flyer exists
    const flyer = await this.flyerRepository.findOne({
      where: { id: flyerId, isActive: true },
    });

    if (!flyer) {
      throw new NotFoundException('Flyer not found');
    }

    // Check if already bookmarked
    const existing = await this.flyerBookmarkRepository.findOne({
      where: { userId, flyerId },
    });

    if (existing) {
      throw new ConflictException('You have already bookmarked this flyer');
    }

    // Create bookmark
    const bookmark = this.flyerBookmarkRepository.create({
      userId,
      flyerId,
    });

    return await this.flyerBookmarkRepository.save(bookmark);
  }

  /**
   * Remove bookmark from a flyer
   */
  async unbookmarkFlyer(userId: string, flyerId: string): Promise<void> {
    const bookmark = await this.flyerBookmarkRepository.findOne({
      where: { userId, flyerId },
    });

    if (!bookmark) {
      throw new NotFoundException('Bookmark not found');
    }

    await this.flyerBookmarkRepository.remove(bookmark);
  }

  /**
   * Check if user bookmarked a flyer
   */
  async hasUserBookmarked(userId: string, flyerId: string): Promise<boolean> {
    const count = await this.flyerBookmarkRepository.count({
      where: { userId, flyerId },
    });

    return count > 0;
  }

  /**
   * Get bookmark count for a flyer
   */
  async getBookmarkCount(flyerId: string): Promise<number> {
    return await this.flyerBookmarkRepository.count({
      where: { flyerId },
    });
  }

  /**
   * Get user's bookmarked flyers
   */
  async getUserBookmarkedFlyers(
    userId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ data: Flyer[]; total: number }> {
    const skip = (page - 1) * limit;

    const [bookmarks, total] = await this.flyerBookmarkRepository.findAndCount({
      where: { userId },
      relations: ['flyer', 'flyer.merchant'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    const data = bookmarks.map((bm) => bm.flyer).filter((f) => f.isActive);

    return { data, total };
  }

  /**
   * Get flyer with interaction status for a user
   */
  async getFlyerInteractionStatus(
    userId: string,
    flyerId: string,
  ): Promise<{
    isLiked: boolean;
    isBookmarked: boolean;
    likeCount: number;
    bookmarkCount: number;
  }> {
    const [isLiked, isBookmarked, likeCount, bookmarkCount] = await Promise.all([
      this.hasUserLiked(userId, flyerId),
      this.hasUserBookmarked(userId, flyerId),
      this.getLikeCount(flyerId),
      this.getBookmarkCount(flyerId),
    ]);

    return {
      isLiked,
      isBookmarked,
      likeCount,
      bookmarkCount,
    };
  }
}
