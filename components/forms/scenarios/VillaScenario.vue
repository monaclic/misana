<script setup lang="ts">
// Scenario fiche villa : l'utilisateur arrive depuis /villas/[slug] avec
// service=villa&villa=<slug>. La villa est lockee (visible dans le
// ContextBanner). On collecte le sejour souhaite (arrivee / depart),
// le nombre de voyageurs et un message libre.
//
// V1 consultatif : pas de controle de dispo, pas de paiement. Les dates
// sont une intention ; l'equipe confirme la disponibilite au rappel.
import { saveDraft, loadDraft } from '~/composables/useRequestDraft';

export type VillaData = {
  startDate?: string;
  endDate?: string;
  guests?: number;
  notes?: string;
};

const props = defineProps<{
  modelValue: VillaData;
  prefill: Record<string, string | number | undefined>;
}>();

const emit = defineEmits<{ (e: 'update:modelValue', v: VillaData): void }>();

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
  const next: VillaData = {
    ...props.modelValue,
    startDate: props.modelValue.startDate || (props.prefill.date as string) || draft.date,
    endDate: props.modelValue.endDate || (props.prefill.dateEnd as string) || draft.dateEnd,
    guests: props.modelValue.guests || (typeof paxRaw === 'string' ? Number(paxRaw) : paxRaw) || draft.pax,
  };
  emit('update:modelValue', next);
});

function update(patch: Partial<VillaData>) {
  const next = { ...props.modelValue, ...patch };
  emit('update:modelValue', next);
  if (patch.startDate !== undefined || patch.endDate !== undefined || patch.guests !== undefined) {
    saveDraft({ date: next.startDate, dateEnd: next.endDate, pax: next.guests });
  }
}

const startError = computed(() => {
  const start = props.modelValue.startDate;
  if (!start) return null;
  if (start < tomorrow.value) return t('request.scenario.vehicle.dateTooEarly');
  if (start > oneYearFromNow.value) return t('request.scenario.vehicle.dateTooFar');
  return null;
});
const endError = computed(() => {
  const { startDate, endDate } = props.modelValue;
  if (!endDate || !startDate) return null;
  if (endDate <= startDate) return t('request.scenario.villa.endBeforeStart');
  return null;
});
</script>

<template>
  <div class="scenario-sections">
    <!-- ========== Section 1 : Sejour ========== -->
    <fieldset class="scenario-block">
      <legend class="scenario-legend">{{ t('request.scenario.villa.sectionStay') }}</legend>

      <div class="scenario-row">
        <label class="scenario-field">
          <span class="scenario-label">{{ t('request.scenario.villa.checkIn') }} <span class="req">*</span></span>
          <input
            type="date"
            :value="modelValue.startDate"
            :min="tomorrow"
            :max="oneYearFromNow"
            required
            @change="update({ startDate: ($event.target as HTMLInputElement).value })"
          />
          <span v-if="startError" class="scenario-error">{{ startError }}</span>
        </label>
        <label class="scenario-field">
          <span class="scenario-label">{{ t('request.scenario.villa.checkOut') }} <span class="req">*</span></span>
          <input
            type="date"
            :value="modelValue.endDate"
            :min="modelValue.startDate || tomorrow"
            :max="oneYearFromNow"
            required
            @change="update({ endDate: ($event.target as HTMLInputElement).value })"
          />
          <span v-if="endError" class="scenario-error">{{ endError }}</span>
        </label>
      </div>
    </fieldset>

    <!-- ========== Section : Voyageurs ========== -->
    <fieldset class="scenario-block">
      <legend class="scenario-legend">{{ t('request.scenario.villa.sectionGuests') }}</legend>

      <label class="scenario-field">
        <span class="scenario-label">{{ t('request.scenario.villa.guests') }} <span class="req">*</span></span>
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
      <legend class="scenario-legend">{{ t('request.scenario.villa.sectionNotes') }}</legend>
      <label class="scenario-field">
        <span class="scenario-label">
          {{ t('request.scenario.villa.notes') }}
          <span class="optional">({{ t('request.contact.optional') }})</span>
        </span>
        <textarea
          rows="3"
          :value="modelValue.notes"
          :placeholder="t('request.scenario.villa.notesPlaceholder')"
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
.scenario-error {
  color: #b00020;
  font-size: 0.78rem;
  margin-top: 0.25rem;
}
</style>
