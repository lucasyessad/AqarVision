import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const isRedisConfigured =
  !!process.env.UPSTASH_REDIS_REST_URL && !!process.env.UPSTASH_REDIS_REST_TOKEN;

let redis: Redis | null = null;

function getRedis(): Redis {
  if (!redis) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
  }
  return redis;
}

/** No-op rate limiter for dev when Redis is not configured */
const noopRateLimiter = {
  limit: async () => ({ success: true, limit: 0, remaining: 0, reset: 0 }),
};

export function createRateLimit(
  requests: number,
  window: `${number} ${"s" | "m" | "h" | "d"}`
) {
  if (!isRedisConfigured) {
    return noopRateLimiter;
  }
  return new Ratelimit({
    redis: getRedis(),
    limiter: Ratelimit.slidingWindow(requests, window),
    analytics: true,
  });
}

export const authRateLimit = createRateLimit(5, "1 m");
export const contactRateLimit = createRateLimit(10, "1 m");
export const forgotPasswordRateLimit = createRateLimit(3, "10 m");
