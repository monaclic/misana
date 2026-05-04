<script setup lang="ts">
// Scenario transfert chauffeur : pickup + (stops) + dropoff via Google
// Places, calcul distance/duree live, choix vehicule avec tarif km.
// Sections : Trajet -> Date+Heure+Pax+Bagages -> Choix vehicule.
// Les precisions vont dans le ContactBlock (message en bas du form).
//
// Si on arrive avec un slug ?route= (CHAUFFEUR_ROUTES), les pickup et
// dropoff sont pre-remplis avec les inputDefaults et les tarifs viennent
// directement de la matrice (pas de calcul km). Sinon on calcule live.
import { saveDraft, loadDraft } from '~/composables/useRequestDraft';
import { useGoogleMaps } from '~/composables/useGoogleMaps';
import { CHAUFFEUR_ROUTES } from '~/lib/chauffeurRoutes';
import { VEHICLES, priceForVehicleByKm } from '~/lib/fleet';

export type ChauffeurTransferData = {
  pickup?: string;
  dropoff?: string;
  stops?: string[];
  date?: string;
  time?: string;
  pax?: number;
  luggage?: number;
  vehicleId?: string;
  notes?: string;
  // Distance et duree calculees live (lecture seule pour le banner).
  distanceKm?: number;
  durationMin?: number;
};

const props = defineProps<{
  modelValue: ChauffeurTransferData;
  prefill: Record<string, string | number | undefined>;
}>();

const emit = defineEmits<{ (e: 'update:modelValue', v: ChauffeurTransferData): void }>();

const { t, locale } = useI18n();
const { distanceBetween } = useGoogleMaps();

const tomorrow = computed(() => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
});
const oneYearFromNow = computed(() => {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().slice(0, 10);
});

// Detection : si on est arrive avec un slug ?route=, on connait deja
// le tarif fixe pour chaque vehicule (matrice CHAUFFEUR_ROUTES).
const fixedRoute = computed(() => {
  const slug = props.prefill.route as string | undefined;
  if (!slug) return null;
  return CHAUFFEUR_ROUTES.find((r) => r.id === slug) || null;
});

onMounted(() => {
  const draft = loadDraft();
  const paxRaw = props.prefill.pax;
  // Strip eventuel datetime-local "YYYY-MM-DDTHH:MM" du prefill.
  const rawDate = (props.prefill.date as string) || draft.date;
  const dateOnly = rawDate ? rawDate.slice(0, 10) : undefined;
  // Pickup/dropoff : si fixed route -> inputDefaults, sinon prefill.from/to.
  const fr = fixedRoute.value;
  const pickup = props.modelValue.pickup
    || (fr ? fr.fromInputDefault : (props.prefill.from as string));
  const dropoff = props.modelValue.dropoff
    || (fr ? fr.toInputDefault : (props.prefill.to as string));
  const next: ChauffeurTransferData = {
    ...props.modelValue,
    pickup,
    dropoff,
    stops: props.modelValue.stops || [],
    date: props.modelValue.date || dateOnly,
    time: props.modelValue.time || (props.prefill.time as string) || undefined,
    pax: props.modelValue.pax || (typeof paxRaw === 'string' ? Number(paxRaw) : paxRaw) || draft.pax || 1,
    luggage: props.modelValue.luggage ?? 1,
    vehicleId: props.modelValue.vehicleId,
  };
  emit('update:modelValue', next);
});

function update(patch: Partial<ChauffeurTransferData>) {
  const next = { ...props.modelValue, ...patch };
  emit('update:modelValue', next);
  if (patch.date !== undefined || patch.pax !== undefined) {
    saveDraft({ date: next.date, pax: next.pax });
  }
}

function addStop() {
  const stops = [...(props.modelValue.stops || []), ''];
  update({ stops });
}
function removeStop(idx: number) {
  const stops = [...(props.modelValue.stops || [])];
  stops.splice(idx, 1);
  update({ stops });
}
function updateStop(idx: number, value: string) {
  const stops = [...(props.modelValue.stops || [])];
  stops[idx] = value;
  update({ stops });
}

// Calcul distance live via Google Maps Directions Service (avec stops).
// Debounce pour ne pas spammer l API a chaque keystroke.
let calcTimer: ReturnType<typeof setTimeout> | null = null;
const calculating = ref(false);
function recomputeDistance() {
  if (fixedRoute.value) return; // Tarif matrice, pas besoin de calculer.
  const pickup = props.modelValue.pickup;
  const dropoff = props.modelValue.dropoff;
  if (!pickup || !dropoff) return;
  if (calcTimer) clearTimeout(calcTimer);
  calculating.value = true;
  calcTimer = setTimeout(async () => {
    const stops = (props.modelValue.stops || []).filter(Boolean);
    const result = await distanceBetween(pickup, dropoff, stops);
    calculating.value = false;
    if (result) update({ distanceKm: result.km, durationMin: result.minutes });
  }, 600);
}

watch(
  () => [props.modelValue.pickup, props.modelValue.dropoff, JSON.stringify(props.modelValue.stops)],
  recomputeDistance,
);

// Vehicules disponibles : tous les VEHICLES, prix calcule selon contexte.
const availableVehicles = computed(() => {
  const fr = fixedRoute.value;
  return VEHICLES.map((v) => {
    let price: number | null = null;
    if (fr) {
      // Tarif matrice routes fixes.
      price = (fr.prices as Record<string, number | null>)[v.id] ?? null;
    } else if (props.modelValue.distanceKm) {
      price = priceForVehicleByKm(v.id, props.modelValue.distanceKm);
    }
    return { ...v, price };
  });
});

const dateError = computed(() => {
  if (!props.modelValue.date) return null;
  const d = props.modelValue.date;
  if (d < tomorrow.value) return t('request.scenario.vehicle.dateTooEarly');
  if (d > oneYearFromNow.value) return t('request.scenario.vehicle.dateTooFar');
  return null;
});

// Si vehicule pre-selectionne ne convient plus a pax, deselection auto.
watch(
  () => props.modelValue.pax,
  () => {
    const vid = props.modelValue.vehicleId;
    if (!vid) return;
    const v = VEHICLES.find((x) => x.id === vid);
    if (v && v.pax < (props.modelValue.pax || 1)) update({ vehicleId: undefined });
  },
);

// Formate des minutes en "Xh YYmin" (ou "YY min" si < 1h).
function formatMinutes(min: number | undefined | null): string {
  if (!min || min < 1) return '';
  if (min < 60) return `${Math.round(min)} min`;
  const h = Math.floor(min / 60);
  const m = Math.round(min - h * 60);
  return m > 0 ? `${h}h${String(m).padStart(2, '0')}` : `${h}h`;
}
</script>

<template>
  <div class="scenario-sections">
    <!-- ========== Section : Trajet (pickup -> dropoff -> [stops] -> add) ========== -->
    <fieldset class="scenario-block">
      <legend class="scenario-legend">{{ t('request.scenario.chauffeur.sectionRoute') }}</legend>

      <label class="scenario-field">
        <span class="scenario-label">{{ t('request.scenario.chauffeur.pickup') }} <span class="req">*</span></span>
        <AddressAutocomplete
          :model-value="modelValue.pickup"
          :placeholder="t('request.scenario.chauffeur.pickupPlaceholder')"
          @update:model-value="update({ pickup: $event })"
        />
      </label>

      <label class="scenario-field">
        <span class="scenario-label">{{ t('request.scenario.chauffeur.dropoff') }} <span class="req">*</span></span>
        <AddressAutocomplete
          :model-value="modelValue.dropoff"
          :placeholder="t('request.scenario.chauffeur.dropoffPlaceholder')"
          @update:model-value="update({ dropoff: $event })"
        />
      </label>

      <!-- Stops dynamiques (rendus apres pickup+dropoff pour ne pas casser
           la lecture aller-retour quand l utilisateur n en a pas) -->
      <div v-for="(stop, idx) in modelValue.stops || []" :key="idx" class="scenario-field stop-row">
        <span class="scenario-label">
          {{ t('request.scenario.chauffeur.stop') }} {{ (modelValue.stops?.length ?? 0) > 1 ? idx + 1 : '' }}
        </span>
        <div class="stop-input-row">
          <AddressAutocomplete
            :model-value="stop"
            :placeholder="t('request.scenario.chauffeur.stopPlaceholder')"
            @update:model-value="updateStop(idx, $event)"
          />
          <button type="button" class="stop-remove" @click="removeStop(idx)" :aria-label="t('request.scenario.chauffeur.removeStop')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">
              <path d="M5 12h14" stroke-linecap="round" />
            </svg>
          </button>
        </div>
      </div>

      <button type="button" class="add-stop" @click="addStop">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">
          <path d="M12 5v14M5 12h14" stroke-linecap="round" />
        </svg>
        <span>{{ t('request.scenario.chauffeur.addStop') }}</span>
      </button>

      <p v-if="modelValue.distanceKm && !fixedRoute" class="distance-readout">
        {{ modelValue.distanceKm }} km · ~{{ formatMinutes(modelValue.durationMin) }}
      </p>
      <p v-else-if="calculating" class="distance-readout calculating">
        {{ t('request.scenario.chauffeur.calculating') }}
      </p>
    </fieldset>

    <!-- ========== Section : Date / Heure / Passagers / Bagages ========== -->
    <fieldset class="scenario-block">
      <legend class="scenario-legend">{{ t('request.scenario.chauffeur.sectionWhen') }}</legend>
      <div class="when-grid">
        <label class="scenario-field">
          <span class="scenario-label">{{ t('request.scenario.chauffeur.date') }} <span class="req">*</span></span>
          <input
            type="date"
            :value="modelValue.date"
            :min="tomorrow"
            :max="oneYearFromNow"
            required
            @change="update({ date: ($event.target as HTMLInputElement).value })"
          />
          <span v-if="dateError" class="scenario-error">{{ dateError }}</span>
        </label>
        <label class="scenario-field">
          <span class="scenario-label">{{ t('request.scenario.chauffeur.time') }} <span class="req">*</span></span>
          <input
            type="time"
            :value="modelValue.time"
            required
            @change="update({ time: ($event.target as HTMLInputElement).value })"
          />
        </label>
        <label class="scenario-field">
          <span class="scenario-label">{{ t('request.scenario.chauffeur.pax') }} <span class="req">*</span></span>
          <input
            type="number"
            min="1"
            max="20"
            :value="modelValue.pax"
            required
            @input="update({ pax: Number(($event.target as HTMLInputElement).value) || undefined })"
          />
        </label>
        <label class="scenario-field">
          <span class="scenario-label">{{ t('request.scenario.chauffeur.luggage') }}</span>
          <input
            type="number"
            min="0"
            max="20"
            :value="modelValue.luggage"
            @input="update({ luggage: Number(($event.target as HTMLInputElement).value) ?? 0 })"
          />
        </label>
      </div>
    </fieldset>

    <!-- ========== Section : Choix vehicule (sortie du fieldset, breakout) ========== -->
    <section class="vehicle-section">
      <header class="vehicle-header">
        <p class="vehicle-kicker">{{ t('request.scenario.chauffeur.sectionVehicle') }}</p>
        <p class="vehicle-hint">{{ t('request.scenario.chauffeur.vehicleHint') }}</p>
      </header>

      <p v-if="!modelValue.distanceKm && !fixedRoute" class="vehicle-empty">
        {{ t('request.scenario.chauffeur.vehicleNeedRoute') }}
      </p>

      <div v-else class="vehicle-grid">
        <ChauffeurFleetCard
          v-for="v in availableVehicles"
          :key="v.id"
          :selected="modelValue.vehicleId === v.id"
          :disabled="v.pax < (modelValue.pax || 1)"
          :name="v.name"
          :type="locale === 'fr' ? v.subFr : v.sub"
          :pax="v.pax"
          :luggage="v.luggage"
          :image="v.image"
          :image-mode="v.imageMode"
          :price="(v.pax >= (modelValue.pax || 1)) ? v.price : null"
          :price-locale="(locale as 'en' | 'fr')"
          :on-request-label="(v.pax >= (modelValue.pax || 1)) ? t('request.helicopter.onRequest') : t('request.scenario.chauffeur.tooSmall')"
          @select="(v.pax >= (modelValue.pax || 1)) && update({ vehicleId: modelValue.vehicleId === v.id ? undefined : v.id })"
        />
      </div>

      <p v-if="modelValue.distanceKm || fixedRoute" class="vehicle-footnote">
        {{ t('request.scenario.chauffeur.priceFootnote') }}
      </p>
    </section>
  </div>
</template>

<style scoped src="./_shared.css"></style>
<style scoped>
.scenario-sections {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
.scenario-block {
  border: 1px solid var(--color-misana-line);
  padding: 1.2rem 1.1rem;
  border-radius: 4px;
  background: var(--color-misana-paper);
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}
.scenario-legend {
  font-family: var(--font-display);
  font-size: 1rem;
  padding: 0 0.4rem;
  margin: 0;
  color: var(--color-misana-ink);
}
.scenario-error {
  color: #b00020;
  font-size: 0.78rem;
  margin-top: 0.25rem;
}

.stop-row { gap: 0.3rem; }
.stop-input-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.stop-input-row > :first-child { flex: 1; min-width: 0; }
.stop-remove {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border: 1px solid var(--color-misana-line);
  background: var(--color-misana-paper);
  color: var(--color-misana-ink);
  border-radius: 2px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: border-color 0.15s ease;
}
.stop-remove:hover { border-color: var(--color-misana-ink); }
.stop-remove svg { width: 18px; height: 18px; }

.add-stop {
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.8rem;
  letter-spacing: 0.05em;
  color: var(--color-misana-ink);
  background: none;
  border: none;
  border-bottom: 1px solid var(--color-misana-ink);
  padding: 0 0 0.15rem;
  cursor: pointer;
  font-family: inherit;
}
.add-stop svg { width: 14px; height: 14px; }
.add-stop:hover { opacity: 0.6; }

.distance-readout {
  font-size: 0.8rem;
  color: var(--color-misana-muted);
  margin: 0;
  font-style: italic;
}
.distance-readout.calculating { opacity: 0.5; }

.when-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.7rem 0.85rem;
}
@media (min-width: 560px) {
  .when-grid { grid-template-columns: repeat(4, 1fr); }
}

.vehicle-section {
  margin-top: 0.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--color-misana-line);
}
.vehicle-header { margin-bottom: 1.25rem; }
.vehicle-kicker {
  font-family: var(--font-display);
  font-size: 1.4rem;
  letter-spacing: -0.01em;
  color: var(--color-misana-ink);
  margin: 0 0 0.35rem;
  line-height: 1.15;
}
@media (min-width: 640px) {
  .vehicle-kicker { font-size: 1.6rem; }
}
.vehicle-hint {
  font-size: 0.85rem;
  color: var(--color-misana-muted);
  margin: 0;
  max-width: 56ch;
  line-height: 1.5;
}
.vehicle-empty {
  font-size: 0.85rem;
  color: var(--color-misana-muted);
  font-style: italic;
  margin: 0.4rem 0 0;
  padding: 1rem;
  background: var(--color-misana-stone);
  border-radius: 4px;
}

.vehicle-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}
@media (min-width: 560px) {
  .vehicle-grid { grid-template-columns: 1fr 1fr; gap: 1.1rem; }
}
@media (min-width: 960px) {
  .vehicle-grid { grid-template-columns: repeat(3, 1fr); gap: 1.25rem; }
}

.vehicle-footnote {
  font-size: 0.72rem;
  color: var(--color-misana-muted);
  margin: 1.25rem 0 0;
  font-style: italic;
  padding-top: 0.85rem;
  border-top: 1px solid var(--color-misana-line);
}
</style>
