import { ref } from 'vue';

// In-memory storage for trips
let trips: Trip[] = [];

// Generate a simple ID
function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

export const useTrips = () => {
  const tripsList = ref<Trip[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchTrips = async () => {
    loading.value = true;
    error.value = null;
    try {
      // In a real implementation, this would fetch from a backend API
      // For now, we'll use our in-memory storage
      tripsList.value = trips;
    } catch (e: any) {
      error.value = e.message || 'Failed to fetch trips';
      console.error('Failed to fetch trips:', e);
    } finally {
      loading.value = false;
    }
  };

  const addTrip = async (trip: Omit<Trip, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const now = new Date().toISOString();
      const newTrip = {
        ...trip,
        id: generateId(),
        createdAt: now,
        updatedAt: now
      } as Trip;
      trips.push(newTrip);
      tripsList.value.push(newTrip);
      return newTrip;
    } catch (e: any) {
      error.value = e.message || 'Failed to add trip';
      console.error('Failed to add trip:', e);
      throw e;
    }
  };

  const updateTrip = async (id: string, updates: Partial<Trip>) => {
    try {
      const index = trips.findIndex((t) => t.id === id);
      if (index !== -1) {
        const now = new Date().toISOString();
        const updatedTrip = {
          ...trips[index],
          ...updates,
          updatedAt: now
        };
        trips[index] = updatedTrip;
        
        // Update the ref
        const tripIndex = tripsList.value.findIndex((t) => t.id === id);
        if (tripIndex !== -1) {
          tripsList.value[tripIndex] = updatedTrip;
        }
        
        return updatedTrip;
      }
      throw createError({
        statusCode: 404,
        message: 'Trip not found',
      });
    } catch (e: any) {
      error.value = e.message || 'Failed to update trip';
      console.error('Failed to update trip:', e);
      throw e;
    }
  };

  const deleteTrip = async (id: string) => {
    try {
      const index = trips.findIndex((t) => t.id === id);
      if (index !== -1) {
        const deleted = trips.splice(index, 1);
        
        // Update the ref
        const tripIndex = tripsList.value.findIndex((t) => t.id === id);
        if (tripIndex !== -1) {
          tripsList.value.splice(tripIndex, 1);
        }
        
        return deleted[0];
      }
      throw createError({
        statusCode: 404,
        message: 'Trip not found',
      });
    } catch (e: any) {
      error.value = e.message || 'Failed to delete trip';
      console.error('Failed to delete trip:', e);
      throw e;
    }
  };

  // Add a flight to a trip
  const addFlightToTrip = async (tripId: string, flight: Flight) => {
    try {
      const tripIndex = trips.findIndex((t) => t.id === tripId);
      if (tripIndex !== -1) {
        const now = new Date().toISOString();
        trips[tripIndex] = {
          ...trips[tripIndex],
          flights: [...trips[tripIndex].flights, flight],
          updatedAt: now
        };
        
        // Update the ref
        const refIndex = tripsList.value.findIndex((t) => t.id === tripId);
        if (refIndex !== -1) {
          tripsList.value[refIndex] = {
            ...tripsList.value[refIndex],
            flights: [...tripsList.value[refIndex].flights, flight],
            updatedAt: now
          };
        }
        
        return trips[tripIndex];
      }
      throw createError({
        statusCode: 404,
        message: 'Trip not found',
      });
    } catch (e: any) {
      error.value = e.message || 'Failed to add flight to trip';
      console.error('Failed to add flight to trip:', e);
      throw e;
    }
  };

  // Add a hotel to a trip
  const addHotelToTrip = async (tripId: string, hotel: Hotel) => {
    try {
      const tripIndex = trips.findIndex((t) => t.id === tripId);
      if (tripIndex !== -1) {
        const now = new Date().toISOString();
        trips[tripIndex] = {
          ...trips[tripIndex],
          hotels: [...trips[tripIndex].hotels, hotel],
          updatedAt: now
        };
        
        // Update the ref
        const refIndex = tripsList.value.findIndex((t) => t.id === tripId);
        if (refIndex !== -1) {
          tripsList.value[refIndex] = {
            ...tripsList.value[refIndex],
            hotels: [...tripsList.value[refIndex].hotels, hotel],
            updatedAt: now
          };
        }
        
        return trips[tripIndex];
      }
      throw createError({
        statusCode: 404,
        message: 'Trip not found',
      });
    } catch (e: any) {
      error.value = e.message || 'Failed to add hotel to trip';
      console.error('Failed to add hotel to trip:', e);
      throw e;
    }
  };

  // Initialize by fetching trips
  // We'll call fetchTrips in onMounted in the component that uses this composable

  return {
    trips: tripsList,
    loading,
    error,
    fetchTrips,
    addTrip,
    updateTrip,
    deleteTrip,
    addFlightToTrip,
    addHotelToTrip
  };
};