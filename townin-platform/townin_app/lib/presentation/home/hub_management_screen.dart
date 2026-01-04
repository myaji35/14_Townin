import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/theme/app_theme.dart';
import '../../core/mock/mock_data.dart';

class HubManagementScreen extends ConsumerStatefulWidget {
  const HubManagementScreen({super.key});

  @override
  ConsumerState<HubManagementScreen> createState() => _HubManagementScreenState();
}

class _HubManagementScreenState extends ConsumerState<HubManagementScreen> {
  int _selectedHubIndex = 0;

  @override
  Widget build(BuildContext context) {
    final hubs = MockData.userHubs;
    final selectedHub = hubs[_selectedHubIndex];

    return Scaffold(
      backgroundColor: AppTheme.bgApp,
      appBar: AppBar(
        title: const Text('3-Hub 관리'),
        backgroundColor: AppTheme.bgSidebar,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.add_circle_outline),
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Hub 추가 기능 준비 중...')),
              );
            },
          ),
        ],
      ),
      body: Column(
        children: [
          // Hub 선택 탭
          _buildHubTabs(hubs),
          
          // 선택된 Hub 상세 정보
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(AppTheme.space4),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildHubHeader(selectedHub),
                  const SizedBox(height: AppTheme.space6),
                  _buildLocationInfo(selectedHub),
                  const SizedBox(height: AppTheme.space6),
                  _buildNearbyServices(selectedHub),
                  const SizedBox(height: AppTheme.space6),
                  _buildActivityStats(selectedHub),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHubTabs(List<Map<String, dynamic>> hubs) {
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
      child: Row(
        children: List.generate(hubs.length, (index) {
          final hub = hubs[index];
          final isSelected = index == _selectedHubIndex;
          final isPrimary = hub['isPrimary'] == true;

          return Expanded(
            child: GestureDetector(
              onTap: () {
                setState(() {
                  _selectedHubIndex = index;
                });
              },
              child: Container(
                margin: EdgeInsets.only(
                  right: index < hubs.length - 1 ? AppTheme.space2 : 0,
                ),
                padding: const EdgeInsets.symmetric(
                  horizontal: AppTheme.space3,
                  vertical: AppTheme.space3,
                ),
                decoration: BoxDecoration(
                  color: isSelected ? AppTheme.bgCard : Colors.transparent,
                  borderRadius: BorderRadius.circular(AppTheme.radiusMd),
                  border: Border.all(
                    color: isSelected
                        ? AppTheme.accentGold.withOpacity(0.3)
                        : Colors.transparent,
                  ),
                ),
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          _getHubIcon(hub['id']),
                          style: const TextStyle(fontSize: 20),
                        ),
                        if (isPrimary) ...[
                          const SizedBox(width: AppTheme.space1),
                          Container(
                            width: 6,
                            height: 6,
                            decoration: const BoxDecoration(
                              color: AppTheme.accentGold,
                              shape: BoxShape.circle,
                            ),
                          ),
                        ],
                      ],
                    ),
                    const SizedBox(height: AppTheme.space2),
                    Text(
                      hub['name'],
                      style: TextStyle(
                        color: isSelected ? AppTheme.textPrimary : AppTheme.textMuted,
                        fontSize: 12,
                        fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          );
        }),
      ),
    );
  }

  Widget _buildHubHeader(Map<String, dynamic> hub) {
    return Container(
      padding: const EdgeInsets.all(AppTheme.space6),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            AppTheme.accentGold.withOpacity(0.2),
            AppTheme.accentGold.withOpacity(0.05),
          ],
        ),
        borderRadius: BorderRadius.circular(AppTheme.radiusLg),
        border: Border.all(
          color: AppTheme.accentGold.withOpacity(0.3),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(AppTheme.space3),
                decoration: BoxDecoration(
                  color: AppTheme.accentGold.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(AppTheme.radiusMd),
                ),
                child: Text(
                  _getHubIcon(hub['id']),
                  style: const TextStyle(fontSize: 32),
                ),
              ),
              const SizedBox(width: AppTheme.space4),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Text(
                          hub['name'],
                          style: const TextStyle(
                            color: AppTheme.textPrimary,
                            fontSize: 24,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        if (hub['isPrimary'] == true) ...[
                          const SizedBox(width: AppTheme.space2),
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: AppTheme.space2,
                              vertical: 2,
                            ),
                            decoration: BoxDecoration(
                              color: AppTheme.accentGold,
                              borderRadius: BorderRadius.circular(AppTheme.radiusPill),
                            ),
                            child: const Text(
                              'PRIMARY',
                              style: TextStyle(
                                color: AppTheme.bgApp,
                                fontSize: 9,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        ],
                      ],
                    ),
                    const SizedBox(height: AppTheme.space1),
                    Text(
                      hub['location'],
                      style: const TextStyle(
                        color: AppTheme.textSecondary,
                        fontSize: 14,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: AppTheme.space4),
          Row(
            children: [
              const Icon(
                Icons.location_on,
                color: AppTheme.accentGold,
                size: 16,
              ),
              const SizedBox(width: AppTheme.space1),
              Expanded(
                child: Text(
                  hub['address'],
                  style: const TextStyle(
                    color: AppTheme.textMuted,
                    fontSize: 12,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildLocationInfo(Map<String, dynamic> hub) {
    return Container(
      padding: const EdgeInsets.all(AppTheme.space4),
      decoration: BoxDecoration(
        color: AppTheme.bgCard,
        borderRadius: BorderRadius.circular(AppTheme.radiusMd),
        border: Border.all(
          color: Colors.white.withOpacity(0.05),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(Icons.grid_on, color: AppTheme.accentGold, size: 20),
              SizedBox(width: AppTheme.space2),
              Text(
                'Grid Cell 정보',
                style: TextStyle(
                  color: AppTheme.textPrimary,
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
          const SizedBox(height: AppTheme.space3),
          _buildInfoRow('Grid Cell ID', hub['gridCell'] ?? 'N/A'),
          const SizedBox(height: AppTheme.space2),
          _buildInfoRow('위치 타입', hub['name']),
          const SizedBox(height: AppTheme.space2),
          _buildInfoRow('설정일', '2024-11-15'),
        ],
      ),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: const TextStyle(
            color: AppTheme.textMuted,
            fontSize: 13,
          ),
        ),
        Text(
          value,
          style: const TextStyle(
            color: AppTheme.textPrimary,
            fontSize: 13,
            fontWeight: FontWeight.w600,
          ),
        ),
      ],
    );
  }

  Widget _buildNearbyServices(Map<String, dynamic> hub) {
    final services = [
      {'icon': '🏪', 'name': '편의점', 'count': '12개', 'distance': '평균 150m'},
      {'icon': '☕', 'name': '카페', 'count': '8개', 'distance': '평균 200m'},
      {'icon': '🍚', 'name': '음식점', 'count': '24개', 'distance': '평균 180m'},
      {'icon': '🏥', 'name': '병원', 'count': '6개', 'distance': '평균 350m'},
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          '주변 서비스',
          style: TextStyle(
            color: AppTheme.textPrimary,
            fontSize: 16,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: AppTheme.space3),
        GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2,
            crossAxisSpacing: AppTheme.space3,
            mainAxisSpacing: AppTheme.space3,
            childAspectRatio: 1.5,
          ),
          itemCount: services.length,
          itemBuilder: (context, index) {
            final service = services[index];
            return Container(
              padding: const EdgeInsets.all(AppTheme.space3),
              decoration: BoxDecoration(
                color: AppTheme.bgCard,
                borderRadius: BorderRadius.circular(AppTheme.radiusMd),
                border: Border.all(
                  color: Colors.white.withOpacity(0.05),
                ),
              ),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    service['icon']!,
                    style: const TextStyle(fontSize: 28),
                  ),
                  const SizedBox(height: AppTheme.space2),
                  Text(
                    service['name']!,
                    style: const TextStyle(
                      color: AppTheme.textPrimary,
                      fontSize: 13,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: AppTheme.space1),
                  Text(
                    service['count']!,
                    style: const TextStyle(
                      color: AppTheme.accentGold,
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  Text(
                    service['distance']!,
                    style: const TextStyle(
                      color: AppTheme.textMuted,
                      fontSize: 10,
                    ),
                  ),
                ],
              ),
            );
          },
        ),
      ],
    );
  }

  Widget _buildActivityStats(Map<String, dynamic> hub) {
    return Container(
      padding: const EdgeInsets.all(AppTheme.space4),
      decoration: BoxDecoration(
        color: AppTheme.bgCard,
        borderRadius: BorderRadius.circular(AppTheme.radiusMd),
        border: Border.all(
          color: Colors.white.withOpacity(0.05),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(Icons.analytics, color: AppTheme.accentGold, size: 20),
              SizedBox(width: AppTheme.space2),
              Text(
                '활동 통계',
                style: TextStyle(
                  color: AppTheme.textPrimary,
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
          const SizedBox(height: AppTheme.space4),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _buildStatItem('방문', '247회', Icons.location_on),
              Container(
                width: 1,
                height: 40,
                color: Colors.white.withOpacity(0.1),
              ),
              _buildStatItem('전단지', '38개', Icons.receipt),
              Container(
                width: 1,
                height: 40,
                color: Colors.white.withOpacity(0.1),
              ),
              _buildStatItem('포인트', '1,250P', Icons.stars),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildStatItem(String label, String value, IconData icon) {
    return Column(
      children: [
        Icon(icon, color: AppTheme.accentGold, size: 20),
        const SizedBox(height: AppTheme.space2),
        Text(
          value,
          style: const TextStyle(
            color: AppTheme.textPrimary,
            fontSize: 16,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: AppTheme.space1),
        Text(
          label,
          style: const TextStyle(
            color: AppTheme.textMuted,
            fontSize: 11,
          ),
        ),
      ],
    );
  }

  String _getHubIcon(String hubId) {
    switch (hubId) {
      case 'home':
        return '🏠';
      case 'work':
        return '💼';
      case 'family':
        return '👨‍👩‍👧';
      default:
        return '📍';
    }
  }
}
