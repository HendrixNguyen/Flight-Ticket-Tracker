<template>
  <div class="flight-card glass-card glass-grain rounded-3xl p-6 group flex flex-col sm:flex-row gap-6 sm:items-center">
    
    <!-- Airline Info -->
    <div class="flex sm:flex-col items-center sm:items-start gap-4 sm:w-1/4">
      <!-- The logo tile is a small surface nested on the card. `glass` rather
           than a plain white fill keeps the cloud visible through it, so the
           tile reads as part of the same atmosphere instead of a sticker. -->
      <div v-if="flight.airlineLogo" class="glass w-12 h-12 rounded-2xl overflow-hidden flex items-center justify-center p-1.5">
        <img :src="flight.airlineLogo" :alt="flight.airline" class="w-full h-full object-contain" />
      </div>
      <!-- Fallback monogram: accent-tinted glass, not a solid blue disc, to keep
           the nested surface weight matched to the logo tile it replaces. -->
      <div v-else class="glass rounded-full w-12 h-12 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-xl">
        {{ flight.airline.charAt(0) }}
      </div>
      <div class="min-w-0">
        <p class="font-bold text-slate-900 dark:text-slate-100 leading-snug truncate w-full">{{ flight.airline }}</p>
        <div class="flex items-center gap-1.5 mt-1 flex-wrap">
          <span class="text-xs font-semibold text-slate-600 dark:text-slate-300">FL{{ flight.flightNumber }}</span>
          <span v-if="flight.airplane" class="glass text-[10px] font-extrabold uppercase tracking-wide text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded-md truncate max-w-[140px]" :title="flight.airplane">
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
        <div class="flex flex-col sm:items-start">
          <p class="text-sm font-semibold text-slate-600 dark:text-slate-300">{{ flight.departureAirport }}</p>
          <p class="text-[10px] text-slate-600 dark:text-slate-400">{{ timeZone(flight.departureTime) }}</p>
        </div>
      </div>

      <!-- Duration Line -->
      <div class="flex-1 px-4 flex flex-col items-center relative">
        <p class="text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">{{ formatDuration(flight.durationMinutes) }}</p>
        <!-- The rule fades out at both ends instead of starting hard, so it
             reads as a distance rather than a solid bar drawn on the card. The
             plane sits in its own glass disc, which is what lets the rule pass
             behind it without a colour-matched patch of flat fill. -->
        <div class="duration-rule w-full h-[2px] rounded-full relative flex items-center justify-center">
          <Plane class="plane-disc w-4 h-4 text-slate-600 dark:text-slate-300 absolute" />
        </div>
        <p class="text-xs font-bold text-blue-700 dark:text-blue-300 mt-1">
          {{ flight.stops === 0 ? 'Direct' : `${flight.stops} Stop${flight.stops > 1 ? 's' : ''}` }}
        </p>
      </div>

      <!-- Arrival -->
      <div class="text-center sm:text-right">
        <p class="text-2xl font-black text-slate-900 dark:text-slate-100">
          {{ formatTime(flight.arrivalTime) }}<span v-if="dayOffset(flight)" class="align-super text-sm font-bold text-blue-700 dark:text-blue-300 ml-0.5">+{{ dayOffset(flight) }}</span>
        </p>
        <div class="flex flex-col sm:items-end">
          <p class="text-sm font-semibold text-slate-600 dark:text-slate-300">{{ flight.arrivalAirport }}</p>
          <p class="text-[10px] text-slate-600 dark:text-slate-400">{{ timeZone(flight.arrivalTime) }}</p>
        </div>
      </div>
    </div>

    <!-- Dividers. A gradient hairline dissolves at the ends, which keeps the
         separation light; a solid border rule reads as a hard seam. -->
    <div class="hidden sm:block w-px h-16 hairline-v mx-4"></div>
    <div class="sm:hidden hairline-h my-2"></div>

    <!-- Price & Action -->
    <div class="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 sm:w-1/5">
      <div class="text-left sm:text-right">
        <p class="text-xs text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider">Price per adult</p>
        <p class="text-3xl font-black text-slate-900 dark:text-slate-100">{{ formatAmount(flight.price) }}</p>
        <p class="text-[10px] font-semibold text-slate-600 dark:text-slate-400">{{ flight.currency }}</p>
      </div>
      <!-- The CTA is the one element on the card that must not be glass: a
           translucent pane on a translucent pane collapses the label's
           contrast, and this is the action the whole card exists to offer. A
           solid accent fill stays legible over any cloud behind it, with a
           luminance lift on hover instead of the old flip to pale blue. -->
      <button type="button" class="cta bg-blue-600 text-white hover:bg-blue-500 active:bg-blue-700 dark:bg-blue-500 dark:text-white dark:hover:bg-blue-400 dark:active:bg-blue-600 px-6 py-2.5 rounded-xl font-bold w-full sm:w-auto text-center cursor-pointer">
        Select
      </button>
    </div>

  </div>
</template>

<script setup lang="ts">
import { Plane } from 'lucide-vue-next';
import type { Flight } from '~/types';
import { useCurrency } from '~/composables/useCurrency';

const props = defineProps<{
  flight: Flight
}>();

const { formatAmount } = useCurrency();

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

/** Whole days between departure and arrival in the viewer's timezone.
 *  Times are rendered in the browser's local zone, so a red-eye or a
 *  transatlantic leg can land on a later calendar day than it departed.
 *  Returns 0 when arrival is on the same day. */
const dayOffset = (flight: Flight): number => {
  const dep = new Date(flight.departureTime);
  const arr = new Date(flight.arrivalTime);
  if (Number.isNaN(dep.getTime()) || Number.isNaN(arr.getTime())) return 0;

  // Compare calendar days at local midnight.
  const depDay = Date.UTC(dep.getFullYear(), dep.getMonth(), dep.getDate());
  const arrDay = Date.UTC(arr.getFullYear(), arr.getMonth(), arr.getDate());
  const days = Math.round((arrDay - depDay) / 86_400_000);
  return days > 0 ? days : 0;
};

/** Short timezone label, e.g. "PDT" - lets the user interpret the local times. */
const timeZone = (isoString: string): string => {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return '';
  const parts = new Intl.DateTimeFormat('en-US', { timeZoneName: 'short' }).formatToParts(date);
  return parts.find(p => p.type === 'timeZoneName')?.value ?? '';
};
</script>

<style scoped>
/* Hover is a lift plus a very small brightness/saturate gain rather than a
   shadow swap: `glass-card` already carries a layered shadow, and layering a
   bigger one on hover is what made the old card read as a heavy slab.
   transform-only, so nothing reflows, and small enough to stay calm. */
.flight-card {
  transition:
    transform 0.45s cubic-bezier(0.22, 1, 0.36, 1),
    filter 0.45s ease,
    background-color 0.3s ease,
    border-color 0.3s ease,
    box-shadow 0.3s ease;
}
@media (hover: hover) {
  .flight-card:hover {
    transform: translateY(-2px);
    filter: brightness(1.03) saturate(1.04);
  }
}

/* Keyboard users tabbing into the card get the same acknowledgement hover
   gives, without the pointer dependency. */
.flight-card:focus-within {
  filter: brightness(1.02);
}

@media (prefers-reduced-motion: reduce) {
  .flight-card,
  .flight-card:hover {
    transform: none;
    transition: filter 0.3s ease;
  }
}

/* Duration rule: transparent at both ends so the leg length is legible as
   distance rather than as a solid bar. */
.duration-rule {
  background-image: linear-gradient(
    to right,
    transparent,
    var(--color-slate-300) 22%,
    var(--color-slate-300) 78%,
    transparent
  );
}
.dark .duration-rule {
  background-image: linear-gradient(
    to right,
    transparent,
    rgba(255, 255, 255, 0.34) 22%,
    rgba(255, 255, 255, 0.34) 78%,
    transparent
  );
}

/* The plane needs an opaque-ish backing to mask the rule behind it. Matching
   the rule's own light with a translucent disc keeps the interruption reading
   as a gap in the line rather than a pasted-on chip. */
.plane-disc {
  padding: 1px 2px;
  border-radius: 9999px;
  background-color: var(--color-glass-bg);
  box-shadow: 0 0 0 3px var(--color-glass-bg);
}

/* Hairline dividers that fade, so they group content without cutting the
   pane into sections. */
.hairline-v {
  background-image: linear-gradient(
    to bottom,
    transparent,
    var(--color-slate-300) 30%,
    var(--color-slate-300) 70%,
    transparent
  );
}
.dark .hairline-v {
  background-image: linear-gradient(
    to bottom,
    transparent,
    rgba(255, 255, 255, 0.16) 30%,
    rgba(255, 255, 255, 0.16) 70%,
    transparent
  );
}
.hairline-h {
  height: 1px;
  background-image: linear-gradient(
    to right,
    transparent,
    var(--color-slate-300) 15%,
    var(--color-slate-300) 85%,
    transparent
  );
}
.dark .hairline-h {
  background-image: linear-gradient(
    to right,
    transparent,
    rgba(255, 255, 255, 0.16) 15%,
    rgba(255, 255, 255, 0.16) 85%,
    transparent
  );
}

/* Focus ring for the CTA. Offset is set to the card's own fill rather than
   white, so the ring separates from the glass instead of merging with it. */
.cta:focus-visible {
  outline: 2px solid var(--color-blue-600);
  outline-offset: 2px;
}
.dark .cta:focus-visible {
  outline-color: var(--color-blue-300);
}
</style>