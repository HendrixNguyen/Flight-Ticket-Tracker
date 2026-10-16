<template>
  <div class="min-h-screen flex flex-col font-sans text-gray-900 dark:text-slate-100 transition-colors duration-300 relative">
    <!-- The canvas layer -->
    <div class="canvas fixed inset-0 -z-10 pointer-events-none overflow-hidden">
      <div class="absolute -top-[32%] -left-[22%] w-[85%] h-[75%] rounded-full bg-sky-200/25 dark:bg-blue-600/10 blur-[160px]"></div>
      <div class="absolute -bottom-[28%] -right-[18%] w-[75%] h-[70%] rounded-full bg-violet-200/25 dark:bg-violet-600/10 blur-[160px]"></div>
    </div>

    <!-- Floating header -->
    <header class="sticky top-0 z-40 px-3 pt-3 sm:px-5 sm:pt-4 lg:px-6">
      <div class="glass-card glass-grain mx-auto max-w-7xl rounded-glass-lg px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center gap-4">
        <!-- Logo -->
        <NuxtLink
          to="/"
          class="pill outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:focus-visible:outline-blue-300 flex items-center gap-2 rounded-xl cursor-pointer select-none"
        >
          <Plane class="w-7 h-7 rotate-45 text-blue-600 dark:text-blue-400" />
          <h1 class="text-xl sm:text-2xl font-black tracking-tight bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 dark:from-blue-300 dark:via-blue-200 dark:to-indigo-300 bg-clip-text text-transparent">
            SkyCrawler
          </h1>
        </NuxtLink>

        <!-- Header Navigation Links -->
        <div class="flex items-center gap-3 sm:gap-5">
          <nav aria-label="Primary">
            <ul class="flex items-center gap-1 sm:gap-2 text-sm">
              <li>
                <NuxtLink
                  to="/"
                  class="pill outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:focus-visible:outline-blue-300 rounded-full px-3.5 py-1.5 transition-colors duration-200 cursor-pointer select-none"
                  :class="[
                    route.path === '/'
                      ? 'bg-blue-600 text-white font-black shadow-md shadow-blue-500/25'
                      : 'glass glass-hover text-slate-600 dark:text-slate-300 font-semibold hover:text-slate-900 dark:hover:text-white',
                  ]"
                >
                  Flights
                </NuxtLink>
              </li>
              <li>
                <NuxtLink
                  to="/hotels"
                  class="pill outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:focus-visible:outline-blue-300 rounded-full px-3.5 py-1.5 transition-colors duration-200 cursor-pointer select-none"
                  :class="[
                    route.path === '/hotels'
                      ? 'bg-blue-600 text-white font-black shadow-md shadow-blue-500/25'
                      : 'glass glass-hover text-slate-600 dark:text-slate-300 font-semibold hover:text-slate-900 dark:hover:text-white',
                  ]"
                >
                  Hotels
                </NuxtLink>
              </li>
              <li>
                <NuxtLink
                  to="/alerts"
                  class="pill outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:focus-visible:outline-blue-300 rounded-full px-3.5 py-1.5 transition-colors duration-200 cursor-pointer select-none"
                  :class="[
                    route.path === '/alerts'
                      ? 'bg-blue-600 text-white font-black shadow-md shadow-blue-500/25'
                      : 'glass glass-hover text-slate-600 dark:text-slate-300 font-semibold hover:text-slate-900 dark:hover:text-white',
                  ]"
                >
                  Alerts
                </NuxtLink>
              </li>
              <li>
                <NuxtLink
                  to="/trips"
                  class="pill outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:focus-visible:outline-blue-300 rounded-full px-3.5 py-1.5 transition-colors duration-200 cursor-pointer select-none"
                  :class="[
                    route.path === '/trips'
                      ? 'bg-blue-600 text-white font-black shadow-md shadow-blue-500/25'
                      : 'glass glass-hover text-slate-600 dark:text-slate-300 font-semibold hover:text-slate-900 dark:hover:text-white',
                  ]"
                >
                  Trips
                </NuxtLink>
              </li>
            </ul>
          </nav>
          <div class="flex items-center gap-2 sm:gap-3">
            <CurrencySelector @change="handleCurrencyChange" />
            <ThemeSwitcher />
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content Grid -->
    <main class="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full relative z-10">
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
    </main>

    <!-- Footer -->
    <footer class="mt-auto w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-center">
      <p class="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest">
        &copy; {{ new Date().getFullYear() }} SkyCrawler. Curating The Smart Travel Network.
      </p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from '#imports';
import { Plane } from 'lucide-vue-next';
import { useCurrency } from '~/composables/useCurrency';
import { useTrips } from '~/composables/useTrips';
import type { Trip } from '~/types';

const { formatAmount } = useCurrency();
const { trips: tripsList, addTrip, loading: tripsLoading, error: tripsError } = useTrips();

const route = useRoute();
const router = useRouter();

const trips = ref<Trip[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

// Fetch trips on mount
const fetchTrips = async () => {
  loading.value = true;
  error.value = null;
  try {
    const data = await fetchTrips(); // This calls the composable function
    trips.value = data;
  } catch (e: any) {
    error.value = e.message || 'Failed to fetch trips';
    console.error('Failed to fetch trips:', e);
  } finally {
    loading.value = false;
  }
};

const deleteTrip = async (id: string) => {
  try {
    await deleteTrip(id); // This calls the composable function
    trips.value = trips.value.filter((t) => t.id !== id);
  } catch (e: any) {
    error.value = e.message || 'Failed to delete trip';
    console.error('Failed to delete trip:', e);
  }
};

const editTrip = async (id: string) => {
  // In a full implementation, we would navigate to an edit trip page
  // For now, we'll just show an alert
  alert('Edit trip functionality would be implemented here');
};

// Handle currency change
const handleCurrencyChange = () => {
  // Refetch trips to ensure currency is consistent
  fetchTrips();
};

// Format date for display
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

// Fetch trips on mount
onMounted(() => {
  fetchTrips();
});
</script>