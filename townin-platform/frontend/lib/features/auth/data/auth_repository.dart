import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../../../core/constants/api_constants.dart';
import '../../../core/models/user_model.dart';
import '../../../core/network/dio_client.dart';

class AuthRepository {
  final Dio _dio;
  final FlutterSecureStorage _secureStorage;

  AuthRepository({
    Dio? dio,
    FlutterSecureStorage? secureStorage,
  })  : _dio = dio ?? DioClient().dio,
        _secureStorage = secureStorage ?? const FlutterSecureStorage();

  Future<Map<String, dynamic>> login(String email, String password) async {
    try {
      final response = await _dio.post(
        ApiConstants.login,
        data: {
          'email': email,
          'password': password,
        },
      );

      final accessToken = response.data['accessToken'] as String;
      final userData = response.data['user'] as Map<String, dynamic>;

      // Save token
      await _secureStorage.write(key: 'access_token', value: accessToken);

      return {
        'token': accessToken,
        'user': UserModel.fromJson(userData),
      };
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Future<UserModel> getProfile() async {
    try {
      final token = await _secureStorage.read(key: 'access_token');

      if (token == null) {
        throw Exception('No authentication token found');
      }

      final response = await _dio.get(
        ApiConstants.profile,
        options: Options(
          headers: {'Authorization': 'Bearer $token'},
        ),
      );

      return UserModel.fromJson(response.data);
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Future<void> logout() async {
    await _secureStorage.delete(key: 'access_token');
  }

  Future<String?> getToken() async {
    return await _secureStorage.read(key: 'access_token');
  }

  String _handleError(DioException error) {
    if (error.response != null) {
      final statusCode = error.response!.statusCode;
      final message = error.response!.data['message'] ?? 'Unknown error';

      switch (statusCode) {
        case 401:
          return '인증에 실패했습니다. 이메일과 비밀번호를 확인해주세요.';
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
