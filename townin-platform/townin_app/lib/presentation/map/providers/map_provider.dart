import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import '../../../core/api/api_client.dart';
import '../../../data/services/public_data_service.dart';

// Map State
class MapState {
  final bool isLoading;
  final List<Map<String, dynamic>> cctvs;
  final List<Map<String, dynamic>> parking;
  final List<Map<String, dynamic>> shelters;
  final Set<Marker> markers;
  final LatLng? userLocation;
  final double radiusKm;
  final String? error;
  final MapFilter filter;

  MapState({
    this.isLoading = false,
    this.cctvs = const [],
    this.parking = const [],
    this.shelters = const [],
    this.markers = const {},
    this.userLocation,
    this.radiusKm = 2.0,
    this.error,
    this.filter = const MapFilter(),
  });

  MapState copyWith({
    bool? isLoading,
    List<Map<String, dynamic>>? cctvs,
    List<Map<String, dynamic>>? parking,
    List<Map<String, dynamic>>? shelters,
    Set<Marker>? markers,
    LatLng? userLocation,
    double? radiusKm,
    String? error,
    MapFilter? filter,
  }) {
    return MapState(
      isLoading: isLoading ?? this.isLoading,
      cctvs: cctvs ?? this.cctvs,
      parking: parking ?? this.parking,
      shelters: shelters ?? this.shelters,
      markers: markers ?? this.markers,
      userLocation: userLocation ?? this.userLocation,
      radiusKm: radiusKm ?? this.radiusKm,
      error: error,
      filter: filter ?? this.filter,
    );
  }

  int get totalCount => cctvs.length + parking.length + shelters.length;
}

// Map Filter
class MapFilter {
  final bool showCCTV;
  final bool showParking;
  final bool showShelters;

  const MapFilter({
    this.showCCTV = true,
    this.showParking = true,
    this.showShelters = true,
  });

  MapFilter copyWith({
    bool? showCCTV,
    bool? showParking,
    bool? showShelters,
  }) {
    return MapFilter(
      showCCTV: showCCTV ?? this.showCCTV,
      showParking: showParking ?? this.showParking,
      showShelters: showShelters ?? this.showShelters,
    );
  }
}

// Map Notifier
class MapNotifier extends StateNotifier<MapState> {
  final PublicDataService _publicDataService;

  MapNotifier(this._publicDataService) : super(MapState());

  Future<void> loadPublicData({
    required double lat,
    required double lng,
  }) async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      final result = await _publicDataService.getAllPublicData(
        lat: lat,
        lng: lng,
        radiusKm: state.radiusKm,
      );

      state = state.copyWith(
        isLoading: false,
        cctvs: result.cctvs,
        parking: result.parking,
        shelters: result.shelters,
        userLocation: LatLng(lat, lng),
      );

      _updateMarkers();
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
    }
  }

  void setRadius(double radiusKm) {
    state = state.copyWith(radiusKm: radiusKm);
    if (state.userLocation != null) {
      loadPublicData(
        lat: state.userLocation!.latitude,
        lng: state.userLocation!.longitude,
      );
    }
  }

  void updateFilter(MapFilter filter) {
    state = state.copyWith(filter: filter);
    _updateMarkers();
  }

  void _updateMarkers() {
    final markers = <Marker>{};

    // Add CCTV markers (red)
    if (state.filter.showCCTV) {
      for (var i = 0; i < state.cctvs.length; i++) {
        final cctv = state.cctvs[i];
        markers.add(
          Marker(
            markerId: MarkerId('cctv_$i'),
            position: LatLng(
              cctv['location']['coordinates'][1],
              cctv['location']['coordinates'][0],
            ),
            icon: BitmapDescriptor.defaultMarkerWithHue(
              BitmapDescriptor.hueRed,
            ),
            infoWindow: InfoWindow(
              title: 'CCTV',
              snippet: cctv['address'] ?? '',
            ),
          ),
        );
      }
    }

    // Add Parking markers (blue)
    if (state.filter.showParking) {
      for (var i = 0; i < state.parking.length; i++) {
        final park = state.parking[i];
        markers.add(
          Marker(
            markerId: MarkerId('parking_$i'),
            position: LatLng(
              park['location']['coordinates'][1],
              park['location']['coordinates'][0],
            ),
            icon: BitmapDescriptor.defaultMarkerWithHue(
              BitmapDescriptor.hueBlue,
            ),
            infoWindow: InfoWindow(
              title: park['name'] ?? '주차장',
              snippet:
                  '${park['capacity'] ?? 0}대 / ${park['pricePerHour'] ?? 0}원',
            ),
          ),
        );
      }
    }

    // Add Shelter markers (green)
    if (state.filter.showShelters) {
      for (var i = 0; i < state.shelters.length; i++) {
        final shelter = state.shelters[i];
        markers.add(
          Marker(
            markerId: MarkerId('shelter_$i'),
            position: LatLng(
              shelter['location']['coordinates'][1],
              shelter['location']['coordinates'][0],
            ),
            icon: BitmapDescriptor.defaultMarkerWithHue(
              BitmapDescriptor.hueGreen,
            ),
            infoWindow: InfoWindow(
              title: shelter['name'] ?? '대피소',
              snippet: '수용인원: ${shelter['capacity'] ?? 0}명',
            ),
          ),
        );
      }
    }

    state = state.copyWith(markers: markers);
  }
}

// Providers
final publicDataServiceProvider = Provider<PublicDataService>((ref) {
  return PublicDataService(ref.watch(apiClientProvider));
});

final mapProvider = StateNotifierProvider<MapNotifier, MapState>((ref) {
  return MapNotifier(ref.watch(publicDataServiceProvider));
});

// API Client Provider
final apiClientProvider = Provider<ApiClient>((ref) {
  return ApiClient();
});
