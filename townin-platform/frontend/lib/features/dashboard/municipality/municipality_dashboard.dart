import 'package:flutter/material.dart';
import '../../../core/widgets/stat_card.dart';
import '../../grid_cell/data/grid_cell_repository.dart';
import '../../user/data/users_repository.dart';
import '../../merchant/data/merchant_repository.dart';

class MunicipalityDashboard extends StatefulWidget {
  const MunicipalityDashboard({super.key});

  @override
  State<MunicipalityDashboard> createState() => _MunicipalityDashboardState();
}

class _MunicipalityDashboardState extends State<MunicipalityDashboard> {
  final _gridCellRepository = GridCellRepository();
  final _usersRepository = UsersRepository();
  final _merchantRepository = MerchantRepository();

  Map<String, dynamic>? _cityStats;
  List<Map<String, dynamic>>? _gridCells;
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final cityStats = await _gridCellRepository.getCityStats('의정부시');
      final gridCells = await _gridCellRepository.getGridCellsByCity('의정부시');

      setState(() {
        _cityStats = cityStats;
        _gridCells = gridCells;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[100],
      appBar: AppBar(
        title: const Text('자치체관리 - 의정부시'),
        backgroundColor: const Color(0xFF8B5CF6),
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_outlined),
            onPressed: () {},
          ),
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadData,
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text('오류가 발생했습니다: $_error'),
                      const SizedBox(height: 16),
                      ElevatedButton(
                        onPressed: _loadData,
                        child: const Text('다시 시도'),
                      ),
                    ],
                  ),
                )
              : SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // City Info Card
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    const Color(0xFF8B5CF6),
                    const Color(0xFF8B5CF6).withOpacity(0.8),
                  ],
                ),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          '의정부시',
                          style: Theme.of(context)
                              .textTheme
                              .headlineSmall
                              ?.copyWith(
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                              ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          '경기도 의정부시 - 도시 관리 대시보드',
                          style:
                              Theme.of(context).textTheme.bodyMedium?.copyWith(
                                    color: Colors.white.withOpacity(0.9),
                                  ),
                        ),
                      ],
                    ),
                  ),
                  const Icon(
                    Icons.account_balance,
                    size: 48,
                    color: Colors.white,
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Key Metrics
            Text(
              '핵심 지표',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),
            const SizedBox(height: 12),
            GridView.count(
              crossAxisCount: 2,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              mainAxisSpacing: 12,
              crossAxisSpacing: 12,
              childAspectRatio: 1.4,
              children: [
                StatCard(
                  label: '총 사용자',
                  value: '${_cityStats?['totalUsers'] ?? 0}',
                  icon: Icons.people,
                  color: const Color(0xFF3B82F6),
                ),
                StatCard(
                  label: '등록 상인',
                  value: '${_cityStats?['totalMerchants'] ?? 0}',
                  icon: Icons.store,
                  color: const Color(0xFFF59E0B),
                ),
                StatCard(
                  label: '그리드 셀',
                  value: '${_cityStats?['totalCells'] ?? 0}',
                  icon: Icons.grid_on,
                  color: const Color(0xFF10B981),
                ),
                StatCard(
                  label: '평균 등급',
                  value: '${(_cityStats?['averageTier'] ?? 0).toStringAsFixed(1)}',
                  icon: Icons.trending_up,
                  color: const Color(0xFFEC4899),
                ),
              ],
            ),
            const SizedBox(height: 24),

            // District Breakdown
            Text(
              '동별 현황 (그리드 셀)',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),
            const SizedBox(height: 12),
            ...(_gridCells ?? []).map((cell) {
              return Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: _buildDistrictCard(
                  context,
                  cell['district'] ?? 'Unknown',
                  cell['populationDensity'] ?? 0,
                  cell['merchantCount'] ?? 0,
                  cell['propertyValueTier'] ?? 1,
                ),
              );
            }).toList(),
            const SizedBox(height: 24),

            // Security Guards Performance
            Text(
              '보안관 성과',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),
            const SizedBox(height: 12),
            _buildGuardPerformanceCard(
              context,
              '의정부동 보안관',
              '의정부동',
              45000,
              900,
            ),
            const SizedBox(height: 8),
            _buildGuardPerformanceCard(
              context,
              '가능동 보안관',
              '가능동',
              52000,
              1040,
            ),
            const SizedBox(height: 8),
            _buildGuardPerformanceCard(
              context,
              '호원동 보안관',
              '호원동',
              38000,
              760,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDistrictCard(
    BuildContext context,
    String district,
    int users,
    int merchants,
    int tier,
  ) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: const Color(0xFF8B5CF6).withOpacity(0.1),
              borderRadius: BorderRadius.circular(10),
            ),
            child: const Icon(
              Icons.location_on,
              color: Color(0xFF8B5CF6),
              size: 24,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  district,
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                ),
                const SizedBox(height: 4),
                Text(
                  '사용자: $users명 | 상인: $merchants개 | 등급: $tier',
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: Colors.grey[600],
                      ),
                ),
              ],
            ),
          ),
          const Icon(
            Icons.chevron_right,
            color: Colors.grey,
          ),
        ],
      ),
    );
  }

  Widget _buildGuardPerformanceCard(
    BuildContext context,
    String name,
    String district,
    int earnings,
    int views,
  ) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: const Color(0xFF10B981).withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Icon(
                  Icons.security,
                  color: Color(0xFF10B981),
                  size: 20,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      name,
                      style: Theme.of(context).textTheme.titleSmall?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                    ),
                    Text(
                      district,
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            color: Colors.grey[600],
                          ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: _buildMetric(
                  context,
                  '총 수익',
                  '₩${earnings.toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (Match m) => '${m[1]},')}',
                ),
              ),
              Expanded(
                child: _buildMetric(
                  context,
                  '광고 조회',
                  '$views회',
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildMetric(BuildContext context, String label, String value) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                color: Colors.grey[600],
              ),
        ),
        const SizedBox(height: 2),
        Text(
          value,
          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
              ),
        ),
      ],
    );
  }
}
