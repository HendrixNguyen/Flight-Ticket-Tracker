<template>
  <div class="flex flex-col gap-4 w-full">
    <!-- Trip Type Toggle Slider -->
    <div class="flex justify-start">
      <div class="flex bg-gray-100/80 dark:bg-slate-800/80 backdrop-blur-md p-1 rounded-full border border-gray-200/50 dark:border-slate-700/50" role="group" aria-label="Trip type">
        <button
          type="button"
          @click="setTripType(false)"
          :aria-pressed="!isRoundTrip"
          class="px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer focus:ring-2 focus:ring-blue-500"
          :class="[!isRoundTrip ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-sm font-bold' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200']"
        >
          One-Way
        </button>
        <button
          type="button"
          @click="setTripType(true)"
          :aria-pressed="isRoundTrip"
          class="px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer focus:ring-2 focus:ring-blue-500"
          :class="[isRoundTrip ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-sm font-bold' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200']"
        >
          Round-Trip (2-Way)
        </button>
      </div>
    </div>

    <!-- Main Search Fields -->
    <form @submit.prevent="submitSearch" class="flex flex-col lg:flex-row gap-4 w-full items-end">
<!-- From Location Input -->
      <LocationCombobox
        ref="fromCombobox"
        v-model="form.from"
        @update:model-value="notifyChange"
        label="From"
        placeholder="Departure City/Airport (e.g. SFO)"
        :popular-locations="POPULAR_LOCATIONS"
        class="flex-1"
      >
        <template #trailing>
          <button
            type="button"
            @click="requestLocation"
            class="text-blue-500 hover:text-blue-700 transition-colors cursor-pointer"
            aria-label="Use my current location as origin"
            title="Use my location"
          >
            <Loader2 v-if="isLocating" class="w-5 h-5 animate-spin" />
            <Crosshair v-else class="w-5 h-5" />
          </button>
        </template>
      </LocationCombobox>

      <!-- Swap Button -->
      <button
        type="button"
        @click="swapLocations"
        aria-label="Swap origin and destination"
        class="hidden lg:flex p-3 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-full mb-1 transition-colors group cursor-pointer border dark:border-slate-700"
      >
        <ArrowRightLeft class="w-5 h-5 text-gray-600 dark:text-slate-300 group-hover:text-blue-600 transition-colors" />
      </button>

      <!-- To Location Input -->
      <LocationCombobox
        ref="toCombobox"
        v-model="form.to"
        @update:model-value="notifyChange"
        label="To"
        placeholder="Destination City/Airport (e.g. JFK)"
        :popular-locations="POPULAR_LOCATIONS"
        class="flex-1"
      />
      
      <!-- Premium Custom Date / Range Pickers -->
      <div class="flex-[1.5] w-full relative">
        <CustomDateRangePicker
          v-if="isRoundTrip"
          v-model:startDate="form.date"
          v-model:endDate="form.returnDate"
          :minDate="todayStr"
          @change="notifyChange"
        />
        <div v-else class="w-full relative">
          <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1" for="single-date">Departure Date</label>
          <CustomDatePicker
            id="single-date"
            v-model="form.date"
            :minDate="todayStr"
            @change="notifyChange"
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
import { ref, computed } from 'vue';
import { ArrowRightLeft, Search, Crosshair, Loader2 } from 'lucide-vue-next';
import type { SearchQuery, LocationSuggestion } from '~/types';

const props = defineProps<{
  /** Optional initial state, used to hydrate the form from a shareable URL. */
  initial?: Partial<SearchQuery>;
}>();

const emit = defineEmits<{
  (e: 'search', query: SearchQuery): void;
  (e: 'change', query: SearchQuery): void;
}>();

// Form and query state
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
const defaultDate = tomorrow.toISOString().split('T')[0];

const form = ref<SearchQuery>({
  from: props.initial?.from || '',
  to: props.initial?.to || '',
  date: props.initial?.date || defaultDate,
  returnDate: props.initial?.returnDate || '',
  passengers: props.initial?.passengers || 1,
});

// Trip type state. A URL carrying a return date implies a round trip.
const isRoundTrip = ref(Boolean(props.initial?.returnDate));

const notifyChange = () => {
  emit('change', { ...form.value });
};
const fromCombobox = ref<{ setDisplayText: (s: LocationSuggestion) => void } | null>(null);
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
  notifyChange();
};

const todayStr = computed(() => {
  return new Date().toISOString().split('T')[0];
});

// Popular location list for initial display
const POPULAR_LOCATIONS: LocationSuggestion[] = [
  { id: 'SFO', name: 'San Francisco International Airport', type: 'airport', description: 'SFO - San Francisco, CA', iata: 'SFO' },
  { id: 'JFK', name: 'John F. Kennedy International Airport', type: 'airport', description: 'JFK - New York, NY', iata: 'JFK' },
  { id: 'LAX', name: 'Los Angeles International Airport', type: 'airport', description: 'LAX - Los Angeles, CA', iata: 'LAX' },
  { id: 'LHR', name: 'London Heathrow Airport', type: 'airport', description: 'LHR - London, United Kingdom', iata: 'LHR' },
  { id: 'CDG', name: 'Paris Charles de Gaulle Airport', type: 'airport', description: 'CDG - Paris, France', iata: 'CDG' },
  { id: 'HND', name: 'Tokyo Haneda Airport', type: 'airport', description: 'HND - Tokyo, Japan', iata: 'HND' },
];

// Resolve a free-text place name to a SerpApi-usable id by matching the first
// autocomplete hit. Used by geolocation, which yields a name rather than a code.
const resolveLocationId = async (locationName: string): Promise<LocationSuggestion | null> => {
  try {
    const searchRes = await $fetch<{ success: boolean; data: LocationSuggestion[] }>('/api/locations', {
      params: { q: locationName },
    });
    if (searchRes?.success && searchRes.data.length > 0) {
      return searchRes.data[0];
    }
  } catch (err) {
    console.error('Failed to resolve location id:', err);
  }
  return null;
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
          // Auto-resolve the place name to a SerpApi IATA/kgmid id.
          const resolved = await resolveLocationId(locationName);
          if (resolved) {
            form.value.from = resolved.id;
            fromCombobox.value?.setDisplayText(resolved);
          } else {
            form.value.from = locationName;
          }
        } else {
          form.value.from = `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`;
        }
      } catch (err) {
        console.error('Failed to reverse geocode:', err);
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
  const tempId = form.value.from;
  form.value.from = form.value.to;
  form.value.to = tempId;
};

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
