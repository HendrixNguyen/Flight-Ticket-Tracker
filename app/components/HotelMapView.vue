<template>
  <div class="map-container">
    <div v-if="!hotels.length" class="text-center py-20">
      <p class="text-xl font-medium text-slate-600 dark:text-slate-300">
        No hotels to display on map.
      </p>
    </div>
    <div v-else>
      <!-- Map container -->
      <div class="map-wrapper aspect-w-16 aspect-h-9 bg-gray-200 dark:bg-gray-700 rounded-lg relative overflow-hidden">
        <!-- Simple map visualization using CSS positioning -->
        <!-- In a real app, we would use Leaflet, Mapbox, or Google Maps -->
        <div class="absolute inset-0" v-for="(hotel, index) in hotelsWithCoordinates" :key="hotel.id">
          <!-- Convert lat/lng to approximate x/y positions -->
          <!-- This is a very rough approximation for demonstration -->
          <div 
            class="absolute w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-md transform -translate-x-2 -translate-y-2"
            :style="{
              left: `${((hotel.gps?.longitude || 0) + 180) * (100/360)}%`,
              bottom: `${((hotel.gps?.latitude || 0) + 90) * (100/180)}%`
            }"
            @click="selectHotel(hotel)"
          >
            <div class="absolute -top-2 -left-2 w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
              <div class="w-2 h-2 bg-red-500 rounded-full"></div>
            </div>
          </div>
        </div>
        
        <!-- Map info panel -->
        <div class="absolute bottom-4 left-4 right-4 max-w-xs bg-white dark:bg-slate-800/90 backdrop-blur-sm rounded-lg p-4 flex flex-col items-center gap-2 text-sm text-slate-800 dark:text-slate-100 shadow-lg">
          <div class="font-medium">Showing {{ filteredHotels.length }} of {{ hotels.length }} hotels</div>
          <div class="flex flex-wrap gap-2">
            <button 
              @click="fitBounds"
              class="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
            >
              Fit Bounds
            </button>
            <button 
              @click="toggleListView"
              class="px-2 py-1 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100 text-xs rounded hover:bg-slate-300 dark:hover:bg-slate-600"
            >
              Show List
            </button>
          </div>
        </div>
        
        <!-- Hotel list panel (shown when toggled) -->
        <div v-if="showListPanel" class="absolute inset-y-0 right-0 w-64 bg-white dark:bg-slate-800/90 backdrop-blur-sm border-l border-slate-200 dark:border-slate-700 overflow-y-auto">
          <div class="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
            <h3 class="font-bold text-lg">Hotels List</h3>
            <button 
              @click="toggleListView"
              class="absolute right-2 top-2 text-slate-500 hover:text-slate-700"
            >
              <span class="material-icons">close</span>
            </button>
          </div>
          <div class="py-4 space-y-3">
            <div 
              v-for="hotel in filteredHotels" 
              :key="hotel.id"
              class="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-600/50"
              @click="selectHotel(hotel)"
            >
              <div class="font-medium">{{ hotel.name }}</div>
              <div class="text-sm text-slate-500 dark:text-slate-400">{{ hotel.location }}</div>
              <div class="mt-1 flex items-center gap-1">
                <span v-if="hotel.rating" class="text-xs bg-amber-100 dark:bg-amber-900 px-1.5 py-0.5 rounded">
                  {{ hotel.rating.toFixed(1)}} ★
                </span>
                <span class="text-xs text-slate-600 dark:text-slate-300">{{ formatAmount(hotel.pricePerNight) }}/night</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="mt-4 text-sm text-slate-500 dark:text-slate-400">
        <p>
          <strong>Note:</strong> This is a simplified map implementation for demonstration.
          In a full implementation, we would integrate with a mapping library like Leaflet or Mapbox
          to provide interactive maps with proper geolocation, zoom, and pan controls.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, ref, computed } from 'vue';
import { useCurrency } from '~/composables/useCurrency';
import type { Hotel } from '~/types';

const props = defineProps({
  hotels: {
    type: Array as () => Hotel[],
    required: true,
  }
});

const { formatAmount } = useCurrency();

// State
const showListPanel = ref(false);
const selectedHotel = ref<Hotel | null>(null);

// Filter hotels to only those with coordinates for display
const hotelsWithCoordinates = computed(() => 
  props.hotels.filter(hotel => 
    hotel.gps && 
    hotel.gps.latitude !== undefined && 
    hotel.gps.longitude !== undefined &&
    !isNaN(hotel.gps.latitude) && 
    !isNaN(hotel.gps.longitude)
  )
);

// For the list panel, we show all hotels (with or without coordinates)
const filteredHotels = computed(() => props.hotels);

// Select a hotel (for highlighting on map or showing details)
function selectHotel(hotel: Hotel) {
  selectedHotel.value = hotel;
  // In a full implementation, we would pan/zoom the map to this hotel
}

// Fit map bounds to show all hotels
function fitBounds() {
  // In a full implementation with a map library, we would calculate bounds and fit the map
  alert('In a full implementation, this would zoom the map to show all hotels');
}

// Toggle the list panel
function toggleListView() {
  showListPanel.value = !showListPanel.value;
}
</script>