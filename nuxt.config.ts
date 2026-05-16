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
      title: 'Ledger · kynguyen.cc',
      htmlAttrs: { lang: 'vi' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Ghi chép thu chi cá nhân theo phong cách cyberpunk + tu tiên.' },
        { name: 'theme-color', content: '#020208' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
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
