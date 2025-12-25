import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:geolocator/geolocator.dart';
import '../../../core/models/flyer_model.dart';
import '../../flyers/data/flyer_api_service.dart';
import '../../flyers/presentation/flyer_detail_screen.dart';

class FlyerMapScreen extends StatefulWidget {
  final String? initialH3Index;

  const FlyerMapScreen({Key? key, this.initialH3Index}) : super(key: key);

  @override
  State<FlyerMapScreen> createState() => _FlyerMapScreenState();
}

class _FlyerMapScreenState extends State<FlyerMapScreen> {
  GoogleMapController? _mapController;
  final FlyerApiService _flyerApiService = FlyerApiService();

  final Set<Marker> _markers = {};
  Position? _currentPosition;
  bool _isLoading = true;
  List<FlyerModel> _nearbyFlyers = [];

  // Default location (Seoul)
  static const CameraPosition _initialPosition = CameraPosition(
    target: LatLng(37.5665, 126.9780),
    zoom: 14.0,
  );

  @override
  void initState() {
    super.initState();
    _initializeMap();
  }

  Future<void> _initializeMap() async {
    try {
      // Get current location
      final permission = await Geolocator.requestPermission();

      if (permission == LocationPermission.always ||
          permission == LocationPermission.whileInUse) {
        final position = await Geolocator.getCurrentPosition(
          desiredAccuracy: LocationAccuracy.high,
        );

        setState(() {
          _currentPosition = position;
        });

        // Move camera to current location
        _mapController?.animateCamera(
          CameraUpdate.newCameraPosition(
            CameraPosition(
              target: LatLng(position.latitude, position.longitude),
              zoom: 15.0,
            ),
          ),
        );

        // Load nearby flyers
        await _loadNearbyFlyers(position.latitude, position.longitude);
      }
    } catch (e) {
      debugPrint('Error initializing map: $e');
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  Future<void> _loadNearbyFlyers(double lat, double lng) async {
    try {
      // TODO: Convert lat/lng to H3 index
      // For now, use a mock H3 index
      final h3Index = '${lat.toStringAsFixed(4)}_${lng.toStringAsFixed(4)}';

      final response = await _flyerApiService.getFlyersByLocation(
        h3Index: h3Index,
        radius: 2,
        page: 1,
        limit: 50,
      );

      setState(() {
        _nearbyFlyers = response.data;
        _updateMarkers();
      });
    } catch (e) {
      debugPrint('Error loading nearby flyers: $e');
    }
  }

  void _updateMarkers() {
    _markers.clear();

    // Add current location marker
    if (_currentPosition != null) {
      _markers.add(
        Marker(
          markerId: const MarkerId('current_location'),
          position: LatLng(_currentPosition!.latitude, _currentPosition!.longitude),
          icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueBlue),
          infoWindow: const InfoWindow(title: '내 위치'),
        ),
      );
    }

    // Add flyer markers
    for (final flyer in _nearbyFlyers) {
      // TODO: Get actual lat/lng from flyer
      // For now, generate random nearby positions
      final lat = (_currentPosition?.latitude ?? 37.5665) +
          (DateTime.now().millisecond % 100 - 50) / 10000.0;
      final lng = (_currentPosition?.longitude ?? 126.9780) +
          (DateTime.now().microsecond % 100 - 50) / 10000.0;

      _markers.add(
        Marker(
          markerId: MarkerId(flyer.id),
          position: LatLng(lat, lng),
          icon: BitmapDescriptor.defaultMarkerWithHue(
            _getMarkerColor(flyer.category.name),
          ),
          infoWindow: InfoWindow(
            title: flyer.title,
            snippet: flyer.merchant?.businessName ?? '',
            onTap: () {
              _showFlyerDetails(flyer);
            },
          ),
        ),
      );
    }
  }

  double _getMarkerColor(String category) {
    switch (category) {
      case 'food':
        return BitmapDescriptor.hueOrange;
      case 'fashion':
        return BitmapDescriptor.hueMagenta;
      case 'beauty':
        return BitmapDescriptor.hueRose;
      case 'education':
        return BitmapDescriptor.hueBlue;
      case 'health':
        return BitmapDescriptor.hueGreen;
      case 'entertainment':
        return BitmapDescriptor.hueRed;
      case 'service':
        return BitmapDescriptor.hueCyan;
      default:
        return BitmapDescriptor.hueViolet;
    }
  }

  void _showFlyerDetails(FlyerModel flyer) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => DraggableScrollableSheet(
        initialChildSize: 0.6,
        minChildSize: 0.3,
        maxChildSize: 0.9,
        builder: (context, scrollController) {
          return Container(
            decoration: const BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
            ),
            child: Column(
              children: [
                Container(
                  margin: const EdgeInsets.only(top: 8),
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: Colors.grey[300],
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
                Expanded(
                  child: SingleChildScrollView(
                    controller: scrollController,
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Flyer Image
                        if (flyer.imageUrl.isNotEmpty)
                          ClipRRect(
                            borderRadius: BorderRadius.circular(12),
                            child: AspectRatio(
                              aspectRatio: 16 / 9,
                              child: Image.network(
                                flyer.imageUrl,
                                fit: BoxFit.cover,
                                errorBuilder: (context, error, stackTrace) {
                                  return Container(
                                    color: Colors.grey[300],
                                    child: const Icon(Icons.broken_image, size: 48),
                                  );
                                },
                              ),
                            ),
                          ),
                        const SizedBox(height: 16),

                        // Title
                        Text(
                          flyer.title,
                          style: const TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 8),

                        // Merchant
                        if (flyer.merchant != null)
                          Row(
                            children: [
                              Icon(Icons.store, size: 16, color: Colors.grey[600]),
                              const SizedBox(width: 4),
                              Text(
                                flyer.merchant!.businessName,
                                style: TextStyle(color: Colors.grey[600]),
                              ),
                            ],
                          ),
                        const SizedBox(height: 12),

                        // Description
                        if (flyer.description != null)
                          Text(
                            flyer.description!,
                            style: TextStyle(color: Colors.grey[700]),
                          ),
                        const SizedBox(height: 16),

                        // View Details Button
                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton(
                            onPressed: () {
                              Navigator.pop(context);
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (context) => FlyerDetailScreen(
                                    flyerId: flyer.id,
                                  ),
                                ),
                              );
                            },
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFF6366F1),
                              padding: const EdgeInsets.symmetric(vertical: 16),
                            ),
                            child: const Text('자세히 보기'),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('전단지 지도'),
        backgroundColor: const Color(0xFF6366F1),
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.my_location),
            onPressed: () {
              if (_currentPosition != null) {
                _mapController?.animateCamera(
                  CameraUpdate.newCameraPosition(
                    CameraPosition(
                      target: LatLng(
                        _currentPosition!.latitude,
                        _currentPosition!.longitude,
                      ),
                      zoom: 15.0,
                    ),
                  ),
                );
              }
            },
          ),
        ],
      ),
      body: Stack(
        children: [
          GoogleMap(
            initialCameraPosition: _initialPosition,
            markers: _markers,
            myLocationEnabled: true,
            myLocationButtonEnabled: false,
            zoomControlsEnabled: false,
            onMapCreated: (controller) {
              _mapController = controller;
            },
            onCameraMove: (position) {
              // TODO: Load flyers for visible area
            },
          ),
          if (_isLoading)
            Container(
              color: Colors.white.withOpacity(0.8),
              child: const Center(
                child: CircularProgressIndicator(),
              ),
            ),
          // Flyer count overlay
          Positioned(
            top: 16,
            left: 16,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.1),
                    blurRadius: 10,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.location_on, size: 16, color: Color(0xFF6366F1)),
                  const SizedBox(width: 4),
                  Text(
                    '${_nearbyFlyers.length}개 전단지',
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
