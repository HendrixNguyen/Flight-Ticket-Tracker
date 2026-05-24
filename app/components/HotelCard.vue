<template>
  <div class="glass-card rounded-3xl overflow-hidden shadow-sm border border-white/40 dark:border-white/5 hover:shadow-xl hover:scale-[1.01] transition-all duration-300 group flex flex-col md:flex-row gap-6 relative">
    
    <!-- Hotel Photo Section -->
    <div class="w-full md:w-1/3 h-52 md:h-auto min-h-[220px] relative overflow-hidden bg-slate-100 dark:bg-slate-900 flex-shrink-0">
      <img 
        :src="hotel.thumbnail || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&auto=format&fit=crop&q=60'" 
        :alt="hotel.name"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
        loading="lazy"
      />
      
      <!-- Class Star Rating Badges over image -->
      <div v-if="hotel.classRating" class="absolute top-4 left-4 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md px-3 py-1 rounded-full border border-white/40 dark:border-white/10 flex items-center gap-1">
        <span class="text-xs font-bold text-slate-800 dark:text-slate-200">{{ hotel.classRating }}</span>
        <Star class="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
      </div>

      <!-- Price overlay for mobile -->
      <div class="md:hidden absolute bottom-4 right-4 bg-blue-600/90 dark:bg-blue-500/90 backdrop-blur-md px-4 py-1.5 rounded-2xl text-white font-black text-lg border border-white/10">
        ${{ hotel.pricePerNight }}<span class="text-xs font-normal"> / night</span>
      </div>
    </div>

    <!-- Hotel Details -->
    <div class="flex-1 p-6 md:p-4 flex flex-col justify-between gap-4">
      <div>
        <!-- Rating and Reviews -->
        <div class="flex items-center gap-2 mb-2">
          <div v-if="hotel.rating" class="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 px-2.5 py-0.5 rounded-lg text-xs font-black border border-amber-200/40 dark:border-amber-900/30">
            <Star class="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            {{ hotel.rating.toFixed(1) }}
          </div>
          <span v-if="hotel.reviewsCount" class="text-xs font-medium text-slate-500 dark:text-slate-400">
            ({{ hotel.reviewsCount.toLocaleString() }} reviews)
          </span>
          <span v-else class="text-xs font-medium text-slate-400 dark:text-slate-500">New property</span>
        </div>

        <!-- Name & Location -->
        <h3 class="text-xl font-black text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200 line-clamp-1 leading-snug">
          {{ hotel.name }}
        </h3>
        
        <div class="flex items-center gap-1 text-slate-500 dark:text-slate-400 mt-1 mb-3">
          <MapPin class="w-4 h-4 text-blue-500 dark:text-blue-400 flex-shrink-0" />
          <span class="text-xs font-bold truncate">{{ hotel.location }}</span>
        </div>

        <!-- Description -->
        <p class="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 md:line-clamp-3 leading-relaxed mb-4">
          {{ hotel.description }}
        </p>

        <!-- Amenities Badges -->
        <div v-if="hotel.amenities && hotel.amenities.length > 0" class="flex flex-wrap gap-1.5">
          <span 
            v-for="amenity in hotel.amenities.slice(0, 4)" 
            :key="amenity"
            class="text-[10px] font-extrabold uppercase tracking-wide bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 px-2 py-1 rounded-md border border-slate-200/30 dark:border-white/5"
          >
            {{ amenity }}
          </span>
          <span 
            v-if="hotel.amenities.length > 4" 
            class="text-[10px] font-extrabold uppercase tracking-wide bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-md border border-blue-100/30 dark:border-blue-900/10"
          >
            +{{ hotel.amenities.length - 4 }} More
          </span>
        </div>
      </div>

      <!-- Price & Actions Block -->
      <div class="flex items-end justify-between border-t border-slate-100 dark:border-slate-800/50 pt-4 mt-2">
        <div class="hidden md:block">
          <p class="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-widest leading-none">Price per night</p>
          <div class="flex items-baseline gap-1 mt-1">
            <span class="text-3xl font-black text-slate-900 dark:text-slate-100">${{ hotel.pricePerNight }}</span>
            <span class="text-xs font-semibold text-slate-400 dark:text-slate-500">USD</span>
          </div>
          <!-- Stay Total Price (if check-in/out ranges are set) -->
          <p v-if="hotel.totalPrice" class="text-xs font-bold text-blue-600 dark:text-blue-400 mt-0.5">
            Total stay: ${{ hotel.totalPrice }}
          </p>
        </div>

        <!-- Mobile-only stay total -->
        <div class="md:hidden">
          <p v-if="hotel.totalPrice" class="text-xs font-bold text-blue-600 dark:text-blue-400">
            Stay total: ${{ hotel.totalPrice }}
          </p>
        </div>

        <button 
          @click="handleBooking" 
          class="bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 hover:bg-blue-600 dark:hover:bg-blue-500 hover:text-white px-5 py-2.5 rounded-xl font-bold transition-all text-sm cursor-pointer border border-blue-100/50 dark:border-blue-900/30 w-full md:w-auto text-center"
        >
          Book Room
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Star, MapPin } from 'lucide-vue-next';
import type { Hotel } from '~/types';

const props = defineProps<{
  hotel: Hotel;
}>();

const emit = defineEmits<{
  (e: 'book', hotel: Hotel): void;
}>();

const handleBooking = () => {
  emit('book', props.hotel);
};
</script>
