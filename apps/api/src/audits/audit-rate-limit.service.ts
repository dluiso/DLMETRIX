import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import {
  ANONYMOUS_RATE_LIMIT_PREFIX,
  USER_RATE_LIMIT_PREFIX,
  AUDIT_RATE_LIMIT_WINDOW,
} from '@dlmetrix/shared';

@Injectable()
export class AuditRateLimitService {
  private redis: Redis;

  constructor(private config: ConfigService) {
    this.redis = new Redis({
      host: config.get('redis.host', 'localhost'),
      port: config.get('redis.port', 6379),
      password: config.get('redis.password'),
    });
  }

  async checkAndIncrement(
    identifier: string,
    isAnonymous: boolean,
    limit: number,
  ): Promise<{ allowed: boolean; current: number; remaining: number; resetAt: Date }> {
    const prefix = isAnonymous ? ANONYMOUS_RATE_LIMIT_PREFIX : USER_RATE_LIMIT_PREFIX;
    const key = `${prefix}${identifier}`;

    const current = await this.redis.incr(key);

    if (current === 1) {
      await this.redis.expire(key, AUDIT_RATE_LIMIT_WINDOW);
    }

    const ttl = await this.redis.ttl(key);
    const resetAt = new Date(Date.now() + ttl * 1000);

    return {
      allowed: current <= limit,
      current,
      remaining: Math.max(0, limit - current),
      resetAt,
    };
  }

  async getCount(identifier: string, isAnonymous: boolean): Promise<number> {
    const prefix = isAnonymous ? ANONYMOUS_RATE_LIMIT_PREFIX : USER_RATE_LIMIT_PREFIX;
    const key = `${prefix}${identifier}`;
    const val = await this.redis.get(key);
    return parseInt(val || '0', 10);
  }
}
