<script setup lang="ts">
// Hub catalog cars : 12 voitures Excellence Riviera, filtres multi-axes
// (categorie + marque + tranche prix journalier).
import {
  RENTAL_CARS,
  RENTAL_CATEGORIES,
  RENTAL_PRICE_BUCKETS,
  rentalBrands,
  type RentalCarCategory,
} from '~/lib/rentalCars';

definePageMeta({ layout: 'default' });

const { locale, t } = useI18n();
const localePath = useLocalePath();

useSeoMeta({
  title: () => t('cars.hubTitle'),
  description: () => t('cars.hubDescription'),
});

const activeCategory = ref<RentalCarCategory | null>(null);
const activeBrand = ref<string | null>(null);
const activePriceBucket = ref<string | null>(null);

const brands = rentalBrands();

const visibleCars = computed(() => {
  return RENTAL_CARS.filter((c) => {
    if (activeCategory.value && c.category !== activeCategory.value) return false;
    if (activeBrand.value && c.brand !== activeBrand.value) return false;
    if (activePriceBucket.value) {
      const bucket = RENTAL_PRICE_BUCKETS.find((b) => b.id === activePriceBucket.value);
      if (!bucket) return false;
      const price = c.prices.oneToThreeDays;
      if (price < bucket.min || price > bucket.max) return false;
    }
    return true;
  });
});

const filterCount = computed(() => {
  let n = 0;
  if (activeCategory.value) n++;
  if (activeBrand.value) n++;
  if (activePriceBucket.value) n++;
  return n;
});

function clearFilters() {
  activeCategory.value = null;
  activeBrand.value = null;
  activePriceBucket.value = null;
}

function fmtPrice(p: number): string {
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
          {{ t('cars.kicker') }}
        </p>
        <h1 class="font-display text-4xl sm:text-5xl mb-4">{{ t('cars.hubTitle') }}</h1>
        <p class="text-misana-muted text-lg max-w-2xl">{{ t('cars.hubLead') }}</p>
      </div>
    </section>

    <section class="max-w-7xl mx-auto px-6 py-12">
      <!-- Filtres multi-axes -->
      <div class="border-b border-misana-line pb-8 mb-12 space-y-6">
        <!-- Categorie -->
        <div>
          <p class="text-[10px] uppercase tracking-widest text-misana-muted mb-3">
            {{ t('request.cars.category') }}
          </p>
          <div class="flex flex-wrap gap-2">
            <button
              type="button"
              class="text-xs px-3 py-1.5 transition border"
              :class="
                activeCategory === null
                  ? 'border-misana-ink bg-misana-ink text-misana-paper'
                  : 'border-misana-line hover:border-misana-ink'
              "
              @click="activeCategory = null"
            >
              {{ t('request.cars.allCategories') }}
            </button>
            <button
              v-for="cat in RENTAL_CATEGORIES"
              :key="cat.id"
              type="button"
              class="text-xs px-3 py-1.5 transition border"
              :class="
                activeCategory === cat.id
                  ? 'border-misana-ink bg-misana-ink text-misana-paper'
                  : 'border-misana-line hover:border-misana-ink'
              "
              @click="activeCategory = cat.id"
            >
              {{ locale === 'fr' ? cat.labelFr : cat.label }}
            </button>
          </div>
        </div>

        <!-- Marque -->
        <div>
          <p class="text-[10px] uppercase tracking-widest text-misana-muted mb-3">
            {{ t('cars.filterBrand') }}
          </p>
          <div class="flex flex-wrap gap-2">
            <button
              type="button"
              class="text-xs px-3 py-1.5 transition border"
              :class="
                activeBrand === null
                  ? 'border-misana-ink bg-misana-ink text-misana-paper'
                  : 'border-misana-line hover:border-misana-ink'
              "
              @click="activeBrand = null"
            >
              {{ t('cars.allBrands') }}
            </button>
            <button
              v-for="b in brands"
              :key="b"
              type="button"
              class="text-xs px-3 py-1.5 transition border"
              :class="
                activeBrand === b
                  ? 'border-misana-ink bg-misana-ink text-misana-paper'
                  : 'border-misana-line hover:border-misana-ink'
              "
              @click="activeBrand = b"
            >
              {{ b }}
            </button>
          </div>
        </div>

        <!-- Tranche de prix -->
        <div>
          <p class="text-[10px] uppercase tracking-widest text-misana-muted mb-3">
            {{ t('cars.filterPrice') }}
          </p>
          <div class="flex flex-wrap gap-2">
            <button
              type="button"
              class="text-xs px-3 py-1.5 transition border"
              :class="
                activePriceBucket === null
                  ? 'border-misana-ink bg-misana-ink text-misana-paper'
                  : 'border-misana-line hover:border-misana-ink'
              "
              @click="activePriceBucket = null"
            >
              {{ t('cars.allPrices') }}
            </button>
            <button
              v-for="bucket in RENTAL_PRICE_BUCKETS"
              :key="bucket.id"
              type="button"
              class="text-xs px-3 py-1.5 transition border"
              :class="
                activePriceBucket === bucket.id
                  ? 'border-misana-ink bg-misana-ink text-misana-paper'
                  : 'border-misana-line hover:border-misana-ink'
              "
              @click="activePriceBucket = bucket.id"
            >
              {{ bucket.label }}
            </button>
          </div>
        </div>

        <!-- Compteur + reset -->
        <div class="flex items-center justify-between text-xs text-misana-muted">
          <p>
            {{ visibleCars.length }} {{ t('cars.results', { n: visibleCars.length }) }}
            <span v-if="filterCount" class="ml-2">· {{ filterCount }} {{ t('cars.filtersActive') }}</span>
          </p>
          <button
            v-if="filterCount"
            type="button"
            class="underline underline-offset-4 hover:text-misana-ink transition"
            @click="clearFilters"
          >
            {{ t('cars.clearFilters') }}
          </button>
        </div>
      </div>

      <!-- Grid cards -->
      <div v-if="visibleCars.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <NuxtLink
          v-for="car in visibleCars"
          :key="car.id"
          :to="localePath(`/services/cars/${car.id}`)"
          class="group ring-1 ring-misana-line hover:ring-misana-ink transition overflow-hidden bg-misana-paper flex flex-col"
        >
          <div class="aspect-[4/3] relative overflow-hidden bg-misana-stone">
            <img
              :src="car.hero"
              :alt="car.fullName"
              loading="lazy"
              class="absolute inset-0 w-full h-full object-cover transition duration-700 group-hover:scale-[1.02]"
            />
            <span
              v-if="car.badge"
              class="absolute top-3 left-3 text-[10px] uppercase tracking-widest px-2 py-1 bg-misana-paper text-misana-ink"
            >
              {{ t(`request.fleet.badge.${car.badge}`) }}
            </span>
          </div>
          <div class="p-5 flex-1 flex flex-col">
            <p class="text-[10px] uppercase tracking-widest text-misana-muted mb-1">
              {{ car.brand }}
            </p>
            <p class="text-sm font-medium leading-tight">{{ car.model }}</p>
            <p class="text-xs text-misana-muted mt-1">
              {{ locale === 'fr' ? car.descFr : car.desc }}
            </p>
            <div class="flex items-baseline justify-between mt-4 text-xs text-misana-muted">
              <span>{{ car.pax }} {{ t('request.fleet.pax') }} · {{ car.hp }} hp</span>
              <span class="text-misana-ink whitespace-nowrap">
                <span class="text-misana-muted">{{ t('request.cars.perDay') }} </span>
                {{ fmtPrice(car.prices.oneToThreeDays) }}
              </span>
            </div>
          </div>
        </NuxtLink>
      </div>

      <div v-else class="text-center py-16">
        <p class="text-misana-muted text-sm mb-4">{{ t('cars.noResults') }}</p>
        <button
          type="button"
          class="text-xs underline underline-offset-4 hover:text-misana-ink transition"
          @click="clearFilters"
        >
          {{ t('cars.clearFilters') }}
        </button>
      </div>

      <p class="text-xs text-misana-muted mt-8 italic">{{ t('request.cars.priceFootnote') }}</p>
    </section>
  </main>
</template>
