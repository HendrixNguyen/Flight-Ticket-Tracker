# Design Specification: 2026 Trend High-Glassmorphism Date Pickers & Light/Dark Theme

This design document outlines the technical specification and aesthetic design for integrating a ultra-modern 2026-style high-glassmorphism Date Picker, a Date-Range Picker for round-trip (2-way) flights, and a global light/dark theme toggle system into the SkyCrawler application.

---

## 1. 2026 Glassmorphism UX & Visual Design Spec

We will build bespoke calendar dropdown components that combine the premium structure of the user's reference with cutting-edge 2026 glassmorphic trends:

### 2026 Glassmorphic Panel Styling
- **Card Shape:** Rounded-3xl (`rounded-[24px]` or `rounded-[32px]`) container.
- **Backgrounds (High-Glass):** 
  - **Light mode:** Semi-translucent white (`bg-white/50 backdrop-blur-2xl`) over a subtle background radial gradient. Outer border is ultra-thin and bright (`border border-white/40`). Soft multi-layered glow shadow (`shadow-xl shadow-blue-500/5`).
  - **Dark mode:** Semi-translucent deep slate (`dark:bg-slate-900/40 dark:backdrop-blur-2xl`) with a thin cyber-glow border (`dark:border-white/10`) and a dark shadow (`dark:shadow-black/40`).
- **Header Structure:**
  - **Month & Year Controls:** Styled as white rounded glass pills (`bg-white/60 dark:bg-slate-800/60 backdrop-blur-md shadow-sm border border-white/40 dark:border-white/10 px-4 py-1.5 rounded-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1 relative cursor-pointer hover:bg-white/80 transition-all`). 
  - **Dropdown Indicators:** A miniature bright blue glowing triangle (`w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[4px] border-b-blue-500 absolute bottom-1 right-1 rotate-135`) in the bottom-right corner of both the Month and Year pills.
  - **Navigation Buttons:** Left (`<`) and Right (`>`) navigation arrows housed inside circular translucent glass buttons with soft shadows (`bg-white/60 dark:bg-slate-800/60 hover:bg-white/90 dark:hover:bg-slate-700/80 rounded-full p-2.5 shadow-sm text-slate-700 dark:text-slate-300 border border-white/40 dark:border-white/10 transition-all`).
- **Day Grid:**
  - **Weekdays:** `Mo`, `Tu`, `We`, `Th`, `Fr`, `Sa`, `Su` printed in medium-weight text (`text-slate-600 dark:text-slate-400 font-semibold text-center text-xs pb-2`).
  - **Grid cells:** Responsive square blocks (`aspect-square flex items-center justify-center text-sm font-medium transition-all duration-150`).
  - **Selected Day (Single or Range Extremes):** Rounded-xl square with a glossy gradient (`rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold shadow-lg shadow-blue-500/25 border border-white/20`).
  - **Intermediate Days (Range Selection Trails):** Translucent blue trail (`bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-300 font-semibold rounded-xl border border-blue-500/10`).
  - **Inactive/Adjacent Month Days:** Faded, highly transparent text (`text-slate-300 dark:text-slate-700 pointer-events-none`).

---

## 2. Reusable Calendar Components

We will create two main Vue components:

### A. `CustomDatePicker.vue` (Single Date Selection)
- Represents a calendar panel for selecting a single date (e.g. Departure Date in One-Way mode).
- Props:
  - `modelValue: string` (Current date as `YYYY-MM-DD`)
  - `minDate?: string` (Prevents past selections)
- Events:
  - `update:modelValue`

### B. `CustomDateRangePicker.vue` (Double Date / Range Selection)
- Represents a connected calendar flow for Departure and Return.
- Props:
  - `startDate: string` (Departure as `YYYY-MM-DD`)
  - `endDate: string` (Return as `YYYY-MM-DD`)
  - `minDate?: string`
- Events:
  - `update:startDate`
  - `update:endDate`

---

## 3. Form Integration (`FlightSearchForm.vue`)

- **Trip Type Toggle:** A premium glassmorphic slider switch (`bg-white/30 dark:bg-slate-800/30 backdrop-blur-md border border-white/20`) at the top of the search form allowing the user to select between "One-way" and "Round-trip" (2-way).
- **Dynamic Field Display:**
  - If **One-way**, render a single `CustomDatePicker` input button for Departure.
  - If **Round-trip**, render two adjacent inputs for Departure and Return, wired together in a unified state. If the user clicks either input, the range picker modal appears. Selecting a date sequence automatically binds Departure and Return dates.
- **Flight Query Payload:**
  - Passes both `from`, `to`, `date` (departure), and optional `returnDate` to the main search controller.

---

## 4. Global Dark & Light Theme System

- **Theme Toggle Button:** Housed in the top-right header section. Styled with a rotating, glowing backdrop (`bg-white/40 dark:bg-slate-800/40 backdrop-blur-md shadow-md border border-white/20 rounded-full p-2 hover:scale-115 transition-all`).
- **Nuxt / Tailwind Dark Mode Setup:**
  - Uses Tailwind v4's class-based dark mode variant.
  - Toggles the `.dark` class on the root HTML element (`document.documentElement.classList`).
  - Persists the selected state to `localStorage` under `sky-crawler-theme` to preserve preferences on page reloads.
  - Implements rich glassmorphic layers across the entire project, using radial color background blobs in light/dark modes for the glass backdrops to reflect beautifully!

---

## 5. Backend Search Upgrade (`server/api/flights.ts`)

- Checks if `returnDate` is provided in the Nitro API request parameters:
  - If present, sets SerpApi `type=1` (Round-trip) and appends `return_date=${returnDate}` to the payload.
  - If absent, sets SerpApi `type=2` (One-way).

---

## 6. Verification Plan

- **Type Checking & Build Compilation:** Run `bun run build` to verify standard Nuxt/Vue compilation.
- **Visual Compliance:** Open in a browser to inspect the calendar design against the design mockup image (rounded pills, blue triangles, font sizes, custom navigation icons).
- **State Integrity:** Validate date selection flows (e.g. selecting a return date prior to departure is disabled).
- **Interactive Check:** Swap themes back and forth to ensure zero style flash and perfect readability of flight cards.
