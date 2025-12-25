import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import {
  AdminManagementService,
  ApproveMerchantDto,
  ApproveFlyerDto,
  ManagePointsDto,
} from '../services/admin-management.service';
import { UserRole } from '../../../common/enums/user-role.enum';

@ApiTags('admin')
@ApiBearerAuth('JWT-auth')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN)
export class AdminManagementController {
  constructor(
    private readonly adminManagementService: AdminManagementService,
  ) {}

  // Merchant Management
  @Get('merchants/pending')
  @ApiOperation({
    summary: 'Get pending merchant approvals',
    description: 'Returns list of merchants waiting for approval',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Pending merchants retrieved successfully' })
  async getPendingMerchants(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return await this.adminManagementService.getPendingMerchants(page, limit);
  }

  @Post('merchants/approve')
  @ApiOperation({
    summary: 'Approve or reject a merchant',
    description: 'Admin can approve or reject merchant registration',
  })
  @ApiResponse({ status: 200, description: 'Merchant status updated successfully' })
  async approveMerchant(@Body() dto: ApproveMerchantDto) {
    return await this.adminManagementService.approveMerchant(dto);
  }

  // Flyer Management
  @Get('flyers/pending')
  @ApiOperation({
    summary: 'Get pending flyer approvals',
    description: 'Returns list of flyers waiting for approval',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Pending flyers retrieved successfully' })
  async getPendingFlyers(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return await this.adminManagementService.getPendingFlyers(page, limit);
  }

  @Post('flyers/approve')
  @ApiOperation({
    summary: 'Approve or reject a flyer',
    description: 'Admin can approve or reject flyer publication',
  })
  @ApiResponse({ status: 200, description: 'Flyer status updated successfully' })
  async approveFlyer(@Body() dto: ApproveFlyerDto) {
    return await this.adminManagementService.approveFlyer(dto);
  }

  // Points Management
  @Post('points/grant')
  @ApiOperation({
    summary: 'Grant points to a user',
    description: 'Admin can grant bonus points to users',
  })
  @ApiResponse({ status: 200, description: 'Points granted successfully' })
  async grantPoints(@Body() dto: ManagePointsDto) {
    return await this.adminManagementService.grantPoints(dto);
  }

  @Post('points/deduct')
  @ApiOperation({
    summary: 'Deduct points from a user',
    description: 'Admin can deduct points from users (e.g., penalty)',
  })
  @ApiResponse({ status: 200, description: 'Points deducted successfully' })
  async deductPoints(@Body() dto: ManagePointsDto) {
    return await this.adminManagementService.deductPoints(dto);
  }

  // User Management
  @Get('users')
  @ApiOperation({
    summary: 'Get all users with filters',
    description: 'Admin can view all users with filtering options',
  })
  @ApiQuery({ name: 'role', required: false, enum: ['user', 'merchant', 'admin'] })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiQuery({ name: 'isVerified', required: false, type: Boolean })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  async getUsers(
    @Query('role') role?: 'user' | 'merchant' | 'admin',
    @Query('isActive') isActive?: boolean,
    @Query('isVerified') isVerified?: boolean,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return await this.adminManagementService.getUsers({
      role,
      isActive,
      isVerified,
      page,
      limit,
    });
  }

  @Post('users/:userId/toggle-status')
  @ApiOperation({
    summary: 'Toggle user active status',
    description: 'Admin can activate or deactivate user accounts',
  })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User status toggled successfully' })
  async toggleUserStatus(@Param('userId') userId: string) {
    return await this.adminManagementService.toggleUserStatus(userId);
  }

  @Delete('users/:userId')
  @ApiOperation({
    summary: 'Delete user (soft delete)',
    description: 'Admin can delete user accounts (soft delete)',
  })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  async deleteUser(@Param('userId') userId: string) {
    return await this.adminManagementService.deleteUser(userId);
  }
}
