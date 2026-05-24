// Donnees fiche transfert V1 hardcoded.
// Pattern Uber : data dense, pas d'editorial. Prix indicatif "From €X"
// affiche, ce qui differe du reste du site (pas de prix dans copy editoriale)
// car ici c'est de la data tarifaire operationnelle, pas de l'editorial.

import type { TransferSlug } from '~/lib/constants';
import { TRANSFERS } from '~/lib/constants';

// Resolution canonique : si le slug d'entree est un reverseSlug d'une route
// bidirectional, on retourne le slug canonique + reversed=true. Sinon retourne
// l'entree d'origine. Utilise par la page pour 301-redirect proprement.
export type CanonicalResolution = {
  canonicalSlug: string;
  isReverse: boolean;
  fromOverride?: string; // pour pre-orienter le widget si reverse
  toOverride?: string;
};

export function resolveCanonicalRoute(
  mode: 'chauffeur' | 'helicopter',
  inputSlug: string,
): CanonicalResolution | null {
  // 1) deja canonique sur ce mode ?
  const canonicalDirect = TRANSFERS.find(
    (t) => t.slug === inputSlug && (t.mode === mode || t.mode === 'both'),
  );
  if (canonicalDirect) {
    return { canonicalSlug: canonicalDirect.slug, isReverse: false };
  }
  // 2) reverseSlug d'une route bidirectional sur ce mode ?
  const canonicalReverse = TRANSFERS.find(
    (t) => 'reverseSlug' in t
      && (t as { reverseSlug?: string }).reverseSlug === inputSlug
      && (t.mode === mode || t.mode === 'both'),
  );
  if (canonicalReverse) {
    return {
      canonicalSlug: canonicalReverse.slug,
      isReverse: true,
      // Quand on arrive via le reverseSlug, on inverse les villes pour
      // pre-remplir le widget dans le bon sens.
      fromOverride: canonicalReverse.to,
      toOverride: canonicalReverse.from,
    };
  }
  return null;
}

export type TransferDetail = {
  durationChauffeur?: number; // minutes
  durationHelicopter?: number; // minutes
  distanceKm: number;
  priceFrom: number; // EUR, indicatif
  heliportFrom?: { fr: string; en: string };
  heliportTo?: { fr: string; en: string };
  vehicleType?: { fr: string; en: string };
  aircraftType?: { fr: string; en: string };
  pickup?: { fr: string; en: string };
  dropoff?: { fr: string; en: string };
  luggageHint?: { fr: string; en: string };
  paxMin: number;
  paxMax: number;
  whatToExpect: { fr: string[]; en: string[] };
};

// Coordonnees [lat, lng] des 8 villes V1 + nice-airport (LFMN).
export const CITY_COORDS: Record<string, [number, number]> = {
  'saint-tropez': [43.2677, 6.6407],
  'cannes': [43.5528, 7.0174],
  'cap-d-antibes': [43.5615, 7.1356],
  'nice': [43.7102, 7.2620],
  'nice-airport': [43.6585, 7.2154],
  'cap-ferrat': [43.6843, 7.3315],
  'eze': [43.7281, 7.3622],
  'monaco': [43.7384, 7.4246],
  'menton': [43.7765, 7.5015],
};

// Coordonnees precises [lat, lng] des heliports principaux Riviera.
// Pour le rendu map en mode helicoptere : la polyline part/arrive sur
// l'heliport reel, pas le centre-ville (qui est decale).
export const HELIPORT_COORDS: Record<string, [number, number]> = {
  'nice': [43.6635, 7.2103],          // Heliport de Nice, cote aeroport
  'monaco': [43.7257, 7.4148],        // Fontvieille, digue
  'cannes': [43.5446, 7.0123],        // Quai du Large (port)
  'saint-tropez': [43.2057, 6.4789],  // La Mole, aerodrome
};

const DETAILS: Record<string, TransferDetail> = {
  // ===== HELICOPTERE =====
  'helicopter:monaco-saint-tropez': {
    durationHelicopter: 22,
    distanceKm: 65,
    priceFrom: 2200,
    heliportFrom: { fr: 'Heliport de Monaco · Fontvieille', en: 'Monaco heliport · Fontvieille' },
    heliportTo: { fr: 'Heliport de La Mole · Saint-Tropez', en: 'La Mole heliport · Saint-Tropez' },
    aircraftType: { fr: 'Airbus H125 · H130 · H135', en: 'Airbus H125 · H130 · H135' },
    luggageHint: { fr: '2 valises moyennes / pax', en: '2 medium bags / pax' },
    paxMin: 1,
    paxMax: 6,
    whatToExpect: {
      fr: [
        'Vol soumis aux conditions météo. Backup chauffeur V-Class préparé.',
        'Embarquement quinze minutes avant le décollage, briefing sécurité.',
        'Annulation gratuite jusqu\'à 24h avant. Mercedes V-Class aux deux extrémités.',
      ],
      en: [
        'Flight is weather-dependent. V-Class chauffeur backup prepared.',
        'Boarding fifteen minutes before takeoff, safety briefing.',
        'Free cancellation up to 24h before. Mercedes V-Class at both ends.',
      ],
    },
  },

  'helicopter:cannes-monaco': {
    durationHelicopter: 10,
    distanceKm: 56,
    priceFrom: 1200,
    heliportFrom: { fr: 'Cannes Mandelieu ou Quai du Large', en: 'Cannes Mandelieu or Quai du Large' },
    heliportTo: { fr: 'Heliport de Monaco · Fontvieille', en: 'Monaco heliport · Fontvieille' },
    aircraftType: { fr: 'Airbus H125 · H130', en: 'Airbus H125 · H130' },
    luggageHint: { fr: '2 valises moyennes / pax', en: '2 medium bags / pax' },
    paxMin: 1,
    paxMax: 6,
    whatToExpect: {
      fr: [
        'Heliport au choix : Quai du Large (Croisette) ou Mandelieu (arrière-pays).',
        'Vol soumis météo, backup chauffeur prévu.',
        'Pendant le Grand Prix : Fontvieille saturé, anticiper 48h.',
      ],
      en: [
        'Choice of heliport: Quai du Large (Croisette) or Mandelieu (inland).',
        'Flight weather-dependent, chauffeur backup ready.',
        'During Grand Prix: Fontvieille saturated, anticipate 48h.',
      ],
    },
  },

  'helicopter:nice-monaco': {
    durationHelicopter: 7,
    distanceKm: 18,
    priceFrom: 700,
    heliportFrom: { fr: 'Heliport de Nice', en: 'Nice heliport' },
    heliportTo: { fr: 'Heliport de Monaco · Fontvieille', en: 'Monaco heliport · Fontvieille' },
    aircraftType: { fr: 'Airbus H125 · H130 · AS355', en: 'Airbus H125 · H130 · AS355' },
    luggageHint: { fr: '2 valises moyennes / pax', en: '2 medium bags / pax' },
    paxMin: 1,
    paxMax: 6,
    whatToExpect: {
      fr: [
        'Sept minutes de vol entre Nice et Monaco. La route prend une heure ou plus en saison.',
        'Embarquement quinze minutes avant le décollage, briefing sécurité.',
        'Mercedes V-Class aux deux extrémités, transferts inclus jusqu\'à votre adresse.',
      ],
      en: [
        'Seven minutes of flight between Nice and Monaco. The road takes one hour or more in season.',
        'Boarding fifteen minutes before takeoff, safety briefing.',
        'Mercedes V-Class at both ends, transfers included to your address.',
      ],
    },
  },

  'helicopter:nice-cannes': {
    durationHelicopter: 10,
    distanceKm: 32,
    priceFrom: 1000,
    heliportFrom: { fr: 'Heliport de Nice', en: 'Nice heliport' },
    heliportTo: { fr: 'Cannes Quai du Large ou Mandelieu', en: 'Cannes Quai du Large or Mandelieu' },
    aircraftType: { fr: 'Airbus H125 · H130', en: 'Airbus H125 · H130' },
    luggageHint: { fr: '2 valises moyennes / pax', en: '2 medium bags / pax' },
    paxMin: 1,
    paxMax: 6,
    whatToExpect: {
      fr: [
        'Dix minutes de vol entre Nice et Cannes. La route fait 30 minutes hors pointe, beaucoup plus en saison.',
        'Quai du Large pour la Croisette, Mandelieu pour l\'arrière-pays.',
        'Mercedes V-Class aux deux extrémités, inclus.',
      ],
      en: [
        'Ten minutes of flight between Nice and Cannes. The road is 30 minutes off-peak, much longer in season.',
        'Quai du Large for the Croisette, Mandelieu for inland.',
        'Mercedes V-Class at both ends, included.',
      ],
    },
  },

  'helicopter:nice-saint-tropez': {
    durationHelicopter: 20,
    distanceKm: 75,
    priceFrom: 2100,
    heliportFrom: { fr: 'Heliport de Nice', en: 'Nice heliport' },
    heliportTo: { fr: 'Heliport de La Mole · Saint-Tropez', en: 'La Mole heliport · Saint-Tropez' },
    aircraftType: { fr: 'Airbus H125 · H130', en: 'Airbus H125 · H130' },
    luggageHint: { fr: '2 valises moyennes / pax', en: '2 medium bags / pax' },
    paxMin: 1,
    paxMax: 6,
    whatToExpect: {
      fr: [
        'Vingt minutes de vol contre deux heures par la route en saison.',
        'Mercedes V-Class de l\'aéroport de Nice ou de votre hôtel à l\'heliport.',
        'V-Class à La Mole pour rejoindre votre adresse à Saint-Tropez ou Pampelonne.',
      ],
      en: [
        'Twenty minutes of flight against two hours by road in season.',
        'Mercedes V-Class from Nice airport or your hotel to the heliport.',
        'V-Class at La Mole to reach your address in Saint-Tropez or Pampelonne.',
      ],
    },
  },

  'helicopter:cap-ferrat-saint-tropez': {
    durationHelicopter: 20,
    distanceKm: 75,
    priceFrom: 2000,
    heliportFrom: { fr: 'Heliport de Nice (chauffeur depuis Cap-Ferrat)', en: 'Nice heliport (chauffeur from Cap-Ferrat)' },
    heliportTo: { fr: 'Heliport de La Mole · Saint-Tropez', en: 'La Mole heliport · Saint-Tropez' },
    aircraftType: { fr: 'Airbus H125 · H130', en: 'Airbus H125 · H130' },
    luggageHint: { fr: '2 valises moyennes / pax', en: '2 medium bags / pax' },
    paxMin: 1,
    paxMax: 6,
    whatToExpect: {
      fr: [
        'Cap-Ferrat n\'a pas d\'heliport. V-Class du Cap à Nice (15 min).',
        'Vol Nice → La Mole en 20 minutes. Total porte-à-porte ~50 min.',
        'V-Class à La Mole pour rejoindre votre adresse à Saint-Tropez.',
      ],
      en: [
        'Cap-Ferrat has no heliport. V-Class from Cap to Nice (15 min).',
        'Nice → La Mole flight in 20 minutes. Door-to-door ~50 min total.',
        'V-Class at La Mole to reach your address in Saint-Tropez.',
      ],
    },
  },

  'helicopter:monaco-cannes': {
    durationHelicopter: 12,
    distanceKm: 56,
    priceFrom: 1100,
    heliportFrom: { fr: 'Heliport de Monaco · Fontvieille', en: 'Monaco heliport · Fontvieille' },
    heliportTo: { fr: 'Cannes Quai du Large ou Mandelieu', en: 'Cannes Quai du Large or Mandelieu' },
    aircraftType: { fr: 'Airbus H125 · H130 · AS355', en: 'Airbus H125 · H130 · AS355' },
    luggageHint: { fr: '2 valises moyennes / pax', en: '2 medium bags / pax' },
    paxMin: 1,
    paxMax: 6,
    whatToExpect: {
      fr: [
        'Douze minutes de vol entre Monaco et Cannes. La route fait une heure hors saison, deux heures pendant le Festival ou le Grand Prix.',
        'Quai du Large pour la Croisette (5 min en chauffeur), Mandelieu pour l\'arrière-pays.',
        'Mercedes V-Class aux deux extrémités, inclus jusqu\'à votre adresse.',
      ],
      en: [
        'Twelve minutes of flight between Monaco and Cannes. The road is one hour off-peak, two hours during the Festival or the Grand Prix.',
        'Quai du Large for the Croisette (5 min by chauffeur), Mandelieu for inland.',
        'Mercedes V-Class at both ends, included to your address.',
      ],
    },
  },

  'helicopter:cannes-saint-tropez': {
    durationHelicopter: 15,
    distanceKm: 80,
    priceFrom: 1700,
    heliportFrom: { fr: 'Cannes Mandelieu ou Quai du Large', en: 'Cannes Mandelieu or Quai du Large' },
    heliportTo: { fr: 'Heliport de La Mole · Saint-Tropez', en: 'La Mole heliport · Saint-Tropez' },
    aircraftType: { fr: 'Airbus H125 · H130 · AS355', en: 'Airbus H125 · H130 · AS355' },
    luggageHint: { fr: '2 valises moyennes / pax', en: '2 medium bags / pax' },
    paxMin: 1,
    paxMax: 6,
    whatToExpect: {
      fr: [
        'Quinze minutes de vol contre 1h30 à 3h par la route en été. L\'A8 sature dès juin, le détour par Le Muy peut durer trois heures.',
        'Mandelieu pour les vols vers l\'ouest. Quai du Large si départ Croisette.',
        'V-Class à La Mole pour Saint-Tropez, Pampelonne ou un transfert direct vers un yacht.',
      ],
      en: [
        'Fifteen minutes of flight against 1h30 to 3h by road in summer. The A8 saturates from June, the Le Muy detour can last three hours.',
        'Mandelieu for westbound flights. Quai du Large if departing from the Croisette.',
        'V-Class at La Mole to Saint-Tropez, Pampelonne or a direct transfer to a yacht.',
      ],
    },
  },

  // ===== CHAUFFEUR =====
  'chauffeur:nice-airport-cannes': {
    durationChauffeur: 30,
    distanceKm: 32,
    priceFrom: 120,
    vehicleType: { fr: 'Mercedes V-Class · S-Class · E-Class', en: 'Mercedes V-Class · S-Class · E-Class' },
    pickup: { fr: 'Aéroport de Nice · Terminaux 1 et 2', en: 'Nice Airport · Terminals 1 and 2' },
    dropoff: { fr: 'Votre adresse à Cannes', en: 'Your address in Cannes' },
    luggageHint: { fr: 'Jusqu\'à 4 grandes valises', en: 'Up to 4 large bags' },
    paxMin: 1,
    paxMax: 7,
    whatToExpect: {
      fr: [
        'Accueil à la sortie des bagages, panneau au nom du voyageur.',
        'Suivi des vols en temps réel, attente gratuite jusqu\'à 1h.',
        'Pendant le Festival : départ 30 min plus tôt, basse corniche en backup.',
      ],
      en: [
        'Welcome at baggage hall exit, name sign for the traveller.',
        'Real-time flight tracking, free waiting up to 1h.',
        'During Festival: depart 30 min earlier, lower corniche as backup.',
      ],
    },
  },

  'chauffeur:nice-airport-monaco': {
    durationChauffeur: 30,
    distanceKm: 22,
    priceFrom: 130,
    vehicleType: { fr: 'Mercedes V-Class · S-Class · E-Class', en: 'Mercedes V-Class · S-Class · E-Class' },
    pickup: { fr: 'Aéroport de Nice · Terminaux 1 et 2', en: 'Nice Airport · Terminals 1 and 2' },
    dropoff: { fr: 'Votre adresse à Monaco', en: 'Your address in Monaco' },
    luggageHint: { fr: 'Jusqu\'à 4 grandes valises', en: 'Up to 4 large bags' },
    paxMin: 1,
    paxMax: 7,
    whatToExpect: {
      fr: [
        'Accueil à la sortie des bagages, panneau au nom du voyageur.',
        'Suivi des vols en temps réel, attente gratuite jusqu\'à 1h.',
        'A8 puis basse corniche selon trafic. Plus rapide en heure creuse.',
      ],
      en: [
        'Welcome at baggage hall exit, name sign for the traveller.',
        'Real-time flight tracking, free waiting up to 1h.',
        'A8 then lower corniche based on traffic. Faster off-peak.',
      ],
    },
  },

  'chauffeur:nice-airport-saint-tropez': {
    durationChauffeur: 90,
    distanceKm: 100,
    priceFrom: 280,
    vehicleType: { fr: 'Mercedes V-Class · S-Class', en: 'Mercedes V-Class · S-Class' },
    pickup: { fr: 'Aéroport de Nice · Terminaux 1 et 2', en: 'Nice Airport · Terminals 1 and 2' },
    dropoff: { fr: 'Votre adresse à Saint-Tropez ou Pampelonne', en: 'Your address in Saint-Tropez or Pampelonne' },
    luggageHint: { fr: 'Jusqu\'à 4 grandes valises', en: 'Up to 4 large bags' },
    paxMin: 1,
    paxMax: 7,
    whatToExpect: {
      fr: [
        '1h30 hors saison, jusqu\'à 2h30 en juillet et août sur l\'A8.',
        'Suivi des vols, attente gratuite 1h, panneau au nom du voyageur.',
        'Pour les vols de nuit, attente prolongée gratuite jusqu\'à 1h30.',
      ],
      en: [
        '1h30 off-season, up to 2h30 in July and August on the A8.',
        'Flight tracking, 1h free waiting, name sign for the traveller.',
        'For night arrivals, extended free waiting up to 1h30.',
      ],
    },
  },

  'chauffeur:cannes-saint-tropez': {
    durationChauffeur: 90,
    distanceKm: 95,
    priceFrom: 260,
    vehicleType: { fr: 'Mercedes V-Class · S-Class', en: 'Mercedes V-Class · S-Class' },
    pickup: { fr: 'Votre adresse à Cannes', en: 'Your address in Cannes' },
    dropoff: { fr: 'Votre adresse à Saint-Tropez', en: 'Your address in Saint-Tropez' },
    luggageHint: { fr: 'Jusqu\'à 4 grandes valises', en: 'Up to 4 large bags' },
    paxMin: 1,
    paxMax: 7,
    whatToExpect: {
      fr: [
        'A8 puis A57. 1h30 hors pointe, beaucoup plus le week-end en saison.',
        'Pour Pampelonne, dépose directe à votre paillote ou plage.',
        'Hélicoptère 15 min disponible si la pression horaire l\'exige.',
      ],
      en: [
        'A8 then A57. 1h30 off-peak, much more on summer weekends.',
        'For Pampelonne, direct drop-off at your beach club or shore.',
        'Helicopter 15 min available if time pressure demands.',
      ],
    },
  },

  'chauffeur:cannes-monaco': {
    durationChauffeur: 60,
    distanceKm: 56,
    priceFrom: 220,
    vehicleType: { fr: 'Mercedes V-Class · S-Class', en: 'Mercedes V-Class · S-Class' },
    pickup: { fr: 'Votre adresse à Cannes', en: 'Your address in Cannes' },
    dropoff: { fr: 'Votre adresse à Monaco', en: 'Your address in Monaco' },
    luggageHint: { fr: 'Jusqu\'à 4 grandes valises', en: 'Up to 4 large bags' },
    paxMin: 1,
    paxMax: 7,
    whatToExpect: {
      fr: [
        'A8 + basse corniche. 1h hors pointe, 1h40 en saison.',
        'Pour un dîner à Monaco : départ 2h avant la réservation.',
        'Pression horaire ? L\'hélicoptère ramène le trajet à 10 min.',
      ],
      en: [
        'A8 + lower corniche. 1h off-peak, 1h40 in season.',
        'For a Monaco dinner: depart 2h before the booking.',
        'Time pressure? The helicopter brings it down to 10 min.',
      ],
    },
  },
};

// Stub par defaut pour les routes sans entree riche : prix et duree estimes
// par mode + distance. Permet a la fiche de rendre quand meme.
function stubByMode(mode: 'chauffeur' | 'helicopter', distanceKm: number): TransferDetail {
  return {
    durationChauffeur: mode === 'chauffeur' ? Math.max(20, Math.round(distanceKm * 1.2)) : undefined,
    durationHelicopter: mode === 'helicopter' ? Math.max(7, Math.round(distanceKm * 0.25)) : undefined,
    distanceKm,
    priceFrom: mode === 'helicopter'
      ? Math.max(900, Math.round(distanceKm * 18 / 50) * 50)
      : Math.max(80, Math.round(distanceKm * 4 / 10) * 10),
    vehicleType: mode === 'chauffeur' ? { fr: 'Mercedes V-Class · S-Class', en: 'Mercedes V-Class · S-Class' } : undefined,
    aircraftType: mode === 'helicopter' ? { fr: 'Airbus H125 · H130', en: 'Airbus H125 · H130' } : undefined,
    luggageHint: mode === 'helicopter'
      ? { fr: '2 valises moyennes / pax', en: '2 medium bags / pax' }
      : { fr: 'Jusqu\'à 4 grandes valises', en: 'Up to 4 large bags' },
    paxMin: 1,
    paxMax: mode === 'helicopter' ? 6 : 7,
    whatToExpect: mode === 'helicopter'
      ? {
          fr: [
            'Vol soumis aux conditions météo. Backup chauffeur prévu.',
            'Embarquement quinze minutes avant le décollage.',
            'Mercedes V-Class aux deux extrémités, inclus.',
          ],
          en: [
            'Weather-dependent. Chauffeur backup prepared.',
            'Boarding fifteen minutes before takeoff.',
            'Mercedes V-Class at both ends, included.',
          ],
        }
      : {
          fr: [
            'V-Class par défaut, S-Class ou Range Rover sur demande.',
            'Suivi des vols quand pertinent, attente gratuite jusqu\'à 1h.',
            'Itinéraire ajusté au trafic, chauffeur anglophone.',
          ],
          en: [
            'V-Class default, S-Class or Range Rover on request.',
            'Flight tracking when applicable, 1h free waiting.',
            'Route adjusted to traffic, English-speaking driver.',
          ],
        },
  };
}

// Calcule la distance approximative entre deux villes via leurs coords.
function haversine(a: [number, number], b: [number, number]): number {
  const R = 6371;
  const toRad = (x: number) => (x * Math.PI) / 180;
  const dLat = toRad(b[0] - a[0]);
  const dLng = toRad(b[1] - a[1]);
  const lat1 = toRad(a[0]);
  const lat2 = toRad(b[0]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(h)));
}

export function getTransferDetail(
  mode: 'chauffeur' | 'helicopter',
  slug: TransferSlug | string,
  fromCity: string,
  toCity: string,
): TransferDetail {
  const rich = DETAILS[`${mode}:${slug}`];
  if (rich) return rich;
  const fromCoord = CITY_COORDS[fromCity] ?? CITY_COORDS.nice;
  const toCoord = CITY_COORDS[toCity] ?? CITY_COORDS.nice;
  return stubByMode(mode, haversine(fromCoord, toCoord));
}

export function formatPriceFrom(price: number, locale: 'fr' | 'en'): string {
  const formatter = new Intl.NumberFormat(locale === 'fr' ? 'fr-FR' : 'en-GB', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  });
  return formatter.format(price);
}

// Hero images : visuel inspirationnel pleine largeur. V1 = Unsplash thematique,
// remplace en photoshoot V1.5. Override par route pour les plus strategiques,
// fallback par mode pour les autres.
const MODE_HERO: Record<'helicopter' | 'chauffeur', string> = {
  helicopter: 'https://images.unsplash.com/photo-1521295121783-8a321d551ad2?w=2000&q=85',
  chauffeur: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=2000&q=85',
};

const ROUTE_HERO: Record<string, string> = {
  'helicopter:monaco-saint-tropez': 'https://images.unsplash.com/photo-1583373834259-46cc92173cb7?w=2000&q=85',
  'helicopter:cannes-monaco': 'https://images.unsplash.com/photo-1605641532883-7ec48ed6800c?w=2000&q=85',
  'helicopter:cap-ferrat-saint-tropez': 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?w=2000&q=85',
  'helicopter:nice-monaco': 'https://www.leaderlimousines.com/cdn/shop/files/Helicopter_H125_flying_over_the_sea.jpg?v=1773610994&width=2000',
  'helicopter:nice-cannes': 'https://www.leaderlimousines.com/cdn/shop/files/Helicopter_H125_flying_over_the_sea.jpg?v=1773610994&width=2000',
  'helicopter:nice-saint-tropez': 'https://images.unsplash.com/photo-1583373834259-46cc92173cb7?w=2000&q=85',
  'chauffeur:nice-airport-cannes': 'https://images.unsplash.com/photo-1543874768-2df4cdc1ddc8?w=2000&q=85',
  'chauffeur:nice-airport-monaco': 'https://images.unsplash.com/photo-1605641532883-7ec48ed6800c?w=2000&q=85',
  'chauffeur:nice-airport-saint-tropez': 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=2000&q=85',
  'chauffeur:nice-airport-cap-ferrat': 'https://images.unsplash.com/photo-1551918120-9739cb430c6d?w=2000&q=85',
  'chauffeur:nice-airport-cap-d-antibes': 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=2000&q=85',
  'chauffeur:nice-airport-eze': 'https://images.unsplash.com/photo-1583373834259-46cc92173cb7?w=2000&q=85',
  'chauffeur:nice-airport-menton': 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=2000&q=85',
  'chauffeur:cannes-monaco': 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=2000&q=85',
  'chauffeur:cannes-saint-tropez': 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=2000&q=85',
  'chauffeur:cannes-nice': 'https://images.unsplash.com/photo-1543874768-2df4cdc1ddc8?w=2000&q=85',
  'chauffeur:monaco-cap-ferrat': 'https://images.unsplash.com/photo-1551918120-9739cb430c6d?w=2000&q=85',
  'chauffeur:monaco-menton': 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=2000&q=85',
};

// Galerie 4 photos thematiques par mode pour la section "Le trajet".
const MODE_GALLERY: Record<'helicopter' | 'chauffeur', string[]> = {
  helicopter: [
    'https://images.unsplash.com/photo-1583373834259-46cc92173cb7?w=1200&q=80',
    'https://images.unsplash.com/photo-1521295121783-8a321d551ad2?w=1200&q=80',
    'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?w=1200&q=80',
    'https://images.unsplash.com/photo-1605641532883-7ec48ed6800c?w=1200&q=80',
  ],
  chauffeur: [
    'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&q=80',
    'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=1200&q=80',
    'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=1200&q=80',
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&q=80',
  ],
};

export function getHeroImage(mode: 'chauffeur' | 'helicopter', slug: string): string {
  return ROUTE_HERO[`${mode}:${slug}`] ?? MODE_HERO[mode];
}

export function getModeGallery(mode: 'chauffeur' | 'helicopter'): string[] {
  return MODE_GALLERY[mode];
}

// ============================================================
// LONG CONTENT : corpus SEO ~500 mots par fiche, structure H2/H3
// ============================================================

export type TransferLongContent = {
  about: { fr: string; en: string };
  whyMode: { fr: string[]; en: string[] };
  hubFromTitle?: { fr: string; en: string };
  hubFromDesc?: { fr: string; en: string };
  hubToTitle?: { fr: string; en: string };
  hubToDesc?: { fr: string; en: string };
  faq: { q: { fr: string; en: string }; a: { fr: string; en: string } }[];
};

const LONG_CONTENT: Record<string, TransferLongContent> = {
  'helicopter:monaco-saint-tropez': {
    about: {
      fr: 'Le transfert hélicoptère entre Monaco et Saint-Tropez couvre soixante-cinq kilomètres de côte méditerranéenne en vingt-deux minutes. Décollage de Fontvieille à Monaco, atterrissage à La Mole, dans la plaine de Saint-Tropez. Le vol passe au-dessus de la presqu\'île du Cap-Ferrat, longe Beaulieu et Villefranche, traverse la baie d\'Antibes, puis suit l\'arc de Saint-Raphaël jusqu\'au golfe de Saint-Tropez. Vingt-deux minutes contre une heure quarante par l\'autoroute A8. Quatre à six passagers par vol selon l\'aéronef, deux valises moyennes par personne, transferts Mercedes V-Class inclus aux deux extrémités. Misana coordonne le pilote, l\'heliport, le chauffeur, et prépare un transfert chauffeur de secours en cas de météo défavorable.',
      en: 'The helicopter transfer between Monaco and Saint-Tropez covers sixty-five kilometres of Mediterranean coastline in twenty-two minutes. Takeoff from Fontvieille in Monaco, landing at La Mole in the Saint-Tropez plain. The flight passes above the Cap-Ferrat peninsula, runs along Beaulieu and Villefranche, crosses the Antibes bay, then follows the Saint-Raphaël arc to reach the Saint-Tropez gulf. Twenty-two minutes against one hour forty by the A8 motorway. Four to six passengers per flight depending on aircraft, two medium bags per person, Mercedes V-Class transfers included at both ends. Misana coordinates the pilot, the heliport, the chauffeur, and prepares a chauffeur backup in case of bad weather.',
    },
    whyMode: {
      fr: [
        'Vingt-deux minutes contre une heure quarante : aucun trajet routier ne rivalise sur la longueur de la côte.',
        'L\'A8 sature dès juin entre Cannes et Saint-Tropez. Le vol contourne tous les ralentissements estivaux.',
        'La Mole est à vingt minutes du village de Saint-Tropez en chauffeur. Fontvieille est au cœur de Monaco.',
        'Pour un déjeuner à Club 55 ou un dîner au Cheval Blanc, c\'est la seule option qui permet de partir tard et rentrer à Monaco le soir même.',
      ],
      en: [
        'Twenty-two minutes against one hour forty: no road trip rivals on the length of the coast.',
        'The A8 saturates from June between Cannes and Saint-Tropez. The flight bypasses all summer congestion.',
        'La Mole is twenty minutes from Saint-Tropez village by chauffeur. Fontvieille sits in the heart of Monaco.',
        'For lunch at Club 55 or dinner at Cheval Blanc, this is the only option to leave late and return to Monaco the same evening.',
      ],
    },
    hubFromTitle: { fr: 'Heliport de Monaco · Fontvieille', en: 'Monaco heliport · Fontvieille' },
    hubFromDesc: {
      fr: 'L\'heliport de Monaco est posé sur la digue de Fontvieille, en bordure de mer, à cinq minutes de toute adresse à Monaco par chauffeur. Construit en 1976, il opère sept jours sur sept de huit heures à dix-neuf heures. Capacité quatre aéronefs au sol, terminal couvert, lounge passagers.',
      en: 'Monaco\'s heliport sits on the Fontvieille seawall, by the water, five minutes from any address in Monaco by chauffeur. Built in 1976, it operates seven days a week from 8am to 7pm. Capacity for four aircraft on the ground, covered terminal, passenger lounge.',
    },
    hubToTitle: { fr: 'Heliport de La Mole · Saint-Tropez', en: 'La Mole heliport · Saint-Tropez' },
    hubToDesc: {
      fr: 'L\'heliport de La Mole est situé dans la plaine intérieure, à vingt minutes en chauffeur de Saint-Tropez et de Pampelonne. Terminal de l\'aérodrome de La Mole pour vols privés. Mercedes V-Class attend côté piste pour rejoindre l\'adresse finale. Les bagages sont chargés au sol par notre équipe.',
      en: 'La Mole heliport sits in the inland plain, twenty minutes by chauffeur from Saint-Tropez and Pampelonne. The terminal serves La Mole private aerodrome. Mercedes V-Class await airside to reach the final address. Luggage is handled on the ground by our team.',
    },
    faq: [
      {
        q: { fr: 'Combien coûte un vol Monaco Saint-Tropez en hélicoptère ?', en: 'How much does a Monaco Saint-Tropez helicopter flight cost?' },
        a: {
          fr: 'À partir de €2,200 par vol, jusqu\'à six passagers. Devis final selon date, aéronef et conditions. Mercedes V-Class incluse aux deux extrémités.',
          en: 'From €2,200 per flight, up to six passengers. Final quote depends on date, aircraft and conditions. Mercedes V-Class included at both ends.',
        },
      },
      {
        q: { fr: 'Combien de temps dure le vol ?', en: 'How long is the flight?' },
        a: {
          fr: 'Vingt à vingt-quatre minutes selon le vent et le couloir aérien. Embarquement quinze minutes avant. Total porte-à-porte environ une heure.',
          en: 'Twenty to twenty-four minutes depending on wind and corridor. Boarding fifteen minutes before. Door-to-door approximately one hour.',
        },
      },
      {
        q: { fr: 'Que se passe-t-il en cas de mauvais temps ?', en: 'What if the weather is bad?' },
        a: {
          fr: 'Vol annulé pour des raisons de sécurité (plafond bas, vents forts, brouillard). Bascule automatique sur transfert chauffeur Mercedes V-Class, prévu en backup. Trajet route en environ 1h40.',
          en: 'Flight cancelled for safety reasons (low ceiling, strong winds, fog). Automatic switch to Mercedes V-Class chauffeur transfer, prepared as backup. Road trip in about 1h40.',
        },
      },
      {
        q: { fr: 'Combien de bagages par personne ?', en: 'How much luggage per person?' },
        a: {
          fr: 'Deux valises moyennes (jusqu\'à 23 kg chacune) plus un petit bagage cabine. Bagages encombrants à signaler à la réservation.',
          en: 'Two medium suitcases (up to 23 kg each) plus a small cabin bag. Bulky luggage to be flagged at booking.',
        },
      },
      {
        q: { fr: 'Le chauffeur est-il inclus aux deux extrémités ?', en: 'Is the chauffeur included at both ends?' },
        a: {
          fr: 'Oui. Mercedes V-Class à Monaco pour rejoindre Fontvieille, V-Class à La Mole pour rejoindre votre adresse à Saint-Tropez. Inclus dans le prix.',
          en: 'Yes. Mercedes V-Class in Monaco to reach Fontvieille, V-Class at La Mole to reach your address in Saint-Tropez. Included in the price.',
        },
      },
      {
        q: { fr: 'Peut-on voler en nocturne ?', en: 'Can we fly at night?' },
        a: {
          fr: 'Fontvieille opère jusqu\'à 19h en saison, La Mole jusqu\'à 20h30. Vols nocturnes en VFR uniquement, soumis à autorisation. Plus restrictif l\'hiver.',
          en: 'Fontvieille operates until 7pm in season, La Mole until 8:30pm. Night flights in VFR only, subject to authorisation. More restricted in winter.',
        },
      },
      {
        q: { fr: 'Quel delai pour reserver ?', en: 'How far in advance should I book?' },
        a: {
          fr: '24 a 48h en periode normale. Trois a cinq jours pendant le Grand Prix, le Festival, en juillet-aout. Les heliports saturent sur ces creneaux.',
          en: '24 to 48 hours off-season. Three to five days during the Grand Prix, the Festival, in July-August. Heliports saturate on these slots.',
        },
      },
      {
        q: { fr: 'Quelle est la politique d\'annulation ?', en: 'What is the cancellation policy?' },
        a: {
          fr: 'Annulation gratuite jusqu\'à 24h avant. Entre 24h et 4h avant : 50% retenus. Moins de 4h ou no-show : 100%. Force majeure (météo, fermeture heliport) : remboursement total ou report.',
          en: 'Free cancellation up to 24h before. Between 24h and 4h: 50% retained. Less than 4h or no-show: 100%. Force majeure (weather, heliport closure): full refund or rescheduling.',
        },
      },
    ],
  },

  'helicopter:nice-monaco': {
    about: {
      fr: 'Le vol hélicoptère Nice Monaco prend sept minutes entre l\'heliport de Nice et celui de Fontvieille à Monaco. Par la route, la basse corniche fait une heure hors pointe, plus pendant le Grand Prix ou la haute saison. Le vol passe au-dessus de la rade de Villefranche, du Cap-Ferrat puis arrive directement sur Monaco. Pour le retour Monaco Nice, le service est identique : décollage de Fontvieille, atterrissage à Nice, sept minutes. Mercedes V-Class incluse aux deux extrémités, coordination porte-à-porte par notre équipe.',
      en: 'The Nice Monaco helicopter flight takes seven minutes between Nice heliport and Fontvieille in Monaco. By road, the lower corniche is one hour off-peak, more during the Grand Prix or peak season. The flight passes above the Villefranche bay, Cap-Ferrat, then arrives directly at Monaco. For the Monaco Nice return, the service is identical: takeoff from Fontvieille, landing at Nice, seven minutes. Mercedes V-Class included at both ends, door-to-door coordination by our team.',
    },
    whyMode: {
      fr: [
        'Sept minutes de vol contre une heure de route en moyenne, beaucoup plus pendant le Grand Prix.',
        'L\'heliport de Nice est sur le port, l\'heliport de Fontvieille au cœur de Monaco.',
        'Aller-retour dans la même journée pour un dîner ou un rendez-vous au Casino.',
        'Pendant le Grand Prix, c\'est la seule option fluide : la route est saturée six jours sur sept.',
      ],
      en: [
        'Seven minutes of flight against one hour by road on average, much more during the Grand Prix.',
        'Nice heliport sits on the harbour, Fontvieille heliport at the heart of Monaco.',
        'Same-day round-trip for a dinner or a meeting at the Casino.',
        'During the Grand Prix, this is the only fluid option: the road saturates six days out of seven.',
      ],
    },
    hubFromTitle: { fr: 'Heliport de Nice', en: 'Nice heliport' },
    hubFromDesc: {
      fr: 'L\'heliport de Nice est situé sur le port, à dix minutes en chauffeur de l\'aéroport de Nice Côte d\'Azur et de la Promenade des Anglais. Opère de 8h à 19h en saison, plus tôt et plus tard sur demande pour vols privés.',
      en: 'Nice heliport sits on the harbour, ten minutes by chauffeur from Nice Côte d\'Azur airport and from the Promenade des Anglais. Operates 8am to 7pm in season, earlier and later on request for private flights.',
    },
    hubToTitle: { fr: 'Heliport de Monaco · Fontvieille', en: 'Monaco heliport · Fontvieille' },
    hubToDesc: {
      fr: 'L\'heliport de Monaco est posé sur la digue de Fontvieille, à cinq minutes de toute adresse à Monaco par chauffeur. Pendant le Grand Prix, l\'heliport opère à plein rendement, à anticiper deux à trois jours avant.',
      en: 'Monaco\'s heliport sits on the Fontvieille seawall, five minutes from any address in Monaco by chauffeur. During the Grand Prix, the heliport runs at full capacity, anticipate two to three days ahead.',
    },
    faq: [
      {
        q: { fr: 'Combien coûte un vol Nice Monaco en hélicoptère ?', en: 'How much does a Nice Monaco helicopter flight cost?' },
        a: {
          fr: 'À partir de €700 par vol, jusqu\'à six passagers. Mercedes V-Class incluse aux deux extrémités. Devis final selon date.',
          en: 'From €700 per flight, up to six passengers. Mercedes V-Class included at both ends. Final quote depends on date.',
        },
      },
      {
        q: { fr: 'Et le retour Monaco Nice, combien ça coûte ?', en: 'And the Monaco Nice return, how much?' },
        a: {
          fr: 'Tarif identique. Le service est symétrique : même aéronefs, mêmes heliports, même équipe. Aller-retour combiné possible avec tarif négocié.',
          en: 'Identical price. The service is symmetric: same aircraft, same heliports, same team. Combined round-trip possible with negotiated rate.',
        },
      },
      {
        q: { fr: 'Combien de temps dure le vol ?', en: 'How long is the flight?' },
        a: {
          fr: 'Sept à neuf minutes selon le vent et le couloir aérien. Embarquement quinze minutes avant. Total porte-à-porte environ 35 minutes.',
          en: 'Seven to nine minutes depending on wind and corridor. Boarding fifteen minutes before. Door-to-door approximately 35 minutes.',
        },
      },
      {
        q: { fr: 'Pendant le Grand Prix de Monaco ?', en: 'During the Monaco Grand Prix?' },
        a: {
          fr: 'Heliport de Fontvieille saturé. Réserver deux à trois jours avant minimum. Plages horaires souvent attribuées par paquets pendant les jours d\'événement.',
          en: 'Fontvieille heliport saturated. Book two to three days ahead minimum. Time slots often allocated by packages during event days.',
        },
      },
      {
        q: { fr: 'Que se passe-t-il en cas de mauvais temps ?', en: 'What if the weather is bad?' },
        a: {
          fr: 'Bascule automatique sur transfert chauffeur Mercedes V-Class, prévu en backup. Trajet route de 45 minutes à 1h30 selon trafic.',
          en: 'Automatic switch to Mercedes V-Class chauffeur transfer, prepared as backup. Road trip 45 minutes to 1h30 depending on traffic.',
        },
      },
      {
        q: { fr: 'Le chauffeur est-il inclus aux deux extrémités ?', en: 'Is the chauffeur included at both ends?' },
        a: {
          fr: 'Oui. Mercedes V-Class à Nice (depuis votre hôtel ou l\'aéroport) jusqu\'à l\'heliport, V-Class à Fontvieille jusqu\'à votre adresse à Monaco. Inclus.',
          en: 'Yes. Mercedes V-Class at Nice (from your hotel or airport) to the heliport, V-Class at Fontvieille to your address in Monaco. Included.',
        },
      },
      {
        q: { fr: 'Quel delai pour reserver ?', en: 'How far in advance should I book?' },
        a: {
          fr: '24 a 48h en periode normale. Trois a cinq jours pendant le Grand Prix, le Festival, en juillet-aout. Les heliports saturent sur ces creneaux.',
          en: '24 to 48 hours off-season. Three to five days during the Grand Prix, the Festival, in July-August. Heliports saturate on these slots.',
        },
      },
      {
        q: { fr: 'Quelle est la politique d\'annulation ?', en: 'What is the cancellation policy?' },
        a: {
          fr: 'Annulation gratuite jusqu\'à 24h avant. Météo défavorable : remboursement total ou bascule chauffeur sans surcoût.',
          en: 'Free cancellation up to 24h before. Bad weather: full refund or chauffeur switch with no extra cost.',
        },
      },
    ],
  },

  'helicopter:nice-cannes': {
    about: {
      fr: 'Le vol hélicoptère Nice Cannes prend dix minutes entre l\'heliport de Nice, posé sur le port, et l\'un des deux heliports de Cannes : Mandelieu pour l\'arrière-pays, Quai du Large pour la Croisette. Par la route, l\'A8 fait trente minutes hors saison, beaucoup plus pendant le Festival ou un samedi d\'été. Le vol survole le Cap d\'Antibes, contourne les îles de Lérins, puis atterrit. Trente-deux kilomètres parcourus à plat, sans trafic, sans tunnel. Mercedes V-Class à l\'heliport de Nice depuis votre hôtel ou l\'aéroport, V-Class à Cannes pour rejoindre votre adresse. Misana coordonne l\'ensemble du trajet porte-à-porte.',
      en: 'The Nice Cannes helicopter flight takes ten minutes between Nice heliport, sitting on the harbour, and one of the two Cannes heliports: Mandelieu for inland, Quai du Large for the Croisette. By road, the A8 takes thirty minutes off-peak, much more during the Festival or a summer Saturday. The flight passes above Cap d\'Antibes, skirts the Lérins islands, then lands. Thirty-two kilometres covered straight, no traffic, no tunnels. Mercedes V-Class at Nice heliport from your hotel or the airport, V-Class at Cannes to reach your address. Misana coordinates the full door-to-door route.',
    },
    whyMode: {
      fr: [
        'Dix minutes de vol contre trente minutes à plus d\'une heure par la route, selon le trafic A8.',
        'Pendant le Festival de Cannes, l\'A8 est saturée toute la journée. Le vol contourne tous les ralentissements.',
        'Quai du Large dépose à cinq minutes de la Croisette, Mandelieu dessert l\'arrière-pays.',
        'Compatible avec un aller-retour le même jour pour une projection ou une réunion.',
      ],
      en: [
        'Ten minutes of flight against thirty minutes to over an hour by road, depending on A8 traffic.',
        'During the Cannes Festival, the A8 is saturated all day. The flight bypasses every slowdown.',
        'Quai du Large drops five minutes from the Croisette, Mandelieu serves inland.',
        'Compatible with a same-day round-trip for a screening or a meeting.',
      ],
    },
    hubFromTitle: { fr: 'Heliport de Nice', en: 'Nice heliport' },
    hubFromDesc: {
      fr: 'L\'heliport de Nice est sur le port, à dix minutes en chauffeur de l\'aéroport Nice Côte d\'Azur et de la Promenade des Anglais. Opère de 8h à 19h en saison, avec créneaux étendus sur demande pour vols privés.',
      en: 'Nice heliport sits on the harbour, ten minutes by chauffeur from Nice Côte d\'Azur airport and the Promenade des Anglais. Operates from 8am to 7pm in season, extended slots on request for private flights.',
    },
    hubToTitle: { fr: 'Heliports de Cannes · Mandelieu et Quai du Large', en: 'Cannes heliports · Mandelieu and Quai du Large' },
    hubToDesc: {
      fr: 'Cannes a deux heliports. Quai du Large, au cœur du port, à cinq minutes de la Croisette. Mandelieu, dix minutes du Cannet et des collines, plus adapté pour les départs depuis l\'arrière-pays. Notre équipe choisit l\'heliport en fonction de votre point de départ ou d\'arrivée.',
      en: 'Cannes has two heliports. Quai du Large, at the heart of the port, five minutes from the Croisette. Mandelieu, ten minutes from Le Cannet and the hills, better suited for departures from inland. Our team picks the heliport based on your starting or arrival point.',
    },
    faq: [
      {
        q: { fr: 'Combien coûte un vol Nice Cannes en hélicoptère ?', en: 'How much does a Nice Cannes helicopter flight cost?' },
        a: {
          fr: 'À partir de €1,000 par vol, jusqu\'à six passagers. Mercedes V-Class incluse aux deux extrémités. Devis final selon date et aéronef.',
          en: 'From €1,000 per flight, up to six passengers. Mercedes V-Class included at both ends. Final quote depends on date and aircraft.',
        },
      },
      {
        q: { fr: 'Mandelieu ou Quai du Large : lequel choisir ?', en: 'Mandelieu or Quai du Large: which to choose?' },
        a: {
          fr: 'Quai du Large est plus rapide depuis la Croisette (5 minutes en chauffeur). Mandelieu est mieux pour l\'arrière-pays ou Le Cannet. Notre équipe choisit selon votre adresse exacte.',
          en: 'Quai du Large is faster from the Croisette (5 minutes by chauffeur). Mandelieu is better for inland or Le Cannet. Our team picks based on your exact address.',
        },
      },
      {
        q: { fr: 'Combien de temps dure le vol ?', en: 'How long is the flight?' },
        a: {
          fr: 'Dix à douze minutes selon le vent et le couloir aérien. Embarquement quinze minutes avant. Total porte-à-porte environ quarante minutes.',
          en: 'Ten to twelve minutes depending on wind and corridor. Boarding fifteen minutes before. Door-to-door approximately forty minutes.',
        },
      },
      {
        q: { fr: 'Pendant le Festival de Cannes ?', en: 'During the Cannes Festival?' },
        a: {
          fr: 'L\'A8 est saturée du matin au soir. L\'heliport de Quai du Large fonctionne à plein rendement, à réserver trois à cinq jours avant.',
          en: 'The A8 is saturated from morning to evening. Quai du Large heliport runs at full capacity, book three to five days ahead.',
        },
      },
      {
        q: { fr: 'Que se passe-t-il en cas de mauvais temps ?', en: 'What if the weather is bad?' },
        a: {
          fr: 'Bascule automatique sur transfert chauffeur Mercedes V-Class, prévu en backup. Trajet Nice Cannes par la route en 30 à 60 minutes selon trafic.',
          en: 'Automatic switch to Mercedes V-Class chauffeur transfer, prepared as backup. Nice Cannes by road in 30 to 60 minutes depending on traffic.',
        },
      },
      {
        q: { fr: 'Quel delai pour reserver ?', en: 'How far in advance should I book?' },
        a: {
          fr: '24 a 48h en periode normale. Trois a cinq jours pendant le Grand Prix, le Festival, en juillet-aout. Les heliports saturent sur ces creneaux.',
          en: '24 to 48 hours off-season. Three to five days during the Grand Prix, the Festival, in July-August. Heliports saturate on these slots.',
        },
      },
      {
        q: { fr: 'Quelle est la politique d\'annulation ?', en: 'What is the cancellation policy?' },
        a: {
          fr: 'Annulation gratuite jusqu\'à 24h avant. Météo défavorable : remboursement total ou bascule chauffeur sans surcoût.',
          en: 'Free cancellation up to 24h before. Bad weather: full refund or chauffeur switch with no extra cost.',
        },
      },
    ],
  },

  'helicopter:nice-saint-tropez': {
    about: {
      fr: 'Le vol hélicoptère Nice Saint-Tropez prend vingt minutes entre l\'heliport de Nice et celui de La Mole, situé dans la plaine intérieure de Saint-Tropez. Par la route, l\'A8 fait deux heures hors saison, jusqu\'à trois en juillet ou août sur l\'A57. Le vol longe la côte au-dessus du Cap d\'Antibes, de Cannes, traverse l\'arc de Saint-Raphaël puis arrive sur le golfe. Soixante-quinze kilomètres parcourus à plat, sans embouteillage estival. Mercedes V-Class à l\'heliport de Nice depuis l\'aéroport ou votre hôtel, V-Class à La Mole pour rejoindre votre adresse à Saint-Tropez, Ramatuelle ou Pampelonne. Misana coordonne pilote, heliport, chauffeur, et prévoit un transfert chauffeur de secours si la météo l\'impose.',
      en: 'The Nice Saint-Tropez helicopter flight takes twenty minutes between Nice heliport and La Mole, sitting in the inland plain of Saint-Tropez. By road, the A8 takes two hours off-season, up to three in July or August on the A57. The flight runs along the coast above Cap d\'Antibes, Cannes, crosses the Saint-Raphaël arc then reaches the gulf. Seventy-five kilometres covered straight, with no summer congestion. Mercedes V-Class at Nice heliport from the airport or your hotel, V-Class at La Mole to reach your address in Saint-Tropez, Ramatuelle or Pampelonne. Misana coordinates pilot, heliport, chauffeur, and prepares a chauffeur backup if weather demands.',
    },
    whyMode: {
      fr: [
        'Vingt minutes de vol contre deux à trois heures par la route en saison.',
        'L\'A8 et l\'A57 saturent dès juin entre Cannes et Saint-Tropez. Aucun trajet routier ne contourne ce goulot.',
        'Compatible avec un déjeuner à Club 55 ou un dîner au Cheval Blanc puis retour à Nice le soir même.',
        'La Mole est à vingt minutes de chauffeur de Saint-Tropez village, Ramatuelle ou Pampelonne.',
      ],
      en: [
        'Twenty minutes of flight against two to three hours by road in season.',
        'The A8 and A57 saturate from June between Cannes and Saint-Tropez. No road route bypasses this bottleneck.',
        'Compatible with lunch at Club 55 or dinner at Cheval Blanc then return to Nice the same evening.',
        'La Mole is twenty minutes by chauffeur from Saint-Tropez village, Ramatuelle or Pampelonne.',
      ],
    },
    hubFromTitle: { fr: 'Heliport de Nice', en: 'Nice heliport' },
    hubFromDesc: {
      fr: 'L\'heliport de Nice est sur le port, à dix minutes en chauffeur de l\'aéroport Nice Côte d\'Azur et de la Promenade des Anglais. Opère de 8h à 19h en saison, avec créneaux étendus sur demande pour vols privés.',
      en: 'Nice heliport sits on the harbour, ten minutes by chauffeur from Nice Côte d\'Azur airport and the Promenade des Anglais. Operates from 8am to 7pm in season, extended slots on request for private flights.',
    },
    hubToTitle: { fr: 'Heliport de La Mole · Saint-Tropez', en: 'La Mole heliport · Saint-Tropez' },
    hubToDesc: {
      fr: 'L\'heliport de La Mole est situé dans la plaine intérieure, à vingt minutes en chauffeur de Saint-Tropez et de Pampelonne. Terminal de l\'aérodrome de La Mole pour vols privés. Mercedes V-Class attend côté piste pour rejoindre l\'adresse finale. Les bagages sont chargés au sol par notre équipe.',
      en: 'La Mole heliport sits in the inland plain, twenty minutes by chauffeur from Saint-Tropez and Pampelonne. The terminal serves La Mole private aerodrome. Mercedes V-Class wait airside to reach the final address. Luggage is handled on the ground by our team.',
    },
    faq: [
      {
        q: { fr: 'Combien coûte un vol Nice Saint-Tropez en hélicoptère ?', en: 'How much does a Nice Saint-Tropez helicopter flight cost?' },
        a: {
          fr: 'À partir de €2,100 par vol, jusqu\'à six passagers. Mercedes V-Class incluse aux deux extrémités. Devis final selon date et aéronef.',
          en: 'From €2,100 per flight, up to six passengers. Mercedes V-Class included at both ends. Final quote depends on date and aircraft.',
        },
      },
      {
        q: { fr: 'Combien de temps dure le vol ?', en: 'How long is the flight?' },
        a: {
          fr: 'Vingt à vingt-cinq minutes selon le vent et le couloir aérien. Embarquement quinze minutes avant. Total porte-à-porte environ une heure.',
          en: 'Twenty to twenty-five minutes depending on wind and corridor. Boarding fifteen minutes before. Door-to-door approximately one hour.',
        },
      },
      {
        q: { fr: 'Pendant le mois d\'août, est-ce que c\'est saturé ?', en: 'Is it saturated in August?' },
        a: {
          fr: 'L\'heliport de La Mole fonctionne à plein rendement. Réserver cinq à sept jours avant. L\'aller-retour avec deux pilotes est privilégié pour optimiser les créneaux.',
          en: 'La Mole heliport runs at full capacity. Book five to seven days ahead. Round-trip with two pilots is preferred to optimise slots.',
        },
      },
      {
        q: { fr: 'Que se passe-t-il en cas de mauvais temps ?', en: 'What if the weather is bad?' },
        a: {
          fr: 'Bascule automatique sur transfert chauffeur Mercedes V-Class, prévu en backup. Trajet Nice Saint-Tropez par la route en deux à trois heures selon saison.',
          en: 'Automatic switch to Mercedes V-Class chauffeur transfer, prepared as backup. Nice Saint-Tropez by road in two to three hours depending on season.',
        },
      },
      {
        q: { fr: 'Le chauffeur est-il inclus aux deux extrémités ?', en: 'Is the chauffeur included at both ends?' },
        a: {
          fr: 'Oui. Mercedes V-Class à Nice (depuis votre hôtel ou l\'aéroport) jusqu\'à l\'heliport, V-Class à La Mole jusqu\'à votre adresse à Saint-Tropez, Ramatuelle ou Pampelonne. Inclus dans le prix.',
          en: 'Yes. Mercedes V-Class at Nice (from your hotel or airport) to the heliport, V-Class at La Mole to your address in Saint-Tropez, Ramatuelle or Pampelonne. Included in the price.',
        },
      },
      {
        q: { fr: 'Quel delai pour reserver ?', en: 'How far in advance should I book?' },
        a: {
          fr: '24 a 48h en periode normale. Trois a cinq jours pendant le Grand Prix, le Festival, en juillet-aout. Les heliports saturent sur ces creneaux.',
          en: '24 to 48 hours off-season. Three to five days during the Grand Prix, the Festival, in July-August. Heliports saturate on these slots.',
        },
      },
      {
        q: { fr: 'Quelle est la politique d\'annulation ?', en: 'What is the cancellation policy?' },
        a: {
          fr: 'Annulation gratuite jusqu\'à 24h avant. Météo défavorable : remboursement total ou bascule chauffeur sans surcoût.',
          en: 'Free cancellation up to 24h before. Bad weather: full refund or chauffeur switch with no extra cost.',
        },
      },
    ],
  },

  'helicopter:cannes-monaco': {
    about: {
      fr: 'Le vol Cannes-Monaco couvre cinquante-six kilomètres de côte en dix minutes seulement. Décollage de Cannes Mandelieu ou de Quai du Large, atterrissage à Fontvieille. Le trajet survole les îles de Lérins, longe le Cap d\'Antibes, traverse la baie de Villefranche, puis arrive directement sur Monaco. Une heure par la route en passant par l\'A8 ou la basse corniche, dix minutes par les airs. Mercedes V-Class aux deux extrémités, transferts inclus jusqu\'à votre adresse.',
      en: 'The Cannes-Monaco flight covers fifty-six kilometres of coast in just ten minutes. Takeoff from Cannes Mandelieu or Quai du Large, landing at Fontvieille. The route flies over the Lérins islands, runs along Cap d\'Antibes, crosses Villefranche bay, then arrives directly at Monaco. One hour by road via the A8 or the lower corniche, ten minutes by air. Mercedes V-Class at both ends, transfers included to your address.',
    },
    whyMode: {
      fr: [
        'Dix minutes de vol contre une heure de route. Idéal pour un dîner à Monaco au départ de Cannes.',
        'Pendant le Festival de Cannes, l\'A8 est saturée toute la journée. Le vol est la seule option fluide.',
        'Quai du Large est à cinq minutes de la Croisette, Mandelieu à dix minutes de l\'arrière-pays.',
        'Compatible avec un retour le même soir, sans pression horaire.',
        'Pendant le Grand Prix, l\'heliport de Fontvieille fonctionne à plein rendement.',
      ],
      en: [
        'Ten minutes of flight against one hour by road. Ideal for a Monaco dinner from Cannes.',
        'During the Cannes Festival, the A8 saturates all day. The flight is the only fluid option.',
        'Quai du Large is five minutes from the Croisette, Mandelieu ten minutes from inland.',
        'Compatible with a same-evening return, without time pressure.',
        'During the Grand Prix, Fontvieille heliport runs at full capacity.',
      ],
    },
    hubFromTitle: { fr: 'Heliports de Cannes · Mandelieu et Quai du Large', en: 'Cannes heliports · Mandelieu and Quai du Large' },
    hubFromDesc: {
      fr: 'Cannes a deux heliports. Quai du Large, en plein centre, à cinq minutes de la Croisette. Mandelieu, à dix minutes du Cannet et des collines, plus pratique pour les départs depuis l\'arrière-pays. Notre équipe choisit selon votre point de départ.',
      en: 'Cannes has two heliports. Quai du Large, in the city centre, five minutes from the Croisette. Mandelieu, ten minutes from Le Cannet and the hills, more convenient for departures from inland. Our team picks based on your starting point.',
    },
    hubToTitle: { fr: 'Heliport de Fontvieille · Monaco', en: 'Fontvieille heliport · Monaco' },
    hubToDesc: {
      fr: 'Posé sur la digue de Fontvieille, à cinq minutes de la Place du Casino par chauffeur. Saturé pendant le Grand Prix : anticiper deux à trois jours avant. Hors Grand Prix, disponibilité dans la journée souvent possible.',
      en: 'Sitting on the Fontvieille seawall, five minutes from the Casino Square by chauffeur. Saturated during the Grand Prix: anticipate two to three days ahead. Outside the Grand Prix, same-day availability often possible.',
    },
    faq: [
      {
        q: { fr: 'Mandelieu ou Quai du Large : lequel choisir ?', en: 'Mandelieu or Quai du Large: which to choose?' },
        a: {
          fr: 'Quai du Large est plus rapide depuis la Croisette (5 min en chauffeur). Mandelieu mieux pour l\'arrière-pays. Notre équipe choisit selon votre adresse exacte.',
          en: 'Quai du Large is faster from the Croisette (5 min by chauffeur). Mandelieu better for inland. Our team picks based on your exact address.',
        },
      },
      {
        q: { fr: 'Combien coûte un vol Cannes Monaco ?', en: 'How much does a Cannes Monaco flight cost?' },
        a: {
          fr: 'À partir de €1,200 par vol, jusqu\'à six passagers. Mercedes V-Class incluse aux deux extrémités. Devis final selon date.',
          en: 'From €1,200 per flight, up to six passengers. Mercedes V-Class included at both ends. Final quote depends on date.',
        },
      },
      {
        q: { fr: 'Pendant le Grand Prix de Monaco ?', en: 'During the Monaco Grand Prix?' },
        a: {
          fr: 'Heliport saturé. Réserver deux à trois jours avant. Plages horaires souvent attribuées par paquets pendant les jours d\'événement.',
          en: 'Heliport saturated. Book two to three days ahead. Time slots often allocated by packages during event days.',
        },
      },
      {
        q: { fr: 'Météo défavorable ?', en: 'Bad weather?' },
        a: {
          fr: 'Bascule automatique sur transfert chauffeur en V-Class. Trajet Cannes-Monaco par la route en environ une heure.',
          en: 'Automatic switch to V-Class chauffeur transfer. Cannes-Monaco by road in about one hour.',
        },
      },
      {
        q: { fr: 'Bagages ?', en: 'Luggage?' },
        a: {
          fr: 'Deux valises moyennes par passager, jusqu\'à 23 kg chacune. Encombrants à signaler à la réservation.',
          en: 'Two medium bags per passenger, up to 23 kg each. Bulky items to be flagged at booking.',
        },
      },
      {
        q: { fr: 'Annulation ?', en: 'Cancellation?' },
        a: {
          fr: 'Gratuite jusqu\'à 24h avant. 50% retenus entre 24h et 4h. 100% moins de 4h. Météo : remboursement total.',
          en: 'Free up to 24h before. 50% retained between 24h and 4h. 100% less than 4h. Weather: full refund.',
        },
      },
    ],
  },

  'chauffeur:nice-airport-cannes': {
    about: {
      fr: 'L\'aéroport de Nice Côte d\'Azur se rejoint à Cannes en trente minutes par l\'A8, hors heures de pointe. En heure de pointe ou en saison, comptez quarante-cinq à cinquante minutes. La route fait trente-deux kilomètres : sortie aéroport, A8 ouest jusqu\'à Antibes, sortie 41 ou 42, puis La Croisette ou les collines de Cannes selon l\'adresse finale. Mercedes V-Class par défaut, S-Class à la demande. Accueil au panneau de bagage avec votre nom, suivi des vols en temps réel, attente gratuite jusqu\'à une heure.',
      en: 'Nice Côte d\'Azur airport reaches Cannes in thirty minutes via the A8, outside peak hours. In peak hours or in season, allow forty-five to fifty minutes. The route is thirty-two kilometres: airport exit, A8 west to Antibes, exit 41 or 42, then La Croisette or the Cannes hills depending on the final address. Mercedes V-Class by default, S-Class on request. Welcome at the baggage hall with your name, real-time flight tracking, free waiting up to one hour.',
    },
    whyMode: {
      fr: [
        'Accueil au panneau de bagage avec votre nom, sortie discrète, transition fluide vers la voiture.',
        'Suivi temps réel du vol : le chauffeur ajuste l\'heure d\'arrivée à l\'aéroport selon votre vol.',
        'Une heure d\'attente gratuite à compter de l\'heure d\'arrivée prévue. Au-delà, tarification transparente.',
        'Mercedes V-Class accueille jusqu\'à 7 passagers et 4 grandes valises. S-Class disponible à la demande.',
        'Pendant le Festival de Cannes, départ trente minutes plus tôt et bascule basse corniche selon trafic.',
      ],
      en: [
        'Welcome at the baggage hall with your name, discreet exit, smooth transition to the car.',
        'Real-time flight tracking: the chauffeur adjusts arrival time according to your flight.',
        'One hour of free waiting from scheduled arrival. Beyond that, transparent pricing.',
        'Mercedes V-Class hosts up to 7 passengers and 4 large suitcases. S-Class available on request.',
        'During the Cannes Festival, departure thirty minutes earlier and lower corniche switch based on traffic.',
      ],
    },
    hubFromTitle: { fr: 'Aéroport de Nice Côte d\'Azur', en: 'Nice Côte d\'Azur Airport' },
    hubFromDesc: {
      fr: 'Aéroport international de la Côte d\'Azur, deuxième de France. Deux terminaux (T1 vols low-cost et internationaux, T2 Air France et long-courriers). Notre équipe attend à la sortie des bagages avec un panneau au nom du voyageur. Stationnement courte durée pour Mercedes V-Class.',
      en: 'International airport of the French Riviera, second-busiest in France. Two terminals (T1 for low-cost and international flights, T2 for Air France and long-haul). Our team waits at the baggage hall exit with a sign in the traveller\'s name. Short-term parking for Mercedes V-Class.',
    },
    hubToTitle: { fr: 'Cannes', en: 'Cannes' },
    hubToDesc: {
      fr: 'Cannes la Croisette, le Suquet, La Bocca ou les collines du Cannet : nous déposons à l\'adresse exacte. Pour les villas dans les hauteurs (Super Cannes, Le Cannet), prévoir cinq à dix minutes supplémentaires. Hôtels Carlton, Martinez, Majestic, Grand Hyatt accessibles directement.',
      en: 'Cannes Croisette, Le Suquet, La Bocca or the Cannet hills: we drop at the exact address. For villas in the heights (Super Cannes, Le Cannet), allow five to ten extra minutes. Carlton, Martinez, Majestic, Grand Hyatt hotels accessible directly.',
    },
    faq: [
      {
        q: { fr: 'Combien coûte un transfert Nice aéroport Cannes ?', en: 'How much does a Nice airport Cannes transfer cost?' },
        a: {
          fr: 'À partir de €120 en Mercedes V-Class, prix forfaitaire. S-Class à €180. Prix transparent, pas de supplément bagages.',
          en: 'From €120 in Mercedes V-Class, flat rate. S-Class at €180. Transparent pricing, no luggage surcharge.',
        },
      },
      {
        q: { fr: 'Le chauffeur attend-il en cas de retard ?', en: 'Does the chauffeur wait for a delayed flight?' },
        a: {
          fr: 'Oui, suivi temps réel. Une heure d\'attente gratuite à partir de l\'heure d\'arrivée prévue, puis €15 par tranche de 15 minutes.',
          en: 'Yes, real-time tracking. One hour free waiting from scheduled arrival, then €15 per 15-min increment.',
        },
      },
      {
        q: { fr: 'Combien de temps dure le trajet ?', en: 'How long does the trip take?' },
        a: {
          fr: 'Trente minutes hors heures de pointe, quarante-cinq à cinquante en saison ou pendant le Festival. Notre chauffeur prévoit selon le trafic du jour.',
          en: 'Thirty minutes off-peak, forty-five to fifty in season or during the Festival. Our driver plans based on day-of traffic.',
        },
      },
      {
        q: { fr: 'Combien de passagers et de bagages ?', en: 'How many passengers and bags?' },
        a: {
          fr: 'Mercedes V-Class : jusqu\'à 7 passagers et 4 grandes valises. S-Class : 3 passagers, 2 valises. À préciser à la réservation.',
          en: 'Mercedes V-Class: up to 7 passengers and 4 large suitcases. S-Class: 3 passengers, 2 bags. To be specified at booking.',
        },
      },
      {
        q: { fr: 'Pendant le Festival de Cannes ?', en: 'During the Cannes Festival?' },
        a: {
          fr: 'A8 saturée. Départ avancé de 30 min, basse corniche en backup. Réserver trois à cinq jours avant.',
          en: 'A8 saturated. Departure 30 min earlier, lower corniche as backup. Book three to five days ahead.',
        },
      },
      {
        q: { fr: 'Y a-t-il un panneau au nom du voyageur ?', en: 'Is there a name sign?' },
        a: {
          fr: 'Oui, panneau professionnel à la sortie des bagages, terminal 1 ou 2 selon votre vol. Coordination en amont par notre équipe.',
          en: 'Yes, professional sign at the baggage hall exit, terminal 1 or 2 depending on your flight. Coordinated in advance by our team.',
        },
      },
      {
        q: { fr: 'Annulation ?', en: 'Cancellation?' },
        a: {
          fr: 'Gratuite jusqu\'à 24h avant. 50% retenus entre 24h et 4h. 100% moins de 4h ou no-show.',
          en: 'Free up to 24h before. 50% retained between 24h and 4h. 100% less than 4h or no-show.',
        },
      },
    ],
  },

  'chauffeur:nice-airport-monaco': {
    about: {
      fr: 'Le transfert chauffeur entre l\'aéroport de Nice Côte d\'Azur et Monaco prend trente minutes hors heures de pointe par l\'A8 et la basse corniche, jusqu\'à une heure en pleine saison ou pendant le Grand Prix. La route fait vingt-deux kilomètres : sortie aéroport, A8 est, sortie 50 ou 56 selon votre adresse, puis Place du Casino, Larvotto, Fontvieille ou La Condamine. Mercedes V-Class par défaut, S-Class à la demande pour les rendez-vous d\'affaires. Accueil au panneau de bagage avec votre nom.',
      en: 'The chauffeur transfer between Nice Côte d\'Azur airport and Monaco takes thirty minutes off-peak via the A8 and lower corniche, up to one hour in peak season or during the Grand Prix. The route is twenty-two kilometres: airport exit, A8 east, exit 50 or 56 depending on your address, then Casino Square, Larvotto, Fontvieille or La Condamine. Mercedes V-Class by default, S-Class on request for business meetings. Welcome at the baggage hall with your name.',
    },
    whyMode: {
      fr: [
        'Accueil au panneau de bagage à votre nom, sortie discrète sans attente.',
        'Suivi temps réel du vol : le chauffeur ajuste l\'arrivée à votre vol.',
        'Une heure d\'attente gratuite à compter de l\'arrivée prévue.',
        'Mercedes V-Class jusqu\'à 7 passagers et 4 grandes valises.',
        'Pendant le Grand Prix, départ avancé et basse corniche en backup.',
      ],
      en: [
        'Welcome at the baggage hall with your name, discreet exit, no waiting.',
        'Real-time flight tracking: chauffeur adjusts arrival to your flight.',
        'One hour of free waiting from scheduled arrival.',
        'Mercedes V-Class up to 7 passengers and 4 large suitcases.',
        'During the Grand Prix, earlier departure and lower corniche as backup.',
      ],
    },
    hubFromTitle: { fr: 'Aéroport de Nice Côte d\'Azur', en: 'Nice Côte d\'Azur Airport' },
    hubFromDesc: {
      fr: 'Aéroport international, deuxième de France. Deux terminaux (T1 vols low-cost et internationaux, T2 Air France et long-courriers). Notre équipe attend à la sortie des bagages avec un panneau au nom du voyageur.',
      en: 'International airport, second-busiest in France. Two terminals (T1 low-cost and international, T2 Air France and long-haul). Our team waits at the baggage hall exit with a name sign.',
    },
    hubToTitle: { fr: 'Monaco', en: 'Monaco' },
    hubToDesc: {
      fr: 'Dépose à votre adresse exacte à Monaco : Place du Casino, Larvotto, Fontvieille, La Condamine. Hôtels de Paris, Métropole, Hermitage. Pendant le Grand Prix, accès restreint en centre-ville à anticiper.',
      en: 'Drop-off at your exact address in Monaco: Casino Square, Larvotto, Fontvieille, La Condamine. Hôtel de Paris, Métropole, Hermitage. During the Grand Prix, restricted downtown access to anticipate.',
    },
    faq: [
      {
        q: { fr: 'Combien coûte un transfert Nice aéroport Monaco ?', en: 'How much does a Nice airport Monaco transfer cost?' },
        a: {
          fr: 'À partir de €130 en Mercedes V-Class, prix forfaitaire. €190 en S-Class. Pas de supplément bagages.',
          en: 'From €130 in Mercedes V-Class, flat rate. €190 in S-Class. No luggage surcharge.',
        },
      },
      {
        q: { fr: 'Combien de temps dure le trajet ?', en: 'How long does the trip take?' },
        a: {
          fr: 'Trente minutes hors pointe, 45 à 60 minutes en saison. Pendant le Grand Prix, prévoir 1h30.',
          en: 'Thirty minutes off-peak, 45 to 60 minutes in season. During the Grand Prix, plan 1h30.',
        },
      },
      {
        q: { fr: 'Le chauffeur attend-il en cas de retard de vol ?', en: 'Does the chauffeur wait if my flight is delayed?' },
        a: {
          fr: 'Oui, suivi temps réel. Une heure d\'attente gratuite à partir de l\'heure d\'arrivée prévue.',
          en: 'Yes, real-time flight tracking. One hour of free waiting from scheduled arrival.',
        },
      },
      {
        q: { fr: 'Pendant le Grand Prix de Monaco ?', en: 'During the Monaco Grand Prix?' },
        a: {
          fr: 'Routes saturées. Réserver trois à cinq jours avant. Hélicoptère sept minutes en alternative.',
          en: 'Saturated roads. Book three to five days ahead. Helicopter seven minutes as alternative.',
        },
      },
      {
        q: { fr: 'Y a-t-il un panneau au nom du voyageur ?', en: 'Is there a name sign on arrival?' },
        a: {
          fr: 'Oui, panneau professionnel à la sortie des bagages, terminal 1 ou 2 selon le vol.',
          en: 'Yes, professional sign at the baggage hall exit, terminal 1 or 2 depending on the flight.',
        },
      },
      {
        q: { fr: 'Annulation ?', en: 'Cancellation?' },
        a: {
          fr: 'Gratuite jusqu\'à 24h avant. 50% retenus entre 24h et 4h. 100% moins de 4h.',
          en: 'Free up to 24h before. 50% retained between 24h and 4h. 100% less than 4h.',
        },
      },
    ],
  },

  'chauffeur:nice-airport-saint-tropez': {
    about: {
      fr: 'Le transfert chauffeur entre l\'aéroport de Nice et Saint-Tropez prend une heure trente hors saison, jusqu\'à deux heures trente en juillet et août sur l\'A8 saturée. La route fait cent kilomètres : A8 ouest jusqu\'à Le Muy, puis A57 et D25 jusqu\'à la presqu\'île de Saint-Tropez. Mercedes V-Class par défaut, S-Class à la demande. Accueil à la sortie des bagages, attente gratuite, vol suivi en temps réel.',
      en: 'The chauffeur transfer between Nice airport and Saint-Tropez takes one hour thirty off-season, up to two hours thirty in July and August on the saturated A8. The route is one hundred kilometres: A8 west to Le Muy, then A57 and D25 to the Saint-Tropez peninsula. Mercedes V-Class by default, S-Class on request. Welcome at baggage hall, free waiting, real-time flight tracking.',
    },
    whyMode: {
      fr: [
        'Porte-à-porte direct : votre vol, votre adresse à Saint-Tropez ou Pampelonne.',
        'Mercedes V-Class jusqu\'à 7 passagers, 4 grandes valises.',
        'En saison haute, départ avancé pour anticiper la saturation A8.',
        'Hélicoptère 18 minutes en alternative si la pression horaire l\'exige.',
        'Suivi des vols, attente prolongée gratuite jusqu\'à 1h30 pour vols de nuit.',
      ],
      en: [
        'Door-to-door direct: your flight, your address in Saint-Tropez or Pampelonne.',
        'Mercedes V-Class up to 7 passengers, 4 large suitcases.',
        'In peak season, earlier departure to anticipate A8 saturation.',
        'Helicopter 18 minutes as alternative if time pressure demands.',
        'Flight tracking, extended free waiting up to 1h30 for night arrivals.',
      ],
    },
    hubFromTitle: { fr: 'Aéroport de Nice Côte d\'Azur', en: 'Nice Côte d\'Azur Airport' },
    hubFromDesc: {
      fr: 'Aéroport international, deuxième de France. Notre équipe attend à la sortie des bagages avec un panneau au nom du voyageur.',
      en: 'International airport, second-busiest in France. Our team waits at the baggage hall exit with a name sign.',
    },
    hubToTitle: { fr: 'Saint-Tropez', en: 'Saint-Tropez' },
    hubToDesc: {
      fr: 'Dépose à votre adresse exacte : village, port, route des Plages, Pampelonne. Pour les paillotes (Club 55, Bagatelle), accès direct côté plage selon saison.',
      en: 'Drop-off at your exact address: village, port, route des Plages, Pampelonne. For beach clubs (Club 55, Bagatelle), direct beach-side access depending on season.',
    },
    faq: [
      {
        q: { fr: 'Combien coûte un transfert Nice aéroport Saint-Tropez ?', en: 'How much does a Nice airport Saint-Tropez transfer cost?' },
        a: {
          fr: 'À partir de €280 en Mercedes V-Class, prix forfaitaire. €380 en S-Class. Pas de supplément bagages.',
          en: 'From €280 in Mercedes V-Class, flat rate. €380 in S-Class. No luggage surcharge.',
        },
      },
      {
        q: { fr: 'Combien de temps dure le trajet ?', en: 'How long does the trip take?' },
        a: {
          fr: '1h30 hors saison, 2h à 2h30 en juillet et août. Pour un dîner, partir trois heures avant.',
          en: '1h30 off-season, 2h to 2h30 in July and August. For a dinner, leave three hours ahead.',
        },
      },
      {
        q: { fr: 'L\'hélicoptère est-il plus rapide ?', en: 'Is the helicopter faster?' },
        a: {
          fr: 'Largement. Dix-huit minutes de vol entre Nice et La Mole. À partir de €1,800 par vol jusqu\'à 6 pax.',
          en: 'Considerably. Eighteen minutes of flight between Nice and La Mole. From €1,800 per flight, up to 6 pax.',
        },
      },
      {
        q: { fr: 'Vol de nuit ?', en: 'Night flight?' },
        a: {
          fr: 'Pas de surcoût. Attente gratuite étendue jusqu\'à 1h30 pour les vols qui arrivent après 23h.',
          en: 'No surcharge. Extended free waiting up to 1h30 for flights landing after 11pm.',
        },
      },
      {
        q: { fr: 'Annulation ?', en: 'Cancellation?' },
        a: {
          fr: 'Gratuite jusqu\'à 24h avant. 50% retenus entre 24h et 4h. 100% moins de 4h.',
          en: 'Free up to 24h before. 50% retained between 24h and 4h. 100% less than 4h.',
        },
      },
    ],
  },

  'chauffeur:cannes-saint-tropez': {
    about: {
      fr: 'Le trajet chauffeur entre Cannes et Saint-Tropez fait quatre-vingt-quinze kilomètres. Une heure trente hors pointe par l\'A8 et l\'A57, jusqu\'à trois heures les samedis d\'été. Pour le retour Saint-Tropez Cannes, le service est identique. Mercedes V-Class par défaut, idéale pour les transferts en groupe ou avec bagages volumineux. Si l\'horaire est serré, l\'hélicoptère ramène le trajet à quinze minutes.',
      en: 'The chauffeur trip between Cannes and Saint-Tropez is ninety-five kilometres. One hour thirty off-peak via the A8 and A57, up to three hours on summer Saturdays. For the Saint-Tropez Cannes return, the service is identical. Mercedes V-Class by default, ideal for group transfers or bulky luggage. If timing is tight, the helicopter brings it down to fifteen minutes.',
    },
    whyMode: {
      fr: [
        'Porte-à-porte sans changement : votre adresse à Cannes ou Saint-Tropez.',
        'Mercedes V-Class jusqu\'à 7 passagers et 4 grandes valises.',
        'Pour Pampelonne, dépose directe côté plage à Club 55, Bagatelle, etc.',
        'Indépendant de la météo, contrairement à l\'hélicoptère.',
        'Pendant le Festival de Cannes : départs vers Saint-Tropez en backup.',
      ],
      en: [
        'Door-to-door without change: your address in Cannes or Saint-Tropez.',
        'Mercedes V-Class up to 7 passengers and 4 large suitcases.',
        'For Pampelonne, direct beach-side drop-off at Club 55, Bagatelle, etc.',
        'Independent of weather, unlike the helicopter.',
        'During the Cannes Festival: departures to Saint-Tropez as backup.',
      ],
    },
    hubFromTitle: { fr: 'Cannes', en: 'Cannes' },
    hubFromDesc: {
      fr: 'Cannes Croisette, Le Suquet, Le Cannet : pickup à votre adresse exacte. Hôtels Carlton, Martinez, Majestic accessibles directement.',
      en: 'Cannes Croisette, Le Suquet, Le Cannet: pickup at your exact address. Carlton, Martinez, Majestic hotels accessible directly.',
    },
    hubToTitle: { fr: 'Saint-Tropez', en: 'Saint-Tropez' },
    hubToDesc: {
      fr: 'Dépose à Saint-Tropez village, port, route des Plages, Pampelonne. Accès direct aux paillotes en saison. Pour Cheval Blanc, dépose à La Bouillabaisse.',
      en: 'Drop-off at Saint-Tropez village, port, route des Plages, Pampelonne. Direct beach-side access in season. For Cheval Blanc, drop-off at La Bouillabaisse.',
    },
    faq: [
      {
        q: { fr: 'Combien coûte un transfert Cannes Saint-Tropez ?', en: 'How much does a Cannes Saint-Tropez transfer cost?' },
        a: {
          fr: 'À partir de €260 en Mercedes V-Class, prix forfaitaire. €340 en S-Class.',
          en: 'From €260 in Mercedes V-Class, flat rate. €340 in S-Class.',
        },
      },
      {
        q: { fr: 'Et le retour Saint-Tropez Cannes ?', en: 'And the Saint-Tropez Cannes return?' },
        a: {
          fr: 'Tarif et service identiques dans le sens inverse. Aller-retour combiné possible avec tarif négocié.',
          en: 'Identical price and service in reverse. Combined round-trip possible with negotiated rate.',
        },
      },
      {
        q: { fr: 'Combien de temps faut-il prévoir ?', en: 'How long should I plan?' },
        a: {
          fr: '1h30 hors pointe, 2h à 3h les samedis d\'été. Pour un dîner, partir trois heures avant.',
          en: '1h30 off-peak, 2h to 3h on summer Saturdays. For a dinner, leave three hours ahead.',
        },
      },
      {
        q: { fr: 'L\'hélicoptère est-il plus rapide ?', en: 'Is the helicopter faster?' },
        a: {
          fr: 'Largement. Quinze minutes de vol entre Cannes Mandelieu et La Mole.',
          en: 'Considerably. Fifteen minutes of flight between Cannes Mandelieu and La Mole.',
        },
      },
      {
        q: { fr: 'Pendant le Festival de Cannes ?', en: 'During the Cannes Festival?' },
        a: {
          fr: 'Le retour Saint-Tropez Cannes est plus tendu. Réserver 3 à 5 jours avant minimum.',
          en: 'The Saint-Tropez Cannes return is more tight. Book 3 to 5 days ahead minimum.',
        },
      },
    ],
  },

  'chauffeur:cannes-monaco': {
    about: {
      fr: 'Le trajet Cannes-Monaco par la route fait cinquante-six kilomètres. Une heure hors heure de pointe par l\'A8, une heure trente à quarante en saison. Itinéraire alternatif par la basse corniche pour éviter les bouchons d\'A8 en juillet-août. Mercedes V-Class par défaut, S-Class à la demande pour les couples ou business meetings. Pour la pression horaire ou les événements à Monaco (Grand Prix, gala), l\'hélicoptère reste l\'option dix minutes.',
      en: 'The Cannes-Monaco trip by road is fifty-six kilometres. One hour off-peak via the A8, one hour thirty to forty in season. Alternative route via the lower corniche to avoid A8 jams in July-August. Mercedes V-Class by default, S-Class on request for couples or business meetings. For time pressure or events in Monaco (Grand Prix, gala), the helicopter remains the ten-minute option.',
    },
    whyMode: {
      fr: [
        'Porte-à-porte sans changement : votre adresse à Cannes, votre adresse à Monaco. Pas d\'heliport intermédiaire.',
        'Mercedes V-Class accueille jusqu\'à 7 passagers et 4 grandes valises. Idéal pour les transferts en groupe ou avec bagages encombrants.',
        'Indépendant des conditions météo, qui peuvent annuler un vol hélicoptère.',
        'Coût significativement inférieur à l\'hélicoptère, pour des trajets sans pression horaire.',
        'Itinéraire ajusté en temps réel selon le trafic, basse corniche en alternative.',
      ],
      en: [
        'Door-to-door without transfer: your address in Cannes, your address in Monaco. No intermediate heliport.',
        'Mercedes V-Class hosts up to 7 passengers and 4 large suitcases. Ideal for group transfers or bulky luggage.',
        'Independent of weather, which can cancel a helicopter flight.',
        'Cost significantly lower than helicopter, for trips without time pressure.',
        'Route adjusted in real time based on traffic, lower corniche as alternative.',
      ],
    },
    hubFromTitle: { fr: 'Cannes', en: 'Cannes' },
    hubFromDesc: {
      fr: 'Cannes Croisette, Le Suquet, Le Cannet, Mougins voisin : pickup à votre adresse exacte. Hôtels Carlton, Martinez, Majestic accessibles directement. Pour les villas en hauteur, prévoir cinq minutes supplémentaires.',
      en: 'Cannes Croisette, Le Suquet, Le Cannet, neighbouring Mougins: pickup at your exact address. Carlton, Martinez, Majestic hotels directly accessible. For villas in the heights, allow five extra minutes.',
    },
    hubToTitle: { fr: 'Monaco', en: 'Monaco' },
    hubToDesc: {
      fr: 'Dépose à votre adresse exacte à Monaco : Place du Casino, Larvotto, Fontvieille, La Condamine. Hôtels Hôtel de Paris, Métropole, Hermitage. Pendant le Grand Prix, accès restreint dans le centre, à anticiper.',
      en: 'Drop-off at your exact address in Monaco: Casino Square, Larvotto, Fontvieille, La Condamine. Hôtel de Paris, Métropole, Hermitage hotels. During the Grand Prix, restricted access downtown, to anticipate.',
    },
    faq: [
      {
        q: { fr: 'Combien coûte un transfert Cannes Monaco ?', en: 'How much does a Cannes Monaco transfer cost?' },
        a: {
          fr: 'À partir de €220 en Mercedes V-Class, prix forfaitaire. €280 en S-Class. Pas de supplément bagages.',
          en: 'From €220 in Mercedes V-Class, flat rate. €280 in S-Class. No luggage surcharge.',
        },
      },
      {
        q: { fr: 'Combien de temps faut-il prévoir ?', en: 'How long should I plan?' },
        a: {
          fr: 'Une heure hors heure de pointe, 1h30 à 1h40 en saison. Pour un dîner à Monaco, partir deux heures avant.',
          en: 'One hour off-peak, 1h30-1h40 in season. For a Monaco dinner, leave two hours ahead.',
        },
      },
      {
        q: { fr: 'L\'hélicoptère est-il plus rapide ?', en: 'Is the helicopter faster?' },
        a: {
          fr: 'Largement. Dix minutes de vol contre une heure de route. À partir de €1,200 par vol jusqu\'à 6 pax.',
          en: 'Considerably. Ten minutes of flight against one hour by road. From €1,200 per flight, up to 6 pax.',
        },
      },
      {
        q: { fr: 'Pendant le Grand Prix de Monaco ?', en: 'During the Monaco Grand Prix?' },
        a: {
          fr: 'Routes saturées et accès restreint dans le centre. Prévoir 2h minimum, hélicoptère privilégié si possible.',
          en: 'Saturated roads and restricted access downtown. Plan 2h minimum, helicopter preferred if possible.',
        },
      },
      {
        q: { fr: 'Mercedes V-Class ou S-Class ?', en: 'Mercedes V-Class or S-Class?' },
        a: {
          fr: 'V-Class pour 4-7 pax ou bagages volumineux. S-Class pour couples ou business, plus discret.',
          en: 'V-Class for 4-7 pax or bulky luggage. S-Class for couples or business, more discreet.',
        },
      },
      {
        q: { fr: 'Annulation ?', en: 'Cancellation?' },
        a: {
          fr: 'Gratuite jusqu\'à 24h avant. 50% entre 24h et 4h. 100% moins de 4h.',
          en: 'Free up to 24h before. 50% between 24h and 4h. 100% less than 4h.',
        },
      },
    ],
  },

  'helicopter:cap-ferrat-saint-tropez': {
    about: {
      fr: 'Le Cap-Ferrat n\'a pas son propre heliport. Notre équipe arrange un chauffeur Mercedes V-Class de votre adresse à l\'heliport de Nice (quinze minutes), puis vol direct vers La Mole en vingt minutes. Total porte-à-porte environ cinquante minutes contre deux heures quinze par la route. Le vol passe au-dessus du Cap-Ferrat, longe la rade de Villefranche, traverse Antibes et Saint-Raphaël, puis atterrit dans la plaine de Saint-Tropez.',
      en: 'Cap-Ferrat has no heliport of its own. Our team arranges a Mercedes V-Class chauffeur from your address to Nice heliport (fifteen minutes), then direct flight to La Mole in twenty minutes. Total door-to-door about fifty minutes against two hours fifteen by road. The flight passes above Cap-Ferrat, runs along Villefranche bay, crosses Antibes and Saint-Raphaël, then lands in the Saint-Tropez plain.',
    },
    whyMode: {
      fr: [
        'Cinquante minutes porte-à-porte contre deux heures quinze par la route. Net gain de temps pour un déjeuner à Pampelonne.',
        'Le créneau idéal de départ est entre 10h et 12h, ou après 17h. Heliport de Nice saturé en milieu de journée.',
        'Mercedes V-Class du Cap à Nice (15 min), puis vol Nice-La Mole en 20 minutes. V-Class à La Mole pour rejoindre votre adresse à Saint-Tropez.',
        'Météo défavorable : bascule sur transfert chauffeur direct depuis le Cap-Ferrat. Trajet route 2h15.',
        'Compatible avec un retour le même soir si le créneau du dernier vol l\'autorise.',
      ],
      en: [
        'Fifty minutes door-to-door against two hours fifteen by road. Clear time gain for a Pampelonne lunch.',
        'Ideal departure window 10am to 12pm or after 5pm. Nice heliport saturated at midday.',
        'Mercedes V-Class from Cap to Nice (15 min), then Nice-La Mole flight in 20 min. V-Class at La Mole to reach your Saint-Tropez address.',
        'Bad weather: switch to direct chauffeur transfer from Cap-Ferrat. 2h15 road trip.',
        'Compatible with same-evening return if the last flight slot allows.',
      ],
    },
    hubFromTitle: { fr: 'Cap-Ferrat + Heliport de Nice', en: 'Cap-Ferrat + Nice heliport' },
    hubFromDesc: {
      fr: 'Pickup à votre villa au Cap-Ferrat en Mercedes V-Class. Quinze minutes jusqu\'à l\'heliport de Nice, situé sur le port. Embarquement direct, briefing sécurité, décollage.',
      en: 'Pickup at your villa in Cap-Ferrat by Mercedes V-Class. Fifteen minutes to Nice heliport, located on the harbour. Direct boarding, safety briefing, takeoff.',
    },
    hubToTitle: { fr: 'Heliport de La Mole', en: 'La Mole heliport' },
    hubToDesc: {
      fr: 'Atterrissage à La Mole, vingt minutes en chauffeur de Saint-Tropez et Pampelonne. Mercedes V-Class attend côté piste, bagages chargés au sol, départ vers votre adresse finale.',
      en: 'Landing at La Mole, twenty minutes by chauffeur from Saint-Tropez and Pampelonne. Mercedes V-Class waits airside, luggage loaded on the ground, departure to your final address.',
    },
    faq: [
      {
        q: { fr: 'Pourquoi pas un vol direct depuis le Cap-Ferrat ?', en: 'Why not a direct flight from Cap-Ferrat?' },
        a: {
          fr: 'Le Cap-Ferrat n\'a pas d\'heliport. Le plus proche est Nice (15 min en chauffeur) ou Monaco (25 min). Notre équipe coordonne le pickup et le transfert.',
          en: 'Cap-Ferrat has no heliport. Nearest is Nice (15 min by chauffeur) or Monaco (25 min). Our team coordinates pickup and transfer.',
        },
      },
      {
        q: { fr: 'Combien coûte le transfert complet ?', en: 'How much does the full transfer cost?' },
        a: {
          fr: 'À partir de €2,000 par vol, jusqu\'à six passagers. Inclut chauffeur Cap-Ferrat→Nice, vol Nice→La Mole, chauffeur La Mole→Saint-Tropez.',
          en: 'From €2,000 per flight, up to six passengers. Includes chauffeur Cap-Ferrat→Nice, Nice→La Mole flight, chauffeur La Mole→Saint-Tropez.',
        },
      },
      {
        q: { fr: 'Peut-on rentrer le même jour ?', en: 'Can we return the same day?' },
        a: {
          fr: 'Oui. Le dernier vol La Mole→Nice est généralement à 19h30 en saison. Notre équipe coordonne le retour selon votre planning.',
          en: 'Yes. The last La Mole→Nice flight is generally at 7:30pm in season. Our team coordinates the return based on your schedule.',
        },
      },
      {
        q: { fr: 'Météo défavorable ?', en: 'Bad weather?' },
        a: {
          fr: 'Bascule automatique sur transfert chauffeur direct depuis le Cap-Ferrat. Trajet route 2h15 par l\'A8 et la basse corniche.',
          en: 'Automatic switch to direct chauffeur transfer from Cap-Ferrat. 2h15 road trip via A8 and lower corniche.',
        },
      },
      {
        q: { fr: 'Combien de bagages ?', en: 'How much luggage?' },
        a: {
          fr: 'Deux valises moyennes par passager. Encombrants à signaler à la réservation.',
          en: 'Two medium bags per passenger. Bulky items to be flagged at booking.',
        },
      },
      {
        q: { fr: 'Annulation ?', en: 'Cancellation?' },
        a: {
          fr: 'Gratuite jusqu\'à 24h avant. 50% entre 24h et 4h. Force majeure (météo) : remboursement total.',
          en: 'Free up to 24h before. 50% between 24h and 4h. Force majeure (weather): full refund.',
        },
      },
    ],
  },

  'helicopter:monaco-cannes': {
    about: {
      fr: 'Le vol hélicoptère Monaco Cannes prend douze minutes entre l\'heliport de Fontvieille à Monaco et le Quai du Large, posé au cœur du port de Cannes. Par la route, l\'A8 et la basse corniche font une heure hors saison, deux heures pendant le Festival ou le Grand Prix. Le vol survole la rade de Villefranche, le Cap-Ferrat, longe le Cap d\'Antibes, traverse la baie de la Napoule, puis atterrit à cinq minutes de la Croisette. Cinquante-six kilomètres parcourus à plat, sans embouteillage ni point de contrôle. Mercedes V-Class incluse aux deux extrémités. Pour les ouvertures du Festival, les soirées MIPIM ou les afterparties Cannes Lions, c\'est la seule option qui permet de partir tard et de rentrer à Monaco le soir même.',
      en: 'The Monaco Cannes helicopter flight takes twelve minutes between the Fontvieille heliport in Monaco and Quai du Large, sitting at the heart of Cannes harbour. By road, the A8 and lower corniche take one hour off-peak, two hours during the Festival or the Grand Prix. The flight passes above the Villefranche bay, Cap-Ferrat, runs along Cap d\'Antibes, crosses the Napoule bay, then lands five minutes from the Croisette. Fifty-six kilometres covered straight, no congestion or checkpoint. Mercedes V-Class included at both ends. For Cannes Festival openings, MIPIM evenings or Cannes Lions afterparties, this is the only option that lets you leave late and return to Monaco the same evening.',
    },
    whyMode: {
      fr: [
        'Douze minutes de vol contre une heure de route hors saison, deux heures pendant les événements.',
        'Quai du Large dépose à cinq minutes de la Croisette en chauffeur. Mandelieu pour l\'arrière-pays.',
        'Pendant le Festival de Cannes (mai), MIPIM (mars) ou Cannes Lions (juin), l\'A8 sature du matin au soir. Le vol est la seule option fluide.',
        'Compatible avec un dîner sur la Croisette puis retour à Monaco le soir même, sans pression horaire.',
      ],
      en: [
        'Twelve minutes by air against one hour by road off-peak, two hours during events.',
        'Quai du Large drops five minutes from the Croisette by chauffeur. Mandelieu for inland.',
        'During Cannes Festival (May), MIPIM (March) or Cannes Lions (June), the A8 saturates from morning to evening. The flight is the only fluid option.',
        'Compatible with a Croisette dinner then return to Monaco the same evening, no time pressure.',
      ],
    },
    hubFromTitle: { fr: 'Heliport de Monaco · Fontvieille', en: 'Monaco heliport · Fontvieille' },
    hubFromDesc: {
      fr: 'L\'heliport de Monaco est posé sur la digue de Fontvieille, à cinq minutes de toute adresse à Monaco par chauffeur. Pendant le Grand Prix, l\'heliport opère à plein rendement, à anticiper deux à trois jours avant.',
      en: 'Monaco\'s heliport sits on the Fontvieille seawall, five minutes from any address in Monaco by chauffeur. During the Grand Prix, the heliport runs at full capacity, anticipate two to three days ahead.',
    },
    hubToTitle: { fr: 'Heliports de Cannes · Quai du Large et Mandelieu', en: 'Cannes heliports · Quai du Large and Mandelieu' },
    hubToDesc: {
      fr: 'Cannes a deux heliports. Quai du Large, au cœur du port, à cinq minutes de la Croisette en chauffeur. Mandelieu, dix minutes du Cannet et des collines, plus pratique pour l\'arrière-pays. Pendant le Festival, le Quai du Large fonctionne à plein rendement.',
      en: 'Cannes has two heliports. Quai du Large, at the heart of the port, five minutes from the Croisette by chauffeur. Mandelieu, ten minutes from Le Cannet and the hills, more convenient for inland. During the Festival, Quai du Large runs at full capacity.',
    },
    faq: [
      {
        q: { fr: 'Combien coûte un vol Monaco Cannes en hélicoptère ?', en: 'How much does a Monaco Cannes helicopter flight cost?' },
        a: {
          fr: 'À partir de €1,100 par vol, jusqu\'à six passagers. Mercedes V-Class incluse aux deux extrémités. Devis final selon date et aéronef.',
          en: 'From €1,100 per flight, up to six passengers. Mercedes V-Class included at both ends. Final quote depends on date and aircraft.',
        },
      },
      {
        q: { fr: 'Quai du Large ou Mandelieu : lequel choisir ?', en: 'Quai du Large or Mandelieu: which to choose?' },
        a: {
          fr: 'Quai du Large est plus rapide depuis la Croisette (5 minutes en chauffeur). Mandelieu mieux pour l\'arrière-pays ou Le Cannet. Notre équipe choisit selon votre adresse exacte.',
          en: 'Quai du Large is faster from the Croisette (5 minutes by chauffeur). Mandelieu better for inland or Le Cannet. Our team picks based on your exact address.',
        },
      },
      {
        q: { fr: 'Combien de temps dure le vol ?', en: 'How long is the flight?' },
        a: {
          fr: 'Douze à quinze minutes selon le vent et le couloir aérien. Embarquement quinze minutes avant. Total porte-à-porte environ quarante minutes.',
          en: 'Twelve to fifteen minutes depending on wind and corridor. Boarding fifteen minutes before. Door-to-door approximately forty minutes.',
        },
      },
      {
        q: { fr: 'Pendant le Festival de Cannes, MIPIM ou Cannes Lions ?', en: 'During Cannes Festival, MIPIM or Cannes Lions?' },
        a: {
          fr: 'Quai du Large saturé sur les jours événement. Réserver trois à cinq jours avant. Heliport de Mandelieu disponible en backup.',
          en: 'Quai du Large saturated during event days. Book three to five days ahead. Mandelieu heliport available as backup.',
        },
      },
      {
        q: { fr: 'Pendant le Grand Prix de Monaco ?', en: 'During the Monaco Grand Prix?' },
        a: {
          fr: 'Heliport de Fontvieille saturé. Réserver deux à trois jours avant minimum. Plages horaires souvent attribuées par paquets pendant les jours d\'événement.',
          en: 'Fontvieille heliport saturated. Book two to three days ahead minimum. Time slots often allocated by packages during event days.',
        },
      },
      {
        q: { fr: 'Que se passe-t-il en cas de mauvais temps ?', en: 'What if the weather is bad?' },
        a: {
          fr: 'Bascule automatique sur transfert chauffeur Mercedes V-Class. Trajet route en une heure à deux heures selon trafic et événements en cours.',
          en: 'Automatic switch to Mercedes V-Class chauffeur transfer. Road trip in one to two hours depending on traffic and ongoing events.',
        },
      },
      {
        q: { fr: 'Quel delai pour reserver ?', en: 'How far in advance should I book?' },
        a: {
          fr: '24 a 48h en periode normale. Trois a cinq jours pendant le Festival, le Grand Prix, MIPIM, Cannes Lions. Les heliports saturent sur ces creneaux.',
          en: '24 to 48 hours off-season. Three to five days during the Festival, the Grand Prix, MIPIM, Cannes Lions. Heliports saturate on these slots.',
        },
      },
      {
        q: { fr: 'Quelle est la politique d\'annulation ?', en: 'What is the cancellation policy?' },
        a: {
          fr: 'Annulation gratuite jusqu\'à 24h avant. Météo défavorable : remboursement total ou bascule chauffeur sans surcoût.',
          en: 'Free cancellation up to 24h before. Bad weather: full refund or chauffeur switch with no extra cost.',
        },
      },
    ],
  },

  'helicopter:cannes-saint-tropez': {
    about: {
      fr: 'Le vol hélicoptère Cannes Saint-Tropez prend quinze minutes entre l\'heliport de Mandelieu et celui de La Mole, dans la plaine intérieure de Saint-Tropez. Par la route, l\'A8 jusqu\'à Le Muy puis l\'A57 fait une heure trente hors saison, deux heures trente à trois heures en juillet et août quand l\'autoroute sature dès le samedi matin. Le vol longe la côte au-dessus de l\'Esterel, suit l\'arc de Saint-Raphaël puis traverse jusqu\'au golfe. Quatre-vingts kilomètres parcourus à plat, sans embouteillage estival ni détour par Le Muy. Mercedes V-Class de votre adresse à Mandelieu, V-Class à La Mole pour rejoindre Saint-Tropez, Ramatuelle, Pampelonne, ou enchaîner sur un transfert direct vers le port pour embarquer sur un yacht.',
      en: 'The Cannes Saint-Tropez helicopter flight takes fifteen minutes between Mandelieu heliport and La Mole, in the inland plain of Saint-Tropez. By road, the A8 to Le Muy then A57 takes one hour thirty off-season, two hours thirty to three hours in July and August when the motorway saturates from Saturday morning. The flight runs along the coast above the Esterel, follows the Saint-Raphaël arc then crosses to the gulf. Eighty kilometres covered straight, no summer congestion or Le Muy detour. Mercedes V-Class from your address to Mandelieu, V-Class at La Mole to reach Saint-Tropez, Ramatuelle, Pampelonne, or continue to the harbour to board a yacht.',
    },
    whyMode: {
      fr: [
        'Quinze minutes de vol contre une heure trente à trois heures par la route en été.',
        'L\'A8 sature dès juin entre Cannes et Saint-Tropez. Le samedi en saison, le détour par Le Muy peut durer trois heures.',
        'Compatible avec un déjeuner à Club 55 ou Bagatelle puis retour à Cannes le soir même.',
        'La Mole est à vingt minutes en chauffeur du village de Saint-Tropez et de Pampelonne.',
      ],
      en: [
        'Fifteen minutes by air against one hour thirty to three hours by road in summer.',
        'The A8 saturates from June between Cannes and Saint-Tropez. On Saturdays in season, the Le Muy detour can last three hours.',
        'Compatible with lunch at Club 55 or Bagatelle then return to Cannes the same evening.',
        'La Mole is twenty minutes by chauffeur from Saint-Tropez village and Pampelonne.',
      ],
    },
    hubFromTitle: { fr: 'Heliports de Cannes · Mandelieu et Quai du Large', en: 'Cannes heliports · Mandelieu and Quai du Large' },
    hubFromDesc: {
      fr: 'Cannes a deux heliports. Mandelieu, dans l\'arrière-pays, est le départ logique pour les vols vers l\'ouest comme Saint-Tropez. Quai du Large, dans le port, plus pratique si vous partez de la Croisette. Notre équipe choisit selon votre adresse exacte.',
      en: 'Cannes has two heliports. Mandelieu, inland, is the logical departure for westbound flights like Saint-Tropez. Quai du Large, in the harbour, more convenient if you depart from the Croisette. Our team picks based on your exact address.',
    },
    hubToTitle: { fr: 'Heliport de La Mole · Saint-Tropez', en: 'La Mole heliport · Saint-Tropez' },
    hubToDesc: {
      fr: 'L\'heliport de La Mole est dans la plaine intérieure, à vingt minutes en chauffeur du village de Saint-Tropez, de Pampelonne, Ramatuelle ou Gassin. Terminal de l\'aérodrome de La Mole pour vols privés. Mercedes V-Class côté piste pour rejoindre l\'adresse finale, ou pour enchaîner sur un transfert au port si vous embarquez sur un yacht.',
      en: 'La Mole heliport is in the inland plain, twenty minutes by chauffeur from Saint-Tropez village, Pampelonne, Ramatuelle or Gassin. La Mole private aerodrome terminal. Mercedes V-Class airside to reach the final address, or to continue to the harbour if you board a yacht.',
    },
    faq: [
      {
        q: { fr: 'Combien coûte un vol Cannes Saint-Tropez ?', en: 'How much does a Cannes Saint-Tropez flight cost?' },
        a: {
          fr: 'À partir de €1,700 par vol, jusqu\'à six passagers. Mercedes V-Class incluse aux deux extrémités. Devis final selon date et aéronef.',
          en: 'From €1,700 per flight, up to six passengers. Mercedes V-Class included at both ends. Final quote depends on date and aircraft.',
        },
      },
      {
        q: { fr: 'Et les bagages si on enchaîne sur un yacht ?', en: 'What about luggage if we continue to a yacht?' },
        a: {
          fr: 'Deux valises moyennes par passager. Si vous embarquez sur un yacht à Saint-Tropez ou Pampelonne, notre équipe coordonne le transfert V-Class de La Mole au port ou à la paillote où le tender vous récupère. Bagages portés au sol par notre équipe.',
          en: 'Two medium bags per passenger. If you board a yacht at Saint-Tropez or Pampelonne, our team coordinates the V-Class transfer from La Mole to the harbour or to the beach club where the tender picks you up. Luggage handled on the ground by our team.',
        },
      },
      {
        q: { fr: 'Combien de temps dure le vol ?', en: 'How long is the flight?' },
        a: {
          fr: 'Quinze à dix-huit minutes selon le vent et le couloir aérien. Embarquement quinze minutes avant. Total porte-à-porte environ cinquante minutes.',
          en: 'Fifteen to eighteen minutes depending on wind and corridor. Boarding fifteen minutes before. Door-to-door approximately fifty minutes.',
        },
      },
      {
        q: { fr: 'Mandelieu ou Quai du Large pour partir ?', en: 'Mandelieu or Quai du Large for departure?' },
        a: {
          fr: 'Mandelieu pour les vols vers l\'ouest, plus rapide en couloir aérien. Quai du Large si vous partez de la Croisette. Notre équipe choisit selon votre adresse.',
          en: 'Mandelieu for westbound flights, faster in the air corridor. Quai du Large if you depart from the Croisette. Our team picks based on your address.',
        },
      },
      {
        q: { fr: 'Pendant le mois d\'août, est-ce que c\'est saturé ?', en: 'Is it saturated in August?' },
        a: {
          fr: 'L\'heliport de La Mole fonctionne à plein rendement. Réserver cinq à sept jours avant. L\'aller-retour avec deux pilotes optimise les créneaux saturés.',
          en: 'La Mole heliport runs at full capacity. Book five to seven days ahead. Round-trip with two pilots optimises saturated slots.',
        },
      },
      {
        q: { fr: 'Que se passe-t-il en cas de mauvais temps ?', en: 'What if the weather is bad?' },
        a: {
          fr: 'Bascule automatique sur transfert chauffeur Mercedes V-Class. Trajet route Cannes Saint-Tropez en une heure trente à trois heures selon la saison et le jour.',
          en: 'Automatic switch to Mercedes V-Class chauffeur transfer. Cannes Saint-Tropez road trip in one hour thirty to three hours depending on season and day.',
        },
      },
      {
        q: { fr: 'Quel delai pour reserver ?', en: 'How far in advance should I book?' },
        a: {
          fr: '24 a 48h en periode normale. Cinq a sept jours en juillet-aout, pendant le Cannes Yachting Festival ou les Voiles de Saint-Tropez. Les heliports saturent sur ces creneaux.',
          en: '24 to 48 hours off-season. Five to seven days in July-August, during the Cannes Yachting Festival or Voiles de Saint-Tropez. Heliports saturate on these slots.',
        },
      },
      {
        q: { fr: 'Quelle est la politique d\'annulation ?', en: 'What is the cancellation policy?' },
        a: {
          fr: 'Annulation gratuite jusqu\'à 24h avant. Météo défavorable : remboursement total ou bascule chauffeur sans surcoût.',
          en: 'Free cancellation up to 24h before. Bad weather: full refund or chauffeur switch with no extra cost.',
        },
      },
    ],
  },
};

// Fallback procedural pour les routes sans LONG_CONTENT explicite.
function generateLongContent(
  mode: 'chauffeur' | 'helicopter',
  fromName: { fr: string; en: string },
  toName: { fr: string; en: string },
  duration: number,
  distance: number,
  price: number,
): TransferLongContent {
  const isHelico = mode === 'helicopter';
  return {
    about: {
      fr: `Le transfert ${isHelico ? 'hélicoptère' : 'chauffeur'} entre ${fromName.fr} et ${toName.fr} couvre ${distance} kilomètres en ${duration} minutes. ${isHelico ? 'Vol direct heliport à heliport, Mercedes V-Class incluse aux deux extrémités.' : 'Trajet porte-à-porte en Mercedes V-Class ou S-Class selon votre choix.'} Misana coordonne le ${isHelico ? 'pilote, l\'heliport et le chauffeur' : 'chauffeur, l\'itinéraire et le suivi en temps réel'}, avec un plan B prévu en cas d\'imprévu. Réponse de notre équipe sous 30 minutes en horaires Riviera, à partir de ${formatPriceFrom(price, 'fr')}.`,
      en: `The ${isHelico ? 'helicopter' : 'chauffeur'} transfer between ${fromName.en} and ${toName.en} covers ${distance} kilometres in ${duration} minutes. ${isHelico ? 'Direct heliport-to-heliport flight, Mercedes V-Class included at both ends.' : 'Door-to-door trip in Mercedes V-Class or S-Class depending on your choice.'} Misana coordinates the ${isHelico ? 'pilot, heliport and chauffeur' : 'chauffeur, route and real-time tracking'}, with a backup plan ready. Reply within 30 minutes in Riviera hours, from ${formatPriceFrom(price, 'en')}.`,
    },
    whyMode: {
      fr: isHelico
        ? [
            `Vol direct ${duration} minutes contre ${Math.round(distance * 1.2)} minutes par la route.`,
            'Indépendant du trafic routier, fluide en saison.',
                'Quatre à six passagers par vol selon l\'aéronef, deux valises moyennes par personne.',
            'Plan B chauffeur préparé en cas de météo défavorable.',
          ]
        : [
            'Porte-à-porte sans changement : votre adresse, à votre adresse.',
            'Mercedes V-Class jusqu\'à 7 passagers et 4 grandes valises. S-Class à la demande.',
            'Indépendant des conditions météo qui peuvent annuler un vol.',
            'Itinéraire ajusté en temps réel selon le trafic du jour.',
            'Chauffeur anglophone, sièges enfants sur demande.',
          ],
      en: isHelico
        ? [
            `Direct flight ${duration} minutes against ${Math.round(distance * 1.2)} minutes by road.`,
            'Independent of road traffic, smooth in season.',
                'Four to six passengers per flight depending on aircraft, two medium bags per person.',
            'Chauffeur backup prepared in case of bad weather.',
          ]
        : [
            'Door-to-door without transfer: your address, to your address.',
            'Mercedes V-Class up to 7 passengers and 4 large suitcases. S-Class on request.',
            'Independent of weather, which can cancel a flight.',
            'Route adjusted in real time based on day-of traffic.',
            'English-speaking driver, child seats on request.',
          ],
    },
    faq: [
      {
        q: {
          fr: `Combien coûte un transfert ${fromName.fr} ${toName.fr} ?`,
          en: `How much does a ${fromName.en} ${toName.en} transfer cost?`,
        },
        a: {
          fr: `À partir de ${formatPriceFrom(price, 'fr')}. Devis final selon date, ${isHelico ? 'aéronef' : 'véhicule'} et conditions.`,
          en: `From ${formatPriceFrom(price, 'en')}. Final quote depends on date, ${isHelico ? 'aircraft' : 'vehicle'} and conditions.`,
        },
      },
      {
        q: { fr: 'Combien de temps ?', en: 'How long?' },
        a: {
          fr: `${duration} minutes ${isHelico ? 'de vol' : 'de route'}, hors temps de transfert ${isHelico ? 'aux heliports' : 'd\'embarquement'}.`,
          en: `${duration} minutes ${isHelico ? 'flight' : 'drive'}, excluding ${isHelico ? 'heliport' : 'boarding'} transfer time.`,
        },
      },
      {
        q: { fr: 'Annulation ?', en: 'Cancellation?' },
        a: {
          fr: 'Gratuite jusqu\'à 24h avant. 50% entre 24h et 4h. 100% moins de 4h.',
          en: 'Free up to 24h before. 50% between 24h and 4h. 100% less than 4h.',
        },
      },
      {
        q: { fr: isHelico ? 'Météo défavorable ?' : 'Suivi des vols ?', en: isHelico ? 'Bad weather?' : 'Flight tracking?' },
        a: {
          fr: isHelico
            ? 'Bascule automatique sur transfert chauffeur Mercedes V-Class, prévu en backup.'
            : 'Oui, suivi temps réel des vols. Une heure d\'attente gratuite à compter de l\'heure d\'arrivée prévue.',
          en: isHelico
            ? 'Automatic switch to Mercedes V-Class chauffeur transfer, prepared as backup.'
            : 'Yes, real-time flight tracking. One hour of free waiting from scheduled arrival.',
        },
      },
    ],
  };
}

export function getLongContent(
  mode: 'chauffeur' | 'helicopter',
  slug: string,
  fromName: { fr: string; en: string },
  toName: { fr: string; en: string },
  duration: number,
  distance: number,
  price: number,
): TransferLongContent {
  return LONG_CONTENT[`${mode}:${slug}`]
    ?? generateLongContent(mode, fromName, toName, duration, distance, price);
}

// Indique si une route a un contenu redige a la main dans LONG_CONTENT.
// Utilise par la page transfer pour decider d activer noindex sur les
// routes en fallback procedural (qualite trop generique pour ranker
// sans cannibaliser les canoniques riches).
export function hasHandcraftedLongContent(
  mode: 'chauffeur' | 'helicopter',
  slug: string,
): boolean {
  return LONG_CONTENT[`${mode}:${slug}`] !== undefined;
}

// Temoignages anonymises (CLAUDE.md §5 : profession + nationalite uniquement,
// pas de nom client). Pool partage par toutes les fiches.
export const TRANSFER_TESTIMONIALS = [
  {
    quote: {
      fr: 'Trois vols pendant la semaine du Grand Prix de Monaco. Toujours à l\'heure, toujours discrets. Le chauffeur attendait avant que l\'on ait fini la conférence.',
      en: 'Three flights during Monaco Grand Prix week. Always on time, always discreet. The chauffeur was waiting before we even finished the conference.',
    },
    author: { fr: 'Banker, Genève', en: 'Banker, Geneva' },
  },
  {
    quote: {
      fr: 'Une bascule chauffeur le jour-J pour cause de météo. Aucun stress, le V-Class était au pied de la villa dans les vingt minutes. Réservation maintenue, pas un mot de plus.',
      en: 'A chauffeur switch on the day due to weather. No stress, the V-Class was at the villa within twenty minutes. Booking honoured, not a word more.',
    },
    author: { fr: 'Famille, Londres', en: 'Family, London' },
  },
  {
    quote: {
      fr: 'L\'A8 saturée pendant le Festival, le chauffeur connaissait la basse corniche par cœur. Arrivés à temps pour la projection.',
      en: 'A8 saturated during the Festival, the chauffeur knew the lower corniche by heart. Arrived in time for the screening.',
    },
    author: { fr: 'Producteur, Los Angeles', en: 'Producer, Los Angeles' },
  },
];
