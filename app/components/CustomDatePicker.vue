<template>
  <div ref="calendarContainer" class="relative w-full">
    <!-- Custom Display Trigger Button -->
    <button 
      type="button"
      @click="isOpen = !isOpen"
      class="w-full flex items-center gap-3 pl-10 pr-4 py-3 border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900/60 focus:ring-2 focus:ring-blue-500 outline-none text-left cursor-pointer transition-all dark:text-slate-100 font-medium"
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
        class="absolute z-50 left-0 mt-2 w-80 bg-white/90 dark:bg-slate-900/85 backdrop-blur-2xl border border-white/50 dark:border-white/10 shadow-xl shadow-blue-500/5 dark:shadow-black/40 rounded-3xl p-5"
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
                ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold shadow-lg shadow-blue-500/25 border border-white/20' 
                : 'bg-white/40 dark:bg-slate-800/20 text-slate-800 dark:text-slate-100 hover:bg-blue-50 dark:hover:bg-slate-700 border border-white/10',
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
