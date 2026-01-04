import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import '../theme/app_theme.dart';

/// Google Maps 위젯 헬퍼
/// 의정부시 중심 좌표: 37.7388, 127.0474
class MapWidget extends StatefulWidget {
  final List<MapMarker> markers;
  final LatLng? initialPosition;
  final double initialZoom;
  final Function(LatLng)? onMapTap;
  
  const MapWidget({
    super.key,
    required this.markers,
    this.initialPosition,
    this.initialZoom = 14.0,
    this.onMapTap,
  });

  @override
  State<MapWidget> createState() => _MapWidgetState();
}

class _MapWidgetState extends State<MapWidget> {
  GoogleMapController? _controller;
  
  // 의정부시 중심 좌표
  static const LatLng _uijeongbuCenter = LatLng(37.7388, 127.0474);

  @override
  Widget build(BuildContext context) {
    return GoogleMap(
      initialCameraPosition: CameraPosition(
        target: widget.initialPosition ?? _uijeongbuCenter,
        zoom: widget.initialZoom,
      ),
      markers: _createMarkers(),
      onMapCreated: (controller) {
        _controller = controller;
        _setMapStyle();
      },
      onTap: widget.onMapTap,
      myLocationEnabled: true,
      myLocationButtonEnabled: false,
      zoomControlsEnabled: false,
      mapToolbarEnabled: false,
    );
  }

  Set<Marker> _createMarkers() {
    return widget.markers.map((mapMarker) {
      return Marker(
        markerId: MarkerId(mapMarker.id),
        position: mapMarker.position,
        icon: mapMarker.icon ?? BitmapDescriptor.defaultMarker,
        infoWindow: InfoWindow(
          title: mapMarker.title,
          snippet: mapMarker.snippet,
        ),
        onTap: mapMarker.onTap,
      );
    }).toSet();
  }

  void _setMapStyle() {
    // Dark theme map style
    const String mapStyle = '''
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
        "featureType": "administrative",
        "elementType": "geometry",
        "stylers": [{"color": "#757575"}]
      },
      {
        "featureType": "poi",
        "elementType": "labels.text.fill",
        "stylers": [{"color": "#757575"}]
      },
      {
        "featureType": "poi.park",
        "elementType": "geometry",
        "stylers": [{"color": "#181818"}]
      },
      {
        "featureType": "road",
        "elementType": "geometry.fill",
        "stylers": [{"color": "#2c2c2c"}]
      },
      {
        "featureType": "road",
        "elementType": "labels.text.fill",
        "stylers": [{"color": "#8a8a8a"}]
      },
      {
        "featureType": "water",
        "elementType": "geometry",
        "stylers": [{"color": "#000000"}]
      },
      {
        "featureType": "water",
        "elementType": "labels.text.fill",
        "stylers": [{"color": "#3d3d3d"}]
      }
    ]
    ''';
    
    _controller?.setMapStyle(mapStyle);
  }

  @override
  void dispose() {
    _controller?.dispose();
    super.dispose();
  }
}

/// Map Marker 데이터 클래스
class MapMarker {
  final String id;
  final LatLng position;
  final String title;
  final String? snippet;
  final BitmapDescriptor? icon;
  final VoidCallback? onTap;

  const MapMarker({
    required this.id,
    required this.position,
    required this.title,
    this.snippet,
    this.icon,
    this.onTap,
  });
}

/// 의정부시 주요 위치 좌표
class UijeongbuLocations {
  // 의정부시청
  static const LatLng cityHall = LatLng(37.7388, 127.0474);
  
  // 의정부역
  static const LatLng uijeongbuStation = LatLng(37.7394, 127.0476);
  
  // 의정부동
  static const LatLng uijeongbuDong = LatLng(37.7388, 127.0474);
  
  // 신곡동
  static const LatLng singokDong = LatLng(37.7569, 127.0626);
  
  // 장암동
  static const LatLng jangamDong = LatLng(37.7484, 127.0577);
  
  // 호원동
  static const LatLng howonDong = LatLng(37.7249, 127.0658);
  
  // 의정부중앙공원
  static const LatLng centralPark = LatLng(37.7405, 127.0445);
  
  // 의정부성모병원
  static const LatLng sungmoHospital = LatLng(37.7367, 127.0513);
  
  /// 거리에 따른 줌 레벨 계산
  static double getZoomLevel(double distanceInMeters) {
    if (distanceInMeters < 100) return 18.0;
    if (distanceInMeters < 500) return 16.0;
    if (distanceInMeters < 1000) return 15.0;
    if (distanceInMeters < 5000) return 13.0;
    return 12.0;
  }
  
  /// 두 좌표 사이의 거리 계산 (미터)
  static double calculateDistance(LatLng from, LatLng to) {
    const double earthRadius = 6371000; // meters
    
    final lat1 = from.latitude * (3.14159265359 / 180);
    final lat2 = to.latitude * (3.14159265359 / 180);
    final lon1 = from.longitude * (3.14159265359 / 180);
    final lon2 = to.longitude * (3.14159265359 / 180);
    
    final dLat = lat2 - lat1;
    final dLon = lon2 - lon1;
    
    final a = (dLat / 2).abs() * (dLat / 2).abs() +
              lat1.abs() * lat2.abs() *
              (dLon / 2).abs() * (dLon / 2).abs();
    
    final c = 2 * (a.abs());
    
    return earthRadius * c;
  }
}

/// Custom Map Marker Icons
class MapMarkerIcons {
  static Future<BitmapDescriptor> cctv() async {
    return BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueBlue);
  }
  
  static Future<BitmapDescriptor> lighting() async {
    return BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueYellow);
  }
  
  static Future<BitmapDescriptor> parking() async {
    return BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueGreen);
  }
  
  static Future<BitmapDescriptor> shelter() async {
    return BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueOrange);
  }
  
  static Future<BitmapDescriptor> hospital() async {
    return BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueRed);
  }
  
  static Future<BitmapDescriptor> pharmacy() async {
    return BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueGreen);
  }
  
  static Future<BitmapDescriptor> park() async {
    return BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueCyan);
  }
  
  static Future<BitmapDescriptor> custom() async {
    return BitmapDescriptor.defaultMarkerWithHue(220); // Gold
  }
}
