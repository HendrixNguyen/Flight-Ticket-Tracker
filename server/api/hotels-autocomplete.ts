import type { HotelAutocompleteSuggestion } from '../../types';

// Curated high-fidelity mock suggestions for offline development
const MOCK_SUGGESTIONS: HotelAutocompleteSuggestion[] = [
  {
    id: 'fairmont_sf',
    name: 'The Fairmont San Francisco',
    type: 'hotel',
    description: '950 Mason St, San Francisco, CA 94108',
    thumbnail: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&auto=format&fit=crop&q=60',
    propertyToken: 'mock_fairmont_sf',
  },
  {
    id: 'standard_ny',
    name: 'The Standard, High Line',
    type: 'hotel',
    description: '848 Washington St, New York, NY 10014',
    thumbnail: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=500&auto=format&fit=crop&q=60',
    propertyToken: 'mock_standard_ny',
  },
  {
    id: 'shangrila_lon',
    name: 'Shangri-La The Shard, London',
    type: 'hotel',
    description: '31 St Thomas St, London SE1 9QU, UK',
    thumbnail: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=500&auto=format&fit=crop&q=60',
    propertyToken: 'mock_shangrila_lon',
  },
  {
    id: 'ritz_paris',
    name: 'Ritz Paris',
    type: 'hotel',
    description: '15 Place Vendôme, 75001 Paris, France',
    thumbnail: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=500&auto=format&fit=crop&q=60',
    propertyToken: 'mock_ritz_paris',
  },
  {
    id: 'bellagio_lv',
    name: 'Bellagio Hotel & Casino',
    type: 'hotel',
    description: '3600 S Las Vegas Blvd, Las Vegas, NV 89109',
    thumbnail: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=500&auto=format&fit=crop&q=60',
    propertyToken: 'mock_bellagio_lv',
  },
  {
    id: 'marina_bay_sands',
    name: 'Marina Bay Sands',
    type: 'hotel',
    description: '10 Bayfront Ave, Singapore 018956',
    thumbnail: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=500&auto=format&fit=crop&q=60',
    propertyToken: 'mock_mbs',
  },
  {
    id: 'sf_city',
    name: 'San Francisco, California',
    type: 'city',
    description: 'City in California, United States',
  },
  {
    id: 'nyc_city',
    name: 'New York City, New York',
    type: 'city',
    description: 'City in New York, United States',
  },
  {
    id: 'london_city',
    name: 'London, United Kingdom',
    type: 'capital city in the UK',
  },
  {
    id: 'paris_city',
    name: 'Paris, France',
    type: 'capital city in France',
  },
  {
    id: 'tokyo_city',
    name: 'Tokyo, Japan',
    type: 'capital city in Japan',
  },
];

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const config = useRuntimeConfig(event);
  const q = (query.q as string || '').trim();

  if (!q) {
    return {
      success: true,
      data: [],
    };
  }

  // If SerpApi Key is missing, fall back to mock data
  if (!config.serpApiKey) {
    const filtered = MOCK_SUGGESTIONS.filter((item) =>
      item.name.toLowerCase().includes(q.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(q.toLowerCase()))
    );
    return {
      success: true,
      data: filtered,
      mock: true,
    };
  }

  try {
    const serpApiUrl = new URL('https://serpapi.com/search.json');
    serpApiUrl.searchParams.append('engine', 'google_hotels_autocomplete');
    serpApiUrl.searchParams.append('q', q);
    serpApiUrl.searchParams.append('hl', 'en');
    serpApiUrl.searchParams.append('api_key', config.serpApiKey);

    const response: any = await $fetch(serpApiUrl.toString());

    if (response.error) {
      throw new Error(response.error);
    }

    const suggestions = response.suggestions || [];
    const mappedSuggestions: HotelAutocompleteSuggestion[] = suggestions.map((item: any) => {
      // Normalize types to match our exact union types
      let normalizedType: 'hotel' | 'city' | 'region' = 'hotel';
      if (item.type === 'city') {
        normalizedType = 'city';
      } else if (item.type === 'region') {
        normalizedType = 'region';
      }

      return {
        id: item.property_token || item.kgmid || item.data_cid || `suggestion-${Math.random().toString(36).substring(2, 11)}`,
        name: item.value || '',
        type: normalizedType,
        description: item.autocomplete_suggestion || item.location || '',
        thumbnail: item.thumbnail || '',
        propertyToken: item.property_token || undefined,
      };
    });

    return {
      success: true,
      data: mappedSuggestions,
    };
  } catch (error: any) {
    console.error('Error querying SerpApi Google Hotels Autocomplete:', error);
    
    // Fall back to filtered mock suggestions in case of API failure
    const filtered = MOCK_SUGGESTIONS.filter((item) =>
      item.name.toLowerCase().includes(q.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(q.toLowerCase()))
    );

    return {
      success: true,
      data: filtered,
      error: error.message || 'Failed to fetch suggestions from SerpApi. Local database fallback active.',
      mock: true,
    };
  }
});
