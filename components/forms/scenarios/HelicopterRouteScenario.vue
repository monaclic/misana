<script setup lang="ts">
// Scenario route helico : utilisateur arrive avec service=helicopter +
// from + to (heliports). Sections :
//   1. Date
//   2. Passagers
//   3. Choix appareil (filtre par capacite seule, prix "Sur demande" si null)
// Le trajet est edite directement dans le ContextBanner (selects inline).
// Les precisions vont dans le ContactBlock (message en bas du form).
import { saveDraft, loadDraft } from '~/composables/useRequestDraft';
import { HELI_ROUTES } from '~/lib/heliRoutes';
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

// State partage avec le ContextBanner pour l edition inline du trajet.
const editingRoute = useState<boolean>('request-edit-heli-route', () => false);
const heliRouteFromId = useState<string | undefined>('request-heli-from', () => undefined);
const heliRouteToId = useState<string | undefined>('request-heli-to', () => undefined);

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
  const heliPrefill = (props.prefill as Record<string, unknown>).helicopter as string | undefined;
  // Strip eventuelle partie heure (datetime-local URL legacy : "YYYY-MM-DDTHH:MM").
  // L input HTML date n accepte que "YYYY-MM-DD" et silencieusement rejette le reste.
  const rawDate = (props.prefill.date as string) || draft.date;
  const dateOnly = rawDate ? rawDate.slice(0, 10) : undefined;
  const next: HelicopterData = {
    ...props.modelValue,
    fromId: props.modelValue.fromId || (props.prefill.from as string)?.toUpperCase(),
    toId: props.modelValue.toId || (props.prefill.to as string)?.toUpperCase(),
    date: props.modelValue.date || dateOnly,
    pax: props.modelValue.pax || (typeof paxRaw === 'string' ? Number(paxRaw) : paxRaw) || draft.pax || 2,
    helicopterId: props.modelValue.helicopterId || heliPrefill,
  };
  emit('update:modelValue', next);
  // Hydrate le state partage avec les valeurs initiales pour le banner.
  heliRouteFromId.value = next.fromId;
  heliRouteToId.value = next.toId;
});

// Le banner ecrit dans le state partage : on synchronise vers helicopterData.
watch([heliRouteFromId, heliRouteToId], ([f, t_]) => {
  if (f !== props.modelValue.fromId || t_ !== props.modelValue.toId) {
    update({ fromId: f, toId: t_ });
  }
});

function update(patch: Partial<HelicopterData>) {
  const next = { ...props.modelValue, ...patch };
  emit('update:modelValue', next);
  if (patch.date !== undefined || patch.pax !== undefined) {
    saveDraft({ date: next.date, pax: next.pax });
  }
}

const labelMap: Record<string, string> = {
  NCE: 'Nice', MCM: 'Monaco',
  CEQ: 'Cannes (Mandelieu)', CNQ: 'Cannes (Quai du Large)',
  LTT: 'Saint-Tropez (La Môle)', STG: 'Saint-Tropez (Grimaud)',
};

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

// Appareils disponibles : capacite suffisante. Le prix peut etre null
// (= sur demande, route non operee directement par cet appareil) et on
// laisse FleetCarouselCard afficher "Sur demande" via onRequestLabel.
const availableHelicopters = computed(() => {
  const r = route.value;
  if (!r) return [];
  const requestedPax = props.modelValue.pax || 1;
  return HELICOPTERS
    .filter((h) => h.pax >= requestedPax)
    .map((h) => ({ ...h, price: (r.price as Record<string, number | null>)[h.id] ?? null }));
});

const dateError = computed(() => {
  if (!props.modelValue.date) return null;
  const d = props.modelValue.date;
  if (d < tomorrow.value) return t('request.scenario.vehicle.dateTooEarly');
  if (d > oneYearFromNow.value) return t('request.scenario.vehicle.dateTooFar');
  return null;
});

// Si l appareil pre-selectionne ne supporte plus le pax demande, on
// le deselectionne automatiquement pour eviter un etat incoherent.
watch(
  () => props.modelValue.pax,
  () => {
    const heliId = props.modelValue.helicopterId;
    if (!heliId) return;
    const ok = availableHelicopters.value.some((h) => h.id === heliId);
    if (!ok) update({ helicopterId: undefined });
  },
);
</script>

<template>
  <div class="scenario-sections">
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

    <!-- ========== Section : Passagers (avant aircraft pour filtrer la flotte) ========== -->
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

    <!-- ========== Section : Choix appareil ========== -->
    <fieldset class="scenario-block">
      <legend class="scenario-legend">{{ t('request.scenario.helicopter.sectionAircraft') }}</legend>
      <p class="scenario-hint">{{ t('request.scenario.helicopter.aircraftHint') }}</p>

      <p v-if="availableHelicopters.length === 0" class="scenario-empty">
        {{ t('request.scenario.helicopter.noAircraft') }}
      </p>

      <div v-else class="aircraft-grid">
        <FleetCarouselCard
          v-for="h in availableHelicopters"
          :key="h.id"
          :selected="modelValue.helicopterId === h.id"
          :title="h.name"
          :sub="locale === 'fr' ? h.engineFr : h.engine"
          :meta="[
            { icon: 'pax', text: `${h.pax}` },
            { icon: 'speed', text: `${h.speedKmh} km/h` },
            { icon: 'luggage', text: h.luggage },
          ]"
          :badge="h.badge"
          :badge-label="h.badge ? t(`request.fleet.badge.${h.badge}`) : undefined"
          :images="h.images || (h.image ? [h.image] : [])"
          :price="h.price"
          :price-locale="(locale as 'en' | 'fr')"
          :on-request-label="t('request.helicopter.onRequest')"
          @select="update({ helicopterId: modelValue.helicopterId === h.id ? undefined : h.id })"
        />
      </div>
      <p v-if="availableHelicopters.length" class="aircraft-footnote">
        {{ t('request.scenario.helicopter.priceFootnote') }}
      </p>
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
.scenario-empty {
  font-size: 0.85rem;
  color: var(--color-misana-muted);
  font-style: italic;
  margin: 0.4rem 0 0;
}

.aircraft-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.7rem;
}
@media (min-width: 520px) {
  .aircraft-grid { grid-template-columns: 1fr 1fr; }
}
@media (min-width: 900px) {
  .aircraft-grid { grid-template-columns: repeat(3, 1fr); }
}

.aircraft-footnote {
  font-size: 0.72rem;
  color: var(--color-misana-muted);
  margin: 0.85rem 0 0;
  font-style: italic;
}
</style>
