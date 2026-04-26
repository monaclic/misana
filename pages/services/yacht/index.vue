<script setup lang="ts">
// Hub catalog yacht avec filtres multi-axes :
// taille bracket / builder / capacite guests / tranche prix / amenities.
import { YACHTS, YACHT_PRICE_BUCKETS, YACHT_AMENITY_LABELS, yachtBuilders, type YachtAmenity } from '~/lib/yachts';
import { YACHT_SIZES, type YachtSize } from '~/types/request';

definePageMeta({ layout: 'default' });

const { locale, t } = useI18n();
const localePath = useLocalePath();

useSeoMeta({
  title: () => t('yacht.hubTitle'),
  description: () => t('yacht.hubDescription'),
});

const activeSize = ref<YachtSize | null>(null);
const activeBuilder = ref<string | null>(null);
const activeGuestsBucket = ref<string | null>(null);
const activePriceBucket = ref<string | null>(null);
const activeAmenities = ref<YachtAmenity[]>([]);

const builders = yachtBuilders();

const GUEST_BUCKETS = [
  { id: 'up-to-6', label: 'Up to 6', min: 0, max: 6 },
  { id: '7-10', label: '7 to 10', min: 7, max: 10 },
  { id: '11-plus', label: '11 and more', min: 11, max: 30 },
];

// Top amenities mises en avant comme filtres rapides
const TOP_AMENITIES: YachtAmenity[] = ['jacuzzi', 'jet-ski', 'seabob', 'gym'];

const visibleYachts = computed(() => {
  return YACHTS.filter((y) => {
    if (activeSize.value && y.size !== activeSize.value) return false;
    if (activeBuilder.value && y.builder !== activeBuilder.value) return false;
    if (activeGuestsBucket.value) {
      const b = GUEST_BUCKETS.find((x) => x.id === activeGuestsBucket.value);
      if (!b || y.guests < b.min || y.guests > b.max) return false;
    }
    if (activePriceBucket.value) {
      const b = YACHT_PRICE_BUCKETS.find((x) => x.id === activePriceBucket.value);
      if (!b) return false;
      if (y.pricePerWeekFrom < b.min || y.pricePerWeekFrom > b.max) return false;
    }
    if (activeAmenities.value.length) {
      for (const a of activeAmenities.value) {
        if (!y.amenities.includes(a)) return false;
      }
    }
    return true;
  });
});

const filterCount = computed(() =>
  (activeSize.value ? 1 : 0) +
  (activeBuilder.value ? 1 : 0) +
  (activeGuestsBucket.value ? 1 : 0) +
  (activePriceBucket.value ? 1 : 0) +
  activeAmenities.value.length,
);

function toggleAmenity(a: YachtAmenity) {
  const idx = activeAmenities.value.indexOf(a);
  if (idx >= 0) activeAmenities.value.splice(idx, 1);
  else activeAmenities.value.push(a);
}

function clearFilters() {
  activeSize.value = null;
  activeBuilder.value = null;
  activeGuestsBucket.value = null;
  activePriceBucket.value = null;
  activeAmenities.value = [];
}

function fmtPrice(p: number | null): string {
  if (p === null) return t('yacht.onRequest');
  return new Intl.NumberFormat(locale.value === 'fr' ? 'fr-FR' : 'en-GB', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(p);
}
</script>

<template>
  <main class="min-h-screen">
    <section class="bg-misana-stone border-b border-misana-line">
      <div class="max-w-5xl mx-auto px-6 py-16 sm:py-24">
        <p class="text-xs uppercase tracking-widest text-misana-muted mb-4">
          {{ t('yacht.kicker') }}
        </p>
        <h1 class="font-display text-4xl sm:text-5xl mb-4">{{ t('yacht.hubTitle') }}</h1>
        <p class="text-misana-muted text-lg max-w-2xl">{{ t('yacht.hubLead') }}</p>
      </div>
    </section>

    <section class="max-w-7xl mx-auto px-6 py-12">
      <div class="border-b border-misana-line pb-8 mb-12 space-y-6">
        <!-- Taille -->
        <div>
          <p class="text-[10px] uppercase tracking-widest text-misana-muted mb-3">{{ t('yacht.filterSize') }}</p>
          <div class="flex flex-wrap gap-2">
            <button
              type="button"
              class="text-xs px-3 py-1.5 transition border"
              :class="activeSize === null ? 'border-misana-ink bg-misana-ink text-misana-paper' : 'border-misana-line hover:border-misana-ink'"
              @click="activeSize = null"
            >{{ t('yacht.allSizes') }}</button>
            <button
              v-for="s in YACHT_SIZES"
              :key="s"
              type="button"
              class="text-xs px-3 py-1.5 transition border"
              :class="activeSize === s ? 'border-misana-ink bg-misana-ink text-misana-paper' : 'border-misana-line hover:border-misana-ink'"
              @click="activeSize = s"
            >{{ s }}</button>
          </div>
        </div>

        <!-- Builder -->
        <div>
          <p class="text-[10px] uppercase tracking-widest text-misana-muted mb-3">{{ t('yacht.filterBuilder') }}</p>
          <div class="flex flex-wrap gap-2">
            <button
              type="button"
              class="text-xs px-3 py-1.5 transition border"
              :class="activeBuilder === null ? 'border-misana-ink bg-misana-ink text-misana-paper' : 'border-misana-line hover:border-misana-ink'"
              @click="activeBuilder = null"
            >{{ t('yacht.allBuilders') }}</button>
            <button
              v-for="b in builders"
              :key="b"
              type="button"
              class="text-xs px-3 py-1.5 transition border"
              :class="activeBuilder === b ? 'border-misana-ink bg-misana-ink text-misana-paper' : 'border-misana-line hover:border-misana-ink'"
              @click="activeBuilder = b"
            >{{ b }}</button>
          </div>
        </div>

        <!-- Capacite -->
        <div>
          <p class="text-[10px] uppercase tracking-widest text-misana-muted mb-3">{{ t('yacht.filterGuests') }}</p>
          <div class="flex flex-wrap gap-2">
            <button
              type="button"
              class="text-xs px-3 py-1.5 transition border"
              :class="activeGuestsBucket === null ? 'border-misana-ink bg-misana-ink text-misana-paper' : 'border-misana-line hover:border-misana-ink'"
              @click="activeGuestsBucket = null"
            >{{ t('yacht.allGuests') }}</button>
            <button
              v-for="b in GUEST_BUCKETS"
              :key="b.id"
              type="button"
              class="text-xs px-3 py-1.5 transition border"
              :class="activeGuestsBucket === b.id ? 'border-misana-ink bg-misana-ink text-misana-paper' : 'border-misana-line hover:border-misana-ink'"
              @click="activeGuestsBucket = b.id"
            >{{ b.label }}</button>
          </div>
        </div>

        <!-- Tranche prix -->
        <div>
          <p class="text-[10px] uppercase tracking-widest text-misana-muted mb-3">{{ t('yacht.filterPrice') }}</p>
          <div class="flex flex-wrap gap-2">
            <button
              type="button"
              class="text-xs px-3 py-1.5 transition border"
              :class="activePriceBucket === null ? 'border-misana-ink bg-misana-ink text-misana-paper' : 'border-misana-line hover:border-misana-ink'"
              @click="activePriceBucket = null"
            >{{ t('yacht.allPrices') }}</button>
            <button
              v-for="bucket in YACHT_PRICE_BUCKETS"
              :key="bucket.id"
              type="button"
              class="text-xs px-3 py-1.5 transition border"
              :class="activePriceBucket === bucket.id ? 'border-misana-ink bg-misana-ink text-misana-paper' : 'border-misana-line hover:border-misana-ink'"
              @click="activePriceBucket = bucket.id"
            >{{ bucket.label }}</button>
          </div>
        </div>

        <!-- Amenities (multi-select) -->
        <div>
          <p class="text-[10px] uppercase tracking-widest text-misana-muted mb-3">{{ t('yacht.filterAmenities') }}</p>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="a in TOP_AMENITIES"
              :key="a"
              type="button"
              class="text-xs px-3 py-1.5 transition border inline-flex items-center gap-1.5"
              :class="
                activeAmenities.includes(a)
                  ? 'border-misana-ink bg-misana-ink text-misana-paper'
                  : 'border-misana-line hover:border-misana-ink'
              "
              @click="toggleAmenity(a)"
            >
              <span aria-hidden="true">{{ activeAmenities.includes(a) ? '✓' : '+' }}</span>
              {{ locale === 'fr' ? YACHT_AMENITY_LABELS[a].fr : YACHT_AMENITY_LABELS[a].en }}
            </button>
          </div>
        </div>

        <!-- Compteur + reset -->
        <div class="flex items-center justify-between text-xs text-misana-muted">
          <p>
            {{ visibleYachts.length }} {{ t('yacht.results', { n: visibleYachts.length }) }}
            <span v-if="filterCount" class="ml-2">· {{ filterCount }} {{ t('yacht.filtersActive') }}</span>
          </p>
          <button
            v-if="filterCount"
            type="button"
            class="underline underline-offset-4 hover:text-misana-ink transition"
            @click="clearFilters"
          >{{ t('yacht.clearFilters') }}</button>
        </div>
      </div>

      <div v-if="visibleYachts.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <NuxtLink
          v-for="y in visibleYachts"
          :key="y.id"
          :to="localePath(`/services/yacht/${y.id}`)"
          class="group ring-1 ring-misana-line hover:ring-misana-ink transition overflow-hidden bg-misana-paper flex flex-col"
        >
          <div class="aspect-[4/3] relative overflow-hidden bg-misana-stone">
            <img :src="y.hero" :alt="y.fullName" loading="lazy" class="absolute inset-0 w-full h-full object-cover transition duration-700 group-hover:scale-[1.02]" />
            <span
              v-if="y.badge"
              class="absolute top-3 left-3 text-[10px] uppercase tracking-widest px-2 py-1 bg-misana-paper text-misana-ink"
            >{{ t(`request.fleet.badge.${y.badge}`) }}</span>
          </div>
          <div class="p-5 flex-1 flex flex-col">
            <p class="text-[10px] uppercase tracking-widest text-misana-muted mb-1">
              {{ y.builder }} · {{ y.lengthM }} m
            </p>
            <p class="text-sm font-medium leading-tight">{{ y.name }}</p>
            <p class="text-xs text-misana-muted mt-1">{{ locale === 'fr' ? y.descFr : y.desc }}</p>
            <div class="flex items-baseline justify-between mt-4 text-xs text-misana-muted">
              <span>{{ y.guests }} {{ t('yacht.guests') }} · {{ y.cabins }} {{ t('yacht.cabinsShort') }}</span>
              <span class="text-misana-ink whitespace-nowrap">
                <span class="text-misana-muted">{{ t('yacht.from') }} </span>
                {{ fmtPrice(y.pricePerWeekFrom) }}
              </span>
            </div>
          </div>
        </NuxtLink>
      </div>

      <div v-else class="text-center py-16">
        <p class="text-misana-muted text-sm mb-4">{{ t('yacht.noResults') }}</p>
        <button
          type="button"
          class="text-xs underline underline-offset-4 hover:text-misana-ink transition"
          @click="clearFilters"
        >{{ t('yacht.clearFilters') }}</button>
      </div>

      <p class="text-xs text-misana-muted mt-8 italic">{{ t('yacht.priceFootnote') }}</p>
    </section>
  </main>
</template>
