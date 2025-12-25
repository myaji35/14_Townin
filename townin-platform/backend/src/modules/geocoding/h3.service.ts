import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GridCell } from '../grid-cells/entities/grid-cell.entity';
import {
  latLngToCell,
  cellToBoundary,
  cellToLatLng,
  gridDisk,
  cellToParent,
  cellToChildren,
  greatCircleDistance,
  getHexagonEdgeLengthAvg,
  getHexagonAreaAvg,
  UNITS,
} from 'h3-js';

const H3_RESOLUTION = 9; // ~174m hexagon edge length

export interface H3Cell {
  h3Index: string;
  lat: number;
  lng: number;
  resolution: number;
}

export interface H3Boundary {
  h3Index: string;
  coordinates: Array<[number, number]>;
}

@Injectable()
export class H3Service {
  constructor(
    @InjectRepository(GridCell)
    private gridCellRepository: Repository<GridCell>,
  ) {}

  /**
   * Convert lat/lng to H3 index
   */
  latLngToH3(lat: number, lng: number, resolution: number = H3_RESOLUTION): string {
    return latLngToCell(lat, lng, resolution);
  }

  /**
   * Get neighboring H3 cells (k-ring)
   */
  async getNeighbors(h3Index: string, ringSize: number = 1): Promise<string[]> {
    return gridDisk(h3Index, ringSize);
  }

  /**
   * Get H3 cells within radius (in meters)
   */
  async getCellsWithinRadius(
    lat: number,
    lng: number,
    radiusMeters: number,
    resolution: number = H3_RESOLUTION,
  ): Promise<string[]> {
    const centerH3 = this.latLngToH3(lat, lng, resolution);

    // Calculate ring size based on radius
    // At resolution 9, each hexagon is ~174m edge length
    const hexagonEdgeLength = this.getHexagonEdgeLength(resolution);
    const ringSize = Math.ceil(radiusMeters / hexagonEdgeLength);

    return this.getNeighbors(centerH3, ringSize);
  }

  /**
   * Get hexagon edge length for given resolution (in meters)
   */
  getHexagonEdgeLength(resolution: number): number {
    return getHexagonEdgeLengthAvg(resolution, UNITS.m);
  }

  /**
   * Get hexagon area for given resolution (in square meters)
   */
  getHexagonArea(resolution: number): number {
    return getHexagonAreaAvg(resolution, UNITS.m2);
  }

  /**
   * Get parent cell (coarser resolution)
   */
  getParent(h3Index: string, parentResolution: number): string {
    return cellToParent(h3Index, parentResolution);
  }

  /**
   * Get children cells (finer resolution)
   */
  getChildren(h3Index: string, childResolution: number): string[] {
    return cellToChildren(h3Index, childResolution);
  }

  /**
   * Check if point is within H3 cell
   */
  isPointInCell(lat: number, lng: number, h3Index: string): boolean {
    const pointH3 = this.latLngToH3(lat, lng);
    return pointH3 === h3Index;
  }

  /**
   * Get H3 cell boundary coordinates
   */
  async getCellBoundary(h3Index: string): Promise<Array<[number, number]>> {
    const boundary = cellToBoundary(h3Index);
    // Convert from [lat, lng] to [lng, lat] for GeoJSON
    return boundary.map(([lat, lng]) => [lng, lat]);
  }

  /**
   * Get H3 cell center coordinates
   */
  getCellCenter(h3Index: string): { lat: number; lng: number } {
    const [lat, lng] = cellToLatLng(h3Index);
    return { lat, lng };
  }

  /**
   * Get distance between two coordinates (in meters)
   */
  getDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
  ): number {
    return greatCircleDistance([lat1, lng1], [lat2, lng2], UNITS.m);
  }
}
