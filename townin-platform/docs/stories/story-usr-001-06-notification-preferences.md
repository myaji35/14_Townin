# Story USR-001-06: Notification Preferences

**Epic**: USR-001 User Onboarding & Registration
**Priority**: P0 (Critical)
**Story Points**: 3
**Status**: 📋 Planned

## User Story

**As a** new user
**I want to** set my notification preferences
**So that** I only receive alerts I want

## Acceptance Criteria

- [ ] 푸시 알림 권한 요청
- [ ] 알림 타입별 설정 (새 전단지, 포인트, 마케팅)
- [ ] 알림 시간대 설정 (Quiet Hours)
- [ ] 저장 및 온보딩 완료
- [ ] FCM 토큰 저장

## Tasks

### Frontend
- [ ] Notification preferences UI
- [ ] Push permission request
- [ ] Time range picker
- [ ] FCM token registration

### Backend
- [ ] PATCH /users/:id/notifications endpoint
- [ ] Store notification settings in user entity
- [ ] Store FCM token

### Testing
- [ ] Unit tests: Settings validation
- [ ] Integration test: Save preferences
- [ ] E2E test: Complete onboarding

## Technical Notes

```typescript
// Notification Preferences Screen
class NotificationPreferencesScreen extends StatefulWidget {
  final User user;

  const NotificationPreferencesScreen({required this.user});

  @override
  _NotificationPreferencesScreenState createState() => _NotificationPreferencesScreenState();
}

class _NotificationPreferencesScreenState extends State<NotificationPreferencesScreen> {
  bool _newFlyers = true;
  bool _pointsEarned = true;
  bool _marketing = false;
  TimeOfDay _quietHoursStart = TimeOfDay(hour: 22, minute: 0);
  TimeOfDay _quietHoursEnd = TimeOfDay(hour: 9, minute: 0);
  bool _isLoading = false;
  String? _fcmToken;

  @override
  void initState() {
    super.initState();
    _requestPushPermission();
  }

  Future<void> _requestPushPermission() async {
    final messaging = FirebaseMessaging.instance;

    final settings = await messaging.requestPermission(
      alert: true,
      badge: true,
      sound: true,
    );

    if (settings.authorizationStatus == AuthorizationStatus.authorized) {
      _fcmToken = await messaging.getToken();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('알림 설정'),
      ),
      body: Column(
        children: [
          Expanded(
            child: ListView(
              padding: EdgeInsets.all(24),
              children: [
                Text(
                  '알림 설정',
                  style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                ),
                SizedBox(height: 8),
                Text(
                  '원하는 알림만 받아보세요',
                  style: TextStyle(fontSize: 14, color: Colors.grey.shade600),
                ),

                SizedBox(height: 40),

                // New flyers notification
                SwitchListTile(
                  title: Text('새 전단지 알림'),
                  subtitle: Text('내 관심 카테고리의 새 전단지가 등록되면 알려드려요'),
                  value: _newFlyers,
                  onChanged: (value) => setState(() => _newFlyers = value),
                  activeColor: Color(0xFFF5A623),
                ),

                // Points earned notification
                SwitchListTile(
                  title: Text('포인트 적립 알림'),
                  subtitle: Text('포인트가 적립되면 알려드려요'),
                  value: _pointsEarned,
                  onChanged: (value) => setState(() => _pointsEarned = value),
                  activeColor: Color(0xFFF5A623),
                ),

                // Marketing notification
                SwitchListTile(
                  title: Text('마케팅 알림'),
                  subtitle: Text('이벤트, 혜택 등의 정보를 받아보세요 (선택)'),
                  value: _marketing,
                  onChanged: (value) => setState(() => _marketing = value),
                  activeColor: Color(0xFFF5A623),
                ),

                Divider(height: 40),

                // Quiet hours
                Text(
                  '방해 금지 시간',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
                ),
                SizedBox(height: 8),
                Text(
                  '설정한 시간에는 알림을 받지 않아요',
                  style: TextStyle(fontSize: 14, color: Colors.grey.shade600),
                ),
                SizedBox(height: 16),

                Row(
                  children: [
                    Expanded(
                      child: _TimeSelector(
                        label: '시작',
                        time: _quietHoursStart,
                        onTap: () => _selectTime(true),
                      ),
                    ),
                    SizedBox(width: 16),
                    Icon(Icons.arrow_forward, color: Colors.grey),
                    SizedBox(width: 16),
                    Expanded(
                      child: _TimeSelector(
                        label: '종료',
                        time: _quietHoursEnd,
                        onTap: () => _selectTime(false),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),

          // Complete button
          Padding(
            padding: EdgeInsets.all(24),
            child: ElevatedButton(
              onPressed: _isLoading ? null : _handleComplete,
              child: _isLoading
                  ? CircularProgressIndicator()
                  : Text('완료'),
              style: ElevatedButton.styleFrom(
                minimumSize: Size(double.infinity, 50),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _selectTime(bool isStart) async {
    final TimeOfDay? picked = await showTimePicker(
      context: context,
      initialTime: isStart ? _quietHoursStart : _quietHoursEnd,
    );

    if (picked != null) {
      setState(() {
        if (isStart) {
          _quietHoursStart = picked;
        } else {
          _quietHoursEnd = picked;
        }
      });
    }
  }

  Future<void> _handleComplete() async {
    setState(() => _isLoading = true);

    try {
      await UserService.updateNotificationSettings(
        userId: widget.user.id,
        settings: NotificationSettings(
          newFlyers: _newFlyers,
          pointsEarned: _pointsEarned,
          marketing: _marketing,
          quietHoursStart: '${_quietHoursStart.hour.toString().padLeft(2, '0')}:${_quietHoursStart.minute.toString().padLeft(2, '0')}',
          quietHoursEnd: '${_quietHoursEnd.hour.toString().padLeft(2, '0')}:${_quietHoursEnd.minute.toString().padLeft(2, '0')}',
        ),
        fcmToken: _fcmToken,
      );

      // Mark onboarding as complete
      await UserService.completeOnboarding(widget.user.id);

      // Navigate to dashboard
      Navigator.pushAndRemoveUntil(
        context,
        MaterialPageRoute(builder: (context) => DashboardScreen()),
        (route) => false,
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('설정 저장 실패: ${e.toString()}')),
      );
    } finally {
      setState(() => _isLoading = false);
    }
  }
}

class _TimeSelector extends StatelessWidget {
  final String label;
  final TimeOfDay time;
  final VoidCallback onTap;

  const _TimeSelector({
    required this.label,
    required this.time,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Container(
        padding: EdgeInsets.all(16),
        decoration: BoxDecoration(
          border: Border.all(color: Colors.grey.shade300),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label, style: TextStyle(fontSize: 12, color: Colors.grey.shade600)),
            SizedBox(height: 4),
            Text(
              '${time.hour.toString().padLeft(2, '0')}:${time.minute.toString().padLeft(2, '0')}',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
          ],
        ),
      ),
    );
  }
}

// User Service
class UserService {
  static Future<void> updateNotificationSettings({
    required String userId,
    required NotificationSettings settings,
    String? fcmToken,
  }) async {
    await dio.patch('/users/$userId/notifications', data: {
      'newFlyers': settings.newFlyers,
      'pointsEarned': settings.pointsEarned,
      'marketing': settings.marketing,
      'quietHoursStart': settings.quietHoursStart,
      'quietHoursEnd': settings.quietHoursEnd,
      if (fcmToken != null) 'fcmToken': fcmToken,
    });
  }

  static Future<void> completeOnboarding(String userId) async {
    await dio.patch('/users/$userId/complete-onboarding');
  }
}

// Backend: Update Notification Settings
@Patch(':id/notifications')
@UseGuards(JwtAuthGuard)
async updateNotificationSettings(
  @Param('id') id: string,
  @Body() dto: UpdateNotificationSettingsDto,
) {
  const user = await this.userRepo.findOne({ where: { id } });

  user.notificationSettings = {
    newFlyers: dto.newFlyers,
    pointsEarned: dto.pointsEarned,
    marketing: dto.marketing,
    quietHoursStart: dto.quietHoursStart,
    quietHoursEnd: dto.quietHoursEnd,
  };

  if (dto.fcmToken) {
    user.fcmToken = dto.fcmToken;
  }

  await this.userRepo.save(user);

  return { message: 'Notification settings updated' };
}

@Patch(':id/complete-onboarding')
@UseGuards(JwtAuthGuard)
async completeOnboarding(@Param('id') id: string) {
  await this.userRepo.update(id, { isOnboardingComplete: true });
  return { message: 'Onboarding completed' };
}
```

## Dependencies

- **Depends on**: USR-001-05 (Interest Selection)
- **External**: Firebase Cloud Messaging (FCM)
- **Blocks**: Dashboard access

## Definition of Done

- [ ] All acceptance criteria met
- [ ] UI implemented
- [ ] Push permission request working
- [ ] FCM token stored
- [ ] Notification settings saved
- [ ] Onboarding complete flag set
- [ ] Tests passing
- [ ] Code reviewed and merged

## Notes

- FCM 토큰은 디바이스별 고유값
- Quiet Hours는 방해금지 시간 (기본: 22:00 ~ 09:00)
- 마케팅 알림은 선택 사항 (GDPR 준수)
- 온보딩 완료 후 대시보드로 이동
- 알림 설정은 나중에 프로필에서 수정 가능
