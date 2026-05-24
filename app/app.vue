<template>
  <div
    class="min-h-screen bg-gray-50 dark:bg-slate-950 flex flex-col font-sans text-gray-900 dark:text-slate-100 transition-colors duration-300 relative"
  >
    <!-- Decorative Glowing Blobs for 2026 Glassmorphism Trend -->
    <div class="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <div
        class="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-400/20 dark:bg-blue-600/10 blur-[120px]"
      ></div>
      <div
        class="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] rounded-full bg-indigo-400/20 dark:bg-indigo-600/10 blur-[120px]"
      ></div>
    </div>

    <!-- Header Block -->
    <header
      class="bg-blue-600 dark:bg-slate-900/60 backdrop-blur-md text-white shadow-md border-b dark:border-slate-800 transition-colors relative z-40"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <!-- Logo -->
        <NuxtLink to="/" class="flex items-center gap-2 cursor-pointer select-none">
          <Plane class="w-8 h-8 rotate-45 text-blue-100 dark:text-blue-400" />
          <h1
            class="text-2xl font-black tracking-tight bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent"
          >
            SkyCrawler
          </h1>
        </NuxtLink>

        <!-- Header Navigation Links -->
        <div class="flex items-center gap-6">
          <nav>
            <ul
              class="flex space-x-2 sm:space-x-4 font-bold text-sm text-blue-100 dark:text-slate-300"
            >
              <li>
                <NuxtLink
                  to="/"
                  class="px-3 py-1.5 rounded-lg hover:text-white dark:hover:text-slate-100 hover:bg-white/10 dark:hover:bg-slate-800 transition-all cursor-pointer select-none"
                  :class="[route.path === '/' ? 'bg-white/20 text-white font-black' : '']"
                >
                  Flights
                </NuxtLink>
              </li>
              <li>
                <NuxtLink
                  to="/hotels"
                  class="px-3 py-1.5 rounded-lg hover:text-white dark:hover:text-slate-100 hover:bg-white/10 dark:hover:bg-slate-800 transition-all cursor-pointer select-none"
                  :class="[route.path === '/hotels' ? 'bg-white/20 text-white font-black' : '']"
                >
                  Hotels
                </NuxtLink>
              </li>
            </ul>
          </nav>
          <ThemeSwitcher />
        </div>
      </div>
    </header>

    <!-- Main Content Grid -->
    <main class="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full relative z-10">
      <!-- Premium Glassmorphic Switcher Tab pills -->
      <div class="flex items-center gap-2 mb-6">
        <NuxtLink
          to="/"
          class="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-black transition-all cursor-pointer border select-none"
          :class="[
            route.path === '/'
              ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/25'
              : 'bg-white/40 dark:bg-slate-900/40 border-white/30 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-900/60',
          ]"
        >
          <Plane class="w-4 h-4" />
          Flight Finder
        </NuxtLink>
        <NuxtLink
          to="/hotels"
          class="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-black transition-all cursor-pointer border select-none"
          :class="[
            route.path === '/hotels'
              ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/25'
              : 'bg-white/40 dark:bg-slate-900/40 border-white/30 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-900/60',
          ]"
        >
          <Building class="w-4 h-4" />
          Hotel Finder
        </NuxtLink>
      </div>

      <!-- Route View Slot -->
      <NuxtPage />
    </main>

    <footer
      class="bg-slate-100 dark:bg-slate-900 py-8 text-center mt-auto border-t dark:border-slate-800"
    >
      <p class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
        &copy; {{ new Date().getFullYear() }} SkyCrawler. Curating The Smart Travel Network.
      </p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from '#imports';
import { Plane, Building } from 'lucide-vue-next';

const route = useRoute();
</script>
