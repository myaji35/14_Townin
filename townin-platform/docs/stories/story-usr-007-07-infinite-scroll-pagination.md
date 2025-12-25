# Story USR-007-07: Infinite Scroll Pagination

**Epic**: USR-007 Digital Flyer Viewer
**Priority**: P0 (Critical)
**Story Points**: 3
**Status**: 📋 Planned

## User Story

**As a** user
**I want to** scroll endlessly through flyers
**So that** I can discover more offers

## Acceptance Criteria

- [ ] 무한 스크롤 구현
- [ ] 20개씩 로드
- [ ] 로딩 인디케이터
- [ ] 끝 도달 시 메시지
- [ ] 성능 최적화 (메모리 관리)
- [ ] 스크롤 위치 복원

## Tasks

### Frontend
- [ ] Infinite scroll component
- [ ] Intersection Observer
- [ ] Load more logic
- [ ] End of list detection
- [ ] Scroll position restoration

### Backend
- [ ] Pagination support (limit, offset)
- [ ] hasMore flag
- [ ] Query optimization

### Testing
- [ ] Unit tests: Pagination logic
- [ ] Integration test: Load more
- [ ] E2E test: Infinite scroll

## Technical Notes

```typescript
// Infinite Scroll Flyer Feed (Flutter)
class InfiniteScrollFlyerFeed extends StatefulWidget {
  @override
  _InfiniteScrollFlyerFeedState createState() => _InfiniteScrollFlyerFeedState();
}

class _InfiniteScrollFlyerFeedState extends State<InfiniteScrollFlyerFeed> {
  final ScrollController _scrollController = ScrollController();
  List<FlyerListItem> _flyers = [];
  bool _isLoading = false;
  bool _isLoadingMore = false;
  bool _hasMore = true;
  int _page = 0;
  final int _limit = 20;

  HubType? _selectedHub;
  FlyerCategory? _selectedCategory;
  SortOption _sortOption = SortOption.LATEST;

  @override
  void initState() {
    super.initState();
    _loadFlyers();
    _scrollController.addListener(_onScroll);
  }

  Future<void> _loadFlyers({bool refresh = false}) async {
    if (refresh) {
      setState(() {
        _page = 0;
        _flyers.clear();
        _hasMore = true;
      });
    }

    setState(() => _isLoading = true);

    try {
      final response = await FlyerService.getFlyersPaginated(
        hubType: _selectedHub,
        category: _selectedCategory,
        sort: _sortOption,
        limit: _limit,
        offset: _page * _limit,
      );

      setState(() {
        if (refresh) {
          _flyers = response.items;
        } else {
          _flyers.addAll(response.items);
        }
        _hasMore = response.hasMore;
        _page++;
      });
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('전단지 로드 실패: ${e.toString()}')),
      );
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _loadMore() async {
    if (_isLoadingMore || !_hasMore) return;

    setState(() => _isLoadingMore = true);

    try {
      final response = await FlyerService.getFlyersPaginated(
        hubType: _selectedHub,
        category: _selectedCategory,
        sort: _sortOption,
        limit: _limit,
        offset: _page * _limit,
      );

      setState(() {
        _flyers.addAll(response.items);
        _hasMore = response.hasMore;
        _page++;
      });
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('더 불러오기 실패')),
      );
    } finally {
      setState(() => _isLoadingMore = false);
    }
  }

  void _onScroll() {
    if (_scrollController.position.pixels >=
        _scrollController.position.maxScrollExtent - 200) {
      _loadMore();
    }
  }

  @override
  Widget build(BuildContext context) {
    return RefreshIndicator(
      onRefresh: () => _loadFlyers(refresh: true),
      child: ListView.builder(
        controller: _scrollController,
        padding: EdgeInsets.all(16),
        itemCount: _flyers.length + (_hasMore ? 1 : 1), // +1 for footer
        itemBuilder: (context, index) {
          // Flyer cards
          if (index < _flyers.length) {
            return Padding(
              padding: EdgeInsets.only(bottom: 16),
              child: FlyerCard(
                flyer: _flyers[index],
                onTap: () => _openFlyerDetail(_flyers[index]),
              ),
            );
          }

          // Loading more indicator
          if (_hasMore) {
            return Padding(
              padding: EdgeInsets.symmetric(vertical: 32),
              child: Center(
                child: CircularProgressIndicator(),
              ),
            );
          }

          // End of list
          return Padding(
            padding: EdgeInsets.symmetric(vertical: 32),
            child: Center(
              child: Column(
                children: [
                  Icon(Icons.check_circle, size: 48, color: Colors.grey.shade400),
                  SizedBox(height: 12),
                  Text(
                    '모든 전단지를 확인했습니다',
                    style: TextStyle(
                      fontSize: 16,
                      color: Colors.grey.shade600,
                    ),
                  ),
                ],
              ),
            ),
          );
        },
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

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }
}

// Pagination Response Model
class PaginatedFlyersResponse {
  final List<FlyerListItem> items;
  final int total;
  final bool hasMore;
  final int currentPage;

  PaginatedFlyersResponse({
    required this.items,
    required this.total,
    required this.hasMore,
    required this.currentPage,
  });

  factory PaginatedFlyersResponse.fromJson(Map<String, dynamic> json) {
    final items = (json['items'] as List)
        .map((item) => FlyerListItem.fromJson(item))
        .toList();

    final total = json['total'];
    final currentOffset = json['offset'] ?? 0;
    final limit = json['limit'] ?? 20;
    final hasMore = (currentOffset + items.length) < total;

    return PaginatedFlyersResponse(
      items: items,
      total: total,
      hasMore: hasMore,
      currentPage: (currentOffset / limit).floor(),
    );
  }
}

// Flyer Service (Extended)
class FlyerService {
  static Future<PaginatedFlyersResponse> getFlyersPaginated({
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

    return PaginatedFlyersResponse.fromJson(response.data);
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

// Alternative: Using infinite_scroll_pagination package
import 'package:infinite_scroll_pagination/infinite_scroll_pagination.dart';

class InfiniteScrollFlyerFeedWithPackage extends StatefulWidget {
  @override
  _InfiniteScrollFlyerFeedWithPackageState createState() =>
      _InfiniteScrollFlyerFeedWithPackageState();
}

class _InfiniteScrollFlyerFeedWithPackageState
    extends State<InfiniteScrollFlyerFeedWithPackage> {
  final PagingController<int, FlyerListItem> _pagingController =
      PagingController(firstPageKey: 0);

  final int _pageSize = 20;

  @override
  void initState() {
    super.initState();
    _pagingController.addPageRequestListener((pageKey) {
      _fetchPage(pageKey);
    });
  }

  Future<void> _fetchPage(int pageKey) async {
    try {
      final newItems = await FlyerService.getFlyersPaginated(
        offset: pageKey,
        limit: _pageSize,
      );

      final isLastPage = newItems.items.length < _pageSize;

      if (isLastPage) {
        _pagingController.appendLastPage(newItems.items);
      } else {
        final nextPageKey = pageKey + newItems.items.length;
        _pagingController.appendPage(newItems.items, nextPageKey);
      }
    } catch (error) {
      _pagingController.error = error;
    }
  }

  @override
  Widget build(BuildContext context) {
    return PagedListView<int, FlyerListItem>(
      pagingController: _pagingController,
      padding: EdgeInsets.all(16),
      builderDelegate: PagedChildBuilderDelegate<FlyerListItem>(
        itemBuilder: (context, item, index) => Padding(
          padding: EdgeInsets.only(bottom: 16),
          child: FlyerCard(flyer: item),
        ),
        firstPageErrorIndicatorBuilder: (context) => Center(
          child: Text('오류가 발생했습니다'),
        ),
        noItemsFoundIndicatorBuilder: (context) => Center(
          child: Text('전단지가 없습니다'),
        ),
        newPageProgressIndicatorBuilder: (context) => Center(
          child: CircularProgressIndicator(),
        ),
      ),
    );
  }

  @override
  void dispose() {
    _pagingController.dispose();
    super.dispose();
  }
}

// Backend: Pagination Response (already implemented)
@Get()
async getFlyers(@Query() query: GetFlyersQueryDto, @Req() req) {
  // ... existing implementation

  const [flyers, total] = await qb
    .take(query.limit || 20)
    .skip(query.offset || 0)
    .getManyAndCount();

  return {
    items: flyers,
    total,
    limit: query.limit || 20,
    offset: query.offset || 0,
  };
}
```

## Dependencies

- **Depends on**: USR-007-01 (Flyer Feed)
- **Optional**: infinite_scroll_pagination package
- **Blocks**: None

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Infinite scroll implemented
- [ ] Load more working
- [ ] Loading indicators working
- [ ] End of list detection working
- [ ] Memory optimization done
- [ ] Backend pagination working
- [ ] Tests passing
- [ ] Code reviewed and merged

## Notes

- 기본 구현 또는 infinite_scroll_pagination 패키지 사용
- 20개씩 로드 (성능 고려)
- 스크롤 200px 전 미리 로드 (끊김 방지)
- hasMore flag로 끝 감지
- Pull-to-refresh로 새로고침
- 메모리 관리를 위해 일정 개수 초과 시 상단 항목 제거 (선택)
- 스크롤 위치는 자동 복원 (Flutter 기본)
- 로딩 중 중복 요청 방지
