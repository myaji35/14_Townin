import 'package:dio/dio.dart';
import '../../../core/constants/api_constants.dart';
import '../../../core/network/dio_client.dart';
import 'flyer_cache_repository.dart';

class FlyerRepository {
  final Dio _dio;
  final FlyerCacheRepository _cacheRepository = FlyerCacheRepository();

  FlyerRepository({
    Dio? dio,
  }) : _dio = dio ?? DioClient().dio;

  Future<List<Map<String, dynamic>>> getAllFlyers() async {
    try {
      // Try to fetch from API
      final response = await _dio.get(
        '${ApiConstants.baseUrl}/flyers',
      );

      final flyers = List<Map<String, dynamic>>.from(response.data);

      // Cache the flyers
      await _cacheRepository.cacheFlyers(flyers);

      return flyers;
    } on DioException catch (e) {
      // If network error, return cached data
      if (e.type == DioExceptionType.unknown ||
          e.type == DioExceptionType.connectionTimeout ||
          e.type == DioExceptionType.receiveTimeout) {
        print('Network error, loading from cache...');
        final cachedFlyers = await _cacheRepository.getCachedFlyers();
        if (cachedFlyers.isNotEmpty) {
          return cachedFlyers;
        }
      }
      throw _handleError(e);
    }
  }

  Future<Map<String, dynamic>> getFlyerById(String id) async {
    try {
      // Try to fetch from API
      final response = await _dio.get(
        '${ApiConstants.baseUrl}/flyers/$id',
      );

      final flyer = response.data as Map<String, dynamic>;

      // Cache the flyer
      await _cacheRepository.cacheFlyer(flyer);

      return flyer;
    } on DioException catch (e) {
      // If network error, return cached data
      if (e.type == DioExceptionType.unknown ||
          e.type == DioExceptionType.connectionTimeout ||
          e.type == DioExceptionType.receiveTimeout) {
        print('Network error, loading flyer from cache...');
        final cachedFlyer = await _cacheRepository.getCachedFlyerById(id);
        if (cachedFlyer != null) {
          return cachedFlyer;
        }
      }
      throw _handleError(e);
    }
  }

  Future<void> incrementViewCount(String id) async {
    try {
      await _dio.post(
        '${ApiConstants.baseUrl}/flyers/$id/view',
      );
    } on DioException catch (e) {
      // Silently fail for view counts
      print('Failed to increment view count: ${e.toString()}');
    }
  }

  Future<void> incrementClickCount(String id) async {
    try {
      await _dio.post(
        '${ApiConstants.baseUrl}/flyers/$id/click',
      );
    } on DioException catch (e) {
      // Silently fail for click counts
      print('Failed to increment click count: ${e.toString()}');
    }
  }

  Future<List<Map<String, dynamic>>> getNearbyFlyers(String gridCell) async {
    try {
      final response = await _dio.get(
        '${ApiConstants.baseUrl}/flyers/nearby/$gridCell',
      );

      return List<Map<String, dynamic>>.from(response.data);
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  String _handleError(DioException error) {
    if (error.response != null) {
      final statusCode = error.response!.statusCode;
      final message = error.response!.data['message'] ?? 'Unknown error';

      switch (statusCode) {
        case 401:
          return '인증에 실패했습니다.';
        case 403:
          return '접근 권한이 없습니다.';
        case 404:
          return '요청한 리소스를 찾을 수 없습니다.';
        case 500:
          return '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
        default:
          return message;
      }
    } else if (error.type == DioExceptionType.connectionTimeout ||
        error.type == DioExceptionType.receiveTimeout) {
      return '연결 시간이 초과되었습니다. 네트워크 연결을 확인해주세요.';
    } else if (error.type == DioExceptionType.unknown) {
      return '네트워크 연결을 확인해주세요.';
    } else {
      return '알 수 없는 오류가 발생했습니다.';
    }
  }
}
