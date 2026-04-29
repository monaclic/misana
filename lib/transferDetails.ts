// Donnees fiche transfert V1 hardcoded.
// Pattern Uber : data dense, pas d'editorial. Prix indicatif "From €X"
// affiche, ce qui differe du reste du site (pas de prix dans copy editoriale)
// car ici c'est de la data tarifaire operationnelle, pas de l'editorial.

import type { TransferSlug } from '~/lib/constants';

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

const DETAILS: Record<string, TransferDetail> = {
  // ===== HELICOPTERE =====
  'helicopter:monaco-saint-tropez': {
    durationHelicopter: 18,
    distanceKm: 65,
    priceFrom: 1800,
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
  'chauffeur:nice-airport-cannes': 'https://images.unsplash.com/photo-1543874768-2df4cdc1ddc8?w=2000&q=85',
  'chauffeur:cannes-monaco': 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=2000&q=85',
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
