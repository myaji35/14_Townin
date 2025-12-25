# Story MRC-001-01: Merchant Registration

**Epic**: MRC-001 Merchant Onboarding
**Priority**: P0 (Critical)
**Story Points**: 3
**Status**: 📋 Planned

## User Story

**As a** merchant
**I want to** register as a business owner
**So that** I can create digital flyers

## Acceptance Criteria

- [ ] 역할 선택 시 "상인" 선택
- [ ] 이메일/비밀번호 입력
- [ ] 사업자 등록 번호 입력 (10자리)
- [ ] 역할 자동 설정 (Merchant)
- [ ] 인증 이메일 발송
- [ ] 비밀번호 정책 검증
- [ ] 이메일 중복 검증

## Tasks

### Frontend
- [ ] Merchant registration screen
- [ ] Business registration number input
- [ ] Form validation
- [ ] Error handling

### Backend
- [ ] POST /auth/register (merchant role)
- [ ] Business number format validation
- [ ] Email uniqueness check
- [ ] User creation with Merchant role
- [ ] Send verification email

### Testing
- [ ] Unit tests: Business number validation
- [ ] Integration test: Merchant registration
- [ ] E2E test: Complete registration flow

## Technical Notes

```typescript
// Merchant Registration Screen (Flutter)
class MerchantRegistrationScreen extends StatefulWidget {
  @override
  _MerchantRegistrationScreenState createState() => _MerchantRegistrationScreenState();
}

class _MerchantRegistrationScreenState extends State<MerchantRegistrationScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  final _businessRegNumberController = TextEditingController();
  bool _isLoading = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('상인 회원가입'),
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: EdgeInsets.all(24),
          children: [
            Text(
              '사장님 환영합니다!',
              style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold),
            ),
            SizedBox(height: 8),
            Text(
              'Townin에서 디지털 전단지를 만들어보세요',
              style: TextStyle(fontSize: 16, color: Colors.grey.shade600),
            ),

            SizedBox(height: 40),

            // Email
            TextFormField(
              controller: _emailController,
              decoration: InputDecoration(
                labelText: '이메일',
                hintText: 'merchant@example.com',
                prefixIcon: Icon(Icons.email),
              ),
              keyboardType: TextInputType.emailAddress,
              validator: (value) {
                if (value == null || value.isEmpty) {
                  return '이메일을 입력해주세요';
                }
                if (!RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$').hasMatch(value)) {
                  return '올바른 이메일 형식이 아닙니다';
                }
                return null;
              },
            ),

            SizedBox(height: 20),

            // Password
            TextFormField(
              controller: _passwordController,
              decoration: InputDecoration(
                labelText: '비밀번호',
                hintText: '8자 이상, 영문+숫자',
                prefixIcon: Icon(Icons.lock),
              ),
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

            // Confirm Password
            TextFormField(
              controller: _confirmPasswordController,
              decoration: InputDecoration(
                labelText: '비밀번호 확인',
                prefixIcon: Icon(Icons.lock_outline),
              ),
              obscureText: true,
              validator: (value) {
                if (value != _passwordController.text) {
                  return '비밀번호가 일치하지 않습니다';
                }
                return null;
              },
            ),

            SizedBox(height: 20),

            // Business Registration Number
            TextFormField(
              controller: _businessRegNumberController,
              decoration: InputDecoration(
                labelText: '사업자 등록 번호',
                hintText: '123-45-67890',
                prefixIcon: Icon(Icons.business),
                helperText: '10자리 숫자를 입력해주세요 (하이픈 자동)',
              ),
              keyboardType: TextInputType.number,
              inputFormatters: [
                FilteringTextInputFormatter.digitsOnly,
                LengthLimitingTextInputFormatter(10),
                _BusinessNumberFormatter(),
              ],
              validator: (value) {
                if (value == null || value.isEmpty) {
                  return '사업자 등록 번호를 입력해주세요';
                }
                final digitsOnly = value.replaceAll('-', '');
                if (digitsOnly.length != 10) {
                  return '10자리 숫자를 입력해주세요';
                }
                return null;
              },
            ),

            SizedBox(height: 40),

            // Register Button
            ElevatedButton(
              onPressed: _isLoading ? null : _handleRegister,
              child: _isLoading
                  ? CircularProgressIndicator()
                  : Text('회원가입'),
              style: ElevatedButton.styleFrom(
                minimumSize: Size(double.infinity, 56),
                backgroundColor: Color(0xFFF5A623),
              ),
            ),

            SizedBox(height: 16),

            // Login Link
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text('이미 계정이 있으신가요?'),
                TextButton(
                  onPressed: () => Navigator.pop(context),
                  child: Text('로그인'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _handleRegister() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    try {
      await AuthService.registerMerchant(
        email: _emailController.text,
        password: _passwordController.text,
        businessRegistrationNumber: _businessRegNumberController.text.replaceAll('-', ''),
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

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('인증 이메일이 발송되었습니다'),
          backgroundColor: Colors.green,
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
    _emailController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    _businessRegNumberController.dispose();
    super.dispose();
  }
}

// Business Number Formatter
class _BusinessNumberFormatter extends TextInputFormatter {
  @override
  TextEditingValue formatEditUpdate(
    TextEditingValue oldValue,
    TextEditingValue newValue,
  ) {
    final text = newValue.text.replaceAll('-', '');

    if (text.length <= 3) {
      return newValue;
    } else if (text.length <= 5) {
      return TextEditingValue(
        text: '${text.substring(0, 3)}-${text.substring(3)}',
        selection: TextSelection.collapsed(offset: text.length + 1),
      );
    } else {
      return TextEditingValue(
        text: '${text.substring(0, 3)}-${text.substring(3, 5)}-${text.substring(5)}',
        selection: TextSelection.collapsed(offset: text.length + 2),
      );
    }
  }
}

// Auth Service
class AuthService {
  static Future<void> registerMerchant({
    required String email,
    required String password,
    required String businessRegistrationNumber,
  }) async {
    await dio.post('/auth/register', data: {
      'email': email,
      'password': password,
      'role': 'merchant',
      'businessRegistrationNumber': businessRegistrationNumber,
    });
  }
}

// Backend: Merchant Registration Endpoint
@Post('register')
async register(@Body() dto: RegisterDto) {
  // Validate business registration number format
  if (dto.role === UserRole.MERCHANT) {
    if (!dto.businessRegistrationNumber) {
      throw new BadRequestException('Business registration number is required for merchants');
    }

    const businessRegNumber = dto.businessRegistrationNumber.replace(/[^0-9]/g, '');
    if (businessRegNumber.length !== 10) {
      throw new BadRequestException('Invalid business registration number format');
    }

    // Check if business number already exists
    const existingMerchant = await this.userRepo.findOne({
      where: { businessRegistrationNumber: businessRegNumber },
    });

    if (existingMerchant) {
      throw new ConflictException('Business registration number already in use');
    }
  }

  // Check email uniqueness
  const existingUser = await this.userRepo.findOne({
    where: { email: dto.email },
  });

  if (existingUser) {
    throw new ConflictException('Email already in use');
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(dto.password, 10);

  // Create user
  const user = this.userRepo.create({
    email: dto.email,
    password: hashedPassword,
    role: dto.role || UserRole.USER,
    businessRegistrationNumber: dto.role === UserRole.MERCHANT
      ? dto.businessRegistrationNumber.replace(/[^0-9]/g, '')
      : null,
    emailVerified: false,
  });

  await this.userRepo.save(user);

  // Send verification email
  await this.emailService.sendVerificationEmail(user.email, user.id);

  return {
    message: 'Registration successful. Please check your email to verify your account.',
    userId: user.id,
  };
}

// Register DTO (Extended)
export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)/, {
    message: 'Password must contain letters and numbers',
  })
  password: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsString()
  @Matches(/^[0-9]{10}$/, {
    message: 'Business registration number must be 10 digits',
  })
  businessRegistrationNumber?: string;
}

// User Entity (Extended)
@Entity('users')
export class User {
  // ... existing fields

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({ nullable: true })
  @Index()
  businessRegistrationNumber: string;

  @Column({ default: false })
  isBusinessVerified: boolean;
}

export enum UserRole {
  USER = 'user',
  MERCHANT = 'merchant',
  SECURITY_GUARD = 'security_guard',
  MUNICIPALITY = 'municipality',
  SUPER_ADMIN = 'super_admin',
}
```

## Dependencies

- **Depends on**: CORE-001 (Authentication)
- **Blocks**: MRC-001-02

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Merchant registration UI implemented
- [ ] Business number input working
- [ ] Form validation working
- [ ] Backend endpoint working
- [ ] Email verification sent
- [ ] Tests passing
- [ ] Code reviewed and merged

## Notes

- 사업자 등록 번호: 10자리 숫자 (123-45-67890 형식)
- 비밀번호: 8자 이상, 영문+숫자 필수
- 역할 자동 설정: Merchant
- 인증 이메일 발송 필수
- 사업자 번호 중복 검증
- 이메일 중복 검증
- Phase 2에서 국세청 API 연동 추가
