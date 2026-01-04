import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/theme/app_theme.dart';

/// Epic USR-005: Risk Map (Disaster)
/// 의정부시 재난 위험 지역, 대피소 위치 표시
class RiskMapScreen extends ConsumerStatefulWidget {
  const RiskMapScreen({super.key});

  @override
  ConsumerState<RiskMapScreen> createState() => _RiskMapScreenState();
}

class _RiskMapScreenState extends ConsumerState<RiskMapScreen> {
  String _selectedFilter = 'all'; // all, shelter, flood, fire

  // Mock 데이터: 의정부시 재난 관련 시설
  final _riskData = [
    {
      'type': 'shelter',
      'name': '의정부시청 대피소',
      'location': '의정부동 195-1',
      'capacity': '500명',
      'facilities': ['식수', '비상식량', '의료품'],
    },
    {
      'type': 'shelter',
      'name': '신곡초등학교 대피소',
      'location': '신곡동 724-1',
      'capacity': '300명',
      'facilities': ['식수', '담요'],
    },
    {
      'type': 'flood',
      'name': '중랑천 침수위험 구역',
      'location': '장암동 일대',
      'riskLevel': 'high',
      'description': '집중호우 시 침수 위험',
    },
    {
      'type': 'fire',
      'name': '소방서 #1',
      'location': '의정부동 88-2',
      'responseTime': '5분',
      'units': '3대',
    },
  ];

  @override
  Widget build(BuildContext context) {
    final filteredData = _selectedFilter == 'all'
        ? _riskData
        : _riskData.where((item) => item['type'] == _selectedFilter).toList();

    return Scaffold(
      backgroundColor: AppTheme.bgApp,
      appBar: AppBar(
        backgroundColor: AppTheme.bgCard,
        elevation: 0,
        title: const Text(
          '재난 안전 지도',
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
          // Filter Section
          _buildFilterSection(),
          
          // Alert Banner
          _buildAlertBanner(),
          
          // Map Section
          Expanded(
            child: _buildMapSection(),
          ),
          
          // Facilities List
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
      child: Wrap(
        spacing: AppTheme.space2,
        runSpacing: AppTheme.space2,
        children: [
          _buildFilterChip('전체', 'all', Icons.map),
          _buildFilterChip('대피소', 'shelter', Icons.home_work),
          _buildFilterChip('침수위험', 'flood', Icons.water_damage),
          _buildFilterChip('소방서', 'fire', Icons.local_fire_department),
        ],
      ),
    );
  }

  Widget _buildFilterChip(String label, String value, IconData icon) {
    final isSelected = _selectedFilter == value;
    return FilterChip(
      label: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 16),
          const SizedBox(width: 4),
          Text(label),
        ],
      ),
      selected: isSelected,
      onSelected: (selected) {
        setState(() => _selectedFilter = value);
      },
      backgroundColor: AppTheme.bgCardHover,
      selectedColor: AppTheme.accentGold,
      checkmarkColor: AppTheme.bgApp,
      labelStyle: TextStyle(
        color: isSelected ? AppTheme.bgApp : AppTheme.textSecondary,
        fontSize: 13,
        fontWeight: FontWeight.w600,
      ),
    );
  }

  Widget _buildAlertBanner() {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: AppTheme.space4),
      padding: const EdgeInsets.all(AppTheme.space3),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFFFF6B6B), Color(0xFFEE5A6F)],
        ),
        borderRadius: BorderRadius.circular(AppTheme.radiusMd),
      ),
      child: Row(
        children: [
          const Icon(Icons.warning, color: Colors.white, size: 20),
          const SizedBox(width: AppTheme.space2),
          Expanded(
            child: Text(
              '현재 재난 경보 없음',
              style: const TextStyle(
                color: Colors.white,
                fontSize: 13,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
          TextButton(
            onPressed: () {},
            style: TextButton.styleFrom(
              foregroundColor: Colors.white,
              padding: EdgeInsets.zero,
            ),
            child: const Text('상세'),
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
                    Icons.shield,
                    size: 64,
                    color: AppTheme.textMuted.withOpacity(0.5),
                  ),
                  const SizedBox(height: AppTheme.space3),
                  Text(
                    '의정부시 재난 안전 지도',
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
              backgroundColor: Colors.red,
              onPressed: () {},
              child: const Icon(Icons.sos, color: Colors.white),
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
              '안전 시설 (${data.length})',
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
                return _buildFacilityItem(data[index]);
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFacilityItem(Map<String, dynamic> item) {
    final type = item['type'];
    IconData icon;
    Color color;
    
    switch (type) {
      case 'shelter':
        icon = Icons.home_work;
        color = Colors.blue;
        break;
      case 'flood':
        icon = Icons.water_damage;
        color = Colors.red;
        break;
      case 'fire':
        icon = Icons.local_fire_department;
        color = Colors.orange;
        break;
      default:
        icon = Icons.place;
        color = AppTheme.accentGold;
    }
    
    return Container(
      margin: const EdgeInsets.only(bottom: AppTheme.space3),
      padding: const EdgeInsets.all(AppTheme.space3),
      decoration: AppTheme.cardDecoration(),
      child: Row(
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
                if (item['capacity'] != null) ...[
                  const SizedBox(height: AppTheme.space1),
                  Text(
                    '수용 인원: ${item['capacity']}',
                    style: const TextStyle(
                      color: AppTheme.textMuted,
                      fontSize: 11,
                    ),
                  ),
                ],
              ],
            ),
          ),
          Icon(
            Icons.chevron_right,
            color: AppTheme.textMuted,
          ),
        ],
      ),
    );
  }
}
