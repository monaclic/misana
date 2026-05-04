<script setup lang="ts">
// Scenario fiche etablissement : "Reserver" depuis /services/access/[slug].
// Etablissement locke. Demande : date, heure, convives, occasion, allergies.
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
</script>

<template>
  <fieldset class="scenario-block">
    <legend class="scenario-legend">{{ t('request.scenario.access.title') }}</legend>

    <div class="scenario-row">
      <label class="scenario-field">
        <span class="scenario-label">{{ t('request.scenario.access.date') }} <span class="req">*</span></span>
        <input
          type="date"
          :value="modelValue.date"
          required
          @change="update({ date: ($event.target as HTMLInputElement).value })"
        />
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

    <label class="scenario-field">
      <span class="scenario-label">
        {{ t('request.scenario.access.notes') }}
        <span class="optional">({{ t('request.contact.optional') }})</span>
      </span>
      <textarea
        rows="2"
        :value="modelValue.notes"
        :placeholder="t('request.scenario.access.notesPlaceholder')"
        @input="update({ notes: ($event.target as HTMLTextAreaElement).value })"
      ></textarea>
    </label>
  </fieldset>
</template>

<style scoped src="./_shared.css"></style>
