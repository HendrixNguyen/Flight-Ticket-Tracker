<template>
  <div v-if="chips.length > 0" class="flex flex-wrap items-center gap-2 mb-4">
    <span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
      Active filters
    </span>
    <button
      v-for="chip in chips"
      :key="chip.key"
      type="button"
      @click="emit('remove', chip.key)"
      class="inline-flex items-center gap-1.5 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-100/60 dark:border-blue-900/30 pl-3 pr-2 py-1 text-xs font-bold text-blue-700 dark:text-blue-300 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors focus:ring-2 focus:ring-blue-500"
    >
      {{ chip.label }}
      <X class="w-3.5 h-3.5" aria-hidden="true" />
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