# Story MRC-001-07: Merchant Dashboard Access

**Epic**: MRC-001 Merchant Onboarding
**Priority**: P0 (Critical)
**Story Points**: 3
**Status**: 📋 Planned

## User Story

**As a** merchant
**I want to** access my merchant dashboard
**So that** I can manage my flyers and store

## Acceptance Criteria

- [ ] 로그인 후 Merchant Dashboard로 리다이렉트
- [ ] 상점 정보 요약 표시
- [ ] Quick actions (전단지 생성, 상점 수정)
- [ ] 통계 카드 (전단지 수, 조회 수, 클릭 수)
- [ ] 최근 전단지 목록

## Tasks

### Frontend
- [ ] Merchant dashboard screen
- [ ] Store summary card
- [ ] Quick actions menu
- [ ] Statistics cards
- [ ] Recent flyers list

### Backend
- [ ] GET /merchants/me/stats
- [ ] GET /merchants/me/store
- [ ] Flyer statistics aggregation

### Testing
- [ ] Integration test: Dashboard data
- [ ] E2E test: Dashboard access

## Technical Notes

```typescript
// Merchant Dashboard Screen (Flutter)
class MerchantDashboardScreen extends StatefulWidget {
  @override
  _MerchantDashboardScreenState createState() => _MerchantDashboardScreenState();
}

class _MerchantDashboardScreenState extends State<MerchantDashboardScreen> {
  Store? _store;
  MerchantStats? _stats;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadDashboardData();
  }

  Future<void> _loadDashboardData() async {
    setState(() => _isLoading = true);
    try {
      final results = await Future.wait([
        MerchantService.getMyStore(),
        MerchantService.getStats(),
      ]);
      setState(() {
        _store = results[0] as Store;
        _stats = results[1] as MerchantStats;
      });
    } finally {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('사장님 대시보드'),
        actions: [
          IconButton(
            icon: Icon(Icons.settings),
            onPressed: () {
              Navigator.push(context, MaterialPageRoute(builder: (context) => SettingsScreen()));
            },
          ),
        ],
      ),
      body: _isLoading
          ? Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _loadDashboardData,
              child: ListView(
                padding: EdgeInsets.all(16),
                children: [
                  // Store Summary Card
                  Card(
                    child: Padding(
                      padding: EdgeInsets.all(16),
                      child: Row(
                        children: [
                          CircleAvatar(
                            radius: 40,
                            backgroundImage: _store!.profileImageUrl != null
                                ? NetworkImage(_store!.profileImageUrl!)
                                : null,
                            child: _store!.profileImageUrl == null
                                ? Icon(Icons.store, size: 40)
                                : null,
                          ),
                          SizedBox(width: 16),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  _store!.name,
                                  style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                                ),
                                SizedBox(height: 4),
                                Text(_store!.address, style: TextStyle(color: Colors.grey)),
                                if (_store!.owner.isBusinessVerified)
                                  Row(
                                    children: [
                                      Icon(Icons.verified, size: 16, color: Colors.blue),
                                      SizedBox(width: 4),
                                      Text('인증됨', style: TextStyle(fontSize: 12, color: Colors.blue)),
                                    ],
                                  ),
                              ],
                            ),
                          ),
                          IconButton(
                            icon: Icon(Icons.edit),
                            onPressed: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(builder: (context) => EditStoreScreen()),
                              );
                            },
                          ),
                        ],
                      ),
                    ),
                  ),

                  SizedBox(height: 16),

                  // Quick Actions
                  Row(
                    children: [
                      Expanded(
                        child: ElevatedButton.icon(
                          icon: Icon(Icons.add),
                          label: Text('전단지 만들기'),
                          onPressed: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(builder: (context) => CreateFlyerScreen()),
                            );
                          },
                          style: ElevatedButton.styleFrom(
                            minimumSize: Size(double.infinity, 56),
                            backgroundColor: Color(0xFFF5A623),
                          ),
                        ),
                      ),
                    ],
                  ),

                  SizedBox(height: 24),

                  // Statistics
                  Text('통계', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                  SizedBox(height: 12),

                  Row(
                    children: [
                      Expanded(
                        child: _StatCard(
                          icon: Icons.note_alt,
                          label: '전단지',
                          value: _stats!.totalFlyers.toString(),
                          color: Colors.blue,
                        ),
                      ),
                      SizedBox(width: 12),
                      Expanded(
                        child: _StatCard(
                          icon: Icons.visibility,
                          label: '조회 수',
                          value: _stats!.totalViews.toString(),
                          color: Colors.green,
                        ),
                      ),
                    ],
                  ),

                  SizedBox(height: 12),

                  Row(
                    children: [
                      Expanded(
                        child: _StatCard(
                          icon: Icons.touch_app,
                          label: '클릭 수',
                          value: _stats!.totalClicks.toString(),
                          color: Colors.orange,
                        ),
                      ),
                      SizedBox(width: 12),
                      Expanded(
                        child: _StatCard(
                          icon: Icons.favorite,
                          label: '저장 수',
                          value: _stats!.totalBookmarks.toString(),
                          color: Colors.red,
                        ),
                      ),
                    ],
                  ),

                  SizedBox(height: 24),

                  // Recent Flyers
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('최근 전단지', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                      TextButton(
                        onPressed: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(builder: (context) => MyFlyersScreen()),
                          );
                        },
                        child: Text('전체 보기'),
                      ),
                    ],
                  ),
                  SizedBox(height: 12),

                  if (_stats!.recentFlyers.isEmpty)
                    Center(
                      child: Padding(
                        padding: EdgeInsets.all(32),
                        child: Text('아직 등록한 전단지가 없습니다', style: TextStyle(color: Colors.grey)),
                      ),
                    )
                  else
                    ..._stats!.recentFlyers.map((flyer) => _RecentFlyerItem(flyer: flyer)),
                ],
              ),
            ),
    );
  }
}

class _StatCard extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final Color color;

  const _StatCard({
    required this.icon,
    required this.label,
    required this.value,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          children: [
            Icon(icon, size: 32, color: color),
            SizedBox(height: 8),
            Text(value, style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
            Text(label, style: TextStyle(fontSize: 14, color: Colors.grey)),
          ],
        ),
      ),
    );
  }
}

class _RecentFlyerItem extends StatelessWidget {
  final FlyerSummary flyer;

  const _RecentFlyerItem({required this.flyer});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: EdgeInsets.only(bottom: 12),
      child: ListTile(
        leading: ClipRRect(
          borderRadius: BorderRadius.circular(8),
          child: Image.network(flyer.imageUrl, width: 60, height: 60, fit: BoxFit.cover),
        ),
        title: Text(flyer.title),
        subtitle: Text('조회 ${flyer.viewCount} • 클릭 ${flyer.clickCount}'),
        trailing: Icon(Icons.chevron_right),
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (context) => FlyerDetailScreen(flyerId: flyer.id)),
          );
        },
      ),
    );
  }
}

// Backend: Merchant Stats
@Get('me/stats')
@UseGuards(JwtAuthGuard)
@Roles(UserRole.MERCHANT)
async getMerchantStats(@Req() req) {
  const userId = req.user.id;

  const store = await this.storeRepo.findOne({
    where: { ownerId: userId },
  });

  if (!store) {
    throw new NotFoundException('Store not found');
  }

  // Aggregate statistics
  const stats = await this.flyerRepo
    .createQueryBuilder('f')
    .select('COUNT(*)', 'totalFlyers')
    .addSelect('SUM(f.viewCount)', 'totalViews')
    .addSelect('SUM(f.clickCount)', 'totalClicks')
    .addSelect('SUM(f.bookmarkCount)', 'totalBookmarks')
    .where('f.merchantId = :merchantId', { merchantId: userId })
    .getRawOne();

  // Recent flyers
  const recentFlyers = await this.flyerRepo.find({
    where: { merchantId: userId },
    order: { createdAt: 'DESC' },
    take: 5,
  });

  return {
    totalFlyers: parseInt(stats.totalFlyers) || 0,
    totalViews: parseInt(stats.totalViews) || 0,
    totalClicks: parseInt(stats.totalClicks) || 0,
    totalBookmarks: parseInt(stats.totalBookmarks) || 0,
    recentFlyers,
  };
}
```

## Dependencies

- **Depends on**: MRC-001-06
- **Blocks**: MRC-003

## Definition of Done

- [ ] Dashboard UI implemented
- [ ] Store summary working
- [ ] Statistics working
- [ ] Quick actions working
- [ ] Backend stats API working
- [ ] Tests passing

## Notes

- 상인 전용 대시보드
- 통계: 전단지 수, 조회/클릭/저장 수
- Quick actions: 전단지 생성, 상점 수정
- 최근 전단지 5개 표시
- Pull-to-refresh 지원
