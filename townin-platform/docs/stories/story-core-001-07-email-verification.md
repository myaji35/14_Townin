# Story CORE-001-07: Email Verification

**Epic**: CORE-001 Authentication & Authorization System
**Priority**: P0 (Critical)
**Story Points**: 2
**Status**: 📋 Planned

## User Story

**As a** new user
**I want to** verify my email address
**So that** the platform knows I'm a real user

## Acceptance Criteria

- [ ] 회원가입 시 인증 이메일 발송
- [ ] 이메일 링크 클릭으로 인증
- [ ] 인증 토큰 검증 (24시간 유효)
- [ ] 인증 완료 후 리다이렉트
- [ ] 재전송 기능
- [ ] 인증 상태 표시 (isEmailVerified)

## Tasks

### Backend
- [ ] Email verification token generation (JWT, 24h)
- [ ] GET /auth/verify-email/:token API 구현
- [ ] POST /auth/resend-verification API 구현
- [ ] Send verification email (NodeMailer)
- [ ] Update user.isEmailVerified = true
- [ ] Token validation and expiry check
- [ ] Rate limiting for resend (3 times/hour)

### Frontend
- [ ] Verification success page
- [ ] Email verification banner (unverified users)
- [ ] Resend verification button
- [ ] Success/error messages
- [ ] Redirect to dashboard after verification

### Testing
- [ ] Unit tests: Token generation
- [ ] Unit tests: Token validation
- [ ] Integration test: Verify email with valid token
- [ ] Integration test: Verify email with expired token
- [ ] Integration test: Resend verification email
- [ ] E2E test: Complete email verification flow

## Technical Notes

```typescript
// Backend: Generate Verification Token
async sendVerificationEmail(user: User) {
  const verificationToken = this.jwtService.sign(
    { sub: user.id, email: user.email, type: 'email_verification' },
    {
      secret: process.env.JWT_EMAIL_SECRET,
      expiresIn: '24h',
    }
  );

  // Store in Redis (optional, for tracking)
  await this.redis.set(
    `verify:${user.id}`,
    verificationToken,
    'EX',
    24 * 60 * 60
  );

  const verificationLink = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
  await this.emailService.sendVerificationEmail(user.email, verificationLink);
}

// Backend: Verify Email
@Get('verify-email/:token')
async verifyEmail(@Param('token') token: string) {
  // Verify token
  let payload;
  try {
    payload = await this.jwtService.verifyAsync(token, {
      secret: process.env.JWT_EMAIL_SECRET,
    });
  } catch (error) {
    throw new UnauthorizedException('Invalid or expired verification token');
  }

  if (payload.type !== 'email_verification') {
    throw new UnauthorizedException('Invalid token type');
  }

  // Update user
  const user = await this.userService.findById(payload.sub);

  if (user.isEmailVerified) {
    return { message: 'Email already verified' };
  }

  user.isEmailVerified = true;
  await this.userService.save(user);

  // Delete token from Redis
  await this.redis.del(`verify:${user.id}`);

  return {
    message: 'Email verified successfully',
    user: {
      id: user.id,
      email: user.email,
      isEmailVerified: true,
    },
  };
}

// Backend: Resend Verification
@Post('resend-verification')
@UseGuards(JwtAuthGuard)
async resendVerification(@Req() req) {
  const user = req.user;

  if (user.isEmailVerified) {
    throw new BadRequestException('Email already verified');
  }

  // Rate limiting (3 times/hour)
  const resendCount = await this.redis.get(`resend:${user.id}`);
  if (resendCount && parseInt(resendCount) >= 3) {
    throw new TooManyRequestsException('Too many requests. Try again later.');
  }

  await this.sendVerificationEmail(user);

  // Increment counter
  await this.redis.incr(`resend:${user.id}`);
  await this.redis.expire(`resend:${user.id}`, 3600);

  return { message: 'Verification email sent' };
}

// Email Template: Verification Email
Subject: Verify Your Email - Townin

Hi {{ name }},

Welcome to Townin! Please verify your email address by clicking the link below:

{{ verificationLink }}

This link will expire in 24 hours.

If you didn't create this account, please ignore this email.

Thanks,
Townin Team

// Frontend: Verification Banner
const VerificationBanner = () => {
  const user = useAuth();
  const [loading, setLoading] = useState(false);

  const handleResend = async () => {
    setLoading(true);
    try {
      await axios.post('/auth/resend-verification');
      toast.success('Verification email sent');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send email');
    } finally {
      setLoading(false);
    }
  };

  if (user?.isEmailVerified) return null;

  return (
    <div className="verification-banner">
      <p>Please verify your email address</p>
      <button onClick={handleResend} disabled={loading}>
        {loading ? 'Sending...' : 'Resend Email'}
      </button>
    </div>
  );
};

// Frontend: Verification Page
const VerifyEmailPage = () => {
  const { token } = useParams();
  const [status, setStatus] = useState('verifying');

  useEffect(() => {
    const verify = async () => {
      try {
        await axios.get(`/auth/verify-email/${token}`);
        setStatus('success');
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 2000);
      } catch (error) {
        setStatus('error');
      }
    };
    verify();
  }, [token]);

  if (status === 'verifying') {
    return <div>Verifying your email...</div>;
  }

  if (status === 'success') {
    return (
      <div>
        <h1>Email Verified!</h1>
        <p>Redirecting to dashboard...</p>
      </div>
    );
  }

  return (
    <div>
      <h1>Verification Failed</h1>
      <p>The link may have expired or is invalid.</p>
      <Link to="/dashboard">Go to Dashboard</Link>
    </div>
  );
};
```

## Dependencies

- **Depends on**: CORE-001-01 (Registration), Email service
- **Blocks**: Features requiring verified email (e.g., premium features)

## Definition of Done

- [ ] All acceptance criteria met
- [ ] All tasks completed
- [ ] Unit tests passing
- [ ] Integration tests passing
- [ ] Code reviewed and merged
- [ ] API documentation updated (Swagger)
- [ ] Email template created
- [ ] Rate limiting configured
- [ ] Frontend banner and page implemented

## Notes

- 이메일 인증은 24시간 유효
- 소셜 로그인 사용자는 자동 인증 (isEmailVerified: true)
- 인증 안 된 사용자는 일부 기능 제한 가능 (선택적)
- 재전송은 1시간에 3회로 제한
- 인증 완료 후 대시보드로 자동 리다이렉트
- 이메일 변경 시 재인증 필요 (Phase 2)
