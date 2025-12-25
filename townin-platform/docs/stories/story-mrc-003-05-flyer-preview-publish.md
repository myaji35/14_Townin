# Story MRC-003-05: Flyer Preview & Publish

**Epic**: MRC-003 Basic Flyer Creation
**Priority**: P0 (Critical)
**Story Points**: 3
**Status**: 📋 Planned

## User Story

**As a** merchant
**I want to** preview and publish my flyer
**So that** I can ensure it looks good before going live

## Acceptance Criteria

- [ ] 실시간 미리보기
- [ ] 모바일/데스크톱 뷰 전환
- [ ] 발행 버튼
- [ ] 발행 확인 다이얼로그
- [ ] 자동 H3 Grid Cell 매핑
- [ ] 발행 성공 알림

## Tasks

### Frontend
- [ ] Preview component
- [ ] Responsive preview
- [ ] Publish dialog
- [ ] Success notification

### Backend
- [ ] POST /flyers
- [ ] H3 cell assignment (from store location)
- [ ] Region assignment
- [ ] Validation

### Testing
- [ ] Integration test: Create flyer
- [ ] E2E test: Complete flow

## Technical Notes

```typescript
// Flyer Preview & Publish (Flutter)
class FlyerPreviewPublishScreen extends StatefulWidget {
  final FlyerDraft draft;

  const FlyerPreviewPublishScreen({required this.draft});

  @override
  _FlyerPreviewPublishScreenState createState() => _FlyerPreviewPublishScreenState();
}

class _FlyerPreviewPublishScreenState extends State<FlyerPreviewPublishScreen> {
  bool _isPublishing = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('미리보기'),
        actions: [
          TextButton(
            onPressed: _isPublishing ? null : _showPublishDialog,
            child: Text('발행', style: TextStyle(fontSize: 18)),
          ),
        ],
      ),
      body: Center(
        child: Container(
          width: 400,
          child: FlyerCard(
            flyer: FlyerListItem(
              id: 'preview',
              title: widget.draft.title,
              imageUrl: widget.draft.imageUrls.isNotEmpty ? widget.draft.imageUrls.first : '',
              merchantName: 'Your Store',
              category: widget.draft.category.toString(),
              distance: 0,
              discountRate: widget.draft.discountPercent,
            ),
            onTap: () {},
          ),
        ),
      ),
    );
  }

  Future<void> _showPublishDialog() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('전단지 발행'),
        content: Text('전단지를 발행하시겠습니까?\n발행 후 고객에게 즉시 노출됩니다.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: Text('취소'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(context, true),
            child: Text('발행'),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      _publishFlyer();
    }
  }

  Future<void> _publishFlyer() async {
    setState(() => _isPublishing = true);

    try {
      final flyer = await FlyerService.createFlyer(widget.draft);

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('전단지가 발행되었습니다!'),
          backgroundColor: Colors.green,
        ),
      );

      // Navigate to dashboard
      Navigator.pushAndRemoveUntil(
        context,
        MaterialPageRoute(builder: (context) => MerchantDashboardScreen()),
        (route) => false,
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('발행 실패: ${e.toString()}')),
      );
    } finally {
      setState(() => _isPublishing = false);
    }
  }
}

class FlyerDraft {
  final String title;
  final String description;
  final FlyerCategory category;
  final List<String> imageUrls;
  final int? discountPercent;
  final int? originalPrice;
  final DateTime expiresAt;

  FlyerDraft({
    required this.title,
    required this.description,
    required this.category,
    required this.imageUrls,
    this.discountPercent,
    this.originalPrice,
    required this.expiresAt,
  });
}

// Backend: Create Flyer
@Post()
@UseGuards(JwtAuthGuard)
@Roles(UserRole.MERCHANT)
async createFlyer(@Body() dto: CreateFlyerDto, @Req() req) {
  const userId = req.user.id;

  // Get merchant's store
  const store = await this.storeRepo.findOne({
    where: { ownerId: userId },
    relations: ['region'],
  });

  if (!store) {
    throw new NotFoundException('Store not found. Please set up your store first.');
  }

  // Check active flyers limit (max 10)
  const activeCount = await this.flyerRepo.count({
    where: { merchantId: userId, isActive: true, isDeleted: false },
  });

  if (activeCount >= 10) {
    throw new BadRequestException('Maximum 10 active flyers allowed');
  }

  // Create flyer
  const flyer = this.flyerRepo.create({
    merchantId: userId,
    storeId: store.id,
    title: dto.title,
    description: dto.description,
    imageUrls: dto.imageUrls,
    category: dto.category,
    discountPercent: dto.discountPercent,
    originalPrice: dto.originalPrice,
    discountedPrice: dto.originalPrice && dto.discountPercent
      ? Math.round(dto.originalPrice * (1 - dto.discountPercent / 100))
      : null,
    gridCellH3Index: store.gridCellH3Index,
    region: store.region,
    regionId: store.regionId,
    expiresAt: dto.expiresAt,
    isActive: true,
  });

  await this.flyerRepo.save(flyer);

  return flyer;
}

// Create Flyer DTO
export class CreateFlyerDto {
  @IsString()
  @MaxLength(50)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsArray()
  @MaxArraySize(3)
  @IsString({ each: true })
  imageUrls: string[];

  @IsEnum(FlyerCategory)
  category: FlyerCategory;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  discountPercent?: number;

  @IsOptional()
  @IsNumber()
  originalPrice?: number;

  @IsDateString()
  expiresAt: string;
}
```

## Dependencies

- **Depends on**: MRC-003-04
- **Blocks**: MRC-003-06

## Definition of Done

- [ ] Preview UI working
- [ ] Publish dialog working
- [ ] Backend create working
- [ ] H3 assignment working
- [ ] Validation working
- [ ] Tests passing

## Notes

- 발행 시 자동으로 store의 H3 Grid Cell 사용
- 최대 10개 활성 전단지 제한
- 발행 즉시 사용자에게 노출
- isActive = true로 생성
