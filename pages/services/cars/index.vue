<script setup lang="ts">
// Hub editorial cars (step 2 SEO).
// Tiles vers brands + categories + featured cars. Catalog filtrable a /all.
import { RENTAL_CARS, RENTAL_CATEGORIES, rentalBrands } from '~/lib/rentalCars';

definePageMeta({ layout: 'default' });

const { locale, t } = useI18n();
const localePath = useLocalePath();

useSeoMeta({
  title: () => t('cars.hubTitle'),
  description: () => t('cars.hubDescription'),
});

useHead({
  script: [{
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: 'Car rental on the French Riviera',
      provider: { '@type': 'Organization', name: 'Misana' },
      areaServed: ['Cannes', 'Monaco', 'Saint-Tropez', 'Nice', 'Cap-Ferrat'],
      serviceType: 'Car rental',
    }),
  }],
});

// Tiles brands : top brands seulement
const TOP_BRANDS = ['Ferrari', 'Lamborghini', 'Porsche', 'Mercedes', 'Bentley', 'Rolls Royce', 'Aston Martin', 'Audi'];
const brands = rentalBrands().filter((b) => TOP_BRANDS.includes(b));

// 4 cars featured
const featured = computed(() =>
  RENTAL_CARS.filter((c) => c.badge === 'flagship' || c.badge === 'popular').slice(0, 4),
);

function fmtPrice(p: number): string {
  return new Intl.NumberFormat(locale.value === 'fr' ? 'fr-FR' : 'en-GB', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(p);
}

function countByBrand(brand: string) {
  return RENTAL_CARS.filter((c) => c.brand === brand).length;
}
function countByCategory(cat: string) {
  return RENTAL_CARS.filter((c) => c.category === cat).length;
}

function brandSlug(brand: string) {
  return brand.toLowerCase().replace(/\s+/g, '-');
}
</script>

<template>
  <main class="min-h-screen">
    <!-- Hero -->
    <section class="bg-misana-stone border-b border-misana-line">
      <div class="max-w-5xl mx-auto px-6 py-16 sm:py-24">
        <p class="text-xs uppercase tracking-widest text-misana-muted mb-4">{{ t('cars.kicker') }}</p>
        <h1 class="font-display text-4xl sm:text-5xl mb-4">{{ t('cars.hubTitle') }}</h1>
        <p class="text-misana-muted text-lg max-w-2xl mb-8">{{ t('cars.hubLead') }}</p>
        <NuxtLink :to="localePath('/services/cars/all')" class="inline-block border border-misana-ink px-6 py-3 text-sm tracking-wide hover:bg-misana-ink hover:text-misana-paper transition">
          {{ t('cars.browseAllCta') }} ({{ RENTAL_CARS.length }}) →
        </NuxtLink>
      </div>
    </section>

    <!-- Tiles par categorie -->
    <section class="border-b border-misana-line">
      <div class="max-w-7xl mx-auto px-6 py-16">
        <p class="text-xs uppercase tracking-widest text-misana-muted mb-3">{{ t('cars.byCategoryKicker') }}</p>
        <h2 class="font-display text-3xl mb-8">{{ t('cars.byCategoryTitle') }}</h2>
        <div class="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <NuxtLink
            v-for="cat in RENTAL_CATEGORIES"
            :key="cat.id"
            :to="localePath(`/services/cars/by-category/${cat.id}`)"
            class="group block border border-misana-line hover:border-misana-ink transition p-6 text-center"
          >
            <p class="text-[10px] uppercase tracking-widest text-misana-muted mb-2">{{ countByCategory(cat.id) }} {{ $t('cars.results', countByCategory(cat.id)) }}</p>
            <p class="font-display text-xl">{{ locale === 'fr' ? cat.labelFr : cat.label }}</p>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Tiles par marque -->
    <section class="border-b border-misana-line bg-misana-stone">
      <div class="max-w-7xl mx-auto px-6 py-16">
        <p class="text-xs uppercase tracking-widest text-misana-muted mb-3">{{ t('cars.byBrandKicker') }}</p>
        <h2 class="font-display text-3xl mb-8">{{ t('cars.byBrandTitle') }}</h2>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <NuxtLink
            v-for="b in brands"
            :key="b"
            :to="localePath(`/services/cars/by-brand/${brandSlug(b)}`)"
            class="group block bg-misana-paper border border-misana-line hover:border-misana-ink transition p-6 text-center"
          >
            <p class="text-[10px] uppercase tracking-widest text-misana-muted mb-2">{{ countByBrand(b) }} {{ $t('cars.results', countByBrand(b)) }}</p>
            <p class="font-display text-xl">{{ b }}</p>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Featured cars -->
    <section v-if="featured.length" class="border-b border-misana-line">
      <div class="max-w-7xl mx-auto px-6 py-16">
        <p class="text-xs uppercase tracking-widest text-misana-muted mb-3">{{ t('cars.featuredKicker') }}</p>
        <h2 class="font-display text-3xl mb-8">{{ t('cars.featuredTitle') }}</h2>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <NuxtLink
            v-for="car in featured"
            :key="car.id"
            :to="localePath(`/services/cars/${car.id}`)"
            class="group ring-1 ring-misana-line hover:ring-misana-ink transition overflow-hidden bg-misana-paper flex flex-col"
          >
            <div class="aspect-[4/3] relative overflow-hidden bg-misana-stone">
              <img :src="car.hero" :alt="car.fullName" loading="lazy" class="absolute inset-0 w-full h-full object-cover transition duration-700 group-hover:scale-[1.02]" />
              <span v-if="car.badge" class="absolute top-3 left-3 text-[10px] uppercase tracking-widest px-2 py-1 bg-misana-paper text-misana-ink">{{ t(`request.fleet.badge.${car.badge}`) }}</span>
            </div>
            <div class="p-5 flex-1 flex flex-col">
              <p class="text-[10px] uppercase tracking-widest text-misana-muted mb-1">{{ car.brand }}</p>
              <p class="text-sm font-medium leading-tight">{{ car.model }}</p>
              <p class="text-xs text-misana-muted mt-1">{{ car.hp }} hp · {{ car.year }}</p>
              <p class="text-xs text-misana-ink mt-3">
                <span class="text-misana-muted">{{ t('request.cars.perDay') }} </span>
                {{ fmtPrice(car.prices.oneToThreeDays) }}
              </p>
            </div>
          </NuxtLink>
        </div>

        <div class="mt-8 text-center">
          <NuxtLink :to="localePath('/services/cars/all')" class="text-sm underline underline-offset-4 hover:text-misana-ink transition">
            {{ t('cars.browseAllCta') }} ({{ RENTAL_CARS.length }}) →
          </NuxtLink>
        </div>
      </div>
    </section>
  </main>
</template>
