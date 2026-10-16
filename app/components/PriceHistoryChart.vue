<template>
  <div class="price-history-chart">
    <div v-if="loading" class="flex flex-col items-center justify-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">Loading price history...</p>
    </div>
    
    <div v-else-if="error" class="p-4 bg-red-50 dark:bg-red-900/50 border-l-4 border-red-500 dark:border-red-400">
      <p class="text-sm text-red-600 dark:text-red-400">{{ error }}</p>
    </div>
    
    <div v-else-if="historyData" class="space-y-4">
      <!-- Stats summary -->
      <div class="grid grid-cols-2 gap-4 text-sm text-slate-600 dark:text-slate-400">
        <div>
          <div class="font-medium">Average Price</div>
          <div>{{ formatAmount(historyData.averagePrice) }}</div>
        </div>
        <div>
          <div class="font-medium">Range</div>
          <div>{{ formatAmount(historyData.minPrice) }} - {{ formatAmount(historyData.maxPrice) }}</div>
        </div>
        <div>
          <div class="font-medium">Volatility</div>
          <div>{{ (historyData.volatility * 100).toFixed(1) }}%</div>
        </div>
        <div>
          <div class="font-medium">Trend</div>
          <div class="flex items-center gap-1">
            <span :class="{
              'text-green-600': historyData.trend === 'down',
              'text-red-600': historyData.trend === 'up',
              'text-yellow-600': historyData.trend === 'stable'
            }}">
              {{ historyData.trend === 'up' ? '▲ Up' : historyData.trend === 'down' ? '▼ Down' : '→ Stable' }}
            </span>
          </div>
        </div>
      </div>
      
      <!-- Prediction -->
      <div class="p-3 bg-blue-50 dark:bg-blue-900/50 rounded-lg">
        <p class="text-sm text-blue-800 dark:text-blue-200 font-medium">{{ historyData.prediction }}</p>
      </div>
      
      <!-- Chart -->
      <div class="h-64 relative">
        <svg class="w-full h-full" viewBox="0 0 100 60" preserveAspectRatio="xMidYMid meet">
          <!-- Axes -->
          <line x1="10" y1="50" x2="90" y2="50" stroke="slate-300" stroke-width="1" />
          <line x1="10" y1="10" x2="10" y2="50" stroke="slate-300" stroke-width="1" />
          
          <!-- Y-axis labels -->
          <text x="5" y="20" text-anchor="end" fill="slate-400" font-size="8">{{ formatAmount(Math.ceil(historyData.maxPrice)) }}</text>
          <text x="5" y="35" text-anchor="end" fill="slate-400" font-size="8">{{ formatAmount(Math.round((historyData.maxPrice + historyData.minPrice) / 2)) }}</text>
          <text x="5" y="50" text-anchor="end" fill="slate-400" font-size="8">{{ formatAmount(historyData.minPrice) }}</text>
          
          <!-- X-axis labels (simplified - just show first and last date) -->
          <text x="10" y="58" text-anchor="start" fill="slate-400" font-size="8">{{ formatDate(historyData.points[0].date) }}</text>
          <text x="90" y="58" text-anchor="end" fill="slate-400" font-size="8">{{ formatDate(historyData.points[historyData.points.length - 1].date) }}</text>
          
          <!-- Price line -->
          <polyline 
            fill="none" 
            stroke="blue-500" 
            stroke-width="2"
            points="
              ${historyData.points.map((point, index) => {
                const x = 10 + (index / (historyData.points.length - 1)) * 80;
                const y = 50 - ((point.price - historyData.minPrice) / (historyData.maxPrice - historyData.minPrice || 1)) * 40;
                return `${x},${y}`;
              }).join(' ')}
            "
          />
          
          <!-- Points -->
          ${historyData.points.map((point, index) => {
            const x = 10 + (index / (historyData.points.length - 1)) * 80;
            const y = 50 - ((point.price - historyData.minPrice) / (historyData.maxPrice - historyData.minPrice || 1)) * 40;
            return `<circle cx="${x}" cy="${y}" r="2" fill="blue-500" />`;
          }).join('')}
          
          <!-- Current price indicator (if available) -->
          <% if (currentPrice !== undefined) { %>
            <line 
              x1="10" 
              y1="${50 - ((currentPrice - historyData.minPrice) / (historyData.maxPrice - historyData.minPrice || 1)) * 40}" 
              x2="90" 
              y2="${50 - ((currentPrice - historyData.minPrice) / (historyData.maxPrice - historyData.minPrice || 1)) * 40}" 
              stroke="red-500" 
              stroke-width="1" 
              stroke-dasharray="4,2"
            />
            <text x="92" y="${50 - ((currentPrice - historyData.minPrice) / (historyData.maxPrice - historyData.minPrice || 1)) * 40}" fill="red-600" font-size="8" alignment-baseline="middle">Current</text>
          <% } %>
        </svg>
      </div>
    </div>
    
    <div v-else class="text-center py-8 text-slate-500 dark:text-slate-400">
      No price history data available for this search.
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { PriceHistoryData } from '~/types';
import { formatAmount } from '~/composables/useCurrency';

const props = defineProps<{
  historyData: PriceHistoryData | null;
  loading: boolean;
  error: string | null;
  currentPrice?: number;
}>;

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};
</script>