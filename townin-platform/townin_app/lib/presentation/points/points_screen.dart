import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'providers/points_provider.dart';

class PointsScreen extends ConsumerStatefulWidget {
  const PointsScreen({super.key});

  @override
  ConsumerState<PointsScreen> createState() => _PointsScreenState();
}

class _PointsScreenState extends ConsumerState<PointsScreen>
    with SingleTickerProviderStateMixin {
  final ScrollController _scrollController = ScrollController();
  late AnimationController _animationController;
  late Animation<double> _balanceAnimation;

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_onScroll);
    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
    );
    _balanceAnimation = Tween<double>(begin: 0, end: 1).animate(
      CurvedAnimation(
        parent: _animationController,
        curve: Curves.easeOutCubic,
      ),
    );
    _animationController.forward();
  }

  @override
  void dispose() {
    _scrollController.dispose();
    _animationController.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (_scrollController.position.pixels >=
        _scrollController.position.maxScrollExtent * 0.8) {
      ref.read(pointsProvider.notifier).loadMore();
    }
  }

  @override
  Widget build(BuildContext context) {
    final pointsState = ref.watch(pointsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('포인트'),
        actions: [
          IconButton(
            icon: const Icon(Icons.history),
            onPressed: () {
              // Navigate to full transaction history
            },
          ),
          IconButton(
            icon: const Icon(Icons.info_outline),
            onPressed: () => _showPointsInfo(),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () => ref.read(pointsProvider.notifier).refresh(),
        child: CustomScrollView(
          controller: _scrollController,
          slivers: [
            // Balance Card
            SliverToBoxAdapter(
              child: _buildBalanceCard(pointsState),
            ),

            // Filter Tabs
            SliverToBoxAdapter(
              child: _buildFilterTabs(pointsState),
            ),

            // Transaction List
            pointsState.isLoading && pointsState.transactions.isEmpty
                ? const SliverFillRemaining(
                    child: Center(child: CircularProgressIndicator()),
                  )
                : pointsState.transactions.isEmpty
                    ? SliverFillRemaining(
                        child: _buildEmptyState(),
                      )
                    : SliverList(
                        delegate: SliverChildBuilderDelegate(
                          (context, index) {
                            final transaction = pointsState.transactions[index];
                            return _buildTransactionItem(transaction);
                          },
                          childCount: pointsState.transactions.length,
                        ),
                      ),

            // Loading more indicator
            if (pointsState.isLoadingMore)
              const SliverToBoxAdapter(
                child: Padding(
                  padding: EdgeInsets.all(16),
                  child: Center(child: CircularProgressIndicator()),
                ),
              ),

            // Bottom padding
            const SliverToBoxAdapter(
              child: SizedBox(height: 32),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBalanceCard(PointsState state) {
    return AnimatedBuilder(
      animation: _balanceAnimation,
      builder: (context, child) {
        final animatedPoints =
            (state.totalPoints * _balanceAnimation.value).toInt();

        return Container(
          margin: const EdgeInsets.all(16),
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(20),
            gradient: const LinearGradient(
              colors: [Color(0xFF6366F1), Color(0xFF8B5CF6)],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            boxShadow: [
              BoxShadow(
                color: Colors.purple.withOpacity(0.3),
                blurRadius: 20,
                offset: const Offset(0, 10),
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    '보유 포인트',
                    style: TextStyle(
                      color: Colors.white70,
                      fontSize: 16,
                    ),
                  ),
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: Colors.white24,
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: const Row(
                      children: [
                        Icon(Icons.stars, color: Colors.yellowAccent, size: 16),
                        SizedBox(width: 4),
                        Text(
                          'TOWNIN',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              Row(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    NumberFormat('#,###').format(animatedPoints),
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 48,
                      fontWeight: FontWeight.bold,
                      height: 1,
                    ),
                  ),
                  const SizedBox(width: 8),
                  const Padding(
                    padding: EdgeInsets.only(bottom: 8),
                    child: Text(
                      'P',
                      style: TextStyle(
                        color: Colors.white70,
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 24),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  _buildStatButton(
                    icon: Icons.add_circle_outline,
                    label: '적립',
                    onTap: () {},
                  ),
                  Container(width: 1, height: 30, color: Colors.white24),
                  _buildStatButton(
                    icon: Icons.remove_circle_outline,
                    label: '사용',
                    onTap: () {},
                  ),
                  Container(width: 1, height: 30, color: Colors.white24),
                  _buildStatButton(
                    icon: Icons.calendar_today,
                    label: '만료 예정',
                    onTap: () {},
                  ),
                ],
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildStatButton({
    required IconData icon,
    required String label,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      child: Column(
        children: [
          Icon(icon, color: Colors.white, size: 24),
          const SizedBox(height: 4),
          Text(
            label,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 12,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterTabs(PointsState state) {
    final filters = [
      {'label': '전체', 'value': null},
      {'label': '적립', 'value': 'earn'},
      {'label': '사용', 'value': 'spend'},
      {'label': '만료', 'value': 'expire'},
    ];

    return Container(
      height: 60,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        itemCount: filters.length,
        itemBuilder: (context, index) {
          final filter = filters[index];
          final isSelected = state.filterType == filter['value'];

          return Padding(
            padding: const EdgeInsets.only(right: 8),
            child: ChoiceChip(
              label: Text(filter['label'] as String),
              selected: isSelected,
              onSelected: (selected) {
                if (selected) {
                  ref
                      .read(pointsProvider.notifier)
                      .setFilter(filter['value'] as String?);
                }
              },
            ),
          );
        },
      ),
    );
  }

  Widget _buildTransactionItem(Map<String, dynamic> transaction) {
    final type = transaction['type'] ?? '';
    final amount = transaction['amount'] ?? 0;
    final reason = transaction['reason'] ?? '';
    final createdAt = transaction['createdAt'] ?? '';
    final balanceAfter = transaction['balanceAfter'] ?? 0;

    final isEarn = type == 'earn';
    final isExpire = type == 'expire';

    final icon = _getTransactionIcon(type, reason);
    final color = isEarn
        ? Colors.green
        : isExpire
            ? Colors.orange
            : Colors.red;

    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: color.withOpacity(0.1),
          child: Icon(icon, color: color, size: 24),
        ),
        title: Text(
          _getTransactionTitle(reason),
          style: const TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
          ),
        ),
        subtitle: Text(
          _formatDate(createdAt),
          style: TextStyle(
            fontSize: 12,
            color: Colors.grey[600],
          ),
        ),
        trailing: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Text(
              '${isEarn ? '+' : '-'}${NumberFormat('#,###').format(amount)} P',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: color,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              '잔액 ${NumberFormat('#,###').format(balanceAfter)} P',
              style: TextStyle(
                fontSize: 11,
                color: Colors.grey[600],
              ),
            ),
          ],
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
            '포인트 내역이 없습니다',
            style: TextStyle(fontSize: 16, color: Colors.grey[600]),
          ),
        ],
      ),
    );
  }

  IconData _getTransactionIcon(String type, String reason) {
    if (type == 'earn') {
      if (reason.contains('회원가입')) return Icons.person_add;
      if (reason.contains('전단지')) return Icons.receipt;
      if (reason.contains('리뷰')) return Icons.rate_review;
      return Icons.add_circle;
    } else if (type == 'expire') {
      return Icons.access_time;
    } else {
      // spend
      return Icons.shopping_cart;
    }
  }

  String _getTransactionTitle(String reason) {
    // Parse reason to make it more readable
    if (reason.contains('회원가입')) return '회원가입 축하 포인트';
    if (reason.contains('전단지 조회')) return '전단지 조회 포인트';
    if (reason.contains('리뷰')) return '리뷰 작성 포인트';
    if (reason.contains('만료')) return '포인트 만료';
    return reason;
  }

  String _formatDate(String dateStr) {
    try {
      final date = DateTime.parse(dateStr);
      final now = DateTime.now();
      final diff = now.difference(date);

      if (diff.inDays == 0) {
        return '오늘 ${DateFormat('HH:mm').format(date)}';
      } else if (diff.inDays == 1) {
        return '어제 ${DateFormat('HH:mm').format(date)}';
      } else if (diff.inDays < 7) {
        return '${diff.inDays}일 전';
      } else {
        return DateFormat('yyyy.MM.dd HH:mm').format(date);
      }
    } catch (e) {
      return dateStr;
    }
  }

  void _showPointsInfo() {
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('포인트 적립 규칙'),
          content: SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                _buildInfoItem('회원가입', '1,000 P'),
                _buildInfoItem('전단지 조회', '10 P'),
                _buildInfoItem('전단지 좋아요', '5 P'),
                _buildInfoItem('리뷰 작성', '50 P'),
                _buildInfoItem('친구 추천', '500 P'),
                const SizedBox(height: 16),
                const Text(
                  '포인트 유효기간',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  '• 회원가입 포인트: 1년\n'
                  '• 활동 포인트: 6개월\n'
                  '• 구매 포인트: 3개월',
                  style: TextStyle(
                    fontSize: 14,
                    color: Colors.grey[700],
                    height: 1.5,
                  ),
                ),
              ],
            ),
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

  Widget _buildInfoItem(String action, String points) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            action,
            style: const TextStyle(fontSize: 14),
          ),
          Text(
            points,
            style: const TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.bold,
              color: Colors.blue,
            ),
          ),
        ],
      ),
    );
  }
}
