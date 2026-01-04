import 'dart:math' as math;
import 'package:vector_math/vector_math_64.dart' as vector;

/// Location to AR coordinate converter
class LocationARConverter {
  static const double earthRadius = 6371000; // meters

  /// Convert GPS coordinates to AR position
  /// 
  /// [currentLat] Current user latitude
  /// [currentLng] Current user longitude
  /// [targetLat] Target location latitude
  /// [targetLng] Target location longitude
  /// [bearing] Device compass bearing (0-360 degrees)
  /// 
  /// Returns Vector3 position for AR placement
  static vector.Vector3 gpsToARPosition({
    required double currentLat,
    required double currentLng,
    required double targetLat,
    required double targetLng,
    required double bearing,
  }) {
    // Calculate distance in meters
    final distance = calculateDistance(
      currentLat,
      currentLng,
      targetLat,
      targetLng,
    );

    // Calculate bearing to target
    final targetBearing = calculateBearing(
      currentLat,
      currentLng,
      targetLat,
      targetLng,
    );

    // Calculate relative angle (based on device heading)
    final relativeAngle = (targetBearing - bearing + 360) % 360;
    final angleRad = relativeAngle * math.pi / 180;

    // Convert to AR coordinates
    // In AR: X = left/right, Y = up/down, Z = forward/back
    final x = distance * math.sin(angleRad);
    final z = -distance * math.cos(angleRad); // Negative Z is forward in AR
    final y = 0.0; // Ground level (can be adjusted based on elevation)

    return vector.Vector3(x, y, z);
  }

  /// Calculate distance between two GPS coordinates (Haversine formula)
  static double calculateDistance(
    double lat1,
    double lng1,
    double lat2,
    double lng2,
  ) {
    final dLat = _toRadians(lat2 - lat1);
    final dLng = _toRadians(lng2 - lng1);

    final a = math.sin(dLat / 2) * math.sin(dLat / 2) +
        math.cos(_toRadians(lat1)) *
            math.cos(_toRadians(lat2)) *
            math.sin(dLng / 2) *
            math.sin(dLng / 2);

    final c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a));
    return earthRadius * c;
  }

  /// Calculate bearing from current location to target
  static double calculateBearing(
    double lat1,
    double lng1,
    double lat2,
    double lng2,
  ) {
    final dLng = _toRadians(lng2 - lng1);
    final lat1Rad = _toRadians(lat1);
    final lat2Rad = _toRadians(lat2);

    final y = math.sin(dLng) * math.cos(lat2Rad);
    final x = math.cos(lat1Rad) * math.sin(lat2Rad) -
        math.sin(lat1Rad) * math.cos(lat2Rad) * math.cos(dLng);

    final bearing = math.atan2(y, x) * 180 / math.pi;
    return (bearing + 360) % 360;
  }

  /// Convert degrees to radians
  static double _toRadians(double degrees) {
    return degrees * math.pi / 180;
  }

  /// Check if position is within viewport
  /// 
  /// [position] AR position vector
  /// [maxDistance] Maximum distance in meters (default 100m)
  /// [maxAngle] Maximum angle from center (default 90 degrees)
  static bool isInViewport(
    vector.Vector3 position, {
    double maxDistance = 100,
    double maxAngle = 90,
  }) {
    // Check distance
    final distance = position.length;
    if (distance > maxDistance) return false;

    // Check angle (-90 to 90 degrees)
    final angle = math.atan2(position.x, -position.z) * 180 / math.pi;
    return angle.abs() < maxAngle;
  }

  /// Get scale for LOD (Level of Detail) based on distance
  static double getScaleForDistance(double distance) {
    if (distance < 20) return 0.3;
    if (distance < 50) return 0.2;
    if (distance < 100) return 0.15;
    return 0.1;
  }

  /// Format distance for display
  static String formatDistance(double meters) {
    if (meters < 1000) {
      return '${meters.round()}m';
    } else {
      return '${(meters / 1000).toStringAsFixed(1)}km';
    }
  }
}
