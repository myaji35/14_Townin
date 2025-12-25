# Story CORE-002-02: H3 Grid Cell System

**Epic**: CORE-002 Geospatial Data Infrastructure
**Priority**: P0 (Critical)
**Story Points**: 3
**Status**: 📋 Planned

## User Story

**As a** developer
**I want to** convert coordinates to H3 grid cells
**So that** I can implement privacy-first location system

## Acceptance Criteria

- [ ] H3 라이브러리 통합 (h3-js)
- [ ] 위도/경도 → H3 Cell ID 변환
- [ ] H3 Cell ID → 중심 좌표 변환
- [ ] H3 Resolution 9 (500m × 500m)
- [ ] H3 Cell boundary polygon 생성
- [ ] 변환 속도 < 50ms

## Tasks

### Backend
- [ ] Install h3-js library
- [ ] Create H3Service
- [ ] Implement latLngToCell() function
- [ ] Implement cellToLatLng() function
- [ ] Implement cellToBoundary() function
- [ ] Implement getResolution() utility
- [ ] Implement getCellArea() utility
- [ ] Error handling for invalid coordinates

### Testing
- [ ] Unit tests: latLngToCell conversion
- [ ] Unit tests: cellToLatLng conversion
- [ ] Unit tests: cellToBoundary generation
- [ ] Unit tests: invalid coordinates handling
- [ ] Performance test: 1000 conversions < 1 second
- [ ] Integration test: Round-trip conversion accuracy

## Technical Notes

```typescript
// Install h3-js
npm install h3-js

// H3Service Implementation
import { Injectable } from '@nestjs/common';
import {
  latLngToCell,
  cellToLatLng,
  cellToBoundary,
  getResolution,
  cellToChildren,
  cellToParent,
  gridDisk,
  kRing,
} from 'h3-js';

@Injectable()
export class H3Service {
  private readonly DEFAULT_RESOLUTION = 9; // 500m × 500m

  /**
   * Convert latitude/longitude to H3 cell index
   * @param lat Latitude (WGS84)
   * @param lng Longitude (WGS84)
   * @param resolution H3 resolution (default: 9)
   * @returns H3 cell index (15-character string)
   */
  latLngToH3(lat: number, lng: number, resolution: number = this.DEFAULT_RESOLUTION): string {
    if (lat < -90 || lat > 90) {
      throw new Error('Invalid latitude: must be between -90 and 90');
    }
    if (lng < -180 || lng > 180) {
      throw new Error('Invalid longitude: must be between -180 and 180');
    }

    return latLngToCell(lat, lng, resolution);
  }

  /**
   * Convert H3 cell index to center coordinates
   * @param h3Index H3 cell index
   * @returns [latitude, longitude]
   */
  h3ToLatLng(h3Index: string): [number, number] {
    if (!h3Index || h3Index.length !== 15) {
      throw new Error('Invalid H3 index');
    }

    return cellToLatLng(h3Index);
  }

  /**
   * Get H3 cell boundary as polygon
   * @param h3Index H3 cell index
   * @returns Array of [lat, lng] coordinates forming hexagon
   */
  h3ToBoundary(h3Index: string): Array<[number, number]> {
    return cellToBoundary(h3Index);
  }

  /**
   * Get H3 cell boundary as GeoJSON Polygon
   * @param h3Index H3 cell index
   * @returns GeoJSON Polygon
   */
  h3ToBoundaryGeoJSON(h3Index: string): any {
    const boundary = cellToBoundary(h3Index);

    return {
      type: 'Polygon',
      coordinates: [
        [
          ...boundary.map(([lat, lng]) => [lng, lat]), // GeoJSON uses [lng, lat]
          boundary[0].map((coord, i) => i === 0 ? boundary[0][1] : boundary[0][0]), // Close polygon
        ],
      ],
    };
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
   * Get H3 resolution level
   * @param h3Index H3 cell index
   * @returns Resolution (0-15)
   */
  getH3Resolution(h3Index: string): number {
    return getResolution(h3Index);
  }

  /**
   * Get parent cell (lower resolution)
   * @param h3Index H3 cell index
   * @param parentResolution Target resolution
   * @returns Parent H3 index
   */
  getParentCell(h3Index: string, parentResolution: number): string {
    return cellToParent(h3Index, parentResolution);
  }

  /**
   * Get children cells (higher resolution)
   * @param h3Index H3 cell index
   * @param childResolution Target resolution
   * @returns Array of child H3 indices
   */
  getChildrenCells(h3Index: string, childResolution: number): string[] {
    return cellToChildren(h3Index, childResolution);
  }
}

// Example Usage
const h3Service = new H3Service();

// Seoul City Hall
const h3Index = h3Service.latLngToH3(37.5665, 126.9780);
console.log(h3Index); // '8930062838fffff'

const center = h3Service.h3ToLatLng(h3Index);
console.log(center); // [37.566536, 126.978013]

const boundary = h3Service.h3ToBoundary(h3Index);
console.log(boundary);
// [
//   [37.566969, 126.976532],
//   [37.567402, 126.977747],
//   [37.567186, 126.979495],
//   [37.566103, 126.979494],
//   [37.565670, 126.978279],
//   [37.565886, 126.976531]
// ]

const neighbors = h3Service.getKRing(h3Index, 1);
console.log(neighbors.length); // 7 (center + 6 neighbors)

const disk = h3Service.getGridDisk(h3Index, 2);
console.log(disk.length); // 19 (center + 18 cells)

// H3 Resolution Info
const RESOLUTIONS = {
  6: { edge: 3229.48, area: 36.13 }, // ~36 km²
  7: { edge: 1220.63, area: 5.16 },  // ~5 km²
  8: { edge: 461.35, area: 0.74 },   // ~740 m × 740 m
  9: { edge: 174.38, area: 0.105 },  // ~500 m × 500 m ✅ Our choice
  10: { edge: 65.91, area: 0.015 },  // ~250 m × 250 m
  11: { edge: 24.91, area: 0.002 },  // ~100 m × 100 m
};
```

## Dependencies

- **Depends on**: None
- **External**: h3-js library
- **Blocks**: CORE-002-03 (GridCell Entity)

## Definition of Done

- [ ] All acceptance criteria met
- [ ] All tasks completed
- [ ] h3-js library installed
- [ ] H3Service implemented
- [ ] Unit tests passing (>90% coverage)
- [ ] Performance benchmark < 50ms
- [ ] Code reviewed and merged
- [ ] API documentation updated
- [ ] Examples documented

## Notes

- H3 Resolution 9 선택 이유:
  - 프라이버시: 500m 범위로 정확한 위치 숨김
  - 서비스 정밀도: 동네 단위 하이퍼로컬 서비스 제공
  - 성능: 전국 약 350,000개 셀 (관리 가능)
- 향후 Resolution 조정 가능 (10: 더 정밀, 8: 더 넓은 범위)
- H3 Index는 15자 문자열 (VARCHAR(15))
- 육각형 그리드는 사각형 대비 이웃 셀이 균일 (6개)
- Uber, Foursquare 등에서 사용 중인 검증된 기술
