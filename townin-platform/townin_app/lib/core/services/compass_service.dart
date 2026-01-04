import 'dart:async';
import 'dart:math' as math;
import 'package:sensors_plus/sensors_plus.dart';

/// Compass service for device heading
class CompassService {
  StreamSubscription<MagnetometerEvent>? _magnetometerSubscription;
  StreamSubscription<AccelerometerEvent>? _accelerometerSubscription;

  double _heading = 0.0;
  double? _lastMagX, _lastMagY, _lastMagZ;
  double? _lastAccX, _lastAccY, _lastAccZ;

  /// Start listening to compass
  void start(Function(double) onHeadingChanged) {
    // Listen to magnetometer (compass)
    _magnetometerSubscription = magnetometerEvents.listen((event) {
      _lastMagX = event.x;
      _lastMagY = event.y;
      _lastMagZ = event.z;
      _updateHeading(onHeadingChanged);
    });

    // Listen to accelerometer (device tilt)
    _accelerometerSubscription = accelerometerEvents.listen((event) {
      _lastAccX = event.x;
      _lastAccY = event.y;
      _lastAccZ = event.z;
      _updateHeading(onHeadingChanged);
    });
  }

  void _updateHeading(Function(double) onHeadingChanged) {
    if (_lastMagX == null || _lastAccX == null) return;

    // Calculate heading using magnetometer and accelerometer
    // This compensates for device tilt
    final heading = _calculateHeading(
      _lastMagX!,
      _lastMagY!,
      _lastMagZ!,
      _lastAccX!,
      _lastAccY!,
      _lastAccZ!,
    );

    if ((_heading - heading).abs() > 1.0) {
      // Only update if change is significant (> 1 degree)
      _heading = heading;
      onHeadingChanged(_heading);
    }
  }

  double _calculateHeading(
    double magX,
    double magY,
    double magZ,
    double accX,
    double accY,
    double accZ,
  ) {
    // Normalize accelerometer vector
    final accNorm = math.sqrt(accX * accX + accY * accY + accZ * accZ);
    accX /= accNorm;
    accY /= accNorm;
    accZ /= accNorm;

    // Calculate pitch and roll
    final pitch = math.asin(-accX);
    final roll = math.atan2(accY, accZ);

    // Tilt-compensated heading
    final magXComp =
        magX * math.cos(pitch) + magZ * math.sin(pitch);
    final magYComp = magX * math.sin(roll) * math.sin(pitch) +
        magY * math.cos(roll) -
        magZ * math.sin(roll) * math.cos(pitch);

    // Calculate heading (0-360 degrees)
    double heading = math.atan2(magYComp, magXComp) * 180 / math.pi;

    // Normalize to 0-360
    if (heading < 0) heading += 360;

    return heading;
  }

  /// Get current heading
  double get currentHeading => _heading;

  /// Get compass direction text
  String getDirectionText(double heading) {
    const directions = [
      '북', '북동', '동', '남동',
      '남', '남서', '서', '북서'
    ];
    final index = ((heading + 22.5) / 45).floor() % 8;
    return directions[index];
  }

  /// Stop listening
  void stop() {
    _magnetometerSubscription?.cancel();
    _accelerometerSubscription?.cancel();
    _magnetometerSubscription = null;
    _accelerometerSubscription = null;
  }

  /// Dispose
  void dispose() {
    stop();
  }
}
