/**
 * Rate limiting utility.
 *
 * Uses in-memory Map for development (single-instance).
 * In production, swap to @upstash/ratelimit + Redis for multi-instance support.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Periodic cleanup to avoid memory leaks (every 60s)
let cleanupScheduled = false;

function scheduleCleanup() {
  if (cleanupScheduled) return;
  cleanupScheduled = true;
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (now >= entry.resetAt) {
        store.delete(key);
      }
    }
  }, 60_000).unref?.();
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * Check rate limit for a given key.
 *
 * @param key     - Unique identifier (e.g., "login:192.168.1.1")
 * @param limit   - Maximum number of requests allowed in the window
 * @param windowMs - Time window in milliseconds
 * @returns Whether the request is allowed, remaining attempts, and reset time
 */
export async function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult> {
  scheduleCleanup();

  const now = Date.now();
  const entry = store.get(key);

  // Window expired or no entry — start fresh
  if (!entry || now >= entry.resetAt) {
    const resetAt = now + windowMs;
    store.set(key, { count: 1, resetAt });
    return { success: true, remaining: limit - 1, resetAt };
  }

  // Within window
  entry.count += 1;

  if (entry.count > limit) {
    return {
      success: false,
      remaining: 0,
      resetAt: entry.resetAt,
    };
  }

  return {
    success: true,
    remaining: limit - entry.count,
    resetAt: entry.resetAt,
  };
}
