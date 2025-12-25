import 'package:equatable/equatable.dart';
import '../../../core/models/flyer_model.dart';

abstract class FlyerState extends Equatable {
  const FlyerState();

  @override
  List<Object?> get props => [];
}

class FlyerInitial extends FlyerState {
  const FlyerInitial();
}

class FlyerLoading extends FlyerState {
  const FlyerLoading();
}

class FlyerLoaded extends FlyerState {
  final List<FlyerModel> flyers;
  final int total;
  final int currentPage;
  final bool hasMore;
  final bool isLoadingMore;

  const FlyerLoaded({
    required this.flyers,
    required this.total,
    this.currentPage = 1,
    this.hasMore = true,
    this.isLoadingMore = false,
  });

  FlyerLoaded copyWith({
    List<FlyerModel>? flyers,
    int? total,
    int? currentPage,
    bool? hasMore,
    bool? isLoadingMore,
  }) {
    return FlyerLoaded(
      flyers: flyers ?? this.flyers,
      total: total ?? this.total,
      currentPage: currentPage ?? this.currentPage,
      hasMore: hasMore ?? this.hasMore,
      isLoadingMore: isLoadingMore ?? this.isLoadingMore,
    );
  }

  @override
  List<Object?> get props => [flyers, total, currentPage, hasMore, isLoadingMore];
}

class FlyerError extends FlyerState {
  final String message;

  const FlyerError(this.message);

  @override
  List<Object?> get props => [message];
}
