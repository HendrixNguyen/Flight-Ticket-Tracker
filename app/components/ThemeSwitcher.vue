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
      class="w-11 h-11 rounded-full bg-slate-950/60 dark:bg-slate-900/60 backdrop-blur-md border border-slate-800 dark:border-slate-800 shadow-md hover:scale-105 active:scale-95 transition-all duration-300 text-white cursor-pointer flex items-center justify-center outline-none focus:ring-1 focus:ring-blue-500/50"
      title="Theme Settings"
    >
      <Sun v-if="themeMode === 'light'" class="w-4 h-4 text-orange-500 drop-shadow-[0_0_8px_rgba(249,115,22,0.65)] animate-pulse" />
      <Moon v-else-if="themeMode === 'dark'" class="w-4 h-4 text-indigo-400 drop-shadow-[0_0_8px_rgba(129,140,248,0.65)]" />
      <Laptop v-else class="w-4 h-4 text-slate-400 drop-shadow-[0_0_6px_rgba(148,163,184,0.45)]" />
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
        <div class="bg-slate-950/90 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-800 dark:border-slate-800/80 rounded-2xl shadow-xl p-3 flex flex-col items-center gap-2 outline-none select-none">
          <!-- Horizontal Row of Icons -->
          <div class="flex items-center justify-between w-full gap-1">
            <button 
              v-for="option in THEME_OPTIONS" 
              :key="option.id"
              @click.stop="selectTheme(option.id)"
              @mouseenter="hoveredOption = option.id"
              @mouseleave="hoveredOption = null"
              type="button"
              class="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer outline-none"
              :class="[themeMode === option.id ? 'bg-slate-800/50 border border-slate-700/50' : 'hover:bg-slate-800/30']"
            >
              <component 
                :is="option.icon" 
                class="w-4 h-4 shrink-0 transition-colors duration-150 pointer-events-none" 
                :class="[themeMode === option.id ? option.colorClass : 'text-slate-500 hover:text-slate-300']" 
              />
            </button>
          </div>
          
          <!-- Text Label (Shows hovered option name, or active theme name) -->
          <div class="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 h-4 flex items-center justify-center mt-0.5 select-none leading-none">
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

const THEME_OPTIONS = [
  { id: 'device' as const, name: 'Device', icon: Laptop, colorClass: 'text-slate-400 drop-shadow-[0_0_6px_rgba(148,163,184,0.45)]' },
  { id: 'light' as const, name: 'Light', icon: Sun, colorClass: 'text-orange-500 drop-shadow-[0_0_8px_rgba(249,115,22,0.65)]' },
  { id: 'dark' as const, name: 'Dark', icon: Moon, colorClass: 'text-indigo-400 drop-shadow-[0_0_8px_rgba(129,140,248,0.65)]' }
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

// Reacts to system scheme adjustments automatically
const handleSystemThemeChange = (event: MediaQueryListEvent | MediaQueryList) => {
  if (themeMode.value === 'device') {
    if (event.matches) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
};

// Applies active configuration and stores preference
const applyTheme = (mode: ThemeMode) => {
  console.log('[ThemeSwitcher] Applying theme mode:', mode);
  themeMode.value = mode;
  localStorage.setItem('sky-crawler-theme', mode);
  
  if (mode === 'light') {
    document.documentElement.classList.remove('dark');
    console.log('[ThemeSwitcher] Class List after removal:', document.documentElement.classList.toString());
  } else if (mode === 'dark') {
    document.documentElement.classList.add('dark');
    console.log('[ThemeSwitcher] Class List after addition:', document.documentElement.classList.toString());
  } else if (mode === 'device') {
    if (systemMediaQuery) {
      handleSystemThemeChange(systemMediaQuery);
      console.log('[ThemeSwitcher] Class List after system sync:', document.documentElement.classList.toString());
    }
  }
};

// Selection triggers
const selectTheme = (mode: ThemeMode) => {
  console.log('[ThemeSwitcher] Theme clicked:', mode);
  applyTheme(mode);
  isClicked.value = false;
  isHovered.value = false;
};

const toggleDropdown = () => {
  isClicked.value = !isClicked.value;
  console.log('[ThemeSwitcher] Dropdown toggled click state:', isClicked.value);
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
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
