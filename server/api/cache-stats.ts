import { cacheStats } from '../utils/cache';
import { rateLimitStats } from '../utils/rateLimit';

/**
 * Cache and rate-limit telemetry.
 *
 * SerpApi bills per call, so it is worth being able to confirm the cache is
 * actually saving calls rather than assuming it. The hit rate answers "is this
 * working"; the counters do not expose any user data.
 */
export default defineEventHandler(() => {
  const stats = cacheStats();
  const total = stats.hits + stats.misses;

  return {
    status: 'ok',
    cache: {
      hits: stats.hits,
      misses: stats.misses,
      entries: stats.entries,
      hitRate: total > 0 ? Math.round((stats.hits / total) * 100) : 0,
      // Roughly how many upstream SerpApi calls the cache has avoided.
      callsSaved: stats.hits,
    },
    rateLimit: rateLimitStats(),
  };
});