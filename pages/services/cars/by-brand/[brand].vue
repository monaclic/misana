<script setup lang="ts">
// Listing cars par marque (step 3 SEO).
import { RENTAL_CARS, rentalBrands } from '~/lib/rentalCars';

definePageMeta({ layout: 'default' });

const route = useRoute();
const { locale, t } = useI18n();
const localePath = useLocalePath();

const brandParam = computed(() => String(route.params.brand));

// Resolve canonical brand name from slug
const brand = computed(() => {
  const all = rentalBrands();
  return all.find((b) => b.toLowerCase().replace(/\s+/g, '-') === brandParam.value);
});

if (!brand.value) {
  throw createError({ statusCode: 404, statusMessage: 'Brand not found', fatal: true });
}

useSeoMeta({
  title: () => locale.value === 'fr'
    ? `Location ${brand.value} sur la Côte d'Azur`
    : `${brand.value} rental on the French Riviera`,
  description: () => locale.value === 'fr'
    ? `Toutes les ${brand.value} disponibles à la location sur la Côte d'Azur. Livraison à Cannes, Monaco, Saint-Tropez, Nice. Assurance incluse.`
    : `All ${brand.value} cars available for rent on the French Riviera. Delivery in Cannes, Monaco, Saint-Tropez, Nice. Insurance included.`,
});

const matched = computed(() => RENTAL_CARS.filter((c) => c.brand === brand.value));

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
          <NuxtLink :to="localePath('/services/cars')" class="hover:text-misana-ink">{{ t('cars.kicker') }}</NuxtLink>
          <span class="mx-2">·</span>
          {{ brand }}
        </p>
        <h1 class="font-display text-4xl sm:text-5xl mb-4">
          {{ locale === 'fr' ? `Location ${brand}` : `${brand} rental` }}
        </h1>
        <p class="text-misana-muted text-lg max-w-2xl">
          {{ locale === 'fr'
            ? `Toutes les ${brand} disponibles à la location sur la Côte d'Azur, de Saint-Tropez à Menton.`
            : `All ${brand} cars available for rent on the French Riviera, from Saint-Tropez to Menton.` }}
        </p>
      </div>
    </section>

    <section class="max-w-7xl mx-auto px-6 py-12">
      <p class="text-xs text-misana-muted mb-8">{{ matched.length }} {{ $t('cars.results', matched.length) }}</p>

      <div v-if="matched.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <NuxtLink
          v-for="car in matched"
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
            <p class="text-xs text-misana-muted mt-1">{{ locale === 'fr' ? car.descFr : car.desc }}</p>
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
    </section>
  </main>
</template>
