<template>
  <div>
      <h2 class="text-2xl font-black mb-6">My Trips</h2>

      <div v-if="loading" class="flex flex-col justify-center items-center py-20">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p class="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest animate-pulse">Loading trips...</p>
      </div>

      <div v-else-if="error" class="error-panel p-4 rounded-2xl flex items-start gap-3 text-red-700 dark:text-red-300">
        <CircleAlert class="w-5 h-5 flex-none mt-0.5" aria-hidden="true" />
        <div class="flex flex-col gap-1">
          <h4 class="font-bold text-sm">Error Loading Trips</h4>
          <p class="text-xs">{{ error }}</p>
        </div>
      </div>

      <div v-else-if="trips.length === 0" class="text-center py-20">
        <p class="text-xl font-medium text-slate-600 dark:text-slate-300">
          No trips saved yet. Save flights and hotels to your trips from the search results.
        </p>
        <div class="flex justify-center space-x-4 mt-6">
          <NuxtLink
            to="/"
            class="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Search Flights
          </NuxtLink>
          <NuxtLink
            to="/hotels"
            class="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Search Hotels
          </NuxtLink>
        </div>
      </div>

      <div v-else class="space-y-4">
        <div v-for="trip in trips" :key="trip.id" class="glass-card glass-grain p-6 rounded-xl border-l-4">
          <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div class="flex flex-col flex-1 sm:basis-1/3">
              <h3 class="text-lg font-black mb-2">{{ trip.name || 'Untitled Trip' }}</h3>
              <p class="text-sm text-slate-600 dark:text-slate-300 mb-1">
                {{ trip.flights.length }} flight{{ trip.flights.length !== 1 ? 's' : '' }}, 
                {{ trip.hotels.length }} hotel{{ trip.hotels.length !== 1 ? 's' : '' }}
              </p>
              <p class="text-xs text-slate-500 dark:text-slate-400 mb-2">
                {{ formatDate(trip.createdAt) }} • {{ formatDate(trip.updatedAt) }}
              </p>
              <p class="text-xs text-slate-500 dark:text-slate-400" v-if="trip.notes">
                {{ trip.notes }}
              </p>
            </div>
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full sm:w-2/3">
              <div class="flex flex-col items-start sm:items-center">
                <p class="text-sm font-medium text-slate-600 dark:text-slate-300">
                  Flights:
                </p>
                <p class="text-2xl font-black">
                  {{ trip.flights.length }}
                </p>
              </div>
              <div class="flex flex-col items-start sm:items-center">
                <p class="text-sm font-medium text-slate-600 dark:text-slate-300">
                  Hotels:
                </p>
                <p class="text-2xl font-bold">
                  {{ trip.hotels.length }}
                </p>
              </div>
            </div>
            <div class="flex justify-end space-x-3 mt-4">
              <button
                @click="editTrip(trip.id)"
                class="px-3 py-1.5 text-sm font-medium bg-blue-500 hover:bg-blue-600 text-white rounded"
              >
                Edit
              </button>
              <button
                @click="deleteTrip(trip.id)"
                class="px-3 py-1.5 text-sm font-medium bg-red-500 hover:bg-red-600 text-white rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { CircleAlert } from 'lucide-vue-next';
import { useTrips } from '~/composables/useTrips';
const { trips, loading, error, fetchTrips, deleteTrip, updateTrip } = useTrips();
const editTrip = async (id: string) => {
  const trip = trips.value.find(t => t.id === id);
  const name = window.prompt('Trip name', trip?.name);
  if (name?.trim()) await updateTrip(id, { name: name.trim() });
};
const formatDate = (date: string) => new Date(date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
onMounted(fetchTrips);
</script>
