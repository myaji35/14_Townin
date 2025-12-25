# Story MRC-003-04: Validity Period Setting

**Epic**: MRC-003 Basic Flyer Creation
**Priority**: P0 (Critical)
**Story Points**: 2
**Status**: 📋 Planned

## User Story

**As a** merchant
**I want to** set flyer expiration date
**So that** outdated offers don't show

## Acceptance Criteria

- [ ] 유효 기간 선택 (날짜 피커)
- [ ] 기본값: 7일 후
- [ ] 최소: 1일, 최대: 30일
- [ ] 만료일 시각적 표시
- [ ] 만료 전 알림 (Phase 2)

## Tasks

### Frontend
- [ ] Date picker component
- [ ] Date range validation (1-30 days)
- [ ] Expiration warning UI

### Backend
- [ ] expiresAt validation
- [ ] Cron job: auto-deactivate expired flyers

### Testing
- [ ] Unit tests: Date validation
- [ ] Integration test: Expiration cron

## Technical Notes

```typescript
// Validity Period Setting (Flutter)
class ValidityPeriodScreen extends StatefulWidget {
  @override
  _ValidityPeriodScreenState createState() => _ValidityPeriodScreenState();
}

class _ValidityPeriodScreenState extends State<ValidityPeriodScreen> {
  DateTime _expiresAt = DateTime.now().add(Duration(days: 7));

  @override
  Widget build(BuildContext context) {
    final daysUntilExpiry = _expiresAt.difference(DateTime.now()).inDays;

    return Scaffold(
      appBar: AppBar(title: Text('유효 기간 설정')),
      body: Padding(
        padding: EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('전단지 유효 기간', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
            SizedBox(height: 8),
            Text('전단지가 표시될 기간을 설정하세요 (최대 30일)', style: TextStyle(color: Colors.grey)),

            SizedBox(height: 40),

            InkWell(
              onTap: _selectDate,
              child: Container(
                padding: EdgeInsets.all(16),
                decoration: BoxDecoration(
                  border: Border.all(color: Colors.grey),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Row(
                  children: [
                    Icon(Icons.calendar_today),
                    SizedBox(width: 16),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('만료일', style: TextStyle(fontSize: 12, color: Colors.grey)),
                        SizedBox(height: 4),
                        Text(
                          DateFormat('yyyy년 MM월 dd일').format(_expiresAt),
                          style: TextStyle(fontSize: 18, fontWeight: FontWeight.w500),
                        ),
                      ],
                    ),
                    Spacer(),
                    Container(
                      padding: EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        color: Colors.orange.shade100,
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: Text('$daysUntilExpiry일 후'),
                    ),
                  ],
                ),
              ),
            ),

            SizedBox(height: 24),

            // Quick select buttons
            Wrap(
              spacing: 8,
              children: [
                _QuickSelectButton(label: '1일', days: 1, onTap: () => _setDays(1)),
                _QuickSelectButton(label: '3일', days: 3, onTap: () => _setDays(3)),
                _QuickSelectButton(label: '7일', days: 7, onTap: () => _setDays(7)),
                _QuickSelectButton(label: '14일', days: 14, onTap: () => _setDays(14)),
                _QuickSelectButton(label: '30일', days: 30, onTap: () => _setDays(30)),
              ],
            ),

            Spacer(),

            ElevatedButton(
              onPressed: _continue,
              child: Text('다음: 미리보기'),
              style: ElevatedButton.styleFrom(minimumSize: Size(double.infinity, 56)),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _selectDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _expiresAt,
      firstDate: DateTime.now().add(Duration(days: 1)),
      lastDate: DateTime.now().add(Duration(days: 30)),
    );

    if (picked != null) {
      setState(() => _expiresAt = picked);
    }
  }

  void _setDays(int days) {
    setState(() => _expiresAt = DateTime.now().add(Duration(days: days)));
  }

  void _continue() {
    Navigator.pop(context, _expiresAt);
  }
}

class _QuickSelectButton extends StatelessWidget {
  final String label;
  final int days;
  final VoidCallback onTap;

  const _QuickSelectButton({
    required this.label,
    required this.days,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return OutlinedButton(
      onPressed: onTap,
      child: Text(label),
    );
  }
}

// Backend: Cron Job to Deactivate Expired Flyers
@Injectable()
export class FlyerScheduler {
  @Cron('0 * * * *') // Every hour
  async deactivateExpiredFlyers() {
    const now = new Date();

    await this.flyerRepo.update(
      {
        expiresAt: LessThan(now),
        isActive: true,
      },
      {
        isActive: false,
      },
    );

    this.logger.log('Deactivated expired flyers');
  }
}
```

## Dependencies

- **Depends on**: MRC-003-03
- **Blocks**: MRC-003-05

## Definition of Done

- [ ] Date picker working
- [ ] Quick select working
- [ ] Validation working
- [ ] Cron job working
- [ ] Tests passing

## Notes

- 기본값: 7일
- 최소: 1일, 최대: 30일
- Quick select 버튼: 1, 3, 7, 14, 30일
- Cron job: 매시간 만료 전단지 비활성화
- Phase 2: 만료 전 알림
