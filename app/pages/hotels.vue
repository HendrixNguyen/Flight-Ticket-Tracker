<template>
  <div class="flex flex-col gap-4 w-full">
    
    <!-- Search Card Form Section -->
    <div class="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl p-6 rounded-3xl shadow-sm border border-white/40 dark:border-white/10 mb-8 transform hover:shadow-md transition-all relative z-20">
      <HotelSearchForm @search="handleHotelSearch" />
    </div>

    <!-- Active Search Grid -->
    <div class="flex flex-col lg:flex-row gap-8 relative z-10">
      
      <!-- Sidebar Filters -->
      <aside class="w-full lg:w-1/4">
        <HotelFilterSidebar 
          :active-filters="hotelFilters"
          @update:filters="updateHotelFilters"
          @update:sort="updateHotelSort"
        />
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
import { ref, computed } from 'vue';
import type { Hotel, HotelSearchQuery, HotelFilterOptions } from '~/types';

// Hotel state
const hasSearchedHotels = ref(false);
const rawHotels = ref<Hotel[]>([]);
const hotelFilters = ref<HotelFilterOptions>({
  maxPrice: 800,
  minRating: 0,
});
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
      return (b.rating || 0) < (a.rating || 0) ? 1 : -1;
    }
    return 0;
  });

  return result;
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
