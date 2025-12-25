import { Controller, Get, Param, Post, Put, Delete, Body, UseGuards, Request, Query, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FlyersService } from './flyers.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery, ApiConsumes } from '@nestjs/swagger';
import { CreateFlyerDto } from './dto/create-flyer.dto';
import { UpdateFlyerDto } from './dto/update-flyer.dto';
import { BatchCreateFlyerDto } from './dto/batch-create-flyer.dto';
import { FlyerAdSettingsDto, TrackFlyerViewDto } from './dto/flyer-ad-settings.dto';
import { FlyerCategory } from './flyer.entity';

@ApiTags('flyers')
@ApiBearerAuth()
@Controller('flyers')
export class FlyersController {
  constructor(private readonly flyersService: FlyersService) {}

  // =====================================
  // User-facing Endpoints (USR-007)
  // =====================================

  @Get('location/:h3Index')
  @ApiOperation({ summary: 'Get flyers near user location (H3 grid-based)' })
  @ApiQuery({ name: 'radius', required: false, type: Number, description: 'Search radius in km' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  async getFlyersByLocation(
    @Param('h3Index') h3Index: string,
    @Query('radius') radius?: number,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return await this.flyersService.getFlyersByLocation(
      h3Index,
      radius ? parseInt(radius.toString()) : 1,
      page ? parseInt(page.toString()) : 1,
      limit ? parseInt(limit.toString()) : 20,
    );
  }

  @Get('search')
  @ApiOperation({ summary: 'Search flyers by keyword' })
  @ApiQuery({ name: 'q', required: true, type: String, description: 'Search keyword' })
  @ApiQuery({ name: 'category', required: false, enum: FlyerCategory })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async searchFlyers(
    @Query('q') keyword: string,
    @Query('category') category?: FlyerCategory,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return await this.flyersService.searchFlyers(
      keyword,
      category,
      page ? parseInt(page.toString()) : 1,
      limit ? parseInt(limit.toString()) : 20,
    );
  }

  @Get('category/:category')
  @ApiOperation({ summary: 'Get flyers by category' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getFlyersByCategory(
    @Param('category') category: FlyerCategory,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return await this.flyersService.getFlyersByCategory(
      category,
      page ? parseInt(page.toString()) : 1,
      limit ? parseInt(limit.toString()) : 20,
    );
  }

  @Get('featured')
  @ApiOperation({ summary: 'Get featured flyers (trending)' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getFeaturedFlyers(@Query('limit') limit?: number) {
    return await this.flyersService.getFeaturedFlyers(
      limit ? parseInt(limit.toString()) : 10,
    );
  }

  // =====================================
  // Merchant & Admin Endpoints
  // =====================================

  @Get()
  @ApiOperation({ summary: 'Get all active flyers' })
  async findAll() {
    return await this.flyersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get flyer by ID with products' })
  async findOne(@Param('id') id: string) {
    return await this.flyersService.findOne(id);
  }

  @Post(':id/view')
  @ApiOperation({ summary: 'Track flyer view (with analytics)' })
  async trackView(@Request() req, @Param('id') id: string) {
    const userId = req.user?.userId;
    await this.flyersService.trackFlyerView(id, userId);
    return { message: 'View tracked' };
  }

  @Post(':id/click')
  @ApiOperation({ summary: 'Track flyer click (with analytics)' })
  async trackClick(@Request() req, @Param('id') id: string) {
    const userId = req.user?.userId;
    await this.flyersService.trackFlyerClick(id, userId);
    return { message: 'Click tracked' };
  }

  @Get('merchant/:merchantId')
  @ApiOperation({ summary: 'Get flyers by merchant ID' })
  async findByMerchant(@Param('merchantId') merchantId: string) {
    return await this.flyersService.findByMerchant(merchantId);
  }

  @Get('nearby/:gridCell')
  @ApiOperation({ summary: 'Get nearby flyers by grid cell' })
  async findNearby(@Param('gridCell') gridCell: string) {
    return await this.flyersService.findNearby(gridCell);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new flyer (Merchant only)' })
  async create(@Request() req, @Body() createFlyerDto: CreateFlyerDto) {
    // TODO: Get merchant ID from user session
    const merchantId = req.user.merchantId || req.user.userId;
    return await this.flyersService.create(merchantId, createFlyerDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a flyer (Merchant only)' })
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateFlyerDto: UpdateFlyerDto,
  ) {
    const merchantId = req.user.merchantId || req.user.userId;
    return await this.flyersService.update(id, merchantId, updateFlyerDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a flyer (Merchant only)' })
  async delete(@Request() req, @Param('id') id: string) {
    const merchantId = req.user.merchantId || req.user.userId;
    await this.flyersService.delete(id, merchantId);
    return { message: 'Flyer deleted successfully' };
  }

  // =====================================
  // Admin Endpoints (Approval Workflow)
  // =====================================

  @Get('admin/pending')
  @ApiOperation({ summary: 'Get pending flyers (Admin only)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getPendingFlyers(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    // TODO: Add Admin role guard
    return await this.flyersService.getPendingFlyers(
      page ? parseInt(page.toString()) : 1,
      limit ? parseInt(limit.toString()) : 20,
    );
  }

  @Post('admin/:id/approve')
  @ApiOperation({ summary: 'Approve flyer (Admin only)' })
  async approveFlyer(@Request() req, @Param('id') id: string) {
    // TODO: Add Admin role guard
    const adminId = req.user.userId;
    const flyer = await this.flyersService.approveFlyer(id, adminId);
    return {
      message: 'Flyer approved successfully',
      flyer,
    };
  }

  @Post('admin/:id/reject')
  @ApiOperation({ summary: 'Reject flyer (Admin only)' })
  async rejectFlyer(
    @Request() req,
    @Param('id') id: string,
    @Body() body: { reason?: string },
  ) {
    // TODO: Add Admin role guard
    const adminId = req.user.userId;
    const flyer = await this.flyersService.rejectFlyer(id, adminId, body.reason);
    return {
      message: 'Flyer rejected',
      flyer,
    };
  }

  @Get('admin/status/:status')
  @ApiOperation({ summary: 'Get flyers by status (Admin only)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getFlyersByStatus(
    @Param('status') status: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    // TODO: Add Admin role guard
    return await this.flyersService.getFlyersByStatus(
      status as any,
      page ? parseInt(page.toString()) : 1,
      limit ? parseInt(limit.toString()) : 20,
    );
  }

  // =====================================
  // AI OCR & Batch Creation Endpoints
  // =====================================

  @Post('analyze')
  @ApiOperation({ summary: 'Analyze flyer image/PDF with AI OCR (Mock)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async analyzeFlyerImage(
    @UploadedFile() file?: Express.Multer.File,
    @Body('imageUrl') imageUrl?: string,
  ) {
    const fileBuffer = file?.buffer;
    const result = await this.flyersService.analyzeFlyerWithAI(fileBuffer, imageUrl);

    return {
      success: true,
      message: 'Flyer analyzed successfully',
      data: result,
    };
  }

  @Post('batch')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create multiple flyers from AI-analyzed products' })
  async batchCreateFlyers(
    @Request() req,
    @Body() batchDto: BatchCreateFlyerDto,
  ) {
    const merchantId = req.user.merchantId || req.user.userId;
    const result = await this.flyersService.batchCreateFlyers(merchantId, batchDto);

    return {
      success: true,
      message: `${result.count} flyers created successfully`,
      data: result,
    };
  }

  // =====================================
  // Advertising Endpoints
  // =====================================

  @Put(':id/ad-settings')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update advertising settings for a flyer' })
  async updateAdSettings(
    @Param('id') id: string,
    @Request() req: any,
    @Body() adSettings: FlyerAdSettingsDto,
  ) {
    const merchantId = req.user.merchantId;
    return await this.flyersService.updateAdSettings(id, merchantId, adSettings);
  }

  @Post(':id/track-view')
  @ApiOperation({ summary: 'Track flyer view and charge for 5-second views' })
  async trackFlyerView(
    @Param('id') id: string,
    @Body() viewData: TrackFlyerViewDto,
  ) {
    return await this.flyersService.trackFlyerAdView(id, viewData);
  }

  @Get(':id/ad-stats')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get advertising statistics for a flyer' })
  async getAdStats(
    @Param('id') id: string,
    @Request() req: any,
  ) {
    const merchantId = req.user.merchantId;
    return await this.flyersService.getAdStats(id, merchantId);
  }

  @Get('targeted')
  @ApiOperation({ summary: 'Get targeted flyers matching user profile' })
  @ApiQuery({ name: 'region', required: false, type: String, description: 'User region' })
  @ApiQuery({ name: 'age', required: false, type: Number, description: 'User age' })
  @ApiQuery({ name: 'gender', required: false, enum: ['male', 'female'], description: 'User gender' })
  @ApiQuery({ name: 'interests', required: false, type: String, description: 'User interests (comma-separated)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Max results to return' })
  async getTargetedFlyers(
    @Query('region') userRegion?: string,
    @Query('age') userAge?: string,
    @Query('gender') userGender?: 'male' | 'female',
    @Query('interests') userInterests?: string,
    @Query('limit') limit?: string,
  ) {
    const interests = userInterests ? userInterests.split(',').map(i => i.trim()) : undefined;
    return await this.flyersService.getTargetedFlyers(
      userRegion,
      userAge ? parseInt(userAge) : undefined,
      userGender,
      interests,
      limit ? parseInt(limit) : 10,
    );
  }
}
