<script setup lang="ts">
import { CITIES, EVENTS } from '~/lib/constants';

const { locale, t } = useI18n();
const localePath = useLocalePath();
const heavyCities = CITIES.filter((c) => c.tier === 'heavy');
const heavyEvents = EVENTS.filter((e) => e.tier === 'heavy');
</script>

<template>
  <footer class="border-t border-misana-line mt-32">
    <div class="max-w-7xl mx-auto px-6 py-16 grid grid-cols-2 lg:grid-cols-4 gap-10 text-sm">
      <div>
        <p class="text-xs uppercase tracking-wide text-misana-muted mb-3">
          {{ t('footer.services') }}
        </p>
        <ul class="space-y-2">
          <li><NuxtLink :to="localePath('/services/chauffeur')">{{ t('nav.chauffeur') }}</NuxtLink></li>
          <li><NuxtLink :to="localePath('/services/cars')">{{ t('nav.cars') }}</NuxtLink></li>
          <li><NuxtLink :to="localePath('/services/yacht')">{{ t('nav.yacht') }}</NuxtLink></li>
          <li><NuxtLink :to="localePath('/services/helicopter')">{{ t('nav.helicopter') }}</NuxtLink></li>
          <li><NuxtLink :to="localePath('/services/access')">{{ t('nav.access') }}</NuxtLink></li>
        </ul>
      </div>
      <div>
        <p class="text-xs uppercase tracking-wide text-misana-muted mb-3">
          {{ t('footer.destinations') }}
        </p>
        <ul class="space-y-2">
          <li v-for="c in heavyCities" :key="c.slug">
            <NuxtLink :to="localePath(`/destinations/${c.slug}`)">
              {{ locale === 'fr' ? c.fr : c.en }}
            </NuxtLink>
          </li>
        </ul>
      </div>
      <div>
        <p class="text-xs uppercase tracking-wide text-misana-muted mb-3">
          {{ t('footer.events') }}
        </p>
        <ul class="space-y-2">
          <li v-for="e in heavyEvents" :key="e.slug">
            <NuxtLink :to="localePath(`/events/${e.slug}`)">
              {{ locale === 'fr' ? e.fr : e.en }}
            </NuxtLink>
          </li>
        </ul>
      </div>
      <div>
        <p class="text-xs uppercase tracking-wide text-misana-muted mb-3">
          {{ t('footer.maison') }}
        </p>
        <ul class="space-y-2">
          <li><NuxtLink :to="localePath('/about')">{{ t('footer.about') }}</NuxtLink></li>
          <li><NuxtLink :to="localePath('/contact')">{{ t('footer.contact') }}</NuxtLink></li>
          <li><NuxtLink :to="localePath('/request')">{{ t('nav.request') }}</NuxtLink></li>
        </ul>
      </div>
    </div>
    <div class="border-t border-misana-line">
      <div class="max-w-7xl mx-auto px-6 py-6 flex flex-wrap items-center justify-between text-xs text-misana-muted gap-4">
        <p>{{ t('footer.coordinates') }} · {{ t('footer.established') }}</p>
        <ul class="flex gap-4">
          <li><NuxtLink :to="localePath('/legal/mentions')">{{ t('footer.legal.mentions') }}</NuxtLink></li>
          <li><NuxtLink :to="localePath('/legal/cgv')">{{ t('footer.legal.cgv') }}</NuxtLink></li>
          <li><NuxtLink :to="localePath('/legal/privacy')">{{ t('footer.legal.privacy') }}</NuxtLink></li>
          <li><NuxtLink :to="localePath('/legal/cookies')">{{ t('footer.legal.cookies') }}</NuxtLink></li>
        </ul>
      </div>
    </div>
  </footer>
</template>
