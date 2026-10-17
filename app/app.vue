<template>
  <div
    class="min-h-screen w-full max-w-[100vw] flex flex-col font-sans text-gray-900 dark:text-slate-100 transition-colors duration-300 relative"
  >
    <!-- The canvas layer. `.canvas` paints seven large cloud masses plus the
         grain tile over the body's own base colour, so the root deliberately
         carries no solid fill -- an opaque background here would be the one
         thing a backdrop-filter could never refract. -->
    <div
      class="canvas fixed inset-0 -z-10 pointer-events-none overflow-hidden"
      :class="{
        'canvas-flights': !route.path.startsWith('/hotels'),
        'canvas-hotels': route.path.startsWith('/hotels'),
      }"
    >
      <div class="route-backdrop absolute inset-0"></div>
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
        class="glass-card glass-grain w-full rounded-glass-lg px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center gap-4"
      >
        <!-- Logo -->
        <NuxtLink
          to="/"
          class="pill outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:focus-visible:outline-blue-300 flex items-center gap-2 rounded-xl cursor-pointer select-none"
        >
          <BrandLogo />
        </NuxtLink>

        <!-- Header Navigation Links -->
        <div class="flex items-center gap-3 sm:gap-5">
          <button
            ref="menuButton"
            type="button"
            class="md:hidden flex h-11 w-11 items-center justify-center rounded-xl border border-transparent text-slate-800 dark:text-slate-100 focus-visible:outline-2 focus-visible:outline-blue-600"
            :aria-expanded="mobileMenuOpen"
            aria-controls="primary-navigation"
            :aria-label="mobileMenuOpen ? 'Close navigation' : 'Open navigation'"
            @click="mobileMenuOpen = !mobileMenuOpen"
          >
            <X v-if="mobileMenuOpen" class="h-6 w-6" aria-hidden="true" />
            <Menu v-else class="h-6 w-6" aria-hidden="true" />
          </button>
          <nav id="primary-navigation" aria-label="Primary"
            class="primary-navigation md:block"
            :class="mobileMenuOpen ? 'block' : 'hidden'"
            @keydown.esc="closeMobileMenu"
          >
            <ul class="flex flex-col md:flex-row md:items-center gap-4 md:gap-2 text-sm">
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
               <li>
                 <NuxtLink
                   to="/alerts"
                   class="pill outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:focus-visible:outline-blue-300 rounded-full px-3.5 py-1.5 transition-colors duration-200 cursor-pointer select-none"
                   :class="[
                     route.path === '/alerts'
                       ? 'bg-blue-600 text-white font-black shadow-md shadow-blue-500/25'
                       : 'glass glass-hover text-slate-600 dark:text-slate-300 font-semibold hover:text-slate-900 dark:hover:text-white',
                   ]"
                 >
                   Alerts
                 </NuxtLink>
               </li>
               <li>
                 <NuxtLink to="/trips" class="pill inline-block border border-transparent rounded-full px-3.5 py-1.5 font-semibold"
                   :class="route.path === '/trips' ? 'bg-blue-600 text-white' : 'glass text-slate-600 dark:text-slate-300'">Trips</NuxtLink>
               </li>
             </ul>
             <div class="mt-4 flex items-center gap-3 md:hidden">
               <CurrencySelector @change="handleCurrencyChange" />
               <ThemeSwitcher />
             </div>
          </nav>
          <div class="hidden md:flex items-center gap-2 sm:gap-3">
            <CurrencySelector @change="handleCurrencyChange" />
            <ThemeSwitcher />
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content Grid -->
    <main class="flex-grow min-w-0 px-4 md:px-8 py-8 w-full relative z-10">
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
        &copy; {{ new Date().getFullYear() }} Nuvora. Find your horizon.
      </p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from '#imports';
import { ref, watch } from 'vue';
import { Menu, X } from 'lucide-vue-next';

const route = useRoute();
const mobileMenuOpen = ref(false);
const menuButton = ref<HTMLButtonElement | null>(null);
const closeMobileMenu = () => {
  mobileMenuOpen.value = false;
  menuButton.value?.focus();
};
watch(() => route.path, () => { mobileMenuOpen.value = false; });

// Prices are currency-specific, so a currency change invalidates any cached
// search results. Pages re-run their active search in response.
const handleCurrencyChange = () => {
  window.dispatchEvent(new CustomEvent('currency-changed'));
};
</script>

<style scoped>
@media (max-width: 767px) {
  .primary-navigation {
    position: absolute;
    top: calc(100% + 0.5rem);
    inset-inline: 0;
    padding: 1.25rem;
    border: 1px solid var(--color-glass-border);
    border-radius: 1.5rem;
    background: var(--color-glass-fallback);
    max-height: calc(100dvh - 6rem);
    overflow-y: auto;
  }
}
/* Keep navigation pills the same size across routes. */
.pill { border: 1px solid transparent; font-weight: 700; }

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
