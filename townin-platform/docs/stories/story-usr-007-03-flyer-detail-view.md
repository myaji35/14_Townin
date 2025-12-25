# Story USR-007-03: Flyer Detail View

**Epic**: USR-007 Digital Flyer Viewer
**Priority**: P0 (Critical)
**Story Points**: 4
**Status**: 📋 Planned

## User Story

**As a** user
**I want to** see detailed flyer information
**So that** I can understand the offer

## Acceptance Criteria

- [ ] 전단지 상세 모달/페이지
- [ ] 이미지 전체 크기 표시
- [ ] 상점 정보 (이름, 주소, 거리)
- [ ] 전단지 설명
- [ ] 유효 기간 표시
- [ ] 카테고리 배지
- [ ] 조회수 표시
- [ ] 공유 버튼
- [ ] 북마크 버튼

## Tasks

### Frontend
- [ ] Flyer detail screen
- [ ] Image viewer (pinch-zoom)
- [ ] Merchant info section
- [ ] Action buttons (bookmark, share)
- [ ] Loading state

### Backend
- [ ] GET /flyers/:id endpoint
- [ ] Increment viewCount
- [ ] Include merchant details
- [ ] Include bookmark status

### Testing
- [ ] Unit tests: View count increment
- [ ] Integration test: Detail fetch
- [ ] E2E test: View flyer detail

## Technical Notes

```typescript
// Flyer Detail Screen (Flutter)
class FlyerDetailScreen extends StatefulWidget {
  final String flyerId;

  const FlyerDetailScreen({required this.flyerId});

  @override
  _FlyerDetailScreenState createState() => _FlyerDetailScreenState();
}

class _FlyerDetailScreenState extends State<FlyerDetailScreen> {
  FlyerDetail? _flyer;
  bool _isLoading = true;
  bool _isBookmarked = false;

  @override
  void initState() {
    super.initState();
    _loadFlyerDetail();
  }

  Future<void> _loadFlyerDetail() async {
    setState(() => _isLoading = true);

    try {
      final flyer = await FlyerService.getFlyerDetail(widget.flyerId);
      setState(() {
        _flyer = flyer;
        _isBookmarked = flyer.isBookmarked;
      });
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('전단지 로드 실패: ${e.toString()}')),
      );
      Navigator.pop(context);
    } finally {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _isLoading
          ? Center(child: CircularProgressIndicator())
          : CustomScrollView(
              slivers: [
                // App Bar with Image
                SliverAppBar(
                  expandedHeight: 300,
                  pinned: true,
                  flexibleSpace: FlexibleSpaceBar(
                    background: GestureDetector(
                      onTap: _viewFullImage,
                      child: Image.network(
                        _flyer!.imageUrl,
                        fit: BoxFit.cover,
                        errorBuilder: (context, error, stackTrace) {
                          return Container(
                            color: Colors.grey.shade300,
                            child: Center(
                              child: Icon(Icons.broken_image, size: 64),
                            ),
                          );
                        },
                      ),
                    ),
                  ),
                  actions: [
                    IconButton(
                      icon: Icon(Icons.share),
                      onPressed: _shareFlyer,
                    ),
                    IconButton(
                      icon: Icon(
                        _isBookmarked ? Icons.favorite : Icons.favorite_border,
                        color: _isBookmarked ? Colors.red : null,
                      ),
                      onPressed: _toggleBookmark,
                    ),
                  ],
                ),

                // Content
                SliverToBoxAdapter(
                  child: Padding(
                    padding: EdgeInsets.all(20),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Category Badge & Views
                        Row(
                          children: [
                            Container(
                              padding: EdgeInsets.symmetric(
                                horizontal: 12,
                                vertical: 6,
                              ),
                              decoration: BoxDecoration(
                                color: _getCategoryColor(_flyer!.category)
                                    .withOpacity(0.1),
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: Text(
                                _getCategoryLabel(_flyer!.category),
                                style: TextStyle(
                                  fontSize: 14,
                                  color: _getCategoryColor(_flyer!.category),
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            ),
                            Spacer(),
                            Icon(Icons.visibility, size: 16, color: Colors.grey),
                            SizedBox(width: 4),
                            Text(
                              '${_flyer!.viewCount}',
                              style: TextStyle(fontSize: 14, color: Colors.grey),
                            ),
                          ],
                        ),

                        SizedBox(height: 16),

                        // Title
                        Text(
                          _flyer!.title,
                          style: TextStyle(
                            fontSize: 24,
                            fontWeight: FontWeight.bold,
                          ),
                        ),

                        SizedBox(height: 16),

                        // Description
                        if (_flyer!.description != null) ...[
                          Text(
                            _flyer!.description!,
                            style: TextStyle(
                              fontSize: 16,
                              height: 1.5,
                              color: Colors.grey.shade800,
                            ),
                          ),
                          SizedBox(height: 24),
                        ],

                        // Validity Period
                        Container(
                          padding: EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: Colors.orange.shade50,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Row(
                            children: [
                              Icon(Icons.schedule, color: Color(0xFFF5A623)),
                              SizedBox(width: 12),
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    '유효 기간',
                                    style: TextStyle(
                                      fontSize: 12,
                                      color: Colors.grey.shade700,
                                    ),
                                  ),
                                  Text(
                                    '${_formatDate(_flyer!.validFrom)} ~ ${_formatDate(_flyer!.validTo)}',
                                    style: TextStyle(
                                      fontSize: 14,
                                      fontWeight: FontWeight.w500,
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),

                        SizedBox(height: 24),

                        Divider(),

                        SizedBox(height: 24),

                        // Merchant Info
                        Text(
                          '매장 정보',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                          ),
                        ),

                        SizedBox(height: 16),

                        ListTile(
                          contentPadding: EdgeInsets.zero,
                          leading: CircleAvatar(
                            backgroundColor: Color(0xFFF5A623).withOpacity(0.1),
                            child: Icon(Icons.store, color: Color(0xFFF5A623)),
                          ),
                          title: Text(
                            _flyer!.merchant.name,
                            style: TextStyle(fontWeight: FontWeight.w500),
                          ),
                          subtitle: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              SizedBox(height: 4),
                              Text(_flyer!.merchant.address),
                              if (_flyer!.distance != null) ...[
                                SizedBox(height: 4),
                                Row(
                                  children: [
                                    Icon(Icons.location_on, size: 16),
                                    SizedBox(width: 4),
                                    Text(
                                      '${_flyer!.distance!.toStringAsFixed(1)}km',
                                      style: TextStyle(
                                        color: Color(0xFFF5A623),
                                        fontWeight: FontWeight.w500,
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                            ],
                          ),
                        ),

                        if (_flyer!.merchant.phone != null) ...[
                          SizedBox(height: 8),
                          Row(
                            children: [
                              Icon(Icons.phone, size: 20, color: Colors.grey),
                              SizedBox(width: 12),
                              Text(
                                _flyer!.merchant.phone!,
                                style: TextStyle(fontSize: 16),
                              ),
                              Spacer(),
                              TextButton(
                                onPressed: () => _callMerchant(_flyer!.merchant.phone!),
                                child: Text('전화하기'),
                              ),
                            ],
                          ),
                        ],

                        SizedBox(height: 32),

                        // Action Button
                        ElevatedButton(
                          onPressed: _clickFlyer,
                          style: ElevatedButton.styleFrom(
                            minimumSize: Size(double.infinity, 56),
                            backgroundColor: Color(0xFFF5A623),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(Icons.monetization_on, color: Colors.white),
                              SizedBox(width: 8),
                              Text(
                                '25P 받고 혜택 보기',
                                style: TextStyle(
                                  fontSize: 18,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.white,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
    );
  }

  Future<void> _toggleBookmark() async {
    try {
      if (_isBookmarked) {
        await FlyerService.removeBookmark(widget.flyerId);
      } else {
        await FlyerService.addBookmark(widget.flyerId);
      }

      setState(() => _isBookmarked = !_isBookmarked);

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(_isBookmarked ? '저장되었습니다' : '저장이 해제되었습니다'),
          duration: Duration(seconds: 1),
        ),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('오류가 발생했습니다')),
      );
    }
  }

  Future<void> _clickFlyer() async {
    try {
      final points = await FlyerService.clickFlyer(widget.flyerId);

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('${points}P가 적립되었습니다!'),
          backgroundColor: Colors.green,
          duration: Duration(seconds: 2),
        ),
      );
    } catch (e) {
      if (e.toString().contains('already clicked')) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('이미 포인트를 받은 전단지입니다')),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('오류가 발생했습니다')),
        );
      }
    }
  }

  void _shareFlyer() {
    // Implement share
  }

  void _viewFullImage() {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => FullScreenImageView(imageUrl: _flyer!.imageUrl),
      ),
    );
  }

  void _callMerchant(String phone) {
    // Implement phone call
  }

  String _formatDate(DateTime date) {
    return DateFormat('yyyy.MM.dd').format(date);
  }

  Color _getCategoryColor(String category) {
    // Same as before
    return Color(0xFFF5A623);
  }

  String _getCategoryLabel(String category) {
    // Same as before
    return '음식';
  }
}

// Flyer Detail Model
class FlyerDetail {
  final String id;
  final String title;
  final String? description;
  final String imageUrl;
  final String category;
  final DateTime validFrom;
  final DateTime validTo;
  final int viewCount;
  final int clickCount;
  final MerchantInfo merchant;
  final double? distance;
  final bool isBookmarked;

  FlyerDetail({
    required this.id,
    required this.title,
    this.description,
    required this.imageUrl,
    required this.category,
    required this.validFrom,
    required this.validTo,
    required this.viewCount,
    required this.clickCount,
    required this.merchant,
    this.distance,
    this.isBookmarked = false,
  });

  factory FlyerDetail.fromJson(Map<String, dynamic> json) {
    return FlyerDetail(
      id: json['id'],
      title: json['title'],
      description: json['description'],
      imageUrl: json['imageUrl'],
      category: json['category'],
      validFrom: DateTime.parse(json['validFrom']),
      validTo: DateTime.parse(json['validTo']),
      viewCount: json['viewCount'],
      clickCount: json['clickCount'],
      merchant: MerchantInfo.fromJson(json['merchant']),
      distance: json['distance'],
      isBookmarked: json['isBookmarked'] ?? false,
    );
  }
}

class MerchantInfo {
  final String id;
  final String name;
  final String address;
  final String? phone;

  MerchantInfo({
    required this.id,
    required this.name,
    required this.address,
    this.phone,
  });

  factory MerchantInfo.fromJson(Map<String, dynamic> json) {
    return MerchantInfo(
      id: json['id'],
      name: json['name'],
      address: json['address'],
      phone: json['phone'],
    );
  }
}

// Backend: Get Flyer Detail
@Get(':id')
@UseGuards(OptionalJwtAuthGuard)
async getFlyerDetail(@Param('id') id: string, @Req() req) {
  const userId = req.user?.id;

  const flyer = await this.flyerRepo.findOne({
    where: { id },
    relations: ['merchant'],
  });

  if (!flyer) {
    throw new NotFoundException('Flyer not found');
  }

  // Increment view count
  await this.flyerRepo.increment({ id }, 'viewCount', 1);

  // Calculate distance if user has hub
  let distance = null;
  if (userId) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (user.homeH3Index) {
      distance = this.h3Service.getDistanceBetweenH3Cells(
        user.homeH3Index,
        flyer.gridCellH3Index,
      );
    }
  }

  // Check bookmark
  let isBookmarked = false;
  if (userId) {
    const bookmark = await this.bookmarkRepo.findOne({
      where: { userId, flyerId: id },
    });
    isBookmarked = !!bookmark;
  }

  return {
    ...flyer,
    distance,
    isBookmarked,
  };
}
```

## Dependencies

- **Depends on**: USR-007-01 (Flyer Feed)
- **Blocks**: USR-007-04

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Detail screen implemented
- [ ] Image viewer working
- [ ] Merchant info displayed
- [ ] Bookmark button working
- [ ] Share button working
- [ ] Backend API working
- [ ] View count increment working
- [ ] Tests passing
- [ ] Code reviewed and merged

## Notes

- SliverAppBar로 이미지 헤더 구현
- 이미지 클릭 시 전체 화면 뷰
- 조회수는 API 호출 시 자동 증가
- 전화 버튼은 url_launcher 사용
- 유효 기간 강조 표시
- 포인트 버튼은 별도 스토리 (USR-007-04)
- Merchant 정보는 relations로 로드
