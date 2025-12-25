import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:geolocator/geolocator.dart';
import '../../flyer/data/flyer_repository.dart';
import '../../flyer/presentation/flyer_detail_screen.dart';
import '../../safety_map/presentation/safety_map_screen.dart';
import '../../maps/presentation/flyer_map_screen.dart';

class UserDashboard extends StatefulWidget {
  const UserDashboard({super.key});

  @override
  State<UserDashboard> createState() => _UserDashboardState();
}

class _UserDashboardState extends State<UserDashboard> {
  final _flyerRepository = FlyerRepository();
  List<Map<String, dynamic>> _flyers = [];
  bool _isLoadingFlyers = true;
  GoogleMapController? _mapController;
  Position? _currentPosition;
  final Set<Marker> _safetyMarkers = {};

  // Default location: Uijeongbu City Hall
  static const LatLng _defaultLocation = LatLng(37.7381, 127.0336);

  @override
  void initState() {
    super.initState();
    _loadFlyers();
    _initializeMap();
  }

  Future<void> _initializeMap() async {
    await _getCurrentLocation();
    await _loadSafetyMarkers();
  }

  Future<void> _getCurrentLocation() async {
    try {
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) return;

      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) return;
      }

      if (permission == LocationPermission.deniedForever) return;

      _currentPosition = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
      );
      setState(() {});
    } catch (e) {
      print('Error getting location: $e');
    }
  }

  Future<void> _loadSafetyMarkers() async {
    // Sample safety data (top 3 nearby for preview)
    final List<Map<String, dynamic>> safetyData = [
      {
        'id': 'cctv_1',
        'lat': 37.7381,
        'lng': 127.0336,
        'name': 'CCTV',
        'icon': BitmapDescriptor.hueBlue,
      },
      {
        'id': 'light_1',
        'lat': 37.7360,
        'lng': 127.0320,
        'name': '가로등',
        'icon': BitmapDescriptor.hueYellow,
      },
      {
        'id': 'parking_1',
        'lat': 37.7390,
        'lng': 127.0340,
        'name': '안전 주차장',
        'icon': BitmapDescriptor.hueGreen,
      },
    ];

    setState(() {
      _safetyMarkers.clear();
      for (var data in safetyData) {
        _safetyMarkers.add(
          Marker(
            markerId: MarkerId(data['id']),
            position: LatLng(data['lat'], data['lng']),
            infoWindow: InfoWindow(title: data['name']),
            icon: BitmapDescriptor.defaultMarkerWithHue(data['icon']),
          ),
        );
      }
    });
  }

  @override
  void dispose() {
    _mapController?.dispose();
    super.dispose();
  }

  Future<void> _loadFlyers() async {
    try {
      final flyers = await _flyerRepository.getAllFlyers();
      setState(() {
        _flyers = flyers.take(5).toList(); // Take first 5 flyers
        _isLoadingFlyers = false;
      });
    } catch (e) {
      setState(() {
        _isLoadingFlyers = false;
      });
      print('Failed to load flyers: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[100],
      appBar: AppBar(
        title: const Text('Townin'),
        backgroundColor: const Color(0xFF6366F1),
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_outlined),
            onPressed: () {},
          ),
          IconButton(
            icon: const Icon(Icons.person_outline),
            onPressed: () {},
          ),
        ],
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Hero Section
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    const Color(0xFF6366F1),
                    const Color(0xFF6366F1).withOpacity(0.8),
                  ],
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    '안녕하세요!',
                    style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                        ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    '의정부동의 새로운 소식을 확인해보세요',
                    style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                          color: Colors.white.withOpacity(0.9),
                        ),
                  ),
                  const SizedBox(height: 16),
                  // Location Pills
                  Row(
                    children: [
                      _buildLocationPill('🏠 집', true),
                      const SizedBox(width: 8),
                      _buildLocationPill('💼 회사', false),
                      const SizedBox(width: 8),
                      _buildLocationPill('👨‍👩‍👧 가족집', false),
                    ],
                  ),
                ],
              ),
            ),

            // Safety Map Preview
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Text(
                        '안전 맵',
                        style: Theme.of(context).textTheme.titleLarge?.copyWith(
                              fontWeight: FontWeight.bold,
                            ),
                      ),
                      const Spacer(),
                      TextButton(
                        onPressed: () {
                          Navigator.of(context).push(
                            MaterialPageRoute(
                              builder: (context) => const SafetyMapScreen(),
                            ),
                          );
                        },
                        child: const Text('더보기'),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Container(
                    height: 200,
                    decoration: BoxDecoration(
                      color: Colors.grey[300],
                      borderRadius: BorderRadius.circular(12),
                    ),
                    clipBehavior: Clip.antiAlias,
                    child: Stack(
                      children: [
                        GoogleMap(
                          onMapCreated: (controller) {
                            _mapController = controller;
                          },
                          initialCameraPosition: CameraPosition(
                            target: _currentPosition != null
                                ? LatLng(_currentPosition!.latitude,
                                    _currentPosition!.longitude)
                                : _defaultLocation,
                            zoom: 14.0,
                          ),
                          markers: _safetyMarkers,
                          myLocationEnabled: true,
                          myLocationButtonEnabled: false,
                          zoomControlsEnabled: false,
                          mapToolbarEnabled: false,
                          zoomGesturesEnabled: false,
                          scrollGesturesEnabled: false,
                          rotateGesturesEnabled: false,
                          tiltGesturesEnabled: false,
                        ),
                        // Tap overlay to navigate to full map
                        Positioned.fill(
                          child: Material(
                            color: Colors.transparent,
                            child: InkWell(
                              onTap: () {
                                Navigator.of(context).push(
                                  MaterialPageRoute(
                                    builder: (context) => const SafetyMapScreen(),
                                  ),
                                );
                              },
                            ),
                          ),
                        ),
                        // Legend overlay
                        Positioned(
                          top: 8,
                          left: 8,
                          child: Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 8,
                              vertical: 4,
                            ),
                            decoration: BoxDecoration(
                              color: Colors.white.withOpacity(0.9),
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(Icons.security, size: 12, color: Colors.blue[700]),
                                const SizedBox(width: 4),
                                Text(
                                  '내 주변 안전시설',
                                  style: TextStyle(
                                    fontSize: 11,
                                    fontWeight: FontWeight.w600,
                                    color: Colors.grey[800],
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            // Nearby Flyers
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Text(
                        '내 주변 전단지',
                        style: Theme.of(context).textTheme.titleLarge?.copyWith(
                              fontWeight: FontWeight.bold,
                            ),
                      ),
                      const Spacer(),
                      TextButton(
                        onPressed: () {
                          Navigator.of(context).push(
                            MaterialPageRoute(
                              builder: (context) => const FlyerMapScreen(),
                            ),
                          );
                        },
                        child: const Text('지도보기'),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  SizedBox(
                    height: 220,
                    child: _isLoadingFlyers
                        ? const Center(child: CircularProgressIndicator())
                        : _flyers.isEmpty
                            ? Center(
                                child: Text(
                                  '전단지가 없습니다',
                                  style: TextStyle(color: Colors.grey[600]),
                                ),
                              )
                            : ListView.separated(
                                scrollDirection: Axis.horizontal,
                                itemCount: _flyers.length,
                                separatorBuilder: (context, index) =>
                                    const SizedBox(width: 12),
                                itemBuilder: (context, index) {
                                  final flyer = _flyers[index];
                                  return _buildFlyerCard(
                                    context,
                                    flyer['id'],
                                    flyer['merchant']?['businessName'] ?? '상점',
                                    flyer['title'] ?? '',
                                    flyer['description'] ?? '',
                                    Icons.local_offer,
                                    const Color(0xFF6366F1),
                                  );
                                },
                              ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Community Features
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    '커뮤니티',
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                  ),
                  const SizedBox(height: 12),
                  GridView.count(
                    crossAxisCount: 2,
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    mainAxisSpacing: 12,
                    crossAxisSpacing: 12,
                    childAspectRatio: 1.5,
                    children: [
                      _buildCommunityCard(
                        context,
                        '동네 소식',
                        Icons.article,
                        const Color(0xFF3B82F6),
                      ),
                      _buildCommunityCard(
                        context,
                        '안전 정보',
                        Icons.security,
                        const Color(0xFF10B981),
                      ),
                      _buildCommunityCard(
                        context,
                        '이웃 찾기',
                        Icons.people,
                        const Color(0xFF8B5CF6),
                      ),
                      _buildCommunityCard(
                        context,
                        '문의하기',
                        Icons.help_outline,
                        const Color(0xFFF59E0B),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
      bottomNavigationBar: BottomNavigationBar(
        type: BottomNavigationBarType.fixed,
        selectedItemColor: const Color(0xFF6366F1),
        unselectedItemColor: Colors.grey,
        currentIndex: 0,
        onTap: (index) {
          if (index == 2) {
            // Navigate to Safety Map
            Navigator.of(context).push(
              MaterialPageRoute(
                builder: (context) => const SafetyMapScreen(),
              ),
            );
          }
        },
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.home),
            label: '홈',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.article),
            label: '전단지',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.map),
            label: '안전맵',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.person),
            label: '내정보',
          ),
        ],
      ),
    );
  }

  Widget _buildLocationPill(String label, bool isActive) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: isActive
            ? Colors.white.withOpacity(0.25)
            : Colors.white.withOpacity(0.1),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: Colors.white.withOpacity(isActive ? 0.5 : 0.2),
        ),
      ),
      child: Text(
        label,
        style: const TextStyle(
          color: Colors.white,
          fontSize: 13,
          fontWeight: FontWeight.w500,
        ),
      ),
    );
  }

  Widget _buildFlyerCard(
    BuildContext context,
    String flyerId,
    String storeName,
    String title,
    String subtitle,
    IconData icon,
    Color color,
  ) {
    return GestureDetector(
      onTap: () {
        // Increment click count
        _flyerRepository.incrementClickCount(flyerId);
        // Navigate to detail screen
        Navigator.of(context).push(
          MaterialPageRoute(
            builder: (context) => FlyerDetailScreen(
              flyerId: flyerId,
              flyerTitle: title,
            ),
          ),
        );
      },
      child: Container(
        width: 160,
        decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            height: 100,
            decoration: BoxDecoration(
              color: color.withOpacity(0.1),
              borderRadius: const BorderRadius.vertical(
                top: Radius.circular(12),
              ),
            ),
            child: Center(
              child: Icon(
                icon,
                size: 48,
                color: color,
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  storeName,
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: Colors.grey[600],
                      ),
                ),
                const SizedBox(height: 4),
                Text(
                  title,
                  style: Theme.of(context).textTheme.titleSmall?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 4),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 8,
                    vertical: 2,
                  ),
                  decoration: BoxDecoration(
                    color: const Color(0xFFEF4444).withOpacity(0.1),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(
                    subtitle.isEmpty ? '특가 진행중' : subtitle,
                    style: const TextStyle(
                      color: Color(0xFFEF4444),
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
      ),
    );
  }

  Widget _buildCommunityCard(
    BuildContext context,
    String label,
    IconData icon,
    Color color,
  ) {
    return InkWell(
      onTap: () {},
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 10,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              icon,
              color: color,
              size: 32,
            ),
            const SizedBox(height: 8),
            Text(
              label,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}
