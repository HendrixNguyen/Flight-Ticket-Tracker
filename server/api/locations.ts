import type { LocationSuggestion } from '../../types';

// Fallback suggestions in case SerpApi is not configured or offline
const MOCK_SUGGESTIONS: LocationSuggestion[] = [
  { id: 'SFO', name: 'San Francisco International Airport', type: 'airport', description: 'SFO - San Francisco, CA, United States', iata: 'SFO' },
  { id: 'JFK', name: 'John F. Kennedy International Airport', type: 'airport', description: 'JFK - New York, NY, United States', iata: 'JFK' },
  { id: 'LAX', name: 'Los Angeles International Airport', type: 'airport', description: 'LAX - Los Angeles, CA, United States', iata: 'LAX' },
  { id: 'LHR', name: 'London Heathrow Airport', type: 'airport', description: 'LHR - London, United Kingdom', iata: 'LHR' },
  { id: 'CDG', name: 'Paris Charles de Gaulle Airport', type: 'airport', description: 'CDG - Paris, France', iata: 'CDG' },
  { id: 'HND', name: 'Tokyo Haneda Airport', type: 'airport', description: 'HND - Tokyo, Japan', iata: 'HND' },
  { id: 'SGN', name: 'Tan Son Nhat International Airport', type: 'airport', description: 'SGN - Ho Chi Minh City, Vietnam', iata: 'SGN' },
  { id: 'SIN', name: 'Singapore Changi Airport', type: 'airport', description: 'SIN - Singapore', iata: 'SIN' },
  { id: 'DXB', name: 'Dubai International Airport', type: 'airport', description: 'DXB - Dubai, United Arab Emirates', iata: 'DXB' },
  { id: 'SYD', name: 'Sydney Kingsford Smith Airport', type: 'airport', description: 'SYD - Sydney, NSW, Australia', iata: 'SYD' },
  { id: '/m/02_286', name: 'New York (All Airports)', type: 'city', description: 'New York, NY, United States' },
  { id: '/m/06lxs', name: 'London (All Airports)', type: 'city', description: 'London, United Kingdom' },
  { id: '/m/07dfk', name: 'Tokyo (All Airports)', type: 'city', description: 'Tokyo, Japan' },
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

  // If SerpApi Key is missing, use mock suggestions for offline development
  if (!config.serpApiKey) {
    console.warn('SerpApi Key is missing. Using local mock autocomplete suggestions.');
    const filtered = MOCK_SUGGESTIONS.filter(item => 
      item.name.toLowerCase().includes(q.toLowerCase()) || 
      (item.iata && item.iata.toLowerCase().includes(q.toLowerCase())) ||
      (item.description && item.description.toLowerCase().includes(q.toLowerCase()))
    );
    return {
      success: true,
      data: filtered,
      mock: true
    };
  }

  try {
    const serpApiUrl = new URL('https://serpapi.com/search.json');
    serpApiUrl.searchParams.append('engine', 'google_flights_autocomplete');
    serpApiUrl.searchParams.append('q', q);
    serpApiUrl.searchParams.append('hl', 'en');
    serpApiUrl.searchParams.append('api_key', config.serpApiKey);

    const response: any = await $fetch(serpApiUrl.toString());

    if (response.error) {
      throw new Error(response.error);
    }

    const suggestions = response.suggestions || [];
    const mappedSuggestions: LocationSuggestion[] = [];

    suggestions.forEach((suggestion: any) => {
      // 1. Add the main location/city suggestion
      mappedSuggestions.push({
        id: suggestion.id,
        name: suggestion.type === 'city' ? `${suggestion.name} (All Airports)` : suggestion.name,
        type: suggestion.type === 'city' ? 'city' : 'region',
        description: suggestion.description || `${suggestion.name}, ${suggestion.type}`,
      });

      // 2. Add individual airports if present
      if (suggestion.airports && Array.isArray(suggestion.airports)) {
        suggestion.airports.forEach((airport: any) => {
          mappedSuggestions.push({
            id: airport.id, // IATA Code
            name: airport.name,
            type: 'airport',
            description: `${airport.id} - ${airport.city || suggestion.name}${airport.distance ? ` (${airport.distance} from center)` : ''}`,
            iata: airport.id,
          });
        });
      }
    });

    // Deduplicate suggestions by ID
    const uniqueSuggestions: LocationSuggestion[] = [];
    const seenIds = new Set<string>();

    for (const item of mappedSuggestions) {
      if (!seenIds.has(item.id)) {
        seenIds.add(item.id);
        uniqueSuggestions.push(item);
      }
    }

    return {
      success: true,
      data: uniqueSuggestions,
    };
  } catch (error: any) {
    console.error('Error fetching autocomplete suggestions from SerpApi:', error);
    
    // Fall back to mock suggestions if SerpApi call fails
    const filtered = MOCK_SUGGESTIONS.filter(item => 
      item.name.toLowerCase().includes(q.toLowerCase()) || 
      (item.iata && item.iata.toLowerCase().includes(q.toLowerCase())) ||
      (item.description && item.description.toLowerCase().includes(q.toLowerCase()))
    );

    return {
      success: true,
      data: filtered,
      error: error.message || 'SerpApi lookup failed. Falling back to local data.',
      mock: true
    };
  }
});
