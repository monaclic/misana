import tailwindcss from '@tailwindcss/vite';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-04-26',
  devtools: { enabled: true },

  modules: [
    '@nuxtjs/i18n',
    '@nuxtjs/sanity',
    '@nuxtjs/supabase',
    '@pinia/nuxt',
    '@vee-validate/nuxt',
    '@nuxt/eslint',
  ],

  css: ['~/assets/css/main.css'],

  components: [
    { path: '~/components', pathPrefix: false },
  ],

  vite: {
    plugins: [tailwindcss()],
  },

  i18n: {
    locales: [
      { code: 'en', language: 'en-GB', file: 'en.json', name: 'English' },
      { code: 'fr', language: 'fr-FR', file: 'fr.json', name: 'Francais' },
    ],
    defaultLocale: 'en',
    strategy: 'prefix',
    bundle: { optimizeTranslationDirective: false },
  },

  sanity: {
    projectId: process.env.NUXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NUXT_PUBLIC_SANITY_DATASET,
    apiVersion: process.env.NUXT_PUBLIC_SANITY_API_VERSION,
    useCdn: true,
  },

  supabase: {
    redirect: false,
  },

  runtimeConfig: {
    // server-only. @nuxtjs/supabase lit lui-meme SUPABASE_URL/KEY/SERVICE_KEY ;
    // serverSupabaseServiceRole(event) y donne acces dans /server/api.
    misanaInquiriesTo: process.env.NUXT_MISANA_INQUIRIES_TO || '',
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://misana.example',
      // Google Maps Places + Distance Matrix. Optionnel : si vide, l autocomplete
      // reste un input texte simple et le calcul kilometrique est desactive.
      googleMapsKey: process.env.NUXT_PUBLIC_GOOGLE_MAPS_KEY || '',
    },
  },

  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      titleTemplate: '%s - Misana',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Misana. The French Riviera, orchestrated.' },
        // OG defaults pour social sharing
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'Misana' },
        { property: 'og:image', content: 'https://misana.com/og-default.jpg' },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { name: 'twitter:card', content: 'summary_large_image' },
      ],
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    },
  },

  typescript: {
    strict: true,
    typeCheck: false,
  },

  future: { compatibilityVersion: 4 },
});
