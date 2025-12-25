import { Injectable, Inject } from '@nestjs/common';
import { RedisClientType } from 'redis';

@Injectable()
export class RedisService {
  constructor(
    @Inject('REDIS_CLIENT')
    private readonly redisClient: RedisClientType,
  ) {}

  /**
   * Set a key-value pair with optional TTL (Time To Live)
   */
  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds) {
      await this.redisClient.setEx(key, ttlSeconds, value);
    } else {
      await this.redisClient.set(key, value);
    }
  }

  /**
   * Get value by key
   */
  async get(key: string): Promise<string | null> {
    return await this.redisClient.get(key);
  }

  /**
   * Delete a key
   */
  async del(key: string): Promise<void> {
    await this.redisClient.del(key);
  }

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    const result = await this.redisClient.exists(key);
    return result === 1;
  }

  /**
   * Set expiration time for a key
   */
  async expire(key: string, seconds: number): Promise<void> {
    await this.redisClient.expire(key, seconds);
  }

  /**
   * Get Time To Live for a key
   */
  async ttl(key: string): Promise<number> {
    return await this.redisClient.ttl(key);
  }

  /**
   * Blacklist a token
   */
  async blacklistToken(token: string, ttlSeconds: number): Promise<void> {
    const key = `blacklist:${token}`;
    await this.set(key, '1', ttlSeconds);
  }

  /**
   * Check if token is blacklisted
   */
  async isTokenBlacklisted(token: string): Promise<boolean> {
    const key = `blacklist:${token}`;
    return await this.exists(key);
  }

  /**
   * Store password reset token
   */
  async storePasswordResetToken(
    userId: string,
    token: string,
    ttlSeconds: number = 3600,
  ): Promise<void> {
    const key = `password-reset:${token}`;
    await this.set(key, userId, ttlSeconds);
  }

  /**
   * Get user ID from password reset token
   */
  async getPasswordResetUserId(token: string): Promise<string | null> {
    const key = `password-reset:${token}`;
    return await this.get(key);
  }

  /**
   * Delete password reset token
   */
  async deletePasswordResetToken(token: string): Promise<void> {
    const key = `password-reset:${token}`;
    await this.del(key);
  }

  /**
   * Store email verification token
   */
  async storeEmailVerificationToken(
    email: string,
    token: string,
    ttlSeconds: number = 3600,
  ): Promise<void> {
    const key = `email-verification:${token}`;
    await this.set(key, email, ttlSeconds);
  }

  /**
   * Get email from verification token
   */
  async getEmailVerificationEmail(token: string): Promise<string | null> {
    const key = `email-verification:${token}`;
    return await this.get(key);
  }

  /**
   * Delete email verification token
   */
  async deleteEmailVerificationToken(token: string): Promise<void> {
    const key = `email-verification:${token}`;
    await this.del(key);
  }
}
