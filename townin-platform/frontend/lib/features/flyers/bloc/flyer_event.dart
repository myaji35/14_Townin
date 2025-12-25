import 'package:equatable/equatable.dart';
import '../../../core/enums/flyer_category.dart';

abstract class FlyerEvent extends Equatable {
  const FlyerEvent();

  @override
  List<Object?> get props => [];
}

class LoadFlyersByLocation extends FlyerEvent {
  final String h3Index;
  final int radius;

  const LoadFlyersByLocation({
    required this.h3Index,
    this.radius = 1,
  });

  @override
  List<Object?> get props => [h3Index, radius];
}

class LoadMoreFlyers extends FlyerEvent {
  const LoadMoreFlyers();
}

class SearchFlyers extends FlyerEvent {
  final String keyword;
  final FlyerCategory? category;

  const SearchFlyers({
    required this.keyword,
    this.category,
  });

  @override
  List<Object?> get props => [keyword, category];
}

class FilterFlyersByCategory extends FlyerEvent {
  final FlyerCategory category;

  const FilterFlyersByCategory(this.category);

  @override
  List<Object?> get props => [category];
}

class LoadFeaturedFlyers extends FlyerEvent {
  final int limit;

  const LoadFeaturedFlyers({this.limit = 10});

  @override
  List<Object?> get props => [limit];
}

class RefreshFlyers extends FlyerEvent {
  const RefreshFlyers();
}

class ClearFilters extends FlyerEvent {
  const ClearFilters();
}
