# Story USR-002-05: Hub-Based Content Filtering

**Epic**: USR-002 3-Hub Location Setup
**Priority**: P0 (Critical)
**Story Points**: 3
**Status**: 📋 Planned

## User Story

**As a** user
**I want to** see flyers near my hubs
**So that** I get relevant local information

## Acceptance Criteria

- [ ] Hub 선택 드롭다운
- [ ] 선택한 Hub 기준 콘텐츠 필터링
- [ ] 반경 설정 (기본 2km)
- [ ] Hub별 전단지 개수 표시
- [ ] 전체 Hub 통합 보기
- [ ] 거점 미설정 시 안내 메시지

## Tasks

### Frontend
- [ ] Hub selector dropdown
- [ ] Content filtering logic
- [ ] Radius slider
- [ ] Flyer count badge
- [ ] Empty state UI

### Backend
- [ ] GET /flyers?hubType=&radius= endpoint
- [ ] Spatial query optimization
- [ ] Multi-hub query support

### Testing
- [ ] Unit tests: Filter logic
- [ ] Integration test: Hub filtering
- [ ] E2E test: Content filtering

## Technical Notes

```typescript
// Hub Selector Component (Flutter)
class HubSelector extends StatelessWidget {
  final HubType? selectedHub;
  final Map<HubType, HubData> hubs;
  final ValueChanged<HubType?> onChanged;

  const HubSelector({
    required this.selectedHub,
    required this.hubs,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    if (hubs.isEmpty) {
      return Container(
        padding: EdgeInsets.all(16),
        color: Colors.orange.shade50,
        child: Row(
          children: [
            Icon(Icons.info_outline, color: Color(0xFFF5A623)),
            SizedBox(width: 12),
            Expanded(
              child: Text(
                '거점을 설정하면 주변 정보를 받을 수 있어요',
                style: TextStyle(fontSize: 14),
              ),
            ),
            TextButton(
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => HubSetupScreen()),
                );
              },
              child: Text('설정하기'),
            ),
          ],
        ),
      );
    }

    return Container(
      padding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: DropdownButton<HubType?>(
        value: selectedHub,
        isExpanded: true,
        icon: Icon(Icons.arrow_drop_down),
        underline: SizedBox.shrink(),
        items: [
          DropdownMenuItem(
            value: null,
            child: Row(
              children: [
                Icon(Icons.all_inclusive, color: Color(0xFFF5A623)),
                SizedBox(width: 12),
                Text('전체 거점', style: TextStyle(fontWeight: FontWeight.w500)),
              ],
            ),
          ),
          ...hubs.entries.map((entry) {
            return DropdownMenuItem(
              value: entry.key,
              child: Row(
                children: [
                  Icon(_getHubIcon(entry.key), color: Color(0xFFF5A623)),
                  SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          _getHubLabel(entry.key),
                          style: TextStyle(fontWeight: FontWeight.w500),
                        ),
                        Text(
                          entry.value.address,
                          style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            );
          }),
        ],
        onChanged: onChanged,
      ),
    );
  }

  IconData _getHubIcon(HubType type) {
    switch (type) {
      case HubType.HOME:
        return Icons.home;
      case HubType.WORK:
        return Icons.business;
      case HubType.FAMILY:
        return Icons.family_restroom;
    }
  }

  String _getHubLabel(HubType type) {
    switch (type) {
      case HubType.HOME:
        return '집';
      case HubType.WORK:
        return '회사';
      case HubType.FAMILY:
        return '본가';
    }
  }
}

// Dashboard with Hub Filtering
class DashboardScreen extends StatefulWidget {
  @override
  _DashboardScreenState createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  Map<HubType, HubData> _hubs = {};
  HubType? _selectedHub;
  double _radius = 2000; // 2km default
  List<Flyer> _flyers = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadHubs();
  }

  Future<void> _loadHubs() async {
    try {
      final hubs = await UserService.getHubs();
      setState(() {
        _hubs = hubs;
      });
      _loadFlyers();
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('거점 로드 실패: ${e.toString()}')),
      );
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
                MaterialPageRoute(builder: (context) => HubManagementScreen()),
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

          // Radius Slider
          if (_hubs.isNotEmpty)
            Padding(
              padding: EdgeInsets.symmetric(horizontal: 16),
              child: Row(
                children: [
                  Icon(Icons.location_on, size: 20, color: Colors.grey),
                  SizedBox(width: 8),
                  Expanded(
                    child: Slider(
                      value: _radius,
                      min: 500,
                      max: 5000,
                      divisions: 9,
                      label: '${(_radius / 1000).toStringAsFixed(1)}km',
                      onChanged: (value) {
                        setState(() => _radius = value);
                      },
                      onChangeEnd: (value) {
                        _loadFlyers();
                      },
                    ),
                  ),
                  Text(
                    '${(_radius / 1000).toStringAsFixed(1)}km',
                    style: TextStyle(fontSize: 14, color: Colors.grey.shade700),
                  ),
                ],
              ),
            ),

          Divider(),

          // Flyer List
          Expanded(
            child: _isLoading
                ? Center(child: CircularProgressIndicator())
                : _flyers.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.note_alt_outlined, size: 64, color: Colors.grey),
                            SizedBox(height: 16),
                            Text(
                              '전단지가 없습니다',
                              style: TextStyle(fontSize: 16, color: Colors.grey),
                            ),
                          ],
                        ),
                      )
                    : RefreshIndicator(
                        onRefresh: _loadFlyers,
                        child: ListView.builder(
                          itemCount: _flyers.length,
                          itemBuilder: (context, index) {
                            return FlyerCard(flyer: _flyers[index]);
                          },
                        ),
                      ),
          ),
        ],
      ),
    );
  }
}

// Flyer Service
class FlyerService {
  static Future<List<Flyer>> getFlyers({
    HubType? hubType,
    double radius = 2000,
  }) async {
    final params = <String, dynamic>{
      'radius': radius,
    };

    if (hubType != null) {
      params['hubType'] = hubType.toString().split('.').last.toLowerCase();
    }

    final response = await dio.get('/flyers', queryParameters: params);

    return (response.data['items'] as List)
        .map((item) => Flyer.fromJson(item))
        .toList();
  }
}

// Backend: Hub-Based Flyer Query
@Get()
@UseGuards(OptionalJwtAuthGuard)
async getFlyers(
  @Query() query: GetFlyersQueryDto,
  @Req() req,
) {
  const userId = req.user?.id;

  // If no user or no hub specified, return general flyers
  if (!userId) {
    return this.flyerService.getPublicFlyers(query);
  }

  const user = await this.userRepo.findOne({
    where: { id: userId },
    relations: ['homeRegion', 'workRegion', 'familyRegion'],
  });

  let h3Indices: string[] = [];

  // Get H3 indices based on hub selection
  if (query.hubType === 'home' && user.homeH3Index) {
    h3Indices = [user.homeH3Index];
  } else if (query.hubType === 'work' && user.workH3Index) {
    h3Indices = [user.workH3Index];
  } else if (query.hubType === 'family' && user.familyH3Index) {
    h3Indices = [user.familyH3Index];
  } else if (!query.hubType) {
    // All hubs
    if (user.homeH3Index) h3Indices.push(user.homeH3Index);
    if (user.workH3Index) h3Indices.push(user.workH3Index);
    if (user.familyH3Index) h3Indices.push(user.familyH3Index);
  }

  if (h3Indices.length === 0) {
    return { items: [], total: 0 };
  }

  // Get neighboring cells within radius
  const radius = query.radius || 2000; // meters
  const allH3Cells = new Set<string>();

  for (const h3Index of h3Indices) {
    const [lat, lng] = this.h3Service.h3ToLatLng(h3Index);
    const neighbors = this.h3Service.getH3CellsInRadius(lat, lng, radius);
    neighbors.forEach(cell => allH3Cells.add(cell));
  }

  // Query flyers in these cells
  const flyers = await this.flyerRepo
    .createQueryBuilder('f')
    .leftJoinAndSelect('f.merchant', 'm')
    .where('f.gridCellId IN (:...cells)', {
      cells: Array.from(allH3Cells),
    })
    .andWhere('f.validFrom <= :now', { now: new Date() })
    .andWhere('f.validTo >= :now', { now: new Date() })
    .andWhere('f.status = :status', { status: 'published' })
    .orderBy('f.publishedAt', 'DESC')
    .take(query.limit || 20)
    .skip(query.offset || 0)
    .getManyAndCount();

  return {
    items: flyers[0],
    total: flyers[1],
  };
}

// Get H3 Cells in Radius Helper
getH3CellsInRadius(lat: number, lng: number, radiusMeters: number): string[] {
  const h3Index = this.latLngToH3(lat, lng);
  const kRing = gridDisk(h3Index, this.getKRingSize(radiusMeters));
  return kRing;
}

getKRingSize(radiusMeters: number): number {
  // H3 resolution 9: ~500m per cell
  // Approximate k-ring size based on radius
  if (radiusMeters <= 500) return 0;
  if (radiusMeters <= 1000) return 1;
  if (radiusMeters <= 2000) return 2;
  if (radiusMeters <= 3000) return 3;
  if (radiusMeters <= 5000) return 5;
  return 7;
}

// Query DTO
export class GetFlyersQueryDto {
  @IsOptional()
  @IsEnum(['home', 'work', 'family'])
  hubType?: string;

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
```

## Dependencies

- **Depends on**: USR-002-01, USR-002-04, USR-007 (Flyer Viewer)
- **Blocks**: None

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Hub selector implemented
- [ ] Radius slider implemented
- [ ] Content filtering working
- [ ] Multi-hub query working
- [ ] K-ring spatial query optimized
- [ ] Empty state handled
- [ ] Tests passing
- [ ] Code reviewed and merged

## Notes

- 기본 반경: 2km
- 최소 반경: 500m, 최대: 5km
- H3 k-ring을 사용한 공간 쿼리
- 전체 거점 선택 시 3개 Hub 모두의 범위 검색
- 거점 미설정 시 안내 메시지와 설정 버튼
- Flyer는 GridCell에 매핑되어 있어야 함
- 유효기간 내 flyer만 표시
- Published 상태만 표시
