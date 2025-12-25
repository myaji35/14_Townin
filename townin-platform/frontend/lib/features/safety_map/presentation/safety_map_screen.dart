import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:geolocator/geolocator.dart';

class SafetyMapScreen extends StatefulWidget {
  const SafetyMapScreen({super.key});

  @override
  State<SafetyMapScreen> createState() => _SafetyMapScreenState();
}

class _SafetyMapScreenState extends State<SafetyMapScreen> {
  GoogleMapController? _mapController;
  Position? _currentPosition;
  final Set<Marker> _markers = {};
  bool _isLoading = true;

  // Default location: Uijeongbu City Hall
  static const LatLng _defaultLocation = LatLng(37.7381, 127.0336);

  @override
  void initState() {
    super.initState();
    _initializeMap();
  }

  Future<void> _initializeMap() async {
    await _getCurrentLocation();
    await _loadSafetyMarkers();
    setState(() {
      _isLoading = false;
    });
  }

  Future<void> _getCurrentLocation() async {
    try {
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        print('Location services are disabled.');
        return;
      }

      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          print('Location permissions are denied');
          return;
        }
      }

      if (permission == LocationPermission.deniedForever) {
        print('Location permissions are permanently denied');
        return;
      }

      _currentPosition = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
      );
    } catch (e) {
      print('Error getting location: $e');
    }
  }

  Future<void> _loadSafetyMarkers() async {
    // Sample safety data for Uijeongbu
    final List<Map<String, dynamic>> safetyData = [
      {
        'id': 'cctv_1',
        'type': 'CCTV',
        'lat': 37.7381,
        'lng': 127.0336,
        'name': '의정부역 CCTV',
        'icon': BitmapDescriptor.hueBlue,
      },
      {
        'id': 'cctv_2',
        'type': 'CCTV',
        'lat': 37.7420,
        'lng': 127.0380,
        'name': '가능동 CCTV',
        'icon': BitmapDescriptor.hueBlue,
      },
      {
        'id': 'light_1',
        'type': '가로등',
        'lat': 37.7360,
        'lng': 127.0320,
        'name': '의정부동 가로등',
        'icon': BitmapDescriptor.hueYellow,
      },
      {
        'id': 'light_2',
        'type': '가로등',
        'lat': 37.7400,
        'lng': 127.0350,
        'name': '호원동 가로등',
        'icon': BitmapDescriptor.hueYellow,
      },
      {
        'id': 'parking_1',
        'type': '안전 주차장',
        'lat': 37.7390,
        'lng': 127.0340,
        'name': '의정부 공영주차장',
        'icon': BitmapDescriptor.hueGreen,
      },
      {
        'id': 'parking_2',
        'type': '안전 주차장',
        'lat': 37.7410,
        'lng': 127.0370,
        'name': '가능동 주차장',
        'icon': BitmapDescriptor.hueGreen,
      },
      {
        'id': 'emergency_1',
        'type': '비상벨',
        'lat': 37.7370,
        'lng': 127.0330,
        'name': '의정부동 비상벨',
        'icon': BitmapDescriptor.hueRed,
      },
      {
        'id': 'emergency_2',
        'type': '비상벨',
        'lat': 37.7415,
        'lng': 127.0360,
        'name': '호원동 비상벨',
        'icon': BitmapDescriptor.hueRed,
      },
    ];

    setState(() {
      _markers.clear();
      for (var data in safetyData) {
        _markers.add(
          Marker(
            markerId: MarkerId(data['id']),
            position: LatLng(data['lat'], data['lng']),
            infoWindow: InfoWindow(
              title: data['name'],
              snippet: data['type'],
            ),
            icon: BitmapDescriptor.defaultMarkerWithHue(data['icon']),
          ),
        );
      }
    });
  }

  void _onMapCreated(GoogleMapController controller) {
    _mapController = controller;
  }

  void _moveToCurrentLocation() {
    if (_currentPosition != null && _mapController != null) {
      _mapController!.animateCamera(
        CameraUpdate.newLatLngZoom(
          LatLng(_currentPosition!.latitude, _currentPosition!.longitude),
          15.0,
        ),
      );
    }
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
        title: const Text('안전 맵'),
        backgroundColor: const Color(0xFF6366F1),
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.layers),
            onPressed: () {
              // TODO: Show layer selection dialog
            },
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : Stack(
              children: [
                GoogleMap(
                  onMapCreated: _onMapCreated,
                  initialCameraPosition: CameraPosition(
                    target: _currentPosition != null
                        ? LatLng(_currentPosition!.latitude,
                            _currentPosition!.longitude)
                        : _defaultLocation,
                    zoom: 14.0,
                  ),
                  markers: _markers,
                  myLocationEnabled: true,
                  myLocationButtonEnabled: false,
                  zoomControlsEnabled: false,
                  mapToolbarEnabled: false,
                ),

                // Safety Legend
                Positioned(
                  top: 16,
                  left: 16,
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
                          '안전 시설',
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 14,
                          ),
                        ),
                        const SizedBox(height: 8),
                        _buildLegendItem(
                          Colors.blue,
                          'CCTV',
                          Icons.videocam,
                        ),
                        _buildLegendItem(
                          Colors.yellow[700]!,
                          '가로등',
                          Icons.lightbulb,
                        ),
                        _buildLegendItem(
                          Colors.green,
                          '안전 주차장',
                          Icons.local_parking,
                        ),
                        _buildLegendItem(
                          Colors.red,
                          '비상벨',
                          Icons.notifications_active,
                        ),
                      ],
                    ),
                  ),
                ),

                // My Location Button
                Positioned(
                  bottom: 100,
                  right: 16,
                  child: FloatingActionButton(
                    onPressed: _moveToCurrentLocation,
                    backgroundColor: Colors.white,
                    child: const Icon(
                      Icons.my_location,
                      color: Color(0xFF6366F1),
                    ),
                  ),
                ),

                // Stats Card
                Positioned(
                  bottom: 16,
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
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceAround,
                      children: [
                        _buildStatItem('CCTV', '2', Icons.videocam),
                        _buildStatItem('가로등', '2', Icons.lightbulb),
                        _buildStatItem('주차장', '2', Icons.local_parking),
                        _buildStatItem('비상벨', '2', Icons.notifications),
                      ],
                    ),
                  ),
                ),
              ],
            ),
    );
  }

  Widget _buildLegendItem(Color color, String label, IconData icon) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 4),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 16, color: color),
          const SizedBox(width: 6),
          Text(
            label,
            style: const TextStyle(fontSize: 12),
          ),
        ],
      ),
    );
  }

  Widget _buildStatItem(String label, String count, IconData icon) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 20, color: const Color(0xFF6366F1)),
        const SizedBox(height: 4),
        Text(
          count,
          style: const TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
        Text(
          label,
          style: TextStyle(
            fontSize: 12,
            color: Colors.grey[600],
          ),
        ),
      ],
    );
  }
}
