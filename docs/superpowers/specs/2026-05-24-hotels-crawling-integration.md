# Design Specification: Google Hotels Crawling & Search Integration

This design document outlines the technical specification, component architecture, and visual aesthetics for integrating a premium, glassmorphic Google Hotels search module into the SkyCrawler application.

---

## 1. Domain & UX Requirements

We want to allow users to search for premium hotels online in any destination, leveraging **SerpApi's Google Hotels engine**, and rendering the results in an immersive visual style matching the existing flight-crawling modules.

### UX Requirements:
- **Unified Domain Switcher:** A tab navigation widget at the top of the main dashboard to easily swap between "Flights" and "Hotels" modes with a smooth fade height transition.
- **Hotel Search Form:** A custom search panel containing:
  - **Destination Input:** An autocomplete text field with dynamic suggestions fetched from `/api/hotels-autocomplete`.
  - **Check-in & Check-out Picker:** Fully reuses our custom, high-fidelity glassmorphic `CustomDateRangePicker` component to select dates with soft trail highlights.
  - **Guests Panel:** Incremental controls for Adults (default: 2) and Children (default: 0).
- **Interactive Results:**
  - Standard empty list states ("Where to next?" and "No hotels found").
  - Premium hotel ticket layouts showing names, thumbnail sliders, rating stars, price per night, amenities badges (Wi-Fi, pool, parking), and a "Book" action.
  - Responsive sorting (by price, rating) and price range filters.

---

## 2. API Architecture

We will create two new Nuxt Nitro endpoints:

### A. Hotel Autocomplete API (`server/api/hotels-autocomplete.ts`)
- **Engine:** `google_hotels_autocomplete`
- **Inputs:** `q` (search query string)
- **Logic:** Calls SerpApi's Google Hotels Autocomplete to retrieve a lists of cities, regions, establishments, and specific properties.
- **Response Mapping:** Maps the `suggestions` array into a standardized list of options, returning `property_token` for specific hotels, and `kgmid` or standard names for cities/regions. Includes a fallback mock database of destinations for offline development resilience.

### B. Hotel Search API (`server/api/hotels.ts`)
- **Engine:** `google_hotels`
- **Inputs:** `q` (destination name or ID), `check_in_date`, `check_out_date`, `adults`, and optional `children`.
- **Response Transformation:** Standardize SerpApi's response `properties` array into a clean `Hotel` interface structure, handling missing values, standardizing amenity names, and extracting high-res images.
- **Robust Mock Data Fallback:** Just like our other API routes, if the `SERPAPI_KEY` is missing or offline, we will fallback to a small pre-seeded local array of premium hotels (e.g. in San Francisco, New York, London) to ensure offline styling testing remains perfect.

---

## 3. Frontend Component Architecture

### A. Data Types (`types/index.ts`)
Add `Hotel`, `HotelSearchQuery`, `HotelFilterOptions`, and `HotelApiResponse` interfaces.

### B. `HotelSearchForm.vue`
- Manages inputs for location, check-in, check-out, and guests.
- Incorporates location autocomplete powered by `/api/hotels-autocomplete`.

### C. `HotelCard.vue`
- Renders a single hotel. Uses highly polished glass layers (`glass-card rounded-3xl p-6 border-white/40`) with full light/dark theme support (`dark:bg-slate-900/40 dark:text-slate-100`).
- Displays hotel ratings, price, address, and amenities.

### D. `HotelList.vue`
- Manages search lists and empty/loading states.

---

## 4. Verification Plan

- **Type Integrity & Bundle Build:** Build standard Nuxt production bundle (`bun run build`) to ensure type checking is flawless.
- **Visual Stacking & Theme Compliance:** Test light/dark toggle and calendar dropdown stacking contexts.
- **Payload Verification:** Execute search queries with valid dates and check that Nitro endpoint maps parameters correctly to SerpApi.
