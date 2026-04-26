<script setup lang="ts">
// Hub catalog cars : 12 voitures Excellence Riviera, sidebar filtres ultra
// complet (categorie, marque, prix, annee, transmission, carburant, places,
// ville disponibilite). Multi-select sur tous les axes, layout 2 colonnes.
import {
  RENTAL_CARS,
  RENTAL_CATEGORIES,
  RENTAL_PRICE_BUCKETS,
  rentalBrands,
  type RentalCarCategory,
} from '~/lib/rentalCars';
import { CITIES } from '~/lib/constants';

definePageMeta({ layout: 'default' });

const { locale, t } = useI18n();
const localePath = useLocalePath();

useSeoMeta({
  title: () => t('cars.hubTitle'),
  description: () => t('cars.hubDescription'),
});

// Multi-select filters
const fCategory = ref<RentalCarCategory[]>([]);
const fBrand = ref<string[]>([]);
const fPriceBucket = ref<string[]>([]);
const fTransmission = ref<('auto' | 'manual')[]>([]);
const fFuel = ref<('gasoline' | 'hybrid' | 'electric' | 'diesel')[]>([]);
const fSeats = ref<string[]>([]);
const fYear = ref<string[]>([]);
const fCity = ref<string[]>([]);
const showFilters = ref(false); // mobile drawer

const brands = rentalBrands();

const SEAT_BUCKETS = [
  { id: '2', label: '2', min: 2, max: 2 },
  { id: '4', label: '4', min: 3, max: 4 },
  { id: '5-plus', label: '5 +', min: 5, max: 9 },
];

const YEAR_BUCKETS = [
  { id: '2024-plus', label: '2024 +', min: 2024, max: 2099 },
  { id: '2022-2023', label: '2022 - 2023', min: 2022, max: 2023 },
  { id: '2020-2021', label: '2020 - 2021', min: 2020, max: 2021 },
];

const fuelOptions: ('gasoline' | 'hybrid' | 'electric' | 'diesel')[] = [
  'gasoline', 'hybrid', 'electric', 'diesel',
];

const transmissionOptions: ('auto' | 'manual')[] = ['auto', 'manual'];

const visibleCars = computed(() => {
  return RENTAL_CARS.filter((c) => {
    if (fCategory.value.length && !fCategory.value.includes(c.category)) return false;
    if (fBrand.value.length && !fBrand.value.includes(c.brand)) return false;
    if (fPriceBucket.value.length) {
      const price = c.prices.oneToThreeDays;
      const matched = fPriceBucket.value.some((id) => {
        const b = RENTAL_PRICE_BUCKETS.find((x) => x.id === id);
        return b ? price >= b.min && price <= b.max : false;
      });
      if (!matched) return false;
    }
    if (fTransmission.value.length && !fTransmission.value.includes(c.transmission)) return false;
    if (fFuel.value.length && !fFuel.value.includes(c.fuelType)) return false;
    if (fSeats.value.length) {
      const matched = fSeats.value.some((id) => {
        const b = SEAT_BUCKETS.find((x) => x.id === id);
        return b ? c.pax >= b.min && c.pax <= b.max : false;
      });
      if (!matched) return false;
    }
    if (fYear.value.length) {
      const matched = fYear.value.some((id) => {
        const b = YEAR_BUCKETS.find((x) => x.id === id);
        return b ? c.year >= b.min && c.year <= b.max : false;
      });
      if (!matched) return false;
    }
    if (fCity.value.length) {
      const matched = fCity.value.some((slug) => c.availableCities.includes(slug));
      if (!matched) return false;
    }
    return true;
  });
});

const filterCount = computed(() =>
  fCategory.value.length + fBrand.value.length + fPriceBucket.value.length +
  fTransmission.value.length + fFuel.value.length + fSeats.value.length +
  fYear.value.length + fCity.value.length,
);

function clearFilters() {
  fCategory.value = [];
  fBrand.value = [];
  fPriceBucket.value = [];
  fTransmission.value = [];
  fFuel.value = [];
  fSeats.value = [];
  fYear.value = [];
  fCity.value = [];
}

function fmtPrice(p: number): string {
  return new Intl.NumberFormat(locale.value === 'fr' ? 'fr-FR' : 'en-GB', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(p);
}
</script>

<template>
  <main class="min-h-screen">
    <section class="bg-misana-stone border-b border-misana-line">
      <div class="max-w-5xl mx-auto px-6 py-16 sm:py-24">
        <p class="text-xs uppercase tracking-widest text-misana-muted mb-4">{{ t('cars.kicker') }}</p>
        <h1 class="font-display text-4xl sm:text-5xl mb-4">{{ t('cars.hubTitle') }}</h1>
        <p class="text-misana-muted text-lg max-w-2xl">{{ t('cars.hubLead') }}</p>
      </div>
    </section>

    <section class="max-w-7xl mx-auto px-6 py-12">
      <div class="grid lg:grid-cols-12 gap-8">
        <!-- Sidebar filters -->
        <aside
          class="lg:col-span-3 lg:sticky lg:top-24 lg:self-start"
          :class="showFilters ? 'block' : 'hidden lg:block'"
        >
          <div class="border border-misana-line">
            <div class="flex items-center justify-between px-4 py-3 border-b border-misana-line">
              <p class="text-xs uppercase tracking-widest">{{ t('cars.filters') }}</p>
              <button
                v-if="filterCount"
                type="button"
                class="text-[10px] uppercase tracking-widest underline underline-offset-4 text-misana-muted hover:text-misana-ink"
                @click="clearFilters"
              >{{ t('cars.clearFilters') }}</button>
            </div>

            <div class="divide-y divide-misana-line max-h-[70vh] lg:max-h-[calc(100vh-12rem)] overflow-y-auto">
              <!-- Category -->
              <div class="p-4">
                <p class="text-[10px] uppercase tracking-widest text-misana-muted mb-3">{{ t('request.cars.category') }}</p>
                <ul class="space-y-2">
                  <li v-for="cat in RENTAL_CATEGORIES" :key="cat.id">
                    <label class="flex items-center gap-2 text-xs cursor-pointer">
                      <input type="checkbox" v-model="fCategory" :value="cat.id" class="accent-misana-ink" />
                      <span>{{ locale === 'fr' ? cat.labelFr : cat.label }}</span>
                    </label>
                  </li>
                </ul>
              </div>

              <!-- Brand -->
              <div class="p-4">
                <p class="text-[10px] uppercase tracking-widest text-misana-muted mb-3">{{ t('cars.filterBrand') }}</p>
                <ul class="space-y-2">
                  <li v-for="b in brands" :key="b">
                    <label class="flex items-center gap-2 text-xs cursor-pointer">
                      <input type="checkbox" v-model="fBrand" :value="b" class="accent-misana-ink" />
                      <span>{{ b }}</span>
                    </label>
                  </li>
                </ul>
              </div>

              <!-- Daily rate -->
              <div class="p-4">
                <p class="text-[10px] uppercase tracking-widest text-misana-muted mb-3">{{ t('cars.filterPrice') }}</p>
                <ul class="space-y-2">
                  <li v-for="bucket in RENTAL_PRICE_BUCKETS" :key="bucket.id">
                    <label class="flex items-center gap-2 text-xs cursor-pointer">
                      <input type="checkbox" v-model="fPriceBucket" :value="bucket.id" class="accent-misana-ink" />
                      <span>{{ bucket.label }}</span>
                    </label>
                  </li>
                </ul>
              </div>

              <!-- Year -->
              <div class="p-4">
                <p class="text-[10px] uppercase tracking-widest text-misana-muted mb-3">{{ t('cars.filterYear') }}</p>
                <ul class="space-y-2">
                  <li v-for="y in YEAR_BUCKETS" :key="y.id">
                    <label class="flex items-center gap-2 text-xs cursor-pointer">
                      <input type="checkbox" v-model="fYear" :value="y.id" class="accent-misana-ink" />
                      <span>{{ y.label }}</span>
                    </label>
                  </li>
                </ul>
              </div>

              <!-- Transmission -->
              <div class="p-4">
                <p class="text-[10px] uppercase tracking-widest text-misana-muted mb-3">{{ t('cars.fiche.transmission') }}</p>
                <ul class="space-y-2">
                  <li v-for="tr in transmissionOptions" :key="tr">
                    <label class="flex items-center gap-2 text-xs cursor-pointer">
                      <input type="checkbox" v-model="fTransmission" :value="tr" class="accent-misana-ink" />
                      <span>{{ tr === 'auto' ? t('cars.fiche.automatic') : t('cars.fiche.manual') }}</span>
                    </label>
                  </li>
                </ul>
              </div>

              <!-- Fuel -->
              <div class="p-4">
                <p class="text-[10px] uppercase tracking-widest text-misana-muted mb-3">{{ t('cars.fiche.fuel') }}</p>
                <ul class="space-y-2">
                  <li v-for="f in fuelOptions" :key="f">
                    <label class="flex items-center gap-2 text-xs cursor-pointer">
                      <input type="checkbox" v-model="fFuel" :value="f" class="accent-misana-ink" />
                      <span>{{ t(`cars.fuel.${f}`) }}</span>
                    </label>
                  </li>
                </ul>
              </div>

              <!-- Seats -->
              <div class="p-4">
                <p class="text-[10px] uppercase tracking-widest text-misana-muted mb-3">{{ t('cars.filterSeats') }}</p>
                <ul class="space-y-2">
                  <li v-for="s in SEAT_BUCKETS" :key="s.id">
                    <label class="flex items-center gap-2 text-xs cursor-pointer">
                      <input type="checkbox" v-model="fSeats" :value="s.id" class="accent-misana-ink" />
                      <span>{{ s.label }} {{ t('request.fleet.pax') }}</span>
                    </label>
                  </li>
                </ul>
              </div>

              <!-- Available city -->
              <div class="p-4">
                <p class="text-[10px] uppercase tracking-widest text-misana-muted mb-3">{{ t('cars.filterCity') }}</p>
                <ul class="space-y-2">
                  <li v-for="ct in CITIES" :key="ct.slug">
                    <label class="flex items-center gap-2 text-xs cursor-pointer">
                      <input type="checkbox" v-model="fCity" :value="ct.slug" class="accent-misana-ink" />
                      <span>{{ locale === 'fr' ? ct.fr : ct.en }}</span>
                    </label>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </aside>

        <!-- Results -->
        <div class="lg:col-span-9">
          <div class="flex items-center justify-between mb-6 text-xs text-misana-muted">
            <p>
              {{ visibleCars.length }} {{ t('cars.results', { n: visibleCars.length }) }}
              <span v-if="filterCount" class="ml-2">· {{ filterCount }} {{ t('cars.filtersActive') }}</span>
            </p>
            <button
              type="button"
              class="lg:hidden border border-misana-line px-3 py-1.5 hover:border-misana-ink transition"
              @click="showFilters = !showFilters"
            >{{ showFilters ? t('cars.hideFilters') : t('cars.showFilters') }}</button>
          </div>

          <div v-if="visibleCars.length" class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            <NuxtLink
              v-for="car in visibleCars"
              :key="car.id"
              :to="localePath(`/services/cars/${car.id}`)"
              class="group ring-1 ring-misana-line hover:ring-misana-ink transition overflow-hidden bg-misana-paper flex flex-col"
            >
              <div class="aspect-[4/3] relative overflow-hidden bg-misana-stone">
                <img :src="car.hero" :alt="car.fullName" loading="lazy" class="absolute inset-0 w-full h-full object-cover transition duration-700 group-hover:scale-[1.02]" />
                <span v-if="car.badge" class="absolute top-3 left-3 text-[10px] uppercase tracking-widest px-2 py-1 bg-misana-paper text-misana-ink">{{ t(`request.fleet.badge.${car.badge}`) }}</span>
              </div>
              <div class="p-5 flex-1 flex flex-col">
                <p class="text-[10px] uppercase tracking-widest text-misana-muted mb-1">{{ car.brand }}</p>
                <p class="text-sm font-medium leading-tight">{{ car.model }}</p>
                <p class="text-xs text-misana-muted mt-1">{{ locale === 'fr' ? car.descFr : car.desc }}</p>
                <div class="flex items-baseline justify-between mt-4 text-xs text-misana-muted">
                  <span>{{ car.pax }} {{ t('request.fleet.pax') }} · {{ car.hp }} hp</span>
                  <span class="text-misana-ink whitespace-nowrap">
                    <span class="text-misana-muted">{{ t('request.cars.perDay') }} </span>
                    {{ fmtPrice(car.prices.oneToThreeDays) }}
                  </span>
                </div>
              </div>
            </NuxtLink>
          </div>

          <div v-else class="text-center py-16">
            <p class="text-misana-muted text-sm mb-4">{{ t('cars.noResults') }}</p>
            <button type="button" class="text-xs underline underline-offset-4 hover:text-misana-ink transition" @click="clearFilters">{{ t('cars.clearFilters') }}</button>
          </div>

          <p class="text-xs text-misana-muted mt-8 italic">{{ t('request.cars.priceFootnote') }}</p>
        </div>
      </div>
    </section>
  </main>
</template>
