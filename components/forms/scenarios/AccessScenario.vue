<script setup lang="ts">
// Scenario fiche etablissement : utilisateur arrive depuis
// /services/access/[slug] avec service=access&establishment=<slug>.
// L'etablissement est locke (visible dans le ContextBanner). On
// collecte juste ce qui declenche le rappel humain : date + heure
// + nombre de convives + occasion + precisions.
//
// Aussi utilise quand l'utilisateur arrive depuis le picker home
// (form quick search) avec establishment + date + guests pre-remplis.
import { saveDraft, loadDraft } from '~/composables/useRequestDraft';

export type AccessData = {
  date?: string;
  time?: string;
  guests?: number;
  occasion?: 'none' | 'birthday' | 'anniversary' | 'business' | 'celebration' | 'other';
  notes?: string;
};

const props = defineProps<{
  modelValue: AccessData;
  prefill: Record<string, string | number | undefined>;
}>();

const emit = defineEmits<{ (e: 'update:modelValue', v: AccessData): void }>();

const { t } = useI18n();

// Validation : restaurant peut etre reserve aujourd'hui (last-minute
// frequent), donc min = aujourd'hui (pas demain comme cars/yacht).
const today = computed(() => new Date().toISOString().slice(0, 10));
const oneYearFromNow = computed(() => {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().slice(0, 10);
});

onMounted(() => {
  const draft = loadDraft();
  const paxRaw = props.prefill.pax;
  const next: AccessData = {
    ...props.modelValue,
    date: props.modelValue.date || (props.prefill.date as string) || draft.date,
    time: props.modelValue.time || (props.prefill.time as string) || draft.time,
    guests: props.modelValue.guests || (typeof paxRaw === 'string' ? Number(paxRaw) : paxRaw) || draft.pax,
    occasion: props.modelValue.occasion || 'none',
  };
  emit('update:modelValue', next);
});

function update(patch: Partial<AccessData>) {
  const next = { ...props.modelValue, ...patch };
  emit('update:modelValue', next);
  if (patch.date !== undefined || patch.time !== undefined || patch.guests !== undefined) {
    saveDraft({ date: next.date, time: next.time, pax: next.guests });
  }
}

const dateError = computed(() => {
  if (!props.modelValue.date) return null;
  const d = props.modelValue.date;
  if (d < today.value) return t('request.scenario.access.dateTooEarly');
  if (d > oneYearFromNow.value) return t('request.scenario.access.dateTooFar');
  return null;
});
</script>

<template>
  <div class="scenario-sections">
    <!-- ========== Section 1 : Reservation ========== -->
    <fieldset class="scenario-block">
      <legend class="scenario-legend">{{ t('request.scenario.access.sectionReservation') }}</legend>

      <div class="scenario-row">
        <label class="scenario-field">
          <span class="scenario-label">{{ t('request.scenario.access.date') }} <span class="req">*</span></span>
          <input
            type="date"
            :value="modelValue.date"
            :min="today"
            :max="oneYearFromNow"
            required
            @change="update({ date: ($event.target as HTMLInputElement).value })"
          />
          <span v-if="dateError" class="scenario-error">{{ dateError }}</span>
        </label>
        <label class="scenario-field">
          <span class="scenario-label">{{ t('request.scenario.access.time') }} <span class="req">*</span></span>
          <input
            type="time"
            :value="modelValue.time"
            required
            @change="update({ time: ($event.target as HTMLInputElement).value })"
          />
        </label>
      </div>
    </fieldset>

    <!-- ========== Section 2 : Convives ========== -->
    <fieldset class="scenario-block">
      <legend class="scenario-legend">{{ t('request.scenario.access.sectionGuests') }}</legend>

      <div class="scenario-row">
        <label class="scenario-field">
          <span class="scenario-label">{{ t('request.scenario.access.guests') }} <span class="req">*</span></span>
          <input
            type="number"
            min="1"
            max="50"
            :value="modelValue.guests"
            required
            @input="update({ guests: Number(($event.target as HTMLInputElement).value) || undefined })"
          />
        </label>
        <label class="scenario-field">
          <span class="scenario-label">{{ t('request.scenario.access.occasion') }}</span>
          <select
            :value="modelValue.occasion"
            @change="update({ occasion: ($event.target as HTMLSelectElement).value as AccessData['occasion'] })"
          >
            <option value="none">{{ t('request.scenario.access.occasionNone') }}</option>
            <option value="birthday">{{ t('request.scenario.access.occasionBirthday') }}</option>
            <option value="anniversary">{{ t('request.scenario.access.occasionAnniversary') }}</option>
            <option value="business">{{ t('request.scenario.access.occasionBusiness') }}</option>
            <option value="celebration">{{ t('request.scenario.access.occasionCelebration') }}</option>
            <option value="other">{{ t('request.scenario.access.occasionOther') }}</option>
          </select>
        </label>
      </div>
    </fieldset>

    <!-- ========== Section 3 : Precisions ========== -->
    <fieldset class="scenario-block">
      <legend class="scenario-legend">{{ t('request.scenario.access.sectionNotes') }}</legend>
      <label class="scenario-field">
        <span class="scenario-label">
          {{ t('request.scenario.access.notes') }}
          <span class="optional">({{ t('request.contact.optional') }})</span>
        </span>
        <textarea
          rows="3"
          :value="modelValue.notes"
          :placeholder="t('request.scenario.access.notesPlaceholder')"
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
