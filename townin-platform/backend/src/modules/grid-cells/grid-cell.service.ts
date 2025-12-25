import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { latLngToCell, cellToLatLng, gridDisk, cellToBoundary } from 'h3-js';
import { GridCell } from './entities/grid-cell.entity';

@Injectable()
export class GridCellService {
  private readonly H3_RESOLUTION = 9; // ~500m radius

  constructor(
    @InjectRepository(GridCell)
    private gridCellRepository: Repository<GridCell>,
  ) {}

  /**
   * Convert latitude/longitude to H3 Cell ID
   * @param lat Latitude
   * @param lng Longitude
   * @param resolution H3 resolution (default: 9)
   * @returns H3 Cell ID (string)
   */
  latLngToCell(lat: number, lng: number, resolution: number = this.H3_RESOLUTION): string {
    return latLngToCell(lat, lng, resolution);
  }

  /**
   * Convert H3 Cell ID to center latitude/longitude
   * @param h3Index H3 Cell ID
   * @returns [lat, lng]
   */
  cellToLatLng(h3Index: string): [number, number] {
    return cellToLatLng(h3Index);
  }

  /**
   * Get neighboring cells (k-ring)
   * @param h3Index H3 Cell ID
   * @param k Ring size (1 = immediate neighbors)
   * @returns Array of H3 Cell IDs
   */
  getNeighborCells(h3Index: string, k: number = 1): string[] {
    return gridDisk(h3Index, k);
  }

  /**
   * Convert H3 Cell to polygon boundary (for visualization)
   * @param h3Index H3 Cell ID
   * @returns Array of [lat, lng] coordinates
   */
  cellToBoundary(h3Index: string): Array<[number, number]> {
    return cellToBoundary(h3Index);
  }

  /**
   * Calculate distance between two coordinates (Haversine formula)
   * @param lat1 Latitude 1
   * @param lng1 Longitude 1
   * @param lat2 Latitude 2
   * @param lng2 Longitude 2
   * @returns Distance in meters
   */
  calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371000; // Earth radius in meters
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
   * Check if a coordinate is within radius of another coordinate
   * @param lat1 Latitude 1
   * @param lng1 Longitude 1
   * @param lat2 Latitude 2
   * @param lng2 Longitude 2
   * @param radiusMeters Radius in meters
   * @returns true if within radius
   */
  isWithinRadius(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
    radiusMeters: number,
  ): boolean {
    const distance = this.calculateDistance(lat1, lng1, lat2, lng2);
    return distance <= radiusMeters;
  }

  /**
   * Get all H3 cells within a bounding box
   * @param minLat Minimum latitude
   * @param minLng Minimum longitude
   * @param maxLat Maximum latitude
   * @param maxLng Maximum longitude
   * @param resolution H3 resolution
   * @returns Array of H3 Cell IDs
   */
  getCellsInBoundingBox(
    minLat: number,
    minLng: number,
    maxLat: number,
    maxLng: number,
    resolution: number = this.H3_RESOLUTION,
  ): string[] {
    const cells = new Set<string>();

    // Sample grid points within bounding box
    const latStep = (maxLat - minLat) / 10;
    const lngStep = (maxLng - minLng) / 10;

    for (let lat = minLat; lat <= maxLat; lat += latStep) {
      for (let lng = minLng; lng <= maxLng; lng += lngStep) {
        const cellId = this.latLngToCell(lat, lng, resolution);
        cells.add(cellId);

        // Add neighbors to ensure coverage
        const neighbors = this.getNeighborCells(cellId, 1);
        neighbors.forEach(neighbor => cells.add(neighbor));
      }
    }

    return Array.from(cells);
  }

  /**
   * Create or get grid cell from database
   */
  async getOrCreateCell(lat: number, lng: number): Promise<GridCell> {
    const h3Index = this.latLngToCell(lat, lng);

    // Check if cell exists
    let cell = await this.gridCellRepository.findOne({ where: { h3Index } });

    if (!cell) {
      // Get center coordinates
      const [centerLat, centerLng] = this.cellToLatLng(h3Index);

      // Get boundary
      const boundary = this.cellToBoundary(h3Index);

      // Convert boundary to PostGIS Polygon WKT
      const boundaryCoords = boundary.map(([lat, lng]) => `${lng} ${lat}`).join(', ');
      const firstCoord = `${boundary[0][1]} ${boundary[0][0]}`;
      const polygonWKT = `POLYGON((${boundaryCoords}, ${firstCoord}))`;

      // Create point WKT
      const pointWKT = `POINT(${centerLng} ${centerLat})`;

      cell = this.gridCellRepository.create({
        h3Index,
        resolution: this.H3_RESOLUTION,
        centerPointLat: centerLat,
        centerPointLng: centerLng,
        boundary: polygonWKT,
      });

      await this.gridCellRepository.save(cell);
    }

    return cell;
  }

  /**
   * Bulk seed cells for a region
   */
  async seedCellsForRegion(centerLat: number, centerLng: number, radiusKm: number = 10): Promise<number> {
    const k = Math.ceil(radiusKm / 0.5);
    const centerH3 = this.latLngToCell(centerLat, centerLng);
    const h3Indices = this.getNeighborCells(centerH3, k);

    let created = 0;

    for (const h3Index of h3Indices) {
      const exists = await this.gridCellRepository.findOne({ where: { h3Index } });

      if (!exists) {
        const [centerLat, centerLng] = this.cellToLatLng(h3Index);
        const boundary = this.cellToBoundary(h3Index);

        const boundaryCoords = boundary.map(([lat, lng]) => `${lng} ${lat}`).join(', ');
        const firstCoord = `${boundary[0][1]} ${boundary[0][0]}`;
        const polygonWKT = `POLYGON((${boundaryCoords}, ${firstCoord}))`;
        const pointWKT = `POINT(${centerLng} ${centerLat})`;

        const cell = this.gridCellRepository.create({
          h3Index,
          resolution: this.H3_RESOLUTION,
          centerPointLat: centerLat,
          centerPointLng: centerLng,
          boundary: polygonWKT,
        });

        await this.gridCellRepository.save(cell);
        created++;
      }
    }

    return created;
  }
}
