<template>
  <div
    class="min-h-screen flex flex-col font-sans text-gray-900 dark:text-slate-100 transition-colors duration-300 relative"
  >
    <!-- The canvas layer. `.canvas` paints seven large cloud masses plus the
         grain tile over the body's own base colour, so the root deliberately
         carries no solid fill -- an opaque background here would be the one
         thing a backdrop-filter could never refract. -->
    <div class="canvas fixed inset-0 -z-10 pointer-events-none overflow-hidden">
      <!-- Two extra atmospheric washes on top of the canvas: very large, very
           soft, and faint enough to read as depth rather than as blobs. Anything
           tighter is what turned the old pair of circles into visible discs. -->
      <div
        class="absolute -top-[32%] -left-[22%] w-[85%] h-[75%] rounded-full bg-sky-200/25 dark:bg-blue-600/10 blur-[160px]"
      ></div>
      <div
        class="absolute -bottom-[28%] -right-[18%] w-[75%] h-[70%] rounded-full bg-violet-200/25 dark:bg-violet-600/10 blur-[160px]"
      ></div>
    </div>

    <!-- Floating header. Sticky, and `.glass-card` rather than `.glass-elevated`:
         it sits directly on the high-key canvas where a 0.38 fill already leaves
         dark body text at ~13:1, so the denser level would buy nothing and cost
         the sense of air. `.glass-grain` on top of it because a bar this large is
         the surface most likely to read as a flat vector fill. -->
    <header class="sticky top-0 z-40 px-3 pt-3 sm:px-5 sm:pt-4 lg:px-6">
      <div
        class="glass-card glass-grain mx-auto max-w-7xl rounded-glass-lg px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center gap-4"
      >
        <!-- Logo -->
        <NuxtLink
          to="/"
          class="pill outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:focus-visible:outline-blue-300 flex items-center gap-2 rounded-xl cursor-pointer select-none"
        >
          <Plane class="w-7 h-7 rotate-45 text-blue-600 dark:text-blue-400" />
          <!-- Accent-tinted rather than white-on-blue: the bar is now light in
               light mode, so a white gradient would simply disappear. -->
          <h1
            class="text-xl sm:text-2xl font-black tracking-tight bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 dark:from-blue-300 dark:via-blue-200 dark:to-indigo-300 bg-clip-text text-transparent"
          >
            SkyCrawler
          </h1>
        </NuxtLink>

        <!-- Header Navigation Links -->
        <div class="flex items-center gap-3 sm:gap-5">
          <nav aria-label="Primary">
            <ul class="flex items-center gap-1 sm:gap-2 text-sm">
              <li>
                <NuxtLink
                  to="/"
                  class="pill outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:focus-visible:outline-blue-300 rounded-full px-3.5 py-1.5 transition-colors duration-200 cursor-pointer select-none"
                  :class="[
                    route.path === '/'
                      ? 'bg-blue-600 text-white font-black shadow-md shadow-blue-500/25'
                      : 'glass glass-hover text-slate-600 dark:text-slate-300 font-semibold hover:text-slate-900 dark:hover:text-white',
                  ]"
                >
                  Flights
                </NuxtLink>
              </li>
              <li>
                <NuxtLink
                  to="/hotels"
                  class="pill outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:focus-visible:outline-blue-300 rounded-full px-3.5 py-1.5 transition-colors duration-200 cursor-pointer select-none"
                  :class="[
                    route.path === '/hotels'
                      ? 'bg-blue-600 text-white font-black shadow-md shadow-blue-500/25'
                      : 'glass glass-hover text-slate-600 dark:text-slate-300 font-semibold hover:text-slate-900 dark:hover:text-white',
                  ]"
                >
                  Hotels
                </NuxtLink>
              </li>
            </ul>
          </nav>
          <div class="flex items-center gap-2 sm:gap-3">
            <CurrencySelector @change="handleCurrencyChange" />
            <ThemeSwitcher />
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content Grid -->
    <main class="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full relative z-10">
      <!-- Premium Glassmorphic Switcher Tab pills. The active state uses the
           accent fill plus `font-black` and a coloured shadow, so selection is
           carried by colour and weight -- never by an alpha difference alone,
           which is invisible to anyone who cannot separate the two fills. -->
      <div class="flex items-center gap-2 mb-6">
        <NuxtLink
          to="/"
          class="pill outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:focus-visible:outline-blue-300 flex items-center gap-2 px-5 py-2.5 rounded-full text-sm transition-colors duration-200 cursor-pointer select-none"
          :class="[
            route.path === '/'
              ? 'bg-blue-600 text-white font-black shadow-md shadow-blue-500/25'
              : 'glass glass-hover text-slate-600 dark:text-slate-300 font-bold hover:text-slate-900 dark:hover:text-white',
          ]"
        >
          <Plane class="w-4 h-4" />
          Flight Finder
        </NuxtLink>
        <NuxtLink
          to="/hotels"
          class="pill outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:focus-visible:outline-blue-300 flex items-center gap-2 px-5 py-2.5 rounded-full text-sm transition-colors duration-200 cursor-pointer select-none"
          :class="[
            route.path === '/hotels'
              ? 'bg-blue-600 text-white font-black shadow-md shadow-blue-500/25'
              : 'glass glass-hover text-slate-600 dark:text-slate-300 font-bold hover:text-slate-900 dark:hover:text-white',
          ]"
        >
          <Building class="w-4 h-4" />
          Hotel Finder
        </NuxtLink>
      </div>

      <!-- Route View Slot -->
      <NuxtPage />
    </main>

    <!-- Footer. No band and no top border: the old opaque strip was a hard
         horizontal stop that cut the canvas in half. It now just floats on the
         same atmosphere as everything else. -->
    <footer
      class="mt-auto w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-center"
    >
      <p class="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest">
        &copy; {{ new Date().getFullYear() }} SkyCrawler. Curating The Smart Travel Network.
      </p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from '#imports';
import { Plane, Building } from 'lucide-vue-next';

const route = useRoute();

// Prices are currency-specific, so a currency change invalidates any cached
// search results. Pages re-run their active search in response.
const handleCurrencyChange = () => {
  window.dispatchEvent(new CustomEvent('currency-changed'));
};
</script>

<style scoped>
/* The glass primitives live in `@layer components`, so a Tailwind utility now
   overrides them -- but a `hover:bg-white/40` utility would still flatten the
   material to a solid wash, which is the opposite of what a glass hover wants.
   The hover fill therefore stays in a rule here. The focus rings that go with it
   use `outline` rather than `ring-*` for a different reason: Tailwind composes
   rings into `box-shadow`, which `.glass` claims for its own shadow stack, so a
   ring there would stack rather than replace and never read as a focus ring. */
.glass-hover:hover {
  background-color: color-mix(in oklab, var(--color-glass-bg-subtle) 45%, white);
}

/* The reduced-motion block in main.css covers `.glass` itself but not the
   colour transitions these pills add on top of it. */
@media (prefers-reduced-motion: reduce) {
  .glass-hover,
  .pill {
    transition-duration: 0.01ms;
  }
}
</style>
