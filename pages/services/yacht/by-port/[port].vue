<script setup lang="ts">
// Listing yachts par port de depart (cannes, monaco, saint-tropez). Step 3 SEO.
import { YACHTS, YACHT_TYPE_LABELS } from '~/lib/yachts';
import { CITIES } from '~/lib/constants';

definePageMeta({ layout: 'default' });

const route = useRoute();
const { locale, t } = useI18n();
const localePath = useLocalePath();

const VALID_PORTS = ['cannes', 'monaco', 'saint-tropez'];
const port = computed(() => String(route.params.port));

if (!VALID_PORTS.includes(port.value)) {
  throw createError({ statusCode: 404, statusMessage: 'Port not found', fatal: true });
}

const portCity = computed(() => CITIES.find((c) => c.slug === port.value)!);
const portName = computed(() => locale.value === 'fr' ? portCity.value.fr : portCity.value.en);

useSeoMeta({
  title: () => locale.value === 'fr'
    ? `Charter yacht au départ de ${portName.value}`
    : `Yacht charter from ${portName.value}`,
  description: () => locale.value === 'fr'
    ? `Charter yacht au départ du port de ${portName.value} sur la Côte d'Azur. Motor, voilier, catamaran. De la day-cruise à la semaine en Méditerranée.`
    : `Yacht charter from the port of ${portName.value} on the French Riviera. Motor, sailing, catamaran. From day-cruise to the Mediterranean week.`,
});

const matched = computed(() => YACHTS.filter((y) => y.ports.includes(port.value)));

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
          <NuxtLink :to="localePath('/services/yacht')" class="hover:text-misana-ink">{{ t('yacht.kicker') }}</NuxtLink>
          <span class="mx-2">·</span>
          {{ portName }}
        </p>
        <h1 class="font-display text-4xl sm:text-5xl mb-4">
          {{ locale === 'fr' ? `Charter yacht au départ de ${portName}` : `Yacht charter from ${portName}` }}
        </h1>
        <p class="text-misana-muted text-lg max-w-2xl">
          {{ locale === 'fr'
            ? `Tous les yachts disponibles depuis le port de ${portName}. Embarquement, équipage, restauration arrangés depuis la côte.`
            : `All yachts available from the port of ${portName}. Boarding, crew, provisioning arranged from the coast.` }}
        </p>
      </div>
    </section>

    <section class="max-w-7xl mx-auto px-6 py-12">
      <p class="text-xs text-misana-muted mb-8">{{ matched.length }} {{ $t('yacht.results', matched.length) }}</p>

      <div v-if="matched.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <NuxtLink
          v-for="y in matched"
          :key="y.id"
          :to="localePath(`/services/yacht/${y.id}`)"
          class="group ring-1 ring-misana-line hover:ring-misana-ink transition overflow-hidden bg-misana-paper flex flex-col"
        >
          <div class="aspect-[4/3] relative overflow-hidden bg-misana-stone">
            <img :src="y.hero" :alt="y.fullName" loading="lazy" class="absolute inset-0 w-full h-full object-cover transition duration-700 group-hover:scale-[1.02]" />
            <span v-if="y.badge" class="absolute top-3 left-3 text-[10px] uppercase tracking-widest px-2 py-1 bg-misana-paper text-misana-ink">{{ t(`request.fleet.badge.${y.badge}`) }}</span>
            <span class="absolute top-3 right-3 text-[10px] uppercase tracking-widest px-2 py-1 bg-misana-ink/80 text-misana-paper">{{ locale === 'fr' ? YACHT_TYPE_LABELS[y.type].fr : YACHT_TYPE_LABELS[y.type].en }}</span>
          </div>
          <div class="p-5 flex-1 flex flex-col">
            <p class="text-[10px] uppercase tracking-widest text-misana-muted mb-1">{{ y.builder }} · {{ y.lengthM }} m · {{ y.year }}</p>
            <p class="text-sm font-medium leading-tight">{{ y.name }}</p>
            <p class="text-xs text-misana-muted mt-1">{{ locale === 'fr' ? y.descFr : y.desc }}</p>
            <div class="flex items-baseline justify-between mt-4 text-xs text-misana-muted">
              <span>{{ y.guests }} {{ t('yacht.guests') }} · {{ y.cabins }} {{ t('yacht.cabinsShort') }}</span>
              <span class="text-misana-ink whitespace-nowrap text-right">
                <span v-if="y.pricePerDay">
                  <span class="text-misana-muted">{{ t('yacht.from') }} </span>
                  {{ fmtPrice(y.pricePerDay) }} / {{ t('yacht.day') }}
                </span>
                <span v-else>
                  <span class="text-misana-muted">{{ t('yacht.from') }} </span>
                  {{ fmtPrice(y.pricePerWeekFrom) }} / {{ t('yacht.week') }}
                </span>
              </span>
            </div>
          </div>
        </NuxtLink>
      </div>
    </section>
  </main>
</template>
