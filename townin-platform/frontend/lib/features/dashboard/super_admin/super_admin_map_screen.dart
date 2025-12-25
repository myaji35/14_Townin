import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:geolocator/geolocator.dart';
import '../../../core/utils/h3_helper.dart';

/// CEO/Master Admin Map Screen with H3 Heatmap Visualization
/// Inspired by Uber's deck.gl and kepler.gl data visualization approach
class SuperAdminMapScreen extends StatefulWidget {
  const SuperAdminMapScreen({super.key});

  @override
  State<SuperAdminMapScreen> createState() => _SuperAdminMapScreenState();
}

class _SuperAdminMapScreenState extends State<SuperAdminMapScreen> {
  GoogleMapController? _mapController;
  Position? _currentPosition;

  final Set<Polygon> _heatmapPolygons = {};
  final Set<Marker> _statsMarkers = {};

  bool _isLoading = true;
  int _h3Resolution = 8; // Default resolution for neighborhood level
  String _selectedMetric = 'users'; // users, flyers, engagement

  // Default location: Uijeongbu City Center
  static const LatLng _defaultLocation = LatLng(37.7381, 127.0336);

  // Sample H3 data for visualization (replace with real data from API)
  final Map<String, Map<BigInt, double>> _metricsData = {
    'users': {},
    'flyers': {},
    'engagement': {},
  };

  @override
  void initState() {
    super.initState();
    _initializeMap();
  }

  Future<void> _initializeMap() async {
    await _getCurrentLocation();
    await _loadH3Data();
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

  Future<void> _loadH3Data() async {
    // Sample data generation for Uijeongbu area
    // In production, this would come from your backend API
    final centerLat = 37.7381;
    final centerLng = 127.0336;

    // Generate sample H3 hexagons with varying densities
    final centerH3 = H3Helper.latLngToH3(centerLat, centerLng, _h3Resolution);
    final hexagons = H3Helper.kRing(centerH3, 5); // 5-ring radius

    // Simulate user density data
    _metricsData['users']!.clear();
    _metricsData['flyers']!.clear();
    _metricsData['engagement']!.clear();

    for (var h3Index in hexagons) {
      // Simulate varying densities (in production, fetch from API)
      _metricsData['users']![h3Index] = (h3Index.toInt() % 100).toDouble();
      _metricsData['flyers']![h3Index] = (h3Index.toInt() % 50).toDouble();
      _metricsData['engagement']![h3Index] = (h3Index.toInt() % 80).toDouble();
    }

    _updateHeatmap();
  }

  void _updateHeatmap() {
    final data = _metricsData[_selectedMetric]!;
    final maxValue = data.values.isNotEmpty
        ? data.values.reduce((a, b) => a > b ? a : b)
        : 100.0;

    setState(() {
      _heatmapPolygons.clear();
      _heatmapPolygons.addAll(
        H3Helper.generateHeatmapPolygons(
          h3Data: data,
          maxValue: maxValue,
        ),
      );
    });
  }

  void _onMetricChanged(String metric) {
    setState(() {
      _selectedMetric = metric;
    });
    _updateHeatmap();
  }

  void _onResolutionChanged(int resolution) {
    setState(() {
      _h3Resolution = resolution;
      _isLoading = true;
    });
    _loadH3Data().then((_) {
      setState(() {
        _isLoading = false;
      });
    });
  }

  @override
  void dispose() {
    _mapController?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        title: const Text('플랫폼 분석 맵'),
        backgroundColor: Colors.black,
        foregroundColor: Colors.white,
        elevation: 0,
        actions: [
          // Metric selector
          PopupMenuButton<String>(
            icon: const Icon(Icons.analytics),
            onSelected: _onMetricChanged,
            itemBuilder: (context) => [
              const PopupMenuItem(
                value: 'users',
                child: Row(
                  children: [
                    Icon(Icons.people, size: 18),
                    SizedBox(width: 8),
                    Text('사용자 밀도'),
                  ],
                ),
              ),
              const PopupMenuItem(
                value: 'flyers',
                child: Row(
                  children: [
                    Icon(Icons.article, size: 18),
                    SizedBox(width: 8),
                    Text('전단지 분포'),
                  ],
                ),
              ),
              const PopupMenuItem(
                value: 'engagement',
                child: Row(
                  children: [
                    Icon(Icons.touch_app, size: 18),
                    SizedBox(width: 8),
                    Text('참여도'),
                  ],
                ),
              ),
            ],
          ),
          // Resolution selector
          PopupMenuButton<int>(
            icon: const Icon(Icons.grid_4x4),
            onSelected: _onResolutionChanged,
            itemBuilder: (context) => [
              const PopupMenuItem(value: 7, child: Text('낮은 해상도 (구 단위)')),
              const PopupMenuItem(value: 8, child: Text('중간 해상도 (동 단위)')),
              const PopupMenuItem(value: 9, child: Text('높은 해상도 (거리 단위)')),
            ],
          ),
        ],
      ),
      body: _isLoading
          ? const Center(
              child: CircularProgressIndicator(color: Colors.white),
            )
          : Stack(
              children: [
                GoogleMap(
                  onMapCreated: (controller) {
                    _mapController = controller;
                    // Apply dark map style for Uber-like appearance
                    _mapController!.setMapStyle('''
                      [
                        {
                          "elementType": "geometry",
                          "stylers": [{"color": "#212121"}]
                        },
                        {
                          "elementType": "labels.icon",
                          "stylers": [{"visibility": "off"}]
                        },
                        {
                          "elementType": "labels.text.fill",
                          "stylers": [{"color": "#757575"}]
                        },
                        {
                          "elementType": "labels.text.stroke",
                          "stylers": [{"color": "#212121"}]
                        },
                        {
                          "featureType": "road",
                          "elementType": "geometry",
                          "stylers": [{"color": "#2c2c2c"}]
                        },
                        {
                          "featureType": "water",
                          "elementType": "geometry",
                          "stylers": [{"color": "#000000"}]
                        }
                      ]
                    ''');
                  },
                  initialCameraPosition: CameraPosition(
                    target: _currentPosition != null
                        ? LatLng(_currentPosition!.latitude,
                            _currentPosition!.longitude)
                        : _defaultLocation,
                    zoom: 12.0,
                  ),
                  polygons: _heatmapPolygons,
                  markers: _statsMarkers,
                  myLocationEnabled: true,
                  myLocationButtonEnabled: false,
                  zoomControlsEnabled: false,
                  mapToolbarEnabled: false,
                  mapType: MapType.normal,
                ),

                // Metric Info Card
                Positioned(
                  top: 16,
                  left: 16,
                  child: Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.black.withOpacity(0.8),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: const Color(0xFF6366F1), width: 1),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Row(
                          children: [
                            Icon(
                              _getMetricIcon(_selectedMetric),
                              color: const Color(0xFF6366F1),
                              size: 20,
                            ),
                            const SizedBox(width: 8),
                            Text(
                              _getMetricTitle(_selectedMetric),
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'H3 Resolution: $_h3Resolution',
                          style: TextStyle(
                            color: Colors.grey[400],
                            fontSize: 12,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),

                // Legend
                Positioned(
                  bottom: 100,
                  left: 16,
                  child: Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.black.withOpacity(0.8),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: Colors.grey[800]!, width: 1),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Text(
                          '밀도',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Row(
                          children: [
                            Container(width: 20, height: 10, color: const Color(0x802196F3)),
                            const SizedBox(width: 4),
                            const Text('낮음', style: TextStyle(color: Colors.white70, fontSize: 10)),
                          ],
                        ),
                        const SizedBox(height: 4),
                        Row(
                          children: [
                            Container(width: 20, height: 10, color: const Color(0x804CAF50)),
                            const SizedBox(width: 4),
                            const Text('중간', style: TextStyle(color: Colors.white70, fontSize: 10)),
                          ],
                        ),
                        const SizedBox(height: 4),
                        Row(
                          children: [
                            Container(width: 20, height: 10, color: const Color(0x80FFEB3B)),
                            const SizedBox(width: 4),
                            const Text('높음', style: TextStyle(color: Colors.white70, fontSize: 10)),
                          ],
                        ),
                        const SizedBox(height: 4),
                        Row(
                          children: [
                            Container(width: 20, height: 10, color: const Color(0x80F44336)),
                            const SizedBox(width: 4),
                            const Text('매우높음', style: TextStyle(color: Colors.white70, fontSize: 10)),
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
                      if (_currentPosition != null && _mapController != null) {
                        _mapController!.animateCamera(
                          CameraUpdate.newLatLngZoom(
                            LatLng(_currentPosition!.latitude,
                                _currentPosition!.longitude),
                            12.0,
                          ),
                        );
                      }
                    },
                    backgroundColor: const Color(0xFF6366F1),
                    child: const Icon(Icons.my_location, color: Colors.white),
                  ),
                ),
              ],
            ),
    );
  }

  IconData _getMetricIcon(String metric) {
    switch (metric) {
      case 'users':
        return Icons.people;
      case 'flyers':
        return Icons.article;
      case 'engagement':
        return Icons.touch_app;
      default:
        return Icons.analytics;
    }
  }

  String _getMetricTitle(String metric) {
    switch (metric) {
      case 'users':
        return '사용자 밀도';
      case 'flyers':
        return '전단지 분포';
      case 'engagement':
        return '참여도';
      default:
        return '분석';
    }
  }
}
