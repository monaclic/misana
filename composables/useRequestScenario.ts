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
  | 'vehicle' | 'yacht' | 'access' | 'villa'
  | 'chauffeur-transfer' | 'chauffeur-disposal' | 'chauffeur-generic'
  | 'helicopter-route' | 'helicopter-generic'
  | 'cars-generic' | 'yacht-generic' | 'access-generic'
  | 'event' | 'weekend' | 'multi'
  | 'service-picker'
  // Drill-down picker : un service est selectionne mais le sous-mode reste
  // a choisir (transfer/disposal pour chauffeur ; contact direct/listing
  // pour cars et yacht). Render = ServicePickerScenario avec force-sub.
  | 'chauffeur-picker' | 'cars-picker' | 'yacht-picker';

export type ReplyPromise = '30min' | '1h' | '24h';

export type ScenarioContext = {
  scenarioId: ScenarioId;
  contextLabel: string;
  contextSubLabel?: string;
  contextImage?: string;
  backLink?: string;
  replyPromise: ReplyPromise;
  // Tarif indicatif affiche dans le bandeau (V1 : juste pour la
  // confiance, le tarif final est confirme au telephone).
  priceFrom?: { value: number; unit: 'day' | 'week' | 'trip'; currency: string };
  // Donnees de query parse-validees, propres au scenario.
  prefill: Record<string, string | number | undefined>;
};

// Mapping reply promise par scenario. Source : decisions du brief.
const REPLY_PROMISE: Record<ScenarioId, ReplyPromise> = {
  vehicle: '30min',
  yacht: '30min',
  access: '30min',
  villa: '30min',
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
  'chauffeur-picker': '24h',
  'cars-picker': '24h',
  'yacht-picker': '24h',
};

function readQuery(name: string, query: Record<string, any>): string | undefined {
  const v = query[name];
  return typeof v === 'string' && v.length > 0 ? v : undefined;
}

function slugToTitle(slug: string): string {
  return slug.split('-').map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join('-');
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
  if (service === 'villa') return 'villa';

  if (service === 'chauffeur') {
    if (route || mode === 'transfer') return 'chauffeur-transfer';
    if (mode === 'disposal') return 'chauffeur-disposal';
    // Sans mode/route : drill-down picker pour choisir entre Transfert
    // et Mise a disposition. Le user voit le sous-picker, pas un form
    // pauvre fallback.
    return 'chauffeur-picker';
  }
  if (service === 'helicopter') {
    // Toujours helicopter-route : le scenario component permet de saisir
    // from/to via le ContextBanner si non pre-fill. Le label/prix s'adapte
    // dynamiquement selon ce que l'utilisateur choisit dans le banner.
    return 'helicopter-route';
  }
  if (service === 'cars') {
    // Si l'utilisateur arrive avec mode=contact (depuis le sous-picker
    // "Demande directe"), on rend le form CarsGenericScenario. Sinon on
    // affiche le sous-picker Contact / Listing.
    if (mode === 'contact') return 'cars-generic';
    return 'cars-picker';
  }
  if (service === 'yacht') {
    if (readQuery('journey', q)) return 'yacht-generic';
    if (mode === 'contact') return 'yacht-generic';
    return 'yacht-picker';
  }
  if (service === 'access') return 'access-generic';

  return 'service-picker';
}

// Charge le scenario complet : id + label + lookups async pour le bandeau.
// Retourne un Promise pour permettre await dans setup() des pages qui
// utilisent ce composable cote SSR.
//
// Query passee explicitement en parametre : appel depuis useAsyncData en SSR
// Vercel, useRoute() ne lit pas correctement la query (renvoie vide), d'ou
// scenario tombait toujours sur 'service-picker' et 302 vers /contact.
export async function loadRequestScenario(
  queryOverride?: Record<string, any>,
): Promise<ScenarioContext> {
  const localePath = useLocalePath();
  const q = (queryOverride ?? (useRoute().query as Record<string, any>)) || {};

  // Compat : remap des anciens noms de query.
  // 'from' peut etre une date (legacy transfers/disposal) OU un heliport
  // (helicopter-route). On gate le fallback sur le format YYYY-MM-DD.
  const isIsoDate = (v: string | undefined) => !!v && /^\d{4}-\d{2}-\d{2}/.test(v);
  const fromQ = readQuery('from', q);
  const toQ = readQuery('to', q);
  const compat = {
    ...q,
    vehicle: readQuery('vehicle', q),
    yacht: readQuery('yacht', q),
    villa: readQuery('villa', q),
    establishment: readQuery('establishment', q),
    city: readQuery('city', q) || readQuery('destination', q),
    date: readQuery('date', q) || (isIsoDate(fromQ) ? fromQ : undefined),
    dateEnd: readQuery('dateEnd', q) || (isIsoDate(toQ) ? toQ : undefined),
    pax: readQuery('pax', q) || readQuery('guests', q),
    meal: readQuery('meal', q),
    dateFrom: readQuery('dateFrom', q),
    dateTo: readQuery('dateTo', q),
  };

  const scenarioId = resolveScenarioId(compat);

  let contextLabel = '';
  let contextSubLabel: string | undefined;
  let contextImage: string | undefined;
  let backLink: string | undefined;
  let priceFrom: ScenarioContext['priceFrom'];

  // Lookups async pour les fiches precises. Si le slug est invalide,
  // on bascule silencieusement sur le label generique du service.
  if (scenarioId === 'vehicle' && compat.vehicle) {
    try {
      const { car } = await useRentalCar(compat.vehicle);
      if (car.value) {
        contextLabel = car.value.fullName || `${car.value.brand} ${car.value.model}`;
        contextSubLabel = `Location voiture${compat.city ? ` · ${compat.city}` : ''}`;
        contextImage = car.value.hero;
        backLink = localePath({ name: 'cars-brandModel', params: { brandModel: compat.vehicle } });
        // Tarif indicatif : on prend la tranche la plus longue (weekPlus)
        // qui correspond au tarif "a partir de" le plus realiste.
        if (car.value.prices?.weekPlus) {
          priceFrom = { value: car.value.prices.weekPlus, unit: 'day', currency: 'EUR' };
        }
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
        backLink = localePath({ name: 'yacht-yacht', params: { yacht: compat.yacht } });
        if (yacht.value.pricePerDay) {
          priceFrom = { value: yacht.value.pricePerDay, unit: 'day', currency: 'EUR' };
        } else if (yacht.value.pricePerWeekFrom) {
          priceFrom = { value: yacht.value.pricePerWeekFrom, unit: 'week', currency: 'EUR' };
        }
      }
    } catch {}
  }

  if (scenarioId === 'villa' && compat.villa) {
    try {
      const sanity = useSanity();
      const data = await (sanity.client as any).fetch(
        /* groq */ `*[_type == "villa" &&
          (slugI18n.fr.current == $slug || slugI18n.en.current == $slug)][0]{
          name, city,
          "hero": hero.asset->url,
          pricePerWeekFrom, displayPrices
        }`,
        { slug: compat.villa },
      );
      if (data) {
        contextLabel = data.name || (compat.villa as string);
        contextSubLabel = `Villa${data.city ? ` · ${slugToTitle(data.city)}` : ''}`;
        contextImage = data.hero;
        backLink = localePath(`/villas/${compat.villa}`);
        if (data.displayPrices && data.pricePerWeekFrom) {
          priceFrom = { value: data.pricePerWeekFrom, unit: 'week', currency: 'EUR' };
        }
      }
    } catch {
      // Slug invalide -> bandeau generique
    }
  }

  if (scenarioId === 'access' && compat.establishment) {
    try {
      const { establishment } = await useEstablishment(compat.establishment);
      if (establishment.value) {
        contextLabel = establishment.value.name;
        contextSubLabel = `${establishment.value.category} · ${establishment.value.city}`;
        contextImage = establishment.value.hero;
        backLink = localePath({ name: 'access-establishment', params: { establishment: compat.establishment } });
      }
    } catch {}
  }

  // Yacht journey : 4 sejours preparees (riviera-weekend, pampelonne-family,
  // sardaigne-week, festival-cannes). On lit la metadata locale (i18n
  // gere les traductions FR/EN) et on enrichit le banner.
  if (scenarioId === 'yacht-generic' && readQuery('journey', q)) {
    const slug = readQuery('journey', q) as string;
    const JOURNEY_IMAGES: Record<string, string> = {
      'riviera-weekend': 'https://images.unsplash.com/photo-1566024287286-457247b70310?w=1600&q=80',
      'pampelonne-family': 'https://images.unsplash.com/photo-1473093226795-af9932fe5856?w=1600&q=80',
      'sardaigne-week': 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1600&q=80',
      'festival-cannes': 'https://images.unsplash.com/photo-1520637836862-4d197d17c25a?w=1600&q=80',
    };
    const JOURNEY_TITLES_FR: Record<string, { title: string; sub: string }> = {
      'riviera-weekend': { title: 'Weekend Riviera', sub: '2 jours · à partir de 24 mètres' },
      'pampelonne-family': { title: 'Pampelonne en famille', sub: '1 jour · day cruise' },
      'sardaigne-week': { title: 'Sardaigne en semaine', sub: '7 jours · charter complet' },
      'festival-cannes': { title: 'Festival de Cannes', sub: '5 jours · base flottante' },
    };
    const meta = JOURNEY_TITLES_FR[slug];
    if (meta) {
      contextLabel = meta.title;
      contextSubLabel = meta.sub;
    }
    if (JOURNEY_IMAGES[slug]) contextImage = JOURNEY_IMAGES[slug];
  }

  // Event : lookup Sanity pour avoir le nom + mois + ville + image.
  // Permet a l agenda de la home de pousser tout droit vers /request?event=
  // sans avoir besoin d une page detail event dediee.
  if (scenarioId === 'event') {
    const slug = readQuery('event', q);
    if (slug) {
      try {
        const sanity = useSanity();
        const data = await (sanity.client as any).fetch(
          /* groq */ `*[_type == "event" && slug.current == $slug][0]{
            nameEn, nameFr, monthEn, monthFr, heroImage,
            "cityEn": destination->nameEn,
            "cityFr": destination->nameFr
          }`,
          { slug },
        );
        if (data) {
          // FR par defaut. ContextBanner pourrait basculer en EN selon locale
          // si on enrichit les types ; pour l instant on prend le FR car la
          // majorite du trafic est franco-europeenne.
          contextLabel = data.nameFr || data.nameEn || slug;
          const month = data.monthFr || data.monthEn || '';
          const city = data.cityFr || data.cityEn || '';
          contextSubLabel = [month, city].filter(Boolean).join(' · ') || 'Événement';
          if (data.heroImage) {
            const { sanityImage } = await import('~/composables/useSanityImage');
            contextImage = sanityImage(data.heroImage);
          }
        }
      } catch {
        // Slug inconnu ou Sanity indispo -> fallback label generique.
      }
    }
  }

  // Route helico : compose le label "Nice -> Monaco · 7 min" + tarif min.
  if (scenarioId === 'helicopter-route') {
    const { HELI_ROUTES } = await import('~/lib/heliRoutes');
    const { HELICOPTERS } = await import('~/lib/fleet');
    const fromId = (q.from as string)?.toUpperCase();
    const toId = (q.to as string)?.toUpperCase();
    const route = HELI_ROUTES.find((r) => {
      const f = r.fromId === 'CEQ' ? ['CEQ', 'CNQ'] : r.fromId === 'LTT' ? ['LTT', 'STG'] : [r.fromId];
      const t_ = r.toId === 'CEQ' ? ['CEQ', 'CNQ'] : r.toId === 'LTT' ? ['LTT', 'STG'] : [r.toId];
      return f.includes(fromId) && t_.includes(toId);
    });
    if (route) {
      const labelMap: Record<string, string> = {
        NCE: 'Nice', MCM: 'Monaco', CEQ: 'Cannes', CNQ: 'Cannes',
        LTT: 'Saint-Tropez', STG: 'Saint-Tropez',
      };
      contextLabel = `${labelMap[fromId] || fromId} → ${labelMap[toId] || toId}`;
      contextSubLabel = `Transfert hélicoptère · ${route.duration}`;
      const prices = Object.values(route.price).filter((p): p is number => typeof p === 'number');
      if (prices.length) {
        priceFrom = { value: Math.min(...prices), unit: 'trip', currency: 'EUR' };
      }
    }
    // Si l'utilisateur arrive avec un appareil pre-selectionne (depuis fiche
    // ou hub flotte), on en met l'image dans le bandeau pour rappel visuel.
    const heliId = readQuery('helicopter', q);
    if (heliId) {
      const heli = HELICOPTERS.find((h) => h.id === heliId);
      if (heli?.image) contextImage = heli.image;
    }
  }

  // Transfer chauffeur : si on a un slug route -> lookup + tarif min.
  // Sinon le label "Pickup -> Dropoff" est compose dans le banner en
  // temps reel a partir du state partage du scenario.
  if (scenarioId === 'chauffeur-transfer') {
    const routeSlug = readQuery('route', q);
    if (routeSlug) {
      const { CHAUFFEUR_ROUTES } = await import('~/lib/chauffeurRoutes');
      const route = CHAUFFEUR_ROUTES.find((r) => r.id === routeSlug);
      if (route) {
        contextLabel = `${route.fromLabelFr} → ${route.toLabelFr}`;
        contextSubLabel = `Transfert chauffeur · ${route.duration}`;
        const prices = Object.values(route.prices).filter((p): p is number => typeof p === 'number');
        if (prices.length) priceFrom = { value: Math.min(...prices), unit: 'trip', currency: 'EUR' };
      }
    } else {
      const fromTxt = readQuery('from', q);
      const toTxt = readQuery('to', q);
      if (fromTxt && toTxt) {
        contextLabel = `${fromTxt} → ${toTxt}`;
        contextSubLabel = 'Transfert chauffeur';
      }
    }
  }

  // Disposal chauffeur : label "Mise a disposition · Ville · Duree" et
  // tarif min pour la duree choisie.
  if (scenarioId === 'chauffeur-disposal') {
    const { DISPOSAL_DURATIONS, disposalMinPrice } = await import('~/lib/chauffeurDisposal');
    const city = readQuery('city', q);
    const duration = readQuery('duration', q) as 'h4' | 'h8' | 'h12' | 'h24' | 'multi' | undefined;
    const cityLabel = city
      ? city.split('-').map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join('-')
      : '';
    const dur = DISPOSAL_DURATIONS.find((d) => d.id === duration);
    if (cityLabel) contextLabel = `Mise à disposition · ${cityLabel}`;
    else contextLabel = 'Mise à disposition';
    if (dur) contextSubLabel = `Chauffeur · ${dur.labelFr}`;
    else if (duration === 'multi') contextSubLabel = 'Chauffeur · Plusieurs jours';
    if (dur) priceFrom = { value: disposalMinPrice(dur.id), unit: 'trip', currency: 'EUR' };
  }

  // Helico generic mais avec un appareil pre-selectionne : on remonte
  // l image et le nom dans le bandeau pour la continuite avec la fiche.
  if (scenarioId === 'helicopter-generic') {
    const heliId = readQuery('helicopter', q);
    if (heliId) {
      const { HELICOPTERS } = await import('~/lib/fleet');
      const heli = HELICOPTERS.find((h) => h.id === heliId);
      if (heli) {
        contextLabel = heli.name;
        contextSubLabel = 'Vol hélicoptère';
        if (heli.image) contextImage = heli.image;
      }
    }
  }

  // Fallbacks pour les autres scenarios.
  if (!contextLabel) {
    const { locale } = useI18n();
    contextLabel = defaultLabelFor(scenarioId, compat, locale.value);
  }

  return {
    scenarioId,
    contextLabel,
    contextSubLabel,
    contextImage,
    backLink,
    replyPromise: REPLY_PROMISE[scenarioId],
    priceFrom,
    prefill: compat,
  };
}

function defaultLabelFor(id: ScenarioId, q: Record<string, any>, locale: string = 'en'): string {
  const isFr = locale === 'fr';
  const labels: Record<ScenarioId, string> = {
    vehicle: isFr ? 'Location voiture' : 'Car rental',
    yacht: isFr ? 'Charter yacht' : 'Yacht charter',
    access: isFr ? 'Réservation établissement' : 'Venue reservation',
    villa: isFr ? 'Villa' : 'Villa',
    'chauffeur-transfer': isFr ? 'Transfert chauffeur' : 'Chauffeur transfer',
    'chauffeur-disposal': isFr ? 'Mise à disposition' : 'Chauffeur on demand',
    'chauffeur-generic': isFr ? 'Service chauffeur' : 'Chauffeur service',
    'helicopter-route': isFr ? 'Transfert hélicoptère' : 'Helicopter transfer',
    'helicopter-generic': isFr ? 'Vol hélicoptère' : 'Helicopter flight',
    'cars-generic': isFr ? 'Location voiture' : 'Car rental',
    'yacht-generic': isFr ? 'Charter yacht' : 'Yacht charter',
    'access-generic': isFr ? 'Réservation' : 'Reservation',
    event: q.event
      ? (isFr ? `Événement : ${q.event}` : `Event: ${q.event}`)
      : (isFr ? 'Événement' : 'Event'),
    weekend: q.weekend
      ? (isFr ? `Weekend : ${q.weekend}` : `Weekend: ${q.weekend}`)
      : 'Weekend',
    multi: isFr ? 'Demande sur mesure' : 'Custom request',
    'service-picker': isFr ? 'Demande' : 'Request',
    'chauffeur-picker': isFr ? 'Service chauffeur' : 'Chauffeur service',
    'cars-picker': isFr ? 'Voitures' : 'Cars',
    'yacht-picker': isFr ? 'Yacht' : 'Yacht',
  };
  return labels[id];
}
