<script setup lang="ts">
// Scenario route helico : utilisateur arrive avec service=helicopter +
// from + to (heliports). On affiche le trajet + la liste des appareils
// disponibles pour cette route avec leurs tarifs indicatifs. L'utilisateur
// choisit un appareil (optionnel, on calera au tel sinon).
//
// Hub helicopter form passe : ?service=helicopter&from=NCE&to=MCM&date=...
// Transfer route /transfers/[mode]/[route] passe le meme format.
import { saveDraft, loadDraft } from '~/composables/useRequestDraft';
import { HELI_ROUTES, HELI_DEPARTURES } from '~/lib/heliRoutes';
import { HELICOPTERS } from '~/lib/fleet';

export type HelicopterData = {
  fromId?: string;
  toId?: string;
  date?: string;
  helicopterId?: string;
  pax?: number;
  notes?: string;
};

const props = defineProps<{
  modelValue: HelicopterData;
  prefill: Record<string, string | number | undefined>;
}>();

const emit = defineEmits<{ (e: 'update:modelValue', v: HelicopterData): void }>();

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
  const next: HelicopterData = {
    ...props.modelValue,
    fromId: props.modelValue.fromId || (props.prefill.from as string)?.toUpperCase(),
    toId: props.modelValue.toId || (props.prefill.to as string)?.toUpperCase(),
    date: props.modelValue.date || (props.prefill.date as string) || draft.date,
    pax: props.modelValue.pax || (typeof paxRaw === 'string' ? Number(paxRaw) : paxRaw) || draft.pax,
  };
  emit('update:modelValue', next);
});

function update(patch: Partial<HelicopterData>) {
  const next = { ...props.modelValue, ...patch };
  emit('update:modelValue', next);
  if (patch.date !== undefined || patch.pax !== undefined) {
    saveDraft({ date: next.date, pax: next.pax });
  }
}

// Helpers
const labelMap: Record<string, string> = {
  NCE: 'Nice', MCM: 'Monaco',
  CEQ: 'Cannes (Mandelieu)', CNQ: 'Cannes (Quai du Large)',
  LTT: 'Saint-Tropez (La Môle)', STG: 'Saint-Tropez (Grimaud)',
};

// Route info derivee de from + to (en gerant les variants CNQ/STG).
const route = computed(() => {
  const fromId = props.modelValue.fromId;
  const toId = props.modelValue.toId;
  if (!fromId || !toId) return null;
  return HELI_ROUTES.find((r) => {
    const f = r.fromId === 'CEQ' ? ['CEQ', 'CNQ'] : r.fromId === 'LTT' ? ['LTT', 'STG'] : [r.fromId];
    const t_ = r.toId === 'CEQ' ? ['CEQ', 'CNQ'] : r.toId === 'LTT' ? ['LTT', 'STG'] : [r.toId];
    return f.includes(fromId) && t_.includes(toId);
  });
});

// Appareils disponibles pour cette route (price not null).
const availableHelicopters = computed(() => {
  const r = route.value;
  if (!r) return [];
  return HELICOPTERS
    .map((h) => ({ ...h, price: (r.price as Record<string, number | null>)[h.id] }))
    .filter((h) => h.price !== null && h.price !== undefined);
});

const fmtEur = (n: number | null | undefined) => {
  if (n === null || n === undefined) return '';
  return new Intl.NumberFormat(locale.value === 'fr' ? 'fr-FR' : 'en-GB', {
    style: 'currency', currency: 'EUR', maximumFractionDigits: 0,
  }).format(n);
};

const dateError = computed(() => {
  if (!props.modelValue.date) return null;
  const d = props.modelValue.date;
  if (d < tomorrow.value) return t('request.scenario.vehicle.dateTooEarly');
  if (d > oneYearFromNow.value) return t('request.scenario.vehicle.dateTooFar');
  return null;
});

const fromLabel = computed(() => labelMap[props.modelValue.fromId || ''] || props.modelValue.fromId);
const toLabel = computed(() => labelMap[props.modelValue.toId || ''] || props.modelValue.toId);
</script>

<template>
  <div class="scenario-sections">
    <!-- ========== Recap trajet ========== -->
    <div v-if="route" class="recap-block">
      <p class="recap-kicker">{{ t('request.scenario.helicopter.routeKicker') }}</p>
      <p class="recap-route">
        <span>{{ fromLabel }}</span>
        <span class="recap-arrow" aria-hidden="true">→</span>
        <span>{{ toLabel }}</span>
      </p>
      <p class="recap-duration">{{ route.duration }}</p>
    </div>

    <!-- ========== Section : Date ========== -->
    <fieldset class="scenario-block">
      <legend class="scenario-legend">{{ t('request.scenario.helicopter.sectionDate') }}</legend>
      <label class="scenario-field">
        <span class="scenario-label">{{ t('request.scenario.helicopter.date') }} <span class="req">*</span></span>
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
    </fieldset>

    <!-- ========== Section : Choix appareil ========== -->
    <fieldset v-if="availableHelicopters.length" class="scenario-block">
      <legend class="scenario-legend">{{ t('request.scenario.helicopter.sectionAircraft') }}</legend>
      <p class="scenario-hint">{{ t('request.scenario.helicopter.aircraftHint') }}</p>
      <div class="aircraft-grid">
        <button
          v-for="h in availableHelicopters"
          :key="h.id"
          type="button"
          class="aircraft-card"
          :class="{ 'aircraft-card-selected': modelValue.helicopterId === h.id }"
          @click="update({ helicopterId: modelValue.helicopterId === h.id ? undefined : h.id })"
        >
          <img v-if="h.image" :src="h.image" :alt="h.name" loading="lazy" class="aircraft-img" />
          <div class="aircraft-body">
            <p class="aircraft-name">{{ h.name }}</p>
            <p class="aircraft-meta">
              <span>{{ locale === 'fr' ? h.engineFr : h.engine }}</span>
              <span>·</span>
              <span>{{ h.pax }} pax</span>
            </p>
            <p class="aircraft-price">{{ fmtEur(h.price) }}</p>
          </div>
        </button>
      </div>
      <p class="aircraft-footnote">{{ t('request.scenario.helicopter.priceFootnote') }}</p>
    </fieldset>

    <!-- ========== Section : Passagers ========== -->
    <fieldset class="scenario-block">
      <legend class="scenario-legend">{{ t('request.scenario.helicopter.sectionPax') }}</legend>
      <label class="scenario-field">
        <span class="scenario-label">{{ t('request.scenario.helicopter.pax') }} <span class="req">*</span></span>
        <input
          type="number"
          min="1"
          max="10"
          :value="modelValue.pax"
          required
          @input="update({ pax: Number(($event.target as HTMLInputElement).value) || undefined })"
        />
      </label>
    </fieldset>

    <!-- ========== Precisions ========== -->
    <fieldset class="scenario-block">
      <legend class="scenario-legend">{{ t('request.scenario.helicopter.sectionNotes') }}</legend>
      <label class="scenario-field">
        <span class="scenario-label">
          {{ t('request.scenario.helicopter.notes') }}
          <span class="optional">({{ t('request.contact.optional') }})</span>
        </span>
        <textarea
          rows="3"
          :value="modelValue.notes"
          :placeholder="t('request.scenario.helicopter.notesPlaceholder')"
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
.scenario-hint {
  font-size: 0.8rem;
  color: var(--color-misana-muted);
  margin: 0 0 0.85rem;
}

.recap-block {
  padding: 1.1rem 1.2rem;
  background: var(--color-misana-stone);
  border-radius: 4px;
}
.recap-kicker {
  font-size: 0.65rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--color-misana-muted);
  margin: 0 0 0.4rem;
}
.recap-route {
  font-family: var(--font-display);
  font-size: 1.3rem;
  color: var(--color-misana-ink);
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}
.recap-arrow {
  font-size: 1.1rem;
  color: var(--color-misana-muted);
}
.recap-duration {
  font-size: 0.85rem;
  color: var(--color-misana-muted);
  margin: 0.2rem 0 0;
}

.aircraft-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.7rem;
}
@media (min-width: 520px) {
  .aircraft-grid { grid-template-columns: 1fr 1fr; }
}
@media (min-width: 768px) {
  .aircraft-grid { grid-template-columns: repeat(3, 1fr); }
}
.aircraft-card {
  border: 1px solid var(--color-misana-line);
  background: var(--color-misana-paper);
  padding: 0;
  text-align: left;
  cursor: pointer;
  border-radius: 3px;
  overflow: hidden;
  transition: border-color 0.2s ease, transform 0.2s ease;
}
.aircraft-card:hover { border-color: var(--color-misana-ink); }
.aircraft-card-selected {
  border-color: var(--color-misana-ink);
  background: var(--color-misana-stone);
}
.aircraft-img {
  width: 100%;
  aspect-ratio: 4/3;
  object-fit: cover;
  display: block;
  background: var(--color-misana-stone);
}
.aircraft-body {
  padding: 0.7rem 0.85rem;
}
.aircraft-name {
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--color-misana-ink);
  margin: 0;
}
.aircraft-meta {
  font-size: 0.75rem;
  color: var(--color-misana-muted);
  margin: 0.15rem 0 0.4rem;
  display: flex;
  gap: 0.3rem;
}
.aircraft-price {
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--color-misana-ink);
  margin: 0;
}
.aircraft-footnote {
  font-size: 0.72rem;
  color: var(--color-misana-muted);
  margin: 0.85rem 0 0;
  font-style: italic;
}
</style>
