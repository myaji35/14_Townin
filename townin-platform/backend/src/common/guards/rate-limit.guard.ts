import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RedisService } from '../../modules/redis/redis.service';

export const RATE_LIMIT_KEY = 'rateLimit';

export interface RateLimitOptions {
  ttl: number; // Time window in seconds
  limit: number; // Max requests in time window
}

export const RateLimit = (options: RateLimitOptions) =>
  Reflect.metadata(RATE_LIMIT_KEY, options);

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private redisService: RedisService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const rateLimitOptions = this.reflector.get<RateLimitOptions>(
      RATE_LIMIT_KEY,
      context.getHandler(),
    );

    if (!rateLimitOptions) {
      return true; // No rate limit configured
    }

    const request = context.switchToHttp().getRequest();
    const ip = request.ip || request.connection.remoteAddress;
    const endpoint = `${request.method}:${request.route.path}`;
    const key = `rate-limit:${ip}:${endpoint}`;

    const current = await this.redisService.get(key);
    const count = current ? parseInt(current, 10) : 0;

    if (count >= rateLimitOptions.limit) {
      throw new HttpException(
        'Too many requests. Please try again later.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Increment counter
    if (count === 0) {
      await this.redisService.set(key, '1', rateLimitOptions.ttl);
    } else {
      await this.redisService.set(key, (count + 1).toString());
      // Preserve existing TTL
      const ttl = await this.redisService.ttl(key);
      if (ttl > 0) {
        await this.redisService.expire(key, ttl);
      }
    }

    return true;
  }
}
