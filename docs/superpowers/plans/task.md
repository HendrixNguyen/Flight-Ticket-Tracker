# SkyCrawler: 2026 Trend Design & Integrations Implementation Checklist

## Task 1: Light/Dark Theme Controller Setup
- `[x]` Define high-glassmorphic CSS style rules in `app/assets/css/main.css`
- `[x]` Create `app/components/ThemeSwitcher.vue` component with system persistence
- `[x]` Integrate `ThemeSwitcher` and background radial blur blobs inside `app/app.vue`
- `[x]` Commit Task 1 changes to Git

## Task 2: Custom Single Date Picker Component
- `[x]` Create custom `app/components/CustomDatePicker.vue` with 2026 visual styling (rounded pill header, tiny blue indicator triangles)
- `[x]` Commit Task 2 changes to Git

## Task 3: Connected Custom Date Range Picker Component
- `[x]` Create connected `app/components/CustomDateRangePicker.vue` with Departure/Return trails and reactive cell highlighting
- `[x]` Commit Task 3 changes to Git

## Task 4: UI Integration in Search Form
- `[x]` Expand `SearchQuery` in `types/index.ts` to support optional `returnDate`
- `[x]` Integrate One-way / Round-trip toggle switches and mount custom pickers in `app/components/FlightSearchForm.vue`
- `[x]` Commit Task 4 changes to Git

## Task 5: Upgrade Backend Flights Endpoint
- `[x]` Add `returnDate` logic, round-trip parameter mappings (`type=1` and `return_date`), and error prevention in `server/api/flights.ts`
- `[x]` Commit Task 5 changes to Git

## Task 6: Global Polish & Dark Mode Support
- `[x]` Apply Tailwind `dark:` variants and glass styles across `app/app.vue`, `app/components/FlightCard.vue`, `app/components/FilterSidebar.vue`, and `app/components/FlightList.vue`
- `[x]` Run production compiler (`bun run build`) to verify all types and styling compiles error-free
- `[x]` Commit Task 6 changes to Git

## Task 7: Google Hotels Crawling & Autocomplete Integration
- `[x]` Extend interfaces in `types/index.ts` to support `Hotel`, `HotelSearchQuery`, `HotelFilterOptions`, `HotelApiResponse`, and `HotelAutocompleteSuggestion`
- `[x]` Create backend location autocomplete endpoint `server/api/hotels-autocomplete.ts` mapping suggestion images
- `[x]` Create backend search endpoint `server/api/hotels.ts` standardizing pricing details, rates, and amenities with high-fidelity mock data support
- `[x]` Build `app/components/HotelCard.vue` component styled with 2026 glassmorphism
- `[x]` Build `app/components/HotelList.vue` handling transition animations and loading panels
- `[x]` Build `app/components/HotelSearchForm.vue` showcasing autocomplete suggestions with thumbnails
- `[x]` Build `app/components/HotelFilterSidebar.vue` managing star ratings and pricing bounds
- `[x]` Modify `app/app.vue` to integrate Flights/Hotels switcher tabs and booking dialog popovers
- `[x]` Run compilation production build check to ensure zero TypeScript, Vue, or Tailwind compile errors
