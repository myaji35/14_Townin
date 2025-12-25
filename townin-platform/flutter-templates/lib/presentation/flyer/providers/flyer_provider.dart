import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/api/api_client.dart';
import '../../../data/services/flyer_service.dart';

// Flyer List State
class FlyerListState {
  final bool isLoading;
  final bool isLoadingMore;
  final List<Map<String, dynamic>> flyers;
  final int currentPage;
  final bool hasMore;
  final String? error;
  final FlyerFilter filter;

  FlyerListState({
    this.isLoading = false,
    this.isLoadingMore = false,
    this.flyers = const [],
    this.currentPage = 1,
    this.hasMore = true,
    this.error,
    this.filter = const FlyerFilter(),
  });

  FlyerListState copyWith({
    bool? isLoading,
    bool? isLoadingMore,
    List<Map<String, dynamic>>? flyers,
    int? currentPage,
    bool? hasMore,
    String? error,
    FlyerFilter? filter,
  }) {
    return FlyerListState(
      isLoading: isLoading ?? this.isLoading,
      isLoadingMore: isLoadingMore ?? this.isLoadingMore,
      flyers: flyers ?? this.flyers,
      currentPage: currentPage ?? this.currentPage,
      hasMore: hasMore ?? this.hasMore,
      error: error,
      filter: filter ?? this.filter,
    );
  }
}

// Flyer Filter
class FlyerFilter {
  final String? category;
  final double radiusKm;
  final String sortBy; // latest, distance, popular

  const FlyerFilter({
    this.category,
    this.radiusKm = 5.0,
    this.sortBy = 'latest',
  });

  FlyerFilter copyWith({
    String? category,
    double? radiusKm,
    String? sortBy,
  }) {
    return FlyerFilter(
      category: category ?? this.category,
      radiusKm: radiusKm ?? this.radiusKm,
      sortBy: sortBy ?? this.sortBy,
    );
  }
}

// Flyer Detail State
class FlyerDetailState {
  final bool isLoading;
  final Map<String, dynamic>? flyer;
  final String? error;

  FlyerDetailState({
    this.isLoading = false,
    this.flyer,
    this.error,
  });

  FlyerDetailState copyWith({
    bool? isLoading,
    Map<String, dynamic>? flyer,
    String? error,
  }) {
    return FlyerDetailState(
      isLoading: isLoading ?? this.isLoading,
      flyer: flyer ?? this.flyer,
      error: error,
    );
  }
}

// Flyer List Notifier
class FlyerListNotifier extends StateNotifier<FlyerListState> {
  final FlyerService _flyerService;
  double _currentLat = 37.4979; // Default location (Gangnam)
  double _currentLng = 127.0276;

  FlyerListNotifier(this._flyerService) : super(FlyerListState());

  void setLocation(double lat, double lng) {
    _currentLat = lat;
    _currentLng = lng;
  }

  Future<void> loadFlyers({bool refresh = false}) async {
    if (refresh) {
      state = state.copyWith(
        isLoading: true,
        error: null,
        currentPage: 1,
        flyers: [],
      );
    } else {
      state = state.copyWith(isLoading: true, error: null);
    }

    try {
      final response = await _flyerService.getFlyers(
        lat: _currentLat,
        lng: _currentLng,
        radiusKm: state.filter.radiusKm,
        page: state.currentPage,
        limit: 20,
        category: state.filter.category,
        sortBy: state.filter.sortBy,
      );

      state = state.copyWith(
        isLoading: false,
        flyers: response.data,
        hasMore: response.hasMore,
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
      final response = await _flyerService.getFlyers(
        lat: _currentLat,
        lng: _currentLng,
        radiusKm: state.filter.radiusKm,
        page: state.currentPage + 1,
        limit: 20,
        category: state.filter.category,
        sortBy: state.filter.sortBy,
      );

      state = state.copyWith(
        isLoadingMore: false,
        flyers: [...state.flyers, ...response.data],
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

  void updateFilter(FlyerFilter filter) {
    state = state.copyWith(filter: filter);
    loadFlyers(refresh: true);
  }

  Future<void> toggleLike(String flyerId, bool isLiked) async {
    try {
      if (isLiked) {
        await _flyerService.unlikeFlyer(flyerId);
      } else {
        await _flyerService.likeFlyer(flyerId);
      }

      // Update local state
      final updatedFlyers = state.flyers.map((flyer) {
        if (flyer['id'] == flyerId) {
          return {
            ...flyer,
            'isLiked': !isLiked,
            'likeCount': (flyer['likeCount'] ?? 0) + (isLiked ? -1 : 1),
          };
        }
        return flyer;
      }).toList();

      state = state.copyWith(flyers: updatedFlyers);
    } catch (e) {
      // Handle error silently or show snackbar
    }
  }

  Future<void> toggleBookmark(String flyerId, bool isBookmarked) async {
    try {
      if (isBookmarked) {
        await _flyerService.unbookmarkFlyer(flyerId);
      } else {
        await _flyerService.bookmarkFlyer(flyerId);
      }

      // Update local state
      final updatedFlyers = state.flyers.map((flyer) {
        if (flyer['id'] == flyerId) {
          return {
            ...flyer,
            'isBookmarked': !isBookmarked,
          };
        }
        return flyer;
      }).toList();

      state = state.copyWith(flyers: updatedFlyers);
    } catch (e) {
      // Handle error silently or show snackbar
    }
  }
}

// Flyer Detail Notifier
class FlyerDetailNotifier extends StateNotifier<FlyerDetailState> {
  final FlyerService _flyerService;

  FlyerDetailNotifier(this._flyerService) : super(FlyerDetailState());

  Future<void> loadFlyer(String flyerId) async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      final flyer = await _flyerService.getFlyerDetail(flyerId);

      state = state.copyWith(
        isLoading: false,
        flyer: flyer,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
    }
  }

  Future<void> toggleLike() async {
    if (state.flyer == null) return;

    final flyerId = state.flyer!['id'];
    final isLiked = state.flyer!['isLiked'] ?? false;

    try {
      if (isLiked) {
        await _flyerService.unlikeFlyer(flyerId);
      } else {
        await _flyerService.likeFlyer(flyerId);
      }

      // Update local state
      state = state.copyWith(
        flyer: {
          ...state.flyer!,
          'isLiked': !isLiked,
          'likeCount': (state.flyer!['likeCount'] ?? 0) + (isLiked ? -1 : 1),
        },
      );
    } catch (e) {
      // Handle error
    }
  }

  Future<void> toggleBookmark() async {
    if (state.flyer == null) return;

    final flyerId = state.flyer!['id'];
    final isBookmarked = state.flyer!['isBookmarked'] ?? false;

    try {
      if (isBookmarked) {
        await _flyerService.unbookmarkFlyer(flyerId);
      } else {
        await _flyerService.bookmarkFlyer(flyerId);
      }

      // Update local state
      state = state.copyWith(
        flyer: {
          ...state.flyer!,
          'isBookmarked': !isBookmarked,
        },
      );
    } catch (e) {
      // Handle error
    }
  }
}

// Providers
final flyerServiceProvider = Provider<FlyerService>((ref) {
  return FlyerService(ref.watch(apiClientProvider));
});

final flyerListProvider =
    StateNotifierProvider<FlyerListNotifier, FlyerListState>((ref) {
  return FlyerListNotifier(ref.watch(flyerServiceProvider));
});

final flyerDetailProvider =
    StateNotifierProvider<FlyerDetailNotifier, FlyerDetailState>((ref) {
  return FlyerDetailNotifier(ref.watch(flyerServiceProvider));
});

// API Client Provider
final apiClientProvider = Provider<ApiClient>((ref) {
  return ApiClient();
});
