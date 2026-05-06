<script setup lang="ts">
// Hub destination ville : Cannes, Monaco, Saint-Tropez, Nice, Cap-d'Antibes,
// Cap-Ferrat, Eze, Menton. Tier 1 V1 (4 heavy + 4 stub).
import { CITIES, TRANSFERS, EVENTS } from '~/lib/constants';

definePageMeta({ layout: 'default' });

const route = useRoute();
const { locale, t } = useI18n();
const localePath = useLocalePath();

const city = computed(() =>
  CITIES.find((c) => c.slug === String(route.params.city)),
);

if (!city.value) {
  throw createError({ statusCode: 404, statusMessage: 'City not found', fatal: true });
}

const ct = city.value;
const cityName = computed(() => (locale.value === 'fr' ? ct.fr : ct.en));
const cityBlurb = computed(() => (locale.value === 'fr' ? ct.blurbFr : ct.blurbEn));

useSeoMeta({
  title: () => `${cityName.value} · ${t('destinations.titleSuffix')}`,
  description: () =>
    locale.value === 'fr'
      ? `Conciergerie sur la côte à ${cityName.value}. Chauffeur, hélicoptère, voitures, yacht, restaurants. Réponse en vingt-quatre heures.`
      : `Concierge on the coast in ${cityName.value}. Chauffeur, helicopter, cars, yacht, restaurants. We answer within twenty-four hours.`,
});

const relatedTransfers = computed(() =>
  TRANSFERS.filter((tr) => tr.from === ct.slug || tr.to === ct.slug).slice(0, 6),
);

const relatedEvents = computed(() =>
  EVENTS.filter((e) => e.city === ct.slug),
);
</script>

<template>
  <main class="min-h-screen">
    <section class="bg-misana-stone border-b border-misana-line">
      <div class="max-w-5xl mx-auto px-6 py-16 sm:py-24">
        <p class="text-xs uppercase tracking-widest text-misana-muted mb-4">
          {{ t('destinations.kicker') }}
        </p>
        <h1 class="font-display text-4xl sm:text-5xl mb-4">{{ cityName }}</h1>
        <p class="text-misana-muted text-lg max-w-2xl">{{ cityBlurb }}</p>
      </div>
    </section>

    <section class="max-w-7xl mx-auto px-6 py-16 grid lg:grid-cols-12 gap-12">
      <article class="lg:col-span-7 space-y-12">
        <div>
          <h2 class="font-display text-2xl mb-4">{{ t('destinations.servicesSection') }}</h2>
          <p class="text-misana-muted leading-relaxed mb-6">{{ t('destinations.servicesBody', { city: cityName }) }}</p>
          <ul class="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <li>
              <NuxtLink :to="localePath('/chauffeur')" class="block border border-misana-line hover:border-misana-ink transition px-4 py-3 text-center">
                <span class="text-sm">{{ t('nav.chauffeur') }}</span>
              </NuxtLink>
            </li>
            <li v-if="['nice', 'monaco', 'cannes', 'saint-tropez'].includes(ct.slug)">
              <NuxtLink :to="localePath({ name: 'helicopter' })" class="block border border-misana-line hover:border-misana-ink transition px-4 py-3 text-center">
                <span class="text-sm">{{ t('nav.helicopter') }}</span>
              </NuxtLink>
            </li>
            <li>
              <NuxtLink :to="localePath({ name: 'cars' })" class="block border border-misana-line hover:border-misana-ink transition px-4 py-3 text-center">
                <span class="text-sm">{{ t('nav.cars') }}</span>
              </NuxtLink>
            </li>
            <li>
              <NuxtLink :to="localePath('/yacht')" class="block border border-misana-line hover:border-misana-ink transition px-4 py-3 text-center">
                <span class="text-sm">{{ t('nav.yacht') }}</span>
              </NuxtLink>
            </li>
            <li>
              <NuxtLink :to="localePath({ name: 'access' })" class="block border border-misana-line hover:border-misana-ink transition px-4 py-3 text-center">
                <span class="text-sm">{{ t('nav.access') }}</span>
              </NuxtLink>
            </li>
          </ul>
        </div>

        <div v-if="relatedTransfers.length">
          <h2 class="font-display text-2xl mb-6">{{ t('destinations.transfersSection') }}</h2>
          <ul class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <li v-for="tr in relatedTransfers" :key="tr.slug">
              <NuxtLink :to="localePath(`/transfers/${tr.slug}`)" class="block border border-misana-line hover:border-misana-ink transition px-4 py-3">
                <span class="text-sm">{{ locale === 'fr' ? tr.fr : tr.en }}</span>
              </NuxtLink>
            </li>
          </ul>
        </div>

        <div v-if="relatedEvents.length">
          <h2 class="font-display text-2xl mb-6">{{ t('destinations.eventsSection') }}</h2>
          <ul class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <li v-for="ev in relatedEvents" :key="ev.slug">
              <NuxtLink :to="localePath(`/events/${ev.slug}`)" class="block border border-misana-line hover:border-misana-ink transition px-4 py-3">
                <span class="text-sm">{{ locale === 'fr' ? ev.fr : ev.en }}</span>
                <span class="text-xs text-misana-muted ml-2">{{ locale === 'fr' ? ev.monthFr : ev.monthEn }}</span>
              </NuxtLink>
            </li>
          </ul>
        </div>
      </article>

      <aside class="lg:col-span-5">
        <div class="lg:sticky lg:top-24 border border-misana-line p-6 bg-misana-paper">
          <p class="text-xs uppercase tracking-wide text-misana-muted mb-1">{{ t('destinations.formKicker') }}</p>
          <h2 class="font-display text-xl mb-6">{{ t('destinations.formTitle', { city: cityName }) }}</h2>
          <RequestForm :preset-data="{ destination: ct.slug as any }" :embedded="true" />
        </div>
      </aside>
    </section>
  </main>
</template>
