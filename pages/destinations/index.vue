<script setup lang="ts">
// Hub destinations : 8 villes Riviera, 4 lourdes + 4 stub.
import { CITIES } from '~/lib/constants';

definePageMeta({ layout: 'default' });

const { locale, t } = useI18n();
const localePath = useLocalePath();

useSeoMeta({
  title: () => t('destinations.hubTitle'),
  description: () => t('destinations.hubDescription'),
});

const heavy = computed(() => CITIES.filter((c) => c.tier === 'heavy'));
const stub = computed(() => CITIES.filter((c) => c.tier !== 'heavy'));
</script>

<template>
  <main class="min-h-screen">
    <section class="bg-misana-stone border-b border-misana-line">
      <div class="max-w-5xl mx-auto px-6 py-16 sm:py-24">
        <p class="text-xs uppercase tracking-widest text-misana-muted mb-4">{{ t('destinations.kicker') }}</p>
        <h1 class="font-display text-4xl sm:text-5xl mb-4">{{ t('destinations.hubTitle') }}</h1>
        <p class="text-misana-muted text-lg max-w-2xl">{{ t('destinations.hubLead') }}</p>
      </div>
    </section>

    <section class="max-w-7xl mx-auto px-6 py-16">
      <p class="text-xs uppercase tracking-widest text-misana-muted mb-6">{{ t('destinations.heavySection') }}</p>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <NuxtLink
          v-for="ct in heavy"
          :key="ct.slug"
          :to="localePath(`/destinations/${ct.slug}`)"
          class="group bg-misana-paper aspect-[4/5] flex flex-col justify-between p-6 ring-1 ring-misana-line hover:ring-misana-ink transition"
        >
          <p class="text-[10px] uppercase tracking-widest text-misana-muted">{{ t('home.cityHeavy') }}</p>
          <div>
            <p class="font-display text-2xl mb-3">{{ locale === 'fr' ? ct.fr : ct.en }}</p>
            <p class="text-xs text-misana-muted leading-relaxed">{{ locale === 'fr' ? ct.blurbFr : ct.blurbEn }}</p>
          </div>
        </NuxtLink>
      </div>

      <p class="text-xs uppercase tracking-widest text-misana-muted mt-16 mb-6">{{ t('destinations.stubSection') }}</p>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <NuxtLink
          v-for="ct in stub"
          :key="ct.slug"
          :to="localePath(`/destinations/${ct.slug}`)"
          class="group bg-misana-paper aspect-[4/5] flex flex-col justify-between p-6 ring-1 ring-misana-line hover:ring-misana-ink transition"
        >
          <p class="text-[10px] uppercase tracking-widest text-misana-muted">{{ t('home.cityStub') }}</p>
          <div>
            <p class="font-display text-2xl mb-3">{{ locale === 'fr' ? ct.fr : ct.en }}</p>
            <p class="text-xs text-misana-muted leading-relaxed">{{ locale === 'fr' ? ct.blurbFr : ct.blurbEn }}</p>
          </div>
        </NuxtLink>
      </div>
    </section>
  </main>
</template>
