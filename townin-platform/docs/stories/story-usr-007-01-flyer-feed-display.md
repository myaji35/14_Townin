# Story USR-007-01: Flyer Feed Display

**Epic**: USR-007 Digital Flyer Viewer
**Priority**: P0 (Critical)
**Story Points**: 5
**Status**: 📋 Planned

## User Story

**As a** user
**I want to** see nearby flyers in a feed
**So that** I can browse local offers

## Acceptance Criteria

- [ ] 카드 기반 전단지 목록
- [ ] 전단지 이미지, 제목, 할인율, 거리 표시
- [ ] Hub 선택 드롭다운
- [ ] 기본 정렬: 최신순
- [ ] 스켈레톤 로딩
- [ ] 빈 상태 UI (Empty State)
- [ ] Pull-to-refresh

## Tasks

### Frontend
- [ ] Flyer feed screen
- [ ] Flyer card component
- [ ] Hub selector integration
- [ ] Skeleton loading
- [ ] Empty state UI
- [ ] Pull-to-refresh

### Backend
- [ ] GET /flyers endpoint
- [ ] Hub-based filtering
- [ ] Distance calculation
- [ ] Response DTO

### Testing
- [ ] Unit tests: Distance calculation
- [ ] Integration test: Flyer query
- [ ] E2E test: Feed display

## Technical Notes

```typescript
// Flyer Feed Screen (Flutter)
class FlyerFeedScreen extends StatefulWidget {
  @override
  _FlyerFeedScreenState createState() => _FlyerFeedScreenState();
}

class _FlyerFeedScreenState extends State<FlyerFeedScreen> {
  Map<HubType, HubData> _hubs = {};
  HubType? _selectedHub;
  List<FlyerListItem> _flyers = [];
  bool _isLoading = true;
  double _radius = 2000;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    await _loadHubs();
    await _loadFlyers();
  }

  Future<void> _loadHubs() async {
    try {
      final hubs = await UserService.getHubs();
      setState(() {
        _hubs = hubs;
      });
    } catch (e) {
      // Handle error
    }
  }

  Future<void> _loadFlyers() async {
    setState(() => _isLoading = true);

    try {
      final flyers = await FlyerService.getFlyers(
        hubType: _selectedHub,
        radius: _radius,
      );

      setState(() {
        _flyers = flyers;
      });
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('전단지 로드 실패: ${e.toString()}')),
      );
    } finally {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('타운인'),
        actions: [
          IconButton(
            icon: Icon(Icons.settings),
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => SettingsScreen()),
              );
            },
          ),
        ],
      ),
      body: Column(
        children: [
          // Hub Selector
          HubSelector(
            selectedHub: _selectedHub,
            hubs: _hubs,
            onChanged: (hub) {
              setState(() => _selectedHub = hub);
              _loadFlyers();
            },
          ),

          // Flyer Feed
          Expanded(
            child: _isLoading
                ? _buildSkeletonLoading()
                : _flyers.isEmpty
                    ? _buildEmptyState()
                    : RefreshIndicator(
                        onRefresh: _loadFlyers,
                        child: ListView.builder(
                          padding: EdgeInsets.all(16),
                          itemCount: _flyers.length,
                          itemBuilder: (context, index) {
                            return Padding(
                              padding: EdgeInsets.only(bottom: 16),
                              child: FlyerCard(
                                flyer: _flyers[index],
                                onTap: () => _openFlyerDetail(_flyers[index]),
                              ),
                            );
                          },
                        ),
                      ),
          ),
        ],
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: 0,
        onTap: (index) {
          if (index == 1) {
            Navigator.push(
              context,
              MaterialPageRoute(builder: (context) => FlyerMapView()),
            );
          }
        },
        items: [
          BottomNavigationBarItem(
            icon: Icon(Icons.view_list),
            label: '리스트',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.map),
            label: '지도',
          ),
        ],
      ),
    );
  }

  Widget _buildSkeletonLoading() {
    return ListView.builder(
      padding: EdgeInsets.all(16),
      itemCount: 5,
      itemBuilder: (context, index) {
        return Padding(
          padding: EdgeInsets.only(bottom: 16),
          child: _FlyerCardSkeleton(),
        );
      },
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.note_alt_outlined,
            size: 80,
            color: Colors.grey.shade400,
          ),
          SizedBox(height: 16),
          Text(
            '주변에 전단지가 없습니다',
            style: TextStyle(fontSize: 18, color: Colors.grey.shade600),
          ),
          SizedBox(height: 8),
          Text(
            '다른 거점을 선택하거나 반경을 넓혀보세요',
            style: TextStyle(fontSize: 14, color: Colors.grey.shade500),
          ),
        ],
      ),
    );
  }

  void _openFlyerDetail(FlyerListItem flyer) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => FlyerDetailScreen(flyerId: flyer.id),
      ),
    );
  }
}

// Flyer Card Component
class FlyerCard extends StatelessWidget {
  final FlyerListItem flyer;
  final VoidCallback onTap;

  const FlyerCard({
    required this.flyer,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 2,
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: onTap,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Flyer Image
            AspectRatio(
              aspectRatio: 16 / 9,
              child: Stack(
                children: [
                  Image.network(
                    flyer.imageUrl,
                    width: double.infinity,
                    fit: BoxFit.cover,
                    loadingBuilder: (context, child, loadingProgress) {
                      if (loadingProgress == null) return child;
                      return Container(
                        color: Colors.grey.shade200,
                        child: Center(child: CircularProgressIndicator()),
                      );
                    },
                    errorBuilder: (context, error, stackTrace) {
                      return Container(
                        color: Colors.grey.shade300,
                        child: Center(
                          child: Icon(Icons.broken_image, size: 48, color: Colors.grey),
                        ),
                      );
                    },
                  ),

                  // Discount Badge
                  if (flyer.discountRate != null)
                    Positioned(
                      top: 12,
                      right: 12,
                      child: Container(
                        padding: EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        decoration: BoxDecoration(
                          color: Colors.red,
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                          '${flyer.discountRate}% OFF',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ),
                ],
              ),
            ),

            // Flyer Info
            Padding(
              padding: EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Title
                  Text(
                    flyer.title,
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),

                  SizedBox(height: 8),

                  // Meta info
                  Row(
                    children: [
                      Icon(Icons.store, size: 16, color: Colors.grey.shade600),
                      SizedBox(width: 4),
                      Expanded(
                        child: Text(
                          flyer.merchantName,
                          style: TextStyle(fontSize: 14, color: Colors.grey.shade700),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),

                  SizedBox(height: 4),

                  Row(
                    children: [
                      Icon(Icons.location_on, size: 16, color: Colors.grey.shade600),
                      SizedBox(width: 4),
                      Text(
                        '${flyer.distance.toStringAsFixed(1)}km',
                        style: TextStyle(fontSize: 14, color: Colors.grey.shade600),
                      ),
                      SizedBox(width: 12),
                      Container(
                        padding: EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                        decoration: BoxDecoration(
                          color: _getCategoryColor(flyer.category).withOpacity(0.1),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                          _getCategoryLabel(flyer.category),
                          style: TextStyle(
                            fontSize: 12,
                            color: _getCategoryColor(flyer.category),
                          ),
                        ),
                      ),
                    ],
                  ),

                  SizedBox(height: 8),

                  // Points & Bookmark
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          Icon(Icons.monetization_on, size: 16, color: Color(0xFFF5A623)),
                          SizedBox(width: 4),
                          Text(
                            '25P 적립',
                            style: TextStyle(
                              fontSize: 14,
                              color: Color(0xFFF5A623),
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ],
                      ),
                      IconButton(
                        icon: Icon(
                          flyer.isBookmarked ? Icons.favorite : Icons.favorite_border,
                          color: flyer.isBookmarked ? Colors.red : Colors.grey,
                        ),
                        onPressed: () {
                          // Handle bookmark
                        },
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Color _getCategoryColor(String category) {
    switch (category) {
      case 'FOOD_DINING':
        return Color(0xFFFF6B6B);
      case 'SHOPPING':
        return Color(0xFF4ECDC4);
      case 'HEALTH_BEAUTY':
        return Color(0xFFFF85A2);
      default:
        return Colors.grey;
    }
  }

  String _getCategoryLabel(String category) {
    switch (category) {
      case 'FOOD_DINING':
        return '음식';
      case 'SHOPPING':
        return '쇼핑';
      case 'HEALTH_BEAUTY':
        return '건강';
      default:
        return '기타';
    }
  }
}

// Skeleton Loading
class _FlyerCardSkeleton extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Card(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            height: 180,
            color: Colors.grey.shade200,
          ),
          Padding(
            padding: EdgeInsets.all(12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  width: double.infinity,
                  height: 16,
                  color: Colors.grey.shade200,
                ),
                SizedBox(height: 8),
                Container(
                  width: 200,
                  height: 14,
                  color: Colors.grey.shade200,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// Flyer List Item Model
class FlyerListItem {
  final String id;
  final String title;
  final String imageUrl;
  final String merchantName;
  final String category;
  final double distance; // in km
  final int? discountRate;
  final bool isBookmarked;

  FlyerListItem({
    required this.id,
    required this.title,
    required this.imageUrl,
    required this.merchantName,
    required this.category,
    required this.distance,
    this.discountRate,
    this.isBookmarked = false,
  });

  factory FlyerListItem.fromJson(Map<String, dynamic> json) {
    return FlyerListItem(
      id: json['id'],
      title: json['title'],
      imageUrl: json['imageUrl'],
      merchantName: json['merchant']['name'],
      category: json['category'],
      distance: json['distance'],
      discountRate: json['discountRate'],
      isBookmarked: json['isBookmarked'] ?? false,
    );
  }
}

// Backend: Get Flyers Endpoint
@Get()
@UseGuards(OptionalJwtAuthGuard)
async getFlyers(
  @Query() query: GetFlyersQueryDto,
  @Req() req,
) {
  const userId = req.user?.id;

  let flyers: Flyer[];
  let total: number;

  if (userId && query.hubType) {
    // Hub-based query
    [flyers, total] = await this.flyerService.getFlyersByHub(
      userId,
      query.hubType,
      query.radius || 2000,
      {
        limit: query.limit || 20,
        offset: query.offset || 0,
        sort: query.sort || 'createdAt',
      },
    );
  } else {
    // Public query
    [flyers, total] = await this.flyerService.getPublicFlyers({
      limit: query.limit || 20,
      offset: query.offset || 0,
    });
  }

  // Enrich with distance and bookmark status
  const enrichedFlyers = await Promise.all(
    flyers.map(async (flyer) => {
      let distance = null;
      let isBookmarked = false;

      if (userId) {
        const user = await this.userRepo.findOne({ where: { id: userId } });

        // Calculate distance based on selected hub
        if (query.hubType === 'home' && user.homeH3Index) {
          distance = this.h3Service.getDistanceBetweenH3Cells(
            user.homeH3Index,
            flyer.gridCellH3Index,
          );
        } else if (query.hubType === 'work' && user.workH3Index) {
          distance = this.h3Service.getDistanceBetweenH3Cells(
            user.workH3Index,
            flyer.gridCellH3Index,
          );
        }

        // Check bookmark
        const bookmark = await this.bookmarkRepo.findOne({
          where: { userId, flyerId: flyer.id },
        });
        isBookmarked = !!bookmark;
      }

      return {
        ...flyer,
        distance,
        isBookmarked,
      };
    }),
  );

  return {
    items: enrichedFlyers,
    total,
  };
}

// H3 Distance Helper
getDistanceBetweenH3Cells(h3Index1: string, h3Index2: string): number {
  const [lat1, lng1] = cellToLatLng(h3Index1);
  const [lat2, lng2] = cellToLatLng(h3Index2);

  return this.getDistanceBetweenCoords(lat1, lng1, lat2, lng2);
}

getDistanceBetweenCoords(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371; // Earth radius in km
  const dLat = this.deg2rad(lat2 - lat1);
  const dLng = this.deg2rad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(this.deg2rad(lat1)) *
      Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}
```

## Dependencies

- **Depends on**: USR-002 (3-Hub Setup), CORE-002 (Geospatial)
- **Blocks**: USR-007-02, USR-007-03

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Feed UI implemented
- [ ] Card component working
- [ ] Skeleton loading working
- [ ] Empty state working
- [ ] Pull-to-refresh working
- [ ] Backend API working
- [ ] Distance calculation working
- [ ] Tests passing
- [ ] Code reviewed and merged

## Notes

- 카드 레이아웃으로 시각적 브라우징
- 이미지는 CDN에서 제공 (lazy loading)
- 거리는 H3 cell 간 거리 계산
- 기본 정렬: 최신순 (createdAt DESC)
- Skeleton은 5개 표시
- Empty state는 거점 변경 유도
- Pull-to-refresh로 최신 전단지 갱신
