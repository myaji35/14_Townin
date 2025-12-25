# Story CORE-001-06: Password Reset

**Epic**: CORE-001 Authentication & Authorization System
**Priority**: P0 (Critical)
**Story Points**: 3
**Status**: 📋 Planned

## User Story

**As a** user who forgot password
**I want to** reset my password via email
**So that** I can regain access to my account

## Acceptance Criteria

- [ ] 비밀번호 찾기 요청 (이메일 입력)
- [ ] 재설정 링크 이메일 발송
- [ ] 토큰 기반 비밀번호 재설정 (1시간 유효)
- [ ] 새 비밀번호 설정
- [ ] 재설정 후 자동 로그인
- [ ] 재설정 완료 알림 이메일 발송

## Tasks

### Backend
- [ ] POST /auth/forgot-password API 구현
- [ ] POST /auth/reset-password/:token API 구현
- [ ] Reset token generation (JWT, 1 hour expiry)
- [ ] Reset token validation
- [ ] Send password reset email (NodeMailer)
- [ ] Password update with bcrypt hashing
- [ ] Invalidate all existing refresh tokens
- [ ] Send confirmation email

### Frontend
- [ ] Forgot password form
- [ ] Email input with validation
- [ ] Success message (check email)
- [ ] Reset password page (from email link)
- [ ] New password input with strength indicator
- [ ] Confirm password validation
- [ ] Success message and redirect to login
- [ ] Error handling (expired token, invalid token)

### Testing
- [ ] Unit tests: Reset token generation
- [ ] Unit tests: Token validation
- [ ] Integration test: Request password reset
- [ ] Integration test: Reset password with valid token
- [ ] Integration test: Reset password with expired token
- [ ] E2E test: Complete password reset flow

## Technical Notes

```typescript
// Forgot Password DTO
export class ForgotPasswordDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

// Reset Password DTO
export class ResetPasswordDto {
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)/, {
    message: 'Password must contain letters and numbers'
  })
  password: string;

  @IsString()
  @IsNotEmpty()
  confirmPassword: string;
}

// Backend: Forgot Password
@Post('forgot-password')
async forgotPassword(@Body() dto: ForgotPasswordDto) {
  const user = await this.userService.findByEmail(dto.email);

  if (!user) {
    // Don't reveal if email exists (security)
    return { message: 'If your email is registered, you will receive a reset link' };
  }

  // Generate reset token (JWT, 1 hour)
  const resetToken = this.jwtService.sign(
    { sub: user.id, type: 'password_reset' },
    {
      secret: process.env.JWT_RESET_SECRET,
      expiresIn: '1h'
    }
  );

  // Store token in Redis (for invalidation)
  await this.redis.set(`reset:${user.id}`, resetToken, 'EX', 3600);

  // Send email
  const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
  await this.emailService.sendPasswordResetEmail(user.email, resetLink);

  return { message: 'If your email is registered, you will receive a reset link' };
}

// Backend: Reset Password
@Post('reset-password/:token')
async resetPassword(
  @Param('token') token: string,
  @Body() dto: ResetPasswordDto,
) {
  // Validate password match
  if (dto.password !== dto.confirmPassword) {
    throw new BadRequestException('Passwords do not match');
  }

  // Verify token
  let payload;
  try {
    payload = await this.jwtService.verifyAsync(token, {
      secret: process.env.JWT_RESET_SECRET,
    });
  } catch (error) {
    throw new UnauthorizedException('Invalid or expired reset token');
  }

  // Check token type
  if (payload.type !== 'password_reset') {
    throw new UnauthorizedException('Invalid token type');
  }

  // Check if token exists in Redis
  const storedToken = await this.redis.get(`reset:${payload.sub}`);
  if (storedToken !== token) {
    throw new UnauthorizedException('Token already used or invalid');
  }

  // Update password
  const user = await this.userService.findById(payload.sub);
  user.password = await bcrypt.hash(dto.password, 10);
  await this.userService.save(user);

  // Invalidate reset token
  await this.redis.del(`reset:${payload.sub}`);

  // Invalidate all refresh tokens (force re-login on all devices)
  await this.redis.del(`refresh:${user.id}`);

  // Send confirmation email
  await this.emailService.sendPasswordChangedEmail(user.email);

  // Generate new tokens for auto-login
  const { accessToken, refreshToken } = await this.authService.generateTokens(user);

  return {
    message: 'Password reset successful',
    accessToken,
    refreshToken,
  };
}

// Email Template: Password Reset
Subject: Reset Your Password - Townin

Hi,

You requested to reset your password. Click the link below to create a new password:

{{ resetLink }}

This link will expire in 1 hour.

If you didn't request this, please ignore this email.

Thanks,
Townin Team

// Email Template: Password Changed Confirmation
Subject: Password Changed - Townin

Hi,

Your password has been successfully changed.

If you didn't make this change, please contact us immediately at support@townin.kr.

Thanks,
Townin Team
```

## Dependencies

- **Depends on**: CORE-001-01 (User), Email service (NodeMailer)
- **Blocks**: Account recovery features

## Definition of Done

- [ ] All acceptance criteria met
- [ ] All tasks completed
- [ ] Unit tests passing
- [ ] Integration tests passing
- [ ] Code reviewed and merged
- [ ] API documentation updated (Swagger)
- [ ] Email templates created
- [ ] Redis token storage working
- [ ] Security audit passed (token expiry, invalidation)

## Notes

- Reset token은 1회용 (사용 후 즉시 삭제)
- 이메일 존재 여부를 노출하지 않음 (보안)
- 비밀번호 재설정 시 모든 기기에서 로그아웃 (Refresh Token 무효화)
- 재설정 완료 후 자동 로그인 제공
- 소셜 로그인 전용 계정은 비밀번호 재설정 불가
- Rate limiting 적용 (5 requests/hour per email)
