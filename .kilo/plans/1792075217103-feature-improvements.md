# SkyCrawler Feature Improvements

## Overview
This plan outlines 5 feature enhancements for the SkyCrawler flight and hotel search dashboard to improve user experience and increase engagement.

## Current State Analysis
SkyCrawler is a well-designed travel search app with:
- Clean glassmorphic UI using Tailwind CSS
- Real-time search via SerpApi with intelligent caching
- Currency selection and theme switching
- Shareable URLs with search parameters in query string
- Basic flight and hotel search with filtering
- Hotel booking confirmation flow

## Feature Suggestions

### 1. Price Alert System
**Description**: Allow users to save searches and receive notifications when prices drop below a specified threshold.

**User Flow**:
1. User performs a flight/hotel search
2. Click "Save Search & Set Alert" button on results page
3. Set desired price threshold and notification method (email/browser)
4. App stores the search criteria and monitors prices
5. When price drops below threshold, send notification
6. User can manage alerts in a new "Alerts" section

**Technical Implementation**:
- New `useAlerts` composable for managing alert state
- API endpoint `/api/alerts` for CRUD operations
- Background price checking (could use server cron or client-side with service worker)
- Notification system (browser notifications + optional email via backend)
- UI components: Alert management page, alert badge on search form, alert settings modal

**Benefits**:
- Increases user retention and return visits
- Provides proactive value beyond manual searching
- Competitive advantage over basic search tools

### 2. Interactive Hotel Map View
**Description**: Display hotel search results on an interactive map with filtering capabilities.

**User Flow**:
1. User performs hotel search
2. Toggle between "List View" and "Map View" tabs
3. Map view shows hotel pins with price indicators
4. Clicking pin shows hotel preview card
5. Map bounds filtering updates results list in real-time
6. Sync between map interactions and filter sidebar

**Technical Implementation**:
- Integrate with Mapbox GL JS or Google Maps API
- New `HotelMapView` component
- Map-specific API endpoint optimizations (bounds-based queries)
- Clustering for dense hotel areas
- Mapbox GL markers with custom popups showing hotel name/price/rating
- Sync map movements with filter updates

**Benefits**:
- Enhanced visualization of hotel locations relative to landmarks
- Better understanding of area pricing patterns
- Improved user engagement through interactive experience
- Valuable for travelers unfamiliar with destination geography

### 3. Price History & Trend Analysis
**Description**: Show historical price trends for flight routes and hotels to inform booking decisions.

**User Flow**:
1. After search results load, show "Price Trends" tab/section
2. Display line chart of prices over past 7-30 days
3. Indicate whether current price is above/below historical average
4. Show prediction: "Prices likely to rise" or "Good time to book"
5. For hotels, show price trends by date (check-in/out flexibility)

**Technical Implementation**:
- Extend API to return historical price data (cached or from SerpApi trends)
- New `PriceChart` component using a lightweight charting library (Chart.js or Vue-Charts)
- Cache historical data to minimize API costs
- Trend calculation algorithms (moving averages, volatility indicators)
- UI: Subtle integration that doesn't clutter main results view

**Benefits**:
- Empowers users with data-driven booking decisions
- Reduces buyer's remorse through price transparency
- Educational feature that builds user trust
- Differentiates from competitors showing only current prices

### 4. Flexible Date Search (Price Calendar)
**Description**: Show price variations across dates to help users find the cheapest travel days.

**User Flow**:
1. User selects approximate travel dates
2. Click "View Price Calendar" to see +/- 3 day price matrix
3. Calendar shows price heatmap for departure/return combinations
4. Clicking a date updates search and shows results for those dates
5. Works for both flights and hotels

**Technical Implementation**:
- New `DateCalendar` component showing price matrix
- API modification to accept date ranges and return price matrix
- Efficient batching of date requests to minimize API calls
- UI: Interactive calendar with color-coded pricing (green=cheap, red=expensive)
- Preserve other search filters when changing dates

**Benefits**:
- Helps price-sensitive travelers optimize travel dates
- Reveals patterns like weekend vs weekday pricing
- Increases conversion by showing best-value options
- Particularly useful for flexible travelers

### 5. Trip Planner & Itinerary Builder
**Description**: Save and organize flight/hotel combinations into shareable trip plans.

**User Flow**:
1. User finds a flight they like
2. Click "Save to Trip" → create new trip or add to existing
3. User finds a hotel they like
4. Click "Save to Trip" → add to same trip
5. View saved trips in "My Trips" dashboard
6. Share trips via link or export as calendar invite
7. Optional: Add notes, activities, budget tracking

**Technical Implementation**:
- New trip storage system (localStorage + optional backend sync)
- `useTrip` composable for trip state management
- Trip model: id, name, flights[], hotels[], notes, createdAt, updatedAt
- API endpoints for trip CRUD operations
- UI: Trip dashboard, trip editor, sharing modal
- Integration with existing search flows (save buttons on results)

**Benefits**:
- Completes the travel planning workflow beyond just search
- Increases user engagement and session duration
- Enables collaborative trip planning
- Potential for future expansion (activities, car rentals, etc.)
- Builds user loyalty through saved trip history

## Implementation Priority
1. Price Alert System (highest user retention impact)
2. Interactive Hotel Map View (major UX enhancement)
3. Price History & Trend Analysis (valuable decision support)
4. Flexible Date Search (price optimization feature)
5. Trip Planner & Itinerary Builder (workflow completion)

## Risks & Considerations
- **API Costs**: Additional features may increase SerpApi calls; implement caching and efficient querying
- **UI Complexity**: Avoid cluttering the clean interface; use progressive disclosure
- **Development Effort**: Some features require significant backend work (alerts, trip storage)
- **Performance**: Map views and charts need optimization for smooth experience
- **Privacy**: Clear data policies for saved searches and trip information

## Success Metrics
- Increase in return visitors (alerts feature)
- Increased time on site (map and trip features)
- Higher conversion rates (price calendar and trend analysis)
- User satisfaction surveys indicating improved planning experience
- Reduction in search abandonment rate

## Next Steps
1. Validate feature priorities with user research if available
2. Create detailed technical specifications for highest priority feature
3. Implement feature flag system for gradual rollout
4. Begin with Price Alert System as foundation for user engagement features