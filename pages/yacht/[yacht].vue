<script setup lang="ts">
// Fiche produit yacht, structure copee Excellence Riviera :
// - Hero galerie + titre + specs grid + tier prix + CTA
// - Description longue (bodyEn/Fr)
// - Detail cabines (master/VIP/double/twin/convertible)
// - Amenities pictogrammes
// - Charter conditions (APA, VAT, fuel, deposit)
// - What is included + ports disponibles + cruising areas
// - Form embedded preset yacht + yachtId
// - Cross-link 3 yachts meme bracket
import { YACHT_AMENITY_LABELS, type YachtCabinConfig } from '~/lib/yachts';
import { useYacht, useYachts } from '~/composables/useYachts';
import { CITIES } from '~/lib/constants';

definePageMeta({ layout: 'default' });
defineI18nRoute({
  paths: { en: '/yacht-charter/[yacht]', fr: '/location-yacht/[yacht]' },
});

const route = useRoute();
const { locale, t } = useI18n();
const localePath = useLocalePath();
const slug = computed(() => String(route.params.yacht));

const { yacht: y } = await useYacht(slug.value);
if (!y.value) {
  throw createError({ statusCode: 404, statusMessage: 'Yacht not found', fatal: true });
}

const yacht = y.value;
const { yachts: YACHTS_REF } = useYachts();

useSeoMeta({
  title: () => `${yacht.name} · ${yacht.fullName}`,
  description: () =>
    locale.value === 'fr'
      ? `Charter ${yacht.fullName}. ${yacht.lengthM} metres, ${yacht.guests} personnes, ${yacht.cabins} cabines, ${yacht.crew} equipage. A partir de ${yacht.pricePerWeekFrom} EUR par semaine.`
      : `Charter ${yacht.fullName}. ${yacht.lengthM} metres, ${yacht.guests} guests, ${yacht.cabins} cabins, ${yacht.crew} crew. From ${yacht.pricePerWeekFrom} EUR per week.`,
  ogImage: yacht.hero,
  ogTitle: () => `${yacht.name} · ${yacht.fullName} · Misana`,
  twitterImage: yacht.hero,
});

useHead({
  script: [{
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: yacht.fullName,
      serviceType: 'Yacht Charter',
      provider: { '@type': 'Organization', name: 'Misana' },
      areaServed: ['French Riviera', 'Corsica', 'Sardinia'],
      image: yacht.images,
      offers: {
        '@type': 'Offer',
        priceCurrency: 'EUR',
        price: yacht.pricePerWeekFrom,
        priceSpecification: yacht.pricePerDay
          ? { '@type': 'UnitPriceSpecification', price: yacht.pricePerDay, priceCurrency: 'EUR', unitCode: 'DAY' }
          : { '@type': 'UnitPriceSpecification', price: yacht.pricePerWeekFrom, priceCurrency: 'EUR', unitCode: 'WEE' },
        availability: 'https://schema.org/InStock',
      },
    }),
  }],
});

const idx = ref(0);
const total = computed(() => yacht.images.length);
function prev() { idx.value = (idx.value - 1 + total.value) % total.value; }
function next() { idx.value = (idx.value + 1) % total.value; }

// Lightbox plein ecran : ouvert au clic sur le hero ou une vignette
// de la grille. Navigation clavier + swipe + zoom 2x au clic.
const lightboxOpen = ref(false);
const lightboxZoom = ref(false);
function openLightbox(i = idx.value) {
  idx.value = i;
  lightboxZoom.value = false;
  lightboxOpen.value = true;
  if (typeof document !== 'undefined') document.body.style.overflow = 'hidden';
}
function closeLightbox() {
  lightboxOpen.value = false;
  lightboxZoom.value = false;
  if (typeof document !== 'undefined') document.body.style.overflow = '';
}
function toggleZoom() { lightboxZoom.value = !lightboxZoom.value; }

let touchStartX = 0;
function onTouchStart(e: TouchEvent) { touchStartX = (e.changedTouches[0]?.screenX ?? 0); }
function onTouchEnd(e: TouchEvent) {
  if (total.value <= 1) return;
  const dx = (e.changedTouches[0]?.screenX ?? 0) - touchStartX;
  if (Math.abs(dx) < 40) return;
  dx < 0 ? next() : prev();
}

// Keyboard nav (actif uniquement quand lightbox ouvert)
function onKey(e: KeyboardEvent) {
  if (!lightboxOpen.value) return;
  if (e.key === 'Escape') closeLightbox();
  else if (e.key === 'ArrowLeft') prev();
  else if (e.key === 'ArrowRight') next();
}
onMounted(() => { if (typeof window !== 'undefined') window.addEventListener('keydown', onKey); });
onBeforeUnmount(() => { if (typeof window !== 'undefined') window.removeEventListener('keydown', onKey); });

function fmtPrice(p: number | null): string {
  if (p === null) return t('yacht.onRequest');
  return new Intl.NumberFormat(locale.value === 'fr' ? 'fr-FR' : 'en-GB', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(p);
}

const sameSize = computed(() =>
  YACHTS_REF.value.filter((x) => x.size === yacht.size && x.id !== yacht.id).slice(0, 3),
);

const portsObj = computed(() =>
  yacht.ports.map((s) => CITIES.find((c) => c.slug === s)).filter(Boolean) as typeof CITIES[number][],
);

const cabinBreakdown = computed(() => {
  const types: (keyof YachtCabinConfig)[] = ['master', 'vip', 'double', 'twin', 'convertible'];
  return types
    .map((type) => ({ type, count: yacht.cabinDetail[type] }))
    .filter((entry) => entry.count > 0);
});

const breadcrumb = computed(() => [
  { label: 'Misana', to: '/' },
  { label: t('yacht.kicker'), to: { name: 'yacht' } },
  { label: t('yacht.allTitle'), to: { name: 'yacht-all' } },
  { label: yacht.name },
]);
</script>

<template>
  <main class="min-h-screen">
    <!-- Sticky back link + breadcrumb -->
    <section class="sticky top-16 z-30 bg-misana-paper/95 backdrop-blur-sm border-b border-misana-line">
      <div class="max-w-[1600px] mx-auto px-6 sm:px-12 py-3 flex items-center justify-between gap-4 flex-wrap">
        <NuxtLink
          :to="localePath({ name: 'yacht-all' })"
          class="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-misana-muted hover:text-misana-ink transition group"
        >
          <span class="inline-flex items-center justify-center w-4 h-4 transition-transform duration-500 group-hover:-translate-x-1">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" class="block w-full h-full">
              <path d="M17 12H7" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
              <path d="M10.5 8.5L7 12L10.5 15.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </span>
          <span>{{ t('yacht.fiche.backToFleet') }}</span>
        </NuxtLink>
        <Breadcrumb :items="breadcrumb" class="hidden sm:block" />
      </div>
    </section>

    <!-- Hero : 6/6 cols, image stretched + thumbs no-wrap, specs 3-col, tarifs degressifs, CTA /request -->
    <section class="border-b border-misana-line">
      <div class="max-w-[1600px] mx-auto px-6 sm:px-12 py-12 grid lg:grid-cols-12 gap-10 sm:gap-12">
        <div class="lg:col-span-6 flex flex-col gap-3 self-stretch min-w-0">
          <!-- Main image stretched : click = lightbox fullscreen -->
          <div
            class="flex-1 relative overflow-hidden bg-misana-stone min-h-[420px] select-none cursor-zoom-in group"
            @touchstart.passive="onTouchStart"
            @touchend.passive="onTouchEnd"
            @click="openLightbox()"
          >
            <img
              v-for="(src, i) in yacht.images"
              :key="`hero-${src}`"
              :src="src"
              :alt="`${yacht.name} (${i + 1}/${total})`"
              :loading="i === 0 ? 'eager' : 'lazy'"
              class="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
              :class="i === idx ? 'opacity-100' : 'opacity-0'"
              draggable="false"
            />
            <!-- Counter mobile -->
            <div v-if="total > 1" class="absolute bottom-3 right-3 px-2.5 py-1 text-[11px] tracking-wider bg-misana-ink/70 text-misana-paper backdrop-blur-sm">{{ idx + 1 }} / {{ total }}</div>
            <!-- Hint expand visible au hover -->
            <div class="absolute top-3 left-3 px-2.5 py-1 text-[10px] uppercase tracking-widest bg-misana-ink/70 text-misana-paper backdrop-blur-sm opacity-0 group-hover:opacity-100 transition inline-flex items-center gap-2">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" class="block w-3.5 h-3.5">
                <path d="M3 9V3H9M15 3H21V9M21 15V21H15M9 21H3V15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
              </svg>
              <span>{{ t('cars.fiche.expandImage') || 'View larger' }}</span>
            </div>
            <!-- Prev / Next visibles au hover desktop -->
            <button
              v-if="total > 1"
              type="button"
              :aria-label="t('cars.fiche.prevImage') || 'Previous'"
              class="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 items-center justify-center bg-misana-paper/85 hover:bg-misana-paper text-misana-ink opacity-0 group-hover:opacity-100 transition"
              @click.stop="prev"
            >
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" class="block w-4 h-4">
                <path d="M15 6L9 12L15 18" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>
            <button
              v-if="total > 1"
              type="button"
              :aria-label="t('cars.fiche.nextImage') || 'Next'"
              class="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 items-center justify-center bg-misana-paper/85 hover:bg-misana-paper text-misana-ink opacity-0 group-hover:opacity-100 transition"
              @click.stop="next"
            >
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" class="block w-4 h-4">
                <path d="M9 6L15 12L9 18" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>
          </div>

          <!-- Thumbnails 5+1 tile "View all" si plus de 6 images.
               Peu d'images = on les etire sur toute la largeur (1 col = 1 thumb). -->
          <div
            v-if="total > 1"
            class="grid gap-2"
            :class="[
              total === 2 ? 'grid-cols-2' :
              total === 3 ? 'grid-cols-3' :
              total === 4 ? 'grid-cols-4' :
              total === 5 ? 'grid-cols-5' :
              'grid-cols-3 sm:grid-cols-6'
            ]"
          >
            <button
              v-for="(src, i) in (total > 6 ? yacht.images.slice(0, 5) : yacht.images)"
              :key="`thumb-${src}`"
              type="button"
              :aria-label="`View image ${i + 1}`"
              :aria-selected="i === idx"
              class="relative aspect-[3/2] overflow-hidden bg-misana-stone border transition"
              :class="i === idx ? 'border-misana-ink' : 'border-misana-line hover:border-misana-ink/60'"
              @click="idx = i"
            >
              <img :src="src" :alt="`${yacht.name} thumbnail ${i + 1}`" loading="lazy" class="absolute inset-0 w-full h-full object-cover" />
            </button>
            <button
              v-if="total > 6"
              type="button"
              :aria-label="t('cars.fiche.viewAllPhotos') || 'View all photos'"
              class="relative aspect-[3/2] overflow-hidden bg-misana-stone border border-misana-line hover:border-misana-ink transition group"
              @click="openLightbox(5)"
            >
              <img :src="yacht.images[5]" :alt="`${yacht.name} more photos`" loading="lazy" class="absolute inset-0 w-full h-full object-cover" />
              <div class="absolute inset-0 bg-misana-ink/70 group-hover:bg-misana-ink/80 transition flex flex-col items-center justify-center gap-1 text-misana-paper">
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" class="block w-5 h-5">
                  <path d="M3 9V3H9M15 3H21V9M21 15V21H15M9 21H3V15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
                </svg>
                <span class="text-xs uppercase tracking-widest">+{{ total - 5 }}</span>
              </div>
            </button>
          </div>
        </div>

        <div class="lg:col-span-6 flex flex-col">
          <p class="text-xs uppercase tracking-widest text-misana-muted mb-3">
            {{ yacht.builder }} · {{ yacht.year }}
          </p>
          <h1 class="font-display text-3xl sm:text-4xl mb-1">{{ yacht.name }}</h1>
          <p class="text-misana-muted mb-8">{{ yacht.fullName }}</p>

          <!-- Specs grid 3 cols (2 cols mobile pour eviter le squeeze) -->
          <dl class="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-10">
            <div class="border border-misana-line p-4">
              <dt class="text-[10px] uppercase tracking-widest text-misana-muted">{{ t('yacht.length') }}</dt>
              <dd class="font-sans text-2xl mt-1 tabular-nums">{{ yacht.lengthM }} <span class="text-sm">m</span></dd>
            </div>
            <div class="border border-misana-line p-4">
              <dt class="text-[10px] uppercase tracking-widest text-misana-muted">{{ t('yacht.guests') }}</dt>
              <dd class="font-sans text-2xl mt-1 tabular-nums">{{ yacht.guests }}</dd>
            </div>
            <div class="border border-misana-line p-4">
              <dt class="text-[10px] uppercase tracking-widest text-misana-muted">{{ t('yacht.cabins') }}</dt>
              <dd class="font-sans text-2xl mt-1 tabular-nums">{{ yacht.cabins }}</dd>
            </div>
            <div class="border border-misana-line p-4">
              <dt class="text-[10px] uppercase tracking-widest text-misana-muted">{{ t('yacht.crew') }}</dt>
              <dd class="font-sans text-xl mt-1 tabular-nums">{{ yacht.crew }}</dd>
            </div>
            <div class="border border-misana-line p-4">
              <dt class="text-[10px] uppercase tracking-widest text-misana-muted">{{ t('yacht.cruisingSpeed') }}</dt>
              <dd class="font-sans text-xl mt-1 tabular-nums">{{ yacht.cruisingKnots }} <span class="text-sm">kn</span></dd>
            </div>
            <div class="border border-misana-line p-4">
              <dt class="text-[10px] uppercase tracking-widest text-misana-muted">{{ t('yacht.fiche.maxSpeed') }}</dt>
              <dd class="font-sans text-xl mt-1 tabular-nums">{{ yacht.maxKnots }} <span class="text-sm">kn</span></dd>
            </div>
          </dl>

          <!-- Tarifs charter -->
          <div class="border border-misana-line p-5 mb-8">
            <p class="text-xs uppercase tracking-widest text-misana-muted mb-4">{{ t('yacht.charterRates') }}</p>
            <dl class="space-y-2 text-sm">
              <div v-if="yacht.pricePerDay" class="flex justify-between">
                <dt class="text-misana-muted">{{ t('yacht.tierDay') }}</dt>
                <dd class="font-medium">{{ fmtPrice(yacht.pricePerDay) }} {{ t('yacht.perDayShort') }}</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-misana-muted">{{ t('yacht.tierWeekLow') }}</dt>
                <dd class="font-medium">{{ fmtPrice(yacht.pricePerWeekFrom) }} {{ t('yacht.perWeekShort') }}</dd>
              </div>
              <div v-if="yacht.pricePerWeekTo" class="flex justify-between">
                <dt class="text-misana-muted">{{ t('yacht.tierWeekHigh') }}</dt>
                <dd class="font-medium">{{ fmtPrice(yacht.pricePerWeekTo) }} {{ t('yacht.perWeekShort') }}</dd>
              </div>
            </dl>
            <p class="text-xs text-misana-muted mt-4 italic">{{ t('yacht.priceFootnote') }}</p>
          </div>

          <NuxtLink
            :to="localePath({ path: '/request', query: { service: 'yacht', yacht: yacht.id } })"
            class="border border-misana-ink px-6 py-3 text-sm tracking-wide hover:bg-misana-ink hover:text-misana-paper transition text-center"
          >
            {{ t('yacht.charterCta') }} →
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- About + Configuration combinees, 2 cols equilibrees stretch -->
    <section class="max-w-[1600px] mx-auto px-6 sm:px-12 py-16 border-t border-misana-line">
      <div class="grid lg:grid-cols-2 gap-12 lg:gap-16 items-stretch">
        <!-- Left : about + ports + zones de croisiere (chips poussees en bas) -->
        <div class="flex flex-col">
          <h2 class="font-display text-2xl mb-4">{{ t('yacht.fiche.aboutSection') }}</h2>
          <p class="text-misana-muted leading-relaxed">{{ locale === 'fr' ? yacht.bodyFr : yacht.bodyEn }}</p>

          <div class="grid sm:grid-cols-2 gap-8 mt-auto pt-10">
            <div>
              <h3 class="font-display text-base mb-4">{{ t('yacht.fiche.portsSection') }}</h3>
              <ul class="flex flex-col gap-2">
                <li v-for="p in portsObj" :key="p.slug" class="text-xs border border-misana-line px-3 py-1.5 text-center">
                  {{ locale === 'fr' ? p.fr : p.en }}
                </li>
              </ul>
            </div>
            <div>
              <h3 class="font-display text-base mb-4">{{ t('yacht.fiche.cruisingSection') }}</h3>
              <ul class="flex flex-col gap-2">
                <li v-for="area in yacht.cruisingAreas" :key="area" class="text-xs border border-misana-line px-3 py-1.5 text-center">
                  {{ t(`yacht.fiche.cruisingArea.${area}`) }}
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Right : configuration cabines + amenities (amenities poussees en bas) -->
        <div class="flex flex-col">
          <h2 class="font-display text-2xl mb-6">{{ t('yacht.fiche.cabinSection') }}</h2>
          <dl class="space-y-3 text-sm">
            <div
              v-for="cabin in cabinBreakdown"
              :key="cabin.type"
              class="flex justify-between border-b border-misana-line pb-3 pt-1"
            >
              <dt class="text-misana-muted">{{ t(`yacht.fiche.cabin.${cabin.type}`) }}</dt>
              <dd>{{ cabin.count }}</dd>
            </div>
            <div class="flex justify-between border-b border-misana-line pb-3 pt-1">
              <dt class="text-misana-muted">{{ t('yacht.fiche.totalGuests') }}</dt>
              <dd>{{ yacht.guests }}</dd>
            </div>
            <div class="flex justify-between border-b border-misana-line pb-3 pt-1">
              <dt class="text-misana-muted">{{ t('yacht.fiche.crewOnboard') }}</dt>
              <dd>{{ yacht.crew }}</dd>
            </div>
          </dl>

          <div class="mt-auto pt-10">
            <h3 class="font-display text-base mb-4">{{ t('yacht.fiche.amenitiesSection') }}</h3>
            <ul class="grid grid-cols-2 gap-2">
              <li
                v-for="a in yacht.amenities"
                :key="a"
                class="text-xs border border-misana-line px-3 py-1.5 inline-flex items-center gap-2"
              >
                <span class="text-misana-ink" aria-hidden="true">·</span>
                {{ locale === 'fr' ? YACHT_AMENITY_LABELS[a].fr : YACHT_AMENITY_LABELS[a].en }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- Yachts similaires : design ccg listing -->
    <section v-if="sameSize.length" class="max-w-[1600px] mx-auto px-6 sm:px-12 py-16 border-t border-misana-line">
      <h2 class="font-display text-2xl mb-8">{{ t('yacht.relatedSection') }}</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        <NuxtLink
          v-for="other in sameSize"
          :key="other.id"
          :to="localePath({ name: 'yacht-yacht', params: { yacht: other.id } })"
          class="ccg group"
        >
          <div class="ccg-image-wrap">
            <img :src="other.hero" :alt="other.fullName" loading="lazy" class="ccg-image" />
            <span v-if="other.badge" class="ccg-badge">{{ t(`request.fleet.badge.${other.badge}`) }}</span>
            <span class="card-cue" aria-hidden="true">
              <svg viewBox="0 0 20 20" fill="none" class="block w-5 h-5">
                <path d="M6 14L14 6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
                <path d="M7 6H14V13" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </span>
          </div>
          <div class="ccg-title-wrap">
            <span class="ccg-logo" aria-hidden="true">{{ other.builder.charAt(0).toUpperCase() }}</span>
            <div class="ccg-title-block">
              <h3 class="ccg-title">{{ other.fullName }}</h3>
              <p class="ccg-details">
                <span>{{ other.year }}</span>
                <span class="ccg-dot" aria-hidden="true"></span>
                <span>{{ other.lengthM }} m</span>
                <span class="ccg-dot" aria-hidden="true"></span>
                <span>{{ other.guests }} {{ t('yacht.guestsShort') }}</span>
              </p>
            </div>
          </div>
          <div class="ccg-price-wrap">
            <span class="ccg-tag">{{ other.cabins }} {{ t('yacht.cabinsShort') }}</span>
            <div class="ccg-price">
              <template v-if="other.pricePerDay">
                <span class="ccg-price-value">{{ fmtPrice(other.pricePerDay) }}</span>
                <span class="ccg-price-unit">{{ t('yacht.perDayShort') }}</span>
              </template>
              <template v-else>
                <span class="ccg-price-value">{{ fmtPrice(other.pricePerWeekFrom) }}</span>
                <span class="ccg-price-unit">{{ t('yacht.perWeekShort') }}</span>
              </template>
            </div>
          </div>
        </NuxtLink>
      </div>
    </section>

    <!-- LIGHTBOX plein ecran : ouvert au clic sur hero ou grille -->
    <Teleport to="body">
      <div
        v-if="lightboxOpen"
        class="fixed inset-0 z-[100] bg-misana-ink/95 backdrop-blur-sm flex items-center justify-center"
        role="dialog"
        aria-modal="true"
        @touchstart.passive="onTouchStart"
        @touchend.passive="onTouchEnd"
      >
        <div
          class="relative w-full h-full flex items-center justify-center p-4 sm:p-12 overflow-auto"
          :class="lightboxZoom ? 'cursor-zoom-out' : 'cursor-zoom-in'"
          @click.self="closeLightbox"
        >
          <img
            :src="yacht.images[idx]"
            :alt="`${yacht.name} (${idx + 1}/${total})`"
            class="transition-transform duration-300 select-none"
            :class="lightboxZoom ? 'max-w-none scale-150 origin-center' : 'max-w-full max-h-full object-contain'"
            draggable="false"
            @click.stop="toggleZoom"
          />
        </div>

        <button
          type="button"
          :aria-label="t('cars.fiche.closeImage') || 'Close'"
          class="absolute top-5 right-5 w-11 h-11 inline-flex items-center justify-center bg-misana-paper text-misana-ink hover:opacity-90 transition"
          @click="closeLightbox"
        >
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" class="block w-5 h-5">
            <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
          </svg>
        </button>

        <button
          v-if="total > 1"
          type="button"
          :aria-label="t('cars.fiche.prevImage') || 'Previous'"
          class="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 w-11 h-11 inline-flex items-center justify-center bg-misana-paper/90 hover:bg-misana-paper text-misana-ink transition"
          @click.stop="prev"
        >
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" class="block w-5 h-5">
            <path d="M15 6L9 12L15 18" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
        <button
          v-if="total > 1"
          type="button"
          :aria-label="t('cars.fiche.nextImage') || 'Next'"
          class="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 w-11 h-11 inline-flex items-center justify-center bg-misana-paper/90 hover:bg-misana-paper text-misana-ink transition"
          @click.stop="next"
        >
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" class="block w-5 h-5">
            <path d="M9 6L15 12L9 18" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>

        <div class="absolute bottom-5 left-1/2 -translate-x-1/2 px-3 py-1.5 text-xs tracking-wider text-misana-paper">
          {{ idx + 1 }} / {{ total }}
        </div>
      </div>
    </Teleport>
  </main>
</template>

<style scoped>
/* === Cards similaires : design ccg port de yacht/all === */
.card-cue {
  position: absolute;
  bottom: 14px;
  right: 14px;
  width: 46px;
  height: 46px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--color-misana-ink);
  color: var(--color-misana-paper);
  border-radius: 4px;
  opacity: 0;
  transform: translateY(8px);
  transition: opacity 0.4s ease, transform 0.55s cubic-bezier(0.16, 1, 0.3, 1);
  pointer-events: none;
}
.ccg:hover .card-cue { opacity: 1; transform: translateY(0); }

.ccg {
  display: flex;
  flex-direction: column;
  gap: 24px;
  background: var(--color-misana-paper);
  border: 1px solid var(--color-misana-line);
  border-radius: 6px;
  padding: 24px;
  text-decoration: none;
  color: var(--color-misana-ink);
  overflow: hidden;
  transition: border-color 0.4s ease, box-shadow 0.4s ease;
}
.ccg:hover {
  border-color: var(--color-misana-ink);
  box-shadow: 0 12px 28px -20px rgba(0, 0, 0, 0.18);
}
.ccg-image-wrap {
  position: relative;
  width: 100%;
  height: 216px;
  overflow: hidden;
  border-radius: 4px;
  background: var(--color-misana-paper);
}
.ccg-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 1.1s cubic-bezier(0.16, 1, 0.3, 1);
}
.ccg:hover .ccg-image { transform: scale(1.04); }
.ccg-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  font-size: 0.6rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  padding: 0.35rem 0.7rem;
  background: var(--color-misana-paper);
  color: var(--color-misana-ink);
  border-radius: 4px;
}
.ccg-title-wrap {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  width: 100%;
}
.ccg-logo {
  flex: 0 0 auto;
  width: 46px;
  height: 46px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--color-misana-line);
  border-radius: 4px;
  font-family: var(--font-display, serif);
  font-size: 1.1rem;
  color: var(--color-misana-ink);
  background: var(--color-misana-paper);
}
.ccg-title-block { flex: 1 0 0; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.ccg-title {
  font-family: var(--font-display, serif);
  font-size: 1.05rem;
  font-weight: 500;
  line-height: 1.25;
  margin: 0;
  color: var(--color-misana-ink);
  word-break: break-word;
}
.ccg-details {
  margin: 4px 0 0;
  font-size: 0.78rem;
  color: var(--color-misana-muted);
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}
.ccg-dot {
  width: 3px;
  height: 3px;
  border-radius: 99px;
  background: currentColor;
  opacity: 0.55;
}
.ccg-price-wrap {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
}
.ccg-tag {
  font-size: 0.78rem;
  color: var(--color-misana-ink);
  padding: 5px 14px;
  background: var(--color-misana-paper);
  border: 1px solid var(--color-misana-line);
  border-radius: 4px;
  white-space: nowrap;
}
.ccg-price {
  display: inline-flex;
  align-items: baseline;
  gap: 6px;
  padding-left: 24px;
  white-space: nowrap;
}
.ccg-price-value {
  font-family: var(--font-display, serif);
  font-size: 1.4rem;
  line-height: 1;
  color: var(--color-misana-ink);
}
.ccg-price-unit {
  font-size: 0.72rem;
  color: var(--color-misana-muted);
}
</style>
