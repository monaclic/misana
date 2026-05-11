// Types et helpers du catalogue voitures de location.
// Les fiches voitures sont gerees dans Sanity (schema rentalCar) et
// recuperees via composables/useRentalCars.ts. Les categories le sont
// via useRentalCarCategories (schema rentalCarCategory).

export type RentalCarCategory = 'supercar' | 'sport' | 'suv' | 'sedan' | 'convertible';

type RentalPriceTiers = {
  oneToThreeDays: number;
  fourToSevenDays: number;
  weekPlus: number;
};

type RentalConditions = {
  minAge: number;
  securityDeposit: number;
  minDays: number;
  includedKmPerDay: number;
  overageRatePerKm: number;
};

export type RentalCar = {
  id: string;
  brand: string;
  model: string;
  fullName: string;
  category: RentalCarCategory;
  pax: number;
  hp: number;
  topSpeedKmh: number;
  transmission: 'auto' | 'manual';
  fuelType: 'gasoline' | 'hybrid' | 'electric' | 'diesel';
  year: number;
  hero: string;
  images: string[];
  prices: RentalPriceTiers;
  conditions: RentalConditions;
  availableCities: string[];
  badge?: 'popular' | 'flagship';
  desc: string;
  descFr: string;
  bodyEn: string;
  bodyFr: string;
};

export const RENTAL_PRICE_BUCKETS: { id: string; label: string; min: number; max: number }[] = [
  { id: 'under-1000', label: 'Up to €1,000', min: 0, max: 1000 },
  { id: '1000-2000', label: '€1,000 - €2,000', min: 1000, max: 2000 },
  { id: '2000-3000', label: '€2,000 - €3,000', min: 2000, max: 3000 },
  { id: '3000-plus', label: '€3,000 +', min: 3000, max: 999999 },
];

export function rentalDailyRate(car: RentalCar, days: number): number {
  if (days >= 7) return car.prices.weekPlus;
  if (days >= 4) return car.prices.fourToSevenDays;
  return car.prices.oneToThreeDays;
}
