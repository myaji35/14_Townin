import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:geolocator/geolocator.dart';
import '../../../core/utils/h3_helper.dart';
import '../../../core/models/flyer_model.dart';

/// Merchant Map Screen
/// Shows merchant's store location, coverage area, and competing flyers
class MerchantMapScreen extends StatefulWidget {
  final String? merchantId;

  const MerchantMapScreen({super.key, this.merchantId});

  @override
  State<MerchantMapScreen> createState() => _MerchantMapScreenState();
}

class _MerchantMapScreenState extends State<MerchantMapScreen> {
  GoogleMapController? _mapController;
  Position? _currentPosition;

  final Set<Marker> _markers = {};
  final Set<Circle> _coverageCircles = {};
  final Set<Polygon> _coverageHexagons = {};

  bool _isLoading = true;
  bool _showHexagonGrid = false;
  double _coverageRadius = 1000; // meters

  // Default location: Merchant store (sample)
  static const LatLng _storeLocation = LatLng(37.7381, 127.0336);

  // Sample data for competing flyers
  final List<Map<String, dynamic>> _competingFlyers = [];

  @override
  void initState() {
    super.initState();
    _initializeMap();
  }

  Future<void> _initializeMap() async {
    await _getCurrentLocation();
    await _loadMerchantData();
    _updateCoverageArea();
    setState(() {
      _isLoading = false;
    });
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

  Future<void> _loadMerchantData() async {
    // In production, fetch from API
    // Load merchant's own flyers and competing flyers in the area

    // Sample competing flyers data
    final sampleData = [
      {'id': '1', 'lat': 37.7400, 'lng': 127.0350, 'title': '경쟁업체 A 전단지'},
      {'id': '2', 'lat': 37.7360, 'lng': 127.0320, 'title': '경쟁업체 B 전단지'},
      {'id': '3', 'lat': 37.7420, 'lng': 127.0380, 'title': '경쟁업체 C 전단지'},
    ];

    setState(() {
      _competingFlyers.clear();
      _competingFlyers.addAll(sampleData);
    });

    _updateMarkers();
  }

  void _updateMarkers() {
    _markers.clear();

    // Add store location marker
    _markers.add(
      Marker(
        markerId: const MarkerId('store'),
        position: _storeLocation,
        icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueGreen),
        infoWindow: const InfoWindow(
          title: '내 가게',
          snippet: '클릭하여 상세보기',
        ),
      ),
    );

    // Add competing flyers markers
    for (var flyer in _competingFlyers) {
      _markers.add(
        Marker(
          markerId: MarkerId(flyer['id']),
          position: LatLng(flyer['lat'], flyer['lng']),
          icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueOrange),
          infoWindow: InfoWindow(
            title: flyer['title'],
            snippet: '경쟁 전단지',
          ),
        ),
      );
    }

    setState(() {});
  }

  void _updateCoverageArea() {
    if (_showHexagonGrid) {
      _updateHexagonCoverage();
    } else {
      _updateCircleCoverage();
    }
  }

  void _updateCircleCoverage() {
    _coverageCircles.clear();
    _coverageHexagons.clear();

    _coverageCircles.add(
      Circle(
        circleId: const CircleId('coverage'),
        center: _storeLocation,
        radius: _coverageRadius,
        fillColor: const Color(0xFF6366F1).withOpacity(0.2),
        strokeColor: const Color(0xFF6366F1),
        strokeWidth: 2,
      ),
    );

    setState(() {});
  }

  void _updateHexagonCoverage() {
    _coverageCircles.clear();
    _coverageHexagons.clear();

    // Use H3 hexagons to show coverage
    final resolution = 9; // Street level
    final centerH3 = H3Helper.latLngToH3(
      _storeLocation.latitude,
      _storeLocation.longitude,
      resolution,
    );

    // Get ring of hexagons based on coverage radius
    final ringSize = (_coverageRadius / 200).round(); // Approximate
    final hexagons = H3Helper.kRing(centerH3, ringSize);

    for (var h3Index in hexagons) {
      final boundary = H3Helper.h3ToPolygon(h3Index);
      _coverageHexagons.add(
        Polygon(
          polygonId: PolygonId(h3Index.toString()),
          points: boundary,
          strokeWidth: 1,
          strokeColor: const Color(0xFF6366F1).withOpacity(0.5),
          fillColor: const Color(0xFF6366F1).withOpacity(0.15),
        ),
      );
    }

    setState(() {});
  }

  void _onCoverageRadiusChanged(double value) {
    setState(() {
      _coverageRadius = value;
    });
    _updateCoverageArea();
  }

  void _toggleHexagonGrid() {
    setState(() {
      _showHexagonGrid = !_showHexagonGrid;
    });
    _updateCoverageArea();
  }

  @override
  void dispose() {
    _mapController?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('내 가게 상권 분석'),
        backgroundColor: const Color(0xFF6366F1),
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: Icon(_showHexagonGrid ? Icons.grid_on : Icons.grid_off),
            onPressed: _toggleHexagonGrid,
            tooltip: 'H3 그리드 토글',
          ),
          IconButton(
            icon: const Icon(Icons.tune),
            onPressed: () {
              _showCoverageSettings();
            },
            tooltip: '상권 설정',
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : Stack(
              children: [
                GoogleMap(
                  onMapCreated: (controller) {
                    _mapController = controller;
                  },
                  initialCameraPosition: CameraPosition(
                    target: _storeLocation,
                    zoom: 14.0,
                  ),
                  markers: _markers,
                  circles: _coverageCircles,
                  polygons: _coverageHexagons,
                  myLocationEnabled: true,
                  myLocationButtonEnabled: false,
                  zoomControlsEnabled: false,
                  mapToolbarEnabled: false,
                ),

                // Info Card
                Positioned(
                  top: 16,
                  left: 16,
                  right: 16,
                  child: Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(12),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.1),
                          blurRadius: 10,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Row(
                          children: [
                            Container(
                              width: 12,
                              height: 12,
                              decoration: const BoxDecoration(
                                color: Color(0xFF6366F1),
                                shape: BoxShape.circle,
                              ),
                            ),
                            const SizedBox(width: 8),
                            const Expanded(
                              child: Text(
                                '상권 분석',
                                style: TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 8,
                                vertical: 4,
                              ),
                              decoration: BoxDecoration(
                                color: const Color(0xFF6366F1).withOpacity(0.1),
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: Text(
                                '반경 ${(_coverageRadius / 1000).toStringAsFixed(1)}km',
                                style: const TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w600,
                                  color: Color(0xFF6366F1),
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        Row(
                          children: [
                            _buildStatItem(
                              Icons.store,
                              '내 가게',
                              '1',
                              Colors.green,
                            ),
                            const SizedBox(width: 16),
                            _buildStatItem(
                              Icons.article,
                              '경쟁 전단지',
                              '${_competingFlyers.length}',
                              Colors.orange,
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),

                // Coverage Radius Slider
                Positioned(
                  bottom: 100,
                  left: 16,
                  right: 16,
                  child: Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(8),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.1),
                          blurRadius: 10,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Text(
                          '상권 범위 조정',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        Row(
                          children: [
                            Expanded(
                              child: Slider(
                                value: _coverageRadius,
                                min: 500,
                                max: 3000,
                                divisions: 10,
                                activeColor: const Color(0xFF6366F1),
                                onChanged: _onCoverageRadiusChanged,
                              ),
                            ),
                            Text(
                              '${(_coverageRadius / 1000).toStringAsFixed(1)}km',
                              style: const TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                                color: Color(0xFF6366F1),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),

                // My Location Button
                Positioned(
                  bottom: 24,
                  right: 16,
                  child: FloatingActionButton(
                    onPressed: () {
                      _mapController?.animateCamera(
                        CameraUpdate.newLatLngZoom(_storeLocation, 14.0),
                      );
                    },
                    backgroundColor: const Color(0xFF6366F1),
                    child: const Icon(Icons.store, color: Colors.white),
                  ),
                ),
              ],
            ),
    );
  }

  Widget _buildStatItem(IconData icon, String label, String value, Color color) {
    return Row(
      children: [
        Icon(icon, size: 16, color: color),
        const SizedBox(width: 4),
        Text(
          label,
          style: TextStyle(
            fontSize: 12,
            color: Colors.grey[600],
          ),
        ),
        const SizedBox(width: 4),
        Text(
          value,
          style: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.bold,
          ),
        ),
      ],
    );
  }

  void _showCoverageSettings() {
    showModalBottomSheet(
      context: context,
      builder: (context) => Container(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              '상권 설정',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 24),
            SwitchListTile(
              title: const Text('H3 육각형 그리드 표시'),
              subtitle: const Text('Uber의 H3 시스템 기반 영역 표시'),
              value: _showHexagonGrid,
              onChanged: (value) {
                Navigator.pop(context);
                _toggleHexagonGrid();
              },
              activeColor: const Color(0xFF6366F1),
            ),
            const Divider(),
            ListTile(
              leading: const Icon(Icons.refresh, color: Color(0xFF6366F1)),
              title: const Text('데이터 새로고침'),
              onTap: () {
                Navigator.pop(context);
                setState(() {
                  _isLoading = true;
                });
                _loadMerchantData().then((_) {
                  setState(() {
                    _isLoading = false;
                  });
                });
              },
            ),
          ],
        ),
      ),
    );
  }
}
