<script setup lang="ts">
// Hub Access : 15 etablissements V1 (5 restaurants, 5 palaces, 5 beach/nightlife)
// avec filtre par categorie. Tier 1 V1.
import { ESTABLISHMENTS, CITIES } from '~/lib/constants';

definePageMeta({ layout: 'default' });

const { locale, t } = useI18n();
const localePath = useLocalePath();

useSeoMeta({
  title: () => t('access.hubTitle'),
  description: () => t('access.hubDescription'),
});

type AccessCategory = 'restaurant' | 'palace' | 'beach-club' | 'nightclub';

const CATEGORIES: { id: AccessCategory; label: string; labelFr: string }[] = [
  { id: 'restaurant', label: 'Restaurants', labelFr: 'Restaurants' },
  { id: 'palace', label: 'Palaces', labelFr: 'Palaces' },
  { id: 'beach-club', label: 'Beach clubs', labelFr: 'Beach clubs' },
  { id: 'nightclub', label: 'Nightlife', labelFr: 'Sorties' },
];

const activeCategory = ref<AccessCategory | null>(null);

const visibleEstablishments = computed(() =>
  activeCategory.value
    ? ESTABLISHMENTS.filter((e) => e.category === activeCategory.value)
    : ESTABLISHMENTS,
);

function cityOf(slug: string) {
  return CITIES.find((c) => c.slug === slug);
}
</script>

<template>
  <main class="min-h-screen">
    <section class="bg-misana-stone border-b border-misana-line">
      <div class="max-w-5xl mx-auto px-6 py-16 sm:py-24">
        <p class="text-xs uppercase tracking-widest text-misana-muted mb-4">
          {{ t('access.kicker') }}
        </p>
        <h1 class="font-display text-4xl sm:text-5xl mb-4">{{ t('access.hubTitle') }}</h1>
        <p class="text-misana-muted text-lg max-w-2xl">{{ t('access.hubLead') }}</p>
      </div>
    </section>

    <section class="max-w-7xl mx-auto px-6 py-12">
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
          {{ t('access.allCategories') }}
        </button>
        <button
          v-for="cat in CATEGORIES"
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

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <NuxtLink
          v-for="est in visibleEstablishments"
          :key="est.slug"
          :to="localePath(`/services/access/${est.slug}`)"
          class="group ring-1 ring-misana-line hover:ring-misana-ink transition overflow-hidden bg-misana-paper flex flex-col"
        >
          <!-- Placeholder typo : photoshoot V1.5+ -->
          <div class="aspect-[4/3] bg-misana-stone flex items-center justify-center px-6">
            <span class="font-display text-xl text-misana-ink/70 text-center leading-tight">
              {{ est.name }}
            </span>
          </div>
          <div class="p-5 flex-1 flex flex-col">
            <p class="text-[10px] uppercase tracking-widest text-misana-muted mb-1">
              {{ t(`access.cat.${est.category}`) }}
            </p>
            <p class="text-sm font-medium leading-tight">{{ est.name }}</p>
            <p class="text-xs text-misana-muted mt-1">
              {{ cityOf(est.city) ? (locale === 'fr' ? cityOf(est.city)!.fr : cityOf(est.city)!.en) : '' }}
            </p>
          </div>
        </NuxtLink>
      </div>
    </section>
  </main>
</template>
