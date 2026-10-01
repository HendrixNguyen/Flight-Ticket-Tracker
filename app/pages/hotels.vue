<template>
  <div class="flex flex-col gap-4 w-full">
    
    <!-- Search Card Form Section -->
    <div class="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl p-6 rounded-3xl shadow-sm border border-white/40 dark:border-white/10 mb-8 transform hover:shadow-md transition-all relative z-20">
      <HotelSearchForm
          :initial="formInitial"
          @search="handleHotelSearch"
          @change="syncUrl"
        />
    </div>

    <!-- Active Search Grid -->
    <div class="flex flex-col lg:flex-row gap-8 relative z-10">
      
      <!-- Sidebar Filters -->
      <aside class="w-full lg:w-1/4">
          <ActiveFilterChips :chips="activeChips" @remove="removeFilter" />
          <FilterSheet
            title="Filter stays"
            :count="activeChips.length"
            :result-count="filteredAndSortedHotels.length"
          >
            <HotelFilterSidebar
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
          <p class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest animate-pulse">Crawling real-time hotel rates...</p>
        </div>
        
        <div v-else-if="hasFailed" class="bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 p-4 rounded-2xl border border-red-200/50 dark:border-red-900/30 flex flex-col gap-2">
          <h4 class="font-bold text-sm">Search Interrupted</h4>
          <p class="text-xs">{{ errorMessage || 'An unexpected API connection error occurred. Please try again.' }}</p>
        </div>
        
        <div v-else>
          <HotelList
            :hotels="filteredAndSortedHotels"
            :searched="hasSearchedHotels"
            :total="rawHotels.length"
            @book="handleHotelBookingConfirmation"
          />
        </div>
      </section>
    </div>

    <!-- Booking Confirmation Dialog Modal -->
    <Transition name="modal">
      <div v-if="showBookingModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
        <div class="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl relative select-none">
          <div class="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xl mb-4 border border-emerald-100/50 dark:border-emerald-900/30">
            ✓
          </div>
          <h3 class="text-xl font-black text-slate-900 dark:text-slate-100 mb-2">Booking Initiated!</h3>
          <p class="text-sm text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
            Your booking query for <strong class="text-slate-800 dark:text-slate-200">{{ selectedHotel?.name }}</strong> at <strong>${{ selectedHotel?.pricePerNight }}/night</strong> has been dispatched.
          </p>
          <div class="bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/40 p-3 rounded-2xl mb-6 text-xs text-slate-500">
            Location: {{ selectedHotel?.location }}<br/>
            Rate Details: {{ selectedHotel?.amenities?.slice(0, 3).join(', ') }}
          </div>
          <div class="flex gap-3">
            <button 
              @click="showBookingModal = false" 
              class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer text-center"
            >
              Back to Search
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from '#imports';
import type { Hotel, HotelSearchQuery, HotelFilterOptions } from '~/types';
import { HOTEL_DEFAULT_FILTERS, HOTEL_PRICE_RANGE } from '~/utils/filterDefaults';

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

const showBookingModal = ref(false);
const selectedHotel = ref<Hotel | null>(null);

// Hotel Search triggers
const handleHotelSearch = async (query: HotelSearchQuery) => {
  isSearching.value = true;
  hasFailed.value = false;
  syncUrl(query);
  
  try {
    const response = await $fetch<{ success: boolean; data: Hotel[]; error?: string }>('/api/hotels', {
      params: {
        destination: query.destination,
        checkIn: query.checkIn,
        checkOut: query.checkOut,
        adults: query.adults,
        rooms: query.rooms,
      }
    });
    
    if (response && response.success) {
      rawHotels.value = response.data;
      hasSearchedHotels.value = true;
    } else {
      hasFailed.value = true;
      errorMessage.value = response?.error || 'Failed to crawl hotel rates.';
    }
  } catch (err: any) {
    console.error('Failed to fetch hotels:', err);
    hasFailed.value = true;
    errorMessage.value = err.message || 'An unexpected connection error occurred.';
  } finally {
    isSearching.value = false;
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
    chips.push({ key: 'maxPrice', label: `Under $${f.maxPrice}/night` });
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
  if (hotelFilters.value.maxPrice) {
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

// Run the search on mount when the URL carries a complete query.
onMounted(() => {
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
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
