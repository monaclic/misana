// Catalogue routes helicoptere Misana V1.
// Perimetre : 80 km Saint-Tropez a Menton. On expose uniquement les routes
// entre les hubs Riviera : NCE, MCM, CEQ, CNQ, LTT, STG.
// Source prix indicatifs : reseau operateurs commun Riviera.
// One-way, taxes incluses, chauffeur Mercedes V-Class inclus aux deux bouts.

export type HeliPriceMatrix = {
  h125: number | null;
  h130: number | null;
  as355: number | null;
  h135: number | null;
  bell429: number | null;
  h155: number | null;
};

export type HeliRoute = {
  fromId: string;
  toId: string;
  toLabel: string;
  toLabelFr: string;
  duration: string;
  price: HeliPriceMatrix;
};

export type HeliDepartureCard = {
  id: 'NCE' | 'MCM' | 'CEQ' | 'LTT';
  shortLabel: string;
  shortLabelFr: string;
  city: string;
  cityFr: string;
  // heliports secondaires si la ville en a plusieurs (Cannes, Saint-Tropez).
  // Le choix se fait dans une pill secondaire apres selection de la ville.
  variants?: { id: string; label: string; labelFr: string }[];
};

// Hubs de depart : 4 villes Riviera (symetrique avec les destinations).
// Le code IATA stocke est le heliport principal, change si l utilisateur
// selectionne un variant.
export const HELI_DEPARTURES: HeliDepartureCard[] = [
  {
    id: 'NCE',
    shortLabel: 'Nice',
    shortLabelFr: 'Nice',
    city: 'Nice',
    cityFr: 'Nice',
  },
  {
    id: 'MCM',
    shortLabel: 'Monaco',
    shortLabelFr: 'Monaco',
    city: 'Monaco',
    cityFr: 'Monaco',
  },
  {
    id: 'CEQ',
    shortLabel: 'Cannes',
    shortLabelFr: 'Cannes',
    city: 'Cannes',
    cityFr: 'Cannes',
    variants: [
      { id: 'CEQ', label: 'Mandelieu', labelFr: 'Mandelieu' },
      { id: 'CNQ', label: 'Quai du Large', labelFr: 'Quai du Large' },
    ],
  },
  {
    id: 'LTT',
    shortLabel: 'Saint-Tropez',
    shortLabelFr: 'Saint-Tropez',
    city: 'Saint-Tropez',
    cityFr: 'Saint-Tropez',
    variants: [
      { id: 'LTT', label: 'La Môle', labelFr: 'La Môle' },
      { id: 'STG', label: 'Grimaud', labelFr: 'Grimaud' },
    ],
  },
];

const labelMap: Record<string, { en: string; fr: string }> = {
  NCE: { en: 'Nice', fr: 'Nice' },
  MCM: { en: 'Monaco', fr: 'Monaco' },
  CEQ: { en: 'Cannes', fr: 'Cannes' },
  CNQ: { en: 'Cannes', fr: 'Cannes' },
  LTT: { en: 'Saint-Tropez', fr: 'Saint-Tropez' },
  STG: { en: 'Saint-Tropez', fr: 'Saint-Tropez' },
};

function r(
  fromId: string,
  toId: string,
  duration: string,
  price: HeliPriceMatrix,
): HeliRoute {
  const lbl = labelMap[toId] || { en: toId, fr: toId };
  return {
    fromId,
    toId,
    toLabel: lbl.en,
    toLabelFr: lbl.fr,
    duration,
    price,
  };
}

// Matrice Riviera uniquement (Saint-Tropez, Cannes, Nice, Monaco).
// Source : pages /helicopter-transfer-{nice,cannes,monaco,saint-tropez} de Leader.
export const HELI_ROUTES: HeliRoute[] = [
  // depuis NICE
  r('NCE', 'MCM', '7 min', { h125: 700, h130: 700, as355: 1200, h135: 1300, bell429: null, h155: null }),
  r('NCE', 'CEQ', '10 min', { h125: 1000, h130: 1000, as355: 1200, h135: 1300, bell429: null, h155: null }),
  r('NCE', 'LTT', '20 min', { h125: 2100, h130: 2200, as355: 3000, h135: 3850, bell429: null, h155: null }),

  // depuis MONACO
  r('MCM', 'NCE', '7 min', { h125: 700, h130: 700, as355: 1200, h135: 1300, bell429: null, h155: 3100 }),
  r('MCM', 'CEQ', '12 min', { h125: 1100, h130: 1200, as355: 1400, h135: 1900, bell429: 3050, h155: 5000 }),
  r('MCM', 'LTT', '22 min', { h125: 2200, h130: 2200, as355: 3050, h135: 3700, bell429: 6400, h155: 8500 }),

  // depuis CANNES (Mandelieu)
  r('CEQ', 'NCE', '7 min', { h125: 1000, h130: 1000, as355: 1200, h135: 1300, bell429: null, h155: 5000 }),
  r('CEQ', 'MCM', '12 min', { h125: 1100, h130: 1200, as355: 1400, h135: 1900, bell429: 3050, h155: 5000 }),
  r('CEQ', 'LTT', '15 min', { h125: 1700, h130: 1800, as355: 2400, h135: 2700, bell429: null, h155: 8500 }),

  // depuis SAINT-TROPEZ (La Mole)
  r('LTT', 'NCE', '20 min', { h125: 2100, h130: 2200, as355: 3000, h135: 3850, bell429: null, h155: null }),
  r('LTT', 'CEQ', '15 min', { h125: 1700, h130: 1800, as355: 2400, h135: 2700, bell429: null, h155: null }),
  r('LTT', 'MCM', '22 min', { h125: 2200, h130: 2200, as355: 3050, h135: 3700, bell429: null, h155: null }),
];

export function routesFrom(heliportId: string): HeliRoute[] {
  // CNQ et STG partagent la matrice de leur ville (CEQ/LTT).
  const eq = heliportId === 'CNQ' ? 'CEQ' : heliportId === 'STG' ? 'LTT' : heliportId;
  return HELI_ROUTES.filter((r) => r.fromId === eq);
}

export function routePrice(
  fromId: string,
  toId: string,
  helicopterId: string,
): number | null | undefined {
  const eq = fromId === 'CNQ' ? 'CEQ' : fromId === 'STG' ? 'LTT' : fromId;
  const route = HELI_ROUTES.find((r) => r.fromId === eq && r.toId === toId);
  if (!route) return undefined;
  return (route.price as Record<string, number | null>)[helicopterId];
}

export function routeFromPrice(route: HeliRoute): number | null {
  const prices = Object.values(route.price).filter(
    (p): p is number => typeof p === 'number',
  );
  return prices.length ? Math.min(...prices) : null;
}
