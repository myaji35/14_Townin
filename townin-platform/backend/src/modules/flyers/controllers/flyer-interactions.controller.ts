import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { FlyerInteractionsService } from '../services/flyer-interactions.service';

@Controller('flyers')
@UseGuards(JwtAuthGuard)
export class FlyerInteractionsController {
  constructor(
    private readonly flyerInteractionsService: FlyerInteractionsService,
  ) {}

  // =====================================
  // Likes
  // =====================================

  /**
   * Like a flyer
   * POST /api/flyers/:id/like
   */
  @Post(':id/like')
  async likeFlyer(@Request() req, @Param('id') flyerId: string) {
    const like = await this.flyerInteractionsService.likeFlyer(
      req.user.sub,
      flyerId,
    );
    return { message: 'Flyer liked successfully', like };
  }

  /**
   * Unlike a flyer
   * DELETE /api/flyers/:id/like
   */
  @Delete(':id/like')
  async unlikeFlyer(@Request() req, @Param('id') flyerId: string) {
    await this.flyerInteractionsService.unlikeFlyer(req.user.sub, flyerId);
    return { message: 'Flyer unliked successfully' };
  }

  /**
   * Get like count for a flyer
   * GET /api/flyers/:id/likes/count
   */
  @Get(':id/likes/count')
  async getLikeCount(@Param('id') flyerId: string) {
    const count = await this.flyerInteractionsService.getLikeCount(flyerId);
    return { flyerId, likeCount: count };
  }

  /**
   * Get user's liked flyers
   * GET /api/flyers/liked
   */
  @Get('liked')
  async getUserLikedFlyers(
    @Request() req,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return await this.flyerInteractionsService.getUserLikedFlyers(
      req.user.sub,
      page || 1,
      limit || 20,
    );
  }

  // =====================================
  // Bookmarks
  // =====================================

  /**
   * Bookmark a flyer
   * POST /api/flyers/:id/bookmark
   */
  @Post(':id/bookmark')
  async bookmarkFlyer(@Request() req, @Param('id') flyerId: string) {
    const bookmark = await this.flyerInteractionsService.bookmarkFlyer(
      req.user.sub,
      flyerId,
    );
    return { message: 'Flyer bookmarked successfully', bookmark };
  }

  /**
   * Remove bookmark from a flyer
   * DELETE /api/flyers/:id/bookmark
   */
  @Delete(':id/bookmark')
  async unbookmarkFlyer(@Request() req, @Param('id') flyerId: string) {
    await this.flyerInteractionsService.unbookmarkFlyer(req.user.sub, flyerId);
    return { message: 'Bookmark removed successfully' };
  }

  /**
   * Get bookmark count for a flyer
   * GET /api/flyers/:id/bookmarks/count
   */
  @Get(':id/bookmarks/count')
  async getBookmarkCount(@Param('id') flyerId: string) {
    const count = await this.flyerInteractionsService.getBookmarkCount(flyerId);
    return { flyerId, bookmarkCount: count };
  }

  /**
   * Get user's bookmarked flyers
   * GET /api/flyers/bookmarked
   */
  @Get('bookmarked')
  async getUserBookmarkedFlyers(
    @Request() req,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return await this.flyerInteractionsService.getUserBookmarkedFlyers(
      req.user.sub,
      page || 1,
      limit || 20,
    );
  }

  /**
   * Get interaction status for a flyer
   * GET /api/flyers/:id/interaction-status
   */
  @Get(':id/interaction-status')
  async getFlyerInteractionStatus(
    @Request() req,
    @Param('id') flyerId: string,
  ) {
    return await this.flyerInteractionsService.getFlyerInteractionStatus(
      req.user.sub,
      flyerId,
    );
  }
}
