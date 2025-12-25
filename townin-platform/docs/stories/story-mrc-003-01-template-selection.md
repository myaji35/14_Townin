# Story MRC-003-01: Template Selection

**Epic**: MRC-003 Basic Flyer Creation
**Priority**: P0 (Critical)
**Story Points**: 3
**Status**: 📋 Planned

## User Story

**As a** merchant
**I want to** choose from flyer templates
**So that** I can create a professional-looking flyer quickly

## Acceptance Criteria

- [ ] 템플릿 갤러리 (6-10개)
- [ ] 템플릿 프리뷰
- [ ] 카테고리별 템플릿 (음식, 쇼핑, 서비스 등)
- [ ] 빈 템플릿 옵션
- [ ] 템플릿 선택 → 편집기 이동

## Tasks

### Frontend
- [ ] Template gallery UI
- [ ] Template preview modal
- [ ] Template selection handler
- [ ] Category filter

### Assets
- [ ] Design 10 template layouts
- [ ] Template thumbnail images

### Testing
- [ ] E2E test: Template selection flow

## Technical Notes

```typescript
// Template Gallery (Flutter)
class TemplateGalleryScreen extends StatelessWidget {
  final List<FlyerTemplate> templates = [
    FlyerTemplate(
      id: 't1',
      name: '음식점 할인',
      category: FlyerCategory.FOOD_DINING,
      thumbnailUrl: 'assets/templates/food_discount.png',
      layout: TemplateLayout.imageTop,
    ),
    FlyerTemplate(
      id: 't2',
      name: '카페 이벤트',
      category: FlyerCategory.FOOD_DINING,
      thumbnailUrl: 'assets/templates/cafe_event.png',
      layout: TemplateLayout.backgroundImage,
    ),
    // ... 8 more templates
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('템플릿 선택')),
      body: GridView.builder(
        padding: EdgeInsets.all(16),
        gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2,
          crossAxisSpacing: 16,
          mainAxisSpacing: 16,
          childAspectRatio: 0.75,
        ),
        itemCount: templates.length + 1,
        itemBuilder: (context, index) {
          if (index == 0) {
            return _BlankTemplateCard(
              onTap: () => _navigateToEditor(context, null),
            );
          }
          final template = templates[index - 1];
          return _TemplateCard(
            template: template,
            onTap: () => _navigateToEditor(context, template),
          );
        },
      ),
    );
  }

  void _navigateToEditor(BuildContext context, FlyerTemplate? template) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => FlyerEditorScreen(template: template),
      ),
    );
  }
}

class _BlankTemplateCard extends StatelessWidget {
  final VoidCallback onTap;

  const _BlankTemplateCard({required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Card(
      child: InkWell(
        onTap: onTap,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.add, size: 64, color: Colors.grey),
            SizedBox(height: 8),
            Text('빈 템플릿', style: TextStyle(fontSize: 16)),
          ],
        ),
      ),
    );
  }
}

class _TemplateCard extends StatelessWidget {
  final FlyerTemplate template;
  final VoidCallback onTap;

  const _TemplateCard({required this.template, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Card(
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: onTap,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Expanded(
              child: Image.asset(
                template.thumbnailUrl,
                fit: BoxFit.cover,
              ),
            ),
            Padding(
              padding: EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    template.name,
                    style: TextStyle(fontWeight: FontWeight.bold),
                  ),
                  Text(
                    _getCategoryLabel(template.category),
                    style: TextStyle(fontSize: 12, color: Colors.grey),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _getCategoryLabel(FlyerCategory category) {
    const labels = {
      FlyerCategory.FOOD_DINING: '음식',
      FlyerCategory.SHOPPING: '쇼핑',
      FlyerCategory.HEALTH_BEAUTY: '건강',
    };
    return labels[category] ?? '기타';
  }
}

class FlyerTemplate {
  final String id;
  final String name;
  final FlyerCategory category;
  final String thumbnailUrl;
  final TemplateLayout layout;

  FlyerTemplate({
    required this.id,
    required this.name,
    required this.category,
    required this.thumbnailUrl,
    required this.layout,
  });
}

enum TemplateLayout {
  imageTop,
  backgroundImage,
  leftImage,
  grid,
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
```

## Dependencies

- **Depends on**: MRC-001 (Merchant Onboarding)
- **Blocks**: MRC-003-02

## Definition of Done

- [ ] Gallery UI implemented
- [ ] 10 templates designed
- [ ] Template selection working
- [ ] Navigation to editor working
- [ ] Tests passing

## Notes

- Phase 1: 10개 템플릿 제공
- 템플릿은 프론트엔드 assets
- Phase 2: 서버에서 템플릿 관리
- 빈 템플릿으로 자유 작성 가능
