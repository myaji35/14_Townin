import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { GeocodingService } from './geocoding.service';
import { AddressToCoordinatesDto, CoordinatesToAddressDto } from './dto/geocoding.dto';

@Controller('geocoding')
export class GeocodingController {
  constructor(private readonly geocodingService: GeocodingService) {}

  /**
   * POST /geocoding/address-to-coords
   * Convert address to coordinates
   */
  @Post('address-to-coords')
  async addressToCoordinates(@Body() dto: AddressToCoordinatesDto) {
    return this.geocodingService.addressToCoordinates(dto.address);
  }

  /**
   * GET /geocoding/coords-to-address?lat=37.5665&lng=126.9780
   * Convert coordinates to address
   */
  @Get('coords-to-address')
  async coordinatesToAddress(@Query() dto: CoordinatesToAddressDto) {
    return this.geocodingService.coordinatesToAddress(dto.lat, dto.lng);
  }

  /**
   * GET /geocoding/usage
   * Get API usage statistics
   */
  @Get('usage')
  getUsageStats() {
    return this.geocodingService.getUsageStats();
  }
}
