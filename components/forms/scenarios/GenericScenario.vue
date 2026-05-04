<script setup lang="ts">
// Scenario generique / fallback : utilise pour les scenarios pas encore
// implementes (chauffeur, helicopter, hub generic, event, weekend, multi,
// service-picker). Demande dates approx + pax + message libre.
// Sera remplace progressivement dans les push 3 et 4.
import { saveDraft, loadDraft } from '~/composables/useRequestDraft';

export type GenericData = {
  date?: string;
  dateEnd?: string;
  pax?: number;
  notes?: string;
};

const props = defineProps<{
  modelValue: GenericData;
  prefill: Record<string, string | number | undefined>;
}>();

const emit = defineEmits<{ (e: 'update:modelValue', v: GenericData): void }>();

const { t } = useI18n();

onMounted(() => {
  const draft = loadDraft();
  const paxRaw = props.prefill.pax;
  const next: GenericData = {
    ...props.modelValue,
    date: props.modelValue.date || (props.prefill.date as string) || draft.date,
    dateEnd: props.modelValue.dateEnd || (props.prefill.dateEnd as string) || draft.dateEnd,
    pax: props.modelValue.pax || (typeof paxRaw === 'string' ? Number(paxRaw) : paxRaw) || draft.pax,
  };
  emit('update:modelValue', next);
});

function update(patch: Partial<GenericData>) {
  const next = { ...props.modelValue, ...patch };
  emit('update:modelValue', next);
  if (patch.date !== undefined || patch.dateEnd !== undefined || patch.pax !== undefined) {
    saveDraft({ date: next.date, dateEnd: next.dateEnd, pax: next.pax });
  }
}
</script>

<template>
  <fieldset class="scenario-block">
    <legend class="scenario-legend">{{ t('request.scenario.generic.title') }}</legend>

    <div class="scenario-row">
      <label class="scenario-field">
        <span class="scenario-label">{{ t('request.scenario.generic.dateFrom') }}</span>
        <input
          type="date"
          :value="modelValue.date"
          @change="update({ date: ($event.target as HTMLInputElement).value })"
        />
      </label>
      <label class="scenario-field">
        <span class="scenario-label">{{ t('request.scenario.generic.dateTo') }}</span>
        <input
          type="date"
          :value="modelValue.dateEnd"
          @change="update({ dateEnd: ($event.target as HTMLInputElement).value })"
        />
      </label>
    </div>

    <label class="scenario-field">
      <span class="scenario-label">{{ t('request.scenario.generic.pax') }}</span>
      <input
        type="number"
        min="1"
        max="50"
        :value="modelValue.pax"
        @input="update({ pax: Number(($event.target as HTMLInputElement).value) || undefined })"
      />
    </label>

    <label class="scenario-field">
      <span class="scenario-label">
        {{ t('request.scenario.generic.notes') }}
      </span>
      <textarea
        rows="3"
        :value="modelValue.notes"
        :placeholder="t('request.scenario.generic.notesPlaceholder')"
        @input="update({ notes: ($event.target as HTMLTextAreaElement).value })"
      ></textarea>
    </label>
  </fieldset>
</template>

<style scoped src="./_shared.css"></style>
