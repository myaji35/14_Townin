import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../../../core/api/api_client.dart';
import '../../../data/services/auth_service.dart';

// Auth State
class AuthState {
  final bool isAuthenticated;
  final bool isLoading;
  final UserData? user;
  final String? error;

  AuthState({
    this.isAuthenticated = false,
    this.isLoading = false,
    this.user,
    this.error,
  });

  AuthState copyWith({
    bool? isAuthenticated,
    bool? isLoading,
    UserData? user,
    String? error,
  }) {
    return AuthState(
      isAuthenticated: isAuthenticated ?? this.isAuthenticated,
      isLoading: isLoading ?? this.isLoading,
      user: user ?? this.user,
      error: error,
    );
  }
}

// Auth Notifier
class AuthNotifier extends StateNotifier<AuthState> {
  final AuthService _authService;
  final FlutterSecureStorage _storage;

  AuthNotifier(this._authService, this._storage) : super(AuthState()) {
    _checkAuthStatus();
  }

  Future<void> _checkAuthStatus() async {
    final token = await _storage.read(key: 'auth_token');
    if (token != null) {
      // TODO: Validate token with backend
      state = state.copyWith(isAuthenticated: true);
    }
  }

  Future<void> login({
    required String email,
    required String password,
  }) async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      final response = await _authService.login(
        email: email,
        password: password,
      );

      // Save token
      await _storage.write(key: 'auth_token', value: response.accessToken);
      if (response.refreshToken != null) {
        await _storage.write(
          key: 'refresh_token',
          value: response.refreshToken!,
        );
      }

      state = state.copyWith(
        isAuthenticated: true,
        isLoading: false,
        user: response.user,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
      rethrow;
    }
  }

  Future<void> register({
    required String email,
    required String password,
    required String displayName,
  }) async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      final response = await _authService.register(
        email: email,
        password: password,
        displayName: displayName,
      );

      // Save token
      await _storage.write(key: 'auth_token', value: response.accessToken);
      if (response.refreshToken != null) {
        await _storage.write(
          key: 'refresh_token',
          value: response.refreshToken!,
        );
      }

      state = state.copyWith(
        isAuthenticated: true,
        isLoading: false,
        user: response.user,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
      rethrow;
    }
  }

  Future<void> logout() async {
    state = state.copyWith(isLoading: true);

    try {
      await _authService.logout();
    } catch (e) {
      // Continue logout even if API call fails
    }

    // Clear tokens
    await _storage.delete(key: 'auth_token');
    await _storage.delete(key: 'refresh_token');

    state = AuthState();
  }

  Future<void> kakaoLogin(String kakaoToken) async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      final response = await _authService.kakaoLogin(kakaoToken);

      await _storage.write(key: 'auth_token', value: response.accessToken);
      if (response.refreshToken != null) {
        await _storage.write(
          key: 'refresh_token',
          value: response.refreshToken!,
        );
      }

      state = state.copyWith(
        isAuthenticated: true,
        isLoading: false,
        user: response.user,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
      rethrow;
    }
  }

  Future<void> naverLogin(String naverToken) async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      final response = await _authService.naverLogin(naverToken);

      await _storage.write(key: 'auth_token', value: response.accessToken);
      if (response.refreshToken != null) {
        await _storage.write(
          key: 'refresh_token',
          value: response.refreshToken!,
        );
      }

      state = state.copyWith(
        isAuthenticated: true,
        isLoading: false,
        user: response.user,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
      rethrow;
    }
  }

  Future<void> googleLogin(String googleToken) async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      final response = await _authService.googleLogin(googleToken);

      await _storage.write(key: 'auth_token', value: response.accessToken);
      if (response.refreshToken != null) {
        await _storage.write(
          key: 'refresh_token',
          value: response.refreshToken!,
        );
      }

      state = state.copyWith(
        isAuthenticated: true,
        isLoading: false,
        user: response.user,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
      rethrow;
    }
  }
}

// Providers
final apiClientProvider = Provider<ApiClient>((ref) {
  return ApiClient();
});

final authServiceProvider = Provider<AuthService>((ref) {
  return AuthService(ref.watch(apiClientProvider));
});

final storageProvider = Provider<FlutterSecureStorage>((ref) {
  return const FlutterSecureStorage();
});

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier(
    ref.watch(authServiceProvider),
    ref.watch(storageProvider),
  );
});
