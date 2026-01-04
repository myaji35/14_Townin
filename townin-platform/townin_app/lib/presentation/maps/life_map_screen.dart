import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/theme/app_theme.dart';

/// Epic USR-006: Life Map (Public Amenities)
/// 의정부시 공공편의시설 (병원, 약국, 공원, 도서관 등) 위치 표시
class LifeMapScreen extends ConsumerStatefulWidget {
  const LifeMapScreen({super.key});

  @override
  ConsumerState<LifeMapScreen> createState() => _LifeMapScreenState();
}

class _LifeMapScreenState extends ConsumerState<LifeMapScreen> {
  String _selectedCategory = 'all';

  final _amenitiesData = [
    {
      'category': 'hospital',
      'name': '의정부성모병원',
      'location': '의정부동 65-1',
      'hours': '24시간',
      'phone': '031-820-3000',
      'distance': '1.2km',
    },
    {
      'category': 'pharmacy',
      'name': '온누리약국',
      'location': '신곡동 724-3',
      'hours': '09:00-22:00',
      'phone': '031-840-2000',
      'distance': '450m',
    },
    {
      'category': 'park',
      'name': '의정부중앙공원',
      'location': '의정부동 195-2',
      'hours': '상시 개방',
      'facilities': ['산책로', '운동기구', '놀이터'],
      'distance': '850m',
    },
    {
      'category': 'library',
      'name': '의정부시립도서관',
      'location': '호원동 138-1',
      'hours': '09:00-22:00',
      'phone': '031-828-8600',
      'distance': '2.1km',
    },
    {
      'category': 'gym',
      'name': '시민체육센터',
      'location': '장암동 156-1',
      'hours': '06:00-22:00',
      'facilities': ['헬스장', '수영장', '농구장'],
      'distance': '1.5km',
    },
  ];

  @override
  Widget build(BuildContext context) {
    final filteredData = _selectedCategory == 'all'
        ? _amenitiesData
        : _amenitiesData.where((item) => item['category'] == _selectedCategory).toList();

    return Scaffold(
      backgroundColor: AppTheme.bgApp,
      appBar: AppBar(
        backgroundColor: AppTheme.bgCard,
        elevation: 0,
        title: const Text(
          '생활 편의 지도',
          style: TextStyle(
            color: AppTheme.textPrimary,
            fontSize: 20,
            fontWeight: FontWeight.w700,
          ),
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: AppTheme.textPrimary),
          onPressed: () => Navigator.pop(context),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.search, color: AppTheme.accentGold),
            onPressed: () {},
          ),
        ],
      ),
      body: Column(
        children: [
          // Category Filter
          _buildCategoryFilter(),
          
          // Map Section
          Expanded(
            child: _buildMapSection(),
          ),
          
          // Amenities List
          Container(
            constraints: const BoxConstraints(maxHeight: 320),
            child: _buildAmenitiesList(filteredData),
          ),
        ],
      ),
    );
  }

  Widget _buildCategoryFilter() {
    return Container(
      height: 100,
      margin: const EdgeInsets.all(AppTheme.space4),
      child: ListView(
        scrollDirection: Axis.horizontal,
        children: [
          _buildCategoryChip('전체', 'all', Icons.apps, Colors.grey),
          _buildCategoryChip('병원', 'hospital', Icons.local_hospital, Colors.red),
          _buildCategoryChip('약국', 'pharmacy', Icons.medical_services, Colors.green),
          _buildCategoryChip('공원', 'park', Icons.park, Colors.lightGreen),
          _buildCategoryChip('도서관', 'library', Icons.local_library, Colors.purple),
          _buildCategoryChip('체육시설', 'gym', Icons.fitness_center, Colors.orange),
        ],
      ),
    );
  }

  Widget _buildCategoryChip(String label, String value, IconData icon, Color color) {
    final isSelected = _selectedCategory == value;
    
    return GestureDetector(
      onTap: () => setState(() => _selectedCategory = value),
      child: Container(
        width: 85,
        margin: const EdgeInsets.only(right: AppTheme.space3),
        decoration: BoxDecoration(
          gradient: isSelected
              ? LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [color, color.withOpacity(0.7)],
                )
              : null,
          color: isSelected ? null : AppTheme.bgCard,
          borderRadius: BorderRadius.circular(AppTheme.radiusMd),
          border: Border.all(
            color: isSelected ? color : AppTheme.borderColor,
            width: isSelected ? 2 : 1,
          ),
          boxShadow: isSelected
              ? [
                  BoxShadow(
                    color: color.withOpacity(0.3),
                    blurRadius: 8,
                    offset: const Offset(0, 4),
                  ),
                ]
              : null,
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              icon,
              color: isSelected ? Colors.white : color,
              size: 32,
            ),
            const SizedBox(height: AppTheme.space2),
            Text(
              label,
              style: TextStyle(
                color: isSelected ? Colors.white : AppTheme.textSecondary,
                fontSize: 12,
                fontWeight: FontWeight.w600,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMapSection() {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: AppTheme.space4),
      decoration: AppTheme.cardDecoration(),
      child: Stack(
        children: [
          Container(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [
                  AppTheme.bgCardHover,
                  AppTheme.bgCard,
                ],
              ),
              borderRadius: BorderRadius.circular(AppTheme.radiusMd),
            ),
            child: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.location_city,
                    size: 64,
                    color: AppTheme.textMuted.withOpacity(0.5),
                  ),
                  const SizedBox(height: AppTheme.space3),
                  Text(
                    '의정부시 생활 편의 지도',
                    style: TextStyle(
                      color: AppTheme.textMuted,
                      fontSize: 16,
                    ),
                  ),
                  const SizedBox(height: AppTheme.space1),
                  Text(
                    'Google Maps 연동 예정',
                    style: TextStyle(
                      color: AppTheme.textMuted.withOpacity(0.7),
                      fontSize: 12,
                    ),
                  ),
                ],
              ),
            ),
          ),
          Positioned(
            right: 16,
            bottom: 16,
            child: FloatingActionButton(
              mini: true,
              backgroundColor: AppTheme.accentGold,
              onPressed: () {},
              child: const Icon(Icons.my_location, color: AppTheme.bgApp),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAmenitiesList(List<Map<String, dynamic>> data) {
    return Container(
      decoration: const BoxDecoration(
        color: AppTheme.bgCard,
        borderRadius: BorderRadius.vertical(
          top: Radius.circular(AppTheme.radiusLg),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.all(AppTheme.space4),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  '편의시설 (${data.length})',
                  style: const TextStyle(
                    color: AppTheme.textPrimary,
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                TextButton.icon(
                  onPressed: () {},
                  icon: const Icon(Icons.sort, size: 16),
                  label: const Text('거리순'),
                  style: TextButton.styleFrom(
                    foregroundColor: AppTheme.accentGold,
                    padding: EdgeInsets.zero,
                    minimumSize: const Size(0, 0),
                    tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                  ),
                ),
              ],
            ),
          ),
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.symmetric(horizontal: AppTheme.space4),
              itemCount: data.length,
              itemBuilder: (context, index) {
                return _buildAmenityItem(data[index]);
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAmenityItem(Map<String, dynamic> amenity) {
    final category = amenity['category'];
    IconData icon;
    Color color;
    
    switch (category) {
      case 'hospital':
        icon = Icons.local_hospital;
        color = Colors.red;
        break;
      case 'pharmacy':
        icon = Icons.medical_services;
        color = Colors.green;
        break;
      case 'park':
        icon = Icons.park;
        color = Colors.lightGreen;
        break;
      case 'library':
        icon = Icons.local_library;
        color = Colors.purple;
        break;
      case 'gym':
        icon = Icons.fitness_center;
        color = Colors.orange;
        break;
      default:
        icon = Icons.place;
        color = AppTheme.accentGold;
    }
    
    return Container(
      margin: const EdgeInsets.only(bottom: AppTheme.space3),
      padding: const EdgeInsets.all(AppTheme.space4),
      decoration: AppTheme.cardDecoration(),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(AppTheme.space2),
                decoration: BoxDecoration(
                  color: color.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(AppTheme.radiusSm),
                ),
                child: Icon(icon, color: color, size: 24),
              ),
              const SizedBox(width: AppTheme.space3),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      amenity['name'],
                      style: const TextStyle(
                        color: AppTheme.textPrimary,
                        fontSize: 15,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    const SizedBox(height: AppTheme.space1),
                    Row(
                      children: [
                        Icon(
                          Icons.location_on,
                          size: 12,
                          color: AppTheme.textMuted,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          '${amenity['location']} • ${amenity['distance']}',
                          style: const TextStyle(
                            color: AppTheme.textSecondary,
                            fontSize: 12,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: AppTheme.space3),
          Row(
            children: [
              Icon(Icons.access_time, size: 14, color: AppTheme.textMuted),
              const SizedBox(width: 4),
              Text(
                amenity['hours'],
                style: const TextStyle(
                  color: AppTheme.textSecondary,
                  fontSize: 12,
                ),
              ),
              if (amenity['phone'] != null) ...[
                const SizedBox(width: AppTheme.space3),
                Icon(Icons.phone, size: 14, color: AppTheme.textMuted),
                const SizedBox(width: 4),
                Text(
                  amenity['phone'],
                  style: const TextStyle(
                    color: AppTheme.textSecondary,
                    fontSize: 12,
                  ),
                ),
              ],
            ],
          ),
          if (amenity['facilities'] != null) ...[
            const SizedBox(height: AppTheme.space2),
            Wrap(
              spacing: 6,
              runSpacing: 6,
              children: (amenity['facilities'] as List).map((facility) {
                return Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 8,
                    vertical: 4,
                  ),
                  decoration: BoxDecoration(
                    color: AppTheme.bgCardHover,
                    borderRadius: BorderRadius.circular(AppTheme.radiusPill),
                  ),
                  child: Text(
                    facility,
                    style: const TextStyle(
                      color: AppTheme.textMuted,
                      fontSize: 10,
                    ),
                  ),
                );
              }).toList(),
            ),
          ],
        ],
      ),
    );
  }
}
