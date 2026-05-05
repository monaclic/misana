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
import type { CarsGenericData } from '~/components/forms/scenarios/CarsGenericScenario.vue';
import type { HelicopterData } from '~/components/forms/scenarios/HelicopterRouteScenario.vue';
import type { ChauffeurTransferData } from '~/components/forms/scenarios/ChauffeurTransferScenario.vue';
import type { ChauffeurDisposalData } from '~/components/forms/scenarios/ChauffeurDisposalScenario.vue';
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
// watch sur la query : quand l'utilisateur clique sur un service depuis le
// picker, l'URL change mais la page reste montee. Sans watch, useAsyncData
// ne re-fetch pas et on reste bloque sur le picker.
//
// Wrap try/catch : si un lookup Sanity, un dynamic import, ou la resolution
// du scenario throw cote SSR (slug invalide, network, etc), on retombe sur
// service-picker plutot que 500. La page reste navigable, le user peut
// recommencer une demande proprement.
const { data: scenario } = await useAsyncData(
  'request-scenario',
  async () => {
    try {
      return await loadRequestScenario();
    } catch (e) {
      console.error('[request] scenario load failed, falling back to picker:', e);
      return {
        scenarioId: 'service-picker' as const,
        contextLabel: 'Demande',
        replyPromise: '24h' as const,
        prefill: {},
      };
    }
  },
  { watch: [() => route.fullPath] },
);

// Telephone obligatoire pour les transferts (chauffeur, helico) ou ils
// doivent joindre l'invite. Optionnel partout ailleurs.
const phoneRequired = computed(() => {
  const id = scenario.value?.scenarioId;
  return id === 'chauffeur-transfer' || id === 'chauffeur-disposal' || id === 'helicopter-route';
});

// Mapping des donnees scenarios -> banner pour edition inline (chauffeur).
// Le banner peut afficher pickup -> dropoff en temps reel sans reload.
const heliEditFromState = useState<string | undefined>('request-heli-from', () => undefined);
const heliEditToState = useState<string | undefined>('request-heli-to', () => undefined);
// Sync des chauffeur fields vers le banner pour le label live.
const chauffeurFromState = useState<string | undefined>('request-chauffeur-from', () => undefined);
const chauffeurToState = useState<string | undefined>('request-chauffeur-to', () => undefined);
const chauffeurCityState = useState<string | undefined>('request-chauffeur-city', () => undefined);
const chauffeurDurationState = useState<string | undefined>('request-chauffeur-duration', () => undefined);
const chauffeurDaysState = useState<number | undefined>('request-chauffeur-days', () => undefined);
const chauffeurDistKmState = useState<number | undefined>('request-chauffeur-distkm', () => undefined);
const chauffeurVehicleIdState = useState<string | undefined>('request-chauffeur-vid', () => undefined);

watch(
  () => [chauffeurTransferData.value.pickup, chauffeurTransferData.value.dropoff, chauffeurTransferData.value.distanceKm, chauffeurTransferData.value.vehicleId],
  ([pickup, dropoff, dist, vid]) => {
    chauffeurFromState.value = pickup as string | undefined;
    chauffeurToState.value = dropoff as string | undefined;
    chauffeurDistKmState.value = dist as number | undefined;
    chauffeurVehicleIdState.value = vid as string | undefined;
  },
);
watch(
  () => [chauffeurDisposalData.value.city, chauffeurDisposalData.value.duration, chauffeurDisposalData.value.days, chauffeurDisposalData.value.vehicleId],
  ([city, duration, days, vid]) => {
    chauffeurCityState.value = city as string | undefined;
    chauffeurDurationState.value = duration as string | undefined;
    chauffeurDaysState.value = days as number | undefined;
    chauffeurVehicleIdState.value = vid as string | undefined;
  },
);
// Refs unused au runtime (juste pour qu eslint ne strip pas).
void heliEditFromState; void heliEditToState;

// Donnees collectees par le scenario component. Modele pluriel : on
// stocke chaque type de donnee sous sa cle, le scenario lit la sienne.
const vehicleData = ref<VehicleData>({});
const yachtData = ref<YachtData>({});
const accessData = ref<AccessData>({});
const carsGenericData = ref<CarsGenericData>({});
const helicopterData = ref<HelicopterData>({});
const chauffeurTransferData = ref<ChauffeurTransferData>({});
const chauffeurDisposalData = ref<ChauffeurDisposalData>({});
const genericData = ref<GenericData>({});

// Donnees contact partagees.
const contact = ref<ContactValue>({
  firstName: '',
  lastName: '',
  email: '',
  preferredChannel: 'email',
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
    whatsapp: contact.value.preferredChannel === 'whatsapp',
    replyLang: contact.value.replyLang,
    isOther: false,
    message: contact.value.message,
  };
  const sourceUrl = typeof window !== 'undefined' ? window.location.href : undefined;
  const honeypotVal = honeypot.value;

  if (id === 'vehicle') {
    // Map pickupType + libre vers le champ pickup serialise.
    const pickupLabels: Record<string, string> = {
      airport: 'Aéroport de Nice', hotel: 'Hôtel', villa: 'Villa', other: '',
    };
    const pickupSerialized = vehicleData.value.pickupType === 'other'
      ? vehicleData.value.pickup
      : pickupLabels[vehicleData.value.pickupType || ''] || vehicleData.value.pickup;
    // Notes enrichies avec les details non couverts par le schema zod
    // (duree approx, retour different, conducteur additionnel).
    const notesParts: string[] = [];
    if (vehicleData.value.durationApprox) {
      notesParts.push(`Durée approximative : ${vehicleData.value.durationApprox} jours`);
    }
    if (vehicleData.value.returnSame === false) {
      const rt = vehicleData.value.returnType;
      const rl = rt === 'other' ? vehicleData.value.returnLocation : pickupLabels[rt || ''];
      if (rl) notesParts.push(`Retour à : ${rl}`);
    }
    if (vehicleData.value.hasAdditionalDriver) {
      const a = `${vehicleData.value.additionalDriverAge || ''} ${vehicleData.value.additionalDriverLicence || ''}`.trim();
      notesParts.push(`Conducteur additionnel${a ? ` : ${a}` : ''}`);
    }
    if (vehicleData.value.notes) notesParts.push(vehicleData.value.notes);
    return {
      service: 'cars' as const,
      destination: undefined,
      cars: {
        rentalCarId: ctx.prefill.vehicle as string | undefined,
        pickup: pickupSerialized,
        startDate: vehicleData.value.startDate,
        driverAge: vehicleData.value.driverAge,
        licenceCountry: vehicleData.value.licenceCountry,
        notes: notesParts.join('\n') || undefined,
      },
      contact: baseContact,
      sourceUrl,
      honeypot: honeypotVal,
    };
  }

  if (id === 'cars-generic') {
    const pickupLabels: Record<string, string> = {
      airport: 'Aéroport de Nice', hotel: 'Hôtel', villa: 'Villa', other: '',
    };
    const pickupSerialized = carsGenericData.value.pickupType === 'other'
      ? carsGenericData.value.pickup
      : pickupLabels[carsGenericData.value.pickupType || ''] || carsGenericData.value.pickup;
    return {
      service: 'cars' as const,
      destination: undefined,
      cars: {
        type: carsGenericData.value.type,
        brand: carsGenericData.value.brand,
        pickup: pickupSerialized,
        startDate: carsGenericData.value.startDate,
        endDate: carsGenericData.value.endDate,
        driverAge: carsGenericData.value.driverAge,
        notes: carsGenericData.value.notes,
      },
      contact: baseContact,
      sourceUrl,
      honeypot: honeypotVal,
    };
  }

  if (id === 'yacht') {
    const portLabels: Record<string, string> = {
      'saint-tropez': 'Saint-Tropez', cannes: 'Cannes',
      antibes: 'Antibes', monaco: 'Monaco', other: '',
    };
    const portSerialized = yachtData.value.portType === 'other'
      ? yachtData.value.port
      : portLabels[yachtData.value.portType || ''] || yachtData.value.port;
    // Notes enrichies avec details non couverts par schema zod.
    const notesParts: string[] = [];
    if (yachtData.value.durationApprox) {
      const durLabels: Record<string, string> = {
        'half-day': 'Demi-journée', day: 'Journée', evening: 'Soirée', week: 'Semaine',
      };
      notesParts.push(`Durée : ${durLabels[yachtData.value.durationApprox]}`);
    }
    if (yachtData.value.notes) notesParts.push(yachtData.value.notes);
    return {
      service: 'yacht' as const,
      destination: undefined,
      yacht: {
        yachtId: ctx.prefill.yacht as string | undefined,
        port: portSerialized,
        startDate: yachtData.value.startDate,
        guests: yachtData.value.guests,
        notes: notesParts.join('\n') || undefined,
      },
      contact: baseContact,
      sourceUrl,
      honeypot: honeypotVal,
    };
  }

  if (id === 'access') {
    // Si la fiche a deja rempli (date + pax dans l'URL), on les
    // utilise directement. Le meal (lunch/dinner) est ajoute aux
    // notes pour transmission a l'equipe sans necessiter une heure
    // exacte (ils calent au telephone).
    const ctxDate = (ctx.prefill.date as string | undefined);
    const ctxPax = ctx.prefill.pax;
    const date = accessData.value.date || ctxDate;
    const guests = accessData.value.guests
      || (typeof ctxPax === 'string' ? Number(ctxPax) : ctxPax) as number | undefined;
    const meal = accessData.value.meal || (ctx.prefill.meal as 'lunch' | 'dinner' | undefined);
    const notesParts: string[] = [];
    if (meal) {
      notesParts.push(`Service : ${meal === 'lunch' ? 'Déjeuner' : 'Dîner'}`);
    }
    if (accessData.value.notes) notesParts.push(accessData.value.notes);
    return {
      service: 'access' as const,
      destination: undefined,
      access: {
        items: [
          {
            establishment: ctx.prefill.establishment as string | undefined,
            city: ctx.prefill.city as string | undefined,
            date,
            time: accessData.value.time,
            guests,
            occasion: accessData.value.occasion || 'none',
          },
        ],
        notes: notesParts.join('\n') || undefined,
      },
      contact: baseContact,
      sourceUrl,
      honeypot: honeypotVal,
    };
  }

  if (id === 'helicopter-route') {
    return {
      service: 'helicopter' as const,
      destination: undefined,
      helicopter: {
        departure: helicopterData.value.fromId,
        destination: helicopterData.value.toId,
        date: helicopterData.value.date,
        helicopterId: helicopterData.value.helicopterId,
        passengers: { adults: helicopterData.value.pax || 1, children: 0, babies: 0, pets: 0 },
        notes: helicopterData.value.notes || baseContact.message || undefined,
      },
      contact: baseContact,
      sourceUrl,
      honeypot: honeypotVal,
    };
  }

  if (id === 'chauffeur-transfer') {
    const stops = (chauffeurTransferData.value.stops || []).filter(Boolean);
    const notesParts: string[] = [];
    if (stops.length) notesParts.push(`Stops : ${stops.join(' · ')}`);
    if (chauffeurTransferData.value.luggage !== undefined) {
      notesParts.push(`Bagages : ${chauffeurTransferData.value.luggage}`);
    }
    if (chauffeurTransferData.value.distanceKm) {
      notesParts.push(`Distance estimee : ${chauffeurTransferData.value.distanceKm} km · ~${chauffeurTransferData.value.durationMin || ''} min`);
    }
    if (chauffeurTransferData.value.hasReturn && chauffeurTransferData.value.returnDate) {
      const rPax = chauffeurTransferData.value.returnPax;
      const rPaxStr = rPax && rPax !== chauffeurTransferData.value.pax ? ` · ${rPax} pax` : '';
      notesParts.push(`Retour : ${chauffeurTransferData.value.returnDate} ${chauffeurTransferData.value.returnTime || ''}${rPaxStr}`.trim());
    }
    if (chauffeurTransferData.value.notes) notesParts.push(chauffeurTransferData.value.notes);
    if (baseContact.message) notesParts.push(baseContact.message);
    return {
      service: 'chauffeur' as const,
      destination: undefined,
      chauffeur: {
        mode: 'transfer' as const,
        pickup: chauffeurTransferData.value.pickup,
        dropoff: chauffeurTransferData.value.dropoff,
        date: chauffeurTransferData.value.date,
        time: chauffeurTransferData.value.time,
        passengers: { adults: chauffeurTransferData.value.pax || 1, children: 0, babies: 0, pets: 0 },
        vehicleId: chauffeurTransferData.value.vehicleId,
        notes: notesParts.join('\n') || undefined,
      },
      contact: baseContact,
      sourceUrl,
      honeypot: honeypotVal,
    };
  }

  if (id === 'chauffeur-disposal') {
    const dur = chauffeurDisposalData.value.duration;
    const durLabel = dur === 'multi' ? `Plusieurs jours (${chauffeurDisposalData.value.days || ''})` : (dur || '');
    const notesParts: string[] = [];
    notesParts.push(`Durée : ${durLabel}`);
    if (chauffeurDisposalData.value.notes) notesParts.push(chauffeurDisposalData.value.notes);
    if (baseContact.message) notesParts.push(baseContact.message);
    return {
      service: 'chauffeur' as const,
      destination: undefined,
      chauffeur: {
        mode: 'disposal' as const,
        city: chauffeurDisposalData.value.city,
        date: chauffeurDisposalData.value.date,
        time: chauffeurDisposalData.value.time,
        passengers: { adults: chauffeurDisposalData.value.pax || 1, children: 0, babies: 0, pets: 0 },
        vehicleId: chauffeurDisposalData.value.vehicleId,
        notes: notesParts.join('\n') || undefined,
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
  // Si yacht-generic + journey : prepend la journey aux notes pour
  // transmission a l'equipe (ex 'Sejour choisi : Sardaigne en semaine').
  let mergedMessage = contact.value.message || genericData.value.notes;
  const journeySlug = ctx.prefill.journey as string | undefined;
  if (journeySlug) {
    const prefix = `Séjour choisi : ${journeySlug}`;
    mergedMessage = mergedMessage ? `${prefix}\n${mergedMessage}` : prefix;
  }
  return {
    service: serviceMap[id] as any,
    destination: undefined,
    event: ctx.prefill.event as string | undefined,
    weekend: ctx.prefill.weekend as string | undefined,
    contact: { ...baseContact, message: mergedMessage },
    sourceUrl,
    honeypot: honeypotVal,
  };
}

const canSubmit = computed(() => {
  if (!contact.value.rgpdAccepted) return false;
  if (!contact.value.firstName || !contact.value.lastName || !contact.value.email) return false;
  // Telephone obligatoire pour transferts ou si canal phone/whatsapp.
  const needPhone = phoneRequired.value
    || contact.value.preferredChannel === 'phone'
    || contact.value.preferredChannel === 'whatsapp';
  if (needPhone && !contact.value.phone) return false;
  // Confirmation WhatsApp obligatoire si canal=whatsapp.
  if (contact.value.preferredChannel === 'whatsapp' && !contact.value.whatsappConfirmed) return false;
  return true;
});

// Reply text inline sous bouton submit selon scenario.
const replyText = computed(() => {
  if (!scenario.value) return '';
  const map: Record<string, string> = {
    '30min': t('request.replyAfterSubmit.30min'),
    '1h': t('request.replyAfterSubmit.1h'),
    '24h': t('request.replyAfterSubmit.24h'),
  };
  return map[scenario.value.replyPromise] || '';
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
    <div class="max-w-4xl mx-auto px-6 sm:px-10 py-12 sm:py-16">
      <!-- Wrapper formulaire -->
      <form v-if="scenario" @submit.prevent="submit" class="request-form">
        <!-- Bandeau contexte herite. Cache en mode service-picker car aucun
             contexte n'est encore choisi : le picker fait office d'intro. -->
        <ContextBanner v-if="scenario.scenarioId !== 'service-picker'" :context="scenario" />

        <!-- Scenario component selon scenarioId -->
        <ServicePickerScenario v-if="scenario.scenarioId === 'service-picker'" />
        <VehicleScenario
          v-else-if="scenario.scenarioId === 'vehicle'"
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
        <CarsGenericScenario
          v-else-if="scenario.scenarioId === 'cars-generic'"
          v-model="carsGenericData"
          :prefill="scenario.prefill"
        />
        <HelicopterRouteScenario
          v-else-if="scenario.scenarioId === 'helicopter-route'"
          v-model="helicopterData"
          :prefill="scenario.prefill"
        />
        <ChauffeurTransferScenario
          v-else-if="scenario.scenarioId === 'chauffeur-transfer'"
          v-model="chauffeurTransferData"
          :prefill="scenario.prefill"
        />
        <ChauffeurDisposalScenario
          v-else-if="scenario.scenarioId === 'chauffeur-disposal'"
          v-model="chauffeurDisposalData"
          :prefill="scenario.prefill"
        />
        <GenericScenario
          v-else
          v-model="genericData"
          :prefill="scenario.prefill"
        />

        <!-- Contact partage. Le scenario vehicle a deja une zone
             "Precisions" dans son form, on cache le message ici.
             Cache aussi sur service-picker : aucun service choisi, rien
             a soumettre tant que l'utilisateur n'a pas selectionne. -->
        <ContactBlock
          v-if="scenario.scenarioId !== 'service-picker'"
          v-model="contact"
          :phone-required="phoneRequired"
          :hide-message="['vehicle', 'yacht', 'access'].includes(scenario.scenarioId)"
        >
          <template #submit>
            <button
              type="submit"
              class="submit-btn"
              :disabled="!canSubmit || submitting"
            >
              {{ submitting ? t('request.submitting') : t('request.submit') }}
            </button>
          </template>
        </ContactBlock>

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
  padding: 0.95rem 1.6rem;
  background: var(--color-misana-ink);
  color: var(--color-misana-paper);
  border: 0;
  font-size: 0.85rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  cursor: pointer;
  transition: opacity 0.2s ease;
  border-radius: 2px;
  white-space: nowrap;
}
.submit-btn:hover:not(:disabled) { opacity: 0.85; }
.submit-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
@media (max-width: 540px) {
  .submit-btn { width: 100%; }
}
.submit-reply {
  font-size: 0.78rem;
  color: var(--color-misana-muted);
  text-align: center;
  margin: 0;
}
@media (min-width: 640px) {
  .submit-reply { text-align: right; }
}
</style>
