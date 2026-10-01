<template>
  <div class="glass-card glass-grain filter-pane p-6 rounded-3xl">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
        <SlidersHorizontal class="w-5 h-5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
        Filters
      </h2>
      <button
        type="button"
        @click="resetFilters"
        class="glass glass-hover rounded-full px-3 py-1.5 text-xs font-bold text-blue-700 dark:text-blue-300 cursor-pointer transition-colors outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:focus-visible:outline-blue-300"
      >
        Reset
      </button>
    </div>

    <!-- Sorting -->
    <div class="mb-8">
      <h3 class="text-xs font-bold text-slate-600 dark:text-slate-300 mb-3 uppercase tracking-wider">Sort By</h3>
      <div class="relative">
        <select
          v-model="localSort"
          @change="emitSort"
          aria-label="Sort flights by"
          class="glass w-full appearance-none rounded-xl py-2.5 pl-3 pr-9 text-sm font-semibold text-slate-800 dark:text-slate-100 cursor-pointer outline-none transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:focus-visible:outline-blue-300 [&>option]:bg-white [&>option]:text-slate-900 dark:[&>option]:bg-slate-900 dark:[&>option]:text-slate-100"
        >
          <option value="price_asc">Cheapest first</option>
          <option value="price_desc">Most expensive first</option>
          <option value="time_asc">Earliest departure</option>
          <option value="duration_asc">Fastest flight</option>
        </select>
        <!-- `appearance-none` drops the native arrow, so the affordance is
             redrawn here; `pointer-events-none` keeps the select underneath
             still the click target. -->
        <ChevronDown
          class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 dark:text-slate-300"
          aria-hidden="true"
        />
      </div>
    </div>

    <hr class="filter-rule my-6" />

    <!-- Max Price -->
    <div class="mb-8">
      <div class="flex justify-between items-center mb-3">
        <h3 class="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
          Max Price <span class="text-[10px] text-slate-600 dark:text-slate-400 normal-case tracking-normal">(USD)</span>
        </h3>
        <span class="text-sm font-bold text-blue-700 dark:text-blue-300">${{ localFilters.maxPrice }}</span>
      </div>
      <input
        type="range"
        v-model="localFilters.maxPrice"
        @change="emitFilters"
        :min="FLIGHT_PRICE_RANGE.min" :max="FLIGHT_PRICE_RANGE.max" :step="FLIGHT_PRICE_RANGE.step"
        :style="{ '--range-fill': priceFill }"
        aria-label="Maximum price in US dollars"
        class="range w-full cursor-pointer"
      >
      <div class="flex justify-between text-xs text-slate-600 dark:text-slate-300 mt-2">
        <span>${{ FLIGHT_PRICE_RANGE.min }}</span>
        <span>${{ FLIGHT_PRICE_RANGE.max }}+</span>
      </div>
    </div>

    <hr class="filter-rule my-6" />

    <!-- Stops -->
    <div class="mb-8">
      <h3 class="text-xs font-bold text-slate-600 dark:text-slate-300 mb-3 uppercase tracking-wider">Stops</h3>
      <div class="space-y-1">
        <label class="choice group">
          <input type="radio" v-model="localFilters.maxStops" :value="0" @change="emitFilters" class="choice-box accent-blue-600 dark:accent-blue-400 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:focus-visible:outline-blue-300">
          <span class="text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-100 font-medium transition-colors">Direct flights only</span>
        </label>
        <label class="choice group">
          <input type="radio" v-model="localFilters.maxStops" :value="1" @change="emitFilters" class="choice-box accent-blue-600 dark:accent-blue-400 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:focus-visible:outline-blue-300">
          <span class="text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-100 font-medium transition-colors">Up to 1 stop</span>
        </label>
        <label class="choice group">
          <input type="radio" v-model="localFilters.maxStops" :value="2" @change="emitFilters" class="choice-box accent-blue-600 dark:accent-blue-400 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:focus-visible:outline-blue-300">
          <span class="text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-100 font-medium transition-colors">Any number of stops</span>
        </label>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { SlidersHorizontal, ChevronDown } from 'lucide-vue-next';
import type { FilterOptions, SortOption } from '~/types';
import { FLIGHT_DEFAULT_FILTERS, FLIGHT_PRICE_RANGE } from '~/utils/filterDefaults';

const props = defineProps<{
  activeFilters: FilterOptions
}>();

const emit = defineEmits<{
  (e: 'update:filters', filters: FilterOptions): void,
  (e: 'update:sort', sort: SortOption): void
}>();

const localFilters = ref<FilterOptions>({ ...props.activeFilters });
const localSort = ref<SortOption>('price_asc');

const emitFilters = () => {
  emit('update:filters', { ...localFilters.value });
};

const emitSort = () => {
  emit('update:sort', localSort.value);
};

const resetFilters = () => {
  localFilters.value = { ...FLIGHT_DEFAULT_FILTERS };
  localSort.value = 'price_asc';
  emitFilters();
  emitSort();
};

// How far the thumb has travelled along the track. Purely a paint value for the
// groove's filled portion -- replacing the native `accent-color` thumb means
// nothing else tells the reader where in the range they are, and no filtering
// behaviour reads this.
const priceFill = computed(() => {
  const { min, max } = FLIGHT_PRICE_RANGE;
  const current = Number(localFilters.value.maxPrice ?? max);
  if (max === min) return '100%';
  const pct = ((current - min) / (max - min)) * 100;
  return `${Math.min(100, Math.max(0, pct))}%`;
});

watch(() => props.activeFilters, (newVal) => {
  localFilters.value = { ...newVal };
}, { deep: true });
</script>

<style scoped>
/* The pane's own lift. `.glass*` sets both `transition` and `box-shadow`, and
   a `transition-transform` / `hover:shadow-*` utility would replace one while
   leaving the other untouched rather than composing into this stack. Restating
   the transition here keeps the hover animation and the material cross-fade in
   a single declaration. */
.filter-pane {
  transition:
    transform 0.35s cubic-bezier(0.22, 1, 0.36, 1),
    background-color 0.3s ease,
    border-color 0.3s ease,
    box-shadow 0.35s ease;
}

.filter-pane:hover {
  transform: translateY(-2px);
}

/* Hover fills for glass controls live here for the same cascade reason. */
.glass-hover:hover {
  background-color: light-dark(
    color-mix(in oklab, var(--color-glass-bg-subtle) 40%, white),
    color-mix(in oklab, var(--color-glass-bg-subtle) 82%, var(--color-blue-300))
  );
}

/* A hairline that fades out at both ends reads as a cloud thinning rather than
   as a ruled line, which is all a divider is doing here. */
.filter-rule {
  border: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    light-dark(rgba(71, 80, 107, 0.22), rgba(255, 255, 255, 0.18)) 22%,
    light-dark(rgba(71, 80, 107, 0.22), rgba(255, 255, 255, 0.18)) 78%,
    transparent
  );
}

/* Radio row. The hover wash is a plain Tailwind `hover:bg-*` rather than a
   glass fill because the row is not itself a glass surface -- only the pane
   behind it is. */
.choice {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.375rem 0.5rem;
  margin-inline: -0.5rem;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.choice:hover {
  background-color: light-dark(rgba(255, 255, 255, 0.6), rgba(255, 255, 255, 0.08));
}

.choice-box {
  width: 1rem;
  height: 1rem;
  flex: none;
  cursor: pointer;
}

/* Custom range control. The native thumb is painted from `accent-color` and
   reads as a flat plastic dot against a glass pane, so the track and the thumb
   are drawn by hand for both engines. `light-dark()` keys off the
   `color-scheme` that main.css already sets on :root / .dark, so there is no
   dark-mode variant to keep in sync. Focus is an outline for the same reason
   as everywhere else on glass: nothing here claims box-shadow. */
.range {
  -webkit-appearance: none;
  appearance: none;
  height: 1.5rem;
  background: transparent;
  outline: none;
}

.range::-webkit-slider-runnable-track {
  height: 0.5rem;
  border-radius: 9999px;
  border: 1px solid light-dark(rgba(255, 255, 255, 0.75), rgba(255, 255, 255, 0.16));
  background:
    linear-gradient(
      90deg,
      var(--color-blue-500) 0 var(--range-fill, 100%),
      light-dark(rgba(255, 255, 255, 0.55), rgba(255, 255, 255, 0.1)) var(--range-fill, 100%) 100%
    );
  box-shadow: inset 0 1px 2px light-dark(rgba(28, 44, 82, 0.16), rgba(2, 4, 12, 0.55));
}

.range::-moz-range-track {
  height: 0.5rem;
  border-radius: 9999px;
  border: 1px solid light-dark(rgba(255, 255, 255, 0.75), rgba(255, 255, 255, 0.16));
  background: light-dark(rgba(255, 255, 255, 0.55), rgba(255, 255, 255, 0.1));
  box-shadow: inset 0 1px 2px light-dark(rgba(28, 44, 82, 0.16), rgba(2, 4, 12, 0.55));
}

.range::-moz-range-progress {
  height: 0.5rem;
  border-radius: 9999px;
  background: var(--color-blue-500);
}

/* Both thumbs are a lit glass bead rather than a flat disc: a specular core in
   the upper-left (matching the canvas light direction), a body gradient, a
   bright hairline, and a contact shadow so it sits on the groove. */
.range::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 1.15rem;
  height: 1.15rem;
  /* Centres the 1.15rem bead on the 0.5rem groove: (0.5 - 1.15) / 2. */
  margin-top: -0.325rem;
  border-radius: 9999px;
  border: 1px solid rgba(255, 255, 255, 0.9);
  background: radial-gradient(circle at 32% 26%, #ffffff 0%, #e8f0fe 38%, #b9d2f8 78%, #8fb6ee 100%);
  box-shadow:
    0 1px 2px light-dark(rgba(28, 44, 82, 0.3), rgba(2, 4, 12, 0.7)),
    0 6px 14px -4px light-dark(rgba(28, 44, 82, 0.45), rgba(2, 4, 12, 0.6));
  cursor: grab;
  transition: transform 0.2s ease;
}

.range::-moz-range-thumb {
  width: 1.15rem;
  height: 1.15rem;
  border-radius: 9999px;
  border: 1px solid rgba(255, 255, 255, 0.9);
  background: radial-gradient(circle at 32% 26%, #ffffff 0%, #e8f0fe 38%, #b9d2f8 78%, #8fb6ee 100%);
  box-shadow:
    0 1px 2px light-dark(rgba(28, 44, 82, 0.3), rgba(2, 4, 12, 0.7)),
    0 6px 14px -4px light-dark(rgba(28, 44, 82, 0.45), rgba(2, 4, 12, 0.6));
  cursor: grab;
  transition: transform 0.2s ease;
}

.range:hover::-webkit-slider-thumb,
.range:active::-webkit-slider-thumb {
  transform: scale(1.12);
}

.range:hover::-moz-range-thumb,
.range:active::-moz-range-thumb {
  transform: scale(1.12);
}

.range:focus-visible {
  outline: 2px solid var(--color-blue-600);
  outline-offset: 2px;
  border-radius: 9999px;
}

@media (prefers-reduced-motion: reduce) {
  .filter-pane,
  .choice,
  .range::-webkit-slider-thumb,
  .range::-moz-range-thumb {
    transition-duration: 0.01ms;
  }

  .filter-pane:hover,
  .range:hover::-webkit-slider-thumb,
  .range:active::-webkit-slider-thumb,
  .range:hover::-moz-range-thumb,
  .range:active::-moz-range-thumb {
    transform: none;
  }
}
</style>
