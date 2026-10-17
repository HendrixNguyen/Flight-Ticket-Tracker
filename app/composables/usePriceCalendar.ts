import { ref } from 'vue';

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

export const usePriceCalendar = () => {
  const calendarData = ref<PriceCalendar | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  let sequence = 0;

  const fetchPriceCalendar = async (params: Record<string, string>) => {
    const current = ++sequence;
    loading.value = true;
    error.value = null;
    try {
      // Build query string from params
      const queryString = new URLSearchParams(params).toString();
      const endpoint = params.type === 'hotel' 
        ? `/api/hotels-calendar?${queryString}` 
        : `/api/flights-calendar?${queryString}`;
      
      const data = await $fetch<PriceCalendar>(endpoint);
      if (current === sequence) calendarData.value = data;
    } catch (e: any) {
      if (current !== sequence) return;
      error.value = e.message || 'Failed to fetch price calendar';
      console.error('Failed to fetch price calendar:', e);
    } finally {
      if (current === sequence) loading.value = false;
    }
  };

  // Format date for display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  // Get day name
  const getDayName = (dateString: string): string => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString(undefined, { weekday: 'short' });
  };

  // Check if date is weekend
  const isWeekend = (dateString: string): boolean => {
    const date = new Date(dateString + 'T00:00:00');
    const day = date.getDay();
    return day === 0 || day === 6; // Sunday or Saturday
  };

  return {
    calendarData,
    loading,
    error,
    fetchPriceCalendar,
    formatDate,
    getDayName,
    isWeekend
  };
};