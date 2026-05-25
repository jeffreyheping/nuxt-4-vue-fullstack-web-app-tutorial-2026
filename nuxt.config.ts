export default defineNuxtConfig({
  future: {
    compatibilityVersion: 4,
  },

  devtools: { enabled: true },

  css: ['~/assets/css/main.css'],

  modules: [
    '@nuxt/ui',
    '@nuxt/fonts',
  ],

  runtimeConfig: {
    sessionSecret: process.env.SESSION_SECRET || 'dev-secret-change-in-production',
    databaseUrl: process.env.DATABASE_URL,
    public: {
      appName: 'TaskFlow',
    },
  },

  compatibilityDate: '2026-03-01',
})
