# Story USR-001-05: Interest Category Selection

**Epic**: USR-001 User Onboarding & Registration
**Priority**: P0 (Critical)
**Story Points**: 2
**Status**: 📋 Planned

## User Story

**As a** new user
**I want to** select my interest categories
**So that** I receive relevant flyer recommendations

## Acceptance Criteria

- [ ] 카테고리 목록 표시 (8-10개)
- [ ] 다중 선택 가능 (최소 1개)
- [ ] 선택 항목 시각적 표시
- [ ] Skip 가능
- [ ] 저장 및 다음 단계

## Tasks

### Frontend
- [ ] Category selection UI (grid or chips)
- [ ] Multi-select logic
- [ ] Minimum selection validation
- [ ] Skip button

### Backend
- [ ] POST /users/:id/interests endpoint
- [ ] UserInterest entity creation
- [ ] Bulk insert interests

### Database
- [ ] Migration: user_interests table

### Testing
- [ ] Unit tests: Selection validation
- [ ] Integration test: Save interests
- [ ] E2E test: Complete flow

## Technical Notes

```typescript
// Interest Selection Screen (Flutter)
class InterestSelectionScreen extends StatefulWidget {
  final User user;

  const InterestSelectionScreen({required this.user});

  @override
  _InterestSelectionScreenState createState() => _InterestSelectionScreenState();
}

class _InterestSelectionScreenState extends State<InterestSelectionScreen> {
  final Set<InterestCategory> _selectedCategories = {};
  bool _isLoading = false;

  final List<CategoryOption> categories = [
    CategoryOption(
      category: InterestCategory.FOOD_DINING,
      label: '음식/외식',
      icon: Icons.restaurant,
      color: Color(0xFFFF6B6B),
    ),
    CategoryOption(
      category: InterestCategory.SHOPPING,
      label: '쇼핑',
      icon: Icons.shopping_bag,
      color: Color(0xFF4ECDC4),
    ),
    CategoryOption(
      category: InterestCategory.HEALTH_BEAUTY,
      label: '건강/뷰티',
      icon: Icons.spa,
      color: Color(0xFFFF85A2),
    ),
    CategoryOption(
      category: InterestCategory.EDUCATION,
      label: '교육',
      icon: Icons.school,
      color: Color(0xFF95E1D3),
    ),
    CategoryOption(
      category: InterestCategory.SERVICES,
      label: '서비스',
      icon: Icons.build,
      color: Color(0xFFFFBE76),
    ),
    CategoryOption(
      category: InterestCategory.LEISURE_CULTURE,
      label: '여가/문화',
      icon: Icons.movie,
      color: Color(0xFFB19CD9),
    ),
    CategoryOption(
      category: InterestCategory.HOUSEHOLD,
      label: '생활용품',
      icon: Icons.home,
      color: Color(0xFF77DD77),
    ),
    CategoryOption(
      category: InterestCategory.OTHER,
      label: '기타',
      icon: Icons.more_horiz,
      color: Color(0xFFAAAAAA),
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('관심 카테고리'),
        actions: [
          TextButton(
            onPressed: _handleSkip,
            child: Text('Skip', style: TextStyle(color: Colors.grey)),
          ),
        ],
      ),
      body: Column(
        children: [
          Expanded(
            child: ListView(
              padding: EdgeInsets.all(24),
              children: [
                Text(
                  '관심있는 카테고리를\n선택해주세요',
                  style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                ),
                SizedBox(height: 8),
                Text(
                  '선택한 카테고리의 전단지를 우선적으로 보여드려요',
                  style: TextStyle(fontSize: 14, color: Colors.grey.shade600),
                ),

                SizedBox(height: 40),

                // Category grid
                GridView.builder(
                  shrinkWrap: true,
                  physics: NeverScrollableScrollPhysics(),
                  gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2,
                    crossAxisSpacing: 16,
                    mainAxisSpacing: 16,
                    childAspectRatio: 1.2,
                  ),
                  itemCount: categories.length,
                  itemBuilder: (context, index) {
                    final option = categories[index];
                    final isSelected = _selectedCategories.contains(option.category);

                    return _CategoryCard(
                      option: option,
                      isSelected: isSelected,
                      onTap: () => _toggleCategory(option.category),
                    );
                  },
                ),

                SizedBox(height: 20),

                // Selected count
                if (_selectedCategories.isNotEmpty)
                  Center(
                    child: Text(
                      '${_selectedCategories.length}개 선택됨',
                      style: TextStyle(
                        fontSize: 14,
                        color: Color(0xFFF5A623),
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),
              ],
            ),
          ),

          // Next button
          Padding(
            padding: EdgeInsets.all(24),
            child: ElevatedButton(
              onPressed: _selectedCategories.isEmpty || _isLoading
                  ? null
                  : _handleSubmit,
              child: _isLoading
                  ? CircularProgressIndicator()
                  : Text('다음'),
              style: ElevatedButton.styleFrom(
                minimumSize: Size(double.infinity, 50),
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _toggleCategory(InterestCategory category) {
    setState(() {
      if (_selectedCategories.contains(category)) {
        _selectedCategories.remove(category);
      } else {
        _selectedCategories.add(category);
      }
    });
  }

  Future<void> _handleSubmit() async {
    if (_selectedCategories.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('최소 1개 이상 선택해주세요')),
      );
      return;
    }

    setState(() => _isLoading = true);

    try {
      await UserService.updateInterests(
        userId: widget.user.id,
        categories: _selectedCategories.toList(),
      );

      _navigateToNext();
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('관심 카테고리 저장 실패: ${e.toString()}')),
      );
    } finally {
      setState(() => _isLoading = false);
    }
  }

  void _handleSkip() {
    _navigateToNext();
  }

  void _navigateToNext() {
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(
        builder: (context) => NotificationPreferencesScreen(user: widget.user),
      ),
    );
  }
}

class _CategoryCard extends StatelessWidget {
  final CategoryOption option;
  final bool isSelected;
  final VoidCallback onTap;

  const _CategoryCard({
    required this.option,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          color: isSelected ? option.color.withOpacity(0.1) : Colors.grey.shade100,
          border: Border.all(
            color: isSelected ? option.color : Colors.transparent,
            width: 2,
          ),
          borderRadius: BorderRadius.circular(16),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              option.icon,
              size: 48,
              color: isSelected ? option.color : Colors.grey.shade600,
            ),
            SizedBox(height: 12),
            Text(
              option.label,
              style: TextStyle(
                fontSize: 16,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                color: isSelected ? option.color : Colors.black87,
              ),
            ),
            if (isSelected)
              Icon(Icons.check_circle, color: option.color, size: 20),
          ],
        ),
      ),
    );
  }
}

class CategoryOption {
  final InterestCategory category;
  final String label;
  final IconData icon;
  final Color color;

  CategoryOption({
    required this.category,
    required this.label,
    required this.icon,
    required this.color,
  });
}

// User Service
class UserService {
  static Future<void> updateInterests({
    required String userId,
    required List<InterestCategory> categories,
  }) async {
    await dio.post('/users/$userId/interests', data: {
      'categories': categories.map((c) => c.toString().split('.').last.toLowerCase()).toList(),
    });
  }
}

// Backend: Update Interests Endpoint
@Post(':id/interests')
@UseGuards(JwtAuthGuard)
async updateInterests(
  @Param('id') id: string,
  @Body() dto: UpdateInterestsDto,
  @Req() req,
) {
  if (req.user.id !== id) {
    throw new ForbiddenException();
  }

  // Delete existing interests
  await this.userInterestRepo.delete({ userId: id });

  // Create new interests
  const interests = dto.categories.map(category =>
    this.userInterestRepo.create({
      userId: id,
      category,
    })
  );

  await this.userInterestRepo.save(interests);

  return { message: 'Interests updated successfully' };
}

// Update Interests DTO
export class UpdateInterestsDto {
  @IsArray()
  @IsEnum(InterestCategory, { each: true })
  @MinLength(1)
  categories: InterestCategory[];
}
```

## Dependencies

- **Depends on**: USR-001-04 (Personal Info)
- **Blocks**: USR-001-06 (Notification Preferences)

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Category grid UI implemented
- [ ] Multi-select working
- [ ] Minimum validation working
- [ ] Skip functionality working
- [ ] Save interests API working
- [ ] Migration run
- [ ] Tests passing
- [ ] Code reviewed and merged

## Notes

- 최소 1개 카테고리 선택 필요
- 다중 선택 가능 (제한 없음)
- Skip 가능 (추후 설정에서 수정 가능)
- 선택한 카테고리는 전단지 추천에 활용
- Grid 레이아웃으로 시각적 선택 편의성 제공
- 각 카테고리는 고유 색상과 아이콘
