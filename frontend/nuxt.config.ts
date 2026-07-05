import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'

export default defineNuxtConfig({
  devtools: { enabled: false },
  ssr: false,

  modules: [
    '@pinia/nuxt',
    '@vueuse/nuxt',
    (_options, nuxt) => {
      nuxt.hooks.hook('vite:extendConfig', (config) => {
        config.plugins?.push(vuetify({ autoImport: true }))
      })

      // Workaround for Nuxt 3.21 bug: resolveServerEntry called with client config
      // when ssr:false (client rollup input uses key "entry", resolveServerEntry
      // looks for "server"). Only the DEV server hits that code path — in production
      // builds the extra "server" input creates a duplicate entry chunk and the main
      // entry CSS (vuetify/styles) never gets linked in the HTML shell.
      if (!nuxt.options.dev) return
      nuxt.hooks.hook('vite:extendConfig', (config, { isClient }) => {
        if (!isClient) return
        const input = config.build?.rollupOptions?.input
        if (input && typeof input === 'object' && !Array.isArray(input)) {
          const inp = input as Record<string, string>
          if (inp.entry && !inp.server) inp.server = inp.entry
        }
      })
    },
  ],

  components: [
    { path: '~/components', pathPrefix: false },
  ],

  css: [
    'vuetify/styles',
    '@mdi/font/css/materialdesignicons.css',
    '~/assets/styles/main.scss',
  ],

  build: {
    transpile: ['vuetify'],
  },

  vite: {
    vue: {
      template: {
        transformAssetUrls,
      },
    },
    define: {
      'process.env.DEBUG': false,
    },
    ssr: {
      noExternal: ['vuetify'],
    },
  },

  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || process.env.API_BASE_URL || 'http://localhost:5000/api',
    },
  },

  app: {
    head: {
      title: 'FinanceApp — Personal Finance Manager',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Track income, expenses, and grow your wealth' },
        { name: 'theme-color', content: '#052962' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: 'anonymous' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;600;700&family=Prompt:wght@300;400;500;600;700&display=swap',
        },
      ],
    },
    pageTransition:   { name: 'page',   mode: 'out-in' },
    layoutTransition: { name: 'layout', mode: 'out-in' },
  },

  imports: {
    dirs: ['stores', 'composables', 'utils'],
  },

  pinia: {
    storesDirs: ['./stores/**'],
  },

  compatibilityDate: '2024-11-01',
})
