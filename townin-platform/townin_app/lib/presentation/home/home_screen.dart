import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../core/theme/app_theme.dart';
import '../../core/mock/mock_data.dart';
import '../../core/i18n/language_provider.dart';
import '../../core/widgets/language_toggle.dart';
import 'providers/home_provider.dart';

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  int _currentNavIndex = 0;

  @override
  void initState() {
    super.initState();
    Future.microtask(() => ref.read(homeProvider.notifier).loadDashboard());
  }

  @override
  Widget build(BuildContext context) {
    final homeState = ref.watch(homeProvider);
    final l10n = ref.watch(localizationProvider);

    return Scaffold(
      backgroundColor: AppTheme.bgApp,
      body: homeState.isLoading
          ? Center(
              child: CircularProgressIndicator(
                color: AppTheme.accentGold,
              ),
            )
          : SafeArea(
              child: Column(
                children: [
                  _buildHeader(),
                  Expanded(
                    child: RefreshIndicator(
                      onRefresh: () =>
                          ref.read(homeProvider.notifier).loadDashboard(),
                      color: AppTheme.accentGold,
                      backgroundColor: AppTheme.bgCard,
                      child: CustomScrollView(
                        physics: const AlwaysScrollableScrollPhysics(),
                        slivers: [
                          SliverPadding(
                            padding: const EdgeInsets.all(AppTheme.space4),
                            sliver: SliverList(
                              delegate: SliverChildListDelegate([
                                _buildGraphRAGBanner(),
                                const SizedBox(height: AppTheme.space6),
                                _buildSectionHeader(l10n.recommendedForYou),
                                const SizedBox(height: AppTheme.space4),
                                _buildFlyersGrid(homeState),
                              ]),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
      bottomNavigationBar: _buildBottomNav(),
    );
  }

  Widget _buildHeader() {
    final l10n = ref.watch(localizationProvider);

    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: AppTheme.space4,
        vertical: AppTheme.space3,
      ),
      decoration: BoxDecoration(
        color: AppTheme.bgSidebar,
        border: Border(
          bottom: BorderSide(
            color: Colors.white.withOpacity(0.05),
            width: 1,
          ),
        ),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.symmetric(
              horizontal: AppTheme.space4,
              vertical: AppTheme.space2,
            ),
            decoration: BoxDecoration(
              color: AppTheme.bgCard,
              borderRadius: BorderRadius.circular(AppTheme.radiusPill),
              border: Border.all(
                color: Colors.white.withOpacity(0.05),
              ),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Text('📍', style: TextStyle(fontSize: 16)),
                const SizedBox(width: AppTheme.space2),
                Text(
                  '의정부시, 의정부동',
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: AppTheme.textPrimary,
                        fontWeight: FontWeight.w600,
                      ),
                ),
                const SizedBox(width: AppTheme.space2),
                Icon(
                  Icons.keyboard_arrow_down,
                  color: AppTheme.textMuted,
                  size: 16,
                ),
              ],
            ),
          ),
          const Spacer(),
          Text(
            l10n.digitalFlyers,
            style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                  color: AppTheme.textPrimary,
                ),
          ),
          const Spacer(),
          const LanguageToggle(),
          const SizedBox(width: AppTheme.space2),
          IconButton(
            icon: const Icon(Icons.notifications_outlined),
            color: AppTheme.textSecondary,
            onPressed: () {},
          ),
        ],
      ),
    );
  }

  Widget _buildGraphRAGBanner() {
    final l10n = ref.watch(localizationProvider);

    return Container(
      padding: const EdgeInsets.all(AppTheme.space6),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Color(0xFF1C2026), Color(0xFF111316)],
        ),
        borderRadius: BorderRadius.circular(AppTheme.radiusLg),
        border: Border.all(
          color: Colors.white.withOpacity(0.05),
        ),
        boxShadow: AppTheme.cardShadow,
      ),
      child: Row(
        children: [
          Container(
            width: 56,
            height: 56,
            decoration: BoxDecoration(
              color: AppTheme.accentGold.withOpacity(0.15),
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Center(
              child: Text('✨', style: TextStyle(fontSize: 28)),
            ),
          ),
          const SizedBox(width: AppTheme.space6),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Flexible(
                      child: Text(
                        l10n.graphragTitle,
                        style: Theme.of(context).textTheme.titleLarge?.copyWith(
                              color: AppTheme.textPrimary,
                            ),
                      ),
                    ),
                    const SizedBox(width: AppTheme.space2),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 6,
                        vertical: 2,
                      ),
                      decoration: BoxDecoration(
                        color: AppTheme.success.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(4),
                        border: Border.all(
                          color: AppTheme.success.withOpacity(0.3),
                        ),
                      ),
                      child: Text(
                        l10n.badgeNew,
                        style: Theme.of(context).textTheme.labelSmall?.copyWith(
                              color: AppTheme.success,
                            ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: AppTheme.space2),
                Text(
                  l10n.graphragDescription,
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: AppTheme.textSecondary,
                      ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Row(
          children: [
            const Text('🎯', style: TextStyle(fontSize: 20)),
            const SizedBox(width: AppTheme.space2),
            Text(
              title,
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                    color: AppTheme.textPrimary,
                  ),
            ),
          ],
        ),
        Row(
          children: [
            _buildArrowButton(Icons.chevron_left),
            const SizedBox(width: AppTheme.space2),
            _buildArrowButton(Icons.chevron_right),
          ],
        ),
      ],
    );
  }

  Widget _buildArrowButton(IconData icon) {
    return Container(
      width: 36,
      height: 36,
      decoration: BoxDecoration(
        color: AppTheme.bgCard,
        shape: BoxShape.circle,
        border: Border.all(
          color: Colors.white.withOpacity(0.05),
        ),
      ),
      child: IconButton(
        padding: EdgeInsets.zero,
        icon: Icon(icon, size: 20, color: AppTheme.textSecondary),
        onPressed: () {},
      ),
    );
  }

  Widget _buildFlyersGrid(HomeState state) {
    // MockData에서 전단지 가져오기 (카테고리 정보 포함)
    final flyers = MockData.flyers.take(3).toList();

    return Column(
      children: flyers
          .map((flyer) => Padding(
                padding: const EdgeInsets.only(bottom: AppTheme.space4),
                child: _buildFlyerCard(flyer),
              ))
          .toList(),
    );
  }

  Widget _buildFlyerCard(Map<String, dynamic> flyer) {
    final l10n = ref.watch(localizationProvider);

    return Container(
      decoration: AppTheme.cardDecoration(),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            height: 160,
            decoration: BoxDecoration(
              color: AppTheme.bgCardHover,
              borderRadius: const BorderRadius.vertical(
                top: Radius.circular(AppTheme.radiusMd),
              ),
            ),
            child: Stack(
              children: [
                // Unsplash 이미지 표시
                if (flyer['imageUrl'] != null)
                  Image.network(
                    flyer['imageUrl'],
                    width: double.infinity,
                    height: 160,
                    fit: BoxFit.cover,
                    errorBuilder: (context, error, stackTrace) {
                      // 이미지 로드 실패 시 카테고리별 컬러 그라디언트
                      return Container(
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                            colors: _getCategoryGradient(flyer['category']),
                          ),
                          borderRadius: const BorderRadius.vertical(
                            top: Radius.circular(AppTheme.radiusMd),
                          ),
                        ),
                        child: Center(
                          child: Icon(
                            _getCategoryIcon(flyer['category']),
                            size: 64,
                            color: Colors.white.withOpacity(0.9),
                          ),
                        ),
                      );
                    },
                    loadingBuilder: (context, child, loadingProgress) {
                      if (loadingProgress == null) return child;
                      return Container(
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                            colors: _getCategoryGradient(flyer['category']),
                          ),
                        ),
                        child: Center(
                          child: CircularProgressIndicator(
                            value: loadingProgress.expectedTotalBytes != null
                                ? loadingProgress.cumulativeBytesLoaded /
                                    loadingProgress.expectedTotalBytes!
                                : null,
                            color: Colors.white,
                          ),
                        ),
                      );
                    },
                  )
                else
                  Container(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                        colors: _getCategoryGradient(flyer['category']),
                      ),
                      borderRadius: const BorderRadius.vertical(
                        top: Radius.circular(AppTheme.radiusMd),
                      ),
                    ),
                    child: Center(
                      child: Icon(
                        _getCategoryIcon(flyer['category']),
                        size: 64,
                        color: Colors.white.withOpacity(0.9),
                      ),
                    ),
                  ),
                if (flyer['isAiRecommended'] == true)
                  Positioned(
                    top: AppTheme.space3,
                    left: AppTheme.space3,
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: AppTheme.space3,
                        vertical: AppTheme.space1,
                      ),
                      decoration: BoxDecoration(
                        color: AppTheme.accentGold,
                        borderRadius: BorderRadius.circular(AppTheme.radiusPill),
                        boxShadow: AppTheme.glowGold,
                      ),
                      child: Text(
                        '✨ ${l10n.badgeAiRecommended}',
                        style:
                            Theme.of(context).textTheme.labelSmall?.copyWith(
                                  color: AppTheme.bgApp,
                                  fontWeight: FontWeight.w700,
                                ),
                      ),
                    ),
                  ),
                Positioned(
                  top: AppTheme.space3,
                  right: AppTheme.space3,
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: AppTheme.space3,
                      vertical: AppTheme.space1,
                    ),
                    decoration: BoxDecoration(
                      color: flyer['isHotDeal'] == true ? AppTheme.error : AppTheme.accentGold,
                      borderRadius: BorderRadius.circular(AppTheme.radiusPill),
                    ),
                    child: Text(
                      flyer['isHotDeal'] == true ? '핫딜' : '${flyer['points']}P',
                      style: Theme.of(context).textTheme.labelSmall?.copyWith(
                            color: Colors.white,
                            fontWeight: FontWeight.w700,
                          ),
                    ),
                  ),
                ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(AppTheme.space4),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  flyer['title'],
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        color: AppTheme.textPrimary,
                      ),
                ),
                const SizedBox(height: AppTheme.space2),
                Text(
                  flyer['description'],
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: AppTheme.textSecondary,
                      ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: AppTheme.space3),
                Row(
                  children: [
                    Icon(
                      Icons.location_on,
                      size: 14,
                      color: AppTheme.textMuted,
                    ),
                    const SizedBox(width: AppTheme.space1),
                    Text(
                      flyer['distance'],
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            color: AppTheme.textMuted,
                          ),
                    ),
                    const Spacer(),
                    ElevatedButton(
                      onPressed: () {},
                      style: ElevatedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(
                          horizontal: AppTheme.space4,
                          vertical: AppTheme.space2,
                        ),
                        minimumSize: Size.zero,
                      ),
                      child: Text(l10n.earnPointsValue(25)),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBottomNav() {
    final l10n = ref.watch(localizationProvider);

    return BottomNavigationBar(
      currentIndex: _currentNavIndex,
      onTap: (index) {
        setState(() {
          _currentNavIndex = index;
        });
        switch (index) {
          case 1:
            Navigator.of(context).pushNamed('/safety-map');
            break;
          case 2:
            Navigator.of(context).pushNamed('/flyers');
            break;
          case 3:
            Navigator.of(context).pushNamed('/points');
            break;
          case 4:
            Navigator.of(context).pushNamed('/profile');
            break;
        }
      },
      items: [
        BottomNavigationBarItem(
          icon: const Icon(Icons.home),
          label: l10n.home,
        ),
        BottomNavigationBarItem(
          icon: const Icon(Icons.map_outlined),
          label: l10n.safetyMap,
        ),
        BottomNavigationBarItem(
          icon: const Icon(Icons.receipt_outlined),
          label: l10n.flyers,
        ),
        BottomNavigationBarItem(
          icon: const Icon(Icons.stars_outlined),
          label: l10n.points,
        ),
        BottomNavigationBarItem(
          icon: const Icon(Icons.person_outline),
          label: l10n.myInfo,
        ),
      ],
    );
  }

  // 카테고리별 그라디언트 색상
  List<Color> _getCategoryGradient(String? category) {
    switch (category) {
      case 'food':
        return [const Color(0xFF4CAF50), const Color(0xFF66BB6A)]; // Green
      case 'wellness':
        return [const Color(0xFF9C27B0), const Color(0xFFBA68C8)]; // Purple
      case 'cafe':
        return [const Color(0xFF795548), const Color(0xFFA1887F)]; // Brown
      case 'service':
        return [const Color(0xFF2196F3), const Color(0xFF64B5F6)]; // Blue
      default:
        return [AppTheme.accentGold, const Color(0xFFFFB74D)]; // Gold
    }
  }

  // 카테고리별 아이콘
  IconData _getCategoryIcon(String? category) {
    switch (category) {
      case 'food':
        return Icons.restaurant;
      case 'wellness':
        return Icons.spa;
      case 'cafe':
        return Icons.local_cafe;
      case 'service':
        return Icons.build;
      default:
        return Icons.local_offer;
    }
  }
}
