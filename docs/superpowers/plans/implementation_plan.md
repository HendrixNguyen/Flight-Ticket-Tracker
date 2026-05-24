# Google Hotels Crawling Integration - Implementation Plan

This document outlines the step-by-step plan to integrate a premium Google Hotels search module utilizing SerpApi's `google_hotels` engine and high-glassmorphism components.

## User Review Required

> [!IMPORTANT]
> This feature adds a new **Hotels** crawler category adjacent to Flights, incorporating custom glass tabs, reusable picker inputs, and structured amenity badges. Please review the design changes.

---

## Proposed Changes

### 1. Data Types (`types/index.ts`)
#### [MODIFY] [types/index.ts](file:///Users/hendrixnguyen/Projects/flight-search-app/types/index.ts)
- Define `Hotel` interface:
  ```typescript
  export interface Hotel {
    id: string;
    name: string;
    description?: string;
    location: string;
    gps?: { latitude: number; longitude: number };
    rating?: number;
    reviewsCount?: number;
    pricePerNight: number;
    totalPrice?: number;
    currency: string;
    thumbnail?: string;
    images?: string[];
    amenities?: string[];
    classRating?: number;
  }
  ```
- Define search, filter, and API response types:
  ```typescript
  export interface HotelSearchQuery {
    destination: string;
    destinationName: string; // Readable label
    checkIn: string;
    checkOut: string;
    adults: number;
    children: number;
  }

  export interface HotelFilterOptions {
    maxPrice?: number;
    minRating?: number;
    amenities?: string[];
  }

  export interface HotelApiResponse {
    success: boolean;
    data: Hotel[];
    error?: string;
  }
  ```

### 2. Backend Nitro API Endpoint (`server/api/hotels.ts`)
#### [NEW] [server/api/hotels.ts](file:///Users/hendrixnguyen/Projects/flight-search-app/server/api/hotels.ts)
- Communicates with SerpApi's `google_hotels` engine.
- Parameters: `q` (city name or ID), `check_in_date`, `check_out_date`, `adults`, `children`.
- standardizes return data, extracts rate lists, amenities, rating tallies, and photos.
- **Mock Resiliency:** If `SERPAPI_KEY` is missing or offline, returns custom mockup hotels (e.g. "The Fairmont San Francisco", "The Standard High Line NYC", "Shangri-La London") to ensure developer workspace runs beautifully.

### 3. Reusable Hotel UI Components
#### [NEW] [app/components/HotelCard.vue](file:///Users/hendrixnguyen/Projects/flight-search-app/app/components/HotelCard.vue)
- Displays individual hotel rooms, rates, star counts, photos, and a custom booking action button.
- Enforces strict 2026-style `glass-card` styling and complete light/dark theme class selectors.
- Features micro-animations for card hovers.

#### [NEW] [app/components/HotelList.vue](file:///Users/hendrixnguyen/Projects/flight-search-app/app/components/HotelList.vue)
- Handles search states, loading indicators, empty list highlights, and TransitionGroup anims.

### 4. Hotel Search Panel (`app/components/HotelSearchForm.vue`)
#### [NEW] [app/components/HotelSearchForm.vue](file:///Users/hendrixnguyen/Projects/flight-search-app/app/components/HotelSearchForm.vue)
- Destination input wired with autocomplete dropdowns querying `/api/locations`.
- Check-in & Check-out picker using our premium `CustomDateRangePicker.vue` component.
- Interactive guest count togglers.

### 5. Dashboard Tab Navigation (`app/app.vue`)
#### [MODIFY] [app/app.vue](file:///Users/hendrixnguyen/Projects/flight-search-app/app/app.vue)
- Implements two main tabs ("Flights" and "Hotels") inside a header switcher block.
- Manages `activeTab = ref('flights' | 'hotels')`.
- Dynamically swaps search form grids and results containers depending on selected domain tab.

---

## Verification Plan

### Automated Checks
- Verify typescript types compile with zero warnings using Nuxt type generators.
- Execute full production build compilation (`bun run build`) to ensure client/server packages bundle error-free.

### Manual Verification
- Type "San Fran" in the destination autocomplete inside the Hotels tab and confirm the dropdown returns suggestions.
- Choose dates in the custom popover range picker, select 2 adults, and verify flight list changes to hotels list upon search.
- Toggle between light/dark modes and verify hotel lists render in gorgeous high-contrast colors.
