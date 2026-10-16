<template>
  <div class="price-calendar">
    <div v-if="loading" class="flex flex-col items-center justify-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">Loading price calendar...</p>
    </div>
    
    <div v-else-if="error" class="p-4 bg-red-50 dark:bg-red-900/50 border-l-4 border-red-500 dark:border-red-400">
      <p class="text-sm text-red-600 dark:text-red-400">{{ error }}</p>
    </div>
    
    <div v-else-if="calendarData" class="space-y-4">
      <!-- Stats summary -->
      <div class="grid grid-cols-3 gap-4 text-sm text-slate-600 dark:text-slate-400">
        <div>
          <div class="font-medium">Average Price</div>
          <div>{{ formatAmount(calendarData.averagePrice) }}</div>
        </div>
        <div>
          <div class="font-medium">Minimum Price</div>
          <div>{{ formatAmount(calendarData.minPrice) }} (<span class="font-medium">{{ formatDate(calendarData.cheapestDate) }}</span>)</div>
        </div>
        <div>
          <div class="font-medium">Maximum Price</div>
          <div>{{ formatAmount(calendarData.maxPrice) }} (<span class="font-medium">{{ formatDate(calendarData.mostExpensiveDate) }}</span>)</div>
        </div>
      </div>
      
      <!-- Calendar header -->
      <div class="flex gap-2 mb-2">
        <div class="w-20 text-center font-medium text-slate-500 dark:text-slate-400">Date</div>
        <div class="flex-1 space-x-2">
          <div v-for="dayName in ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']" :key="dayName" class="w-10 text-center text-sm text-slate-500 dark:text-slate-400">
            {{ dayName }}
          </div>
        </div>
      </div>
      
      <!-- Calendar grid -->
      <div class="grid gap-1">
        <div v-for="(week, weekIndex) in calendarData.weeks" :key="weekIndex" class="grid cols-7 gap-1">
          <div v-for="(day, dayIndex) in week.days" :key="dayIndex" 
               class="aspect-w-1 aspect-h-1 bg-gray-50 dark:bg-gray-700/50 rounded-lg flex flex-col items-center justify-center p-1 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600/50 transition-colors"
               :class="{
                 'bg-blue-50 dark:bg-blue-900/50': day.date === selectedDate,
                 'border-2 border-blue-500 dark:border-blue-400': day.date === selectedDate,
                 'bg-green-50 dark:bg-green-900/20': day.price === calendarData.minPrice,
                 'bg-red-50 dark:bg-red-900/20': day.price === calendarData.maxPrice,
                 'opacity-50': !day.available
               }"
               @click="selectDate(day.date)"
          >
            <div class="text-xs font-medium text-slate-800 dark:text-slate-200">{{ formatDate(day.date) }}</div>
            <div class="text-sm font-bold text-slate-900 dark:text-slate-100">{{ formatAmount(day.price) }}</div>
            <div v-if="isWeekend(day.date)" class="xs text-xs text-blue-500 dark:text-blue-400">Weekend</div>
          </div>
        </div>
      </div>
      
      <!-- Selected date info -->
      <div v-if="selectedDate" class="p-3 bg-blue-50 dark:bg-blue-900/50 rounded-lg">
        <div class="flex justify-between items-start">
          <div>
            <div class="font-medium">Selected Date</div>
            <div class="text-sm">{{ formatDate(selectedDate) }}</div>
          </div>
          <div class="text-sm font-bold text-right">
            {{ formatAmount(getPriceForDate(selectedDate)) }}
          </div>
        </div>
        <div class="mt-2 flex justify-between text-sm text-slate-600 dark:text-slate-400">
          <span> vs Average: {{ getPriceDifferencePercent(getPriceForDate(selectedDate), calendarData.averagePrice) }}%</span>
          <span>{{ getPriceDifferencePercent(getPriceForDate(selectedDate), calendarData.averagePrice) < 0 ? 'Below' : 'Above' }} average</span>
        </div>
      </div>
      
      <div v-else class="text-center py-4 text-slate-500 dark:text-slate-400">
        Click on a date to see details
      </div>
    </div>
    
    <div v-else class="text-center py-8 text-slate-500 dark:text-slate-400">
      No price calendar data available for this search.
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { PriceCalendar } from '~/types';
import { formatAmount } from '~/composables/useCurrency';

const props = defineProps<{
  calendarData: PriceCalendar | null;
  loading: boolean;
  error: string | null;
}>;

const selectedDate = ref<string | null>(null);

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

const getDayName = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, { weekday: 'short' });
};

const isWeekend = (dateString: string): boolean => {
  const date = new Date(dateString);
  const day = date.getDay();
  return day === 0 || day === 6; // Sunday or Saturday
};

const getPriceForDate = (dateString: string): number => {
  if (!calendarData.value) return 0;
  
  for (const week of calendarData.value.weeks) {
    const day = week.days.find(d => d.date === dateString);
    if (day) return day.price;
  }
  
  return 0;
};

const getPriceDifferencePercent = (price: number, basePrice: number): number => {
  if (basePrice === 0) return 0;
  return ((price - basePrice) / basePrice) * 100;
};

const selectDate = (date: string) => {
  selectedDate.value = date;
  // Emit event to parent to update search with this date
  // In a full implementation, we would update the search form with this date
  // For now, we just show the info
};
</script>