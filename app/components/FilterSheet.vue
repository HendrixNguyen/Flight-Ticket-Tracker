<template>
  <div>
    <!-- Mobile trigger -->
    <button
      type="button"
      @click="openSheet"
      class="lg:hidden w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-colors cursor-pointer focus:ring-2 focus:ring-blue-500"
    >
      <SlidersHorizontal class="w-4 h-4" aria-hidden="true" />
      Filters
      <span
        v-if="count > 0"
        class="rounded-full bg-white/25 px-2 py-0.5 text-xs font-black"
      >{{ count }}</span>
    </button>

    <!-- Desktop: inline sidebar, no sheet -->
    <div class="hidden lg:block">
      <slot />
    </div>

    <!-- Mobile bottom sheet -->
    <Teleport to="body">
      <Transition name="sheet">
        <div
          v-if="isOpen"
          class="lg:hidden fixed inset-0 z-[60] flex items-end"
          role="dialog"
          aria-modal="true"
          :aria-label="title"
          @keydown.esc="closeSheet"
        >
          <div
            class="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            @click="closeSheet"
          ></div>

          <div
            ref="sheetRef"
            class="relative w-full max-h-[85vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-t-3xl border-t border-gray-200 dark:border-slate-800 shadow-2xl"
          >
            <div class="sticky top-0 z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-gray-100 dark:border-slate-800 px-5 py-4 flex items-center justify-between">
              <h2 class="text-lg font-bold text-slate-900 dark:text-slate-100">{{ title }}</h2>
              <button
                ref="closeButtonRef"
                type="button"
                @click="closeSheet"
                aria-label="Close filters"
                class="p-2 rounded-full text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors cursor-pointer focus:ring-2 focus:ring-blue-500"
              >
                <X class="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            <div class="px-5 py-4">
              <slot />
            </div>

            <div class="sticky bottom-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-gray-100 dark:border-slate-800 px-5 py-4">
              <button
                type="button"
                @click="closeSheet"
                class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors cursor-pointer focus:ring-2 focus:ring-blue-500"
              >
                Show {{ resultCount }} result{{ resultCount === 1 ? '' : 's' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onUnmounted } from 'vue';
import { SlidersHorizontal, X } from 'lucide-vue-next';

const props = withDefaults(defineProps<{
  title?: string;
  /** Number of active filters, shown on the trigger. */
  count?: number;
  /** Currently visible result count, shown on the confirm button. */
  resultCount?: number;
}>(), {
  title: 'Filters',
  count: 0,
  resultCount: 0,
});

const isOpen = ref(false);
const sheetRef = ref<HTMLElement | null>(null);
const closeButtonRef = ref<HTMLButtonElement | null>(null);
let previouslyFocused: HTMLElement | null = null;

const openSheet = async () => {
  previouslyFocused = document.activeElement as HTMLElement;
  isOpen.value = true;
  await nextTick();
  closeButtonRef.value?.focus();
};

const closeSheet = () => {
  isOpen.value = false;
  previouslyFocused?.focus();
};

// Trap Tab within the sheet while it is open.
const handleKeydown = (event: KeyboardEvent) => {
  if (!isOpen.value || event.key !== 'Tab' || !sheetRef.value) return;

  const focusables = sheetRef.value.querySelectorAll<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  if (focusables.length === 0) return;

  const first = focusables[0];
  const last = focusables[focusables.length - 1];

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
};

watch(isOpen, (open) => {
  if (open) {
    document.addEventListener('keydown', handleKeydown);
    document.body.style.overflow = 'hidden';
  } else {
    document.removeEventListener('keydown', handleKeydown);
    document.body.style.overflow = '';
  }
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown);
  document.body.style.overflow = '';
});
</script>

<style scoped>
.sheet-enter-active,
.sheet-leave-active {
  transition: opacity 0.25s ease;
}

.sheet-enter-active > div:last-child,
.sheet-leave-active > div:last-child {
  transition: transform 0.25s ease;
}

.sheet-enter-from,
.sheet-leave-to {
  opacity: 0;
}

.sheet-enter-from > div:last-child,
.sheet-leave-to > div:last-child {
  transform: translateY(100%);
}
</style>