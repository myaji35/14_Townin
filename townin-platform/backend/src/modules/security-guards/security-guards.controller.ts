import { Controller, Get, UseGuards, Param } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SecurityGuardsService } from './security-guards.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '../../common/enums/user-role.enum';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/user.entity';

@ApiTags('security-guards')
@Controller('security-guards')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiBearerAuth('JWT-auth')
export class SecurityGuardsController {
  constructor(private readonly securityGuardsService: SecurityGuardsService) {}

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.MUNICIPALITY)
  @ApiOperation({ summary: 'Get all security guards' })
  @ApiResponse({ status: 200, description: 'Security guards retrieved successfully' })
  async findAll() {
    return this.securityGuardsService.findAll();
  }

  @Get('my-profile')
  @Roles(UserRole.SECURITY_GUARD)
  @ApiOperation({ summary: 'Get current security guard profile' })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully' })
  async getMyProfile(@CurrentUser() user: User) {
    return this.securityGuardsService.findByUserId(user.id);
  }

  @Get('my-performance')
  @Roles(UserRole.SECURITY_GUARD)
  @ApiOperation({ summary: 'Get current security guard performance metrics' })
  @ApiResponse({ status: 200, description: 'Performance metrics retrieved successfully' })
  async getMyPerformance(@CurrentUser() user: User) {
    return this.securityGuardsService.getPerformance(user.id);
  }

  @Get('district/:district')
  @Roles(UserRole.SUPER_ADMIN, UserRole.MUNICIPALITY)
  @ApiOperation({ summary: 'Get security guards by district' })
  @ApiResponse({ status: 200, description: 'Security guards retrieved successfully' })
  async findByDistrict(@Param('district') district: string) {
    return this.securityGuardsService.findByDistrict(district);
  }
}
