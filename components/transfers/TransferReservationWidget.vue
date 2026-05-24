<script setup lang="ts">
// Widget reservation transfert pattern Uber : prix dominant en haut,
// 4 champs serres (date, time, pax, luggage), CTA primaire,
// micro-info de bas (capacity, cancellation).
import { formatPriceFrom } from '~/lib/transferDetails';

type Props = {
  slug: string;
  mode: 'chauffeur' | 'helicopter' | string;
  fromCity: string;
  toCity: string;
  fromName: string;
  toName: string;
  priceFrom: number;
  paxMin: number;
  paxMax: number;
  bidirectional?: boolean;
  variant?: 'sticky' | 'inline';
};

const props = withDefaults(defineProps<Props>(), { variant: 'sticky', bidirectional: false });

// Pour les routes bidirectionnelles, l'utilisateur choisit le sens.
// 'outbound' = direction canonique (from → to), 'return' = inverse.
const direction = ref<'outbound' | 'return'>('outbound');
const effectiveFrom = computed(() => direction.value === 'outbound' ? props.fromCity : props.toCity);
const effectiveTo = computed(() => direction.value === 'outbound' ? props.toCity : props.fromCity);
const effectiveFromName = computed(() => direction.value === 'outbound' ? props.fromName : props.toName);
const effectiveToName = computed(() => direction.value === 'outbound' ? props.toName : props.fromName);

const localePath = useLocalePath();
const { locale, t } = useI18n();

const isHelico = computed(() => props.mode === 'helicopter');
const lng = computed<'fr' | 'en'>(() => (locale.value === 'fr' ? 'fr' : 'en'));

const minDate = computed(() => {
  const d = new Date();
  d.setHours(d.getHours() + 24);
  return d.toISOString().slice(0, 10);
});

const date = ref('');
const time = ref('');
const pax = ref(Math.max(2, props.paxMin));
const luggage = ref(2);

const canSubmit = computed(() => !!date.value && !!time.value && pax.value >= props.paxMin);

function decPax() { if (pax.value > props.paxMin) pax.value--; }
function incPax() { if (pax.value < props.paxMax) pax.value++; }
function decLuggage() { if (luggage.value > 0) luggage.value--; }
function incLuggage() { if (luggage.value < 12) luggage.value++; }

// City slug -> code IATA heliport. /request scenario helico attend
// les codes IATA pour matcher la matrice HELI_ROUTES.
const CITY_TO_IATA: Record<string, string> = {
  'nice': 'NCE',
  'monaco': 'MCM',
  'cannes': 'CEQ',
  'saint-tropez': 'LTT',
};

async function submit() {
  if (!canSubmit.value) return;
  const mapId = (id: string) => (isHelico.value ? (CITY_TO_IATA[id] ?? id) : id);
  const query: Record<string, string> = {
    service: isHelico.value ? 'helicopter' : 'chauffeur',
    from: mapId(effectiveFrom.value),
    to: mapId(effectiveTo.value),
    date: date.value,
    time: time.value,
    pax: String(pax.value),
    luggage: String(luggage.value),
  };
  await navigateTo({ path: localePath('/request'), query });
}
</script>

<template>
  <div
    :class="variant === 'sticky'
      ? 'lg:sticky lg:top-24'
      : 'lg:h-full lg:flex lg:flex-col'"
  >
    <div class="border border-misana-line bg-misana-paper rounded-[6px] overflow-hidden lg:flex-1 lg:flex lg:flex-col">
      <!-- Header with price -->
      <div class="px-6 sm:px-7 pt-6 pb-5 border-b border-misana-line">
        <p class="text-[11px] uppercase tracking-[0.2em] text-misana-muted mb-2">
          {{ t('transfers.fiche.priceFrom') }}
        </p>
        <div class="flex items-baseline gap-3">
          <span class="font-display text-4xl leading-none">{{ formatPriceFrom(priceFrom, lng) }}</span>
          <span class="text-xs text-misana-muted">{{ isHelico ? t('transfers.fiche.perFlight') : t('transfers.fiche.perTransfer') }}</span>
        </div>
        <p class="text-[11px] text-misana-muted mt-2 leading-relaxed">
          {{ t('transfers.fiche.priceNote') }}
        </p>
      </div>

      <!-- Form -->
      <div class="px-6 sm:px-7 py-6 space-y-4 lg:flex-1 lg:flex lg:flex-col lg:justify-center">
        <!-- Toggle directionnel pour routes bidirectionnelles -->
        <div v-if="bidirectional">
          <label class="block text-[10px] uppercase tracking-[0.18em] text-misana-muted mb-1.5">
            {{ t('transfers.fiche.field.direction') }}
          </label>
          <div class="grid grid-cols-2 gap-2">
            <button
              type="button"
              class="dir-btn"
              :class="direction === 'outbound' ? 'active' : ''"
              @click="direction = 'outbound'"
            >
              {{ fromName }} → {{ toName }}
            </button>
            <button
              type="button"
              class="dir-btn"
              :class="direction === 'return' ? 'active' : ''"
              @click="direction = 'return'"
            >
              {{ toName }} → {{ fromName }}
            </button>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-[10px] uppercase tracking-[0.18em] text-misana-muted mb-1.5">
              {{ t('transfers.fiche.field.date') }}
            </label>
            <input v-model="date" type="date" :min="minDate" class="form-input" />
          </div>
          <div>
            <label class="block text-[10px] uppercase tracking-[0.18em] text-misana-muted mb-1.5">
              {{ t('transfers.fiche.field.time') }}
            </label>
            <input v-model="time" type="time" class="form-input" />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-[10px] uppercase tracking-[0.18em] text-misana-muted mb-1.5">
              {{ t('transfers.fiche.field.passengers') }}
            </label>
            <div class="flex items-stretch border border-misana-line rounded-[4px] overflow-hidden">
              <button type="button" class="counter-btn" :disabled="pax <= paxMin" aria-label="dec pax" @click="decPax">−</button>
              <span class="flex-1 flex items-center justify-center text-sm">{{ pax }}</span>
              <button type="button" class="counter-btn" :disabled="pax >= paxMax" aria-label="inc pax" @click="incPax">+</button>
            </div>
          </div>
          <div>
            <label class="block text-[10px] uppercase tracking-[0.18em] text-misana-muted mb-1.5">
              {{ t('transfers.fiche.field.luggage') }}
            </label>
            <div class="flex items-stretch border border-misana-line rounded-[4px] overflow-hidden">
              <button type="button" class="counter-btn" :disabled="luggage <= 0" aria-label="dec luggage" @click="decLuggage">−</button>
              <span class="flex-1 flex items-center justify-center text-sm">{{ luggage }}</span>
              <button type="button" class="counter-btn" :disabled="luggage >= 12" aria-label="inc luggage" @click="incLuggage">+</button>
            </div>
          </div>
        </div>

        <button type="button" class="submit-btn" :disabled="!canSubmit" @click="submit">
          <span>{{ t('transfers.fiche.requestTransfer') }}</span>
          <span class="arrow">→</span>
        </button>
      </div>

      <!-- Footer micro-info -->
      <div class="px-6 sm:px-7 py-4 border-t border-misana-line text-[11px] text-misana-muted leading-relaxed space-y-1.5">
        <div class="flex justify-between gap-2">
          <span>{{ t('transfers.fiche.maxCapacity') }}</span>
          <span class="text-misana-ink">{{ paxMin }}-{{ paxMax }} {{ t('transfers.fiche.paxShort') }}</span>
        </div>
        <div class="flex justify-between gap-2">
          <span>{{ t('transfers.fiche.cancelPolicy') }}</span>
          <span class="text-misana-ink">{{ t('transfers.fiche.cancelFree') }}</span>
        </div>
        <div class="flex justify-between gap-2">
          <span>{{ t('transfers.fiche.replyTime') }}</span>
          <span class="text-misana-ink">{{ t('transfers.fiche.replyValue') }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.form-input {
  width: 100%;
  border: 1px solid var(--color-misana-line);
  background: var(--color-misana-paper);
  padding: 0.55rem 0.65rem;
  font-size: 0.85rem;
  color: var(--color-misana-ink);
  border-radius: 4px;
  outline: none;
  transition: border-color 0.2s ease;
  font-family: inherit;
}
.form-input:focus { border-color: var(--color-misana-ink); }
.form-input::-webkit-calendar-picker-indicator { opacity: 0.5; cursor: pointer; }

.dir-btn {
  padding: 0.55rem 0.6rem;
  font-size: 0.75rem;
  border: 1px solid var(--color-misana-line);
  background: var(--color-misana-paper);
  color: var(--color-misana-ink);
  border-radius: 4px;
  transition: all 0.2s ease;
  cursor: pointer;
  text-align: center;
  line-height: 1.1;
}
.dir-btn:hover {
  border-color: var(--color-misana-ink);
}
.dir-btn.active {
  background: var(--color-misana-ink);
  color: var(--color-misana-paper);
  border-color: var(--color-misana-ink);
}

.counter-btn {
  width: 36px;
  font-size: 1rem;
  color: var(--color-misana-ink);
  background: var(--color-misana-paper);
  transition: background 0.15s ease;
  cursor: pointer;
}
.counter-btn:first-child { border-right: 1px solid var(--color-misana-line); }
.counter-btn:last-child { border-left: 1px solid var(--color-misana-line); }
.counter-btn:hover:not(:disabled) { background: var(--color-misana-stone); }
.counter-btn:disabled { opacity: 0.3; cursor: not-allowed; }

.submit-btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0.95rem 1.15rem;
  background: var(--color-misana-ink);
  color: var(--color-misana-paper);
  font-size: 0.9rem;
  letter-spacing: 0.02em;
  border-radius: 4px;
  transition: opacity 0.2s ease;
  cursor: pointer;
  margin-top: 0.5rem;
}
.submit-btn:hover:not(:disabled) { opacity: 0.88; }
.submit-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.submit-btn .arrow { transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
.submit-btn:hover:not(:disabled) .arrow { transform: translateX(4px); }
</style>
