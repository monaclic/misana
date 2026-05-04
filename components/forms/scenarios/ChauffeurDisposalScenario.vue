<script setup lang="ts">
// Scenario mise a disposition chauffeur : ville + duree + (jours si multi)
// + date debut + heure + pax + choix vehicule avec tarif par tranche.
// Sections : Contexte mission -> Date+Heure+Pax -> Choix vehicule.
import { saveDraft, loadDraft } from '~/composables/useRequestDraft';
import { CITIES } from '~/lib/constants';
import { VEHICLES } from '~/lib/fleet';
import { DISPOSAL_DURATIONS, DISPOSAL_PRICES, disposalPrice, type DisposalDurationId } from '~/lib/chauffeurDisposal';

export type ChauffeurDisposalData = {
  city?: string;
  duration?: DisposalDurationId | 'multi';
  days?: number;
  date?: string;
  time?: string;
  pax?: number;
  vehicleId?: string;
  notes?: string;
};

const props = defineProps<{
  modelValue: ChauffeurDisposalData;
  prefill: Record<string, string | number | undefined>;
}>();

const emit = defineEmits<{ (e: 'update:modelValue', v: ChauffeurDisposalData): void }>();

const { t, locale } = useI18n();

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
  const rawDate = (props.prefill.date as string) || draft.date;
  const dateOnly = rawDate ? rawDate.slice(0, 10) : undefined;
  const next: ChauffeurDisposalData = {
    ...props.modelValue,
    city: props.modelValue.city || (props.prefill.city as string),
    duration: props.modelValue.duration || (props.prefill.duration as DisposalDurationId | 'multi') || 'h8',
    days: props.modelValue.days || (props.prefill.days ? Number(props.prefill.days) : undefined) || 2,
    date: props.modelValue.date || dateOnly,
    time: props.modelValue.time || (props.prefill.time as string) || undefined,
    pax: props.modelValue.pax || (typeof paxRaw === 'string' ? Number(paxRaw) : paxRaw) || draft.pax || 1,
  };
  emit('update:modelValue', next);
});

function update(patch: Partial<ChauffeurDisposalData>) {
  const next = { ...props.modelValue, ...patch };
  emit('update:modelValue', next);
  if (patch.date !== undefined || patch.pax !== undefined) {
    saveDraft({ date: next.date, pax: next.pax });
  }
}

const durationOptions = computed(() => [
  ...DISPOSAL_DURATIONS.map((d) => ({
    id: d.id as DisposalDurationId | 'multi',
    label: locale.value === 'fr' ? d.labelFr : d.label,
  })),
  { id: 'multi' as const, label: locale.value === 'fr' ? 'Plusieurs jours' : 'Multiple days' },
]);

const cityOptions = computed(() => [
  ...CITIES.map((c) => ({ slug: c.slug, label: locale.value === 'fr' ? c.fr : c.en })),
  { slug: 'other', label: locale.value === 'fr' ? 'Autre' : 'Other' },
]);

const availableVehicles = computed(() => {
  const dur = props.modelValue.duration;
  return VEHICLES.map((v) => {
    let price: number | null = null;
    if (dur === 'multi') {
      price = disposalPrice(v.id, 'h24', props.modelValue.days);
    } else if (dur) {
      price = DISPOSAL_PRICES[v.id]?.[dur as DisposalDurationId] ?? null;
    }
    return { ...v, price };
  });
});

const dateError = computed(() => {
  if (!props.modelValue.date) return null;
  const d = props.modelValue.date;
  if (d < tomorrow.value) return t('request.scenario.vehicle.dateTooEarly');
  if (d > oneYearFromNow.value) return t('request.scenario.vehicle.dateTooFar');
  return null;
});

watch(
  () => props.modelValue.pax,
  () => {
    const vid = props.modelValue.vehicleId;
    if (!vid) return;
    const v = VEHICLES.find((x) => x.id === vid);
    if (v && v.pax < (props.modelValue.pax || 1)) update({ vehicleId: undefined });
  },
);
</script>

<template>
  <div class="scenario-sections">
    <!-- ========== Section : Contexte mission (ville + duree) ========== -->
    <fieldset class="scenario-block">
      <legend class="scenario-legend">{{ t('request.scenario.chauffeur.sectionContext') }}</legend>
      <div class="ctx-grid">
        <label class="scenario-field">
          <span class="scenario-label">{{ t('request.scenario.chauffeur.city') }} <span class="req">*</span></span>
          <select
            :value="modelValue.city"
            required
            @change="update({ city: ($event.target as HTMLSelectElement).value })"
          >
            <option value="" disabled>—</option>
            <option v-for="o in cityOptions" :key="o.slug" :value="o.slug">{{ o.label }}</option>
          </select>
        </label>
        <label class="scenario-field">
          <span class="scenario-label">{{ t('request.scenario.chauffeur.duration') }} <span class="req">*</span></span>
          <select
            :value="modelValue.duration"
            required
            @change="update({ duration: ($event.target as HTMLSelectElement).value as DisposalDurationId | 'multi' })"
          >
            <option v-for="o in durationOptions" :key="o.id" :value="o.id">{{ o.label }}</option>
          </select>
        </label>
        <label v-if="modelValue.duration === 'multi'" class="scenario-field">
          <span class="scenario-label">{{ t('request.scenario.chauffeur.days') }} <span class="req">*</span></span>
          <input
            type="number"
            min="2"
            max="30"
            :value="modelValue.days"
            required
            @input="update({ days: Number(($event.target as HTMLInputElement).value) || undefined })"
          />
        </label>
      </div>
    </fieldset>

    <!-- ========== Section : Date / Heure / Passagers ========== -->
    <fieldset class="scenario-block">
      <legend class="scenario-legend">{{ t('request.scenario.chauffeur.sectionWhen') }}</legend>
      <div class="when-grid">
        <label class="scenario-field">
          <span class="scenario-label">{{ t('request.scenario.chauffeur.startDate') }} <span class="req">*</span></span>
          <input
            type="date"
            :value="modelValue.date"
            :min="tomorrow"
            :max="oneYearFromNow"
            required
            @change="update({ date: ($event.target as HTMLInputElement).value })"
          />
          <span v-if="dateError" class="scenario-error">{{ dateError }}</span>
        </label>
        <label class="scenario-field">
          <span class="scenario-label">{{ t('request.scenario.chauffeur.startTime') }} <span class="req">*</span></span>
          <input
            type="time"
            :value="modelValue.time"
            required
            @change="update({ time: ($event.target as HTMLInputElement).value })"
          />
        </label>
        <label class="scenario-field">
          <span class="scenario-label">{{ t('request.scenario.chauffeur.pax') }} <span class="req">*</span></span>
          <input
            type="number"
            min="1"
            max="20"
            :value="modelValue.pax"
            required
            @input="update({ pax: Number(($event.target as HTMLInputElement).value) || undefined })"
          />
        </label>
      </div>
    </fieldset>

    <!-- ========== Section : Choix vehicule ========== -->
    <section class="vehicle-section">
      <header class="vehicle-header">
        <p class="vehicle-kicker">{{ t('request.scenario.chauffeur.sectionVehicle') }}</p>
        <p class="vehicle-hint">{{ t('request.scenario.chauffeur.disposalVehicleHint') }}</p>
      </header>

      <div class="vehicle-grid">
        <ChauffeurFleetCard
          v-for="v in availableVehicles"
          :key="v.id"
          :selected="modelValue.vehicleId === v.id"
          :disabled="v.pax < (modelValue.pax || 1)"
          :name="v.name"
          :type="locale === 'fr' ? v.subFr : v.sub"
          :pax="v.pax"
          :luggage="v.luggage"
          :image="v.image"
          :image-mode="v.imageMode"
          :badge="v.badge"
          :badge-label="v.badge ? t(`request.fleet.badge.${v.badge}`) : undefined"
          :price="(v.pax >= (modelValue.pax || 1)) ? v.price : null"
          :price-locale="(locale as 'en' | 'fr')"
          :on-request-label="(v.pax >= (modelValue.pax || 1)) ? t('request.helicopter.onRequest') : t('request.scenario.chauffeur.tooSmall')"
          @select="(v.pax >= (modelValue.pax || 1)) && update({ vehicleId: modelValue.vehicleId === v.id ? undefined : v.id })"
        />
      </div>

      <p class="vehicle-footnote">{{ t('request.scenario.chauffeur.disposalFootnote') }}</p>
    </section>
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
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
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

.ctx-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.7rem 1rem;
}
@media (min-width: 480px) {
  .ctx-grid { grid-template-columns: 1fr 1fr; }
}

.when-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.7rem 1rem;
}
@media (min-width: 480px) {
  .when-grid { grid-template-columns: 1fr 1fr; }
}
@media (min-width: 720px) {
  .when-grid { grid-template-columns: repeat(3, 1fr); }
}

.vehicle-section {
  margin-top: 0.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--color-misana-line);
}
.vehicle-header { margin-bottom: 1.25rem; }
.vehicle-kicker {
  font-family: var(--font-display);
  font-size: 1.4rem;
  letter-spacing: -0.01em;
  color: var(--color-misana-ink);
  margin: 0 0 0.35rem;
  line-height: 1.15;
}
@media (min-width: 640px) {
  .vehicle-kicker { font-size: 1.6rem; }
}
.vehicle-hint {
  font-size: 0.85rem;
  color: var(--color-misana-muted);
  margin: 0;
  max-width: 56ch;
  line-height: 1.5;
}

.vehicle-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}
@media (min-width: 560px) {
  .vehicle-grid { grid-template-columns: 1fr 1fr; gap: 1.1rem; }
}
@media (min-width: 960px) {
  .vehicle-grid { grid-template-columns: repeat(3, 1fr); gap: 1.25rem; }
}

.vehicle-footnote {
  font-size: 0.72rem;
  color: var(--color-misana-muted);
  margin: 1.25rem 0 0;
  font-style: italic;
  padding-top: 0.85rem;
  border-top: 1px solid var(--color-misana-line);
}
</style>
