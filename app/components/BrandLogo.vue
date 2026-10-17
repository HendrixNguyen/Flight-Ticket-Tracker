<template>
  <span class="brand-lockup inline-flex items-center gap-2.5">
    <svg
      class="brand-mark h-10 w-10 shrink-0"
      viewBox="0 0 52 52"
      role="img"
      aria-label="Nuvora"
    >
      <defs>
        <linearGradient id="nuvora-sky" x1="7" y1="5" x2="45" y2="47" gradientUnits="userSpaceOnUse">
          <stop stop-color="#38BDF8" />
          <stop offset=".48" stop-color="#2563EB" />
          <stop offset="1" stop-color="#7C3AED" />
        </linearGradient>
        <linearGradient id="nuvora-glint" x1="14" y1="13" x2="37" y2="38" gradientUnits="userSpaceOnUse">
          <stop stop-color="#FFFFFF" />
          <stop offset="1" stop-color="#DBEAFE" />
        </linearGradient>
        <filter id="nuvora-shadow" x="-35%" y="-35%" width="170%" height="180%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#1E3A8A" flood-opacity=".3" />
        </filter>
      </defs>
      <rect x="3" y="3" width="46" height="46" rx="15" fill="url(#nuvora-sky)" filter="url(#nuvora-shadow)" />
      <rect x="4" y="4" width="44" height="44" rx="14" fill="none" stroke="#FFFFFF" stroke-opacity=".38" />
      <path
        d="M14 35V17.5L37.5 35V17"
        fill="none"
        stroke="url(#nuvora-glint)"
        stroke-width="4.2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M10.5 29.5C17 20 27 15.3 40.5 16.5"
        fill="none"
        stroke="#FFFFFF"
        stroke-opacity=".58"
        stroke-width="1.4"
        stroke-linecap="round"
        stroke-dasharray="1 3"
      />
      <path d="M40.5 10.5L41.8 14.2L45.5 15.5L41.8 16.8L40.5 20.5L39.2 16.8L35.5 15.5L39.2 14.2Z" fill="#FDE68A" />
    </svg>
    <span class="min-w-0 text-left leading-none">
      <span
        class="brand-word block bg-gradient-to-r from-blue-700 via-blue-600 to-violet-700 bg-clip-text text-xl font-black tracking-[-0.045em] text-transparent dark:from-sky-300 dark:via-blue-200 dark:to-violet-300 sm:text-2xl"
      >
        Nuvora
      </span>
      <span class="mt-1 hidden text-[9px] font-extrabold uppercase tracking-[0.2em] text-slate-600 dark:text-slate-300 sm:block">
        Find your horizon
      </span>
    </span>
  </span>
</template>

<style scoped>
.brand-mark {
  transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1), filter 0.3s ease;
}

.brand-lockup:hover .brand-mark {
  transform: translateY(-1px) rotate(-3deg);
  filter: saturate(1.12);
}

@media (prefers-reduced-motion: reduce) {
  .brand-mark {
    transition-duration: 0.01ms;
  }

  .brand-lockup:hover .brand-mark {
    transform: none;
  }
}
</style>
