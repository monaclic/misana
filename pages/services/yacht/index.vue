<script setup lang="ts">
// Hub editorial yacht (step 2 dans le funnel SEO).
// Structure copee Excellence Riviera : intro + tiles vers categories + few featured.
// Le catalog filtrable complet vit a /services/yacht/all (step 3).
import { YACHTS, YACHT_TYPE_LABELS } from '~/lib/yachts';
import { YACHT_SIZES, type YachtSize } from '~/types/request';
import { CITIES } from '~/lib/constants';

definePageMeta({ layout: 'default' });

const { locale, t } = useI18n();
const localePath = useLocalePath();

useSeoMeta({
  title: () => t('yacht.hubTitle'),
  description: () => t('yacht.hubDescription'),
});

useHead({
  script: [{
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: 'Yacht charter on the French Riviera',
      provider: { '@type': 'Organization', name: 'Misana' },
      areaServed: ['French Riviera', 'Corsica', 'Sardinia'],
      serviceType: 'Yacht charter',
    }),
  }],
});

// Tiles categories : par taille, par type, par port
const SIZE_TILES: { size: YachtSize; en: string; fr: string; descEn: string; descFr: string }[] = [
  { size: '15-20m', en: '15 to 20 metres', fr: '15 à 20 mètres', descEn: 'Day cruise, sport hulls.', descFr: 'Day-cruise, coques sport.' },
  { size: '20-30m', en: '20 to 30 metres', fr: '20 à 30 mètres', descEn: 'Weekend or week, four cabins.', descFr: 'Weekend ou semaine, quatre cabines.' },
  { size: '30-50m', en: '30 to 50 metres', fr: '30 à 50 mètres', descEn: 'Mediterranean week, ten guests.', descFr: 'Semaine en Méditerranée, dix personnes.' },
  { size: '50m+', en: 'Above 50 metres', fr: 'Plus de 50 mètres', descEn: 'Mega yacht, twelve guests.', descFr: 'Mega yacht, douze personnes.' },
];

const TYPE_TILES = [
  { type: 'motor' as const },
  { type: 'sail' as const },
  { type: 'catamaran' as const },
];

const PORT_TILES = [
  { slug: 'cannes' },
  { slug: 'monaco' },
  { slug: 'saint-tropez' },
];

// 4 yachts featured
const featured = computed(() =>
  YACHTS.filter((y) => y.badge === 'flagship' || y.badge === 'popular').slice(0, 4),
);

function cityName(slug: string) {
  const c = CITIES.find((x) => x.slug === slug);
  return c ? (locale.value === 'fr' ? c.fr : c.en) : slug;
}

function fmtPrice(p: number | null): string {
  if (p === null) return t('yacht.onRequest');
  return new Intl.NumberFormat(locale.value === 'fr' ? 'fr-FR' : 'en-GB', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(p);
}

function countBySize(size: YachtSize) {
  return YACHTS.filter((y) => y.size === size).length;
}
function countByType(type: 'motor' | 'sail' | 'catamaran') {
  return YACHTS.filter((y) => y.type === type).length;
}
function countByPort(slug: string) {
  return YACHTS.filter((y) => y.ports.includes(slug)).length;
}
</script>

<template>
  <main class="min-h-screen">
    <!-- Hero -->
    <section class="bg-misana-stone border-b border-misana-line">
      <div class="max-w-5xl mx-auto px-6 py-16 sm:py-24">
        <p class="text-xs uppercase tracking-widest text-misana-muted mb-4">{{ t('yacht.kicker') }}</p>
        <h1 class="font-display text-4xl sm:text-5xl mb-4">{{ t('yacht.hubTitle') }}</h1>
        <p class="text-misana-muted text-lg max-w-2xl mb-8">{{ t('yacht.hubLead') }}</p>
        <NuxtLink :to="localePath('/services/yacht/all')" class="inline-block border border-misana-ink px-6 py-3 text-sm tracking-wide hover:bg-misana-ink hover:text-misana-paper transition">
          {{ t('yacht.browseAllCta') }} ({{ YACHTS.length }}) →
        </NuxtLink>
      </div>
    </section>

    <!-- Tiles par taille -->
    <section class="border-b border-misana-line">
      <div class="max-w-7xl mx-auto px-6 py-16">
        <p class="text-xs uppercase tracking-widest text-misana-muted mb-3">{{ t('yacht.bySizeKicker') }}</p>
        <h2 class="font-display text-3xl mb-8">{{ t('yacht.bySizeTitle') }}</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <NuxtLink
            v-for="t in SIZE_TILES"
            :key="t.size"
            :to="localePath(`/services/yacht/by-size/${t.size}`)"
            class="group block border border-misana-line hover:border-misana-ink transition p-6"
          >
            <p class="text-[10px] uppercase tracking-widest text-misana-muted mb-2">{{ countBySize(t.size) }} {{ $t('yacht.results', countBySize(t.size)) }}</p>
            <p class="font-display text-xl mb-2">{{ locale === 'fr' ? t.fr : t.en }}</p>
            <p class="text-xs text-misana-muted">{{ locale === 'fr' ? t.descFr : t.descEn }}</p>
            <p class="text-[10px] uppercase tracking-widest mt-4 group-hover:text-misana-ink transition">{{ $t('yacht.exploreCategory') }} →</p>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Tiles par type -->
    <section class="border-b border-misana-line bg-misana-stone">
      <div class="max-w-7xl mx-auto px-6 py-16">
        <p class="text-xs uppercase tracking-widest text-misana-muted mb-3">{{ t('yacht.byTypeKicker') }}</p>
        <h2 class="font-display text-3xl mb-8">{{ t('yacht.byTypeTitle') }}</h2>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <NuxtLink
            v-for="t in TYPE_TILES"
            :key="t.type"
            :to="localePath(`/services/yacht/by-type/${t.type}`)"
            class="group block bg-misana-paper border border-misana-line hover:border-misana-ink transition p-8"
          >
            <p class="text-[10px] uppercase tracking-widest text-misana-muted mb-2">{{ countByType(t.type) }} {{ $t('yacht.results', countByType(t.type)) }}</p>
            <p class="font-display text-2xl mb-2">{{ locale === 'fr' ? YACHT_TYPE_LABELS[t.type].fr : YACHT_TYPE_LABELS[t.type].en }}</p>
            <p class="text-[10px] uppercase tracking-widest mt-4 group-hover:text-misana-ink transition">{{ $t('yacht.exploreCategory') }} →</p>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Tiles par port -->
    <section class="border-b border-misana-line">
      <div class="max-w-7xl mx-auto px-6 py-16">
        <p class="text-xs uppercase tracking-widest text-misana-muted mb-3">{{ t('yacht.byPortKicker') }}</p>
        <h2 class="font-display text-3xl mb-8">{{ t('yacht.byPortTitle') }}</h2>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <NuxtLink
            v-for="p in PORT_TILES"
            :key="p.slug"
            :to="localePath(`/services/yacht/by-port/${p.slug}`)"
            class="group block border border-misana-line hover:border-misana-ink transition p-8"
          >
            <p class="text-[10px] uppercase tracking-widest text-misana-muted mb-2">{{ countByPort(p.slug) }} {{ $t('yacht.results', countByPort(p.slug)) }}</p>
            <p class="font-display text-2xl mb-2">{{ cityName(p.slug) }}</p>
            <p class="text-[10px] uppercase tracking-widest mt-4 group-hover:text-misana-ink transition">{{ $t('yacht.exploreCategory') }} →</p>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Featured yachts -->
    <section v-if="featured.length" class="border-b border-misana-line">
      <div class="max-w-7xl mx-auto px-6 py-16">
        <p class="text-xs uppercase tracking-widest text-misana-muted mb-3">{{ t('yacht.featuredKicker') }}</p>
        <h2 class="font-display text-3xl mb-8">{{ t('yacht.featuredTitle') }}</h2>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <NuxtLink
            v-for="y in featured"
            :key="y.id"
            :to="localePath(`/services/yacht/${y.id}`)"
            class="group ring-1 ring-misana-line hover:ring-misana-ink transition overflow-hidden bg-misana-paper flex flex-col"
          >
            <div class="aspect-[4/3] relative overflow-hidden bg-misana-stone">
              <img :src="y.hero" :alt="y.fullName" loading="lazy" class="absolute inset-0 w-full h-full object-cover transition duration-700 group-hover:scale-[1.02]" />
              <span v-if="y.badge" class="absolute top-3 left-3 text-[10px] uppercase tracking-widest px-2 py-1 bg-misana-paper text-misana-ink">{{ t(`request.fleet.badge.${y.badge}`) }}</span>
            </div>
            <div class="p-5 flex-1 flex flex-col">
              <p class="text-[10px] uppercase tracking-widest text-misana-muted mb-1">{{ y.builder }} · {{ y.lengthM }} m</p>
              <p class="text-sm font-medium leading-tight">{{ y.name }}</p>
              <p class="text-xs text-misana-muted mt-1">{{ y.guests }} {{ t('yacht.guests') }} · {{ y.cabins }} {{ t('yacht.cabinsShort') }}</p>
              <p class="text-xs text-misana-ink mt-3">
                <span class="text-misana-muted">{{ t('yacht.from') }} </span>
                {{ fmtPrice(y.pricePerDay) }}<span class="text-misana-muted"> / {{ t('yacht.day') }}</span>
              </p>
            </div>
          </NuxtLink>
        </div>

        <div class="mt-8 text-center">
          <NuxtLink :to="localePath('/services/yacht/all')" class="text-sm underline underline-offset-4 hover:text-misana-ink transition">
            {{ t('yacht.browseAllCta') }} ({{ YACHTS.length }}) →
          </NuxtLink>
        </div>
      </div>
    </section>
  </main>
</template>
