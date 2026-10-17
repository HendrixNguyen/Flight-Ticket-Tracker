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
      <HotelSearchForm
          :initial="formInitial"
          @search="handleHotelSearch"
          @change="syncUrl"
        />
    </div>

<!-- View Tabs -->
<div class="flex justify-end mb-6">
  <button
    @click="viewType = 'list'"
    :class="[
      'px-4 py-2 text-sm font-medium',
      viewType === 'list' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300',
    ]"
  >
    List View
  </button>
  <button
    @click="viewType = 'map'"
    :class="[
      'px-4 py-2 text-sm font-medium ml-2',
      viewType === 'map' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300',
    ]"
  >
    Map View
  </button>
</div>

     <!-- Active Search Grid -->
     <div v-if="viewType === 'list'" class="flex flex-col lg:flex-row gap-8 relative z-10">
       <!-- Set Price Alert Button -->
       <div class="w-full mb-4 lg:mb-0">
         <button
           @click="openAlertModal"
           class="w-full px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
           :disabled="alertLoading || !hasSearchedHotels || isMock"
         >
           Set Price Alert
         </button>
       </div>

       <!-- Sidebar Filters -->
       <aside class="w-full lg:w-1/4">
         <ActiveFilterChips :chips="activeChips" @remove="removeFilter" />
         <FilterSheet
           title="Filter stays"
           :count="activeChips.length"
           :result-count="filteredAndSortedHotels.length"
         >
           <HotelFilterSidebar
             :currency="isMock ? 'USD' : currencyCode"
             :active-filters="hotelFilters"
             @update:filters="updateHotelFilters"
             @update:sort="updateHotelSort"
           />
         </FilterSheet>
       </aside>

       <!-- Listings Content Section -->
       <section class="w-full lg:w-3/4">
         <div v-if="isSearching" class="flex flex-col justify-center items-center py-20 gap-4">
           <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
           <p class="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest animate-pulse">Crawling real-time hotel rates...</p>
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
          <p v-if="isMock" class="mb-4 text-sm text-amber-700">Showing sample hotels and USD prices. Live hotel quotes are unavailable.</p>
          <PriceCalendar v-if="hasCalendarData" :calendar-data="calendarData" :loading="calendarLoading" :error="calendarError" />
          <!-- Price History Chart -->
          <div v-if="hasSearchedHotels && !hasCalendarData" class="mb-6">
            <PriceHistoryChart
              :historyData="hotelHistoryData"
              :loading="historyLoading"
              :error="historyError"

            />
          </div>

          <HotelList
            :hotels="filteredAndSortedHotels"
            :searched="hasSearchedHotels"
            :total="rawHotels.length"
            :cached="wasCached"
            show-refresh
            :refreshing="isSearching"
            @refresh="refreshHotels"
            @book="handleHotelBookingConfirmation"
          />
        </div>
       </section>
     </div>
       <div v-else>
         <!-- Price Calendar (for flexible date searches) -->
         <div v-if="hasCalendarData" class="mb-6">
           <PriceCalendar
             :calendarData="calendarData"
             :loading="calendarLoading"
             :error="calendarError"
           />
         </div>

         <!-- Price History Chart -->
         <div v-if="hasSearchedHotels && !hasCalendarData" class="mb-6">
           <PriceHistoryChart
             :historyData="hotelHistoryData"
             :loading="historyLoading"
             :error="historyError"

           />
         </div>

         <HotelMapView :hotels="filteredAndSortedHotels" />
       </div>

    <!-- Booking Confirmation Dialog Modal.

         The Teleport is load-bearing, not incidental. The shell's
         `<main class="relative z-10">` creates a stacking context, so a
         `fixed inset-0` overlay rendered in place is trapped inside it and paints
         *below* the shell's `z-40` sticky header -- which now reads as the header
         floating on top of the open dialog. Teleporting to <body> puts the
         overlay in the root stacking context, where its z-index is compared
         against the header's directly and wins. z-[70] rather than the old z-50
         so the ordering against the filter sheet's z-[60] stays deterministic. -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showBookingModal" class="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/45 dark:bg-slate-950/70 backdrop-blur-md">
          <!-- `.glass-elevated`: the densest level, because this floats directly
               on the canvas and holds a price, a hotel name and rate details. -->
          <div class="glass-elevated glass-grain rounded-3xl p-6 max-w-md w-full relative select-none">
            <div class="ok-badge w-12 h-12 rounded-full text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-xl mb-4">
              ✓
            </div>
            <h3 class="text-xl font-black text-slate-900 dark:text-slate-100 mb-2">Hotel Details</h3>
            <p class="text-sm text-slate-700 dark:text-slate-300 mb-4 leading-relaxed">
              Selected hotel: <strong class="text-slate-900 dark:text-slate-100">{{ selectedHotel?.name }}</strong> at <strong>{{ formatAmount(selectedHotel?.pricePerNight ?? 0, selectedHotel?.currency) }}/night</strong> No reservation has been made.
            </p>
            <div class="glass glass-grain p-3 rounded-2xl mb-6 text-xs text-slate-700 dark:text-slate-300">
              Location: {{ selectedHotel?.location }}<br/>
              Rate Details: {{ selectedHotel?.amenities?.slice(0, 3).join(', ') }}
            </div>
            <div class="flex gap-3">
              <button
                @click="showBookingModal = false"
                class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-2xl text-xs transition-colors cursor-pointer text-center shadow-lg shadow-blue-600/20 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:focus-visible:outline-blue-300"
              >
                Back to Search
              </button>
            </div>
          </div>
        </div>
      </Transition>
     </Teleport>

<!-- Alert Modal -->
<Teleport to="body">
<div v-if="showAlertModal" class="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/45 dark:bg-slate-950/70 backdrop-blur-md">
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
              value="flight" disabled
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
          Threshold Price ({{ currencyCode }})
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
          {{ `Destination: ${lastQuery?.destinationName || lastQuery?.destination || ''}` }}
        </div>
      </div>
      <div class="flex justify-end space-x-3">
        <button
          type="button"
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
</Teleport>
</div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from '#imports';
import { CircleAlert } from 'lucide-vue-next';
import type { Hotel, HotelSearchQuery, HotelFilterOptions, Alert } from '~~/types';
import { HOTEL_DEFAULT_FILTERS, HOTEL_PRICE_RANGE } from '~/utils/filterDefaults';
import { useCurrency } from '~/composables/useCurrency';
import { useAlerts } from '~/composables/useAlerts';
import { useAlertChecking } from '~/composables/useAlertChecking';
import { usePriceCalendar } from '~/composables/usePriceCalendar';
import { usePriceHistory } from '~/composables/usePriceHistory';
import HotelMapView from '~/components/HotelMapView.vue';
import PriceHistoryChart from '~/components/PriceHistoryChart.vue';

const { formatAmount, currencyCode, restore } = useCurrency();
const { alerts: alertList, addAlert: addAlertApi, loading: alertLoading } = useAlerts();
const { checkAlertPrices, checking: alertChecking } = useAlertChecking();
const { historyData: hotelHistoryData, loading: historyLoading, error: historyError, fetchPriceHistory: fetchHotelHistory, formatDate, getPriceChangePercent } = usePriceHistory();

// Calendar data for flexible date search
const { calendarData, loading: calendarLoading, error: calendarError, fetchPriceCalendar } = usePriceCalendar();
const hasCalendarData = computed(() => Boolean(lastQuery.value?.flexibleDates));
let searchSequence = 0;

const route = useRoute();
const router = useRouter();

// Hydrate the form from the query string so searches are shareable and survive
// a refresh or back-navigation.
const formInitial = computed<Partial<HotelSearchQuery>>(() => ({
  destination: (route.query.destination as string) || '',
  destinationName: (route.query.destinationName as string) || '',
  checkIn: (route.query.checkIn as string) || undefined,
  checkOut: (route.query.checkOut as string) || undefined,
  adults: route.query.adults ? Number(route.query.adults) : undefined,
  rooms: route.query.rooms ? Number(route.query.rooms) : undefined,
}));

const syncUrl = (query: HotelSearchQuery) => {
  router.replace({
    query: {
      ...(query.destination ? { destination: query.destination } : {}),
      ...(query.destinationName ? { destinationName: query.destinationName } : {}),
      ...(query.checkIn ? { checkIn: query.checkIn } : {}),
      ...(query.checkOut ? { checkOut: query.checkOut } : {}),
      ...(query.adults ? { adults: String(query.adults) } : {}),
      ...(query.rooms ? { rooms: String(query.rooms) } : {}),
    },
  });
};

// Hotel state
const hasSearchedHotels = ref(false);
const rawHotels = ref<Hotel[]>([]);
const hotelFilters = ref<HotelFilterOptions>({ ...HOTEL_DEFAULT_FILTERS });
const hotelSortBy = ref<string>('price_asc');

// Shared loaders and error trackers
const isSearching = ref(false);
const hasFailed = ref(false);
const errorMessage = ref('');
const wasCached = ref(false);
const isMock = ref(false);
const lastQuery = ref<HotelSearchQuery | null>(null);

const showBookingModal = ref(false);
const selectedHotel = ref<Hotel | null>(null);
const viewType = ref<'list' | 'map'>('list');

// Hotel Search triggers
const handleHotelSearch = async (query: HotelSearchQuery, refresh = false) => {
  const sequence = ++searchSequence;
  isSearching.value = true;
  hasSearchedHotels.value = false;
  hasFailed.value = false;
  syncUrl(query);
  lastQuery.value = query;

    try {
      const httpResponse = await $fetch.raw<{ success: boolean; data: Hotel[]; error?: string; mock?: boolean }>('/api/hotels', {
        params: {
          destination: query.destination,
          checkIn: query.checkIn,
          checkOut: query.checkOut,
          adults: query.adults,
          rooms: query.rooms,
          // Ask the server to bypass its cache so the user sees live rates.
          refresh: refresh ? 1 : undefined,
          currency: currencyCode.value,
          // Add flexible dates flag if present
          flexibleDates: query.flexibleDates ? 1 : undefined
        }
      });

      // Surfaced so the user can tell cached results from a live lookup.
      if (sequence !== searchSequence) return;
      const response = httpResponse._data;
      isMock.value = Boolean(response?.mock);
      wasCached.value = httpResponse.headers.get('x-cache') === 'HIT';

      if (response && response.success) {
        rawHotels.value = response.data;
        hasSearchedHotels.value = true;
        const analysisParams = { destination: query.destination, checkIn: query.checkIn, checkOut: query.checkOut, adults: String(query.adults), rooms: String(query.rooms), type: 'hotel' };
        if (query.flexibleDates) {
          fetchPriceCalendar(analysisParams);
        } else {
          fetchHotelHistory(analysisParams);
        }
      } else {
      hasFailed.value = true;
      errorMessage.value = response?.error || 'Failed to crawl hotel rates.';
    }
  } catch (err: any) {
    if (sequence !== searchSequence) return;
    console.error('Failed to fetch hotels:', err);
    hasFailed.value = true;
    errorMessage.value = err.message || 'An unexpected connection error occurred.';
  } finally {
    if (sequence === searchSequence) isSearching.value = false;
  }
};

const updateHotelFilters = (newFilters: HotelFilterOptions) => {
  hotelFilters.value = { ...hotelFilters.value, ...newFilters };
};

const updateHotelSort = (newSort: string) => {
  hotelSortBy.value = newSort;
};

// Chips list only filters that differ from the defaults.
const activeChips = computed(() => {
  const chips: { key: string; label: string }[] = [];
  const f = hotelFilters.value;

  if (f.maxPrice !== undefined && f.maxPrice < HOTEL_PRICE_RANGE.max) {
    chips.push({ key: 'maxPrice', label: `Under ${f.maxPrice}/night (${isMock.value ? 'USD' : currencyCode.value})` });
  }
  if (f.minRating !== undefined && f.minRating > 0) {
    chips.push({ key: 'minRating', label: `${f.minRating.toFixed(1)}+ rating` });
  }

  return chips;
});

const removeFilter = (key: string) => {
  const f = { ...hotelFilters.value };
  if (key === 'maxPrice') f.maxPrice = HOTEL_PRICE_RANGE.max;
  if (key === 'minRating') f.minRating = 0;
  hotelFilters.value = f;
};

// Computed state for filtered and sorted hotels
const filteredAndSortedHotels = computed(() => {
  let result = [...rawHotels.value];

  // Apply filters
  if (hotelFilters.value.maxPrice !== undefined && hotelFilters.value.maxPrice < HOTEL_PRICE_RANGE.max) {
    result = result.filter(h => h.pricePerNight <= hotelFilters.value.maxPrice!);
  }
  if (hotelFilters.value.minRating) {
    result = result.filter(h => (h.rating || 0) >= hotelFilters.value.minRating!);
  }

  // Apply sorting
  result.sort((a, b) => {
    if (hotelSortBy.value === 'price_asc') {
      return a.pricePerNight - b.pricePerNight;
    } else if (hotelSortBy.value === 'price_desc') {
      return b.pricePerNight - a.pricePerNight;
    } else if (hotelSortBy.value === 'rating_desc') {
      return (b.rating ?? 0) - (a.rating ?? 0);
    }
    return 0;
  });

  return result;
});

// Force a live upstream lookup instead of serving cached rates.
const refreshHotels = () => {
  if (lastQuery.value) {
    handleHotelSearch(lastQuery.value, true);
  }
};

const handleCurrencyChange = () => {
  hotelFilters.value.maxPrice = HOTEL_PRICE_RANGE.max;
  if (lastQuery.value) {
    handleHotelSearch(lastQuery.value, true);
  }
};

onUnmounted(() => {
  window.removeEventListener('currency-changed', handleCurrencyChange);
});

// Run the search on mount when the URL carries a complete query.
onMounted(() => {
  window.addEventListener('currency-changed', handleCurrencyChange);

  // Apply the stored currency before searching, so the initial request asks for
  // the right prices. Doing this here rather than relying on the header mounting
  // first keeps the search correct regardless of component order.
  restore();

  const { destination, checkIn, checkOut } = route.query;
  if (destination && checkIn && checkOut) {
    handleHotelSearch({
      destination: destination as string,
      destinationName: (route.query.destinationName as string) || (destination as string),
      checkIn: checkIn as string,
      checkOut: checkOut as string,
      adults: route.query.adults ? Number(route.query.adults) : 2,
      rooms: route.query.rooms ? Number(route.query.rooms) : 1,
    });
  }
});

// Hotel booking action confirmation
const handleHotelBookingConfirmation = (hotel: Hotel) => {
  selectedHotel.value = hotel;
  showBookingModal.value = true;
};
const showAlertModal = ref(false);
const alertThreshold = ref(0);
const alertType = ref<'flight' | 'hotel'>('hotel');

const openAlertModal = () => {
  alertType.value = 'hotel';
  // Set threshold to the lowest price in results or a default
  if (filteredAndSortedHotels.value.length > 0) {
    alertThreshold.value = Math.min(...filteredAndSortedHotels.value.map(h => h.pricePerNight));
  } else {
    alertThreshold.value = 50; // default for hotels
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

/* Success bead for the booking dialog: `.glass` geometry with an emerald tint,
   for the same cascade reason as the chip tint in ActiveFilterChips. */
.ok-badge {
  background-color: light-dark(
    color-mix(in oklab, var(--color-glass-bg-subtle) 45%, var(--color-emerald-100)),
    color-mix(in oklab, var(--color-glass-bg-subtle) 60%, var(--color-emerald-900))
  );
  border: 1px solid light-dark(
    color-mix(in oklab, var(--color-glass-border) 55%, var(--color-emerald-300)),
    color-mix(in oklab, var(--color-glass-border) 80%, var(--color-emerald-700))
  );
  box-shadow:
    0 1px 2px 0 var(--color-glass-shadow-tight),
    0 8px 24px -10px light-dark(rgba(4, 120, 87, 0.35), rgba(2, 4, 12, 0.6)),
    inset 0 1px 0 0 var(--color-glass-specular);
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .search-pane,
  .modal-enter-active,
  .modal-leave-active {
    transition-duration: 0.01ms;
  }

  .search-pane:hover {
    transform: none;
  }
}
</style>
