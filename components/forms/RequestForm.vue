<script setup lang="ts">
// RequestForm reutilisable.
// Trois modes :
//  1) Autonome (page /request) : pas de preset, hydrate depuis URL, sync URL.
//  2) Landing SEO (page /transfers/[route], /events/[event]) : preset injecte
//     (service + sub-data), lockService=true masque step Context.
//  3) Fiche produit (page /cars/[brand-model]) : preset injecte
//     avec rentalCarId/yachtId, embedded=true pour mode compact.

import { useRequestStore } from '~/stores/request';
import { requestSchema } from '~/lib/forms/requestSchema';
import type { Service, RequestStep } from '~/types/request';

const props = withDefaults(
  defineProps<{
    presetService?: Service;
    presetData?: Record<string, any>;
    lockService?: boolean;
    embedded?: boolean;
  }>(),
  {
    embedded: false,
    lockService: false,
  },
);

const emit = defineEmits<{ (e: 'submitted', id: string): void }>();

const store = useRequestStore();
const { t } = useI18n();
const localePath = useLocalePath();

// Mode autonome : URL hydration + sync.
if (!props.embedded) {
  store.hydrateFromRoute();
  onMounted(() => store.startUrlSync());
}

// Mode embedded : applique preset au mount.
if (props.embedded) {
  if (props.presetService || props.presetData) {
    store.applyPreset({
      service: props.presetService,
      ...(props.presetData || {}),
    });
  }
  // Si le service est lock-prefilled, on commence directement au step Detail.
  if (props.lockService && props.presetService && store.step === 'context') {
    store.goTo('detail');
  }
}

// Etapes visibles : si lockService, on cache 'context' (pas pertinent, deja choisi).
const visibleSteps = computed<RequestStep[]>(() =>
  props.lockService
    ? store.STEP_ORDER.filter((s) => s !== 'context')
    : [...store.STEP_ORDER],
);

const currentStepIndex = computed(() =>
  Math.max(0, visibleSteps.value.indexOf(store.step)),
);
const isFirstStep = computed(() => currentStepIndex.value === 0);
const isLastStep = computed(() => currentStepIndex.value === visibleSteps.value.length - 1);

const honeypot = ref('');
const submitting = ref(false);
const submitError = ref<string | null>(null);

async function submit() {
  submitError.value = null;
  if (!store.service) {
    submitError.value = t('request.errors.required');
    return;
  }

  const payload = {
    service: store.service,
    destination: store.destination,
    event: store.event,
    weekend: store.weekend,
    locale: store.replyLang,
    chauffeur: store.service === 'chauffeur' ? store.chauffeur : undefined,
    cars: store.service === 'cars' ? store.cars : undefined,
    yacht: store.service === 'yacht' ? store.yacht : undefined,
    helicopter: store.service === 'helicopter' ? store.helicopter : undefined,
    access: store.service === 'access' ? store.access : undefined,
    contact: store.contact,
    billing: store.billing.enabled ? store.billing : undefined,
    sourceUrl: typeof window !== 'undefined' ? window.location.href : undefined,
    honeypot: honeypot.value,
  };

  const parsed = requestSchema.safeParse(payload);
  if (!parsed.success) {
    submitError.value = t('request.errors.required');
    return;
  }

  submitting.value = true;
  try {
    const res = await $fetch<{ ok: boolean; id: string }>('/api/inquiries', {
      method: 'POST',
      body: parsed.data,
    });
    emit('submitted', res.id);
    if (!props.embedded) {
      await navigateTo(localePath('/request/thanks'));
    }
  } catch (e) {
    console.error(e);
    submitError.value = t('request.errors.submit');
  } finally {
    submitting.value = false;
  }
}

function handleNext() {
  if (store.step === 'review') {
    submit();
    return;
  }
  const nextIdx = currentStepIndex.value + 1;
  if (nextIdx < visibleSteps.value.length) {
    store.goTo(visibleSteps.value[nextIdx]!);
  }
}

function handleBack() {
  const prevIdx = currentStepIndex.value - 1;
  if (prevIdx >= 0) {
    store.goTo(visibleSteps.value[prevIdx]!);
  }
}

const canProceed = computed(() => {
  if (store.step === 'context') return !!store.service;
  if (store.step === 'detail') {
    const svc = store.service;
    if (svc === 'chauffeur') {
      const c = store.chauffeur;
      if (!c.pickup || !c.date || !c.time) return false;
      if (c.subtype === 'one-way') {
        if (!c.dropoff) return false;
        if (c.hasReturn && (!c.returnDate || !c.returnTime)) return false;
      } else if (c.subtype === 'by-the-hour') {
        if (!c.durationHours || c.durationHours < 3) return false;
      }
      return true;
    }
    if (svc === 'helicopter') {
      const h = store.helicopter;
      if (!h.departure || !h.destination || !h.date || !h.time) return false;
      if (h.hasReturn && (!h.returnDate || !h.returnTime)) return false;
      return true;
    }
    if (svc === 'cars') {
      const c = store.cars;
      return !!c.startDate && !!c.endDate && !!c.pickup && !!c.rentalCarId;
    }
    if (svc === 'yacht') {
      const y = store.yacht;
      // yachtId requis si la fiche produit a verrouille un bateau (locked).
      // Sinon en demande generique : duration + startDate suffisent.
      return !!y.startDate && (!!y.duration || !!y.size);
    }
    if (svc === 'access') {
      const a = store.access;
      if (a.items.length === 0) return false;
      return a.items.some((i) => !!i.city && !!i.date && !!i.guests);
    }
    return false;
  }
  if (store.step === 'contact') {
    return !!store.contact.firstName && !!store.contact.lastName && /\S+@\S+\.\S+/.test(store.contact.email);
  }
  return true;
});
</script>

<template>
  <div>
    <!-- Header autonome avec H1 + subtitle -->
    <header v-if="!embedded" class="mb-12">
      <p class="text-xs uppercase tracking-wide text-misana-muted mb-2">
        {{ t('common.step') }} {{ currentStepIndex + 1 }} / {{ visibleSteps.length }}
      </p>
      <h1 class="font-display text-4xl mb-3">{{ t('request.title') }}</h1>
      <p class="text-misana-muted">{{ t('request.subtitle') }}</p>
      <ol class="flex gap-2 mt-6">
        <li
          v-for="(s, idx) in visibleSteps"
          :key="s"
          class="flex-1 h-0.5"
          :class="idx <= currentStepIndex ? 'bg-misana-ink' : 'bg-misana-line'"
        ></li>
      </ol>
    </header>

    <!-- Header embedded compact -->
    <header v-else class="mb-6">
      <p class="text-xs uppercase tracking-wide text-misana-muted">
        {{ t('common.step') }} {{ currentStepIndex + 1 }} / {{ visibleSteps.length }}
      </p>
      <ol class="flex gap-2 mt-3">
        <li
          v-for="(s, idx) in visibleSteps"
          :key="s"
          class="flex-1 h-0.5"
          :class="idx <= currentStepIndex ? 'bg-misana-ink' : 'bg-misana-line'"
        ></li>
      </ol>
    </header>

    <form novalidate @submit.prevent="handleNext">
      <input
        v-model="honeypot"
        type="text"
        tabindex="-1"
        autocomplete="off"
        aria-hidden="true"
        class="absolute left-[-9999px]"
      />

      <StepContext v-if="store.step === 'context'" />
      <StepDetail v-else-if="store.step === 'detail'" />
      <StepContact v-else-if="store.step === 'contact'" />
      <StepReview v-else-if="store.step === 'review'" />

      <p v-if="submitError" class="mt-6 text-sm text-red-700">{{ submitError }}</p>

      <div class="mt-12 flex items-center justify-between">
        <button
          type="button"
          class="text-sm text-misana-muted hover:text-misana-ink underline disabled:opacity-30"
          :disabled="isFirstStep"
          @click="handleBack"
        >
          ← {{ t('common.back') }}
        </button>
        <button
          type="submit"
          class="border border-misana-ink px-6 py-3 text-sm tracking-wide hover:bg-misana-ink hover:text-misana-paper transition disabled:opacity-30 disabled:cursor-not-allowed"
          :disabled="!canProceed || submitting"
        >
          <span v-if="submitting">{{ t('common.loading') }}…</span>
          <span v-else-if="isLastStep">{{ t('common.submit') }}</span>
          <span v-else>{{ t('common.continue') }} →</span>
        </button>
      </div>
    </form>
  </div>
</template>
