// Scenario detection pour /request.
// Lit la query string + lookups Sanity (voiture, yacht, etablissement) et
// retourne le scenario applicable + le label de contexte + le back link.
//
// Convention query params (push 1) :
//   service       : chauffeur | cars | yacht | helicopter | access | multi
//   vehicle       : slug rentalCar (cars ou chauffeur vehicule pref)
//   yacht         : slug yacht
//   establishment : slug etablissement (+ city eventuel)
//   route         : slug transfer (chauffeur ou helicopter)
//   mode          : transfer | disposal (chauffeur)
//   city          : slug destination
//   date          : YYYY-MM-DD
//   dateEnd       : YYYY-MM-DD
//   time          : HH:MM
//   pax           : number
//   duration      : h4 | h8 | h12 | h24 | multi (chauffeur disposal)
//   days          : number (chauffeur disposal multi)
//   event         : slug event
//   weekend       : slug weekend
//   category      : restaurant | beach-club | palace | nightclub (access generic)
//
// Compat : les anciens noms de query (from / to / pickup / dropoff /
// establishment quand seul) sont remappés silencieusement vers la
// nouvelle convention au moment de la lecture.

import { useRentalCar } from '~/composables/useRentalCars';
import { useYacht } from '~/composables/useYachts';
import { useEstablishment } from '~/composables/useEstablishments';

export type ScenarioId =
  | 'vehicle' | 'yacht' | 'access'
  | 'chauffeur-transfer' | 'chauffeur-disposal' | 'chauffeur-generic'
  | 'helicopter-route' | 'helicopter-generic'
  | 'cars-generic' | 'yacht-generic' | 'access-generic'
  | 'event' | 'weekend' | 'multi'
  | 'service-picker';

export type ReplyPromise = '30min' | '1h' | '24h';

export type ScenarioContext = {
  scenarioId: ScenarioId;
  contextLabel: string;
  contextSubLabel?: string;
  contextImage?: string;
  backLink?: string;
  replyPromise: ReplyPromise;
  // Donnees de query parse-validees, propres au scenario.
  prefill: Record<string, string | number | undefined>;
};

// Mapping reply promise par scenario. Source : decisions du brief.
const REPLY_PROMISE: Record<ScenarioId, ReplyPromise> = {
  vehicle: '30min',
  yacht: '30min',
  access: '30min',
  'chauffeur-transfer': '30min',
  'helicopter-route': '30min',
  'chauffeur-disposal': '1h',
  'chauffeur-generic': '1h',
  'helicopter-generic': '1h',
  'cars-generic': '1h',
  'yacht-generic': '1h',
  'access-generic': '1h',
  event: '24h',
  weekend: '24h',
  multi: '24h',
  'service-picker': '24h',
};

function readQuery(name: string, query: Record<string, any>): string | undefined {
  const v = query[name];
  return typeof v === 'string' && v.length > 0 ? v : undefined;
}

// Determine le scenarioId depuis la query, en priorite descendante :
// fiche precise > route fixe > hub generic > event/weekend/multi > picker.
function resolveScenarioId(q: Record<string, any>): ScenarioId {
  const service = readQuery('service', q);
  const vehicle = readQuery('vehicle', q);
  const yachtSlug = readQuery('yacht', q);
  const establishment = readQuery('establishment', q);
  const route = readQuery('route', q);
  const mode = readQuery('mode', q);
  const event = readQuery('event', q);
  const weekend = readQuery('weekend', q);

  if (event && !service) return 'event';
  if (weekend) return 'weekend';
  if (service === 'multi') return 'multi';

  if (service === 'cars' && vehicle) return 'vehicle';
  if (service === 'yacht' && yachtSlug) return 'yacht';
  if (service === 'access' && establishment) return 'access';

  if (service === 'chauffeur') {
    if (route || mode === 'transfer') return 'chauffeur-transfer';
    if (mode === 'disposal') return 'chauffeur-disposal';
    return 'chauffeur-generic';
  }
  if (service === 'helicopter') {
    if (route) return 'helicopter-route';
    return 'helicopter-generic';
  }
  if (service === 'cars') return 'cars-generic';
  if (service === 'yacht') return 'yacht-generic';
  if (service === 'access') return 'access-generic';

  return 'service-picker';
}

// Charge le scenario complet : id + label + lookups async pour le bandeau.
// Retourne un Promise pour permettre await dans setup() des pages qui
// utilisent ce composable cote SSR.
export async function loadRequestScenario(): Promise<ScenarioContext> {
  const route = useRoute();
  const localePath = useLocalePath();
  const q = route.query as Record<string, any>;

  // Compat : remap des anciens noms de query.
  const compat = {
    ...q,
    vehicle: readQuery('vehicle', q),
    yacht: readQuery('yacht', q),
    establishment: readQuery('establishment', q),
    city: readQuery('city', q) || readQuery('destination', q),
    date: readQuery('date', q) || readQuery('from', q),
    dateEnd: readQuery('dateEnd', q) || readQuery('to', q),
  };

  const scenarioId = resolveScenarioId(compat);

  let contextLabel = '';
  let contextSubLabel: string | undefined;
  let contextImage: string | undefined;
  let backLink: string | undefined;

  // Lookups async pour les fiches precises. Si le slug est invalide,
  // on bascule silencieusement sur le label generique du service.
  if (scenarioId === 'vehicle' && compat.vehicle) {
    try {
      const { car } = await useRentalCar(compat.vehicle);
      if (car.value) {
        contextLabel = car.value.fullName || `${car.value.brand} ${car.value.model}`;
        contextSubLabel = `Location voiture${compat.city ? ` · ${compat.city}` : ''}`;
        contextImage = car.value.hero;
        backLink = localePath({ name: 'services-cars-brandModel', params: { brandModel: compat.vehicle } });
      }
    } catch {
      // Slug invalide -> bandeau generique
    }
  }

  if (scenarioId === 'yacht' && compat.yacht) {
    try {
      const { yacht } = await useYacht(compat.yacht);
      if (yacht.value) {
        contextLabel = yacht.value.fullName || yacht.value.name || compat.yacht;
        contextSubLabel = 'Charter yacht';
        contextImage = yacht.value.hero;
        backLink = localePath({ name: 'services-yacht-yacht', params: { yacht: compat.yacht } });
      }
    } catch {}
  }

  if (scenarioId === 'access' && compat.establishment) {
    try {
      const { establishment } = await useEstablishment(compat.establishment);
      if (establishment.value) {
        contextLabel = establishment.value.name;
        contextSubLabel = `${establishment.value.category} · ${establishment.value.city}`;
        contextImage = establishment.value.hero;
        backLink = localePath({ name: 'services-access-establishment', params: { establishment: compat.establishment } });
      }
    } catch {}
  }

  // Fallbacks pour les autres scenarios.
  if (!contextLabel) {
    contextLabel = defaultLabelFor(scenarioId, compat);
  }

  return {
    scenarioId,
    contextLabel,
    contextSubLabel,
    contextImage,
    backLink,
    replyPromise: REPLY_PROMISE[scenarioId],
    prefill: compat,
  };
}

function defaultLabelFor(id: ScenarioId, q: Record<string, any>): string {
  const labels: Record<ScenarioId, string> = {
    vehicle: 'Location voiture',
    yacht: 'Charter yacht',
    access: 'Réservation établissement',
    'chauffeur-transfer': 'Transfert chauffeur',
    'chauffeur-disposal': 'Mise à disposition',
    'chauffeur-generic': 'Service chauffeur',
    'helicopter-route': 'Transfert hélicoptère',
    'helicopter-generic': 'Vol hélicoptère',
    'cars-generic': 'Location voiture',
    'yacht-generic': 'Charter yacht',
    'access-generic': 'Réservation',
    event: q.event ? `Événement : ${q.event}` : 'Événement',
    weekend: q.weekend ? `Weekend : ${q.weekend}` : 'Weekend',
    multi: 'Demande sur mesure',
    'service-picker': 'Demande',
  };
  return labels[id];
}
