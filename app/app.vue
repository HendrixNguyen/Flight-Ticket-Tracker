<template>
  <div class="min-h-screen bg-gray-50 dark:bg-slate-950 flex flex-col font-sans text-gray-900 dark:text-slate-100 transition-colors duration-300 relative">
    <!-- Decorative Glowing Blobs for 2026 Glassmorphism Trend -->
    <div class="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <div class="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-400/20 dark:bg-blue-600/10 blur-[120px]"></div>
      <div class="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] rounded-full bg-indigo-400/20 dark:bg-indigo-600/10 blur-[120px]"></div>
    </div>

    <header class="bg-blue-600 dark:bg-slate-900/60 backdrop-blur-md text-white shadow-md border-b dark:border-slate-800 transition-colors">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div class="flex items-center gap-2">
          <Plane class="w-8 h-8" />
          <h1 class="text-2xl font-bold tracking-tight">SkyCrawler</h1>
        </div>
        
        <div class="flex items-center gap-6">
          <nav>
            <ul class="flex space-x-4 font-medium text-blue-100 dark:text-slate-300">
              <li><a href="#" class="hover:text-white dark:hover:text-slate-100 transition-colors">Flights</a></li>
              <li><a href="#" class="hover:text-white dark:hover:text-slate-100 transition-colors">Hotels</a></li>
              <li><a href="#" class="hover:text-white dark:hover:text-slate-100 transition-colors">Deals</a></li>
            </ul>
          </nav>
          <ThemeSwitcher />
        </div>
      </div>
    </header>

    <main class="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full relative z-10">
      <!-- Search Form Section -->
      <div class="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl p-6 rounded-3xl shadow-sm border border-white/40 dark:border-white/10 mb-8 transform hover:shadow-md transition-all relative z-20">
        <FlightSearchForm @search="handleSearch" />
      </div>

      <div class="flex flex-col lg:flex-row gap-8 relative z-10">
        <!-- Sidebar Filters -->
        <aside class="w-full lg:w-1/4">
          <FilterSidebar 
            :active-filters="filters"
            @update:filters="updateFilters"
            @update:sort="updateSort"
          />
        </aside>

        <!-- Main Content -->
        <section class="w-full lg:w-3/4">
          <div v-if="pending" class="flex justify-center items-center py-20">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
          <div v-else-if="error" class="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200">
            Failed to load flights. Please try again.
          </div>
          <FlightList 
            v-else
            :flights="filteredAndSortedFlights" 
            :searched="hasSearched"
          />
        </section>
      </div>
    </main>

    <footer class="bg-gray-800 text-gray-400 py-8 text-center mt-auto">
      <p>&copy; {{ new Date().getFullYear() }} SkyCrawler. All rights reserved.</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Plane } from 'lucide-vue-next';
import type { Flight, SearchQuery, FilterOptions, SortOption } from '~/types';

const hasSearched = ref(false);
const rawFlights = ref<Flight[]>([]);
const pending = ref(false);
const error = ref(false);

const filters = ref<FilterOptions>({
  maxPrice: 1500,
  airlines: [],
  maxStops: 2,
});
const sortBy = ref<SortOption>('price_asc');

// Handlers
const handleSearch = async (query: SearchQuery) => {
  pending.value = true;
  error.value = false;
  
  try {
    const { data } = await $fetch('/api/flights', {
      params: {
        from: query.from,
        to: query.to,
        date: query.date,
        returnDate: query.returnDate,
      }
    });
    
    if (data) {
      rawFlights.value = data as Flight[];
    }
    hasSearched.value = true;
  } catch (err) {
    console.error('Failed to fetch flights:', err);
    error.value = true;
  } finally {
    pending.value = false;
  }
};

const updateFilters = (newFilters: FilterOptions) => {
  filters.value = { ...filters.value, ...newFilters };
};

const updateSort = (newSort: SortOption) => {
  sortBy.value = newSort;
};

// Computed state for filtered and sorted flights
const filteredAndSortedFlights = computed(() => {
  let result = [...rawFlights.value];

  // Apply filters
  if (filters.value.maxPrice) {
    result = result.filter(f => f.price <= filters.value.maxPrice!);
  }
  if (filters.value.maxStops !== undefined) {
    result = result.filter(f => f.stops <= filters.value.maxStops!);
  }
  if (filters.value.airlines && filters.value.airlines.length > 0) {
    result = result.filter(f => filters.value.airlines!.includes(f.airline));
  }

  // Apply sorting
  result.sort((a, b) => {
    switch (sortBy.value) {
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
