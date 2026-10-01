<template>
  <div ref="rangeContainer" class="relative w-full flex flex-col md:flex-row gap-4 items-end">
    <!-- Departure Input Trigger -->
    <div class="flex-1 w-full relative">
      <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1" for="departure-btn">Departure</label>
      <button
        id="departure-btn"
        type="button"
        @click="openCalendar('start')"
        class="glass-card w-full flex items-center gap-3 pl-10 pr-4 py-3 rounded-xl text-left cursor-pointer text-slate-900 dark:text-slate-100 font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:focus-visible:outline-blue-300"
      >
        <!-- Icon must sit inside the button: as an absolute sibling it would
             centre against the label+button wrapper and sit too low. -->
        <Calendar class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 dark:text-slate-400 w-5 h-5 pointer-events-none" />
        <span :class="startDate ? '' : 'text-slate-600 dark:text-slate-400'">{{ formattedStart }}</span>
      </button>
    </div>

    <!-- Return Input Trigger -->
    <div class="flex-1 w-full relative">
      <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1" for="return-btn">Return</label>
      <button
        id="return-btn"
        type="button"
        @click="openCalendar('end')"
        class="glass-card w-full flex items-center gap-3 pl-10 pr-4 py-3 rounded-xl text-left cursor-pointer text-slate-900 dark:text-slate-100 font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:focus-visible:outline-blue-300"
      >
        <Calendar class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 dark:text-slate-400 w-5 h-5 pointer-events-none" />
        <span :class="endDate ? '' : 'text-slate-600 dark:text-slate-400'">{{ formattedEnd }}</span>
      </button>
    </div>

    <!-- Double Popover Calendar -->
    <transition name="fade">
      <div 
        v-if="isOpen"
        class="glass-elevated absolute z-50 left-0 mt-2 w-80 rounded-3xl p-5"
        style="top: 100%;"
      >
        <!-- Header controls -->
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
          <!-- Blanks. Pure grid padding to line the 1st up with its weekday, so
               they stay near-invisible rather than competing with real days. -->
          <div 
            v-for="blank in blanks" 
            :key="'blank-' + blank"
            class="aspect-square flex items-center justify-center text-xs font-semibold text-slate-400/50 dark:text-slate-600/50 pointer-events-none select-none"
            aria-hidden="true"
          >
            {{ blank }}
          </div>
          
          <!-- Standard range days. Three visually distinct states, in
               descending order of weight: an endpoint is the only cell with a
               solid gradient, an in-range day is a soft accent wash, and a
               plain day has no surface at all -- the gap is the structure. -->
          <button
            v-for="day in daysInMonth"
            :key="day"
            type="button"
            @click="selectDay(day)"
            :disabled="isDateDisabled(day)"
            class="day-cell aspect-square flex items-center justify-center text-xs font-semibold rounded-xl cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-blue-600 dark:focus-visible:outline-blue-300"
            :class="[
              isExtreme(day) 
                ? 'is-selected bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold shadow-md shadow-blue-500/30' 
                : isBetween(day)
                  ? 'bg-blue-500/25 dark:bg-blue-500/35 text-blue-800 dark:text-blue-200 font-medium'
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
  startDate: string;
  endDate: string;
  minDate?: string;
}>();

const emit = defineEmits<{
  (e: 'update:startDate', value: string): void;
  (e: 'update:endDate', value: string): void;
  (e: 'change'): void;
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

  emit('change');
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

<style scoped>
/* The calendar popover is a `.glass-elevated` element. Its `absolute` is a plain
   utility that wins now that the primitives sit in `@layer components`, so no
   positioning rule is needed here. */

/* Hover on a glass chip is deliberately not a `hover:bg-*` utility: utilities
   now outrank the primitive, so one would replace the material with a flat
   wash. A colour-mix over the glass token lifts it in both
   themes, because the token is near-white in light and deep navy in dark. */
.nav-button:hover {
  background-color: color-mix(in oklab, var(--color-glass-bg-subtle), white 18%);
}

.day-cell {
  transition:
    background-color 0.15s ease,
    color 0.15s ease,
    box-shadow 0.15s ease;
}

/* A plain `hover:bg-*` on a gradient-filled endpoint would replace the gradient
   with a flat tint mid-hover, so the endpoint restates the gradient one step
   lighter instead. */
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
