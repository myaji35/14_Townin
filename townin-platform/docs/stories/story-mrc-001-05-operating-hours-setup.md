# Story MRC-001-05: Operating Hours Setup

**Epic**: MRC-001 Merchant Onboarding
**Priority**: P0 (Critical)
**Story Points**: 3
**Status**: 📋 Planned

## User Story

**As a** merchant
**I want to** set my business hours
**So that** customers know when I'm open

## Acceptance Criteria

- [ ] 요일별 영업 시간 설정
- [ ] 휴무일 선택
- [ ] 24시간 영업 옵션
- [ ] 브레이크 타임 설정 (선택, Phase 2)
- [ ] 공휴일 영업 여부 (Phase 2)

## Tasks

### Frontend
- [ ] Operating hours UI
- [ ] Time picker components
- [ ] Weekday toggles
- [ ] Copy hours to all days

### Backend
- [ ] PATCH /merchants/stores/:id/hours
- [ ] JSON storage for hours
- [ ] Validation logic

### Testing
- [ ] Unit tests: Hours validation
- [ ] Integration test: Update hours
- [ ] E2E test: Complete setup

## Technical Notes

```typescript
// Operating Hours Setup (Flutter)
class OperatingHoursSetupScreen extends StatefulWidget {
  @override
  _OperatingHoursSetupScreenState createState() => _OperatingHoursSetupScreenState();
}

class _OperatingHoursSetupScreenState extends State<OperatingHoursSetupScreen> {
  Map<String, DayHours> _hours = {
    'monday': DayHours(open: TimeOfDay(hour: 9, minute: 0), close: TimeOfDay(hour: 21, minute: 0)),
    'tuesday': DayHours(open: TimeOfDay(hour: 9, minute: 0), close: TimeOfDay(hour: 21, minute: 0)),
    'wednesday': DayHours(open: TimeOfDay(hour: 9, minute: 0), close: TimeOfDay(hour: 21, minute: 0)),
    'thursday': DayHours(open: TimeOfDay(hour: 9, minute: 0), close: TimeOfDay(hour: 21, minute: 0)),
    'friday': DayHours(open: TimeOfDay(hour: 9, minute: 0), close: TimeOfDay(hour: 21, minute: 0)),
    'saturday': DayHours(open: TimeOfDay(hour: 10, minute: 0), close: TimeOfDay(hour: 18, minute: 0)),
    'sunday': DayHours(closed: true),
  };

  bool _isLoading = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('영업 시간 설정')),
      body: Column(
        children: [
          Expanded(
            child: ListView(
              padding: EdgeInsets.all(24),
              children: [
                Text('영업 시간', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
                SizedBox(height: 8),
                Text('요일별 영업 시간을 설정해주세요', style: TextStyle(color: Colors.grey)),
                SizedBox(height: 24),

                ..._hours.entries.map((entry) {
                  return _DayHoursRow(
                    day: entry.key,
                    hours: entry.value,
                    onChanged: (newHours) {
                      setState(() => _hours[entry.key] = newHours);
                    },
                  );
                }),

                SizedBox(height: 24),
                OutlinedButton.icon(
                  icon: Icon(Icons.copy),
                  label: Text('평일 시간을 전체 요일에 적용'),
                  onPressed: _copyMondayToAll,
                ),
              ],
            ),
          ),

          Padding(
            padding: EdgeInsets.all(24),
            child: ElevatedButton(
              onPressed: _isLoading ? null : _handleSubmit,
              child: _isLoading ? CircularProgressIndicator() : Text('다음'),
              style: ElevatedButton.styleFrom(minimumSize: Size(double.infinity, 56)),
            ),
          ),
        ],
      ),
    );
  }

  void _copyMondayToAll() {
    final mondayHours = _hours['monday']!;
    setState(() {
      _hours.updateAll((key, value) => DayHours(
        open: mondayHours.open,
        close: mondayHours.close,
        closed: false,
      ));
    });
  }

  Future<void> _handleSubmit() async {
    setState(() => _isLoading = true);
    try {
      await MerchantService.updateOperatingHours(_hours);
      Navigator.push(
        context,
        MaterialPageRoute(builder: (context) => StoreProfilePhotoUploadScreen()),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('영업 시간 저장 실패')),
      );
    } finally {
      setState(() => _isLoading = false);
    }
  }
}

class _DayHoursRow extends StatelessWidget {
  final String day;
  final DayHours hours;
  final ValueChanged<DayHours> onChanged;

  const _DayHoursRow({required this.day, required this.hours, required this.onChanged});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(bottom: 16),
      child: Row(
        children: [
          SizedBox(
            width: 60,
            child: Text(_getDayLabel(day), style: TextStyle(fontWeight: FontWeight.w500)),
          ),
          SizedBox(width: 16),

          Checkbox(
            value: !hours.closed,
            onChanged: (value) {
              onChanged(DayHours(
                open: hours.open,
                close: hours.close,
                closed: !(value ?? true),
              ));
            },
          ),

          if (!hours.closed) ...[
            _TimeButton(
              time: hours.open!,
              onTap: () async {
                final time = await showTimePicker(context: context, initialTime: hours.open!);
                if (time != null) {
                  onChanged(DayHours(open: time, close: hours.close!, closed: false));
                }
              },
            ),
            Text(' - ', style: TextStyle(fontSize: 16)),
            _TimeButton(
              time: hours.close!,
              onTap: () async {
                final time = await showTimePicker(context: context, initialTime: hours.close!);
                if (time != null) {
                  onChanged(DayHours(open: hours.open!, close: time, closed: false));
                }
              },
            ),
          ] else
            Text('휴무', style: TextStyle(color: Colors.grey)),
        ],
      ),
    );
  }

  String _getDayLabel(String day) {
    const labels = {
      'monday': '월',
      'tuesday': '화',
      'wednesday': '수',
      'thursday': '목',
      'friday': '금',
      'saturday': '토',
      'sunday': '일',
    };
    return labels[day] ?? day;
  }
}

class _TimeButton extends StatelessWidget {
  final TimeOfDay time;
  final VoidCallback onTap;

  const _TimeButton({required this.time, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Container(
        padding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          border: Border.all(color: Colors.grey),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Text(time.format(context)),
      ),
    );
  }
}

class DayHours {
  final TimeOfDay? open;
  final TimeOfDay? close;
  final bool closed;

  DayHours({this.open, this.close, this.closed = false});

  Map<String, dynamic> toJson() {
    return {
      'open': open != null ? '${open!.hour.toString().padLeft(2, '0')}:${open!.minute.toString().padLeft(2, '0')}' : null,
      'close': close != null ? '${close!.hour.toString().padLeft(2, '0')}:${close!.minute.toString().padLeft(2, '0')}' : null,
      'closed': closed,
    };
  }
}

// Backend: Update Operating Hours
@Patch('stores/:id/hours')
@UseGuards(JwtAuthGuard)
async updateOperatingHours(
  @Param('id') id: string,
  @Body() dto: UpdateOperatingHoursDto,
  @Req() req,
) {
  const store = await this.storeRepo.findOne({
    where: { id, ownerId: req.user.id },
  });

  if (!store) {
    throw new NotFoundException('Store not found');
  }

  store.operatingHours = dto.hours;
  await this.storeRepo.save(store);

  return store;
}

// Migration: Add operatingHours column
export class AddOperatingHours1703456789018 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'stores',
      new TableColumn({
        name: 'operatingHours',
        type: 'jsonb',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('stores', 'operatingHours');
  }
}
```

## Dependencies

- **Depends on**: MRC-001-04
- **Blocks**: MRC-001-06

## Definition of Done

- [ ] Hours UI implemented
- [ ] Time pickers working
- [ ] Copy function working
- [ ] Backend update working
- [ ] Migration run
- [ ] Tests passing

## Notes

- JSON으로 저장 (유연성)
- 요일별 개별 설정
- 평일 시간 복사 기능
- Phase 2: 브레이크 타임, 공휴일 설정
