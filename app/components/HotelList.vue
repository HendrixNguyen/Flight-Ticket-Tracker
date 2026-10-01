<template>
  <div class="w-full">
    <!-- Unsearched State. `glass-card` with no competing border/shadow utility:
         the class already carries the halo that keeps a near-white pane
         separable from a near-white canvas. -->
    <div v-if="!searched" class="glass-card glass-grain flex flex-col items-center justify-center py-20 text-center rounded-3xl p-8">
      <div class="glass medallion w-24 h-24 rounded-full flex items-center justify-center mb-6">
        <HotelIcon class="w-10 h-10 text-blue-700 dark:text-blue-300" />
      </div>
      <h3 class="text-2xl font-black text-slate-900 dark:text-slate-100 mb-2">Find your perfect stay</h3>
      <p class="text-slate-600 dark:text-slate-300 max-w-md font-medium text-sm">Enter your destination and dates above to search premium hotel properties and retreats worldwide.</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="hotels.length === 0" class="glass-card glass-grain flex flex-col items-center justify-center py-20 text-center rounded-3xl p-8">
       <div class="glass medallion-muted w-24 h-24 rounded-full flex items-center justify-center mb-6">
        <SearchX class="w-10 h-10 text-slate-600 dark:text-slate-300" />
      </div>
      <h3 class="text-2xl font-black text-slate-900 dark:text-slate-100 mb-2">No hotels found</h3>
      <p class="text-slate-600 dark:text-slate-300 font-medium text-sm">We couldn't find any properties matching your search. Try broadening your dates or destination.</p>
    </div>

    <!-- Listings -->
    <div v-else class="space-y-4">
      <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
        <!-- Carries aria-live, so it is real content and not decoration: it is
             held at slate-600/slate-300, the first steps that clear 4.5:1 in
             both modes. -->
        <p class="text-sm font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider" aria-live="polite">Showing {{ hotels.length }} of {{ total }} stays<span v-if="hotels.length < total"> — some are hidden by your filters</span></p>
        <div class="flex items-center gap-3">
          <span v-if="cached" class="glass cached-badge text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-full">Cached rates</span>
          <button
            v-if="showRefresh"
            type="button"
            @click="emit('refresh')"
            :disabled="refreshing"
            class="refresh-btn glass inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold text-blue-700 dark:text-blue-300 hover:brightness-105 active:brightness-95 transition-[filter] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw class="w-3.5 h-3.5" :class="{ 'animate-spin': refreshing }" aria-hidden="true" />
            {{ refreshing ? 'Refreshing' : 'Refresh rates' }}
          </button>
        </div>
      </div>
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
import { Hotel as HotelIcon, SearchX, RefreshCw } from 'lucide-vue-next';
import type { Hotel } from '~/types';

defineProps<{
  hotels: Hotel[];
  searched: boolean;
  /** Unfiltered result count, so hidden results are disclosed rather than silent. */
  total: number;
  /** True when the server served these from its cache. */
  cached?: boolean;
  showRefresh?: boolean;
  refreshing?: boolean;
}>();

const emit = defineEmits<{
  (e: 'book', hotel: Hotel): void;
  (e: 'refresh'): void;
}>();

const handleBooking = (hotel: Hotel) => {
  emit('book', hotel);
};
</script>

<style scoped>
/* These are large empty regions. The grain keeps them reading as frosted
   atmosphere rather than polished plastic, and the radius matches the cards so
   the whole page shares one corner language. */

/* The medallions are `.glass` with a scoped accent wash on top. Inline `bg-*`
   utilities would win over the class and take the border and blur with them,
   leaving a flat disc. */
.medallion {
  background-color: rgba(219, 231, 254, 0.42);
  border-color: rgba(255, 255, 255, 0.5);
}
.dark .medallion {
  background-color: rgba(30, 58, 138, 0.4);
  border-color: rgba(255, 255, 255, 0.16);
}

.medallion-muted {
  background-color: rgba(226, 232, 240, 0.34);
}
.dark .medallion-muted {
  background-color: rgba(30, 41, 59, 0.44);
}

.cached-badge {
  border-color: rgba(255, 255, 255, 0.45);
}

/* Ring rather than a coloured outline: the button sits on glass, and a solid
   outline on a translucent fill reads as a sticker. `outline-offset` pulls the
   ring off the glass fill so it stays visible against the cloud behind. */
.refresh-btn:focus-visible {
  outline: 2px solid var(--color-blue-600);
  outline-offset: 2px;
}
.dark .refresh-btn:focus-visible {
  outline-color: var(--color-blue-300);
}

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

/* Kept: absolute positioning on the leaving node is what stops the remaining
   cards from reflowing up into its slot while it animates out. It must not be
   removed to "simplify" the transition, or filtering will jump. */
.list-leave-active {
  position: absolute;
}

/* Reduced motion keeps the fade -- it is the part that communicates the change
   -- and drops the horizontal slide. */
@media (prefers-reduced-motion: reduce) {
  .list-move,
  .list-enter-active,
  .list-leave-active {
    transition-duration: 0.15s;
  }
  .list-enter-from,
  .list-leave-to {
    transform: none;
  }
}
</style>