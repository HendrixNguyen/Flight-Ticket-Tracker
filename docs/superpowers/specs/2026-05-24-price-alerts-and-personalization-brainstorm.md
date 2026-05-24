# SkyCrawler: Price Alerts, Trend Analytics, and User Personalization Brainstorming Spec

This document details the architectural spec and visual concepts for integrating real-time price trend analytics and user-behavior personalization inside the SkyCrawler Nuxt application.

---

## 📊 Module 1: Price Alerts & Trend Analytics

To optimize purchase timing, search interfaces will integrate micro-forecasting panels and price watchers.

### 1. The Glowing SVG Price Trend Chart
*   **Visual Style:** A glassmorphic card component positioned adjacent to list summaries. It displays a historical line graph showing price cycles over the past 30 days and projects fares for the next 14 days.
*   **Vector Construction:** Instead of importing canvas charting libraries, we will use a **pure Vue SVG path render** for optimal client-side performance:
    *   Dynamic SVG viewport `<svg viewBox="0 0 400 120">`.
    *   Curved visual paths utilizing cubic Bezier curves (`M x y C ...`).
    *   Path elements styled with a custom gradient stroke (`stroke="url(#neon-blue-indigo)"`) and a soft outer neon glow filter (`filter="url(#neon-glow)"`).
*   **Dynamic Predictive Pill:** A header pill that analyzes trend data to display one of three actionable options:
    *   🟢 **Buy Now:** Prices are projected to spike in the next 48 hours.
    *   🟡 **Wait:** Historical trends indicate a price dip is coming in the next 3 days.
    *   🔵 **Price Stable:** Current rates are steady and optimal.

### 2. Price Watches Drawer
*   **Trigger Interaction:** Staged list cards carry a small glowing bell icon ("Watch Price"). Clicking the icon opens a popover to define target prices (e.g., *"Notify me if rate drops below $300"*).
*   **Notification Engine:**
    *   **In-App Drawer:** An elegant panel in the header displaying triggered alerts (e.g., *"Price Drop Alert: SFO ➔ CDG fell from $850 to $710! (Save $140)"*).
    *   **Persistence:** Saved inside a client-side localStorage array (offline fallback) or backed by a MongoDB collection tracking user alerts.

---

## 👤 Module 2: User Preference & Behavior Personalization

This engine adapts autocompletes, search rankings, and dashboard recommendations to the user's travel preferences.

### 1. The Identity Drawer
A sliding glassmorphic profile panel toggled in the header where users define their travel rules:
*   **Favorite Countries/Destinations:** List of preferred locations (e.g. *Vietnam*, *France*, *United Kingdom*). Autocomplete suggestion endpoints (`/api/locations` and `/api/hotels-autocomplete`) parse this preferences list to automatically pin matching destinations to the top of suggestion lists under a **"Pin from Preferences"** header.
*   **Preferred Aircraft Toggles:** Selection toggles for preferred aircraft (e.g. *Boeing 787-9 Dreamliner*, *Airbus A350-900*). When search results are fetched, flights operating these aircraft receive a subtle blue glowing card boundary and a **"Preferred Aircraft"** badge.
*   **Optimal Price Thresholds:** A range slider defining their ideal search budget (e.g. *$200 – $400*). Matching results receive a **"Ideal Price"** highlight to focus user scanning.

### 2. Smart Recommendations Feed
*   **Initial Dashboard:** If no searches have been run, the default dashboard presents a tailored **"Handpicked For You"** deals section.
*   **Dynamic Crawling:** Nuxt middleware pre-fetches crawls matching favorite countries and price zones, loading immediate recommendations on startup.

---

## 🛠 Next Steps & Handoff Guidelines

When continuing implementation on this specification:
1. **Types Integration:**
   - Define `PriceAlert`, `UserPreferences`, and `TrendPoint` interfaces inside `types/index.ts`.
2. **Backend API Endpoints:**
   - Create `server/api/price-trends.ts` simulating price data points or fetching historical SerpApi flight/hotel datasets.
   - Create `server/api/preferences.ts` for managing MongoDB/localStorage read-writes.
3. **Frontend Components:**
   - Develop `app/components/PriceTrendChart.vue` rendering the glowing SVG.
   - Develop `app/components/PreferencesDrawer.vue` for user configuration toggles.
