# Story USR-007-08: Map View Toggle

**Epic**: USR-007 Digital Flyer Viewer
**Priority**: P0 (Critical)
**Story Points**: 5
**Status**: 📋 Planned

## User Story

**As a** user
**I want to** see flyers on a map
**So that** I can find nearby stores visually

## Acceptance Criteria

- [ ] 리스트/지도 뷰 토글
- [ ] 지도에 전단지 마커 표시
- [ ] 마커 클릭 → 전단지 미리보기
- [ ] 지도 이동 → 해당 영역 전단지 로드
- [ ] 현재 위치 표시
- [ ] 마커 클러스터링 (선택)
- [ ] Bottom sheet로 전단지 카드 표시

## Tasks

### Frontend
- [ ] Map view component
- [ ] Flyer markers
- [ ] Marker click handler
- [ ] Bottom sheet preview
- [ ] View toggle button
- [ ] Current location button
- [ ] Marker clustering (optional)

### Backend
- [ ] GET /flyers/map endpoint
- [ ] Bounding box query
- [ ] Marker data optimization

### Testing
- [ ] Unit tests: Marker data
- [ ] Integration test: Map query
- [ ] E2E test: Map view

## Technical Notes

```typescript
// Map View Screen (Flutter with Kakao Map)
import 'package:kakao_map_plugin/kakao_map_plugin.dart';

class FlyerMapView extends StatefulWidget {
  @override
  _FlyerMapViewState createState() => _FlyerMapViewState();
}

class _FlyerMapViewState extends State<FlyerMapView> {
  late KakaoMapController _mapController;
  List<FlyerMarker> _markers = [];
  FlyerListItem? _selectedFlyer;
  bool _isLoading = false;
  LatLng? _currentPosition;

  @override
  void initState() {
    super.initState();
    _getCurrentLocation();
  }

  Future<void> _getCurrentLocation() async {
    try {
      final position = await Geolocator.getCurrentPosition();
      setState(() {
        _currentPosition = LatLng(position.latitude, position.longitude);
      });
    } catch (e) {
      // Use default (Seoul)
      setState(() {
        _currentPosition = LatLng(37.5665, 126.9780);
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('지도로 보기'),
        actions: [
          IconButton(
            icon: Icon(Icons.view_list),
            onPressed: () => Navigator.pop(context),
          ),
        ],
      ),
      body: _currentPosition == null
          ? Center(child: CircularProgressIndicator())
          : Stack(
              children: [
                // Kakao Map
                KakaoMap(
                  onMapCreated: _onMapCreated,
                  initialCameraPosition: CameraPosition(
                    target: _currentPosition!,
                    level: 4,
                  ),
                  markers: _buildMarkers(),
                  onCameraIdle: _onCameraIdle,
                  onMarkerTap: _onMarkerTap,
                  myLocationEnabled: true,
                ),

                // Loading overlay
                if (_isLoading)
                  Positioned(
                    top: 16,
                    left: 0,
                    right: 0,
                    child: Center(
                      child: Container(
                        padding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(20),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black26,
                              blurRadius: 4,
                              offset: Offset(0, 2),
                            ),
                          ],
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            SizedBox(
                              width: 16,
                              height: 16,
                              child: CircularProgressIndicator(strokeWidth: 2),
                            ),
                            SizedBox(width: 8),
                            Text('전단지 로드 중...'),
                          ],
                        ),
                      ),
                    ),
                  ),

                // Current location button
                Positioned(
                  right: 16,
                  bottom: _selectedFlyer != null ? 220 : 16,
                  child: FloatingActionButton(
                    mini: true,
                    onPressed: _moveToCurrentLocation,
                    child: Icon(Icons.my_location),
                    backgroundColor: Colors.white,
                  ),
                ),

                // Selected flyer bottom sheet
                if (_selectedFlyer != null)
                  Positioned(
                    left: 0,
                    right: 0,
                    bottom: 0,
                    child: _FlyerBottomSheet(
                      flyer: _selectedFlyer!,
                      onClose: () => setState(() => _selectedFlyer = null),
                      onTap: () => _openFlyerDetail(_selectedFlyer!),
                    ),
                  ),
              ],
            ),
    );
  }

  void _onMapCreated(KakaoMapController controller) {
    _mapController = controller;
    _loadFlyersInBounds();
  }

  Set<Marker> _buildMarkers() {
    return _markers.map((fm) {
      return Marker(
        markerId: fm.id,
        position: LatLng(fm.lat, fm.lng),
        infoWindow: InfoWindow(
          title: fm.title,
          snippet: fm.merchantName,
        ),
        icon: BitmapDescriptor.defaultMarkerWithHue(
          _getCategoryHue(fm.category),
        ),
      );
    }).toSet();
  }

  double _getCategoryHue(String category) {
    switch (category) {
      case 'FOOD_DINING':
        return BitmapDescriptor.hueRed;
      case 'SHOPPING':
        return BitmapDescriptor.hueBlue;
      case 'HEALTH_BEAUTY':
        return BitmapDescriptor.hueMagenta;
      default:
        return BitmapDescriptor.hueOrange;
    }
  }

  void _onCameraIdle() {
    _loadFlyersInBounds();
  }

  Future<void> _loadFlyersInBounds() async {
    setState(() => _isLoading = true);

    try {
      final bounds = await _mapController.getVisibleRegion();

      final markers = await FlyerService.getFlyersInBounds(
        northEast: bounds.northeast,
        southWest: bounds.southwest,
      );

      setState(() {
        _markers = markers;
      });
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('전단지 로드 실패')),
      );
    } finally {
      setState(() => _isLoading = false);
    }
  }

  void _onMarkerTap(String markerId) {
    final marker = _markers.firstWhere((m) => m.id == markerId);

    // Fetch full flyer data
    FlyerService.getFlyerById(marker.flyerId).then((flyer) {
      setState(() {
        _selectedFlyer = flyer;
      });

      // Move camera to marker
      _mapController.animateCamera(
        CameraUpdate.newLatLng(LatLng(marker.lat, marker.lng)),
      );
    });
  }

  Future<void> _moveToCurrentLocation() async {
    if (_currentPosition != null) {
      _mapController.animateCamera(
        CameraUpdate.newLatLng(_currentPosition!),
      );
    }
  }

  void _openFlyerDetail(FlyerListItem flyer) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => FlyerDetailScreen(flyerId: flyer.id),
      ),
    );
  }
}

class _FlyerBottomSheet extends StatelessWidget {
  final FlyerListItem flyer;
  final VoidCallback onClose;
  final VoidCallback onTap;

  const _FlyerBottomSheet({
    required this.flyer,
    required this.onClose,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 200,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
        boxShadow: [
          BoxShadow(
            color: Colors.black26,
            blurRadius: 10,
            offset: Offset(0, -2),
          ),
        ],
      ),
      child: Column(
        children: [
          // Drag handle
          Container(
            width: 40,
            height: 4,
            margin: EdgeInsets.symmetric(vertical: 8),
            decoration: BoxDecoration(
              color: Colors.grey.shade300,
              borderRadius: BorderRadius.circular(2),
            ),
          ),

          // Flyer card (simplified)
          Expanded(
            child: InkWell(
              onTap: onTap,
              child: Padding(
                padding: EdgeInsets.all(16),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Thumbnail
                    ClipRRect(
                      borderRadius: BorderRadius.circular(8),
                      child: Image.network(
                        flyer.imageUrl,
                        width: 100,
                        height: 100,
                        fit: BoxFit.cover,
                      ),
                    ),

                    SizedBox(width: 16),

                    // Info
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            flyer.title,
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                            ),
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),
                          SizedBox(height: 4),
                          Text(
                            flyer.merchantName,
                            style: TextStyle(fontSize: 14, color: Colors.grey),
                          ),
                          SizedBox(height: 4),
                          Row(
                            children: [
                              Icon(Icons.location_on, size: 16, color: Colors.grey),
                              SizedBox(width: 4),
                              Text(
                                '${flyer.distance.toStringAsFixed(1)}km',
                                style: TextStyle(fontSize: 14, color: Colors.grey),
                              ),
                            ],
                          ),
                          Spacer(),
                          Text(
                            '자세히 보기 →',
                            style: TextStyle(
                              fontSize: 14,
                              color: Color(0xFFF5A623),
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ],
                      ),
                    ),

                    IconButton(
                      icon: Icon(Icons.close, color: Colors.grey),
                      onPressed: onClose,
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// Flyer Marker Model
class FlyerMarker {
  final String id;
  final String flyerId;
  final String title;
  final String merchantName;
  final String category;
  final double lat;
  final double lng;

  FlyerMarker({
    required this.id,
    required this.flyerId,
    required this.title,
    required this.merchantName,
    required this.category,
    required this.lat,
    required this.lng,
  });

  factory FlyerMarker.fromJson(Map<String, dynamic> json) {
    final [lat, lng] = json['location'];
    return FlyerMarker(
      id: json['id'],
      flyerId: json['id'],
      title: json['title'],
      merchantName: json['merchantName'],
      category: json['category'],
      lat: lat,
      lng: lng,
    );
  }
}

// Flyer Service (Extended)
class FlyerService {
  static Future<List<FlyerMarker>> getFlyersInBounds({
    required LatLng northEast,
    required LatLng southWest,
  }) async {
    final response = await dio.get('/flyers/map', queryParameters: {
      'neLat': northEast.latitude,
      'neLng': northEast.longitude,
      'swLat': southWest.latitude,
      'swLng': southWest.longitude,
    });

    return (response.data['items'] as List)
        .map((item) => FlyerMarker.fromJson(item))
        .toList();
  }

  static Future<FlyerListItem> getFlyerById(String id) async {
    final response = await dio.get('/flyers/$id');
    return FlyerListItem.fromJson(response.data);
  }
}

// Backend: Map Query Endpoint
@Get('map')
@UseGuards(OptionalJwtAuthGuard)
async getFlyersInBounds(@Query() query: MapBoundsDto) {
  // Query flyers within bounding box
  const flyers = await this.flyerRepo
    .createQueryBuilder('f')
    .leftJoinAndSelect('f.merchant', 'm')
    .leftJoinAndSelect('f.gridCell', 'gc')
    .where('f.validFrom <= :now', { now: new Date() })
    .andWhere('f.validTo >= :now', { now: new Date() })
    .andWhere('f.status = :status', { status: 'published' })
    .andWhere(
      `ST_Contains(
        ST_MakeEnvelope(:swLng, :swLat, :neLng, :neLat, 4326),
        gc.center
      )`,
      {
        neLat: query.neLat,
        neLng: query.neLng,
        swLat: query.swLat,
        swLng: query.swLng,
      },
    )
    .limit(200) // Max markers to prevent overload
    .getMany();

  // Return minimal data for markers
  const markers = flyers.map((f) => {
    const [lat, lng] = this.h3Service.h3ToLatLng(f.gridCellH3Index);
    return {
      id: f.id,
      title: f.title,
      merchantName: f.merchant.name,
      category: f.category,
      location: [lat, lng],
    };
  });

  return { items: markers };
}

// Map Bounds DTO
export class MapBoundsDto {
  @IsNumber()
  neLat: number;

  @IsNumber()
  neLng: number;

  @IsNumber()
  swLat: number;

  @IsNumber()
  swLng: number;
}
```

## Dependencies

- **Depends on**: USR-007-01 (Flyer Feed), CORE-002 (Geospatial)
- **External**: Kakao Map SDK, geolocator
- **Blocks**: None

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Map view implemented
- [ ] Markers displayed
- [ ] Marker click working
- [ ] Bottom sheet working
- [ ] Map bounds query working
- [ ] Current location working
- [ ] Backend API working
- [ ] Tests passing
- [ ] Code reviewed and merged

## Notes

- Kakao Map SDK 사용 (무료)
- 마커는 최대 200개 제한 (성능)
- 마커 색상은 카테고리별 구분
- Bottom sheet로 전단지 미리보기
- 지도 이동 시 자동 새로고침
- H3 cell의 중심점을 마커 위치로 사용
- ST_MakeEnvelope로 bounding box 쿼리
- 클러스터링은 선택 사항 (google_maps_cluster_manager)
- 모바일에서만 제공 (웹은 리스트 뷰)
