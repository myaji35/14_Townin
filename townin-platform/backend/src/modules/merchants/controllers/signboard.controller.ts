import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { SignboardService } from '../services/signboard.service';
import { CreateSignboardDto, UpdateSignboardDto } from '../dto/signboard.dto';

@Controller('signboards')
export class SignboardController {
  constructor(private readonly signboardService: SignboardService) {}

  /**
   * Get all open signboards (public)
   * GET /api/signboards
   */
  @Get()
  async getOpenSignboards(
    @Query('h3CellId') h3CellId?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return await this.signboardService.getOpenSignboards(
      h3CellId,
      page || 1,
      limit || 20,
    );
  }

  /**
   * Get signboard by ID (public)
   * GET /api/signboards/:id
   */
  @Get(':id')
  async getSignboard(@Param('id') id: string) {
    const signboard = await this.signboardService.getSignboardByMerchant(id);
    return signboard;
  }

  /**
   * Track signboard view
   * POST /api/signboards/:id/view
   */
  @Post(':id/view')
  async trackView(@Param('id') id: string) {
    await this.signboardService.trackView(id);
    return { message: 'View tracked' };
  }

  /**
   * Track signboard click
   * POST /api/signboards/:id/click
   */
  @Post(':id/click')
  async trackClick(@Param('id') id: string) {
    await this.signboardService.trackClick(id);
    return { message: 'Click tracked' };
  }
}

@Controller('merchants/me/signboard')
@UseGuards(JwtAuthGuard)
export class MerchantSignboardController {
  constructor(private readonly signboardService: SignboardService) {}

  /**
   * Create signboard
   * POST /api/merchants/me/signboard
   */
  @Post()
  async createSignboard(@Request() req, @Body() dto: CreateSignboardDto) {
    // TODO: Get merchantId from user profile
    const merchantId = req.user.sub;
    return await this.signboardService.createSignboard(merchantId, dto);
  }

  /**
   * Get my signboard
   * GET /api/merchants/me/signboard
   */
  @Get()
  async getMySignboard(@Request() req) {
    const merchantId = req.user.sub;
    return await this.signboardService.getSignboardByMerchant(merchantId);
  }

  /**
   * Update signboard
   * PATCH /api/merchants/me/signboard
   */
  @Patch()
  async updateSignboard(@Request() req, @Body() dto: UpdateSignboardDto) {
    const merchantId = req.user.sub;
    return await this.signboardService.updateSignboard(merchantId, dto);
  }

  /**
   * Open signboard
   * POST /api/merchants/me/signboard/open
   */
  @Post('open')
  async openSignboard(@Request() req) {
    const merchantId = req.user.sub;
    const signboard = await this.signboardService.openSignboard(merchantId);
    return {
      message: 'Signboard opened successfully',
      signboard,
    };
  }

  /**
   * Close signboard
   * POST /api/merchants/me/signboard/close
   */
  @Post('close')
  async closeSignboard(@Request() req) {
    const merchantId = req.user.sub;
    const signboard = await this.signboardService.closeSignboard(merchantId);
    return {
      message: 'Signboard closed successfully',
      signboard,
    };
  }

  /**
   * Get signboard stats
   * GET /api/merchants/me/signboard/stats
   */
  @Get('stats')
  async getStats(@Request() req) {
    const merchantId = req.user.sub;
    return await this.signboardService.getSignboardStats(merchantId);
  }
}
