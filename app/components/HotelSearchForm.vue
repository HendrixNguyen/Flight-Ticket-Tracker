<template>
  <div class="flex flex-col gap-4 w-full relative">
    
    <!-- Main Search Form -->
    <form @submit.prevent="submitSearch" class="flex flex-col lg:flex-row gap-4 w-full items-end relative z-30">
      
      <!-- Destination Input with Real-time Image Suggestion -->
      <div ref="destinationContainer" class="flex-[1.2] w-full relative">
        <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1" for="destination">Destination</label>
        <div class="relative">
          <MapPin class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 animate-pulse" />
          <input 
            id="destination"
            v-model="destinationSearchText" 
            type="text" 
            required
            autocomplete="off"
            placeholder="Search hotels, resorts, or cities (e.g. San Francisco)" 
            class="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900/60 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow outline-none dark:text-slate-100 font-medium"
            @input="handleDestinationInput"
            @focus="handleDestinationFocus"
          >
          <button 
            type="button" 
            @click="requestLocation"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-700 transition-colors cursor-pointer"
            title="Use my location"
          >
            <Loader2 v-if="isLocating" class="w-5 h-5 animate-spin" />
            <Crosshair v-else class="w-5 h-5" />
          </button>
        </div>

        <!-- Real-time Image/Thumbnail Suggestion Dropdown -->
        <transition name="fade">
          <div 
            v-if="showSuggestionsDropdown" 
            class="absolute z-50 left-0 right-0 mt-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl border border-gray-100 dark:border-slate-800/85 shadow-xl shadow-gray-200/50 dark:shadow-black/50 max-h-72 overflow-y-auto py-2 outline-none transition-all"
          >
            <div v-if="isSuggestionsLoading" class="px-4 py-3 flex items-center gap-3 text-sm text-gray-500">
              <Loader2 class="w-4 h-4 animate-spin text-blue-500" />
              <span>Finding matching stays...</span>
            </div>
            
            <div v-else-if="suggestions.length === 0" class="px-4 py-3 text-sm text-gray-500">
              No matching properties or cities. Type to discover.
            </div>
            
            <ul v-else class="divide-y divide-gray-50 dark:divide-slate-800/50">
              <li 
                v-for="suggestion in suggestions" 
                :key="suggestion.id"
                @click="selectSuggestion(suggestion)"
                class="px-4 py-3 hover:bg-blue-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors duration-150 flex items-center gap-3"
              >
                <!-- Display hotel suggestion thumbnail if available -->
                <div v-if="suggestion.thumbnail" class="w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
                  <img :src="suggestion.thumbnail" class="w-full h-full object-cover" alt="Hotel preview" />
                </div>
                <!-- Default icons for fallback -->
                <div v-else class="w-12 h-12 bg-slate-100 dark:bg-slate-800/60 rounded-lg flex items-center justify-center shrink-0 border border-slate-200/50 dark:border-slate-700/50">
                  <Building v-if="suggestion.type === 'hotel'" class="w-5 h-5 text-blue-500 dark:text-blue-400" />
                  <MapPin v-else class="w-5 h-5 text-gray-500 dark:text-slate-400" />
                </div>

                <div class="flex-grow min-w-0">
                  <div class="font-bold text-sm text-gray-900 dark:text-slate-100 truncate flex items-center gap-1.5">
                    {{ suggestion.name }}
                    <span v-if="suggestion.type === 'hotel'" class="text-[9px] bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100/50 dark:border-emerald-900/30 px-1.5 py-0.5 rounded uppercase font-black tracking-wide shrink-0">Hotel</span>
                  </div>
                  <div class="text-xs text-gray-500 dark:text-slate-400 truncate mt-0.5 font-medium">{{ suggestion.description }}</div>
                </div>
              </li>
            </ul>
          </div>
        </transition>
      </div>

      <!-- Stay Dates (Check-in & Check-out Calendar Range Picker) -->
      <div class="flex-[1.5] w-full relative">
        <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Stay Dates</label>
        <CustomDateRangePicker 
          v-model:startDate="form.checkIn"
          v-model:endDate="form.checkOut"
          :minDate="todayStr"
        />
      </div>

      <!-- Guests and Rooms Selector Panel -->
      <div ref="guestSelectorContainer" class="flex-1 w-full relative">
        <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Guests & Rooms</label>
        <div 
          @click="toggleGuestDropdown"
          class="w-full pl-4 pr-10 py-3 border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900/60 cursor-pointer focus:ring-2 focus:ring-blue-500 outline-none flex items-center justify-between select-none"
        >
          <div class="flex items-center gap-2">
            <Users class="w-5 h-5 text-gray-400" />
            <span class="text-sm font-bold text-slate-800 dark:text-slate-200">
              {{ form.adults }} Adult{{ form.adults > 1 ? 's' : '' }}, {{ form.rooms }} Room{{ form.rooms > 1 ? 's' : '' }}
            </span>
          </div>
          <ChevronDown class="w-4 h-4 text-gray-400 transition-transform duration-200" :class="{ 'rotate-180': showGuestDropdown }" />
        </div>

        <!-- Guests Dropdown Panel -->
        <transition name="fade">
          <div 
            v-if="showGuestDropdown" 
            class="absolute z-50 right-0 left-0 mt-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl border border-gray-100 dark:border-slate-800/80 shadow-xl p-4 flex flex-col gap-4 select-none outline-none"
          >
            <!-- Adults Toggler -->
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-bold text-gray-900 dark:text-slate-100">Adults</p>
                <p class="text-xs text-gray-500 dark:text-slate-400">Age 13 or above</p>
              </div>
              <div class="flex items-center gap-3">
                <button 
                  type="button" 
                  @click="decrementAdults"
                  :disabled="form.adults <= 1"
                  class="w-8 h-8 rounded-full border border-gray-200 dark:border-slate-700 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                >
                  -
                </button>
                <span class="text-sm font-black w-4 text-center">{{ form.adults }}</span>
                <button 
                  type="button" 
                  @click="incrementAdults"
                  :disabled="form.adults >= 10"
                  class="w-8 h-8 rounded-full border border-gray-200 dark:border-slate-700 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            <!-- Rooms Toggler -->
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-bold text-gray-900 dark:text-slate-100">Rooms</p>
                <p class="text-xs text-gray-500 dark:text-slate-400">Number of rooms required</p>
              </div>
              <div class="flex items-center gap-3">
                <button 
                  type="button" 
                  @click="decrementRooms"
                  :disabled="form.rooms <= 1"
                  class="w-8 h-8 rounded-full border border-gray-200 dark:border-slate-700 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                >
                  -
                </button>
                <span class="text-sm font-black w-4 text-center">{{ form.rooms }}</span>
                <button 
                  type="button" 
                  @click="incrementRooms"
                  :disabled="form.rooms >= 5"
                  class="w-8 h-8 rounded-full border border-gray-200 dark:border-slate-700 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            <!-- Done Button -->
            <button 
              type="button"
              @click="showGuestDropdown = false"
              class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-xl text-xs transition-colors cursor-pointer"
            >
              Apply Guests
            </button>
          </div>
        </transition>
      </div>

      <!-- Search Button -->
      <button 
        type="submit" 
        class="w-full lg:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-xl transition-colors shadow-md hover:shadow-lg flex items-center justify-center gap-2 mb-[1px] cursor-pointer"
      >
        <Search class="w-5 h-5" />
        <span>Search Stays</span>
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { MapPin, Search, Crosshair, Loader2, Building, Users, ChevronDown } from 'lucide-vue-next';
import type { HotelSearchQuery, HotelAutocompleteSuggestion } from '~/types';

const emit = defineEmits<{
  (e: 'search', query: HotelSearchQuery): void;
}>();

// Element refs
const destinationContainer = ref<HTMLElement | null>(null);
const guestSelectorContainer = ref<HTMLElement | null>(null);

// Form default setup (defaults to tomorrow for 3 nights)
const defaultCheckInDate = (): string => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
};

const defaultCheckOutDate = (): string => {
  const future = new Date();
  future.setDate(future.getDate() + 4);
  return future.toISOString().split('T')[0];
};

const form = ref<HotelSearchQuery>({
  destination: '',
  destinationName: '',
  checkIn: defaultCheckInDate(),
  checkOut: defaultCheckOutDate(),
  adults: 2,
  rooms: 1,
});

const todayStr = computed(() => {
  return new Date().toISOString().split('T')[0];
});

// Autocomplete and selection states
const destinationSearchText = ref('');
const suggestions = ref<HotelAutocompleteSuggestion[]>([]);
const isSuggestionsLoading = ref(false);
const showSuggestionsDropdown = ref(false);
const isLocating = ref(false);
const showGuestDropdown = ref(false);

const POPULAR_DESTINATIONS: HotelAutocompleteSuggestion[] = [
  { id: 'fairmont_sf', name: 'The Fairmont San Francisco', type: 'hotel', description: 'Nob Hill, San Francisco, CA', thumbnail: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&auto=format&fit=crop&q=60' },
  { id: 'standard_ny', name: 'The Standard, High Line', type: 'hotel', description: 'Meatpacking District, New York, NY', thumbnail: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=500&auto=format&fit=crop&q=60' },
  { id: 'shangrila_lon', name: 'Shangri-La The Shard, London', type: 'hotel', description: 'Southwark, London, UK', thumbnail: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=500&auto=format&fit=crop&q=60' },
  { id: 'sf_city', name: 'San Francisco, California', type: 'city', description: 'California, United States' },
  { id: 'nyc_city', name: 'New York City, New York', type: 'city', description: 'New York, United States' },
  { id: 'london_city', name: 'London, United Kingdom', type: 'city', description: 'Capital of the United Kingdom' },
];

// Guest Panel actions
const toggleGuestDropdown = () => {
  showGuestDropdown.value = !showGuestDropdown.value;
  showSuggestionsDropdown.value = false;
};

const incrementAdults = () => {
  if (form.value.adults < 10) form.value.adults++;
};

const decrementAdults = () => {
  if (form.value.adults > 1) form.value.adults--;
};

const incrementRooms = () => {
  if (form.value.rooms < 5) form.value.rooms++;
};

const decrementRooms = () => {
  if (form.value.rooms > 1) form.value.rooms--;
};

// Destination Autocomplete triggers
const handleDestinationFocus = () => {
  showSuggestionsDropdown.value = true;
  showGuestDropdown.value = false;
  if (!destinationSearchText.value.trim() && suggestions.value.length === 0) {
    suggestions.value = POPULAR_DESTINATIONS;
  }
};

let suggestionsDebounceTimeout: any = null;
const handleDestinationInput = () => {
  showSuggestionsDropdown.value = true;
  form.value.destination = destinationSearchText.value;

  if (suggestionsDebounceTimeout) clearTimeout(suggestionsDebounceTimeout);

  if (!destinationSearchText.value.trim()) {
    suggestions.value = POPULAR_DESTINATIONS;
    return;
  }

  isSuggestionsLoading.value = true;
  suggestionsDebounceTimeout = setTimeout(async () => {
    try {
      const response = await $fetch<{ success: boolean; data: HotelAutocompleteSuggestion[] }>('/api/hotels-autocomplete', {
        params: { q: destinationSearchText.value }
      });
      if (response && response.success) {
        suggestions.value = response.data;
      }
    } catch (err) {
      console.error('Failed to autocomplete destination:', err);
    } finally {
      isSuggestionsLoading.value = false;
    }
  }, 300);
};

const selectSuggestion = (suggestion: HotelAutocompleteSuggestion) => {
  form.value.destination = suggestion.propertyToken || suggestion.name;
  form.value.destinationName = suggestion.name;
  destinationSearchText.value = suggestion.name;
  showSuggestionsDropdown.value = false;
};

// Device geolocation trigger
const requestLocation = () => {
  if (!('geolocation' in navigator)) {
    alert('Geolocation is not supported by your browser.');
    return;
  }
  
  isLocating.value = true;
  navigator.geolocation.getCurrentPosition(
    async (position) => {
      try {
        const { latitude, longitude } = position.coords;
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
        const data = await response.json();
        
        let locationName = '';
        if (data && data.address) {
          locationName = data.address.city || data.address.town || data.address.village || data.address.state || '';
        }
        
        if (locationName) {
          destinationSearchText.value = locationName;
          
          isSuggestionsLoading.value = true;
          const searchRes = await $fetch<{ success: boolean; data: HotelAutocompleteSuggestion[] }>('/api/hotels-autocomplete', {
            params: { q: locationName }
          });
          
          if (searchRes && searchRes.success && searchRes.data.length > 0) {
            const first = searchRes.data[0];
            selectSuggestion(first);
          } else {
            form.value.destination = locationName;
            form.value.destinationName = locationName;
          }
        } else {
          const fallbackVal = `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`;
          destinationSearchText.value = fallbackVal;
          form.value.destination = fallbackVal;
          form.value.destinationName = fallbackVal;
        }
      } catch (err) {
        console.error('Failed to reverse geocode device location:', err);
        destinationSearchText.value = 'My Current Location';
        form.value.destination = 'My Current Location';
        form.value.destinationName = 'My Current Location';
      } finally {
        isLocating.value = false;
      }
    },
    (error) => {
      console.error('Geolocation error:', error);
      alert('Unable to retrieve your location. Please check your permissions.');
      isLocating.value = false;
    }
  );
};

// Outside click handlers
const handleClickOutside = (event: MouseEvent) => {
  if (destinationContainer.value && !destinationContainer.value.contains(event.target as Node)) {
    showSuggestionsDropdown.value = false;
  }
  if (guestSelectorContainer.value && !guestSelectorContainer.value.contains(event.target as Node)) {
    showGuestDropdown.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
  if (suggestionsDebounceTimeout) clearTimeout(suggestionsDebounceTimeout);
});

const submitSearch = () => {
  if (!form.value.destination || !form.value.checkIn || !form.value.checkOut) return;
  emit('search', { ...form.value });
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
