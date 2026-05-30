<script setup lang="ts">
// Scenario access-generic : utilisateur arrive sur /request?service=access
// sans avoir choisi un etablissement (ex via le service-picker depuis la
// home, ou en saisissant directement l'URL). Le esprit "concierge Misana"
// veut qu'on lui demande son intent (quel type d'adresse, ou, quand) et
// que l'equipe propose la bonne adresse au rappel. Pas de catalogue
// d'etablissements impose ici - le user dit ce qu'il veut, Misana arrange.
//
// Pour les arrivees depuis une fiche /reservations/[etablissement],
// c'est l'AccessScenario classique qui s'occupe (etablissement locke).
import { saveDraft, loadDraft } from '~/composables/useRequestDraft';

export type AccessGenericData = {
  category?: 'restaurant' | 'palace' | 'beach-club' | 'nightlife' | 'other';
  city?: string;
  date?: string;
  time?: string;
  guests?: number;
  occasion?: 'none' | 'birthday' | 'anniversary' | 'business' | 'celebration' | 'other';
  notes?: string;
};

const props = defineProps<{
  modelValue: AccessGenericData;
  prefill: Record<string, string | number | undefined>;
}>();

const emit = defineEmits<{ (e: 'update:modelValue', v: AccessGenericData): void }>();

const { t } = useI18n();

// Reservation last-minute frequente sur l'access (table le soir meme).
// Min = aujourd'hui (pas demain comme cars/yacht).
const today = computed(() => new Date().toISOString().slice(0, 10));
const oneYearFromNow = computed(() => {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().slice(0, 10);
});

// Les 8 destinations V1 Misana + "other" pour le hors-zone occasionnel.
// Order : sud-ouest -> est, comme la Riviera physique.
// Labels reutilisent les cles existantes request.destination.* du
// formulaire principal, deja traduites EN/FR.
const CITIES = [
  { value: 'saint-tropez', labelKey: 'request.destination.saint-tropez' },
  { value: 'cannes', labelKey: 'request.destination.cannes' },
  { value: 'cap-d-antibes', labelKey: 'request.destination.cap-d-antibes' },
  { value: 'cap-ferrat', labelKey: 'request.destination.cap-ferrat' },
  { value: 'nice', labelKey: 'request.destination.nice' },
  { value: 'eze', labelKey: 'request.destination.eze' },
  { value: 'monaco', labelKey: 'request.destination.monaco' },
  { value: 'menton', labelKey: 'request.destination.menton' },
  { value: 'other', labelKey: 'request.scenario.accessGeneric.cityOther' },
] as const;

// Pre-hydrate depuis la query (city) et le draft (date/pax conserves
// entre scenarios via useRequestDraft).
onMounted(() => {
  const draft = loadDraft();
  const paxRaw = props.prefill.pax;
  const next: AccessGenericData = {
    ...props.modelValue,
    city: props.modelValue.city || (props.prefill.city as string) || undefined,
    date: props.modelValue.date || (props.prefill.date as string) || draft.date,
    time: props.modelValue.time || (props.prefill.time as string) || draft.time,
    guests: props.modelValue.guests
      || (typeof paxRaw === 'string' ? Number(paxRaw) : paxRaw)
      || draft.pax,
    occasion: props.modelValue.occasion || 'none',
  };
  emit('update:modelValue', next);
});

function update(patch: Partial<AccessGenericData>) {
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
    <p class="scenario-intro">{{ t('request.scenario.accessGeneric.intro') }}</p>

    <!-- ========== Section 1 : Type d adresse + Ville ========== -->
    <fieldset class="scenario-block">
      <legend class="scenario-legend">{{ t('request.scenario.accessGeneric.sectionWhat') }}</legend>

      <div class="scenario-row">
        <label class="scenario-field">
          <span class="scenario-label">{{ t('request.scenario.accessGeneric.category') }} <span class="req">*</span></span>
          <select
            :value="modelValue.category"
            required
            @change="update({ category: ($event.target as HTMLSelectElement).value as AccessGenericData['category'] })"
          >
            <option value="">{{ t('request.scenario.accessGeneric.choose') }}</option>
            <option value="restaurant">{{ t('request.scenario.accessGeneric.categoryRestaurant') }}</option>
            <option value="palace">{{ t('request.scenario.accessGeneric.categoryPalace') }}</option>
            <option value="beach-club">{{ t('request.scenario.accessGeneric.categoryBeachClub') }}</option>
            <option value="nightlife">{{ t('request.scenario.accessGeneric.categoryNightlife') }}</option>
            <option value="other">{{ t('request.scenario.accessGeneric.categoryOther') }}</option>
          </select>
        </label>
        <label class="scenario-field">
          <span class="scenario-label">{{ t('request.scenario.accessGeneric.city') }} <span class="req">*</span></span>
          <select
            :value="modelValue.city"
            required
            @change="update({ city: ($event.target as HTMLSelectElement).value })"
          >
            <option value="">{{ t('request.scenario.accessGeneric.choose') }}</option>
            <option v-for="c in CITIES" :key="c.value" :value="c.value">{{ t(c.labelKey) }}</option>
          </select>
        </label>
      </div>
    </fieldset>

    <!-- ========== Section 2 : Quand + Combien ========== -->
    <fieldset class="scenario-block">
      <legend class="scenario-legend">{{ t('request.scenario.accessGeneric.sectionWhen') }}</legend>

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
            @change="update({ occasion: ($event.target as HTMLSelectElement).value as AccessGenericData['occasion'] })"
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

    <!-- ========== Notes libres ========== -->
    <fieldset class="scenario-block">
      <legend class="scenario-legend">{{ t('request.scenario.access.sectionNotes') }}</legend>
      <label class="scenario-field">
        <span class="scenario-label">
          {{ t('request.scenario.accessGeneric.notes') }}
          <span class="optional">({{ t('request.contact.optional') }})</span>
        </span>
        <textarea
          rows="3"
          :value="modelValue.notes"
          :placeholder="t('request.scenario.accessGeneric.notesPlaceholder')"
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
.scenario-intro {
  font-size: 0.95rem;
  line-height: 1.55;
  color: var(--color-misana-ink);
  margin: 0 0 0.25rem;
  max-width: 50ch;
}
</style>
</content>
</invoke>