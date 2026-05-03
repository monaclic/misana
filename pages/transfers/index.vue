<script setup lang="ts">
// Hub transfers : 20 trajets fixes Riviera (aller simple chauffeur).
import { TRANSFERS, CITIES } from '~/lib/constants';

definePageMeta({ layout: 'default' });

const { locale, t } = useI18n();
const localePath = useLocalePath();

useSeoMeta({
  title: () => t('transfer.hubTitle'),
  description: () => t('transfer.hubDescription'),
});

function cityName(slug: string) {
  const c = CITIES.find((x) => x.slug === slug);
  if (!c) return slug;
  return locale.value === 'fr' ? c.fr : c.en;
}
</script>

<template>
  <main class="min-h-screen">
    <section class="bg-misana-stone border-b border-misana-line">
      <div class="max-w-5xl mx-auto px-6 py-16 sm:py-24">
        <p class="text-xs uppercase tracking-widest text-misana-muted mb-4">{{ t('transfer.kicker') }}</p>
        <h1 class="font-display text-4xl sm:text-5xl mb-4">{{ t('transfer.hubTitle') }}</h1>
        <p class="text-misana-muted text-lg max-w-2xl" data-display>{{ t('transfer.hubLead') }}</p>
      </div>
    </section>

    <section class="max-w-7xl mx-auto px-6 py-16">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <NuxtLink
          v-for="tr in TRANSFERS"
          :key="tr.slug"
          :to="localePath(`/transfers/${tr.slug}`)"
          class="group block border border-misana-line hover:border-misana-ink transition p-5"
        >
          <p class="text-[10px] uppercase tracking-widest text-misana-muted mb-2">{{ t('transfer.routeKicker') }}</p>
          <p class="font-display text-lg leading-tight">{{ locale === 'fr' ? tr.fr : tr.en }}</p>
          <p class="text-xs text-misana-muted mt-2">{{ cityName(tr.from) }} → {{ cityName(tr.to) }}</p>
        </NuxtLink>
      </div>
    </section>
  </main>
</template>
