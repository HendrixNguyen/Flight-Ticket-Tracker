/**
 * In-memory TTL cache for SerpApi responses.
 *
 * SerpApi bills per request, so identical repeat searches are pure waste. This
 * is deliberately per-process and unbounded in count only: entries expire on
 * read and the map is swept periodically, so memory stays bounded by the number
 * of distinct queries within the longest TTL window.
 *
 * Freshness is tuned per endpoint by the caller. Autocomplete results (airport
 * and hotel names) barely change, while prices move constantly, so price
 * searches get a short TTL to avoid showing stale fares.
 *
 * Trade-off: state is per-process, so it resets on redeploy and is not shared
 * across replicas. That is fine for a single Dokploy app; a multi-replica
 * deployment would need shared storage.
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export interface CacheStats {
  hits: number;
  misses: number;
  entries: number;
}

const store = new Map<string, CacheEntry<unknown>>();
let hits = 0;
let misses = 0;

// Sweep expired entries so a long-running process does not accumulate keys
// for queries nobody repeats.
const SWEEP_INTERVAL_MS = 60_000;
let lastSweep = Date.now();

const sweep = () => {
  const now = Date.now();
  if (now - lastSweep < SWEEP_INTERVAL_MS) return;
  lastSweep = now;

  for (const [key, entry] of store) {
    if (entry.expiresAt <= now) store.delete(key);
  }
};

/** Build a stable cache key from a namespace and ordered parameters. */
export const cacheKey = (namespace: string, params: Record<string, unknown>): string => {
  const parts = Object.keys(params)
    .filter((key) => params[key] !== undefined && params[key] !== null && params[key] !== '')
    // Sort so key order never affects the result.
    .sort()
    .map((key) => `${key}=${String(params[key]).trim().toLowerCase()}`);

  return `${namespace}:${parts.join('&')}`;
};

export const cacheGet = <T>(key: string): T | undefined => {
  sweep();
  const entry = store.get(key);

  if (!entry) {
    misses++;
    return undefined;
  }
  if (entry.expiresAt <= Date.now()) {
    store.delete(key);
    misses++;
    return undefined;
  }

  hits++;
  return entry.value as T;
};

export const cacheSet = <T>(key: string, value: T, ttlMs: number): void => {
  if (ttlMs <= 0) return;
  store.set(key, { value, expiresAt: Date.now() + ttlMs });
};

export const cacheDelete = (key: string): void => {
  store.delete(key);
};

export const cacheStats = (): CacheStats => ({
  hits,
  misses,
  entries: store.size,
});

export const cacheReset = (): void => {
  store.clear();
  hits = 0;
  misses = 0;
};