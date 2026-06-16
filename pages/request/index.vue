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
import { loadRequestScenario, type ScenarioId, type ScenarioContext } from '~/composables/useRequestScenario';
import { clearDraft } from '~/composables/useRequestDraft';
import type { ContactValue } from '~/components/forms/parts/ContactBlock.vue';
import type { VehicleData } from '~/components/forms/scenarios/VehicleScenario.vue';
import type { YachtData } from '~/components/forms/scenarios/YachtScenario.vue';
import type { VillaData } from '~/components/forms/scenarios/VillaScenario.vue';
import type { AccessData } from '~/components/forms/scenarios/AccessScenario.vue';
import type { AccessGenericData } from '~/components/forms/scenarios/AccessGenericScenario.vue';
import type { CarsGenericData } from '~/components/forms/scenarios/CarsGenericScenario.vue';
import type { HelicopterData } from '~/components/forms/scenarios/HelicopterRouteScenario.vue';
import type { ChauffeurTransferData } from '~/components/forms/scenarios/ChauffeurTransferScenario.vue';
import type { ChauffeurDisposalData } from '~/components/forms/scenarios/ChauffeurDisposalScenario.vue';
import type { GenericData } from '~/components/forms/scenarios/GenericScenario.vue';

definePageMeta({ layout: 'default' });

const { t, locale } = useI18n();
const localePath = useLocalePath();
const route = useRoute();
const sanity = useSanity();

useSeoMeta({
  title: () => t('request.title'),
  description: () => t('request.subtitle'),
});

// Charge le scenario depuis l'URL.
//
// BUG SSR Vercel : route.query (useRoute()) ET useRequestURL().searchParams
// renvoient VIDE en SSR pour les pages avec await useAsyncData (verifie
// empirique sur preview deploy : /fr/request?service=access&... rendait
// le ServicePicker default au lieu du AccessScenario prerempli).
//
// Workaround : on lit l URL brute depuis l h3 event SSR via getRequestURL()
// qui retourne la VRAIE URL HTTP avec query string. Sur le client on
// utilise route.query (qui est fiable cote client).
import { getRequestURL } from 'h3';

function readQueryForScenario(): Record<string, any> {
  // Client : route.query est fiable
  if (import.meta.client) {
    return route.query as Record<string, any>;
  }
  // SSR : lecture directe depuis l h3 event Vercel
  const event = useRequestEvent();
  if (!event) return route.query as Record<string, any>;
  const url = getRequestURL(event);
  const q: Record<string, string> = {};
  url.searchParams.forEach((v, k) => { q[k] = v; });
  return q;
}

// Cle dynamique par URL : evite cache partage entre URLs differentes.
// Graceful fallback : si loadRequestScenario throw (lookup Sanity rate, query
// invalide, etc), on retombe sur le scenario approprie selon ?service plutot
// que sur service-picker (qui annule l'intent du visiteur SEO).
const SERVICE_TO_SCENARIO: Record<string, ScenarioId> = {
  helicopter: 'helicopter-route',
  chauffeur: 'chauffeur-picker',
  cars: 'cars-picker',
  yacht: 'yacht-picker',
  access: 'access-generic',
  villa: 'villa',
};

function fallbackScenarioFromQuery(q: Record<string, any>): ScenarioContext {
  const service = typeof q.service === 'string' ? q.service : '';
  const scenarioId = SERVICE_TO_SCENARIO[service] ?? ('service-picker' as ScenarioId);
  return {
    scenarioId,
    contextLabel: '',
    replyPromise: '24h' as const,
    prefill: {},
  };
}

const { data: scenario } = await useAsyncData(
  `request-scenario:${route.fullPath}`,
  async () => {
    const q = readQueryForScenario();
    try {
      // On passe les deps captures au setup (localePath, client Sanity, locale)
      // pour que loadRequestScenario n'appelle AUCUN composable de contexte :
      // sinon le re-run cote client (watch sur route.fullPath quand la query
      // change) crashe "Must be called at the top of a setup function" et le
      // scenario tombe en fallback => liens du picker casses.
      return await loadRequestScenario(q, {
        localePath,
        sanityClient: sanity.client as any,
        locale: locale.value,
      });
    } catch (err: any) {
      console.error('[request] scenario load failed:', err?.message ?? err);
      return fallbackScenarioFromQuery(q);
    }
  },
  { watch: [() => route.fullPath] },
);

// Second filet : si le composable a retourne service-picker mais que la
// query indiquait un service connu (helicopter, chauffeur...), on force
// le scenario approprie. Evite le picker quand l'intent est clair.
if (scenario.value?.scenarioId === 'service-picker') {
  const q = readQueryForScenario();
  const mapped = typeof q.service === 'string' ? SERVICE_TO_SCENARIO[q.service] : undefined;
  if (mapped) {
    scenario.value.scenarioId = mapped;
  }
}

// Plus de redirection automatique : tous les scenarios (y compris pickers)
// rendent normalement leur composant. Une URL /request sans contexte
// affiche le ServicePickerScenario qui guide l'utilisateur vers le bon flux.

// Telephone obligatoire sur tous les scenarios : sans numero on ne peut
// pas confirmer / relancer si l'email rebondit ou reste sans reponse.
const phoneRequired = computed(() => true);

// Donnees collectees par le scenario component. Modele pluriel : on
// stocke chaque type de donnee sous sa cle, le scenario lit la sienne.
const vehicleData = ref<VehicleData>({});
const yachtData = ref<YachtData>({});
const villaData = ref<VillaData>({});
const accessData = ref<AccessData>({});
const accessGenericData = ref<AccessGenericData>({});
const carsGenericData = ref<CarsGenericData>({});
const helicopterData = ref<HelicopterData>({});
const chauffeurTransferData = ref<ChauffeurTransferData>({});
const chauffeurDisposalData = ref<ChauffeurDisposalData>({});
const genericData = ref<GenericData>({});

// Mapping des donnees scenarios -> banner pour edition inline (chauffeur).
// Le banner peut afficher pickup -> dropoff en temps reel sans reload.
// Les watch DOIVENT etre apres les ref qu'ils observent, sinon TDZ
// ReferenceError au moment ou Vue evalue la source getter pour capturer
// la valeur initiale -> setup crash -> 500 SSR.
const heliEditFromState = useState<string | undefined>('request-heli-from', () => undefined);
const heliEditToState = useState<string | undefined>('request-heli-to', () => undefined);
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
const SCENARIOS_FICHE: ScenarioId[] = ['vehicle', 'yacht', 'access', 'villa'];
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
    preferredChannel: contact.value.preferredChannel,
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
      const parts = [
        vehicleData.value.additionalDriverAge,
        vehicleData.value.additionalDriverLicence,
        vehicleData.value.additionalDriverNationality && `nationalité ${vehicleData.value.additionalDriverNationality}`,
      ].filter(Boolean);
      notesParts.push(`Conducteur additionnel${parts.length ? ` : ${parts.join(' · ')}` : ''}`);
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
        nationality: vehicleData.value.nationality,
        additionalDriverNationality: vehicleData.value.additionalDriverNationality,
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

  if (id === 'yacht' || id === 'yacht-generic') {
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

  if (id === 'villa') {
    return {
      service: 'villa' as const,
      destination: undefined,
      villa: {
        villaId: ctx.prefill.villa as string | undefined,
        city: ctx.prefill.city as string | undefined,
        area: villaData.value.area || undefined,
        startDate: villaData.value.startDate,
        endDate: villaData.value.endDate,
        guests: villaData.value.guests,
        notes: villaData.value.notes || undefined,
      },
      contact: baseContact,
      sourceUrl,
      honeypot: honeypotVal,
    };
  }

  if (id === 'access') {
    // Si la fiche a deja rempli (date + pax dans l'URL), on les
    // utilise directement. Le meal (lunch/dinner) est un champ
    // structure de l'item, pas une note libre (l'equipe voit "Repas"
    // dans l'email avec son propre label).
    const ctxDate = (ctx.prefill.date as string | undefined);
    const ctxPax = ctx.prefill.pax;
    const date = accessData.value.date || ctxDate;
    const guests = accessData.value.guests
      || (typeof ctxPax === 'string' ? Number(ctxPax) : ctxPax) as number | undefined;
    const meal = accessData.value.meal || (ctx.prefill.meal as 'lunch' | 'dinner' | undefined);
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
            meal,
            guests,
            occasion: accessData.value.occasion || 'none',
          },
        ],
        notes: accessData.value.notes || undefined,
      },
      contact: baseContact,
      sourceUrl,
      honeypot: honeypotVal,
    };
  }

  if (id === 'access-generic') {
    // Pas d'etablissement choisi : le user a dit son intent (type
    // d'adresse + ville + date + pax). L'equipe propose au rappel.
    // city est libre (8 destinations + 'other'), pas un slug strict
    // valide par DESTINATIONS zod -> on le passe en undefined si
    // 'other' pour ne pas trigger un refus zod, et on garde
    // l'information dans les notes.
    const city = accessGenericData.value.city;
    const validDestinations = ['saint-tropez', 'cannes', 'cap-d-antibes', 'cap-ferrat', 'nice', 'eze', 'monaco', 'menton'];
    const cityForSchema = city && validDestinations.includes(city) ? city as any : undefined;
    const notesParts: string[] = [];
    if (city === 'other') notesParts.push('Ville : ailleurs sur la côte');
    if (accessGenericData.value.notes) notesParts.push(accessGenericData.value.notes);
    if (baseContact.message) notesParts.push(baseContact.message);
    return {
      service: 'access' as const,
      destination: undefined,
      access: {
        items: [
          {
            category: accessGenericData.value.category as any,
            city: cityForSchema,
            date: accessGenericData.value.date,
            time: accessGenericData.value.time,
            guests: accessGenericData.value.guests,
            occasion: accessGenericData.value.occasion || 'none',
          },
        ],
        notes: notesParts.join('\n') || undefined,
      },
      contact: baseContact,
      sourceUrl,
      honeypot: honeypotVal,
    };
  }

  if (id === 'helicopter-route' || id === 'helicopter-generic') {
    return {
      service: 'helicopter' as const,
      destination: undefined,
      helicopter: {
        departure: helicopterData.value.fromId,
        destination: helicopterData.value.toId,
        date: helicopterData.value.date,
        time: helicopterData.value.time,
        helicopterId: helicopterData.value.helicopterId,
        passengers: { adults: helicopterData.value.pax || 1, children: 0, babies: 0, pets: 0 },
        priceEstimate: helicopterData.value.priceEstimate,
        notes: helicopterData.value.notes || baseContact.message || undefined,
      },
      contact: baseContact,
      sourceUrl,
      honeypot: honeypotVal,
    };
  }

  if (id === 'chauffeur-transfer') {
    const stops = (chauffeurTransferData.value.stops || []).filter(Boolean);
    const returnStops = (chauffeurTransferData.value.returnStops || []).filter(Boolean);
    // Notes : ne plus inclure stops / retour (desormais champs structures
    // dans le payload, l'email les affiche en lignes dediees). On garde
    // uniquement le free-text utilisateur (notes scenario + message contact).
    const notesParts: string[] = [];
    if (chauffeurTransferData.value.luggage !== undefined) {
      notesParts.push(`Bagages : ${chauffeurTransferData.value.luggage}`);
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
        stops: stops.length ? stops : undefined,
        date: chauffeurTransferData.value.date,
        time: chauffeurTransferData.value.time,
        passengers: { adults: chauffeurTransferData.value.pax || 1, children: 0, babies: 0, pets: 0 },
        vehicleId: chauffeurTransferData.value.vehicleId,
        distanceKm: chauffeurTransferData.value.distanceKm,
        hasReturn: chauffeurTransferData.value.hasReturn,
        returnDate: chauffeurTransferData.value.returnDate,
        returnTime: chauffeurTransferData.value.returnTime,
        returnPickup: chauffeurTransferData.value.returnPickup,
        returnDropoff: chauffeurTransferData.value.returnDropoff,
        returnStops: returnStops.length ? returnStops : undefined,
        returnPax: chauffeurTransferData.value.returnPax,
        priceEstimate: chauffeurTransferData.value.priceEstimate,
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
    vehicle: 'cars', yacht: 'yacht', access: 'access', villa: 'villa',
    'chauffeur-transfer': 'chauffeur', 'chauffeur-disposal': 'chauffeur', 'chauffeur-generic': 'chauffeur',
    'helicopter-route': 'helicopter', 'helicopter-generic': 'helicopter',
    'cars-generic': 'cars', 'yacht-generic': 'yacht', 'access-generic': 'access',
    event: 'multi', weekend: 'multi', multi: 'multi', 'service-picker': 'multi',
    'chauffeur-picker': 'chauffeur', 'cars-picker': 'cars', 'yacht-picker': 'yacht',
  };
  // Fallback : on prefixe la message avec les champs structures captures
  // par GenericScenario (date debut, date fin, nb personnes). Sans ca,
  // l equipe recevait l email sans date ni pax = relance impossible.
  // Idem pour le journey yacht-generic et l event/weekend pre-rempli.
  const fallbackParts: string[] = [];
  const journeySlug = ctx.prefill.journey as string | undefined;
  if (journeySlug) fallbackParts.push(`Séjour choisi : ${journeySlug}`);
  if (genericData.value.date) {
    const range = genericData.value.dateEnd
      ? `${genericData.value.date} → ${genericData.value.dateEnd}`
      : genericData.value.date;
    fallbackParts.push(`Dates : ${range}`);
  }
  if (genericData.value.pax) fallbackParts.push(`Personnes : ${genericData.value.pax}`);
  const userMessage = contact.value.message || genericData.value.notes;
  if (userMessage) fallbackParts.push(userMessage);
  const mergedMessage = fallbackParts.join('\n') || undefined;
  const mappedService = serviceMap[id];
  // access-generic : zod superRefine exige access.items.length >= 1.
  // On construit un item minimal avec les champs structures captures par
  // GenericScenario (date, pax), category par defaut "restaurant" (cas
  // majoritaire). L'equipe rappelle pour choisir l'etablissement precis.
  const accessFallback = mappedService === 'access' ? {
    items: [{
      date: genericData.value.date,
      guests: genericData.value.pax,
      occasion: 'none' as const,
    }],
    notes: genericData.value.notes,
  } : undefined;
  return {
    service: mappedService as any,
    destination: undefined,
    event: ctx.prefill.event as string | undefined,
    weekend: ctx.prefill.weekend as string | undefined,
    ...(accessFallback ? { access: accessFallback } : {}),
    contact: { ...baseContact, message: mergedMessage },
    sourceUrl,
    honeypot: honeypotVal,
  };
}

// Date manquante : sans date dans le payload, l'equipe ne sait pas
// quand servir le client. Le required HTML5 est unreliable cross-browser
// avec Vue, donc on bloque cote JS. Couvre le cas typique : user arrive
// sur /request via un widget qui n'a pas force la date (ex access fiche
// sans choix prealable), la section formulaire affiche bien le champ
// mais le user clique submit sans le remplir.
function isScenarioDateMissing(): boolean {
  const id = scenario.value?.scenarioId;
  if (!id) return false;
  switch (id) {
    case 'vehicle': return !vehicleData.value.startDate;
    case 'cars-generic': return !carsGenericData.value.startDate;
    case 'yacht':
    case 'yacht-generic': return !yachtData.value.startDate;
    case 'villa': return !villaData.value.startDate || !villaData.value.endDate;
    case 'access':
      // Date peut venir du widget fiche (prefill) ou du formulaire.
      return !(accessData.value.date || scenario.value?.prefill?.date);
    case 'access-generic':
      return !accessGenericData.value.date;
    case 'helicopter-route':
    case 'helicopter-generic': return !helicopterData.value.date;
    case 'chauffeur-transfer': return !chauffeurTransferData.value.date;
    case 'chauffeur-disposal': return !chauffeurDisposalData.value.date;
    case 'event':
    case 'weekend':
    case 'multi':
    case 'service-picker':
    case 'chauffeur-picker':
    case 'cars-picker':
    case 'yacht-picker':
      return !genericData.value.date;
    default: return false;
  }
}

const canSubmit = computed(() => {
  if (!contact.value.rgpdAccepted) return false;
  if (!contact.value.firstName || !contact.value.lastName || !contact.value.email) return false;
  // Telephone obligatoire pour transferts ou si canal phone/whatsapp.
  const needPhone = phoneRequired.value
    || contact.value.preferredChannel === 'phone'
    || contact.value.preferredChannel === 'whatsapp';
  if (needPhone && !contact.value.phone) return false;
  // Indicatif obligatoire si un numero est rempli (sinon on appelle un
  // numero injoignable - cas client etranger qui aurait garde le default).
  if (contact.value.phone && !contact.value.phoneCode) return false;
  // Confirmation WhatsApp obligatoire si canal=whatsapp.
  if (contact.value.preferredChannel === 'whatsapp' && !contact.value.whatsappConfirmed) return false;
  // Date du scenario obligatoire (sinon on recoit une demande sans date
  // utilisable et il faut rappeler -> deux fois plus de friction equipe).
  if (isScenarioDateMissing()) return false;
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

// ============================================================================
// Capture d'abandon (AJOUT, append-only). Ne modifie aucune logique ci-dessus.
// Expose un snapshot complet de la demande (itineraire + contact) dans un
// useState que le plugin abandon-capture.client.ts lit au visibilitychange.
// Lecture seule du formulaire : aucun effet sur submit, clearDraft, navigation
// ou sessionStorage. Client-only pour ne rien executer en SSR.
// ============================================================================
const abandonPayload = useState<Record<string, any> | null>('request-abandon-payload', () => null);
if (import.meta.client) {
  watchEffect(() => {
    if (!scenario.value) {
      abandonPayload.value = null;
      return;
    }
    try {
      abandonPayload.value = buildPayload();
    } catch {
      // Formulaire partiel : buildPayload peut lire des refs incompletes.
      // On n'expose alors aucun itineraire, le plugin retombe sur le draft.
      abandonPayload.value = null;
    }
  });
  // A la sortie de la page (dont navigation vers /request/thanks au submit),
  // on purge le snapshot pour ne jamais exposer un itineraire perime.
  onUnmounted(() => {
    abandonPayload.value = null;
  });
}
</script>

<template>
  <main class="min-h-screen bg-misana-paper">
    <div class="max-w-4xl mx-auto px-6 sm:px-10 py-12 sm:py-16">
      <!-- Wrapper formulaire -->
      <form v-if="scenario" @submit.prevent="submit" class="request-form">
        <!-- Bandeau contexte herite. Cache sur tous les pickers (niveau 1 et
             drill-down par service) : aucun contexte choisi. -->
        <ContextBanner
          v-if="!['service-picker','chauffeur-picker','cars-picker','yacht-picker'].includes(scenario.scenarioId)"
          :context="scenario"
        />

        <!-- Scenario component selon scenarioId -->
        <ServicePickerScenario v-if="scenario.scenarioId === 'service-picker'" />
        <ServicePickerScenario v-else-if="scenario.scenarioId === 'chauffeur-picker'" force-sub="chauffeur" />
        <ServicePickerScenario v-else-if="scenario.scenarioId === 'cars-picker'" force-sub="cars" />
        <ServicePickerScenario v-else-if="scenario.scenarioId === 'yacht-picker'" force-sub="yacht" />
        <VehicleScenario
          v-else-if="scenario.scenarioId === 'vehicle'"
          v-model="vehicleData"
          :prefill="scenario.prefill"
        />
        <YachtScenario
          v-else-if="scenario.scenarioId === 'yacht' || scenario.scenarioId === 'yacht-generic'"
          v-model="yachtData"
          :prefill="scenario.prefill"
        />
        <!-- villa (fiche villa) : villa lockee, sejour + voyageurs. -->
        <VillaScenario
          v-else-if="scenario.scenarioId === 'villa'"
          v-model="villaData"
          :prefill="scenario.prefill"
        />
        <!-- access (fiche etablissement) : etablissement locke. -->
        <AccessScenario
          v-else-if="scenario.scenarioId === 'access'"
          v-model="accessData"
          :prefill="scenario.prefill"
        />
        <!-- access-generic : user a choisi le service Access sans avoir
             selectionne d'etablissement. Esprit concierge Misana : le
             user dit son intent (type d'adresse, ville, date), l'equipe
             propose l'etablissement adapte au rappel. -->
        <AccessGenericScenario
          v-else-if="scenario.scenarioId === 'access-generic'"
          v-model="accessGenericData"
          :prefill="scenario.prefill"
        />
        <CarsGenericScenario
          v-else-if="scenario.scenarioId === 'cars-generic'"
          v-model="carsGenericData"
          :prefill="scenario.prefill"
        />
        <HelicopterRouteScenario
          v-else-if="scenario.scenarioId === 'helicopter-route' || scenario.scenarioId === 'helicopter-generic'"
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
          v-if="!['service-picker','chauffeur-picker','cars-picker','yacht-picker'].includes(scenario.scenarioId)"
          v-model="contact"
          :phone-required="phoneRequired"
          :hide-message="['vehicle', 'yacht', 'villa', 'access', 'access-generic'].includes(scenario.scenarioId)"
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
