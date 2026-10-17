import { ref } from 'vue';

export interface PriceHistoryPoint {
  date: string; // ISO date string
  price: number;
}

export interface PriceHistoryData {
  points: PriceHistoryPoint[];
  averagePrice: number;
  minPrice: number;
  maxPrice: number;
  volatility: number; // Standard deviation of prices
  trend: 'up' | 'down' | 'stable'; // Simple trend indicator
  prediction: string; // Human-readable prediction
}

export const usePriceHistory = () => {
  const historyData = ref<PriceHistoryData | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  let sequence = 0;

  const fetchPriceHistory = async (params: Record<string, string>) => {
    const current = ++sequence;
    loading.value = true;
    error.value = null;
    try {
      // Build query string from params
      const queryString = new URLSearchParams(params).toString();
      const endpoint = params.type === 'hotel' 
        ? `/api/hotels-history?${queryString}` 
        : `/api/flights-history?${queryString}`;
      
      const data = await $fetch<PriceHistoryData>(endpoint);
      if (current === sequence) historyData.value = data;
    } catch (e: any) {
      if (current !== sequence) return;
      error.value = e.message || 'Failed to fetch price history';
      console.error('Failed to fetch price history:', e);
    } finally {
      if (current === sequence) loading.value = false;
    }
  };

  // Format date for display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  // Get price change percentage from average
  const getPriceChangePercent = (currentPrice: number, averagePrice: number): number => {
    if (averagePrice === 0) return 0;
    return ((currentPrice - averagePrice) / averagePrice) * 100;
  };

  return {
    historyData,
    loading,
    error,
    fetchPriceHistory,
    formatDate,
    getPriceChangePercent
  };
};