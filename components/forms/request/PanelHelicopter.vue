<script setup lang="ts">
// Panel Helicopter :
// - 4 villes hubs Riviera (départ + arrivée symetriques)
// - sous-pill heliport variant pour Cannes / Saint-Tropez
// - date + heure (toujours)
// - one-way par defaut, "Add a return" toggle => date+time retour
// - cards aircraft avec carousel + prix exact pour la route
import { HELICOPTERS } from '~/lib/fleet';
import {
  HELI_DEPARTURES,
  routesFrom,
  routeFromPrice,
  routePrice,
  type HeliRoute,
} from '~/lib/heliRoutes';
import { useRequestStore } from '~/stores/request';

const store = useRequestStore();
const { locale, t } = useI18n();
const h = store.helicopter;

function hubFor(heliportId: string | undefined) {
  if (!heliportId) return undefined;
  return HELI_DEPARTURES.find(
    (d) => d.id === heliportId || d.variants?.some((v) => v.id === heliportId),
  );
}

const departureHub = computed(() => hubFor(h.departure));

const availableRoutes = computed<HeliRoute[]>(() =>
  h.departure ? routesFrom(h.departure) : [],
);

const destinationHubs = computed(() => {
  const seen = new Set<string>();
  const result: { hub: typeof HELI_DEPARTURES[number]; route: HeliRoute }[] = [];
  for (const route of availableRoutes.value) {
    const hub = hubFor(route.toId);
    if (!hub || seen.has(hub.id)) continue;
    seen.add(hub.id);
    result.push({ hub, route });
  }
  return result;
});

const destinationHub = computed(() => hubFor(h.destination));

function selectDepartureCity(hubId: string) {
  h.departure = hubId;
  const reachable = routesFrom(hubId).map((r) => hubFor(r.toId)?.id).filter(Boolean);
  if (h.destination && !reachable.includes(hubFor(h.destination)?.id)) {
    h.destination = undefined;
  }
}

function selectDepartureVariant(variantId: string) {
  h.departure = variantId;
}

function selectDestinationCity(hubId: string) {
  h.destination = destinationHub.value?.id === hubId ? undefined : hubId;
}

function selectDestinationVariant(variantId: string) {
  h.destination = variantId;
}

function selectHelicopter(id: string) {
  h.helicopterId = h.helicopterId === id ? undefined : id;
}

function fmtFrom(p: number | null): string {
  if (p === null) return t('request.helicopter.onRequest');
  return new Intl.NumberFormat(locale.value === 'fr' ? 'fr-FR' : 'en-GB', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(p);
}
</script>

<template>
  <div class="space-y-12">
    <!-- 1. Departure -->
    <div>
      <p class="text-sm uppercase tracking-wide text-misana-muted mb-4">
        {{ t('request.helicopter.departure') }}
      </p>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="dep in HELI_DEPARTURES"
          :key="dep.id"
          type="button"
          class="text-sm px-4 py-2 transition border"
          :class="
            departureHub?.id === dep.id
              ? 'border-misana-ink bg-misana-ink text-misana-paper'
              : 'border-misana-line hover:border-misana-ink'
          "
          @click="selectDepartureCity(dep.id)"
        >
          {{ locale === 'fr' ? dep.shortLabelFr : dep.shortLabel }}
        </button>
      </div>
      <div
        v-if="departureHub?.variants"
        class="flex flex-wrap gap-2 mt-3 pl-4 border-l border-misana-line"
      >
        <span class="text-xs uppercase tracking-wide text-misana-muted self-center">
          {{ t('request.helicopter.heliport') }}
        </span>
        <button
          v-for="variant in departureHub.variants"
          :key="variant.id"
          type="button"
          class="text-xs px-3 py-1 transition border"
          :class="
            h.departure === variant.id
              ? 'border-misana-ink bg-misana-ink text-misana-paper'
              : 'border-misana-line hover:border-misana-ink'
          "
          @click="selectDepartureVariant(variant.id)"
        >
          {{ locale === 'fr' ? variant.labelFr : variant.label }}
        </button>
      </div>
    </div>

    <!-- 2. Destination -->
    <div v-if="h.departure">
      <p class="text-sm uppercase tracking-wide text-misana-muted mb-4">
        {{ t('request.helicopter.destination') }}
      </p>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <button
          v-for="entry in destinationHubs"
          :key="entry.hub.id"
          type="button"
          class="text-left px-4 py-3 transition border flex items-baseline justify-between gap-3"
          :class="
            destinationHub?.id === entry.hub.id
              ? 'border-misana-ink bg-misana-ink text-misana-paper'
              : 'border-misana-line hover:border-misana-ink'
          "
          @click="selectDestinationCity(entry.hub.id)"
        >
          <span>
            <span class="text-sm">{{ locale === 'fr' ? entry.hub.cityFr : entry.hub.city }}</span>
            <span class="block text-xs opacity-70">{{ entry.route.duration }}</span>
          </span>
          <span class="text-xs whitespace-nowrap">
            <span class="opacity-70">{{ t('request.helicopter.from') }}</span>
            {{ fmtFrom(routeFromPrice(entry.route)) }}
          </span>
        </button>
      </div>
      <div
        v-if="destinationHub?.variants"
        class="flex flex-wrap gap-2 mt-3 pl-4 border-l border-misana-line"
      >
        <span class="text-xs uppercase tracking-wide text-misana-muted self-center">
          {{ t('request.helicopter.heliport') }}
        </span>
        <button
          v-for="variant in destinationHub.variants"
          :key="variant.id"
          type="button"
          class="text-xs px-3 py-1 transition border"
          :class="
            h.destination === variant.id
              ? 'border-misana-ink bg-misana-ink text-misana-paper'
              : 'border-misana-line hover:border-misana-ink'
          "
          @click="selectDestinationVariant(variant.id)"
        >
          {{ locale === 'fr' ? variant.labelFr : variant.label }}
        </button>
      </div>
    </div>

    <!-- 3. Date + heure -->
    <div v-if="h.departure && h.destination">
      <p class="text-sm uppercase tracking-wide text-misana-muted mb-3">{{ t('request.dates.when') }}</p>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-xs uppercase tracking-wide text-misana-muted mb-1" for="h-date">
            {{ t('request.dates.date') }}
          </label>
          <input
            id="h-date"
            v-model="h.date"
            type="date"
            class="w-full border-b border-misana-line py-2 bg-transparent focus:border-misana-ink outline-none"
          />
        </div>
        <div>
          <label class="block text-xs uppercase tracking-wide text-misana-muted mb-1" for="h-time">
            {{ t('request.dates.time') }}
          </label>
          <input
            id="h-time"
            v-model="h.time"
            type="time"
            class="w-full border-b border-misana-line py-2 bg-transparent focus:border-misana-ink outline-none"
          />
        </div>
      </div>

      <label class="inline-flex items-center gap-2 text-sm mt-6">
        <input v-model="h.hasReturn" type="checkbox" class="accent-misana-ink" />
        {{ t('request.helicopter.hasReturn') }}
      </label>
      <div v-if="h.hasReturn" class="mt-4 grid grid-cols-2 gap-4">
        <div>
          <label class="block text-xs uppercase tracking-wide text-misana-muted mb-1" for="h-rdate">
            {{ t('request.dates.returnDate') }}
          </label>
          <input
            id="h-rdate"
            v-model="h.returnDate"
            type="date"
            class="w-full border-b border-misana-line py-2 bg-transparent focus:border-misana-ink outline-none"
          />
        </div>
        <div>
          <label class="block text-xs uppercase tracking-wide text-misana-muted mb-1" for="h-rtime">
            {{ t('request.dates.returnTime') }}
          </label>
          <input
            id="h-rtime"
            v-model="h.returnTime"
            type="time"
            class="w-full border-b border-misana-line py-2 bg-transparent focus:border-misana-ink outline-none"
          />
        </div>
      </div>
    </div>

    <!-- 4. Aircraft cards -->
    <div v-if="h.departure && h.destination">
      <div class="flex items-baseline justify-between mb-4">
        <p class="text-sm uppercase tracking-wide text-misana-muted">
          {{ t('request.helicopter.modelPref') }}
        </p>
        <p class="text-xs text-misana-muted">{{ t('request.helicopter.modelPrefHint') }}</p>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <FleetCarouselCard
          v-for="m in HELICOPTERS"
          :key="m.id"
          :selected="h.helicopterId === m.id"
          :title="m.name"
          :sub="locale === 'fr' ? m.engineFr : m.engine"
          :meta="[
            { icon: 'pax', text: `${m.pax}` },
            { icon: 'speed', text: `${m.speedKmh} km/h` },
            { icon: 'luggage', text: m.luggage },
          ]"
          :badge="m.badge"
          :badge-label="m.badge ? t(`request.fleet.badge.${m.badge}`) : undefined"
          :images="m.images || (m.image ? [m.image] : [])"
          :price="routePrice(h.departure, h.destination, m.id)"
          :price-locale="(locale as 'en' | 'fr')"
          :on-request-label="t('request.helicopter.onRequest')"
          @select="selectHelicopter(m.id)"
        />
      </div>
      <p class="text-xs text-misana-muted mt-3 italic">
        {{ t('request.helicopter.priceFootnote') }}
      </p>
    </div>

    <Disclosure :label="t('request.disclosure.party')">
      <div>
        <p class="text-xs uppercase tracking-wide text-misana-muted mb-2">{{ t('request.passengers.title') }}</p>
        <Stepper v-model="h.passengers!.adults" :label="t('request.passengers.adultsHeli')" :max="20" />
        <Stepper v-model="h.passengers!.children" :label="t('request.passengers.children')" :max="20" />
        <Stepper v-model="h.passengers!.babies" :label="t('request.passengers.babies')" :max="6" />
      </div>
      <div>
        <p class="text-xs uppercase tracking-wide text-misana-muted mb-2">{{ t('request.luggage.title') }}</p>
        <Stepper v-model="h.luggage!.cabin" :label="t('request.luggage.cabin')" :hint="t('request.luggage.cabinHeliHint')" :max="20" />
        <Stepper v-model="h.luggage!.hold" :label="t('request.luggage.hold')" :hint="t('request.luggage.holdHeliHint')" :max="20" />
        <Stepper v-model="h.luggage!.special" :label="t('request.luggage.special')" :max="10" />
      </div>
    </Disclosure>

    <div>
      <label class="block text-xs uppercase tracking-wide text-misana-muted mb-1" for="h-notes">
        {{ t('request.notes') }}
      </label>
      <textarea
        id="h-notes"
        v-model="h.notes"
        rows="3"
        class="w-full border border-misana-line p-3 bg-transparent focus:border-misana-ink outline-none"
        :placeholder="t('request.notesHint')"
      ></textarea>
    </div>
  </div>
</template>
