import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Query,
  ParseBoolPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { FamilyMembersService } from '../services/family-members.service';
import { CreateFamilyMemberDto } from '../dto/create-family-member.dto';
import { UpdateFamilyMemberDto } from '../dto/update-family-member.dto';
import { FamilyMember } from '../entities/family-member.entity';

/**
 * Family Members Controller
 *
 * Endpoints for managing family member profiles
 * Privacy-first: NO real names, SSN, or detailed addresses
 *
 * Base path: /api/users/me/family-members
 */
@ApiTags('Family Members')
@ApiBearerAuth()
@Controller('users/me/family-members')
// @UseGuards(JwtAuthGuard) // Uncomment when auth is ready
export class FamilyMembersController {
  constructor(
    private readonly familyMembersService: FamilyMembersService,
  ) {}

  /**
   * Create a new family member
   * POST /api/users/me/family-members
   */
  @Post()
  @ApiOperation({
    summary: 'Create a new family member',
    description:
      'Add a family member profile (privacy-first: no names, SSN, or addresses)',
  })
  @ApiResponse({
    status: 201,
    description: 'Family member created successfully',
    type: FamilyMember,
  })
  @ApiResponse({
    status: 400,
    description: 'Maximum family members limit reached or invalid data',
  })
  async create(
    @Request() req: any,
    @Body() createDto: CreateFamilyMemberDto,
  ): Promise<FamilyMember> {
    // TODO: Get userId from JWT token when auth is ready
    // const userId = req.user.id;
    const userId = 'temp-user-id'; // Temporary for testing

    return this.familyMembersService.create(userId, createDto);
  }

  /**
   * Get all family members for current user
   * GET /api/users/me/family-members
   */
  @Get()
  @ApiOperation({
    summary: 'Get all family members',
    description: 'Retrieve all family member profiles for the current user',
  })
  @ApiQuery({
    name: 'includeInactive',
    required: false,
    type: Boolean,
    description: 'Include inactive family members',
  })
  @ApiResponse({
    status: 200,
    description: 'List of family members',
    type: [FamilyMember],
  })
  async findAll(
    @Request() req: any,
    @Query('includeInactive', new ParseBoolPipe({ optional: true }))
    includeInactive = false,
  ): Promise<FamilyMember[]> {
    // TODO: Get userId from JWT token when auth is ready
    const userId = 'temp-user-id';

    return this.familyMembersService.findAll(userId, includeInactive);
  }

  /**
   * Get family members with IoT sensors
   * GET /api/users/me/family-members/iot-enabled
   */
  @Get('iot-enabled')
  @ApiOperation({
    summary: 'Get family members with IoT sensors',
    description: 'Retrieve family members who have IoT sensors installed',
  })
  @ApiResponse({
    status: 200,
    description: 'List of family members with IoT sensors',
    type: [FamilyMember],
  })
  async findWithIotSensors(@Request() req: any): Promise<FamilyMember[]> {
    const userId = 'temp-user-id';
    return this.familyMembersService.findWithIotSensors(userId);
  }

  /**
   * Get family members with notifications enabled
   * GET /api/users/me/family-members/notifications-enabled
   */
  @Get('notifications-enabled')
  @ApiOperation({
    summary: 'Get family members with notifications enabled',
    description: 'Retrieve family members who have notifications enabled',
  })
  @ApiResponse({
    status: 200,
    description: 'List of family members with notifications enabled',
    type: [FamilyMember],
  })
  async findWithNotifications(@Request() req: any): Promise<FamilyMember[]> {
    const userId = 'temp-user-id';
    return this.familyMembersService.findWithNotificationsEnabled(userId);
  }

  /**
   * Get a single family member by ID
   * GET /api/users/me/family-members/:id
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Get a family member by ID',
    description: 'Retrieve a specific family member profile',
  })
  @ApiParam({
    name: 'id',
    description: 'Family member UUID',
  })
  @ApiResponse({
    status: 200,
    description: 'Family member details',
    type: FamilyMember,
  })
  @ApiResponse({
    status: 404,
    description: 'Family member not found',
  })
  async findOne(
    @Request() req: any,
    @Param('id') id: string,
  ): Promise<FamilyMember> {
    const userId = 'temp-user-id';
    return this.familyMembersService.findOne(userId, id);
  }

  /**
   * Update a family member
   * PATCH /api/users/me/family-members/:id
   */
  @Patch(':id')
  @ApiOperation({
    summary: 'Update a family member',
    description: 'Update family member profile information',
  })
  @ApiParam({
    name: 'id',
    description: 'Family member UUID',
  })
  @ApiResponse({
    status: 200,
    description: 'Family member updated successfully',
    type: FamilyMember,
  })
  @ApiResponse({
    status: 404,
    description: 'Family member not found',
  })
  async update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() updateDto: UpdateFamilyMemberDto,
  ): Promise<FamilyMember> {
    const userId = 'temp-user-id';
    return this.familyMembersService.update(userId, id, updateDto);
  }

  /**
   * Soft delete a family member
   * DELETE /api/users/me/family-members/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Deactivate a family member',
    description: 'Soft delete (deactivate) a family member profile',
  })
  @ApiParam({
    name: 'id',
    description: 'Family member UUID',
  })
  @ApiResponse({
    status: 204,
    description: 'Family member deactivated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Family member not found',
  })
  async remove(@Request() req: any, @Param('id') id: string): Promise<void> {
    const userId = 'temp-user-id';
    return this.familyMembersService.remove(userId, id);
  }

  /**
   * Hard delete a family member (permanent)
   * DELETE /api/users/me/family-members/:id/permanent
   */
  @Delete(':id/permanent')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Permanently delete a family member',
    description: 'Hard delete (permanent) a family member profile',
  })
  @ApiParam({
    name: 'id',
    description: 'Family member UUID',
  })
  @ApiResponse({
    status: 204,
    description: 'Family member permanently deleted',
  })
  @ApiResponse({
    status: 404,
    description: 'Family member not found',
  })
  async delete(@Request() req: any, @Param('id') id: string): Promise<void> {
    const userId = 'temp-user-id';
    return this.familyMembersService.delete(userId, id);
  }
}
