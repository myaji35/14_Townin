import { Controller, Get, Query } from '@nestjs/common';
import { PublicDataService } from './public-data.service';
import { NearbyQueryDto, ParkingQueryDto } from './dto/public-data.dto';

@Controller('public-data')
export class PublicDataController {
  constructor(private readonly publicDataService: PublicDataService) {}

  /**
   * GET /public-data/map?lat=37.5665&lng=126.9780&radius=1000&types=cctv,parking,shelter
   * Get integrated map data (all public data types)
   */
  @Get('map')
  async getIntegratedMapData(
    @Query() query: NearbyQueryDto,
    @Query('types') types?: string,
  ) {
    const requestedTypes = types ? types.split(',') : ['cctv', 'parking', 'shelter'];
    const features: any[] = [];

    // Fetch all requested types in parallel
    const promises = [];

    if (requestedTypes.includes('cctv')) {
      promises.push(
        this.publicDataService.findNearbyCctvs(query).then(result =>
          result.data.map(item => ({
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: item.location.coordinates,
            },
            properties: {
              dataType: 'cctv',
              id: item.id,
              name: item.name,
              distance: item.distance,
              installationAgency: item.installationAgency,
              installationPurpose: item.installationPurpose,
            },
          })),
        ),
      );
    }

    if (requestedTypes.includes('parking')) {
      promises.push(
        this.publicDataService.findNearbyParking({ ...query, availableOnly: false }).then(result =>
          result.data.map(item => ({
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: item.location.coordinates,
            },
            properties: {
              dataType: 'parking',
              id: item.id,
              name: item.name,
              distance: item.distance,
              totalSpaces: item.totalSpaces,
              availableSpaces: item.availableSpaces,
              operationHours: item.operationHours,
            },
          })),
        ),
      );
    }

    if (requestedTypes.includes('shelter')) {
      promises.push(
        this.publicDataService.findNearbyShelters(query).then(result =>
          result.data.map(item => ({
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: item.location.coordinates,
            },
            properties: {
              dataType: 'shelter',
              id: item.id,
              name: item.name,
              distance: item.distance,
              capacity: item.capacity,
              facilityType: item.facilityType,
            },
          })),
        ),
      );
    }

    const results = await Promise.all(promises);
    results.forEach(featureArray => features.push(...featureArray));

    // Sort by distance
    features.sort((a, b) => (a.properties.distance || 0) - (b.properties.distance || 0));

    return {
      type: 'FeatureCollection',
      features,
      metadata: {
        count: features.length,
        types: requestedTypes,
        generatedAt: new Date(),
      },
    };
  }

  /**
   * GET /public-data/cctv?lat=37.5665&lng=126.9780&radius=500
   * Find CCTVs near a location
   */
  @Get('cctv')
  async findNearbyCctvs(@Query() query: NearbyQueryDto) {
    return this.publicDataService.findNearbyCctvs(query);
  }

  /**
   * GET /public-data/parking?lat=37.5665&lng=126.9780&radius=1000&availableOnly=true
   * Find parking lots near a location
   */
  @Get('parking')
  async findNearbyParking(@Query() query: ParkingQueryDto) {
    return this.publicDataService.findNearbyParking(query);
  }

  /**
   * GET /public-data/shelters?lat=37.5665&lng=126.9780&radius=2000
   * Find disaster shelters near a location
   */
  @Get('shelters')
  async findNearbyShelters(@Query() query: NearbyQueryDto) {
    return this.publicDataService.findNearbyShelters(query);
  }
}
