import tailwindcss from "@tailwindcss/vite";

/**
 * Dark mode is applied imperatively by ThemeSwitcher.vue in its onMounted hook,
 * which means the browser paints the document in light mode first and only then
 * swaps the class -- a visible white flash for every dark-mode user.
 *
 * This inline script runs in <head> before the body is parsed, so the `dark`
 * class is on <html> by the time the first pixel is painted. It deliberately
 * mirrors ThemeSwitcher.vue's logic exactly: the stored preference is one of
 * 'light' | 'dark' | 'device', anything else (or a storage failure) falls back
 * to 'device', and 'device' resolves through matchMedia.
 *
 * `colorScheme` is set alongside the class so native form controls and
 * scrollbars are themed in the same tick rather than one frame later.
 */
const themeScript = `(function(){try{var d=document.documentElement;var t=null;try{t=window.localStorage.getItem('sky-crawler-theme');}catch(e){}if(t!=='light'&&t!=='dark'){t='device';}var dark=t==='dark'||(t==='device'&&typeof window.matchMedia==='function'&&window.matchMedia('(prefers-color-scheme: dark)').matches);d.classList.toggle('dark',dark);d.style.colorScheme=dark?'dark':'light';if(t==='device'&&typeof window.matchMedia==='function'){var mq=window.matchMedia('(prefers-color-scheme: dark)');var onChange=function(e){d.classList.toggle('dark',e.matches);d.style.colorScheme=e.matches?'dark':'light';};if(mq.addEventListener){mq.addEventListener('change',onChange);}else if(mq.addListener){mq.addListener(onChange);}}}catch(e){}})();`

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: false },
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    serpApiKey: '',
  },
  app: {
    head: {
      link: [
        // `--font-sans` declares Inter, but nothing was ever loading it, so the
        // app silently fell back to system-ui. Inter is a variable font on
        // Google Fonts, so one stylesheet covers the 400-900 range the app
        // actually uses (400 body text through 900 `font-black` headings)
        // instead of nine separate weight requests.
        // `display=swap` shows fallback text immediately rather than blocking
        // first paint on the font, and the system-ui chain in `--font-sans`
        // keeps the layout sane if this request is slow or blocked.
        {
          rel: 'preconnect',
          href: 'https://fonts.googleapis.com',
        },
        {
          rel: 'preconnect',
          href: 'https://fonts.gstatic.com',
          crossorigin: '',
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400..900&display=swap',
        },
      ],
      script: [
        {
          // Must stay inline: an external file cannot run before first paint.
          innerHTML: themeScript,
          tagPosition: 'head',
        },
      ],
    },
  },
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
})
