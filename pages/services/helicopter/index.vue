<script setup lang="ts">
// Hub helicopter dedie : 6 helicos + 12 routes Riviera avec matrice prix.
// Structure parallele a cars/yacht catalog. Form embarque preset helicopter.
import { HELICOPTERS } from '~/lib/fleet';
import { HELI_DEPARTURES, HELI_ROUTES, routeFromPrice } from '~/lib/heliRoutes';

definePageMeta({ layout: 'default' });

const { locale, t } = useI18n();
const localePath = useLocalePath();

useSeoMeta({
  title: () => t('helicopterHub.title'),
  description: () => t('helicopterHub.description'),
});

useHead({
  script: [{
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: 'Helicopter charter on the French Riviera',
      provider: { '@type': 'Organization', name: 'Misana' },
      areaServed: ['Nice', 'Monaco', 'Cannes', 'Saint-Tropez'],
      serviceType: 'Helicopter charter',
    }),
  }],
});

// Tableau matrix : 4 villes hub Riviera
const HUB_CITIES = [
  { id: 'NCE', en: 'Nice', fr: 'Nice' },
  { id: 'MCM', en: 'Monaco', fr: 'Monaco' },
  { id: 'CEQ', en: 'Cannes', fr: 'Cannes' },
  { id: 'LTT', en: 'Saint-Tropez', fr: 'Saint-Tropez' },
];

function fmtPrice(p: number | null | undefined): string {
  if (p === null || p === undefined) return '·';
  return new Intl.NumberFormat(locale.value === 'fr' ? 'fr-FR' : 'en-GB', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(p);
}

function fromPrice(fromId: string, toId: string): number | null {
  const route = HELI_ROUTES.find((r) => r.fromId === fromId && r.toId === toId);
  if (!route) return null;
  return routeFromPrice(route);
}
</script>

<template>
  <main class="min-h-screen">
    <!-- Hero -->
    <section class="bg-misana-stone border-b border-misana-line">
      <div class="max-w-5xl mx-auto px-6 py-16 sm:py-24">
        <p class="text-xs uppercase tracking-widest text-misana-muted mb-4">{{ t('helicopterHub.kicker') }}</p>
        <h1 class="font-display text-4xl sm:text-5xl mb-4">{{ t('helicopterHub.title') }}</h1>
        <p class="text-misana-muted text-lg max-w-2xl">{{ t('helicopterHub.lead') }}</p>
      </div>
    </section>

    <!-- 4 hub cities -->
    <section class="border-b border-misana-line">
      <div class="max-w-7xl mx-auto px-6 py-16">
        <p class="text-xs uppercase tracking-widest text-misana-muted mb-6">{{ t('helicopterHub.heliportsKicker') }}</p>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div
            v-for="d in HELI_DEPARTURES"
            :key="d.id"
            class="border border-misana-line p-5"
          >
            <p class="text-[10px] uppercase tracking-widest text-misana-muted mb-1">{{ t('helicopterHub.heliport') }}</p>
            <p class="font-display text-xl">{{ locale === 'fr' ? d.cityFr : d.city }}</p>
            <p v-if="d.variants && d.variants.length" class="text-xs text-misana-muted mt-2">
              {{ d.variants.length }} {{ t('helicopterHub.helipads') }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Matrice prix -->
    <section class="border-b border-misana-line">
      <div class="max-w-7xl mx-auto px-6 py-16">
        <p class="text-xs uppercase tracking-widest text-misana-muted mb-3">{{ t('helicopterHub.matrixKicker') }}</p>
        <h2 class="font-display text-3xl mb-2">{{ t('helicopterHub.matrixTitle') }}</h2>
        <p class="text-misana-muted text-sm mb-8">{{ t('helicopterHub.matrixLead') }}</p>

        <div class="overflow-x-auto">
          <table class="min-w-full text-sm">
            <thead>
              <tr class="border-b border-misana-line">
                <th class="text-left py-3 pr-6 text-[10px] uppercase tracking-widest text-misana-muted">{{ t('helicopterHub.from') }}</th>
                <th
                  v-for="c in HUB_CITIES"
                  :key="c.id"
                  class="text-left py-3 pr-6 text-[10px] uppercase tracking-widest text-misana-muted"
                >{{ locale === 'fr' ? c.fr : c.en }}</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="from in HUB_CITIES"
                :key="from.id"
                class="border-b border-misana-line"
              >
                <td class="py-4 pr-6 font-medium">{{ locale === 'fr' ? from.fr : from.en }}</td>
                <td
                  v-for="to in HUB_CITIES"
                  :key="to.id"
                  class="py-4 pr-6"
                >
                  <span v-if="from.id === to.id" class="text-misana-muted">·</span>
                  <span v-else class="text-misana-muted text-xs">{{ t('helicopterHub.fromPrice') }}</span>
                  <span v-if="from.id !== to.id" class="ml-1">{{ fmtPrice(fromPrice(from.id, to.id)) }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="text-xs text-misana-muted mt-6 italic">{{ t('helicopterHub.matrixFootnote') }}</p>
      </div>
    </section>

    <!-- Helicos cards -->
    <section class="border-b border-misana-line">
      <div class="max-w-7xl mx-auto px-6 py-16">
        <p class="text-xs uppercase tracking-widest text-misana-muted mb-3">{{ t('helicopterHub.fleetKicker') }}</p>
        <h2 class="font-display text-3xl mb-8">{{ t('helicopterHub.fleetTitle') }}</h2>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="h in HELICOPTERS"
            :key="h.id"
            class="ring-1 ring-misana-line bg-misana-paper overflow-hidden flex flex-col"
          >
            <div class="aspect-[4/3] relative overflow-hidden bg-misana-stone">
              <img v-if="h.image" :src="h.image" :alt="h.name" loading="lazy" class="absolute inset-0 w-full h-full object-cover" />
              <span v-if="h.badge === 'flagship'" class="absolute top-3 left-3 text-[10px] uppercase tracking-widest px-2 py-1 bg-misana-paper text-misana-ink">{{ t('request.fleet.badge.flagship') }}</span>
            </div>
            <div class="p-5 flex-1 flex flex-col">
              <p class="text-[10px] uppercase tracking-widest text-misana-muted mb-1">
                {{ locale === 'fr' ? h.engineFr : h.engine }}
              </p>
              <p class="font-display text-xl">{{ h.name }}</p>
              <p class="text-xs text-misana-muted mt-1 mb-3">{{ locale === 'fr' ? h.descFr : h.desc }}</p>
              <div class="flex items-center justify-between text-xs text-misana-muted mt-auto pt-3 border-t border-misana-line">
                <span>{{ h.pax }} {{ t('request.fleet.pax') }}</span>
                <span>{{ h.speedKmh }} km/h</span>
                <span>{{ h.luggage }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Form embedded -->
    <section id="request-form" class="border-b border-misana-line">
      <div class="max-w-3xl mx-auto px-6 py-16">
        <p class="text-xs uppercase tracking-widest text-misana-muted mb-3">{{ t('helicopterHub.formKicker') }}</p>
        <h2 class="font-display text-3xl mb-8">{{ t('helicopterHub.formTitle') }}</h2>
        <RequestForm
          :preset-service="'helicopter'"
          :lock-service="true"
          :embedded="true"
        />
      </div>
    </section>

    <!-- Maillage interne 8 liens -->
    <section class="bg-misana-stone">
      <div class="max-w-7xl mx-auto px-6 py-12 grid grid-cols-2 sm:grid-cols-4 gap-8 text-sm">
        <div>
          <p class="text-[10px] uppercase tracking-widest text-misana-muted mb-3">{{ t('crosslink.serviceLabel') }}</p>
          <ul class="space-y-2">
            <li><NuxtLink :to="localePath('/services/chauffeur')" class="hover:text-misana-muted">{{ t('crosslink.chauffeur') }}</NuxtLink></li>
            <li><NuxtLink :to="localePath('/services/cars')" class="hover:text-misana-muted">{{ t('crosslink.allCars') }}</NuxtLink></li>
          </ul>
        </div>
        <div>
          <p class="text-[10px] uppercase tracking-widest text-misana-muted mb-3">{{ t('crosslink.destinationLabel') }}</p>
          <ul class="space-y-2">
            <li><NuxtLink :to="localePath('/destinations/monaco')" class="hover:text-misana-muted">Monaco</NuxtLink></li>
            <li><NuxtLink :to="localePath('/destinations/saint-tropez')" class="hover:text-misana-muted">Saint-Tropez</NuxtLink></li>
          </ul>
        </div>
        <div>
          <p class="text-[10px] uppercase tracking-widest text-misana-muted mb-3">{{ t('crosslink.transferLabel') }}</p>
          <ul class="space-y-2">
            <li><NuxtLink :to="localePath('/transfers/nice-airport-monaco')" class="hover:text-misana-muted">Nice → Monaco</NuxtLink></li>
            <li><NuxtLink :to="localePath('/services/yacht')" class="hover:text-misana-muted">{{ t('crosslink.allYachts') }}</NuxtLink></li>
          </ul>
        </div>
        <div>
          <p class="text-[10px] uppercase tracking-widest text-misana-muted mb-3">{{ t('crosslink.eventLabel') }}</p>
          <ul class="space-y-2">
            <li><NuxtLink :to="localePath('/events/festival-de-cannes')" class="hover:text-misana-muted">Festival de Cannes</NuxtLink></li>
            <li><NuxtLink :to="localePath('/events/monaco-grand-prix')" class="hover:text-misana-muted">Monaco Grand Prix</NuxtLink></li>
          </ul>
        </div>
      </div>
    </section>
  </main>
</template>
