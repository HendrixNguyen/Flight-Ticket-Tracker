import type { FilterOptions, HotelFilterOptions } from '~/types';

/** Slider bounds and defaults, shared by each page and its sidebar so that
 *  "Reset" restores the same values the page initialises with.
 *
 *  The default max price equals the slider max deliberately: anything lower
 *  would silently hide results before the user touches a control. */
export const FLIGHT_PRICE_RANGE = { min: 100, max: 2000, step: 50 } as const;
export const FLIGHT_DEFAULT_FILTERS: FilterOptions = {
  maxPrice: FLIGHT_PRICE_RANGE.max,
  airlines: [],
  maxStops: 2,
};

export const HOTEL_PRICE_RANGE = { min: 50, max: 1000, step: 25 } as const;
export const HOTEL_DEFAULT_FILTERS: HotelFilterOptions = {
  maxPrice: HOTEL_PRICE_RANGE.max,
  minRating: 0,
};