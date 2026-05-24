<template>
  <div class="flex flex-col gap-4 w-full">
    
    <!-- Search Card Form Section -->
    <div class="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl p-6 rounded-3xl shadow-sm border border-white/40 dark:border-white/10 mb-8 transform hover:shadow-md transition-all relative z-20">
      <FlightSearchForm @search="handleFlightSearch" />
    </div>

    <!-- Active Search Grid -->
    <div class="flex flex-col lg:flex-row gap-8 relative z-10">
      
      <!-- Sidebar Filters -->
      <aside class="w-full lg:w-1/4">
        <FilterSidebar 
          :active-filters="flightFilters"
          @update:filters="updateFlightFilters"
          @update:sort="updateFlightSort"
        />
      </aside>

      <!-- Listings Content Section -->
      <section class="w-full lg:w-3/4">
        <div v-if="isSearching" class="flex flex-col justify-center items-center py-20 gap-4">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest animate-pulse">Crawling real-time flight deals...</p>
        </div>
        
        <div v-else-if="hasFailed" class="bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 p-4 rounded-2xl border border-red-200/50 dark:border-red-900/30 flex flex-col gap-2">
          <h4 class="font-bold text-sm">Search Interrupted</h4>
          <p class="text-xs">{{ errorMessage || 'An unexpected API connection error occurred. Please try again.' }}</p>
        </div>
        
        <div v-else>
          <FlightList 
            :flights="filteredAndSortedFlights" 
            :searched="hasSearchedFlights"
          />
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { Flight, SearchQuery, FilterOptions, SortOption } from '~/types';

// Flight state
const hasSearchedFlights = ref(false);
const rawFlights = ref<Flight[]>([]);
const flightFilters = ref<FilterOptions>({
  maxPrice: 1500,
  airlines: [],
  maxStops: 2,
});
const flightSortBy = ref<SortOption>('price_asc');

// Shared loaders and error trackers
const isSearching = ref(false);
const hasFailed = ref(false);
const errorMessage = ref('');

// Flight Search triggers
const handleFlightSearch = async (query: SearchQuery) => {
  isSearching.value = true;
  hasFailed.value = false;
  
  try {
    const response = await $fetch<{ success: boolean; data: Flight[]; error?: string }>('/api/flights', {
      params: {
        from: query.from,
        to: query.to,
        date: query.date,
        returnDate: query.returnDate,
      }
    });
    
    if (response && response.success) {
      rawFlights.value = response.data;
      hasSearchedFlights.value = true;
    } else {
      hasFailed.value = true;
      errorMessage.value = response?.error || 'Failed to crawl flights.';
    }
  } catch (err: any) {
    console.error('Failed to fetch flights:', err);
    hasFailed.value = true;
    errorMessage.value = err.message || 'An unexpected connection error occurred.';
  } finally {
    isSearching.value = false;
  }
};

const updateFlightFilters = (newFilters: FilterOptions) => {
  flightFilters.value = { ...flightFilters.value, ...newFilters };
};

const updateFlightSort = (newSort: SortOption) => {
  flightSortBy.value = newSort;
};

// Computed state for filtered and sorted flights
const filteredAndSortedFlights = computed(() => {
  let result = [...rawFlights.value];

  // Apply filters
  if (flightFilters.value.maxPrice) {
    result = result.filter(f => f.price <= flightFilters.value.maxPrice!);
  }
  if (flightFilters.value.maxStops !== undefined) {
    result = result.filter(f => f.stops <= flightFilters.value.maxStops!);
  }
  if (flightFilters.value.airlines && flightFilters.value.airlines.length > 0) {
    result = result.filter(f => flightFilters.value.airlines!.includes(f.airline));
  }

  // Apply sorting
  result.sort((a, b) => {
    switch (flightSortBy.value) {
      case 'price_asc':
        return a.price - b.price;
      case 'price_desc':
        return b.price - a.price;
      case 'time_asc':
        return new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime();
      case 'duration_asc':
        return a.durationMinutes - b.durationMinutes;
      default:
        return 0;
    }
  });

  return result;
});
</script>
