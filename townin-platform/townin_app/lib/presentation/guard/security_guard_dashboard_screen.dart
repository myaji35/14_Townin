import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../core/theme/app_theme.dart';
import '../../core/mock/mock_data.dart';

class SecurityGuardDashboardScreen extends ConsumerStatefulWidget {
  const SecurityGuardDashboardScreen({super.key});

  @override
  ConsumerState<SecurityGuardDashboardScreen> createState() =>
      _SecurityGuardDashboardScreenState();
}

class _SecurityGuardDashboardScreenState
    extends ConsumerState<SecurityGuardDashboardScreen> {
  @override
  Widget build(BuildContext context) {
    final guard = MockData.securityGuards[0]; // 현재 보안관

    return Scaffold(
      backgroundColor: AppTheme.bgApp,
      appBar: AppBar(
        title: const Text('보안관 대시보드'),
        backgroundColor: AppTheme.bgSidebar,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_outlined),
            onPressed: () {},
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(AppTheme.space4),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 보안관 프로필 카드
            _buildGuardProfile(guard),
            const SizedBox(height: AppTheme.space6),

            // 통계 카드
            _buildStatsCards(guard),
            const SizedBox(height: AppTheme.space6),

            // 승인 대기 전단지
            _buildPendingFlyers(),
            const SizedBox(height: AppTheme.space6),

            // 최근 활동
            _buildRecentActivity(),
          ],
        ),
      ),
    );
  }

  Widget _buildGuardProfile(Map<String, dynamic> guard) {
    return Container(
      padding: const EdgeInsets.all(AppTheme.space6),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            Color(0xFF1C2026),
            Color(0xFF111316),
          ],
        ),
        borderRadius: BorderRadius.circular(AppTheme.radiusLg),
        border: Border.all(
          color: AppTheme.accentGold.withOpacity(0.3),
          width: 2,
        ),
        boxShadow: AppTheme.glowGold,
      ),
      child: Row(
        children: [
          Container(
            width: 80,
            height: 80,
            decoration: BoxDecoration(
              color: AppTheme.accentGold.withOpacity(0.2),
              shape: BoxShape.circle,
              border: Border.all(
                color: AppTheme.accentGold,
                width: 3,
              ),
            ),
            child: const Center(
              child: Icon(
                Icons.shield,
                color: AppTheme.accentGold,
                size: 40,
              ),
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
                      guard['name'],
                      style: const TextStyle(
                        color: AppTheme.textPrimary,
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(width: AppTheme.space2),
                    if (guard['badge'] != null)
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: AppTheme.space2,
                          vertical: 2,
                        ),
                        decoration: BoxDecoration(
                          color: _getBadgeColor(guard['badge']),
                          borderRadius: BorderRadius.circular(AppTheme.radiusPill),
                        ),
                        child: Text(
                          guard['badge'].toString().toUpperCase(),
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 9,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                  ],
                ),
                const SizedBox(height: AppTheme.space1),
                Text(
                  guard['badgeName'],
                  style: const TextStyle(
                    color: AppTheme.textSecondary,
                    fontSize: 13,
                  ),
                ),
                const SizedBox(height: AppTheme.space1),
                Text(
                  '담당 구역: ${guard['district']}',
                  style: const TextStyle(
                    color: AppTheme.accentGold,
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Color _getBadgeColor(String badge) {
    switch (badge) {
      case 'gold':
        return const Color(0xFFFFD700);
      case 'silver':
        return const Color(0xFFC0C0C0);
      case 'bronze':
        return const Color(0xFFCD7F32);
      default:
        return AppTheme.accentGold;
    }
  }

  Widget _buildStatsCards(Map<String, dynamic> guard) {
    final stats = [
      {
        'icon': Icons.trending_up,
        'label': '이번 달 수익',
        'value': NumberFormat('#,###').format(guard['earnings']),
        'unit': 'P',
        'color': AppTheme.success,
      },
      {
        'icon': Icons.visibility,
        'label': '전단지 조회',
        'value': guard['adViews'].toString(),
        'unit': '회',
        'color': AppTheme.info,
      },
      {
        'icon': Icons.check_circle,
        'label': '승인 완료',
        'value': '32',
        'unit': '건',
        'color': AppTheme.accentGold,
      },
      {
        'icon': Icons.pending,
        'label': '승인 대기',
        'value': '5',
        'unit': '건',
        'color': AppTheme.warning,
      },
    ];

    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        crossAxisSpacing: AppTheme.space3,
        mainAxisSpacing: AppTheme.space3,
        childAspectRatio: 1.3,
      ),
      itemCount: stats.length,
      itemBuilder: (context, index) {
        final stat = stats[index];
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
              Container(
                padding: const EdgeInsets.all(AppTheme.space2),
                decoration: BoxDecoration(
                  color: (stat['color'] as Color).withOpacity(0.15),
                  borderRadius: BorderRadius.circular(AppTheme.radiusSm),
                ),
                child: Icon(
                  stat['icon'] as IconData,
                  color: stat['color'] as Color,
                  size: 20,
                ),
              ),
              const Spacer(),
              Text(
                stat['label'] as String,
                style: const TextStyle(
                  color: AppTheme.textMuted,
                  fontSize: 11,
                ),
              ),
              const SizedBox(height: AppTheme.space1),
              Row(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    stat['value'] as String,
                    style: TextStyle(
                      color: stat['color'] as Color,
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(width: AppTheme.space1),
                  Padding(
                    padding: const EdgeInsets.only(bottom: 2),
                    child: Text(
                      stat['unit'] as String,
                      style: const TextStyle(
                        color: AppTheme.textSecondary,
                        fontSize: 12,
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildPendingFlyers() {
    final pendingFlyers = [
      {
        'id': '1',
        'storeName': '의정부 치킨집',
        'title': '치킨 할인 전단지',
        'submittedAt': DateTime.now().subtract(const Duration(hours: 2)),
      },
      {
        'id': '2',
        'storeName': '카페 의정부',
        'title': '신메뉴 출시 안내',
        'submittedAt': DateTime.now().subtract(const Duration(hours: 5)),
      },
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text(
              '승인 대기 전단지',
              style: TextStyle(
                color: AppTheme.textPrimary,
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            Container(
              padding: const EdgeInsets.symmetric(
                horizontal: AppTheme.space3,
                vertical: AppTheme.space1,
              ),
              decoration: BoxDecoration(
                color: AppTheme.warning.withOpacity(0.2),
                borderRadius: BorderRadius.circular(AppTheme.radiusPill),
              ),
              child: Text(
                '${pendingFlyers.length}건',
                style: const TextStyle(
                  color: AppTheme.warning,
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: AppTheme.space4),
        ...pendingFlyers.map((flyer) => _buildPendingFlyerCard(flyer)),
      ],
    );
  }

  Widget _buildPendingFlyerCard(Map<String, dynamic> flyer) {
    return Container(
      margin: const EdgeInsets.only(bottom: AppTheme.space3),
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
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(AppTheme.space2),
                decoration: BoxDecoration(
                  color: AppTheme.warning.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(AppTheme.radiusSm),
                ),
                child: const Icon(
                  Icons.pending_actions,
                  color: AppTheme.warning,
                  size: 20,
                ),
              ),
              const SizedBox(width: AppTheme.space3),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      flyer['storeName'],
                      style: const TextStyle(
                        color: AppTheme.textMuted,
                        fontSize: 11,
                      ),
                    ),
                    const SizedBox(height: AppTheme.space1),
                    Text(
                      flyer['title'],
                      style: const TextStyle(
                        color: AppTheme.textPrimary,
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: AppTheme.space3),
          Row(
            children: [
              const Icon(
                Icons.access_time,
                size: 12,
                color: AppTheme.textMuted,
              ),
              const SizedBox(width: AppTheme.space1),
              Text(
                _formatTime(flyer['submittedAt'] as DateTime),
                style: const TextStyle(
                  color: AppTheme.textMuted,
                  fontSize: 11,
                ),
              ),
              const Spacer(),
              OutlinedButton(
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('전단지 상세보기 기능 준비 중...')),
                  );
                },
                style: OutlinedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(
                    horizontal: AppTheme.space3,
                    vertical: AppTheme.space2,
                  ),
                  minimumSize: Size.zero,
                ),
                child: const Text('검토하기'),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildRecentActivity() {
    final activities = [
      {
        'icon': Icons.check_circle,
        'title': '전단지 승인',
        'subtitle': '스타벅스 의정부역점 - 1+1 이벤트',
        'time': DateTime.now().subtract(const Duration(minutes: 30)),
        'color': AppTheme.success,
      },
      {
        'icon': Icons.cancel,
        'title': '전단지 거절',
        'subtitle': '부적절한 내용 포함',
        'time': DateTime.now().subtract(const Duration(hours: 1)),
        'color': AppTheme.error,
      },
      {
        'icon': Icons.attach_money,
        'title': '수익 정산',
        'subtitle': '+350P 획득',
        'time': DateTime.now().subtract(const Duration(hours: 3)),
        'color': AppTheme.accentGold,
      },
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          '최근 활동',
          style: TextStyle(
            color: AppTheme.textPrimary,
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: AppTheme.space4),
        Container(
          decoration: BoxDecoration(
            color: AppTheme.bgCard,
            borderRadius: BorderRadius.circular(AppTheme.radiusMd),
            border: Border.all(
              color: Colors.white.withOpacity(0.05),
            ),
          ),
          child: ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: activities.length,
            separatorBuilder: (context, index) => Divider(
              height: 1,
              color: Colors.white.withOpacity(0.05),
            ),
            itemBuilder: (context, index) {
              final activity = activities[index];
              return ListTile(
                contentPadding: const EdgeInsets.symmetric(
                  horizontal: AppTheme.space4,
                  vertical: AppTheme.space2,
                ),
                leading: Container(
                  padding: const EdgeInsets.all(AppTheme.space2),
                  decoration: BoxDecoration(
                    color: (activity['color'] as Color).withOpacity(0.15),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(
                    activity['icon'] as IconData,
                    color: activity['color'] as Color,
                    size: 20,
                  ),
                ),
                title: Text(
                  activity['title'] as String,
                  style: const TextStyle(
                    color: AppTheme.textPrimary,
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                subtitle: Text(
                  activity['subtitle'] as String,
                  style: const TextStyle(
                    color: AppTheme.textMuted,
                    fontSize: 12,
                  ),
                ),
                trailing: Text(
                  _formatTime(activity['time'] as DateTime),
                  style: const TextStyle(
                    color: AppTheme.textMuted,
                    fontSize: 11,
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  String _formatTime(DateTime time) {
    final now = DateTime.now();
    final diff = now.difference(time);

    if (diff.inMinutes < 60) {
      return '${diff.inMinutes}분 전';
    } else if (diff.inHours < 24) {
      return '${diff.inHours}시간 전';
    } else {
      return DateFormat('M월 d일').format(time);
    }
  }
}
