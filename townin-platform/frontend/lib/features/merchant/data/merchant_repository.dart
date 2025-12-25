import 'package:dio/dio.dart';
import '../../../core/constants/api_constants.dart';
import '../../../core/network/dio_client.dart';

class MerchantRepository {
  final Dio _dio;

  MerchantRepository({
    Dio? dio,
  }) : _dio = dio ?? DioClient().dio;

  Future<List<Map<String, dynamic>>> getMerchantsByGridCell(
      String gridCell) async {
    try {
      final response = await _dio.get(
        '${ApiConstants.baseUrl}/merchants/grid-cell/$gridCell',
      );

      return List<Map<String, dynamic>>.from(response.data);
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Future<Map<String, dynamic>> getMerchantById(String id) async {
    try {
      final response = await _dio.get(
        '${ApiConstants.baseUrl}/merchants/$id',
      );

      return response.data as Map<String, dynamic>;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Future<List<Map<String, dynamic>>> getAllMerchants() async {
    try {
      final response = await _dio.get(
        '${ApiConstants.baseUrl}/merchants',
      );

      return List<Map<String, dynamic>>.from(response.data);
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Future<Map<String, dynamic>> updateMerchant(
      String id, Map<String, dynamic> data) async {
    try {
      final response = await _dio.put(
        '${ApiConstants.baseUrl}/merchants/$id',
        data: data,
      );

      return response.data as Map<String, dynamic>;
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
