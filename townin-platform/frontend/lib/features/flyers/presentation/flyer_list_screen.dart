import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../bloc/flyer_bloc.dart';
import '../bloc/flyer_event.dart';
import '../bloc/flyer_state.dart';
import '../widgets/flyer_card.dart';
import '../widgets/category_filter_bar.dart';
import '../../../core/enums/flyer_category.dart';
import 'flyer_detail_screen.dart';
import '../../favorites/bloc/favorite_bloc.dart';
import '../../favorites/bloc/favorite_event.dart';
import '../../favorites/bloc/favorite_state.dart';
import '../../../core/services/share_service.dart';

class FlyerListScreen extends StatefulWidget {
  final String? h3Index;

  const FlyerListScreen({
    Key? key,
    this.h3Index,
  }) : super(key: key);

  @override
  State<FlyerListScreen> createState() => _FlyerListScreenState();
}

class _FlyerListScreenState extends State<FlyerListScreen> {
  final ScrollController _scrollController = ScrollController();
  final TextEditingController _searchController = TextEditingController();
  FlyerCategory? _selectedCategory;
  bool _isSearching = false;

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_onScroll);

    // Load initial flyers
    if (widget.h3Index != null) {
      context.read<FlyerBloc>().add(
            LoadFlyersByLocation(h3Index: widget.h3Index!),
          );
    } else {
      // Load featured flyers if no location provided
      context.read<FlyerBloc>().add(const LoadFeaturedFlyers());
    }

    // Load favorite IDs for quick lookup
    context.read<FavoriteBloc>().add(const LoadFavoriteIds());
  }

  @override
  void dispose() {
    _scrollController.dispose();
    _searchController.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (_isBottom) {
      context.read<FlyerBloc>().add(const LoadMoreFlyers());
    }
  }

  bool get _isBottom {
    if (!_scrollController.hasClients) return false;
    final maxScroll = _scrollController.position.maxScrollExtent;
    final currentScroll = _scrollController.offset;
    return currentScroll >= (maxScroll * 0.9);
  }

  void _onSearch(String query) {
    if (query.isEmpty) {
      context.read<FlyerBloc>().add(const ClearFilters());
      setState(() => _isSearching = false);
    } else {
      context.read<FlyerBloc>().add(
            SearchFlyers(keyword: query, category: _selectedCategory),
          );
      setState(() => _isSearching = true);
    }
  }

  void _onCategorySelected(FlyerCategory? category) {
    setState(() => _selectedCategory = category);

    if (category == null) {
      if (_isSearching && _searchController.text.isNotEmpty) {
        context.read<FlyerBloc>().add(
              SearchFlyers(keyword: _searchController.text),
            );
      } else {
        context.read<FlyerBloc>().add(const ClearFilters());
      }
    } else {
      if (_isSearching && _searchController.text.isNotEmpty) {
        context.read<FlyerBloc>().add(
              SearchFlyers(
                keyword: _searchController.text,
                category: category,
              ),
            );
      } else {
        context.read<FlyerBloc>().add(FilterFlyersByCategory(category));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('전단지'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () {
              context.read<FlyerBloc>().add(const RefreshFlyers());
            },
          ),
        ],
      ),
      body: Column(
        children: [
          // Search Bar
          Padding(
            padding: const EdgeInsets.all(16),
            child: TextField(
              controller: _searchController,
              decoration: InputDecoration(
                hintText: '전단지 검색...',
                prefixIcon: const Icon(Icons.search),
                suffixIcon: _searchController.text.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear),
                        onPressed: () {
                          _searchController.clear();
                          _onSearch('');
                        },
                      )
                    : null,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                filled: true,
                fillColor: Colors.grey[100],
              ),
              onSubmitted: _onSearch,
            ),
          ),

          // Category Filter
          CategoryFilterBar(
            selectedCategory: _selectedCategory,
            onCategorySelected: _onCategorySelected,
          ),

          const Divider(height: 1),

          // Flyer List
          Expanded(
            child: BlocBuilder<FlyerBloc, FlyerState>(
              builder: (context, state) {
                if (state is FlyerLoading) {
                  return const Center(
                    child: CircularProgressIndicator(),
                  );
                }

                if (state is FlyerError) {
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.error_outline,
                          size: 64,
                          color: Colors.grey[400],
                        ),
                        const SizedBox(height: 16),
                        Text(
                          state.message,
                          style: TextStyle(
                            fontSize: 16,
                            color: Colors.grey[600],
                          ),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 16),
                        ElevatedButton(
                          onPressed: () {
                            context.read<FlyerBloc>().add(const RefreshFlyers());
                          },
                          child: const Text('다시 시도'),
                        ),
                      ],
                    ),
                  );
                }

                if (state is FlyerLoaded) {
                  if (state.flyers.isEmpty) {
                    return Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.inbox_outlined,
                            size: 64,
                            color: Colors.grey[400],
                          ),
                          const SizedBox(height: 16),
                          Text(
                            '전단지가 없습니다',
                            style: TextStyle(
                              fontSize: 16,
                              color: Colors.grey[600],
                            ),
                          ),
                        ],
                      ),
                    );
                  }

                  return RefreshIndicator(
                    onRefresh: () async {
                      context.read<FlyerBloc>().add(const RefreshFlyers());
                      await Future.delayed(const Duration(milliseconds: 500));
                    },
                    child: ListView.builder(
                      controller: _scrollController,
                      itemCount: state.flyers.length +
                          (state.hasMore || state.isLoadingMore ? 1 : 0),
                      itemBuilder: (context, index) {
                        if (index >= state.flyers.length) {
                          return const Padding(
                            padding: EdgeInsets.all(16),
                            child: Center(
                              child: CircularProgressIndicator(),
                            ),
                          );
                        }

                        final flyer = state.flyers[index];

                        return BlocBuilder<FavoriteBloc, FavoriteState>(
                          builder: (context, favoriteState) {
                            bool isFavorited = false;
                            if (favoriteState is FavoriteLoaded) {
                              isFavorited = favoriteState.isFavorited(flyer.id);
                            }

                            return FlyerCard(
                              flyer: flyer,
                              isFavorited: isFavorited,
                              onTap: () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (context) => FlyerDetailScreen(
                                      flyerId: flyer.id,
                                    ),
                                  ),
                                );
                              },
                              onFavoriteToggle: () {
                                context.read<FavoriteBloc>().add(
                                      ToggleFavorite(
                                        flyerId: flyer.id,
                                        isFavorited: isFavorited,
                                      ),
                                    );
                              },
                              onShare: () async {
                                try {
                                  await ShareService.shareFlyer(flyer);
                                } catch (e) {
                                  if (context.mounted) {
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      SnackBar(content: Text(e.toString())),
                                    );
                                  }
                                }
                              },
                            );
                          },
                        );
                      },
                    ),
                  );
                }

                return const SizedBox.shrink();
              },
            ),
          ),
        ],
      ),
    );
  }
}
