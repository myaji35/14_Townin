# Story CORE-002-08: Geospatial Utility Functions

**Epic**: CORE-002 Geospatial Data Infrastructure
**Priority**: P0 (Critical)
**Story Points**: 3
**Status**: 📋 Planned

## User Story

**As a** developer
**I want to** use common geospatial utilities
**So that** I can perform spatial operations easily

## Acceptance Criteria

- [ ] calculateDistance(lat1, lng1, lat2, lng2) - Haversine formula
- [ ] isWithinRadius(point, center, radius)
- [ ] getCellsInRadius(center, radius, resolution)
- [ ] kRing(h3Index, k) - k-distance neighbors
- [ ] gridDisk(h3Index, k) - filled disk
- [ ] 모든 함수 < 10ms 실행 시간

## Tasks

### Backend
- [ ] Create GeoUtils service
- [ ] Implement Haversine distance calculation
- [ ] Implement bearing calculation
- [ ] Implement bounding box calculation
- [ ] Implement H3 utility wrappers
- [ ] Implement coordinate validation
- [ ] Error handling

### Testing
- [ ] Unit tests: Distance calculations (accuracy)
- [ ] Unit tests: Bearing calculations
- [ ] Unit tests: Bounding box
- [ ] Unit tests: H3 utilities
- [ ] Unit tests: Coordinate validation
- [ ] Performance test: < 10ms execution

## Technical Notes

```typescript
// GeoUtils Service
import { Injectable } from '@nestjs/common';
import { kRing, gridDisk, cellsToMultiPolygon } from 'h3-js';

@Injectable()
export class GeoUtils {
  private readonly EARTH_RADIUS_KM = 6371;
  private readonly EARTH_RADIUS_M = 6371000;

  /**
   * Calculate distance between two points using Haversine formula
   * @param lat1 Latitude of point 1
   * @param lng1 Longitude of point 1
   * @param lat2 Latitude of point 2
   * @param lng2 Longitude of point 2
   * @param unit 'km' or 'm' (default: 'm')
   * @returns Distance in specified unit
   */
  calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
    unit: 'km' | 'm' = 'm',
  ): number {
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const radius = unit === 'km' ? this.EARTH_RADIUS_KM : this.EARTH_RADIUS_M;
    return radius * c;
  }

  /**
   * Check if a point is within radius of center
   * @param pointLat Point latitude
   * @param pointLng Point longitude
   * @param centerLat Center latitude
   * @param centerLng Center longitude
   * @param radiusMeters Radius in meters
   * @returns true if within radius
   */
  isWithinRadius(
    pointLat: number,
    pointLng: number,
    centerLat: number,
    centerLng: number,
    radiusMeters: number,
  ): boolean {
    const distance = this.calculateDistance(pointLat, pointLng, centerLat, centerLng, 'm');
    return distance <= radiusMeters;
  }

  /**
   * Calculate bearing (direction) from point1 to point2
   * @returns Bearing in degrees (0-360)
   */
  calculateBearing(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const dLng = this.toRadians(lng2 - lng1);
    const y = Math.sin(dLng) * Math.cos(this.toRadians(lat2));
    const x =
      Math.cos(this.toRadians(lat1)) * Math.sin(this.toRadians(lat2)) -
      Math.sin(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.cos(dLng);

    const bearing = Math.atan2(y, x);
    return (this.toDegrees(bearing) + 360) % 360;
  }

  /**
   * Calculate bounding box around a point
   * @param lat Center latitude
   * @param lng Center longitude
   * @param radiusMeters Radius in meters
   * @returns Bounding box { minLat, maxLat, minLng, maxLng }
   */
  getBoundingBox(
    lat: number,
    lng: number,
    radiusMeters: number,
  ): {
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
  } {
    const latDelta = (radiusMeters / this.EARTH_RADIUS_M) * (180 / Math.PI);
    const lngDelta =
      (radiusMeters / (this.EARTH_RADIUS_M * Math.cos((lat * Math.PI) / 180))) *
      (180 / Math.PI);

    return {
      minLat: lat - latDelta,
      maxLat: lat + latDelta,
      minLng: lng - lngDelta,
      maxLng: lng + lngDelta,
    };
  }

  /**
   * Get H3 cells within radius using grid disk
   * @param centerLat Center latitude
   * @param centerLng Center longitude
   * @param radiusMeters Radius in meters
   * @param resolution H3 resolution (default: 9)
   * @returns Array of H3 cell indices
   */
  getCellsInRadius(
    centerLat: number,
    centerLng: number,
    radiusMeters: number,
    resolution: number = 9,
  ): string[] {
    const h3Index = latLngToCell(centerLat, centerLng, resolution);

    // Estimate k based on radius
    // Resolution 9: ~174m edge → k ≈ radius / 174
    const edgeLength = this.getH3EdgeLength(resolution);
    const k = Math.ceil(radiusMeters / edgeLength);

    return gridDisk(h3Index, k);
  }

  /**
   * Get k-ring neighbors (hollow ring)
   * @param h3Index Center H3 cell
   * @param k Distance (default: 1)
   * @returns Array of H3 neighbor indices
   */
  getKRing(h3Index: string, k: number = 1): string[] {
    return kRing(h3Index, k);
  }

  /**
   * Get grid disk (filled circle)
   * @param h3Index Center H3 cell
   * @param k Radius (default: 1)
   * @returns Array of H3 indices including center
   */
  getGridDisk(h3Index: string, k: number = 1): string[] {
    return gridDisk(h3Index, k);
  }

  /**
   * Convert H3 cells to MultiPolygon GeoJSON
   * @param h3Indices Array of H3 cell indices
   * @returns GeoJSON MultiPolygon
   */
  cellsToGeoJSON(h3Indices: string[]): any {
    return cellsToMultiPolygon(h3Indices, true);
  }

  /**
   * Validate latitude
   */
  isValidLatitude(lat: number): boolean {
    return lat >= -90 && lat <= 90;
  }

  /**
   * Validate longitude
   */
  isValidLongitude(lng: number): boolean {
    return lng >= -180 && lng <= 180;
  }

  /**
   * Validate coordinates
   */
  validateCoordinates(lat: number, lng: number): void {
    if (!this.isValidLatitude(lat)) {
      throw new Error(`Invalid latitude: ${lat}. Must be between -90 and 90.`);
    }
    if (!this.isValidLongitude(lng)) {
      throw new Error(`Invalid longitude: ${lng}. Must be between -180 and 180.`);
    }
  }

  /**
   * Convert degrees to radians
   */
  private toRadians(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }

  /**
   * Convert radians to degrees
   */
  private toDegrees(radians: number): number {
    return (radians * 180) / Math.PI;
  }

  /**
   * Get H3 edge length by resolution (meters)
   */
  private getH3EdgeLength(resolution: number): number {
    const edgeLengths = {
      0: 1107712.6,
      1: 418676.0,
      2: 158244.7,
      3: 59810.9,
      4: 22606.4,
      5: 8544.4,
      6: 3229.5,
      7: 1220.6,
      8: 461.4,
      9: 174.4, // Our default
      10: 65.9,
      11: 24.9,
      12: 9.4,
      13: 3.5,
      14: 1.3,
      15: 0.5,
    };

    return edgeLengths[resolution] || edgeLengths[9];
  }
}

// Example Usage
const geoUtils = new GeoUtils();

// Distance between Seoul City Hall and Gangnam Station
const distance = geoUtils.calculateDistance(
  37.5665, 126.9780, // Seoul City Hall
  37.4979, 127.0276, // Gangnam Station
  'km'
);
console.log(distance); // ~7.3 km

// Check if point is within radius
const isNearby = geoUtils.isWithinRadius(
  37.5665, 126.9780, // Point
  37.5664, 126.9781, // Center
  100 // 100m radius
);
console.log(isNearby); // true

// Get cells in 1km radius
const cells = geoUtils.getCellsInRadius(37.5665, 126.9780, 1000, 9);
console.log(cells.length); // ~19 cells

// Get k-ring neighbors
const neighbors = geoUtils.getKRing('8930062838fffff', 2);
console.log(neighbors.length); // 19 cells (2-ring)

// Bounding box
const bbox = geoUtils.getBoundingBox(37.5665, 126.9780, 1000);
console.log(bbox);
// {
//   minLat: 37.557525,
//   maxLat: 37.575475,
//   minLng: 126.965197,
//   maxLng: 126.990803
// }

// Bearing
const bearing = geoUtils.calculateBearing(
  37.5665, 126.9780, // From Seoul City Hall
  37.4979, 127.0276  // To Gangnam Station
);
console.log(bearing); // ~150° (Southeast)

// Coordinate validation
try {
  geoUtils.validateCoordinates(37.5665, 126.9780); // OK
  geoUtils.validateCoordinates(91, 126.9780); // Error: Invalid latitude
} catch (error) {
  console.error(error.message);
}
```

## Dependencies

- **Depends on**: CORE-002-02 (H3 Service)
- **Blocks**: None (utility functions)

## Definition of Done

- [ ] All acceptance criteria met
- [ ] All tasks completed
- [ ] GeoUtils service implemented
- [ ] All utility functions working
- [ ] Unit tests passing (>90% coverage)
- [ ] Performance test < 10ms
- [ ] Accuracy validation (distance ±1%)
- [ ] Code reviewed and merged
- [ ] API documentation updated
- [ ] Usage examples documented

## Notes

- Haversine formula는 구면 지구 가정 (충분히 정확)
- 극도로 정밀한 거리 계산은 PostGIS ST_Distance 사용
- H3 kRing은 육각형 그리드 특성상 정확한 원형 아님
- getCellsInRadius는 근사치 (실제 원보다 약간 클 수 있음)
- Bearing은 초기 방향 (목적지까지 곡선 경로)
- Bounding box는 간단한 필터링용 (정확한 반경 검색은 ST_DWithin)
- 모든 좌표는 WGS84 (SRID 4326) 가정
- 성능 최적화: 간단한 수학 연산으로 빠른 실행
