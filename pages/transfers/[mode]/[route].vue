<script setup lang="ts">
// Fiche transfert pattern Uber : carte du trajet en hero, widget reservation
// avec prix dominant, data row de metriques, route details compacts,
// what-to-expect 3 bullets, alternatives chips, footer CTA.
//
// URL : /transfers/[mode]/[route] avec mode = chauffeur | helicopter.
// Le mode doit etre compatible avec celui declare dans TRANSFERS (chauffeur,
// helicopter, ou both).
import { TRANSFERS, CITIES } from '~/lib/constants';
import { getTransferDetail, formatPriceFrom } from '~/lib/transferDetails';

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

// Si la route part de "nice" mais le slug contient "nice-airport", l'origine
// effective est l'aeroport. Le constants.ts ne distingue pas, donc on detecte ici.
const fromGeo = computed(() => (slug.value.startsWith('nice-airport') ? 'nice-airport' : tEntry.from));
const toGeo = computed(() => tEntry.to);

const detail = computed(() => getTransferDetail(
  mode.value as 'chauffeur' | 'helicopter',
  slug.value,
  fromGeo.value,
  toGeo.value,
));

const fromName = computed(() => {
  if (slug.value.startsWith('nice-airport')) {
    return locale.value === 'fr' ? 'Aéroport de Nice' : 'Nice Airport';
  }
  return fromCity.value ? fromCity.value[lng.value] : '';
});
const toName = computed(() => (toCity.value ? toCity.value[lng.value] : ''));

const isHelico = computed(() => mode.value === 'helicopter');
const isChauffeur = computed(() => mode.value === 'chauffeur');

const duration = computed(() => isHelico.value ? detail.value.durationHelicopter : detail.value.durationChauffeur);

// SEO ciblage : mots-cles "Helicopter [from] [to]" / "Chauffeur [from] [to]"
const seoTitle = computed(() => {
  const modeLabel = isHelico.value
    ? (locale.value === 'fr' ? 'Hélicoptère' : 'Helicopter')
    : 'Chauffeur';
  return `${modeLabel} ${fromName.value} ${toName.value} · ${duration.value ?? ''} min · Misana`;
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
  ],
});

// Alternative mode si both
const alternativeMode = computed<'chauffeur' | 'helicopter' | null>(() => {
  if (allowedMode !== 'both') return null;
  return mode.value === 'chauffeur' ? 'helicopter' : 'chauffeur';
});

// Maillage : 3 routes connectes (meme depart, meme arrivee).
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

// Compute related route durations for chips
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
</script>

<template>
  <main class="min-h-screen">
    <!-- Sticky back -->
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

    <!-- Title (compact) -->
    <section>
      <div class="max-w-[1600px] mx-auto px-6 sm:px-12 pt-8 sm:pt-10 pb-3 sm:pb-4">
        <p class="text-[11px] uppercase tracking-[0.25em] text-misana-muted mb-2">
          {{ isHelico ? t('transfers.modeHelicopter') : t('transfers.modeChauffeur') }}
        </p>
        <h1 class="font-display text-3xl sm:text-4xl lg:text-5xl leading-[1.05]">
          <span>{{ fromName }}</span>
          <span class="text-misana-muted mx-2">→</span>
          <span>{{ toName }}</span>
        </h1>
      </div>
    </section>

    <!-- Hero : map left + reservation widget right -->
    <section>
      <div class="max-w-[1600px] mx-auto px-6 sm:px-12 py-6 sm:py-8 grid lg:grid-cols-12 gap-8 lg:gap-12">
        <div class="lg:col-span-7">
          <TransferMap :from="fromGeo" :to="toGeo" :mode="(mode as 'chauffeur' | 'helicopter')" :from-name="fromName" :to-name="toName" />
          <NuxtLink
            v-if="alternativeMode"
            :to="localePath(`/transfers/${alternativeMode}/${slug}`)"
            class="mt-4 inline-flex items-center gap-2 text-xs uppercase tracking-[0.15em] text-misana-muted hover:text-misana-ink transition group"
          >
            <span>{{ alternativeMode === 'helicopter' ? t('transfers.fiche.altHelico') : t('transfers.fiche.altChauffeur') }}</span>
            <span class="inline-block transition-transform duration-500 group-hover:translate-x-1">→</span>
          </NuxtLink>
        </div>

        <aside class="lg:col-span-5">
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
            variant="sticky"
          />
        </aside>
      </div>
    </section>

    <!-- DATA ROW : 4 metriques en typographie display, dashboard feel -->
    <section class="border-y border-misana-line">
      <div class="max-w-[1600px] mx-auto px-6 sm:px-12 py-8 sm:py-10 grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-10">
        <div>
          <p class="text-[10px] uppercase tracking-[0.2em] text-misana-muted mb-1.5">
            {{ isHelico ? t('transfers.fiche.metric.flightTime') : t('transfers.fiche.metric.driveTime') }}
          </p>
          <p class="font-display text-3xl sm:text-4xl leading-none">{{ duration }} <span class="text-base text-misana-muted">min</span></p>
        </div>
        <div>
          <p class="text-[10px] uppercase tracking-[0.2em] text-misana-muted mb-1.5">
            {{ t('transfers.fiche.metric.distance') }}
          </p>
          <p class="font-display text-3xl sm:text-4xl leading-none">{{ detail.distanceKm }} <span class="text-base text-misana-muted">km</span></p>
        </div>
        <div>
          <p class="text-[10px] uppercase tracking-[0.2em] text-misana-muted mb-1.5">
            {{ t('transfers.fiche.metric.capacity') }}
          </p>
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

    <!-- ROUTE DETAILS : Departure | Arrival, 2 cols, factuel -->
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
            <li v-if="isHelico" class="flex gap-2">
              <span class="text-misana-muted">·</span>
              <span>{{ t('transfers.fiche.boardingNote') }}</span>
            </li>
            <li v-else class="flex gap-2">
              <span class="text-misana-muted">·</span>
              <span>{{ t('transfers.fiche.pickupNote') }}</span>
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
            <li v-if="isHelico" class="flex gap-2">
              <span class="text-misana-muted">·</span>
              <span>{{ t('transfers.fiche.arrivalChauffeurNote') }}</span>
            </li>
            <li v-else class="flex gap-2">
              <span class="text-misana-muted">·</span>
              <span>{{ t('transfers.fiche.dropoffNote') }}</span>
            </li>
          </ul>
        </div>
      </div>
    </section>

    <!-- WHAT TO EXPECT : 3 bullets serres -->
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

    <!-- ALTERNATIVES : chips compacts -->
    <section v-if="related.length" class="border-t border-misana-line">
      <div class="max-w-[1600px] mx-auto px-6 sm:px-12 py-12 sm:py-16">
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

    <!-- Footer CTA -->
    <section class="bg-misana-stone border-t border-misana-line">
      <div class="max-w-[640px] mx-auto px-6 py-12 sm:py-16 text-center">
        <p class="text-[11px] uppercase tracking-[0.25em] text-misana-muted mb-3">
          {{ t('transfers.fiche.footerKicker') }}
        </p>
        <h2 class="font-display text-2xl sm:text-3xl mb-6">
          {{ fromName }} → {{ toName }} · {{ formatPriceFrom(detail.priceFrom, lng) }}
        </h2>
        <NuxtLink
          :to="localePath({ path: '/request', query: { service: isHelico ? 'helicopter' : 'chauffeur', from: tEntry.from, to: tEntry.to } })"
          class="inline-flex items-center gap-3 px-7 py-3.5 bg-misana-ink text-misana-paper text-sm tracking-wide rounded-[4px] hover:opacity-90 transition group"
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
</style>
