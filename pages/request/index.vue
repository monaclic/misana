<script setup lang="ts">
// /request : formulaire de demande, scenario-aware.
//
// Architecture (push 2/4) :
//  1. loadRequestScenario() lit la query + lookups Sanity et determine
//     quel scenario afficher (15 possibles).
//  2. ContextBanner affiche le contexte herite (image + label + back +
//     WhatsApp + reply promise).
//  3. Le scenario component pose les questions specifiques au contexte
//     (cars: dates+pickup, yacht: port+dates+guests, access: date+heure+
//     guests+occasion). Les autres scenarios utilisent GenericScenario
//     en attendant les push 3 et 4.
//  4. ContactBlock collecte le contact (partage entre tous les scenarios).
//  5. Submit assemble le payload zod et POST /api/inquiries.
//
// Persistance sessionStorage : si l'utilisateur navigue back vers une
// fiche, ses dates et son contact sont preserves au retour.
import { loadRequestScenario, type ScenarioId } from '~/composables/useRequestScenario';
import { clearDraft } from '~/composables/useRequestDraft';
import type { ContactValue } from '~/components/forms/parts/ContactBlock.vue';
import type { VehicleData } from '~/components/forms/scenarios/VehicleScenario.vue';
import type { YachtData } from '~/components/forms/scenarios/YachtScenario.vue';
import type { AccessData } from '~/components/forms/scenarios/AccessScenario.vue';
import type { GenericData } from '~/components/forms/scenarios/GenericScenario.vue';

definePageMeta({ layout: 'default' });

const { t, locale } = useI18n();
const localePath = useLocalePath();
const route = useRoute();

useSeoMeta({
  title: () => t('request.title'),
  description: () => t('request.subtitle'),
});

// Charge le scenario depuis l'URL (async pour permettre les lookups Sanity).
const { data: scenario } = await useAsyncData(`request-scenario:${route.fullPath}`, () =>
  loadRequestScenario(),
);

// Telephone obligatoire pour les transferts (chauffeur, helico) ou ils
// doivent joindre l'invite. Optionnel partout ailleurs.
const phoneRequired = computed(() => {
  const id = scenario.value?.scenarioId;
  return id === 'chauffeur-transfer' || id === 'chauffeur-disposal' || id === 'helicopter-route';
});

// Donnees collectees par le scenario component. Modele pluriel : on
// stocke chaque type de donnee sous sa cle, le scenario lit la sienne.
const vehicleData = ref<VehicleData>({});
const yachtData = ref<YachtData>({});
const accessData = ref<AccessData>({});
const genericData = ref<GenericData>({});

// Donnees contact partagees.
const contact = ref<ContactValue>({
  firstName: '',
  lastName: '',
  email: '',
  whatsapp: false,
  replyLang: locale.value as 'fr' | 'en',
  newsletter: false,
  rgpdAccepted: false,
});

const honeypot = ref('');
const submitting = ref(false);
const submitError = ref<string | null>(null);

// Quel scenario component afficher selon scenarioId.
const SCENARIOS_FICHE: ScenarioId[] = ['vehicle', 'yacht', 'access'];
const isFicheScenario = computed(() =>
  scenario.value && SCENARIOS_FICHE.includes(scenario.value.scenarioId),
);

// Construit le payload zod selon le scenario actif.
function buildPayload() {
  const ctx = scenario.value!;
  const id = ctx.scenarioId;
  const baseContact = {
    firstName: contact.value.firstName,
    lastName: contact.value.lastName,
    email: contact.value.email,
    phone: contact.value.phone,
    phoneCode: contact.value.phoneCode,
    whatsapp: contact.value.whatsapp,
    replyLang: contact.value.replyLang,
    isOther: false,
    message: contact.value.message,
  };
  const sourceUrl = typeof window !== 'undefined' ? window.location.href : undefined;
  const honeypotVal = honeypot.value;

  if (id === 'vehicle') {
    return {
      service: 'cars' as const,
      destination: undefined,
      cars: {
        rentalCarId: ctx.prefill.vehicle as string | undefined,
        pickup: vehicleData.value.pickup,
        startDate: vehicleData.value.startDate,
        endDate: vehicleData.value.endDate,
        driverAge: vehicleData.value.driverAge,
        licenceCountry: vehicleData.value.licenceCountry,
        notes: vehicleData.value.notes,
      },
      contact: baseContact,
      sourceUrl,
      honeypot: honeypotVal,
    };
  }

  if (id === 'yacht') {
    return {
      service: 'yacht' as const,
      destination: undefined,
      yacht: {
        yachtId: ctx.prefill.yacht as string | undefined,
        port: yachtData.value.port,
        startDate: yachtData.value.startDate,
        endDate: yachtData.value.endDate,
        guests: yachtData.value.guests,
        notes: yachtData.value.notes,
      },
      contact: baseContact,
      sourceUrl,
      honeypot: honeypotVal,
    };
  }

  if (id === 'access') {
    return {
      service: 'access' as const,
      destination: undefined,
      access: {
        items: [
          {
            establishment: ctx.prefill.establishment as string | undefined,
            city: ctx.prefill.city as string | undefined,
            date: accessData.value.date,
            time: accessData.value.time,
            guests: accessData.value.guests,
            occasion: accessData.value.occasion || 'none',
          },
        ],
        notes: accessData.value.notes,
      },
      contact: baseContact,
      sourceUrl,
      honeypot: honeypotVal,
    };
  }

  // Fallback generique : service deduit du scenarioId, message libre principal.
  const serviceMap: Record<ScenarioId, string> = {
    vehicle: 'cars', yacht: 'yacht', access: 'access',
    'chauffeur-transfer': 'chauffeur', 'chauffeur-disposal': 'chauffeur', 'chauffeur-generic': 'chauffeur',
    'helicopter-route': 'helicopter', 'helicopter-generic': 'helicopter',
    'cars-generic': 'cars', 'yacht-generic': 'yacht', 'access-generic': 'access',
    event: 'multi', weekend: 'multi', multi: 'multi', 'service-picker': 'multi',
  };
  return {
    service: serviceMap[id] as any,
    destination: undefined,
    event: ctx.prefill.event as string | undefined,
    weekend: ctx.prefill.weekend as string | undefined,
    contact: { ...baseContact, message: contact.value.message || genericData.value.notes },
    sourceUrl,
    honeypot: honeypotVal,
  };
}

const canSubmit = computed(() => {
  if (!contact.value.rgpdAccepted) return false;
  if (!contact.value.firstName || !contact.value.lastName || !contact.value.email) return false;
  if (phoneRequired.value && !contact.value.phone) return false;
  return true;
});

async function submit() {
  if (!canSubmit.value || submitting.value) return;
  submitError.value = null;
  submitting.value = true;
  try {
    const payload = buildPayload();
    const res = await $fetch<{ ok: boolean; id: string }>('/api/inquiries', {
      method: 'POST',
      body: payload,
    });
    clearDraft();
    await navigateTo(localePath('/request/thanks'));
  } catch (e) {
    console.error(e);
    submitError.value = t('request.errors.submit');
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <main class="min-h-screen bg-misana-paper">
    <div class="max-w-2xl mx-auto px-6 sm:px-8 py-12 sm:py-16">
      <!-- Wrapper formulaire -->
      <form v-if="scenario" @submit.prevent="submit" class="request-form">
        <!-- Bandeau contexte herite -->
        <ContextBanner :context="scenario" />

        <!-- Scenario component selon scenarioId -->
        <VehicleScenario
          v-if="scenario.scenarioId === 'vehicle'"
          v-model="vehicleData"
          :prefill="scenario.prefill"
        />
        <YachtScenario
          v-else-if="scenario.scenarioId === 'yacht'"
          v-model="yachtData"
          :prefill="scenario.prefill"
        />
        <AccessScenario
          v-else-if="scenario.scenarioId === 'access'"
          v-model="accessData"
          :prefill="scenario.prefill"
        />
        <GenericScenario
          v-else
          v-model="genericData"
          :prefill="scenario.prefill"
        />

        <!-- Contact partage -->
        <ContactBlock
          v-model="contact"
          :phone-required="phoneRequired"
        />

        <!-- Honeypot anti-spam -->
        <input
          v-model="honeypot"
          type="text"
          name="company"
          tabindex="-1"
          autocomplete="off"
          aria-hidden="true"
          class="honeypot"
        />

        <!-- Erreur submit -->
        <p v-if="submitError" class="submit-error" role="alert">{{ submitError }}</p>

        <!-- Bouton submit -->
        <button
          type="submit"
          class="submit-btn"
          :disabled="!canSubmit || submitting"
        >
          {{ submitting ? t('request.submitting') : t('request.submit') }}
        </button>
      </form>
    </div>
  </main>
</template>

<style scoped>
.request-form {
  display: flex;
  flex-direction: column;
}

.honeypot {
  position: absolute;
  left: -9999px;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
}

.submit-error {
  color: #b00020;
  font-size: 0.85rem;
  margin: 0 0 1rem;
  padding: 0.6rem 0.85rem;
  border: 1px solid #b00020;
  background: rgba(176, 0, 32, 0.05);
  border-radius: 2px;
}

.submit-btn {
  width: 100%;
  padding: 1rem 1.5rem;
  background: var(--color-misana-ink);
  color: var(--color-misana-paper);
  border: 0;
  font-size: 0.9rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  cursor: pointer;
  transition: opacity 0.2s ease;
  border-radius: 2px;
}
.submit-btn:hover:not(:disabled) { opacity: 0.85; }
.submit-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
@media (min-width: 640px) {
  .submit-btn { width: auto; min-width: 240px; align-self: flex-end; }
}
</style>
