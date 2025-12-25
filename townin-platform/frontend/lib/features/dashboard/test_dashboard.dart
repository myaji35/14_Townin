import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';

class TestDashboard extends StatefulWidget {
  const TestDashboard({super.key});

  @override
  State<TestDashboard> createState() => _TestDashboardState();
}

class _TestDashboardState extends State<TestDashboard> {
  GoogleMapController? _mapController;

  static const LatLng _center = LatLng(37.7381, 127.0336);

  final Set<Marker> _markers = {
    const Marker(
      markerId: MarkerId('test'),
      position: LatLng(37.7381, 127.0336),
      infoWindow: InfoWindow(title: 'Test Marker'),
    ),
  };

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Test Dashboard with Map'),
        backgroundColor: const Color(0xFF6366F1),
        foregroundColor: Colors.white,
      ),
      body: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            color: Colors.blue[50],
            child: const Text(
              'Map is loading below...',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
          ),
          Expanded(
            child: GoogleMap(
              onMapCreated: (controller) {
                _mapController = controller;
              },
              initialCameraPosition: const CameraPosition(
                target: _center,
                zoom: 14.0,
              ),
              markers: _markers,
              myLocationButtonEnabled: true,
              zoomControlsEnabled: true,
            ),
          ),
          Container(
            padding: const EdgeInsets.all(16),
            color: Colors.green[50],
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                ElevatedButton(
                  onPressed: () {
                    Navigator.pushNamed(context, '/user');
                  },
                  child: const Text('Go to User Dashboard'),
                ),
                ElevatedButton(
                  onPressed: () {
                    Navigator.pushNamed(context, '/admin');
                  },
                  child: const Text('Go to Admin Dashboard'),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
