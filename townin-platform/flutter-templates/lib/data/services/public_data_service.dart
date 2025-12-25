import '../../core/api/api_client.dart';

class PublicDataService {
  final ApiClient _apiClient;

  PublicDataService(this._apiClient);

  // Fetch CCTV locations
  Future<List<Map<String, dynamic>>> getCCTVs({
    required double lat,
    required double lng,
    required double radiusKm,
  }) async {
    final response = await _apiClient.get(
      '/public-data/cctv',
      queryParameters: {
        'lat': lat,
        'lng': lng,
        'radiusKm': radiusKm,
      },
    );

    return (response.data['data'] as List)
        .map((e) => e as Map<String, dynamic>)
        .toList();
  }

  // Fetch parking locations
  Future<List<Map<String, dynamic>>> getParking({
    required double lat,
    required double lng,
    required double radiusKm,
  }) async {
    final response = await _apiClient.get(
      '/public-data/parking',
      queryParameters: {
        'lat': lat,
        'lng': lng,
        'radiusKm': radiusKm,
      },
    );

    return (response.data['data'] as List)
        .map((e) => e as Map<String, dynamic>)
        .toList();
  }

  // Fetch emergency shelters
  Future<List<Map<String, dynamic>>> getShelters({
    required double lat,
    required double lng,
    required double radiusKm,
  }) async {
    final response = await _apiClient.get(
      '/public-data/shelters',
      queryParameters: {
        'lat': lat,
        'lng': lng,
        'radiusKm': radiusKm,
      },
    );

    return (response.data['data'] as List)
        .map((e) => e as Map<String, dynamic>)
        .toList();
  }

  // Fetch all public data at once
  Future<PublicDataResult> getAllPublicData({
    required double lat,
    required double lng,
    required double radiusKm,
  }) async {
    final results = await Future.wait([
      getCCTVs(lat: lat, lng: lng, radiusKm: radiusKm),
      getParking(lat: lat, lng: lng, radiusKm: radiusKm),
      getShelters(lat: lat, lng: lng, radiusKm: radiusKm),
    ]);

    return PublicDataResult(
      cctvs: results[0],
      parking: results[1],
      shelters: results[2],
    );
  }
}

class PublicDataResult {
  final List<Map<String, dynamic>> cctvs;
  final List<Map<String, dynamic>> parking;
  final List<Map<String, dynamic>> shelters;

  PublicDataResult({
    required this.cctvs,
    required this.parking,
    required this.shelters,
  });

  int get totalCount => cctvs.length + parking.length + shelters.length;
}
