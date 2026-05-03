<script setup lang="ts">
// Hub events : agenda Riviera annuel, 8 events 4 lourds + 4 stub.
import { EVENTS, CITIES } from '~/lib/constants';

definePageMeta({ layout: 'default' });

const { locale, t } = useI18n();
const localePath = useLocalePath();

useSeoMeta({
  title: () => t('events.hubTitle'),
  description: () => t('events.hubDescription'),
});

const eventsWithCity = computed(() =>
  EVENTS.map((e) => {
    const city = CITIES.find((c) => c.slug === e.city);
    return { ...e, cityEn: city?.en ?? '', cityFr: city?.fr ?? '' };
  }).sort((a, b) => a.monthOrder - b.monthOrder),
);
</script>

<template>
  <main class="min-h-screen">
    <section class="bg-misana-stone border-b border-misana-line">
      <div class="max-w-5xl mx-auto px-6 py-16 sm:py-24">
        <p class="text-xs uppercase tracking-widest text-misana-muted mb-4">{{ t('events.kicker') }}</p>
        <h1 class="font-display text-4xl sm:text-5xl mb-4">{{ t('events.hubTitle') }}</h1>
        <p class="text-misana-muted text-lg max-w-2xl" data-display>{{ t('events.hubLead') }}</p>
      </div>
    </section>

    <section class="max-w-7xl mx-auto px-6 py-16">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <NuxtLink
          v-for="ev in eventsWithCity"
          :key="ev.slug"
          :to="localePath(`/events/${ev.slug}`)"
          class="group block border border-misana-line hover:border-misana-ink transition p-6"
        >
          <p class="text-[10px] uppercase tracking-widest text-misana-muted mb-3">{{ locale === 'fr' ? ev.monthFr : ev.monthEn }}</p>
          <p class="font-display text-xl mb-2">{{ locale === 'fr' ? ev.fr : ev.en }}</p>
          <p class="text-xs text-misana-muted">{{ locale === 'fr' ? ev.cityFr : ev.cityEn }}</p>
          <p class="text-[10px] uppercase tracking-widest text-misana-muted mt-4">
            {{ ev.tier === 'heavy' ? t('events.tierHeavy') : t('events.tierStub') }}
          </p>
        </NuxtLink>
      </div>
    </section>
  </main>
</template>
