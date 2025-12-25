# Story USR-001-03: Social Login Integration

**Epic**: USR-001 User Onboarding & Registration
**Priority**: P0 (Critical)
**Story Points**: 3
**Status**: 📋 Planned

## User Story

**As a** new user
**I want to** sign up with Kakao/Naver/Google
**So that** I don't need to remember another password

## Acceptance Criteria

- [ ] 카카오 로그인 버튼
- [ ] 네이버 로그인 버튼
- [ ] 구글 로그인 버튼
- [ ] 자동 프로필 정보 가져오기
- [ ] 자동 회원가입 (첫 로그인 시)
- [ ] 약관 동의 화면 (소셜 로그인 시)

## Tasks

### Frontend
- [ ] Social login buttons UI
- [ ] Kakao SDK integration
- [ ] Naver SDK integration
- [ ] Google Sign-In integration
- [ ] OAuth callback handling
- [ ] Auto-fill profile from social data

### Backend
- [ ] Reuse social auth from CORE-001
- [ ] Auto-create user profile
- [ ] Link social account to user

### Testing
- [ ] Integration test: Kakao login
- [ ] Integration test: Naver login
- [ ] Integration test: Google login
- [ ] E2E test: Social login onboarding

## Technical Notes

```typescript
// Social Login Buttons (Flutter)
class SocialLoginButtons extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // Divider
        Row(
          children: [
            Expanded(child: Divider()),
            Padding(
              padding: EdgeInsets.symmetric(horizontal: 16),
              child: Text('또는', style: TextStyle(color: Colors.grey)),
            ),
            Expanded(child: Divider()),
          ],
        ),

        SizedBox(height: 20),

        // Kakao login
        _SocialLoginButton(
          label: '카카오로 시작하기',
          icon: 'assets/kakao_logo.png',
          backgroundColor: Color(0xFFFEE500),
          textColor: Color(0xFF000000),
          onPressed: () => _handleKakaoLogin(context),
        ),

        SizedBox(height: 12),

        // Naver login
        _SocialLoginButton(
          label: '네이버로 시작하기',
          icon: 'assets/naver_logo.png',
          backgroundColor: Color(0xFF03C75A),
          textColor: Colors.white,
          onPressed: () => _handleNaverLogin(context),
        ),

        SizedBox(height: 12),

        // Google login
        _SocialLoginButton(
          label: 'Google로 시작하기',
          icon: 'assets/google_logo.png',
          backgroundColor: Colors.white,
          textColor: Colors.black87,
          borderColor: Colors.grey.shade300,
          onPressed: () => _handleGoogleLogin(context),
        ),
      ],
    );
  }

  Future<void> _handleKakaoLogin(BuildContext context) async {
    try {
      final result = await AuthService.loginWithKakao();
      _handleSocialLoginResult(context, result);
    } catch (e) {
      _showError(context, '카카오 로그인 실패: ${e.toString()}');
    }
  }

  Future<void> _handleNaverLogin(BuildContext context) async {
    try {
      final result = await AuthService.loginWithNaver();
      _handleSocialLoginResult(context, result);
    } catch (e) {
      _showError(context, '네이버 로그인 실패: ${e.toString()}');
    }
  }

  Future<void> _handleGoogleLogin(BuildContext context) async {
    try {
      final result = await AuthService.loginWithGoogle();
      _handleSocialLoginResult(context, result);
    } catch (e) {
      _showError(context, 'Google 로그인 실패: ${e.toString()}');
    }
  }

  void _handleSocialLoginResult(BuildContext context, SocialLoginResult result) {
    if (result.isNewUser) {
      // Navigate to terms agreement for new users
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(
          builder: (context) => TermsAgreementScreen(
            socialProfile: result.profile,
          ),
        ),
      );
    } else {
      // Existing user - go to dashboard
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (context) => DashboardScreen()),
      );
    }
  }

  void _showError(BuildContext context, String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message)),
    );
  }
}

class _SocialLoginButton extends StatelessWidget {
  final String label;
  final String icon;
  final Color backgroundColor;
  final Color textColor;
  final Color? borderColor;
  final VoidCallback onPressed;

  const _SocialLoginButton({
    required this.label,
    required this.icon,
    required this.backgroundColor,
    required this.textColor,
    this.borderColor,
    required this.onPressed,
  });

  @override
  Widget build(BuildContext context) {
    return ElevatedButton(
      onPressed: onPressed,
      style: ElevatedButton.styleFrom(
        backgroundColor: backgroundColor,
        foregroundColor: textColor,
        minimumSize: Size(double.infinity, 50),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8),
          side: borderColor != null
              ? BorderSide(color: borderColor!)
              : BorderSide.none,
        ),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Image.asset(icon, width: 20, height: 20),
          SizedBox(width: 12),
          Text(label, style: TextStyle(fontSize: 16)),
        ],
      ),
    );
  }
}

// Auth Service - Social Login Methods
class AuthService {
  static Future<SocialLoginResult> loginWithKakao() async {
    // Initialize Kakao SDK
    await KakaoSdk.init(
      nativeAppKey: Config.kakaoNativeAppKey,
      javaScriptAppKey: Config.kakaoJavaScriptAppKey,
    );

    // Login
    OAuthToken token;
    if (await isKakaoTalkInstalled()) {
      token = await UserApi.instance.loginWithKakaoTalk();
    } else {
      token = await UserApi.instance.loginWithKakaoAccount();
    }

    // Get user info
    final kakaoUser = await UserApi.instance.me();

    // Call backend
    final response = await dio.post('/auth/kakao', data: {
      'accessToken': token.accessToken,
      'kakaoId': kakaoUser.id.toString(),
      'email': kakaoUser.kakaoAccount?.email,
      'name': kakaoUser.kakaoAccount?.profile?.nickname,
      'profileImage': kakaoUser.kakaoAccount?.profile?.profileImageUrl,
    });

    return SocialLoginResult.fromJson(response.data);
  }

  static Future<SocialLoginResult> loginWithNaver() async {
    // Initialize Naver SDK
    final NaverLoginResult result = await FlutterNaverLogin.logIn();

    if (result.status == NaverLoginStatus.loggedIn) {
      final account = await FlutterNaverLogin.currentAccount();

      // Call backend
      final response = await dio.post('/auth/naver', data: {
        'accessToken': result.accessToken,
        'naverId': account.id,
        'email': account.email,
        'name': account.name,
        'profileImage': account.profileImage,
      });

      return SocialLoginResult.fromJson(response.data);
    } else {
      throw Exception('Naver login failed');
    }
  }

  static Future<SocialLoginResult> loginWithGoogle() async {
    final GoogleSignInAccount? googleUser = await GoogleSignIn().signIn();

    if (googleUser == null) {
      throw Exception('Google login cancelled');
    }

    final GoogleSignInAuthentication googleAuth = await googleUser.authentication;

    // Call backend
    final response = await dio.post('/auth/google', data: {
      'accessToken': googleAuth.accessToken,
      'googleId': googleUser.id,
      'email': googleUser.email,
      'name': googleUser.displayName,
      'profileImage': googleUser.photoUrl,
    });

    return SocialLoginResult.fromJson(response.data);
  }
}

// Social Login Result Model
class SocialLoginResult {
  final bool isNewUser;
  final String accessToken;
  final String refreshToken;
  final User user;
  final SocialProfile? profile;

  SocialLoginResult({
    required this.isNewUser,
    required this.accessToken,
    required this.refreshToken,
    required this.user,
    this.profile,
  });

  factory SocialLoginResult.fromJson(Map<String, dynamic> json) {
    return SocialLoginResult(
      isNewUser: json['isNewUser'] ?? false,
      accessToken: json['accessToken'],
      refreshToken: json['refreshToken'],
      user: User.fromJson(json['user']),
      profile: json['profile'] != null ? SocialProfile.fromJson(json['profile']) : null,
    );
  }
}

class SocialProfile {
  final String? name;
  final String? email;
  final String? profileImage;

  SocialProfile({this.name, this.email, this.profileImage});

  factory SocialProfile.fromJson(Map<String, dynamic> json) {
    return SocialProfile(
      name: json['name'],
      email: json['email'],
      profileImage: json['profileImage'],
    );
  }
}
```

## Dependencies

- **Depends on**: CORE-001 (Social Auth), USR-001-01 (Role Selection)
- **External**: Kakao/Naver/Google SDK
- **Blocks**: USR-001-07 (Terms for social users)

## Definition of Done

- [ ] All acceptance criteria met
- [ ] All SDKs integrated
- [ ] Social login buttons working
- [ ] Auto-profile from social data working
- [ ] New user flow working
- [ ] Existing user flow working
- [ ] Tests passing
- [ ] Code reviewed and merged

## Notes

- 카카오톡 앱 설치 여부에 따라 로그인 방식 분기
- 소셜 프로필 정보로 이름/이메일 자동 입력
- 신규 사용자는 약관 동의 화면으로 이동
- 기존 사용자는 바로 대시보드로 이동
- 소셜 계정 연동 해제 기능은 Profile 관리에서 제공
