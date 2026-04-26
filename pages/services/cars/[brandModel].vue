<script setup lang="ts">
// Fiche produit voiture rental. 12 fiches V1 generees dynamiquement depuis
// lib/rentalCars.ts. Form embedded preset cars + rentalCarId locke.
import { RENTAL_CARS, findRentalCarById } from '~/lib/rentalCars';

definePageMeta({ layout: 'default' });

const route = useRoute();
const { locale, t } = useI18n();
const localePath = useLocalePath();
const slug = computed(() => String(route.params.brandModel));

const car = computed(() => findRentalCarById(slug.value));
if (!car.value) {
  throw createError({ statusCode: 404, statusMessage: 'Vehicle not found', fatal: true });
}

const c = car.value;

useSeoMeta({
  title: () => `${c.fullName} — ${t('cars.fichePart')}`,
  description: () =>
    locale.value === 'fr'
      ? `Location ${c.fullName} sur la Riviera. ${c.hp} ch, ${c.pax} places, transmission ${c.transmission}. A partir de ${c.prices.weekPlus} EUR par jour.`
      : `${c.fullName} rental on the Riviera. ${c.hp} hp, ${c.pax} seats, ${c.transmission} transmission. From ${c.prices.weekPlus} EUR per day.`,
});

const presetData = computed(() => ({
  cars: { rentalCarId: c.id },
}));

// Carousel hero
const idx = ref(0);
const total = computed(() => c.images.length);
function prev() { idx.value = (idx.value - 1 + total.value) % total.value; }
function next() { idx.value = (idx.value + 1) % total.value; }

function fmtPrice(p: number): string {
  return new Intl.NumberFormat(locale.value === 'fr' ? 'fr-FR' : 'en-GB', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(p);
}

// Cross-link : 3 autres voitures de la meme categorie
const sameCategory = computed(() =>
  RENTAL_CARS.filter((x) => x.category === c.category && x.id !== c.id).slice(0, 3),
);
</script>

<template>
  <main class="min-h-screen">
    <!-- Hero galerie + titre -->
    <section class="border-b border-misana-line">
      <div class="max-w-7xl mx-auto px-6 py-12 grid lg:grid-cols-12 gap-8">
        <!-- Gallery -->
        <div class="lg:col-span-7">
          <div class="aspect-[4/3] relative overflow-hidden bg-misana-stone group">
            <img
              v-for="(src, i) in c.images"
              :key="src"
              :src="src"
              :alt="`${c.fullName} (${i + 1}/${total})`"
              loading="lazy"
              class="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
              :class="i === idx ? 'opacity-100' : 'opacity-0'"
            />
            <button
              v-if="total > 1"
              type="button"
              aria-label="Previous image"
              class="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 inline-flex items-center justify-center bg-misana-paper/80 hover:bg-misana-paper text-misana-ink opacity-0 group-hover:opacity-100 transition"
              @click="prev"
            >‹</button>
            <button
              v-if="total > 1"
              type="button"
              aria-label="Next image"
              class="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 inline-flex items-center justify-center bg-misana-paper/80 hover:bg-misana-paper text-misana-ink opacity-0 group-hover:opacity-100 transition"
              @click="next"
            >›</button>
            <div v-if="total > 1" class="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              <button
                v-for="(_, i) in c.images"
                :key="i"
                type="button"
                :aria-label="`Image ${i + 1}`"
                class="w-2 h-2 rounded-full transition"
                :class="i === idx ? 'bg-misana-paper' : 'bg-misana-paper/50 hover:bg-misana-paper/80'"
                @click="idx = i"
              ></button>
            </div>
          </div>
        </div>

        <!-- Titre + specs + prix -->
        <div class="lg:col-span-5 flex flex-col">
          <p class="text-xs uppercase tracking-widest text-misana-muted mb-3">
            {{ c.brand }}
          </p>
          <h1 class="font-display text-3xl sm:text-4xl mb-2">{{ c.model }}</h1>
          <p class="text-misana-muted mb-8">{{ locale === 'fr' ? c.descFr : c.desc }}</p>

          <!-- Specs grid -->
          <dl class="grid grid-cols-2 gap-4 mb-10">
            <div class="border border-misana-line p-4">
              <dt class="text-[10px] uppercase tracking-widest text-misana-muted">{{ t('request.fleet.pax') }}</dt>
              <dd class="font-display text-2xl mt-1">{{ c.pax }}</dd>
            </div>
            <div class="border border-misana-line p-4">
              <dt class="text-[10px] uppercase tracking-widest text-misana-muted">{{ t('cars.fiche.power') }}</dt>
              <dd class="font-display text-2xl mt-1">{{ c.hp }} <span class="text-sm">hp</span></dd>
            </div>
            <div class="border border-misana-line p-4">
              <dt class="text-[10px] uppercase tracking-widest text-misana-muted">{{ t('cars.fiche.topSpeed') }}</dt>
              <dd class="font-display text-2xl mt-1">{{ c.topSpeedKmh }} <span class="text-sm">km/h</span></dd>
            </div>
            <div class="border border-misana-line p-4">
              <dt class="text-[10px] uppercase tracking-widest text-misana-muted">{{ t('cars.fiche.transmission') }}</dt>
              <dd class="font-display text-xl mt-1 capitalize">{{ c.transmission === 'auto' ? t('cars.fiche.automatic') : t('cars.fiche.manual') }}</dd>
            </div>
          </dl>

          <!-- Prix tiers -->
          <div class="border border-misana-line p-5 mb-8">
            <p class="text-xs uppercase tracking-widest text-misana-muted mb-4">{{ t('cars.fiche.dailyRate') }}</p>
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
            <p class="text-xs text-misana-muted mt-4 italic">{{ t('request.cars.priceFootnote') }}</p>
          </div>

          <a href="#request-form" class="border border-misana-ink px-6 py-3 text-sm tracking-wide hover:bg-misana-ink hover:text-misana-paper transition text-center">
            {{ t('cars.fiche.reserveCta') }} →
          </a>
        </div>
      </div>
    </section>

    <!-- Form embedded -->
    <section id="request-form" class="border-b border-misana-line">
      <div class="max-w-3xl mx-auto px-6 py-16">
        <p class="text-xs uppercase tracking-widest text-misana-muted mb-3">{{ t('cars.fiche.formKicker') }}</p>
        <h2 class="font-display text-3xl mb-8">{{ t('cars.fiche.formTitle', { car: c.fullName }) }}</h2>
        <RequestForm
          :preset-service="'cars'"
          :preset-data="presetData"
          :lock-service="true"
          :embedded="true"
        />
      </div>
    </section>

    <!-- Cross-link : autres voitures meme categorie -->
    <section v-if="sameCategory.length" class="max-w-7xl mx-auto px-6 py-16">
      <h2 class="font-display text-2xl mb-8">{{ t('cars.fiche.relatedSection') }}</h2>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <NuxtLink
          v-for="other in sameCategory"
          :key="other.id"
          :to="localePath(`/services/cars/${other.id}`)"
          class="group ring-1 ring-misana-line hover:ring-misana-ink transition overflow-hidden bg-misana-paper"
        >
          <div class="aspect-[4/3] relative overflow-hidden bg-misana-stone">
            <img :src="other.hero" :alt="other.fullName" loading="lazy" class="absolute inset-0 w-full h-full object-cover transition duration-700 group-hover:scale-[1.02]" />
          </div>
          <div class="p-4">
            <p class="text-sm font-medium">{{ other.fullName }}</p>
            <p class="text-xs text-misana-muted mt-1">
              <span>{{ t('request.cars.perDay') }} </span>
              {{ fmtPrice(other.prices.oneToThreeDays) }}
            </p>
          </div>
        </NuxtLink>
      </div>
    </section>
  </main>
</template>
