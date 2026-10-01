# SkyCrawler UI/UX Review & Improvement — Round 1 (Correctness + Accessibility)

## Context

SkyCrawler is deployed on Dokploy and works end-to-end. Reviewing the UI layer against Google Flights,
Skyscanner, Kayak and the WAI-ARIA APG surfaced two classes of problem. This round fixes the
data-integrity bugs and the accessibility failures. Competitive features (flexible-date price
calendar, price-per-day grid, price insights) are explicitly deferred — research is unambiguous that
the calendar is the biggest differentiator, but shipping it over a broken data layer and a
mouse-only search form would be the wrong order.

Scope: **flights + hotels**, both pages.

## Audit findings

**Data integrity — users see wrong information**
1. `server/api/flights.ts:77` — `firstLeg.airplane || 'Boeing 787-9 Dreamliner'` fabricates an
   aircraft model whenever SerpApi omits it.
2. `app/pages/hotels.vue:152` — "Highest Rated First" comparator is inverted; returns lowest-rated first.
3. `server/api/hotels.ts:206` — hotel id falls back to `Math.random()`, so ids change every fetch.
   Vue destroys and rebuilds all cards, killing transitions and selection state.
4. **Round-trip mapping is likely wrong** (`flights.ts:61-63` takes `flightLegs[0]` →
   `flightLegs[last]`). For a round-trip SerpApi returns outbound and return legs within one item, so
   a card may show the outbound departure against the *return* arrival, with a duration spanning the
   entire trip. Unverified — needs a live call.
5. `FilterSidebar.vue:54,58,62` + `FlightCard.vue:16` — `slate-850` is not a Tailwind v4 color; these
   four declarations are dead.

**Accessibility**
6. `FlightSearchForm.vue` / `HotelSearchForm.vue` — suggestion `<li>` have `@click` only: no
   `role="option"`, no `role="listbox"`, no `aria-expanded`, no `aria-activedescendant`, no keyboard
   handling, no result-count announcement. Mouse-only and silent to screen readers. This is the most
   commonly documented failure on airline booking sites.
7. Swap button (`FlightSearchForm.vue:92`) and `ThemeSwitcher.vue` icon buttons lack accessible names.
8. Date pickers (`CustomDatePicker.vue`, `CustomDateRangePicker.vue`) — grid keyboard nav unverified.

**UX trust**
9. `index.vue:52` — default `maxPrice: 1500` silently drops pricier flights; "Found 12 flights" reads
   as "only 12 exist". Same class of problem at `hotels.vue:80` (`maxPrice: 800`).
10. `FilterSidebar.vue:97` — Reset sets 2000 while the initial value is 1500, so Reset ≠ restore defaults.
11. Mobile: sidebar renders above results, pushing content off-screen.
12. Times are browser-local with no day-offset or timezone label — confusing on transatlantic routes.
13. No URL state: searches can't be shared, bookmarked, or restored on back-nav.

## Decisions

| Decision | Choice |
|---|---|
| Priority | Correctness + a11y before new features |
| Round-trip | Investigate against live SerpApi, then fix to match reality |
| Autocomplete | One shared `LocationCombobox` used by all three fields |
| Filters | Full-range defaults, filter chips, "N of M results", correct Reset |
| Mobile | Bottom-sheet filter trigger on small screens |
| Features | Calendar / price grid / insights — out of scope this round |
| Validation | `docker build` is unavailable in the planning sandbox; image build unverified |

## Tasks

### 1. Fix the fabricated aircraft type
`server/api/flights.ts` — drop the `'Boeing 787-9 Dreamliner'` fallback. Return `undefined` when
SerpApi has no value; `FlightCard.vue` already guards with `v-if="flight.airplane"`, so the badge
simply won't render. Never invent user-facing data.

### 2. Verify round-trip payload, then fix the mapping
Add a temporary throwaway script (`scratch/`, already gitignored via `scratch` in `.dockerignore`)
that calls SerpApi with `type=1` and logs the raw leg structure — do not commit it.

Then correct the mapping based on what's actually returned:
- If outbound and return legs arrive in one item, split them into distinct `Flight` entries (add a
  `legType: 'outbound' | 'return'` field to the `Flight` type) so cards render one leg each with an
  explicit label.
- If they arrive as separate items, key off the existing structure and only add the leg label.

Do not guess. Record the observed shape in the PR description.

### 3. Fix the inverted hotel rating sort
`app/pages/hotels.vue:152` — replace with a straightforward descending numeric comparator:
`(b.rating ?? 0) - (a.rating ?? 0)`. Handle undefined ratings consistently with the existing
`minRating` filter.

### 4. Make hotel ids stable
`server/api/hotels.ts:206` — replace the `Math.random()` fallback with a deterministic key derived
from `name` + `location` (slugified) so ids are stable across refetches. Only fall back to a slug if
both name and location are missing.

### 5. Remove dead Tailwind classes
Replace `slate-850` with `slate-800` in `FilterSidebar.vue:54,58,62` and `FlightCard.vue:16`. Grep for
any other non-palette tokens before finishing.

### 6. Build the shared `LocationCombobox`
New `app/components/LocationCombobox.vue`, implementing the WAI-ARIA APG editable combobox:
- `role="combobox"` + `aria-expanded` + `aria-autocomplete="list"` + `aria-controls` on the **input**
  (not a wrapper)
- popup is `role="listbox"`, each suggestion `role="option"` with a stable unique id
- `aria-activedescendant` virtual focus — DOM focus never leaves the input, so typing keeps working
- ArrowDown/ArrowUp to move the highlight, Enter to select, Escape to close keeping the typed text
- visually hidden `aria-live="polite"` region announcing the result count on each filter
- visible focus ring; active option styled distinctly without relying on color alone
- 300ms debounce preserved; stale-response guard so a slow earlier request can't overwrite newer results

Props: `label`, `modelValue` (the search id), `placeholder`, popular/suggestion source. Emits the
selected `LocationSuggestion`.

Then refactor `FlightSearchForm.vue` (From + To) and `HotelSearchForm.vue` (destination) to use it.
The existing click-outside, swap, and geolocation logic stays in the form components — only the
input + dropdown markup and the suggestion state move into the new component.

### 7. Name the icon-only buttons
Swap button: `aria-label="Swap origin and destination"`. Theme switcher trigger: `aria-label` +
`aria-expanded`. Ensure the trip-type toggle reports selected state, not just styling.

### 8. Fix the silent filtering
- `index.vue:52` — default `maxPrice` to the slider max (2000); `hotels.vue:80` to 1000.
- `FilterSidebar.vue:97` / `HotelFilterSidebar.vue:104` — Reset restores the *same* defaults the
  page initializes with. Define the defaults once and share the source of truth.
- Show "Showing N of M flights" in `FlightList.vue:23` / `HotelList.vue` whenever N < M, so filtering
  is never invisible.
- Add removable active-filter chips summarising price/stops/rating, each with a clear button.

### 9. Mobile filter sheet
Below `lg`, render the filter sidebar inside a bottom-sheet triggered by a sticky "Filters" button
showing the active-filter count. Keep the existing inline sidebar at `lg+`. The sheet needs focus
trapping, Escape-to-close, and `aria-modal="true"`.

### 10. Shareable URLs
Reflect the active search in the query string (`/?from=SFO&to=JFK&date=...&returnDate=...`, and the
hotel equivalents). On load, hydrate the form from the URL and run the search; on search, replace the
route. Gives shareable links, working back/forward, and survives a refresh.

### 11. Day-offset on times
`FlightCard.vue` `formatTime` — append `+1` / `+2` when the arrival falls on a later local date than
departure, and label the timezone. Fixes the most confusing cross-timezone detail.

## Validation

- `bun run build` passes; `/api/health` returns 200 from the built `.output`.
- Manual: search one-way and round-trip flights — confirm every card shows a real, correct
  arrival/duration, and that round-trip renders outbound and return distinctly.
- Manual: sort hotels by "Highest Rated First" and confirm descending order.
- Manual: refetch a hotel search and confirm card transitions still animate (stable ids).
- Keyboard-only pass: Tab into each autocomplete, arrow through options, Enter to select, Escape to
  dismiss — with no mouse. Confirm focus never leaves the input.
- Screen-reader smoke test (NVDA/VoiceOver): confirm the result count is announced and options are
  readable as options.
- Reset restores true defaults; "N of M" appears when filters are active.
- Reload a search URL and confirm the form hydrates and re-runs.
- **Not verifiable here:** `docker build` — no Docker in this sandbox. Run it before pushing.

## Risks

- **Round-trip rework can change the flight model.** `Flight` gains a field and card rendering
  changes. `types/index.ts` is shared with the hotel path — keep additions additive.
- **The combobox rewrite touches three inputs** and is the largest piece. Regressions in swap,
  geolocation, or debounce are the likely failure mode; the existing tests are manual only.
- **SerpApi costs money per call.** Task 2's investigation script plus regression testing will consume
  quota. Keep the number of live calls deliberate.
- No automated test suite exists in this repo. Validation above is manual — if this plan is to
  survive, adding a few Vitest component tests for the combobox is worth considering separately.
- Pre-existing and out of scope: `eslint` is broken repo-wide (`nuxt.config.ts` has no `modules` key,
  so `@nuxt/eslint` never generates `.nuxt/eslint.config.mjs`).

## Open Questions

None blocking. Two follow-ups worth deciding later:
- Flexible-date price calendar / price-per-day grid — the highest-value competitive feature, deferred
  to round 2. SerpApi's `google_flights` engine exposes price data that could back it.
- Whether to add a small test suite before round 2, given everything here is verified manually.