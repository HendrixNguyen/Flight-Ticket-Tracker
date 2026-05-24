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

export interface HotelAutocompleteSuggestion {
  id: string;
  name: string;
  type: 'hotel' | 'city' | 'region';
  description?: string;
  thumbnail?: string;
  propertyToken?: string;
}

