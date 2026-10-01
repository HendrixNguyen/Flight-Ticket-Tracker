/**
 * Cache lifetimes and rate limits per endpoint.
 *
 * Autocomplete results are near-static (airport and hotel names change rarely),
 * so they can be cached for a day. Prices move constantly, so flight and hotel
 * searches stay deliberately short to avoid showing stale fares - a few minutes
 * of staleness is imperceptible, a long one would be misleading.
 */

export const CACHE_TTL = {
  /** Location autocomplete: 24 hours. */
  locations: 24 * 60 * 60 * 1000,
  /** Hotel autocomplete: 24 hours. */
  hotelsAutocomplete: 24 * 60 * 60 * 1000,
  /** Flight results: 5 minutes. */
  flights: 5 * 60 * 1000,
  /** Hotel results: 15 minutes. */
  hotels: 15 * 60 * 1000,
} as const;

/**
 * Requests allowed per IP per window. Autocomplete is generous because every
 * keystroke can fire a lookup; price searches are tight because each one costs
 * a SerpApi call.
 */
export const RATE_LIMIT = {
  locations: { limit: 120, windowMs: 60_000 },
  hotelsAutocomplete: { limit: 120, windowMs: 60_000 },
  flights: { limit: 20, windowMs: 60_000 },
  hotels: { limit: 20, windowMs: 60_000 },
} as const;