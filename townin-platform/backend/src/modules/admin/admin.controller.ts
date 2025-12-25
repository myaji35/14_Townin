import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '../../common/enums/user-role.enum';
import { AdminService } from './admin.service';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  async getSystemStats() {
    return this.adminService.getSystemStats();
  }

  @Get('users')
  async getAllUsers() {
    return this.adminService.getAllUsers();
  }

  @Get('recent-activities')
  async getRecentActivities() {
    return this.adminService.getRecentActivities();
  }

  @Patch('users/:id/toggle-active')
  async toggleUserActive(@Param('id') id: string) {
    return this.adminService.toggleUserActive(id);
  }

  @Patch('users/:id/role')
  async updateUserRole(
    @Param('id') id: string,
    @Body('role') role: UserRole,
  ) {
    return this.adminService.updateUserRole(id, role);
  }

  @Delete('users/:id')
  async deleteUser(@Param('id') id: string) {
    return this.adminService.deleteUser(id);
  }

  @Get('flyers')
  async getAllFlyers() {
    return this.adminService.getAllFlyers();
  }

  @Patch('flyers/:id/toggle-active')
  async toggleFlyerActive(@Param('id') id: string) {
    return this.adminService.toggleFlyerActive(id);
  }

  @Delete('flyers/:id')
  async deleteFlyer(@Param('id') id: string) {
    return this.adminService.deleteFlyer(id);
  }
}
