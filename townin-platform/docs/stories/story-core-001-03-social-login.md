# Story CORE-001-03: Social Login (Kakao/Naver/Google)

**Epic**: CORE-001 Authentication & Authorization System
**Priority**: P0 (Critical)
**Story Points**: 5
**Status**: 📋 Planned

## User Story

**As a** new user
**I want to** log in with social accounts
**So that** I don't need to remember another password

## Acceptance Criteria

- [ ] 카카오 OAuth 2.0 연동
- [ ] 네이버 OAuth 2.0 연동
- [ ] 구글 OAuth 2.0 연동
- [ ] 소셜 계정 프로필 정보 가져오기 (이메일, 이름, 프로필 사진)
- [ ] 자동 회원가입 (첫 로그인 시)
- [ ] 기존 이메일 계정과 연동
- [ ] JWT Token 발급 (Access + Refresh)

## Tasks

### Backend
- [ ] Passport.js 설정
- [ ] Kakao Strategy 구현
- [ ] Naver Strategy 구현
- [ ] Google Strategy 구현
- [ ] Social profile to User mapping
- [ ] Auto-registration for new users
- [ ] Link social account to existing email
- [ ] GET /auth/kakao (redirect)
- [ ] GET /auth/kakao/callback
- [ ] GET /auth/naver (redirect)
- [ ] GET /auth/naver/callback
- [ ] GET /auth/google (redirect)
- [ ] GET /auth/google/callback

### Frontend
- [ ] Social login buttons (Kakao, Naver, Google)
- [ ] OAuth redirect handling
- [ ] Callback page with token extraction
- [ ] Error handling (OAuth failed, email conflict)
- [ ] Success redirect to dashboard

### Testing
- [ ] Unit tests: social profile mapping
- [ ] Integration test: Kakao login flow
- [ ] Integration test: Naver login flow
- [ ] Integration test: Google login flow
- [ ] E2E test: social login → auto registration
- [ ] E2E test: social login → link to existing account

## Technical Notes

```typescript
// Kakao Strategy
@Injectable()
export class KakaoStrategy extends PassportStrategy(Strategy, 'kakao') {
  constructor() {
    super({
      clientID: process.env.KAKAO_CLIENT_ID,
      clientSecret: process.env.KAKAO_CLIENT_SECRET,
      callbackURL: process.env.KAKAO_CALLBACK_URL,
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
  ): Promise<any> {
    const { id, username, _json } = profile;
    return {
      kakaoId: id,
      email: _json.kakao_account.email,
      name: _json.properties.nickname,
      profileImage: _json.properties.profile_image,
    };
  }
}

// Social Login Controller
@Get('kakao')
@UseGuards(AuthGuard('kakao'))
async kakaoLogin() {
  // Redirects to Kakao OAuth
}

@Get('kakao/callback')
@UseGuards(AuthGuard('kakao'))
async kakaoCallback(@Req() req, @Res() res) {
  const user = await this.authService.socialLogin(req.user, 'kakao');
  const { accessToken, refreshToken } = await this.authService.generateTokens(user);

  res.cookie('refreshToken', refreshToken, { httpOnly: true });
  res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${accessToken}`);
}

// Social Login Service
async socialLogin(profile: SocialProfile, provider: string): Promise<User> {
  let user = await this.userRepository.findOne({
    where: { [`${provider}Id`]: profile[`${provider}Id`] }
  });

  if (!user) {
    // Check if email already exists
    user = await this.userRepository.findOne({ where: { email: profile.email } });

    if (user) {
      // Link social account to existing user
      user[`${provider}Id`] = profile[`${provider}Id`];
    } else {
      // Create new user
      user = this.userRepository.create({
        email: profile.email,
        name: profile.name,
        [`${provider}Id`]: profile[`${provider}Id`],
        isEmailVerified: true, // Trust social provider
        role: UserRole.USER,
      });
    }

    await this.userRepository.save(user);
  }

  return user;
}
```

## Dependencies

- **Depends on**: CORE-001-01 (User Entity), Kakao/Naver/Google OAuth apps
- **External APIs**: Kakao OAuth 2.0, Naver OAuth 2.0, Google OAuth 2.0
- **Blocks**: Social-based user onboarding

## Definition of Done

- [ ] All acceptance criteria met
- [ ] All tasks completed
- [ ] Unit tests passing
- [ ] Integration tests passing (all 3 providers)
- [ ] Code reviewed and merged
- [ ] API documentation updated (Swagger)
- [ ] OAuth apps configured (Kakao/Naver/Google)
- [ ] Environment variables set
- [ ] Security audit passed

## Notes

- 카카오 로그인 우선 구현 (한국 시장 점유율 1위)
- 소셜 로그인은 이메일 인증 자동 완료 (isEmailVerified: true)
- 비밀번호 없는 소셜 전용 계정 지원 (password: null)
- 기존 이메일 계정에 소셜 계정 연동 가능
- 소셜 프로필 사진은 User 테이블에 저장
- OAuth Redirect URL은 환경변수로 관리 (dev/prod 분리)
