import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/theme/app_theme.dart';

/// Epic USR-003: Safety Map (CCTV & Lighting)
/// 의정부시의 CCTV, 가로등 위치를 지도에 표시
class SafetyMapScreen extends ConsumerStatefulWidget {
  const SafetyMapScreen({super.key});

  @override
  ConsumerState<SafetyMapScreen> createState() => _SafetyMapScreenState();
}

class _SafetyMapScreenState extends ConsumerState<SafetyMapScreen> {
  String _selectedFilter = 'all'; // all, cctv, lighting

  // Mock 데이터: 의정부시 안전시설
  final _safetyData = [
    {
      'type': 'cctv',
      'name': 'CCTV #101',
      'location': '의정부동 195-45',
      'status': 'active',
      'coverage': '50m',
    },
    {
      'type': 'cctv',
      'name': 'CCTV #102',
      'location': '신곡동 724-8',
      'status': 'active',
      'coverage': '50m',
    },
    {
      'type': 'lighting',
      'name': '가로등 #201',
      'location': '장암동 156-2',
      'status': 'active',
      'brightness': '120W LED',
    },
    {
      'type': 'lighting',
      'name': '가로등 #202',
      'location': '호원동 88-12',
      'status': 'maintenance',
      'brightness': '100W LED',
    },
  ];

  @override
  Widget build(BuildContext context) {
    final filteredData = _selectedFilter == 'all'
        ? _safetyData
        : _safetyData.where((item) => item['type'] == _selectedFilter).toList();

    return Scaffold(
      backgroundColor: AppTheme.bgApp,
      appBar: AppBar(
        backgroundColor: AppTheme.bgCard,
        elevation: 0,
        title: const Text(
          '안전 지도',
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
      ),
      body: Column(
        children: [
          // Filter Chips
          _buildFilterSection(),
          
          // Statistics Cards
          _buildStatisticsSection(),
          
          // Map Placeholder
          Expanded(
            child: _buildMapSection(),
          ),
          
          // Safety Facilities List
          Container(
            constraints: const BoxConstraints(maxHeight: 250),
            child: _buildFacilitiesList(filteredData),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterSection() {
    return Container(
      padding: const EdgeInsets.all(AppTheme.space4),
      decoration: AppTheme.cardDecoration(),
      margin: const EdgeInsets.all(AppTheme.space4),
      child: Row(
        children: [
          _buildFilterChip('전체', 'all', Icons.visibility),
          const SizedBox(width: AppTheme.space2),
          _buildFilterChip('CCTV', 'cctv', Icons.videocam),
          const SizedBox(width: AppTheme.space2),
          _buildFilterChip('가로등', 'lighting', Icons.light_mode),
        ],
      ),
    );
  }

  Widget _buildFilterChip(String label, String value, IconData icon) {
    final isSelected = _selectedFilter == value;
    return Expanded(
      child: InkWell(
        onTap: () => setState(() => _selectedFilter = value),
        borderRadius: BorderRadius.circular(AppTheme.radiusPill),
        child: Container(
          padding: const EdgeInsets.symmetric(
            horizontal: AppTheme.space3,
            vertical: AppTheme.space2,
          ),
          decoration: BoxDecoration(
            color: isSelected ? AppTheme.accentGold : AppTheme.bgCardHover,
            borderRadius: BorderRadius.circular(AppTheme.radiusPill),
            boxShadow: isSelected ? AppTheme.glowGold : null,
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                icon,
                size: 16,
                color: isSelected ? AppTheme.bgApp : AppTheme.textSecondary,
              ),
              const SizedBox(width: AppTheme.space1),
              Text(
                label,
                style: TextStyle(
                  color: isSelected ? AppTheme.bgApp : AppTheme.textSecondary,
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatisticsSection() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: AppTheme.space4),
      child: Row(
        children: [
          Expanded(
            child: _buildStatCard('CCTV', '2', Icons.videocam, Colors.blue),
          ),
          const SizedBox(width: AppTheme.space3),
          Expanded(
            child: _buildStatCard('가로등', '2', Icons.light_mode, Colors.amber),
          ),
        ],
      ),
    );
  }

  Widget _buildStatCard(String label, String count, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(AppTheme.space4),
      decoration: AppTheme.cardDecoration(),
      child: Column(
        children: [
          Icon(icon, color: color, size: 32),
          const SizedBox(height: AppTheme.space2),
          Text(
            count,
            style: const TextStyle(
              color: AppTheme.textPrimary,
              fontSize: 24,
              fontWeight: FontWeight.w700,
            ),
          ),
          Text(
            label,
            style: const TextStyle(
              color: AppTheme.textSecondary,
              fontSize: 12,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMapSection() {
    return Container(
      margin: const EdgeInsets.all(AppTheme.space4),
      decoration: AppTheme.cardDecoration(),
      child: Stack(
        children: [
          // Map Placeholder
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
                    Icons.map,
                    size: 64,
                    color: AppTheme.textMuted.withOpacity(0.5),
                  ),
                  const SizedBox(height: AppTheme.space3),
                  Text(
                    '의정부시 안전 지도',
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
          
          // Location Button
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

  Widget _buildFacilitiesList(List<Map<String, dynamic>> data) {
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
            child: Text(
              '안전시설 목록 (${data.length})',
              style: const TextStyle(
                color: AppTheme.textPrimary,
                fontSize: 16,
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.symmetric(horizontal: AppTheme.space4),
              itemCount: data.length,
              itemBuilder: (context, index) {
                final item = data[index];
                return _buildFacilityItem(item);
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFacilityItem(Map<String, dynamic> item) {
    final isCCTV = item['type'] == 'cctv';
    final isActive = item['status'] == 'active';
    
    return Container(
      margin: const EdgeInsets.only(bottom: AppTheme.space3),
      padding: const EdgeInsets.all(AppTheme.space3),
      decoration: BoxDecoration(
        color: AppTheme.bgCardHover,
        borderRadius: BorderRadius.circular(AppTheme.radiusMd),
        border: Border.all(
          color: AppTheme.borderColor,
          width: 1,
        ),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(AppTheme.space2),
            decoration: BoxDecoration(
              color: isCCTV ? Colors.blue.withOpacity(0.2) : Colors.amber.withOpacity(0.2),
              borderRadius: BorderRadius.circular(AppTheme.radiusSm),
            ),
            child: Icon(
              isCCTV ? Icons.videocam : Icons.light_mode,
              color: isCCTV ? Colors.blue : Colors.amber,
              size: 24,
            ),
          ),
          const SizedBox(width: AppTheme.space3),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  item['name'],
                  style: const TextStyle(
                    color: AppTheme.textPrimary,
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: AppTheme.space1),
                Text(
                  item['location'],
                  style: const TextStyle(
                    color: AppTheme.textSecondary,
                    fontSize: 12,
                  ),
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(
              horizontal: AppTheme.space2,
              vertical: AppTheme.space1,
            ),
            decoration: BoxDecoration(
              color: isActive ? Colors.green.withOpacity(0.2) : Colors.orange.withOpacity(0.2),
              borderRadius: BorderRadius.circular(AppTheme.radiusPill),
            ),
            child: Text(
              isActive ? '정상' : '점검중',
              style: TextStyle(
                color: isActive ? Colors.green : Colors.orange,
                fontSize: 11,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
