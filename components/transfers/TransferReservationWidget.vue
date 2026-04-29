<script setup lang="ts">
type Props = {
  slug: string;
  mode: 'chauffeur' | 'helicopter' | string;
  fromCity: string;
  toCity: string;
  fromName: string;
  toName: string;
  variant?: 'sticky' | 'inline';
};

const props = withDefaults(defineProps<Props>(), { variant: 'sticky' });

const localePath = useLocalePath();
const { t } = useI18n();

const isHelico = computed(() => props.mode === 'helicopter');
const maxPax = computed(() => (isHelico.value ? 6 : 7));

const minDate = computed(() => {
  const d = new Date();
  d.setHours(d.getHours() + 24);
  return d.toISOString().slice(0, 10);
});

const date = ref('');
const time = ref('');
const pax = ref(2);

const canSubmit = computed(() => !!date.value && !!time.value && pax.value >= 1);

function dec() { if (pax.value > 1) pax.value--; }
function inc() { if (pax.value < maxPax.value) pax.value++; }

async function submit() {
  if (!canSubmit.value) return;
  const query: Record<string, string> = {
    service: isHelico.value ? 'helicopter' : 'chauffeur',
    from: props.fromCity,
    to: props.toCity,
    date: date.value,
    time: time.value,
    pax: String(pax.value),
  };
  await navigateTo({ path: localePath('/request'), query });
}
</script>

<template>
  <div :class="variant === 'sticky' ? 'lg:sticky lg:top-24' : ''">
    <div class="border border-misana-line bg-misana-paper p-6 sm:p-7 rounded-[6px]">
      <p class="text-[11px] uppercase tracking-[0.2em] text-misana-muted mb-1.5">
        {{ t('transfers.fiche.reservationKicker') }}
      </p>
      <h3 class="font-display text-2xl mb-7 leading-tight">
        {{ fromName }} → {{ toName }}
      </h3>

      <div class="mb-5">
        <label class="block text-[11px] uppercase tracking-[0.15em] text-misana-muted mb-2">
          {{ t('transfers.fiche.field.date') }}
        </label>
        <input v-model="date" type="date" :min="minDate" class="form-input" />
      </div>

      <div class="mb-5">
        <label class="block text-[11px] uppercase tracking-[0.15em] text-misana-muted mb-2">
          {{ t('transfers.fiche.field.time') }}
        </label>
        <input v-model="time" type="time" class="form-input" />
      </div>

      <div class="mb-7">
        <label class="block text-[11px] uppercase tracking-[0.15em] text-misana-muted mb-2">
          {{ t('transfers.fiche.field.passengers') }}
        </label>
        <div class="flex items-stretch border border-misana-line rounded-[4px] overflow-hidden">
          <button type="button" class="counter-btn" :disabled="pax <= 1" aria-label="decrement" @click="dec">−</button>
          <span class="flex-1 flex items-center justify-center text-base">{{ pax }}</span>
          <button type="button" class="counter-btn" :disabled="pax >= maxPax" aria-label="increment" @click="inc">+</button>
        </div>
      </div>

      <button type="button" class="submit-btn" :disabled="!canSubmit" @click="submit">
        <span>{{ t('transfers.fiche.reservationSubmit') }}</span>
        <span class="arrow">→</span>
      </button>

      <p class="mt-5 text-[11px] text-misana-muted leading-relaxed">
        {{ t('transfers.fiche.reservationFootnote') }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.form-input {
  width: 100%;
  border: 1px solid var(--color-misana-line);
  background: var(--color-misana-paper);
  padding: 0.7rem 0.8rem;
  font-size: 0.875rem;
  color: var(--color-misana-ink);
  border-radius: 4px;
  outline: none;
  transition: border-color 0.2s ease;
  font-family: inherit;
}
.form-input:focus { border-color: var(--color-misana-ink); }
.counter-btn {
  width: 44px;
  font-size: 1.1rem;
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
  padding: 0.9rem 1.1rem;
  background: var(--color-misana-ink);
  color: var(--color-misana-paper);
  font-size: 0.9rem;
  letter-spacing: 0.02em;
  border-radius: 4px;
  transition: opacity 0.2s ease;
  cursor: pointer;
}
.submit-btn:hover:not(:disabled) { opacity: 0.88; }
.submit-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.submit-btn .arrow { transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
.submit-btn:hover:not(:disabled) .arrow { transform: translateX(4px); }
</style>
