import 'package:equatable/equatable.dart';

abstract class FavoriteEvent extends Equatable {
  const FavoriteEvent();

  @override
  List<Object?> get props => [];
}

/// Toggle favorite status for a flyer
class ToggleFavorite extends FavoriteEvent {
  final String flyerId;
  final bool isFavorited;

  const ToggleFavorite({
    required this.flyerId,
    required this.isFavorited,
  });

  @override
  List<Object?> get props => [flyerId, isFavorited];
}

/// Load all favorite flyers
class LoadFavorites extends FavoriteEvent {
  final int page;
  final int limit;

  const LoadFavorites({
    this.page = 1,
    this.limit = 20,
  });

  @override
  List<Object?> get props => [page, limit];
}

/// Load more favorite flyers (pagination)
class LoadMoreFavorites extends FavoriteEvent {
  const LoadMoreFavorites();
}

/// Load favorite IDs (for batch checking)
class LoadFavoriteIds extends FavoriteEvent {
  const LoadFavoriteIds();
}

/// Check if specific flyer is favorited
class CheckFavoriteStatus extends FavoriteEvent {
  final String flyerId;

  const CheckFavoriteStatus(this.flyerId);

  @override
  List<Object?> get props => [flyerId];
}

/// Refresh favorites list
class RefreshFavorites extends FavoriteEvent {
  const RefreshFavorites();
}
