import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/theme/app_theme.dart';
import '../../core/mock/mock_data.dart';
import 'flyer_detail_screen.dart';

class FlyerSearchScreen extends ConsumerStatefulWidget {
  const FlyerSearchScreen({super.key});

  @override
  ConsumerState<FlyerSearchScreen> createState() => _FlyerSearchScreenState();
}

class _FlyerSearchScreenState extends ConsumerState<FlyerSearchScreen> {
  final TextEditingController _searchController = TextEditingController();
  String _selectedCategory = 'all';
  String _selectedDistance = 'all';
  String _selectedSort = 'distance';
  List<Map<String, dynamic>> _filteredFlyers = [];

  @override
  void initState() {
    super.initState();
    _filteredFlyers = MockData.flyers;
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _applyFilters() {
    setState(() {
      var flyers = List<Map<String, dynamic>>.from(MockData.flyers);

      // 검색어 필터
      if (_searchController.text.isNotEmpty) {
        final query = _searchController.text.toLowerCase();
        flyers = flyers.where((flyer) {
          return flyer['title'].toString().toLowerCase().contains(query) ||
              flyer['storeName'].toString().toLowerCase().contains(query) ||
              flyer['description'].toString().toLowerCase().contains(query);
        }).toList();
      }

      // 카테고리 필터
      if (_selectedCategory != 'all') {
        flyers = flyers.where((flyer) => flyer['category'] == _selectedCategory).toList();
      }

      // 거리 필터
      if (_selectedDistance != 'all') {
        final maxDistance = int.parse(_selectedDistance);
        flyers = flyers.where((flyer) {
          final distance = int.parse(flyer['distance'].toString().replaceAll('m', ''));
          return distance <= maxDistance;
        }).toList();
      }

      // 정렬
      if (_selectedSort == 'distance') {
        flyers.sort((a, b) {
          final distA = int.parse(a['distance'].toString().replaceAll('m', ''));
          final distB = int.parse(b['distance'].toString().replaceAll('m', ''));
          return distA.compareTo(distB);
        });
      } else if (_selectedSort == 'points') {
        flyers.sort((a, b) => (b['points'] as int).compareTo(a['points'] as int));
      }

      _filteredFlyers = flyers;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.bgApp,
      appBar: AppBar(
        title: const Text('전단지 검색'),
        backgroundColor: AppTheme.bgSidebar,
        elevation: 0,
      ),
      body: Column(
        children: [
          // 검색 바
          _buildSearchBar(),
          
          // 필터 칩
          _buildFilterChips(),
          
          // 검색 결과
          Expanded(
            child: _buildSearchResults(),
          ),
        ],
      ),
    );
  }

  Widget _buildSearchBar() {
    return Container(
      padding: const EdgeInsets.all(AppTheme.space4),
      decoration: BoxDecoration(
        color: AppTheme.bgSidebar,
        border: Border(
          bottom: BorderSide(
            color: Colors.white.withOpacity(0.05),
          ),
        ),
      ),
      child: TextField(
        controller: _searchController,
        onChanged: (value) => _applyFilters(),
        style: const TextStyle(color: AppTheme.textPrimary),
        decoration: InputDecoration(
          hintText: '전단지, 매장명 검색...',
          hintStyle: const TextStyle(color: AppTheme.textMuted),
          prefixIcon: const Icon(Icons.search, color: AppTheme.accentGold),
          suffixIcon: _searchController.text.isNotEmpty
              ? IconButton(
                  icon: const Icon(Icons.clear, color: AppTheme.textMuted),
                  onPressed: () {
                    _searchController.clear();
                    _applyFilters();
                  },
                )
              : null,
          filled: true,
          fillColor: AppTheme.bgCard,
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(AppTheme.radiusPill),
            borderSide: BorderSide.none,
          ),
          contentPadding: const EdgeInsets.symmetric(
            horizontal: AppTheme.space4,
            vertical: AppTheme.space3,
          ),
        ),
      ),
    );
  }

  Widget _buildFilterChips() {
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
          ),
        ),
      ),
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: Row(
          children: [
            // 카테고리 필터
            _buildFilterChip(
              '전체',
              _selectedCategory == 'all',
              () {
                setState(() {
                  _selectedCategory = 'all';
                  _applyFilters();
                });
              },
            ),
            _buildFilterChip(
              '음식',
              _selectedCategory == 'food',
              () {
                setState(() {
                  _selectedCategory = 'food';
                  _applyFilters();
                });
              },
            ),
            _buildFilterChip(
              '카페',
              _selectedCategory == 'cafe',
              () {
                setState(() {
                  _selectedCategory = 'cafe';
                  _applyFilters();
                });
              },
            ),
            _buildFilterChip(
              '웰니스',
              _selectedCategory == 'wellness',
              () {
                setState(() {
                  _selectedCategory = 'wellness';
                  _applyFilters();
                });
              },
            ),
            const SizedBox(width: AppTheme.space2),
            Container(
              width: 1,
              height: 24,
              color: Colors.white.withOpacity(0.1),
            ),
            const SizedBox(width: AppTheme.space2),
            // 거리 필터
            _buildFilterChip(
              '전체',
              _selectedDistance == 'all',
              () {
                setState(() {
                  _selectedDistance = 'all';
                  _applyFilters();
                });
              },
            ),
            _buildFilterChip(
              '300m 이내',
              _selectedDistance == '300',
              () {
                setState(() {
                  _selectedDistance = '300';
                  _applyFilters();
                });
              },
            ),
            _buildFilterChip(
              '500m 이내',
              _selectedDistance == '500',
              () {
                setState(() {
                  _selectedDistance = '500';
                  _applyFilters();
                });
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFilterChip(String label, bool isSelected, VoidCallback onTap) {
    return Padding(
      padding: const EdgeInsets.only(right: AppTheme.space2),
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(
            horizontal: AppTheme.space3,
            vertical: AppTheme.space2,
          ),
          decoration: BoxDecoration(
            color: isSelected ? AppTheme.accentGold : AppTheme.bgCard,
            borderRadius: BorderRadius.circular(AppTheme.radiusPill),
            border: Border.all(
              color: isSelected
                  ? AppTheme.accentGold
                  : Colors.white.withOpacity(0.1),
            ),
          ),
          child: Text(
            label,
            style: TextStyle(
              color: isSelected ? AppTheme.bgApp : AppTheme.textSecondary,
              fontSize: 12,
              fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildSearchResults() {
    if (_filteredFlyers.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.search_off,
              size: 64,
              color: AppTheme.textMuted.withOpacity(0.5),
            ),
            const SizedBox(height: AppTheme.space4),
            const Text(
              '검색 결과가 없습니다',
              style: TextStyle(
                color: AppTheme.textMuted,
                fontSize: 16,
              ),
            ),
          ],
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(AppTheme.space4),
      itemCount: _filteredFlyers.length,
      itemBuilder: (context, index) {
        final flyer = _filteredFlyers[index];
        return _buildFlyerCard(flyer);
      },
    );
  }

  Widget _buildFlyerCard(Map<String, dynamic> flyer) {
    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => FlyerDetailScreen(flyer: flyer),
          ),
        );
      },
      child: Container(
        margin: const EdgeInsets.only(bottom: AppTheme.space4),
        decoration: BoxDecoration(
          color: AppTheme.bgCard,
          borderRadius: BorderRadius.circular(AppTheme.radiusMd),
          border: Border.all(
            color: Colors.white.withOpacity(0.05),
          ),
        ),
        child: Row(
          children: [
            // 이미지
            Container(
              width: 100,
              height: 100,
              decoration: BoxDecoration(
                color: AppTheme.bgCardHover,
                borderRadius: const BorderRadius.only(
                  topLeft: Radius.circular(AppTheme.radiusMd),
                  bottomLeft: Radius.circular(AppTheme.radiusMd),
                ),
              ),
              child: Stack(
                children: [
                  const Center(
                    child: Icon(
                      Icons.image,
                      size: 40,
                      color: AppTheme.textMuted,
                    ),
                  ),
                  if (flyer['isAiRecommended'] == true)
                    Positioned(
                      top: AppTheme.space2,
                      left: AppTheme.space2,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: AppTheme.space2,
                          vertical: 2,
                        ),
                        decoration: BoxDecoration(
                          color: AppTheme.accentGold,
                          borderRadius: BorderRadius.circular(AppTheme.radiusPill),
                        ),
                        child: const Text(
                          'AI',
                          style: TextStyle(
                            color: AppTheme.bgApp,
                            fontSize: 9,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ),
                ],
              ),
            ),
            
            // 정보
            Expanded(
              child: Padding(
                padding: const EdgeInsets.all(AppTheme.space3),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      flyer['storeName'] ?? '',
                      style: const TextStyle(
                        color: AppTheme.textMuted,
                        fontSize: 11,
                      ),
                    ),
                    const SizedBox(height: AppTheme.space1),
                    Text(
                      flyer['title'] ?? '',
                      style: const TextStyle(
                        color: AppTheme.textPrimary,
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: AppTheme.space2),
                    Row(
                      children: [
                        Icon(
                          Icons.location_on,
                          size: 12,
                          color: AppTheme.textMuted,
                        ),
                        const SizedBox(width: AppTheme.space1),
                        Text(
                          flyer['distance'] ?? '',
                          style: const TextStyle(
                            color: AppTheme.textMuted,
                            fontSize: 11,
                          ),
                        ),
                        const Spacer(),
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: AppTheme.space2,
                            vertical: 2,
                          ),
                          decoration: BoxDecoration(
                            color: AppTheme.accentGold.withOpacity(0.2),
                            borderRadius: BorderRadius.circular(AppTheme.radiusPill),
                          ),
                          child: Text(
                            '+${flyer['points']}P',
                            style: const TextStyle(
                              color: AppTheme.accentGold,
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
