// Routes chauffeur Misana V1.
// Tarifs indicatifs marche Riviera (operateurs premium VTC).
// Aller simple, taxes incluses, accueil personnalise + assistance bagages
// inclus. Confirme au moment de la reservation.

export type ChauffeurPriceMatrix = {
  'e-class': number | null;
  'v-class': number | null;
  's-class': number | null;
  'range-rover': number | null;
};

export type ChauffeurRoute = {
  id: string;
  fromLabel: string;
  fromLabelFr: string;
  toLabel: string;
  toLabelFr: string;
  fromInputDefault: string; // texte pre-rempli dans pickup input
  toInputDefault: string;   // texte pre-rempli dans dropoff input
  duration: string;         // "35 min", "1h45"
  prices: ChauffeurPriceMatrix;
};

// 10 routes les plus demandees Riviera + corniche Italie proche.
export const CHAUFFEUR_ROUTES: ChauffeurRoute[] = [
  {
    id: 'nce-mc',
    fromLabel: 'Nice airport',
    fromLabelFr: 'Aéroport de Nice',
    toLabel: 'Monaco',
    toLabelFr: 'Monaco',
    fromInputDefault: 'Nice Côte d\'Azur airport',
    toInputDefault: 'Monaco',
    duration: '35 min',
    prices: { 'e-class': 130, 'v-class': 170, 's-class': 200, 'range-rover': 200 },
  },
  {
    id: 'nce-can',
    fromLabel: 'Nice airport',
    fromLabelFr: 'Aéroport de Nice',
    toLabel: 'Cannes',
    toLabelFr: 'Cannes',
    fromInputDefault: 'Nice Côte d\'Azur airport',
    toInputDefault: 'Cannes',
    duration: '35 min',
    prices: { 'e-class': 140, 'v-class': 180, 's-class': 220, 'range-rover': 220 },
  },
  {
    id: 'nce-st',
    fromLabel: 'Nice airport',
    fromLabelFr: 'Aéroport de Nice',
    toLabel: 'Saint-Tropez',
    toLabelFr: 'Saint-Tropez',
    fromInputDefault: 'Nice Côte d\'Azur airport',
    toInputDefault: 'Saint-Tropez',
    duration: '1h45',
    prices: { 'e-class': 320, 'v-class': 380, 's-class': 450, 'range-rover': 450 },
  },
  {
    id: 'nce-cf',
    fromLabel: 'Nice airport',
    fromLabelFr: 'Aéroport de Nice',
    toLabel: 'Cap-Ferrat',
    toLabelFr: 'Cap-Ferrat',
    fromInputDefault: 'Nice Côte d\'Azur airport',
    toInputDefault: 'Cap-Ferrat',
    duration: '25 min',
    prices: { 'e-class': 110, 'v-class': 140, 's-class': 170, 'range-rover': 170 },
  },
  {
    id: 'nce-ca',
    fromLabel: 'Nice airport',
    fromLabelFr: 'Aéroport de Nice',
    toLabel: "Cap d'Antibes",
    toLabelFr: "Cap d'Antibes",
    fromInputDefault: 'Nice Côte d\'Azur airport',
    toInputDefault: "Cap d'Antibes",
    duration: '30 min',
    prices: { 'e-class': 130, 'v-class': 160, 's-class': 200, 'range-rover': 200 },
  },
  {
    id: 'nce-eze',
    fromLabel: 'Nice airport',
    fromLabelFr: 'Aéroport de Nice',
    toLabel: 'Èze',
    toLabelFr: 'Èze',
    fromInputDefault: 'Nice Côte d\'Azur airport',
    toInputDefault: 'Èze village',
    duration: '25 min',
    prices: { 'e-class': 110, 'v-class': 140, 's-class': 170, 'range-rover': 170 },
  },
  {
    id: 'nce-mn',
    fromLabel: 'Nice airport',
    fromLabelFr: 'Aéroport de Nice',
    toLabel: 'Menton',
    toLabelFr: 'Menton',
    fromInputDefault: 'Nice Côte d\'Azur airport',
    toInputDefault: 'Menton',
    duration: '45 min',
    prices: { 'e-class': 160, 'v-class': 190, 's-class': 230, 'range-rover': 230 },
  },
  {
    id: 'can-mc',
    fromLabel: 'Cannes',
    fromLabelFr: 'Cannes',
    toLabel: 'Monaco',
    toLabelFr: 'Monaco',
    fromInputDefault: 'Cannes',
    toInputDefault: 'Monaco',
    duration: '1h',
    prices: { 'e-class': 200, 'v-class': 240, 's-class': 290, 'range-rover': 290 },
  },
  {
    id: 'can-st',
    fromLabel: 'Cannes',
    fromLabelFr: 'Cannes',
    toLabel: 'Saint-Tropez',
    toLabelFr: 'Saint-Tropez',
    fromInputDefault: 'Cannes',
    toInputDefault: 'Saint-Tropez',
    duration: '1h30',
    prices: { 'e-class': 270, 'v-class': 320, 's-class': 380, 'range-rover': 380 },
  },
  {
    id: 'st-mc',
    fromLabel: 'Saint-Tropez',
    fromLabelFr: 'Saint-Tropez',
    toLabel: 'Monaco',
    toLabelFr: 'Monaco',
    fromInputDefault: 'Saint-Tropez',
    toInputDefault: 'Monaco',
    duration: '2h',
    prices: { 'e-class': 380, 'v-class': 440, 's-class': 530, 'range-rover': 530 },
  },
];

export function findRouteById(id: string | undefined) {
  if (!id) return undefined;
  return CHAUFFEUR_ROUTES.find((r) => r.id === id);
}

export function routePriceForVehicle(
  routeId: string | undefined,
  vehicleId: string,
): number | null | undefined {
  const route = findRouteById(routeId);
  if (!route) return undefined;
  return (route.prices as Record<string, number | null>)[vehicleId];
}

export function routeFromPriceChauffeur(route: ChauffeurRoute): number | null {
  const prices = Object.values(route.prices).filter(
    (p): p is number => typeof p === 'number',
  );
  return prices.length ? Math.min(...prices) : null;
}
