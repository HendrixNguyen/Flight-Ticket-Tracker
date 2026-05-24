<template>
  <button 
    @click="toggleTheme"
    type="button"
    class="flex items-center gap-2 px-4 py-2 rounded-full bg-white/40 dark:bg-slate-800/40 backdrop-blur-md border border-white/30 dark:border-white/10 shadow-sm hover:scale-105 transition-all text-slate-700 dark:text-slate-200 cursor-pointer"
    title="Toggle Theme"
  >
    <Sun v-if="isDark" class="w-4 h-4 text-amber-500 animate-spin-slow" />
    <Moon v-else class="w-4 h-4 text-indigo-600" />
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
