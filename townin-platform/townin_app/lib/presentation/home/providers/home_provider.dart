import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/api/api_client.dart';

// Home State
class HomeState {
  final bool isLoading;
  final DashboardData? dashboard;
  final String? error;

  HomeState({
    this.isLoading = false,
    this.dashboard,
    this.error,
  });

  HomeState copyWith({
    bool? isLoading,
    DashboardData? dashboard,
    String? error,
  }) {
    return HomeState(
      isLoading: isLoading ?? this.isLoading,
      dashboard: dashboard ?? this.dashboard,
      error: error,
    );
  }
}

// Dashboard Data Model
class DashboardData {
  final PointsData points;
  final HubsData hubs;
  final List<Map<String, dynamic>> nearbyFlyers;

  DashboardData({
    required this.points,
    required this.hubs,
    required this.nearbyFlyers,
  });

  factory DashboardData.fromJson(Map<String, dynamic> json) {
    return DashboardData(
      points: PointsData.fromJson(json['points']),
      hubs: HubsData.fromJson(json['hubs']),
      nearbyFlyers: (json['nearbyFlyers']['data'] as List?)
          ?.map((e) => e as Map<String, dynamic>)
          .toList() ?? [],
    );
  }
}

class PointsData {
  final int totalPoints;

  PointsData({required this.totalPoints});

  factory PointsData.fromJson(Map<String, dynamic> json) {
    return PointsData(totalPoints: json['totalPoints'] ?? 0);
  }
}

class HubsData {
  final int totalHubs;
  final List<Map<String, dynamic>> hubs;

  HubsData({required this.totalHubs, required this.hubs});

  factory HubsData.fromJson(Map<String, dynamic> json) {
    return HubsData(
      totalHubs: json['totalHubs'] ?? 0,
      hubs: (json['hubs'] as List?)
          ?.map((e) => e as Map<String, dynamic>)
          .toList() ?? [],
    );
  }
}

// Home Notifier
class HomeNotifier extends StateNotifier<HomeState> {
  final ApiClient _apiClient;

  HomeNotifier(this._apiClient) : super(HomeState());

  Future<void> loadDashboard() async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      final response = await _apiClient.get('/users/me/dashboard');

      final dashboard = DashboardData.fromJson(response.data);

      state = state.copyWith(
        isLoading: false,
        dashboard: dashboard,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
    }
  }

  Future<void> refresh() async {
    await loadDashboard();
  }
}

// Provider
final homeProvider = StateNotifierProvider<HomeNotifier, HomeState>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return HomeNotifier(apiClient);
});

// API Client Provider
final apiClientProvider = Provider<ApiClient>((ref) {
  return ApiClient();
});
