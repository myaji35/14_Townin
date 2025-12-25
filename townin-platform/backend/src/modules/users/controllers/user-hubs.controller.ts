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
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { UserHubsService } from '../services/user-hubs.service';
import { CreateUserHubDto } from '../dto/create-user-hub.dto';
import { UpdateUserHubDto } from '../dto/update-user-hub.dto';
import { UserHubResponseDto } from '../dto/user-hub-response.dto';

@Controller('users/me/hubs')
@UseGuards(JwtAuthGuard)
export class UserHubsController {
  constructor(private readonly userHubsService: UserHubsService) {}

  /**
   * Create a new hub for current user
   * POST /api/users/me/hubs
   */
  @Post()
  async createHub(
    @Request() req,
    @Body() dto: CreateUserHubDto,
  ): Promise<UserHubResponseDto> {
    return await this.userHubsService.createHub(req.user.sub, dto);
  }

  /**
   * Get all hubs for current user
   * GET /api/users/me/hubs
   */
  @Get()
  async getUserHubs(@Request() req): Promise<UserHubResponseDto[]> {
    return await this.userHubsService.getUserHubs(req.user.sub);
  }

  /**
   * Update a hub
   * PATCH /api/users/me/hubs/:id
   */
  @Patch(':id')
  async updateHub(
    @Request() req,
    @Param('id') hubId: string,
    @Body() dto: UpdateUserHubDto,
  ): Promise<UserHubResponseDto> {
    return await this.userHubsService.updateHub(req.user.sub, hubId, dto);
  }

  /**
   * Delete a hub
   * DELETE /api/users/me/hubs/:id
   */
  @Delete(':id')
  async deleteHub(
    @Request() req,
    @Param('id') hubId: string,
  ): Promise<{ message: string }> {
    await this.userHubsService.deleteHub(req.user.sub, hubId);
    return { message: 'Hub deleted successfully' };
  }
}
