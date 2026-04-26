<script setup lang="ts">
// Hub service generique : /services/chauffeur, /helicopter, /yacht, /access.
// Pour /services/cars, c est /services/cars/index.vue qui est dedie (catalog).
// Tier 1 V1.
import { SERVICES, CITIES, TRANSFERS } from '~/lib/constants';
import type { Service } from '~/types/request';

definePageMeta({ layout: 'default' });

const route = useRoute();
const { locale, t } = useI18n();
const localePath = useLocalePath();

const service = computed(() => {
  const s = String(route.params.service);
  if (!(SERVICES as readonly { slug: string }[]).find((sv) => sv.slug === s)) return null;
  return s as Service;
});

if (!service.value) {
  throw createError({ statusCode: 404, statusMessage: 'Service not found', fatal: true });
}

const sv = service.value;

useSeoMeta({
  title: () => t(`services.${sv}.title`),
  description: () => t(`services.${sv}.description`),
});

// Pour chauffeur + helicopter : on liste les routes pertinentes en cross-link.
const relatedRoutes = computed(() => {
  if (sv === 'chauffeur') {
    return TRANSFERS.filter((tr) => tr.mode === 'chauffeur' || tr.mode === 'both').slice(0, 6);
  }
  if (sv === 'helicopter') {
    return TRANSFERS.filter((tr) => tr.mode === 'helicopter' || tr.mode === 'both').slice(0, 6);
  }
  return [];
});

const heavyCities = CITIES.filter((c) => c.tier === 'heavy');
</script>

<template>
  <main class="min-h-screen">
    <section class="bg-misana-stone border-b border-misana-line">
      <div class="max-w-5xl mx-auto px-6 py-16 sm:py-24">
        <p class="text-xs uppercase tracking-widest text-misana-muted mb-4">
          {{ t('services.kicker') }}
        </p>
        <h1 class="font-display text-4xl sm:text-5xl mb-4">{{ t(`services.${sv}.title`) }}</h1>
        <p class="text-misana-muted text-lg max-w-2xl">{{ t(`services.${sv}.lead`) }}</p>
      </div>
    </section>

    <section class="max-w-7xl mx-auto px-6 py-16 grid lg:grid-cols-12 gap-12">
      <article class="lg:col-span-7 space-y-12">
        <div>
          <h2 class="font-display text-2xl mb-4">{{ t(`services.${sv}.howSection`) }}</h2>
          <p class="text-misana-muted leading-relaxed">{{ t(`services.${sv}.howBody`) }}</p>
        </div>

        <!-- Routes pertinentes (chauffeur + helico) -->
        <div v-if="relatedRoutes.length">
          <h2 class="font-display text-2xl mb-6">{{ t('services.popularRoutes') }}</h2>
          <ul class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <li v-for="rt in relatedRoutes" :key="rt.slug">
              <NuxtLink
                :to="localePath(`/transfers/${rt.slug}`)"
                class="block border border-misana-line hover:border-misana-ink transition px-4 py-3"
              >
                <span class="text-sm">{{ locale === 'fr' ? rt.fr : rt.en }}</span>
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Liens villes heavy -->
        <div>
          <h2 class="font-display text-2xl mb-6">{{ t('services.byDestination') }}</h2>
          <ul class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <li v-for="city in heavyCities" :key="city.slug">
              <NuxtLink
                :to="localePath(`/destinations/${city.slug}`)"
                class="block border border-misana-line hover:border-misana-ink transition px-4 py-3 text-center"
              >
                <span class="text-sm">{{ locale === 'fr' ? city.fr : city.en }}</span>
              </NuxtLink>
            </li>
          </ul>
        </div>
      </article>

      <aside class="lg:col-span-5">
        <div class="lg:sticky lg:top-24 border border-misana-line p-6 bg-misana-paper">
          <p class="text-xs uppercase tracking-wide text-misana-muted mb-1">{{ t('services.formKicker') }}</p>
          <h2 class="font-display text-xl mb-6">{{ t(`services.${sv}.formTitle`) }}</h2>
          <RequestForm :preset-service="sv" :lock-service="true" :embedded="true" />
        </div>
      </aside>
    </section>
  </main>
</template>
