# Story MRC-003-02: Flyer Editor - Basic Information

**Epic**: MRC-003 Basic Flyer Creation
**Priority**: P0 (Critical)
**Story Points**: 4
**Status**: 📋 Planned

## User Story

**As a** merchant
**I want to** enter flyer information
**So that** customers understand my offer

## Acceptance Criteria

- [ ] 제목 입력 (최대 50자)
- [ ] 설명 입력 (최대 500자)
- [ ] 카테고리 선택
- [ ] 할인율 입력 (선택)
- [ ] 가격 정보 입력 (선택)
- [ ] 실시간 미리보기
- [ ] 자동 저장 (Draft)

## Tasks

### Frontend
- [ ] Flyer editor form
- [ ] Character counter
- [ ] Category dropdown
- [ ] Real-time preview
- [ ] Form validation
- [ ] Auto-save (local storage)

### Backend
- [ ] POST /flyers/draft (auto-save)
- [ ] Form validation

### Testing
- [ ] Unit tests: Validation
- [ ] E2E test: Editor flow

## Technical Notes

```typescript
// Flyer Editor Screen (Flutter)
class FlyerEditorScreen extends StatefulWidget {
  final FlyerTemplate? template;
  final String? flyerId; // For edit mode

  const FlyerEditorScreen({this.template, this.flyerId});

  @override
  _FlyerEditorScreenState createState() => _FlyerEditorScreenState();
}

class _FlyerEditorScreenState extends State<FlyerEditorScreen> {
  final _formKey = GlobalKey<FormState>();
  final _titleController = TextEditingController();
  final _descriptionController = TextEditingController();

  FlyerCategory? _selectedCategory;
  int? _discountPercent;
  int? _originalPrice;
  List<String> _imageUrls = [];
  DateTime _expiresAt = DateTime.now().add(Duration(days: 7));

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.flyerId != null ? '전단지 수정' : '전단지 만들기'),
        actions: [
          TextButton(
            onPressed: _saveDraft,
            child: Text('임시저장'),
          ),
        ],
      ),
      body: Row(
        children: [
          // Editor Panel
          Expanded(
            flex: 3,
            child: Form(
              key: _formKey,
              child: ListView(
                padding: EdgeInsets.all(24),
                children: [
                  // Title
                  TextFormField(
                    controller: _titleController,
                    decoration: InputDecoration(
                      labelText: '제목',
                      hintText: '예: 봄맞이 50% 대할인!',
                      counter: Text('${_titleController.text.length}/50'),
                    ),
                    maxLength: 50,
                    validator: (v) => v == null || v.isEmpty ? '제목을 입력하세요' : null,
                    onChanged: (_) => setState(() {}),
                  ),

                  SizedBox(height: 20),

                  // Description
                  TextFormField(
                    controller: _descriptionController,
                    decoration: InputDecoration(
                      labelText: '설명',
                      hintText: '상세한 혜택 내용을 입력하세요',
                      counter: Text('${_descriptionController.text.length}/500'),
                      alignLabelWithHint: true,
                    ),
                    maxLines: 5,
                    maxLength: 500,
                    onChanged: (_) => setState(() {}),
                  ),

                  SizedBox(height: 20),

                  // Category
                  DropdownButtonFormField<FlyerCategory>(
                    value: _selectedCategory,
                    decoration: InputDecoration(labelText: '카테고리'),
                    items: FlyerCategory.values.map((cat) {
                      return DropdownMenuItem(
                        value: cat,
                        child: Text(_getCategoryLabel(cat)),
                      );
                    }).toList(),
                    onChanged: (value) => setState(() => _selectedCategory = value),
                    validator: (v) => v == null ? '카테고리를 선택하세요' : null,
                  ),

                  SizedBox(height: 20),

                  // Discount & Price
                  Row(
                    children: [
                      Expanded(
                        child: TextFormField(
                          decoration: InputDecoration(labelText: '할인율 (%)'),
                          keyboardType: TextInputType.number,
                          onChanged: (v) => setState(() => _discountPercent = int.tryParse(v)),
                        ),
                      ),
                      SizedBox(width: 16),
                      Expanded(
                        child: TextFormField(
                          decoration: InputDecoration(labelText: '원가 (원)'),
                          keyboardType: TextInputType.number,
                          onChanged: (v) => setState(() => _originalPrice = int.tryParse(v)),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),

          // Preview Panel
          Expanded(
            flex: 2,
            child: Container(
              color: Colors.grey.shade100,
              padding: EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('미리보기', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  SizedBox(height: 16),
                  Expanded(
                    child: _FlyerPreview(
                      title: _titleController.text,
                      description: _descriptionController.text,
                      imageUrls: _imageUrls,
                      discountPercent: _discountPercent,
                      originalPrice: _originalPrice,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
      bottomNavigationBar: Padding(
        padding: EdgeInsets.all(16),
        child: ElevatedButton(
          onPressed: _continue,
          child: Text('다음: 이미지 업로드'),
          style: ElevatedButton.styleFrom(minimumSize: Size(double.infinity, 56)),
        ),
      ),
    );
  }

  void _saveDraft() {
    // Auto-save to local storage
  }

  void _continue() {
    if (_formKey.currentState!.validate()) {
      // Navigate to image upload or validity period
    }
  }

  String _getCategoryLabel(FlyerCategory cat) {
    const labels = {
      FlyerCategory.FOOD_DINING: '음식/외식',
      FlyerCategory.SHOPPING: '쇼핑',
    };
    return labels[cat] ?? cat.toString();
  }
}

class _FlyerPreview extends StatelessWidget {
  final String title;
  final String description;
  final List<String> imageUrls;
  final int? discountPercent;
  final int? originalPrice;

  const _FlyerPreview({
    required this.title,
    required this.description,
    required this.imageUrls,
    this.discountPercent,
    this.originalPrice,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (imageUrls.isNotEmpty)
              Image.network(imageUrls.first, height: 200, width: double.infinity, fit: BoxFit.cover)
            else
              Container(
                height: 200,
                color: Colors.grey.shade300,
                child: Center(child: Text('이미지 없음')),
              ),
            SizedBox(height: 12),
            if (discountPercent != null)
              Text('$discountPercent% OFF', style: TextStyle(color: Colors.red, fontSize: 24, fontWeight: FontWeight.bold)),
            Text(title.isEmpty ? '제목을 입력하세요' : title, style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
            SizedBox(height: 8),
            Text(description.isEmpty ? '설명을 입력하세요' : description),
          ],
        ),
      ),
    );
  }
}
```

## Dependencies

- **Depends on**: MRC-003-01
- **Blocks**: MRC-003-03

## Definition of Done

- [ ] Editor UI implemented
- [ ] Preview working
- [ ] Validation working
- [ ] Auto-save working
- [ ] Tests passing

## Notes

- 실시간 미리보기 (양방향 바인딩)
- Character counter로 제한 표시
- 임시저장 기능 (local storage)
- Phase 2: 서버 draft 저장
