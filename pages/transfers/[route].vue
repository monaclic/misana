<script setup lang="ts">
// Landing SEO transfert. Page generee dynamiquement par slug de route.
// Tier 1 V1 : 3 routes Nice airport vers Monaco / Cannes / Saint-Tropez.
// Le formulaire RequestForm est embedded avec preset chauffeur (pickup/dropoff)
// + lockService=true (la step Context est masquee).
import { useRequestStore } from '~/stores/request';
import { TRANSFERS } from '~/lib/constants';

definePageMeta({ layout: 'default' });

const route = useRoute();
const { locale, t } = useI18n();
const slug = computed(() => String(route.params.route));

// Recherche route dans le constants.ts (TRANSFERS = 20 routes V1).
const transfer = computed(() =>
  TRANSFERS.find((tr) => tr.slug === slug.value),
);

// 404 si route inconnue.
if (!transfer.value) {
  throw createError({ statusCode: 404, statusMessage: 'Route not found', fatal: true });
}

const tr = transfer.value;
const titleEn = `${tr.en} transfer`;
const titleFr = `${tr.fr} transfert`;
const title = computed(() => (locale.value === 'fr' ? titleFr : titleEn));

useSeoMeta({
  title: () => title.value,
  description: () =>
    locale.value === 'fr'
      ? `Transfert chauffeur prive ${tr.fr}. Mercedes V-Class, S-Class, Range Rover. Accueil a la porte, assistance bagages. Reponse en vingt-quatre heures.`
      : `Private chauffeur transfer ${tr.en}. Mercedes V-Class, S-Class, Range Rover. Welcome at the gate, luggage assistance. We answer within twenty-four hours.`,
});

// Preset chauffeur : on remplit pickup/dropoff selon le slug et on locke.
const presetData = {
  chauffeur: {
    subtype: 'one-way' as const,
    pickup: tr.from === 'nice' && tr.slug.startsWith('nice-airport-')
      ? "Nice Côte d'Azur airport"
      : labelFor(tr.from, locale.value),
    dropoff: labelFor(tr.to, locale.value),
  },
  destination: tr.to as any,
};

function labelFor(citySlug: string, lang: string): string {
  const map: Record<string, { en: string; fr: string }> = {
    nice: { en: 'Nice', fr: 'Nice' },
    monaco: { en: 'Monaco', fr: 'Monaco' },
    cannes: { en: 'Cannes', fr: 'Cannes' },
    'saint-tropez': { en: 'Saint-Tropez', fr: 'Saint-Tropez' },
    'cap-d-antibes': { en: "Cap d'Antibes", fr: "Cap d'Antibes" },
    'cap-ferrat': { en: 'Cap-Ferrat', fr: 'Cap-Ferrat' },
    eze: { en: 'Èze', fr: 'Èze' },
    menton: { en: 'Menton', fr: 'Menton' },
  };
  return map[citySlug]?.[lang as 'en' | 'fr'] || citySlug;
}

// Reset le store sur changement de route pour que le preset soit applique sur
// la donnee fraiche.
const store = useRequestStore();
onMounted(() => {
  // Le composant RequestForm applique deja le preset au mount (mode embedded).
  // Ici on ne fait rien de special.
});
</script>

<template>
  <main class="min-h-screen">
    <!-- Hero sobre, pas d image V1 (placeholder pour photoshoot) -->
    <section class="bg-misana-stone border-b border-misana-line">
      <div class="max-w-5xl mx-auto px-6 py-16 sm:py-24">
        <p class="text-xs uppercase tracking-widest text-misana-muted mb-4">
          {{ t('transfer.kicker') }}
        </p>
        <h1 class="font-display text-4xl sm:text-5xl mb-4">
          {{ locale === 'fr' ? tr.fr : tr.en }}
        </h1>
        <p class="text-misana-muted text-lg max-w-2xl">
          {{ t('transfer.hero') }}
        </p>
      </div>
    </section>

    <!-- Body : 2 colonnes desktop (contenu / form sticky) -->
    <section class="max-w-7xl mx-auto px-6 py-16 grid lg:grid-cols-12 gap-12">
      <!-- Contenu editorial gauche -->
      <article class="lg:col-span-7 space-y-12">
        <div>
          <h2 class="font-display text-2xl mb-4">{{ t('transfer.howSection') }}</h2>
          <p class="text-misana-muted leading-relaxed">
            {{ t('transfer.howBody') }}
          </p>
        </div>

        <div>
          <h2 class="font-display text-2xl mb-4">{{ t('transfer.fleetSection') }}</h2>
          <p class="text-misana-muted leading-relaxed mb-6">
            {{ t('transfer.fleetBody') }}
          </p>
          <ul class="grid grid-cols-2 gap-4 text-sm">
            <li class="border border-misana-line p-4">
              <p class="font-medium">Mercedes E-Class</p>
              <p class="text-misana-muted text-xs mt-1">{{ t('request.fleet.pax') }} 3</p>
            </li>
            <li class="border border-misana-line p-4">
              <p class="font-medium">Mercedes V-Class</p>
              <p class="text-misana-muted text-xs mt-1">{{ t('request.fleet.pax') }} 7</p>
            </li>
            <li class="border border-misana-line p-4">
              <p class="font-medium">Mercedes S-Class</p>
              <p class="text-misana-muted text-xs mt-1">{{ t('request.fleet.pax') }} 3</p>
            </li>
            <li class="border border-misana-line p-4">
              <p class="font-medium">Range Rover Vogue</p>
              <p class="text-misana-muted text-xs mt-1">{{ t('request.fleet.pax') }} 4</p>
            </li>
          </ul>
        </div>

        <div>
          <h2 class="font-display text-2xl mb-4">{{ t('transfer.includedSection') }}</h2>
          <ul class="space-y-3 text-misana-muted">
            <li class="flex gap-3"><span class="text-misana-ink">·</span> {{ t('transfer.included.welcome') }}</li>
            <li class="flex gap-3"><span class="text-misana-ink">·</span> {{ t('transfer.included.luggage') }}</li>
            <li class="flex gap-3"><span class="text-misana-ink">·</span> {{ t('transfer.included.flightTracking') }}</li>
            <li class="flex gap-3"><span class="text-misana-ink">·</span> {{ t('transfer.included.water') }}</li>
            <li class="flex gap-3"><span class="text-misana-ink">·</span> {{ t('transfer.included.englishSpeaking') }}</li>
          </ul>
        </div>

        <div>
          <h2 class="font-display text-2xl mb-4">{{ t('transfer.faqSection') }}</h2>
          <details class="border-b border-misana-line py-4 group">
            <summary class="text-sm font-medium cursor-pointer flex justify-between items-center">
              {{ t('transfer.faq.q1') }}
              <span class="text-misana-muted group-open:rotate-180 transition">▾</span>
            </summary>
            <p class="text-misana-muted text-sm mt-3">{{ t('transfer.faq.a1') }}</p>
          </details>
          <details class="border-b border-misana-line py-4 group">
            <summary class="text-sm font-medium cursor-pointer flex justify-between items-center">
              {{ t('transfer.faq.q2') }}
              <span class="text-misana-muted group-open:rotate-180 transition">▾</span>
            </summary>
            <p class="text-misana-muted text-sm mt-3">{{ t('transfer.faq.a2') }}</p>
          </details>
          <details class="border-b border-misana-line py-4 group">
            <summary class="text-sm font-medium cursor-pointer flex justify-between items-center">
              {{ t('transfer.faq.q3') }}
              <span class="text-misana-muted group-open:rotate-180 transition">▾</span>
            </summary>
            <p class="text-misana-muted text-sm mt-3">{{ t('transfer.faq.a3') }}</p>
          </details>
        </div>
      </article>

      <!-- Form sticky droite -->
      <aside class="lg:col-span-5">
        <div class="lg:sticky lg:top-24 border border-misana-line p-6 bg-misana-paper">
          <p class="text-xs uppercase tracking-wide text-misana-muted mb-1">
            {{ t('transfer.formKicker') }}
          </p>
          <h2 class="font-display text-xl mb-6">{{ t('transfer.formTitle') }}</h2>
          <RequestForm
            :preset-service="'chauffeur'"
            :preset-data="presetData"
            :lock-service="true"
            :embedded="true"
          />
        </div>
      </aside>
    </section>
  </main>
</template>
