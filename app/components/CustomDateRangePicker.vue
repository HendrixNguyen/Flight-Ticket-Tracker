<template>
  <div ref="rangeContainer" class="relative w-full flex flex-col md:flex-row gap-4 items-end">
    <!-- Departure Input Trigger -->
    <div class="flex-1 w-full relative">
      <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1" for="departure-btn">Departure</label>
      <button 
        id="departure-btn"
        type="button"
        @click="openCalendar('start')"
        class="w-full flex items-center gap-3 pl-10 pr-4 py-3 border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900/60 focus:ring-2 focus:ring-blue-500 outline-none text-left cursor-pointer transition-all dark:text-slate-100 font-medium"
      >
        <Calendar class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <span>{{ formattedStart }}</span>
      </button>
    </div>

    <!-- Return Input Trigger -->
    <div class="flex-1 w-full relative">
      <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1" for="return-btn">Return</label>
      <button 
        id="return-btn"
        type="button"
        @click="openCalendar('end')"
        class="w-full flex items-center gap-3 pl-10 pr-4 py-3 border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900/60 focus:ring-2 focus:ring-blue-500 outline-none text-left cursor-pointer transition-all dark:text-slate-100 font-medium"
      >
        <Calendar class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <span>{{ formattedEnd }}</span>
      </button>
    </div>

    <!-- Double Popover Calendar -->
    <transition name="fade">
      <div 
        v-if="isOpen"
        class="absolute z-50 left-0 mt-2 w-80 bg-white/75 dark:bg-slate-900/40 backdrop-blur-2xl border border-white/50 dark:border-white/10 shadow-xl shadow-blue-500/5 dark:shadow-black/40 rounded-3xl p-5"
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
              <div class="w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-b-[3px] border-b-blue-500 absolute bottom-1.5 right-1.5 rotate-135"></div>
            </div>
            <div class="bg-white/70 dark:bg-slate-800/60 border border-white/50 dark:border-white/10 px-3 py-1.5 rounded-xl font-bold text-xs text-slate-800 dark:text-slate-100 flex items-center relative pr-4">
              {{ currentYear }}
              <div class="w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-b-[3px] border-b-blue-500 absolute bottom-1.5 right-1.5 rotate-135"></div>
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
                ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold shadow-lg shadow-blue-500/25 border border-white/20' 
                : isBetween(day)
                  ? 'bg-blue-500/15 dark:bg-blue-500/25 text-blue-600 dark:text-blue-300 border border-blue-500/10 rounded-xl'
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
