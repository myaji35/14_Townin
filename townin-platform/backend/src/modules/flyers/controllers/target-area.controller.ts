import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { TargetAreaService } from '../services/target-area.service';
import {
  SelectTargetAreasDto,
  TargetAreaEstimateDto,
} from '../dto/select-target-areas.dto';

@Controller('flyers')
@UseGuards(JwtAuthGuard)
export class TargetAreaController {
  constructor(private readonly targetAreaService: TargetAreaService) {}

  /**
   * Set target areas for a flyer
   * POST /api/flyers/:id/target-areas
   */
  @Post(':id/target-areas')
  async setTargetAreas(
    @Request() req,
    @Param('id') flyerId: string,
    @Body() dto: SelectTargetAreasDto,
  ) {
    // TODO: Get merchantId from user session/merchant profile
    const merchantId = req.user.sub;

    const targetAreas = await this.targetAreaService.setTargetAreas(
      flyerId,
      merchantId,
      dto,
    );

    return {
      message: 'Target areas set successfully',
      targetAreas,
    };
  }

  /**
   * Get target areas for a flyer
   * GET /api/flyers/:id/target-areas
   */
  @Get(':id/target-areas')
  async getTargetAreas(@Param('id') flyerId: string) {
    const targetAreas = await this.targetAreaService.getTargetAreas(flyerId);
    const reach = await this.targetAreaService.getTotalReachForFlyer(flyerId);

    return {
      targetAreas,
      ...reach,
    };
  }

  /**
   * Estimate reach for target areas (before saving)
   * POST /api/flyers/target-areas/estimate
   */
  @Post('target-areas/estimate')
  async estimateTargetAreas(@Body() dto: TargetAreaEstimateDto) {
    return await this.targetAreaService.getTargetAreasWithEstimate(dto);
  }

  /**
   * Get H3 cell boundaries for map rendering
   * POST /api/flyers/target-areas/boundaries
   */
  @Post('target-areas/boundaries')
  async getCellBoundaries(@Body() body: { h3CellIds: string[] }) {
    return await this.targetAreaService.getCellBoundaries(body.h3CellIds);
  }

  /**
   * Get popular target areas
   * GET /api/flyers/target-areas/popular
   */
  @Get('target-areas/popular')
  async getPopularTargetAreas(@Query('limit') limit?: number) {
    return await this.targetAreaService.getPopularTargetAreas(
      limit ? parseInt(limit.toString()) : 10,
    );
  }
}
