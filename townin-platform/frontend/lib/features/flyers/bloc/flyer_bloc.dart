import 'package:flutter_bloc/flutter_bloc.dart';
import '../data/flyer_api_service.dart';
import '../../../core/enums/flyer_category.dart';
import '../../../core/models/flyer_model.dart';
import 'flyer_event.dart';
import 'flyer_state.dart';

class FlyerBloc extends Bloc<FlyerEvent, FlyerState> {
  final FlyerApiService _apiService;

  // Current filter state
  String? _currentH3Index;
  int _currentRadius = 1;
  String? _currentKeyword;
  FlyerCategory? _currentCategory;
  int _itemsPerPage = 20;

  FlyerBloc({FlyerApiService? apiService})
      : _apiService = apiService ?? FlyerApiService(),
        super(const FlyerInitial()) {
    on<LoadFlyersByLocation>(_onLoadFlyersByLocation);
    on<LoadMoreFlyers>(_onLoadMoreFlyers);
    on<SearchFlyers>(_onSearchFlyers);
    on<FilterFlyersByCategory>(_onFilterFlyersByCategory);
    on<LoadFeaturedFlyers>(_onLoadFeaturedFlyers);
    on<RefreshFlyers>(_onRefreshFlyers);
    on<ClearFilters>(_onClearFilters);
  }

  Future<void> _onLoadFlyersByLocation(
    LoadFlyersByLocation event,
    Emitter<FlyerState> emit,
  ) async {
    emit(const FlyerLoading());

    try {
      _currentH3Index = event.h3Index;
      _currentRadius = event.radius;
      _currentKeyword = null;
      _currentCategory = null;

      final response = await _apiService.getFlyersByLocation(
        h3Index: event.h3Index,
        radius: event.radius,
        page: 1,
        limit: _itemsPerPage,
      );

      emit(FlyerLoaded(
        flyers: response.data,
        total: response.total,
        currentPage: 1,
        hasMore: response.data.length < response.total,
      ));
    } catch (e) {
      emit(FlyerError(e.toString()));
    }
  }

  Future<void> _onLoadMoreFlyers(
    LoadMoreFlyers event,
    Emitter<FlyerState> emit,
  ) async {
    if (state is! FlyerLoaded) return;

    final currentState = state as FlyerLoaded;
    if (!currentState.hasMore || currentState.isLoadingMore) return;

    emit(currentState.copyWith(isLoadingMore: true));

    try {
      final nextPage = currentState.currentPage + 1;

      // Determine which API to call based on current filters
      final response = await _fetchFlyers(page: nextPage);

      final updatedFlyers = <FlyerModel>[...currentState.flyers, ...response.data];

      emit(FlyerLoaded(
        flyers: updatedFlyers,
        total: response.total,
        currentPage: nextPage,
        hasMore: updatedFlyers.length < response.total,
        isLoadingMore: false,
      ));
    } catch (e) {
      emit(currentState.copyWith(isLoadingMore: false));
    }
  }

  Future<void> _onSearchFlyers(
    SearchFlyers event,
    Emitter<FlyerState> emit,
  ) async {
    emit(const FlyerLoading());

    try {
      _currentKeyword = event.keyword;
      _currentCategory = event.category;
      _currentH3Index = null;

      final response = await _apiService.searchFlyers(
        keyword: event.keyword,
        category: event.category,
        page: 1,
        limit: _itemsPerPage,
      );

      emit(FlyerLoaded(
        flyers: response.data,
        total: response.total,
        currentPage: 1,
        hasMore: response.data.length < response.total,
      ));
    } catch (e) {
      emit(FlyerError(e.toString()));
    }
  }

  Future<void> _onFilterFlyersByCategory(
    FilterFlyersByCategory event,
    Emitter<FlyerState> emit,
  ) async {
    emit(const FlyerLoading());

    try {
      _currentCategory = event.category;
      _currentKeyword = null;
      _currentH3Index = null;

      final response = await _apiService.getFlyersByCategory(
        category: event.category,
        page: 1,
        limit: _itemsPerPage,
      );

      emit(FlyerLoaded(
        flyers: response.data,
        total: response.total,
        currentPage: 1,
        hasMore: response.data.length < response.total,
      ));
    } catch (e) {
      emit(FlyerError(e.toString()));
    }
  }

  Future<void> _onLoadFeaturedFlyers(
    LoadFeaturedFlyers event,
    Emitter<FlyerState> emit,
  ) async {
    emit(const FlyerLoading());

    try {
      _currentH3Index = null;
      _currentKeyword = null;
      _currentCategory = null;

      final flyers = await _apiService.getFeaturedFlyers(limit: event.limit);

      emit(FlyerLoaded(
        flyers: flyers,
        total: flyers.length,
        currentPage: 1,
        hasMore: false, // Featured flyers don't support pagination
      ));
    } catch (e) {
      emit(FlyerError(e.toString()));
    }
  }

  Future<void> _onRefreshFlyers(
    RefreshFlyers event,
    Emitter<FlyerState> emit,
  ) async {
    // Reload the current view
    if (_currentH3Index != null) {
      add(LoadFlyersByLocation(
        h3Index: _currentH3Index!,
        radius: _currentRadius,
      ));
    } else if (_currentKeyword != null) {
      add(SearchFlyers(
        keyword: _currentKeyword!,
        category: _currentCategory,
      ));
    } else if (_currentCategory != null) {
      add(FilterFlyersByCategory(_currentCategory!));
    }
  }

  Future<void> _onClearFilters(
    ClearFilters event,
    Emitter<FlyerState> emit,
  ) async {
    _currentKeyword = null;
    _currentCategory = null;

    if (_currentH3Index != null) {
      add(LoadFlyersByLocation(
        h3Index: _currentH3Index!,
        radius: _currentRadius,
      ));
    } else {
      emit(const FlyerInitial());
    }
  }

  Future<dynamic> _fetchFlyers({required int page}) async {
    if (_currentKeyword != null) {
      return await _apiService.searchFlyers(
        keyword: _currentKeyword!,
        category: _currentCategory,
        page: page,
        limit: _itemsPerPage,
      );
    } else if (_currentCategory != null) {
      return await _apiService.getFlyersByCategory(
        category: _currentCategory!,
        page: page,
        limit: _itemsPerPage,
      );
    } else if (_currentH3Index != null) {
      return await _apiService.getFlyersByLocation(
        h3Index: _currentH3Index!,
        radius: _currentRadius,
        page: page,
        limit: _itemsPerPage,
      );
    }
    throw Exception('No active filter');
  }
}
