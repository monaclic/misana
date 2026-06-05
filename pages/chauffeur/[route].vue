<script setup lang="ts">
// Fiche chauffeur SEO + conversion. Miroir de pages/helicopter/[route].vue
// adapte au mode chauffeur : DirectionsService Google Maps pour le trace
// routier reel, grille des 6 vehicules avec prix exacts de chauffeurRoutes.ts
// (E/V/S) + "On request" pour Range Rover / Maybach / Sprinter VIP.
// URL : /en/private-chauffeur/[route] + /fr/chauffeur-prive/[route].
import { TRANSFERS, CITIES } from '~/lib/constants';
import { VEHICLES } from '~/lib/fleet';
import { CHAUFFEUR_ROUTES, type ChauffeurPriceMatrix } from '~/lib/chauffeurRoutes';
import {
  getTransferDetail,
  getLongContent,
  formatPriceFrom,
} from '~/lib/transferDetails';

definePageMeta({ layout: 'default' });
defineI18nRoute({
  paths: {
    en: '/private-chauffeur/[route]',
    fr: '/chauffeur-prive/[route]',
  },
});

const ALLOWED_SLUGS = new Set([
  'nice-airport-monaco',
  'nice-airport-cannes',
  'nice-airport-saint-tropez',
  'nice-airport-cap-ferrat',
  'cannes-saint-tropez',
  'saint-tropez-monaco',
]);

// Mapping page slug -> chauffeurRoutes.ts route id (source de verite des prix).
const SLUG_TO_ROUTE_ID: Record<string, string> = {
  'nice-airport-monaco': 'nce-mc',
  'nice-airport-cannes': 'nce-can',
  'nice-airport-saint-tropez': 'nce-st',
  'nice-airport-cap-ferrat': 'nce-cf',
  'cannes-saint-tropez': 'can-st',
  'saint-tropez-monaco': 'st-mc',
};

// Mapping page slug -> {from, to} city slugs pour la map.
// 'nice-airport' resolu via CITY_COORDS dans TransferMap.
const SLUG_TO_CITIES: Record<string, { from: string; to: string }> = {
  'nice-airport-monaco': { from: 'nice-airport', to: 'monaco' },
  'nice-airport-cannes': { from: 'nice-airport', to: 'cannes' },
  'nice-airport-saint-tropez': { from: 'nice-airport', to: 'saint-tropez' },
  'nice-airport-cap-ferrat': { from: 'nice-airport', to: 'cap-ferrat' },
  'cannes-saint-tropez': { from: 'cannes', to: 'saint-tropez' },
  'saint-tropez-monaco': { from: 'saint-tropez', to: 'monaco' },
};

// Mapping page slug -> helico fiche slug pour cross-link (alternative aerienne).
// Uniquement pour routes longues ou pression horaire pertinente.
const HELICO_ALTERNATIVE: Record<string, string> = {
  'nice-airport-saint-tropez': 'nice-saint-tropez',
  'cannes-saint-tropez': 'cannes-saint-tropez',
  'saint-tropez-monaco': 'monaco-saint-tropez', // canonique helico
};

// 3 routes related a afficher en bas, selection editoriale du brief.
const RELATED_ROUTES: Record<string, string[]> = {
  'nice-airport-monaco': ['nice-airport-cannes', 'nice-airport-cap-ferrat', 'nice-airport-saint-tropez'],
  'nice-airport-cannes': ['nice-airport-monaco', 'cannes-saint-tropez', 'nice-airport-saint-tropez'],
  'nice-airport-saint-tropez': ['nice-airport-cannes', 'cannes-saint-tropez', 'saint-tropez-monaco'],
  'nice-airport-cap-ferrat': ['nice-airport-monaco', 'nice-airport-cannes', 'saint-tropez-monaco'],
  'cannes-saint-tropez': ['nice-airport-saint-tropez', 'saint-tropez-monaco', 'nice-airport-cannes'],
  'saint-tropez-monaco': ['nice-airport-saint-tropez', 'cannes-saint-tropez', 'nice-airport-monaco'],
};

const route = useRoute();
const config = useRuntimeConfig();
const { locale } = useI18n();
const localePath = useLocalePath();

const slug = computed(() => String(route.params.route));

if (!ALLOWED_SLUGS.has(slug.value)) {
  throw createError({ statusCode: 404, statusMessage: 'Route not found', fatal: true });
}

// Slug deja valide par le garde 404 ci-dessus (ALLOWED_SLUGS = cles de
// SLUG_TO_CITIES), donc l'acces est toujours defini.
const cityPair = computed(() => SLUG_TO_CITIES[slug.value]!);
const chRouteId = computed(() => SLUG_TO_ROUTE_ID[slug.value]);
const chRoute = computed(() => CHAUFFEUR_ROUTES.find((r) => r.id === chRouteId.value));

// City labels pour l'affichage et la map. 'nice-airport' n'est pas dans
// CITIES (qui contient 'nice'), donc on hardcode son label.
const FROM_LABELS: Record<string, { fr: string; en: string }> = {
  'nice-airport': { fr: 'Aéroport de Nice', en: 'Nice airport' },
  'cannes': { fr: 'Cannes', en: 'Cannes' },
  'saint-tropez': { fr: 'Saint-Tropez', en: 'Saint-Tropez' },
  'monaco': { fr: 'Monaco', en: 'Monaco' },
  'cap-ferrat': { fr: 'Cap-Ferrat', en: 'Cap-Ferrat' },
};

const lng = computed<'fr' | 'en'>(() => (locale.value === 'fr' ? 'fr' : 'en'));
const fromName = computed(() => FROM_LABELS[cityPair.value.from]?.[lng.value] ?? cityPair.value.from);
const toName = computed(() => FROM_LABELS[cityPair.value.to]?.[lng.value] ?? cityPair.value.to);
const fromNameDual = computed(() => FROM_LABELS[cityPair.value.from] ?? { fr: '', en: '' });
const toNameDual = computed(() => FROM_LABELS[cityPair.value.to] ?? { fr: '', en: '' });

const detail = computed(() => getTransferDetail('chauffeur', slug.value, cityPair.value.from, cityPair.value.to));
const duration = computed(() => detail.value.durationChauffeur ?? 0);
// Affichage duree friendly : "35 min" ou "1h45". Source = chauffeurRoutes.ts.
const durationLabel = computed(() => chRoute.value?.duration ?? `${duration.value} min`);

// Hero image : reutilise systematiquement le hero du PANEL CHAUFFEUR de la home
// (different du hub /private-chauffeur, choix produit). Sanity-managed via
// useHomePage, fallback CDN hardcode si Sanity timeout.
const HOME_CHAUFFEUR_FALLBACK = 'https://cdn.sanity.io/images/akpi9bfm/production/bd66c8eda07fba86a671d18245cea37cd74b0b21-1536x1024.webp?auto=format&w=1600&q=70';
const { home } = useHomePage();
const heroImage = computed(() => {
  const panel = home.value?.panels.find((p) => p.service === 'chauffeur');
  return panel?.image?.src || HOME_CHAUFFEUR_FALLBACK;
});
const ctaBgImage = heroImage;

const longContent = computed(() => getLongContent(
  'chauffeur',
  slug.value,
  fromNameDual.value,
  toNameDual.value,
  duration.value,
  detail.value.distanceKm,
  detail.value.priceFrom,
));

// Grille vehicules : 6 cards selon l'ordre du brief.
// E-Class, V-Class, S-Class : prix exact depuis chauffeurRoutes.ts.
// Range Rover, Sprinter VIP, Maybach : "On request" (FR : "Sur demande").
const FEATURED_ORDER = ['e-class', 'v-class', 's-class', 'range-rover', 'minibus', 'maybach'] as const;
const vehicleCards = computed(() => {
  const prices = (chRoute.value?.prices ?? { 'e-class': null, 'v-class': null, 's-class': null }) as ChauffeurPriceMatrix;
  return FEATURED_ORDER.map((id) => {
    const v = VEHICLES.find((veh) => veh.id === id);
    if (!v) return null;
    const price = (prices as Record<string, number | null>)[id];
    return {
      id: v.id,
      name: v.name,
      sub: locale.value === 'fr' ? v.subFr : v.sub,
      pax: v.pax,
      luggage: v.luggage,
      price: typeof price === 'number' ? price : null,
      image: v.image,
      imageMode: v.imageMode ?? 'contain',
    };
  }).filter((v): v is NonNullable<typeof v> => v !== null);
});

const seoTitle = computed(() => {
  const prefix = locale.value === 'fr' ? 'Chauffeur privé' : 'Private chauffeur';
  const sep = locale.value === 'fr' ? ' vers ' : ' to ';
  const from = locale.value === 'fr' ? 'À partir de' : 'From';
  return `${prefix} ${fromName.value}${sep}${toName.value} · ${durationLabel.value} · ${from} ${formatPriceFrom(detail.value.priceFrom, lng.value)} | Misana`;
});

const seoDescription = computed(() => {
  if (locale.value === 'fr') {
    return `Transfert chauffeur privé ${fromName.value} ${toName.value}, ${durationLabel.value}. À partir de ${formatPriceFrom(detail.value.priceFrom, 'fr')}. Mercedes E-Class, V-Class, S-Class. Réponse sous 30 min.`;
  }
  return `Private chauffeur transfer ${fromName.value} to ${toName.value}, ${durationLabel.value}. From ${formatPriceFrom(detail.value.priceFrom, 'en')}. Mercedes E-Class, V-Class, S-Class. Reply within 30 min.`;
});

const siteUrl = (config.public.siteUrl as string) || 'https://misana-group.com';
const canonicalUrl = computed(() => (
  locale.value === 'fr'
    ? `${siteUrl}/fr/chauffeur-prive/${slug.value}`
    : `${siteUrl}/en/private-chauffeur/${slug.value}`
));
const altEnUrl = computed(() => `${siteUrl}/en/private-chauffeur/${slug.value}`);
const altFrUrl = computed(() => `${siteUrl}/fr/chauffeur-prive/${slug.value}`);

useSeoMeta({
  title: () => seoTitle.value,
  description: () => seoDescription.value,
  ogTitle: () => seoTitle.value,
  ogDescription: () => seoDescription.value,
  ogImage: () => heroImage.value,
  ogUrl: () => canonicalUrl.value,
  twitterImage: () => heroImage.value,
  robots: 'index,follow',
});

useHead({
  link: [
    { rel: 'canonical', href: canonicalUrl.value },
    { rel: 'alternate', hreflang: 'en', href: altEnUrl.value },
    { rel: 'alternate', hreflang: 'fr', href: altFrUrl.value },
    { rel: 'alternate', hreflang: 'x-default', href: altEnUrl.value },
  ],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: `Private chauffeur ${fromName.value} to ${toName.value}`,
        provider: { '@type': 'Organization', name: 'Misana', url: siteUrl },
        serviceType: 'Private chauffeur transfer',
        areaServed: [fromName.value, toName.value],
        description: seoDescription.value,
        offers: {
          '@type': 'Offer',
          price: detail.value.priceFrom,
          priceCurrency: 'EUR',
          priceValidUntil: '2026-12-31',
          availability: 'https://schema.org/InStock',
          url: canonicalUrl.value,
        },
      }),
    },
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Misana', item: siteUrl },
          {
            '@type': 'ListItem',
            position: 2,
            name: locale.value === 'fr' ? 'Chauffeur privé' : 'Private chauffeur',
            item: `${siteUrl}${localePath({ name: 'chauffeur' })}`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: `${fromName.value} → ${toName.value}`,
            item: canonicalUrl.value,
          },
        ],
      }),
    },
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'TouristTrip',
        name: seoTitle.value,
        description: seoDescription.value,
        provider: { '@type': 'Organization', name: 'Misana' },
        itinerary: {
          '@type': 'ItemList',
          itemListElement: [
            { '@type': 'Place', name: fromName.value },
            { '@type': 'Place', name: toName.value },
          ],
        },
      }),
    },
    ...(longContent.value.faq?.length
      ? [{
          type: 'application/ld+json',
          innerHTML: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: longContent.value.faq.map((f) => ({
              '@type': 'Question',
              name: f.q[lng.value],
              acceptedAnswer: { '@type': 'Answer', text: f.a[lng.value] },
            })),
          }),
        }]
      : []),
  ],
});

const related = computed(() => {
  const slugs = RELATED_ROUTES[slug.value] ?? Array.from(ALLOWED_SLUGS).filter((s) => s !== slug.value);
  return slugs
    .map((s) => {
      const rId = SLUG_TO_ROUTE_ID[s];
      const cr = CHAUFFEUR_ROUTES.find((r) => r.id === rId);
      // s provient de RELATED_ROUTES/ALLOWED_SLUGS, tous cles de SLUG_TO_CITIES.
      const cp = SLUG_TO_CITIES[s]!;
      const det = getTransferDetail('chauffeur', s, cp.from, cp.to);
      return { slug: s, route: cr, det, cities: cp };
    })
    .filter((r): r is NonNullable<typeof r> & { route: NonNullable<typeof r.route> } => Boolean(r.route));
});

const trustBadges = computed(() => ([
  { title: locale.value === 'fr' ? 'Meet & greet inclus' : 'Meet & greet included', desc: locale.value === 'fr' ? 'Panneau au nom du voyageur' : 'Name sign at arrival' },
  { title: locale.value === 'fr' ? 'Suivi des vols' : 'Flight tracking', desc: locale.value === 'fr' ? 'Pickup ajusté en temps réel' : 'Pickup adjusted in real time' },
  { title: locale.value === 'fr' ? '1h d\'attente gratuite' : '1h free waiting', desc: locale.value === 'fr' ? 'Sur les vols suivis' : 'On tracked flights' },
  { title: locale.value === 'fr' ? 'Réponse 30 min' : 'Reply within 30 min', desc: locale.value === 'fr' ? '7j/7, équipe à Nice' : '7 days, team in Nice' },
]));

// Inclus dans le service : promesses chauffeur (different du helico).
const inclusions = computed(() => ([
  {
    title: locale.value === 'fr' ? 'Accueil personnalisé' : 'Personal welcome',
    desc: locale.value === 'fr' ? 'Chauffeur au terminal ou à la grille de votre villa. Panneau au nom du voyageur.' : 'Chauffeur at the terminal or villa gate. Name sign for the traveller.',
  },
  {
    title: locale.value === 'fr' ? 'Eau, wifi, sièges enfants' : 'Water, wifi, child seats',
    desc: locale.value === 'fr' ? 'Rafraîchissements et wifi à bord. Sièges enfants sur demande au booking.' : 'Refreshments and wifi onboard. Child seats on request at booking.',
  },
  {
    title: locale.value === 'fr' ? 'Tarif fixe au booking' : 'Flat fare at booking',
    desc: locale.value === 'fr' ? 'Prix confirmé à la réservation. Pas de surprise, pas de supplément bagages.' : 'Price confirmed at booking. No surprise, no luggage surcharge.',
  },
  {
    title: locale.value === 'fr' ? 'Annulation gratuite 24h' : 'Free cancellation 24h',
    desc: locale.value === 'fr' ? 'Jusqu\'à 24h avant le pickup. Force majeure : remboursement intégral.' : 'Up to 24h before pickup. Force majeure: full refund.',
  },
]));

const howSteps = computed(() => ([
  { n: '01', title: locale.value === 'fr' ? 'Demandez un devis' : 'Request a quote', desc: locale.value === 'fr' ? 'Trente secondes pour préciser date, heure, passagers, bagages.' : 'Thirty seconds to set date, time, passengers, luggage.' },
  { n: '02', title: locale.value === 'fr' ? 'Confirmation sous 30 min' : 'Confirmed within 30 min', desc: locale.value === 'fr' ? 'Véhicule, chauffeur, prix final coordonnés par notre équipe.' : 'Vehicle, chauffeur, final price coordinated by our team.' },
  { n: '03', title: locale.value === 'fr' ? 'Trajet porte-à-porte' : 'Door-to-door transfer', desc: locale.value === 'fr' ? 'Mercedes à votre point de pickup, dépose à l\'adresse finale.' : 'Mercedes at your pickup point, drop at the final address.' },
]));

// CTA /request : preserve query string (path + query objet, pas localePath
// avec objet sinon query strippe). Pour chauffeur on envoie les input
// defaults (texte ville) pas des codes IATA -> matche scenario chauffeur.
const requestCta = computed(() => ({
  path: localePath('/request'),
  query: {
    service: 'chauffeur',
    mode: 'transfer',
    route: chRouteId.value,
    from: chRoute.value?.fromInputDefault ?? cityPair.value.from,
    to: chRoute.value?.toInputDefault ?? cityPair.value.to,
  },
}));

const headerTransparent = useState<boolean>('header-transparent', () => true);
const heroRef = ref<HTMLElement | null>(null);

// Header passe blanc des que l'utilisateur a scrolle 80px. Plus reactif
// qu'un IntersectionObserver sur le hero entier (qui attend que toute la
// section soit hors viewport avant de switcher).
const SCROLL_THRESHOLD = 80;
function onScroll() {
  headerTransparent.value = window.scrollY < SCROLL_THRESHOLD;
}

// Sticky bottom CTA mobile : iOS Safari layout-le contre le layout
// viewport (taille initiale, URL bar visible). Quand l'URL bar se cache
// au scroll, le visual viewport s'agrandit vers le bas mais le sticky
// reste a sa position d'origine -> espace vide entre le CTA et le vrai
// bas du viewport visible. On ecoute visualViewport.resize et on
// translate le sticky du delta pour qu'il colle au visual viewport.
// transform-gpu seul (CSS) ne suffit pas sur iOS Safari recent.
const stickyBottomRef = ref<HTMLElement | null>(null);
function syncStickyBottom() {
  const el = stickyBottomRef.value;
  if (!el || !window.visualViewport) return;
  const diff = window.visualViewport.height - window.innerHeight;
  // diff > 0 : URL bar cachee, on descend le CTA. diff <= 0 : keyboard
  // ouvert ou state initial, on laisse l'element au repos.
  el.style.transform = diff > 0 ? `translate3d(0, ${diff}px, 0)` : '';
}

onMounted(() => {
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
  if (window.visualViewport) {
    syncStickyBottom();
    window.visualViewport.addEventListener('resize', syncStickyBottom, { passive: true });
    window.visualViewport.addEventListener('scroll', syncStickyBottom, { passive: true });
  }
});

onBeforeUnmount(() => {
  headerTransparent.value = false;
  window.removeEventListener('scroll', onScroll);
  if (window.visualViewport) {
    window.visualViewport.removeEventListener('resize', syncStickyBottom);
    window.visualViewport.removeEventListener('scroll', syncStickyBottom);
  }
});
</script>

<template>
  <main class="bg-misana-paper text-misana-ink pb-24 lg:pb-0">
    <!-- ==================================================
         01. HERO 68vh immersif
         ================================================== -->
    <section
      ref="heroRef"
      class="relative h-[68vh] sm:h-[72vh] min-h-[480px] overflow-hidden -mt-16 lg:-mt-24 bg-misana-ink"
    >
      <img
        :src="heroImage"
        :alt="`${fromName} → ${toName} by private chauffeur`"
        class="absolute inset-0 w-full h-full object-cover"
      />
      <div class="absolute inset-0 bg-misana-ink/30"></div>
      <div class="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-misana-ink/85 via-misana-ink/40 to-transparent"></div>

      <div class="relative h-full max-w-[1400px] mx-auto px-5 sm:px-8 flex flex-col justify-end pb-10 sm:pb-16 text-misana-paper">
        <div class="inline-flex items-center gap-2 self-start text-[11px] uppercase tracking-[0.2em] opacity-85 mb-5 px-3 py-1.5 border border-misana-paper/30 rounded-full backdrop-blur-sm">
          <span class="w-1.5 h-1.5 rounded-full bg-misana-paper"></span>
          {{ locale === 'fr' ? 'Chauffeur privé Côte d\'Azur' : 'French Riviera private chauffeur' }}
        </div>

        <h1 class="text-3xl sm:text-5xl lg:text-6xl font-semibold leading-[1.05] tracking-tight mb-3 max-w-3xl">
          {{ locale === 'fr' ? 'Chauffeur privé' : 'Private chauffeur' }}<br />
          {{ fromName }} <span class="opacity-70">→</span> {{ toName }}
        </h1>

        <p class="text-lg sm:text-xl opacity-85 mb-7 max-w-2xl leading-snug">
          <span class="font-semibold tabular-nums">{{ durationLabel }}</span> {{ locale === 'fr' ? 'porte-à-porte' : 'door-to-door' }}.
          {{ locale === 'fr' ? 'À partir de' : 'From' }} <span class="font-semibold tabular-nums">{{ formatPriceFrom(detail.priceFrom, lng) }}</span>.
        </p>

        <div class="hidden lg:flex flex-wrap items-center gap-3">
          <NuxtLink
            :to="requestCta"
            class="inline-flex items-center gap-2.5 bg-misana-paper text-misana-ink px-6 sm:px-8 py-3.5 rounded-full text-sm font-semibold hover:opacity-90 transition group"
          >
            <span>{{ locale === 'fr' ? 'Devis sous 30 min' : 'Get quote in 30 min' }}</span>
            <span class="transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true">→</span>
          </NuxtLink>
          <a
            href="#pricing"
            class="inline-flex items-center gap-2 text-sm text-misana-paper/85 hover:text-misana-paper transition px-4 py-3.5"
          >
            <span>{{ locale === 'fr' ? 'Voir véhicules et tarifs' : 'See vehicles & pricing' }}</span>
            <span aria-hidden="true">↓</span>
          </a>
        </div>
      </div>
    </section>

    <!-- Wrapper : mobile inversion ordre Trust / Booking+Map -->
    <div class="flex flex-col">
      <!-- ==================================================
           02. TRUST STRIP
           ================================================== -->
      <section class="border-b border-misana-line bg-misana-paper order-2 lg:order-1">
        <div class="max-w-[1400px] mx-auto px-5 sm:px-8 py-7 sm:py-9">
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-5">
            <div v-for="(b, i) in trustBadges" :key="i" class="flex gap-2.5">
              <span class="flex-shrink-0 w-5 h-5 mt-0.5 rounded-full bg-misana-ink/5 flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" class="w-3 h-3" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M5 13L9 17L19 7" />
                </svg>
              </span>
              <div class="leading-tight">
                <p class="text-sm font-semibold mb-0.5">{{ b.title }}</p>
                <p class="text-xs text-misana-muted">{{ b.desc }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ==================================================
           03. BOOKING + MAP (widget 7 cols, map 5)
           ================================================== -->
      <section class="order-1 lg:order-2">
        <div class="max-w-[1400px] mx-auto px-5 sm:px-8 py-12 sm:py-16 grid lg:grid-cols-12 gap-6 lg:gap-8 lg:items-stretch">
          <div class="lg:col-span-5 lg:flex lg:flex-col">
            <TransferMap
              :from="cityPair.from"
              :to="cityPair.to"
              mode="chauffeur"
              :from-name="fromName"
              :to-name="toName"
            />
          </div>
          <aside class="lg:col-span-7 lg:flex lg:flex-col">
            <!-- Widget : on passe les adresses (fromInputDefault) plutot
                 que les slugs ('nice-airport') pour que le scenario
                 ChauffeurTransferScenario reconnaisse l'origine/destination
                 sur /request. Memes valeurs que le hub /private-chauffeur. -->
            <TransferReservationWidget
              :slug="slug"
              mode="chauffeur"
              :from-city="chRoute?.fromInputDefault ?? cityPair.from"
              :to-city="chRoute?.toInputDefault ?? cityPair.to"
              :from-name="fromName"
              :to-name="toName"
              :price-from="detail.priceFrom"
              :pax-min="detail.paxMin"
              :pax-max="detail.paxMax"
              :bidirectional="false"
              variant="inline"
            />
          </aside>
        </div>
      </section>
    </div>

    <!-- ==================================================
         05. VEHICLES & PRICING (6 cards)
         ================================================== -->
    <section v-if="vehicleCards.length" id="pricing" class="border-t border-misana-line scroll-mt-24">
      <div class="max-w-[1400px] mx-auto px-5 sm:px-8 py-12 sm:py-16">
        <div class="flex items-baseline justify-between mb-7 flex-wrap gap-2">
          <div>
            <p class="text-[11px] uppercase tracking-[0.2em] text-misana-muted mb-2">
              {{ locale === 'fr' ? 'Véhicules et tarifs' : 'Vehicles & pricing' }}
            </p>
            <h2 class="text-2xl sm:text-3xl font-semibold leading-tight">
              {{ vehicleCards.length }}
              {{ locale === 'fr' ? 'véhicules disponibles' : 'vehicles available' }}
            </h2>
          </div>
          <p class="text-[11px] text-misana-muted">
            {{ locale === 'fr' ? 'One-way, taxes et accueil inclus' : 'One-way, taxes and welcome included' }}
          </p>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-7">
          <NuxtLink
            v-for="v in vehicleCards"
            :key="v.id"
            :to="{
              path: localePath('/request'),
              query: {
                service: 'chauffeur',
                mode: 'transfer',
                route: chRouteId,
                from: chRoute?.fromInputDefault ?? cityPair.from,
                to: chRoute?.toInputDefault ?? cityPair.to,
                vehicle: v.id,
              },
            }"
            class="fleet-card"
          >
            <div class="fleet-card-top">
              <div class="fleet-header">
                <h3 class="fleet-name">{{ v.name }}</h3>
                <p class="fleet-price">
                  <span v-if="v.price !== null" class="fleet-price-value">{{ formatPriceFrom(v.price, lng) }}</span>
                  <span v-else class="fleet-price-onrequest">
                    {{ locale === 'fr' ? 'Sur demande' : 'On request' }}
                  </span>
                </p>
              </div>
              <p class="fleet-type">{{ v.sub }}</p>
            </div>

            <div class="fleet-image-wrap" :class="v.imageMode === 'cover' ? 'fleet-image-cover' : 'fleet-image-contain'">
              <img :src="v.image" :alt="v.name" loading="lazy" draggable="false" class="fleet-image" />
            </div>

            <div class="fleet-stats">
              <div class="fleet-stat">
                <p class="fleet-stat-label">{{ locale === 'fr' ? 'Type' : 'Type' }}</p>
                <p class="fleet-stat-value">{{ v.sub }}</p>
              </div>
              <span class="fleet-stat-divider" aria-hidden="true"></span>
              <div class="fleet-stat">
                <p class="fleet-stat-label">{{ locale === 'fr' ? 'Places' : 'Seats' }}</p>
                <p class="fleet-stat-value">{{ v.pax }}</p>
              </div>
              <span class="fleet-stat-divider" aria-hidden="true"></span>
              <div class="fleet-stat">
                <p class="fleet-stat-label">{{ locale === 'fr' ? 'Bagages' : 'Luggage' }}</p>
                <p class="fleet-stat-value">{{ v.luggage }}</p>
              </div>
            </div>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- ==================================================
         06. INCLUS DANS LE SERVICE
         ================================================== -->
    <section class="border-t border-misana-line bg-misana-paper">
      <div class="max-w-[1400px] mx-auto px-5 sm:px-8 py-12 sm:py-16">
        <p class="text-[11px] uppercase tracking-[0.2em] text-misana-muted mb-2">
          {{ locale === 'fr' ? 'Inclus dans le service' : "What's included" }}
        </p>
        <h2 class="text-2xl sm:text-3xl font-semibold mb-7 max-w-2xl leading-tight">
          {{ locale === 'fr' ? 'De la porte de départ à la porte d\'arrivée' : 'From doorstep to doorstep' }}
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-6">
          <div v-for="(item, i) in inclusions" :key="i" class="flex gap-3">
            <span class="flex-shrink-0 w-6 h-6 mt-0.5 rounded-full bg-misana-ink text-misana-paper flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" class="w-3.5 h-3.5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M5 13L9 17L19 7" />
              </svg>
            </span>
            <div>
              <p class="text-base font-semibold mb-1 leading-tight">{{ item.title }}</p>
              <p class="text-sm text-misana-ink/75 leading-relaxed">{{ item.desc }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ==================================================
         07. HOW IT WORKS (3 steps)
         ================================================== -->
    <section class="border-t border-misana-line">
      <div class="max-w-[1400px] mx-auto px-5 sm:px-8 py-12 sm:py-16">
        <p class="text-[11px] uppercase tracking-[0.2em] text-misana-muted mb-2">
          {{ locale === 'fr' ? 'Comment ça marche' : 'How it works' }}
        </p>
        <h2 class="text-2xl sm:text-3xl font-semibold mb-8 max-w-2xl leading-tight">
          {{ locale === 'fr' ? 'De la demande au pickup' : 'From request to pickup' }}
        </h2>
        <ol class="grid sm:grid-cols-3 gap-6 sm:gap-10">
          <li v-for="step in howSteps" :key="step.n" class="flex flex-col">
            <span class="text-3xl sm:text-4xl font-semibold tabular-nums text-misana-muted/40 mb-3 leading-none">{{ step.n }}</span>
            <p class="text-base sm:text-lg font-semibold mb-2 leading-tight">{{ step.title }}</p>
            <p class="text-sm text-misana-ink/75 leading-relaxed">{{ step.desc }}</p>
          </li>
        </ol>
      </div>
    </section>

    <!-- ==================================================
         08. PICKUP & DROP-OFF (equivalent heliports helico)
         ================================================== -->
    <section
      v-if="longContent.hubFromTitle && longContent.hubToTitle && longContent.hubFromDesc && longContent.hubToDesc"
      class="border-t border-misana-line bg-misana-paper"
    >
      <div class="max-w-[1400px] mx-auto px-5 sm:px-8 py-12 sm:py-16">
        <p class="text-[11px] uppercase tracking-[0.2em] text-misana-muted mb-2">
          {{ locale === 'fr' ? 'Pickup et drop-off' : 'Pickup and drop-off' }}
        </p>
        <h2 class="text-2xl sm:text-3xl font-semibold mb-7 leading-tight">
          {{ locale === 'fr' ? 'Départ et arrivée' : 'Departure and arrival' }}
        </h2>
        <div class="grid sm:grid-cols-2 gap-6 sm:gap-10">
          <div class="border-l border-misana-line pl-5">
            <div class="flex items-center gap-2 mb-2">
              <span class="inline-block w-1.5 h-1.5 rounded-full border border-misana-ink"></span>
              <p class="text-[10px] uppercase tracking-[0.2em] text-misana-muted">
                {{ locale === 'fr' ? 'Départ' : 'Departure' }}
              </p>
            </div>
            <p class="text-base font-semibold leading-tight mb-2">{{ longContent.hubFromTitle[lng] }}</p>
            <p class="text-sm text-misana-ink/80 leading-relaxed">{{ longContent.hubFromDesc[lng] }}</p>
          </div>
          <div class="border-l border-misana-ink pl-5">
            <div class="flex items-center gap-2 mb-2">
              <span class="inline-block w-1.5 h-1.5 rounded-full bg-misana-ink"></span>
              <p class="text-[10px] uppercase tracking-[0.2em] text-misana-muted">
                {{ locale === 'fr' ? 'Arrivée' : 'Arrival' }}
              </p>
            </div>
            <p class="text-base font-semibold leading-tight mb-2">{{ longContent.hubToTitle[lng] }}</p>
            <p class="text-sm text-misana-ink/80 leading-relaxed">{{ longContent.hubToDesc[lng] }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ==================================================
         09a. ABOUT this route + Why this transfer
         ================================================== -->
    <section class="border-t border-misana-line">
      <div class="max-w-[1400px] mx-auto px-5 sm:px-8 py-12 sm:py-16">
        <p class="text-[11px] uppercase tracking-[0.2em] text-misana-muted mb-2">
          {{ locale === 'fr' ? 'À propos' : 'About' }}
        </p>
        <h2 class="text-2xl sm:text-3xl font-semibold mb-7 leading-tight">
          {{ fromName }} <span class="text-misana-muted">→</span> {{ toName }}
        </h2>
        <p class="text-sm sm:text-base leading-[1.75] text-misana-ink max-w-4xl mb-10 sm:mb-12">
          {{ longContent.about[lng] }}
        </p>
        <p class="text-[11px] uppercase tracking-[0.2em] text-misana-muted mb-5">
          {{ locale === 'fr' ? 'Pourquoi ce trajet' : 'Why this transfer' }}
        </p>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          <div
            v-for="(r, i) in longContent.whyMode[lng]"
            :key="i"
            class="border-l-2 border-misana-ink pl-4 py-1"
          >
            <p class="text-[10px] uppercase tracking-wider text-misana-muted mb-1 tabular-nums">
              {{ String(i + 1).padStart(2, '0') }}
            </p>
            <p class="text-sm leading-snug">{{ r }}</p>
          </div>
        </div>

        <!-- Alternative helico : lien contextual sur les routes longues -->
        <div v-if="HELICO_ALTERNATIVE[slug]" class="mt-10 sm:mt-12 p-5 sm:p-6 border border-misana-line rounded-md bg-misana-stone/30 flex items-start gap-4 flex-wrap sm:flex-nowrap">
          <div class="flex-1 min-w-0">
            <p class="text-[10px] uppercase tracking-wider text-misana-muted mb-1.5">
              {{ locale === 'fr' ? 'Alternative aérienne' : 'Air alternative' }}
            </p>
            <p class="text-sm sm:text-base leading-snug">
              {{ locale === 'fr'
                ? `Pour les itinéraires sous pression horaire, l'hélicoptère ramène la liaison à quelques minutes.`
                : `For time-pressured itineraries, the helicopter brings the trip down to a few minutes.` }}
            </p>
          </div>
          <NuxtLink
            :to="localePath({ name: 'helicopter-route', params: { route: HELICO_ALTERNATIVE[slug] } })"
            class="inline-flex items-center gap-2 text-sm font-semibold text-misana-ink hover:opacity-70 transition whitespace-nowrap"
          >
            <span>{{ locale === 'fr' ? 'Voir hélicoptère' : 'See helicopter' }}</span>
            <span aria-hidden="true">→</span>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- ==================================================
         09b. FAQ
         ================================================== -->
    <section v-if="longContent.faq?.length" class="border-t border-misana-line bg-misana-paper">
      <div class="max-w-[1400px] mx-auto px-5 sm:px-8 py-12 sm:py-16">
        <p class="text-[11px] uppercase tracking-[0.2em] text-misana-muted mb-2">FAQ</p>
        <h2 class="text-2xl sm:text-3xl font-semibold mb-7 leading-tight">
          {{ locale === 'fr' ? 'Questions fréquentes' : 'Frequently asked' }}
        </h2>
        <div class="grid lg:grid-cols-2 lg:gap-x-12">
          <details
            v-for="(item, i) in longContent.faq"
            :key="i"
            class="group py-4 border-b border-misana-line"
          >
            <summary class="flex items-center justify-between cursor-pointer list-none gap-4">
              <span class="text-sm sm:text-base font-medium pr-4 leading-snug">{{ item.q[lng] }}</span>
              <span class="text-misana-muted text-xl leading-none transition-transform group-open:rotate-45 flex-shrink-0">+</span>
            </summary>
            <p class="mt-3 text-sm text-misana-ink/80 leading-relaxed pr-8">{{ item.a[lng] }}</p>
          </details>
        </div>
      </div>
    </section>

    <!-- ==================================================
         10. OTHER ROUTES
         ================================================== -->
    <section v-if="related.length" class="border-t border-misana-line bg-misana-paper">
      <div class="max-w-[1400px] mx-auto px-5 sm:px-8 py-12 sm:py-16">
        <p class="text-[11px] uppercase tracking-[0.2em] text-misana-muted mb-5">
          {{ locale === 'fr' ? 'Autres liaisons chauffeur' : 'Other chauffeur transfers' }}
        </p>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
          <NuxtLink
            v-for="other in related"
            :key="other.slug"
            :to="localePath({ name: 'chauffeur-route', params: { route: other.slug } })"
            class="border border-misana-line rounded-md p-4 sm:p-5 hover:border-misana-ink transition group"
          >
            <p class="text-[10px] uppercase tracking-[0.16em] text-misana-muted mb-1.5">
              {{ locale === 'fr' ? 'Chauffeur' : 'Chauffeur' }}
            </p>
            <p class="text-sm sm:text-base font-semibold mb-3 leading-tight">
              {{ locale === 'fr' ? other.route.fromLabelFr : other.route.fromLabel }}
              <span class="opacity-50">→</span>
              {{ locale === 'fr' ? other.route.toLabelFr : other.route.toLabel }}
            </p>
            <div class="flex items-baseline justify-between text-xs">
              <span class="text-misana-muted">{{ other.route.duration }}</span>
              <span class="font-semibold tabular-nums">{{ formatPriceFrom(other.det.priceFrom, lng) }}</span>
            </div>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- ==================================================
         11. FOOTER CTA (desktop only)
         ================================================== -->
    <section class="hidden lg:block relative overflow-hidden text-misana-paper">
      <img
        :src="ctaBgImage"
        alt=""
        aria-hidden="true"
        class="absolute inset-0 w-full h-full object-cover"
      />
      <div class="absolute inset-0 bg-misana-ink/75"></div>
      <div class="relative max-w-[1400px] mx-auto px-5 sm:px-8 py-20 text-center">
        <p class="text-[11px] uppercase tracking-[0.22em] opacity-70 mb-3">
          {{ locale === 'fr' ? 'Prêt à partir ?' : 'Ready to go?' }}
        </p>
        <h2 class="text-3xl lg:text-5xl font-semibold mb-4 leading-tight">
          {{ fromName }} <span class="opacity-60">→</span> {{ toName }}
        </h2>
        <p class="text-sm sm:text-base opacity-85 mb-7">
          {{ durationLabel }}
          <span class="opacity-50 mx-1.5">·</span>
          {{ locale === 'fr' ? 'À partir de' : 'From' }} {{ formatPriceFrom(detail.priceFrom, lng) }}
          <span class="opacity-50 mx-1.5">·</span>
          {{ detail.paxMin }}-{{ detail.paxMax }} pax
        </p>
        <NuxtLink
          :to="requestCta"
          class="inline-flex items-center gap-2.5 bg-misana-paper text-misana-ink px-8 py-4 rounded-full text-sm font-semibold hover:opacity-90 transition group"
        >
          <span>{{ locale === 'fr' ? 'Devis sous 30 min' : 'Get quote in 30 min' }}</span>
          <span class="transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true">→</span>
        </NuxtLink>
      </div>
    </section>

    <!-- ==================================================
         STICKY BOTTOM mobile CTA
         transform-gpu + ref pilote par syncStickyBottom() qui ecoute
         visualViewport.resize pour suivre le visual viewport iOS Safari
         (l'URL bar se cache au scroll et libere de l'espace en bas).
         pb safe-area-inset : respecte la home-indicator iPhone X+.
         ================================================== -->
    <div
      ref="stickyBottomRef"
      class="lg:hidden fixed bottom-0 inset-x-0 bg-misana-ink text-misana-paper px-5 pt-3.5 z-40 shadow-2xl border-t border-misana-ink transform-gpu will-change-transform"
      style="padding-bottom: calc(0.875rem + env(safe-area-inset-bottom));"
    >
      <div class="flex items-center justify-between gap-4">
        <div class="leading-tight">
          <p class="text-[10px] uppercase tracking-[0.18em] opacity-70">
            {{ locale === 'fr' ? 'À partir de' : 'From' }}
          </p>
          <p class="text-lg font-semibold tabular-nums">{{ formatPriceFrom(detail.priceFrom, lng) }}</p>
        </div>
        <NuxtLink
          :to="requestCta"
          class="inline-flex items-center gap-2 bg-misana-paper text-misana-ink px-5 py-3 rounded-full text-sm font-semibold"
        >
          <span>{{ locale === 'fr' ? 'Demander' : 'Request' }}</span>
          <span aria-hidden="true">→</span>
        </NuxtLink>
      </div>
    </div>
  </main>
</template>

<style scoped>
details summary::-webkit-details-marker { display: none; }

/* === Fleet card (calque hub /private-chauffeur) === */
/* PNG transparents (E/V/S, Range, Maybach) -> fond blanc via fleet-image-contain.
   Sprinter VIP (JPG avec ciel) -> fond stone via fleet-image-cover. */
.fleet-card {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1.75rem 1.5rem 1.5rem;
  background: var(--color-misana-paper);
  border: 1px solid var(--color-misana-line);
  border-radius: 12px;
  text-decoration: none;
  color: var(--color-misana-ink);
  transition: border-color 0.4s ease, transform 0.4s ease;
}
.fleet-card:hover {
  border-color: var(--color-misana-ink);
  transform: translateY(-2px);
}

.fleet-card-top { display: flex; flex-direction: column; gap: 0.35rem; }
.fleet-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
}
.fleet-name {
  font-family: var(--font-display, serif);
  font-size: 1.3rem;
  line-height: 1.15;
  margin: 0;
  color: var(--color-misana-ink);
}
.fleet-price { margin: 0; white-space: nowrap; }
.fleet-price-value {
  font-family: var(--font-display, serif);
  font-size: 1.15rem;
  color: var(--color-misana-ink);
  font-variant-numeric: lining-nums tabular-nums;
}
.fleet-price-onrequest {
  font-size: 0.72rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--color-misana-muted);
}
.fleet-type {
  font-size: 0.72rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--color-misana-muted);
  margin: 0;
}

.fleet-image-wrap {
  width: 100%;
  aspect-ratio: 16 / 9;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.fleet-image-contain { background: transparent; }
.fleet-image-cover {
  background: var(--color-misana-stone);
  border-radius: 8px;
}
.fleet-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  transition: transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
}
.fleet-image-cover .fleet-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  transform: scale(1.18);
}
.fleet-card:hover .fleet-image { transform: scale(1.04); }
.fleet-card:hover .fleet-image-cover .fleet-image { transform: scale(1.22); }

.fleet-stats {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding-top: 1.25rem;
  border-top: 1px solid var(--color-misana-line);
}
.fleet-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.3rem;
  flex: 1;
  min-width: 0;
}
.fleet-stat-label {
  font-size: 0.62rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--color-misana-muted);
  margin: 0;
}
.fleet-stat-value {
  font-family: var(--font-display, serif);
  font-size: 1.05rem;
  line-height: 1;
  color: var(--color-misana-ink);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.fleet-stat-divider {
  width: 1px;
  height: 28px;
  background: var(--color-misana-line);
  flex-shrink: 0;
}
</style>
