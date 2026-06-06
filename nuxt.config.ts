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
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://misana-group.com',
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
        // Self-hosted sur analytics.misana-group.com.
        {
          src: 'https://analytics.misana-group.com/api/script.js',
          'data-site-id': '98ac930534a5',
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
    // === 301 redirects (consolidation SEO - anti-cannibalisation) ===
    // Doublons hubs cars : /luxury-cars + /voitures -> canoniques /car-rental + /location-voiture
    '/en/luxury-cars': { redirect: { to: '/en/car-rental', statusCode: 301 } },
    '/en/luxury-cars/**': { redirect: { to: '/en/car-rental/**', statusCode: 301 } },
    '/fr/voitures': { redirect: { to: '/fr/location-voiture', statusCode: 301 } },
    '/fr/voitures/**': { redirect: { to: '/fr/location-voiture/**', statusCode: 301 } },
    // Doublons hubs helicoptere : /helicopter-transfers (pluriel) + /helicoptere
    // -> canoniques /helicopter-transfer (singulier) + /transfert-helicoptere
    '/en/helicopter-transfers': { redirect: { to: '/en/helicopter-transfer', statusCode: 301 } },
    '/en/helicopter-transfers/**': { redirect: { to: '/en/helicopter-transfer/**', statusCode: 301 } },
    '/fr/helicoptere': { redirect: { to: '/fr/transfert-helicoptere', statusCode: 301 } },
    '/fr/helicoptere/**': { redirect: { to: '/fr/transfert-helicoptere/**', statusCode: 301 } },
    // Doublons cocon /services/ (ancienne arborescence /services/[service]/in/[city]
    // -> canonique /[service]/in/[city] aligne sur les hubs canoniques production).
    // Mapping explicite par slug pour traduire les anciens segments doublons
    // (voitures/luxury-cars/helicoptere/helicopter-transfers) vers les canoniques.
    '/en/services/private-chauffeur/**': { redirect: { to: '/en/private-chauffeur/**', statusCode: 301 } },
    '/en/services/car-rental/**': { redirect: { to: '/en/car-rental/**', statusCode: 301 } },
    '/en/services/luxury-cars/**': { redirect: { to: '/en/car-rental/**', statusCode: 301 } },
    '/en/services/yacht-charter/**': { redirect: { to: '/en/yacht-charter/**', statusCode: 301 } },
    '/en/services/helicopter-transfer/**': { redirect: { to: '/en/helicopter-transfer/**', statusCode: 301 } },
    '/en/services/helicopter-transfers/**': { redirect: { to: '/en/helicopter-transfer/**', statusCode: 301 } },
    '/en/services/reservations/**': { redirect: { to: '/en/reservations/**', statusCode: 301 } },
    '/fr/services/chauffeur-prive/**': { redirect: { to: '/fr/chauffeur-prive/**', statusCode: 301 } },
    '/fr/services/location-voiture/**': { redirect: { to: '/fr/location-voiture/**', statusCode: 301 } },
    '/fr/services/voitures/**': { redirect: { to: '/fr/location-voiture/**', statusCode: 301 } },
    '/fr/services/location-yacht/**': { redirect: { to: '/fr/location-yacht/**', statusCode: 301 } },
    '/fr/services/transfert-helicoptere/**': { redirect: { to: '/fr/transfert-helicoptere/**', statusCode: 301 } },
    '/fr/services/helicoptere/**': { redirect: { to: '/fr/transfert-helicoptere/**', statusCode: 301 } },
    '/fr/services/reservations/**': { redirect: { to: '/fr/reservations/**', statusCode: 301 } },
    // === Migration helicopter-transfer (pages/transfers/* supprime) ===
    // 4 fiches prioritaires V1, mapping 1:1.
    '/en/transfers/helicopter/nice-monaco': { redirect: { to: '/en/helicopter-transfer/nice-monaco', statusCode: 301 } },
    '/en/transfers/helicopter/nice-cannes': { redirect: { to: '/en/helicopter-transfer/nice-cannes', statusCode: 301 } },
    '/en/transfers/helicopter/nice-saint-tropez': { redirect: { to: '/en/helicopter-transfer/nice-saint-tropez', statusCode: 301 } },
    '/en/transfers/helicopter/monaco-saint-tropez': { redirect: { to: '/en/helicopter-transfer/monaco-saint-tropez', statusCode: 301 } },
    '/fr/transfers/helicopter/nice-monaco': { redirect: { to: '/fr/transfert-helicoptere/nice-monaco', statusCode: 301 } },
    '/fr/transfers/helicopter/nice-cannes': { redirect: { to: '/fr/transfert-helicoptere/nice-cannes', statusCode: 301 } },
    '/fr/transfers/helicopter/nice-saint-tropez': { redirect: { to: '/fr/transfert-helicoptere/nice-saint-tropez', statusCode: 301 } },
    '/fr/transfers/helicopter/monaco-saint-tropez': { redirect: { to: '/fr/transfert-helicoptere/monaco-saint-tropez', statusCode: 301 } },
    // Autres slugs helico (cannes-monaco, cap-ferrat-saint-tropez, etc.) -> hub helico
    '/en/transfers/helicopter/**': { redirect: { to: '/en/helicopter-transfer', statusCode: 301 } },
    '/fr/transfers/helicopter/**': { redirect: { to: '/fr/transfert-helicoptere', statusCode: 301 } },
    // Transferts chauffeur (out of scope cette session) -> hub chauffeur
    '/en/transfers/chauffeur/**': { redirect: { to: '/en/private-chauffeur', statusCode: 301 } },
    '/fr/transfers/chauffeur/**': { redirect: { to: '/fr/chauffeur-prive', statusCode: 301 } },
    // Hub transferts legacy + anciennes landings nice-airport-* -> hub chauffeur
    '/en/transfers': { redirect: { to: '/en/private-chauffeur', statusCode: 301 } },
    '/fr/transfers': { redirect: { to: '/fr/chauffeur-prive', statusCode: 301 } },
    '/en/transfers/**': { redirect: { to: '/en/private-chauffeur', statusCode: 301 } },
    '/fr/transfers/**': { redirect: { to: '/fr/chauffeur-prive', statusCode: 301 } },
    // === Cache CDN (stale-while-revalidate via header, PAS d'ISR/swr) ===
    // On evite `swr`/`isr` en routeRules : sur le preset Vercel, ca enrobe la
    // route dans un handler ISR qui renvoie 500 au lieu de 404 quand le rendu
    // leve une erreur (URL inconnue, ou createError 404 d'une fiche au slug
    // invalide). Le cache CDN par header donne le meme effet (cache 300s,
    // stale 600s) sans casser les pages d'erreur.
    '/': { headers: { 'cache-control': 'public, max-age=0, s-maxage=300, stale-while-revalidate=600' } },
    '/en': { headers: { 'cache-control': 'public, max-age=0, s-maxage=300, stale-while-revalidate=600' } },
    '/fr': { headers: { 'cache-control': 'public, max-age=0, s-maxage=300, stale-while-revalidate=600' } },
    '/en/**': { headers: { 'cache-control': 'public, max-age=0, s-maxage=300, stale-while-revalidate=600' } },
    '/fr/**': { headers: { 'cache-control': 'public, max-age=0, s-maxage=300, stale-while-revalidate=600' } },
    // /request : tronc formulaire scenario-aware. L URL (query string)
    // contient l etat (service, prefill, etc.).
    //
    // BUG VERCEL : avec await useAsyncData, le preset Nitro Vercel
    // configure /request comme route prerender/ISR. Vercel sert alors
    // le HTML statique et STRIPPE la query string avant fallback function.
    // Verifie via middleware diag : event.node.req.url = '/fr/request'
    // (sans query) alors que la requete HTTP entrante a un query string.
    //
    // Fix : prerender: false + isr: false + cache: false + ssr: true.
    // Force Vercel a invoquer la fonction Lambda pour chaque requete
    // AVEC l URL complete preservee (query string incluse).
    '/en/request': { ssr: true, swr: false, isr: false, prerender: false, cache: false, headers: { 'cache-control': 'no-store' } },
    '/fr/request': { ssr: true, swr: false, isr: false, prerender: false, cache: false, headers: { 'cache-control': 'no-store' } },
    '/en/request/**': { ssr: true, swr: false, isr: false, prerender: false, cache: false, headers: { 'cache-control': 'no-store' } },
    '/fr/request/**': { ssr: true, swr: false, isr: false, prerender: false, cache: false, headers: { 'cache-control': 'no-store' } },
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
            "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://maps.googleapis.com https://analytics.misana-group.com",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "img-src 'self' data: https://cdn.sanity.io https://www.google-analytics.com https://www.googletagmanager.com https://*.leaderlimousines.com https://www.leaderlimousines.com https://images.unsplash.com",
            "font-src 'self' https://fonts.gstatic.com data:",
            "connect-src 'self' https://*.sanity.io https://*.supabase.co https://www.google-analytics.com https://maps.googleapis.com https://api.resend.com https://analytics.misana-group.com",
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
