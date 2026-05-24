<template>
  <div class="glass-card rounded-3xl p-6 shadow-sm border border-white/40 dark:border-white/5 hover:shadow-md hover:scale-[1.01] transition-all group flex flex-col sm:flex-row gap-6 sm:items-center">
    
    <!-- Airline Info -->
    <div class="flex sm:flex-col items-center sm:items-start gap-4 sm:w-1/4">
      <div v-if="flight.airlineLogo" class="w-12 h-12 rounded-2xl overflow-hidden bg-white dark:bg-white flex items-center justify-center border border-slate-100 dark:border-slate-800 shadow-sm p-1.5">
        <img :src="flight.airlineLogo" :alt="flight.airline" class="w-full h-full object-contain" />
      </div>
      <div v-else class="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xl border border-blue-100/50 dark:border-blue-900/30">
        {{ flight.airline.charAt(0) }}
      </div>
      <div class="min-w-0">
        <p class="font-bold text-slate-900 dark:text-slate-100 leading-snug truncate w-full">{{ flight.airline }}</p>
        <div class="flex items-center gap-1.5 mt-1 flex-wrap">
          <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">FL{{ flight.flightNumber }}</span>
          <span v-if="flight.airplane" class="text-[10px] font-extrabold uppercase tracking-wide text-slate-400 dark:text-slate-500 border border-slate-200/50 dark:border-slate-850 px-1.5 py-0.5 rounded-md truncate max-w-[140px]" :title="flight.airplane">
            {{ flight.airplane.split('(')[0].trim() }}
          </span>
        </div>
      </div>
    </div>

    <!-- Flight Times & Duration -->
    <div class="flex-1 flex items-center justify-between">
      <!-- Departure -->
      <div class="text-center sm:text-left">
        <p class="text-2xl font-black text-slate-900 dark:text-slate-100">{{ formatTime(flight.departureTime) }}</p>
        <p class="text-sm font-semibold text-slate-500 dark:text-slate-400">{{ flight.departureAirport }}</p>
      </div>

      <!-- Duration Line -->
      <div class="flex-1 px-4 flex flex-col items-center relative">
        <p class="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">{{ formatDuration(flight.durationMinutes) }}</p>
        <div class="w-full h-[2px] bg-slate-200 dark:bg-slate-800 rounded-full relative flex items-center justify-center">
          <Plane class="w-4 h-4 text-slate-400 dark:text-slate-500 absolute bg-gray-50 dark:bg-slate-950 px-0.5" />
        </div>
        <p class="text-xs font-bold text-blue-600 dark:text-blue-400 mt-1">
          {{ flight.stops === 0 ? 'Direct' : `${flight.stops} Stop${flight.stops > 1 ? 's' : ''}` }}
        </p>
      </div>

      <!-- Arrival -->
      <div class="text-center sm:text-right">
        <p class="text-2xl font-black text-slate-900 dark:text-slate-100">{{ formatTime(flight.arrivalTime) }}</p>
        <p class="text-sm font-semibold text-slate-500 dark:text-slate-400">{{ flight.arrivalAirport }}</p>
      </div>
    </div>

    <!-- Divider for mobile -->
    <div class="hidden sm:block w-px h-16 bg-slate-200/50 dark:bg-slate-800/50 mx-4"></div>
    <hr class="sm:hidden border-slate-200/50 dark:border-slate-800/50 my-2" />

    <!-- Price & Action -->
    <div class="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 sm:w-1/5">
      <div class="text-left sm:text-right">
        <p class="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Price per adult</p>
        <p class="text-3xl font-black text-slate-900 dark:text-slate-100">${{ flight.price }}</p>
      </div>
      <button class="bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 hover:bg-blue-600 dark:hover:bg-blue-500 hover:text-white px-6 py-2.5 rounded-xl font-bold transition-all w-full sm:w-auto text-center cursor-pointer border border-blue-100/50 dark:border-blue-900/30">
        Select
      </button>
    </div>

  </div>
</template>

<script setup lang="ts">
import { Plane } from 'lucide-vue-next';
import type { Flight } from '~/types';

defineProps<{
  flight: Flight
}>();

const formatTime = (isoString: string) => {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).format(new Date(isoString));
};

const formatDuration = (minutes: number) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}m`;
};
</script>
