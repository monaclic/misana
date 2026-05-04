// Tarifs indicatifs mise a disposition chauffeur Misana V1.
// Operateur typique Riviera (E-Class -> Maybach), demi-journee a 24h,
// chauffeur dedie + carburant + assurance + km libres dans Riviera (80km).
// Hors carburant si trajet de plus de 200 km.

export type DisposalDurationId = 'h4' | 'h8' | 'h12' | 'h24';

export type DisposalPriceMatrix = Record<string, Record<DisposalDurationId, number | null>>;

export const DISPOSAL_DURATIONS: { id: DisposalDurationId; label: string; labelFr: string; hours: number }[] = [
  { id: 'h4',  label: '4 hours',     labelFr: '4 heures',         hours: 4 },
  { id: 'h8',  label: '8 hours',     labelFr: '8 heures',         hours: 8 },
  { id: 'h12', label: '12 hours',    labelFr: '12 heures',        hours: 12 },
  { id: 'h24', label: '24 hours',    labelFr: '24 heures',        hours: 24 },
];

// Tarifs forfaitaires par tranche, indicatifs (taxes incluses, chauffeur dedie).
// Multi-jours = tarif h24 multiplie par le nombre de jours (calcul ailleurs).
export const DISPOSAL_PRICES: DisposalPriceMatrix = {
  'e-class':     { h4: 280,  h8: 480,  h12: 680,  h24: 1100 },
  'v-class':     { h4: 380,  h8: 640,  h12: 880,  h24: 1400 },
  's-class':     { h4: 480,  h8: 800,  h12: 1100, h24: 1700 },
  'range-rover': { h4: 500,  h8: 850,  h12: 1150, h24: 1800 },
  'maybach':     { h4: 700,  h8: 1200, h12: 1700, h24: 2700 },
  'minibus':     { h4: 450,  h8: 750,  h12: 1050, h24: 1700 },
};

export function disposalPrice(vehicleId: string, duration: DisposalDurationId, days?: number): number | null {
  const row = DISPOSAL_PRICES[vehicleId];
  if (!row) return null;
  const base = row[duration];
  if (base === null || base === undefined) return null;
  if (duration === 'h24' && days && days > 1) return base * days;
  return base;
}

export function disposalMinPrice(duration: DisposalDurationId): number {
  const prices = Object.values(DISPOSAL_PRICES)
    .map((row) => row[duration])
    .filter((p): p is number => typeof p === 'number');
  return Math.min(...prices);
}
