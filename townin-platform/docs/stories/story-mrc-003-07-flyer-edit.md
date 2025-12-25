# Story MRC-003-07: Flyer Edit

**Epic**: MRC-003 Basic Flyer Creation
**Priority**: P0 (Critical)
**Story Points**: 3
**Status**: 📋 Planned

## User Story

**As a** merchant
**I want to** edit my existing flyers
**So that** I can update information

## Acceptance Criteria

- [ ] 편집 버튼 → 편집기로 이동
- [ ] 기존 데이터 로드
- [ ] 모든 필드 수정 가능
- [ ] 이미지 변경 가능
- [ ] 저장 시 버전 기록 (선택, Phase 2)

## Tasks

### Frontend
- [ ] Load flyer data to editor
- [ ] Update mode UI
- [ ] Save changes button

### Backend
- [ ] GET /flyers/:id (for merchant)
- [ ] PATCH /flyers/:id
- [ ] Validation
- [ ] Version history (Phase 2)

### Testing
- [ ] Integration test: Update flyer
- [ ] E2E test: Edit flow

## Technical Notes

```typescript
// Flyer Editor (Edit Mode) - extends FlyerEditorScreen
class FlyerEditorScreen extends StatefulWidget {
  final FlyerTemplate? template;
  final String? flyerId; // For edit mode

  const FlyerEditorScreen({this.template, this.flyerId});

  @override
  _FlyerEditorScreenState createState() => _FlyerEditorScreenState();
}

class _FlyerEditorScreenState extends State<FlyerEditorScreen> {
  bool _isEditMode = false;
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _isEditMode = widget.flyerId != null;
    if (_isEditMode) {
      _loadFlyerData();
    }
  }

  Future<void> _loadFlyerData() async {
    setState(() => _isLoading = true);

    try {
      final flyer = await FlyerService.getFlyerForEdit(widget.flyerId!);

      // Populate form fields
      _titleController.text = flyer.title;
      _descriptionController.text = flyer.description ?? '';
      _selectedCategory = flyer.category;
      _discountPercent = flyer.discountPercent;
      _originalPrice = flyer.originalPrice;
      _imageUrls = List.from(flyer.imageUrls);
      _expiresAt = flyer.expiresAt;

      setState(() {});
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('전단지 로드 실패: ${e.toString()}')),
      );
      Navigator.pop(context);
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _saveChanges() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    try {
      if (_isEditMode) {
        await FlyerService.updateFlyer(
          widget.flyerId!,
          FlyerDraft(
            title: _titleController.text,
            description: _descriptionController.text,
            category: _selectedCategory!,
            imageUrls: _imageUrls,
            discountPercent: _discountPercent,
            originalPrice: _originalPrice,
            expiresAt: _expiresAt,
          ),
        );

        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('전단지가 수정되었습니다'), backgroundColor: Colors.green),
        );

        Navigator.pop(context);
      } else {
        // Create new flyer (existing logic)
        _publishFlyer();
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('저장 실패: ${e.toString()}')),
      );
    } finally {
      setState(() => _isLoading = false);
    }
  }

  // ... rest of the editor code
}

// Flyer Service (Extended)
class FlyerService {
  static Future<FlyerDetail> getFlyerForEdit(String flyerId) async {
    final response = await dio.get('/flyers/$flyerId/edit');
    return FlyerDetail.fromJson(response.data);
  }

  static Future<void> updateFlyer(String flyerId, FlyerDraft draft) async {
    await dio.patch('/flyers/$flyerId', data: {
      'title': draft.title,
      'description': draft.description,
      'category': draft.category.toString().split('.').last,
      'imageUrls': draft.imageUrls,
      'discountPercent': draft.discountPercent,
      'originalPrice': draft.originalPrice,
      'expiresAt': draft.expiresAt.toIso8601String(),
    });
  }
}

// Backend: Get Flyer for Edit
@Get(':id/edit')
@UseGuards(JwtAuthGuard)
@Roles(UserRole.MERCHANT)
async getFlyerForEdit(@Param('id') id: string, @Req() req) {
  const flyer = await this.flyerRepo.findOne({
    where: { id, merchantId: req.user.id },
  });

  if (!flyer) {
    throw new NotFoundException('Flyer not found or not authorized');
  }

  return flyer;
}

// Backend: Update Flyer
@Patch(':id')
@UseGuards(JwtAuthGuard)
@Roles(UserRole.MERCHANT)
async updateFlyer(
  @Param('id') id: string,
  @Body() dto: UpdateFlyerDto,
  @Req() req,
) {
  const flyer = await this.flyerRepo.findOne({
    where: { id, merchantId: req.user.id },
  });

  if (!flyer) {
    throw new NotFoundException('Flyer not found or not authorized');
  }

  // Update fields
  if (dto.title !== undefined) flyer.title = dto.title;
  if (dto.description !== undefined) flyer.description = dto.description;
  if (dto.category !== undefined) flyer.category = dto.category;
  if (dto.imageUrls !== undefined) flyer.imageUrls = dto.imageUrls;
  if (dto.discountPercent !== undefined) flyer.discountPercent = dto.discountPercent;
  if (dto.originalPrice !== undefined) {
    flyer.originalPrice = dto.originalPrice;
    flyer.discountedPrice = dto.originalPrice && flyer.discountPercent
      ? Math.round(dto.originalPrice * (1 - flyer.discountPercent / 100))
      : null;
  }
  if (dto.expiresAt !== undefined) flyer.expiresAt = new Date(dto.expiresAt);

  flyer.updatedAt = new Date();

  await this.flyerRepo.save(flyer);

  return flyer;
}

// Update Flyer DTO
export class UpdateFlyerDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsArray()
  @MaxArraySize(3)
  imageUrls?: string[];

  @IsOptional()
  @IsEnum(FlyerCategory)
  category?: FlyerCategory;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  discountPercent?: number;

  @IsOptional()
  @IsNumber()
  originalPrice?: number;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}
```

## Dependencies

- **Depends on**: MRC-003-06
- **Blocks**: MRC-003-08

## Definition of Done

- [ ] Edit mode implemented
- [ ] Data loading working
- [ ] Update working
- [ ] Validation working
- [ ] Backend API working
- [ ] Tests passing

## Notes

- 편집기 재사용 (create/edit 모드 구분)
- 권한 검증: merchantId 확인
- 모든 필드 수정 가능
- updatedAt 자동 갱신
- Phase 2: 버전 히스토리
