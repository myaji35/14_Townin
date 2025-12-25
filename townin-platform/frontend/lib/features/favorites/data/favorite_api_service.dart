import 'package:dio/dio.dart';
import '../../../core/constants/api_constants.dart';
import '../../../core/models/flyer_model.dart';
import '../../../core/models/flyer_list_response.dart';
import '../../../core/network/dio_client.dart';

class FavoriteApiService {
  final Dio _dio;

  FavoriteApiService({Dio? dio}) : _dio = dio ?? DioClient().dio;

  /// Add flyer to favorites
  Future<void> addFavorite(String flyerId) async {
    try {
      await _dio.post('${ApiConstants.favorites}/$flyerId');
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  /// Remove flyer from favorites
  Future<void> removeFavorite(String flyerId) async {
    try {
      await _dio.delete('${ApiConstants.favorites}/$flyerId');
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  /// Get all favorite flyers
  Future<FlyerListResponse> getFavorites({
    int page = 1,
    int limit = 20,
  }) async {
    try {
      final response = await _dio.get(
        ApiConstants.favorites,
        queryParameters: {
          'page': page,
          'limit': limit,
        },
      );

      return FlyerListResponse.fromJson(response.data);
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  /// Check if flyer is favorited
  Future<bool> isFavorited(String flyerId) async {
    try {
      final response = await _dio.get('${ApiConstants.favorites}/check/$flyerId');
      return response.data['isFavorited'] as bool;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  /// Get all favorite flyer IDs (for batch checking)
  Future<List<String>> getFavoriteIds() async {
    try {
      final response = await _dio.get('${ApiConstants.favorites}/ids');
      final List<dynamic> ids = response.data['favoriteIds'] as List;
      return ids.map((id) => id.toString()).toList();
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  String _handleError(DioException error) {
    if (error.response != null) {
      final statusCode = error.response!.statusCode;
      final message = error.response!.data['message'] ?? 'Unknown error';

      switch (statusCode) {
        case 400:
          return '잘못된 요청입니다.';
        case 401:
          return '인증이 필요합니다.';
        case 404:
          return '전단지를 찾을 수 없습니다.';
        case 409:
          return '이미 즐겨찾기에 추가된 전단지입니다.';
        case 500:
          return '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
        default:
          return message;
      }
    } else if (error.type == DioExceptionType.connectionTimeout ||
        error.type == DioExceptionType.receiveTimeout) {
      return '연결 시간이 초과되었습니다.';
    } else if (error.type == DioExceptionType.unknown) {
      return '네트워크 연결을 확인해주세요.';
    } else {
      return '알 수 없는 오류가 발생했습니다.';
    }
  }
}
