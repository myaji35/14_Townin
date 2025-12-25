# Story USR-001-08: User Profile Management

**Epic**: USR-001 User Onboarding & Registration
**Priority**: P0 (Critical)
**Story Points**: 4
**Status**: 📋 Planned

## User Story

**As a** registered user
**I want to** view and edit my profile
**So that** I can keep my information up to date

## Acceptance Criteria

- [ ] 프로필 조회 화면
- [ ] 프로필 수정 화면
- [ ] 이메일 변경 (재인증 필요)
- [ ] 비밀번호 변경
- [ ] 관심 카테고리 수정
- [ ] 알림 설정 수정
- [ ] 계정 탈퇴

## Tasks

### Frontend
- [ ] Profile view screen
- [ ] Profile edit screen
- [ ] Email change with verification
- [ ] Password change form
- [ ] Interest edit screen
- [ ] Notification settings screen
- [ ] Account deletion confirmation

### Backend
- [ ] GET /users/me endpoint
- [ ] PATCH /users/me endpoint
- [ ] PATCH /users/me/email endpoint
- [ ] PATCH /users/me/password endpoint
- [ ] DELETE /users/me endpoint (soft delete)

### Testing
- [ ] Unit tests: Form validation
- [ ] Integration test: Profile CRUD
- [ ] E2E test: Profile editing
- [ ] E2E test: Account deletion

## Technical Notes

```typescript
// Profile View Screen
class ProfileViewScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('내 프로필'),
        actions: [
          IconButton(
            icon: Icon(Icons.edit),
            onPressed: () => Navigator.push(
              context,
              MaterialPageRoute(builder: (context) => ProfileEditScreen()),
            ),
          ),
        ],
      ),
      body: FutureBuilder<User>(
        future: UserService.getCurrentUser(),
        builder: (context, snapshot) {
          if (!snapshot.hasData) {
            return Center(child: CircularProgressIndicator());
          }

          final user = snapshot.data!;

          return ListView(
            children: [
              // Profile header
              Container(
                padding: EdgeInsets.all(24),
                child: Column(
                  children: [
                    CircleAvatar(
                      radius: 50,
                      backgroundColor: Color(0xFFF5A623),
                      child: Text(
                        user.name?.substring(0, 1) ?? user.email.substring(0, 1).toUpperCase(),
                        style: TextStyle(fontSize: 32, color: Colors.white),
                      ),
                    ),
                    SizedBox(height: 16),
                    Text(
                      user.name ?? '사용자',
                      style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                    ),
                    Text(
                      user.email,
                      style: TextStyle(fontSize: 14, color: Colors.grey),
                    ),
                  ],
                ),
              ),

              Divider(),

              // Profile sections
              _ProfileSection(
                title: '기본 정보',
                items: [
                  _ProfileItem(
                    label: '이름',
                    value: user.name ?? '미설정',
                    onTap: () {},
                  ),
                  _ProfileItem(
                    label: '생년월일',
                    value: user.birthdate != null
                        ? DateFormat('yyyy-MM-dd').format(user.birthdate!)
                        : '미설정',
                    onTap: () {},
                  ),
                  _ProfileItem(
                    label: '성별',
                    value: _getGenderLabel(user.gender),
                    onTap: () {},
                  ),
                ],
              ),

              _ProfileSection(
                title: '계정',
                items: [
                  _ProfileItem(
                    label: '이메일',
                    value: user.email,
                    trailing: Icon(Icons.chevron_right),
                    onTap: () => Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => EmailChangeScreen()),
                    ),
                  ),
                  if (user.password != null)
                    _ProfileItem(
                      label: '비밀번호',
                      value: '••••••••',
                      trailing: Icon(Icons.chevron_right),
                      onTap: () => Navigator.push(
                        context,
                        MaterialPageRoute(builder: (context) => PasswordChangeScreen()),
                      ),
                    ),
                ],
              ),

              _ProfileSection(
                title: '선호 설정',
                items: [
                  _ProfileItem(
                    label: '관심 카테고리',
                    value: '${user.interests.length}개 선택됨',
                    trailing: Icon(Icons.chevron_right),
                    onTap: () => Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => InterestEditScreen()),
                    ),
                  ),
                  _ProfileItem(
                    label: '알림 설정',
                    trailing: Icon(Icons.chevron_right),
                    onTap: () => Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => NotificationSettingsScreen()),
                    ),
                  ),
                ],
              ),

              _ProfileSection(
                title: '기타',
                items: [
                  _ProfileItem(
                    label: '약관 및 정책',
                    trailing: Icon(Icons.chevron_right),
                    onTap: () {},
                  ),
                  _ProfileItem(
                    label: '계정 탈퇴',
                    valueColor: Colors.red,
                    trailing: Icon(Icons.chevron_right),
                    onTap: () => _showAccountDeletionDialog(context),
                  ),
                ],
              ),
            ],
          );
        },
      ),
    );
  }

  String _getGenderLabel(Gender? gender) {
    switch (gender) {
      case Gender.MALE:
        return '남성';
      case Gender.FEMALE:
        return '여성';
      case Gender.OTHER:
        return '기타';
      default:
        return '미설정';
    }
  }

  Future<void> _showAccountDeletionDialog(BuildContext context) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('계정 탈퇴'),
        content: Text(
          '정말로 계정을 탈퇴하시겠습니까?\n\n'
          '탈퇴 시 모든 데이터가 삭제되며 복구할 수 없습니다.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: Text('취소'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            style: TextButton.styleFrom(foregroundColor: Colors.red),
            child: Text('탈퇴'),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      try {
        await UserService.deleteAccount();
        // Navigate to login
        Navigator.pushAndRemoveUntil(
          context,
          MaterialPageRoute(builder: (context) => LoginScreen()),
          (route) => false,
        );
      } catch (e) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('계정 탈퇴 실패: ${e.toString()}')),
        );
      }
    }
  }
}

// Password Change Screen
class PasswordChangeScreen extends StatefulWidget {
  @override
  _PasswordChangeScreenState createState() => _PasswordChangeScreenState();
}

class _PasswordChangeScreenState extends State<PasswordChangeScreen> {
  final _formKey = GlobalKey<FormState>();
  final _currentPasswordController = TextEditingController();
  final _newPasswordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  bool _isLoading = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('비밀번호 변경')),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: EdgeInsets.all(24),
          children: [
            TextFormField(
              controller: _currentPasswordController,
              decoration: InputDecoration(labelText: '현재 비밀번호'),
              obscureText: true,
              validator: (value) {
                if (value == null || value.isEmpty) {
                  return '현재 비밀번호를 입력해주세요';
                }
                return null;
              },
            ),
            SizedBox(height: 20),
            TextFormField(
              controller: _newPasswordController,
              decoration: InputDecoration(labelText: '새 비밀번호'),
              obscureText: true,
              validator: (value) {
                if (value == null || value.length < 8) {
                  return '8자 이상 입력해주세요';
                }
                if (!RegExp(r'^(?=.*[A-Za-z])(?=.*\d)').hasMatch(value)) {
                  return '영문과 숫자를 포함해야 합니다';
                }
                return null;
              },
            ),
            SizedBox(height: 20),
            TextFormField(
              controller: _confirmPasswordController,
              decoration: InputDecoration(labelText: '새 비밀번호 확인'),
              obscureText: true,
              validator: (value) {
                if (value != _newPasswordController.text) {
                  return '비밀번호가 일치하지 않습니다';
                }
                return null;
              },
            ),
            SizedBox(height: 40),
            ElevatedButton(
              onPressed: _isLoading ? null : _handleSubmit,
              child: _isLoading ? CircularProgressIndicator() : Text('변경'),
              style: ElevatedButton.styleFrom(minimumSize: Size(double.infinity, 50)),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _handleSubmit() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    try {
      await UserService.changePassword(
        currentPassword: _currentPasswordController.text,
        newPassword: _newPasswordController.text,
      );

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('비밀번호가 변경되었습니다')),
      );

      Navigator.pop(context);
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('비밀번호 변경 실패: ${e.toString()}')),
      );
    } finally {
      setState(() => _isLoading = false);
    }
  }

  @override
  void dispose() {
    _currentPasswordController.dispose();
    _newPasswordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }
}

// User Service
class UserService {
  static Future<User> getCurrentUser() async {
    final response = await dio.get('/users/me');
    return User.fromJson(response.data);
  }

  static Future<User> updateProfile(UpdateProfileDto dto) async {
    final response = await dio.patch('/users/me', data: dto.toJson());
    return User.fromJson(response.data);
  }

  static Future<void> changePassword({
    required String currentPassword,
    required String newPassword,
  }) async {
    await dio.patch('/users/me/password', data: {
      'currentPassword': currentPassword,
      'newPassword': newPassword,
    });
  }

  static Future<void> deleteAccount() async {
    await dio.delete('/users/me');
  }
}

// Backend: User Profile Endpoints
@Get('me')
@UseGuards(JwtAuthGuard)
async getCurrentUser(@Req() req) {
  const user = await this.userRepo.findOne({
    where: { id: req.user.id },
    relations: ['interests', 'hubs'],
  });

  return user;
}

@Patch('me/password')
@UseGuards(JwtAuthGuard)
async changePassword(@Req() req, @Body() dto: ChangePasswordDto) {
  const user = await this.userRepo.findOne({ where: { id: req.user.id } });

  const isPasswordValid = await bcrypt.compare(dto.currentPassword, user.password);
  if (!isPasswordValid) {
    throw new BadRequestException('Current password is incorrect');
  }

  user.password = await bcrypt.hash(dto.newPassword, 10);
  await this.userRepo.save(user);

  return { message: 'Password changed successfully' };
}

@Delete('me')
@UseGuards(JwtAuthGuard)
async deleteAccount(@Req() req) {
  await this.userRepo.update(req.user.id, {
    isActive: false,
    deletedAt: new Date(),
  });

  return { message: 'Account deleted successfully' };
}
```

## Dependencies

- **Depends on**: All onboarding complete
- **Blocks**: None

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Profile view implemented
- [ ] Profile edit working
- [ ] Password change working
- [ ] Account deletion working
- [ ] All APIs working
- [ ] Tests passing
- [ ] Code reviewed and merged

## Notes

- 프로필 수정은 언제든지 가능
- 이메일 변경 시 재인증 필요
- 비밀번호 변경 시 현재 비밀번호 확인
- 계정 탈퇴는 soft delete (복구 가능 기간 30일)
- 소셜 로그인 사용자는 비밀번호 변경 불가
- 관심 카테고리는 별도 화면에서 수정
