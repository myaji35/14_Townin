import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserHub, HubType } from '../entities/user-hub.entity';
import { CreateUserHubDto } from '../dto/create-user-hub.dto';
import { UpdateUserHubDto } from '../dto/update-user-hub.dto';
import { UserHubResponseDto } from '../dto/user-hub-response.dto';
import { latLngToCell } from 'h3-js';

@Injectable()
export class UserHubsService {
  private readonly H3_RESOLUTION = 9; // ~174m hexagons

  constructor(
    @InjectRepository(UserHub)
    private readonly userHubRepository: Repository<UserHub>,
  ) {}

  /**
   * Create a new hub for user
   * Maximum 3 hubs per user (one of each type)
   */
  async createHub(
    userId: string,
    dto: CreateUserHubDto,
  ): Promise<UserHubResponseDto> {
    // Check if user already has this hub type
    const existingHub = await this.userHubRepository.findOne({
      where: {
        userId,
        hubType: dto.hubType,
      },
    });

    if (existingHub) {
      throw new ConflictException(
        `User already has a ${dto.hubType} hub. Please update or delete the existing one.`,
      );
    }

    // Check total hub count (max 3)
    const totalHubs = await this.userHubRepository.count({
      where: { userId },
    });

    if (totalHubs >= 3) {
      throw new BadRequestException(
        'Maximum 3 hubs per user. Please delete an existing hub first.',
      );
    }

    // Calculate H3 cell
    const h3CellId = latLngToCell(dto.lat, dto.lng, this.H3_RESOLUTION);

    // Create hub
    const hub = this.userHubRepository.create({
      userId,
      hubType: dto.hubType,
      latitude: dto.lat,
      longitude: dto.lng,
      address: dto.address,
      h3CellId,
      nickname: dto.nickname,
    });

    const saved = await this.userHubRepository.save(hub);

    return this.toResponseDto(saved);
  }

  /**
   * Get all hubs for a user
   */
  async getUserHubs(userId: string): Promise<UserHubResponseDto[]> {
    const hubs = await this.userHubRepository
      .createQueryBuilder('hub')
      .select([
        'hub.id',
        'hub.hub_type',
        'hub.address',
        'hub.h3_cell_id',
        'hub.nickname',
        'hub.created_at',
        'hub.updated_at',
        'ST_X(hub.location) as lng',
        'ST_Y(hub.location) as lat',
      ])
      .where('hub.user_id = :userId', { userId })
      .orderBy('hub.created_at', 'ASC')
      .getRawMany();

    return hubs.map((hub) => ({
      id: hub.hub_id,
      hubType: hub.hub_hub_type,
      lat: parseFloat(hub.lat),
      lng: parseFloat(hub.lng),
      address: hub.hub_address,
      h3CellId: hub.hub_h3_cell_id,
      nickname: hub.hub_nickname,
      createdAt: hub.hub_created_at,
      updatedAt: hub.hub_updated_at,
    }));
  }

  /**
   * Update a hub
   */
  async updateHub(
    userId: string,
    hubId: string,
    dto: UpdateUserHubDto,
  ): Promise<UserHubResponseDto> {
    const hub = await this.userHubRepository.findOne({
      where: { id: hubId, userId },
    });

    if (!hub) {
      throw new NotFoundException('Hub not found');
    }

    // Update location if provided
    if (dto.lat !== undefined && dto.lng !== undefined) {
      hub.latitude = dto.lat;
      hub.longitude = dto.lng;
      hub.h3CellId = latLngToCell(dto.lat, dto.lng, this.H3_RESOLUTION);
    }

    // Update other fields
    if (dto.address !== undefined) {
      hub.address = dto.address;
    }

    if (dto.nickname !== undefined) {
      hub.nickname = dto.nickname;
    }

    const updated = await this.userHubRepository.save(hub);

    return this.toResponseDto(updated);
  }

  /**
   * Delete a hub
   */
  async deleteHub(userId: string, hubId: string): Promise<void> {
    const hub = await this.userHubRepository.findOne({
      where: { id: hubId, userId },
    });

    if (!hub) {
      throw new NotFoundException('Hub not found');
    }

    await this.userHubRepository.remove(hub);
  }

  /**
   * Convert entity to response DTO
   */
  private toResponseDto(hub: UserHub): UserHubResponseDto {
    return {
      id: hub.id,
      hubType: hub.hubType,
      lat: hub.latitude ? Number(hub.latitude) : 0,
      lng: hub.longitude ? Number(hub.longitude) : 0,
      address: hub.address,
      h3CellId: hub.h3CellId,
      nickname: hub.nickname,
      createdAt: hub.createdAt,
      updatedAt: hub.updatedAt,
    };
  }
}
