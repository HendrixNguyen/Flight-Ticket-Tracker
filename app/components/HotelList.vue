<template>
  <div class="w-full">
    <!-- Unsearched State -->
    <div v-if="!searched" class="flex flex-col items-center justify-center py-20 text-center glass-card rounded-3xl p-8 border border-white/40 dark:border-white/5">
      <div class="w-24 h-24 bg-blue-50 dark:bg-blue-950/40 rounded-full flex items-center justify-center mb-6 border border-blue-100/50 dark:border-blue-900/30">
        <HotelIcon class="w-10 h-10 text-blue-500 dark:text-blue-400" />
      </div>
      <h3 class="text-2xl font-black text-slate-900 dark:text-slate-100 mb-2">Find your perfect stay</h3>
      <p class="text-slate-500 dark:text-slate-400 max-w-md font-medium text-sm">Enter your destination and dates above to search premium hotel properties and retreats worldwide.</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="hotels.length === 0" class="flex flex-col items-center justify-center py-20 text-center glass-card rounded-3xl p-8 border border-white/40 dark:border-white/5">
       <div class="w-24 h-24 bg-slate-50 dark:bg-slate-900/60 rounded-full flex items-center justify-center mb-6 border border-slate-200/50 dark:border-slate-800">
        <SearchX class="w-10 h-10 text-slate-400 dark:text-slate-500" />
      </div>
      <h3 class="text-2xl font-black text-slate-900 dark:text-slate-100 mb-2">No hotels found</h3>
      <p class="text-slate-500 dark:text-slate-400 font-medium text-sm">We couldn't find any properties matching your search. Try broadening your dates or destination.</p>
    </div>

    <!-- Listings -->
    <div v-else class="space-y-4">
      <p class="text-sm font-bold text-slate-500 dark:text-slate-400 mb-4 uppercase tracking-wider">Found {{ hotels.length }} accommodations for your stay</p>
      <TransitionGroup 
        name="list" 
        tag="div" 
        class="space-y-4"
      >
        <HotelCard 
          v-for="hotel in hotels" 
          :key="hotel.id" 
          :hotel="hotel" 
          @book="handleBooking"
        />
      </TransitionGroup>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Hotel as HotelIcon, SearchX } from 'lucide-vue-next';
import type { Hotel } from '~/types';

defineProps<{
  hotels: Hotel[];
  searched: boolean;
}>();

const emit = defineEmits<{
  (e: 'book', hotel: Hotel): void;
}>();

const handleBooking = (hotel: Hotel) => {
  emit('book', hotel);
};
</script>

<style scoped>
.list-move,
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.list-leave-active {
  position: absolute;
}
</style>
