<script setup lang="ts">
// Fiche produit voiture rental, structure copee Excellence Riviera :
// - Hero galerie + titre + specs grid + tier prix + CTA
// - Description longue (bodyEn/Fr)
// - Specs detaillees (year, fuel, hp, top, transmission, seats)
// - Conditions de location (caution, age, km, overage)
// - What is included (delivery, insurance, concierge)
// - Available cities Riviera Misana
// - Cross-link 3 voitures meme categorie
import { RENTAL_CARS, findRentalCarById } from '~/lib/rentalCars';
import { CITIES } from '~/lib/constants';

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
  title: () => `${c.fullName} · ${t('cars.fichePart')}`,
  description: () =>
    locale.value === 'fr'
      ? `Location ${c.fullName} sur la Riviera. ${c.hp} ch, ${c.pax} places, ${c.fuelType}. A partir de ${c.prices.weekPlus} EUR par jour.`
      : `${c.fullName} rental on the Riviera. ${c.hp} hp, ${c.pax} seats, ${c.fuelType}. From ${c.prices.weekPlus} EUR per day.`,
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

const presetData = computed(() => ({
  cars: { rentalCarId: c.id },
}));

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

const sameCategory = computed(() =>
  RENTAL_CARS.filter((x) => x.category === c.category && x.id !== c.id).slice(0, 3),
);

const availableCitiesObj = computed(() =>
  c.availableCities.map((slug) => CITIES.find((ct) => ct.slug === slug)).filter(Boolean) as typeof CITIES[number][],
);
</script>

<template>
  <main class="min-h-screen">
    <!-- Hero -->
    <section class="border-b border-misana-line">
      <div class="max-w-7xl mx-auto px-6 py-12 grid lg:grid-cols-12 gap-8">
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
            <button v-if="total > 1" type="button" aria-label="Previous" class="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 inline-flex items-center justify-center bg-misana-paper/80 hover:bg-misana-paper text-misana-ink opacity-0 group-hover:opacity-100 transition" @click="prev">‹</button>
            <button v-if="total > 1" type="button" aria-label="Next" class="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 inline-flex items-center justify-center bg-misana-paper/80 hover:bg-misana-paper text-misana-ink opacity-0 group-hover:opacity-100 transition" @click="next">›</button>
            <div v-if="total > 1" class="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              <button v-for="(_, i) in c.images" :key="i" type="button" class="w-2 h-2 rounded-full transition" :class="i === idx ? 'bg-misana-paper' : 'bg-misana-paper/50 hover:bg-misana-paper/80'" @click="idx = i"></button>
            </div>
          </div>
        </div>

        <div class="lg:col-span-5 flex flex-col">
          <p class="text-xs uppercase tracking-widest text-misana-muted mb-3">{{ c.brand }}</p>
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
              <dd class="font-display text-xl mt-1">{{ c.transmission === 'auto' ? t('cars.fiche.automatic') : t('cars.fiche.manual') }}</dd>
            </div>
            <div class="border border-misana-line p-4">
              <dt class="text-[10px] uppercase tracking-widest text-misana-muted">{{ t('cars.fiche.fuel') }}</dt>
              <dd class="font-display text-xl mt-1">{{ t(`cars.fuel.${c.fuelType}`) }}</dd>
            </div>
            <div class="border border-misana-line p-4">
              <dt class="text-[10px] uppercase tracking-widest text-misana-muted">{{ t('cars.fiche.year') }}</dt>
              <dd class="font-display text-xl mt-1">{{ c.year }}</dd>
            </div>
          </dl>

          <!-- Tier prix -->
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
          </div>

          <a href="#request-form" class="border border-misana-ink px-6 py-3 text-sm tracking-wide hover:bg-misana-ink hover:text-misana-paper transition text-center">
            {{ t('cars.fiche.reserveCta') }} →
          </a>
        </div>
      </div>
    </section>

    <!-- Description longue -->
    <section class="max-w-5xl mx-auto px-6 py-16">
      <div class="prose prose-misana max-w-none">
        <h2 class="font-display text-2xl mb-4">{{ t('cars.fiche.aboutSection') }}</h2>
        <p class="text-misana-muted leading-relaxed">{{ locale === 'fr' ? c.bodyFr : c.bodyEn }}</p>
      </div>
    </section>

    <!-- Conditions + Included -->
    <section class="max-w-7xl mx-auto px-6 py-16 grid lg:grid-cols-2 gap-12 border-t border-misana-line">
      <div>
        <h2 class="font-display text-2xl mb-6">{{ t('cars.fiche.conditionsSection') }}</h2>
        <dl class="space-y-3">
          <div class="flex justify-between border-b border-misana-line pb-2 text-sm">
            <dt class="text-misana-muted">{{ t('cars.fiche.minAge') }}</dt>
            <dd>{{ c.conditions.minAge }} {{ t('cars.fiche.years') }}</dd>
          </div>
          <div class="flex justify-between border-b border-misana-line pb-2 text-sm">
            <dt class="text-misana-muted">{{ t('cars.fiche.securityDeposit') }}</dt>
            <dd>{{ fmtPrice(c.conditions.securityDeposit) }}</dd>
          </div>
          <div class="flex justify-between border-b border-misana-line pb-2 text-sm">
            <dt class="text-misana-muted">{{ t('cars.fiche.minDays') }}</dt>
            <dd>{{ c.conditions.minDays }} {{ t('cars.fiche.daysShort') }}</dd>
          </div>
          <div class="flex justify-between border-b border-misana-line pb-2 text-sm">
            <dt class="text-misana-muted">{{ t('cars.fiche.includedKm') }}</dt>
            <dd>{{ c.conditions.includedKmPerDay }} km / {{ t('cars.fiche.day') }}</dd>
          </div>
          <div class="flex justify-between border-b border-misana-line pb-2 text-sm">
            <dt class="text-misana-muted">{{ t('cars.fiche.overageRate') }}</dt>
            <dd>{{ fmtPrice(c.conditions.overageRatePerKm) }} / km</dd>
          </div>
        </dl>
      </div>

      <div>
        <h2 class="font-display text-2xl mb-6">{{ t('cars.fiche.includedSection') }}</h2>
        <ul class="space-y-3 text-sm text-misana-muted">
          <li class="flex gap-3"><span class="text-misana-ink">·</span> {{ t('cars.fiche.included.delivery') }}</li>
          <li class="flex gap-3"><span class="text-misana-ink">·</span> {{ t('cars.fiche.included.insurance') }}</li>
          <li class="flex gap-3"><span class="text-misana-ink">·</span> {{ t('cars.fiche.included.concierge') }}</li>
          <li class="flex gap-3"><span class="text-misana-ink">·</span> {{ t('cars.fiche.included.km') }}</li>
        </ul>
        <h3 class="font-display text-base mt-8 mb-4">{{ t('cars.fiche.availableSection') }}</h3>
        <ul class="flex flex-wrap gap-2">
          <li v-for="ct in availableCitiesObj" :key="ct.slug" class="text-xs border border-misana-line px-3 py-1.5">
            {{ locale === 'fr' ? ct.fr : ct.en }}
          </li>
        </ul>
      </div>
    </section>

    <!-- Form embedded -->
    <section id="request-form" class="border-t border-misana-line">
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

    <!-- Cross-link related -->
    <section v-if="sameCategory.length" class="max-w-7xl mx-auto px-6 py-16 border-t border-misana-line">
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

    <!-- Maillage interne : 8 liens contextuels -->
    <section class="bg-misana-stone border-t border-misana-line">
      <div class="max-w-7xl mx-auto px-6 py-12 grid grid-cols-2 sm:grid-cols-4 gap-8 text-sm">
        <div>
          <p class="text-[10px] uppercase tracking-widest text-misana-muted mb-3">{{ t('crosslink.serviceLabel') }}</p>
          <ul class="space-y-2">
            <li><NuxtLink :to="localePath('/services/cars')" class="hover:text-misana-muted">{{ t('crosslink.allCars') }}</NuxtLink></li>
            <li><NuxtLink :to="localePath('/services/chauffeur')" class="hover:text-misana-muted">{{ t('crosslink.chauffeur') }}</NuxtLink></li>
          </ul>
        </div>
        <div>
          <p class="text-[10px] uppercase tracking-widest text-misana-muted mb-3">{{ t('crosslink.destinationLabel') }}</p>
          <ul class="space-y-2">
            <li v-for="ct in availableCitiesObj.slice(0, 2)" :key="ct.slug">
              <NuxtLink :to="localePath(`/destinations/${ct.slug}`)" class="hover:text-misana-muted">
                {{ c.brand }} {{ t('crosslink.in') }} {{ locale === 'fr' ? ct.fr : ct.en }}
              </NuxtLink>
            </li>
          </ul>
        </div>
        <div>
          <p class="text-[10px] uppercase tracking-widest text-misana-muted mb-3">{{ t('crosslink.transferLabel') }}</p>
          <ul class="space-y-2">
            <li><NuxtLink :to="localePath('/transfers')" class="hover:text-misana-muted">{{ t('crosslink.allTransfers') }}</NuxtLink></li>
            <li><NuxtLink :to="localePath('/services/helicopter')" class="hover:text-misana-muted">{{ t('crosslink.helicopter') }}</NuxtLink></li>
          </ul>
        </div>
        <div>
          <p class="text-[10px] uppercase tracking-widest text-misana-muted mb-3">{{ t('crosslink.eventLabel') }}</p>
          <ul class="space-y-2">
            <li><NuxtLink :to="localePath('/events')" class="hover:text-misana-muted">{{ t('crosslink.allEvents') }}</NuxtLink></li>
            <li><NuxtLink :to="localePath('/services/access')" class="hover:text-misana-muted">{{ t('crosslink.access') }}</NuxtLink></li>
          </ul>
        </div>
      </div>
    </section>
  </main>
</template>
