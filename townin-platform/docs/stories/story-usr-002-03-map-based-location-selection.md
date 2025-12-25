# Story USR-002-03: Map-Based Location Selection

**Epic**: USR-002 3-Hub Location Setup
**Priority**: P0 (Critical)
**Story Points**: 5
**Status**: 📋 Planned

## User Story

**As a** user
**I want to** pick my location on a map
**So that** I can choose the exact spot

## Acceptance Criteria

- [ ] 지도 UI (Kakao Map)
- [ ] 지도 클릭으로 위치 선택
- [ ] 마커 표시
- [ ] 주소 역지오코딩 (좌표 → 주소)
- [ ] H3 Grid Cell boundary overlay (optional)
- [ ] 현재 위치 버튼
- [ ] 확인 버튼

## Tasks

### Frontend
- [ ] Kakao Map integration
- [ ] Map click event handling
- [ ] Marker placement
- [ ] Current location button
- [ ] Address display
- [ ] Confirm button

### Backend
- [ ] POST /geocoding/reverse-geocode endpoint
- [ ] H3 boundary polygon generation
- [ ] Region lookup

### Testing
- [ ] Unit tests: Coordinate validation
- [ ] Integration test: Reverse geocoding
- [ ] E2E test: Map selection flow

## Technical Notes

```typescript
// Map Location Picker (Flutter)
class MapLocationPicker extends StatefulWidget {
  final HubType hubType;
  final HubData? initialLocation;

  const MapLocationPicker({
    required this.hubType,
    this.initialLocation,
  });

  @override
  _MapLocationPickerState createState() => _MapLocationPickerState();
}

class _MapLocationPickerState extends State<MapLocationPicker> {
  late KakaoMapController _mapController;
  LatLng? _selectedLocation;
  String? _selectedAddress;
  bool _isLoading = false;
  bool _isLoadingAddress = false;

  @override
  void initState() {
    super.initState();
    if (widget.initialLocation != null) {
      _selectedLocation = LatLng(
        widget.initialLocation!.lat,
        widget.initialLocation!.lng,
      );
      _selectedAddress = widget.initialLocation!.address;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('지도에서 위치 선택'),
        actions: [
          TextButton(
            onPressed: _selectedLocation != null && !_isLoading
                ? _handleConfirm
                : null,
            child: Text(
              '확인',
              style: TextStyle(
                color: _selectedLocation != null ? Color(0xFFF5A623) : Colors.grey,
              ),
            ),
          ),
        ],
      ),
      body: Stack(
        children: [
          // Kakao Map
          KakaoMap(
            onMapCreated: _onMapCreated,
            initialCameraPosition: CameraPosition(
              target: _selectedLocation ?? LatLng(37.5665, 126.9780), // Seoul
              level: 3,
            ),
            onMapTap: _onMapTap,
            markers: _selectedLocation != null
                ? [
                    Marker(
                      markerId: 'selected',
                      latLng: _selectedLocation!,
                    ),
                  ]
                : [],
          ),

          // Address display
          if (_selectedAddress != null)
            Positioned(
              top: 16,
              left: 16,
              right: 16,
              child: Container(
                padding: EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(8),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black26,
                      blurRadius: 4,
                      offset: Offset(0, 2),
                    ),
                  ],
                ),
                child: Row(
                  children: [
                    Icon(Icons.place, color: Color(0xFFF5A623)),
                    SizedBox(width: 8),
                    Expanded(
                      child: _isLoadingAddress
                          ? Text('주소 확인 중...')
                          : Text(
                              _selectedAddress!,
                              style: TextStyle(fontSize: 14),
                            ),
                    ),
                  ],
                ),
              ),
            ),

          // Current location button
          Positioned(
            right: 16,
            bottom: 100,
            child: FloatingActionButton(
              mini: true,
              onPressed: _moveToCurrentLocation,
              child: Icon(Icons.my_location),
              backgroundColor: Colors.white,
            ),
          ),

          // Search address button
          Positioned(
            left: 16,
            bottom: 100,
            child: FloatingActionButton.extended(
              onPressed: _openAddressSearch,
              icon: Icon(Icons.search),
              label: Text('주소 검색'),
              backgroundColor: Color(0xFFF5A623),
            ),
          ),
        ],
      ),
    );
  }

  void _onMapCreated(KakaoMapController controller) {
    _mapController = controller;
  }

  Future<void> _onMapTap(LatLng latLng) async {
    setState(() {
      _selectedLocation = latLng;
      _isLoadingAddress = true;
    });

    try {
      final address = await GeocodingService.reverseGeocode(
        latLng.latitude,
        latLng.longitude,
      );

      setState(() {
        _selectedAddress = address;
      });
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('주소를 가져올 수 없습니다')),
      );
    } finally {
      setState(() => _isLoadingAddress = false);
    }
  }

  Future<void> _moveToCurrentLocation() async {
    setState(() => _isLoading = true);

    try {
      final position = await Geolocator.getCurrentPosition();
      final latLng = LatLng(position.latitude, position.longitude);

      _mapController.moveCamera(
        CameraUpdate.newLatLng(latLng),
      );

      await _onMapTap(latLng);
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('현재 위치를 가져올 수 없습니다')),
      );
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _openAddressSearch() async {
    final result = await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => AddressSearchScreen(hubType: widget.hubType),
      ),
    );

    if (result != null && result is HubData) {
      Navigator.pop(context, result);
    }
  }

  Future<void> _handleConfirm() async {
    if (_selectedLocation == null) return;

    setState(() => _isLoading = true);

    try {
      final hubData = await GeocodingService.addressToHubData(
        address: _selectedAddress ?? '주소 없음',
        lat: _selectedLocation!.latitude,
        lng: _selectedLocation!.longitude,
      );

      Navigator.pop(context, hubData);
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('위치 변환 실패: ${e.toString()}')),
      );
    } finally {
      setState(() => _isLoading = false);
    }
  }
}

// Hub Location Picker with Address/Map Toggle
class HubLocationPicker extends StatefulWidget {
  final HubType hubType;

  const HubLocationPicker({required this.hubType});

  @override
  _HubLocationPickerState createState() => _HubLocationPickerState();
}

class _HubLocationPickerState extends State<HubLocationPicker> {
  int _selectedIndex = 0;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(_getHubLabel()),
        bottom: TabBar(
          onTap: (index) => setState(() => _selectedIndex = index),
          tabs: [
            Tab(text: '주소 검색', icon: Icon(Icons.search)),
            Tab(text: '지도 선택', icon: Icon(Icons.map)),
          ],
        ),
      ),
      body: IndexedStack(
        index: _selectedIndex,
        children: [
          AddressSearchScreen(hubType: widget.hubType),
          MapLocationPicker(hubType: widget.hubType),
        ],
      ),
    );
  }

  String _getHubLabel() {
    switch (widget.hubType) {
      case HubType.HOME:
        return '집 위치 선택';
      case HubType.WORK:
        return '회사 위치 선택';
      case HubType.FAMILY:
        return '본가 위치 선택';
    }
  }
}

// Geocoding Service (Extended)
class GeocodingService {
  static Future<String> reverseGeocode(double lat, double lng) async {
    final response = await dio.post('/geocoding/reverse-geocode', data: {
      'lat': lat,
      'lng': lng,
    });

    return response.data['address'];
  }

  static Future<List<LatLng>> getH3Boundary(String h3Index) async {
    final response = await dio.get('/geocoding/h3-boundary/$h3Index');

    return (response.data as List)
        .map((point) => LatLng(point['lat'], point['lng']))
        .toList();
  }
}

// Backend: H3 Boundary Generation
@Get('h3-boundary/:h3Index')
async getH3Boundary(@Param('h3Index') h3Index: string) {
  const boundary = cellToBoundary(h3Index);

  return boundary.map(([lat, lng]) => ({ lat, lng }));
}

// H3 Overlay Component (Optional - for visualization)
class H3BoundaryOverlay extends StatelessWidget {
  final String h3Index;

  const H3BoundaryOverlay({required this.h3Index});

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<List<LatLng>>(
      future: GeocodingService.getH3Boundary(h3Index),
      builder: (context, snapshot) {
        if (!snapshot.hasData) {
          return SizedBox.shrink();
        }

        return Polygon(
          polygonId: 'h3-boundary',
          points: snapshot.data!,
          strokeColor: Color(0xFFF5A623),
          strokeWidth: 2,
          fillColor: Color(0xFFF5A623).withOpacity(0.2),
        );
      },
    );
  }
}
```

## Dependencies

- **Depends on**: USR-002-01, USR-002-02, CORE-002
- **External**: Kakao Map SDK, Kakao Local API, Geolocator
- **Blocks**: None

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Map UI implemented
- [ ] Map tap handling working
- [ ] Marker placement working
- [ ] Reverse geocoding working
- [ ] Current location working
- [ ] Address/Map toggle working
- [ ] Backend API working
- [ ] Tests passing
- [ ] Code reviewed and merged

## Notes

- Kakao Map SDK 사용 (iOS/Android/Web)
- 지도 클릭 시 마커 자동 이동
- 주소 검색과 지도 선택을 탭으로 전환
- H3 boundary overlay는 선택 사항 (혼란 방지)
- Geolocator로 현재 위치 가져오기
- 위치 권한 요청 필요
- 역지오코딩은 Kakao API 사용
- 최종적으로 H3 Grid Cell로 변환하여 저장
