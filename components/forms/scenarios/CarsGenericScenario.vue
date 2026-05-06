<script setup lang="ts">
// Scenario cars sans vehicule precis : utilisateur arrive avec
// service=cars mais pas de vehicle selectionne. On suggere d'aller
// voir la flotte, et on offre quand meme un form minimal pour
// decrire le besoin.
import { saveDraft, loadDraft } from '~/composables/useRequestDraft';
import { CAR_TYPES, CAR_BRANDS } from '~/types/request';

export type CarsGenericData = {
  type?: typeof CAR_TYPES[number];
  brand?: typeof CAR_BRANDS[number];
  pickupType?: 'airport' | 'hotel' | 'villa' | 'other';
  pickup?: string;
  startDate?: string;
  endDate?: string;
  driverAge?: '21-25' | '26-30' | '31+';
  notes?: string;
};

const props = defineProps<{
  modelValue: CarsGenericData;
  prefill: Record<string, string | number | undefined>;
}>();

const emit = defineEmits<{ (e: 'update:modelValue', v: CarsGenericData): void }>();

const { t, locale } = useI18n();
const localePath = useLocalePath();

const today = computed(() => new Date().toISOString().slice(0, 10));

onMounted(() => {
  const draft = loadDraft();
  const next: CarsGenericData = {
    ...props.modelValue,
    type: props.modelValue.type || (props.prefill.carType as any),
    brand: props.modelValue.brand || (props.prefill.brand as any),
    startDate: props.modelValue.startDate || (props.prefill.date as string) || draft.date,
    endDate: props.modelValue.endDate || (props.prefill.dateEnd as string) || draft.dateEnd,
  };
  emit('update:modelValue', next);
});

function update(patch: Partial<CarsGenericData>) {
  const next = { ...props.modelValue, ...patch };
  emit('update:modelValue', next);
  if (patch.startDate !== undefined || patch.endDate !== undefined) {
    saveDraft({ date: next.startDate, dateEnd: next.endDate });
  }
}

const pickupOptions = computed(() => [
  { value: 'airport' as const, label: t('request.scenario.vehicle.pickupAirport') },
  { value: 'hotel' as const, label: t('request.scenario.vehicle.pickupHotel') },
  { value: 'villa' as const, label: t('request.scenario.vehicle.pickupVilla') },
  { value: 'other' as const, label: t('request.scenario.vehicle.pickupOther') },
]);
</script>

<template>
  <fieldset class="scenario-block">
    <legend class="scenario-legend">{{ t('request.scenario.carsGeneric.title') }}</legend>

    <!-- Suggestion : aller voir la flotte plutot que decrire en libre -->
    <NuxtLink
      :to="localePath({ name: 'voitures-all' })"
      class="scenario-suggestion"
    >
      <span class="scenario-suggestion-text">
        {{ t('request.scenario.carsGeneric.suggestion') }}
      </span>
      <span class="scenario-suggestion-arrow" aria-hidden="true">→</span>
    </NuxtLink>

    <p class="scenario-or">{{ t('request.scenario.carsGeneric.or') }}</p>

    <!-- Type + marque -->
    <div class="scenario-row">
      <label class="scenario-field">
        <span class="scenario-label">{{ t('request.scenario.carsGeneric.type') }}</span>
        <select
          :value="modelValue.type"
          @change="update({ type: ($event.target as HTMLSelectElement).value as CarsGenericData['type'] })"
        >
          <option value="">{{ t('request.scenario.carsGeneric.typeAny') }}</option>
          <option v-for="t_ in CAR_TYPES" :key="t_" :value="t_">
            {{ t(`cars.category.${t_ === 'grand-tourer' ? 'sport' : t_}`) }}
          </option>
        </select>
      </label>
      <label class="scenario-field">
        <span class="scenario-label">{{ t('request.scenario.carsGeneric.brand') }}</span>
        <select
          :value="modelValue.brand"
          @change="update({ brand: ($event.target as HTMLSelectElement).value as CarsGenericData['brand'] })"
        >
          <option value="">{{ t('request.scenario.carsGeneric.brandAny') }}</option>
          <option v-for="b in CAR_BRANDS" :key="b" :value="b">
            {{ b.charAt(0).toUpperCase() + b.slice(1).replace('-', ' ') }}
          </option>
        </select>
      </label>
    </div>

    <!-- Lieu livraison -->
    <div class="scenario-field">
      <span class="scenario-label">{{ t('request.scenario.vehicle.pickupType') }}</span>
      <div class="pickup-options">
        <label
          v-for="opt in pickupOptions"
          :key="opt.value"
          class="pickup-option"
        >
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

    <label v-if="modelValue.pickupType === 'other'" class="scenario-field">
      <span class="scenario-label">{{ t('request.scenario.vehicle.pickupOtherDetail') }}</span>
      <input
        type="text"
        :value="modelValue.pickup"
        :placeholder="t('request.scenario.vehicle.pickupOtherPlaceholder')"
        @input="update({ pickup: ($event.target as HTMLInputElement).value })"
      />
    </label>

    <!-- Dates -->
    <div class="scenario-row">
      <label class="scenario-field">
        <span class="scenario-label">{{ t('request.scenario.vehicle.startDate') }}</span>
        <input
          type="date"
          :value="modelValue.startDate"
          :min="today"
          @change="update({ startDate: ($event.target as HTMLInputElement).value })"
        />
      </label>
      <label class="scenario-field">
        <span class="scenario-label">{{ t('request.scenario.vehicle.endDate') }}</span>
        <input
          type="date"
          :value="modelValue.endDate"
          :min="modelValue.startDate || today"
          @change="update({ endDate: ($event.target as HTMLInputElement).value })"
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
        :placeholder="t('request.scenario.carsGeneric.notesPlaceholder')"
        @input="update({ notes: ($event.target as HTMLTextAreaElement).value })"
      ></textarea>
    </label>
  </fieldset>
</template>

<style scoped src="./_shared.css"></style>
<style scoped>
.scenario-suggestion {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.85rem 1rem;
  border: 1px solid var(--color-misana-ink);
  border-radius: 2px;
  text-decoration: none;
  color: var(--color-misana-ink);
  font-size: 0.9rem;
  transition: background 0.2s ease;
}
.scenario-suggestion:hover {
  background: var(--color-misana-stone);
}
.scenario-suggestion-arrow {
  font-size: 1.1rem;
}
.scenario-or {
  text-align: center;
  font-size: 0.7rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--color-misana-muted);
  margin: 0.6rem 0 0.4rem;
}

.pickup-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}
@media (min-width: 640px) {
  .pickup-options { grid-template-columns: repeat(4, 1fr); }
}
.pickup-option {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.6rem 0.85rem;
  border: 1px solid var(--color-misana-line);
  border-radius: 2px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: border-color 0.2s ease, background 0.2s ease;
}
.pickup-option input[type="radio"] {
  accent-color: var(--color-misana-ink);
  margin: 0;
}
.pickup-option:has(input:checked) {
  border-color: var(--color-misana-ink);
  background: var(--color-misana-stone);
}
</style>
