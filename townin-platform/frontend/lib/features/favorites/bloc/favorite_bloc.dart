import 'package:flutter_bloc/flutter_bloc.dart';
import '../data/favorite_api_service.dart';
import 'favorite_event.dart';
import 'favorite_state.dart';

class FavoriteBloc extends Bloc<FavoriteEvent, FavoriteState> {
  final FavoriteApiService _apiService;

  FavoriteBloc({FavoriteApiService? apiService})
      : _apiService = apiService ?? FavoriteApiService(),
        super(const FavoriteInitial()) {
    on<ToggleFavorite>(_onToggleFavorite);
    on<LoadFavorites>(_onLoadFavorites);
    on<LoadMoreFavorites>(_onLoadMoreFavorites);
    on<LoadFavoriteIds>(_onLoadFavoriteIds);
    on<RefreshFavorites>(_onRefreshFavorites);
  }

  Future<void> _onToggleFavorite(
    ToggleFavorite event,
    Emitter<FavoriteState> emit,
  ) async {
    // Emit toggling state for optimistic UI update
    emit(FavoriteToggling(
      flyerId: event.flyerId,
      isAdding: !event.isFavorited,
    ));

    try {
      if (event.isFavorited) {
        // Remove from favorites
        await _apiService.removeFavorite(event.flyerId);
      } else {
        // Add to favorites
        await _apiService.addFavorite(event.flyerId);
      }

      // Reload favorite IDs to sync state
      add(const LoadFavoriteIds());
    } catch (e) {
      emit(FavoriteError(e.toString()));
      // Revert to previous state if current state was loaded
      add(const LoadFavoriteIds());
    }
  }

  Future<void> _onLoadFavorites(
    LoadFavorites event,
    Emitter<FavoriteState> emit,
  ) async {
    if (event.page == 1) {
      emit(const FavoriteLoading());
    }

    try {
      // Load both favorites and IDs in parallel
      final results = await Future.wait([
        _apiService.getFavorites(page: event.page, limit: event.limit),
        _apiService.getFavoriteIds(),
      ]);

      final favoritesResponse = results[0] as dynamic;
      final favoriteIds = results[1] as List<String>;

      emit(FavoriteLoaded(
        favorites: favoritesResponse.data,
        favoriteIds: favoriteIds.toSet(),
        total: favoritesResponse.total,
        currentPage: event.page,
        hasMore: favoritesResponse.data.length < favoritesResponse.total,
      ));
    } catch (e) {
      emit(FavoriteError(e.toString()));
    }
  }

  Future<void> _onLoadMoreFavorites(
    LoadMoreFavorites event,
    Emitter<FavoriteState> emit,
  ) async {
    if (state is! FavoriteLoaded) return;

    final currentState = state as FavoriteLoaded;
    if (!currentState.hasMore || currentState.isLoadingMore) return;

    emit(currentState.copyWith(isLoadingMore: true));

    try {
      final nextPage = currentState.currentPage + 1;
      final response = await _apiService.getFavorites(
        page: nextPage,
        limit: 20,
      );

      final updatedFavorites = [...currentState.favorites, ...response.data];

      emit(FavoriteLoaded(
        favorites: updatedFavorites,
        favoriteIds: currentState.favoriteIds,
        total: response.total,
        currentPage: nextPage,
        hasMore: updatedFavorites.length < response.total,
        isLoadingMore: false,
      ));
    } catch (e) {
      emit(currentState.copyWith(isLoadingMore: false));
    }
  }

  Future<void> _onLoadFavoriteIds(
    LoadFavoriteIds event,
    Emitter<FavoriteState> emit,
  ) async {
    try {
      final favoriteIds = await _apiService.getFavoriteIds();

      if (state is FavoriteLoaded) {
        final currentState = state as FavoriteLoaded;
        emit(currentState.copyWith(
          favoriteIds: favoriteIds.toSet(),
        ));
      } else {
        // If not loaded yet, just load IDs
        emit(FavoriteLoaded(
          favorites: const [],
          favoriteIds: favoriteIds.toSet(),
          total: favoriteIds.length,
          currentPage: 0,
          hasMore: false,
        ));
      }
    } catch (e) {
      emit(FavoriteError(e.toString()));
    }
  }

  Future<void> _onRefreshFavorites(
    RefreshFavorites event,
    Emitter<FavoriteState> emit,
  ) async {
    add(const LoadFavorites(page: 1));
  }
}
