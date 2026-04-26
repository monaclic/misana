<script setup lang="ts">
// Recap V1 inspiration Leader Limousines : sections lisibles + bouton Edit
// par section qui deep-link vers l etape concernee.
import { useRequestStore } from '~/stores/request';
import { HELI_DEPARTURES, routePrice } from '~/lib/heliRoutes';
import { HELICOPTERS, VEHICLES, CAR_BRAND_CARDS, YACHT_SIZE_CARDS } from '~/lib/fleet';

const store = useRequestStore();
const { locale, t } = useI18n();

function fmtPrice(p: number | null | undefined) {
  if (p === null || p === undefined) return null;
  return new Intl.NumberFormat(locale.value === 'fr' ? 'fr-FR' : 'en-GB', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(p);
}

const heliPrice = computed(() => {
  const h = store.helicopter;
  if (!h.departure || !h.destination || !h.helicopterId) return null;
  return fmtPrice(routePrice(h.departure, h.destination, h.helicopterId));
});

const helicopterModel = computed(() => {
  if (!store.helicopter.helicopterId) return null;
  return HELICOPTERS.find((m) => m.id === store.helicopter.helicopterId);
});

const vehicleModel = computed(() => {
  if (!store.chauffeur.vehicleId) return null;
  return VEHICLES.find((v) => v.id === store.chauffeur.vehicleId);
});

const carBrand = computed(() => {
  if (!store.cars.brand) return null;
  return CAR_BRAND_CARDS.find((b) => b.id === store.cars.brand);
});

const yachtSize = computed(() => {
  if (!store.yacht.size) return null;
  return YACHT_SIZE_CARDS.find((s) => s.id === store.yacht.size);
});

function hubLabel(heliportId?: string) {
  if (!heliportId) return null;
  const hub = HELI_DEPARTURES.find(
    (d) => d.id === heliportId || d.variants?.some((v) => v.id === heliportId),
  );
  if (!hub) return heliportId;
  const variant = hub.variants?.find((v) => v.id === heliportId);
  const cityName = locale.value === 'fr' ? hub.cityFr : hub.city;
  if (variant) return `${cityName} (${locale.value === 'fr' ? variant.labelFr : variant.label})`;
  return cityName;
}

function goBackToDetail() {
  store.goTo('detail');
}
function goBackToContact() {
  store.goTo('contact');
}
function goBackToContext() {
  store.goTo('context');
}
</script>

<template>
  <section class="space-y-8">
    <div>
      <h2 class="font-display text-3xl mb-2">{{ t('request.review.title') }}</h2>
      <p class="text-misana-muted text-sm">{{ t('request.review.intro') }}</p>
    </div>

    <!-- Section 1 : Service -->
    <article class="border-t border-misana-line pt-6">
      <header class="flex items-baseline justify-between mb-4">
        <h3 class="text-sm uppercase tracking-wide text-misana-muted">
          {{ t('request.service.label') }}
        </h3>
        <button
          type="button"
          class="text-xs text-misana-muted hover:text-misana-ink underline underline-offset-4"
          @click="goBackToContext"
        >
          {{ t('common.edit') }}
        </button>
      </header>
      <p class="font-display text-xl">
        <span v-if="store.service">{{ t(`request.service.${store.service}`) }}</span>
        <span v-else class="text-misana-muted">{{ t('request.review.notSet') }}</span>
      </p>
    </article>

    <!-- Section 2 : Detail per service -->
    <article class="border-t border-misana-line pt-6">
      <header class="flex items-baseline justify-between mb-4">
        <h3 class="text-sm uppercase tracking-wide text-misana-muted">
          {{ t('request.review.detailsLabel') }}
        </h3>
        <button
          type="button"
          class="text-xs text-misana-muted hover:text-misana-ink underline underline-offset-4"
          @click="goBackToDetail"
        >
          {{ t('common.edit') }}
        </button>
      </header>

      <!-- CHAUFFEUR -->
      <dl v-if="store.service === 'chauffeur'" class="space-y-2 text-sm">
        <div class="flex justify-between gap-4">
          <dt class="text-misana-muted">{{ t('request.chauffeur.subtype') }}</dt>
          <dd>{{ t(`request.chauffeur.${store.chauffeur.subtype}`) }}</dd>
        </div>
        <div v-if="store.chauffeur.pickup" class="flex justify-between gap-4">
          <dt class="text-misana-muted">{{ t('request.chauffeur.pickup') }}</dt>
          <dd class="text-right">{{ store.chauffeur.pickup }}</dd>
        </div>
        <div v-if="store.chauffeur.dropoff" class="flex justify-between gap-4">
          <dt class="text-misana-muted">{{ t('request.chauffeur.dropoff') }}</dt>
          <dd class="text-right">{{ store.chauffeur.dropoff }}</dd>
        </div>
        <div v-if="store.chauffeur.durationHours" class="flex justify-between gap-4">
          <dt class="text-misana-muted">{{ t('request.chauffeur.hours') }}</dt>
          <dd>{{ store.chauffeur.durationHours }}h</dd>
        </div>
        <div v-if="store.chauffeur.date" class="flex justify-between gap-4">
          <dt class="text-misana-muted">{{ t('request.dates.when') }}</dt>
          <dd>{{ store.chauffeur.date }}<span v-if="store.chauffeur.time"> · {{ store.chauffeur.time }}</span></dd>
        </div>
        <div v-if="store.chauffeur.hasReturn && store.chauffeur.returnDate" class="flex justify-between gap-4">
          <dt class="text-misana-muted">{{ t('request.dates.returnDate') }}</dt>
          <dd>{{ store.chauffeur.returnDate }}<span v-if="store.chauffeur.returnTime"> · {{ store.chauffeur.returnTime }}</span></dd>
        </div>
        <div v-if="vehicleModel" class="flex justify-between gap-4">
          <dt class="text-misana-muted">{{ t('request.chauffeur.vehiclePref') }}</dt>
          <dd>{{ vehicleModel.name }}</dd>
        </div>
        <div v-if="store.chauffeur.flight" class="flex justify-between gap-4">
          <dt class="text-misana-muted">{{ t('request.chauffeur.flight') }}</dt>
          <dd>{{ store.chauffeur.flight }}</dd>
        </div>
        <div v-if="store.chauffeur.welcomeSign" class="flex justify-between gap-4">
          <dt class="text-misana-muted">{{ t('request.chauffeur.welcomeSign') }}</dt>
          <dd>{{ store.chauffeur.welcomeSign }}</dd>
        </div>
        <div v-if="store.chauffeur.notes" class="pt-2 text-misana-muted italic">
          "{{ store.chauffeur.notes }}"
        </div>
      </dl>

      <!-- HELICOPTER -->
      <dl v-else-if="store.service === 'helicopter'" class="space-y-2 text-sm">
        <div v-if="hubLabel(store.helicopter.departure)" class="flex justify-between gap-4">
          <dt class="text-misana-muted">{{ t('request.helicopter.departure') }}</dt>
          <dd>{{ hubLabel(store.helicopter.departure) }}</dd>
        </div>
        <div v-if="hubLabel(store.helicopter.destination)" class="flex justify-between gap-4">
          <dt class="text-misana-muted">{{ t('request.helicopter.destination') }}</dt>
          <dd>{{ hubLabel(store.helicopter.destination) }}</dd>
        </div>
        <div v-if="store.helicopter.date" class="flex justify-between gap-4">
          <dt class="text-misana-muted">{{ t('request.dates.when') }}</dt>
          <dd>{{ store.helicopter.date }}<span v-if="store.helicopter.time"> · {{ store.helicopter.time }}</span></dd>
        </div>
        <div v-if="store.helicopter.hasReturn && store.helicopter.returnDate" class="flex justify-between gap-4">
          <dt class="text-misana-muted">{{ t('request.dates.returnDate') }}</dt>
          <dd>{{ store.helicopter.returnDate }}<span v-if="store.helicopter.returnTime"> · {{ store.helicopter.returnTime }}</span></dd>
        </div>
        <div v-if="helicopterModel" class="flex justify-between gap-4">
          <dt class="text-misana-muted">{{ t('request.helicopter.modelPref') }}</dt>
          <dd>{{ helicopterModel.name }}</dd>
        </div>
        <div v-if="heliPrice" class="flex justify-between gap-4 pt-2 border-t border-misana-line/60">
          <dt class="text-misana-muted">{{ t('request.review.indicativeFare') }}</dt>
          <dd class="font-medium">{{ heliPrice }}</dd>
        </div>
        <div v-if="store.helicopter.notes" class="pt-2 text-misana-muted italic">
          "{{ store.helicopter.notes }}"
        </div>
      </dl>

      <!-- CARS -->
      <dl v-else-if="store.service === 'cars'" class="space-y-2 text-sm">
        <div v-if="carBrand" class="flex justify-between gap-4">
          <dt class="text-misana-muted">{{ t('request.cars.brand') }}</dt>
          <dd>{{ carBrand.name }}</dd>
        </div>
        <div v-if="store.cars.startDate || store.cars.endDate" class="flex justify-between gap-4">
          <dt class="text-misana-muted">{{ t('request.dates.when') }}</dt>
          <dd>{{ store.cars.startDate }}<span v-if="store.cars.endDate"> → {{ store.cars.endDate }}</span></dd>
        </div>
        <div v-if="store.cars.pickup" class="flex justify-between gap-4">
          <dt class="text-misana-muted">{{ t('request.cars.pickup') }}</dt>
          <dd>{{ store.cars.pickup }}</dd>
        </div>
        <div v-if="store.cars.driverAge" class="flex justify-between gap-4">
          <dt class="text-misana-muted">{{ t('request.cars.driverAge') }}</dt>
          <dd>{{ store.cars.driverAge }}</dd>
        </div>
        <div v-if="store.cars.licenceCountry" class="flex justify-between gap-4">
          <dt class="text-misana-muted">{{ t('request.cars.licenceCountry') }}</dt>
          <dd>{{ store.cars.licenceCountry }}</dd>
        </div>
        <div v-if="store.cars.notes" class="pt-2 text-misana-muted italic">"{{ store.cars.notes }}"</div>
      </dl>

      <!-- YACHT -->
      <dl v-else-if="store.service === 'yacht'" class="space-y-2 text-sm">
        <div v-if="store.yacht.duration" class="flex justify-between gap-4">
          <dt class="text-misana-muted">{{ t('request.yacht.duration') }}</dt>
          <dd>{{ t(`request.yacht.durations.${store.yacht.duration}`) }}</dd>
        </div>
        <div v-if="yachtSize" class="flex justify-between gap-4">
          <dt class="text-misana-muted">{{ t('request.yacht.size') }}</dt>
          <dd>{{ yachtSize.label }}</dd>
        </div>
        <div v-if="store.yacht.startDate || store.yacht.endDate" class="flex justify-between gap-4">
          <dt class="text-misana-muted">{{ t('request.dates.when') }}</dt>
          <dd>{{ store.yacht.startDate }}<span v-if="store.yacht.endDate"> → {{ store.yacht.endDate }}</span></dd>
        </div>
        <div v-if="store.yacht.port" class="flex justify-between gap-4">
          <dt class="text-misana-muted">{{ t('request.yacht.port') }}</dt>
          <dd>{{ store.yacht.port }}</dd>
        </div>
        <div v-if="store.yacht.guests" class="flex justify-between gap-4">
          <dt class="text-misana-muted">{{ t('request.yacht.guests') }}</dt>
          <dd>{{ store.yacht.guests }}</dd>
        </div>
        <div v-if="store.yacht.notes" class="pt-2 text-misana-muted italic">"{{ store.yacht.notes }}"</div>
      </dl>

      <!-- ACCESS -->
      <div v-else-if="store.service === 'access'" class="space-y-3 text-sm">
        <div
          v-for="(it, idx) in store.access.items"
          :key="idx"
          class="border border-misana-line p-3 space-y-1"
        >
          <p class="font-medium">{{ it.establishment || `(${t('request.review.unnamed')})` }}</p>
          <p v-if="it.city" class="text-misana-muted">{{ t(`request.destination.${it.city}`) }}</p>
          <p v-if="it.date || it.time" class="text-misana-muted">
            <span v-if="it.date">{{ it.date }}</span>
            <span v-if="it.time"> · {{ it.time }}</span>
          </p>
          <p v-if="it.guests" class="text-misana-muted">{{ it.guests }} {{ t('request.access.guests').toLowerCase() }}</p>
          <p v-if="it.occasion && it.occasion !== 'none'" class="text-misana-muted">
            {{ t(`request.access.occasions.${it.occasion}`) }}
          </p>
        </div>
        <p v-if="store.access.notes" class="text-misana-muted italic">"{{ store.access.notes }}"</p>
      </div>
    </article>

    <!-- Section 3 : Contact -->
    <article class="border-t border-misana-line pt-6">
      <header class="flex items-baseline justify-between mb-4">
        <h3 class="text-sm uppercase tracking-wide text-misana-muted">
          {{ t('request.step.contact') }}
        </h3>
        <button
          type="button"
          class="text-xs text-misana-muted hover:text-misana-ink underline underline-offset-4"
          @click="goBackToContact"
        >
          {{ t('common.edit') }}
        </button>
      </header>
      <dl class="space-y-2 text-sm">
        <div class="flex justify-between gap-4">
          <dt class="text-misana-muted">{{ t('request.contact.name') }}</dt>
          <dd>{{ store.contact.firstName }} {{ store.contact.lastName }}</dd>
        </div>
        <div class="flex justify-between gap-4">
          <dt class="text-misana-muted">{{ t('request.contact.email') }}</dt>
          <dd>{{ store.contact.email }}</dd>
        </div>
        <div v-if="store.contact.phone" class="flex justify-between gap-4">
          <dt class="text-misana-muted">{{ t('request.contact.phone') }}</dt>
          <dd>{{ store.contact.phoneCode }} {{ store.contact.phone }}<span v-if="store.contact.whatsapp" class="text-misana-muted"> · WhatsApp</span></dd>
        </div>
        <div v-if="store.replyLang" class="flex justify-between gap-4">
          <dt class="text-misana-muted">{{ t('request.contact.lang') }}</dt>
          <dd>{{ t(`request.replyLang.${store.replyLang}`) }}</dd>
        </div>
        <div v-if="store.contact.isOther && (store.contact.guestFirstName || store.contact.guestLastName)" class="flex justify-between gap-4">
          <dt class="text-misana-muted">{{ t('request.contact.bookingForOther') }}</dt>
          <dd>{{ store.contact.guestFirstName }} {{ store.contact.guestLastName }}</dd>
        </div>
        <div v-if="store.billing.enabled && store.billing.company" class="flex justify-between gap-4">
          <dt class="text-misana-muted">{{ t('request.billing.company') }}</dt>
          <dd>{{ store.billing.company }}</dd>
        </div>
        <div v-if="store.contact.message" class="pt-2 text-misana-muted italic">
          "{{ store.contact.message }}"
        </div>
      </dl>
    </article>

    <!-- Promise -->
    <p class="border-t border-misana-line pt-6 text-xs text-misana-muted italic">
      {{ t('request.review.promise') }}
    </p>
  </section>
</template>
