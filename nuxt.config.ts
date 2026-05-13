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
    // page via defineI18nRoute. C'est ce qui permet d'avoir
    // /fr/voitures, /fr/helicoptere, /fr/acces
    // sans renommer les fichiers de pages cote filesystem.
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
      misanaPhone: process.env.NUXT_PUBLIC_MISANA_PHONE || '33634123393',
      misanaWhatsapp: process.env.NUXT_PUBLIC_MISANA_WHATSAPP || process.env.NUXT_PUBLIC_MISANA_PHONE || '33634123393',
    },
  },

  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      // SEO-first : pas de suffixe brand. Google appendra "- Misana" via og:site_name
      // si pertinent. Chaque page declare son title complet, keyword-frontloade.
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        // Bing Webmaster Tools site ownership verification
        { name: 'msvalidate.01', content: '4216B2972A684036108B33A62D779494' },
        { name: 'description', content: 'Private chauffeur, helicopter transfers, yacht charter and luxury car rental on the French Riviera. Saint-Tropez to Monaco.' },
        // OG defaults pour social sharing
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'Misana' },
        { property: 'og:image', content: 'https://misana-group.com/og-default.jpg' },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { name: 'twitter:card', content: 'summary_large_image' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        // Async load des fonts via media print + swap. Le browser
        // telecharge la stylesheet sans bloquer le rendu, puis bascule
        // 'all' au onload. Gain LCP : ~600-760ms sur mobile.
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Rubik:wght@400;500;600&display=swap',
          media: 'print',
          onload: "this.media='all'",
        },
      ],
      noscript: [
        {
          innerHTML: '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Rubik:wght@400;500;600&display=swap">',
        },
      ],
      script: [
        // Rybbit Analytics : privacy-friendly, defer pour ne pas bloquer le rendu.
        {
          src: 'https://app.rybbit.io/api/script.js',
          'data-site-id': '5d0fbf4cb61c',
          defer: true,
        },
      ],
    },
  },

  typescript: {
    strict: true,
    typeCheck: false,
  },

  // Cache HTML edge Vercel : SWR 5min sur les pages editoriales pour
  // reduire le TTFB de ~600ms (cold start) a ~50ms (cache hit). Les
  // changements Sanity apparaissent dans 5min max, ou immediatement si
  // on revalidate manuellement.
  //
  // Garde fresh : /request (URL state), /admin (auth-dependent), /api.
  routeRules: {
    '/': { swr: 300 },
    '/en': { swr: 300 },
    '/fr': { swr: 300 },
    '/en/**': { swr: 300 },
    '/fr/**': { swr: 300 },
    '/en/request/**': { swr: false, headers: { 'cache-control': 'no-store' } },
    '/fr/request/**': { swr: false, headers: { 'cache-control': 'no-store' } },
    '/admin/**': { ssr: true, swr: false, headers: { 'cache-control': 'no-store' } },
    '/api/**': { swr: false, headers: { 'cache-control': 'no-store' } },
  },

  // Headers HTTP de securite. Appliques a toutes les reponses HTML/API
  // via Nitro (Vercel respect le routeRules headers en SSR).
  //
  // - X-Frame-Options: SAMEORIGIN  -> bloque le clickjacking via iframe
  // - X-Content-Type-Options: nosniff -> bloque le MIME sniffing
  // - Referrer-Policy: strict-origin-when-cross-origin -> ne leak pas
  //   l'URL complete vers les sites tiers
  // - Permissions-Policy -> desactive les APIs sensibles non utilisees
  //   (geolocation, camera, microphone, payment, USB, fullscreen, etc)
  // - Content-Security-Policy: en mode Report-Only au demarrage pour
  //   monitorer sans casser. A passer en enforce une fois valide.
  nitro: {
    routeRules: {
      '/**': {
        headers: {
          'X-Frame-Options': 'SAMEORIGIN',
          'X-Content-Type-Options': 'nosniff',
          'Referrer-Policy': 'strict-origin-when-cross-origin',
          'Permissions-Policy': 'geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()',
          // CSP en Report-Only : on observe ce qui se passe sans casser.
          // Une fois stabilisee, renommer en Content-Security-Policy.
          // 'unsafe-inline' sur style et script est requis pour Nuxt SSR
          // (styled-components inline + script JSON-LD inline).
          'Content-Security-Policy-Report-Only': [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://maps.googleapis.com",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "img-src 'self' data: https://cdn.sanity.io https://www.google-analytics.com https://www.googletagmanager.com https://*.leaderlimousines.com https://www.leaderlimousines.com https://images.unsplash.com",
            "font-src 'self' https://fonts.gstatic.com data:",
            "connect-src 'self' https://*.sanity.io https://*.supabase.co https://www.google-analytics.com https://maps.googleapis.com https://api.resend.com",
            "frame-ancestors 'self'",
            "base-uri 'self'",
            "form-action 'self'",
            "object-src 'none'",
          ].join('; '),
        },
      },
    },
  },

  future: { compatibilityVersion: 4 },
});
