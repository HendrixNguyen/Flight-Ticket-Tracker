<template>
  <div class="relative" ref="container">
    <button
      type="button"
      ref="trigger"
      @click="isOpen ? close() : open()"
      :aria-expanded="isOpen"
      aria-haspopup="listbox"
      :aria-label="`Currency: ${currency.name}. Change currency`"
      class="flex items-center gap-1.5 px-3 h-11 rounded-full bg-slate-950/40 dark:bg-slate-900/60 backdrop-blur-md border border-white/20 dark:border-slate-800 shadow-md hover:bg-slate-950/60 dark:hover:bg-slate-800/70 transition-all duration-300 text-white cursor-pointer outline-none focus:ring-2 focus:ring-blue-500"
    >
      <span class="text-sm font-bold">{{ currency.symbol }}</span>
      <span class="hidden sm:inline text-xs font-bold text-blue-100 dark:text-slate-300">{{ currency.label }}</span>
      <ChevronDown class="w-3.5 h-3.5 text-blue-100 dark:text-slate-300 transition-transform duration-200" :class="{ 'rotate-180': isOpen }" aria-hidden="true" />
    </button>

    <transition name="fade">
      <ul
        v-if="isOpen"
        ref="listbox"
        role="listbox"
        aria-label="Select currency"
        :aria-activedescendant="activeId"
        tabindex="-1"
        @keydown="handleKeydown"
        class="absolute right-0 mt-2 z-50 w-56 max-h-80 overflow-y-auto rounded-2xl bg-slate-950/95 dark:bg-slate-900/95 backdrop-blur-xl border border-white/10 dark:border-slate-800 shadow-2xl py-1.5 outline-none"
      >
        <li
          v-for="(option, index) in CURRENCIES"
          :id="optionId(option.code)"
          :key="option.code"
          role="option"
          :aria-selected="option.code === currencyCode"
          @click="select(option.code)"
          @mousemove="activeIndex = index"
          class="flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors"
          :class="option.code === currencyCode
            ? 'bg-blue-600/30 text-white'
            : 'text-slate-300 hover:bg-white/10 hover:text-white'"
        >
          <span class="w-7 text-sm font-black shrink-0">{{ option.symbol }}</span>
          <span class="text-xs font-bold">{{ option.label }}</span>
          <span class="text-[11px] text-slate-400 ml-auto truncate">{{ option.name }}</span>
          <Check v-if="option.code === currencyCode" class="w-4 h-4 text-blue-300 shrink-0" aria-hidden="true" />
        </li>
      </ul>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue';
import { ChevronDown, Check } from 'lucide-vue-next';
import { CURRENCIES, useCurrency } from '~/composables/useCurrency';

const { currencyCode, currency, setCurrency, restore } = useCurrency();

const emit = defineEmits<{
  (e: 'change', code: string): void;
}>();

const isOpen = ref(false);
const container = ref<HTMLElement | null>(null);
const listbox = ref<HTMLElement | null>(null);
const trigger = ref<HTMLButtonElement | null>(null);
const activeIndex = ref(0);

const optionId = (code: string) => `currency-option-${code}`;

const activeId = computed(() => optionId(CURRENCIES[activeIndex.value]?.code ?? ''));

const close = (returnFocus = false) => {
  isOpen.value = false;
  if (returnFocus) trigger.value?.focus();
};

// Roving focus is driven with aria-activedescendant, so the listbox keeps DOM
// focus and the option that is "current" is announced by screen readers.
const handleKeydown = (event: KeyboardEvent) => {
  const last = CURRENCIES.length - 1;

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault();
      activeIndex.value = (activeIndex.value + 1) % CURRENCIES.length;
      scrollActiveIntoView();
      break;
    case 'ArrowUp':
      event.preventDefault();
      activeIndex.value = activeIndex.value === 0 ? last : activeIndex.value - 1;
      scrollActiveIntoView();
      break;
    case 'Home':
      event.preventDefault();
      activeIndex.value = 0;
      scrollActiveIntoView();
      break;
    case 'End':
      event.preventDefault();
      activeIndex.value = last;
      scrollActiveIntoView();
      break;
    case 'Enter':
    case ' ':
      event.preventDefault();
      select(CURRENCIES[activeIndex.value].code);
      break;
    case 'Escape':
      event.preventDefault();
      close(true);
      break;
    case 'Tab':
      // Tabbing away should dismiss the list rather than leave it orphaned.
      close();
      break;
  }
};

const scrollActiveIntoView = () => {
  nextTick(() => {
    listbox.value
      ?.querySelector(`#${CSS.escape(optionId(CURRENCIES[activeIndex.value].code))}`)
      ?.scrollIntoView({ block: 'nearest' });
  });
};

const open = () => {
  isOpen.value = true;
  // Start on the current selection rather than the top of the list.
  const selected = CURRENCIES.findIndex((c) => c.code === currencyCode.value);
  activeIndex.value = selected === -1 ? 0 : selected;
  nextTick(() => listbox.value?.focus());
};

// Applied after mount so the server and client render the same initial markup.
onMounted(() => {
  restore();
});

const select = (code: string) => {
  setCurrency(code);
  close(true);
  // Prices differ per currency, so tell the page to re-run the current search.
  emit('change', code);
};

const handleClickOutside = (event: MouseEvent) => {
  if (container.value && !container.value.contains(event.target as Node)) {
    isOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>