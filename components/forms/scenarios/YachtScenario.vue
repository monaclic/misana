<script setup lang="ts">
// Scenario fiche yacht : utilisateur arrive depuis /services/yacht/[yacht]
// avec service=yacht&yacht=<id>. Le yacht est locke (visible dans le
// ContextBanner). On collecte juste ce qui declenche le rappel humain.
//
// V1 consultatif : pas d'heures, pas de paiement en ligne. Une date,
// une duree approximative, un port, le nombre d'invites. Le reste se
// cale au telephone (chef, route, equipement).
import { saveDraft, loadDraft } from '~/composables/useRequestDraft';
import AddressAutocomplete from '~/components/forms/AddressAutocomplete.vue';

export type YachtData = {
  startDate?: string;
  durationApprox?: 'half-day' | 'day' | 'evening' | 'week';
  portType?: 'saint-tropez' | 'cannes' | 'antibes' | 'monaco' | 'other';
  port?: string;
  guests?: number;
  notes?: string;
};

const props = defineProps<{
  modelValue: YachtData;
  prefill: Record<string, string | number | undefined>;
}>();

const emit = defineEmits<{ (e: 'update:modelValue', v: YachtData): void }>();

const { t } = useI18n();

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

onMounted(() => {
  const draft = loadDraft();
  const paxRaw = props.prefill.pax;
  const next: YachtData = {
    ...props.modelValue,
    startDate: props.modelValue.startDate || (props.prefill.date as string) || draft.date,
    guests: props.modelValue.guests || (typeof paxRaw === 'string' ? Number(paxRaw) : paxRaw) || draft.pax,
  };
  emit('update:modelValue', next);
});

function update(patch: Partial<YachtData>) {
  const next = { ...props.modelValue, ...patch };
  emit('update:modelValue', next);
  if (patch.startDate !== undefined || patch.guests !== undefined) {
    saveDraft({ date: next.startDate, pax: next.guests });
  }
}

const dateError = computed(() => {
  if (!props.modelValue.startDate) return null;
  const start = props.modelValue.startDate;
  if (start < tomorrow.value) return t('request.scenario.vehicle.dateTooEarly');
  if (start > oneYearFromNow.value) return t('request.scenario.vehicle.dateTooFar');
  return null;
});

const portOptions = computed(() => [
  { value: 'saint-tropez' as const, label: 'Saint-Tropez' },
  { value: 'cannes' as const, label: 'Cannes' },
  { value: 'antibes' as const, label: 'Antibes' },
  { value: 'monaco' as const, label: 'Monaco' },
  { value: 'other' as const, label: t('request.scenario.yacht.portOther') },
]);
</script>

<template>
  <div class="scenario-sections">
    <!-- ========== Section 1 : Periode ========== -->
    <fieldset class="scenario-block">
      <legend class="scenario-legend">{{ t('request.scenario.yacht.sectionPeriod') }}</legend>

      <div class="scenario-row">
        <label class="scenario-field">
          <span class="scenario-label">{{ t('request.scenario.yacht.startDate') }} <span class="req">*</span></span>
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
          <span class="scenario-label">{{ t('request.scenario.yacht.duration') }} <span class="req">*</span></span>
          <select
            :value="modelValue.durationApprox"
            required
            @change="update({ durationApprox: ($event.target as HTMLSelectElement).value as YachtData['durationApprox'] })"
          >
            <option value="">{{ t('request.scenario.yacht.durationChoose') }}</option>
            <option value="half-day">{{ t('request.scenario.yacht.durationHalfDay') }}</option>
            <option value="day">{{ t('request.scenario.yacht.durationDay') }}</option>
            <option value="evening">{{ t('request.scenario.yacht.durationEvening') }}</option>
            <option value="week">{{ t('request.scenario.yacht.durationWeek') }}</option>
          </select>
        </label>
      </div>
    </fieldset>

    <!-- ========== Section 2 : Embarquement ========== -->
    <fieldset class="scenario-block">
      <legend class="scenario-legend">{{ t('request.scenario.yacht.sectionEmbarkation') }}</legend>

      <div class="scenario-field">
        <span class="scenario-label">{{ t('request.scenario.yacht.port') }} <span class="req">*</span></span>
        <div class="port-options">
          <label v-for="opt in portOptions" :key="opt.value" class="port-option">
            <input
              type="radio"
              :value="opt.value"
              :checked="modelValue.portType === opt.value"
              @change="update({ portType: opt.value })"
            />
            <span>{{ opt.label }}</span>
          </label>
        </div>
      </div>

      <div v-if="modelValue.portType === 'other'" class="scenario-field">
        <span class="scenario-label">{{ t('request.scenario.yacht.portOtherDetail') }}</span>
        <AddressAutocomplete
          :model-value="modelValue.port"
          :placeholder="t('request.scenario.yacht.portOtherPlaceholder')"
          variant="light"
          @update:model-value="update({ port: $event })"
        />
      </div>
    </fieldset>

    <!-- ========== Section 3 : Invites ========== -->
    <fieldset class="scenario-block">
      <legend class="scenario-legend">{{ t('request.scenario.yacht.sectionOnboard') }}</legend>

      <label class="scenario-field">
        <span class="scenario-label">{{ t('request.scenario.yacht.guests') }} <span class="req">*</span></span>
        <input
          type="number"
          min="1"
          max="50"
          :value="modelValue.guests"
          required
          @input="update({ guests: Number(($event.target as HTMLInputElement).value) || undefined })"
        />
      </label>
    </fieldset>

    <!-- ========== Precisions ========== -->
    <fieldset class="scenario-block">
      <legend class="scenario-legend">{{ t('request.scenario.yacht.sectionNotes') }}</legend>
      <label class="scenario-field">
        <span class="scenario-label">
          {{ t('request.scenario.yacht.notes') }}
          <span class="optional">({{ t('request.contact.optional') }})</span>
        </span>
        <textarea
          rows="3"
          :value="modelValue.notes"
          :placeholder="t('request.scenario.yacht.notesPlaceholder')"
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

.port-options {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.25rem;
}
.port-option {
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
  .port-option { flex: 0 1 auto; }
}
.port-option input[type="radio"] {
  accent-color: var(--color-misana-ink);
  margin: 0;
  width: 0.95rem;
  height: 0.95rem;
}
.port-option:has(input:checked) {
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
