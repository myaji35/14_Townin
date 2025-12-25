import { Controller, Post, Body, UseGuards, Get, Headers } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/user.entity';
import { RateLimitGuard, RateLimit } from '../../common/guards/rate-limit.guard';

@ApiTags('auth')
@Controller('auth')
@UseGuards(RateLimitGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @RateLimit({ ttl: 60, limit: 5 }) // 5 registrations per minute
  @ApiOperation({ summary: 'Register with email and password' })
  @ApiResponse({ status: 201, description: 'Registration successful' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @RateLimit({ ttl: 60, limit: 10 }) // 10 requests per minute
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshTokens(refreshTokenDto.refreshToken);
  }

  @Post('logout')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Logout and blacklist tokens' })
  @ApiResponse({ status: 200, description: 'Logged out successfully' })
  async logout(@Headers('authorization') auth: string, @Body('refreshToken') refreshToken: string) {
    const accessToken = auth?.replace('Bearer ', '');
    return this.authService.logout(accessToken, refreshToken);
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile(@CurrentUser() user: User) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      phone: user.phone,
      ageRange: user.ageRange,
      householdType: user.householdType,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
    };
  }

  // ========== Social Login Endpoints ==========

  /**
   * GET /api/auth/kakao
   * Initiate Kakao OAuth login
   */
  @Get('kakao')
  @UseGuards(AuthGuard('kakao'))
  @ApiOperation({ summary: 'Kakao OAuth login' })
  async kakaoLogin() {
    // Guard redirects to Kakao
  }

  /**
   * GET /api/auth/kakao/callback
   * Kakao OAuth callback
   */
  @Get('kakao/callback')
  @UseGuards(AuthGuard('kakao'))
  @ApiOperation({ summary: 'Kakao OAuth callback' })
  async kakaoCallback(@CurrentUser() profile: any) {
    return this.authService.socialLogin(profile);
  }

  /**
   * GET /api/auth/naver
   * Initiate Naver OAuth login
   */
  @Get('naver')
  @UseGuards(AuthGuard('naver'))
  @ApiOperation({ summary: 'Naver OAuth login' })
  async naverLogin() {
    // Guard redirects to Naver
  }

  /**
   * GET /api/auth/naver/callback
   * Naver OAuth callback
   */
  @Get('naver/callback')
  @UseGuards(AuthGuard('naver'))
  @ApiOperation({ summary: 'Naver OAuth callback' })
  async naverCallback(@CurrentUser() profile: any) {
    return this.authService.socialLogin(profile);
  }

  /**
   * GET /api/auth/google
   * Initiate Google OAuth login
   */
  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Google OAuth login' })
  async googleLogin() {
    // Guard redirects to Google
  }

  /**
   * GET /api/auth/google/callback
   * Google OAuth callback
   */
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Google OAuth callback' })
  async googleCallback(@CurrentUser() profile: any) {
    return this.authService.socialLogin(profile);
  }

  // ========== Password Reset Endpoints ==========

  /**
   * POST /api/auth/forgot-password
   * Request password reset email
   */
  @Post('forgot-password')
  @RateLimit({ ttl: 60, limit: 3 }) // 3 requests per minute
  @ApiOperation({ summary: 'Request password reset' })
  @ApiResponse({ status: 200, description: 'Reset email sent if user exists' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }

  /**
   * POST /api/auth/reset-password
   * Reset password with token
   */
  @Post('reset-password')
  @RateLimit({ ttl: 60, limit: 5 }) // 5 attempts per minute
  @ApiOperation({ summary: 'Reset password' })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(
      resetPasswordDto.token,
      resetPasswordDto.newPassword,
    );
  }
}
