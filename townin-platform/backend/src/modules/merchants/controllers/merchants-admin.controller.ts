import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/enums/user-role.enum';
import { MerchantsService } from '../merchants.service';
import { ApproveMerchantDto } from '../dto/approve-merchant.dto';
import { MerchantResponseDto } from '../dto/merchant-response.dto';

@Controller('admin/merchants')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.MUNICIPALITY)
export class MerchantsAdminController {
  constructor(private readonly merchantsService: MerchantsService) {}

  /**
   * Get pending merchants for approval
   * GET /api/admin/merchants/pending
   */
  @Get('pending')
  async getPendingMerchants(): Promise<MerchantResponseDto[]> {
    return await this.merchantsService.findPending();
  }

  /**
   * Approve or reject a merchant
   * PATCH /api/admin/merchants/:id/review
   */
  @Patch(':id/review')
  async reviewMerchant(
    @Param('id') merchantId: string,
    @Body() dto: ApproveMerchantDto,
  ): Promise<MerchantResponseDto> {
    return await this.merchantsService.approveMerchant(
      merchantId,
      dto.action,
      dto.rejectionReason,
    );
  }
}
