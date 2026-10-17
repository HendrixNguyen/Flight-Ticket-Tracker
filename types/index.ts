export interface Flight {
  id: string;
  airline: string;
  airlineLogo?: string;
  airplane?: string;
  flightNumber: string;
  departureTime: string; // ISO string
  arrivalTime: string; // ISO string
  departureAirport: string;
  arrivalAirport: string;
  price: number;
  currency: string;
  durationMinutes: number;
  stops: number;
}

export interface SearchQuery {
  from: string;
  to: string;
  date: string;
  returnDate?: string;
  passengers: number;
  flexibleDates?: boolean;
}

export interface FilterOptions {
  maxPrice?: number;
  airlines?: string[];
  maxStops?: number;
}

export type SortOption = 'price_asc' | 'price_desc' | 'time_asc' | 'duration_asc';

export interface FlightApiResponse {
  success: boolean;
  data: Flight[];
  error?: string;
}

export interface LocationSuggestion {
  id: string;
  name: string;
  type: 'city' | 'airport' | 'region';
  description?: string;
  iata?: string;
}

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

export interface HotelSearchQuery {
  destination: string;
  destinationName: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  rooms: number;
  flexibleDates?: boolean;
}

export interface HotelFilterOptions {
  maxPrice?: number;
  minRating?: number;
  amenities?: string[];
}

export interface HotelApiResponse {
  mock?: boolean;
  success: boolean;
  data: Hotel[];
  error?: string;
}

export interface HotelAutocompleteSuggestion {
  id: string;
  name: string;
  type: 'hotel' | 'city' | 'region';
  description?: string;
  thumbnail?: string;
  propertyToken?: string;
}

/** Any autocomplete suggestion the LocationCombobox can render.
 *  Flights and hotels return differently-shaped payloads; the combobox only
 *  relies on id/name/description and tolerates the rest. */
export type ComboboxSuggestion = (LocationSuggestion | HotelAutocompleteSuggestion) & {
  id: string;
  name: string;
  description?: string;
};

/** Price alert for flights or hotels */
interface AlertBase {
  id: string;
  thresholdPrice: number;
  currency: string;
  createdAt: string;
  active: boolean;
}
export type Alert = AlertBase & (
  { type: 'flight'; searchQuery: SearchQuery } |
  { type: 'hotel'; searchQuery: HotelSearchQuery }
);

/** Extended search query for alerts - we reuse the existing ones */
export type AlertSearchQuery = SearchQuery | HotelSearchQuery;

/** Historical price data point */
export interface PriceHistoryPoint {
  date: string; // ISO date string
  price: number;
}

/** Historical price data for a search */
export interface PriceHistoryData {
  points: PriceHistoryPoint[];
  averagePrice: number;
  minPrice: number;
  maxPrice: number;
  volatility: number; // Standard deviation of prices
  trend: 'up' | 'down' | 'stable'; // Simple trend indicator
  prediction: string; // Human-readable prediction
}

/** Price calendar data for flexible date search */
export interface PriceCalendarDay {
  date: string; // ISO date string
  price: number;
  available: boolean;
}

export interface PriceCalendarWeek {
  days: PriceCalendarDay[];
}

export interface PriceCalendar {
  weeks: PriceCalendarWeek[];
  minPrice: number;
  maxPrice: number;
  averagePrice: number;
  cheapestDate: string; // ISO date string of the cheapest day
  mostExpensiveDate: string; // ISO date string of the most expensive day
}



/** Trip data model for saved trip plans */
export interface Trip {
  id: string;
  name: string;
  flights: Flight[];
  hotels: Hotel[];
  notes?: string;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

/** Trip item (flight or hotel) for adding to a trip */
export interface TripItem {
  type: 'flight' | 'hotel';
  item: Flight | Hotel;
}

