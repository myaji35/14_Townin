import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  UseGuards,
  Param,
  Query,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MerchantsService } from './merchants.service';
import { CreateMerchantDto } from './dto/create-merchant.dto';
import { UpdateMerchantDto } from './dto/update-merchant.dto';
import { ApproveMerchantDto } from './dto/approve-merchant.dto';
import { MerchantResponseDto } from './dto/merchant-response.dto';

@Controller('merchants')
export class MerchantsController {
  constructor(private readonly merchantsService: MerchantsService) {}

  /**
   * Create merchant profile (onboarding)
   * POST /api/merchants
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Request() req,
    @Body() dto: CreateMerchantDto,
  ): Promise<MerchantResponseDto> {
    return await this.merchantsService.create(req.user.sub, dto);
  }

  /**
   * Get current merchant profile
   * GET /api/merchants/me
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMyProfile(@Request() req): Promise<MerchantResponseDto> {
    return await this.merchantsService.findByUserId(req.user.sub);
  }

  /**
   * Update merchant profile
   * PATCH /api/merchants/me
   */
  @Patch('me')
  @UseGuards(JwtAuthGuard)
  async updateMyProfile(
    @Request() req,
    @Body() dto: UpdateMerchantDto,
  ): Promise<MerchantResponseDto> {
    return await this.merchantsService.update(req.user.sub, dto);
  }

  /**
   * Get all merchants (admin)
   * GET /api/merchants
   */
  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(@Query('city') city?: string) {
    if (city) {
      return this.merchantsService.findByCity(city);
    }
    return this.merchantsService.findAll();
  }

  /**
   * Get merchants by grid cell
   * GET /api/merchants/grid-cell/:gridCell
   */
  @Get('grid-cell/:gridCell')
  @UseGuards(JwtAuthGuard)
  async findByGridCell(@Param('gridCell') gridCell: string) {
    return this.merchantsService.findByGridCell(gridCell);
  }

  /**
   * Get merchant statistics by grid cell
   * GET /api/merchants/stats/:gridCell
   */
  @Get('stats/:gridCell')
  @UseGuards(JwtAuthGuard)
  async getStatsByGridCell(@Param('gridCell') gridCell: string) {
    return this.merchantsService.getStatsByGridCell(gridCell);
  }

  /**
   * Get merchant by ID
   * GET /api/merchants/:id
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findById(@Param('id') id: string) {
    return this.merchantsService.findById(id);
  }
}
