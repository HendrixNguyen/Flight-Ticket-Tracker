<template>
  <div class="map-container">
    <div v-if="!hotels.length" class="text-center py-20">
      <p class="text-xl font-medium text-slate-600 dark:text-slate-300">
        No hotels to display on map.
      </p>
    </div>
    <div v-else>
      <!-- Map container -->
      <div class="map-wrapper aspect-w-16 aspect-h-9 bg-gray-200 dark:bg-gray-700 rounded-lg relative">
        <!-- In a real implementation, we would initialize a map library here -->
        <!-- For now, we show a placeholder with the number of hotels -->
        <div class="absolute inset-0 flex items-center justify-center text-slate-500 dark:text-slate-400">
          Hotel Map View
          <div class="ml-4 text-sm">
            Showing {{ hotels.length }} {{ hotels.length === 1 ? 'hotel' : 'hotels' }}
          </div>
        </div>
        <!-- We could add markers as absolutely positioned elements based on coordinates -->
        <!-- This would require converting lat/lng to pixel positions, which is complex -->
        <!-- For a prototype, we skip this -->
      </div>
      <div class="mt-4 text-sm text-slate-500 dark:text-slate-400">
        <p>
          <strong>Note:</strong> This is a placeholder for the interactive map view.
          In a full implementation, this would show an interactive map with markers
          for each hotel's location, allowing users to filter by map bounds.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';

const props = defineProps({
  hotels: {
    type: Array as () => Hotel[],
    required: true,
  }
});