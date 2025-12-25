# Story USR-001-04: Personal Information Input

**Epic**: USR-001 User Onboarding & Registration
**Priority**: P0 (Critical)
**Story Points**: 2
**Status**: 📋 Planned

## User Story

**As a** new user
**I want to** enter my basic information
**So that** Townin can personalize services

## Acceptance Criteria

- [ ] 이름 입력 (선택)
- [ ] 생년월일 입력 (선택)
- [ ] 성별 선택 (선택)
- [ ] Skip 가능
- [ ] 프로필 저장

## Tasks

### Frontend
- [ ] Personal info form component
- [ ] Date picker for birthdate
- [ ] Gender selection UI
- [ ] Skip button
- [ ] Form submission

### Backend
- [ ] PATCH /users/:id/profile endpoint
- [ ] Profile validation
- [ ] Update user entity

### Database
- [ ] Migration: Add profile fields to users table

### Testing
- [ ] Unit tests: Form validation
- [ ] Integration test: Profile update
- [ ] E2E test: Complete profile input

## Technical Notes

```typescript
// Personal Information Form (Flutter)
class PersonalInfoForm extends StatefulWidget {
  final User user;

  const PersonalInfoForm({required this.user});

  @override
  _PersonalInfoFormState createState() => _PersonalInfoFormState();
}

class _PersonalInfoFormState extends State<PersonalInfoForm> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  DateTime? _birthdate;
  Gender? _selectedGender;
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    // Pre-fill from social login if available
    _nameController.text = widget.user.name ?? '';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('프로필 정보'),
        actions: [
          TextButton(
            onPressed: _handleSkip,
            child: Text('Skip', style: TextStyle(color: Colors.grey)),
          ),
        ],
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: EdgeInsets.all(24),
          children: [
            Text(
              '기본 정보를 입력해주세요',
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
            SizedBox(height: 8),
            Text(
              '선택 사항입니다. 나중에 입력할 수 있어요.',
              style: TextStyle(fontSize: 14, color: Colors.grey.shade600),
            ),

            SizedBox(height: 40),

            // Name field
            TextFormField(
              controller: _nameController,
              decoration: InputDecoration(
                labelText: '이름 (선택)',
                hintText: '홍길동',
                prefixIcon: Icon(Icons.person),
              ),
              validator: (value) {
                if (value != null && value.isNotEmpty && value.length < 2) {
                  return '2자 이상 입력해주세요';
                }
                return null;
              },
            ),

            SizedBox(height: 20),

            // Birthdate picker
            InkWell(
              onTap: _selectBirthdate,
              child: InputDecorator(
                decoration: InputDecoration(
                  labelText: '생년월일 (선택)',
                  hintText: '1990-01-01',
                  prefixIcon: Icon(Icons.cake),
                  suffixIcon: Icon(Icons.calendar_today),
                ),
                child: Text(
                  _birthdate != null
                      ? DateFormat('yyyy-MM-dd').format(_birthdate!)
                      : '',
                  style: TextStyle(fontSize: 16),
                ),
              ),
            ),

            SizedBox(height: 20),

            // Gender selection
            Text('성별 (선택)', style: TextStyle(fontSize: 14, color: Colors.grey.shade700)),
            SizedBox(height: 12),
            Wrap(
              spacing: 12,
              children: [
                _GenderChip(
                  label: '남성',
                  icon: Icons.male,
                  isSelected: _selectedGender == Gender.MALE,
                  onTap: () => setState(() => _selectedGender = Gender.MALE),
                ),
                _GenderChip(
                  label: '여성',
                  icon: Icons.female,
                  isSelected: _selectedGender == Gender.FEMALE,
                  onTap: () => setState(() => _selectedGender = Gender.FEMALE),
                ),
                _GenderChip(
                  label: '선택 안 함',
                  icon: Icons.person,
                  isSelected: _selectedGender == Gender.PREFER_NOT_TO_SAY,
                  onTap: () => setState(() => _selectedGender = Gender.PREFER_NOT_TO_SAY),
                ),
              ],
            ),

            SizedBox(height: 60),

            // Next button
            ElevatedButton(
              onPressed: _isLoading ? null : _handleSubmit,
              child: _isLoading
                  ? CircularProgressIndicator()
                  : Text('다음'),
              style: ElevatedButton.styleFrom(
                minimumSize: Size(double.infinity, 50),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _selectBirthdate() async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: DateTime(2000),
      firstDate: DateTime(1900),
      lastDate: DateTime.now(),
      locale: Locale('ko', 'KR'),
    );

    if (picked != null) {
      setState(() => _birthdate = picked);
    }
  }

  Future<void> _handleSubmit() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    try {
      await UserService.updateProfile(
        userId: widget.user.id,
        name: _nameController.text.isNotEmpty ? _nameController.text : null,
        birthdate: _birthdate,
        gender: _selectedGender,
      );

      _navigateToNext();
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('프로필 저장 실패: ${e.toString()}')),
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
        builder: (context) => InterestSelectionScreen(user: widget.user),
      ),
    );
  }

  @override
  void dispose() {
    _nameController.dispose();
    super.dispose();
  }
}

class _GenderChip extends StatelessWidget {
  final String label;
  final IconData icon;
  final bool isSelected;
  final VoidCallback onTap;

  const _GenderChip({
    required this.label,
    required this.icon,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return FilterChip(
      label: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 18),
          SizedBox(width: 6),
          Text(label),
        ],
      ),
      selected: isSelected,
      onSelected: (_) => onTap(),
      backgroundColor: Colors.grey.shade200,
      selectedColor: Color(0xFFF5A623).withOpacity(0.2),
      checkmarkColor: Color(0xFFF5A623),
    );
  }
}

// User Service
class UserService {
  static Future<User> updateProfile({
    required String userId,
    String? name,
    DateTime? birthdate,
    Gender? gender,
  }) async {
    final response = await dio.patch('/users/$userId/profile', data: {
      if (name != null) 'name': name,
      if (birthdate != null) 'birthdate': birthdate.toIso8601String(),
      if (gender != null) 'gender': gender.toString().split('.').last.toLowerCase(),
    });

    return User.fromJson(response.data);
  }
}

// Backend: Update Profile Endpoint
@Patch(':id/profile')
@UseGuards(JwtAuthGuard)
async updateProfile(
  @Param('id') id: string,
  @Body() dto: UpdateProfileDto,
  @Req() req,
) {
  // Verify user can only update own profile
  if (req.user.id !== id) {
    throw new ForbiddenException('Cannot update other user profile');
  }

  const user = await this.userService.updateProfile(id, dto);
  return user;
}

// Update Profile DTO
export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @IsOptional()
  @IsDateString()
  birthdate?: string;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;
}
```

## Dependencies

- **Depends on**: USR-001-02 or USR-001-03 (Registration complete)
- **Blocks**: USR-001-05 (Interest Selection)

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Form implemented
- [ ] Date picker working
- [ ] Gender selection working
- [ ] Skip functionality working
- [ ] Profile update API working
- [ ] Migration run
- [ ] Tests passing
- [ ] Code reviewed and merged

## Notes

- 모든 필드는 선택 사항 (Skip 가능)
- 소셜 로그인 시 이름 자동 입력
- 생년월일은 과거만 선택 가능
- 성별은 "선택 안 함" 옵션 포함
- 프로필은 나중에 수정 가능
- 다음 단계: 관심 카테고리 선택
