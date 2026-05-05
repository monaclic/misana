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

const { t, te } = useI18n();

// Si on arrive depuis 'Sejours preparees' du hub yacht, on affiche un
// recap card du tour choisi : titre + duree + body i18n. Le user voit
// directement le contexte sans devoir tout retaper.
const journeyMeta = computed(() => {
  const slug = props.prefill.journey as string | undefined;
  if (!slug) return null;
  const titleKey = `yacht.journey.${slug}.title`;
  const subKey = `yacht.journey.${slug}.duration`;
  const bodyKey = `yacht.journey.${slug}.body`;
  if (!te(titleKey)) return null;
  return {
    title: t(titleKey),
    sub: te(subKey) ? t(subKey) : '',
    body: te(bodyKey) ? t(bodyKey) : '',
  };
});

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
  <div class="scenario-sections">
    <!-- Recap journey yacht (si on arrive depuis 'Sejours preparees') -->
    <div v-if="journeyMeta" class="journey-recap">
      <p class="journey-recap-kicker">{{ t('request.scenario.generic.journeyKicker') }}</p>
      <h3 class="journey-recap-title">{{ journeyMeta.title }}</h3>
      <p class="journey-recap-sub">{{ journeyMeta.sub }}</p>
      <p class="journey-recap-body">{{ journeyMeta.body }}</p>
    </div>

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
  </div>
</template>

<style scoped src="./_shared.css"></style>
<style scoped>
.scenario-sections {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
.journey-recap {
  padding: 1.1rem 1.2rem;
  background: var(--color-misana-stone);
  border-radius: 4px;
}
.journey-recap-kicker {
  font-size: 0.65rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--color-misana-muted);
  margin: 0 0 0.4rem;
}
.journey-recap-title {
  font-family: var(--font-display);
  font-size: 1.3rem;
  color: var(--color-misana-ink);
  margin: 0 0 0.25rem;
  line-height: 1.2;
}
.journey-recap-sub {
  font-size: 0.85rem;
  color: var(--color-misana-muted);
  margin: 0 0 0.6rem;
}
.journey-recap-body {
  font-size: 0.85rem;
  color: var(--color-misana-ink);
  margin: 0;
  line-height: 1.5;
}
</style>
