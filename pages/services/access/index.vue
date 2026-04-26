<script setup lang="ts">
// Hub Access avec filtres catégorie + ville.
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
const activeCity = ref<string | null>(null);

// Villes disponibles parmi les establishments existants
const availableCities = computed(() => {
  const set = new Set<string>();
  for (const e of ESTABLISHMENTS) set.add(e.city);
  return Array.from(set).map((slug) => CITIES.find((c) => c.slug === slug)).filter(Boolean) as typeof CITIES[number][];
});

const visible = computed(() =>
  ESTABLISHMENTS.filter((e) => {
    if (activeCategory.value && e.category !== activeCategory.value) return false;
    if (activeCity.value && e.city !== activeCity.value) return false;
    return true;
  }),
);

const filterCount = computed(() =>
  (activeCategory.value ? 1 : 0) + (activeCity.value ? 1 : 0),
);

function clearFilters() {
  activeCategory.value = null;
  activeCity.value = null;
}

function cityOf(slug: string) {
  return CITIES.find((c) => c.slug === slug);
}
</script>

<template>
  <main class="min-h-screen">
    <section class="bg-misana-stone border-b border-misana-line">
      <div class="max-w-5xl mx-auto px-6 py-16 sm:py-24">
        <p class="text-xs uppercase tracking-widest text-misana-muted mb-4">{{ t('access.kicker') }}</p>
        <h1 class="font-display text-4xl sm:text-5xl mb-4">{{ t('access.hubTitle') }}</h1>
        <p class="text-misana-muted text-lg max-w-2xl">{{ t('access.hubLead') }}</p>
      </div>
    </section>

    <section class="max-w-7xl mx-auto px-6 py-12">
      <div class="border-b border-misana-line pb-8 mb-12 space-y-6">
        <div>
          <p class="text-[10px] uppercase tracking-widest text-misana-muted mb-3">{{ t('access.filterCategory') }}</p>
          <div class="flex flex-wrap gap-2">
            <button
              type="button"
              class="text-xs px-3 py-1.5 transition border"
              :class="activeCategory === null ? 'border-misana-ink bg-misana-ink text-misana-paper' : 'border-misana-line hover:border-misana-ink'"
              @click="activeCategory = null"
            >{{ t('access.allCategories') }}</button>
            <button
              v-for="cat in CATEGORIES"
              :key="cat.id"
              type="button"
              class="text-xs px-3 py-1.5 transition border"
              :class="activeCategory === cat.id ? 'border-misana-ink bg-misana-ink text-misana-paper' : 'border-misana-line hover:border-misana-ink'"
              @click="activeCategory = cat.id"
            >{{ locale === 'fr' ? cat.labelFr : cat.label }}</button>
          </div>
        </div>

        <div>
          <p class="text-[10px] uppercase tracking-widest text-misana-muted mb-3">{{ t('access.filterCity') }}</p>
          <div class="flex flex-wrap gap-2">
            <button
              type="button"
              class="text-xs px-3 py-1.5 transition border"
              :class="activeCity === null ? 'border-misana-ink bg-misana-ink text-misana-paper' : 'border-misana-line hover:border-misana-ink'"
              @click="activeCity = null"
            >{{ t('access.allCities') }}</button>
            <button
              v-for="ct in availableCities"
              :key="ct.slug"
              type="button"
              class="text-xs px-3 py-1.5 transition border"
              :class="activeCity === ct.slug ? 'border-misana-ink bg-misana-ink text-misana-paper' : 'border-misana-line hover:border-misana-ink'"
              @click="activeCity = ct.slug"
            >{{ locale === 'fr' ? ct.fr : ct.en }}</button>
          </div>
        </div>

        <div class="flex items-center justify-between text-xs text-misana-muted">
          <p>{{ visible.length }} {{ t('access.results', { n: visible.length }) }}</p>
          <button
            v-if="filterCount"
            type="button"
            class="underline underline-offset-4 hover:text-misana-ink transition"
            @click="clearFilters"
          >{{ t('access.clearFilters') }}</button>
        </div>
      </div>

      <div v-if="visible.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <NuxtLink
          v-for="est in visible"
          :key="est.slug"
          :to="localePath(`/services/access/${est.slug}`)"
          class="group ring-1 ring-misana-line hover:ring-misana-ink transition overflow-hidden bg-misana-paper flex flex-col"
        >
          <div class="aspect-[4/3] bg-misana-stone flex items-center justify-center px-6">
            <span class="font-display text-xl text-misana-ink/70 text-center leading-tight">{{ est.name }}</span>
          </div>
          <div class="p-5 flex-1 flex flex-col">
            <p class="text-[10px] uppercase tracking-widest text-misana-muted mb-1">{{ t(`access.cat.${est.category}`) }}</p>
            <p class="text-sm font-medium leading-tight">{{ est.name }}</p>
            <p class="text-xs text-misana-muted mt-1">
              {{ cityOf(est.city) ? (locale === 'fr' ? cityOf(est.city)!.fr : cityOf(est.city)!.en) : '' }}
            </p>
          </div>
        </NuxtLink>
      </div>

      <div v-else class="text-center py-16">
        <p class="text-misana-muted text-sm mb-4">{{ t('access.noResults') }}</p>
        <button
          type="button"
          class="text-xs underline underline-offset-4 hover:text-misana-ink transition"
          @click="clearFilters"
        >{{ t('access.clearFilters') }}</button>
      </div>
    </section>
  </main>
</template>
