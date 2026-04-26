<script setup lang="ts">
// Tronc /request : 4 etapes orchestrees (Context, Detail, Contact, Review).
// V1 single-service, dates per-service.
import { useRequestStore } from '~/stores/request';
import { requestSchema } from '~/lib/forms/requestSchema';

definePageMeta({ layout: 'default' });

const store = useRequestStore();
const { t } = useI18n();
const localePath = useLocalePath();

store.hydrateFromRoute();
onMounted(() => store.startUrlSync());

useSeoMeta({
  title: () => t('request.title'),
  description: () => t('request.subtitle'),
});

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
    await $fetch('/api/inquiries', { method: 'POST', body: parsed.data });
    await navigateTo(localePath('/request/thanks'));
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
  } else {
    store.next();
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
      return !!y.duration && !!y.startDate;
    }
    if (svc === 'access') {
      const a = store.access;
      if (a.items.length === 0) return false;
      // Au moins un item complet (city + date + guests).
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
  <main class="min-h-screen px-6 py-12">
    <div class="max-w-2xl mx-auto">
      <header class="mb-12">
        <p class="text-xs uppercase tracking-wide text-misana-muted mb-2">
          {{ t('common.step') }} {{ store.stepIndex + 1 }} / {{ store.STEP_ORDER.length }}
        </p>
        <h1 class="font-display text-4xl mb-3">{{ t('request.title') }}</h1>
        <p class="text-misana-muted">{{ t('request.subtitle') }}</p>

        <ol class="flex gap-2 mt-6">
          <li
            v-for="(s, idx) in store.STEP_ORDER"
            :key="s"
            class="flex-1 h-0.5"
            :class="idx <= store.stepIndex ? 'bg-misana-ink' : 'bg-misana-line'"
          ></li>
        </ol>
      </header>

      <form novalidate @submit.prevent="handleNext">
        <input v-model="honeypot" type="text" tabindex="-1" autocomplete="off" aria-hidden="true" class="absolute left-[-9999px]" />

        <StepContext v-if="store.step === 'context'" />
        <StepDetail v-else-if="store.step === 'detail'" />
        <StepContact v-else-if="store.step === 'contact'" />
        <StepReview v-else-if="store.step === 'review'" />

        <p v-if="submitError" class="mt-6 text-sm text-red-700">{{ submitError }}</p>

        <div class="mt-12 flex items-center justify-between">
          <button
            type="button"
            class="text-sm text-misana-muted hover:text-misana-ink underline disabled:opacity-30"
            :disabled="store.isFirstStep"
            @click="store.back()"
          >
            ← {{ t('common.back') }}
          </button>
          <button
            type="submit"
            class="border border-misana-ink px-6 py-3 text-sm tracking-wide hover:bg-misana-ink hover:text-misana-paper transition disabled:opacity-30 disabled:cursor-not-allowed"
            :disabled="!canProceed || submitting"
          >
            <span v-if="submitting">{{ t('common.loading') }}…</span>
            <span v-else-if="store.isLastStep">{{ t('common.submit') }}</span>
            <span v-else>{{ t('common.continue') }} →</span>
          </button>
        </div>
      </form>
    </div>
  </main>
</template>
