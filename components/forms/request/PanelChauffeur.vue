<script setup lang="ts">
// Panel Chauffeur :
// - subtype (one-way / by-the-hour)
// - one-way : routes pre-definies OU saisie libre via Google Places
// - pickup + dropoff via AddressAutocomplete (suggestions Google)
// - distance kilometrique calculee automatiquement => prix dynamique sur cards
// - date + time + add-a-return
// - vehicle preference cards (carousel + prix temps reel)
// - travel context disclosure / party disclosure / notes
import { CHAUFFEUR_SUBTYPES } from '~/types/request';
import { VEHICLES, priceForVehicleByKm } from '~/lib/fleet';
import {
  CHAUFFEUR_ROUTES,
  findRouteById,
  routePriceForVehicle,
  routeFromPriceChauffeur,
  type ChauffeurRoute,
} from '~/lib/chauffeurRoutes';
import { useRequestStore } from '~/stores/request';
import { useDistanceMatrix } from '~/composables/useDistanceMatrix';

const store = useRequestStore();
const { locale, t } = useI18n();
const c = store.chauffeur;
const { distanceKm: computeDistanceKm } = useDistanceMatrix();

const selectedRouteId = ref<string | undefined>(undefined);

watch(
  () => `${c.pickup}__${c.dropoff}`,
  () => {
    const found = CHAUFFEUR_ROUTES.find(
      (r) => r.fromInputDefault === c.pickup && r.toInputDefault === c.dropoff,
    );
    selectedRouteId.value = found?.id;
  },
  { immediate: true },
);

// Recalcule la distance des qu on a 2 placeIds.
let distAbort = 0;
watch(
  () => `${c.pickupPlaceId}__${c.dropoffPlaceId}`,
  async () => {
    if (!c.pickupPlaceId || !c.dropoffPlaceId) {
      c.distanceKm = undefined;
      return;
    }
    const myReq = ++distAbort;
    const km = await computeDistanceKm(c.pickupPlaceId, c.dropoffPlaceId);
    if (myReq !== distAbort) return; // une nouvelle requete a depasse celle-ci
    if (km !== null) c.distanceKm = km;
  },
);

function selectVehicle(id: string) {
  c.vehicleId = c.vehicleId === id ? undefined : id;
}

function setSubtype(s: 'one-way' | 'by-the-hour') {
  c.subtype = s;
  if (s === 'by-the-hour') {
    c.hasReturn = false;
    selectedRouteId.value = undefined;
  }
}

function pickRoute(route: ChauffeurRoute) {
  selectedRouteId.value = route.id;
  c.pickup = route.fromInputDefault;
  c.dropoff = route.toInputDefault;
  c.pickupPlaceId = undefined;
  c.dropoffPlaceId = undefined;
  c.distanceKm = undefined;
}

function clearRoute() {
  selectedRouteId.value = undefined;
  c.pickup = undefined;
  c.dropoff = undefined;
  c.pickupPlaceId = undefined;
  c.dropoffPlaceId = undefined;
  c.distanceKm = undefined;
}

function onPickupSelect(p: { description: string; placeId: string }) {
  c.pickup = p.description;
  c.pickupPlaceId = p.placeId;
  selectedRouteId.value = undefined;
}
function onDropoffSelect(p: { description: string; placeId: string }) {
  c.dropoff = p.description;
  c.dropoffPlaceId = p.placeId;
  selectedRouteId.value = undefined;
}

function fmtFrom(p: number | null | undefined): string {
  if (p === null || p === undefined) return t('request.helicopter.onRequest');
  return new Intl.NumberFormat(locale.value === 'fr' ? 'fr-FR' : 'en-GB', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(p);
}

const currentRoute = computed(() => findRouteById(selectedRouteId.value));

// Prix d un vehicule pour la situation courante :
// 1) si distance kilometrique connue (Google) => calcul forfait + km*tarif
// 2) sinon si route pre-definie selectionnee => prix table
// 3) sinon undefined (pas de prix affiche)
function priceFor(vehicleId: string): number | null | undefined {
  if (c.distanceKm) return priceForVehicleByKm(vehicleId, c.distanceKm);
  if (currentRoute.value) return routePriceForVehicle(selectedRouteId.value, vehicleId);
  return undefined;
}

const hasAnyPrice = computed(
  () => !!c.distanceKm || !!currentRoute.value,
);
</script>

<template>
  <div class="space-y-12">
    <!-- 1. Subtype -->
    <div class="grid grid-cols-2 gap-2">
      <button
        v-for="sub in CHAUFFEUR_SUBTYPES"
        :key="sub"
        type="button"
        class="border p-4 text-sm transition text-left"
        :class="c.subtype === sub ? 'border-misana-ink bg-misana-ink text-misana-paper' : 'border-misana-line hover:border-misana-ink'"
        @click="setSubtype(sub)"
      >
        {{ t(`request.chauffeur.${sub}`) }}
      </button>
    </div>

    <!-- 2. Suggested routes (one-way only) -->
    <div v-if="c.subtype === 'one-way'">
      <div class="flex items-baseline justify-between mb-4">
        <p class="text-sm uppercase tracking-wide text-misana-muted">
          {{ t('request.chauffeur.popularRoutes') }}
        </p>
        <button
          v-if="selectedRouteId"
          type="button"
          class="text-xs text-misana-muted hover:text-misana-ink underline underline-offset-4"
          @click="clearRoute"
        >
          {{ t('request.chauffeur.customRoute') }}
        </button>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <button
          v-for="route in CHAUFFEUR_ROUTES"
          :key="route.id"
          type="button"
          class="text-left px-4 py-3 transition border flex items-baseline justify-between gap-3"
          :class="
            selectedRouteId === route.id
              ? 'border-misana-ink bg-misana-ink text-misana-paper'
              : 'border-misana-line hover:border-misana-ink'
          "
          @click="pickRoute(route)"
        >
          <span>
            <span class="text-sm">
              {{ locale === 'fr' ? route.fromLabelFr : route.fromLabel }} → {{ locale === 'fr' ? route.toLabelFr : route.toLabel }}
            </span>
            <span class="block text-xs opacity-70">{{ route.duration }}</span>
          </span>
          <span class="text-xs whitespace-nowrap">
            <span class="opacity-70">{{ t('request.helicopter.from') }}</span>
            {{ fmtFrom(routeFromPriceChauffeur(route)) }}
          </span>
        </button>
      </div>
    </div>

    <!-- 3. Pickup + dropoff via AddressAutocomplete (one-way) ou pickup seul (hourly) -->
    <div class="space-y-6">
      <div>
        <label class="block text-xs uppercase tracking-wide text-misana-muted mb-1" for="ch-pickup">
          {{ t('request.chauffeur.pickup') }}
        </label>
        <AddressAutocomplete
          input-id="ch-pickup"
          :model-value="c.pickup"
          :placeholder="t('request.chauffeur.pickupHint')"
          @update:model-value="(v) => { c.pickup = v; if (!v) c.pickupPlaceId = undefined; }"
          @select="onPickupSelect"
        />
      </div>
      <div v-if="c.subtype === 'one-way'">
        <label class="block text-xs uppercase tracking-wide text-misana-muted mb-1" for="ch-dropoff">
          {{ t('request.chauffeur.dropoff') }}
        </label>
        <AddressAutocomplete
          input-id="ch-dropoff"
          :model-value="c.dropoff"
          :placeholder="t('request.chauffeur.dropoffHint')"
          @update:model-value="(v) => { c.dropoff = v; if (!v) c.dropoffPlaceId = undefined; }"
          @select="onDropoffSelect"
        />
        <p v-if="c.distanceKm" class="text-xs text-misana-muted mt-2">
          {{ c.distanceKm }} km {{ t('request.chauffeur.byCar') }}
        </p>
      </div>
      <div v-else>
        <label class="block text-xs uppercase tracking-wide text-misana-muted mb-1" for="ch-hours">
          {{ t('request.chauffeur.hours') }}
        </label>
        <input
          id="ch-hours"
          v-model.number="c.durationHours"
          type="number"
          min="3"
          max="24"
          class="w-full border-b border-misana-line py-2 bg-transparent focus:border-misana-ink outline-none"
          placeholder="3"
        />
        <p class="text-xs text-misana-muted mt-1">{{ t('request.chauffeur.hoursHint') }}</p>
      </div>
    </div>

    <!-- 4. Date + time + return -->
    <div>
      <p class="text-sm uppercase tracking-wide text-misana-muted mb-3">{{ t('request.dates.when') }}</p>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-xs uppercase tracking-wide text-misana-muted mb-1" for="ch-date">
            {{ t('request.dates.date') }}
          </label>
          <input
            id="ch-date"
            v-model="c.date"
            type="date"
            class="w-full border-b border-misana-line py-2 bg-transparent focus:border-misana-ink outline-none"
          />
        </div>
        <div>
          <label class="block text-xs uppercase tracking-wide text-misana-muted mb-1" for="ch-time">
            {{ t('request.dates.time') }}
          </label>
          <input
            id="ch-time"
            v-model="c.time"
            type="time"
            class="w-full border-b border-misana-line py-2 bg-transparent focus:border-misana-ink outline-none"
          />
        </div>
      </div>

      <div v-if="c.subtype === 'one-way'" class="mt-6">
        <label class="inline-flex items-center gap-2 text-sm">
          <input v-model="c.hasReturn" type="checkbox" class="accent-misana-ink" />
          {{ t('request.chauffeur.addReturn') }}
        </label>
        <div v-if="c.hasReturn" class="mt-4 grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs uppercase tracking-wide text-misana-muted mb-1" for="ch-rdate">
              {{ t('request.dates.returnDate') }}
            </label>
            <input
              id="ch-rdate"
              v-model="c.returnDate"
              type="date"
              class="w-full border-b border-misana-line py-2 bg-transparent focus:border-misana-ink outline-none"
            />
          </div>
          <div>
            <label class="block text-xs uppercase tracking-wide text-misana-muted mb-1" for="ch-rtime">
              {{ t('request.dates.returnTime') }}
            </label>
            <input
              id="ch-rtime"
              v-model="c.returnTime"
              type="time"
              class="w-full border-b border-misana-line py-2 bg-transparent focus:border-misana-ink outline-none"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 5. Vehicle preference cards (carousel + prix dynamique) -->
    <div>
      <div class="flex items-baseline justify-between mb-4">
        <p class="text-sm uppercase tracking-wide text-misana-muted">
          {{ t('request.chauffeur.vehiclePref') }}
        </p>
        <p class="text-xs text-misana-muted">{{ t('request.chauffeur.vehiclePrefHint') }}</p>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FleetCarouselCard
          v-for="v in VEHICLES"
          :key="v.id"
          :selected="c.vehicleId === v.id"
          :title="v.name"
          :sub="locale === 'fr' ? v.subFr : v.sub"
          :meta="[
            { icon: 'pax', text: `${v.pax} ${t('request.fleet.pax')}` },
            { icon: 'luggage', text: `${v.luggage} ${t('request.fleet.bags')}` },
          ]"
          :badge="v.badge"
          :badge-label="v.badge ? t(`request.fleet.badge.${v.badge}`) : undefined"
          :images="v.images || (v.image ? [v.image] : [])"
          :price="priceFor(v.id)"
          :price-locale="(locale as 'en' | 'fr')"
          :on-request-label="t('request.helicopter.onRequest')"
          @select="selectVehicle(v.id)"
        />
      </div>
      <p v-if="hasAnyPrice" class="text-xs text-misana-muted mt-3 italic">
        {{ t('request.chauffeur.priceFootnote') }}
      </p>
    </div>

    <!-- 6. Travel context disclosure -->
    <Disclosure :label="t('request.disclosure.travelContext')">
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-xs uppercase tracking-wide text-misana-muted mb-1" for="ch-flight">
            {{ t('request.chauffeur.flight') }}
          </label>
          <input
            id="ch-flight"
            v-model="c.flight"
            type="text"
            class="w-full border-b border-misana-line py-2 bg-transparent focus:border-misana-ink outline-none"
            placeholder="AF1234"
          />
        </div>
        <div>
          <label class="block text-xs uppercase tracking-wide text-misana-muted mb-1" for="ch-train">
            {{ t('request.chauffeur.train') }}
          </label>
          <input
            id="ch-train"
            v-model="c.train"
            type="text"
            class="w-full border-b border-misana-line py-2 bg-transparent focus:border-misana-ink outline-none"
            placeholder="TGV 6201"
          />
        </div>
      </div>
      <div>
        <label class="block text-xs uppercase tracking-wide text-misana-muted mb-1" for="ch-sign">
          {{ t('request.chauffeur.welcomeSign') }}
        </label>
        <input
          id="ch-sign"
          v-model="c.welcomeSign"
          type="text"
          class="w-full border-b border-misana-line py-2 bg-transparent focus:border-misana-ink outline-none"
          :placeholder="t('request.chauffeur.welcomeSignHint')"
        />
      </div>
    </Disclosure>

    <!-- 7. Party disclosure -->
    <Disclosure :label="t('request.disclosure.party')">
      <div>
        <p class="text-xs uppercase tracking-wide text-misana-muted mb-2">{{ t('request.passengers.title') }}</p>
        <Stepper v-model="c.passengers!.adults" :label="t('request.passengers.adults')" :max="20" />
        <Stepper v-model="c.passengers!.children" :label="t('request.passengers.children')" :max="20" />
        <Stepper v-model="c.passengers!.babies" :label="t('request.passengers.babies')" :max="10" />
        <Stepper v-model="c.passengers!.pets" :label="t('request.passengers.pets')" :max="10" />
      </div>
      <div>
        <p class="text-xs uppercase tracking-wide text-misana-muted mb-2">{{ t('request.luggage.title') }}</p>
        <Stepper v-model="c.luggage!.cabin" :label="t('request.luggage.cabin')" :max="20" />
        <Stepper v-model="c.luggage!.hold" :label="t('request.luggage.hold')" :max="20" />
        <Stepper v-model="c.luggage!.special" :label="t('request.luggage.special')" :max="10" />
      </div>
      <div>
        <p class="text-xs uppercase tracking-wide text-misana-muted mb-2">{{ t('request.childSeats.title') }}</p>
        <Stepper v-model="c.childSeats!.infant" :label="t('request.childSeats.infant')" :max="6" />
        <Stepper v-model="c.childSeats!.child" :label="t('request.childSeats.child')" :max="6" />
        <Stepper v-model="c.childSeats!.booster" :label="t('request.childSeats.booster')" :max="6" />
      </div>
    </Disclosure>

    <!-- 8. Notes -->
    <div>
      <label class="block text-xs uppercase tracking-wide text-misana-muted mb-1" for="ch-notes">
        {{ t('request.notes') }}
      </label>
      <textarea
        id="ch-notes"
        v-model="c.notes"
        rows="3"
        class="w-full border border-misana-line p-3 bg-transparent focus:border-misana-ink outline-none"
        :placeholder="t('request.notesHint')"
      ></textarea>
    </div>
  </div>
</template>
