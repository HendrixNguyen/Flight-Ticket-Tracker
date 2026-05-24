<template>
  <div class="glass-card p-6 rounded-3xl shadow-sm border border-white/40 dark:border-white/5 transition-all">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
        <SlidersHorizontal class="w-5 h-5 text-blue-600 dark:text-blue-400" />
        Filters
      </h2>
      <button @click="resetFilters" class="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-bold cursor-pointer">Reset</button>
    </div>

    <!-- Sorting -->
    <div class="mb-8">
      <h3 class="text-xs font-bold text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wider">Sort By</h3>
      <select 
        v-model="localSort" 
        @change="emitSort"
        class="w-full p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white/70 dark:bg-slate-900/60 dark:text-slate-100 font-medium transition-colors cursor-pointer"
      >
        <option value="price_asc">Cheapest first</option>
        <option value="price_desc">Most expensive first</option>
        <option value="time_asc">Earliest departure</option>
        <option value="duration_asc">Fastest flight</option>
      </select>
    </div>

    <hr class="border-slate-200/50 dark:border-slate-800/50 my-6" />

    <!-- Max Price -->
    <div class="mb-8">
      <div class="flex justify-between items-center mb-3">
        <h3 class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Max Price</h3>
        <span class="text-sm font-bold text-blue-600 dark:text-blue-400">${{ localFilters.maxPrice }}</span>
      </div>
      <input 
        type="range" 
        v-model="localFilters.maxPrice" 
        @change="emitFilters"
        min="100" max="2000" step="50"
        class="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600 dark:accent-blue-400"
      >
      <div class="flex justify-between text-xs text-slate-400 dark:text-slate-500 mt-2">
        <span>$100</span>
        <span>$2000+</span>
      </div>
    </div>

    <hr class="border-slate-200/50 dark:border-slate-800/50 my-6" />

    <!-- Stops -->
    <div class="mb-8">
      <h3 class="text-xs font-bold text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wider">Stops</h3>
      <div class="space-y-3">
        <label class="flex items-center gap-3 cursor-pointer group">
          <input type="radio" v-model="localFilters.maxStops" :value="0" @change="emitFilters" class="w-4 h-4 text-blue-600 dark:text-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 border-slate-300 dark:border-slate-850 bg-transparent">
          <span class="text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-100 font-medium transition-colors">Direct flights only</span>
        </label>
        <label class="flex items-center gap-3 cursor-pointer group">
          <input type="radio" v-model="localFilters.maxStops" :value="1" @change="emitFilters" class="w-4 h-4 text-blue-600 dark:text-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 border-slate-300 dark:border-slate-850 bg-transparent">
          <span class="text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-100 font-medium transition-colors">Up to 1 stop</span>
        </label>
        <label class="flex items-center gap-3 cursor-pointer group">
          <input type="radio" v-model="localFilters.maxStops" :value="2" @change="emitFilters" class="w-4 h-4 text-blue-600 dark:text-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 border-slate-300 dark:border-slate-850 bg-transparent">
          <span class="text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-100 font-medium transition-colors">Any number of stops</span>
        </label>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { SlidersHorizontal } from 'lucide-vue-next';
import type { FilterOptions, SortOption } from '~/types';

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
  localFilters.value = {
    maxPrice: 2000,
    airlines: [],
    maxStops: 2,
  };
  localSort.value = 'price_asc';
  emitFilters();
  emitSort();
};

watch(() => props.activeFilters, (newVal) => {
  localFilters.value = { ...newVal };
}, { deep: true });
</script>
