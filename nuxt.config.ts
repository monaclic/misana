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
    '@nuxt/icon',
  ],

  icon: {
    // Bundle client : icones Tabler explicites, inlinees dans le bundle JS
    // (zero requete externe, fonctionne offline et pendant SSR).
    clientBundle: {
      icons: [
        'tabler:car',
        'tabler:car-suv',
        'tabler:steering-wheel',
        'tabler:helicopter-landing',
        'tabler:sailboat',
        'tabler:tower',
        'tabler:calendar-event',
        'tabler:luggage',
        'tabler:sparkles',
      ],
      scan: true,
    },
  },

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
    // Active la lecture des chemins localises declares dans chaque
    // page via defineI18nRoute. Ex /fr/yacht + /en/yacht-charter,
    // /fr/voitures + /en/luxury-cars, /fr/demande + /en/request, etc.
    customRoutes: 'page',
    bundle: { optimizeTranslationDirective: false },
  },

  sanity: {
    // Fallbacks pour eviter des 500 quand les env vars manquent
    // (Vercel preview / nouveau deploy). Le projet Misana est public,
    // ces valeurs sont safe a hardcoder.
    projectId: process.env.NUXT_PUBLIC_SANITY_PROJECT_ID || 'akpi9bfm',
    dataset: process.env.NUXT_PUBLIC_SANITY_DATASET || 'production',
    apiVersion: process.env.NUXT_PUBLIC_SANITY_API_VERSION || '2026-04-26',
    useCdn: true,
  },

  supabase: {
    redirect: false,
  },

  runtimeConfig: {
    // server-only. @nuxtjs/supabase lit lui-meme SUPABASE_URL/KEY/SERVICE_KEY ;
    // serverSupabaseServiceRole(event) y donne acces dans /server/api.
    misanaInquiriesTo: process.env.NUXT_MISANA_INQUIRIES_TO || '',
    // Resend : envoi email transactionnel des inquiries vers l'equipe.
    // V1 sandbox : NUXT_MISANA_INQUIRIES_FROM = 'Misana <onboarding@resend.dev>'
    // (limite a l'envoi vers les adresses verifiees sur le compte Resend).
    // Apres validation DNS du domaine -> 'Misana <hello@misana-group.com>'.
    resendApiKey: process.env.RESEND_API_KEY || '',
    misanaInquiriesFrom: process.env.NUXT_MISANA_INQUIRIES_FROM || 'Misana <onboarding@resend.dev>',
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://misana.example',
      googleMapsKey: process.env.NUXT_PUBLIC_GOOGLE_MAPS_KEY || '',
      misanaPhone: process.env.NUXT_PUBLIC_MISANA_PHONE || '33493000000',
      misanaWhatsapp: process.env.NUXT_PUBLIC_MISANA_WHATSAPP || process.env.NUXT_PUBLIC_MISANA_PHONE || '33493000000',
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
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Rubik:wght@400;500;600&display=swap',
        },
      ],
    },
  },

  typescript: {
    strict: true,
    typeCheck: false,
  },

  future: { compatibilityVersion: 4 },
});
