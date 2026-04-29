<script setup lang="ts">
// Fiche transfert. Pattern landing SEO/SEA :
// hero inspirationnel + booking + alternatives + trust signals + SEO long-form
// + temoignages + galerie + CTA inverse.
import { TRANSFERS, CITIES } from '~/lib/constants';
import {
  getTransferDetail,
  getHeroImage,
  getModeGallery,
  getLongContent,
  formatPriceFrom,
} from '~/lib/transferDetails';

definePageMeta({ layout: 'default' });

const route = useRoute();
const { locale, t } = useI18n();
const localePath = useLocalePath();

const mode = computed(() => String(route.params.mode));
const slug = computed(() => String(route.params.route));

if (!['chauffeur', 'helicopter'].includes(mode.value)) {
  throw createError({ statusCode: 404, statusMessage: 'Mode not found', fatal: true });
}

const transferEntry = TRANSFERS.find((t) => t.slug === slug.value);
if (!transferEntry) {
  throw createError({ statusCode: 404, statusMessage: 'Route not found', fatal: true });
}

const allowedMode = transferEntry.mode;
if (allowedMode !== 'both' && allowedMode !== mode.value) {
  throw createError({ statusCode: 404, statusMessage: 'Mode not available for this route', fatal: true });
}

const tEntry = transferEntry;
const fromCity = computed(() => CITIES.find((c) => c.slug === tEntry.from));
const toCity = computed(() => CITIES.find((c) => c.slug === tEntry.to));
const lng = computed<'fr' | 'en'>(() => (locale.value === 'fr' ? 'fr' : 'en'));

const fromGeo = computed(() => (slug.value.startsWith('nice-airport') ? 'nice-airport' : tEntry.from));
const toGeo = computed(() => tEntry.to);

const detail = computed(() => getTransferDetail(
  mode.value as 'chauffeur' | 'helicopter',
  slug.value,
  fromGeo.value,
  toGeo.value,
));

const heroImage = computed(() => getHeroImage(mode.value as 'chauffeur' | 'helicopter', slug.value));
const gallery = computed(() => getModeGallery(mode.value as 'chauffeur' | 'helicopter'));

const fromName = computed(() => {
  if (slug.value.startsWith('nice-airport')) {
    return locale.value === 'fr' ? 'Aéroport de Nice' : 'Nice Airport';
  }
  return fromCity.value ? fromCity.value[lng.value] : '';
});
const toName = computed(() => (toCity.value ? toCity.value[lng.value] : ''));

const fromNameDual = computed(() => ({
  fr: slug.value.startsWith('nice-airport') ? 'Aéroport de Nice' : (fromCity.value?.fr ?? ''),
  en: slug.value.startsWith('nice-airport') ? 'Nice Airport' : (fromCity.value?.en ?? ''),
}));
const toNameDual = computed(() => ({
  fr: toCity.value?.fr ?? '',
  en: toCity.value?.en ?? '',
}));

const isHelico = computed(() => mode.value === 'helicopter');
const isChauffeur = computed(() => mode.value === 'chauffeur');

const duration = computed(() => isHelico.value ? (detail.value.durationHelicopter ?? 0) : (detail.value.durationChauffeur ?? 0));

const longContent = computed(() => getLongContent(
  mode.value as 'chauffeur' | 'helicopter',
  slug.value,
  fromNameDual.value,
  toNameDual.value,
  duration.value,
  detail.value.distanceKm,
  detail.value.priceFrom,
));

const seoTitle = computed(() => {
  const modeLabel = isHelico.value
    ? (locale.value === 'fr' ? 'Hélicoptère' : 'Helicopter')
    : 'Chauffeur';
  return `${modeLabel} ${fromName.value} ${toName.value} · ${duration.value} min · Misana`;
});

const seoDescription = computed(() => {
  const m = isHelico.value
    ? (locale.value === 'fr' ? 'en hélicoptère' : 'by helicopter')
    : (locale.value === 'fr' ? 'en chauffeur' : 'by chauffeur');
  if (locale.value === 'fr') {
    return `Transfert ${m} de ${fromName.value} à ${toName.value} en ${duration.value} minutes. À partir de ${formatPriceFrom(detail.value.priceFrom, 'fr')}. Mercedes V-Class incluse, réponse sous 2h.`;
  }
  return `${m.charAt(0).toUpperCase()}${m.slice(1)} transfer from ${fromName.value} to ${toName.value} in ${duration.value} minutes. From ${formatPriceFrom(detail.value.priceFrom, 'en')}. Mercedes V-Class included, reply within 2h.`;
});

useSeoMeta({
  title: () => seoTitle.value,
  description: () => seoDescription.value,
  ogImage: () => heroImage.value,
});

useHead({
  script: [
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
        offers: {
          '@type': 'Offer',
          price: detail.value.priceFrom,
          priceCurrency: 'EUR',
          priceValidUntil: '2026-12-31',
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

const alternativeMode = computed<'chauffeur' | 'helicopter' | null>(() => {
  if (allowedMode !== 'both') return null;
  return mode.value === 'chauffeur' ? 'helicopter' : 'chauffeur';
});

const related = computed(() => {
  const others = TRANSFERS.filter((t) => t.slug !== slug.value);
  const sameFrom = others.filter((t) => t.from === tEntry.from);
  const sameTo = others.filter((t) => t.to === tEntry.to);
  const merged = [...sameFrom, ...sameTo];
  const unique = merged.filter((t, i, arr) => arr.findIndex((x) => x.slug === t.slug) === i);
  return unique.slice(0, 4);
});

const breadcrumb = computed(() => [
  { label: 'Misana', to: '/' },
  {
    label: isHelico.value ? t('transfers.modeHelicopter') : t('transfers.modeChauffeur'),
    to: isHelico.value ? '/services/helicopter' : '/services/chauffeur',
  },
  { label: `${fromName.value} → ${toName.value}` },
]);

function relatedModeFor(other: typeof TRANSFERS[number]): 'chauffeur' | 'helicopter' {
  return other.mode === 'helicopter' ? 'helicopter' : 'chauffeur';
}

function relatedDuration(other: typeof TRANSFERS[number]): number {
  const otherFromGeo = other.slug.startsWith('nice-airport') ? 'nice-airport' : other.from;
  const d = getTransferDetail(relatedModeFor(other), other.slug, otherFromGeo, other.to);
  return relatedModeFor(other) === 'helicopter' ? (d.durationHelicopter ?? 0) : (d.durationChauffeur ?? 0);
}

function relatedPrice(other: typeof TRANSFERS[number]): number {
  const otherFromGeo = other.slug.startsWith('nice-airport') ? 'nice-airport' : other.from;
  return getTransferDetail(relatedModeFor(other), other.slug, otherFromGeo, other.to).priceFrom;
}

// Trust badges : 6 elements operating standard
const TRUST_ITEMS = ['insurance', 'operators', 'response', 'cancellation', 'fleet', 'local'];

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

// Computed : titres SEO contextuels
const aboutTitle = computed(() => {
  if (locale.value === 'fr') {
    return isHelico.value
      ? `Vol ${fromName.value} ${toName.value} en hélicoptère`
      : `Transfert chauffeur ${fromName.value} ${toName.value}`;
  }
  return isHelico.value
    ? `${fromName.value} to ${toName.value} by helicopter`
    : `${fromName.value} to ${toName.value} by chauffeur`;
});

const whyTitle = computed(() => {
  if (locale.value === 'fr') {
    return isHelico.value
      ? `Pourquoi voler ${fromName.value} → ${toName.value}`
      : `Pourquoi un chauffeur entre ${fromName.value} et ${toName.value}`;
  }
  return isHelico.value
    ? `Why fly ${fromName.value} to ${toName.value}`
    : `Why a chauffeur between ${fromName.value} and ${toName.value}`;
});

const faqTitle = computed(() => {
  if (locale.value === 'fr') {
    return `Questions fréquentes sur ${fromName.value} ${toName.value}`;
  }
  return `Frequently asked about ${fromName.value} ${toName.value}`;
});
</script>

<template>
  <main class="min-h-screen">
    <!-- 01. HERO pleine largeur -->
    <section
      ref="heroRef"
      class="relative h-[60vh] sm:h-[72vh] min-h-[440px] overflow-hidden -mt-16 bg-misana-ink"
    >
      <img
        :src="heroImage"
        :alt="`${fromName} → ${toName}`"
        class="absolute inset-0 w-full h-full object-cover opacity-95"
      />
      <div class="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-misana-ink/80 via-misana-ink/35 to-transparent"></div>
      <div class="relative h-full max-w-[1600px] mx-auto px-6 sm:px-12 flex flex-col justify-end pb-12 sm:pb-16 text-misana-paper">
        <p class="text-[11px] uppercase tracking-[0.25em] opacity-90 mb-4">
          {{ isHelico ? t('transfers.modeHelicopter') : t('transfers.modeChauffeur') }}
          <span class="opacity-60 mx-2">·</span>
          {{ duration }} min
        </p>
        <h1 class="font-display text-5xl sm:text-6xl lg:text-7xl leading-[1.02] mb-4 max-w-4xl">
          {{ fromName }}
          <span class="opacity-70 mx-2">→</span>
          {{ toName }}
        </h1>
        <p class="font-display italic text-xl sm:text-2xl opacity-90 max-w-2xl">
          {{ isHelico ? t('transfers.fiche.heroSubtitleHelico') : t('transfers.fiche.heroSubtitleChauffeur') }}
        </p>
      </div>
    </section>

    <!-- 02. STICKY BACK -->
    <section class="sticky top-16 z-30 bg-misana-paper/95 backdrop-blur-sm border-b border-misana-line">
      <div class="max-w-[1600px] mx-auto px-6 sm:px-12 py-3 flex items-center justify-between gap-4 flex-wrap">
        <NuxtLink
          :to="localePath(isHelico ? '/services/helicopter' : '/services/chauffeur')"
          class="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-misana-muted hover:text-misana-ink transition group"
        >
          <span class="inline-flex items-center justify-center w-4 h-4 transition-transform duration-500 group-hover:-translate-x-1">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" class="block w-full h-full">
              <path d="M17 12H7" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
              <path d="M10.5 8.5L7 12L10.5 15.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </span>
          <span>{{ isHelico ? t('transfers.fiche.backToHelicopter') : t('transfers.fiche.backToChauffeur') }}</span>
        </NuxtLink>
        <Breadcrumb :items="breadcrumb" class="hidden sm:block" />
      </div>
    </section>

    <!-- 03. BOOKING : map + widget (hauteurs alignees) -->
    <section>
      <div class="max-w-[1600px] mx-auto px-6 sm:px-12 py-12 sm:py-16 grid lg:grid-cols-12 gap-8 lg:gap-12 lg:items-stretch">
        <div class="lg:col-span-7 lg:flex lg:flex-col">
          <TransferMap
            :from="fromGeo"
            :to="toGeo"
            :mode="(mode as 'chauffeur' | 'helicopter')"
            :from-name="fromName"
            :to-name="toName"
          />
          <NuxtLink
            v-if="alternativeMode"
            :to="localePath(`/transfers/${alternativeMode}/${slug}`)"
            class="mt-4 inline-flex items-center gap-2 text-xs uppercase tracking-[0.15em] text-misana-muted hover:text-misana-ink transition group"
          >
            <span>{{ alternativeMode === 'helicopter' ? t('transfers.fiche.altHelico') : t('transfers.fiche.altChauffeur') }}</span>
            <span class="inline-block transition-transform duration-500 group-hover:translate-x-1">→</span>
          </NuxtLink>
        </div>

        <aside class="lg:col-span-5 lg:flex lg:flex-col">
          <TransferReservationWidget
            :slug="slug"
            :mode="mode"
            :from-city="tEntry.from"
            :to-city="tEntry.to"
            :from-name="fromName"
            :to-name="toName"
            :price-from="detail.priceFrom"
            :pax-min="detail.paxMin"
            :pax-max="detail.paxMax"
            variant="inline"
          />
        </aside>
      </div>
    </section>

    <!-- 04. DATA ROW -->
    <section class="border-y border-misana-line">
      <div class="max-w-[1600px] mx-auto px-6 sm:px-12 py-8 sm:py-10 grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-10">
        <div>
          <p class="text-[10px] uppercase tracking-[0.2em] text-misana-muted mb-1.5">
            {{ isHelico ? t('transfers.fiche.metric.flightTime') : t('transfers.fiche.metric.driveTime') }}
          </p>
          <p class="font-display text-3xl sm:text-4xl leading-none">{{ duration }} <span class="text-base text-misana-muted">min</span></p>
        </div>
        <div>
          <p class="text-[10px] uppercase tracking-[0.2em] text-misana-muted mb-1.5">{{ t('transfers.fiche.metric.distance') }}</p>
          <p class="font-display text-3xl sm:text-4xl leading-none">{{ detail.distanceKm }} <span class="text-base text-misana-muted">km</span></p>
        </div>
        <div>
          <p class="text-[10px] uppercase tracking-[0.2em] text-misana-muted mb-1.5">{{ t('transfers.fiche.metric.capacity') }}</p>
          <p class="font-display text-3xl sm:text-4xl leading-none">{{ detail.paxMin }}–{{ detail.paxMax }} <span class="text-base text-misana-muted">pax</span></p>
        </div>
        <div>
          <p class="text-[10px] uppercase tracking-[0.2em] text-misana-muted mb-1.5">
            {{ isHelico ? t('transfers.fiche.metric.aircraft') : t('transfers.fiche.metric.vehicle') }}
          </p>
          <p class="text-sm sm:text-base leading-tight pt-2">
            {{ isHelico ? detail.aircraftType?.[lng] : detail.vehicleType?.[lng] }}
          </p>
        </div>
      </div>
    </section>

    <!-- 05. ALTERNATIVES (remontees pour aider l'utilisateur a trouver le bon trajet) -->
    <section v-if="related.length" class="border-b border-misana-line">
      <div class="max-w-[1600px] mx-auto px-6 sm:px-12 py-12 sm:py-14">
        <p class="text-[11px] uppercase tracking-[0.2em] text-misana-muted mb-5">
          {{ t('transfers.fiche.alternatives') }}
        </p>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <NuxtLink
            v-for="other in related"
            :key="other.slug"
            :to="localePath(`/transfers/${relatedModeFor(other)}/${other.slug}`)"
            class="alternative-chip group"
          >
            <p class="text-[10px] uppercase tracking-[0.18em] text-misana-muted mb-1.5">
              {{ relatedModeFor(other) === 'helicopter' ? t('transfers.modeHelicopter') : t('transfers.modeChauffeur') }}
            </p>
            <p class="text-sm font-medium leading-tight mb-3">{{ other[lng] }}</p>
            <div class="flex items-baseline justify-between text-xs text-misana-muted">
              <span>{{ relatedDuration(other) }} min</span>
              <span class="text-misana-ink">{{ formatPriceFrom(relatedPrice(other), lng) }}</span>
            </div>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- 06. OPERATING STANDARD : 6 trust badges -->
    <section class="border-b border-misana-line">
      <div class="max-w-[1600px] mx-auto px-6 sm:px-12 py-12 sm:py-14">
        <p class="text-[11px] uppercase tracking-[0.25em] text-misana-muted text-center mb-10">
          {{ t('transfers.fiche.standardKicker') }}
        </p>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-x-8 gap-y-10 max-w-5xl mx-auto">
          <div v-for="key in TRUST_ITEMS" :key="key" class="flex gap-4">
            <span class="flex-shrink-0 w-9 h-9 border border-misana-ink rounded-full flex items-center justify-center mt-0.5">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M5 13L9 17L19 7" />
              </svg>
            </span>
            <div>
              <h3 class="text-sm font-medium mb-1">{{ t(`transfers.fiche.standard.${key}.title`) }}</h3>
              <p class="text-xs text-misana-muted leading-relaxed">{{ t(`transfers.fiche.standard.${key}.desc`) }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 07. ROUTE DETAILS -->
    <section>
      <div class="max-w-[1600px] mx-auto px-6 sm:px-12 py-12 sm:py-16 grid sm:grid-cols-2 gap-8 sm:gap-16">
        <div>
          <p class="text-[11px] uppercase tracking-[0.2em] text-misana-muted mb-3 flex items-center gap-2">
            <span class="inline-block w-2 h-2 rounded-full border border-misana-ink"></span>
            {{ t('transfers.fiche.departure') }}
          </p>
          <p class="font-display text-2xl mb-2">
            {{ isHelico ? detail.heliportFrom?.[lng] ?? fromName : (detail.pickup?.[lng] ?? fromName) }}
          </p>
          <ul class="text-sm text-misana-ink/85 space-y-1.5 leading-relaxed">
            <li class="flex gap-2">
              <span class="text-misana-muted">·</span>
              <span>{{ isHelico ? t('transfers.fiche.boardingNote') : t('transfers.fiche.pickupNote') }}</span>
            </li>
            <li class="flex gap-2">
              <span class="text-misana-muted">·</span>
              <span>{{ detail.luggageHint?.[lng] }}</span>
            </li>
          </ul>
        </div>
        <div>
          <p class="text-[11px] uppercase tracking-[0.2em] text-misana-muted mb-3 flex items-center gap-2">
            <span class="inline-block w-2 h-2 rounded-full bg-misana-ink"></span>
            {{ t('transfers.fiche.arrival') }}
          </p>
          <p class="font-display text-2xl mb-2">
            {{ isHelico ? detail.heliportTo?.[lng] ?? toName : (detail.dropoff?.[lng] ?? toName) }}
          </p>
          <ul class="text-sm text-misana-ink/85 space-y-1.5 leading-relaxed">
            <li class="flex gap-2">
              <span class="text-misana-muted">·</span>
              <span>{{ isHelico ? t('transfers.fiche.arrivalChauffeurNote') : t('transfers.fiche.dropoffNote') }}</span>
            </li>
          </ul>
        </div>
      </div>
    </section>

    <!-- 08. GALERIE : images du transfert juste avant what to expect -->
    <section class="border-t border-misana-line">
      <div class="max-w-[1600px] mx-auto px-6 sm:px-12 py-12 sm:py-16">
        <p class="text-[11px] uppercase tracking-[0.2em] text-misana-muted mb-5">
          {{ t('transfers.fiche.gallerySection') }}
        </p>
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div
            v-for="(img, i) in gallery"
            :key="`gallery-top-${i}`"
            class="aspect-[4/5] overflow-hidden rounded-[6px] bg-misana-paper"
          >
            <img
              :src="img"
              :alt="`${fromName} → ${toName} ${i + 1}`"
              loading="lazy"
              class="w-full h-full object-cover transition-transform duration-700 hover:scale-[1.04]"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- 09. WHAT TO EXPECT -->
    <section class="border-t border-misana-line">
      <div class="max-w-[1600px] mx-auto px-6 sm:px-12 py-12 sm:py-16">
        <p class="text-[11px] uppercase tracking-[0.2em] text-misana-muted mb-5">
          {{ t('transfers.fiche.whatToExpect') }}
        </p>
        <ul class="grid sm:grid-cols-3 gap-6 sm:gap-10">
          <li v-for="(line, i) in detail.whatToExpect[lng]" :key="i" class="flex gap-3 text-sm leading-relaxed">
            <span class="font-display text-2xl text-misana-muted leading-none mt-0.5">{{ String(i + 1).padStart(2, '0') }}</span>
            <span>{{ line }}</span>
          </li>
        </ul>
      </div>
    </section>

    <!-- 10. BIG SEO TEXT SECTION : pleine largeur -->
    <section class="border-t border-misana-line bg-misana-paper">
      <div class="max-w-[1600px] mx-auto px-6 sm:px-12 py-16 sm:py-20">
        <p class="text-[11px] uppercase tracking-[0.2em] text-misana-muted mb-3">
          {{ t('transfers.fiche.aboutKicker') }}
        </p>
        <h2 class="font-display text-3xl sm:text-4xl lg:text-5xl mb-7 leading-[1.1]">
          {{ aboutTitle }}
        </h2>
        <p class="text-base sm:text-lg leading-[1.8] mb-14 max-w-3xl">{{ longContent.about[lng] }}</p>

        <h3 class="font-display text-2xl sm:text-3xl mb-7 leading-tight">{{ whyTitle }}</h3>
        <ol class="grid sm:grid-cols-2 gap-x-10 gap-y-6 mb-14">
          <li v-for="(reason, i) in longContent.whyMode[lng]" :key="i" class="flex gap-5">
            <span class="font-display italic text-2xl text-misana-muted leading-none mt-1 flex-shrink-0 w-8">
              {{ String(i + 1).padStart(2, '0') }}
            </span>
            <span class="text-base leading-relaxed">{{ reason }}</span>
          </li>
        </ol>

        <div
          v-if="longContent.hubFromTitle && longContent.hubToTitle && longContent.hubFromDesc && longContent.hubToDesc"
          class="grid sm:grid-cols-2 gap-10 mb-14 pt-12 border-t border-misana-line"
        >
          <div>
            <p class="text-[11px] uppercase tracking-[0.2em] text-misana-muted mb-2 flex items-center gap-2">
              <span class="inline-block w-2 h-2 rounded-full border border-misana-ink"></span>
              {{ t('transfers.fiche.departure') }}
            </p>
            <h3 class="font-display text-xl mb-3 leading-snug">{{ longContent.hubFromTitle[lng] }}</h3>
            <p class="text-sm leading-relaxed">{{ longContent.hubFromDesc[lng] }}</p>
          </div>
          <div>
            <p class="text-[11px] uppercase tracking-[0.2em] text-misana-muted mb-2 flex items-center gap-2">
              <span class="inline-block w-2 h-2 rounded-full bg-misana-ink"></span>
              {{ t('transfers.fiche.arrival') }}
            </p>
            <h3 class="font-display text-xl mb-3 leading-snug">{{ longContent.hubToTitle[lng] }}</h3>
            <p class="text-sm leading-relaxed">{{ longContent.hubToDesc[lng] }}</p>
          </div>
        </div>

        <h2 class="font-display text-2xl sm:text-3xl mb-7 mt-16 leading-tight">{{ faqTitle }}</h2>
        <div class="divide-y divide-misana-line max-w-3xl">
          <details
            v-for="(item, i) in longContent.faq"
            :key="i"
            class="group py-5"
          >
            <summary class="flex items-center justify-between cursor-pointer list-none gap-4">
              <span class="text-base font-medium pr-4 leading-snug">{{ item.q[lng] }}</span>
              <span class="text-misana-muted text-xl leading-none transition-transform group-open:rotate-45 flex-shrink-0">+</span>
            </summary>
            <p class="mt-4 text-sm text-misana-ink/85 leading-relaxed pr-8">{{ item.a[lng] }}</p>
          </details>
        </div>
      </div>
    </section>

    <!-- 11. FOOTER CTA inverse -->
    <section class="bg-misana-ink text-misana-paper">
      <div class="max-w-[1600px] mx-auto px-6 sm:px-12 py-16 sm:py-20 text-center">
        <p class="text-[11px] uppercase tracking-[0.25em] opacity-70 mb-4">{{ t('transfers.fiche.footerKicker') }}</p>
        <h2 class="font-display text-3xl sm:text-4xl lg:text-5xl mb-3 leading-tight">
          {{ fromName }} <span class="opacity-70 mx-2">→</span> {{ toName }}
        </h2>
        <p class="text-sm sm:text-base opacity-80 mb-8">
          {{ t('transfers.fiche.priceFrom') }} {{ formatPriceFrom(detail.priceFrom, lng) }} ·
          {{ duration }} min ·
          {{ detail.paxMin }}–{{ detail.paxMax }} pax
        </p>
        <NuxtLink
          :to="localePath({ path: '/request', query: { service: isHelico ? 'helicopter' : 'chauffeur', from: tEntry.from, to: tEntry.to } })"
          class="inline-flex items-center gap-3 px-8 py-4 bg-misana-paper text-misana-ink text-sm tracking-wide rounded-[4px] hover:opacity-90 transition group"
        >
          <span>{{ t('transfers.fiche.requestTransfer') }}</span>
          <span class="transition-transform duration-500 group-hover:translate-x-1">→</span>
        </NuxtLink>
      </div>
    </section>
  </main>
</template>

<style scoped>
.alternative-chip {
  display: block;
  padding: 1rem 1.1rem;
  border: 1px solid var(--color-misana-line);
  border-radius: 6px;
  background: var(--color-misana-paper);
  transition: border-color 0.2s ease, transform 0.3s ease;
}
.alternative-chip:hover {
  border-color: var(--color-misana-ink);
  transform: translateY(-1px);
}
details summary::-webkit-details-marker { display: none; }
</style>
