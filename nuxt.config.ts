import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2026-05-15',

  // SPA mode — the app is fully client-side after first paint.
  // Avoids SSR/localStorage hydration gymnastics for the token gate.
  ssr: false,

  devtools: { enabled: false },

  css: ['~/assets/css/main.css'],

  vite: {
    plugins: [tailwindcss()],
  },

  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'https://api.kynguyen.cc',
    },
  },

  app: {
    head: {
      title: 'Ledger',
      htmlAttrs: { lang: 'vi' },
      meta: [
        { charset: 'utf-8' },
        // `viewport-fit=cover` lets the page render under the iOS status bar /
        // home indicator; the layout uses env(safe-area-inset-*) to keep the
        // interactive content out of those reserved zones.
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no' },
        { name: 'description', content: 'Ghi chép thu chi cá nhân.' },
        // Background color of the URL bar (Android) and PWA splash (iOS).
        { name: 'theme-color', content: '#0a0a0c' },
        // Tell iOS this site can be installed and run standalone (no Safari chrome).
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'mobile-web-app-capable', content: 'yes' },
        // `black-translucent` lets content render under the status bar — combined
        // with `viewport-fit=cover` this gives an edge-to-edge app feel.
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
        { name: 'apple-mobile-web-app-title', content: 'Ledger' },
        { name: 'format-detection', content: 'telephone=no' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/icon.svg' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
        { rel: 'manifest', href: '/manifest.webmanifest' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap&subset=vietnamese',
        },
      ],
    },
  },

  typescript: {
    strict: true,
  },
})
