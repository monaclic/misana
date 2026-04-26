<script setup lang="ts">
// Fiche etablissement : restaurant / palace / beach club / nightclub.
// 15 fiches V1 generees dynamiquement depuis lib/constants.ts ESTABLISHMENTS.
// Form embedded preset access avec un item pre-rempli (city + establishment).
import { ESTABLISHMENTS, CITIES } from '~/lib/constants';

definePageMeta({ layout: 'default' });

const route = useRoute();
const { locale, t } = useI18n();
const localePath = useLocalePath();
const slug = computed(() => String(route.params.establishment));

const est = computed(() => ESTABLISHMENTS.find((e) => e.slug === slug.value));
if (!est.value) {
  throw createError({ statusCode: 404, statusMessage: 'Establishment not found', fatal: true });
}

const e = est.value;
const cityObj = computed(() => CITIES.find((c) => c.slug === e.city));
const cityName = computed(() => (cityObj.value ? (locale.value === 'fr' ? cityObj.value.fr : cityObj.value.en) : ''));

useSeoMeta({
  title: () => `${e.name} · ${cityName.value}`,
  description: () =>
    locale.value === 'fr'
      ? `Réservation à ${e.name}, ${cityName.value}. Table tenue, accueil discret. Réponse en vingt-quatre heures.`
      : `Booking at ${e.name}, ${cityName.value}. Table held, discreet welcome. We answer within twenty-four hours.`,
});

const schemaType = e.category === 'restaurant' ? 'Restaurant'
  : e.category === 'palace' ? 'LodgingBusiness'
  : e.category === 'beach-club' ? 'BeachResort'
  : 'NightClub';

useHead({
  script: [{
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': schemaType,
      name: e.name,
      address: { '@type': 'PostalAddress', addressLocality: cityName.value, addressCountry: e.city === 'monaco' ? 'MC' : 'FR' },
    }),
  }],
});

const presetData = computed(() => ({
  destination: e.city as any,
  access: {
    items: [
      {
        category: e.category as any,
        city: e.city as any,
        establishment: e.name,
        date: undefined,
        time: undefined,
        guests: undefined,
        occasion: 'none' as any,
      },
    ],
    notes: undefined,
  },
}));

// Cross-link : 3 autres etablissements de la meme categorie ou meme ville
const related = computed(() =>
  ESTABLISHMENTS.filter(
    (x) => x.slug !== e.slug && (x.category === e.category || x.city === e.city),
  ).slice(0, 3),
);
</script>

<template>
  <main class="min-h-screen">
    <section class="bg-misana-stone border-b border-misana-line">
      <div class="max-w-5xl mx-auto px-6 py-16 sm:py-24">
        <p class="text-xs uppercase tracking-widest text-misana-muted mb-4">
          {{ t(`access.cat.${e.category}`) }} · {{ cityName }}
        </p>
        <h1 class="font-display text-4xl sm:text-5xl mb-4">{{ e.name }}</h1>
        <p class="text-misana-muted text-lg max-w-2xl">{{ t(`access.body.${e.category}`) }}</p>
      </div>
    </section>

    <section class="max-w-7xl mx-auto px-6 py-16 grid lg:grid-cols-12 gap-12">
      <article class="lg:col-span-7 space-y-12">
        <div>
          <h2 class="font-display text-2xl mb-4">{{ t('access.howSection') }}</h2>
          <p class="text-misana-muted leading-relaxed">{{ t(`access.how.${e.category}`) }}</p>
        </div>

        <div>
          <h2 class="font-display text-2xl mb-4">{{ t('access.discretionSection') }}</h2>
          <p class="text-misana-muted leading-relaxed">{{ t('access.discretionBody') }}</p>
        </div>
      </article>

      <aside class="lg:col-span-5">
        <div class="lg:sticky lg:top-24 border border-misana-line p-6 bg-misana-paper">
          <p class="text-xs uppercase tracking-wide text-misana-muted mb-1">{{ t('access.formKicker') }}</p>
          <h2 class="font-display text-xl mb-6">{{ t('access.formTitle', { name: e.name }) }}</h2>
          <RequestForm
            :preset-service="'access'"
            :preset-data="presetData"
            :lock-service="true"
            :embedded="true"
          />
        </div>
      </aside>
    </section>

    <section v-if="related.length" class="max-w-7xl mx-auto px-6 py-16 border-t border-misana-line">
      <h2 class="font-display text-2xl mb-8">{{ t('access.relatedSection') }}</h2>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <NuxtLink
          v-for="other in related"
          :key="other.slug"
          :to="localePath(`/services/access/${other.slug}`)"
          class="group ring-1 ring-misana-line hover:ring-misana-ink transition overflow-hidden bg-misana-paper"
        >
          <div class="aspect-[4/3] bg-misana-stone flex items-center justify-center px-4">
            <span class="font-display text-lg text-misana-ink/70 text-center">{{ other.name }}</span>
          </div>
          <div class="p-4">
            <p class="text-[10px] uppercase tracking-widest text-misana-muted mb-1">
              {{ t(`access.cat.${other.category}`) }}
            </p>
            <p class="text-sm font-medium">{{ other.name }}</p>
          </div>
        </NuxtLink>
      </div>
    </section>
  </main>
</template>
