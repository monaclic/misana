<script setup lang="ts">
// Fiche helicoptere SEO + conversion. Pattern Uber : data-dense, action-first,
// mobile-first. URL: /en/helicopter-transfer/[route] + /fr/transfert-helicoptere/[route].
// Whitelist de 4 slugs prioritaires V1.
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

// Mapping slug -> codes IATA heliport pour resoudre la matrice prix par
// aeronef dans heliRoutes.ts.
const SLUG_TO_IATA: Record<string, [string, string]> = {
  'nice-monaco': ['NCE', 'MCM'],
  'nice-cannes': ['NCE', 'CEQ'],
  'nice-saint-tropez': ['NCE', 'LTT'],
  'monaco-saint-tropez': ['MCM', 'LTT'],
};

// Donnees comparaison routiere par slug (hardcoded V1, mode -> source unique).
const ROAD_COMPARISON: Record<string, { offPeakMin: number; peakNoteFr: string; peakNoteEn: string }> = {
  'nice-monaco': {
    offPeakMin: 60,
    peakNoteFr: 'Jusqu\'a 90+ min pendant le Grand Prix',
    peakNoteEn: '90+ min during the Grand Prix',
  },
  'nice-cannes': {
    offPeakMin: 30,
    peakNoteFr: 'Plus d\'une heure pendant le Festival',
    peakNoteEn: 'Over an hour during the Festival',
  },
  'nice-saint-tropez': {
    offPeakMin: 120,
    peakNoteFr: 'Jusqu\'a 180 min en juillet-aout',
    peakNoteEn: 'Up to 180 min in July-August',
  },
  'monaco-saint-tropez': {
    offPeakMin: 100,
    peakNoteFr: 'Jusqu\'a 180 min en saison',
    peakNoteEn: 'Up to 180 min in peak season',
  },
};

const route = useRoute();
const config = useRuntimeConfig();
const { locale, t } = useI18n();
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

const fromNameDual = computed(() => ({
  fr: fromCity.value?.fr ?? '',
  en: fromCity.value?.en ?? '',
}));
const toNameDual = computed(() => ({
  fr: toCity.value?.fr ?? '',
  en: toCity.value?.en ?? '',
}));

const detail = computed(() => getTransferDetail(
  'helicopter',
  slug.value,
  transferEntry.from,
  transferEntry.to,
));

const heroImage = computed(() => getHeroImage('helicopter', slug.value));
const duration = computed(() => detail.value.durationHelicopter ?? 0);

const longContent = computed(() => getLongContent(
  'helicopter',
  slug.value,
  fromNameDual.value,
  toNameDual.value,
  duration.value,
  detail.value.distanceKm,
  detail.value.priceFrom,
));

// Prix par modele d'helico pour cette route. Filtre les indispos.
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
    };
  }).filter((h): h is { id: string; name: string; engine: string; pax: number; price: number } =>
    h.price !== null,
  );
});

const roadCmp = computed(() => ROAD_COMPARISON[slug.value]);

// Title format brief : "Helicopter Transfer Nice to Monaco · 7 min · From €700 | Misana"
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

// What's included (4 items denses).
const includedItems = computed(() => ([
  {
    title: locale.value === 'fr' ? 'Chauffeur aux deux bouts' : 'Chauffeur both ends',
    desc: locale.value === 'fr' ? 'Mercedes V-Class, porte-a-porte' : 'Mercedes V-Class, door-to-door',
  },
  {
    title: locale.value === 'fr' ? 'Backup meteo' : 'Weather backup',
    desc: locale.value === 'fr' ? 'Bascule chauffeur si vol annule' : 'Auto-switch to chauffeur if cancelled',
  },
  {
    title: locale.value === 'fr' ? 'Bagages' : 'Luggage',
    desc: locale.value === 'fr' ? '2 valises moyennes / pax' : '2 medium bags per passenger',
  },
  {
    title: locale.value === 'fr' ? 'Annulation 24h' : '24h cancellation',
    desc: locale.value === 'fr' ? 'Gratuite jusqu\'a 24h avant' : 'Free up to 24h before',
  },
]));

// Request CTA url, factorise.
const requestCta = computed(() => localePath({
  path: '/request',
  query: { service: 'helicopter', from: transferEntry.from, to: transferEntry.to },
}));

// Header transparent au-dessus du hero, opaque ensuite.
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
    <!-- 01. HERO compact + data ribbon -->
    <section
      ref="heroRef"
      class="relative h-[42vh] sm:h-[48vh] min-h-[320px] max-h-[480px] overflow-hidden -mt-16 lg:-mt-24 bg-misana-ink"
    >
      <img
        :src="heroImage"
        :alt="`${fromName} → ${toName}`"
        class="absolute inset-0 w-full h-full object-cover opacity-80"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-misana-ink via-misana-ink/50 to-misana-ink/30"></div>

      <div class="relative h-full max-w-[1400px] mx-auto px-5 sm:px-8 flex flex-col justify-end pb-7 sm:pb-10 text-misana-paper">
        <p class="text-[10px] uppercase tracking-[0.22em] opacity-70 mb-2">
          {{ locale === 'fr' ? 'Helicoptere' : 'Helicopter' }}
          <span class="opacity-50 mx-2">/</span>
          {{ fromName }} <span class="opacity-60 mx-1">→</span> {{ toName }}
        </p>
        <h1 class="text-2xl sm:text-3xl lg:text-5xl font-semibold leading-[1.1] tracking-tight mb-4 max-w-3xl">
          {{ locale === 'fr' ? 'Transfert helicoptere' : 'Helicopter transfer' }}
          {{ fromName }} → {{ toName }}
        </h1>
        <div class="flex flex-wrap gap-x-5 gap-y-2 text-sm">
          <span class="inline-flex items-center gap-1.5">
            <span class="opacity-70">{{ locale === 'fr' ? 'Duree' : 'Duration' }}</span>
            <span class="font-semibold tabular-nums">{{ duration }} min</span>
          </span>
          <span class="opacity-40">·</span>
          <span class="inline-flex items-center gap-1.5">
            <span class="opacity-70">{{ locale === 'fr' ? 'Distance' : 'Distance' }}</span>
            <span class="font-semibold tabular-nums">{{ detail.distanceKm }} km</span>
          </span>
          <span class="opacity-40">·</span>
          <span class="inline-flex items-center gap-1.5">
            <span class="opacity-70">{{ locale === 'fr' ? 'A partir de' : 'From' }}</span>
            <span class="font-semibold tabular-nums">{{ formatPriceFrom(detail.priceFrom, lng) }}</span>
          </span>
          <span class="opacity-40">·</span>
          <span class="inline-flex items-center gap-1.5">
            <span class="opacity-70">{{ locale === 'fr' ? 'Capacite' : 'Capacity' }}</span>
            <span class="font-semibold tabular-nums">{{ detail.paxMin }}-{{ detail.paxMax }} pax</span>
          </span>
        </div>
      </div>
    </section>

    <!-- 02. BOOKING + MAP -->
    <section>
      <div class="max-w-[1400px] mx-auto px-5 sm:px-8 pt-8 sm:pt-10 grid lg:grid-cols-12 gap-6 lg:gap-8 lg:items-start">
        <div class="lg:col-span-7">
          <TransferMap
            :from="transferEntry.from"
            :to="transferEntry.to"
            mode="helicopter"
            :from-name="fromName"
            :to-name="toName"
          />
        </div>
        <aside class="lg:col-span-5 lg:sticky lg:top-20">
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

    <!-- 03. AIRCRAFT + PRIX par modele -->
    <section v-if="aircraftPrices.length" class="border-t border-misana-line mt-10 sm:mt-14">
      <div class="max-w-[1400px] mx-auto px-5 sm:px-8 py-9 sm:py-12">
        <div class="flex items-baseline justify-between mb-5">
          <p class="text-[11px] uppercase tracking-[0.2em] text-misana-muted">
            {{ locale === 'fr' ? 'Aeronef et tarifs' : 'Aircraft & pricing' }}
          </p>
          <p class="text-[11px] text-misana-muted">
            {{ locale === 'fr' ? 'One-way, taxes incluses' : 'One-way, taxes included' }}
          </p>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
          <article
            v-for="h in aircraftPrices"
            :key="h.id"
            class="border border-misana-line rounded-md p-3.5 sm:p-4 hover:border-misana-ink transition group"
          >
            <p class="text-sm font-semibold leading-tight mb-0.5">{{ h.name }}</p>
            <p class="text-[10px] uppercase tracking-[0.12em] text-misana-muted mb-3">{{ h.engine }}</p>
            <div class="flex items-baseline gap-1.5 mb-1">
              <span class="text-[10px] uppercase tracking-wider text-misana-muted">
                {{ locale === 'fr' ? 'des' : 'from' }}
              </span>
              <span class="text-lg font-semibold tabular-nums">{{ formatPriceFrom(h.price, lng) }}</span>
            </div>
            <p class="text-[10px] uppercase tracking-wider text-misana-muted">{{ h.pax }} pax</p>
          </article>
        </div>
      </div>
    </section>

    <!-- 04. HELI vs ROAD -->
    <section v-if="roadCmp" class="border-t border-misana-line">
      <div class="max-w-[1400px] mx-auto px-5 sm:px-8 py-9 sm:py-12">
        <p class="text-[11px] uppercase tracking-[0.2em] text-misana-muted mb-5">
          {{ locale === 'fr' ? 'Helicoptere vs route' : 'Helicopter vs road' }}
        </p>
        <div class="grid grid-cols-2 gap-3 sm:gap-5">
          <div class="border-2 border-misana-ink rounded-md p-4 sm:p-6 bg-misana-paper">
            <p class="text-[10px] uppercase tracking-[0.2em] text-misana-muted mb-2">
              {{ locale === 'fr' ? 'En helicoptere' : 'By helicopter' }}
            </p>
            <p class="text-3xl sm:text-5xl font-semibold tabular-nums leading-none mb-2">{{ duration }} <span class="text-base sm:text-lg font-medium text-misana-muted">min</span></p>
            <p class="text-xs sm:text-sm text-misana-muted leading-snug">
              {{ locale === 'fr' ? 'Porte-a-porte ~' : 'Door-to-door ~' }}{{ duration + 25 }} min
            </p>
          </div>
          <div class="border border-misana-line rounded-md p-4 sm:p-6">
            <p class="text-[10px] uppercase tracking-[0.2em] text-misana-muted mb-2">
              {{ locale === 'fr' ? 'Par la route' : 'By road' }}
            </p>
            <p class="text-3xl sm:text-5xl font-semibold tabular-nums leading-none mb-2 text-misana-muted">{{ roadCmp.offPeakMin }} <span class="text-base sm:text-lg font-medium">min</span></p>
            <p class="text-xs sm:text-sm text-misana-muted leading-snug">
              {{ locale === 'fr' ? roadCmp.peakNoteFr : roadCmp.peakNoteEn }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- 05. WHATS INCLUDED -->
    <section class="border-t border-misana-line">
      <div class="max-w-[1400px] mx-auto px-5 sm:px-8 py-9 sm:py-12">
        <p class="text-[11px] uppercase tracking-[0.2em] text-misana-muted mb-5">
          {{ locale === 'fr' ? 'Inclus' : "What's included" }}
        </p>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-5">
          <div v-for="(item, i) in includedItems" :key="i" class="flex gap-3">
            <span class="flex-shrink-0 w-5 h-5 mt-0.5 rounded-full bg-misana-ink/5 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" class="w-3 h-3" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M5 13L9 17L19 7" />
              </svg>
            </span>
            <div>
              <p class="text-sm font-medium leading-tight mb-0.5">{{ item.title }}</p>
              <p class="text-xs text-misana-muted leading-snug">{{ item.desc }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 06. HELIPORTS compact -->
    <section
      v-if="longContent.hubFromTitle && longContent.hubToTitle && longContent.hubFromDesc && longContent.hubToDesc"
      class="border-t border-misana-line"
    >
      <div class="max-w-[1400px] mx-auto px-5 sm:px-8 py-9 sm:py-12">
        <p class="text-[11px] uppercase tracking-[0.2em] text-misana-muted mb-5">
          {{ locale === 'fr' ? 'Heliports' : 'Heliports' }}
        </p>
        <div class="grid sm:grid-cols-2 gap-6 sm:gap-10 max-w-5xl">
          <div>
            <div class="flex items-center gap-2 mb-2">
              <span class="inline-block w-1.5 h-1.5 rounded-full border border-misana-ink"></span>
              <p class="text-[10px] uppercase tracking-[0.2em] text-misana-muted">
                {{ locale === 'fr' ? 'Depart' : 'Departure' }}
              </p>
            </div>
            <p class="text-base font-semibold leading-tight mb-2">{{ longContent.hubFromTitle[lng] }}</p>
            <p class="text-sm text-misana-ink/80 leading-relaxed">{{ longContent.hubFromDesc[lng] }}</p>
          </div>
          <div>
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

    <!-- 07. WHAT TO EXPECT (3 steps denses) -->
    <section class="border-t border-misana-line">
      <div class="max-w-[1400px] mx-auto px-5 sm:px-8 py-9 sm:py-12">
        <p class="text-[11px] uppercase tracking-[0.2em] text-misana-muted mb-5">
          {{ locale === 'fr' ? 'Le trajet' : 'What to expect' }}
        </p>
        <ol class="grid sm:grid-cols-3 gap-5 sm:gap-8 max-w-5xl">
          <li v-for="(line, i) in detail.whatToExpect[lng]" :key="i" class="flex gap-3">
            <span class="flex-shrink-0 w-6 h-6 rounded-full bg-misana-ink text-misana-paper text-xs font-semibold flex items-center justify-center">{{ i + 1 }}</span>
            <p class="text-sm leading-relaxed pt-0.5">{{ line }}</p>
          </li>
        </ol>
      </div>
    </section>

    <!-- 08. ABOUT this route (SEO long-form, compact) -->
    <section class="border-t border-misana-line">
      <div class="max-w-[1400px] mx-auto px-5 sm:px-8 py-9 sm:py-12 max-w-[1400px]">
        <p class="text-[11px] uppercase tracking-[0.2em] text-misana-muted mb-5">
          {{ locale === 'fr' ? 'A propos de cette liaison' : 'About this route' }}
        </p>
        <div class="grid lg:grid-cols-12 gap-8 lg:gap-12">
          <div class="lg:col-span-7">
            <p class="text-sm sm:text-base leading-[1.7] text-misana-ink">{{ longContent.about[lng] }}</p>
          </div>
          <div class="lg:col-span-5">
            <p class="text-[10px] uppercase tracking-[0.2em] text-misana-muted mb-3">
              {{ locale === 'fr' ? 'Pourquoi voler' : 'Why fly' }}
            </p>
            <ul class="space-y-2">
              <li v-for="(r, i) in longContent.whyMode[lng]" :key="i" class="flex gap-2.5 text-sm leading-snug">
                <span class="flex-shrink-0 text-misana-muted">·</span>
                <span>{{ r }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- 09. FAQ compact -->
    <section v-if="longContent.faq?.length" class="border-t border-misana-line">
      <div class="max-w-[1400px] mx-auto px-5 sm:px-8 py-9 sm:py-12">
        <p class="text-[11px] uppercase tracking-[0.2em] text-misana-muted mb-5">FAQ</p>
        <div class="max-w-3xl divide-y divide-misana-line">
          <details v-for="(item, i) in longContent.faq" :key="i" class="group py-3.5">
            <summary class="flex items-center justify-between cursor-pointer list-none gap-4">
              <span class="text-sm font-medium pr-4 leading-snug">{{ item.q[lng] }}</span>
              <span class="text-misana-muted text-lg leading-none transition-transform group-open:rotate-45 flex-shrink-0">+</span>
            </summary>
            <p class="mt-2.5 text-sm text-misana-ink/80 leading-relaxed pr-8">{{ item.a[lng] }}</p>
          </details>
        </div>
      </div>
    </section>

    <!-- 10. RELATED helico routes -->
    <section v-if="related.length" class="border-t border-misana-line">
      <div class="max-w-[1400px] mx-auto px-5 sm:px-8 py-9 sm:py-12">
        <p class="text-[11px] uppercase tracking-[0.2em] text-misana-muted mb-5">
          {{ locale === 'fr' ? 'Autres liaisons helico' : 'Other helicopter routes' }}
        </p>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
          <NuxtLink
            v-for="other in related"
            :key="other.slug"
            :to="localePath({ name: 'helicopter-route', params: { route: other.slug } })"
            class="border border-misana-line rounded-md p-4 hover:border-misana-ink transition group"
          >
            <p class="text-[10px] uppercase tracking-[0.16em] text-misana-muted mb-1.5">
              {{ locale === 'fr' ? 'Helicoptere' : 'Helicopter' }}
            </p>
            <p class="text-sm font-semibold mb-3 leading-tight">{{ other.tr[lng] }}</p>
            <div class="flex items-baseline justify-between text-xs">
              <span class="text-misana-muted">{{ other.det.durationHelicopter }} min</span>
              <span class="font-semibold tabular-nums">{{ formatPriceFrom(other.det.priceFrom, lng) }}</span>
            </div>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- 11. FOOTER CTA dark (desktop, hidden mobile because of sticky bar below) -->
    <section class="hidden lg:block bg-misana-ink text-misana-paper">
      <div class="max-w-[1400px] mx-auto px-5 sm:px-8 py-14 text-center">
        <h2 class="text-3xl lg:text-4xl font-semibold mb-3 leading-tight">
          {{ locale === 'fr' ? 'Pret a decoller ?' : 'Ready to fly?' }}
        </h2>
        <p class="text-sm opacity-80 mb-7">
          {{ fromName }} → {{ toName }}
          <span class="opacity-50 mx-1.5">·</span>
          {{ duration }} min
          <span class="opacity-50 mx-1.5">·</span>
          {{ locale === 'fr' ? 'A partir de' : 'From' }} {{ formatPriceFrom(detail.priceFrom, lng) }}
        </p>
        <NuxtLink
          :to="requestCta"
          class="inline-flex items-center gap-2.5 bg-misana-paper text-misana-ink px-7 py-3.5 rounded-full text-sm font-semibold hover:opacity-90 transition group"
        >
          <span>{{ locale === 'fr' ? 'Demander un devis' : 'Request quote' }}</span>
          <span class="transition-transform duration-300 group-hover:translate-x-1">→</span>
        </NuxtLink>
      </div>
    </section>

    <!-- 12. STICKY BOTTOM CTA mobile -->
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
