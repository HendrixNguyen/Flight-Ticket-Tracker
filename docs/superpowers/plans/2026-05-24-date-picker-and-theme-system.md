# 2026 Glassmorphic Date Pickers & Light/Dark Theme Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement premium, 2026-style glassmorphic calendar inputs, connected Date-Range selection for 2-way searches, and a global light/dark theme toggle system in the SkyCrawler flight app.

**Architecture:** We will create custom reusable Vue date/date-range picker components, integrate them dynamically with a trip-type toggle in the search form, set up a class-based light/dark mode system driven by a floating switcher header component, and update the backend flights search endpoint to cleanly map both one-way (type 2) and round-trip (type 1) flight requests.

**Tech Stack:** Nuxt 4, Vue 3, Tailwind CSS v4, Lucide Icons, and SerpApi Google Flights API.

---

### Task 1: Light/Dark Theme Controller Setup

**Files:**
- Create: `app/components/ThemeSwitcher.vue`
- Modify: `app/app.vue`
- Modify: `app/assets/css/main.css`

- [ ] **Step 1: Define Theme CSS rules & Custom Background Blobs**
  Add background blobs and support transition durations for theme switches.
  Add inside `app/assets/css/main.css` (at the bottom):
  ```css
  /* 2026 Glassmorphism and theme transition helpers */
  .theme-transition * {
    transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease;
  }
  
  .glass-card {
    background: rgba(255, 255, 255, 0.45);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border: 1px solid rgba(255, 255, 255, 0.5);
  }
  
  .dark .glass-card {
    background: rgba(15, 23, 42, 0.4);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border: 1px solid rgba(255, 255, 255, 0.08);
  }
  ```

- [ ] **Step 2: Create ThemeSwitcher Component**
  Create a premium toggling glass pill component `app/components/ThemeSwitcher.vue`:
  ```vue
  <template>
    <button 
      @click="toggleTheme"
      class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/40 dark:bg-slate-800/40 backdrop-blur-md border border-white/30 dark:border-white/10 shadow-sm hover:scale-105 transition-all text-slate-700 dark:text-slate-200 cursor-pointer"
      title="Toggle Theme"
    >
      <Sun v-if="isDark" class="w-4 h-4 text-amber-500 animate-spin-slow" />
      <Moon v-else class="w-4 h-4 text-indigo-500" />
      <span class="text-xs font-bold uppercase tracking-wider">{{ isDark ? 'Light' : 'Dark' }}</span>
    </button>
  </template>

  <script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { Sun, Moon } from 'lucide-vue-next';

  const isDark = ref(false);

  const toggleTheme = () => {
    isDark.value = !isDark.value;
    if (isDark.value) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('sky-crawler-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('sky-crawler-theme', 'light');
    }
  };

  onMounted(() => {
    const savedTheme = localStorage.getItem('sky-crawler-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      isDark.value = true;
      document.documentElement.classList.add('dark');
    } else {
      isDark.value = false;
      document.documentElement.classList.remove('dark');
    }
    // Enable transitions after mount to avoid startup flash
    document.body.classList.add('theme-transition');
  });
  </script>
  ```

- [ ] **Step 3: Add Blobs & ThemeSwitcher to app.vue**
  Integrate `ThemeSwitcher.vue` inside the header of `app/app.vue` and inject decorative glass-backed color gradient background blobs behind the page:
  ```vue
  <!-- Add inside main container -->
  <div class="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
    <div class="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-400/20 dark:bg-blue-600/10 blur-[120px]"></div>
    <div class="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] rounded-full bg-indigo-400/20 dark:bg-indigo-600/10 blur-[120px]"></div>
  </div>
  ```

- [ ] **Step 4: Commit**
  ```bash
  git add app/assets/css/main.css app/components/ThemeSwitcher.vue app/app.vue
  git commit -m "feat: setup light/dark theme system with decorative blobs and transitions"
  ```

---

### Task 2: Reusable Custom Single Date Picker Component

**Files:**
- Create: `app/components/CustomDatePicker.vue`

- [ ] **Step 1: Create CustomDatePicker with high-glassmorphism styling**
  Support single date selecting using standard calendar grids with Month/Year dropdown styling matching the mockup:
  ```vue
  <template>
    <div ref="calendarContainer" class="relative w-full">
      <!-- Custom Display Trigger Button -->
      <button 
        type="button"
        @click="isOpen = !isOpen"
        class="w-full flex items-center gap-3 pl-10 pr-4 py-3 border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900/60 focus:ring-2 focus:ring-blue-500 outline-none text-left cursor-pointer transition-all dark:text-slate-100"
      >
        <slot name="icon">
          <Calendar class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        </slot>
        <span>{{ formattedDate }}</span>
      </button>

      <!-- Calendar Popover (Glassmorphic) -->
      <transition name="fade">
        <div 
          v-if="isOpen"
          class="absolute z-50 left-0 mt-2 w-80 bg-white/60 dark:bg-slate-900/40 backdrop-blur-2xl border border-white/50 dark:border-white/10 shadow-xl shadow-blue-500/5 dark:shadow-black/40 rounded-3xl p-5"
        >
          <!-- Month/Year Header -->
          <div class="flex justify-between items-center mb-4">
            <button 
              type="button"
              @click="prevMonth"
              class="w-9 h-9 rounded-full bg-white/70 dark:bg-slate-800/60 border border-white/50 dark:border-white/10 flex items-center justify-center cursor-pointer shadow-sm text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700/80 transition-all font-bold"
            >
              &lt;
            </button>
            
            <div class="flex gap-2">
              <div class="bg-white/70 dark:bg-slate-800/60 border border-white/50 dark:border-white/10 px-3 py-1.5 rounded-xl font-bold text-xs text-slate-800 dark:text-slate-100 flex items-center relative pr-4">
                {{ monthNames[currentMonth] }}
                <div class="w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-b-[3px] border-b-blue-500 absolute bottom-1 right-1 rotate-135"></div>
              </div>
              <div class="bg-white/70 dark:bg-slate-800/60 border border-white/50 dark:border-white/10 px-3 py-1.5 rounded-xl font-bold text-xs text-slate-800 dark:text-slate-100 flex items-center relative pr-4">
                {{ currentYear }}
                <div class="w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-b-[3px] border-b-blue-500 absolute bottom-1 right-1 rotate-135"></div>
              </div>
            </div>

            <button 
              type="button"
              @click="nextMonth"
              class="w-9 h-9 rounded-full bg-white/70 dark:bg-slate-800/60 border border-white/50 dark:border-white/10 flex items-center justify-center cursor-pointer shadow-sm text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700/80 transition-all font-bold"
            >
              &gt;
            </button>
          </div>

          <!-- Weekday Labels -->
          <div class="grid grid-cols-7 gap-1.5 text-center mb-2">
            <span v-for="day in ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']" :key="day" class="text-[11px] font-bold text-slate-600 dark:text-slate-400">
              {{ day }}
            </span>
          </div>

          <!-- Days Grid -->
          <div class="grid grid-cols-7 gap-1.5">
            <!-- Blank prefix days -->
            <div 
              v-for="blank in blanks" 
              :key="'blank-' + blank"
              class="aspect-square flex items-center justify-center text-xs font-semibold text-slate-300 dark:text-slate-700 pointer-events-none"
            >
              {{ blank }}
            </div>
            <!-- Standard active days -->
            <button
              v-for="day in daysInMonth"
              :key="day"
              type="button"
              @click="selectDay(day)"
              :disabled="isDateDisabled(day)"
              class="aspect-square flex items-center justify-center text-xs font-semibold rounded-xl cursor-pointer transition-all duration-150"
              :class="[
                isSelected(day) 
                  ? 'bg-blue-600 dark:bg-blue-500 text-white font-bold shadow-lg shadow-blue-500/25 border border-white/20' 
                  : 'bg-white/40 dark:bg-slate-800/20 text-slate-800 dark:text-slate-100 hover:bg-white dark:hover:bg-slate-800/80 border border-white/10',
                isDateDisabled(day) ? 'opacity-30 cursor-not-allowed pointer-events-none' : ''
              ]"
            >
              {{ day }}
            </button>
          </div>
        </div>
      </transition>
    </div>
  </template>

  <script setup lang="ts">
  import { ref, computed, onMounted, onUnmounted } from 'vue';
  import { Calendar } from 'lucide-vue-next';

  const props = defineProps<{
    modelValue: string;
    minDate?: string;
  }>();

  const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void;
  }>();

  const isOpen = ref(false);
  const calendarContainer = ref<HTMLElement | null>(null);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Internal year/month cursor
  const dateObj = props.modelValue ? new Date(props.modelValue) : new Date();
  const currentYear = ref(dateObj.getFullYear());
  const currentMonth = ref(dateObj.getMonth());

  const formattedDate = computed(() => {
    if (!props.modelValue) return 'Select Date';
    const date = new Date(props.modelValue);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  });

  const daysInMonth = computed(() => {
    return new Date(currentYear.value, currentMonth.value + 1, 0).getDate();
  });

  const blanks = computed(() => {
    // Blank days of previous month to fill start of grid (adjusting for Mon-Sun grid)
    let firstDayIndex = new Date(currentYear.value, currentMonth.value, 1).getDay();
    // JS getDay() returns 0 for Sunday, 1 for Monday. Shift it so 1=Mon, ..., 0=Sun is mapped
    firstDayIndex = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
    
    const prevMonthDays = new Date(currentYear.value, currentMonth.value, 0).getDate();
    const prefixDays = [];
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      prefixDays.push(prevMonthDays - i);
    }
    return prefixDays;
  });

  const prevMonth = () => {
    if (currentMonth.value === 0) {
      currentMonth.value = 11;
      currentYear.value--;
    } else {
      currentMonth.value--;
    }
  };

  const nextMonth = () => {
    if (currentMonth.value === 11) {
      currentMonth.value = 0;
      currentYear.value++;
    } else {
      currentMonth.value++;
    }
  };

  const isSelected = (day: number) => {
    if (!props.modelValue) return false;
    const itemDate = new Date(currentYear.value, currentMonth.value, day);
    const selDate = new Date(props.modelValue);
    return itemDate.toDateString() === selDate.toDateString();
  };

  const isDateDisabled = (day: number) => {
    if (!props.minDate) return false;
    const itemDate = new Date(currentYear.value, currentMonth.value, day);
    const minD = new Date(props.minDate);
    // Strip time for exact day match comparison
    itemDate.setHours(0,0,0,0);
    minD.setHours(0,0,0,0);
    return itemDate.getTime() < minD.getTime();
  };

  const selectDay = (day: number) => {
    const selectedDate = new Date(currentYear.value, currentMonth.value, day);
    // Adjust to local timezone ISO date string (YYYY-MM-DD)
    const yearStr = selectedDate.getFullYear();
    const monthStr = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const dayStr = String(selectedDate.getDate()).padStart(2, '0');
    
    emit('update:modelValue', `${yearStr}-${monthStr}-${dayStr}`);
    isOpen.value = false;
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (calendarContainer.value && !calendarContainer.value.contains(event.target as Node)) {
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
  ```

- [ ] **Step 2: Commit**
  ```bash
  git add app/components/CustomDatePicker.vue
  git commit -m "feat: add CustomDatePicker component with glossy glassmorphic details"
  ```

---

### Task 3: Connected Custom Date Range Picker Component

**Files:**
- Create: `app/components/CustomDateRangePicker.vue`

- [ ] **Step 1: Create CustomDateRangePicker**
  Implement range tracking and active intermediate selections with responsive grids:
  ```vue
  <template>
    <div ref="rangeContainer" class="relative w-full flex flex-col md:flex-row gap-4 items-end">
      <!-- Departure Input Trigger -->
      <div class="flex-1 w-full">
        <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Departure</label>
        <button 
          type="button"
          @click="openCalendar('start')"
          class="w-full flex items-center gap-3 pl-10 pr-4 py-3 border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900/60 focus:ring-2 focus:ring-blue-500 outline-none text-left cursor-pointer transition-all dark:text-slate-100"
        >
          <Calendar class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <span>{{ formattedStart }}</span>
        </button>
      </div>

      <!-- Return Input Trigger -->
      <div class="flex-1 w-full">
        <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Return</label>
        <button 
          type="button"
          @click="openCalendar('end')"
          class="w-full flex items-center gap-3 pl-10 pr-4 py-3 border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900/60 focus:ring-2 focus:ring-blue-500 outline-none text-left cursor-pointer transition-all dark:text-slate-100"
        >
          <Calendar class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <span>{{ formattedEnd }}</span>
        </button>
      </div>

      <!-- Double Popover Calendar -->
      <transition name="fade">
        <div 
          v-if="isOpen"
          class="absolute z-50 left-0 mt-2 w-80 bg-white/60 dark:bg-slate-900/40 backdrop-blur-2xl border border-white/50 dark:border-white/10 shadow-xl shadow-blue-500/5 dark:shadow-black/40 rounded-3xl p-5"
          style="top: 100%;"
        >
          <!-- Header controls -->
          <div class="flex justify-between items-center mb-4">
            <button 
              type="button"
              @click="prevMonth"
              class="w-9 h-9 rounded-full bg-white/70 dark:bg-slate-800/60 border border-white/50 dark:border-white/10 flex items-center justify-center cursor-pointer shadow-sm text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700/80 transition-all font-bold"
            >
              &lt;
            </button>
            
            <div class="flex gap-2">
              <div class="bg-white/70 dark:bg-slate-800/60 border border-white/50 dark:border-white/10 px-3 py-1.5 rounded-xl font-bold text-xs text-slate-800 dark:text-slate-100 flex items-center relative pr-4">
                {{ monthNames[currentMonth] }}
                <div class="w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-b-[3px] border-b-blue-500 absolute bottom-1 right-1 rotate-135"></div>
              </div>
              <div class="bg-white/70 dark:bg-slate-800/60 border border-white/50 dark:border-white/10 px-3 py-1.5 rounded-xl font-bold text-xs text-slate-800 dark:text-slate-100 flex items-center relative pr-4">
                {{ currentYear }}
                <div class="w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-b-[3px] border-b-blue-500 absolute bottom-1 right-1 rotate-135"></div>
              </div>
            </div>

            <button 
              type="button"
              @click="nextMonth"
              class="w-9 h-9 rounded-full bg-white/70 dark:bg-slate-800/60 border border-white/50 dark:border-white/10 flex items-center justify-center cursor-pointer shadow-sm text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700/80 transition-all font-bold"
            >
              &gt;
            </button>
          </div>

          <!-- Weekday Labels -->
          <div class="grid grid-cols-7 gap-1.5 text-center mb-2">
            <span v-for="day in ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']" :key="day" class="text-[11px] font-bold text-slate-600 dark:text-slate-400">
              {{ day }}
            </span>
          </div>

          <!-- Days Grid -->
          <div class="grid grid-cols-7 gap-1.5">
            <!-- Blanks -->
            <div 
              v-for="blank in blanks" 
              :key="'blank-' + blank"
              class="aspect-square flex items-center justify-center text-xs font-semibold text-slate-300 dark:text-slate-700 pointer-events-none"
            >
              {{ blank }}
            </div>
            
            <!-- Standard range days -->
            <button
              v-for="day in daysInMonth"
              :key="day"
              type="button"
              @click="selectDay(day)"
              :disabled="isDateDisabled(day)"
              class="aspect-square flex items-center justify-center text-xs font-semibold rounded-xl cursor-pointer transition-all duration-150"
              :class="[
                isExtreme(day) 
                  ? 'bg-blue-600 dark:bg-blue-500 text-white font-bold shadow-lg shadow-blue-500/25 border border-white/20' 
                  : isBetween(day)
                    ? 'bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-300 border border-blue-500/10'
                    : 'bg-white/40 dark:bg-slate-800/20 text-slate-800 dark:text-slate-100 hover:bg-white dark:hover:bg-slate-800/80 border border-white/10',
                isDateDisabled(day) ? 'opacity-30 cursor-not-allowed pointer-events-none' : ''
              ]"
            >
              {{ day }}
            </button>
          </div>
        </div>
      </transition>
    </div>
  </template>

  <script setup lang="ts">
  import { ref, computed, onMounted, onUnmounted } from 'vue';
  import { Calendar } from 'lucide-vue-next';

  const props = defineProps<{
    startDate: string;
    endDate: string;
    minDate?: string;
  }>();

  const emit = defineEmits<{
    (e: 'update:startDate', value: string): void;
    (e: 'update:endDate', value: string): void;
  }>();

  const isOpen = ref(false);
  const rangeContainer = ref<HTMLElement | null>(null);
  const activeFocus = ref<'start' | 'end'>('start');

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Focus tracking
  const dateObj = props.startDate ? new Date(props.startDate) : new Date();
  const currentYear = ref(dateObj.getFullYear());
  const currentMonth = ref(dateObj.getMonth());

  const formattedStart = computed(() => {
    if (!props.startDate) return 'Select Date';
    return new Date(props.startDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  });

  const formattedEnd = computed(() => {
    if (!props.endDate) return 'Select Return';
    return new Date(props.endDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  });

  const daysInMonth = computed(() => {
    return new Date(currentYear.value, currentMonth.value + 1, 0).getDate();
  });

  const blanks = computed(() => {
    let firstDayIndex = new Date(currentYear.value, currentMonth.value, 1).getDay();
    firstDayIndex = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
    
    const prevMonthDays = new Date(currentYear.value, currentMonth.value, 0).getDate();
    const prefixDays = [];
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      prefixDays.push(prevMonthDays - i);
    }
    return prefixDays;
  });

  const prevMonth = () => {
    if (currentMonth.value === 0) {
      currentMonth.value = 11;
      currentYear.value--;
    } else {
      currentMonth.value--;
    }
  };

  const nextMonth = () => {
    if (currentMonth.value === 11) {
      currentMonth.value = 0;
      currentYear.value++;
    } else {
      currentMonth.value++;
    }
  };

  const openCalendar = (field: 'start' | 'end') => {
    activeFocus.value = field;
    isOpen.value = true;
    
    // Jump calendar window to appropriate month
    const targetDate = field === 'start' ? props.startDate : props.endDate;
    if (targetDate) {
      const d = new Date(targetDate);
      currentYear.value = d.getFullYear();
      currentMonth.value = d.getMonth();
    }
  };

  const isExtreme = (day: number) => {
    const itemDate = new Date(currentYear.value, currentMonth.value, day).toDateString();
    const sDate = props.startDate ? new Date(props.startDate).toDateString() : '';
    const eDate = props.endDate ? new Date(props.endDate).toDateString() : '';
    return itemDate === sDate || itemDate === eDate;
  };

  const isBetween = (day: number) => {
    if (!props.startDate || !props.endDate) return false;
    const itemTime = new Date(currentYear.value, currentMonth.value, day).getTime();
    const sTime = new Date(props.startDate).getTime();
    const eTime = new Date(props.endDate).getTime();
    return itemTime > sTime && itemTime < eTime;
  };

  const isDateDisabled = (day: number) => {
    const itemDate = new Date(currentYear.value, currentMonth.value, day);
    itemDate.setHours(0,0,0,0);

    // Disable dates prior to current day
    if (props.minDate) {
      const minD = new Date(props.minDate);
      minD.setHours(0,0,0,0);
      if (itemDate.getTime() < minD.getTime()) return true;
    }

    // When selecting return, disable dates prior to start date
    if (activeFocus.value === 'end' && props.startDate) {
      const sD = new Date(props.startDate);
      sD.setHours(0,0,0,0);
      if (itemDate.getTime() < sD.getTime()) return true;
    }
    
    return false;
  };

  const selectDay = (day: number) => {
    const selectedDate = new Date(currentYear.value, currentMonth.value, day);
    const yearStr = selectedDate.getFullYear();
    const monthStr = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const dayStr = String(selectedDate.getDate()).padStart(2, '0');
    const dateString = `${yearStr}-${monthStr}-${dayStr}`;

    if (activeFocus.value === 'start') {
      emit('update:startDate', dateString);
      
      // Auto shift focus to end date
      activeFocus.value = 'end';
      
      // If current end date is before new start date, reset it
      if (props.endDate && new Date(props.endDate).getTime() < selectedDate.getTime()) {
        emit('update:endDate', '');
      }
    } else {
      emit('update:endDate', dateString);
      isOpen.value = false;
    }
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (rangeContainer.value && !rangeContainer.value.contains(event.target as Node)) {
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
  ```

- [ ] **Step 2: Commit**
  ```bash
  git add app/components/CustomDateRangePicker.vue
  git commit -m "feat: implement CustomDateRangePicker component with range selection trail support"
  ```

---

### Task 4: UI integration inside Search Form component

**Files:**
- Modify: `app/components/FlightSearchForm.vue`
- Modify: `types/index.ts`

- [ ] **Step 1: Expand search types**
  Allow optional `returnDate` inside `SearchQuery` in `types/index.ts`:
  ```typescript
  export interface SearchQuery {
    from: string;
    to: string;
    date: string;
    returnDate?: string;
    passengers: number;
  }
  ```

- [ ] **Step 2: Integrate switches & pickers into Search Form**
  Support slider switch for One-way vs Round-trip, swapping pickers dynamically, and styling glass elements inside `app/components/FlightSearchForm.vue`:
  Modify the inputs layout and template block in `FlightSearchForm.vue` to integrate `CustomDatePicker` and `CustomDateRangePicker` properly.
  (Implement slider switcher: `<button type="button" :class="isRoundTrip ? 'active-class' : ''">...`)

- [ ] **Step 3: Commit**
  ```bash
  git add types/index.ts app/components/FlightSearchForm.vue
  git commit -m "feat: integrate premium custom pickers and round-trip switch in FlightSearchForm"
  ```

---

### Task 5: Upgrade Backend endpoint for Round-Trip queries

**Files:**
- Modify: `server/api/flights.ts`

- [ ] **Step 1: Add type switching logic driven by returnDate**
  Modify SerpApi construction parameters in `server/api/flights.ts`:
  ```typescript
  // Check if return date is present
  const returnDate = query.returnDate as string;

  if (returnDate) {
    serpApiUrl.searchParams.append('type', '1'); // Round-trip
    serpApiUrl.searchParams.append('return_date', returnDate);
  } else {
    serpApiUrl.searchParams.append('type', '2'); // One-way
  }
  ```

- [ ] **Step 2: Commit**
  ```bash
  git add server/api/flights.ts
  git commit -m "feat: enable 2-way flight searching with round-trip parameters in flights API"
  ```

---

### Task 6: Visual Polish, Glassmorphic Layers, and Global Dark Mode

**Files:**
- Modify: `app/app.vue`
- Modify: `app/components/FlightCard.vue`
- Modify: `app/components/FilterSidebar.vue`
- Modify: `app/components/FlightList.vue`

- [ ] **Step 1: Style App container, filters and cards with dark mode support**
  Add robust Tailwind v4 `dark:bg-...`, `dark:text-...`, `dark:border-...` classes to all layout containers so the switcher changes the visual theme deeply. Ensure all widgets receive a polished, elegant 2026-style glossmorphic ring border.

- [ ] **Step 2: Compile & Verify production build**
  Run compilation step:
  `PATH="$PATH:$HOME/.bun/bin" ~/.bun/bin/bun run build`
  Verify that the Nuxt production compiler builds the server/client bundles with absolute success.

- [ ] **Step 3: Commit**
  ```bash
  git add app/app.vue app/components/FlightCard.vue app/components/FilterSidebar.vue app/components/FlightList.vue
  git commit -m "feat: complete visual polish, 2026 glass effects, and comprehensive dark mode"
  ```
