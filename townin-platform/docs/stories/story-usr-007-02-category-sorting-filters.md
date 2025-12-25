# Story USR-007-02: Category & Sorting Filters

**Epic**: USR-007 Digital Flyer Viewer
**Priority**: P0 (Critical)
**Story Points**: 3
**Status**: 📋 Planned

## User Story

**As a** user
**I want to** filter and sort flyers
**So that** I can find relevant offers quickly

## Acceptance Criteria

- [ ] 카테고리 탭 (전체, 음식, 쇼핑, 건강, 서비스 등)
- [ ] 정렬 드롭다운 (최신순, 거리순, 인기순)
- [ ] 필터 적용 시 즉시 반영
- [ ] 선택된 필터 표시
- [ ] 필터 조합 가능

## Tasks

### Frontend
- [ ] Category tabs UI
- [ ] Sort dropdown UI
- [ ] Filter state management
- [ ] Apply filter logic

### Backend
- [ ] Category filter implementation
- [ ] Sort logic (createdAt, distance, clickCount)
- [ ] Query optimization

### Testing
- [ ] Unit tests: Filter logic
- [ ] Integration test: Filtered queries
- [ ] E2E test: Filter application

## Technical Notes

```typescript
// Category & Sort Filters (Flutter)
class FlyerFeedWithFilters extends StatefulWidget {
  @override
  _FlyerFeedWithFiltersState createState() => _FlyerFeedWithFiltersState();
}

class _FlyerFeedWithFiltersState extends State<FlyerFeedWithFilters> {
  FlyerCategory? _selectedCategory;
  SortOption _sortOption = SortOption.LATEST;
  List<FlyerListItem> _flyers = [];
  bool _isLoading = false;

  final List<CategoryTab> _categories = [
    CategoryTab(category: null, label: '전체', icon: Icons.all_inclusive),
    CategoryTab(category: FlyerCategory.FOOD_DINING, label: '음식', icon: Icons.restaurant),
    CategoryTab(category: FlyerCategory.SHOPPING, label: '쇼핑', icon: Icons.shopping_bag),
    CategoryTab(category: FlyerCategory.HEALTH_BEAUTY, label: '건강', icon: Icons.spa),
    CategoryTab(category: FlyerCategory.EDUCATION, label: '교육', icon: Icons.school),
    CategoryTab(category: FlyerCategory.SERVICES, label: '서비스', icon: Icons.build),
    CategoryTab(category: FlyerCategory.LEISURE_CULTURE, label: '여가', icon: Icons.movie),
  ];

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // Category Tabs
        Container(
          height: 60,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            padding: EdgeInsets.symmetric(horizontal: 16),
            itemCount: _categories.length,
            itemBuilder: (context, index) {
              final cat = _categories[index];
              final isSelected = _selectedCategory == cat.category;

              return Padding(
                padding: EdgeInsets.only(right: 8),
                child: FilterChip(
                  selected: isSelected,
                  label: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(cat.icon, size: 18),
                      SizedBox(width: 4),
                      Text(cat.label),
                    ],
                  ),
                  onSelected: (_) {
                    setState(() => _selectedCategory = cat.category);
                    _loadFlyers();
                  },
                  backgroundColor: Colors.grey.shade200,
                  selectedColor: Color(0xFFF5A623).withOpacity(0.2),
                  checkmarkColor: Color(0xFFF5A623),
                ),
              );
            },
          ),
        ),

        // Sort Options
        Padding(
          padding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          child: Row(
            children: [
              Text(
                '정렬',
                style: TextStyle(fontSize: 14, color: Colors.grey.shade700),
              ),
              SizedBox(width: 12),
              Expanded(
                child: DropdownButton<SortOption>(
                  value: _sortOption,
                  isExpanded: true,
                  underline: SizedBox.shrink(),
                  items: [
                    DropdownMenuItem(
                      value: SortOption.LATEST,
                      child: Row(
                        children: [
                          Icon(Icons.schedule, size: 18),
                          SizedBox(width: 8),
                          Text('최신순'),
                        ],
                      ),
                    ),
                    DropdownMenuItem(
                      value: SortOption.DISTANCE,
                      child: Row(
                        children: [
                          Icon(Icons.location_on, size: 18),
                          SizedBox(width: 8),
                          Text('거리순'),
                        ],
                      ),
                    ),
                    DropdownMenuItem(
                      value: SortOption.POPULAR,
                      child: Row(
                        children: [
                          Icon(Icons.trending_up, size: 18),
                          SizedBox(width: 8),
                          Text('인기순'),
                        ],
                      ),
                    ),
                  ],
                  onChanged: (value) {
                    if (value != null) {
                      setState(() => _sortOption = value);
                      _loadFlyers();
                    }
                  },
                ),
              ),
            ],
          ),
        ),

        Divider(height: 1),

        // Flyer List
        Expanded(
          child: _isLoading
              ? Center(child: CircularProgressIndicator())
              : ListView.builder(
                  padding: EdgeInsets.all(16),
                  itemCount: _flyers.length,
                  itemBuilder: (context, index) {
                    return Padding(
                      padding: EdgeInsets.only(bottom: 16),
                      child: FlyerCard(flyer: _flyers[index]),
                    );
                  },
                ),
        ),
      ],
    );
  }

  Future<void> _loadFlyers() async {
    setState(() => _isLoading = true);

    try {
      final flyers = await FlyerService.getFlyers(
        category: _selectedCategory,
        sort: _sortOption,
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
}

class CategoryTab {
  final FlyerCategory? category;
  final String label;
  final IconData icon;

  CategoryTab({
    required this.category,
    required this.label,
    required this.icon,
  });
}

enum FlyerCategory {
  FOOD_DINING,
  SHOPPING,
  HEALTH_BEAUTY,
  EDUCATION,
  SERVICES,
  LEISURE_CULTURE,
  HOUSEHOLD,
  OTHER,
}

enum SortOption {
  LATEST,
  DISTANCE,
  POPULAR,
}

// Flyer Service (Extended)
class FlyerService {
  static Future<List<FlyerListItem>> getFlyers({
    HubType? hubType,
    FlyerCategory? category,
    SortOption sort = SortOption.LATEST,
    double radius = 2000,
    int limit = 20,
    int offset = 0,
  }) async {
    final params = <String, dynamic>{
      'radius': radius,
      'limit': limit,
      'offset': offset,
    };

    if (hubType != null) {
      params['hubType'] = hubType.toString().split('.').last.toLowerCase();
    }

    if (category != null) {
      params['category'] = category.toString().split('.').last;
    }

    params['sort'] = _getSortParam(sort);

    final response = await dio.get('/flyers', queryParameters: params);

    return (response.data['items'] as List)
        .map((item) => FlyerListItem.fromJson(item))
        .toList();
  }

  static String _getSortParam(SortOption sort) {
    switch (sort) {
      case SortOption.LATEST:
        return 'createdAt';
      case SortOption.DISTANCE:
        return 'distance';
      case SortOption.POPULAR:
        return 'clickCount';
    }
  }
}

// Backend: Enhanced Flyer Query
@Get()
async getFlyers(@Query() query: GetFlyersQueryDto, @Req() req) {
  const userId = req.user?.id;

  const qb = this.flyerRepo
    .createQueryBuilder('f')
    .leftJoinAndSelect('f.merchant', 'm')
    .where('f.validFrom <= :now', { now: new Date() })
    .andWhere('f.validTo >= :now', { now: new Date() })
    .andWhere('f.status = :status', { status: 'published' });

  // Category filter
  if (query.category) {
    qb.andWhere('f.category = :category', { category: query.category });
  }

  // Hub-based filtering
  if (userId && query.hubType) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    let h3Index: string | null = null;

    if (query.hubType === 'home') h3Index = user.homeH3Index;
    else if (query.hubType === 'work') h3Index = user.workH3Index;
    else if (query.hubType === 'family') h3Index = user.familyH3Index;

    if (h3Index) {
      const radius = query.radius || 2000;
      const nearbyH3Cells = this.h3Service.getH3CellsInRadius(
        ...this.h3Service.h3ToLatLng(h3Index),
        radius,
      );

      qb.andWhere('f.gridCellH3Index IN (:...cells)', { cells: nearbyH3Cells });
    }
  }

  // Sorting
  switch (query.sort) {
    case 'createdAt':
      qb.orderBy('f.createdAt', 'DESC');
      break;
    case 'distance':
      // Distance sorting requires distance calculation
      if (userId && query.hubType) {
        // Pre-calculate distance in subquery or post-process
        qb.orderBy('f.createdAt', 'DESC'); // Fallback
      }
      break;
    case 'clickCount':
      qb.orderBy('f.clickCount', 'DESC');
      break;
    default:
      qb.orderBy('f.createdAt', 'DESC');
  }

  const [flyers, total] = await qb
    .take(query.limit || 20)
    .skip(query.offset || 0)
    .getManyAndCount();

  // Enrich with distance
  const enrichedFlyers = await this.enrichFlyersWithUserData(
    flyers,
    userId,
    query.hubType,
  );

  // If sorting by distance, sort in-memory
  if (query.sort === 'distance' && enrichedFlyers[0]?.distance != null) {
    enrichedFlyers.sort((a, b) => a.distance - b.distance);
  }

  return {
    items: enrichedFlyers,
    total,
  };
}

// Query DTO (Enhanced)
export class GetFlyersQueryDto {
  @IsOptional()
  @IsEnum(['home', 'work', 'family'])
  hubType?: string;

  @IsOptional()
  @IsEnum(FlyerCategory)
  category?: FlyerCategory;

  @IsOptional()
  @IsEnum(['createdAt', 'distance', 'clickCount'])
  sort?: string;

  @IsOptional()
  @IsNumber()
  @Min(500)
  @Max(10000)
  radius?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  offset?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;
}

export enum FlyerCategory {
  FOOD_DINING = 'FOOD_DINING',
  SHOPPING = 'SHOPPING',
  HEALTH_BEAUTY = 'HEALTH_BEAUTY',
  EDUCATION = 'EDUCATION',
  SERVICES = 'SERVICES',
  LEISURE_CULTURE = 'LEISURE_CULTURE',
  HOUSEHOLD = 'HOUSEHOLD',
  OTHER = 'OTHER',
}
```

## Dependencies

- **Depends on**: USR-007-01 (Flyer Feed)
- **Blocks**: None

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Category tabs implemented
- [ ] Sort dropdown implemented
- [ ] Filter state management working
- [ ] Backend filtering working
- [ ] Backend sorting working
- [ ] Query optimization complete
- [ ] Tests passing
- [ ] Code reviewed and merged

## Notes

- 카테고리는 수평 스크롤 탭
- 정렬은 드롭다운
- 필터 조합 가능 (카테고리 + 정렬)
- 기본 카테고리: 전체
- 기본 정렬: 최신순
- 인기순은 clickCount 기준
- 거리순은 in-memory 정렬 (성능 고려)
- 필터 변경 시 즉시 쿼리
