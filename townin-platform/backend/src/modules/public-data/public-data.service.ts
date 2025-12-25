import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cctv } from './entities/cctv.entity';
import { Parking } from './entities/parking.entity';
import { Shelter } from './entities/shelter.entity';
import { NearbyQueryDto, ParkingQueryDto, CctvResponse, ParkingResponse, ShelterResponse } from './dto/public-data.dto';

@Injectable()
export class PublicDataService {
  constructor(
    @InjectRepository(Cctv)
    private cctvRepository: Repository<Cctv>,
    @InjectRepository(Parking)
    private parkingRepository: Repository<Parking>,
    @InjectRepository(Shelter)
    private shelterRepository: Repository<Shelter>,
  ) {}

  /**
   * Calculate distance between two points using Haversine formula
   * @param lat1 Latitude of point 1
   * @param lng1 Longitude of point 1
   * @param lat2 Latitude of point 2
   * @param lng2 Longitude of point 2
   * @returns Distance in meters
   */
  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lng2 - lng1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }

  /**
   * Find CCTVs near a location
   */
  async findNearbyCctvs(query: NearbyQueryDto): Promise<{ data: CctvResponse[]; total: number }> {
    const { lat, lng, radius, limit, page } = query;
    const offset = (page - 1) * limit;

    // Calculate rough bounding box (1 degree ≈ 111km)
    const latDelta = (radius / 111000);
    const lngDelta = (radius / (111000 * Math.cos(lat * Math.PI / 180)));

    // Get all CCTVs within bounding box
    const allResults = await this.cctvRepository
      .createQueryBuilder('cctv')
      .where('cctv.latitude BETWEEN :minLat AND :maxLat', {
        minLat: lat - latDelta,
        maxLat: lat + latDelta,
      })
      .andWhere('cctv.longitude BETWEEN :minLng AND :maxLng', {
        minLng: lng - lngDelta,
        maxLng: lng + lngDelta,
      })
      .getMany();

    // Calculate exact distances and filter by radius
    const resultsWithDistance = allResults
      .map(cctv => ({
        ...cctv,
        distance: this.calculateDistance(lat, lng, cctv.latitude, cctv.longitude),
      }))
      .filter(cctv => cctv.distance <= radius)
      .sort((a, b) => a.distance - b.distance);

    const total = resultsWithDistance.length;
    const paginatedResults = resultsWithDistance.slice(offset, offset + limit);

    const data: CctvResponse[] = paginatedResults.map(cctv => ({
      id: cctv.id,
      externalId: cctv.externalId,
      name: cctv.name,
      location: {
        type: 'Point',
        coordinates: [cctv.longitude, cctv.latitude],
      },
      address: cctv.address,
      distance: Math.round(cctv.distance),
      installationAgency: cctv.installationAgency,
      installationPurpose: cctv.installationPurpose,
    }));

    return { data, total };
  }

  /**
   * Find parking lots near a location
   */
  async findNearbyParking(query: ParkingQueryDto): Promise<{ data: ParkingResponse[]; total: number }> {
    const { lat, lng, radius, limit, page, availableOnly } = query;
    const offset = (page - 1) * limit;

    // Calculate rough bounding box
    const latDelta = (radius / 111000);
    const lngDelta = (radius / (111000 * Math.cos(lat * Math.PI / 180)));

    // Build query
    let queryBuilder = this.parkingRepository
      .createQueryBuilder('parking')
      .where('parking.latitude BETWEEN :minLat AND :maxLat', {
        minLat: lat - latDelta,
        maxLat: lat + latDelta,
      })
      .andWhere('parking.longitude BETWEEN :minLng AND :maxLng', {
        minLng: lng - lngDelta,
        maxLng: lng + lngDelta,
      });

    if (availableOnly) {
      queryBuilder = queryBuilder.andWhere('parking.availableSpaces > 0');
    }

    const allResults = await queryBuilder.getMany();

    // Calculate exact distances and filter by radius
    const resultsWithDistance = allResults
      .map(parking => ({
        ...parking,
        distance: this.calculateDistance(lat, lng, parking.latitude, parking.longitude),
      }))
      .filter(parking => parking.distance <= radius)
      .sort((a, b) => a.distance - b.distance);

    const total = resultsWithDistance.length;
    const paginatedResults = resultsWithDistance.slice(offset, offset + limit);

    const data: ParkingResponse[] = paginatedResults.map(parking => ({
      id: parking.id,
      externalId: parking.externalId,
      name: parking.name,
      location: {
        type: 'Point',
        coordinates: [parking.longitude, parking.latitude],
      },
      address: parking.address,
      distance: Math.round(parking.distance),
      totalSpaces: parking.totalSpaces,
      availableSpaces: parking.availableSpaces,
      operationHours: parking.operationHours,
      feeInfo: parking.feeInfo,
      phone: parking.phone,
      lastUpdated: parking.realtimeDataSyncedAt,
    }));

    return { data, total };
  }

  /**
   * Find shelters near a location
   */
  async findNearbyShelters(query: NearbyQueryDto): Promise<{ data: ShelterResponse[]; total: number }> {
    const { lat, lng, radius, limit, page } = query;
    const offset = (page - 1) * limit;

    // Calculate rough bounding box
    const latDelta = (radius / 111000);
    const lngDelta = (radius / (111000 * Math.cos(lat * Math.PI / 180)));

    // Get all shelters within bounding box
    const allResults = await this.shelterRepository
      .createQueryBuilder('shelter')
      .where('shelter.latitude BETWEEN :minLat AND :maxLat', {
        minLat: lat - latDelta,
        maxLat: lat + latDelta,
      })
      .andWhere('shelter.longitude BETWEEN :minLng AND :maxLng', {
        minLng: lng - lngDelta,
        maxLng: lng + lngDelta,
      })
      .getMany();

    // Calculate exact distances and filter by radius
    const resultsWithDistance = allResults
      .map(shelter => ({
        ...shelter,
        distance: this.calculateDistance(lat, lng, shelter.latitude, shelter.longitude),
      }))
      .filter(shelter => shelter.distance <= radius)
      .sort((a, b) => a.distance - b.distance);

    const total = resultsWithDistance.length;
    const paginatedResults = resultsWithDistance.slice(offset, offset + limit);

    const data: ShelterResponse[] = paginatedResults.map(shelter => ({
      id: shelter.id,
      externalId: shelter.externalId,
      name: shelter.name,
      location: {
        type: 'Point',
        coordinates: [shelter.longitude, shelter.latitude],
      },
      address: shelter.address,
      distance: Math.round(shelter.distance),
      capacity: shelter.capacity,
      facilityType: shelter.facilityType,
      areaSqm: shelter.areaSqm,
    }));

    return { data, total };
  }
}
