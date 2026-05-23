<script setup lang="ts">
// Fiche helicoptere SEO + conversion. Inspiration Wheely/Blade : visuel,
// trust prominents, booking integre. Persona : arrivee SEO froide.
// URL : /en/helicopter-transfer/[route] + /fr/transfert-helicoptere/[route].
import { TRANSFERS, CITIES } from '~/lib/constants';
import { HELICOPTERS } from '~/lib/fleet';
import { routePrice } from '~/lib/heliRoutes';
import {
  getTransferDetail,
  getHeroImage,
  getLongContent,
  formatPriceFrom,
} from '~/lib/transferDetails';

definePageMeta({ layout: 'default' });
defineI18nRoute({
  paths: {
    en: '/helicopter-transfer/[route]',
    fr: '/transfert-helicoptere/[route]',
  },
});

const ALLOWED_SLUGS = new Set([
  'nice-monaco',
  'nice-cannes',
  'nice-saint-tropez',
  'monaco-saint-tropez',
]);

const SLUG_TO_IATA: Record<string, [string, string]> = {
  'nice-monaco': ['NCE', 'MCM'],
  'nice-cannes': ['NCE', 'CEQ'],
  'nice-saint-tropez': ['NCE', 'LTT'],
  'monaco-saint-tropez': ['MCM', 'LTT'],
};

const ROAD_COMPARISON: Record<string, { offPeakMin: number; peakNoteFr: string; peakNoteEn: string }> = {
  'nice-monaco': { offPeakMin: 60, peakNoteFr: 'Jusqu\'a 90+ min pendant le Grand Prix', peakNoteEn: '90+ min during the Grand Prix' },
  'nice-cannes': { offPeakMin: 30, peakNoteFr: 'Plus d\'une heure pendant le Festival', peakNoteEn: 'Over an hour during the Festival' },
  'nice-saint-tropez': { offPeakMin: 120, peakNoteFr: 'Jusqu\'a 180 min en juillet-aout', peakNoteEn: 'Up to 180 min in July-August' },
  'monaco-saint-tropez': { offPeakMin: 100, peakNoteFr: 'Jusqu\'a 180 min en saison', peakNoteEn: 'Up to 180 min in peak season' },
};

const route = useRoute();
const config = useRuntimeConfig();
const { locale } = useI18n();
const localePath = useLocalePath();

const slug = computed(() => String(route.params.route));

if (!ALLOWED_SLUGS.has(slug.value)) {
  throw createError({ statusCode: 404, statusMessage: 'Route not found', fatal: true });
}

const transferEntry = TRANSFERS.find((tr) => tr.slug === slug.value);
if (!transferEntry || (transferEntry.mode !== 'helicopter' && transferEntry.mode !== 'both')) {
  throw createError({ statusCode: 404, statusMessage: 'Route not found', fatal: true });
}

const fromCity = computed(() => CITIES.find((c) => c.slug === transferEntry.from));
const toCity = computed(() => CITIES.find((c) => c.slug === transferEntry.to));
const lng = computed<'fr' | 'en'>(() => (locale.value === 'fr' ? 'fr' : 'en'));

const fromName = computed(() => (fromCity.value ? fromCity.value[lng.value] : ''));
const toName = computed(() => (toCity.value ? toCity.value[lng.value] : ''));

const fromNameDual = computed(() => ({ fr: fromCity.value?.fr ?? '', en: fromCity.value?.en ?? '' }));
const toNameDual = computed(() => ({ fr: toCity.value?.fr ?? '', en: toCity.value?.en ?? '' }));

const detail = computed(() => getTransferDetail('helicopter', slug.value, transferEntry.from, transferEntry.to));
const heroImage = computed(() => getHeroImage('helicopter', slug.value));
const duration = computed(() => detail.value.durationHelicopter ?? 0);

// Image background pour le footer CTA : reutilise le hero de la page mere
// helicopter (override Sanity si dispo, sinon fallback Leader Limousines).
const HELI_FALLBACK = 'https://www.leaderlimousines.com/cdn/shop/files/Helicopter_H125_flying_over_the_sea.jpg?v=1773610994&width=1500';
const { hub: heliHub } = useServiceHub('helicopter');
const ctaBgImage = computed(() => heliHub.value?.heroImage || HELI_FALLBACK);

const longContent = computed(() => getLongContent(
  'helicopter',
  slug.value,
  fromNameDual.value,
  toNameDual.value,
  duration.value,
  detail.value.distanceKm,
  detail.value.priceFrom,
));

const aircraftPrices = computed(() => {
  const [fromIata, toIata] = SLUG_TO_IATA[slug.value] ?? ['NCE', 'MCM'];
  return HELICOPTERS.map((h) => {
    const price = routePrice(fromIata, toIata, h.id);
    return {
      id: h.id,
      name: h.name,
      engine: locale.value === 'fr' ? h.engineFr : h.engine,
      pax: h.pax,
      price: typeof price === 'number' ? price : null,
      image: h.image,
    };
  }).filter((h): h is { id: string; name: string; engine: string; pax: number; price: number; image: string } =>
    h.price !== null,
  );
});

const roadCmp = computed(() => ROAD_COMPARISON[slug.value]);

const seoTitle = computed(() => {
  const prefix = locale.value === 'fr' ? 'Transfert Helicoptere' : 'Helicopter Transfer';
  const sep = locale.value === 'fr' ? ' a ' : ' to ';
  const from = locale.value === 'fr' ? 'A partir de' : 'From';
  return `${prefix} ${fromName.value}${sep}${toName.value} · ${duration.value} min · ${from} ${formatPriceFrom(detail.value.priceFrom, lng.value)} | Misana`;
});

const seoDescription = computed(() => {
  if (locale.value === 'fr') {
    return `Vol helicoptere prive ${fromName.value} ${toName.value} en ${duration.value} minutes. A partir de ${formatPriceFrom(detail.value.priceFrom, 'fr')}. Mercedes V-Class incluse. Reponse sous 2h.`;
  }
  return `Private helicopter transfer ${fromName.value} to ${toName.value} in ${duration.value} minutes. From ${formatPriceFrom(detail.value.priceFrom, 'en')}. Mercedes V-Class included. Reply within 2h.`;
});

const siteUrl = (config.public.siteUrl as string) || 'https://misana-group.com';
const canonicalUrl = computed(() => (
  locale.value === 'fr'
    ? `${siteUrl}/fr/transfert-helicoptere/${slug.value}`
    : `${siteUrl}/en/helicopter-transfer/${slug.value}`
));
const altEnUrl = computed(() => `${siteUrl}/en/helicopter-transfer/${slug.value}`);
const altFrUrl = computed(() => `${siteUrl}/fr/transfert-helicoptere/${slug.value}`);

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
        name: `Helicopter transfer ${fromName.value} to ${toName.value}`,
        provider: { '@type': 'Organization', name: 'Misana', url: siteUrl },
        serviceType: 'Helicopter transfer',
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
            name: locale.value === 'fr' ? 'Helicoptere' : 'Helicopter',
            item: `${siteUrl}${localePath({ name: 'helicopter' })}`,
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

const related = computed(() => (
  Array.from(ALLOWED_SLUGS)
    .filter((s) => s !== slug.value)
    .map((s) => {
      const tr = TRANSFERS.find((t) => t.slug === s)!;
      const det = getTransferDetail('helicopter', s, tr.from, tr.to);
      return { slug: s, tr, det };
    })
));

const trustBadges = computed(() => ([
  { title: locale.value === 'fr' ? 'Pilotes certifies' : 'Certified pilots', desc: locale.value === 'fr' ? 'Operateurs licencies' : 'Licensed operators' },
  { title: locale.value === 'fr' ? 'V-Class incluse' : 'V-Class included', desc: locale.value === 'fr' ? 'Porte-a-porte' : 'Door-to-door' },
  { title: locale.value === 'fr' ? 'Rebooking meteo' : 'Free weather rebooking', desc: locale.value === 'fr' ? 'Bascule chauffeur gratuite' : 'Auto-switch to chauffeur' },
  { title: locale.value === 'fr' ? 'Reponse 2h' : 'Reply within 2h', desc: locale.value === 'fr' ? '7j/7, equipe a Nice' : '7 days, team in Nice' },
]));

// Inclus dans le service. Fusionne ground-transfers + what's-included en
// un seul groupe scannable. Pas de grille de vehicules separee.
const inclusions = computed(() => ([
  {
    title: locale.value === 'fr' ? 'Mercedes V-Class porte-a-porte' : 'Mercedes V-Class door-to-door',
    desc: locale.value === 'fr' ? 'Chauffeur prive aux deux bouts du vol. S-Class, Range Rover ou Maybach sur demande.' : 'Private chauffeur both ends of the flight. S-Class, Range Rover or Maybach on request.',
  },
  {
    title: locale.value === 'fr' ? 'Coordination heliport' : 'Heliport coordination',
    desc: locale.value === 'fr' ? 'Reservation creneaux, briefing securite, gestion bagages au sol.' : 'Slot booking, safety briefing, ground luggage handling.',
  },
  {
    title: locale.value === 'fr' ? 'Backup meteo' : 'Weather backup',
    desc: locale.value === 'fr' ? 'Bascule automatique sur transfert chauffeur si le vol est annule.' : 'Automatic switch to chauffeur transfer if flight cancelled.',
  },
  {
    title: locale.value === 'fr' ? 'Annulation gratuite 24h' : 'Free cancellation 24h',
    desc: locale.value === 'fr' ? 'Jusqu\'a 24h avant le vol. Meteo : remboursement total.' : 'Up to 24h before the flight. Weather: full refund.',
  },
]));

const howSteps = computed(() => ([
  { n: '01', title: locale.value === 'fr' ? 'Demandez un devis' : 'Request a quote', desc: locale.value === 'fr' ? 'Trente secondes pour preciser date, passagers, bagages.' : 'Thirty seconds to set date, passengers, luggage.' },
  { n: '02', title: locale.value === 'fr' ? 'Confirmation sous 2h' : 'Confirmed within 2h', desc: locale.value === 'fr' ? 'Aeronef, prix final, pilote, heliport coordonnes par notre equipe.' : 'Aircraft, final price, pilot, heliport coordinated by our team.' },
  { n: '03', title: locale.value === 'fr' ? 'Vol porte-a-porte' : 'Door-to-door flight', desc: locale.value === 'fr' ? 'V-Class au pickup, vol, V-Class a l\'arrivee.' : 'V-Class at pickup, flight, V-Class at arrival.' },
]));

const requestCta = computed(() => localePath({
  path: '/request',
  query: { service: 'helicopter', from: transferEntry.from, to: transferEntry.to },
}));

const headerTransparent = useState<boolean>('header-transparent', () => true);
const heroRef = ref<HTMLElement | null>(null);
let heroObserver: IntersectionObserver | null = null;

onMounted(() => {
  if (heroRef.value) {
    heroObserver = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          headerTransparent.value = e.isIntersecting && e.intersectionRatio > 0;
        }
      },
      { threshold: [0, 0.01] },
    );
    heroObserver.observe(heroRef.value);
  }
});

onBeforeUnmount(() => {
  headerTransparent.value = false;
  heroObserver?.disconnect();
  heroObserver = null;
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
        :alt="`${fromName} → ${toName} by helicopter`"
        class="absolute inset-0 w-full h-full object-cover"
      />
      <!-- Overlay leger uniforme + shadow bottom pour contraste du texte -->
      <div class="absolute inset-0 bg-misana-ink/30"></div>
      <div class="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-misana-ink/85 via-misana-ink/40 to-transparent"></div>

      <div class="relative h-full max-w-[1400px] mx-auto px-5 sm:px-8 flex flex-col justify-end pb-10 sm:pb-16 text-misana-paper">
        <div class="inline-flex items-center gap-2 self-start text-[11px] uppercase tracking-[0.2em] opacity-85 mb-5 px-3 py-1.5 border border-misana-paper/30 rounded-full backdrop-blur-sm">
          <span class="w-1.5 h-1.5 rounded-full bg-misana-paper"></span>
          {{ locale === 'fr' ? 'Aviation privee Cote d\'Azur' : 'French Riviera private aviation' }}
        </div>

        <h1 class="text-3xl sm:text-5xl lg:text-6xl font-semibold leading-[1.05] tracking-tight mb-3 max-w-3xl">
          {{ locale === 'fr' ? 'Transfert helicoptere' : 'Helicopter transfer' }}<br />
          {{ fromName }} <span class="opacity-70">→</span> {{ toName }}
        </h1>

        <p class="text-lg sm:text-xl opacity-85 mb-7 max-w-2xl leading-snug">
          <span class="font-semibold tabular-nums">{{ duration }} min</span> {{ locale === 'fr' ? 'par les airs' : 'by air' }}.
          {{ locale === 'fr' ? 'A partir de' : 'From' }} <span class="font-semibold tabular-nums">{{ formatPriceFrom(detail.priceFrom, lng) }}</span>.
        </p>

        <div class="flex flex-wrap items-center gap-3">
          <NuxtLink
            :to="requestCta"
            class="inline-flex items-center gap-2.5 bg-misana-paper text-misana-ink px-6 sm:px-8 py-3.5 rounded-full text-sm font-semibold hover:opacity-90 transition group"
          >
            <span>{{ locale === 'fr' ? 'Devis sous 2h' : 'Get quote in 2h' }}</span>
            <span class="transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true">→</span>
          </NuxtLink>
          <a
            href="#pricing"
            class="inline-flex items-center gap-2 text-sm text-misana-paper/85 hover:text-misana-paper transition px-4 py-3.5"
          >
            <span>{{ locale === 'fr' ? 'Voir les aeronefs et tarifs' : 'See aircraft & pricing' }}</span>
            <span aria-hidden="true">↓</span>
          </a>
        </div>
      </div>
    </section>

    <!-- ==================================================
         02. TRUST STRIP
         ================================================== -->
    <section class="border-b border-misana-line bg-misana-paper">
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
         03. BOOKING + MAP (widget dominant 7, map 5)
         ================================================== -->
    <section>
      <div class="max-w-[1400px] mx-auto px-5 sm:px-8 py-12 sm:py-16 grid lg:grid-cols-12 gap-6 lg:gap-8 lg:items-stretch">
        <div class="lg:col-span-5 lg:flex lg:flex-col">
          <TransferMap
            :from="transferEntry.from"
            :to="transferEntry.to"
            mode="helicopter"
            :from-name="fromName"
            :to-name="toName"
          />
        </div>
        <aside class="lg:col-span-7 lg:flex lg:flex-col">
          <TransferReservationWidget
            :slug="slug"
            mode="helicopter"
            :from-city="transferEntry.from"
            :to-city="transferEntry.to"
            :from-name="fromName"
            :to-name="toName"
            :price-from="detail.priceFrom"
            :pax-min="detail.paxMin"
            :pax-max="detail.paxMax"
            :bidirectional="true"
            variant="inline"
          />
        </aside>
      </div>
    </section>

    <!-- ==================================================
         05. AIRCRAFT & PRICING (la SEULE grille produit)
         ================================================== -->
    <section v-if="aircraftPrices.length" id="pricing" class="border-t border-misana-line scroll-mt-24">
      <div class="max-w-[1400px] mx-auto px-5 sm:px-8 py-12 sm:py-16">
        <div class="flex items-baseline justify-between mb-7 flex-wrap gap-2">
          <div>
            <p class="text-[11px] uppercase tracking-[0.2em] text-misana-muted mb-2">
              {{ locale === 'fr' ? 'Aeronefs et tarifs' : 'Aircraft & pricing' }}
            </p>
            <h2 class="text-2xl sm:text-3xl font-semibold leading-tight">
              {{ aircraftPrices.length }}
              {{ locale === 'fr' ? 'aeronefs disponibles' : 'aircraft available' }}
            </h2>
          </div>
          <p class="text-[11px] text-misana-muted">
            {{ locale === 'fr' ? 'One-way, taxes et chauffeur inclus' : 'One-way, taxes and chauffeur included' }}
          </p>
        </div>
        <!-- Grid responsive : 6 = 3 par ligne (3+3), 4 = 4 par ligne, 5 = 5, etc -->
        <div
          class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4"
          :class="{
            'lg:grid-cols-3': aircraftPrices.length === 3 || aircraftPrices.length === 6,
            'lg:grid-cols-4': aircraftPrices.length === 4,
            'lg:grid-cols-5': aircraftPrices.length === 5,
            'lg:grid-cols-2': aircraftPrices.length === 2,
          }"
        >
          <article
            v-for="h in aircraftPrices"
            :key="h.id"
            class="border border-misana-line rounded-md overflow-hidden hover:border-misana-ink transition group"
          >
            <div class="aspect-[16/10] overflow-hidden bg-misana-stone">
              <img
                :src="h.image"
                :alt="h.name"
                loading="lazy"
                class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
            </div>
            <div class="p-4 sm:p-5">
              <div class="flex items-baseline justify-between mb-1 gap-3">
                <p class="text-base font-semibold leading-tight">{{ h.name }}</p>
                <p class="text-base font-semibold tabular-nums whitespace-nowrap">{{ formatPriceFrom(h.price, lng) }}</p>
              </div>
              <p class="text-[10px] uppercase tracking-wider text-misana-muted mb-2">{{ h.engine }}</p>
              <div class="flex items-center justify-between text-xs text-misana-muted">
                <span>{{ h.pax }} pax</span>
                <span>{{ locale === 'fr' ? 'des' : 'from' }}</span>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>

    <!-- ==================================================
         06. INCLUS DANS LE SERVICE (fusion ground + included)
         ================================================== -->
    <section class="border-t border-misana-line bg-misana-paper">
      <div class="max-w-[1400px] mx-auto px-5 sm:px-8 py-12 sm:py-16">
        <p class="text-[11px] uppercase tracking-[0.2em] text-misana-muted mb-2">
          {{ locale === 'fr' ? 'Inclus dans le service' : "What's included" }}
        </p>
        <h2 class="text-2xl sm:text-3xl font-semibold mb-7 max-w-2xl leading-tight">
          {{ locale === 'fr' ? 'Le vol, le sol, et tout entre les deux' : 'The flight, the ground, and everything in between' }}
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
          {{ locale === 'fr' ? 'Comment ca marche' : 'How it works' }}
        </p>
        <h2 class="text-2xl sm:text-3xl font-semibold mb-8 max-w-2xl leading-tight">
          {{ locale === 'fr' ? 'De la demande au touchdown' : 'From request to touchdown' }}
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
         08. HELIPORTS
         ================================================== -->
    <section
      v-if="longContent.hubFromTitle && longContent.hubToTitle && longContent.hubFromDesc && longContent.hubToDesc"
      class="border-t border-misana-line bg-misana-paper"
    >
      <div class="max-w-[1400px] mx-auto px-5 sm:px-8 py-12 sm:py-16">
        <p class="text-[11px] uppercase tracking-[0.2em] text-misana-muted mb-2">
          {{ locale === 'fr' ? 'Heliports' : 'Heliports' }}
        </p>
        <h2 class="text-2xl sm:text-3xl font-semibold mb-7 leading-tight">
          {{ locale === 'fr' ? 'Decollage et atterrissage' : 'Take-off and landing' }}
        </h2>
        <div class="grid sm:grid-cols-2 gap-6 sm:gap-10">
          <div class="border-l border-misana-line pl-5">
            <div class="flex items-center gap-2 mb-2">
              <span class="inline-block w-1.5 h-1.5 rounded-full border border-misana-ink"></span>
              <p class="text-[10px] uppercase tracking-[0.2em] text-misana-muted">
                {{ locale === 'fr' ? 'Depart' : 'Departure' }}
              </p>
            </div>
            <p class="text-base font-semibold leading-tight mb-2">{{ longContent.hubFromTitle[lng] }}</p>
            <p class="text-sm text-misana-ink/80 leading-relaxed">{{ longContent.hubFromDesc[lng] }}</p>
          </div>
          <div class="border-l border-misana-ink pl-5">
            <div class="flex items-center gap-2 mb-2">
              <span class="inline-block w-1.5 h-1.5 rounded-full bg-misana-ink"></span>
              <p class="text-[10px] uppercase tracking-[0.2em] text-misana-muted">
                {{ locale === 'fr' ? 'Arrivee' : 'Arrival' }}
              </p>
            </div>
            <p class="text-base font-semibold leading-tight mb-2">{{ longContent.hubToTitle[lng] }}</p>
            <p class="text-sm text-misana-ink/80 leading-relaxed">{{ longContent.hubToDesc[lng] }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ==================================================
         09. ABOUT this route + Why fly + FAQ
         ================================================== -->
    <section class="border-t border-misana-line">
      <div class="max-w-[1400px] mx-auto px-5 sm:px-8 py-12 sm:py-16">
        <p class="text-[11px] uppercase tracking-[0.2em] text-misana-muted mb-2">
          {{ locale === 'fr' ? 'A propos' : 'About' }}
        </p>
        <h2 class="text-2xl sm:text-3xl font-semibold mb-7 leading-tight">
          {{ fromName }} <span class="text-misana-muted">→</span> {{ toName }}
        </h2>
        <div class="grid lg:grid-cols-12 gap-8 lg:gap-14 mb-12 sm:mb-16">
          <div class="lg:col-span-7">
            <p class="text-sm sm:text-base leading-[1.75] text-misana-ink">{{ longContent.about[lng] }}</p>
          </div>
          <div class="lg:col-span-5">
            <p class="text-[10px] uppercase tracking-[0.2em] text-misana-muted mb-3">
              {{ locale === 'fr' ? 'Pourquoi voler' : 'Why fly' }}
            </p>
            <ul class="space-y-2.5">
              <li v-for="(r, i) in longContent.whyMode[lng]" :key="i" class="flex gap-2.5 text-sm leading-snug">
                <span class="flex-shrink-0 mt-1.5 w-1 h-1 rounded-full bg-misana-ink"></span>
                <span>{{ r }}</span>
              </li>
            </ul>
          </div>
        </div>

        <p class="text-[11px] uppercase tracking-[0.2em] text-misana-muted mb-2">FAQ</p>
        <h3 class="text-xl sm:text-2xl font-semibold mb-5 leading-tight">
          {{ locale === 'fr' ? 'Questions frequentes' : 'Frequently asked' }}
        </h3>
        <div v-if="longContent.faq?.length" class="grid lg:grid-cols-2 lg:gap-x-12">
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
         10. OTHER ROUTES (compact)
         ================================================== -->
    <section v-if="related.length" class="border-t border-misana-line bg-misana-paper">
      <div class="max-w-[1400px] mx-auto px-5 sm:px-8 py-12 sm:py-16">
        <p class="text-[11px] uppercase tracking-[0.2em] text-misana-muted mb-5">
          {{ locale === 'fr' ? 'Autres liaisons helico' : 'Other helicopter routes' }}
        </p>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
          <NuxtLink
            v-for="other in related"
            :key="other.slug"
            :to="localePath({ name: 'helicopter-route', params: { route: other.slug } })"
            class="border border-misana-line rounded-md p-4 sm:p-5 hover:border-misana-ink transition group"
          >
            <p class="text-[10px] uppercase tracking-[0.16em] text-misana-muted mb-1.5">
              {{ locale === 'fr' ? 'Helicoptere' : 'Helicopter' }}
            </p>
            <p class="text-sm sm:text-base font-semibold mb-3 leading-tight">{{ other.tr[lng] }}</p>
            <div class="flex items-baseline justify-between text-xs">
              <span class="text-misana-muted">{{ other.det.durationHelicopter }} min</span>
              <span class="font-semibold tabular-nums">{{ formatPriceFrom(other.det.priceFrom, lng) }}</span>
            </div>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- ==================================================
         11. FOOTER CTA avec image de fond (desktop only)
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
          {{ locale === 'fr' ? 'Pret a voler ?' : 'Ready to fly?' }}
        </p>
        <h2 class="text-3xl lg:text-5xl font-semibold mb-4 leading-tight">
          {{ fromName }} <span class="opacity-60">→</span> {{ toName }}
        </h2>
        <p class="text-sm sm:text-base opacity-85 mb-7">
          {{ duration }} min
          <span class="opacity-50 mx-1.5">·</span>
          {{ locale === 'fr' ? 'A partir de' : 'From' }} {{ formatPriceFrom(detail.priceFrom, lng) }}
          <span class="opacity-50 mx-1.5">·</span>
          {{ detail.paxMin }}-{{ detail.paxMax }} pax
        </p>
        <NuxtLink
          :to="requestCta"
          class="inline-flex items-center gap-2.5 bg-misana-paper text-misana-ink px-8 py-4 rounded-full text-sm font-semibold hover:opacity-90 transition group"
        >
          <span>{{ locale === 'fr' ? 'Devis sous 2h' : 'Get quote in 2h' }}</span>
          <span class="transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true">→</span>
        </NuxtLink>
      </div>
    </section>

    <!-- ==================================================
         STICKY BOTTOM mobile CTA
         ================================================== -->
    <div class="lg:hidden fixed bottom-0 inset-x-0 bg-misana-ink text-misana-paper px-5 py-3.5 z-40 shadow-2xl border-t border-misana-ink">
      <div class="flex items-center justify-between gap-4">
        <div class="leading-tight">
          <p class="text-[10px] uppercase tracking-[0.18em] opacity-70">
            {{ locale === 'fr' ? 'A partir de' : 'From' }}
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
</style>
