# Story USR-001-02: Email/Password Registration

**Epic**: USR-001 User Onboarding & Registration
**Priority**: P0 (Critical)
**Story Points**: 3
**Status**: 📋 Planned

## User Story

**As a** new user
**I want to** register with email and password
**So that** I can create my account

## Acceptance Criteria

- [ ] 이메일 입력 및 검증
- [ ] 비밀번호 입력 (8자 이상, 영문+숫자)
- [ ] 비밀번호 확인 입력
- [ ] 중복 이메일 체크 (실시간)
- [ ] 인증 이메일 발송
- [ ] 역할 자동 설정 (User)

## Tasks

### Frontend
- [ ] Registration form component
- [ ] Email validation (format)
- [ ] Password strength indicator
- [ ] Password match validation
- [ ] Real-time duplicate email check API call
- [ ] Error message display
- [ ] Loading state

### Backend
- [ ] Reuse POST /auth/register from CORE-001
- [ ] Email uniqueness check endpoint
- [ ] Send verification email

### Testing
- [ ] Unit tests: Form validation
- [ ] Integration test: Registration API
- [ ] E2E test: Complete registration

## Technical Notes

```typescript
// Registration Form (Flutter)
class RegistrationForm extends StatefulWidget {
  final UserRole role;

  const RegistrationForm({required this.role});

  @override
  _RegistrationFormState createState() => _RegistrationFormState();
}

class _RegistrationFormState extends State<RegistrationForm> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();

  bool _isLoading = false;
  bool _isEmailAvailable = true;
  Timer? _debounce;

  @override
  Widget build(BuildContext context) {
    return Form(
      key: _formKey,
      child: Column(
        children: [
          // Email field
          TextFormField(
            controller: _emailController,
            decoration: InputDecoration(
              labelText: '이메일',
              hintText: 'example@email.com',
              suffixIcon: _isEmailAvailable
                  ? Icon(Icons.check_circle, color: Colors.green)
                  : Icon(Icons.error, color: Colors.red),
            ),
            keyboardType: TextInputType.emailAddress,
            validator: (value) {
              if (value == null || value.isEmpty) {
                return '이메일을 입력해주세요';
              }
              if (!RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$').hasMatch(value)) {
                return '올바른 이메일 형식이 아닙니다';
              }
              if (!_isEmailAvailable) {
                return '이미 사용 중인 이메일입니다';
              }
              return null;
            },
            onChanged: (value) {
              _checkEmailAvailability(value);
            },
          ),

          SizedBox(height: 20),

          // Password field
          TextFormField(
            controller: _passwordController,
            decoration: InputDecoration(
              labelText: '비밀번호',
              hintText: '8자 이상, 영문+숫자',
            ),
            obscureText: true,
            validator: (value) {
              if (value == null || value.isEmpty) {
                return '비밀번호를 입력해주세요';
              }
              if (value.length < 8) {
                return '8자 이상 입력해주세요';
              }
              if (!RegExp(r'^(?=.*[A-Za-z])(?=.*\d)').hasMatch(value)) {
                return '영문과 숫자를 포함해야 합니다';
              }
              return null;
            },
            onChanged: (value) {
              setState(() {}); // Trigger password strength update
            },
          ),

          // Password strength indicator
          if (_passwordController.text.isNotEmpty)
            Padding(
              padding: EdgeInsets.only(top: 8),
              child: _PasswordStrengthIndicator(
                password: _passwordController.text,
              ),
            ),

          SizedBox(height: 20),

          // Confirm password field
          TextFormField(
            controller: _confirmPasswordController,
            decoration: InputDecoration(
              labelText: '비밀번호 확인',
            ),
            obscureText: true,
            validator: (value) {
              if (value != _passwordController.text) {
                return '비밀번호가 일치하지 않습니다';
              }
              return null;
            },
          ),

          SizedBox(height: 40),

          // Submit button
          ElevatedButton(
            onPressed: _isLoading ? null : _handleSubmit,
            child: _isLoading
                ? CircularProgressIndicator()
                : Text('회원가입'),
            style: ElevatedButton.styleFrom(
              minimumSize: Size(double.infinity, 50),
            ),
          ),
        ],
      ),
    );
  }

  void _checkEmailAvailability(String email) {
    if (_debounce?.isActive ?? false) _debounce!.cancel();

    _debounce = Timer(Duration(milliseconds: 500), () async {
      if (email.isNotEmpty && RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$').hasMatch(email)) {
        try {
          final response = await AuthService.checkEmailAvailability(email);
          setState(() {
            _isEmailAvailable = response.isAvailable;
          });
        } catch (e) {
          // Handle error
        }
      }
    });
  }

  Future<void> _handleSubmit() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    try {
      await AuthService.register(
        email: _emailController.text,
        password: _passwordController.text,
        role: widget.role,
      );

      // Navigate to email verification screen
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(
          builder: (context) => EmailVerificationScreen(
            email: _emailController.text,
          ),
        ),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('회원가입 실패: ${e.toString()}')),
      );
    } finally {
      setState(() => _isLoading = false);
    }
  }

  @override
  void dispose() {
    _debounce?.cancel();
    _emailController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }
}

// Password Strength Indicator
class _PasswordStrengthIndicator extends StatelessWidget {
  final String password;

  const _PasswordStrengthIndicator({required this.password});

  PasswordStrength _calculateStrength() {
    if (password.length < 8) return PasswordStrength.weak;

    int score = 0;
    if (password.length >= 12) score++;
    if (RegExp(r'[A-Z]').hasMatch(password)) score++;
    if (RegExp(r'[a-z]').hasMatch(password)) score++;
    if (RegExp(r'\d').hasMatch(password)) score++;
    if (RegExp(r'[!@#$%^&*(),.?":{}|<>]').hasMatch(password)) score++;

    if (score >= 4) return PasswordStrength.strong;
    if (score >= 2) return PasswordStrength.medium;
    return PasswordStrength.weak;
  }

  @override
  Widget build(BuildContext context) {
    final strength = _calculateStrength();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Expanded(
              child: LinearProgressIndicator(
                value: strength == PasswordStrength.weak ? 0.33 :
                       strength == PasswordStrength.medium ? 0.66 : 1.0,
                backgroundColor: Colors.grey.shade300,
                valueColor: AlwaysStoppedAnimation(
                  strength == PasswordStrength.weak ? Colors.red :
                  strength == PasswordStrength.medium ? Colors.orange : Colors.green,
                ),
              ),
            ),
          ],
        ),
        SizedBox(height: 4),
        Text(
          strength == PasswordStrength.weak ? '약함' :
          strength == PasswordStrength.medium ? '보통' : '강함',
          style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
        ),
      ],
    );
  }
}

enum PasswordStrength { weak, medium, strong }

// Auth Service
class AuthService {
  static Future<CheckEmailResponse> checkEmailAvailability(String email) async {
    final response = await dio.get('/auth/check-email?email=$email');
    return CheckEmailResponse.fromJson(response.data);
  }

  static Future<AuthResponse> register({
    required String email,
    required String password,
    required UserRole role,
  }) async {
    final response = await dio.post('/auth/register', data: {
      'email': email,
      'password': password,
      'role': role.toString().split('.').last.toLowerCase(),
    });
    return AuthResponse.fromJson(response.data);
  }
}
```

## Dependencies

- **Depends on**: CORE-001 (Auth API), USR-001-01 (Role Selection)
- **Blocks**: USR-001-07 (Terms Agreement)

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Form validation working
- [ ] Real-time email check working
- [ ] Password strength indicator working
- [ ] Registration API integration working
- [ ] Email verification sent
- [ ] Tests passing
- [ ] Code reviewed and merged

## Notes

- 이메일 중복 체크는 500ms debounce
- 비밀번호 강도: 약함/보통/강함
- 소셜 로그인 옵션도 함께 표시
- 회원가입 완료 후 이메일 인증 화면으로 이동
- 역할(User)은 자동 설정
