<script setup lang="ts">
// Scenario fiche voiture : utilisateur arrive depuis /cars/[brandModel]
// avec service=cars&vehicle=<id>. Le vehicule est locke (visible dans le
// ContextBanner). On collecte juste ce qui declenche le rappel telephone.
//
// V1 consultatif : pas d'heures, pas de paiement en ligne. Juste startDate
// + duree approximative + lieu + conducteur. Le reste se cale au telephone.
import { saveDraft, loadDraft } from '~/composables/useRequestDraft';
import AddressAutocomplete from '~/components/forms/AddressAutocomplete.vue';

export type VehicleData = {
  startDate?: string;
  durationApprox?: '1-3' | '4-7' | '8-14' | '15+';
  pickupType?: 'airport' | 'hotel' | 'villa' | 'other';
  pickup?: string;
  returnSame?: boolean;
  returnType?: 'airport' | 'hotel' | 'villa' | 'other';
  returnLocation?: string;
  driverAge?: '21-25' | '26-30' | '31+';
  licenceCountry?: string;
  hasAdditionalDriver?: boolean;
  additionalDriverAge?: '21-25' | '26-30' | '31+';
  additionalDriverLicence?: string;
  notes?: string;
};

const props = defineProps<{
  modelValue: VehicleData;
  prefill: Record<string, string | number | undefined>;
}>();

const emit = defineEmits<{ (e: 'update:modelValue', v: VehicleData): void }>();

const { t } = useI18n();

// Date min = demain (la location de luxe ne se prepare pas le jour meme).
const tomorrow = computed(() => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
});

// Date max = startDate + 1 an (au-dela = appel direct).
const oneYearFromNow = computed(() => {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().slice(0, 10);
});

const COMMON_COUNTRIES = [
  'France', 'Royaume-Uni', 'Allemagne', 'Suisse', 'Belgique',
  'Italie', 'Espagne', 'États-Unis', 'Pays-Bas', 'Luxembourg',
];

onMounted(() => {
  const draft = loadDraft();
  const next: VehicleData = {
    ...props.modelValue,
    startDate: props.modelValue.startDate || (props.prefill.date as string) || draft.date,
    returnSame: props.modelValue.returnSame !== undefined ? props.modelValue.returnSame : true,
    hasAdditionalDriver: props.modelValue.hasAdditionalDriver || false,
  };
  emit('update:modelValue', next);
});

function update(patch: Partial<VehicleData>) {
  const next = { ...props.modelValue, ...patch };
  emit('update:modelValue', next);
  if (patch.startDate !== undefined) {
    saveDraft({ date: next.startDate });
  }
}

// Validation date inline (pas de blocage HTML5 brut, message clair).
const dateError = computed(() => {
  if (!props.modelValue.startDate) return null;
  const start = props.modelValue.startDate;
  if (start < tomorrow.value) return t('request.scenario.vehicle.dateTooEarly');
  if (start > oneYearFromNow.value) return t('request.scenario.vehicle.dateTooFar');
  return null;
});

const pickupOptions = computed(() => [
  { value: 'airport' as const, label: t('request.scenario.vehicle.pickupAirport') },
  { value: 'hotel' as const, label: t('request.scenario.vehicle.pickupHotel') },
  { value: 'villa' as const, label: t('request.scenario.vehicle.pickupVilla') },
  { value: 'other' as const, label: t('request.scenario.vehicle.pickupOther') },
]);
</script>

<template>
  <div class="scenario-sections">
    <!-- ========== Section 1 : Periode ========== -->
    <fieldset class="scenario-block">
      <legend class="scenario-legend">{{ t('request.scenario.vehicle.sectionPeriod') }}</legend>

      <div class="scenario-row">
        <label class="scenario-field">
          <span class="scenario-label">{{ t('request.scenario.vehicle.startDate') }} <span class="req">*</span></span>
          <input
            type="date"
            :value="modelValue.startDate"
            :min="tomorrow"
            :max="oneYearFromNow"
            required
            @change="update({ startDate: ($event.target as HTMLInputElement).value })"
          />
          <span v-if="dateError" class="scenario-error">{{ dateError }}</span>
        </label>
        <label class="scenario-field">
          <span class="scenario-label">{{ t('request.scenario.vehicle.duration') }}</span>
          <select
            :value="modelValue.durationApprox"
            @change="update({ durationApprox: ($event.target as HTMLSelectElement).value as VehicleData['durationApprox'] })"
          >
            <option value="">{{ t('request.scenario.vehicle.durationAny') }}</option>
            <option value="1-3">{{ t('request.scenario.vehicle.duration1_3') }}</option>
            <option value="4-7">{{ t('request.scenario.vehicle.duration4_7') }}</option>
            <option value="8-14">{{ t('request.scenario.vehicle.duration8_14') }}</option>
            <option value="15+">{{ t('request.scenario.vehicle.duration15plus') }}</option>
          </select>
        </label>
      </div>
    </fieldset>

    <!-- ========== Section 2 : Lieu ========== -->
    <fieldset class="scenario-block">
      <legend class="scenario-legend">{{ t('request.scenario.vehicle.sectionLocation') }}</legend>

      <div class="scenario-field">
        <span class="scenario-label">{{ t('request.scenario.vehicle.pickupType') }} <span class="req">*</span></span>
        <div class="pickup-options">
          <label v-for="opt in pickupOptions" :key="opt.value" class="pickup-option">
            <input
              type="radio"
              :value="opt.value"
              :checked="modelValue.pickupType === opt.value"
              @change="update({ pickupType: opt.value })"
            />
            <span>{{ opt.label }}</span>
          </label>
        </div>
      </div>

      <div v-if="modelValue.pickupType === 'other'" class="scenario-field">
        <span class="scenario-label">{{ t('request.scenario.vehicle.pickupOtherDetail') }}</span>
        <AddressAutocomplete
          :model-value="modelValue.pickup"
          :placeholder="t('request.scenario.vehicle.pickupOtherPlaceholder')"
          variant="light"
          @update:model-value="update({ pickup: $event })"
        />
      </div>

      <!-- Toggle retour au meme endroit -->
      <label class="toggle-row">
        <input
          type="checkbox"
          :checked="modelValue.returnSame"
          @change="update({ returnSame: ($event.target as HTMLInputElement).checked })"
        />
        <span>{{ t('request.scenario.vehicle.returnSame') }}</span>
      </label>

      <!-- Lieu de retour (si different) -->
      <div v-if="!modelValue.returnSame" class="scenario-field">
        <span class="scenario-label">{{ t('request.scenario.vehicle.returnType') }}</span>
        <div class="pickup-options">
          <label v-for="opt in pickupOptions" :key="`r-${opt.value}`" class="pickup-option">
            <input
              type="radio"
              :value="opt.value"
              :checked="modelValue.returnType === opt.value"
              @change="update({ returnType: opt.value })"
            />
            <span>{{ opt.label }}</span>
          </label>
        </div>
      </div>
      <div v-if="!modelValue.returnSame && modelValue.returnType === 'other'" class="scenario-field">
        <span class="scenario-label">{{ t('request.scenario.vehicle.returnOtherDetail') }}</span>
        <AddressAutocomplete
          :model-value="modelValue.returnLocation"
          :placeholder="t('request.scenario.vehicle.pickupOtherPlaceholder')"
          variant="light"
          @update:model-value="update({ returnLocation: $event })"
        />
      </div>
    </fieldset>

    <!-- ========== Section 3 : Conducteur ========== -->
    <fieldset class="scenario-block">
      <legend class="scenario-legend">{{ t('request.scenario.vehicle.sectionDriver') }}</legend>

      <div class="scenario-row">
        <label class="scenario-field">
          <span class="scenario-label">{{ t('request.scenario.vehicle.driverAge') }} <span class="req">*</span></span>
          <select
            :value="modelValue.driverAge"
            required
            @change="update({ driverAge: ($event.target as HTMLSelectElement).value as VehicleData['driverAge'] })"
          >
            <option value="">{{ t('request.scenario.vehicle.choose') }}</option>
            <option value="21-25">21 - 25</option>
            <option value="26-30">26 - 30</option>
            <option value="31+">31+</option>
          </select>
        </label>
        <label class="scenario-field">
          <span class="scenario-label">{{ t('request.scenario.vehicle.licenceCountry') }} <span class="req">*</span></span>
          <select
            :value="modelValue.licenceCountry"
            required
            @change="update({ licenceCountry: ($event.target as HTMLSelectElement).value })"
          >
            <option value="">{{ t('request.scenario.vehicle.choose') }}</option>
            <option v-for="c in COMMON_COUNTRIES" :key="c" :value="c">{{ c }}</option>
            <option value="other">{{ t('request.scenario.vehicle.licenceCountryOther') }}</option>
          </select>
        </label>
      </div>

      <!-- Toggle conducteur additionnel -->
      <label class="toggle-row">
        <input
          type="checkbox"
          :checked="modelValue.hasAdditionalDriver"
          @change="update({ hasAdditionalDriver: ($event.target as HTMLInputElement).checked })"
        />
        <span>{{ t('request.scenario.vehicle.additionalDriver') }}</span>
      </label>

      <div v-if="modelValue.hasAdditionalDriver" class="scenario-row">
        <label class="scenario-field">
          <span class="scenario-label">{{ t('request.scenario.vehicle.additionalDriverAge') }}</span>
          <select
            :value="modelValue.additionalDriverAge"
            @change="update({ additionalDriverAge: ($event.target as HTMLSelectElement).value as VehicleData['additionalDriverAge'] })"
          >
            <option value="">{{ t('request.scenario.vehicle.choose') }}</option>
            <option value="21-25">21 - 25</option>
            <option value="26-30">26 - 30</option>
            <option value="31+">31+</option>
          </select>
        </label>
        <label class="scenario-field">
          <span class="scenario-label">{{ t('request.scenario.vehicle.additionalDriverLicence') }}</span>
          <select
            :value="modelValue.additionalDriverLicence"
            @change="update({ additionalDriverLicence: ($event.target as HTMLSelectElement).value })"
          >
            <option value="">{{ t('request.scenario.vehicle.choose') }}</option>
            <option v-for="c in COMMON_COUNTRIES" :key="`a-${c}`" :value="c">{{ c }}</option>
            <option value="other">{{ t('request.scenario.vehicle.licenceCountryOther') }}</option>
          </select>
        </label>
      </div>
    </fieldset>

    <!-- ========== Notes libre ========== -->
    <fieldset class="scenario-block">
      <legend class="scenario-legend">{{ t('request.scenario.vehicle.sectionNotes') }}</legend>
      <label class="scenario-field">
        <span class="scenario-label">
          {{ t('request.scenario.vehicle.notes') }}
          <span class="optional">({{ t('request.contact.optional') }})</span>
        </span>
        <textarea
          rows="3"
          :value="modelValue.notes"
          :placeholder="t('request.scenario.vehicle.notesPlaceholder')"
          @input="update({ notes: ($event.target as HTMLTextAreaElement).value })"
        ></textarea>
      </label>
    </fieldset>
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
}
.scenario-legend {
  font-family: var(--font-display);
  font-size: 1rem;
  padding: 0 0.4rem;
  margin: 0;
  color: var(--color-misana-ink);
}

.pickup-options {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.25rem;
}
.pickup-option {
  flex: 1 1 calc(50% - 0.25rem);
  min-width: 7rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  padding: 0.7rem 1rem;
  border: 1px solid var(--color-misana-line);
  border-radius: 999px;
  cursor: pointer;
  font-size: 0.88rem;
  text-align: center;
  transition: border-color 0.2s ease, background 0.2s ease;
}
@media (min-width: 540px) {
  .pickup-option { flex: 0 1 auto; }
}
.pickup-option input[type="radio"] {
  accent-color: var(--color-misana-ink);
  margin: 0;
  width: 0.95rem;
  height: 0.95rem;
}
.pickup-option:has(input:checked) {
  border-color: var(--color-misana-ink);
  background: var(--color-misana-stone);
}

.toggle-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  cursor: pointer;
  padding: 0.6rem 0;
  font-size: 0.9rem;
  color: var(--color-misana-ink);
}
.toggle-row input[type="checkbox"] {
  accent-color: var(--color-misana-ink);
  margin: 0;
  width: 1.05rem;
  height: 1.05rem;
}

.scenario-error {
  color: #b00020;
  font-size: 0.78rem;
  margin-top: 0.25rem;
}
</style>
