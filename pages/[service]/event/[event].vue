<script setup lang="ts">
// Fiche service x event. URL : /[service]/event/[event]
// Meme architecture que /[service]/in/[city] mais oriente
// contexte evenement (Festival, Grand Prix, Lions, Yacht Show).
import { SERVICES, EVENTS } from '~/lib/constants';
import { serviceHubLink, serviceEventPath } from '~/lib/serviceRoutes';

// Segment URL [service] : slugs canoniques production uniquement.
// Anciens slugs 301-rediriges via routeRules dans nuxt.config.ts.
const SERVICE_SLUG_TO_CANONICAL: Record<string, string> = {
  'yacht-charter': 'yacht', 'location-yacht': 'yacht',
  'car-rental': 'cars', 'location-voiture': 'cars',
  'private-chauffeur': 'chauffeur', 'chauffeur-prive': 'chauffeur',
  'helicopter-transfer': 'helicopter', 'transfert-helicoptere': 'helicopter',
  reservations: 'access',
};
import { VEHICLES } from '~/lib/fleet';
import { useRentalCars } from '~/composables/useRentalCars';
import { useYachts } from '~/composables/useYachts';
const { yachts: YACHTS_REF } = useYachts();
import type { YachtType } from '~/lib/yachts';
import { formatPrice } from '~/lib/serviceCityDetails';
import { getServiceEventDetail, getEventPopularTransfers } from '~/lib/serviceEventDetails';

const YACHT_TYPE_LABELS: Record<YachtType, { fr: string; en: string }> = {
  motor: { fr: 'Moteur', en: 'Motor' },
  sail: { fr: 'Voile', en: 'Sail' },
  catamaran: { fr: 'Catamaran', en: 'Catamaran' },
};

definePageMeta({ layout: 'default' });

const route = useRoute();
const { locale, t } = useI18n();
const localePath = useLocalePath();

const urlService = computed(() => String(route.params.service));
const service = computed(() => SERVICE_SLUG_TO_CANONICAL[urlService.value] || urlService.value);
const event = computed(() => String(route.params.event));

if (!SERVICES.find((s) => s.slug === service.value)) {
  throw createError({ statusCode: 404, statusMessage: 'Service not found', fatal: true });
}
if (!EVENTS.find((e) => e.slug === event.value)) {
  throw createError({ statusCode: 404, statusMessage: 'Event not found', fatal: true });
}

const detail = computed(() => getServiceEventDetail(service.value, event.value));
if (!detail.value) {
  throw createError({ statusCode: 404, statusMessage: 'Service not yet available for this event', fatal: true });
}

const lng = computed<'fr' | 'en'>(() => (locale.value === 'fr' ? 'fr' : 'en'));
const eventObj = computed(() => EVENTS.find((e) => e.slug === event.value)!);
const serviceObj = computed(() => SERVICES.find((s) => s.slug === service.value)!);
const eventName = computed(() => eventObj.value[lng.value]);
const serviceName = computed(() => serviceObj.value[lng.value]);

const seoTitle = computed(() => {
  const titlePart = detail.value!.heroTitle[lng.value];
  return `${titlePart} · ${formatPrice(detail.value!.priceFrom, lng.value)}`;
});

const seoDescription = computed(() => detail.value!.aboutText[lng.value].slice(0, 155));

useSeoMeta({
  title: () => seoTitle.value,
  description: () => seoDescription.value,
  ogImage: () => detail.value!.heroImage,
});

useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: seoTitle.value,
        description: seoDescription.value,
        provider: { '@type': 'Organization', name: 'Misana' },
        serviceType: serviceName.value,
        offers: {
          '@type': 'Offer',
          price: detail.value!.priceFrom,
          priceCurrency: 'EUR',
        },
      }),
    },
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: detail.value!.faq.map((f) => ({
          '@type': 'Question',
          name: f.q[lng.value],
          acceptedAnswer: { '@type': 'Answer', text: f.a[lng.value] },
        })),
      }),
    },
  ],
});

const popularTransfers = computed(() => getEventPopularTransfers(detail.value!.popularTransferSlugs));

// Other events for the same service
const otherEvents = computed(() =>
  EVENTS.filter((e) => e.slug !== event.value && e.tier === 'heavy').slice(0, 4),
);

const breadcrumb = computed(() => [
  { label: 'Misana', to: '/' },
  { label: serviceName.value, to: serviceHubLink(service.value) },
  { label: eventName.value },
]);

function transferModeFor(t: typeof popularTransfers.value[number]): 'chauffeur' | 'helicopter' {
  if (t.mode === 'both') return service.value === 'helicopter' ? 'helicopter' : 'chauffeur';
  return t.mode === 'helicopter' ? 'helicopter' : 'chauffeur';
}

// Cars selection : top 6 (flagship + popular badges) pour les events
const { cars: RENTAL_CARS_REF } = useRentalCars();
const carsForEvent = computed(() => {
  if (service.value !== 'cars') return [];
  return RENTAL_CARS_REF.value
    .filter((c) => c.badge === 'flagship' || c.badge === 'popular')
    .slice(0, 6);
});

function brandInitial(brand: string): string {
  return brand.charAt(0).toUpperCase();
}

function fmtCarPrice(p: number): string {
  return new Intl.NumberFormat(locale.value === 'fr' ? 'fr-FR' : 'en-GB', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(p);
}

function typeLabel(t: YachtType): string {
  return YACHT_TYPE_LABELS[t][lng.value];
}

// Yachts selection : top 6 (flagship + popular badges) pour les events
const yachtsForEvent = computed(() => {
  if (service.value !== 'yacht') return [];
  return YACHTS_REF.value
    .filter((y) => y.badge === 'flagship' || y.badge === 'popular')
    .slice(0, 6);
});

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
  <main class="min-h-screen">
    <!-- 01. HERO h-dvh -->
    <section
      ref="heroRef"
      class="relative h-dvh overflow-hidden -mt-16 bg-misana-ink text-misana-paper"
    >
      <img
        :src="detail!.heroImage"
        :alt="`${serviceName} ${eventName}`"
        class="absolute inset-0 w-full h-full object-cover"
      />
      <div class="absolute inset-0 bg-misana-ink/55"></div>

      <div class="relative h-full flex flex-col items-center justify-center px-6 pt-20 pb-16 text-center">
        <p v-if="locale === 'en'" class="font-display italic text-xl sm:text-2xl opacity-90 mb-3">the</p>
        <h1 class="font-display text-4xl sm:text-6xl lg:text-7xl xl:text-[5.5rem] leading-[1.02] mb-7 text-balance max-w-5xl">
          {{ detail!.heroTitle[lng] }}
        </h1>
        <p class="font-display italic text-lg sm:text-xl lg:text-2xl opacity-90 max-w-2xl mb-10 text-balance">
          {{ detail!.signature[lng] }}
        </p>
        <NuxtLink
          :to="localePath({ path: '/request', query: { service, event } })"
          class="inline-flex items-center gap-3 group bg-misana-paper text-misana-ink px-8 py-3.5 text-sm tracking-[0.16em] uppercase rounded-full transition hover:opacity-90"
        >
          <span>{{ locale === 'fr' ? 'Faire une demande' : 'Make a request' }}</span>
          <span class="transition-transform duration-500 group-hover:translate-x-1">→</span>
        </NuxtLink>
      </div>
    </section>

    <!-- 02. STICKY BACK -->
    <section class="sticky top-16 z-30 bg-misana-paper/95 backdrop-blur-sm border-b border-misana-line">
      <div class="max-w-[1600px] mx-auto px-6 sm:px-12 py-3 flex items-center justify-between gap-4 flex-wrap">
        <NuxtLink
          :to="localePath(serviceHubLink(service))"
          class="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-misana-muted hover:text-misana-ink transition group"
        >
          <span class="inline-flex items-center justify-center w-4 h-4 transition-transform duration-500 group-hover:-translate-x-1">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" class="block w-full h-full">
              <path d="M17 12H7" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
              <path d="M10.5 8.5L7 12L10.5 15.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </span>
          <span>{{ locale === 'fr' ? `Retour ${serviceName.toLowerCase()}` : `Back to ${serviceName.toLowerCase()}` }}</span>
        </NuxtLink>
        <Breadcrumb :items="breadcrumb" class="hidden sm:block" />
      </div>
    </section>

    <!-- 03. ABOUT 50/50 -->
    <section class="bg-misana-paper">
      <div class="max-w-[1600px] mx-auto px-6 sm:px-12 py-16 sm:py-24 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        <div>
          <p class="text-[11px] uppercase tracking-[0.25em] text-misana-muted mb-5">
            {{ locale === 'fr' ? 'À propos' : 'About' }}
          </p>
          <h2 class="font-display text-3xl sm:text-4xl lg:text-5xl leading-[1.1] mb-6">
            {{ detail!.aboutTitle[lng] }}
          </h2>
          <p class="text-base sm:text-lg leading-[1.8] mb-8 text-misana-ink/85">
            {{ detail!.aboutText[lng] }}
          </p>
          <NuxtLink
            :to="localePath({ path: '/request', query: { service, event } })"
            class="inline-flex items-center gap-3 group text-sm tracking-wide pb-1 border-b border-misana-ink"
          >
            <span>{{ locale === 'fr' ? 'Faire une demande' : 'Begin a request' }}</span>
            <span class="transition-transform duration-500 group-hover:translate-x-1">→</span>
          </NuxtLink>
        </div>
        <div class="aspect-[4/3] overflow-hidden rounded-[6px] bg-misana-stone">
          <img
            :src="detail!.aboutImage"
            :alt="`${serviceName} ${eventName}`"
            class="w-full h-full object-cover"
          />
        </div>
      </div>
    </section>

    <!-- 04. OFFERINGS -->
    <section class="bg-misana-paper border-t border-misana-line">
      <div class="max-w-[1600px] mx-auto px-6 sm:px-12 py-16 sm:py-20">
        <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-10 sm:mb-14">
          <div>
            <p class="text-[11px] uppercase tracking-[0.25em] text-misana-muted mb-4">
              {{ locale === 'fr' ? 'Notre service' : 'Our service' }}
            </p>
            <h2 class="font-display text-3xl sm:text-4xl lg:text-5xl leading-[1.05] max-w-2xl">
              {{ locale === 'fr' ? 'Ce que nous orchestrons' : 'What we orchestrate' }}
            </h2>
          </div>
          <NuxtLink
            :to="localePath({ path: '/request', query: { service, event } })"
            class="hidden sm:inline-flex items-center gap-3 group text-sm tracking-wide pb-1 border-b border-misana-ink whitespace-nowrap"
          >
            <span>{{ locale === 'fr' ? 'Faire une demande' : 'Begin a request' }}</span>
            <span class="transition-transform duration-500 group-hover:translate-x-1">→</span>
          </NuxtLink>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          <div
            v-for="(o, i) in detail!.offerings"
            :key="i"
            class="group flex flex-col"
          >
            <div class="aspect-[4/5] overflow-hidden">
              <img
                :src="o.image"
                :alt="lng === 'fr' ? o.titleFr : o.titleEn"
                loading="lazy"
                class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              />
            </div>
            <div class="pt-5">
              <h3 class="font-display text-xl mb-2 leading-snug">
                {{ lng === 'fr' ? o.titleFr : o.titleEn }}
              </h3>
              <p class="text-sm text-misana-ink/85 leading-relaxed">
                {{ lng === 'fr' ? o.descFr : o.descEn }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 05. POPULAR ROUTES -->
    <section v-if="popularTransfers.length" class="bg-misana-paper border-t border-misana-line">
      <div class="max-w-[1600px] mx-auto px-6 sm:px-12 py-12 sm:py-14">
        <p class="text-[11px] uppercase tracking-[0.2em] text-misana-muted mb-5">
          {{ locale === 'fr' ? 'Routes populaires' : 'Popular routes' }}
        </p>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <NuxtLink
            v-for="t in popularTransfers"
            :key="t.slug"
            :to="localePath(`/transfers/${transferModeFor(t)}/${t.slug}`)"
            class="popular-chip group"
          >
            <p class="text-[10px] uppercase tracking-[0.18em] text-misana-muted mb-1.5">
              {{ transferModeFor(t) === 'helicopter' ? (locale === 'fr' ? 'Hélicoptère' : 'Helicopter') : 'Chauffeur' }}
            </p>
            <p class="text-sm font-medium leading-tight">{{ t[lng] }}</p>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- 06b. CARS SELECTION (design .ccg du listing cars/all, cars uniquement) -->
    <section v-if="service === 'cars' && carsForEvent.length" class="bg-misana-paper border-t border-misana-line">
      <div class="max-w-[1600px] mx-auto px-6 sm:px-12 py-16 sm:py-20">
        <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-10 sm:mb-14">
          <div>
            <p class="text-[11px] uppercase tracking-[0.25em] text-misana-muted mb-4">
              {{ locale === 'fr' ? 'Sélection' : 'Selection' }}
            </p>
            <h2 class="font-display text-3xl sm:text-4xl lg:text-5xl leading-[1.05] max-w-2xl">
              {{ locale === 'fr' ? 'Voitures pour l\'événement' : 'Cars for the event' }}
            </h2>
          </div>
          <NuxtLink
            :to="localePath({ name: 'cars-all' })"
            class="hidden sm:inline-flex items-center gap-3 group text-sm tracking-wide pb-1 border-b border-misana-ink whitespace-nowrap"
          >
            <span>{{ locale === 'fr' ? 'Toute la flotte' : 'All cars' }}</span>
            <span class="transition-transform duration-500 group-hover:translate-x-1">→</span>
          </NuxtLink>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          <NuxtLink
            v-for="c in carsForEvent"
            :key="c.id"
            :to="localePath({ name: 'cars-brandModel', params: { brandModel: c.id } })"
            class="ccg group"
          >
            <div class="ccg-image-wrap">
              <img :src="c.hero" :alt="c.fullName" loading="lazy" class="ccg-image" />
              <span class="card-cue" aria-hidden="true">
                <svg viewBox="0 0 20 20" fill="none" class="block w-5 h-5">
                  <path d="M6 14L14 6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
                  <path d="M7 6H14V13" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </span>
            </div>

            <div class="ccg-title-wrap">
              <span class="ccg-logo" aria-hidden="true">{{ brandInitial(c.brand) }}</span>
              <div class="ccg-title-block">
                <h3 class="ccg-title">{{ c.fullName }}</h3>
                <p class="ccg-details">
                  <span>{{ c.year }}</span>
                  <span class="ccg-dot" aria-hidden="true"></span>
                  <span>{{ c.hp }} {{ locale === 'fr' ? 'ch' : 'hp' }}</span>
                  <span class="ccg-dot" aria-hidden="true"></span>
                  <span>{{ c.topSpeedKmh }} km/h</span>
                </p>
              </div>
            </div>

            <div class="ccg-price-wrap">
              <span class="ccg-tag">{{ c.pax }} {{ t('request.fleet.pax') }}</span>
              <div class="ccg-price">
                <span class="ccg-price-value">{{ fmtCarPrice(c.prices.oneToThreeDays) }}</span>
                <span class="ccg-price-unit">{{ t('cars.perDayShort') }}</span>
              </div>
            </div>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- 06c. YACHTS SELECTION (yacht uniquement) -->
    <section v-if="service === 'yacht' && yachtsForEvent.length" class="bg-misana-paper border-t border-misana-line">
      <div class="max-w-[1600px] mx-auto px-6 sm:px-12 py-16 sm:py-20">
        <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-10 sm:mb-14">
          <div>
            <p class="text-[11px] uppercase tracking-[0.25em] text-misana-muted mb-4">
              {{ locale === 'fr' ? 'Sélection' : 'Selection' }}
            </p>
            <h2 class="font-display text-3xl sm:text-4xl lg:text-5xl leading-[1.05] max-w-2xl">
              {{ locale === 'fr' ? 'Yachts pour l\'événement' : 'Yachts for the event' }}
            </h2>
          </div>
          <NuxtLink
            :to="localePath({ name: 'yacht-all' })"
            class="hidden sm:inline-flex items-center gap-3 group text-sm tracking-wide pb-1 border-b border-misana-ink whitespace-nowrap"
          >
            <span>{{ locale === 'fr' ? 'Toute la flotte' : 'All yachts' }}</span>
            <span class="transition-transform duration-500 group-hover:translate-x-1">→</span>
          </NuxtLink>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          <NuxtLink
            v-for="y in yachtsForEvent"
            :key="y.id"
            :to="localePath({ name: 'yacht-yacht', params: { yacht: y.id } })"
            class="ccg group"
          >
            <div class="ccg-image-wrap">
              <img :src="y.hero" :alt="y.fullName" loading="lazy" class="ccg-image" />
              <span class="card-cue" aria-hidden="true">
                <svg viewBox="0 0 20 20" fill="none" class="block w-5 h-5">
                  <path d="M6 14L14 6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
                  <path d="M7 6H14V13" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </span>
            </div>

            <div class="ccg-title-wrap">
              <span class="ccg-logo" aria-hidden="true">{{ brandInitial(y.builder) }}</span>
              <div class="ccg-title-block">
                <h3 class="ccg-title">{{ y.fullName }}</h3>
                <p class="ccg-details">
                  <span>{{ y.year }}</span>
                  <span class="ccg-dot" aria-hidden="true"></span>
                  <span>{{ y.lengthM }} m</span>
                  <span class="ccg-dot" aria-hidden="true"></span>
                  <span>{{ typeLabel(y.type) }}</span>
                </p>
              </div>
            </div>

            <div class="ccg-price-wrap">
              <span class="ccg-tag">{{ y.guests }} {{ t('yacht.guestsShort') }}</span>
              <div class="ccg-price">
                <template v-if="y.pricePerDay">
                  <span class="ccg-price-value">{{ fmtCarPrice(y.pricePerDay) }}</span>
                  <span class="ccg-price-unit">{{ t('yacht.perDayShort') }}</span>
                </template>
                <template v-else>
                  <span class="ccg-price-value">{{ fmtCarPrice(y.pricePerWeekFrom) }}</span>
                  <span class="ccg-price-unit">{{ t('yacht.perWeekShort') }}</span>
                </template>
              </div>
            </div>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- 06. FLEET (chauffeur uniquement V1) -->
    <section v-if="service === 'chauffeur'" class="bg-misana-paper border-t border-misana-line">
      <div class="max-w-[1600px] mx-auto px-6 sm:px-12 py-16 sm:py-20">
        <div class="text-center mb-10 sm:mb-14">
          <p class="text-[11px] uppercase tracking-[0.25em] text-misana-muted mb-5">{{ t('chauffeur.fleetKicker') }}</p>
          <h2 class="font-display text-3xl sm:text-4xl lg:text-5xl leading-[1.05]">
            {{ locale === 'fr' ? 'Notre flotte' : 'Our fleet' }}
          </h2>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-7">
          <NuxtLink
            v-for="v in VEHICLES"
            :key="v.id"
            :to="localePath({ path: '/request', query: { service: 'chauffeur', vehicle: v.id, event } })"
            class="fleet-card"
          >
            <div class="fleet-card-top">
              <h3 class="fleet-name">{{ v.name }}</h3>
              <p class="fleet-type">{{ locale === 'fr' ? v.subFr : v.sub }}</p>
            </div>

            <div class="fleet-image-wrap" :class="v.imageMode === 'cover' ? 'fleet-image-cover' : 'fleet-image-contain'">
              <img :src="v.image" :alt="v.name" loading="lazy" draggable="false" class="fleet-image" />
            </div>

            <div class="fleet-stats">
              <div class="fleet-stat">
                <p class="fleet-stat-label">{{ t('chauffeur.fleetStatType') }}</p>
                <p class="fleet-stat-value">{{ locale === 'fr' ? v.subFr : v.sub }}</p>
              </div>
              <span class="fleet-stat-divider" aria-hidden="true"></span>
              <div class="fleet-stat">
                <p class="fleet-stat-label">{{ t('chauffeur.fleetStatSeats') }}</p>
                <p class="fleet-stat-value">{{ v.pax }}</p>
              </div>
              <span class="fleet-stat-divider" aria-hidden="true"></span>
              <div class="fleet-stat">
                <p class="fleet-stat-label">{{ t('chauffeur.fleetStatLuggage') }}</p>
                <p class="fleet-stat-value">{{ v.luggage }}</p>
              </div>
            </div>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- 07. WHY MISANA -->
    <section class="bg-misana-paper border-t border-misana-line">
      <div class="max-w-[1600px] mx-auto px-6 sm:px-12 py-12 sm:py-16">
        <p class="text-[11px] uppercase tracking-[0.25em] text-misana-muted mb-4">
          {{ locale === 'fr' ? 'Pourquoi Misana' : 'Why Misana' }}
        </p>
        <h2 class="font-display text-2xl sm:text-3xl lg:text-4xl leading-[1.1] mb-8 sm:mb-10 max-w-3xl">
          {{ locale === 'fr' ? 'Pourquoi nous choisir' : 'Why choose us' }}
        </h2>
        <ol class="grid sm:grid-cols-2 gap-x-10 gap-y-5">
          <li v-for="(reason, i) in detail!.whyHere[lng]" :key="i" class="flex gap-4">
            <span class="font-display italic text-xl text-misana-muted leading-none mt-1 flex-shrink-0 w-8">
              {{ String(i + 1).padStart(2, '0') }}
            </span>
            <span class="text-sm sm:text-base leading-relaxed">{{ reason }}</span>
          </li>
        </ol>
      </div>
    </section>

    <!-- 08. SEO + FAQ -->
    <section class="bg-misana-paper border-t border-misana-line">
      <div class="max-w-[1600px] mx-auto px-6 sm:px-12 py-16 sm:py-20">
        <p class="text-[11px] uppercase tracking-[0.2em] text-misana-muted mb-3">
          {{ locale === 'fr' ? 'À propos de ce service' : 'About this service' }}
        </p>
        <h2 class="font-display text-3xl sm:text-4xl mb-7 leading-[1.1]">
          {{ locale === 'fr' ? `${serviceName} pendant ${eventName}` : `${serviceName} during ${eventName}` }}
        </h2>
        <p class="text-base sm:text-lg leading-[1.8] mb-14">{{ detail!.aboutText[lng] }}</p>

        <h2 class="font-display text-2xl sm:text-3xl mb-7 mt-16 leading-tight">
          {{ locale === 'fr' ? 'Questions fréquentes' : 'Frequently asked' }}
        </h2>
        <div class="divide-y divide-misana-line">
          <details v-for="(item, i) in detail!.faq" :key="i" class="group py-5">
            <summary class="flex items-center justify-between cursor-pointer list-none gap-4">
              <span class="text-base font-medium pr-4 leading-snug">{{ item.q[lng] }}</span>
              <span class="text-misana-muted text-xl leading-none transition-transform group-open:rotate-45 flex-shrink-0">+</span>
            </summary>
            <p class="mt-4 text-sm text-misana-ink/85 leading-relaxed pr-8">{{ item.a[lng] }}</p>
          </details>
        </div>
      </div>
    </section>

    <!-- 09. OTHER EVENTS -->
    <section v-if="otherEvents.length" class="bg-misana-paper border-t border-misana-line">
      <div class="max-w-[1600px] mx-auto px-6 sm:px-12 py-12 sm:py-14">
        <p class="text-[11px] uppercase tracking-[0.2em] text-misana-muted mb-5">
          {{ locale === 'fr' ? 'Autres événements' : 'Other events' }}
        </p>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <NuxtLink
            v-for="e in otherEvents"
            :key="e.slug"
            :to="localePath(serviceEventPath(service, e.slug, lng))"
            class="popular-chip group"
          >
            <p class="text-[10px] uppercase tracking-[0.18em] text-misana-muted mb-1.5">
              {{ serviceName }}
            </p>
            <p class="text-sm font-medium leading-tight">{{ e[lng] }}</p>
          </NuxtLink>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
.popular-chip {
  display: block;
  padding: 1rem 1.1rem;
  border: 1px solid var(--color-misana-line);
  border-radius: 6px;
  background: var(--color-misana-paper);
  transition: border-color 0.2s ease, transform 0.3s ease;
}
.popular-chip:hover {
  border-color: var(--color-misana-ink);
  transform: translateY(-1px);
}

/* === CCG card design (clone du listing /voitures/all) === */
.ccg {
  display: flex;
  flex-direction: column;
  gap: 24px;
  background: var(--color-misana-paper);
  border: 1px solid var(--color-misana-line);
  border-radius: 6px;
  padding: 24px;
  text-decoration: none;
  color: var(--color-misana-ink);
  overflow: hidden;
  transition: border-color 0.4s ease, box-shadow 0.4s ease;
}
.ccg:hover {
  border-color: var(--color-misana-ink);
  box-shadow: 0 12px 28px -20px rgba(0, 0, 0, 0.18);
}
.ccg-image-wrap {
  position: relative;
  width: 100%;
  height: 216px;
  overflow: hidden;
  border-radius: 4px;
  background: var(--color-misana-paper);
}
.ccg-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 1.1s cubic-bezier(0.16, 1, 0.3, 1);
}
.ccg:hover .ccg-image { transform: scale(1.04); }
.ccg-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  font-size: 0.6rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  padding: 0.35rem 0.7rem;
  background: var(--color-misana-paper);
  color: var(--color-misana-ink);
  border-radius: 4px;
}
.ccg-title-wrap {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  width: 100%;
}
.ccg-logo {
  flex: 0 0 auto;
  width: 46px;
  height: 46px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--color-misana-line);
  border-radius: 4px;
  font-family: var(--font-display, serif);
  font-size: 1.1rem;
  color: var(--color-misana-ink);
  background: var(--color-misana-paper);
}
.ccg-title-block {
  flex: 1 0 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.ccg-title {
  font-family: var(--font-display, serif);
  font-size: 1.05rem;
  font-weight: 500;
  line-height: 1.25;
  margin: 0;
  color: var(--color-misana-ink);
  word-break: break-word;
}
.ccg-details {
  margin: 4px 0 0;
  font-size: 0.78rem;
  color: var(--color-misana-muted);
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}
.ccg-dot {
  width: 3px;
  height: 3px;
  border-radius: 99px;
  background: currentColor;
  opacity: 0.55;
}
.ccg-price-wrap {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
}
.ccg-tag {
  font-size: 0.78rem;
  color: var(--color-misana-ink);
  padding: 5px 14px;
  background: var(--color-misana-paper);
  border: 1px solid var(--color-misana-line);
  border-radius: 4px;
  white-space: nowrap;
}
.ccg-price {
  display: inline-flex;
  align-items: baseline;
  gap: 6px;
  padding-left: 24px;
  white-space: nowrap;
}
.ccg-price-value {
  font-family: var(--font-display, serif);
  font-size: 1.4rem;
  line-height: 1;
  color: var(--color-misana-ink);
}
.ccg-price-unit {
  font-size: 0.78rem;
  color: var(--color-misana-muted);
}
.card-cue {
  position: absolute;
  bottom: 14px;
  right: 14px;
  width: 46px;
  height: 46px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--color-misana-ink);
  color: var(--color-misana-paper);
  border-radius: 4px;
  opacity: 0;
  transform: translateY(8px);
  transition: opacity 0.4s ease, transform 0.55s cubic-bezier(0.16, 1, 0.3, 1);
  pointer-events: none;
}
.ccg:hover .card-cue {
  opacity: 1;
  transform: translateY(0);
}
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
.fleet-name {
  font-family: var(--font-display, serif);
  font-size: 1.3rem;
  line-height: 1.15;
  margin: 0;
  color: var(--color-misana-ink);
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
details summary::-webkit-details-marker { display: none; }
</style>
