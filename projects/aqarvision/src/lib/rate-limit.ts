/**
 * Rate limiting utilities for AqarVision.
 *
 * Uses an in-memory Map for development.
 * In production, replace with Upstash Redis or Vercel KV for multi-instance support.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

export type RateLimitConfig = {
  /** Max requests in the window */
  limit: number;
  /** Window duration in seconds */
  window: number;
};

const PRESETS: Record<string, RateLimitConfig> = {
  /** Public forms (leads, contact): 5 req/min */
  public_form: { limit: 5, window: 60 },
  /** Search requests: 30 req/min */
  search: { limit: 30, window: 60 },
  /** Authenticated actions: 60 req/min */
  authenticated: { limit: 60, window: 60 },
};

export function checkRateLimit(
  identifier: string,
  preset: keyof typeof PRESETS | RateLimitConfig,
): { allowed: boolean; remaining: number; resetAt: number } {
  const config = typeof preset === 'string' ? PRESETS[preset] : preset;
  const now = Date.now();
  const key = `rl:${identifier}`;

  const entry = store.get(key);

  if (!entry || entry.resetAt < now) {
    // New window
    const resetAt = now + config.window * 1000;
    store.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: config.limit - 1, resetAt };
  }

  if (entry.count >= config.limit) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count += 1;
  return { allowed: true, remaining: config.limit - entry.count, resetAt: entry.resetAt };
}

/** Extract IP from request headers (works behind proxies) */
export function getClientIp(headers: Headers): string {
  return (
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    headers.get('x-real-ip') ??
    'unknown'
  );
}
