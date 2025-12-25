import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:share_plus/share_plus.dart';
import 'package:carousel_slider/carousel_slider.dart';
import 'providers/flyer_provider.dart';

class FlyerDetailScreen extends ConsumerStatefulWidget {
  final String flyerId;

  const FlyerDetailScreen({
    super.key,
    required this.flyerId,
  });

  @override
  ConsumerState<FlyerDetailScreen> createState() => _FlyerDetailScreenState();
}

class _FlyerDetailScreenState extends ConsumerState<FlyerDetailScreen> {
  int _currentImageIndex = 0;

  @override
  void initState() {
    super.initState();
    Future.microtask(
      () => ref.read(flyerDetailProvider.notifier).loadFlyer(widget.flyerId),
    );
  }

  @override
  Widget build(BuildContext context) {
    final detailState = ref.watch(flyerDetailProvider);

    if (detailState.isLoading) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    if (detailState.error != null || detailState.flyer == null) {
      return Scaffold(
        appBar: AppBar(),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline, size: 64, color: Colors.grey),
              const SizedBox(height: 16),
              Text(detailState.error ?? '전단지를 불러올 수 없습니다'),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: () => Navigator.pop(context),
                child: const Text('돌아가기'),
              ),
            ],
          ),
        ),
      );
    }

    final flyer = detailState.flyer!;
    final images = (flyer['images'] as List?)?.cast<String>() ?? [];

    return Scaffold(
      body: CustomScrollView(
        slivers: [
          // Image slider in app bar
          SliverAppBar(
            expandedHeight: 300,
            pinned: true,
            flexibleSpace: FlexibleSpaceBar(
              background: images.isEmpty
                  ? Container(
                      color: Colors.grey[300],
                      child: const Icon(Icons.image, size: 64),
                    )
                  : Stack(
                      children: [
                        CarouselSlider(
                          options: CarouselOptions(
                            height: double.infinity,
                            viewportFraction: 1.0,
                            enableInfiniteScroll: images.length > 1,
                            onPageChanged: (index, reason) {
                              setState(() {
                                _currentImageIndex = index;
                              });
                            },
                          ),
                          items: images.map((imageUrl) {
                            return CachedNetworkImage(
                              imageUrl: imageUrl,
                              fit: BoxFit.cover,
                              width: double.infinity,
                              placeholder: (context, url) => Container(
                                color: Colors.grey[300],
                                child: const Center(
                                  child: CircularProgressIndicator(),
                                ),
                              ),
                              errorWidget: (context, url, error) => Container(
                                color: Colors.grey[300],
                                child: const Icon(Icons.error),
                              ),
                            );
                          }).toList(),
                        ),
                        // Image indicator
                        if (images.length > 1)
                          Positioned(
                            bottom: 16,
                            left: 0,
                            right: 0,
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: images.asMap().entries.map((entry) {
                                return Container(
                                  width: 8,
                                  height: 8,
                                  margin: const EdgeInsets.symmetric(
                                    horizontal: 4,
                                  ),
                                  decoration: BoxDecoration(
                                    shape: BoxShape.circle,
                                    color: _currentImageIndex == entry.key
                                        ? Colors.white
                                        : Colors.white.withOpacity(0.4),
                                  ),
                                );
                              }).toList(),
                            ),
                          ),
                      ],
                    ),
            ),
            actions: [
              IconButton(
                icon: const Icon(Icons.share),
                onPressed: () => _shareFlyer(flyer),
              ),
            ],
          ),

          // Content
          SliverToBoxAdapter(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Title and actions
                Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        flyer['title'] ?? '',
                        style: const TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Row(
                        children: [
                          Icon(Icons.visibility,
                              size: 16, color: Colors.grey[600]),
                          const SizedBox(width: 4),
                          Text(
                            '${flyer['viewCount'] ?? 0}',
                            style: TextStyle(
                              fontSize: 14,
                              color: Colors.grey[600],
                            ),
                          ),
                          const SizedBox(width: 16),
                          Icon(Icons.favorite,
                              size: 16, color: Colors.grey[600]),
                          const SizedBox(width: 4),
                          Text(
                            '${flyer['likeCount'] ?? 0}',
                            style: TextStyle(
                              fontSize: 14,
                              color: Colors.grey[600],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      // Like and Bookmark buttons
                      Row(
                        children: [
                          Expanded(
                            child: OutlinedButton.icon(
                              onPressed: () {
                                ref
                                    .read(flyerDetailProvider.notifier)
                                    .toggleLike();
                              },
                              icon: Icon(
                                flyer['isLiked'] ?? false
                                    ? Icons.favorite
                                    : Icons.favorite_border,
                                color: flyer['isLiked'] ?? false
                                    ? Colors.red
                                    : null,
                              ),
                              label: const Text('좋아요'),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: OutlinedButton.icon(
                              onPressed: () {
                                ref
                                    .read(flyerDetailProvider.notifier)
                                    .toggleBookmark();
                              },
                              icon: Icon(
                                flyer['isBookmarked'] ?? false
                                    ? Icons.bookmark
                                    : Icons.bookmark_border,
                                color: flyer['isBookmarked'] ?? false
                                    ? Colors.blue
                                    : null,
                              ),
                              label: const Text('북마크'),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),

                const Divider(height: 1),

                // Valid period
                if (flyer['startDate'] != null || flyer['endDate'] != null)
                  Padding(
                    padding: const EdgeInsets.all(16),
                    child: Row(
                      children: [
                        const Icon(Icons.calendar_today, size: 20),
                        const SizedBox(width: 8),
                        Text(
                          '유효기간: ${flyer['startDate'] ?? ''} ~ ${flyer['endDate'] ?? ''}',
                          style: const TextStyle(fontSize: 14),
                        ),
                      ],
                    ),
                  ),

                const Divider(height: 1),

                // Description
                Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        '상세 내용',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 12),
                      Text(
                        flyer['description'] ?? '',
                        style: const TextStyle(
                          fontSize: 14,
                          height: 1.6,
                        ),
                      ),
                    ],
                  ),
                ),

                const Divider(height: 1),

                // Merchant info
                Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        '상점 정보',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 12),
                      ListTile(
                        contentPadding: EdgeInsets.zero,
                        leading: CircleAvatar(
                          backgroundColor: Colors.blue[100],
                          child: const Icon(Icons.store, color: Colors.blue),
                        ),
                        title: Text(flyer['merchantName'] ?? ''),
                        subtitle: Text(flyer['merchantAddress'] ?? ''),
                        trailing: const Icon(Icons.arrow_forward_ios, size: 16),
                        onTap: () {
                          // Navigate to merchant detail
                        },
                      ),
                      if (flyer['merchantPhone'] != null)
                        ListTile(
                          contentPadding: EdgeInsets.zero,
                          leading: const Icon(Icons.phone),
                          title: Text(flyer['merchantPhone']),
                          trailing: const Icon(Icons.arrow_forward_ios, size: 16),
                          onTap: () {
                            // Call phone number
                          },
                        ),
                    ],
                  ),
                ),

                // Bottom padding
                const SizedBox(height: 32),
              ],
            ),
          ),
        ],
      ),
    );
  }

  void _shareFlyer(Map<String, dynamic> flyer) {
    final title = flyer['title'] ?? '';
    final merchantName = flyer['merchantName'] ?? '';
    final text = '$title - $merchantName\n\n타운인 앱에서 확인하세요!';

    Share.share(text);
  }
}
