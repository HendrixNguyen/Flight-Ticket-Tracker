<template>
  <div>
    <!-- Mobile trigger -->
    <button
      type="button"
      @click="openSheet"
      class="glass glass-trigger lg:hidden w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-blue-700 dark:text-blue-300 font-bold text-sm transition-colors cursor-pointer outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:focus-visible:outline-blue-300"
    >
      <SlidersHorizontal class="w-4 h-4" aria-hidden="true" />
      Filters
      <span
        v-if="count > 0"
        class="rounded-full bg-blue-600 text-white px-2 py-0.5 text-xs font-black"
      >{{ count }}</span>
    </button>

    <!-- Desktop: inline sidebar, no sheet -->
    <div class="hidden lg:block">
      <slot />
    </div>

    <!-- Mobile bottom sheet.

         The Teleport is load-bearing, not incidental. The shell's
         `<main class="relative z-10">` creates a stacking context, so a
         `fixed inset-0` overlay rendered in place is trapped inside it and
         paints *below* the shell's `z-40` sticky header -- which now reads as
         the header floating on top of the open sheet. Teleporting to <body>
         puts the overlay in the root stacking context, where its z-index is
         compared against the header's directly and wins. -->
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
          <!-- Scrim. Softened and blurred rather than a flat dark wash, so the
               page behind still reads as atmosphere and the sheet reads as the
               thing floating in front of it. -->
          <div
            class="absolute inset-0 bg-slate-900/45 dark:bg-slate-950/70 backdrop-blur-md"
            @click="closeSheet"
          ></div>

          <div
            ref="sheetRef"
            class="glass-elevated glass-grain relative w-full max-h-[85vh] overflow-y-auto rounded-t-3xl"
          >
            <!-- Sticky bars repeat the panel's own `.glass-elevated` rather than
                 settling for `.glass`: at 0.38 fill, result counts and field
                 values scrolling underneath would show straight through the
                 header. Nested, the two 0.66 layers composite to roughly 0.89,
                 so they stay opaque enough to read over moving content. -->
            <div class="sheet-bar sticky top-0 z-10 glass-elevated px-5 py-4 flex items-center justify-between">
              <h2 class="text-lg font-bold text-slate-900 dark:text-slate-100">{{ title }}</h2>
              <button
                ref="closeButtonRef"
                type="button"
                @click="closeSheet"
                aria-label="Close filters"
                class="p-2 rounded-full text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-white/10 transition-colors cursor-pointer outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:focus-visible:outline-blue-300"
              >
                <X class="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            <div class="px-5 py-4">
              <slot />
            </div>

            <div class="sheet-bar sheet-bar-foot sticky bottom-0 z-10 glass-elevated px-5 py-4">
              <button
                type="button"
                @click="closeSheet"
                class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-2xl shadow-lg shadow-blue-600/20 transition-colors cursor-pointer outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:focus-visible:outline-blue-300"
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
/* Hover fills for glass controls live in a rule rather than as `hover:bg-*`
   utilities: the utility now outranks the layered primitive, which would
   flatten the material to a single dead wash on hover. */
.glass-trigger:hover {
  background-color: light-dark(
    color-mix(in oklab, var(--color-glass-bg-subtle) 35%, var(--color-blue-100)),
    color-mix(in oklab, var(--color-glass-bg-subtle) 80%, var(--color-blue-300))
  );
}

.glass-trigger:active {
  background-color: light-dark(
    color-mix(in oklab, var(--color-glass-bg-subtle) 55%, var(--color-blue-200)),
    color-mix(in oklab, var(--color-glass-bg-subtle) 95%, var(--color-blue-200))
  );
}

/* The sticky bars are full-bleed strips inside a rounded panel, so they drop the
   primitive's all-round border and 1px outer halo (which would draw a stray
   line across the panel's rounded top) and keep only the edge that actually
   separates the bar from the content passing under it. The inner specular is
   kept, so the top bar still catches the light. */
.sheet-bar {
  border: 0;
  border-bottom: 1px solid var(--color-glass-border);
  box-shadow:
    0 1px 0 0 var(--color-glass-border),
    inset 0 1px 0 0 var(--color-glass-specular),
    inset 0 -1px 0 0 var(--color-glass-shadow-tight);
}

.sheet-bar-foot {
  border-bottom: 0;
  border-top: 1px solid var(--color-glass-border);
  box-shadow:
    0 -1px 0 0 var(--color-glass-border),
    inset 0 1px 0 0 var(--color-glass-specular);
}

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

@media (prefers-reduced-motion: reduce) {
  .sheet-enter-active,
  .sheet-leave-active,
  .sheet-enter-active > div:last-child,
  .sheet-leave-active > div:last-child {
    transition-duration: 0.01ms;
  }
}
</style>
