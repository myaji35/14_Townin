import '../../core/api/api_client.dart';

class FlyerService {
  final ApiClient _apiClient;

  FlyerService(this._apiClient);

  // Get flyers list with pagination and filters
  Future<FlyerListResponse> getFlyers({
    required double lat,
    required double lng,
    double radiusKm = 5.0,
    int page = 1,
    int limit = 20,
    String? category,
    String sortBy = 'latest', // latest, distance, popular
  }) async {
    final queryParams = {
      'lat': lat,
      'lng': lng,
      'radiusKm': radiusKm,
      'page': page,
      'limit': limit,
      'sortBy': sortBy,
    };

    if (category != null && category.isNotEmpty) {
      queryParams['category'] = category;
    }

    final response = await _apiClient.get(
      '/flyers',
      queryParameters: queryParams,
    );

    return FlyerListResponse.fromJson(response.data);
  }

  // Get flyer detail
  Future<Map<String, dynamic>> getFlyerDetail(String flyerId) async {
    final response = await _apiClient.get('/flyers/$flyerId');
    return response.data;
  }

  // Like a flyer
  Future<void> likeFlyer(String flyerId) async {
    await _apiClient.post('/flyers/$flyerId/like');
  }

  // Unlike a flyer
  Future<void> unlikeFlyer(String flyerId) async {
    await _apiClient.delete('/flyers/$flyerId/like');
  }

  // Bookmark a flyer
  Future<void> bookmarkFlyer(String flyerId) async {
    await _apiClient.post('/flyers/$flyerId/bookmark');
  }

  // Remove bookmark
  Future<void> unbookmarkFlyer(String flyerId) async {
    await _apiClient.delete('/flyers/$flyerId/bookmark');
  }

  // Get user's bookmarked flyers
  Future<List<Map<String, dynamic>>> getMyBookmarks({
    int page = 1,
    int limit = 20,
  }) async {
    final response = await _apiClient.get(
      '/flyers/my/bookmarks',
      queryParameters: {
        'page': page,
        'limit': limit,
      },
    );

    return (response.data['data'] as List)
        .map((e) => e as Map<String, dynamic>)
        .toList();
  }
}

class FlyerListResponse {
  final List<Map<String, dynamic>> data;
  final int total;
  final int page;
  final int limit;
  final bool hasMore;

  FlyerListResponse({
    required this.data,
    required this.total,
    required this.page,
    required this.limit,
    required this.hasMore,
  });

  factory FlyerListResponse.fromJson(Map<String, dynamic> json) {
    final data = (json['data'] as List)
        .map((e) => e as Map<String, dynamic>)
        .toList();
    final total = json['total'] ?? 0;
    final page = json['page'] ?? 1;
    final limit = json['limit'] ?? 20;

    return FlyerListResponse(
      data: data,
      total: total,
      page: page,
      limit: limit,
      hasMore: data.length >= limit,
    );
  }
}
