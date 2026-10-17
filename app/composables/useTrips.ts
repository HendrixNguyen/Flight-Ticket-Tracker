import type { Trip, Flight, Hotel } from '../../types';

const STORAGE_KEY = 'skycrawler-trips';

export const useTrips = () => {
  const trips = useState<Trip[]>('trips', () => []);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const persist = () => {
    if (import.meta.client) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(trips.value));
      } catch {
        error.value = 'Unable to save trips in browser storage.';
      }
    }
  };
  const fetchTrips = async () => {
    loading.value = true;
    try {
      if (import.meta.client) {
        const saved = localStorage.getItem(STORAGE_KEY);
        const parsed: unknown = saved ? JSON.parse(saved) : [];
        if (Array.isArray(parsed))
          trips.value = parsed.filter(
            (t) =>
              t && typeof t.id === 'string' && Array.isArray(t.flights) && Array.isArray(t.hotels),
          );
      }
    } catch {
      error.value = 'Unable to load saved trips.';
    } finally {
      loading.value = false;
    }
    return trips.value;
  };
  const addTrip = async (trip: Omit<Trip, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const result: Trip = { ...trip, id: crypto.randomUUID(), createdAt: now, updatedAt: now };
    trips.value.push(result);
    persist();
    return result;
  };
  const updateTrip = async (id: string, updates: Partial<Trip>) => {
    const index = trips.value.findIndex((t) => t.id === id);
    if (index < 0) throw new Error('Trip not found');
    const result = { ...trips.value[index]!, ...updates, id, updatedAt: new Date().toISOString() };
    trips.value[index] = result;
    persist();
    return result;
  };
  const deleteTrip = async (id: string) => {
    const index = trips.value.findIndex((t) => t.id === id);
    if (index < 0) throw new Error('Trip not found');
    const [deleted] = trips.value.splice(index, 1);
    persist();
    return deleted;
  };
  const addFlightToTrip = async (id: string, flight: Flight) => {
    const trip = trips.value.find((t) => t.id === id);
    if (!trip) throw new Error('Trip not found');
    return updateTrip(id, { flights: [...trip.flights, flight] });
  };
  const addHotelToTrip = async (id: string, hotel: Hotel) => {
    const trip = trips.value.find((t) => t.id === id);
    if (!trip) throw new Error('Trip not found');
    return updateTrip(id, { hotels: [...trip.hotels, hotel] });
  };
  const saveItem = async (item: Flight | Hotel, type: 'flight' | 'hotel') => {
    await fetchTrips();
    let trip = trips.value[0];
    if (!trip) trip = await addTrip({ name: 'My Trip', flights: [], hotels: [] });
    return type === 'flight'
      ? addFlightToTrip(trip.id, item as Flight)
      : addHotelToTrip(trip.id, item as Hotel);
  };
  return {
    trips,
    loading,
    error,
    fetchTrips,
    addTrip,
    updateTrip,
    deleteTrip,
    addFlightToTrip,
    addHotelToTrip,
    saveItem,
  };
};
