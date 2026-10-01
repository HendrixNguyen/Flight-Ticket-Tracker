<template>
  <div v-if="chips.length > 0" class="flex flex-wrap items-center gap-2 mb-4">
    <span class="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
      Active filters
    </span>
    <button
      v-for="chip in chips"
      :key="chip.key"
      type="button"
      @click="emit('remove', chip.key)"
      class="glass chip inline-flex items-center gap-1.5 rounded-full pl-3 pr-1.5 py-1 text-xs font-bold text-blue-700 dark:text-blue-300 cursor-pointer outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:focus-visible:outline-blue-300"
    >
      {{ chip.label }}
      <!-- The remove affordance gets its own hit area and its own hover wash so
           it reads as a control rather than as decoration inside the chip, and
           so a touch target clears the 24px minimum. -->
      <span class="chip-x inline-flex items-center justify-center w-5 h-5 -mr-0.5 rounded-full">
        <X class="w-3.5 h-3.5" aria-hidden="true" />
      </span>
      <span class="sr-only">Remove filter</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { X } from 'lucide-vue-next';

const props = defineProps<{
  chips: { key: string; label: string }[];
}>();

const emit = defineEmits<{
  (e: 'remove', key: string): void;
}>();

const chips = computed(() => props.chips);
</script>

<style scoped>
/* `.glass` supplies the material; these rules tint it toward the accent so a
   chip still reads as "an active filter" rather than as another piece of chrome.
   They have to be rules rather than `bg-blue-50` utilities for the reason that
   runs through this whole restyle: the `bg-*` utility would outrank the layered
   glass primitive and replace the material with a flat wash.
   `light-dark()` keys off the `color-scheme` main.css
   already sets on :root / .dark, so both modes live in one declaration. */
.chip {
  background-color: light-dark(
    color-mix(in oklab, var(--color-glass-bg-subtle) 55%, var(--color-blue-100)),
    color-mix(in oklab, var(--color-glass-bg-subtle) 70%, var(--color-blue-900))
  );
  border-color: light-dark(
    color-mix(in oklab, var(--color-glass-border) 60%, var(--color-blue-200)),
    color-mix(in oklab, var(--color-glass-border) 70%, var(--color-blue-700))
  );
  transition:
    background-color 0.25s ease,
    border-color 0.25s ease,
    transform 0.25s cubic-bezier(0.22, 1, 0.36, 1);
}

.chip:hover {
  background-color: light-dark(
    color-mix(in oklab, var(--color-blue-100) 70%, white),
    color-mix(in oklab, var(--color-blue-900) 75%, var(--color-blue-700))
  );
  transform: translateY(-1px);
}

.chip:active {
  transform: translateY(0);
}

.chip-x {
  color: light-dark(rgba(31, 79, 201, 0.65), rgba(159, 194, 251, 0.8));
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
}

.chip:hover .chip-x {
  color: light-dark(var(--color-blue-800), var(--color-blue-100));
  background-color: light-dark(rgba(255, 255, 255, 0.75), rgba(255, 255, 255, 0.14));
}

@media (prefers-reduced-motion: reduce) {
  .chip,
  .chip-x {
    transition-duration: 0.01ms;
  }

  .chip:hover,
  .chip:active {
    transform: none;
  }
}
</style>
