<script setup lang="ts">
// Fiche transfert dynamique : URL = /transfers/[mode]/[route].
// mode = 'chauffeur' | 'helicopter'. Le slug doit exister dans TRANSFERS et le mode
// doit etre compatible avec celui declare dans la route ('chauffeur', 'helicopter', 'both').
//
// Pattern : meme architecture que la fiche access (sticky back, title section,
// hero+thumbs, grid 8/4 contenu+widget sticky, maillage, footer CTA).
import { TRANSFERS, CITIES } from '~/lib/constants';
import { getTransferDetail, getStubDetail } from '~/lib/transferDetails';

definePageMeta({ layout: 'default' });

const route = useRoute();
const { locale, t } = useI18n();
const localePath = useLocalePath();

const mode = computed(() => String(route.params.mode));
const slug = computed(() => String(route.params.route));

if (!['chauffeur', 'helicopter'].includes(mode.value)) {
  throw createError({ statusCode: 404, statusMessage: 'Mode not found', fatal: true });
}

const transferEntry = TRANSFERS.find((t) => t.slug === slug.value);
if (!transferEntry) {
  throw createError({ statusCode: 404, statusMessage: 'Route not found', fatal: true });
}

// Verifie que le mode est compatible avec la route.
const allowedMode = transferEntry.mode;
if (allowedMode !== 'both' && allowedMode !== mode.value) {
  throw createError({ statusCode: 404, statusMessage: 'Mode not available for this route', fatal: true });
}

const tEntry = transferEntry;
const detail = computed(() => getTransferDetail(mode.value as 'chauffeur' | 'helicopter', slug.value));
const stub = computed(() => getStubDetail(mode.value as 'chauffeur' | 'helicopter'));
const fromCity = computed(() => CITIES.find((c) => c.slug === tEntry.from));
const toCity = computed(() => CITIES.find((c) => c.slug === tEntry.to));
const lng = computed<'fr' | 'en'>(() => (locale.value === 'fr' ? 'fr' : 'en'));

const fromName = computed(() => (fromCity.value ? fromCity.value[lng.value] : ''));
const toName = computed(() => (toCity.value ? toCity.value[lng.value] : ''));

const isHelico = computed(() => mode.value === 'helicopter');
const isChauffeur = computed(() => mode.value === 'chauffeur');
const isBothMode = computed(() => allowedMode === 'both');

const heroImage = computed(() => detail.value?.hero ?? stub.value.hero);
const thumbsList = computed(() => detail.value?.thumbs ?? stub.value.thumbs);
const galleryImages = computed(() => [heroImage.value, ...thumbsList.value].filter(Boolean));
const idx = ref(0);

// SEO ciblage : "helicoptere [from] [to]" / "chauffeur [from] [to]"
const seoTitle = computed(() => {
  const modeLabel = isHelico.value
    ? (locale.value === 'fr' ? 'Hélicoptère' : 'Helicopter')
    : (locale.value === 'fr' ? 'Chauffeur' : 'Chauffeur');
  return `${modeLabel} ${fromName.value} ${toName.value} · Misana`;
});

const seoDescription = computed(() => {
  if (detail.value?.signature) return detail.value.signature[lng.value];
  return locale.value === 'fr'
    ? `Transfert ${isHelico.value ? 'en hélicoptère' : 'en chauffeur'} de ${fromName.value} à ${toName.value} avec Misana.`
    : `${isHelico.value ? 'Helicopter' : 'Chauffeur'} transfer from ${fromName.value} to ${toName.value} with Misana.`;
});

useSeoMeta({
  title: () => seoTitle.value,
  description: () => seoDescription.value,
  ogImage: () => heroImage.value,
});

useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'TouristTrip',
        name: seoTitle.value,
        description: seoDescription.value,
        itinerary: {
          '@type': 'ItemList',
          itemListElement: [
            { '@type': 'Place', name: fromName.value },
            { '@type': 'Place', name: toName.value },
          ],
        },
      }),
    },
    ...(detail.value?.faq?.length
      ? [{
          type: 'application/ld+json',
          innerHTML: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: detail.value.faq.map((f) => ({
              '@type': 'Question',
              name: f.question[lng.value],
              acceptedAnswer: { '@type': 'Answer', text: f.answer[lng.value] },
            })),
          }),
        }]
      : []),
  ],
});

// Maillage : 3 routes connectes (meme depart, meme arrivee).
const related = computed(() => {
  const others = TRANSFERS.filter((t) => t.slug !== slug.value);
  const sameFrom = others.filter((t) => t.from === tEntry.from);
  const sameTo = others.filter((t) => t.to === tEntry.to);
  const merged = [...sameFrom, ...sameTo];
  const unique = merged.filter((t, i, arr) => arr.findIndex((x) => x.slug === t.slug) === i);
  return unique.slice(0, 3);
});

// Si la route est 'both', lien vers le mode alternatif.
const alternativeMode = computed<'chauffeur' | 'helicopter' | null>(() => {
  if (allowedMode !== 'both') return null;
  return mode.value === 'chauffeur' ? 'helicopter' : 'chauffeur';
});

const breadcrumb = computed(() => [
  { label: 'Misana', to: '/' },
  {
    label: isHelico.value ? t('transfers.modeHelicopter') : t('transfers.modeChauffeur'),
    to: isHelico.value ? '/services/helicopter' : '/services/chauffeur',
  },
  { label: `${fromName.value} → ${toName.value}` },
]);

const factualLabels = computed(() => {
  const labels: string[] = [];
  if (isHelico.value && detail.value?.durationHelicopter) {
    labels.push(`${detail.value.durationHelicopter} ${locale.value === 'fr' ? 'min de vol' : 'min flight'}`);
  } else if (isChauffeur.value && detail.value?.durationChauffeur) {
    labels.push(`${detail.value.durationChauffeur} ${locale.value === 'fr' ? 'min de route' : 'min drive'}`);
  }
  if (detail.value?.distanceKm) labels.push(`${detail.value.distanceKm} km`);
  if (isHelico.value && detail.value?.aircraftType) labels.push(detail.value.aircraftType[lng.value]);
  if (isChauffeur.value && detail.value?.vehicleType) labels.push(detail.value.vehicleType[lng.value]);
  return labels;
});

const aboutText = computed(() => {
  if (detail.value?.about) return detail.value.about[lng.value];
  // Fallback generique pour stub.
  return locale.value === 'fr'
    ? `Transfert ${isHelico.value ? 'en hélicoptère' : 'en chauffeur'} de ${fromName.value} à ${toName.value}, orchestré par Misana. Notre équipe coordonne le départ, le véhicule et l\'arrivée. Réponse en moins de 24 heures.`
    : `${isHelico.value ? 'Helicopter' : 'Chauffeur'} transfer from ${fromName.value} to ${toName.value}, orchestrated by Misana. Our team coordinates departure, vehicle and arrival. Reply within 24 hours.`;
});

const hasPractical = computed(() => !!detail.value?.practical && (
  !!detail.value.heliportFrom
  || !!detail.value.heliportTo
  || !!detail.value.practical.pickup
  || !!detail.value.practical.dropoff
  || !!detail.value.practical.luggage
  || !!detail.value.practical.pax
));
</script>

<template>
  <main class="min-h-screen">
    <!-- Sticky back -->
    <section class="sticky top-16 z-30 bg-misana-paper/95 backdrop-blur-sm border-b border-misana-line">
      <div class="max-w-[1600px] mx-auto px-6 sm:px-12 py-3 flex items-center justify-between gap-4 flex-wrap">
        <NuxtLink
          :to="localePath(isHelico ? '/services/helicopter' : '/services/chauffeur')"
          class="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-misana-muted hover:text-misana-ink transition group"
        >
          <span class="inline-flex items-center justify-center w-4 h-4 transition-transform duration-500 group-hover:-translate-x-1">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" class="block w-full h-full">
              <path d="M17 12H7" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
              <path d="M10.5 8.5L7 12L10.5 15.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </span>
          <span>{{ isHelico ? t('transfers.fiche.backToHelicopter') : t('transfers.fiche.backToChauffeur') }}</span>
        </NuxtLink>
        <Breadcrumb :items="breadcrumb" class="hidden sm:block" />
      </div>
    </section>

    <!-- Title section : H1 = mot cle SEO + signature italique + labels factuels -->
    <section class="border-b border-misana-line">
      <div class="max-w-[1600px] mx-auto px-6 sm:px-12 pt-10 pb-8 sm:pt-12 sm:pb-10">
        <p class="text-[11px] uppercase tracking-[0.25em] text-misana-muted mb-3">
          {{ isHelico ? t('transfers.modeHelicopter') : t('transfers.modeChauffeur') }}
        </p>
        <h1 class="font-display text-4xl sm:text-5xl lg:text-6xl leading-[1.05] mb-4">
          {{ fromName }} → {{ toName }}
        </h1>
        <p v-if="detail?.signature" class="font-display italic text-lg sm:text-xl text-misana-ink/80 max-w-3xl mb-5 leading-snug">
          {{ detail.signature[lng] }}
        </p>
        <div class="flex flex-wrap items-center gap-x-5 gap-y-3">
          <div v-if="factualLabels.length" class="flex flex-wrap gap-2">
            <span
              v-for="(label, i) in factualLabels"
              :key="i"
              class="inline-flex items-center px-2.5 py-1 text-[11px] border border-misana-line text-misana-ink rounded-[4px]"
            >
              {{ label }}
            </span>
          </div>
          <NuxtLink
            v-if="alternativeMode"
            :to="localePath(`/transfers/${alternativeMode}/${slug}`)"
            class="text-xs text-misana-muted hover:text-misana-ink transition border-b border-misana-line hover:border-misana-ink pb-0.5"
          >
            {{ alternativeMode === 'helicopter' ? t('transfers.fiche.altHelico') : t('transfers.fiche.altChauffeur') }} →
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Main grid : hero + content gauche, widget sticky droite -->
    <section>
      <div class="max-w-[1600px] mx-auto px-6 sm:px-12 py-10 sm:py-12 grid lg:grid-cols-12 gap-10 lg:gap-14">
        <article class="lg:col-span-8 space-y-12">
          <!-- Hero photo + thumbs -->
          <div>
            <div class="aspect-[16/10] bg-misana-stone overflow-hidden rounded-[6px]">
              <img
                v-if="galleryImages[idx]"
                :src="galleryImages[idx]"
                :alt="`${fromName} → ${toName}`"
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
                <img :src="src" :alt="`${fromName} ${i + 1}`" class="w-full h-full object-cover" />
              </button>
            </div>
          </div>

          <!-- About + Practical -->
          <div :class="hasPractical ? 'grid sm:grid-cols-2 gap-10 items-start' : ''">
            <div>
              <h2 class="font-display text-2xl mb-4">{{ t('transfers.fiche.about') }}</h2>
              <p class="text-misana-ink leading-relaxed max-w-3xl">{{ aboutText }}</p>
            </div>

            <div v-if="hasPractical">
              <h2 class="font-display text-2xl mb-4">{{ t('transfers.fiche.practical') }}</h2>
              <dl class="text-sm space-y-3">
                <div v-if="isHelico && detail?.heliportFrom" class="flex flex-col">
                  <dt class="text-[11px] uppercase tracking-[0.15em] text-misana-muted mb-0.5">
                    {{ t('transfers.fiche.field.heliportFrom') }}
                  </dt>
                  <dd>{{ detail.heliportFrom[lng] }}</dd>
                </div>
                <div v-if="isHelico && detail?.heliportTo" class="flex flex-col">
                  <dt class="text-[11px] uppercase tracking-[0.15em] text-misana-muted mb-0.5">
                    {{ t('transfers.fiche.field.heliportTo') }}
                  </dt>
                  <dd>{{ detail.heliportTo[lng] }}</dd>
                </div>
                <div v-if="!isHelico && detail?.practical.pickup" class="flex flex-col">
                  <dt class="text-[11px] uppercase tracking-[0.15em] text-misana-muted mb-0.5">
                    {{ t('transfers.fiche.field.pickup') }}
                  </dt>
                  <dd>{{ detail.practical.pickup[lng] }}</dd>
                </div>
                <div v-if="!isHelico && detail?.practical.dropoff" class="flex flex-col">
                  <dt class="text-[11px] uppercase tracking-[0.15em] text-misana-muted mb-0.5">
                    {{ t('transfers.fiche.field.dropoff') }}
                  </dt>
                  <dd>{{ detail.practical.dropoff[lng] }}</dd>
                </div>
                <div v-if="detail?.practical.luggage" class="flex flex-col">
                  <dt class="text-[11px] uppercase tracking-[0.15em] text-misana-muted mb-0.5">
                    {{ t('transfers.fiche.field.luggage') }}
                  </dt>
                  <dd>{{ detail.practical.luggage[lng] }}</dd>
                </div>
                <div v-if="detail?.practical.pax" class="flex flex-col">
                  <dt class="text-[11px] uppercase tracking-[0.15em] text-misana-muted mb-0.5">
                    {{ t('transfers.fiche.field.pax') }}
                  </dt>
                  <dd>{{ detail.practical.pax[lng] }}</dd>
                </div>
              </dl>
            </div>
          </div>

          <!-- Notes from team -->
          <div v-if="detail?.teamNotes" class="border-t border-misana-line pt-10">
            <h2 class="font-display text-2xl mb-4">{{ t('transfers.fiche.teamNotes') }}</h2>
            <p class="text-misana-ink leading-relaxed italic max-w-3xl">{{ detail.teamNotes[lng] }}</p>
          </div>

          <!-- How we handle -->
          <div class="border-t border-misana-line pt-10">
            <h2 class="font-display text-2xl mb-5">{{ t('transfers.fiche.howWeHandle') }}</h2>
            <ul class="space-y-3 text-misana-ink leading-relaxed">
              <li v-for="i in 5" :key="i" class="flex gap-3">
                <span class="text-misana-muted mt-2">·</span>
                <span>{{ t(`transfers.fiche.how.${isHelico ? 'helicopter' : 'chauffeur'}.${i}`) }}</span>
              </li>
            </ul>
          </div>

          <!-- FAQ -->
          <div v-if="detail?.faq?.length" class="border-t border-misana-line pt-10">
            <h2 class="font-display text-2xl mb-5">{{ t('transfers.fiche.faq') }}</h2>
            <div class="divide-y divide-misana-line">
              <details
                v-for="(item, i) in detail.faq"
                :key="i"
                class="group py-4"
              >
                <summary class="flex items-center justify-between cursor-pointer list-none">
                  <span class="text-[15px] font-medium pr-4">{{ item.question[lng] }}</span>
                  <span class="text-misana-muted text-lg leading-none transition-transform group-open:rotate-45">+</span>
                </summary>
                <p class="mt-3 text-sm text-misana-ink/85 leading-relaxed">{{ item.answer[lng] }}</p>
              </details>
            </div>
          </div>
        </article>

        <!-- Sticky reservation widget -->
        <aside class="lg:col-span-4">
          <TransferReservationWidget
            :slug="slug"
            :mode="mode"
            :from-city="tEntry.from"
            :to-city="tEntry.to"
            :from-name="fromName"
            :to-name="toName"
            variant="sticky"
          />
        </aside>
      </div>
    </section>

    <!-- Maillage 3 routes connexes -->
    <section v-if="related.length" class="border-t border-misana-line">
      <div class="max-w-[1600px] mx-auto px-6 sm:px-12 py-14 sm:py-20">
        <h2 class="font-display text-3xl sm:text-4xl mb-8">{{ t('transfers.fiche.relatedTitle') }}</h2>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <NuxtLink
            v-for="other in related"
            :key="other.slug"
            :to="localePath(`/transfers/${other.mode === 'helicopter' ? 'helicopter' : 'chauffeur'}/${other.slug}`)"
            class="group"
          >
            <div class="aspect-[4/3] bg-misana-stone overflow-hidden">
              <img
                :src="getStubDetail(other.mode === 'helicopter' ? 'helicopter' : 'chauffeur').hero"
                :alt="other[lng]"
                loading="lazy"
                class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              />
            </div>
            <div class="pt-4">
              <p class="text-[10px] uppercase tracking-[0.2em] text-misana-muted mb-1">
                {{ other.mode === 'helicopter' ? t('transfers.modeHelicopter') : t('transfers.modeChauffeur') }}
              </p>
              <h3 class="font-display text-xl">{{ other[lng] }}</h3>
            </div>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Footer CTA -->
    <section class="bg-misana-stone border-t border-misana-line">
      <div class="max-w-[640px] mx-auto px-6 py-14 sm:py-20 text-center">
        <p class="text-[11px] uppercase tracking-[0.25em] text-misana-muted mb-4">
          {{ t('transfers.fiche.footerKicker') }}
        </p>
        <h2 class="font-display text-3xl sm:text-4xl mb-8">
          {{ fromName }} → {{ toName }}
        </h2>
        <NuxtLink
          :to="localePath({ path: '/request', query: { service: isHelico ? 'helicopter' : 'chauffeur', from: tEntry.from, to: tEntry.to } })"
          class="inline-flex items-center gap-3 px-7 py-3.5 bg-misana-ink text-misana-paper text-sm tracking-wide rounded-[4px] hover:opacity-90 transition group"
        >
          <span>{{ t('transfers.fiche.cta') }}</span>
          <span class="transition-transform duration-500 group-hover:translate-x-1">→</span>
        </NuxtLink>
      </div>
    </section>
  </main>
</template>

<style scoped>
details summary::-webkit-details-marker { display: none; }
</style>
