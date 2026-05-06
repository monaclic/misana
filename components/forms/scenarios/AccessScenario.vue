<script setup lang="ts">
// Scenario fiche etablissement : utilisateur arrive depuis
// /access/[slug] avec service=access&establishment=<slug>.
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
  meal?: 'lunch' | 'dinner';
  occasion?: 'none' | 'birthday' | 'anniversary' | 'business' | 'celebration' | 'other';
  notes?: string;
};

const props = defineProps<{
  modelValue: AccessData;
  prefill: Record<string, string | number | undefined>;
}>();

const emit = defineEmits<{ (e: 'update:modelValue', v: AccessData): void }>();

const { t, locale } = useI18n();

// Si le widget de fiche a deja rempli date + guests (+ meal),
// on masque les sections "Reservation" + "Convives" et on affiche
// juste un recap. L'utilisateur peut modifier via "Modifier ce choix"
// dans le bandeau (retour fiche).
const isPrefilledFromFiche = computed(() => {
  return !!(props.prefill.date && props.prefill.pax);
});

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
    meal: props.modelValue.meal || (props.prefill.meal as 'lunch' | 'dinner' | undefined),
    occasion: props.modelValue.occasion || 'none',
  };
  emit('update:modelValue', next);
});

// Format date pour le recap (locale-aware).
const dateFormatted = computed(() => {
  const d = props.modelValue.date;
  if (!d) return '';
  return new Date(d).toLocaleDateString(locale.value === 'fr' ? 'fr-FR' : 'en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
});

const mealLabel = computed(() => {
  const m = props.modelValue.meal;
  if (m === 'lunch') return t('request.scenario.access.mealLunch');
  if (m === 'dinner') return t('request.scenario.access.mealDinner');
  return undefined;
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
    <!-- Recap quand le widget fiche a deja rempli (date + pax). -->
    <div v-if="isPrefilledFromFiche" class="recap-block">
      <p class="recap-kicker">{{ t('request.scenario.access.recapKicker') }}</p>
      <ul class="recap-list">
        <li v-if="dateFormatted">
          <span class="recap-label">{{ t('request.scenario.access.date') }}</span>
          <span class="recap-value">{{ dateFormatted }}</span>
        </li>
        <li v-if="mealLabel">
          <span class="recap-label">{{ t('request.scenario.access.service') }}</span>
          <span class="recap-value">{{ mealLabel }}</span>
        </li>
        <li v-if="modelValue.guests">
          <span class="recap-label">{{ t('request.scenario.access.guests') }}</span>
          <span class="recap-value">{{ modelValue.guests }}</span>
        </li>
      </ul>
    </div>

    <!-- ========== Section 1 : Reservation (cachee si prefilled) ========== -->
    <fieldset v-if="!isPrefilledFromFiche" class="scenario-block">
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

    <!-- ========== Section 2 : Convives (cachee si prefilled) ========== -->
    <fieldset v-if="!isPrefilledFromFiche" class="scenario-block">
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

    <!-- ========== Section 2bis : Occasion seule si prefilled ========== -->
    <fieldset v-else class="scenario-block">
      <legend class="scenario-legend">{{ t('request.scenario.access.sectionOccasion') }}</legend>
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

.recap-block {
  padding: 1rem 1.1rem;
  background: var(--color-misana-stone);
  border-radius: 4px;
}
.recap-kicker {
  font-size: 0.65rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--color-misana-muted);
  margin: 0 0 0.6rem;
}
.recap-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.recap-list li {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 1rem;
  padding-bottom: 0.4rem;
  border-bottom: 1px solid var(--color-misana-line);
}
.recap-list li:last-child {
  border-bottom: 0;
  padding-bottom: 0;
}
.recap-label {
  font-size: 0.75rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-misana-muted);
}
.recap-value {
  font-size: 0.95rem;
  color: var(--color-misana-ink);
}
</style>
