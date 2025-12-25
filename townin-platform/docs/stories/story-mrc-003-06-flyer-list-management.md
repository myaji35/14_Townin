# Story MRC-003-06: Flyer List Management

**Epic**: MRC-003 Basic Flyer Creation
**Priority**: P0 (Critical)
**Story Points**: 4
**Status**: 📋 Planned

## User Story

**As a** merchant
**I want to** view all my flyers
**So that** I can track and manage them

## Acceptance Criteria

- [ ] 전단지 목록 (테이블 or 카드)
- [ ] 필터: 활성/만료/전체
- [ ] 정렬: 최신순, 조회수 순
- [ ] 전단지별 통계 표시 (조회, 클릭, 북마크)
- [ ] Quick actions (수정, 삭제, 활성/비활성)

## Tasks

### Frontend
- [ ] Flyer list screen
- [ ] Filter & sort UI
- [ ] Action buttons
- [ ] Statistics display

### Backend
- [ ] GET /merchants/me/flyers
- [ ] Filter logic (status, date)
- [ ] Sort logic

### Testing
- [ ] Integration test: List flyers
- [ ] E2E test: Filter & sort

## Technical Notes

```typescript
// My Flyers Screen (Flutter)
class MyFlyersScreen extends StatefulWidget {
  @override
  _MyFlyersScreenState createState() => _MyFlyersScreenState();
}

class _MyFlyersScreenState extends State<MyFlyersScreen> {
  List<MerchantFlyer> _flyers = [];
  FlyerFilter _filter = FlyerFilter.ACTIVE;
  FlyerSort _sort = FlyerSort.LATEST;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadFlyers();
  }

  Future<void> _loadFlyers() async {
    setState(() => _isLoading = true);
    try {
      final flyers = await FlyerService.getMyFlyers(
        status: _filter,
        sort: _sort,
      );
      setState(() => _flyers = flyers);
    } finally {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('내 전단지'),
        actions: [
          PopupMenuButton<FlyerSort>(
            initialValue: _sort,
            onSelected: (sort) {
              setState(() => _sort = sort);
              _loadFlyers();
            },
            itemBuilder: (context) => [
              PopupMenuItem(value: FlyerSort.LATEST, child: Text('최신순')),
              PopupMenuItem(value: FlyerSort.VIEWS, child: Text('조회수 순')),
              PopupMenuItem(value: FlyerSort.CLICKS, child: Text('클릭수 순')),
            ],
          ),
        ],
      ),
      body: Column(
        children: [
          // Filter Tabs
          Container(
            height: 50,
            child: ListView(
              scrollDirection: Axis.horizontal,
              padding: EdgeInsets.symmetric(horizontal: 16),
              children: [
                _FilterChip(
                  label: '활성',
                  isSelected: _filter == FlyerFilter.ACTIVE,
                  onTap: () {
                    setState(() => _filter = FlyerFilter.ACTIVE);
                    _loadFlyers();
                  },
                ),
                _FilterChip(
                  label: '만료',
                  isSelected: _filter == FlyerFilter.EXPIRED,
                  onTap: () {
                    setState(() => _filter = FlyerFilter.EXPIRED);
                    _loadFlyers();
                  },
                ),
                _FilterChip(
                  label: '전체',
                  isSelected: _filter == FlyerFilter.ALL,
                  onTap: () {
                    setState(() => _filter = FlyerFilter.ALL);
                    _loadFlyers();
                  },
                ),
              ],
            ),
          ),

          Divider(height: 1),

          // Flyers List
          Expanded(
            child: _isLoading
                ? Center(child: CircularProgressIndicator())
                : _flyers.isEmpty
                    ? Center(child: Text('전단지가 없습니다'))
                    : RefreshIndicator(
                        onRefresh: _loadFlyers,
                        child: ListView.builder(
                          itemCount: _flyers.length,
                          itemBuilder: (context, index) {
                            return _FlyerListItem(
                              flyer: _flyers[index],
                              onEdit: () => _editFlyer(_flyers[index]),
                              onDelete: () => _deleteFlyer(_flyers[index]),
                              onToggleActive: () => _toggleActive(_flyers[index]),
                            );
                          },
                        ),
                      ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (context) => TemplateGalleryScreen()),
          );
        },
        child: Icon(Icons.add),
      ),
    );
  }

  void _editFlyer(MerchantFlyer flyer) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => FlyerEditorScreen(flyerId: flyer.id),
      ),
    ).then((_) => _loadFlyers());
  }

  Future<void> _deleteFlyer(MerchantFlyer flyer) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('전단지 삭제'),
        content: Text('정말 삭제하시겠습니까?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: Text('취소')),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            style: TextButton.styleFrom(foregroundColor: Colors.red),
            child: Text('삭제'),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      await FlyerService.deleteFlyer(flyer.id);
      _loadFlyers();
    }
  }

  Future<void> _toggleActive(MerchantFlyer flyer) async {
    await FlyerService.toggleActive(flyer.id);
    _loadFlyers();
  }
}

class _FilterChip extends StatelessWidget {
  final String label;
  final bool isSelected;
  final VoidCallback onTap;

  const _FilterChip({
    required this.label,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(right: 8),
      child: FilterChip(
        label: Text(label),
        selected: isSelected,
        onSelected: (_) => onTap(),
      ),
    );
  }
}

class _FlyerListItem extends StatelessWidget {
  final MerchantFlyer flyer;
  final VoidCallback onEdit;
  final VoidCallback onDelete;
  final VoidCallback onToggleActive;

  const _FlyerListItem({
    required this.flyer,
    required this.onEdit,
    required this.onDelete,
    required this.onToggleActive,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: EdgeInsets.all(12),
      child: Column(
        children: [
          ListTile(
            leading: ClipRRect(
              borderRadius: BorderRadius.circular(8),
              child: Image.network(
                flyer.imageUrls.isNotEmpty ? flyer.imageUrls.first : '',
                width: 80,
                height: 80,
                fit: BoxFit.cover,
              ),
            ),
            title: Text(flyer.title, style: TextStyle(fontWeight: FontWeight.bold)),
            subtitle: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('만료: ${DateFormat('yyyy.MM.dd').format(flyer.expiresAt)}'),
                SizedBox(height: 4),
                Row(
                  children: [
                    _StatBadge(icon: Icons.visibility, value: flyer.viewCount),
                    _StatBadge(icon: Icons.touch_app, value: flyer.clickCount),
                    _StatBadge(icon: Icons.favorite, value: flyer.bookmarkCount),
                  ],
                ),
              ],
            ),
            trailing: PopupMenuButton(
              itemBuilder: (context) => [
                PopupMenuItem(onTap: onEdit, child: Text('수정')),
                PopupMenuItem(onTap: onToggleActive, child: Text(flyer.isActive ? '비활성화' : '활성화')),
                PopupMenuItem(
                  onTap: onDelete,
                  child: Text('삭제', style: TextStyle(color: Colors.red)),
                ),
              ],
            ),
          ),

          if (!flyer.isActive)
            Container(
              width: double.infinity,
              padding: EdgeInsets.all(8),
              color: Colors.grey.shade300,
              child: Text('비활성', textAlign: TextAlign.center),
            ),
        ],
      ),
    );
  }
}

class _StatBadge extends StatelessWidget {
  final IconData icon;
  final int value;

  const _StatBadge({required this.icon, required this.value});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(right: 12),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 16, color: Colors.grey),
          SizedBox(width: 4),
          Text('$value', style: TextStyle(fontSize: 12)),
        ],
      ),
    );
  }
}

enum FlyerFilter { ACTIVE, EXPIRED, ALL }
enum FlyerSort { LATEST, VIEWS, CLICKS }

// Backend: Get Merchant Flyers
@Get('me/flyers')
@UseGuards(JwtAuthGuard)
@Roles(UserRole.MERCHANT)
async getMyFlyers(@Query() query: GetMyFlyersDto, @Req() req) {
  const userId = req.user.id;

  const qb = this.flyerRepo
    .createQueryBuilder('f')
    .where('f.merchantId = :userId', { userId })
    .andWhere('f.isDeleted = false');

  // Filter
  if (query.status === 'active') {
    qb.andWhere('f.isActive = true').andWhere('f.expiresAt > :now', { now: new Date() });
  } else if (query.status === 'expired') {
    qb.andWhere('f.expiresAt <= :now', { now: new Date() });
  }

  // Sort
  if (query.sort === 'views') {
    qb.orderBy('f.viewCount', 'DESC');
  } else if (query.sort === 'clicks') {
    qb.orderBy('f.clickCount', 'DESC');
  } else {
    qb.orderBy('f.createdAt', 'DESC');
  }

  const flyers = await qb.getMany();

  return flyers;
}
```

## Dependencies

- **Depends on**: MRC-003-05
- **Blocks**: MRC-003-07

## Definition of Done

- [ ] List UI implemented
- [ ] Filters working
- [ ] Sorting working
- [ ] Quick actions working
- [ ] Backend API working
- [ ] Tests passing

## Notes

- 필터: 활성/만료/전체
- 정렬: 최신순/조회수/클릭수
- 통계: 조회/클릭/북마크 수
- Quick actions: 수정/삭제/활성-비활성 토글
- Pull-to-refresh 지원
