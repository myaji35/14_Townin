import 'package:dio/dio.dart';
import '../../../core/constants/api_constants.dart';
import '../../../core/enums/flyer_category.dart';
import '../../../core/models/flyer_model.dart';
import '../../../core/models/flyer_list_response.dart';
import '../../../core/network/dio_client.dart';

class FlyerApiService {
  final Dio _dio;

  FlyerApiService({Dio? dio}) : _dio = dio ?? DioClient().dio;

  /// Get flyers near user location (H3 grid-based)
  Future<FlyerListResponse> getFlyersByLocation({
    required String h3Index,
    int radius = 1,
    int page = 1,
    int limit = 20,
  }) async {
    try {
      final response = await _dio.get(
        '${ApiConstants.flyers}/location/$h3Index',
        queryParameters: {
          'radius': radius,
          'page': page,
          'limit': limit,
        },
      );

      return FlyerListResponse.fromJson(response.data);
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  /// Search flyers by keyword
  Future<FlyerListResponse> searchFlyers({
    required String keyword,
    FlyerCategory? category,
    int page = 1,
    int limit = 20,
  }) async {
    try {
      final queryParams = {
        'q': keyword,
        'page': page,
        'limit': limit,
      };

      if (category != null) {
        queryParams['category'] = category.name;
      }

      final response = await _dio.get(
        '${ApiConstants.flyers}/search',
        queryParameters: queryParams,
      );

      return FlyerListResponse.fromJson(response.data);
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  /// Get flyers by category
  Future<FlyerListResponse> getFlyersByCategory({
    required FlyerCategory category,
    int page = 1,
    int limit = 20,
  }) async {
    try {
      final response = await _dio.get(
        '${ApiConstants.flyers}/category/${category.name}',
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

  /// Get featured flyers (trending)
  Future<List<FlyerModel>> getFeaturedFlyers({int limit = 10}) async {
    try {
      final response = await _dio.get(
        '${ApiConstants.flyers}/featured',
        queryParameters: {'limit': limit},
      );

      final List<dynamic> data = response.data as List;
      return data.map((json) => FlyerModel.fromJson(json)).toList();
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  /// Get flyer detail by ID
  Future<FlyerModel> getFlyerById(String id) async {
    try {
      final response = await _dio.get('${ApiConstants.flyers}/$id');
      return FlyerModel.fromJson(response.data);
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  /// Track flyer view
  Future<void> trackFlyerView(String flyerId) async {
    try {
      await _dio.post('${ApiConstants.flyers}/$flyerId/view');
    } on DioException catch (e) {
      // Silently fail for analytics tracking
      print('Failed to track view: ${e.message}');
    }
  }

  /// Track flyer click
  Future<void> trackFlyerClick(String flyerId) async {
    try {
      await _dio.post('${ApiConstants.flyers}/$flyerId/click');
    } on DioException catch (e) {
      // Silently fail for analytics tracking
      print('Failed to track click: ${e.message}');
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
