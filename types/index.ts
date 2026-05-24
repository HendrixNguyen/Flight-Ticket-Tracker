export interface Flight {
  id: string;
  airline: string;
  airlineLogo?: string;
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

