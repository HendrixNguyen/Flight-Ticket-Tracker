<template>
  <div class="hotel-card glass-card glass-grain rounded-3xl overflow-hidden group flex flex-col md:flex-row gap-6 relative">
    
    <!-- Hotel Photo Section -->
    <div class="w-full md:w-1/3 h-52 md:h-auto min-h-[220px] relative overflow-hidden flex-shrink-0">
      <img 
        :src="hotel.thumbnail || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&auto=format&fit=crop&q=60'" 
        :alt="hotel.name"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
        loading="lazy"
      />
      <!-- A soft gradient wash over the photo's lower half. It is what lets the
           price pill and star badge hold contrast over an arbitrary image --
           `.glass` alone is a window, and a window over white sky gives the
           label nothing to sit against. -->
      <div class="absolute inset-0 photo-scrim pointer-events-none" aria-hidden="true"></div>
      
      <!-- Class Star Rating Badge over image -->
      <div v-if="hotel.classRating" class="glass overlay-badge absolute top-4 left-4 rounded-full px-3 py-1 flex items-center gap-1">
        <span class="text-xs font-bold text-white">{{ hotel.classRating }}</span>
        <Star class="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
      </div>

      <!-- Price overlay for mobile -->
      <div class="md:hidden absolute bottom-4 right-4 bg-blue-600 px-4 py-1.5 rounded-2xl text-white font-black text-lg">
        {{ formatAmount(hotel.pricePerNight) }}<span class="text-xs font-normal text-blue-100"> / night</span>
      </div>
    </div>

    <!-- Hotel Details -->
    <div class="flex-1 p-6 md:p-4 flex flex-col justify-between gap-4">
      <div>
        <!-- Rating and Reviews -->
        <div class="flex items-center gap-2 mb-2">
          <!-- Star rating, so amber stays reserved for it. The tint is a wash
               behind the star rather than a solid badge: the number needs to
               stay legible over the card's own translucent fill. -->
          <div v-if="hotel.rating" class="glass rating-chip rounded-lg px-2.5 py-0.5 text-xs font-black flex items-center gap-1">
            <Star class="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span class="text-amber-800 dark:text-amber-300">{{ hotel.rating.toFixed(1) }}</span>
          </div>
          <span v-if="hotel.reviewsCount" class="text-xs font-medium text-slate-600 dark:text-slate-300">
            ({{ hotel.reviewsCount.toLocaleString() }} reviews)
          </span>
          <span v-else class="text-xs font-medium text-slate-600 dark:text-slate-300">New property</span>
        </div>

        <!-- Name & Location -->
        <h3 class="text-xl font-black text-slate-900 dark:text-slate-100 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-200 line-clamp-1 leading-snug">
          {{ hotel.name }}
        </h3>
        
        <div class="flex items-center gap-1 text-slate-600 dark:text-slate-300 mt-1 mb-3">
          <MapPin class="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <span class="text-xs font-bold truncate">{{ hotel.location }}</span>
        </div>

        <!-- Description -->
        <p class="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 md:line-clamp-3 leading-relaxed mb-4">
          {{ hotel.description }}
        </p>

        <!-- Amenities Badges -->
        <div v-if="hotel.amenities && hotel.amenities.length > 0" class="flex flex-wrap gap-1.5">
          <span 
            v-for="amenity in hotel.amenities.slice(0, 4)" 
            :key="amenity"
            class="glass text-[10px] font-extrabold uppercase tracking-wide text-slate-600 dark:text-slate-300 px-2 py-1 rounded-md"
          >
            {{ amenity }}
          </span>
          <span 
            v-if="hotel.amenities.length > 4" 
            class="glass text-[10px] font-extrabold uppercase tracking-wide text-blue-700 dark:text-blue-300 px-2 py-1 rounded-md"
          >
            +{{ hotel.amenities.length - 4 }} More
          </span>
        </div>
      </div>

      <!-- Price & Actions Block -->
      <div class="hairline-row flex items-end justify-between gap-4 pt-4 mt-2">
        <div class="hidden md:block">
          <p class="text-[10px] text-slate-600 dark:text-slate-300 font-extrabold uppercase tracking-widest leading-none">Price per night</p>
          <div class="flex items-baseline gap-1 mt-1">
            <span class="text-3xl font-black text-slate-900 dark:text-slate-100">{{ formatAmount(hotel.pricePerNight) }}</span>
            <span class="text-xs font-semibold text-slate-600 dark:text-slate-400">{{ hotel.currency }}</span>
          </div>
          <!-- Stay Total Price (if check-in/out ranges are set) -->
          <p v-if="hotel.totalPrice" class="text-xs font-bold text-blue-700 dark:text-blue-300 mt-0.5">
            Total stay: {{ formatAmount(hotel.totalPrice) }}
          </p>
        </div>

        <!-- Mobile-only stay total: the per-night price is already carried by
             the pill over the photo at this width, so only the total needs
             repeating here. -->
        <div class="md:hidden">
          <p v-if="hotel.totalPrice" class="text-xs font-bold text-blue-700 dark:text-blue-300">
            Stay total: {{ formatAmount(hotel.totalPrice) }}
          </p>
        </div>

        <!-- Solid accent, for the same reason as the flight CTA: this is the
             card's primary action and a translucent pane here would stack two
             windows between the label and the canvas. -->
        <button 
          type="button"
          @click="handleBooking" 
          class="cta bg-blue-600 text-white hover:bg-blue-500 active:bg-blue-700 dark:bg-blue-500 dark:text-white dark:hover:bg-blue-400 dark:active:bg-blue-600 px-5 py-2.5 rounded-xl font-bold text-sm cursor-pointer w-full md:w-auto text-center"
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
import { useCurrency } from '~/composables/useCurrency';

const { formatAmount } = useCurrency();

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

<style scoped>
/* Same hover contract as the flight card: a 2px lift plus a hair of
   brightness, no shadow swap, because `glass-card` supplies the elevation. */
.hotel-card {
  transition:
    transform 0.45s cubic-bezier(0.22, 1, 0.36, 1),
    filter 0.45s ease,
    background-color 0.3s ease,
    border-color 0.3s ease,
    box-shadow 0.3s ease;
}
@media (hover: hover) {
  .hotel-card:hover {
    transform: translateY(-2px);
    filter: brightness(1.03) saturate(1.04);
  }
}
.hotel-card:focus-within {
  filter: brightness(1.02);
}

@media (prefers-reduced-motion: reduce) {
  .hotel-card,
  .hotel-card:hover {
    transform: none;
    transition: filter 0.3s ease;
  }
}

/* Two scrims, not one: a tight wash at the top for the class-rating badge and
   a deeper one rising from the bottom where the price pill sits. Concentrating
   the darkening where the overlays actually are keeps the middle of the photo
   clean, which is the whole point of showing it. */
.photo-scrim {
  background-image:
    linear-gradient(
      to bottom,
      rgba(8, 12, 24, 0.34) 0%,
      rgba(8, 12, 24, 0.12) 22%,
      rgba(8, 12, 24, 0) 42%
    ),
    linear-gradient(
      to top,
      rgba(8, 12, 24, 0.42) 0%,
      rgba(8, 12, 24, 0.1) 24%,
      rgba(8, 12, 24, 0) 46%
    );
}

/* Overlays on the photo get a denser material than a card-level chip. `.glass`
   is 0.26 fill, which over an arbitrary image leaves the label riding on
   whatever pixels happen to be underneath; these are scoped overrides rather
   than inline `bg-*` utilities, which would also cancel the class's own
   border and blur. */
.overlay-badge {
  background-color: rgba(16, 22, 40, 0.5);
  border-color: rgba(255, 255, 255, 0.24);
}

/* Star rating chip: a warm wash inside the glass so the amber reads as a
   rating colour without becoming a solid amber block. */
.rating-chip {
  background-color: rgba(253, 230, 138, 0.34);
  border-color: rgba(245, 158, 11, 0.28);
}
.dark .rating-chip {
  background-color: rgba(120, 53, 15, 0.42);
  border-color: rgba(251, 191, 36, 0.26);
}

/* Fades at the edges rather than terminating hard, so it reads as a
   separation in the pane and not as a rule drawn across it. */
.hairline-row {
  position: relative;
}
.hairline-row::before {
  content: '';
  position: absolute;
  inset: 0 0 auto 0;
  height: 1px;
  background-image: linear-gradient(
    to right,
    transparent,
    var(--color-slate-300) 8%,
    var(--color-slate-300) 92%,
    transparent
  );
}
.dark .hairline-row::before {
  background-image: linear-gradient(
    to right,
    transparent,
    rgba(255, 255, 255, 0.14) 8%,
    rgba(255, 255, 255, 0.14) 92%,
    transparent
  );
}

.cta:focus-visible {
  outline: 2px solid var(--color-blue-600);
  outline-offset: 2px;
}
.dark .cta:focus-visible {
  outline-color: var(--color-blue-300);
}
</style>