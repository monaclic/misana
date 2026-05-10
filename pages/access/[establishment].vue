<script setup lang="ts">
// Fiche access. Architecture pattern Airbnb :
// hero pleine largeur + title section + 2 cols (contenu + widget reservation sticky)
// + maillage + footer CTA. Le widget pre-remplit /request via query params.
import { CITIES } from '~/lib/constants';
import { useEstablishment, useEstablishments } from '~/composables/useEstablishments';

definePageMeta({ layout: 'default' });
defineI18nRoute({
  paths: {
    en: '/reservations/[establishment]',
    fr: '/reservations/[establishment]',
  },
});

const route = useRoute();
const { locale, t } = useI18n();
const localePath = useLocalePath();
const slug = computed(() => String(route.params.establishment));

// Fetch fiche unique avec await -> 404 SSR pour les crawlers.
const { establishment } = await useEstablishment(slug.value);
if (!establishment.value) {
  throw createError({ statusCode: 404, statusMessage: 'Establishment not found', fatal: true });
}

const e = establishment.value;
// Detail = doc complet, suit la meme shape que getEstablishmentDetail
const detail = computed(() => establishment.value!);
// Pour les "etablissements similaires", liste lazy non bloquante.
const { establishments: ESTABLISHMENTS_REF } = useEstablishments();
const cityObj = computed(() => CITIES.find((c) => c.slug === e.city));
const cityName = computed(() => (cityObj.value ? (locale.value === 'fr' ? cityObj.value.fr : cityObj.value.en) : ''));
const lng = computed<'fr' | 'en'>(() => (locale.value === 'fr' ? 'fr' : 'en'));

const signature = computed(() => detail.value.signature[lng.value]);
const labels = computed(() => detail.value.factualLabels?.[lng.value] ?? []);
const bestFor = computed(() => detail.value.bestFor?.[lng.value] ?? []);
const aboutText = computed(() => detail.value.about?.[lng.value] ?? '');

// Description longue : truncation au premier paragraphe (ou ~280 chars)
// avec bouton "Voir plus / Voir moins".
const ABOUT_TRUNCATE_CHARS = 280;
const aboutExpanded = ref(false);
const aboutNeedsToggle = computed(() => aboutText.value.length > ABOUT_TRUNCATE_CHARS);
const aboutTextDisplay = computed(() => {
  if (!aboutNeedsToggle.value || aboutExpanded.value) return aboutText.value;
  // Coupe a la fin du premier paragraphe (\n\n) ou du premier mot apres 280 chars
  const firstPara = aboutText.value.split('\n\n')[0];
  if (firstPara && firstPara.length <= ABOUT_TRUNCATE_CHARS) return firstPara + ' …';
  const slice = aboutText.value.slice(0, ABOUT_TRUNCATE_CHARS);
  const lastSpace = slice.lastIndexOf(' ');
  return (lastSpace > 0 ? slice.slice(0, lastSpace) : slice) + ' …';
});
const teamNotes = computed(() => detail.value.teamNotes?.[lng.value] ?? '');
const faqList = computed(
  () => (detail.value.faq ?? []).map((f) => ({
    question: f.question[lng.value],
    answer: f.answer[lng.value],
  })),
);

const practicalAddress = computed(() => detail.value.practical.address[lng.value]);
const practicalCuisine = computed(() => detail.value.practical.cuisine?.[lng.value] ?? '');
const practicalHours = computed(() => detail.value.practical.hours?.[lng.value] ?? '');
const practicalDress = computed(() => detail.value.practical.dressCode?.[lng.value] ?? '');

const hasPractical = computed(
  () => !!practicalAddress.value
    || !!practicalCuisine.value
    || !!detail.value.practical.chef
    || !!practicalHours.value
    || !!practicalDress.value,
);

useSeoMeta({
  title: () => `${t('access.fiche.metaTitlePrefix')} ${e.name} · ${cityName.value}`,
  description: () =>
    locale.value === 'fr'
      ? `Réservation à ${e.name}, ${cityName.value}. Misana s'occupe de la table pour vous, de manière discrète. Réponse en moins de 24 heures.`
      : `Reservations at ${e.name}, ${cityName.value}. Misana handles the booking on your behalf, discreetly. Reply in under 24 hours.`,
  ogImage: detail.value.hero,
});

const schemaType = e.category === 'restaurant' ? 'Restaurant'
  : e.category === 'palace' ? 'LodgingBusiness'
  : e.category === 'beach-club' ? 'BeachResort'
  : 'NightClub';

useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': schemaType,
        name: e.name,
        address: {
          '@type': 'PostalAddress',
          addressLocality: cityName.value,
          addressCountry: e.city === 'monaco' ? 'MC' : 'FR',
        },
        image: detail.value.hero,
      }),
    },
    ...(faqList.value.length > 0
      ? [{
          type: 'application/ld+json',
          innerHTML: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faqList.value.map((f) => ({
              '@type': 'Question',
              name: f.question,
              acceptedAnswer: { '@type': 'Answer', text: f.answer },
            })),
          }),
        }]
      : []),
  ],
});

// Image gallery
const galleryImages = computed(() => {
  const list = [detail.value.hero, ...(detail.value.thumbs ?? [])].filter(Boolean);
  return list;
});
const idx = ref(0);

// Maillage : 1 meme ville/categorie + 2 autres categories meme region
const related = computed(() => {
  const others = ESTABLISHMENTS_REF.value.filter((x) => x.slug !== e.slug);
  const sameCity = others.filter((x) => x.city === e.city);
  const sameCat = others.filter((x) => x.category === e.category && x.city !== e.city);
  const otherCat = others.filter((x) => x.category !== e.category && x.city !== e.city);
  return [...sameCity, ...sameCat, ...otherCat].slice(0, 3);
});

const breadcrumb = computed(() => [
  { label: 'Misana', to: '/' },
  { label: t('access.kicker'), to: { name: 'access' } },
  { label: cityName.value, to: `/destinations/${e.city}` },
  { label: e.name },
]);
</script>

<template>
  <main class="min-h-screen">
    <!-- Sticky back -->
    <section class="sticky top-16 z-30 bg-misana-paper/95 backdrop-blur-sm border-b border-misana-line">
      <div class="max-w-[1600px] mx-auto px-6 sm:px-12 py-3 flex items-center justify-between gap-4 flex-wrap">
        <NuxtLink
          :to="localePath({ name: 'access' })"
          class="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-misana-muted hover:text-misana-ink transition group"
        >
          <span class="inline-flex items-center justify-center w-4 h-4 transition-transform duration-500 group-hover:-translate-x-1">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" class="block w-full h-full">
              <path d="M17 12H7" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
              <path d="M10.5 8.5L7 12L10.5 15.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </span>
          <span>{{ t('access.fiche.backToAddresses') }}</span>
        </NuxtLink>
        <Breadcrumb :items="breadcrumb" class="hidden sm:block" />
      </div>
    </section>

    <!-- Title section : titre en premier, compact -->
    <section class="border-b border-misana-line">
      <div class="max-w-[1600px] mx-auto px-6 sm:px-12 pt-10 pb-8 sm:pt-12 sm:pb-10">
        <p class="text-[11px] uppercase tracking-[0.25em] text-misana-muted mb-3">
          {{ t(`access.cat.${e.category}`) }} · {{ cityName }}
        </p>
        <h1 class="font-display text-4xl sm:text-5xl lg:text-6xl leading-[1.05] mb-4">
          {{ e.name }}
        </h1>
        <p v-if="signature" class="font-display italic text-lg sm:text-xl text-misana-ink/80 max-w-3xl mb-5 leading-snug">
          {{ signature }}
        </p>

        <div class="flex flex-wrap items-center gap-x-5 gap-y-3">
          <p v-if="detail.housePick" class="text-[11px] uppercase tracking-[0.2em] text-misana-ink inline-flex items-center gap-2">
            <span class="inline-block w-1 h-1 rounded-full bg-misana-ink"></span>
            {{ t('access.fiche.housePick') }}
          </p>
          <div v-if="labels.length" class="flex flex-wrap gap-2">
            <span
              v-for="(label, i) in labels"
              :key="i"
              class="inline-flex items-center px-2.5 py-1 text-[11px] border border-misana-line text-misana-ink rounded-[4px]"
            >
              {{ label }}
            </span>
          </div>
          <p v-if="bestFor.length" class="text-xs text-misana-muted">
            <span class="text-misana-ink">{{ t('access.fiche.bestFor') }}</span>
            <span class="ml-2">{{ bestFor.join(' · ') }}</span>
          </p>
        </div>
      </div>
    </section>

    <!-- Main : hero image dans la col gauche, widget sticky visible des le haut -->
    <section>
      <div class="max-w-[1600px] mx-auto px-6 sm:px-12 py-10 sm:py-12 grid lg:grid-cols-12 gap-10 lg:gap-14">
        <article class="lg:col-span-8 space-y-12">
          <!-- Hero photo + thumbs -->
          <div>
            <div class="aspect-[16/10] bg-misana-stone overflow-hidden rounded-[6px]">
              <img
                v-if="galleryImages[idx]"
                :src="galleryImages[idx]"
                :alt="e.name"
                class="w-full h-full object-cover"
              />
            </div>
            <div v-if="galleryImages.length > 1" class="mt-3 flex gap-2">
              <button
                v-for="(src, i) in galleryImages"
                :key="i"
                type="button"
                class="flex-1 min-w-0 aspect-[3/2] overflow-hidden rounded-[4px] border transition"
                :class="i === idx ? 'border-misana-ink' : 'border-misana-line opacity-70 hover:opacity-100'"
                @click="idx = i"
              >
                <img :src="src" :alt="`${e.name} ${i + 1}`" class="w-full h-full object-cover" />
              </button>
            </div>
          </div>
          <!-- About + Practical : 2 cols si pratique disponible, sinon plein -->
          <div :class="hasPractical ? 'grid sm:grid-cols-2 gap-10 items-start' : ''">
            <div>
              <h2 class="font-display text-2xl mb-4">{{ t('access.fiche.about') }}</h2>
              <div class="text-misana-ink leading-relaxed max-w-3xl whitespace-pre-line">
                {{ aboutText ? aboutTextDisplay : t(`access.body.${e.category}`) }}
              </div>
              <button
                v-if="aboutNeedsToggle"
                type="button"
                @click="aboutExpanded = !aboutExpanded"
                class="mt-3 text-sm text-misana-ink border-b border-misana-ink pb-0.5 hover:opacity-70 transition"
              >
                {{
                  aboutExpanded
                    ? (locale === 'fr' ? 'Voir moins' : 'Show less')
                    : (locale === 'fr' ? 'Voir plus' : 'Read more')
                }}
              </button>
            </div>

            <div v-if="hasPractical">
              <h2 class="font-display text-2xl mb-4">{{ t('access.fiche.practical') }}</h2>
              <dl class="text-sm space-y-3">
                <div v-if="practicalAddress" class="flex flex-col">
                  <dt class="text-[11px] uppercase tracking-[0.15em] text-misana-muted mb-0.5">
                    {{ t('access.fiche.field.address') }}
                  </dt>
                  <dd>{{ practicalAddress }}</dd>
                </div>
                <div v-if="practicalCuisine" class="flex flex-col">
                  <dt class="text-[11px] uppercase tracking-[0.15em] text-misana-muted mb-0.5">
                    {{ t('access.fiche.field.cuisine') }}
                  </dt>
                  <dd>{{ practicalCuisine }}</dd>
                </div>
                <div v-if="detail.practical.chef" class="flex flex-col">
                  <dt class="text-[11px] uppercase tracking-[0.15em] text-misana-muted mb-0.5">
                    {{ t('access.fiche.field.chef') }}
                  </dt>
                  <dd>{{ detail.practical.chef }}</dd>
                </div>
                <div v-if="practicalHours" class="flex flex-col">
                  <dt class="text-[11px] uppercase tracking-[0.15em] text-misana-muted mb-0.5">
                    {{ t('access.fiche.field.hours') }}
                  </dt>
                  <dd>{{ practicalHours }}</dd>
                </div>
                <div v-if="practicalDress" class="flex flex-col">
                  <dt class="text-[11px] uppercase tracking-[0.15em] text-misana-muted mb-0.5">
                    {{ t('access.fiche.field.dressCode') }}
                  </dt>
                  <dd>{{ practicalDress }}</dd>
                </div>
              </dl>
            </div>
          </div>

          <!-- Notes from our team -->
          <div v-if="teamNotes" class="border-t border-misana-line pt-10">
            <h2 class="font-display text-2xl mb-4">{{ t('access.fiche.teamNotes') }}</h2>
            <p class="text-misana-ink leading-relaxed italic max-w-3xl">{{ teamNotes }}</p>
          </div>

          <!-- How we handle -->
          <div class="border-t border-misana-line pt-10">
            <h2 class="font-display text-2xl mb-5">{{ t('access.fiche.howWeHandle') }}</h2>
            <ul class="space-y-3 text-misana-ink leading-relaxed">
              <li class="flex gap-3">
                <span class="text-misana-muted mt-2">·</span>
                <span>{{ t('access.fiche.how.1') }}</span>
              </li>
              <li class="flex gap-3">
                <span class="text-misana-muted mt-2">·</span>
                <span>{{ t('access.fiche.how.2') }}</span>
              </li>
              <li class="flex gap-3">
                <span class="text-misana-muted mt-2">·</span>
                <span>{{ t('access.fiche.how.3') }}</span>
              </li>
              <li class="flex gap-3">
                <span class="text-misana-muted mt-2">·</span>
                <span>{{ t('access.fiche.how.4') }}</span>
              </li>
            </ul>
          </div>

          <!-- FAQ -->
          <div v-if="faqList.length" class="border-t border-misana-line pt-10">
            <h2 class="font-display text-2xl mb-5">{{ t('access.fiche.faq') }}</h2>
            <div class="divide-y divide-misana-line">
              <details
                v-for="(item, i) in faqList"
                :key="i"
                class="group py-4"
              >
                <summary class="flex items-center justify-between cursor-pointer list-none">
                  <span class="text-[15px] font-medium pr-4">{{ item.question }}</span>
                  <span class="text-misana-muted text-lg leading-none transition-transform group-open:rotate-45">+</span>
                </summary>
                <p class="mt-3 text-sm text-misana-ink/85 leading-relaxed">{{ item.answer }}</p>
              </details>
            </div>
          </div>
        </article>

        <!-- Sticky reservation widget -->
        <aside class="lg:col-span-4">
          <AccessReservationWidget
            :slug="e.slug"
            :name="e.name"
            :city="e.city"
            :category="e.category"
            :min-guests="detail.reservation.minGuests"
            :max-guests="detail.reservation.maxGuests"
            :lead-time-hours="detail.reservation.leadTimeHours"
            :service-options="detail.reservation.serviceOptions"
            variant="sticky"
          />
        </aside>
      </div>
    </section>

    <!-- Maillage -->
    <section v-if="related.length" class="border-t border-misana-line">
      <div class="max-w-[1600px] mx-auto px-6 sm:px-12 py-14 sm:py-20">
        <h2 class="font-display text-3xl sm:text-4xl mb-8">{{ t('access.fiche.relatedTitle') }}</h2>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <NuxtLink
            v-for="other in related"
            :key="other.slug"
            :to="localePath({ name: 'access-establishment', params: { establishment: other.slug } })"
            class="related-card group"
          >
            <div class="aspect-[4/3] bg-misana-stone overflow-hidden">
              <img
                v-if="other.hero"
                :src="other.hero"
                :alt="other.name"
                loading="lazy"
                class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              />
            </div>
            <div class="pt-4">
              <p class="text-[10px] uppercase tracking-[0.2em] text-misana-muted mb-1">
                {{ t(`access.cat.${other.category}`) }} ·
                {{ CITIES.find((c) => c.slug === other.city)?.[lng] }}
              </p>
              <h3 class="font-display text-xl">{{ other.name }}</h3>
            </div>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Footer CTA -->
    <section class="bg-misana-stone border-t border-misana-line">
      <div class="max-w-[640px] mx-auto px-6 py-14 sm:py-20 text-center">
        <p class="text-[11px] uppercase tracking-[0.25em] text-misana-muted mb-4">
          {{ t('access.fiche.footerKicker') }}
        </p>
        <h2 class="font-display text-3xl sm:text-4xl mb-8">
          {{ t('access.fiche.reservationTitle', { name: e.name }) }}
        </h2>
        <NuxtLink
          :to="localePath({ path: '/request', query: { service: 'access', establishment: e.slug, city: e.city } })"
          class="inline-flex items-center gap-3 px-7 py-3.5 bg-misana-ink text-misana-paper text-sm tracking-wide rounded-[4px] hover:opacity-90 transition group"
        >
          <span>{{ t('access.fiche.reservationSubmit') }}</span>
          <span class="transition-transform duration-500 group-hover:translate-x-1">→</span>
        </NuxtLink>
      </div>
    </section>
  </main>
</template>

<style scoped>
details summary::-webkit-details-marker { display: none; }
</style>
