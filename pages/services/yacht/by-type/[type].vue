<script setup lang="ts">
// Listing yachts par type (motor / sail / catamaran). Step 3 SEO.
import { YACHTS, YACHT_TYPE_LABELS, type YachtType } from '~/lib/yachts';

definePageMeta({ layout: 'default' });

const route = useRoute();
const { locale, t } = useI18n();
const localePath = useLocalePath();

const VALID_TYPES = ['motor', 'sail', 'catamaran'] as const;
const type = computed(() => String(route.params.type) as YachtType);

if (!(VALID_TYPES as readonly string[]).includes(type.value)) {
  throw createError({ statusCode: 404, statusMessage: 'Type not found', fatal: true });
}

const TYPE_INFO: Record<YachtType, { en: string; fr: string; lead: string; leadFr: string }> = {
  motor: {
    en: 'Motor yacht charter on the French Riviera',
    fr: 'Charter yacht moteur sur la Côte d\'Azur',
    lead: 'Sport hulls and tri-deck cruisers. From the day-cruise sport at twenty-five knots to the displacement mega-yacht on a slow week.',
    leadFr: 'Coques sport et tri-pont. Du day-cruise sport à vingt-cinq nœuds au mega-yacht de déplacement sur une semaine lente.',
  },
  sail: {
    en: 'Sailing yacht charter on the French Riviera',
    fr: 'Charter voilier sur la Côte d\'Azur',
    lead: 'A week along the coast under sail. From the cruising sloop to the Wally Cento. Performance cruiser, traditional cutter, classic Italian shipyard.',
    leadFr: 'Une semaine le long de la côte à la voile. Du sloop de croisière au Wally Cento. Croiseur performance, cutter traditionnel, chantier italien classique.',
  },
  catamaran: {
    en: 'Catamaran charter on the French Riviera',
    fr: 'Charter catamaran sur la Côte d\'Azur',
    lead: 'Stable platform, full beam saloon, generous space. From the production cruising cat to the Sunreef custom flagship.',
    leadFr: 'Plateforme stable, salon pleine largeur, espace généreux. Du catamaran de croisière de série au flagship Sunreef sur mesure.',
  },
};

const info = computed(() => TYPE_INFO[type.value]);

useSeoMeta({
  title: () => locale.value === 'fr' ? info.value.fr : info.value.en,
  description: () => locale.value === 'fr' ? info.value.leadFr : info.value.lead,
});

const matched = computed(() => YACHTS.filter((y) => y.type === type.value));

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
          {{ locale === 'fr' ? YACHT_TYPE_LABELS[type].fr : YACHT_TYPE_LABELS[type].en }}
        </p>
        <h1 class="font-display text-4xl sm:text-5xl mb-4">{{ locale === 'fr' ? info.fr : info.en }}</h1>
        <p class="text-misana-muted text-lg max-w-2xl">{{ locale === 'fr' ? info.leadFr : info.lead }}</p>
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
