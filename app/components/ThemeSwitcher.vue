<template>
  <div 
    ref="dropdownContainer" 
    class="relative inline-block"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <!-- Sleek Trigger Button (Only the active icon) -->
    <button 
      @click.stop="toggleDropdown"
      type="button"
      class="trigger glass glass-hover glass-grain w-11 h-11 rounded-full text-slate-700 dark:text-slate-100 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:focus-visible:outline-blue-300 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer flex items-center justify-center"
      :aria-label="`Theme: ${activeLabel}. Change theme`"
      :aria-expanded="isDropdownOpen"
      aria-haspopup="true"
      title="Theme Settings"
    >
      <Sun v-if="themeMode === 'light'" class="w-4 h-4 text-orange-600 dark:text-orange-400 animate-pulse motion-reduce:animate-none" />
      <Moon v-else-if="themeMode === 'dark'" class="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
      <Laptop v-else class="w-4 h-4 text-slate-600 dark:text-slate-400" />
    </button>

    <!-- Floating Glassmorphic Dropdown Box -->
    <transition name="fade">
      <!-- Transparent padding bridge wrapper to prevent mouseleave gap closures -->
      <div 
        v-if="isDropdownOpen"
        class="absolute right-0 pt-2 z-50 outline-none w-44"
        @mouseenter="handleMouseEnter"
        @mouseleave="handleMouseLeave"
      >
        <div class="glass-elevated glass-grain rounded-glass p-3 flex flex-col items-center gap-2 outline-none select-none">
          <!-- Horizontal Row of Icons -->
          <div class="flex items-center justify-between w-full gap-1">
            <button 
              v-for="option in THEME_OPTIONS" 
              :key="option.id"
              @click.stop="selectTheme(option.id)"
              @mouseenter="hoveredOption = option.id"
              @mouseleave="hoveredOption = null"
              type="button"
              class="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:focus-visible:ring-blue-300"
              :aria-label="`${option.name} theme`"
              :aria-pressed="themeMode === option.id"
              :class="[themeMode === option.id ? 'bg-blue-600/15 border border-blue-500/50' : 'border border-transparent hover:bg-slate-900/5 dark:hover:bg-white/10']"
            >
              <component 
                :is="option.icon" 
                class="w-4 h-4 shrink-0 transition-colors duration-150 pointer-events-none" 
                :class="[themeMode === option.id ? option.colorClass : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100']" 
              />
            </button>
          </div>
          
          <!-- Text Label (Shows hovered option name, or active theme name) -->
          <div class="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 h-4 flex items-center justify-center mt-0.5 select-none leading-none">
            {{ activeLabel }}
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { Sun, Moon, Laptop } from 'lucide-vue-next';

type ThemeMode = 'light' | 'dark' | 'device';

// Icon tints are split by theme rather than carrying a single colour: the old
// values were tuned to glow against an opaque dark header, and on light glass an
// orange-500 sun is barely visible.
const THEME_OPTIONS = [
  { id: 'device' as const, name: 'Device', icon: Laptop, colorClass: 'text-slate-600 dark:text-slate-400' },
  { id: 'light' as const, name: 'Light', icon: Sun, colorClass: 'text-orange-600 dark:text-orange-400' },
  { id: 'dark' as const, name: 'Dark', icon: Moon, colorClass: 'text-indigo-600 dark:text-indigo-400' }
];

const themeMode = ref<ThemeMode>('device');
const hoveredOption = ref<ThemeMode | null>(null);
const dropdownContainer = ref<HTMLElement | null>(null);

// Dual-state tracking
const isHovered = ref(false);
const isClicked = ref(false);

const isDropdownOpen = computed(() => isHovered.value || isClicked.value);

let systemMediaQuery: MediaQueryList | null = null;
let hoverTimeout: any = null;

// Reactive text label showing hovered theme name or current theme fallback
const activeLabel = computed(() => {
  const activeId = hoveredOption.value || themeMode.value;
  return THEME_OPTIONS.find((o) => o.id === activeId)?.name || '';
});

// Single source of truth for the resolved scheme. The `.dark` class alone is not
// enough: main.css declares `color-scheme` for both `:root` and `.dark`, but the
// inline head script also writes `documentElement.style.colorScheme` before first
// paint. An inline style outranks every stylesheet rule, so without updating it
// here the document would keep reporting the boot-time scheme to the UA -- native
// scrollbars, form controls, the caret and the ~50 `light-dark()` colours in the
// app would all resolve against a stale value after a runtime or OS theme change.
const resolveScheme = () => {
  const dark = document.documentElement.classList.contains('dark');
  document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
};

// Reacts to system scheme adjustments automatically
const handleSystemThemeChange = (event: MediaQueryListEvent | MediaQueryList) => {
  if (themeMode.value === 'device') {
    if (event.matches) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    resolveScheme();
  }
};

// Applies active configuration and stores preference
const applyTheme = (mode: ThemeMode) => {
  themeMode.value = mode;
  localStorage.setItem('sky-crawler-theme', mode);

  if (mode === 'light') {
    document.documentElement.classList.remove('dark');
  } else if (mode === 'dark') {
    document.documentElement.classList.add('dark');
  } else if (mode === 'device') {
    if (systemMediaQuery) {
      handleSystemThemeChange(systemMediaQuery);
      return;
    }
  }
  resolveScheme();
};

// Selection triggers
const selectTheme = (mode: ThemeMode) => {
  applyTheme(mode);
  isClicked.value = false;
  isHovered.value = false;
};

const toggleDropdown = () => {
  isClicked.value = !isClicked.value;
};

// Hover triggers with clear-timeout cancellation
const handleMouseEnter = () => {
  if (hoverTimeout) clearTimeout(hoverTimeout);
  isHovered.value = true;
};

const handleMouseLeave = () => {
  if (hoverTimeout) clearTimeout(hoverTimeout);
  hoverTimeout = setTimeout(() => {
    isHovered.value = false;
  }, 350); // 350ms delay for solid bridge-transition mapping
};

// Click outside triggers
const handleClickOutside = (event: MouseEvent) => {
  if (dropdownContainer.value && !dropdownContainer.value.contains(event.target as Node)) {
    isClicked.value = false;
    isHovered.value = false;
  }
};

onMounted(() => {
  // Capture document events for clicking outside
  document.addEventListener('click', handleClickOutside);

  // Setup preference listeners
  systemMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  systemMediaQuery.addEventListener('change', handleSystemThemeChange);

  // Apply default preferences
  const savedTheme = localStorage.getItem('sky-crawler-theme') as ThemeMode | null;
  if (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'device') {
    applyTheme(savedTheme);
  } else {
    applyTheme('device');
  }

  // Inject smooth body transition classes
  document.body.classList.add('theme-transition');
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
  if (systemMediaQuery) {
    systemMediaQuery.removeEventListener('change', handleSystemThemeChange);
  }
  if (hoverTimeout) clearTimeout(hoverTimeout);
});
</script>

<style scoped>
/* The trigger is a `.glass` element, so its focus ring has to be an `outline`
   rather than a `ring-*` utility: Tailwind composes rings and shadows into one
   `box-shadow`, and `.glass` already fills that slot with the pane's own shadow
   stack, so a ring would be added to it instead of replacing it and never read as
   a focus indicator. The hover fill is a rule for the opposite reason -- as a
   utility it would win and replace the material with a flat wash. */
.glass-hover:hover {
  background-color: color-mix(in oklab, var(--color-glass-bg-subtle) 45%, white);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

@media (prefers-reduced-motion: reduce) {
  .trigger,
  .glass-hover,
  .fade-enter-active,
  .fade-leave-active {
    transition-duration: 0.01ms;
  }
}
</style>
