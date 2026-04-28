<script setup lang="ts">
// Panel Cars rental Misana V1 :
// - 8 voitures curees (RS6, G63, Range Rover Vogue, Maybach S, 911 Turbo S,
//   Lambo Urus, Ferrari Roma Spider, Rolls-Royce Cullinan).
// - Filtre par categorie (Performance / Supercar / SUV / Convertible / Sedan).
// - Cards carousel + prix journalier indicatif selon duration choisie.
// - Sources : Excellence Riviera (operateur Riviera).
import { DRIVER_AGE_BRACKETS } from '~/types/request';
import {
  RENTAL_CARS,
  RENTAL_CATEGORIES,
  rentalDailyRate,
  type RentalCarCategory,
} from '~/lib/rentalCars';
import { useRequestStore } from '~/stores/request';

const store = useRequestStore();
const { locale, t } = useI18n();
const c = store.cars;

const activeCategory = ref<RentalCarCategory | null>(null);

const visibleCars = computed(() =>
  activeCategory.value ? RENTAL_CARS.filter((v) => v.category === activeCategory.value) : RENTAL_CARS,
);

// Duree en jours, calculee depuis startDate/endDate. Utilisee pour afficher
// le bon tier de prix sur les cards.
const days = computed<number>(() => {
  if (!c.startDate || !c.endDate) return 1;
  const a = new Date(c.startDate);
  const b = new Date(c.endDate);
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return 1;
  const diff = Math.round((b.getTime() - a.getTime()) / 86400000);
  return Math.max(1, diff);
});

function selectCar(id: string) {
  c.rentalCarId = c.rentalCarId === id ? undefined : id;
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
  <div class="space-y-12">
    <!-- 1. Dates -->
    <div>
      <p class="text-sm uppercase tracking-wide text-misana-muted mb-3">{{ t('request.dates.when') }}</p>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-xs uppercase tracking-wide text-misana-muted mb-1" for="cr-start">
            {{ t('request.dates.startDate') }}
          </label>
          <input
            id="cr-start"
            v-model="c.startDate"
            type="date"
            class="w-full border-b border-misana-line py-2 bg-transparent focus:border-misana-ink outline-none"
          />
        </div>
        <div>
          <label class="block text-xs uppercase tracking-wide text-misana-muted mb-1" for="cr-end">
            {{ t('request.dates.endDate') }}
          </label>
          <input
            id="cr-end"
            v-model="c.endDate"
            type="date"
            class="w-full border-b border-misana-line py-2 bg-transparent focus:border-misana-ink outline-none"
          />
        </div>
      </div>
      <p v-if="days > 1" class="text-xs text-misana-muted mt-2">
        {{ days }} {{ t('request.cars.days') }}
      </p>
    </div>

    <!-- 2. Categorie filter -->
    <div>
      <p class="text-sm uppercase tracking-wide text-misana-muted mb-3">
        {{ t('request.cars.category') }}
      </p>
      <div class="flex flex-wrap gap-2">
        <button
          type="button"
          class="text-sm px-4 py-2 transition border"
          :class="
            activeCategory === null
              ? 'border-misana-ink bg-misana-ink text-misana-paper'
              : 'border-misana-line hover:border-misana-ink'
          "
          @click="activeCategory = null"
        >
          {{ t('request.cars.allCategories') }}
        </button>
        <button
          v-for="cat in RENTAL_CATEGORIES"
          :key="cat.id"
          type="button"
          class="text-sm px-4 py-2 transition border"
          :class="
            activeCategory === cat.id
              ? 'border-misana-ink bg-misana-ink text-misana-paper'
              : 'border-misana-line hover:border-misana-ink'
          "
          @click="activeCategory = cat.id"
        >
          {{ locale === 'fr' ? cat.labelFr : cat.label }}
        </button>
      </div>
    </div>

    <!-- 3. Vehicle cards (carousel + prix journee selon duree) -->
    <div>
      <div class="flex items-baseline justify-between mb-4">
        <p class="text-sm uppercase tracking-wide text-misana-muted">
          {{ t('request.cars.fleet') }}
        </p>
        <p class="text-xs text-misana-muted">{{ t('request.cars.fleetHint') }}</p>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <FleetCarouselCard
          v-for="car in visibleCars"
          :key="car.id"
          :selected="c.rentalCarId === car.id"
          :title="car.fullName"
          :sub="locale === 'fr' ? car.descFr : car.desc"
          :meta="[
            { icon: 'pax', text: `${car.pax} ${t('request.fleet.pax')}` },
            { icon: 'speed', text: `${car.hp} hp` },
          ]"
          :badge="car.badge"
          :badge-label="car.badge ? t(`cars.badge.${car.badge}`) : undefined"
          :images="car.images"
          :price="rentalDailyRate(car, days)"
          :price-locale="(locale as 'en' | 'fr')"
          :from-label="t('request.cars.perDay')"
          @select="selectCar(car.id)"
        />
      </div>
      <p class="text-xs text-misana-muted mt-3 italic">
        {{ t('request.cars.priceFootnote') }}
      </p>
    </div>

    <!-- 4. Pickup -->
    <div class="space-y-6">
      <div>
        <label class="block text-xs uppercase tracking-wide text-misana-muted mb-1" for="cr-pickup">
          {{ t('request.cars.pickup') }}
        </label>
        <input
          id="cr-pickup"
          v-model="c.pickup"
          type="text"
          class="w-full border-b border-misana-line py-2 bg-transparent focus:border-misana-ink outline-none"
          :placeholder="t('request.cars.pickupHint')"
        />
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-xs uppercase tracking-wide text-misana-muted mb-1" for="cr-age">
            {{ t('request.cars.driverAge') }}
          </label>
          <select
            id="cr-age"
            v-model="c.driverAge"
            class="w-full border-b border-misana-line py-2 bg-transparent focus:border-misana-ink outline-none"
          >
            <option :value="undefined">{{ t('common.choose') }}</option>
            <option v-for="age in DRIVER_AGE_BRACKETS" :key="age" :value="age">{{ age }}</option>
          </select>
        </div>
        <div>
          <label class="block text-xs uppercase tracking-wide text-misana-muted mb-1" for="cr-licence">
            {{ t('request.cars.licenceCountry') }}
          </label>
          <input
            id="cr-licence"
            v-model="c.licenceCountry"
            type="text"
            class="w-full border-b border-misana-line py-2 bg-transparent focus:border-misana-ink outline-none"
            :placeholder="t('request.cars.licenceCountryHint')"
          />
        </div>
      </div>
    </div>

    <div>
      <label class="block text-xs uppercase tracking-wide text-misana-muted mb-1" for="cr-notes">
        {{ t('request.notes') }}
      </label>
      <textarea
        id="cr-notes"
        v-model="c.notes"
        rows="3"
        class="w-full border border-misana-line p-3 bg-transparent focus:border-misana-ink outline-none"
        :placeholder="t('request.notesHint')"
      ></textarea>
    </div>
  </div>
</template>
