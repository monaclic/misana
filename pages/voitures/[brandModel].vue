<script setup lang="ts">
// Fiche produit voiture rental, structure copee Excellence Riviera :
// - Hero galerie + titre + specs grid + tier prix + CTA
// - Description longue (bodyEn/Fr)
// - Specs detaillees (year, fuel, hp, top, transmission, seats)
// - Conditions de location (caution, age, km, overage)
// - What is included (delivery, insurance, concierge)
// - Available cities Riviera Misana
// - Cross-link 3 voitures meme categorie
import { CITIES } from '~/lib/constants';
import { useRentalCar, useRentalCars } from '~/composables/useRentalCars';

definePageMeta({ layout: 'default' });
defineI18nRoute({
  paths: {
    en: '/luxury-cars/[brandModel]',
    fr: '/voitures/[brandModel]',
  },
});

const route = useRoute();
const { locale, t } = useI18n();
const localePath = useLocalePath();
const slug = computed(() => String(route.params.brandModel));

// Fiche : pas de CTA header ni sticky bottom (la fiche a son propre CTA).
const stickyContactVisible = useState<boolean>('sticky-contact-visible', () => true);
onMounted(() => { stickyContactVisible.value = false; });
onBeforeUnmount(() => { stickyContactVisible.value = true; });

// Fiche unique : await bloquant + 404 cote serveur si slug introuvable.
const { car } = await useRentalCar(slug.value);
if (!car.value) {
  throw createError({ statusCode: 404, statusMessage: 'Vehicle not found', fatal: true });
}
const c = car.value;
// Pour les "voitures similaires" on charge le catalogue en lazy (non
// bloquant) -> la fiche s'affiche immediatement, le bloc related
// se peuple quand le fetch arrive.
const { cars } = useRentalCars();

useSeoMeta({
  title: () => `${c.fullName} · ${t('cars.fichePart')}`,
  description: () =>
    locale.value === 'fr'
      ? `Location ${c.fullName} sur la Riviera. ${c.hp} ch, ${c.pax} places, ${c.fuelType}. A partir de ${c.prices.weekPlus} EUR par jour.`
      : `${c.fullName} rental on the Riviera. ${c.hp} hp, ${c.pax} seats, ${c.fuelType}. From ${c.prices.weekPlus} EUR per day.`,
  ogImage: c.hero,
  ogTitle: () => `${c.fullName} · Misana`,
  twitterImage: c.hero,
});

useHead({
  script: [{
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Vehicle',
      name: c.fullName,
      brand: { '@type': 'Brand', name: c.brand },
      model: c.model,
      vehicleModelDate: String(c.year),
      numberOfDoors: c.pax <= 2 ? 2 : 4,
      vehicleSeatingCapacity: c.pax,
      vehicleEngine: { '@type': 'EngineSpecification', enginePower: { '@type': 'QuantitativeValue', value: c.hp, unitCode: 'BHP' } },
      speed: { '@type': 'QuantitativeValue', value: c.topSpeedKmh, unitCode: 'KMH' },
      fuelType: c.fuelType,
      vehicleTransmission: c.transmission === 'auto' ? 'Automatic' : 'Manual',
      image: c.images,
      offers: {
        '@type': 'Offer',
        priceCurrency: 'EUR',
        price: c.prices.weekPlus,
        priceValidUntil: '2026-12-31',
        availability: 'https://schema.org/InStock',
        areaServed: c.availableCities,
      },
    }),
  }],
});

const idx = ref(0);
const total = computed(() => c.images.length);
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

// Swipe touch sur le hero et le lightbox
let touchStartX = 0;
function onTouchStart(e: TouchEvent) { touchStartX = e.changedTouches[0].screenX; }
function onTouchEnd(e: TouchEvent) {
  if (total.value <= 1) return;
  const dx = e.changedTouches[0].screenX - touchStartX;
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

function fmtPrice(p: number): string {
  return new Intl.NumberFormat(locale.value === 'fr' ? 'fr-FR' : 'en-GB', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(p);
}

const sameCategory = computed(() =>
  cars.value.filter((x) => x.category === c.category && x.id !== c.id).slice(0, 3),
);

const availableCitiesObj = computed(() =>
  c.availableCities.map((slug) => CITIES.find((ct) => ct.slug === slug)).filter(Boolean) as typeof CITIES[number][],
);

const breadcrumb = computed(() => [
  { label: 'Misana', to: '/' },
  { label: t('cars.kicker'), to: { name: 'voitures' } },
  { label: t('cars.allTitle'), to: { name: 'voitures-all' } },
  { label: c.fullName },
]);
</script>

<template>
  <main class="min-h-screen">
    <section class="sticky top-16 z-30 bg-misana-paper/95 backdrop-blur-sm border-b border-misana-line">
      <div class="max-w-[1600px] mx-auto px-6 sm:px-12 py-3 flex items-center justify-between gap-4 flex-wrap">
        <NuxtLink
          :to="localePath({ name: 'voitures-all' })"
          class="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-misana-muted hover:text-misana-ink transition group"
        >
          <span class="inline-flex items-center justify-center w-4 h-4 transition-transform duration-500 group-hover:-translate-x-1">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" class="block w-full h-full">
              <path d="M17 12H7" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
              <path d="M10.5 8.5L7 12L10.5 15.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </span>
          <span>{{ t('cars.fiche.backToFleet') }}</span>
        </NuxtLink>
        <Breadcrumb :items="breadcrumb" class="hidden sm:block" />
      </div>
    </section>

    <!-- Hero + Specs : layout cote-a-cote, click hero = lightbox fullscreen -->
    <section class="border-b border-misana-line">
      <div class="max-w-[1600px] mx-auto px-6 sm:px-12 py-12">
       <div class="grid lg:grid-cols-12 gap-10 sm:gap-12 items-stretch">
        <div class="lg:col-span-7 flex flex-col gap-3 self-stretch min-w-0">
          <!-- Hero principal : flex-1 = remplit la hauteur du grid stretch, click = lightbox -->
          <div
            class="flex-1 relative overflow-hidden bg-misana-stone select-none aspect-[3/2] lg:aspect-auto lg:min-h-[420px] cursor-zoom-in group"
            @touchstart.passive="onTouchStart"
            @touchend.passive="onTouchEnd"
            @click="openLightbox()"
          >
            <img
              v-for="(src, i) in c.images"
              :key="`hero-${src}`"
              :src="src"
              :alt="`${c.fullName} (${i + 1}/${total})`"
              :loading="i === 0 ? 'eager' : 'lazy'"
              class="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
              :class="i === idx ? 'opacity-100' : 'opacity-0'"
              draggable="false"
            />
            <!-- Counter -->
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

          <!-- Thumbnails dans la col gauche, sous le hero. 5+1 tile "Voir tout" si plus de 6. -->
          <div
            v-if="total > 1"
            class="grid gap-2"
            :class="total <= 3 ? 'grid-cols-3' : total <= 5 ? 'grid-cols-5' : 'grid-cols-3 sm:grid-cols-6'"
          >
            <button
              v-for="(src, i) in (total > 6 ? c.images.slice(0, 5) : c.images)"
              :key="`thumb-${src}`"
              type="button"
              :aria-label="`View image ${i + 1}`"
              :aria-selected="i === idx"
              class="relative aspect-[3/2] overflow-hidden bg-misana-stone border transition"
              :class="i === idx ? 'border-misana-ink' : 'border-misana-line hover:border-misana-ink/60'"
              @click="idx = i"
            >
              <img :src="src" :alt="`${c.fullName} thumbnail ${i + 1}`" loading="lazy" class="absolute inset-0 w-full h-full object-cover" />
            </button>
            <button
              v-if="total > 6"
              type="button"
              :aria-label="t('cars.fiche.viewAllPhotos')"
              class="relative aspect-[3/2] overflow-hidden bg-misana-stone border border-misana-line hover:border-misana-ink transition group"
              @click="openLightbox(5)"
            >
              <img :src="c.images[5]" :alt="`${c.fullName} more photos`" loading="lazy" class="absolute inset-0 w-full h-full object-cover" />
              <div class="absolute inset-0 bg-misana-ink/70 group-hover:bg-misana-ink/80 transition flex flex-col items-center justify-center gap-1 text-misana-paper">
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" class="block w-5 h-5">
                  <path d="M3 9V3H9M15 3H21V9M21 15V21H15M9 21H3V15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
                </svg>
                <span class="text-xs uppercase tracking-widest">+{{ total - 5 }}</span>
              </div>
            </button>
          </div>
        </div>

        <div class="lg:col-span-5 flex flex-col">
          <p class="text-xs uppercase tracking-widest text-misana-muted mb-3">{{ c.brand }}</p>
          <h1 class="font-display text-3xl sm:text-4xl mb-2">{{ c.model }}</h1>
          <p class="text-misana-muted mb-6">{{ locale === 'fr' ? c.descFr : c.desc }}</p>

          <!-- Specs grid 3 cols (2 cols mobile pour eviter le squeeze) -->
          <dl class="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-6">
            <div class="border border-misana-line p-3">
              <dt class="text-[10px] uppercase tracking-widest text-misana-muted">{{ t('request.fleet.pax') }}</dt>
              <dd class="font-sans text-xl mt-1 tabular-nums">{{ c.pax }}</dd>
            </div>
            <div class="border border-misana-line p-3">
              <dt class="text-[10px] uppercase tracking-widest text-misana-muted">{{ t('cars.fiche.power') }}</dt>
              <dd class="font-sans text-xl mt-1 tabular-nums">{{ c.hp }} <span class="text-sm">hp</span></dd>
            </div>
            <div class="border border-misana-line p-3">
              <dt class="text-[10px] uppercase tracking-widest text-misana-muted">{{ t('cars.fiche.topSpeed') }}</dt>
              <dd class="font-sans text-xl mt-1 tabular-nums">{{ c.topSpeedKmh }} <span class="text-sm">km/h</span></dd>
            </div>
            <div class="border border-misana-line p-3">
              <dt class="text-[10px] uppercase tracking-widest text-misana-muted">{{ t('cars.fiche.transmission') }}</dt>
              <dd class="font-display text-base mt-1">{{ c.transmission === 'auto' ? t('cars.fiche.automatic') : t('cars.fiche.manual') }}</dd>
            </div>
            <div class="border border-misana-line p-3">
              <dt class="text-[10px] uppercase tracking-widest text-misana-muted">{{ t('cars.fiche.fuel') }}</dt>
              <dd class="font-display text-base mt-1">{{ t(`cars.fuel.${c.fuelType}`) }}</dd>
            </div>
            <div class="border border-misana-line p-3">
              <dt class="text-[10px] uppercase tracking-widest text-misana-muted">{{ t('cars.fiche.year') }}</dt>
              <dd class="font-sans text-base mt-1 tabular-nums">{{ c.year }}</dd>
            </div>
          </dl>

          <!-- Tier prix -->
          <div class="border border-misana-line p-4 mb-6">
            <p class="text-xs uppercase tracking-widest text-misana-muted mb-3">{{ t('cars.fiche.dailyRate') }}</p>
            <dl class="space-y-2 text-sm">
              <div class="flex justify-between">
                <dt class="text-misana-muted">{{ t('cars.fiche.tier1to3') }}</dt>
                <dd class="font-medium">{{ fmtPrice(c.prices.oneToThreeDays) }} / {{ t('cars.fiche.day') }}</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-misana-muted">{{ t('cars.fiche.tier4to7') }}</dt>
                <dd class="font-medium">{{ fmtPrice(c.prices.fourToSevenDays) }} / {{ t('cars.fiche.day') }}</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-misana-muted">{{ t('cars.fiche.tier7plus') }}</dt>
                <dd class="font-medium">{{ fmtPrice(c.prices.weekPlus) }} / {{ t('cars.fiche.day') }}</dd>
              </div>
            </dl>
          </div>

          <!-- CTA pushed to bottom of right col, aligns with hero bottom -->
          <NuxtLink
            :to="localePath({ path: '/request', query: { service: 'cars', vehicle: c.id } })"
            class="mt-auto border border-misana-ink px-6 py-3 text-sm tracking-wide hover:bg-misana-ink hover:text-misana-paper transition text-center"
          >
            {{ t('cars.fiche.reserveCta') }} →
          </NuxtLink>
        </div>
       </div>
      </div>
    </section>

    <!-- About + Conditions, 2 cols equilibrees stretch -->
    <section class="max-w-[1600px] mx-auto px-6 sm:px-12 py-16 border-t border-misana-line">
      <div class="grid lg:grid-cols-2 gap-12 lg:gap-16 items-stretch">
        <!-- Left : a propos + villes disponibles -->
        <div class="flex flex-col">
          <h2 class="font-display text-2xl mb-4">{{ t('cars.fiche.aboutSection') }}</h2>
          <p class="text-misana-muted leading-relaxed">{{ locale === 'fr' ? c.bodyFr : c.bodyEn }}</p>

          <h3 class="font-display text-base mt-10 mb-4">{{ t('cars.fiche.availableSection') }}</h3>
          <ul class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            <li v-for="ct in availableCitiesObj" :key="ct.slug" class="text-xs border border-misana-line px-3 py-1.5 text-center">
              {{ locale === 'fr' ? ct.fr : ct.en }}
            </li>
          </ul>
        </div>

        <!-- Right : conditions, dl etire pour finir comme le col gauche -->
        <div class="flex flex-col">
          <h2 class="font-display text-2xl mb-6">{{ t('cars.fiche.conditionsSection') }}</h2>
          <dl class="flex-1 flex flex-col justify-between text-sm">
            <div class="flex justify-between border-b border-misana-line pb-3 pt-1">
              <dt class="text-misana-muted">{{ t('cars.fiche.securityDeposit') }}</dt>
              <dd>{{ fmtPrice(c.conditions.securityDeposit) }}</dd>
            </div>
            <div class="flex justify-between border-b border-misana-line pb-3 pt-1">
              <dt class="text-misana-muted">{{ t('cars.fiche.minDays') }}</dt>
              <dd>{{ c.conditions.minDays }} {{ t('cars.fiche.daysShort') }}</dd>
            </div>
            <div class="flex justify-between border-b border-misana-line pb-3 pt-1">
              <dt class="text-misana-muted">{{ t('cars.fiche.includedKm') }}</dt>
              <dd>{{ c.conditions.includedKmPerDay }} km / {{ t('cars.fiche.day') }}</dd>
            </div>
            <div class="flex justify-between border-b border-misana-line pb-3 pt-1">
              <dt class="text-misana-muted">{{ t('cars.fiche.overageRate') }}</dt>
              <dd>{{ fmtPrice(c.conditions.overageRatePerKm) }} / km</dd>
            </div>
          </dl>
        </div>
      </div>
    </section>

    <!-- Cross-link related : design ccg listing -->
    <section v-if="sameCategory.length" class="max-w-[1600px] mx-auto px-6 sm:px-12 py-16 border-t border-misana-line">
      <h2 class="font-display text-2xl mb-8">{{ t('cars.fiche.relatedSection') }}</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        <NuxtLink
          v-for="other in sameCategory"
          :key="other.id"
          :to="localePath({ name: 'voitures-brandModel', params: { brandModel: other.id } })"
          class="ccg group"
        >
          <div class="ccg-image-wrap">
            <img :src="other.hero" :alt="other.fullName" loading="lazy" class="ccg-image" />
            <!-- badge masque -->
            <span v-if="false" class="ccg-badge">{{ t(`cars.badge.${other.badge}`) }}</span>
            <span class="card-cue" aria-hidden="true">
              <svg viewBox="0 0 20 20" fill="none" class="block w-5 h-5">
                <path d="M6 14L14 6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
                <path d="M7 6H14V13" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </span>
          </div>
          <div class="ccg-title-wrap">
            <span class="ccg-logo" aria-hidden="true">{{ other.brand.charAt(0).toUpperCase() }}</span>
            <div class="ccg-title-block">
              <h3 class="ccg-title">{{ other.fullName }}</h3>
              <p class="ccg-details">
                <span>{{ other.year }}</span>
                <span class="ccg-dot" aria-hidden="true"></span>
                <span>{{ other.hp }} ch</span>
                <span class="ccg-dot" aria-hidden="true"></span>
                <span>{{ other.topSpeedKmh }} km/h</span>
              </p>
            </div>
          </div>
          <div class="ccg-price-wrap">
            <span class="ccg-tag">{{ other.pax }} {{ t('request.fleet.pax') }}</span>
            <div class="ccg-price">
              <span class="ccg-price-value">{{ fmtPrice(other.prices.oneToThreeDays) }}</span>
              <span class="ccg-price-unit">{{ t('cars.perDayShort') }}</span>
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
        <!-- Image full -->
        <div class="relative w-full h-full flex items-center justify-center p-4 sm:p-12 overflow-auto" :class="lightboxZoom ? 'cursor-zoom-out' : 'cursor-zoom-in'" @click.self="closeLightbox">
          <img
            :src="c.images[idx]"
            :alt="`${c.fullName} (${idx + 1}/${total})`"
            class="transition-transform duration-300 select-none"
            :class="lightboxZoom ? 'max-w-none scale-150 origin-center' : 'max-w-full max-h-full object-contain'"
            draggable="false"
            @click.stop="toggleZoom"
          />
        </div>

        <!-- Close -->
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

        <!-- Prev / Next -->
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

        <!-- Counter -->
        <div class="absolute bottom-5 left-1/2 -translate-x-1/2 px-3 py-1.5 text-xs tracking-wider text-misana-paper">
          {{ idx + 1 }} / {{ total }}
        </div>
      </div>
    </Teleport>
  </main>
</template>

<style scoped>
/* === Cards similaires : design ccg port de cars/all === */
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
