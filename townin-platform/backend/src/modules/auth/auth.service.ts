import { Injectable, UnauthorizedException, ConflictException, BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { User, UserRole } from '../users/user.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private redisService: RedisService,
  ) {}

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    return user;
  }

  async register(registerDto: RegisterDto) {
    // Check if user exists
    const existingUser = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(registerDto.password, 10);

    // Create user
    const user = this.userRepository.create({
      email: registerDto.email,
      passwordHash,
      name: registerDto.name,
      phone: registerDto.phone,
      role: registerDto.role,
      isActive: true,
      isEmailVerified: false,
    });

    const savedUser = await this.userRepository.save(user);

    // Generate tokens
    const tokens = await this.generateTokens(savedUser);

    return {
      user: {
        id: savedUser.id,
        email: savedUser.email,
        name: savedUser.name,
        role: savedUser.role,
        isEmailVerified: savedUser.isEmailVerified,
      },
      ...tokens,
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    // Update last login
    await this.userRepository.update(user.id, {
      lastLoginAt: new Date(),
    });

    // Generate tokens
    const tokens = await this.generateTokens(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        ageRange: user.ageRange,
        householdType: user.householdType,
      },
      ...tokens,
    };
  }

  async refreshTokens(refreshToken: string) {
    try {
      // Verify refresh token
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      // Check if token is blacklisted
      const isBlacklisted = await this.redisService.isTokenBlacklisted(refreshToken);
      if (isBlacklisted) {
        throw new UnauthorizedException('Token has been revoked');
      }

      // Get user
      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedException('Invalid token');
      }

      // Blacklist old refresh token (Refresh Token Rotation)
      const refreshTTL = 30 * 24 * 60 * 60; // 30 days
      await this.redisService.blacklistToken(refreshToken, refreshTTL);

      // Generate new tokens
      const newTokens = await this.generateTokens(user);

      return newTokens;
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(accessToken: string, refreshToken: string) {
    // Blacklist both tokens
    const accessTTL = 2 * 60 * 60; // 2 hours
    const refreshTTL = 30 * 24 * 60 * 60; // 30 days

    await Promise.all([
      this.redisService.blacklistToken(accessToken, accessTTL),
      this.redisService.blacklistToken(refreshToken, refreshTTL),
    ]);

    return { message: 'Logged out successfully' };
  }

  private async generateTokens(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: this.configService.get<string>('JWT_EXPIRATION'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRATION'),
      }),
    ]);

    return {
      accessToken,
      refreshToken,
      expiresIn: 7200, // 2 hours in seconds
    };
  }

  async validateToken(token: string): Promise<User> {
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedException('Invalid token');
      }

      return user;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  /**
   * Social login handler (Kakao, Naver, Google)
   */
  async socialLogin(profile: {
    provider: string;
    kakaoId?: string;
    naverId?: string;
    googleId?: string;
    email?: string;
    name: string;
    profileImage?: string;
  }) {
    let user: User;

    // Find existing user by social ID
    const whereCondition: any = {};
    if (profile.kakaoId) whereCondition.kakaoId = profile.kakaoId;
    if (profile.naverId) whereCondition.naverId = profile.naverId;
    if (profile.googleId) whereCondition.googleId = profile.googleId;

    user = await this.userRepository.findOne({ where: whereCondition });

    if (!user && profile.email) {
      // Try to find by email
      user = await this.userRepository.findOne({ where: { email: profile.email } });

      if (user) {
        // Link social account to existing user
        if (profile.kakaoId) user.kakaoId = profile.kakaoId;
        if (profile.naverId) user.naverId = profile.naverId;
        if (profile.googleId) user.googleId = profile.googleId;
        if (profile.profileImage) user.profileImageUrl = profile.profileImage;

        await this.userRepository.save(user);
      }
    }

    if (!user) {
      // Create new user (auto-register)
      user = this.userRepository.create({
        email: profile.email,
        name: profile.name,
        kakaoId: profile.kakaoId,
        naverId: profile.naverId,
        googleId: profile.googleId,
        profileImageUrl: profile.profileImage,
        role: UserRole.USER, // Default role
        isActive: true,
        isEmailVerified: true, // Social login users are pre-verified
      });

      user = await this.userRepository.save(user);
    }

    // Update last login
    await this.userRepository.update(user.id, { lastLoginAt: new Date() });

    // Generate tokens
    const tokens = await this.generateTokens(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        profileImageUrl: user.profileImageUrl,
      },
      ...tokens,
    };
  }

  /**
   * Forgot Password - Send reset token
   */
  async forgotPassword(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      // Don't reveal if email exists or not (security best practice)
      return {
        message: 'If the email exists, a password reset link has been sent.',
      };
    }

    // Generate random token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Store token in Redis with 1 hour expiration
    await this.redisService.storePasswordResetToken(user.id, resetToken, 3600);

    // TODO: Send email with reset link
    // const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    // await this.emailService.sendPasswordResetEmail(user.email, resetLink);

    console.log(`Password reset token for ${email}: ${resetToken}`);
    console.log(`Reset link would be: /reset-password?token=${resetToken}`);

    return {
      message: 'If the email exists, a password reset link has been sent.',
      // DEVELOPMENT ONLY - Remove in production
      ...(process.env.NODE_ENV === 'development' && { resetToken }),
    };
  }

  /**
   * Reset Password - Verify token and update password
   */
  async resetPassword(token: string, newPassword: string) {
    // Get user ID from token
    const userId = await this.redisService.getPasswordResetUserId(token);

    if (!userId) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Get user
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Update password
    await this.userRepository.update(user.id, { passwordHash });

    // Delete reset token
    await this.redisService.deletePasswordResetToken(token);

    return {
      message: 'Password has been reset successfully',
    };
  }
}
