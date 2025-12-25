import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:geolocator/geolocator.dart';
import 'providers/flyer_provider.dart';

class FlyerListScreen extends ConsumerStatefulWidget {
  const FlyerListScreen({super.key});

  @override
  ConsumerState<FlyerListScreen> createState() => _FlyerListScreenState();
}

class _FlyerListScreenState extends ConsumerState<FlyerListScreen> {
  final ScrollController _scrollController = ScrollController();
  bool _isGridView = true;

  @override
  void initState() {
    super.initState();
    _initializeLocation();
    _scrollController.addListener(_onScroll);
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  Future<void> _initializeLocation() async {
    try {
      final position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
      );

      ref.read(flyerListProvider.notifier).setLocation(
            position.latitude,
            position.longitude,
          );
      ref.read(flyerListProvider.notifier).loadFlyers(refresh: true);
    } catch (e) {
      // Use default location if permission denied
      ref.read(flyerListProvider.notifier).loadFlyers(refresh: true);
    }
  }

  void _onScroll() {
    if (_scrollController.position.pixels >=
        _scrollController.position.maxScrollExtent * 0.8) {
      ref.read(flyerListProvider.notifier).loadMore();
    }
  }

  @override
  Widget build(BuildContext context) {
    final flyerState = ref.watch(flyerListProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('전단지'),
        actions: [
          IconButton(
            icon: Icon(_isGridView ? Icons.list : Icons.grid_view),
            onPressed: () {
              setState(() {
                _isGridView = !_isGridView;
              });
            },
          ),
          IconButton(
            icon: const Icon(Icons.filter_list),
            onPressed: () => _showFilterDialog(),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () =>
            ref.read(flyerListProvider.notifier).loadFlyers(refresh: true),
        child: flyerState.isLoading && flyerState.flyers.isEmpty
            ? const Center(child: CircularProgressIndicator())
            : flyerState.flyers.isEmpty
                ? _buildEmptyState()
                : Column(
                    children: [
                      // Filter chips
                      _buildFilterChips(flyerState),

                      // Flyer grid/list
                      Expanded(
                        child: _isGridView
                            ? _buildGridView(flyerState)
                            : _buildListView(flyerState),
                      ),

                      // Loading more indicator
                      if (flyerState.isLoadingMore)
                        const Padding(
                          padding: EdgeInsets.all(16),
                          child: CircularProgressIndicator(),
                        ),
                    ],
                  ),
      ),
    );
  }

  Widget _buildFilterChips(FlyerListState state) {
    return Container(
      height: 60,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: ListView(
        scrollDirection: Axis.horizontal,
        children: [
          // Sort by chips
          ChoiceChip(
            label: const Text('최신순'),
            selected: state.filter.sortBy == 'latest',
            onSelected: (selected) {
              if (selected) {
                ref.read(flyerListProvider.notifier).updateFilter(
                      state.filter.copyWith(sortBy: 'latest'),
                    );
              }
            },
          ),
          const SizedBox(width: 8),
          ChoiceChip(
            label: const Text('거리순'),
            selected: state.filter.sortBy == 'distance',
            onSelected: (selected) {
              if (selected) {
                ref.read(flyerListProvider.notifier).updateFilter(
                      state.filter.copyWith(sortBy: 'distance'),
                    );
              }
            },
          ),
          const SizedBox(width: 8),
          ChoiceChip(
            label: const Text('인기순'),
            selected: state.filter.sortBy == 'popular',
            onSelected: (selected) {
              if (selected) {
                ref.read(flyerListProvider.notifier).updateFilter(
                      state.filter.copyWith(sortBy: 'popular'),
                    );
              }
            },
          ),
          const SizedBox(width: 8),
          // Radius filter
          ActionChip(
            label: Text('${state.filter.radiusKm}km'),
            avatar: const Icon(Icons.location_on, size: 18),
            onPressed: () => _showRadiusDialog(),
          ),
        ],
      ),
    );
  }

  Widget _buildGridView(FlyerListState state) {
    return GridView.builder(
      controller: _scrollController,
      padding: const EdgeInsets.all(16),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        crossAxisSpacing: 16,
        mainAxisSpacing: 16,
        childAspectRatio: 0.75,
      ),
      itemCount: state.flyers.length,
      itemBuilder: (context, index) {
        final flyer = state.flyers[index];
        return _buildFlyerGridCard(flyer);
      },
    );
  }

  Widget _buildListView(FlyerListState state) {
    return ListView.builder(
      controller: _scrollController,
      padding: const EdgeInsets.all(16),
      itemCount: state.flyers.length,
      itemBuilder: (context, index) {
        final flyer = state.flyers[index];
        return _buildFlyerListCard(flyer);
      },
    );
  }

  Widget _buildFlyerGridCard(Map<String, dynamic> flyer) {
    return Card(
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: () {
          Navigator.pushNamed(
            context,
            '/flyer-detail',
            arguments: flyer['id'],
          );
        },
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Image
            Expanded(
              child: Stack(
                children: [
                  CachedNetworkImage(
                    imageUrl: flyer['thumbnailUrl'] ?? '',
                    width: double.infinity,
                    fit: BoxFit.cover,
                    placeholder: (context, url) => Container(
                      color: Colors.grey[300],
                      child: const Center(
                        child: CircularProgressIndicator(),
                      ),
                    ),
                    errorWidget: (context, url, error) => Container(
                      color: Colors.grey[300],
                      child: const Icon(Icons.image, size: 48),
                    ),
                  ),
                  // Bookmark button
                  Positioned(
                    top: 8,
                    right: 8,
                    child: CircleAvatar(
                      radius: 18,
                      backgroundColor: Colors.white,
                      child: IconButton(
                        icon: Icon(
                          flyer['isBookmarked'] ?? false
                              ? Icons.bookmark
                              : Icons.bookmark_border,
                          size: 20,
                          color: Colors.blue,
                        ),
                        padding: EdgeInsets.zero,
                        onPressed: () {
                          ref.read(flyerListProvider.notifier).toggleBookmark(
                                flyer['id'],
                                flyer['isBookmarked'] ?? false,
                              );
                        },
                      ),
                    ),
                  ),
                ],
              ),
            ),
            // Info
            Padding(
              padding: const EdgeInsets.all(8),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    flyer['title'] ?? '',
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 4),
                  Text(
                    flyer['merchantName'] ?? '',
                    style: TextStyle(
                      fontSize: 12,
                      color: Colors.grey[600],
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      Icon(Icons.favorite, size: 14, color: Colors.grey[600]),
                      const SizedBox(width: 4),
                      Text(
                        '${flyer['likeCount'] ?? 0}',
                        style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                      ),
                      const SizedBox(width: 12),
                      Icon(Icons.visibility, size: 14, color: Colors.grey[600]),
                      const SizedBox(width: 4),
                      Text(
                        '${flyer['viewCount'] ?? 0}',
                        style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFlyerListCard(Map<String, dynamic> flyer) {
    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      child: InkWell(
        onTap: () {
          Navigator.pushNamed(
            context,
            '/flyer-detail',
            arguments: flyer['id'],
          );
        },
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Row(
            children: [
              // Thumbnail
              ClipRRect(
                borderRadius: BorderRadius.circular(8),
                child: CachedNetworkImage(
                  imageUrl: flyer['thumbnailUrl'] ?? '',
                  width: 100,
                  height: 100,
                  fit: BoxFit.cover,
                  placeholder: (context, url) => Container(
                    color: Colors.grey[300],
                    child: const Center(child: CircularProgressIndicator()),
                  ),
                  errorWidget: (context, url, error) => Container(
                    color: Colors.grey[300],
                    child: const Icon(Icons.image),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              // Info
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      flyer['title'] ?? '',
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 4),
                    Text(
                      flyer['merchantName'] ?? '',
                      style: TextStyle(
                        fontSize: 14,
                        color: Colors.grey[600],
                      ),
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        Icon(Icons.favorite, size: 16, color: Colors.grey[600]),
                        const SizedBox(width: 4),
                        Text(
                          '${flyer['likeCount'] ?? 0}',
                          style:
                              TextStyle(fontSize: 12, color: Colors.grey[600]),
                        ),
                        const SizedBox(width: 12),
                        Icon(Icons.visibility,
                            size: 16, color: Colors.grey[600]),
                        const SizedBox(width: 4),
                        Text(
                          '${flyer['viewCount'] ?? 0}',
                          style:
                              TextStyle(fontSize: 12, color: Colors.grey[600]),
                        ),
                        const Spacer(),
                        IconButton(
                          icon: Icon(
                            flyer['isBookmarked'] ?? false
                                ? Icons.bookmark
                                : Icons.bookmark_border,
                            color: Colors.blue,
                          ),
                          onPressed: () {
                            ref.read(flyerListProvider.notifier).toggleBookmark(
                                  flyer['id'],
                                  flyer['isBookmarked'] ?? false,
                                );
                          },
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.receipt_long, size: 64, color: Colors.grey[400]),
          const SizedBox(height: 16),
          Text(
            '근처에 전단지가 없습니다',
            style: TextStyle(fontSize: 16, color: Colors.grey[600]),
          ),
        ],
      ),
    );
  }

  void _showFilterDialog() {
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('필터'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              ListTile(
                title: const Text('카테고리'),
                trailing: const Icon(Icons.arrow_forward_ios, size: 16),
                onTap: () {
                  // Show category selection
                },
              ),
              ListTile(
                title: const Text('반경 설정'),
                trailing: const Icon(Icons.arrow_forward_ios, size: 16),
                onTap: () {
                  Navigator.pop(context);
                  _showRadiusDialog();
                },
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('닫기'),
            ),
          ],
        );
      },
    );
  }

  void _showRadiusDialog() {
    final currentRadius = ref.read(flyerListProvider).filter.radiusKm;

    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('반경 설정'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [1.0, 2.0, 5.0, 10.0].map((radius) {
              return RadioListTile<double>(
                title: Text('${radius}km'),
                value: radius,
                groupValue: currentRadius,
                onChanged: (value) {
                  if (value != null) {
                    ref.read(flyerListProvider.notifier).updateFilter(
                          ref
                              .read(flyerListProvider)
                              .filter
                              .copyWith(radiusKm: value),
                        );
                    Navigator.pop(context);
                  }
                },
              );
            }).toList(),
          ),
        );
      },
    );
  }
}
