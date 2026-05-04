<script setup lang="ts">
// Scenario fiche yacht : "Charter ce yacht" depuis /services/yacht/[yacht].
// Yacht locke. Demande : port, dates, guests, notes.
import { saveDraft, loadDraft } from '~/composables/useRequestDraft';

export type YachtData = {
  port?: string;
  startDate?: string;
  endDate?: string;
  guests?: number;
  notes?: string;
};

const props = defineProps<{
  modelValue: YachtData;
  prefill: Record<string, string | number | undefined>;
}>();

const emit = defineEmits<{ (e: 'update:modelValue', v: YachtData): void }>();

const { t } = useI18n();

onMounted(() => {
  const draft = loadDraft();
  const paxRaw = props.prefill.pax;
  const next: YachtData = {
    ...props.modelValue,
    port: props.modelValue.port || (props.prefill.city as string),
    startDate: props.modelValue.startDate || (props.prefill.date as string) || draft.date,
    endDate: props.modelValue.endDate || (props.prefill.dateEnd as string) || draft.dateEnd,
    guests: props.modelValue.guests || (typeof paxRaw === 'string' ? Number(paxRaw) : paxRaw) || draft.pax,
  };
  emit('update:modelValue', next);
});

function update(patch: Partial<YachtData>) {
  const next = { ...props.modelValue, ...patch };
  emit('update:modelValue', next);
  if (patch.startDate !== undefined || patch.endDate !== undefined || patch.guests !== undefined) {
    saveDraft({ date: next.startDate, dateEnd: next.endDate, pax: next.guests });
  }
}
</script>

<template>
  <fieldset class="scenario-block">
    <legend class="scenario-legend">{{ t('request.scenario.yacht.title') }}</legend>

    <label class="scenario-field">
      <span class="scenario-label">{{ t('request.scenario.yacht.port') }}</span>
      <input
        type="text"
        :value="modelValue.port"
        :placeholder="t('request.scenario.yacht.portPlaceholder')"
        @input="update({ port: ($event.target as HTMLInputElement).value })"
      />
    </label>

    <div class="scenario-row">
      <label class="scenario-field">
        <span class="scenario-label">{{ t('request.scenario.yacht.startDate') }} <span class="req">*</span></span>
        <input
          type="date"
          :value="modelValue.startDate"
          required
          @change="update({ startDate: ($event.target as HTMLInputElement).value })"
        />
      </label>
      <label class="scenario-field">
        <span class="scenario-label">{{ t('request.scenario.yacht.endDate') }} <span class="req">*</span></span>
        <input
          type="date"
          :value="modelValue.endDate"
          required
          @change="update({ endDate: ($event.target as HTMLInputElement).value })"
        />
      </label>
    </div>

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

    <label class="scenario-field">
      <span class="scenario-label">
        {{ t('request.scenario.yacht.notes') }}
        <span class="optional">({{ t('request.contact.optional') }})</span>
      </span>
      <textarea
        rows="2"
        :value="modelValue.notes"
        :placeholder="t('request.scenario.yacht.notesPlaceholder')"
        @input="update({ notes: ($event.target as HTMLTextAreaElement).value })"
      ></textarea>
    </label>
  </fieldset>
</template>

<style scoped src="./_shared.css"></style>
