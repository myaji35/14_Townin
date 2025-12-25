import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { UserLocationsService } from './user-locations.service';
import { SetUserLocationDto, SetUserLocationByAddressDto, UpdateUserLocationDto } from './dto/user-location.dto';
import { LocationHubType } from './entities/user-location.entity';

@Controller('user-locations')
export class UserLocationsController {
  constructor(private readonly userLocationsService: UserLocationsService) {}

  /**
   * POST /user-locations/set-by-coords
   * Set user location by coordinates
   */
  @Post('set-by-coords')
  async setLocationByCoordinates(@Req() req: any, @Body() dto: SetUserLocationDto) {
    const userId = req.user?.id || 'test-user-id'; // TODO: Get from JWT auth
    return this.userLocationsService.setLocationByCoordinates(userId, dto);
  }

  /**
   * POST /user-locations/set-by-address
   * Set user location by address (uses geocoding)
   */
  @Post('set-by-address')
  async setLocationByAddress(@Req() req: any, @Body() dto: SetUserLocationByAddressDto) {
    const userId = req.user?.id || 'test-user-id'; // TODO: Get from JWT auth
    return this.userLocationsService.setLocationByAddress(userId, dto);
  }

  /**
   * GET /user-locations
   * Get all user locations (3 hubs)
   */
  @Get()
  async getUserLocations(@Req() req: any) {
    const userId = req.user?.id || 'test-user-id'; // TODO: Get from JWT auth
    return this.userLocationsService.getUserLocations(userId);
  }

  /**
   * GET /user-locations/primary
   * Get user's primary location
   */
  @Get('primary')
  async getPrimaryLocation(@Req() req: any) {
    const userId = req.user?.id || 'test-user-id'; // TODO: Get from JWT auth
    return this.userLocationsService.getPrimaryLocation(userId);
  }

  /**
   * GET /user-locations/:hubType
   * Get user location by hub type
   */
  @Get(':hubType')
  async getUserLocationByHub(@Req() req: any, @Param('hubType') hubType: LocationHubType) {
    const userId = req.user?.id || 'test-user-id'; // TODO: Get from JWT auth
    return this.userLocationsService.getUserLocationByHub(userId, hubType);
  }

  /**
   * PUT /user-locations/:hubType
   * Update user location metadata
   */
  @Put(':hubType')
  async updateLocation(
    @Req() req: any,
    @Param('hubType') hubType: LocationHubType,
    @Body() dto: UpdateUserLocationDto,
  ) {
    const userId = req.user?.id || 'test-user-id'; // TODO: Get from JWT auth
    return this.userLocationsService.updateLocation(userId, hubType, dto);
  }

  /**
   * DELETE /user-locations/:hubType
   * Delete user location
   */
  @Delete(':hubType')
  async deleteLocation(@Req() req: any, @Param('hubType') hubType: LocationHubType) {
    const userId = req.user?.id || 'test-user-id'; // TODO: Get from JWT auth
    await this.userLocationsService.deleteLocation(userId, hubType);
    return { message: 'Location deleted successfully' };
  }

  /**
   * GET /user-locations/stats/summary
   * Get user location statistics
   */
  @Get('stats/summary')
  async getStatistics() {
    return this.userLocationsService.getStatistics();
  }
}
