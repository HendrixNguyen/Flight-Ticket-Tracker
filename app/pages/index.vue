<template>
  <div class="flex flex-col gap-4 w-full">
    
    <!-- Search Card Form Section.

         `.glass-card` carries its own fill, blur, border and layered shadow, so
         the old `bg-white/40 backdrop-blur-xl border-white/40 shadow-sm
         hover:shadow-md` stack on top of it was not adding depth -- each of those
         utilities replaces part of the material and flattens it to a single dead
         fill. `.glass-grain` on top because a pane this large is the surface
         most likely to read as flat vector; the lift is a scoped rule for the
         same reason (see the style block). -->
    <div class="glass-card glass-grain search-pane p-6 rounded-3xl mb-8 relative z-20">
      <FlightSearchForm
        :initial="formInitial"
        @search="handleFlightSearch"
        @change="syncUrl"
      />
    </div>

    <!-- Active Search Grid -->
    <div class="flex flex-col lg:flex-row gap-8 relative z-10">
      <!-- Set Price Alert Button -->
      <div class="w-full mb-4 lg:mb-0">
        <button
          @click="openAlertModal"
          class="w-full px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          :disabled="alertLoading || !hasSearchedFlights"
        >
          Set Price Alert
        </button>
      </div>
      
      <!-- Sidebar Filters -->
      <aside class="w-full lg:w-1/4">
          <ActiveFilterChips :chips="activeChips" @remove="removeFilter" />
          <FilterSheet
            title="Filters"
            :count="activeChips.length"
            :result-count="filteredAndSortedFlights.length"
          >
            <FilterSidebar
              :active-filters="flightFilters"
              @update:filters="updateFlightFilters"
              @update:sort="updateFlightSort"
            />
          </FilterSheet>
        </aside>

      <!-- Listings Content Section -->
      <section class="w-full lg:w-3/4">
        <div v-if="isSearching" class="flex flex-col justify-center items-center py-20 gap-4">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p class="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest animate-pulse">Crawling real-time flight deals...</p>
        </div>

        <!-- Deliberately NOT `.glass`: a neutral pane here would read as an empty
             result, and this state means the opposite. It keeps the same
             translucency and blur so it still belongs to the atmosphere, but the
             fill, the border and the shadow are all red, and the icon plus the
             heading carry the meaning without relying on colour alone. -->
        <div v-else-if="hasFailed" class="error-panel p-4 rounded-2xl flex items-start gap-3 text-red-700 dark:text-red-300">
          <CircleAlert class="w-5 h-5 flex-none mt-0.5" aria-hidden="true" />
          <div class="flex flex-col gap-1">
            <h4 class="font-bold text-sm">Search Interrupted</h4>
            <p class="text-xs">{{ errorMessage || 'An unexpected API connection error occurred. Please try again.' }}</p>
          </div>
        </div>
        
          <div v-else>
            <!-- Price Calendar (for flexible date searches) -->
            <div v-if="hasCalendarData" class="mb-6">
              <PriceCalendar 
                :calendarData="calendarData" 
                :loading="false" 
                :error="null"
              />
            </div>
            
            <!-- Price History Chart -->
            <div v-if="hasSearchedFlights && !hasCalendarData" class="mb-6">
              <PriceHistoryChart 
                :historyData="flightHistoryData" 
                :loading="historyLoading" 
                :error="historyError" 
                :currentPrice="rawFlights.length > 0 ? Math.min(...rawFlights.value.map(f => f.price)) : undefined"
              />
            </div>
            
            <FlightList
              :flights="filteredAndSortedFlights"
              :searched="hasSearchedFlights"
              :total="rawFlights.length"
              :cached="wasCached"
              show-refresh
              :refreshing="isSearching"
              @refresh="refreshFlights"
            />
        </div>
      </section>
   </div>
 </div>

<!-- Alert Modal -->
<div v-show="showAlertModal" class="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/45 dark:bg-slate-950/70 backdrop-blur-md">
  <div class="glass-elevated glass-grain rounded-3xl p-6 max-w-md w-full relative select-none">
    <div class="flex justify-between items-start mb-4">
      <h3 class="text-xl font-black text-slate-900 dark:text-slate-100">Set Price Alert</h3>
      <button @click="closeAlertModal" class="text-slate-500 hover:text-slate-700">
        <CircleAlert class="w-5 h-5" />
      </button>
    </div>
    <form @submit.prevent="saveAlert">
      <div class="mb-4">
        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Alert Type
        </label>
        <div class="flex space-x-4">
          <label class="flex items-center space-x-2 text-sm font-medium text-slate-700 dark:text-slate-300">
            <input
              type="radio"
              value="flight"
              v-model="alertType"
              class="form-radio h-4 w-4 text-blue-600"
            />
            Flight
          </label>
          <label class="flex items-center space-x-2 text-sm font-medium text-slate-700 dark:text-slate-300">
            <input
              type="radio"
              value="hotel"
              v-model="alertType"
              class="form-radio h-4 w-4 text-blue-600"
            />
            Hotel
          </label>
        </div>
      </div>
      <div class="mb-4">
        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Threshold Price ({{ currencyCode.value }})
        </label>
        <input
          type="number"
          v-model.number="alertThreshold"
          min="0"
          step="1"
          class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter threshold price"
        />
      </div>
      <div class="mb-4">
        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Current Search
        </label>
        <div class="text-sm text-slate-500 dark:text-slate-400">
          {{ alertType.value === 'flight' ? `From: ${lastQuery.value?.from || ''} To: ${lastQuery.value?.to || ''}` : `Destination: ${lastQuery.value?.destination || ''}` }}
        </div>
      </div>
      <div class="flex justify-end space-x-3">
        <button
          @click="closeAlertModal"
          class="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          class="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          :disabled="alertLoading"
        >
          Save Alert
        </button>
      </div>
    </form>
  </div>
</div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from '#imports';
import { CircleAlert } from 'lucide-vue-next';
import type { Flight, SearchQuery, FilterOptions, SortOption, Alert } from '~/types';
import { FLIGHT_DEFAULT_FILTERS, FLIGHT_PRICE_RANGE } from '~/utils/filterDefaults';
import { useCurrency } from '~/composables/useCurrency';
import { useAlerts } from '~/composables/useAlerts';
import { useAlertChecking } from '~/composables/useAlertChecking';
import { usePriceHistory } from '~/composables/usePriceHistory';
import PriceHistoryChart from '~/components/PriceHistoryChart.vue';

const { currencyCode, restore } = useCurrency();
const { alerts: alertList, addAlert: addAlertApi, loading: alertLoading } = useAlerts();
const { checkAlertPrices, checking: alertChecking } = useAlertChecking();
const { historyData: flightHistoryData, loading: historyLoading, error: historyError, fetchPriceHistory: fetchFlightHistory, formatDate, getPriceChangePercent } = usePriceHistory();

// Calendar data for flexible date search
const hasCalendarData = ref(false);
const calendarData = ref<any>(null);

const route = useRoute();
const router = useRouter();

// Flight state
const hasSearchedFlights = ref(false);
const rawFlights = ref<Flight[]>([]);
const flightFilters = ref<FilterOptions>({ ...FLIGHT_DEFAULT_FILTERS });
const flightSortBy = ref<SortOption>('price_asc');

// Hydrate the form from the query string so searches are shareable and survive
// a refresh or back-navigation.
const formInitial = computed<Partial<SearchQuery>>(() => ({
  from: (route.query.from as string) || '',
  to: (route.query.to as string) || '',
  date: (route.query.date as string) || undefined,
  returnDate: (route.query.returnDate as string) || '',
}));

const syncUrl = (query: SearchQuery) => {
  router.replace({
    query: {
      ...(query.from ? { from: query.from } : {}),
      ...(query.to ? { to: query.to } : {}),
      ...(query.date ? { date: query.date } : {}),
      ...(query.returnDate ? { returnDate: query.returnDate } : {}),
    },
  });
};

// Shared loaders and error trackers
const isSearching = ref(false);
const hasFailed = ref(false);
const errorMessage = ref('');
const wasCached = ref(false);
const lastQuery = ref<SearchQuery | null>(null);

// Flight Search triggers
const handleFlightSearch = async (query: SearchQuery, refresh = false) => {
  isSearching.value = true;
  hasFailed.value = false;
  syncUrl(query);
  lastQuery.value = query;

    try {
      const response = await $fetch<{ success: boolean; data: Flight[]; error?: string }>('/api/flights', {
        params: {
          from: query.from,
          to: query.to,
          date: query.date,
          returnDate: query.returnDate,
          // Ask the server to bypass its cache so the user sees live prices.
          refresh: refresh ? 1 : undefined,
          currency: currencyCode.value,
          // Add flexible dates flag if present
          flexibleDates: query.flexibleDates ? 1 : undefined
        }
      });

      // Surfaced so the user can tell cached results from a live lookup.
      wasCached.value = response.headers?.get('x-cache') === 'HIT';
      
      if (response && response.success) {
        // If flexible dates is requested, we expect price calendar data
        if (query.flexibleDates) {
          // In a real implementation, the response would contain price calendar data
          // For now, we'll store it in a separate variable and show the calendar UI
          rawFlights.value = response.data; // This would actually be calendar data
          hasSearchedFlights.value = true;
          // Set a flag to indicate we have calendar data
          hasCalendarData.value = true;
          calendarData.value = response.data as any; // Assuming we have this ref
        } else {
          rawFlights.value = response.data;
          hasSearchedFlights.value = true;
          
          // Fetch price history for this search
          if (lastQuery.value) {
            fetchFlightHistory({
              from: lastQuery.value.from,
              to: lastQuery.value.to,
              date: lastQuery.value.date,
              returnDate: lastQuery.value.returnDate || '',
              passengers: lastQuery.value.passengers || 1,
              type: 'flight'
            });
          }
        }
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

// A currency change invalidates the current results, since the same search
// returns different amounts. Re-run the active search with a forced refresh so
// the cache does not serve the previous currency's prices.
const handleCurrencyChange = () => {
  if (lastQuery.value) {
    handleFlightSearch(lastQuery.value, true);
  }
};

onUnmounted(() => {
  window.removeEventListener('currency-changed', handleCurrencyChange);
});

// Run the search on mount when the URL carries a complete query, so a shared
// link restores the results rather than just the form fields.
onMounted(() => {
  window.addEventListener('currency-changed', handleCurrencyChange);

  // Apply the stored currency before searching, so the initial request asks for
  // the right prices. Doing this here rather than relying on the header mounting
  // first keeps the search correct regardless of component order.
  restore();

  const { from, to, date } = route.query;
  if (from && to && date) {
    handleFlightSearch({
      from: from as string,
      to: to as string,
      date: date as string,
      returnDate: (route.query.returnDate as string) || '',
      passengers: 1,
    });
  }
});

// Force a live upstream lookup instead of serving cached prices.
const refreshFlights = () => {
  if (lastQuery.value) {
    handleFlightSearch(lastQuery.value, true);
  }
};

const updateFlightFilters = (newFilters: FilterOptions) => {
  flightFilters.value = { ...flightFilters.value, ...newFilters };
};

const updateFlightSort = (newSort: SortOption) => {
  flightSortBy.value = newSort;
};

// Chips only list filters that differ from the defaults, so a fresh search
// shows none rather than a row of no-op badges.
const activeChips = computed(() => {
  const chips: { key: string; label: string }[] = [];
  const f = flightFilters.value;

  if (f.maxPrice !== undefined && f.maxPrice < FLIGHT_PRICE_RANGE.max) {
    chips.push({ key: 'maxPrice', label: `Under $${f.maxPrice} (USD)` });
  }
  if (f.maxStops !== undefined && f.maxStops !== FLIGHT_DEFAULT_FILTERS.maxStops) {
    const labels: Record<number, string> = { 0: 'Direct only', 1: 'Max 1 stop' };
    chips.push({ key: 'maxStops', label: labels[f.maxStops] ?? `Max ${f.maxStops} stops` });
  }
  if (f.airlines && f.airlines.length > 0) {
    chips.push({ key: 'airlines', label: `${f.airlines.length} airline${f.airlines.length === 1 ? '' : 's'}` });
  }

  return chips;
});

const removeFilter = (key: string) => {
  const f = { ...flightFilters.value };
  if (key === 'maxPrice') f.maxPrice = FLIGHT_PRICE_RANGE.max;
  if (key === 'maxStops') f.maxStops = FLIGHT_DEFAULT_FILTERS.maxStops;
  if (key === 'airlines') f.airlines = [];
  flightFilters.value = f;
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

// Alert modal state
const showAlertModal = ref(false);
const alertThreshold = ref(0);
const alertType = ref<'flight' | 'hotel'>('flight');

const openAlertModal = () => {
  alertType.value = 'flight';
  // Set threshold to the lowest price in results or a default
  if (filteredAndSortedFlights.value.length > 0) {
    alertThreshold.value = Math.min(...filteredAndSortedFlights.value.map(f => f.price));
  } else {
    alertThreshold.value = 100; // default
  }
  showAlertModal.value = true;
};

const closeAlertModal = () => {
  showAlertModal.value = false;
};

const saveAlert = async () => {
  if (!lastQuery.value) return;
  try {
    await addAlertApi({
      type: alertType.value,
      searchQuery: lastQuery.value as any, // TODO: type properly
      thresholdPrice: alertThreshold.value,
      currency: currencyCode.value,
      active: true,
    });
    closeAlertModal();
    // Optionally show a success toast
  } catch (e) {
    console.error('Failed to save alert:', e);
  }
};
</script>

<style scoped>
/* The pane's own lift. `.glass*` sets both `transition` and `box-shadow`, so a
   `transition-all` or `hover:shadow-md` utility would replace one of them rather
   than compose with this stack, leaving the pane half-animated. Restating the
   transition here keeps the hover motion and the material cross-fade together.
   `--glass-shadow` is the primitive's own variable, so
   deepening it on hover scales the whole shadow stack instead of replacing it
   with a flat one. */
.search-pane {
  transition:
    transform 0.35s cubic-bezier(0.22, 1, 0.36, 1),
    background-color 0.3s ease,
    border-color 0.3s ease,
    box-shadow 0.35s ease;
}

.search-pane:hover {
  transform: translateY(-2px);
  --glass-shadow:
    0 1px 2px 0 var(--color-glass-shadow-tight),
    0 14px 40px -10px var(--color-glass-shadow-soft),
    inset 0 1px 0 0 var(--color-glass-specular),
    0 0 0 1px var(--color-glass-halo),
    inset 0 -1px 0 0 var(--color-glass-shadow-tight);
}

/* Error state. Glass geometry, alarm colours: the fill sits at red-100/900 so it
   is unmistakably not an empty result, the border is a red hairline, and the
   shadow is tinted with the same hue so the panel glows rather than floats. */
.error-panel {
  background-color: light-dark(rgba(254, 226, 226, 0.78), rgba(76, 5, 25, 0.62));
  -webkit-backdrop-filter: blur(18px) saturate(160%);
  backdrop-filter: blur(18px) saturate(160%);
  border: 1px solid light-dark(rgba(239, 68, 68, 0.38), rgba(248, 113, 113, 0.3));
  box-shadow:
    0 1px 2px 0 var(--color-glass-shadow-tight),
    0 8px 28px -10px light-dark(rgba(190, 18, 60, 0.3), rgba(2, 4, 12, 0.6)),
    inset 0 1px 0 0 light-dark(rgba(255, 255, 255, 0.65), rgba(255, 255, 255, 0.12));
}

@media (prefers-reduced-motion: reduce) {
  .search-pane {
    transition-duration: 0.01ms;
  }

  .search-pane:hover {
    transform: none;
  }
}
</style>
