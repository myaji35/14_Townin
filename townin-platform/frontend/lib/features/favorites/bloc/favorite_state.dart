import 'package:equatable/equatable.dart';
import '../../../core/models/flyer_model.dart';

abstract class FavoriteState extends Equatable {
  const FavoriteState();

  @override
  List<Object?> get props => [];
}

/// Initial state
class FavoriteInitial extends FavoriteState {
  const FavoriteInitial();
}

/// Loading favorite data
class FavoriteLoading extends FavoriteState {
  const FavoriteLoading();
}

/// Favorites loaded successfully
class FavoriteLoaded extends FavoriteState {
  final List<FlyerModel> favorites;
  final Set<String> favoriteIds; // For quick lookup
  final int total;
  final int currentPage;
  final bool hasMore;
  final bool isLoadingMore;

  const FavoriteLoaded({
    required this.favorites,
    required this.favoriteIds,
    required this.total,
    this.currentPage = 1,
    this.hasMore = true,
    this.isLoadingMore = false,
  });

  FavoriteLoaded copyWith({
    List<FlyerModel>? favorites,
    Set<String>? favoriteIds,
    int? total,
    int? currentPage,
    bool? hasMore,
    bool? isLoadingMore,
  }) {
    return FavoriteLoaded(
      favorites: favorites ?? this.favorites,
      favoriteIds: favoriteIds ?? this.favoriteIds,
      total: total ?? this.total,
      currentPage: currentPage ?? this.currentPage,
      hasMore: hasMore ?? this.hasMore,
      isLoadingMore: isLoadingMore ?? this.isLoadingMore,
    );
  }

  /// Check if a flyer is favorited
  bool isFavorited(String flyerId) => favoriteIds.contains(flyerId);

  @override
  List<Object?> get props => [
        favorites,
        favoriteIds,
        total,
        currentPage,
        hasMore,
        isLoadingMore,
      ];
}

/// Error state
class FavoriteError extends FavoriteState {
  final String message;

  const FavoriteError(this.message);

  @override
  List<Object?> get props => [message];
}

/// Toggling favorite (optimistic update)
class FavoriteToggling extends FavoriteState {
  final String flyerId;
  final bool isAdding;

  const FavoriteToggling({
    required this.flyerId,
    required this.isAdding,
  });

  @override
  List<Object?> get props => [flyerId, isAdding];
}
