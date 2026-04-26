<script setup lang="ts">
// Hub catalog yacht : 4 yachts curés (1 par bracket de taille).
// Filtre par bracket de taille (15-20m / 20-30m / 30-50m / 50m+).
// Tier 1 V1.5.
import { YACHTS } from '~/lib/yachts';
import { YACHT_SIZES, type YachtSize } from '~/types/request';

definePageMeta({ layout: 'default' });

const { locale, t } = useI18n();
const localePath = useLocalePath();

useSeoMeta({
  title: () => t('yacht.hubTitle'),
  description: () => t('yacht.hubDescription'),
});

const activeSize = ref<YachtSize | null>(null);

const visibleYachts = computed(() =>
  activeSize.value ? YACHTS.filter((y) => y.size === activeSize.value) : YACHTS,
);

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
          {{ t('yacht.kicker') }}
        </p>
        <h1 class="font-display text-4xl sm:text-5xl mb-4">{{ t('yacht.hubTitle') }}</h1>
        <p class="text-misana-muted text-lg max-w-2xl">{{ t('yacht.hubLead') }}</p>
      </div>
    </section>

    <section class="max-w-7xl mx-auto px-6 py-12">
      <div class="flex flex-wrap gap-2 mb-12">
        <button
          type="button"
          class="text-sm px-4 py-2 transition border"
          :class="
            activeSize === null
              ? 'border-misana-ink bg-misana-ink text-misana-paper'
              : 'border-misana-line hover:border-misana-ink'
          "
          @click="activeSize = null"
        >
          {{ t('yacht.allSizes') }}
        </button>
        <button
          v-for="s in YACHT_SIZES"
          :key="s"
          type="button"
          class="text-sm px-4 py-2 transition border"
          :class="
            activeSize === s
              ? 'border-misana-ink bg-misana-ink text-misana-paper'
              : 'border-misana-line hover:border-misana-ink'
          "
          @click="activeSize = s"
        >
          {{ s }}
        </button>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <NuxtLink
          v-for="y in visibleYachts"
          :key="y.id"
          :to="localePath(`/services/yacht/${y.id}`)"
          class="group ring-1 ring-misana-line hover:ring-misana-ink transition overflow-hidden bg-misana-paper flex flex-col"
        >
          <div class="aspect-[4/3] relative overflow-hidden bg-misana-stone">
            <img
              :src="y.hero"
              :alt="y.fullName"
              loading="lazy"
              class="absolute inset-0 w-full h-full object-cover transition duration-700 group-hover:scale-[1.02]"
            />
            <span
              v-if="y.badge"
              class="absolute top-3 left-3 text-[10px] uppercase tracking-widest px-2 py-1 bg-misana-paper text-misana-ink"
            >
              {{ t(`request.fleet.badge.${y.badge}`) }}
            </span>
          </div>
          <div class="p-5 flex-1 flex flex-col">
            <p class="text-[10px] uppercase tracking-widest text-misana-muted mb-1">
              {{ y.builder }} · {{ y.lengthM }} m
            </p>
            <p class="text-sm font-medium leading-tight">{{ y.name }}</p>
            <p class="text-xs text-misana-muted mt-1">
              {{ locale === 'fr' ? y.descFr : y.desc }}
            </p>
            <div class="flex items-baseline justify-between mt-4 text-xs text-misana-muted">
              <span>{{ y.guests }} {{ t('yacht.guests') }}</span>
              <span class="text-misana-ink whitespace-nowrap">
                <span class="text-misana-muted">{{ t('yacht.from') }} </span>
                {{ fmtPrice(y.pricePerWeekFrom) }} / {{ t('yacht.week') }}
              </span>
            </div>
          </div>
        </NuxtLink>
      </div>

      <p class="text-xs text-misana-muted mt-8 italic">{{ t('yacht.priceFootnote') }}</p>
    </section>
  </main>
</template>
