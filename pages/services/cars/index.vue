<script setup lang="ts">
// Hub catalog cars : 12 voitures Excellence Riviera + filtre categorie.
// Tier 1 V1.
import { RENTAL_CARS, RENTAL_CATEGORIES, type RentalCarCategory } from '~/lib/rentalCars';

definePageMeta({ layout: 'default' });

const { locale, t } = useI18n();
const localePath = useLocalePath();

useSeoMeta({
  title: () => t('cars.hubTitle'),
  description: () => t('cars.hubDescription'),
});

const activeCategory = ref<RentalCarCategory | null>(null);

const visibleCars = computed(() =>
  activeCategory.value
    ? RENTAL_CARS.filter((c) => c.category === activeCategory.value)
    : RENTAL_CARS,
);

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
      <!-- Filtre categorie -->
      <div class="flex flex-wrap gap-2 mb-12">
        <button
          type="button"
          class="text-sm px-4 py-2 transition border"
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
          class="text-sm px-4 py-2 transition border"
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

      <!-- Grid cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
            <div class="flex items-baseline justify-between gap-3">
              <div>
                <p class="text-sm font-medium leading-tight">{{ car.fullName }}</p>
                <p class="text-xs text-misana-muted mt-0.5">
                  {{ locale === 'fr' ? car.descFr : car.desc }}
                </p>
              </div>
              <p class="text-sm font-medium text-misana-ink whitespace-nowrap">
                <span class="text-misana-muted text-xs">{{ t('request.cars.perDay') }} </span>
                {{ fmtPrice(car.prices.oneToThreeDays) }}
              </p>
            </div>
            <div class="flex items-center gap-3 mt-4 text-xs text-misana-muted">
              <span>{{ car.pax }} {{ t('request.fleet.pax') }}</span>
              <span aria-hidden="true">·</span>
              <span>{{ car.hp }} hp</span>
              <span aria-hidden="true">·</span>
              <span>{{ car.topSpeedKmh }} km/h</span>
            </div>
          </div>
        </NuxtLink>
      </div>

      <p class="text-xs text-misana-muted mt-8 italic">{{ t('request.cars.priceFootnote') }}</p>
    </section>
  </main>
</template>
