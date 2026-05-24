<template>
  <div class="flex flex-col gap-4 w-full">
    <!-- Trip Type Toggle Slider -->
    <div class="flex justify-start">
      <div class="flex bg-gray-100/80 dark:bg-slate-800/80 backdrop-blur-md p-1 rounded-full border border-gray-200/50 dark:border-slate-700/50">
        <button 
          type="button" 
          @click="setTripType(false)"
          class="px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer"
          :class="[!isRoundTrip ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-sm font-bold' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200']"
        >
          One-Way
        </button>
        <button 
          type="button" 
          @click="setTripType(true)"
          class="px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer"
          :class="[isRoundTrip ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-sm font-bold' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200']"
        >
          Round-Trip (2-Way)
        </button>
      </div>
    </div>

    <!-- Main Search Fields -->
    <form @submit.prevent="submitSearch" class="flex flex-col lg:flex-row gap-4 w-full items-end">
      <!-- From Location Input -->
      <div ref="fromContainer" class="flex-1 w-full relative">
        <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1" for="from">From</label>
        <div class="relative">
          <MapPin class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            id="from"
            v-model="fromSearchText" 
            type="text" 
            required
            autocomplete="off"
            placeholder="Departure City/Airport (e.g. SFO)" 
            class="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900/60 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow outline-none dark:text-slate-100 font-medium"
            @input="handleFromInput"
            @focus="handleFromFocus"
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

        <!-- From Autocomplete Dropdown -->
        <transition name="fade">
          <div 
            v-if="showFromDropdown" 
            class="absolute z-50 left-0 right-0 mt-2 bg-white/95 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl border border-gray-100 dark:border-slate-800 shadow-xl shadow-gray-200/50 dark:shadow-black/50 max-h-72 overflow-y-auto py-2 outline-none transition-all"
          >
            <div v-if="isFromLoading" class="px-4 py-3 flex items-center gap-3 text-sm text-gray-500">
              <Loader2 class="w-4 h-4 animate-spin text-blue-500" />
              <span>Searching locations...</span>
            </div>
            
            <div v-else-if="fromSuggestions.length === 0" class="px-4 py-3 text-sm text-gray-500">
              No locations found. Type to search.
            </div>
            
            <ul v-else class="divide-y divide-gray-50 dark:divide-slate-800/50">
              <li 
                v-for="suggestion in fromSuggestions" 
                :key="suggestion.id"
                @click="selectFromSuggestion(suggestion)"
                class="px-4 py-3 hover:bg-blue-50 dark:hover:bg-slate-800 cursor-pointer transition-colors duration-150 flex items-start gap-3"
              >
                <Plane v-if="suggestion.type === 'airport'" class="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <Building v-else class="w-5 h-5 text-gray-500 dark:text-slate-400 shrink-0 mt-0.5" />
                <div class="flex-grow min-w-0">
                  <div class="font-semibold text-sm text-gray-900 dark:text-slate-100 truncate">
                    {{ suggestion.name }}
                    <span v-if="suggestion.iata" class="text-blue-600 dark:text-blue-400 ml-1 font-bold">({{ suggestion.iata }})</span>
                  </div>
                  <div class="text-xs text-gray-500 dark:text-slate-400 truncate mt-0.5">{{ suggestion.description }}</div>
                </div>
              </li>
            </ul>
          </div>
        </transition>
      </div>
      
      <!-- Swap Button -->
      <button 
        type="button" 
        @click="swapLocations" 
        class="hidden lg:flex p-3 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-full mb-1 transition-colors group cursor-pointer border dark:border-slate-700"
      >
        <ArrowRightLeft class="w-5 h-5 text-gray-600 dark:text-slate-300 group-hover:text-blue-600 transition-colors" />
      </button>
      
      <!-- To Location Input -->
      <div ref="toContainer" class="flex-1 w-full relative">
        <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1" for="to">To</label>
        <div class="relative">
          <MapPin class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            id="to"
            v-model="toSearchText" 
            type="text" 
            required
            autocomplete="off"
            placeholder="Destination City/Airport (e.g. JFK)" 
            class="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900/60 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow outline-none dark:text-slate-100 font-medium"
            @input="handleToInput"
            @focus="handleToFocus"
          >
        </div>

        <!-- To Autocomplete Dropdown -->
        <transition name="fade">
          <div 
            v-if="showToDropdown" 
            class="absolute z-50 left-0 right-0 mt-2 bg-white/95 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl border border-gray-100 dark:border-slate-800 shadow-xl shadow-gray-200/50 dark:shadow-black/50 max-h-72 overflow-y-auto py-2 outline-none transition-all"
          >
            <div v-if="isToLoading" class="px-4 py-3 flex items-center gap-3 text-sm text-gray-500">
              <Loader2 class="w-4 h-4 animate-spin text-blue-500" />
              <span>Searching locations...</span>
            </div>
            
            <div v-else-if="toSuggestions.length === 0" class="px-4 py-3 text-sm text-gray-500">
              No locations found. Type to search.
            </div>
            
            <ul v-else class="divide-y divide-gray-50 dark:divide-slate-800/50">
              <li 
                v-for="suggestion in toSuggestions" 
                :key="suggestion.id"
                @click="selectToSuggestion(suggestion)"
                class="px-4 py-3 hover:bg-blue-50 dark:hover:bg-slate-800 cursor-pointer transition-colors duration-150 flex items-start gap-3"
              >
                <Plane v-if="suggestion.type === 'airport'" class="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <Building v-else class="w-5 h-5 text-gray-500 dark:text-slate-400 shrink-0 mt-0.5" />
                <div class="flex-grow min-w-0">
                  <div class="font-semibold text-sm text-gray-900 dark:text-slate-100 truncate">
                    {{ suggestion.name }}
                    <span v-if="suggestion.iata" class="text-blue-600 dark:text-blue-400 ml-1 font-bold">({{ suggestion.iata }})</span>
                  </div>
                  <div class="text-xs text-gray-500 dark:text-slate-400 truncate mt-0.5">{{ suggestion.description }}</div>
                </div>
              </li>
            </ul>
          </div>
        </transition>
      </div>
      
      <!-- Premium Custom Date / Range Pickers -->
      <div class="flex-[1.5] w-full relative">
        <CustomDateRangePicker 
          v-if="isRoundTrip"
          v-model:startDate="form.date"
          v-model:endDate="form.returnDate"
          :minDate="todayStr"
        />
        <div v-else class="w-full relative">
          <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1" for="single-date">Departure Date</label>
          <CustomDatePicker 
            id="single-date"
            v-model="form.date"
            :minDate="todayStr"
          />
        </div>
      </div>
      
      <!-- Search Button -->
      <button 
        type="submit" 
        class="w-full lg:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-xl transition-colors shadow-md hover:shadow-lg flex items-center justify-center gap-2 mb-1 cursor-pointer"
      >
        <Search class="w-5 h-5" />
        <span>Search Flights</span>
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { MapPin, ArrowRightLeft, Search, Crosshair, Loader2, Plane, Building } from 'lucide-vue-next';
import type { SearchQuery, LocationSuggestion } from '~/types';

const emit = defineEmits<{
  (e: 'search', query: SearchQuery): void
}>();

// Containers for detecting click outside
const fromContainer = ref<HTMLElement | null>(null);
const toContainer = ref<HTMLElement | null>(null);

// Form and query state
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
const defaultDate = tomorrow.toISOString().split('T')[0];

const form = ref<SearchQuery>({
  from: '',
  to: '',
  date: defaultDate,
  returnDate: '',
  passengers: 1,
});

// Trip type state
const isRoundTrip = ref(false);
const setTripType = (val: boolean) => {
  isRoundTrip.value = val;
  if (!val) {
    form.value.returnDate = '';
  } else if (!form.value.returnDate) {
    // Default return date to 7 days after departure date
    const depDate = new Date(form.value.date);
    depDate.setDate(depDate.getDate() + 7);
    form.value.returnDate = depDate.toISOString().split('T')[0];
  }
};

const todayStr = computed(() => {
  return new Date().toISOString().split('T')[0];
});

// UI input states
const fromSearchText = ref('');
const toSearchText = ref('');

// Autocomplete and loader states
const fromSuggestions = ref<LocationSuggestion[]>([]);
const toSuggestions = ref<LocationSuggestion[]>([]);
const isFromLoading = ref(false);
const isToLoading = ref(false);
const showFromDropdown = ref(false);
const showToDropdown = ref(false);
const isLocating = ref(false);

// Popular location list for initial display
const POPULAR_LOCATIONS: LocationSuggestion[] = [
  { id: 'SFO', name: 'San Francisco International Airport', type: 'airport', description: 'SFO - San Francisco, CA', iata: 'SFO' },
  { id: 'JFK', name: 'John F. Kennedy International Airport', type: 'airport', description: 'JFK - New York, NY', iata: 'JFK' },
  { id: 'LAX', name: 'Los Angeles International Airport', type: 'airport', description: 'LAX - Los Angeles, CA', iata: 'LAX' },
  { id: 'LHR', name: 'London Heathrow Airport', type: 'airport', description: 'LHR - London, United Kingdom', iata: 'LHR' },
  { id: 'CDG', name: 'Paris Charles de Gaulle Airport', type: 'airport', description: 'CDG - Paris, France', iata: 'CDG' },
  { id: 'HND', name: 'Tokyo Haneda Airport', type: 'airport', description: 'HND - Tokyo, Japan', iata: 'HND' },
];

// Focus Handlers
const handleFromFocus = () => {
  showFromDropdown.value = true;
  showToDropdown.value = false;
  if (!fromSearchText.value.trim() && fromSuggestions.value.length === 0) {
    fromSuggestions.value = POPULAR_LOCATIONS;
  }
};

const handleToFocus = () => {
  showToDropdown.value = true;
  showFromDropdown.value = false;
  if (!toSearchText.value.trim() && toSuggestions.value.length === 0) {
    toSuggestions.value = POPULAR_LOCATIONS;
  }
};

// Input change handlers with debouncing
let fromDebounceTimeout: any = null;
const handleFromInput = () => {
  showFromDropdown.value = true;
  
  // Set the search ID to whatever they typed as a fallback
  form.value.from = fromSearchText.value;

  if (fromDebounceTimeout) clearTimeout(fromDebounceTimeout);

  if (!fromSearchText.value.trim()) {
    fromSuggestions.value = POPULAR_LOCATIONS;
    return;
  }

  isFromLoading.value = true;
  fromDebounceTimeout = setTimeout(async () => {
    try {
      const response = await $fetch<{ success: boolean; data: LocationSuggestion[] }>('/api/locations', {
        params: { q: fromSearchText.value }
      });
      if (response && response.success) {
        fromSuggestions.value = response.data;
      }
    } catch (err) {
      console.error('Failed to autocomplete From:', err);
    } finally {
      isFromLoading.value = false;
    }
  }, 300);
};

let toDebounceTimeout: any = null;
const handleToInput = () => {
  showToDropdown.value = true;
  
  // Set the search ID to whatever they typed as a fallback
  form.value.to = toSearchText.value;

  if (toDebounceTimeout) clearTimeout(toDebounceTimeout);

  if (!toSearchText.value.trim()) {
    toSuggestions.value = POPULAR_LOCATIONS;
    return;
  }

  isToLoading.value = true;
  toDebounceTimeout = setTimeout(async () => {
    try {
      const response = await $fetch<{ success: boolean; data: LocationSuggestion[] }>('/api/locations', {
        params: { q: toSearchText.value }
      });
      if (response && response.success) {
        toSuggestions.value = response.data;
      }
    } catch (err) {
      console.error('Failed to autocomplete To:', err);
    } finally {
      isToLoading.value = false;
    }
  }, 300);
};

// Selection logic
const selectFromSuggestion = (suggestion: LocationSuggestion) => {
  form.value.from = suggestion.id;
  fromSearchText.value = suggestion.iata 
    ? `${suggestion.name} (${suggestion.iata})` 
    : suggestion.name;
  showFromDropdown.value = false;
};

const selectToSuggestion = (suggestion: LocationSuggestion) => {
  form.value.to = suggestion.id;
  toSearchText.value = suggestion.iata 
    ? `${suggestion.name} (${suggestion.iata})` 
    : suggestion.name;
  showToDropdown.value = false;
};

// Use device location
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
          fromSearchText.value = locationName;
          
          // Auto trigger SerpApi suggestion search & select first hit to resolve IATA/kgmid
          isFromLoading.value = true;
          const searchRes = await $fetch<{ success: boolean; data: LocationSuggestion[] }>('/api/locations', {
            params: { q: locationName }
          });
          
          if (searchRes && searchRes.success && searchRes.data.length > 0) {
            const first = searchRes.data[0];
            selectFromSuggestion(first);
          } else {
            form.value.from = locationName;
          }
        } else {
          const fallbackVal = `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`;
          fromSearchText.value = fallbackVal;
          form.value.from = fallbackVal;
        }
      } catch (err) {
        console.error('Failed to reverse geocode:', err);
        fromSearchText.value = 'Current Location';
        form.value.from = 'Current Location';
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

// Swap inputs
const swapLocations = () => {
  const tempText = fromSearchText.value;
  fromSearchText.value = toSearchText.value;
  toSearchText.value = tempText;

  const tempId = form.value.from;
  form.value.from = form.value.to;
  form.value.to = tempId;
};

// Close dropdowns when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  if (fromContainer.value && !fromContainer.value.contains(event.target as Node)) {
    showFromDropdown.value = false;
  }
  if (toContainer.value && !toContainer.value.contains(event.target as Node)) {
    showToDropdown.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
  if (fromDebounceTimeout) clearTimeout(fromDebounceTimeout);
  if (toDebounceTimeout) clearTimeout(toDebounceTimeout);
});

// Emit final query
const submitSearch = () => {
  if (!form.value.from || !form.value.to || !form.value.date) return;
  if (isRoundTrip.value && !form.value.returnDate) {
    alert('Please select a return date for your round-trip flight.');
    return;
  }
  
  // Clone to avoid mutation problems
  const payload = { ...form.value };
  if (!isRoundTrip.value) {
    delete payload.returnDate;
  }
  
  emit('search', payload);
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
