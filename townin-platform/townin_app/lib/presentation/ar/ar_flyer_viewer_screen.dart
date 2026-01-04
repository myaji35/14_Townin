import 'dart:async';
import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/theme/app_theme.dart';
import '../../core/mock/mock_data.dart';

/// Epic USR-010: AR Flyer Viewer (Phase 2) - Enhanced
/// AR 카메라로 주변 매장의 전단지를 3D로 표시
class ARFlyerViewerScreen extends ConsumerStatefulWidget {
  const ARFlyerViewerScreen({super.key});

  @override
  ConsumerState<ARFlyerViewerScreen> createState() => _ARFlyerViewerScreenState();
}

class _ARFlyerViewerScreenState extends ConsumerState<ARFlyerViewerScreen>
    with SingleTickerProviderStateMixin {
  bool _isARActive = false;
  String _selectedFilter = 'all';
  double _compassRotation = 0.0;
  Timer? _compassTimer;
  late AnimationController _pulseController;
  int _scannedCount = 0;

  // Mock AR 전단지 데이터
  final _arFlyers = [
    {
      'storeName': '의정부 신선마트',
      'distance': '25m',
      'direction': '정면',
      'flyer': MockData.flyers[0],
      'angle': 0, // 0도 = 정면
      'visible': true,
    },
    {
      'storeName': '의정부 요가센터',
      'distance': '42m',
      'direction': '우측',
      'flyer': MockData.flyers[1],
      'angle': 45, // 45도 = 우측
      'visible': true,
    },
    {
      'storeName': '스타벅스 의정부역점',
      'distance': '35m',
      'direction': '좌측',
      'flyer': MockData.flyers[2],
      'angle': -30, // -30도 = 좌측
      'visible': true,
    },
  ];

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _compassTimer?.cancel();
    _pulseController.dispose();
    super.dispose();
  }

  void _startCompassSimulation() {
    _compassTimer = Timer.periodic(const Duration(milliseconds: 100), (timer) {
      setState(() {
        _compassRotation += 0.5;
        if (_compassRotation >= 360) _compassRotation = 0;
      });
    });
  }

  void _stopCompassSimulation() {
    _compassTimer?.cancel();
    setState(() {
      _compassRotation = 0;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        children: [
          // AR Camera View (Placeholder)
          _buildCameraView(),

          // AR Overlays
          if (_isARActive) _buildAROverlays(),

          // Scanning Effect
          if (_isARActive) _buildScanningEffect(),

          // Top Controls
          _buildTopBar(),

          // Bottom Controls
          _buildBottomControls(),

          // Tutorial Overlay
          if (!_isARActive) _buildTutorialOverlay(),
        ],
      ),
    );
  }

  Widget _buildCameraView() {
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
      child: _isARActive
          ? _buildActiveCameraPlaceholder()
          : _buildInactiveCameraPlaceholder(),
    );
  }

  Widget _buildActiveCameraPlaceholder() {
    return Stack(
      children: [
        // Grid overlay
        CustomPaint(
          size: Size.infinite,
          painter: ARGridPainter(),
        ),
        // Scanning lines
        AnimatedBuilder(
          animation: _pulseController,
          builder: (context, child) {
            return Positioned(
              left: 0,
              right: 0,
              top: MediaQuery.of(context).size.height * _pulseController.value,
              child: Container(
                height: 2,
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [
                      Colors.transparent,
                      AppTheme.accentGold.withOpacity(0.8),
                      Colors.transparent,
                    ],
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: AppTheme.accentGold.withOpacity(0.5),
                      blurRadius: 20,
                      spreadRadius: 2,
                    ),
                  ],
                ),
              ),
            );
          },
        ),
      ],
    );
  }

  Widget _buildInactiveCameraPlaceholder() {
    return Center(
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
            '카메라 권한 및 ARCore/ARKit 필요',
            style: TextStyle(
              color: Colors.white.withOpacity(0.5),
              fontSize: 14,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildScanningEffect() {
    return Positioned.fill(
      child: CustomPaint(
        painter: ARScannerPainter(rotation: _compassRotation),
      ),
    );
  }

  Widget _buildAROverlays() {
    return Stack(
      children: [
        // AR Compass
        Positioned(
          top: 100,
          left: 0,
          right: 0,
          child: _buildARCompass(),
        ),

        // Distance Ruler
        Positioned(
          left: 20,
          top: 200,
          child: _buildDistanceRuler(),
        ),

        // AR Flyer Markers
        ..._arFlyers
            .where((f) => f['visible'] as bool)
            .map((arFlyer) => _buildARMarker(arFlyer))
            .toList(),
      ],
    );
  }

  Widget _buildARCompass() {
    return Center(
      child: Container(
        width: 240,
        height: 70,
        padding: const EdgeInsets.all(AppTheme.space3),
        decoration: BoxDecoration(
          color: Colors.black.withOpacity(0.8),
          borderRadius: BorderRadius.circular(AppTheme.radiusLg),
          border: Border.all(
            color: AppTheme.accentGold.withOpacity(0.7),
            width: 2,
          ),
          boxShadow: [
            BoxShadow(
              color: AppTheme.accentGold.withOpacity(0.3),
              blurRadius: 15,
              spreadRadius: 2,
            ),
          ],
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceAround,
          children: [
            _buildCompassDirection('←', '서', _compassRotation > 225 && _compassRotation < 315),
            Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Text(
                  '정면',
                  style: TextStyle(
                    color: AppTheme.accentGold,
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                    letterSpacing: 1.2,
                  ),
                ),
                Text(
                  '${_compassRotation.toInt()}°',
                  style: TextStyle(
                    color: Colors.white.withOpacity(0.6),
                    fontSize: 10,
                  ),
                ),
              ],
            ),
            _buildCompassDirection('→', '동', _compassRotation > 45 && _compassRotation < 135),
          ],
        ),
      ),
    );
  }

  Widget _buildCompassDirection(String arrow, String label, bool isActive) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Text(
          arrow,
          style: TextStyle(
            color: isActive ? AppTheme.accentGold : Colors.white.withOpacity(0.3),
            fontSize: 20,
            fontWeight: FontWeight.bold,
          ),
        ),
        Text(
          label,
          style: TextStyle(
            color: isActive ? AppTheme.accentGold : Colors.white.withOpacity(0.3),
            fontSize: 10,
          ),
        ),
      ],
    );
  }

  Widget _buildDistanceRuler() {
    return Container(
      width: 40,
      height: 200,
      decoration: BoxDecoration(
        color: Colors.black.withOpacity(0.7),
        borderRadius: BorderRadius.circular(AppTheme.radiusMd),
        border: Border.all(
          color: AppTheme.accentGold.withOpacity(0.3),
          width: 1,
        ),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        children: [
          _buildRulerMark('50m'),
          _buildRulerMark('40m'),
          _buildRulerMark('30m'),
          _buildRulerMark('20m'),
          _buildRulerMark('10m'),
        ],
      ),
    );
  }

  Widget _buildRulerMark(String distance) {
    return Row(
      children: [
        Container(
          width: 15,
          height: 1,
          color: AppTheme.accentGold.withOpacity(0.5),
        ),
        const SizedBox(width: 4),
        Text(
          distance,
          style: TextStyle(
            color: Colors.white.withOpacity(0.6),
            fontSize: 8,
          ),
        ),
      ],
    );
  }

  Widget _buildARMarker(Map<String, dynamic> arFlyer) {
    final angle = arFlyer['angle'] as int;
    double left = MediaQuery.of(context).size.width / 2 - 100;
    if (angle > 0) {
      left += angle * 3;
    } else {
      left += angle * 3;
    }

    return Positioned(
      left: left.clamp(20, MediaQuery.of(context).size.width - 220),
      top: 200 + (angle.abs() * 2),
      child: GestureDetector(
        onTap: () {
          setState(() {
            _scannedCount++;
          });
          _showFlyerDetail(arFlyer['flyer']);
        },
        child: AnimatedBuilder(
          animation: _pulseController,
          builder: (context, child) {
            return Transform.scale(
              scale: 1.0 + (_pulseController.value * 0.05),
              child: Container(
                width: 200,
                padding: const EdgeInsets.all(AppTheme.space3),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [
                      AppTheme.accentGold.withOpacity(0.95),
                      AppTheme.accentGold.withOpacity(0.8),
                    ],
                  ),
                  borderRadius: BorderRadius.circular(AppTheme.radiusMd),
                  boxShadow: [
                    BoxShadow(
                      color: AppTheme.accentGold.withOpacity(0.6),
                      blurRadius: 20 + (_pulseController.value * 10),
                      spreadRadius: 2 + (_pulseController.value * 2),
                    ),
                  ],
                  border: Border.all(
                    color: Colors.white.withOpacity(0.3),
                    width: 2,
                  ),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(6),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: const Icon(Icons.store, color: AppTheme.bgApp, size: 18),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            arFlyer['storeName'],
                            style: const TextStyle(
                              color: AppTheme.bgApp,
                              fontSize: 14,
                              fontWeight: FontWeight.w700,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),
                    Row(
                      children: [
                        Icon(Icons.location_on,
                            color: AppTheme.bgApp.withOpacity(0.8), size: 14),
                        const SizedBox(width: 4),
                        Text(
                          '${arFlyer['distance']} • ${arFlyer['direction']}',
                          style: TextStyle(
                            color: AppTheme.bgApp.withOpacity(0.9),
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        const Spacer(),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: Colors.red,
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: const Text(
                            'NEW',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 9,
                              fontWeight: FontWeight.w900,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 8,
                      ),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(AppTheme.radiusPill),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.2),
                            blurRadius: 4,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: const [
                          Icon(Icons.touch_app, size: 14, color: AppTheme.bgApp),
                          SizedBox(width: 4),
                          Text(
                            '전단지 보기',
                            style: TextStyle(
                              color: AppTheme.bgApp,
                              fontSize: 12,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        ),
      ),
    );
  }

  Widget _buildTutorialOverlay() {
    return Positioned(
      bottom: 150,
      left: 20,
      right: 20,
      child: Container(
        padding: const EdgeInsets.all(AppTheme.space4),
        decoration: BoxDecoration(
          color: AppTheme.accentGold.withOpacity(0.9),
          borderRadius: BorderRadius.circular(AppTheme.radiusMd),
          boxShadow: [
            BoxShadow(
              color: AppTheme.accentGold.withOpacity(0.5),
              blurRadius: 20,
              spreadRadius: 2,
            ),
          ],
        ),
        child: Column(
          children: [
            const Icon(Icons.info_outline, color: AppTheme.bgApp, size: 32),
            const SizedBox(height: 12),
            const Text(
              'AR 모드 사용법',
              style: TextStyle(
                color: AppTheme.bgApp,
                fontSize: 18,
                fontWeight: FontWeight.w700,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              '1. "AR 시작" 버튼을 눌러 AR 모드 활성화\n'
              '2. 카메라를 주변으로 천천히 이동\n'
              '3. 금색 마커를 탭하여 전단지 확인\n'
              '4. 전단지 보기로 포인트 획득',
              style: TextStyle(
                color: AppTheme.bgApp.withOpacity(0.9),
                fontSize: 13,
                height: 1.5,
              ),
              textAlign: TextAlign.center,
            ),
          ],
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
                boxShadow: [
                  BoxShadow(
                    color: (_isARActive ? Colors.green : Colors.red).withOpacity(0.5),
                    blurRadius: 10,
                    spreadRadius: 1,
                  ),
                ],
              ),
              child: Row(
                children: [
                  AnimatedBuilder(
                    animation: _pulseController,
                    builder: (context, child) {
                      return Container(
                        width: 10,
                        height: 10,
                        decoration: BoxDecoration(
                          color: _isARActive ? Colors.green : Colors.red,
                          shape: BoxShape.circle,
                          boxShadow: _isARActive
                              ? [
                                  BoxShadow(
                                    color: Colors.green.withOpacity(0.8 * _pulseController.value),
                                    blurRadius: 8,
                                    spreadRadius: 2,
                                  ),
                                ]
                              : null,
                        ),
                      );
                    },
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
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                decoration: BoxDecoration(
                  color: AppTheme.accentGold.withOpacity(0.9),
                  borderRadius: BorderRadius.circular(AppTheme.radiusPill),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.visibility, color: AppTheme.bgApp, size: 16),
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
                  setState(() {
                    _isARActive = !_isARActive;
                    if (_isARActive) {
                      _startCompassSimulation();
                    } else {
                      _stopCompassSimulation();
                      _scannedCount = 0;
                    }
                  });
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: _isARActive ? Colors.red : AppTheme.accentGold,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(
                    horizontal: 48,
                    vertical: 18,
                  ),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(AppTheme.radiusLg),
                  ),
                  elevation: 12,
                  shadowColor: (_isARActive ? Colors.red : AppTheme.accentGold)
                      .withOpacity(0.8),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(_isARActive ? Icons.stop_circle : Icons.play_circle_filled,
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
        boxShadow: [
          BoxShadow(
            color: AppTheme.accentGold.withOpacity(0.3),
            blurRadius: 10,
            spreadRadius: 1,
          ),
        ],
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
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (context) => Container(
        margin: const EdgeInsets.only(top: 100),
        decoration: const BoxDecoration(
          color: AppTheme.bgCard,
          borderRadius: BorderRadius.vertical(
            top: Radius.circular(AppTheme.radiusLg),
          ),
        ),
        child: Stack(
          children: [
            // Content
            SingleChildScrollView(
              padding: const EdgeInsets.all(AppTheme.space4),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SizedBox(height: 40),
                  Center(
                    child: Container(
                      width: 60,
                      height: 5,
                      decoration: BoxDecoration(
                        color: AppTheme.textSecondary.withOpacity(0.3),
                        borderRadius: BorderRadius.circular(10),
                      ),
                    ),
                  ),
                  const SizedBox(height: AppTheme.space4),
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 12,
                          vertical: 6,
                        ),
                        decoration: BoxDecoration(
                          color: AppTheme.accentGold.withOpacity(0.2),
                          borderRadius: BorderRadius.circular(AppTheme.radiusPill),
                          border: Border.all(
                            color: AppTheme.accentGold,
                            width: 1,
                          ),
                        ),
                        child: const Text(
                          'AI 추천',
                          style: TextStyle(
                            color: AppTheme.accentGold,
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 12,
                          vertical: 6,
                        ),
                        decoration: BoxDecoration(
                          color: Colors.red,
                          borderRadius: BorderRadius.circular(AppTheme.radiusPill),
                        ),
                        child: Text(
                          flyer['discount'] ?? '할인',
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 11,
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: AppTheme.space3),
                  Text(
                    flyer['title'],
                    style: const TextStyle(
                      color: AppTheme.textPrimary,
                      fontSize: 24,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: AppTheme.space2),
                  Text(
                    flyer['description'],
                    style: const TextStyle(
                      color: AppTheme.textSecondary,
                      fontSize: 15,
                      height: 1.5,
                    ),
                  ),
                  const SizedBox(height: AppTheme.space4),
                  Row(
                    children: [
                      const Icon(Icons.location_on,
                          color: AppTheme.accentGold, size: 18),
                      const SizedBox(width: 4),
                      Text(
                        flyer['location'] ?? '의정부동',
                        style: const TextStyle(
                          color: AppTheme.textSecondary,
                          fontSize: 13,
                        ),
                      ),
                      const SizedBox(width: 16),
                      const Icon(Icons.access_time,
                          color: AppTheme.accentGold, size: 18),
                      const SizedBox(width: 4),
                      Text(
                        flyer['validUntil'] ?? '12/31까지',
                        style: const TextStyle(
                          color: AppTheme.textSecondary,
                          fontSize: 13,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: AppTheme.space5),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: () {
                        Navigator.pop(context);
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text('${flyer['points']}P 획득했습니다!'),
                            backgroundColor: AppTheme.accentGold,
                            behavior: SnackBarBehavior.floating,
                          ),
                        );
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppTheme.accentGold,
                        foregroundColor: AppTheme.bgApp,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(AppTheme.radiusMd),
                        ),
                        elevation: 8,
                        shadowColor: AppTheme.accentGold.withOpacity(0.5),
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
            // Close button
            Positioned(
              top: 12,
              right: 12,
              child: IconButton(
                icon: const Icon(Icons.close, color: AppTheme.textSecondary),
                onPressed: () => Navigator.pop(context),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// Custom Painter for AR Grid
class ARGridPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = AppTheme.accentGold.withOpacity(0.1)
      ..strokeWidth = 0.5;

    const gridSize = 50.0;
    for (double i = 0; i < size.width; i += gridSize) {
      canvas.drawLine(
        Offset(i, 0),
        Offset(i, size.height),
        paint,
      );
    }
    for (double i = 0; i < size.height; i += gridSize) {
      canvas.drawLine(
        Offset(0, i),
        Offset(size.width, i),
        paint,
      );
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

// Custom Painter for AR Scanner Effect
class ARScannerPainter extends CustomPainter {
  final double rotation;

  ARScannerPainter({required this.rotation});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = AppTheme.accentGold.withOpacity(0.2)
      ..strokeWidth = 2
      ..style = PaintingStyle.stroke;

    final center = Offset(size.width / 2, size.height / 2);
    final radius = math.min(size.width, size.height) / 3;

    canvas.save();
    canvas.translate(center.dx, center.dy);
    canvas.rotate(rotation * math.pi / 180);
    canvas.translate(-center.dx, -center.dy);

    for (int i = 0; i < 8; i++) {
      final angle = (i * 45) * math.pi / 180;
      final x1 = center.dx + radius * math.cos(angle);
      final y1 = center.dy + radius * math.sin(angle);
      final x2 = center.dx + (radius + 30) * math.cos(angle);
      final y2 = center.dy + (radius + 30) * math.sin(angle);

      canvas.drawLine(Offset(x1, y1), Offset(x2, y2), paint);
    }

    canvas.restore();
  }

  @override
  bool shouldRepaint(ARScannerPainter oldDelegate) => rotation != oldDelegate.rotation;
}
