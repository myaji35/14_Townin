import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/api/api_client.dart';
import '../../../data/services/points_service.dart';

// Points State
class PointsState {
  final bool isLoading;
  final bool isLoadingMore;
  final int totalPoints;
  final List<Map<String, dynamic>> transactions;
  final int currentPage;
  final bool hasMore;
  final String? error;
  final String? filterType; // null (all) | 'earn' | 'spend' | 'expire'

  PointsState({
    this.isLoading = false,
    this.isLoadingMore = false,
    this.totalPoints = 0,
    this.transactions = const [],
    this.currentPage = 1,
    this.hasMore = true,
    this.error,
    this.filterType,
  });

  PointsState copyWith({
    bool? isLoading,
    bool? isLoadingMore,
    int? totalPoints,
    List<Map<String, dynamic>>? transactions,
    int? currentPage,
    bool? hasMore,
    String? error,
    String? filterType,
  }) {
    return PointsState(
      isLoading: isLoading ?? this.isLoading,
      isLoadingMore: isLoadingMore ?? this.isLoadingMore,
      totalPoints: totalPoints ?? this.totalPoints,
      transactions: transactions ?? this.transactions,
      currentPage: currentPage ?? this.currentPage,
      hasMore: hasMore ?? this.hasMore,
      error: error,
      filterType: filterType ?? this.filterType,
    );
  }
}

// Points Notifier
class PointsNotifier extends StateNotifier<PointsState> {
  final PointsService _pointsService;

  PointsNotifier(this._pointsService) : super(PointsState());

  Future<void> loadBalance() async {
    try {
      final balance = await _pointsService.getBalance();
      state = state.copyWith(
        totalPoints: balance['totalPoints'] ?? 0,
      );
    } catch (e) {
      state = state.copyWith(error: e.toString());
    }
  }

  Future<void> loadTransactions({bool refresh = false}) async {
    if (refresh) {
      state = state.copyWith(
        isLoading: true,
        error: null,
        currentPage: 1,
        transactions: [],
      );
    } else {
      state = state.copyWith(isLoading: true, error: null);
    }

    try {
      final response = await _pointsService.getTransactions(
        page: state.currentPage,
        limit: 20,
        type: state.filterType,
      );

      state = state.copyWith(
        isLoading: false,
        transactions: response.data,
        hasMore: response.hasMore,
        totalPoints: response.data.isNotEmpty
            ? (response.data.first['balanceAfter'] ?? state.totalPoints)
            : state.totalPoints,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
    }
  }

  Future<void> loadMore() async {
    if (state.isLoadingMore || !state.hasMore) return;

    state = state.copyWith(isLoadingMore: true);

    try {
      final response = await _pointsService.getTransactions(
        page: state.currentPage + 1,
        limit: 20,
        type: state.filterType,
      );

      state = state.copyWith(
        isLoadingMore: false,
        transactions: [...state.transactions, ...response.data],
        currentPage: state.currentPage + 1,
        hasMore: response.hasMore,
      );
    } catch (e) {
      state = state.copyWith(
        isLoadingMore: false,
        error: e.toString(),
      );
    }
  }

  void setFilter(String? filterType) {
    state = state.copyWith(
      filterType: filterType,
      currentPage: 1,
    );
    loadTransactions(refresh: true);
  }

  Future<void> refresh() async {
    await Future.wait([
      loadBalance(),
      loadTransactions(refresh: true),
    ]);
  }
}

// Providers
final pointsServiceProvider = Provider<PointsService>((ref) {
  return PointsService(ref.watch(apiClientProvider));
});

final pointsProvider = StateNotifierProvider<PointsNotifier, PointsState>((ref) {
  final notifier = PointsNotifier(ref.watch(pointsServiceProvider));
  // Auto-load on creation
  Future.microtask(() => notifier.refresh());
  return notifier;
});

// API Client Provider
final apiClientProvider = Provider<ApiClient>((ref) {
  return ApiClient();
});
