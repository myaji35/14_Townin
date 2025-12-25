import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserLocation, LocationHubType } from './entities/user-location.entity';
import { GridCellService } from '../grid-cells/grid-cell.service';
import { GridCellsService } from '../grid-cells/grid-cells.service';
import { RegionsService } from '../regions/regions.service';
import { GeocodingService } from '../geocoding/geocoding.service';
import { SetUserLocationDto, SetUserLocationByAddressDto, UpdateUserLocationDto } from './dto/user-location.dto';

@Injectable()
export class UserLocationsService {
  constructor(
    @InjectRepository(UserLocation)
    private userLocationRepository: Repository<UserLocation>,
    private gridCellService: GridCellService,
    private gridCellsService: GridCellsService,
    private regionsService: RegionsService,
    private geocodingService: GeocodingService,
  ) {}

  /**
   * Set user location by coordinates
   * @param userId User UUID
   * @param dto SetUserLocationDto
   * @returns UserLocation
   */
  async setLocationByCoordinates(userId: string, dto: SetUserLocationDto): Promise<UserLocation> {
    // Validate 3-Hub limit
    await this.validateHubLimit(userId, dto.hubType);

    // Convert coordinates to H3 index
    const h3Index = this.gridCellService.latLngToCell(dto.lat, dto.lng);

    // Ensure grid cell exists in database
    await this.gridCellsService.upsertGridCell(h3Index);

    // Find region containing this point
    const region = await this.regionsService.findRegionByCoordinates(dto.lat, dto.lng);

    // Get center point of H3 cell (not exact user location - privacy-first)
    const [centerLat, centerLng] = this.gridCellService.cellToLatLng(h3Index);
    const centerPointWKT = `POINT(${centerLng} ${centerLat})`;

    // Check if location already exists
    const existing = await this.userLocationRepository.findOne({
      where: { userId, hubType: dto.hubType },
    });

    if (existing) {
      // Update existing location
      existing.h3Index = h3Index;
      existing.regionId = region?.id || null;
      existing.centerLat = centerLat;
      existing.centerLng = centerLng;
      if (dto.label !== undefined) existing.label = dto.label;
      if (dto.isPrimary !== undefined) existing.isPrimary = dto.isPrimary;
      existing.updatedAt = new Date();

      return this.userLocationRepository.save(existing);
    }

    // Create new location
    const userLocation = this.userLocationRepository.create({
      userId,
      hubType: dto.hubType,
      h3Index,
      regionId: region?.id || null,
      centerLat,
      centerLng,
      label: dto.label,
      isPrimary: dto.isPrimary || false,
    });

    const saved = await this.userLocationRepository.save(userLocation);

    // Increment user count for this grid cell
    await this.gridCellsService.incrementUserCount(h3Index);

    return saved;
  }

  /**
   * Set user location by address (uses Kakao Geocoding)
   * @param userId User UUID
   * @param dto SetUserLocationByAddressDto
   * @returns UserLocation
   */
  async setLocationByAddress(userId: string, dto: SetUserLocationByAddressDto): Promise<UserLocation> {
    // Geocode address to coordinates
    const geocoded = await this.geocodingService.addressToCoordinates(dto.address);

    // Use coordinates to set location
    return this.setLocationByCoordinates(userId, {
      hubType: dto.hubType,
      lat: geocoded.lat,
      lng: geocoded.lng,
      label: dto.label || geocoded.address,
      isPrimary: dto.isPrimary,
    });
  }

  /**
   * Get all user locations
   * @param userId User UUID
   * @returns Array of UserLocations
   */
  async getUserLocations(userId: string): Promise<UserLocation[]> {
    return this.userLocationRepository.find({
      where: { userId },
      relations: ['region', 'gridCell'],
      order: { isPrimary: 'DESC', createdAt: 'ASC' },
    });
  }

  /**
   * Get user location by hub type
   * @param userId User UUID
   * @param hubType LocationHubType
   * @returns UserLocation or null
   */
  async getUserLocationByHub(userId: string, hubType: LocationHubType): Promise<UserLocation | null> {
    return this.userLocationRepository.findOne({
      where: { userId, hubType },
      relations: ['region', 'gridCell'],
    });
  }

  /**
   * Update user location metadata
   * @param userId User UUID
   * @param hubType LocationHubType
   * @param dto UpdateUserLocationDto
   * @returns UserLocation
   */
  async updateLocation(
    userId: string,
    hubType: LocationHubType,
    dto: UpdateUserLocationDto,
  ): Promise<UserLocation> {
    const location = await this.getUserLocationByHub(userId, hubType);
    if (!location) {
      throw new NotFoundException(`Location not found for hub type: ${hubType}`);
    }

    if (dto.label !== undefined) location.label = dto.label;
    if (dto.isPrimary !== undefined) location.isPrimary = dto.isPrimary;

    return this.userLocationRepository.save(location);
  }

  /**
   * Delete user location
   * @param userId User UUID
   * @param hubType LocationHubType
   */
  async deleteLocation(userId: string, hubType: LocationHubType): Promise<void> {
    const location = await this.getUserLocationByHub(userId, hubType);
    if (!location) {
      throw new NotFoundException(`Location not found for hub type: ${hubType}`);
    }

    await this.userLocationRepository.remove(location);
  }

  /**
   * Get user's primary location
   * @param userId User UUID
   * @returns UserLocation or null
   */
  async getPrimaryLocation(userId: string): Promise<UserLocation | null> {
    return this.userLocationRepository.findOne({
      where: { userId, isPrimary: true },
      relations: ['region', 'gridCell'],
    });
  }

  /**
   * Validate 3-Hub limit
   * @param userId User UUID
   * @param hubType LocationHubType
   * @throws BadRequestException if limit exceeded
   */
  private async validateHubLimit(userId: string, hubType: LocationHubType): Promise<void> {
    const count = await this.userLocationRepository.count({ where: { userId } });

    // If updating existing hub type, don't count it
    const existing = await this.userLocationRepository.findOne({
      where: { userId, hubType },
    });

    if (!existing && count >= 3) {
      throw new BadRequestException(
        'Maximum 3 location hubs allowed (residence, workplace, family_home)',
      );
    }
  }

  /**
   * Get statistics for user locations
   * @returns Statistics object
   */
  async getStatistics() {
    const stats = await this.userLocationRepository
      .createQueryBuilder('ul')
      .select([
        'COUNT(DISTINCT ul.user_id) as total_users',
        'COUNT(*) as total_locations',
        'COUNT(CASE WHEN ul.hub_type = \'residence\' THEN 1 END) as residence_count',
        'COUNT(CASE WHEN ul.hub_type = \'workplace\' THEN 1 END) as workplace_count',
        'COUNT(CASE WHEN ul.hub_type = \'family_home\' THEN 1 END) as family_home_count',
      ])
      .getRawOne();

    return stats;
  }
}
