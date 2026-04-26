<script setup lang="ts">
// Listing yachts par bracket de taille (step 3 SEO).
// 4 pages : 15-20m, 20-30m, 30-50m, 50m+. Cible des keywords longue traine.
import { YACHTS, YACHT_TYPE_LABELS } from '~/lib/yachts';
import { YACHT_SIZES, type YachtSize } from '~/types/request';

definePageMeta({ layout: 'default' });

const route = useRoute();
const { locale, t } = useI18n();
const localePath = useLocalePath();

const bracket = computed(() => String(route.params.bracket) as YachtSize);

if (!(YACHT_SIZES as readonly string[]).includes(bracket.value)) {
  throw createError({ statusCode: 404, statusMessage: 'Size bracket not found', fatal: true });
}

const SIZE_LABELS: Record<YachtSize, { en: string; fr: string; lead: string; leadFr: string }> = {
  '15-20m': {
    en: 'Yachts from 15 to 20 metres',
    fr: 'Yachts de 15 à 20 mètres',
    lead: 'The day-cruise reference of the coast. Light crew, sport hull, twenty-five knots cruising. The boat for a lunch off Pampelonne, an afternoon at Cap-Ferrat, a sunset return.',
    leadFr: 'La référence day-cruise de la côte. Équipage léger, coque sport, vingt-cinq nœuds. Le bateau pour un déjeuner au large de Pampelonne, un après-midi au Cap-Ferrat, un retour au coucher du soleil.',
  },
  '20-30m': {
    en: 'Yachts from 20 to 30 metres',
    fr: 'Yachts de 20 à 30 mètres',
    lead: 'A weekend at sea, with cabins. Eight to ten guests, three to five crew, modern lines. The right size for a Riviera-Corsica week without rushing.',
    leadFr: 'Un weekend en mer, cabines à bord. Huit à dix personnes, trois à cinq équipage, lignes modernes. La bonne taille pour une semaine Riviera-Corse sans précipitation.',
  },
  '30-50m': {
    en: 'Superyachts from 30 to 50 metres',
    fr: 'Superyachts de 30 à 50 mètres',
    lead: 'The Mediterranean week classic. Ten guests, eight crew, full water toys complement. Jet ski, seabob, paddle, scuba, gym. The boat that handles a Cannes-Portofino-Saint-Tropez loop without you noticing the transit.',
    leadFr: 'Le classique de la semaine en Méditerranée. Dix personnes, huit équipage, équipement complet de jouets aquatiques. Jet ski, seabob, paddle, plongée, gym. Le bateau qui fait une boucle Cannes-Portofino-Saint-Tropez sans que vous remarquiez le transit.',
  },
  '50m+': {
    en: 'Mega yachts above 50 metres',
    fr: 'Mega yachts de plus de 50 mètres',
    lead: 'A floating maison. Twelve guests, ten to fifteen crew, displacement hull, ocean range. Full water toys complement, gym, stabilisers, the discretion that comes with this length.',
    leadFr: 'Une maison flottante. Douze personnes, dix à quinze équipage, coque de déplacement, autonomie océan. Équipement complet de jouets aquatiques, gym, stabilisateurs, la discrétion qui vient avec cette longueur.',
  },
};

const labels = computed(() => SIZE_LABELS[bracket.value]);

useSeoMeta({
  title: () => locale.value === 'fr' ? labels.value.fr : labels.value.en,
  description: () => locale.value === 'fr' ? labels.value.leadFr : labels.value.lead,
});

const matched = computed(() => YACHTS.filter((y) => y.size === bracket.value));

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
          {{ bracket }}
        </p>
        <h1 class="font-display text-4xl sm:text-5xl mb-4">{{ locale === 'fr' ? labels.fr : labels.en }}</h1>
        <p class="text-misana-muted text-lg max-w-2xl">{{ locale === 'fr' ? labels.leadFr : labels.lead }}</p>
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

      <p class="text-xs text-misana-muted mt-12 italic">{{ t('yacht.priceFootnote') }}</p>

      <div class="mt-12 text-center">
        <NuxtLink :to="localePath('/services/yacht/all')" class="text-sm underline underline-offset-4 hover:text-misana-ink transition">
          {{ t('yacht.browseAllCta') }} →
        </NuxtLink>
      </div>
    </section>
  </main>
</template>
