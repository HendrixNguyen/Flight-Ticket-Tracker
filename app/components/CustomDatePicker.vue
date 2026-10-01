<template>
  <div ref="calendarContainer" class="relative w-full">
    <!-- Custom Display Trigger Button. The Calendar icon stays inside the
         button: as an absolute sibling it would centre against the
         label+button wrapper and sit too low. -->
    <button 
      type="button"
      @click="isOpen = !isOpen"
      class="glass-card w-full flex items-center gap-3 pl-10 pr-4 py-3 rounded-xl text-left cursor-pointer text-slate-900 dark:text-slate-100 font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:focus-visible:outline-blue-300"
    >
      <slot name="icon">
        <Calendar class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 dark:text-slate-400 w-5 h-5" />
      </slot>
      <span :class="modelValue ? '' : 'text-slate-600 dark:text-slate-400'">{{ formattedDate }}</span>
    </button>

    <!-- Calendar Popover -->
    <transition name="fade">
      <div 
        v-if="isOpen"
        class="calendar-popover glass-elevated absolute z-50 left-0 mt-2 w-80 rounded-3xl p-5"
      >
        <!-- Month/Year Header -->
        <div class="flex justify-between items-center mb-4">
          <button 
            type="button"
            @click="prevMonth"
            aria-label="Previous month"
            class="nav-button glass w-9 h-9 rounded-full flex items-center justify-center cursor-pointer text-slate-700 dark:text-slate-200 font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:focus-visible:outline-blue-300"
          >
            &lt;
          </button>
          
          <div class="flex gap-2">
            <div class="glass rounded-xl px-3 py-1.5 font-bold text-xs text-slate-800 dark:text-slate-100 flex items-center relative pr-4">
              {{ monthNames[currentMonth] }}
              <div class="w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-b-[3px] border-b-blue-500 dark:border-b-blue-300 absolute bottom-1.5 right-1.5 rotate-135"></div>
            </div>
            <div class="glass rounded-xl px-3 py-1.5 font-bold text-xs text-slate-800 dark:text-slate-100 flex items-center relative pr-4">
              {{ currentYear }}
              <div class="w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-b-[3px] border-b-blue-500 dark:border-b-blue-300 absolute bottom-1.5 right-1.5 rotate-135"></div>
            </div>
          </div>

          <button 
            type="button"
            @click="nextMonth"
            aria-label="Next month"
            class="nav-button glass w-9 h-9 rounded-full flex items-center justify-center cursor-pointer text-slate-700 dark:text-slate-200 font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:focus-visible:outline-blue-300"
          >
            &gt;
          </button>
        </div>

        <!-- Weekday Labels -->
        <div class="grid grid-cols-7 gap-1.5 text-center mb-2">
          <span v-for="day in ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']" :key="day" class="text-[11px] font-bold text-slate-600 dark:text-slate-300">
            {{ day }}
          </span>
        </div>

        <!-- Days Grid -->
        <div class="grid grid-cols-7 gap-1.5">
          <!-- Blank prefix days. These only pad the grid to line the 1st up with
               its weekday, so they are deliberately near-invisible rather than
               competing with the selectable days. -->
          <div 
            v-for="blank in blanks" 
            :key="'blank-' + blank"
            class="aspect-square flex items-center justify-center text-xs font-semibold text-slate-400/50 dark:text-slate-600/50 pointer-events-none select-none"
            aria-hidden="true"
          >
            {{ blank }}
          </div>
          <!-- Standard active days. Default cells carry no fill or border at
               all -- the grid gap is the structure, which is what keeps the
               month reading airy. Selection is the only cell that gets a
               surface, so the three states stay unambiguous. -->
          <button
            v-for="day in daysInMonth"
            :key="day"
            type="button"
            @click="selectDay(day)"
            :disabled="isDateDisabled(day)"
            class="day-cell aspect-square flex items-center justify-center text-xs font-semibold rounded-xl cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-blue-600 dark:focus-visible:outline-blue-300"
            :class="[
              isSelected(day) 
                ? 'is-selected bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold shadow-md shadow-blue-500/30' 
                : 'text-slate-800 dark:text-slate-100 hover:bg-white/70 dark:hover:bg-white/10',
              isDateDisabled(day) ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''
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
  (e: 'change', value: string): void;
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
  
  const value = `${yearStr}-${monthStr}-${dayStr}`;
  emit('update:modelValue', value);
  emit('change', value);
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

<style scoped>
/* The calendar popover's `absolute` is a plain utility and now wins outright,
   since the glass primitives sit in `@layer components`. No positioning rule is
   needed here. */

/* Hover fills on a glass chip stay a colour-mix over the glass token rather than
   a `hover:bg-*` utility: the utility would win and replace the material with a
   flat wash. Because it mixes from the token rather than a baked colour, it
   follows the light/dark token swap for free. */
.nav-button:hover {
  background-color: color-mix(in oklab, var(--color-glass-bg-subtle), white 18%);
}

.day-cell {
  transition:
    background-color 0.15s ease,
    color 0.15s ease,
    box-shadow 0.15s ease;
}

/* The selected day is a gradient fill, so a plain `hover:bg-*` would flatten
   it to a flat tint mid-hover. Restate the gradient at a stronger weight on
   hover so it keeps its depth instead of losing it. */
.day-cell.is-selected:hover {
  background-image: linear-gradient(
    to bottom right,
    var(--color-blue-400),
    var(--color-indigo-500)
  );
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

@media (prefers-reduced-motion: reduce) {
  .fade-enter-active,
  .fade-leave-active,
  .day-cell {
    transition-duration: 0.01ms;
  }
}
</style>
