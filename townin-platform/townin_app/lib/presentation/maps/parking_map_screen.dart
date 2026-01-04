import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/theme/app_theme.dart';

/// Epic USR-004: Parking Map
/// 의정부시 공영주차장 위치, 실시간 주차 현황 표시
class ParkingMapScreen extends ConsumerStatefulWidget {
  const ParkingMapScreen({super.key});

  @override
  ConsumerState<ParkingMapScreen> createState() => _ParkingMapScreenState();
}

class _ParkingMapScreenState extends ConsumerState<ParkingMapScreen> {
  String _selectedFilter = 'all'; // all, available, full

  // Mock 데이터: 의정부시 공영주차장
  final _parkingData = [
    {
      'name': '의정부역 공영주차장',
      'location': '의정부동 195-1',
      'total': 150,
      'available': 45,
      'fee': '시간당 1,000원',
      'type': 'public',
    },
    {
      'name': '신곡동 공용주차장',
      'location': '신곡동 724-3',
      'total': 80,
      'available': 0,
      'fee': '시간당 800원',
      'type': 'public',
    },
    {
      'name': '장암동 공영주차장',
      'location': '장암동 156-5',
      'total': 120,
      'available': 72,
      'fee': '시간당 1,200원',
      'type': 'public',
    },
    {
      'name': '호원동 주차타워',
      'location': '호원동 88-7',
      'total': 200,
      'available': 15,
      'fee': '시간당 1,500원',
      'type': 'tower',
    },
  ];

  @override
  Widget build(BuildContext context) {
    final filteredData = _getFilteredData();

    return Scaffold(
      backgroundColor: AppTheme.bgApp,
      appBar: AppBar(
        backgroundColor: AppTheme.bgCard,
        elevation: 0,
        title: const Text(
          '주차장 지도',
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
            icon: const Icon(Icons.filter_list, color: AppTheme.accentGold),
            onPressed: () {},
          ),
        ],
      ),
      body: Column(
        children: [
          // Filter Chips
          _buildFilterSection(),
          
          // Statistics Summary
          _buildStatisticsSection(),
          
          // Map Placeholder
          Expanded(
            child: _buildMapSection(),
          ),
          
          // Parking List
          Container(
            constraints: const BoxConstraints(maxHeight: 300),
            child: _buildParkingList(filteredData),
          ),
        ],
      ),
    );
  }

  List<Map<String, dynamic>> _getFilteredData() {
    switch (_selectedFilter) {
      case 'available':
        return _parkingData.where((p) => (p['available'] as int) > 0).toList();
      case 'full':
        return _parkingData.where((p) => (p['available'] as int) == 0).toList();
      default:
        return _parkingData;
    }
  }

  Widget _buildFilterSection() {
    return Container(
      padding: const EdgeInsets.all(AppTheme.space4),
      decoration: AppTheme.cardDecoration(),
      margin: const EdgeInsets.all(AppTheme.space4),
      child: Row(
        children: [
          _buildFilterChip('전체', 'all', Icons.local_parking),
          const SizedBox(width: AppTheme.space2),
          _buildFilterChip('주차 가능', 'available', Icons.check_circle),
          const SizedBox(width: AppTheme.space2),
          _buildFilterChip('만차', 'full', Icons.cancel),
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
            horizontal: AppTheme.space2,
            vertical: AppTheme.space2,
          ),
          decoration: BoxDecoration(
            color: isSelected ? AppTheme.accentGold : AppTheme.bgCardHover,
            borderRadius: BorderRadius.circular(AppTheme.radiusPill),
            boxShadow: isSelected ? AppTheme.glowGold : null,
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                icon,
                size: 14,
                color: isSelected ? AppTheme.bgApp : AppTheme.textSecondary,
              ),
              const SizedBox(width: 4),
              Flexible(
                child: Text(
                  label,
                  style: TextStyle(
                    color: isSelected ? AppTheme.bgApp : AppTheme.textSecondary,
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatisticsSection() {
    final totalSpaces = _parkingData.fold<int>(0, (sum, p) => sum + (p['total'] as int));
    final availableSpaces = _parkingData.fold<int>(0, (sum, p) => sum + (p['available'] as int));
    final occupancyRate = ((totalSpaces - availableSpaces) / totalSpaces * 100).round();

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: AppTheme.space4),
      child: Row(
        children: [
          Expanded(
            child: _buildStatCard('총 주차면', '$totalSpaces', Icons.grid_view, Colors.blue),
          ),
          const SizedBox(width: AppTheme.space3),
          Expanded(
            child: _buildStatCard('주차 가능', '$availableSpaces', Icons.local_parking, Colors.green),
          ),
          const SizedBox(width: AppTheme.space3),
          Expanded(
            child: _buildStatCard('점유율', '$occupancyRate%', Icons.pie_chart, Colors.orange),
          ),
        ],
      ),
    );
  }

  Widget _buildStatCard(String label, String value, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(AppTheme.space3),
      decoration: AppTheme.cardDecoration(),
      child: Column(
        children: [
          Icon(icon, color: color, size: 24),
          const SizedBox(height: AppTheme.space1),
          Text(
            value,
            style: const TextStyle(
              color: AppTheme.textPrimary,
              fontSize: 18,
              fontWeight: FontWeight.w700,
            ),
          ),
          Text(
            label,
            style: const TextStyle(
              color: AppTheme.textSecondary,
              fontSize: 10,
            ),
            textAlign: TextAlign.center,
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
                    Icons.local_parking,
                    size: 64,
                    color: AppTheme.textMuted.withOpacity(0.5),
                  ),
                  const SizedBox(height: AppTheme.space3),
                  Text(
                    '의정부시 주차장 지도',
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
          
          // Navigation Button
          Positioned(
            right: 16,
            bottom: 16,
            child: FloatingActionButton(
              mini: true,
              backgroundColor: AppTheme.accentGold,
              onPressed: () {},
              child: const Icon(Icons.navigation, color: AppTheme.bgApp),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildParkingList(List<Map<String, dynamic>> data) {
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
              '주차장 목록 (${data.length})',
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
                final parking = data[index];
                return _buildParkingItem(parking);
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildParkingItem(Map<String, dynamic> parking) {
    final available = parking['available'] as int;
    final total = parking['total'] as int;
    final occupancyRate = ((total - available) / total * 100).round();
    final isFull = available == 0;
    
    return Container(
      margin: const EdgeInsets.only(bottom: AppTheme.space3),
      padding: const EdgeInsets.all(AppTheme.space4),
      decoration: AppTheme.cardDecoration(),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      parking['name'],
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
                          size: 14,
                          color: AppTheme.textMuted,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          parking['location'],
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
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: AppTheme.space3,
                  vertical: AppTheme.space2,
                ),
                decoration: BoxDecoration(
                  color: isFull 
                      ? Colors.red.withOpacity(0.2)
                      : available < 20
                          ? Colors.orange.withOpacity(0.2)
                          : Colors.green.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(AppTheme.radiusMd),
                ),
                child: Text(
                  isFull ? '만차' : '주차 가능',
                  style: TextStyle(
                    color: isFull 
                        ? Colors.red
                        : available < 20
                            ? Colors.orange
                            : Colors.green,
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: AppTheme.space3),
          
          // Availability Bar
          Row(
            children: [
              Expanded(
                child: Stack(
                  children: [
                    Container(
                      height: 8,
                      decoration: BoxDecoration(
                        color: AppTheme.bgCardHover,
                        borderRadius: BorderRadius.circular(4),
                      ),
                    ),
                    FractionallySizedBox(
                      widthFactor: occupancyRate / 100,
                      child: Container(
                        height: 8,
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            colors: [
                              isFull ? Colors.red : Colors.orange,
                              isFull ? Colors.red.shade700 : Colors.orange.shade700,
                            ],
                          ),
                          borderRadius: BorderRadius.circular(4),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: AppTheme.space3),
              Text(
                '$available/$total',
                style: const TextStyle(
                  color: AppTheme.textPrimary,
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
          const SizedBox(height: AppTheme.space2),
          
          Row(
            children: [
              Icon(
                Icons.attach_money,
                size: 14,
                color: AppTheme.textMuted,
              ),
              Text(
                parking['fee'],
                style: const TextStyle(
                  color: AppTheme.textSecondary,
                  fontSize: 12,
                ),
              ),
              const Spacer(),
              TextButton(
                onPressed: () {},
                style: TextButton.styleFrom(
                  padding: EdgeInsets.zero,
                  minimumSize: const Size(0, 0),
                  tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                ),
                child: const Text(
                  '길 안내',
                  style: TextStyle(
                    color: AppTheme.accentGold,
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
