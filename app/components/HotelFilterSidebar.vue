<template>
  <div class="glass-card p-6 rounded-3xl shadow-sm border border-white/40 dark:border-white/5 transition-all duration-300">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
        <SlidersHorizontal class="w-5 h-5 text-blue-600 dark:text-blue-400" />
        Filter Stays
      </h2>
      <button @click="resetFilters" class="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-bold cursor-pointer">Reset</button>
    </div>

    <!-- Sorting Selection -->
    <div class="mb-8">
      <h3 class="text-xs font-bold text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wider">Sort By</h3>
      <select 
        v-model="localSort" 
        @change="emitSort"
        class="w-full p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white/70 dark:bg-slate-900/60 dark:text-slate-100 font-bold transition-colors cursor-pointer"
      >
        <option value="price_asc">Price: Low to High</option>
        <option value="price_desc">Price: High to Low</option>
        <option value="rating_desc">Highest Rated First</option>
      </select>
    </div>

    <hr class="border-slate-200/50 dark:border-slate-800/50 my-6" />

    <!-- Max Price bound -->
    <div class="mb-8">
      <div class="flex justify-between items-center mb-3">
        <h3 class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Max Price</h3>
        <span class="text-sm font-black text-blue-600 dark:text-blue-400">${{ localFilters.maxPrice }}</span>
      </div>
      <input 
        type="range" 
        v-model="localFilters.maxPrice" 
        @change="emitFilters"
        min="50" max="1000" step="25"
        class="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600 dark:accent-blue-400"
      >
      <div class="flex justify-between text-xs text-slate-400 dark:text-slate-500 mt-2 font-bold">
        <span>$50</span>
        <span>$1000+</span>
      </div>
    </div>

    <hr class="border-slate-200/50 dark:border-slate-800/50 my-6" />

    <!-- Minimum Guest Rating -->
    <div class="mb-8">
      <h3 class="text-xs font-bold text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wider">Minimum Rating</h3>
      <div class="space-y-3">
        <label class="flex items-center gap-3 cursor-pointer group">
          <input type="radio" v-model="localFilters.minRating" :value="0" @change="emitFilters" class="w-4 h-4 text-blue-600 dark:text-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 border-slate-300 dark:border-slate-800 bg-transparent">
          <span class="text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-100 font-medium transition-colors text-sm">Any rating</span>
        </label>
        <label class="flex items-center gap-3 cursor-pointer group">
          <input type="radio" v-model="localFilters.minRating" :value="4.0" @change="emitFilters" class="w-4 h-4 text-blue-600 dark:text-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 border-slate-300 dark:border-slate-800 bg-transparent">
          <span class="text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-100 font-medium transition-colors text-sm flex items-center gap-1">
            4.0+ Stars <Star class="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
          </span>
        </label>
        <label class="flex items-center gap-3 cursor-pointer group">
          <input type="radio" v-model="localFilters.minRating" :value="4.5" @change="emitFilters" class="w-4 h-4 text-blue-600 dark:text-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 border-slate-300 dark:border-slate-800 bg-transparent">
          <span class="text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-100 font-medium transition-colors text-sm flex items-center gap-1">
            4.5+ Stars <Star class="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
          </span>
        </label>
        <label class="flex items-center gap-3 cursor-pointer group">
          <input type="radio" v-model="localFilters.minRating" :value="4.8" @change="emitFilters" class="w-4 h-4 text-blue-600 dark:text-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 border-slate-300 dark:border-slate-800 bg-transparent">
          <span class="text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-100 font-medium transition-colors text-sm flex items-center gap-1">
            4.8+ Stars <Star class="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
          </span>
        </label>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { SlidersHorizontal, Star } from 'lucide-vue-next';
import type { HotelFilterOptions } from '~/types';

const props = defineProps<{
  activeFilters: HotelFilterOptions;
}>();

const emit = defineEmits<{
  (e: 'update:filters', filters: HotelFilterOptions): void;
  (e: 'update:sort', sort: string): void;
}>();

const localFilters = ref<HotelFilterOptions>({ ...props.activeFilters });
const localSort = ref<string>('price_asc');

const emitFilters = () => {
  emit('update:filters', { ...localFilters.value });
};

const emitSort = () => {
  emit('update:sort', localSort.value);
};

const resetFilters = () => {
  localFilters.value = {
    maxPrice: 800,
    minRating: 0,
  };
  localSort.value = 'price_asc';
  emitFilters();
  emitSort();
};

watch(() => props.activeFilters, (newVal) => {
  localFilters.value = { ...newVal };
}, { deep: true });
</script>
