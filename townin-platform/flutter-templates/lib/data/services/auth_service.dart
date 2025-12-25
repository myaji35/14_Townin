import 'package:dio/dio.dart';
import '../../core/api/api_client.dart';

class AuthService {
  final ApiClient _apiClient;

  AuthService(this._apiClient);

  /// Register a new user
  Future<AuthResponse> register({
    required String email,
    required String password,
    required String displayName,
  }) async {
    final response = await _apiClient.post(
      '/auth/register',
      data: {
        'email': email,
        'password': password,
        'displayName': displayName,
      },
    );

    return AuthResponse.fromJson(response.data);
  }

  /// Login with email and password
  Future<AuthResponse> login({
    required String email,
    required String password,
  }) async {
    final response = await _apiClient.post(
      '/auth/login',
      data: {
        'email': email,
        'password': password,
      },
    );

    return AuthResponse.fromJson(response.data);
  }

  /// Refresh access token
  Future<AuthResponse> refreshToken(String refreshToken) async {
    final response = await _apiClient.post(
      '/auth/refresh',
      data: {
        'refreshToken': refreshToken,
      },
    );

    return AuthResponse.fromJson(response.data);
  }

  /// Logout
  Future<void> logout() async {
    await _apiClient.post('/auth/logout');
  }

  /// OAuth - Kakao
  Future<AuthResponse> kakaoLogin(String kakaoToken) async {
    final response = await _apiClient.post(
      '/auth/kakao',
      data: {
        'accessToken': kakaoToken,
      },
    );

    return AuthResponse.fromJson(response.data);
  }

  /// OAuth - Naver
  Future<AuthResponse> naverLogin(String naverToken) async {
    final response = await _apiClient.post(
      '/auth/naver',
      data: {
        'accessToken': naverToken,
      },
    );

    return AuthResponse.fromJson(response.data);
  }

  /// OAuth - Google
  Future<AuthResponse> googleLogin(String googleToken) async {
    final response = await _apiClient.post(
      '/auth/google',
      data: {
        'accessToken': googleToken,
      },
    );

    return AuthResponse.fromJson(response.data);
  }
}

class AuthResponse {
  final String accessToken;
  final String? refreshToken;
  final UserData user;

  AuthResponse({
    required this.accessToken,
    this.refreshToken,
    required this.user,
  });

  factory AuthResponse.fromJson(Map<String, dynamic> json) {
    return AuthResponse(
      accessToken: json['accessToken'],
      refreshToken: json['refreshToken'],
      user: UserData.fromJson(json['user']),
    );
  }
}

class UserData {
  final String id;
  final String email;
  final String? displayName;
  final String role;
  final bool isActive;
  final bool isVerified;

  UserData({
    required this.id,
    required this.email,
    this.displayName,
    required this.role,
    required this.isActive,
    required this.isVerified,
  });

  factory UserData.fromJson(Map<String, dynamic> json) {
    return UserData(
      id: json['id'],
      email: json['email'],
      displayName: json['displayName'],
      role: json['role'],
      isActive: json['isActive'],
      isVerified: json['isVerified'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'displayName': displayName,
      'role': role,
      'isActive': isActive,
      'isVerified': isVerified,
    };
  }
}
