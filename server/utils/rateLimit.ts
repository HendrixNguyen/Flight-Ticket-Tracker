/**
 * Per-IP fixed-window rate limiter.
 *
 * Caching removes the cost of *repeat* searches, but it does nothing against a
 * script sending thousands of distinct queries, each of which would be a paid
 * SerpApi call. This caps how often one client can reach the upstream API.
 *
 * Deliberately in-process and best-effort: a single container is enough for the
 * app's current shape, and a multi-replica deployment would need shared state.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();
let blockedAttempts = 0;

const SWEEP_INTERVAL_MS = 60_000;
let lastSweep = Date.now();

const sweep = () => {
  const now = Date.now();
  if (now - lastSweep < SWEEP_INTERVAL_MS) return;
  lastSweep = now;

  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
};

/** Best-effort client IP from proxy headers. */
export const clientIp = (event: any): string => {
  const forwarded = event.node?.req?.headers?.['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    // Left-most entry is the original client when behind Traefik.
    return forwarded.split(',')[0].trim();
  }

  const realIp = event.node?.req?.headers?.['x-real-ip'];
  if (typeof realIp === 'string' && realIp.length > 0) return realIp.trim();

  return event.node?.req?.socket?.remoteAddress || 'unknown';
};

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

/**
 * @param scope  Bucket namespace, e.g. 'flights'. Kept separate per endpoint so
 *               one busy endpoint cannot consume another endpoint's budget.
 * @param limit  Requests allowed per window.
 */
export const rateLimit = (scope: string, ip: string, limit: number, windowMs: number): RateLimitResult => {
  sweep();

  const key = `${scope}:${ip}`;
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, retryAfterSeconds: 0 };
  }

  if (bucket.count >= limit) {
    blockedAttempts++;
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    };
  }

  bucket.count++;
  return { allowed: true, remaining: limit - bucket.count, retryAfterSeconds: 0 };
};

export const rateLimitStats = () => ({
  trackedClients: buckets.size,
  blockedAttempts,
});