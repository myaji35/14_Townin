import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:h3_flutter/h3_flutter.dart';
import 'dart:ui' as ui;

/// Helper class for H3 geospatial operations
class H3Helper {
  static final h3 = const H3Factory().load();

  /// Convert lat/lng to H3 index at specified resolution
  /// Resolution ranges from 0 (largest hexagons) to 15 (smallest)
  /// For city-level visualization, use resolution 7-9
  static BigInt latLngToH3(double lat, double lng, int resolution) {
    final geo = GeoCoord(lat: lat, lon: lng);
    return h3.geoToH3(geo, resolution);
  }

  /// Convert H3 index to lat/lng center point
  static LatLng h3ToLatLng(BigInt h3Index) {
    final geo = h3.h3ToGeo(h3Index);
    return LatLng(geo.lat, geo.lon);
  }

  /// Get hexagon boundary points for drawing on map
  static List<LatLng> h3ToPolygon(BigInt h3Index) {
    final boundary = h3.h3ToGeoBoundary(h3Index);
    return boundary.map((geo) => LatLng(geo.lat, geo.lon)).toList();
  }

  /// Get all hexagons within radius (in hexagon steps, not km)
  static List<BigInt> kRing(BigInt h3Index, int k) {
    return h3.kRing(h3Index, k);
  }

  /// Calculate color based on density/value (for heatmap)
  static ui.Color getHeatmapColor(double value, double maxValue) {
    if (maxValue == 0) return const ui.Color(0x00000000); // Transparent

    final intensity = (value / maxValue).clamp(0.0, 1.0);

    // Color gradient: Blue -> Green -> Yellow -> Orange -> Red
    if (intensity < 0.2) {
      // Blue to Cyan
      return ui.Color.lerp(
        const ui.Color(0x802196F3), // Semi-transparent blue
        const ui.Color(0x8000BCD4),
        intensity * 5,
      )!;
    } else if (intensity < 0.4) {
      // Cyan to Green
      return ui.Color.lerp(
        const ui.Color(0x8000BCD4),
        const ui.Color(0x804CAF50),
        (intensity - 0.2) * 5,
      )!;
    } else if (intensity < 0.6) {
      // Green to Yellow
      return ui.Color.lerp(
        const ui.Color(0x804CAF50),
        const ui.Color(0x80FFEB3B),
        (intensity - 0.4) * 5,
      )!;
    } else if (intensity < 0.8) {
      // Yellow to Orange
      return ui.Color.lerp(
        const ui.Color(0x80FFEB3B),
        const ui.Color(0x80FF9800),
        (intensity - 0.6) * 5,
      )!;
    } else {
      // Orange to Red
      return ui.Color.lerp(
        const ui.Color(0x80FF9800),
        const ui.Color(0x80F44336),
        (intensity - 0.8) * 5,
      )!;
    }
  }

  /// Generate hexagon polygons with colors for heatmap visualization
  static Set<Polygon> generateHeatmapPolygons({
    required Map<BigInt, double> h3Data,
    required double maxValue,
  }) {
    final polygons = <Polygon>{};

    h3Data.forEach((h3Index, value) {
      final boundary = h3ToPolygon(h3Index);
      final color = getHeatmapColor(value, maxValue);

      polygons.add(
        Polygon(
          polygonId: PolygonId(h3Index.toString()),
          points: boundary,
          strokeWidth: 1,
          strokeColor: color.withOpacity(0.8),
          fillColor: color,
        ),
      );
    });

    return polygons;
  }

  /// Get H3 resolution recommendation based on zoom level
  static int getResolutionForZoom(double zoom) {
    if (zoom < 6) return 4;  // Country level
    if (zoom < 8) return 5;  // State/Province level
    if (zoom < 10) return 6; // City level
    if (zoom < 12) return 7; // District level
    if (zoom < 14) return 8; // Neighborhood level
    if (zoom < 16) return 9; // Street level
    return 10; // Building level
  }
}
