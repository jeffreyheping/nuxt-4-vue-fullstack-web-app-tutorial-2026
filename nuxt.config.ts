// nuxt.config.ts
export default defineNuxtConfig({
  future: {
    compatibilityVersion: 4,
  },

  devtools: { enabled: true },

  modules: [
    '@nuxt/ui',
  ],

  runtimeConfig: {
    sessionSecret: process.env.SESSION_SECRET || 'dev-secret-change-in-production',
    databaseUrl: process.env.DATABASE_URL,
    public: {
      appName: 'TaskFlow',
    },
  },

  compatibilityDate: '2026-03-01',

  nitro: {
    preset: 'node-server',
    compressPublicAssets: true,
  },

  app: {
    head: {
      title: 'TaskFlow - Task Manager',
      meta: [
        { name: 'description', content: 'Modern and efficient task management application' },
      ],
    },
  },
})
