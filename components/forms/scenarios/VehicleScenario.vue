<script setup lang="ts">
// Scenario fiche voiture : l'utilisateur a clique "Reserver ce vehicule"
// sur /services/cars/[brandModel]. La voiture est lockee (pas de selection
// dans le form). Demande : pickup, dates, age conducteur, pays permis, notes.
import { saveDraft, loadDraft } from '~/composables/useRequestDraft';

export type VehicleData = {
  pickup?: string;
  startDate?: string;
  endDate?: string;
  driverAge?: '21-25' | '26-30' | '31+';
  licenceCountry?: string;
  notes?: string;
};

const props = defineProps<{
  modelValue: VehicleData;
  prefill: Record<string, string | number | undefined>;
}>();

const emit = defineEmits<{ (e: 'update:modelValue', v: VehicleData): void }>();

const { t } = useI18n();

// Hydratation au mount : prefill query > draft sessionStorage > defaut
onMounted(() => {
  const draft = loadDraft();
  const next: VehicleData = {
    ...props.modelValue,
    pickup: props.modelValue.pickup || (props.prefill.city as string) || undefined,
    startDate: props.modelValue.startDate || (props.prefill.date as string) || draft.date,
    endDate: props.modelValue.endDate || (props.prefill.dateEnd as string) || draft.dateEnd,
  };
  emit('update:modelValue', next);
});

function update(patch: Partial<VehicleData>) {
  const next = { ...props.modelValue, ...patch };
  emit('update:modelValue', next);
  // Persiste les dates pour cross-fiche
  if (patch.startDate !== undefined || patch.endDate !== undefined) {
    saveDraft({ date: next.startDate, dateEnd: next.endDate });
  }
}
</script>

<template>
  <fieldset class="scenario-block">
    <legend class="scenario-legend">{{ t('request.scenario.vehicle.title') }}</legend>

    <label class="scenario-field">
      <span class="scenario-label">{{ t('request.scenario.vehicle.pickup') }}</span>
      <input
        type="text"
        :value="modelValue.pickup"
        :placeholder="t('request.scenario.vehicle.pickupPlaceholder')"
        @input="update({ pickup: ($event.target as HTMLInputElement).value })"
      />
    </label>

    <div class="scenario-row">
      <label class="scenario-field">
        <span class="scenario-label">{{ t('request.scenario.vehicle.startDate') }} <span class="req">*</span></span>
        <input
          type="date"
          :value="modelValue.startDate"
          required
          @change="update({ startDate: ($event.target as HTMLInputElement).value })"
        />
      </label>
      <label class="scenario-field">
        <span class="scenario-label">{{ t('request.scenario.vehicle.endDate') }} <span class="req">*</span></span>
        <input
          type="date"
          :value="modelValue.endDate"
          required
          @change="update({ endDate: ($event.target as HTMLInputElement).value })"
        />
      </label>
    </div>

    <div class="scenario-row">
      <label class="scenario-field">
        <span class="scenario-label">{{ t('request.scenario.vehicle.driverAge') }}</span>
        <select
          :value="modelValue.driverAge"
          @change="update({ driverAge: ($event.target as HTMLSelectElement).value as VehicleData['driverAge'] })"
        >
          <option value="">{{ t('request.scenario.vehicle.choose') }}</option>
          <option value="21-25">21 - 25</option>
          <option value="26-30">26 - 30</option>
          <option value="31+">31+</option>
        </select>
      </label>
      <label class="scenario-field">
        <span class="scenario-label">{{ t('request.scenario.vehicle.licenceCountry') }}</span>
        <input
          type="text"
          :value="modelValue.licenceCountry"
          :placeholder="t('request.scenario.vehicle.licenceCountryPlaceholder')"
          @input="update({ licenceCountry: ($event.target as HTMLInputElement).value })"
        />
      </label>
    </div>

    <label class="scenario-field">
      <span class="scenario-label">
        {{ t('request.scenario.vehicle.notes') }}
        <span class="optional">({{ t('request.contact.optional') }})</span>
      </span>
      <textarea
        rows="2"
        :value="modelValue.notes"
        :placeholder="t('request.scenario.vehicle.notesPlaceholder')"
        @input="update({ notes: ($event.target as HTMLTextAreaElement).value })"
      ></textarea>
    </label>
  </fieldset>
</template>

<style scoped src="./_shared.css"></style>
