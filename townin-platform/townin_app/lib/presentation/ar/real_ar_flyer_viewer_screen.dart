import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:geolocator/geolocator.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:vector_math/vector_math_64.dart' as vector;

import '../../core/theme/app_theme.dart';
import '../../core/mock/mock_data.dart';
import '../../core/utils/location_ar_converter.dart';
import '../../core/services/compass_service.dart';
import 'android_ar_view.dart';
import 'ios_ar_view.dart';

/// Real AR Flyer Viewer with ARCore/ARKit
class RealARFlyerViewerScreen extends ConsumerStatefulWidget {
  const RealARFlyerViewerScreen({super.key});

  @override
  ConsumerState<RealARFlyerViewerScreen> createState() =>
      _RealARFlyerViewerScreenState();
}

class _RealARFlyerViewerScreenState
    extends ConsumerState<RealARFlyerViewerScreen> {
  bool _isARActive = false;
  bool _permissionsGranted = false;
  Position? _currentLocation;
  double _heading = 0.0;
  final _compassService = CompassService();
  List<Map<String, dynamic>> _arFlyers = [];
  int _scannedCount = 0;

  // Mock flyer locations (실제로는 API에서 가져옴)
  final _flyerLocations = [
    {
      'id': '1',
      'storeName': '의정부 신선마트',
      'flyer': MockData.flyers[0],
      'lat': 37.7414,
      'lng': 127.0471,
    },
    {
      'id': '2',
      'storeName': '의정부 요가센터',
      'flyer': MockData.flyers[1],
      'lat': 37.7420,
      'lng': 127.0480,
    },
    {
      'id': '3',
      'storeName': '스타벅스 의정부역점',
      'flyer': MockData.flyers[2],
      'lat': 37.7408,
      'lng': 127.0465,
    },
  ];

  @override
  void initState() {
    super.initState();
    _checkPermissions();
  }

  @override
  void dispose() {
    _compassService.dispose();
    super.dispose();
  }

  Future<void> _checkPermissions() async {
    final cameraStatus = await Permission.camera.request();
    final locationStatus = await Permission.location.request();

    if (cameraStatus.isGranted && locationStatus.isGranted) {
      setState(() {
        _permissionsGranted = true;
      });
    } else {
      _showPermissionDialog();
    }
  }

  void _showPermissionDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: AppTheme.bgCard,
        title: const Text(
          'AR 권한 필요',
          style: TextStyle(color: AppTheme.textPrimary),
        ),
        content: const Text(
          'AR 기능을 사용하려면 카메라 및 위치 권한이 필요합니다.',
          style: TextStyle(color: AppTheme.textSecondary),
        ),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              Navigator.pop(context);
            },
            child: const Text('취소'),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              openAppSettings();
            },
            child: const Text('설정 열기'),
          ),
        ],
      ),
    );
  }

  Future<void> _startAR() async {
    if (!_permissionsGranted) {
      await _checkPermissions();
      if (!_permissionsGranted) return;
    }

    // Get current location
    try {
      _currentLocation = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
      );

      // Start compass
      _compassService.start((heading) {
        if (mounted) {
          setState(() {
            _heading = heading;
            _updateARPositions();
          });
        }
      });

      setState(() {
        _isARActive = true;
        _updateARPositions();
      });
    } catch (e) {
      print('Location error: $e');
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('위치를 가져올 수 없습니다')),
      );
    }
  }

  void _stopAR() {
    _compassService.stop();
    setState(() {
      _isARActive = false;
      _scannedCount = 0;
      _arFlyers.clear();
    });
  }

  void _updateARPositions() {
    if (_currentLocation == null) return;

    final updatedFlyers = <Map<String, dynamic>>[];

    for (var location in _flyerLocations) {
      final arPosition = LocationARConverter.gpsToARPosition(
        currentLat: _currentLocation!.latitude,
        currentLng: _currentLocation!.longitude,
        targetLat: location['lat'],
        targetLng: location['lng'],
        bearing: _heading,
      );

      // Only include if in viewport (100m, 90 degrees)
      if (LocationARConverter.isInViewport(arPosition)) {
        final distance = arPosition.length;
        final scale = LocationARConverter.getScaleForDistance(distance);

        updatedFlyers.add({
          ...location,
          'arPosition': arPosition * vector.Vector3(scale, scale, scale),
          'distance': LocationARConverter.formatDistance(distance),
        });
      }
    }

    setState(() {
      _arFlyers = updatedFlyers;
    });
  }

  void _handleFlyerTapped(Map<String, dynamic> flyer) {
    setState(() {
      _scannedCount++;
    });
    _showFlyerDetail(flyer['flyer']);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        children: [
          // AR View
          if (_isARActive && _permissionsGranted)
            _buildARView()
          else
            _buildInactiveView(),

          // Top Bar
          _buildTopBar(),

          // Bottom Controls
          _buildBottomControls(),
        ],
      ),
    );
  }

  Widget _buildARView() {
    if (Platform.isAndroid) {
      return AndroidARView(
        onFlyerTapped: _handleFlyerTapped,
        arFlyers: _arFlyers,
      );
    } else if (Platform.isIOS) {
      return IOSARView(
        onFlyerTapped: _handleFlyerTapped,
        arFlyers: _arFlyers,
      );
    } else {
      return _buildUnsupportedPlatform();
    }
  }

  Widget _buildInactiveView() {
    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [
            Colors.black,
            Colors.grey.shade900,
            Colors.black,
          ],
        ),
      ),
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.videocam_off,
              size: 80,
              color: Colors.white.withOpacity(0.3),
            ),
            const SizedBox(height: AppTheme.space4),
            Text(
              'AR 카메라를 시작하세요',
              style: TextStyle(
                color: Colors.white.withOpacity(0.7),
                fontSize: 18,
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: AppTheme.space2),
            Text(
              Platform.isAndroid
                  ? 'ARCore 지원 기기 필요'
                  : Platform.isIOS
                      ? 'ARKit 지원 기기 필요'
                      : 'AR은 모바일에서만 지원됩니다',
              style: TextStyle(
                color: Colors.white.withOpacity(0.5),
                fontSize: 14,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildUnsupportedPlatform() {
    return Center(
      child: Text(
        'AR은 Android 및 iOS에서만 지원됩니다',
        style: TextStyle(
          color: Colors.white.withOpacity(0.7),
          fontSize: 16,
        ),
      ),
    );
  }

  Widget _buildTopBar() {
    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.all(AppTheme.space4),
        child: Row(
          children: [
            Container(
              decoration: BoxDecoration(
                color: Colors.black.withOpacity(0.7),
                shape: BoxShape.circle,
              ),
              child: IconButton(
                icon: const Icon(Icons.close, color: Colors.white),
                onPressed: () => Navigator.pop(context),
              ),
            ),
            const Spacer(),
            Container(
              padding: const EdgeInsets.symmetric(
                horizontal: AppTheme.space3,
                vertical: AppTheme.space2,
              ),
              decoration: BoxDecoration(
                color: Colors.black.withOpacity(0.8),
                borderRadius: BorderRadius.circular(AppTheme.radiusPill),
                border: Border.all(
                  color: _isARActive ? Colors.green : Colors.red,
                  width: 2,
                ),
              ),
              child: Row(
                children: [
                  Container(
                    width: 10,
                    height: 10,
                    decoration: BoxDecoration(
                      color: _isARActive ? Colors.green : Colors.red,
                      shape: BoxShape.circle,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    _isARActive ? 'AR 활성' : 'AR 대기',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 13,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ],
              ),
            ),
            if (_isARActive) ...[
              const SizedBox(width: 12),
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                decoration: BoxDecoration(
                  color: AppTheme.accentGold.withOpacity(0.9),
                  borderRadius: BorderRadius.circular(AppTheme.radiusPill),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.visibility,
                        color: AppTheme.bgApp, size: 16),
                    const SizedBox(width: 4),
                    Text(
                      '$_scannedCount/${_arFlyers.length}',
                      style: const TextStyle(
                        color: AppTheme.bgApp,
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildBottomControls() {
    return Positioned(
      left: 0,
      right: 0,
      bottom: 0,
      child: SafeArea(
        child: Container(
          padding: const EdgeInsets.all(AppTheme.space4),
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.bottomCenter,
              end: Alignment.topCenter,
              colors: [
                Colors.black.withOpacity(0.95),
                Colors.black.withOpacity(0.0),
              ],
            ),
          ),
          child: Column(
            children: [
              // Stats
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  _buildStatBadge(
                      '주변 전단지', '${_arFlyers.length}개', Icons.receipt),
                  _buildStatBadge('획득 가능', '75P', Icons.stars),
                ],
              ),
              const SizedBox(height: AppTheme.space4),

              // AR Toggle Button
              ElevatedButton(
                onPressed: () {
                  if (_isARActive) {
                    _stopAR();
                  } else {
                    _startAR();
                  }
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor:
                      _isARActive ? Colors.red : AppTheme.accentGold,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(
                    horizontal: 48,
                    vertical: 18,
                  ),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(AppTheme.radiusLg),
                  ),
                  elevation: 12,
                  shadowColor:
                      (_isARActive ? Colors.red : AppTheme.accentGold)
                          .withOpacity(0.8),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                        _isARActive
                            ? Icons.stop_circle
                            : Icons.play_circle_filled,
                        size: 32),
                    const SizedBox(width: 12),
                    Text(
                      _isARActive ? 'AR 중지' : 'AR 시작',
                      style: const TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.w700,
                        letterSpacing: 1.2,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatBadge(String label, String value, IconData icon) {
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: AppTheme.space4,
        vertical: AppTheme.space3,
      ),
      decoration: BoxDecoration(
        color: Colors.black.withOpacity(0.8),
        borderRadius: BorderRadius.circular(AppTheme.radiusPill),
        border: Border.all(
          color: AppTheme.accentGold.withOpacity(0.6),
          width: 2,
        ),
      ),
      child: Row(
        children: [
          Icon(icon, color: AppTheme.accentGold, size: 20),
          const SizedBox(width: 10),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: TextStyle(
                  color: Colors.white.withOpacity(0.7),
                  fontSize: 11,
                ),
              ),
              Text(
                value,
                style: const TextStyle(
                  color: AppTheme.accentGold,
                  fontSize: 18,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  void _showFlyerDetail(Map<String, dynamic> flyer) {
    showModalBottomSheet(
      context: context,
      backgroundColor: AppTheme.bgCard,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(
          top: Radius.circular(AppTheme.radiusLg),
        ),
      ),
      builder: (context) => Container(
        padding: const EdgeInsets.all(AppTheme.space4),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              flyer['title'],
              style: const TextStyle(
                color: AppTheme.textPrimary,
                fontSize: 20,
                fontWeight: FontWeight.w700,
              ),
            ),
            const SizedBox(height: AppTheme.space2),
            Text(
              flyer['description'],
              style: const TextStyle(
                color: AppTheme.textSecondary,
                fontSize: 14,
              ),
            ),
            const SizedBox(height: AppTheme.space4),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () {
                  Navigator.pop(context);
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text('${flyer['points']}P 획득했습니다!'),
                      backgroundColor: AppTheme.accentGold,
                    ),
                  );
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.accentGold,
                  foregroundColor: AppTheme.bgApp,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.stars, size: 24),
                    const SizedBox(width: 8),
                    Text(
                      '${flyer['points']}P 획득하기',
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
