<template>
  <div ref="containerRef" class="flex-1 w-full relative">
    <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1" :for="inputId">
      {{ label }}
    </label>

    <div class="relative">
      <MapPin class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
      <input
        :id="inputId"
        ref="inputRef"
        v-model="query"
        type="text"
        role="combobox"
        autocomplete="off"
        :aria-expanded="isOpen"
        :aria-controls="listboxId"
        :aria-activedescendant="activeIndex >= 0 ? optionId(activeIndex) : undefined"
        aria-autocomplete="list"
        aria-haspopup="listbox"
        :placeholder="placeholder"
        class="w-full pl-10 pr-10 py-3 border rounded-xl bg-white dark:bg-slate-900/60 focus:ring-2 focus:ring-blue-500 transition-shadow outline-none dark:text-slate-100 font-medium"
        :class="[
          hasValue ? 'border-blue-400 dark:border-blue-500' : 'border-gray-300 dark:border-slate-700',
        ]"
        @input="handleInput"
        @focus="handleFocus"
        @keydown="handleKeydown"
      >
      <div class="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
        <slot name="trailing" />
        <button
          v-if="hasValue"
          type="button"
          class="text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
          aria-label="Clear location"
          @click="clearSelection"
        >
          <X class="w-4 h-4" />
        </button>
      </div>
    </div>

    <!-- Popup listbox. aria-live region is separate so the count is announced
         without focus ever leaving the input. -->
    <transition name="fade">
      <div
        v-if="isOpen"
        class="absolute z-50 left-0 right-0 mt-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl border border-gray-100 dark:border-slate-800 shadow-xl shadow-gray-200/50 dark:shadow-black/50 max-h-72 overflow-y-auto py-2"
      >
        <div v-if="isLoading" class="px-4 py-3 flex items-center gap-3 text-sm text-gray-500">
          <Loader2 class="w-4 h-4 animate-spin text-blue-500" />
          <span>Searching locations...</span>
        </div>

        <div v-else-if="suggestions.length === 0" class="px-4 py-3 text-sm text-gray-500">
          No locations found. Type to search.
        </div>

        <ul
          v-else
          :id="listboxId"
          role="listbox"
          :aria-label="`${label} suggestions`"
          class="divide-y divide-gray-50 dark:divide-slate-800/50"
        >
          <li
            v-for="(suggestion, index) in suggestions"
            :id="optionId(index)"
            :key="suggestion.id"
            role="option"
            :aria-selected="index === activeIndex"
            class="px-4 py-3 flex items-start gap-3 cursor-pointer transition-colors duration-150"
            :class="index === activeIndex
              ? 'bg-blue-50 dark:bg-blue-800/30 ring-2 ring-inset ring-blue-500'
              : 'hover:bg-gray-50 dark:hover:bg-slate-800'"
            @mousedown.prevent="select(suggestion)"
            @mouseenter="activeIndex = index"
          >
            <Plane v-if="suggestion.type === 'airport'" class="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
            <Building v-else class="w-5 h-5 text-gray-500 dark:text-slate-400 shrink-0 mt-0.5" />
            <div class="flex-grow min-w-0">
              <div class="font-semibold text-sm text-gray-900 dark:text-slate-100 truncate">
                {{ suggestion.name }}
                <span v-if="iataOf(suggestion)" class="text-blue-600 dark:text-blue-400 ml-1 font-bold">({{ iataOf(suggestion) }})</span>
              </div>
              <div class="text-xs text-gray-500 dark:text-slate-400 truncate mt-0.5">{{ suggestion.description }}</div>
            </div>
            <slot name="option" :suggestion="suggestion" />
          </li>
        </ul>
      </div>
    </transition>

    <span class="sr-only" role="status" aria-live="polite">{{ liveMessage }}</span>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue';
import { MapPin, Plane, Building, X, Loader2 } from 'lucide-vue-next';
import type { ComboboxSuggestion } from '~/types';

const props = withDefaults(defineProps<{
  /** Visible label text; also the combobox accessible name. */
  label: string;
  /** The selected location id (e.g. "SFO" or "/m/..."). */
  modelValue?: string;
  placeholder?: string;
  /** Suggestions shown when the field is focused but empty. */
  popularLocations?: ComboboxSuggestion[];
  /** Debounce delay before the remote lookup fires. */
  debounceMs?: number;
  /** Autocomplete endpoint. Hotels use a different route than flights. */
  endpoint?: string;
}>(), {
  modelValue: '',
  placeholder: 'City or airport',
  popularLocations: () => [],
  debounceMs: 300,
  endpoint: '/api/locations',
});

const emit = defineEmits<{
  (e: 'update:modelValue', id: string): void;
  (e: 'select', suggestion: ComboboxSuggestion): void;
}>();

let uid = 0;
const inputId = `location-combobox-input-${++uid}`;
const listboxId = `location-combobox-list-${++uid}`;

const inputRef = ref<HTMLInputElement | null>(null);
const containerRef = ref<HTMLElement | null>(null);

const query = ref('');
const suggestions = ref<ComboboxSuggestion[]>([]);
const isLoading = ref(false);
const isOpen = ref(false);
const activeIndex = ref(-1);
const liveMessage = ref('');

const hasValue = computed(() => Boolean(props.modelValue));
const optionId = (index: number) => `${listboxId}-option-${index}`;

// Flight suggestions carry an IATA code; hotel suggestions do not.
const iataOf = (suggestion: ComboboxSuggestion): string | undefined =>
  'iata' in suggestion ? (suggestion.iata ?? undefined) : undefined;

const labelFor = (suggestion: ComboboxSuggestion): string => {
  const iata = iataOf(suggestion);
  return iata ? `${suggestion.name} (${iata})` : suggestion.name;
};

let debounceTimer: ReturnType<typeof setTimeout> | null = null;
// Guards against a slow earlier request resolving after a newer one and
// overwriting fresher suggestions.
let requestSeq = 0;

const fetchSuggestions = async (term: string) => {
  const seq = ++requestSeq;
  isLoading.value = true;
  try {
    const response = await $fetch<{ success: boolean; data: ComboboxSuggestion[] }>(props.endpoint, {
      params: { q: term },
    });
    if (seq !== requestSeq) return;
    if (response?.success) {
      suggestions.value = response.data;
      announce(response.data.length);
    }
  } catch (err) {
    if (seq !== requestSeq) return;
    console.error('Location autocomplete failed:', err);
  } finally {
    if (seq === requestSeq) isLoading.value = false;
  }
};

let announceTimer: ReturnType<typeof setTimeout> | null = null;
const announce = (count: number) => {
  // Debounce so a fast typist is not flooded with announcements.
  if (announceTimer) clearTimeout(announceTimer);
  announceTimer = setTimeout(() => {
    liveMessage.value = count > 0
      ? `${count} location${count === 1 ? '' : 's'} available.`
      : 'No locations found.';
  }, 500);
};

const open = () => {
  isOpen.value = true;
  activeIndex.value = suggestions.value.length > 0 ? 0 : -1;
};

const handleInput = () => {
  isOpen.value = true;
  activeIndex.value = -1;

  if (debounceTimer) clearTimeout(debounceTimer);

  const term = query.value.trim();
  if (!term) {
    suggestions.value = props.popularLocations;
    isLoading.value = false;
    requestSeq++;
    return;
  }

  debounceTimer = setTimeout(() => fetchSuggestions(term), props.debounceMs);
};

const handleFocus = () => {
  open();
  if (!query.value.trim() && suggestions.value.length === 0) {
    suggestions.value = props.popularLocations;
    announce(suggestions.value.length);
  }
};

const handleKeydown = (event: KeyboardEvent) => {
  const count = suggestions.value.length;

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault();
      if (!isOpen.value && count > 0) open();
      if (count > 0) activeIndex.value = (activeIndex.value + 1) % count;
      break;
    case 'ArrowUp':
      event.preventDefault();
      if (count > 0) activeIndex.value = (activeIndex.value - 1 + count) % count;
      break;
    case 'Home':
      if (isOpen.value && count > 0) {
        event.preventDefault();
        activeIndex.value = 0;
      }
      break;
    case 'End':
      if (isOpen.value && count > 0) {
        event.preventDefault();
        activeIndex.value = count - 1;
      }
      break;
    case 'Enter':
      if (isOpen.value && activeIndex.value >= 0 && activeIndex.value < count) {
        // Only swallow Enter when a suggestion is highlighted; otherwise let the
        // surrounding form submit normally.
        event.preventDefault();
        select(suggestions.value[activeIndex.value]);
      }
      break;
    case 'Escape':
      if (isOpen.value) {
        event.preventDefault();
        isOpen.value = false;
        activeIndex.value = -1;
      }
      break;
    case 'Tab':
      isOpen.value = false;
      activeIndex.value = -1;
      break;
  }
};

const select = (suggestion: ComboboxSuggestion) => {
  query.value = labelFor(suggestion);
  isOpen.value = false;
  activeIndex.value = -1;
  emit('update:modelValue', suggestion.id);
  emit('select', suggestion);
  inputRef.value?.focus();
};

const clearSelection = () => {
  query.value = '';
  suggestions.value = props.popularLocations;
  isOpen.value = false;
  emit('update:modelValue', '');
  inputRef.value?.focus();
};

/** Show a resolved suggestion's label without re-emitting selection.
 *  Used by geolocation, which resolves an id outside the dropdown. */
const setDisplayText = (suggestion: ComboboxSuggestion) => {
  query.value = labelFor(suggestion);
};

defineExpose({ setDisplayText, focus: () => inputRef.value?.focus() });

// Mirror the parent's value into the text field whenever it changes externally
// (URL hydration, form reset, or the swap button).
watch(() => props.modelValue, (newId) => {
  if (!newId) {
    if (!query.value) return;
    query.value = '';
    return;
  }
  const current = suggestions.value.find(s => s.id === newId);
  if (current) {
    query.value = labelFor(current);
  } else if (!query.value) {
    query.value = newId;
  }
});

// Close when clicking outside the whole component.
const handleClickOutside = (event: MouseEvent) => {
  if (containerRef.value && !containerRef.value.contains(event.target as Node)) {
    isOpen.value = false;
    activeIndex.value = -1;
  }
};

if (typeof document !== 'undefined') {
  document.addEventListener('click', handleClickOutside);
}

onUnmounted(() => {
  if (typeof document !== 'undefined') {
    document.removeEventListener('click', handleClickOutside);
  }
  if (debounceTimer) clearTimeout(debounceTimer);
  if (announceTimer) clearTimeout(announceTimer);
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