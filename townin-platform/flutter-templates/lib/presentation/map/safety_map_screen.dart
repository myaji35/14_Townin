import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:geolocator/geolocator.dart';
import 'providers/map_provider.dart';

class SafetyMapScreen extends ConsumerStatefulWidget {
  const SafetyMapScreen({super.key});

  @override
  ConsumerState<SafetyMapScreen> createState() => _SafetyMapScreenState();
}

class _SafetyMapScreenState extends ConsumerState<SafetyMapScreen> {
  GoogleMapController? _mapController;
  bool _isLoadingLocation = false;

  @override
  void initState() {
    super.initState();
    _getCurrentLocation();
  }

  @override
  void dispose() {
    _mapController?.dispose();
    super.dispose();
  }

  Future<void> _getCurrentLocation() async {
    setState(() {
      _isLoadingLocation = true;
    });

    try {
      // Check location permission
      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('위치 권한이 필요합니다')),
            );
          }
          return;
        }
      }

      if (permission == LocationPermission.deniedForever) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('설정에서 위치 권한을 허용해주세요'),
            ),
          );
        }
        return;
      }

      // Get current position
      final position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
      );

      // Load public data for current location
      await ref.read(mapProvider.notifier).loadPublicData(
            lat: position.latitude,
            lng: position.longitude,
          );

      // Move camera to current location
      _mapController?.animateCamera(
        CameraUpdate.newLatLngZoom(
          LatLng(position.latitude, position.longitude),
          15.0,
        ),
      );
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('위치를 가져올 수 없습니다: $e')),
        );
      }
    } finally {
      setState(() {
        _isLoadingLocation = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final mapState = ref.watch(mapProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('안전 지도'),
        actions: [
          // Filter button
          IconButton(
            icon: const Icon(Icons.filter_list),
            onPressed: () => _showFilterDialog(),
          ),
          // Refresh button
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _getCurrentLocation,
          ),
        ],
      ),
      body: Stack(
        children: [
          // Google Map
          GoogleMap(
            initialCameraPosition: const CameraPosition(
              target: LatLng(37.4979, 127.0276), // Default: Gangnam, Seoul
              zoom: 15.0,
            ),
            markers: mapState.markers,
            myLocationEnabled: true,
            myLocationButtonEnabled: false,
            compassEnabled: true,
            mapToolbarEnabled: false,
            onMapCreated: (controller) {
              _mapController = controller;
            },
            onCameraMove: (position) {
              // Could implement dynamic loading based on camera position
            },
          ),

          // Loading overlay
          if (mapState.isLoading || _isLoadingLocation)
            Container(
              color: Colors.black26,
              child: const Center(
                child: CircularProgressIndicator(),
              ),
            ),

          // Bottom info panel
          Positioned(
            left: 0,
            right: 0,
            bottom: 0,
            child: _buildInfoPanel(mapState),
          ),

          // Radius selector
          Positioned(
            top: 16,
            right: 16,
            child: _buildRadiusSelector(mapState),
          ),

          // My location button
          Positioned(
            bottom: 200,
            right: 16,
            child: FloatingActionButton(
              mini: true,
              onPressed: _getCurrentLocation,
              child: const Icon(Icons.my_location),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoPanel(MapState state) {
    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
        boxShadow: [
          BoxShadow(
            color: Colors.black12,
            blurRadius: 10,
            offset: Offset(0, -2),
          ),
        ],
      ),
      padding: const EdgeInsets.all(20),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Handle bar
          Container(
            width: 40,
            height: 4,
            decoration: BoxDecoration(
              color: Colors.grey[300],
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          const SizedBox(height: 16),

          // Title
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                '주변 안전 시설',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              Text(
                '${state.radiusKm}km 반경',
                style: TextStyle(
                  fontSize: 14,
                  color: Colors.grey[600],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),

          // Stats
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _buildStatItem(
                icon: Icons.videocam,
                label: 'CCTV',
                count: state.cctvs.length,
                color: Colors.red,
              ),
              _buildStatItem(
                icon: Icons.local_parking,
                label: '주차장',
                count: state.parking.length,
                color: Colors.blue,
              ),
              _buildStatItem(
                icon: Icons.home_work,
                label: '대피소',
                count: state.shelters.length,
                color: Colors.green,
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildStatItem({
    required IconData icon,
    required String label,
    required int count,
    required Color color,
  }) {
    return Column(
      children: [
        Icon(icon, color: color, size: 32),
        const SizedBox(height: 4),
        Text(
          '$count',
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: color,
          ),
        ),
        Text(
          label,
          style: const TextStyle(
            fontSize: 12,
            color: Colors.grey,
          ),
        ),
      ],
    );
  }

  Widget _buildRadiusSelector(MapState state) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(25),
        boxShadow: const [
          BoxShadow(
            color: Colors.black12,
            blurRadius: 8,
            offset: Offset(0, 2),
          ),
        ],
      ),
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      child: DropdownButton<double>(
        value: state.radiusKm,
        underline: const SizedBox(),
        icon: const Icon(Icons.expand_more),
        items: const [
          DropdownMenuItem(value: 1.0, child: Text('1km')),
          DropdownMenuItem(value: 2.0, child: Text('2km')),
          DropdownMenuItem(value: 5.0, child: Text('5km')),
        ],
        onChanged: (value) {
          if (value != null) {
            ref.read(mapProvider.notifier).setRadius(value);
          }
        },
      ),
    );
  }

  void _showFilterDialog() {
    final currentFilter = ref.read(mapProvider).filter;

    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('지도 필터'),
          content: StatefulBuilder(
            builder: (context, setState) {
              return Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  CheckboxListTile(
                    title: const Text('CCTV'),
                    value: currentFilter.showCCTV,
                    onChanged: (value) {
                      if (value != null) {
                        final newFilter =
                            currentFilter.copyWith(showCCTV: value);
                        ref.read(mapProvider.notifier).updateFilter(newFilter);
                        setState(() {});
                      }
                    },
                    secondary: const Icon(Icons.videocam, color: Colors.red),
                  ),
                  CheckboxListTile(
                    title: const Text('주차장'),
                    value: currentFilter.showParking,
                    onChanged: (value) {
                      if (value != null) {
                        final newFilter =
                            currentFilter.copyWith(showParking: value);
                        ref.read(mapProvider.notifier).updateFilter(newFilter);
                        setState(() {});
                      }
                    },
                    secondary:
                        const Icon(Icons.local_parking, color: Colors.blue),
                  ),
                  CheckboxListTile(
                    title: const Text('대피소'),
                    value: currentFilter.showShelters,
                    onChanged: (value) {
                      if (value != null) {
                        final newFilter =
                            currentFilter.copyWith(showShelters: value);
                        ref.read(mapProvider.notifier).updateFilter(newFilter);
                        setState(() {});
                      }
                    },
                    secondary: const Icon(Icons.home_work, color: Colors.green),
                  ),
                ],
              );
            },
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('닫기'),
            ),
          ],
        );
      },
    );
  }
}
