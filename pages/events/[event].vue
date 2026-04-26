<script setup lang="ts">
// Landing SEO event saisonnier. Tier 1 V1 : Festival de Cannes, Monaco GP,
// Cannes Lions, Monaco Yacht Show. Le formulaire embedded recoit le service
// par defaut chauffeur mais le user peut changer (lockService=false ici parce
// qu un client event peut vouloir helico OU chauffeur OU access).
import { EVENTS, CITIES } from '~/lib/constants';

definePageMeta({ layout: 'default' });

const route = useRoute();
const { locale, t } = useI18n();
const slug = computed(() => String(route.params.event));

const event = computed(() => EVENTS.find((e) => e.slug === slug.value));
if (!event.value) {
  throw createError({ statusCode: 404, statusMessage: 'Event not found', fatal: true });
}

const ev = event.value;
const eventCity = computed(() => CITIES.find((c) => c.slug === ev.city));
const eventLabel = computed(() => (locale.value === 'fr' ? ev.fr : ev.en));
const monthLabel = computed(() => (locale.value === 'fr' ? ev.monthFr : ev.monthEn));

useSeoMeta({
  title: () => `${eventLabel.value} — ${eventCity.value ? (locale.value === 'fr' ? eventCity.value.fr : eventCity.value.en) : ''}`,
  description: () =>
    locale.value === 'fr'
      ? `${eventLabel.value} a ${eventCity.value?.fr || ''} en ${monthLabel.value}. Chauffeur, helicoptere, restaurants, hotels. Reponse en vingt-quatre heures.`
      : `${eventLabel.value} in ${eventCity.value?.en || ''} during ${monthLabel.value}. Chauffeur, helicopter, restaurants, hotels. We answer within twenty-four hours.`,
});

// Preset event = on pre-remplit la destination + l event slug. Service non
// preset (le user choisit ce qu il veut).
const presetData = computed(() => ({
  destination: ev.city as any,
  event: ev.slug,
}));

// Slug de translation pour faq + body : on utilise le slug tel quel s il existe
// dans i18n, sinon fallback sur 'default'.
const eventSlugForI18n = computed(() => {
  // Eviter les tirets dans les keys i18n : on garde le slug tel quel, qui est
  // valide en JSON keys.
  return ev.slug;
});
</script>

<template>
  <main class="min-h-screen">
    <section class="bg-misana-stone border-b border-misana-line">
      <div class="max-w-5xl mx-auto px-6 py-16 sm:py-24">
        <p class="text-xs uppercase tracking-widest text-misana-muted mb-4">
          {{ monthLabel }} · {{ eventCity ? (locale === 'fr' ? eventCity.fr : eventCity.en) : '' }}
        </p>
        <h1 class="font-display text-4xl sm:text-5xl mb-4">{{ eventLabel }}</h1>
        <p class="text-misana-muted text-lg max-w-2xl">
          {{ t('event.hero', { event: eventLabel, city: eventCity ? (locale === 'fr' ? eventCity.fr : eventCity.en) : '' }) }}
        </p>
      </div>
    </section>

    <section class="max-w-7xl mx-auto px-6 py-16 grid lg:grid-cols-12 gap-12">
      <article class="lg:col-span-7 space-y-12">
        <div>
          <h2 class="font-display text-2xl mb-4">{{ t('event.servicesSection') }}</h2>
          <p class="text-misana-muted leading-relaxed mb-6">{{ t('event.servicesBody') }}</p>
          <ul class="grid grid-cols-2 gap-4 text-sm">
            <li class="border border-misana-line p-4">
              <p class="font-medium mb-1">{{ t('nav.chauffeur') }}</p>
              <p class="text-xs text-misana-muted">{{ t('event.services.chauffeur') }}</p>
            </li>
            <li class="border border-misana-line p-4">
              <p class="font-medium mb-1">{{ t('nav.helicopter') }}</p>
              <p class="text-xs text-misana-muted">{{ t('event.services.helicopter') }}</p>
            </li>
            <li class="border border-misana-line p-4">
              <p class="font-medium mb-1">{{ t('nav.access') }}</p>
              <p class="text-xs text-misana-muted">{{ t('event.services.access') }}</p>
            </li>
            <li class="border border-misana-line p-4">
              <p class="font-medium mb-1">{{ t('nav.cars') }}</p>
              <p class="text-xs text-misana-muted">{{ t('event.services.cars') }}</p>
            </li>
          </ul>
        </div>

        <div>
          <h2 class="font-display text-2xl mb-4">{{ t('event.whenSection') }}</h2>
          <p class="text-misana-muted leading-relaxed">
            {{ t('event.whenBody', { month: monthLabel, city: eventCity ? (locale === 'fr' ? eventCity.fr : eventCity.en) : '' }) }}
          </p>
        </div>

        <div>
          <h2 class="font-display text-2xl mb-4">{{ t('event.discretionSection') }}</h2>
          <p class="text-misana-muted leading-relaxed">{{ t('event.discretionBody') }}</p>
        </div>
      </article>

      <aside class="lg:col-span-5">
        <div class="lg:sticky lg:top-24 border border-misana-line p-6 bg-misana-paper">
          <p class="text-xs uppercase tracking-wide text-misana-muted mb-1">
            {{ t('event.formKicker') }}
          </p>
          <h2 class="font-display text-xl mb-6">{{ t('event.formTitle', { event: eventLabel }) }}</h2>
          <RequestForm :preset-data="presetData" :embedded="true" />
        </div>
      </aside>
    </section>
  </main>
</template>
