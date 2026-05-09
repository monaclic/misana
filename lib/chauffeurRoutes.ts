// Routes chauffeur Misana V1.
// Tarifs aller simple, taxes incluses, accueil personnalise + assistance bagages
// inclus. Confirme au moment de la reservation.
// Range Rover et Maybach sont exclus de la matrice transferts : prix sur
// demande, comme cote a cote sur la fleet.

export type ChauffeurPriceMatrix = {
  'e-class': number | null;
  'v-class': number | null;
  's-class': number | null;
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
    prices: { 'e-class': 120, 'v-class': 130, 's-class': 150 },
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
    prices: { 'e-class': 140, 'v-class': 160, 's-class': 185 },
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
    prices: { 'e-class': 305, 'v-class': 370, 's-class': 405 },
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
    prices: { 'e-class': 100, 'v-class': 110, 's-class': 135 },
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
    prices: { 'e-class': 120, 'v-class': 135, 's-class': 160 },
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
    prices: { 'e-class': 90, 'v-class': 100, 's-class': 125 },
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
    prices: { 'e-class': 130, 'v-class': 145, 's-class': 175 },
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
    prices: { 'e-class': 205, 'v-class': 240, 's-class': 290 },
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
    prices: { 'e-class': 270, 'v-class': 310, 's-class': 380 },
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
    prices: { 'e-class': 330, 'v-class': 405, 's-class': 450 },
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
