// Pipeline complet pour le catalogue Misana :
// 1) Definit le catalogue (32 fiches) avec specs + URLs images sources.
// 2) Telecharge toutes les images en local.
// 3) (Plus tard) detecte plaques + floute + upload Sanity + cree fiches.
//
// Ce fichier contient SEULEMENT la definition + helper download.
// Les phases suivantes ont leurs propres scripts.
//
// Usage : pnpm tsx scripts/fleet-pipeline.ts download

import { mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, extname } from 'node:path';

export const CAT = {
  sedan: '0rSVUGWjvFA7oUJDSg3T74',
  suv: '0rSVUGWjvFA7oUJDSg3TII',
  supercar: '3YnWRdpGcbV2dKVjjrCjuu',
  convertible: 'GJusG3cF3viLZ1vVgVpm85',
  sport: 'GJusG3cF3viLZ1vVgVpmOT',
};

export type FleetCar = {
  slug: string;
  brand: string;
  model: string;
  fullName: string;
  categoryId: string;
  pax: number;
  hp: number;
  topSpeedKmh: number;
  transmission: 'auto' | 'manual';
  fuelType: 'gasoline' | 'hybrid' | 'electric' | 'diesel';
  year: number;
  badge?: 'popular' | 'flagship';
  prices: { oneToThreeDays: number; fourToSevenDays: number; weekPlus: number };
  conditions: { minAge: number; securityDeposit: number; minDays: number; includedKmPerDay: number; overageRatePerKm: number };
  descEn: string;
  descFr: string;
  bodyEn: string;
  bodyFr: string;
  images: string[];
  source: 'flm' | 'perfgt' | 'yassine';
};

// === CATALOGUE 32 FICHES ===
// Specs : pour FLM (uniquement weekly+ tarif fourni), j'estime les paliers
// 1-3j et 4-7j a +30% et +15% du tarif weekPlus.
// Conditions : valeurs cohérentes par segment (supercar = 30 ans / caution
// forte / 2-3 jours min ; SUV/sport = 25-30 ans ; van = 25 ans).

const fmtPrices = (week: number): { oneToThreeDays: number; fourToSevenDays: number; weekPlus: number } => ({
  oneToThreeDays: Math.round(week * 1.30 / 50) * 50,
  fourToSevenDays: Math.round(week * 1.15 / 50) * 50,
  weekPlus: week,
});

const supercarConditions = (deposit: number) => ({ minAge: 30, securityDeposit: deposit, minDays: 3, includedKmPerDay: 250, overageRatePerKm: 10 });
const luxuryConditions = (deposit: number) => ({ minAge: 30, securityDeposit: deposit, minDays: 2, includedKmPerDay: 250, overageRatePerKm: 5 });
const suvConditions = (deposit: number) => ({ minAge: 25, securityDeposit: deposit, minDays: 1, includedKmPerDay: 250, overageRatePerKm: 3 });
const cityConditions = (deposit: number) => ({ minAge: 21, securityDeposit: deposit, minDays: 1, includedKmPerDay: 250, overageRatePerKm: 1 });
const vanConditions = (deposit: number) => ({ minAge: 25, securityDeposit: deposit, minDays: 1, includedKmPerDay: 250, overageRatePerKm: 2 });

const bodyEn = (fullName: string) => `${fullName} rental in St Tropez, Cannes, Monaco. Our cars are recent, carefully maintained and inspected before each rental.`;
const bodyFrLong = (fullName: string, places: number, hp: number, top: number, year: number, extra = '') =>
  `${fullName} a louer sur la Cote d Azur. ${places} places, ${hp} ch, ${top} km/h vitesse max, modele ${year}.${extra ? ' ' + extra : ''} Livraison Cannes, Monaco, Saint-Tropez, Nice. Assurance incluse, conciergerie vingt-quatre heures pendant la location.`;

export const FLEET: FleetCar[] = [
  // === FLM SPORTS CARS ===
  {
    slug: 'ferrari-296-gts',
    brand: 'Ferrari', model: '296 GTS', fullName: 'Ferrari 296 GTS',
    categoryId: CAT.supercar, badge: 'flagship',
    pax: 2, hp: 830, topSpeedKmh: 330, transmission: 'auto', fuelType: 'hybrid', year: 2025,
    prices: fmtPrices(1450), conditions: supercarConditions(50000),
    descEn: 'Ferrari 296 GTS, 830 hp, 330 km/h, 2025.',
    descFr: 'Ferrari 296 GTS, 830 ch, 330 km/h, 2025.',
    bodyEn: bodyEn('Ferrari 296 GTS'),
    bodyFr: bodyFrLong('Ferrari 296 GTS', 2, 830, 330, 2025, 'V6 hybride, 0 a 100 en 2 secondes 9.'),
    images: [
      'https://www.flmluxuryrent.com/wp-content/uploads/2025/05/ferrari-296-gts-detail-10.webp',
      'https://www.flmluxuryrent.com/wp-content/uploads/2025/05/ferrari-296-gts-detail-11.webp',
      'https://www.flmluxuryrent.com/wp-content/uploads/2025/05/ferrari-296-gts-detail-12.webp',
      'https://www.flmluxuryrent.com/wp-content/uploads/2025/05/ferrari-296-gts-detail-13.webp',
      'https://www.flmluxuryrent.com/wp-content/uploads/2025/05/ferrari-296-gts-detail-14.webp',
      'https://www.flmluxuryrent.com/wp-content/uploads/2025/05/ferrari-296-gts-detail-15.webp',
      'https://www.flmluxuryrent.com/wp-content/uploads/2025/05/ferrari-296-gts-detail-16.webp',
      'https://www.flmluxuryrent.com/wp-content/uploads/2025/05/ferrari-296-gts-detail-17.webp',
    ],
    source: 'flm',
  },
  {
    slug: 'ferrari-roma-spider',
    brand: 'Ferrari', model: 'Roma Spider', fullName: 'Ferrari Roma Spider',
    categoryId: CAT.convertible, badge: 'flagship',
    pax: 4, hp: 620, topSpeedKmh: 320, transmission: 'auto', fuelType: 'gasoline', year: 2024,
    prices: fmtPrices(1200), conditions: supercarConditions(40000),
    descEn: 'Ferrari Roma Spider, 620 hp, 320 km/h, 2024.',
    descFr: 'Ferrari Roma Spider, 620 ch, 320 km/h, 2024.',
    bodyEn: bodyEn('Ferrari Roma Spider'),
    bodyFr: bodyFrLong('Ferrari Roma Spider', 4, 620, 320, 2024, 'V8 biturbo, cabriolet capote toile.'),
    images: [
      'https://www.flmluxuryrent.com/wp-content/uploads/2026/04/ferrari-roma-spider-detail1-.webp',
      'https://www.flmluxuryrent.com/wp-content/uploads/2026/04/ferrari-roma-spider-detail2.webp',
      'https://www.flmluxuryrent.com/wp-content/uploads/2026/04/ferrari-roma-spider-detail3-copia.webp',
      'https://www.flmluxuryrent.com/wp-content/uploads/2026/04/ferrari-roma-spider-detail4.webp',
    ],
    source: 'flm',
  },
  {
    slug: 'ferrari-portofino-m',
    brand: 'Ferrari', model: 'Portofino M', fullName: 'Ferrari Portofino M',
    categoryId: CAT.convertible,
    pax: 4, hp: 620, topSpeedKmh: 320, transmission: 'auto', fuelType: 'gasoline', year: 2022,
    prices: fmtPrices(1000), conditions: supercarConditions(35000),
    descEn: 'Ferrari Portofino M, 620 hp, 320 km/h, 2022.',
    descFr: 'Ferrari Portofino M, 620 ch, 320 km/h, 2022.',
    bodyEn: bodyEn('Ferrari Portofino M'),
    bodyFr: bodyFrLong('Ferrari Portofino M', 4, 620, 320, 2022, 'V8 biturbo, cabriolet 2+2 a toit retractable.'),
    images: [
      'https://www.flmluxuryrent.com/wp-content/uploads/2025/02/portofino-detail-1-scaled.webp',
      'https://www.flmluxuryrent.com/wp-content/uploads/2025/02/portofino-detail-2.webp',
      'https://www.flmluxuryrent.com/wp-content/uploads/2025/02/portofino-detail-4.webp',
      'https://www.flmluxuryrent.com/wp-content/uploads/2025/02/portofino-detail-5.webp',
      'https://www.flmluxuryrent.com/wp-content/uploads/2025/02/portofino-detail-6.webp',
      'https://www.flmluxuryrent.com/wp-content/uploads/2025/02/portofino-detail-7-scaled.webp',
    ],
    source: 'flm',
  },
  {
    slug: 'lamborghini-huracan-evo-spyder',
    brand: 'Lamborghini', model: 'Huracán EVO Spyder', fullName: 'Lamborghini Huracán EVO Spyder',
    categoryId: CAT.supercar, badge: 'flagship',
    pax: 2, hp: 640, topSpeedKmh: 325, transmission: 'auto', fuelType: 'gasoline', year: 2024,
    prices: fmtPrices(1100), conditions: supercarConditions(40000),
    descEn: 'Lamborghini Huracán EVO Spyder, 640 hp, 325 km/h, 2024.',
    descFr: 'Lamborghini Huracán EVO Spyder, 640 ch, 325 km/h, 2024.',
    bodyEn: bodyEn('Lamborghini Huracán EVO Spyder'),
    bodyFr: bodyFrLong('Lamborghini Huracán EVO Spyder', 2, 640, 325, 2024, 'V10 atmospherique, cabriolet decouvrable en 17 secondes.'),
    images: [
      'https://www.flmluxuryrent.com/wp-content/uploads/2025/02/lamborghini-evo-detail.webp',
      'https://www.flmluxuryrent.com/wp-content/uploads/2025/02/lamborghini-evo-detail1.webp',
      'https://www.flmluxuryrent.com/wp-content/uploads/2025/02/lamborghini-evo-detail2.webp',
      'https://www.flmluxuryrent.com/wp-content/uploads/2025/02/lamborghini-evo-detail3-1.webp',
      'https://www.flmluxuryrent.com/wp-content/uploads/2025/02/lamborghini-evo-detail4-1.webp',
      'https://www.flmluxuryrent.com/wp-content/uploads/2025/02/lamborghini-evo-detail5.webp',
      'https://www.flmluxuryrent.com/wp-content/uploads/2025/02/lamborghini-evo-detail6.webp',
      'https://www.flmluxuryrent.com/wp-content/uploads/2025/02/lamborghini-evo-detail7-1.webp',
    ],
    source: 'flm',
  },
  {
    slug: 'lamborghini-huracan-tecnica',
    brand: 'Lamborghini', model: 'Huracán Tecnica', fullName: 'Lamborghini Huracán Tecnica',
    categoryId: CAT.supercar, badge: 'flagship',
    pax: 2, hp: 640, topSpeedKmh: 325, transmission: 'auto', fuelType: 'gasoline', year: 2024,
    prices: fmtPrices(1100), conditions: supercarConditions(45000),
    descEn: 'Lamborghini Huracán Tecnica, 640 hp, 325 km/h, 2024.',
    descFr: 'Lamborghini Huracán Tecnica, 640 ch, 325 km/h, 2024.',
    bodyEn: bodyEn('Lamborghini Huracán Tecnica'),
    bodyFr: bodyFrLong('Lamborghini Huracán Tecnica', 2, 640, 325, 2024, 'V10 atmospherique, coupé propulsion arriere derive de la STO.'),
    images: [
      'https://www.flmluxuryrent.com/wp-content/uploads/2026/04/lamborghini-huracan-tecnica-detail.webp',
      'https://www.flmluxuryrent.com/wp-content/uploads/2026/04/lamborghini-huracan-tecnica-detail1-.webp',
      'https://www.flmluxuryrent.com/wp-content/uploads/2026/04/lamborghini-huracan-tecnica-detail2-.webp',
      'https://www.flmluxuryrent.com/wp-content/uploads/2026/04/lamborghini-huracan-tecnica-detail3.webp',
      'https://www.flmluxuryrent.com/wp-content/uploads/2026/04/lamborghini-huracan-tecnica-detail4-.webp',
      'https://www.flmluxuryrent.com/wp-content/uploads/2026/04/lamborghini-huracan-tecnica-detail5.webp',
    ],
    source: 'flm',
  },
  {
    slug: 'mercedes-sl-63-amg-roadster',
    brand: 'Mercedes', model: 'SL 63 AMG Roadster', fullName: 'Mercedes SL 63 AMG Roadster',
    categoryId: CAT.convertible,
    pax: 4, hp: 585, topSpeedKmh: 315, transmission: 'auto', fuelType: 'gasoline', year: 2023,
    prices: fmtPrices(620), conditions: luxuryConditions(15000),
    descEn: 'Mercedes SL 63 AMG Roadster, 585 hp, 315 km/h, 2023.',
    descFr: 'Mercedes SL 63 AMG Roadster, 585 ch, 315 km/h, 2023.',
    bodyEn: bodyEn('Mercedes SL 63 AMG Roadster'),
    bodyFr: bodyFrLong('Mercedes SL 63 AMG Roadster', 4, 585, 315, 2023, 'V8 biturbo AMG, transmission 4Matic+, capote toile.'),
    images: [
      'https://www.flmluxuryrent.com/wp-content/uploads/2025/02/mercedes-benz-sl63-amg-4matic-detail1.webp',
      'https://www.flmluxuryrent.com/wp-content/uploads/2025/02/mercedes-benz-sl63-amg-4matic-detail2.webp',
      'https://www.flmluxuryrent.com/wp-content/uploads/2025/02/mercedes-benz-sl63-amg-4matic-detail3.webp',
      'https://www.flmluxuryrent.com/wp-content/uploads/2025/02/mercedes-benz-sl63-amg-4matic-detail4.webp',
      'https://www.flmluxuryrent.com/wp-content/uploads/2025/02/mercedes-benz-sl63-amg-4matic-detail5.webp',
    ],
    source: 'flm',
  },
  {
    slug: 'bentley-continental-gtc',
    brand: 'Bentley', model: 'Continental GTC', fullName: 'Bentley Continental GTC',
    categoryId: CAT.convertible, badge: 'flagship',
    pax: 4, hp: 782, topSpeedKmh: 285, transmission: 'auto', fuelType: 'gasoline', year: 2025,
    prices: fmtPrices(1500), conditions: luxuryConditions(20000),
    descEn: 'Bentley Continental GTC, 782 hp, 285 km/h, 2025.',
    descFr: 'Bentley Continental GTC, 782 ch, 285 km/h, 2025.',
    bodyEn: bodyEn('Bentley Continental GTC'),
    bodyFr: bodyFrLong('Bentley Continental GTC', 4, 782, 285, 2025, 'V8 hybride 4 places, cabriolet grand tourer.'),
    images: [
      'https://www.flmluxuryrent.com/wp-content/uploads/2025/02/Bentley-Continental-detail1.webp',
      'https://www.flmluxuryrent.com/wp-content/uploads/2025/02/Bentley-Continental-detail2-1.webp',
      'https://www.flmluxuryrent.com/wp-content/uploads/2025/02/Bentley-Continental-detail3.webp',
      'https://www.flmluxuryrent.com/wp-content/uploads/2025/02/Bentley-Continental-detail4.webp',
      'https://www.flmluxuryrent.com/wp-content/uploads/2025/02/Bentley-Continental-detail5.webp',
      'https://www.flmluxuryrent.com/wp-content/uploads/2025/02/Bentley-Continental-detail6.webp',
    ],
    source: 'flm',
  },
  {
    slug: 'porsche-911-carrera-4s-cabriolet',
    brand: 'Porsche', model: '911 Carrera 4S Cabriolet', fullName: 'Porsche 911 Carrera 4S Cabriolet',
    categoryId: CAT.convertible,
    pax: 4, hp: 450, topSpeedKmh: 306, transmission: 'auto', fuelType: 'gasoline', year: 2022,
    prices: fmtPrices(620), conditions: luxuryConditions(15000),
    descEn: 'Porsche 911 Carrera 4S Cabriolet, 450 hp, 306 km/h, 2022.',
    descFr: 'Porsche 911 Carrera 4S Cabriolet, 450 ch, 306 km/h, 2022.',
    bodyEn: bodyEn('Porsche 911 Carrera 4S Cabriolet'),
    bodyFr: bodyFrLong('Porsche 911 Carrera 4S Cabriolet', 4, 450, 306, 2022, 'Flat-six biturbo, transmission integrale.'),
    images: [
      'https://www.flmluxuryrent.com/wp-content/uploads/2025/02/911-carrera-4s-detail1.webp',
      'https://www.flmluxuryrent.com/wp-content/uploads/2025/02/911-carrera-4s-detail2.webp',
      'https://www.flmluxuryrent.com/wp-content/uploads/2025/02/911-carrera-4s-detail3.webp',
      'https://www.flmluxuryrent.com/wp-content/uploads/2025/02/detail4-1.webp',
    ],
    source: 'flm',
  },
  {
    slug: 'porsche-911-carrera-4-gts-cabriolet',
    brand: 'Porsche', model: '911 Carrera 4 GTS Cabriolet', fullName: 'Porsche 911 Carrera 4 GTS Cabriolet',
    categoryId: CAT.convertible, badge: 'flagship',
    pax: 4, hp: 541, topSpeedKmh: 312, transmission: 'auto', fuelType: 'hybrid', year: 2026,
    prices: fmtPrices(620), conditions: luxuryConditions(18000),
    descEn: 'Porsche 911 Carrera 4 GTS Cabriolet, 541 hp, 312 km/h, 2026.',
    descFr: 'Porsche 911 Carrera 4 GTS Cabriolet, 541 ch, 312 km/h, 2026.',
    bodyEn: bodyEn('Porsche 911 Carrera 4 GTS Cabriolet'),
    bodyFr: bodyFrLong('Porsche 911 Carrera 4 GTS Cabriolet', 4, 541, 312, 2026, 'Flat-six hybride T-Hybrid, transmission integrale.'),
    images: [
      'https://www.flmluxuryrent.com/wp-content/uploads/2026/02/Porsche-911-Carrera-4-GTS-Cabrio-detail4-copia.webp',
      'https://www.flmluxuryrent.com/wp-content/uploads/2026/03/Porsche-911-Carrera-4-GTS-Cabrio-detail12.webp',
      'https://www.flmluxuryrent.com/wp-content/uploads/2026/03/Porsche-911-Carrera-4-GTS-Cabrio-detail13.webp',
      'https://www.flmluxuryrent.com/wp-content/uploads/2026/03/Porsche-911-Carrera-4-GTS-Cabrio-detail14.webp',
      'https://www.flmluxuryrent.com/wp-content/uploads/2026/03/Porsche-911-Carrera-4-GTS-Cabrio-detail15.webp',
      'https://www.flmluxuryrent.com/wp-content/uploads/2026/03/Porsche-911-Carrera-4-GTS-Cabrio-detaiil16.webp',
    ],
    source: 'flm',
  },
  {
    slug: 'aston-martin-db12',
    brand: 'Aston Martin', model: 'DB12', fullName: 'Aston Martin DB12',
    categoryId: CAT.supercar, badge: 'flagship',
    pax: 4, hp: 680, topSpeedKmh: 325, transmission: 'auto', fuelType: 'gasoline', year: 2024,
    prices: fmtPrices(1450), conditions: supercarConditions(35000),
    descEn: 'Aston Martin DB12, 680 hp, 325 km/h, 2024.',
    descFr: 'Aston Martin DB12, 680 ch, 325 km/h, 2024.',
    bodyEn: bodyEn('Aston Martin DB12'),
    bodyFr: bodyFrLong('Aston Martin DB12', 4, 680, 325, 2024, 'V8 biturbo AMG, super tourer 2+2.'),
    images: [
      'https://www.flmluxuryrent.com/wp-content/uploads/2026/04/aston-martin-db12-Gallery.webp',
      'https://www.flmluxuryrent.com/wp-content/uploads/2026/04/aston-martin-db12-Gallery-2.webp',
      'https://www.flmluxuryrent.com/wp-content/uploads/2026/04/aston-martin-db12-Gallery-3.webp',
      'https://www.flmluxuryrent.com/wp-content/uploads/2026/04/aston-martin-db12-Gallery-4.webp',
    ],
    source: 'flm',
  },
  {
    slug: 'porsche-911-gt3-rs',
    brand: 'Porsche', model: '911 GT3 RS', fullName: 'Porsche 911 GT3 RS',
    categoryId: CAT.supercar, badge: 'flagship',
    pax: 2, hp: 525, topSpeedKmh: 296, transmission: 'auto', fuelType: 'gasoline', year: 2025,
    prices: fmtPrices(1500), conditions: supercarConditions(80000),
    descEn: 'Porsche 911 GT3 RS, 525 hp, 296 km/h, 2025.',
    descFr: 'Porsche 911 GT3 RS, 525 ch, 296 km/h, 2025.',
    bodyEn: bodyEn('Porsche 911 GT3 RS'),
    bodyFr: bodyFrLong('Porsche 911 GT3 RS', 2, 525, 296, 2025, 'Flat-six atmospherique, package Weissach, vocation circuit.'),
    images: [
      'https://www.flmluxuryrent.com/wp-content/uploads/2025/02/porsche-911-gt3-rs-Gallery6.webp',
      'https://www.flmluxuryrent.com/wp-content/uploads/2026/04/porsche-911-gt3-rs-Gallery-1.webp',
      'https://www.flmluxuryrent.com/wp-content/uploads/2026/04/porsche-911-gt3-rs-Gallery-2.webp',
      'https://www.flmluxuryrent.com/wp-content/uploads/2026/04/porsche-911-gt3-rs-Gallery-3.webp',
      'https://www.flmluxuryrent.com/wp-content/uploads/2026/04/porsche-911-gt3-rs-Gallery-4.webp',
      'https://www.flmluxuryrent.com/wp-content/uploads/2026/04/porsche-911-gt3-rs-gallery5.webp',
    ],
    source: 'flm',
  },
  // === FLM LUXURY SUV ===
  {
    slug: 'lamborghini-urus-se',
    brand: 'Lamborghini', model: 'Urus SE', fullName: 'Lamborghini Urus SE',
    categoryId: CAT.suv, badge: 'flagship',
    pax: 5, hp: 800, topSpeedKmh: 312, transmission: 'auto', fuelType: 'hybrid', year: 2026,
    prices: fmtPrices(1100), conditions: luxuryConditions(25000),
    descEn: 'Lamborghini Urus SE, 800 hp, 312 km/h, 2026.',
    descFr: 'Lamborghini Urus SE, 800 ch, 312 km/h, 2026.',
    bodyEn: bodyEn('Lamborghini Urus SE'),
    bodyFr: bodyFrLong('Lamborghini Urus SE', 5, 800, 312, 2026, 'V8 biturbo hybride rechargeable, super sport utility.'),
    images: [
      'https://www.flmluxuryrent.com/wp-content/uploads/2026/03/Lamborghini-URUS-SE-side2-1024x427.webp',
      'https://www.flmluxuryrent.com/wp-content/uploads/2026/03/Lamborghini-URUS-SE-detail3.webp',
      'https://www.flmluxuryrent.com/wp-content/uploads/2026/03/Lamborghini-URUS-SE-detail6.webp',
      'https://www.flmluxuryrent.com/wp-content/uploads/2026/03/Lamborghini-URUS-SE-detail12.webp',
      'https://www.flmluxuryrent.com/wp-content/uploads/2026/03/Lamborghini-URUS-SE-detail22.webp',
      'https://www.flmluxuryrent.com/wp-content/uploads/2026/03/Lamborghini-URUS-SE-detail32.webp',
      'https://www.flmluxuryrent.com/wp-content/uploads/2026/03/Lamborghini-URUS-SE-detail42.webp',
    ],
    source: 'flm',
  },
  {
    slug: 'lamborghini-urus-s',
    brand: 'Lamborghini', model: 'Urus S', fullName: 'Lamborghini Urus S',
    categoryId: CAT.suv, badge: 'flagship',
    pax: 5, hp: 666, topSpeedKmh: 305, transmission: 'auto', fuelType: 'gasoline', year: 2024,
    prices: fmtPrices(1100), conditions: luxuryConditions(25000),
    descEn: 'Lamborghini Urus S, 666 hp, 305 km/h, 2024.',
    descFr: 'Lamborghini Urus S, 666 ch, 305 km/h, 2024.',
    bodyEn: bodyEn('Lamborghini Urus S'),
    bodyFr: bodyFrLong('Lamborghini Urus S', 5, 666, 305, 2024, 'V8 biturbo, super sport utility 4 portes.'),
    images: [
      // Black variant
      'https://www.flmluxuryrent.com/wp-content/uploads/2025/02/lamborghini-urus-s-nera-detail1.webp',
      'https://www.flmluxuryrent.com/wp-content/uploads/2025/02/lamborghini-urus-s-nera-detail2.webp',
      'https://www.flmluxuryrent.com/wp-content/uploads/2025/02/lamborghini-urus-s-nera-detail3.webp',
      'https://www.flmluxuryrent.com/wp-content/uploads/2025/02/lamborghini-urus-s-nera-detail4.webp',
      'https://www.flmluxuryrent.com/wp-content/uploads/2025/02/lamborghini-urus-s-nera-detail5.webp',
      'https://www.flmluxuryrent.com/wp-content/uploads/2025/02/lamborghini-urus-s-nera-detail6.webp',
      'https://www.flmluxuryrent.com/wp-content/uploads/2025/02/lamborghini-urus-s-nera-detail7.webp',
      'https://www.flmluxuryrent.com/wp-content/uploads/2025/02/lamborghini-urus-s-nera-detail8.webp',
      // Blue variant
      'https://www.flmluxuryrent.com/wp-content/uploads/2025/02/lamborghini-urus-s-blu-detail1.webp',
      'https://www.flmluxuryrent.com/wp-content/uploads/2025/02/lamborghini-urus-s-blu-detail2.webp',
      'https://www.flmluxuryrent.com/wp-content/uploads/2025/02/lamborghini-urus-s-blu-detail3.webp',
      'https://www.flmluxuryrent.com/wp-content/uploads/2025/02/lamborghini-urus-s-blu-detail4.webp',
      'https://www.flmluxuryrent.com/wp-content/uploads/2025/02/lamborghini-urus-s-blu-detail5.webp',
      'https://www.flmluxuryrent.com/wp-content/uploads/2025/02/lamborghini-urus-s-blu-detail6.webp',
      'https://www.flmluxuryrent.com/wp-content/uploads/2025/02/lamborghini-urus-s-blu-detail8.webp',
      'https://www.flmluxuryrent.com/wp-content/uploads/2025/02/lamborghini-urus-s-blu-detail9.webp',
    ],
    source: 'flm',
  },
  {
    slug: 'mercedes-classe-g63-amg',
    brand: 'Mercedes', model: 'Classe G63 AMG', fullName: 'Mercedes Classe G63 AMG',
    categoryId: CAT.suv, badge: 'flagship',
    pax: 5, hp: 605, topSpeedKmh: 220, transmission: 'auto', fuelType: 'gasoline', year: 2025,
    prices: fmtPrices(650), conditions: luxuryConditions(20000),
    descEn: 'Mercedes Classe G63 AMG, 605 hp, 220 km/h, 2025.',
    descFr: 'Mercedes Classe G63 AMG, 605 ch, 220 km/h, 2025.',
    bodyEn: bodyEn('Mercedes Classe G63 AMG'),
    bodyFr: bodyFrLong('Mercedes Classe G63 AMG', 5, 605, 220, 2025, 'V8 biturbo AMG, transmission integrale 4Matic.'),
    images: [
      'https://www.flmluxuryrent.com/wp-content/uploads/2025/05/mercedes-benz-classe-G63-AMG-detail1-copia.webp',
      'https://www.flmluxuryrent.com/wp-content/uploads/2025/05/mercedes-benz-classe-G63-AMG-detail2-copia.webp',
      'https://www.flmluxuryrent.com/wp-content/uploads/2025/05/mercedes-benz-classe-G63-AMG-detail3-copia.webp',
      'https://www.flmluxuryrent.com/wp-content/uploads/2025/05/mercedes-benz-classe-G63-AMG-detail4-copia.webp',
      'https://www.flmluxuryrent.com/wp-content/uploads/2025/05/mercedes-benz-classe-G63-AMG-detail5-copia.webp',
      'https://www.flmluxuryrent.com/wp-content/uploads/2025/05/mercedes-benz-classe-G63-AMG-detail6-copia.webp',
      'https://www.flmluxuryrent.com/wp-content/uploads/2025/05/mercedes-benz-classe-G63-AMG-detail7-copia.webp',
      'https://www.flmluxuryrent.com/wp-content/uploads/2025/05/mercedes-benz-classe-G63-AMG-detail8-copia.webp',
    ],
    source: 'flm',
  },
  {
    slug: 'mercedes-gle-53-amg',
    brand: 'Mercedes', model: 'GLE 53 AMG', fullName: 'Mercedes GLE 53 AMG',
    categoryId: CAT.suv,
    pax: 5, hp: 435, topSpeedKmh: 250, transmission: 'auto', fuelType: 'hybrid', year: 2024,
    prices: fmtPrices(350), conditions: luxuryConditions(10000),
    descEn: 'Mercedes GLE 53 AMG, 435 hp, 250 km/h, 2024.',
    descFr: 'Mercedes GLE 53 AMG, 435 ch, 250 km/h, 2024.',
    bodyEn: bodyEn('Mercedes GLE 53 AMG'),
    bodyFr: bodyFrLong('Mercedes GLE 53 AMG', 5, 435, 250, 2024, 'Six cylindres en ligne hybride AMG.'),
    images: [
      'https://www.flmluxuryrent.com/wp-content/uploads/2025/11/mercedes-benz-gle-detail51.webp',
      'https://www.flmluxuryrent.com/wp-content/uploads/2025/11/mercedes-benz-gle-detail52.webp',
      'https://www.flmluxuryrent.com/wp-content/uploads/2025/11/mercedes-benz-gle-detail53.webp',
      'https://www.flmluxuryrent.com/wp-content/uploads/2025/11/mercedes-benz-gle-detail54.webp',
      'https://www.flmluxuryrent.com/wp-content/uploads/2025/11/mercedes-benz-gle-detail55.webp',
      'https://www.flmluxuryrent.com/wp-content/uploads/2025/11/mercedes-benz-gle-detail56.webp',
      'https://www.flmluxuryrent.com/wp-content/uploads/2025/11/mercedes-benz-gle-detail57.webp',
      'https://www.flmluxuryrent.com/wp-content/uploads/2025/11/mercedes-benz-gle-detail58.webp',
    ],
    source: 'flm',
  },
  {
    slug: 'mercedes-maybach-gls-600',
    brand: 'Mercedes', model: 'Maybach GLS 600', fullName: 'Mercedes Maybach GLS 600',
    categoryId: CAT.suv, badge: 'flagship',
    pax: 4, hp: 550, topSpeedKmh: 250, transmission: 'auto', fuelType: 'gasoline', year: 2022,
    prices: fmtPrices(1000), conditions: luxuryConditions(20000),
    descEn: 'Mercedes Maybach GLS 600, 550 hp, 250 km/h, 2022.',
    descFr: 'Mercedes Maybach GLS 600, 550 ch, 250 km/h, 2022.',
    bodyEn: bodyEn('Mercedes Maybach GLS 600'),
    bodyFr: bodyFrLong('Mercedes Maybach GLS 600', 4, 550, 250, 2022, 'V8 biturbo, 4 places individuelles cuir Nappa.'),
    images: [
      'https://www.flmluxuryrent.com/wp-content/uploads/2026/04/mercedes-benz-maybach-gls600-Gallery.webp',
      'https://www.flmluxuryrent.com/wp-content/uploads/2026/04/mercedes-benz-maybach-gls600-Gallery-1.webp',
      'https://www.flmluxuryrent.com/wp-content/uploads/2026/04/mercedes-benz-maybach-gls600-Gallery-2.webp',
      'https://www.flmluxuryrent.com/wp-content/uploads/2026/04/mercedes-benz-maybach-gls600-Gallery-3.webp',
    ],
    source: 'flm',
  },
  {
    slug: 'range-rover-vogue-l',
    brand: 'Range Rover', model: 'Vogue L', fullName: 'Range Rover Vogue L',
    categoryId: CAT.suv,
    pax: 7, hp: 350, topSpeedKmh: 234, transmission: 'auto', fuelType: 'hybrid', year: 2024,
    prices: fmtPrices(520), conditions: luxuryConditions(10000),
    descEn: 'Range Rover Vogue L, 350 hp, 234 km/h, 2024.',
    descFr: 'Range Rover Vogue L, 350 ch, 234 km/h, 2024.',
    bodyEn: bodyEn('Range Rover Vogue L'),
    bodyFr: bodyFrLong('Range Rover Vogue L', 7, 350, 234, 2024, 'Empattement long, 7 places, transmission integrale.'),
    images: [
      'https://www.flmluxuryrent.com/wp-content/uploads/2025/02/Range-Rover-Classic-LWB-detail1-1.webp',
      'https://www.flmluxuryrent.com/wp-content/uploads/2025/02/Range-Rover-Classic-LWB-detail2-1.webp',
      'https://www.flmluxuryrent.com/wp-content/uploads/2025/02/Range-Rover-Classic-LWB-detail3-1.webp',
      'https://www.flmluxuryrent.com/wp-content/uploads/2025/02/Range-Rover-Classic-LWB-detail5-1.webp',
      'https://www.flmluxuryrent.com/wp-content/uploads/2025/02/Range-Rover-Classic-LWB-detail6-1.webp',
    ],
    source: 'flm',
  },
  {
    slug: 'range-rover-sport',
    brand: 'Range Rover', model: 'Sport', fullName: 'Range Rover Sport',
    categoryId: CAT.suv,
    pax: 5, hp: 249, topSpeedKmh: 210, transmission: 'auto', fuelType: 'hybrid', year: 2024,
    prices: fmtPrices(370), conditions: suvConditions(8000),
    descEn: 'Range Rover Sport, 249 hp, 210 km/h, 2024.',
    descFr: 'Range Rover Sport, 249 ch, 210 km/h, 2024.',
    bodyEn: bodyEn('Range Rover Sport'),
    bodyFr: bodyFrLong('Range Rover Sport', 5, 249, 210, 2024, 'Mild hybrid, finition HSE.'),
    images: [
      'https://www.flmluxuryrent.com/wp-content/uploads/2025/02/Range-Rover-Sport-HSE-2024-detail51.webp',
      'https://www.flmluxuryrent.com/wp-content/uploads/2025/02/Range-Rover-Sport-HSE-2024-detail70.webp',
      'https://www.flmluxuryrent.com/wp-content/uploads/2025/02/range-detail53.webp',
      'https://www.flmluxuryrent.com/wp-content/uploads/2026/03/Range-Rover-Sport-HSE-2024-detail54-copia.webp',
      'https://www.flmluxuryrent.com/wp-content/uploads/2026/03/Range-Rover-Sport-HSE-2024-detail55-copia.webp',
      'https://www.flmluxuryrent.com/wp-content/uploads/2026/03/Range-Rover-Sport-HSE-2024-detail66-copia.webp',
    ],
    source: 'flm',
  },
  {
    slug: 'land-rover-defender-110',
    brand: 'Land Rover', model: 'Defender 110', fullName: 'Land Rover Defender 110',
    categoryId: CAT.suv,
    pax: 7, hp: 250, topSpeedKmh: 188, transmission: 'auto', fuelType: 'gasoline', year: 2026,
    prices: fmtPrices(370), conditions: suvConditions(7000),
    descEn: 'Land Rover Defender 110, 250 hp, 188 km/h, 2026.',
    descFr: 'Land Rover Defender 110, 250 ch, 188 km/h, 2026.',
    bodyEn: bodyEn('Land Rover Defender 110'),
    bodyFr: bodyFrLong('Land Rover Defender 110', 7, 250, 188, 2026, 'Finition X-Dynamic HSE, 7 places.'),
    images: [
      'https://www.flmluxuryrent.com/wp-content/uploads/2026/02/Land-Rover-Defender-110-Exclusive-HSE-2026-cover1-copia.webp',
      'https://www.flmluxuryrent.com/wp-content/uploads/2026/02/Land-Rover-Defender-110-Exclusive-HSE-2026detail1-copia.webp',
      'https://www.flmluxuryrent.com/wp-content/uploads/2026/02/Land-Rover-Defender-110-Exclusive-HSE-2026-detail-2-copia.webp',
      'https://www.flmluxuryrent.com/wp-content/uploads/2026/02/Land-Rover-Defender-110-Exclusive-HSE-2026-detail-3-copia.webp',
    ],
    source: 'flm',
  },
  // === FLM LUXURY VAN ===
  {
    slug: 'mercedes-classe-v',
    brand: 'Mercedes', model: 'Classe V', fullName: 'Mercedes Classe V',
    categoryId: CAT.sedan,
    pax: 8, hp: 190, topSpeedKmh: 209, transmission: 'auto', fuelType: 'diesel', year: 2024,
    prices: fmtPrices(300), conditions: vanConditions(3000),
    descEn: 'Mercedes Classe V, 8 seats, 2024.',
    descFr: 'Mercedes Classe V, 8 places, 2024.',
    bodyEn: bodyEn('Mercedes Classe V'),
    bodyFr: bodyFrLong('Mercedes Classe V', 8, 190, 209, 2024, 'Extralong 4Matic, transferts groupe et famille.'),
    images: [
      'https://www.flmluxuryrent.com/wp-content/uploads/2025/02/mercedes-classe-v-detail2.webp',
      'https://www.flmluxuryrent.com/wp-content/uploads/2025/02/mercedes-classe-v-detail3.webp',
      'https://www.flmluxuryrent.com/wp-content/uploads/2025/02/mercedes-classe-v-detail4.webp',
      'https://www.flmluxuryrent.com/wp-content/uploads/2026/02/mercedes-classe-v-detail5.webp',
      'https://www.flmluxuryrent.com/wp-content/uploads/2026/02/mercedes-classe-v-detail6.webp',
      'https://www.flmluxuryrent.com/wp-content/uploads/2026/02/mercedes-classe-v-detail7.webp',
    ],
    source: 'flm',
  },
  // === PERF-GT ===
  {
    slug: 'ferrari-12-cilindri',
    brand: 'Ferrari', model: '12 Cilindri', fullName: 'Ferrari 12 Cilindri',
    categoryId: CAT.supercar, badge: 'flagship',
    pax: 2, hp: 830, topSpeedKmh: 340, transmission: 'auto', fuelType: 'gasoline', year: 2025,
    prices: { oneToThreeDays: 4300, fourToSevenDays: 3910, weekPlus: 3520 },
    conditions: { minAge: 30, securityDeposit: 65000, minDays: 3, includedKmPerDay: 250, overageRatePerKm: 20 },
    descEn: 'Ferrari 12 Cilindri, 830 hp, 340 km/h, 2025.',
    descFr: 'Ferrari 12 Cilindri, 830 ch, 340 km/h, 2025.',
    bodyEn: bodyEn('Ferrari 12 Cilindri'),
    bodyFr: bodyFrLong('Ferrari 12 Cilindri', 2, 830, 340, 2025, 'V12 atmospherique, GT propulsion.'),
    images: [
      'https://www.performance-gt.com/assets/uploads/2026/03/Ferrari-12Cilindri-3-370x274.jpg',
      'https://www.performance-gt.com/assets/uploads/2026/03/Ferrari-12Cilindri-5-370x274.jpg',
      'https://www.performance-gt.com/assets/uploads/2026/03/Ferrari-12Cilindri-6-370x274.jpg',
    ],
    source: 'perfgt',
  },
  {
    slug: 'lamborghini-urus-performante',
    brand: 'Lamborghini', model: 'Urus Performante', fullName: 'Lamborghini Urus Performante',
    categoryId: CAT.suv, badge: 'flagship',
    pax: 5, hp: 666, topSpeedKmh: 306, transmission: 'auto', fuelType: 'gasoline', year: 2024,
    prices: { oneToThreeDays: 2000, fourToSevenDays: 1800, weekPlus: 1620 },
    conditions: { minAge: 30, securityDeposit: 25000, minDays: 2, includedKmPerDay: 250, overageRatePerKm: 8 },
    descEn: 'Lamborghini Urus Performante, 666 hp, 306 km/h, 2024.',
    descFr: 'Lamborghini Urus Performante, 666 ch, 306 km/h, 2024.',
    bodyEn: bodyEn('Lamborghini Urus Performante'),
    bodyFr: bodyFrLong('Lamborghini Urus Performante', 5, 666, 306, 2024, 'V8 biturbo allege, version sportive de l Urus.'),
    images: [
      'https://www.performance-gt.com/assets/uploads/2024/05/urus-performante-interieur-passager-370x247.jpg',
      'https://www.performance-gt.com/assets/uploads/2024/05/urus-performante-interieur-porte-370x247.jpg',
      'https://www.performance-gt.com/assets/uploads/2025/05/Urus-Performante-Dore-angle-av-370x247.jpg',
      'https://www.performance-gt.com/assets/uploads/2025/05/Urus-Performante-Dore-bas-de-caisse-370x247.jpg',
      'https://www.performance-gt.com/assets/uploads/2025/05/Urus-Performante-Dore-int-370x247.jpg',
      'https://www.performance-gt.com/assets/uploads/2025/05/Urus-Performante-Dore-int.-ar-370x247.jpg',
      'https://www.performance-gt.com/assets/uploads/2025/05/Urus-Performante-Dore-profil-370x247.jpg',
      'https://www.performance-gt.com/assets/uploads/2025/05/Urus-Performante-Dore-profil-ar-370x247.jpg',
      'https://www.performance-gt.com/assets/uploads/2025/05/Urus-Performante-Dore-profil-av-370x247.jpg',
      'https://www.performance-gt.com/assets/uploads/2025/05/Urus-Performante-Dore-siege-conducteur-370x247.jpg',
    ],
    source: 'perfgt',
  },
  {
    slug: 'land-rover-defender-octa',
    brand: 'Land Rover', model: 'Defender Octa', fullName: 'Land Rover Defender Octa',
    categoryId: CAT.suv, badge: 'flagship',
    pax: 5, hp: 635, topSpeedKmh: 250, transmission: 'auto', fuelType: 'gasoline', year: 2025,
    prices: { oneToThreeDays: 1150, fourToSevenDays: 1050, weekPlus: 950 },
    conditions: { minAge: 30, securityDeposit: 10000, minDays: 1, includedKmPerDay: 250, overageRatePerKm: 5 },
    descEn: 'Land Rover Defender Octa, 635 hp, 250 km/h, 2025.',
    descFr: 'Land Rover Defender Octa, 635 ch, 250 km/h, 2025.',
    bodyEn: bodyEn('Land Rover Defender Octa'),
    bodyFr: bodyFrLong('Land Rover Defender Octa', 5, 635, 250, 2025, 'V8 biturbo 4.4L, version sportive Edition One.'),
    images: [
      'https://www.performance-gt.com/assets/uploads/2026/03/Octa-1-370x269.png',
      'https://www.performance-gt.com/assets/uploads/2026/03/Octa-2-370x273.png',
      'https://www.performance-gt.com/assets/uploads/2026/03/Octa-3-370x226.png',
    ],
    source: 'perfgt',
  },
  {
    slug: 'rolls-royce-cullinan',
    brand: 'Rolls Royce', model: 'Cullinan', fullName: 'Rolls Royce Cullinan',
    categoryId: CAT.suv, badge: 'flagship',
    pax: 4, hp: 571, topSpeedKmh: 250, transmission: 'auto', fuelType: 'gasoline', year: 2024,
    prices: { oneToThreeDays: 3200, fourToSevenDays: 2880, weekPlus: 2560 },
    conditions: { minAge: 30, securityDeposit: 40000, minDays: 2, includedKmPerDay: 250, overageRatePerKm: 8 },
    descEn: 'Rolls Royce Cullinan, 571 hp, 250 km/h, 2024.',
    descFr: 'Rolls Royce Cullinan, 571 ch, 250 km/h, 2024.',
    bodyEn: bodyEn('Rolls Royce Cullinan'),
    bodyFr: bodyFrLong('Rolls Royce Cullinan', 4, 571, 250, 2024, 'V12 biturbo, SUV ultra-luxe.'),
    images: [
      'https://www.performance-gt.com/assets/uploads/2024/08/cullinan-avant-370x247.jpg',
      'https://www.performance-gt.com/assets/uploads/2024/08/cullinan-coffre-370x247.jpg',
      'https://www.performance-gt.com/assets/uploads/2024/08/cullinan-conducteur-volant-370x247.jpg',
      'https://www.performance-gt.com/assets/uploads/2024/08/cullinan-ecran-arriere-370x247.jpg',
      'https://www.performance-gt.com/assets/uploads/2024/08/cullinan-interieur-ar-2-370x247.jpg',
      'https://www.performance-gt.com/assets/uploads/2024/08/cullinan-interieur-porte-370x247.jpg',
      'https://www.performance-gt.com/assets/uploads/2024/08/cullinan-montre-370x247.jpg',
      'https://www.performance-gt.com/assets/uploads/2024/08/cullinan-portes-370x247.jpg',
      'https://www.performance-gt.com/assets/uploads/2024/08/cullinan-profil-370x247.jpg',
      'https://www.performance-gt.com/assets/uploads/2024/08/cullinan-profil-ar-370x247.jpg',
      'https://www.performance-gt.com/assets/uploads/2024/08/cullinan-profil-av-370x247.jpg',
      'https://www.performance-gt.com/assets/uploads/2024/08/cullinan-seuil-de-porte-370x247.jpg',
    ],
    source: 'perfgt',
  },
  {
    slug: 'mercedes-classe-e',
    brand: 'Mercedes', model: 'Classe E', fullName: 'Mercedes Classe E',
    categoryId: CAT.sedan,
    pax: 5, hp: 367, topSpeedKmh: 250, transmission: 'auto', fuelType: 'hybrid', year: 2024,
    prices: { oneToThreeDays: 310, fourToSevenDays: 280, weekPlus: 250 },
    conditions: { minAge: 25, securityDeposit: 2500, minDays: 1, includedKmPerDay: 250, overageRatePerKm: 1.10 },
    descEn: 'Mercedes Classe E, 367 hp, 250 km/h, 2024.',
    descFr: 'Mercedes Classe E, 367 ch, 250 km/h, 2024.',
    bodyEn: bodyEn('Mercedes Classe E'),
    bodyFr: bodyFrLong('Mercedes Classe E', 5, 367, 250, 2024, 'Six cylindres hybride, berline.'),
    images: [
      'https://www.performance-gt.com/assets/uploads/2025/05/mercedes-classe-E-1-370x247.jpg',
      'https://www.performance-gt.com/assets/uploads/2025/05/mercedes-classe-E-2-370x188.jpg',
    ],
    source: 'perfgt',
  },
  {
    slug: 'mercedes-classe-s',
    brand: 'Mercedes', model: 'Classe S', fullName: 'Mercedes Classe S',
    categoryId: CAT.sedan, badge: 'flagship',
    pax: 5, hp: 367, topSpeedKmh: 250, transmission: 'auto', fuelType: 'gasoline', year: 2024,
    prices: { oneToThreeDays: 715, fourToSevenDays: 655, weekPlus: 585 },
    conditions: { minAge: 30, securityDeposit: 4500, minDays: 1, includedKmPerDay: 250, overageRatePerKm: 2.60 },
    descEn: 'Mercedes Classe S, 367 hp, 250 km/h, 2024.',
    descFr: 'Mercedes Classe S, 367 ch, 250 km/h, 2024.',
    bodyEn: bodyEn('Mercedes Classe S'),
    bodyFr: bodyFrLong('Mercedes Classe S', 5, 367, 250, 2024, 'S 580 L, berline empattement long.'),
    images: [
      'https://www.performance-gt.com/assets/uploads/2024/05/IMG_1228-345x460.jpeg',
      'https://www.performance-gt.com/assets/uploads/2024/05/IMG_1229-345x460.jpeg',
      'https://www.performance-gt.com/assets/uploads/2024/05/IMG_1230-370x278.jpeg',
      'https://www.performance-gt.com/assets/uploads/2024/05/IMG_1232-345x460.jpeg',
      'https://www.performance-gt.com/assets/uploads/2024/05/IMG_1233-e1723014655217-370x352.jpeg',
    ],
    source: 'perfgt',
  },
  {
    slug: 'porsche-cayenne-coupe',
    brand: 'Porsche', model: 'Cayenne Coupé', fullName: 'Porsche Cayenne Coupé',
    categoryId: CAT.suv,
    pax: 5, hp: 474, topSpeedKmh: 269, transmission: 'auto', fuelType: 'gasoline', year: 2024,
    prices: { oneToThreeDays: 870, fourToSevenDays: 790, weekPlus: 710 },
    conditions: { minAge: 30, securityDeposit: 8500, minDays: 1, includedKmPerDay: 250, overageRatePerKm: 3.20 },
    descEn: 'Porsche Cayenne Coupé, 474 hp, 269 km/h, 2024.',
    descFr: 'Porsche Cayenne Coupé, 474 ch, 269 km/h, 2024.',
    bodyEn: bodyEn('Porsche Cayenne Coupé'),
    bodyFr: bodyFrLong('Porsche Cayenne Coupé', 5, 474, 269, 2024, 'V6 biturbo, SUV coupe.'),
    images: [
      'https://www.performance-gt.com/assets/uploads/2025/05/834716cd-411f-41ef-a9ea-e9ab3bb8fd7d-370x208.jpg',
      'https://www.performance-gt.com/assets/uploads/2025/05/cc14f128-eaf2-48a5-a52e-0bcc00e8c407-370x208.jpg',
    ],
    source: 'perfgt',
  },
  {
    slug: 'audi-rs3',
    brand: 'Audi', model: 'RS3', fullName: 'Audi RS3',
    categoryId: CAT.sport,
    pax: 5, hp: 400, topSpeedKmh: 290, transmission: 'auto', fuelType: 'gasoline', year: 2025,
    prices: { oneToThreeDays: 550, fourToSevenDays: 500, weekPlus: 450 },
    conditions: { minAge: 30, securityDeposit: 8500, minDays: 1, includedKmPerDay: 250, overageRatePerKm: 2.20 },
    descEn: 'Audi RS3, 400 hp, 290 km/h, 2025.',
    descFr: 'Audi RS3, 400 ch, 290 km/h, 2025.',
    bodyEn: bodyEn('Audi RS3'),
    bodyFr: bodyFrLong('Audi RS3', 5, 400, 290, 2025, '5 cylindres turbo, transmission quattro.'),
    images: [
      'https://www.performance-gt.com/assets/uploads/2025/03/RS3-profil-av-370x247.jpg',
      'https://www.performance-gt.com/assets/uploads/2025/03/RS3-profil-ar-370x247.jpg',
      'https://www.performance-gt.com/assets/uploads/2025/03/RS3-profil-370x247.jpg',
      'https://www.performance-gt.com/assets/uploads/2025/03/RS3-int-370x247.jpg',
      'https://www.performance-gt.com/assets/uploads/2025/03/RS3-siege-370x247.jpg',
    ],
    source: 'perfgt',
  },
  {
    slug: 'mini-cooper-s-cabriolet',
    brand: 'Mini', model: 'Cooper S Cabriolet', fullName: 'Mini Cooper S Cabriolet',
    categoryId: CAT.convertible,
    pax: 4, hp: 178, topSpeedKmh: 230, transmission: 'auto', fuelType: 'gasoline', year: 2024,
    prices: { oneToThreeDays: 310, fourToSevenDays: 280, weekPlus: 250 },
    conditions: { minAge: 25, securityDeposit: 1500, minDays: 1, includedKmPerDay: 250, overageRatePerKm: 1.10 },
    descEn: 'Mini Cooper S Cabriolet, 178 hp, 230 km/h, 2024.',
    descFr: 'Mini Cooper S Cabriolet, 178 ch, 230 km/h, 2024.',
    bodyEn: bodyEn('Mini Cooper S Cabriolet'),
    bodyFr: bodyFrLong('Mini Cooper S Cabriolet', 4, 178, 230, 2024, 'Cabriolet sportif compact.'),
    images: [
      'https://www.performance-gt.com/assets/uploads/2025/02/PerfGT_Mini-Cooper-02-copie-370x247.jpg',
      'https://www.performance-gt.com/assets/uploads/2025/02/PerfGT_Mini-Cooper-04-370x247.jpg',
      'https://www.performance-gt.com/assets/uploads/2025/02/PerfGT_Mini-Cooper-08-copie-370x247.jpg',
      'https://www.performance-gt.com/assets/uploads/2025/02/PerfGT_Mini-Cooper-13-370x247.jpg',
      'https://www.performance-gt.com/assets/uploads/2025/02/PerfGT_Mini-Cooper-16-370x247.jpg',
      'https://www.performance-gt.com/assets/uploads/2025/02/PerfGT_Mini-Cooper-17-370x247.jpg',
    ],
    source: 'perfgt',
  },
  {
    slug: 'volkswagen-golf-gti',
    brand: 'Volkswagen', model: 'Golf GTI', fullName: 'Volkswagen Golf GTI',
    categoryId: CAT.sport,
    pax: 5, hp: 245, topSpeedKmh: 250, transmission: 'auto', fuelType: 'gasoline', year: 2024,
    prices: { oneToThreeDays: 310, fourToSevenDays: 280, weekPlus: 250 },
    conditions: { minAge: 25, securityDeposit: 1500, minDays: 1, includedKmPerDay: 250, overageRatePerKm: 1.10 },
    descEn: 'Volkswagen Golf GTI, 245 hp, 250 km/h, 2024.',
    descFr: 'Volkswagen Golf GTI, 245 ch, 250 km/h, 2024.',
    bodyEn: bodyEn('Volkswagen Golf GTI'),
    bodyFr: bodyFrLong('Volkswagen Golf GTI', 5, 245, 250, 2024, '2.0L turbo, compacte sportive.'),
    images: [
      'https://www.performance-gt.com/assets/uploads/2025/05/a9df4d80-f643-454e-ad11-e8127a7e4210-370x235.jpg',
      'https://www.performance-gt.com/assets/uploads/2025/05/e1ff2c99-a65e-4c16-a6de-81ca6970f6ec-370x217.jpg',
    ],
    source: 'perfgt',
  },
  // === YASSINE EXCLUSIF ===
  {
    slug: 'ferrari-purosangue',
    brand: 'Ferrari', model: 'Purosangue', fullName: 'Ferrari Purosangue',
    categoryId: CAT.suv, badge: 'flagship',
    pax: 4, hp: 725, topSpeedKmh: 310, transmission: 'auto', fuelType: 'gasoline', year: 2025,
    prices: { oneToThreeDays: 3475, fourToSevenDays: 3243, weekPlus: 2919 },
    conditions: { minAge: 30, securityDeposit: 30000, minDays: 3, includedKmPerDay: 200, overageRatePerKm: 8 },
    descEn: 'Ferrari Purosangue, 725 hp, 310 km/h, 2025.',
    descFr: 'Ferrari Purosangue, 725 ch, 310 km/h, 2025.',
    bodyEn: bodyEn('Ferrari Purosangue'),
    bodyFr: bodyFrLong('Ferrari Purosangue', 4, 725, 310, 2025, 'V12 atmospherique, 0 a 100 en 3 secondes, premier SUV Ferrari.'),
    images: [
      'YASSINE:26-7-', 'YASSINE:25-6-', 'YASSINE:26-5-', 'YASSINE:26-6-',
      'YASSINE:26-8-', 'YASSINE:26-9-', 'YASSINE:27-1-', 'YASSINE:27',
    ],
    source: 'yassine',
  },
  {
    slug: 'land-rover-defender-bodykit',
    brand: 'Land Rover', model: 'Defender Bodykit', fullName: 'Land Rover Defender Bodykit',
    categoryId: CAT.suv, badge: 'flagship',
    pax: 5, hp: 525, topSpeedKmh: 240, transmission: 'auto', fuelType: 'gasoline', year: 2025,
    prices: { oneToThreeDays: 1200, fourToSevenDays: 1000, weekPlus: 850 },
    conditions: { minAge: 30, securityDeposit: 15000, minDays: 2, includedKmPerDay: 250, overageRatePerKm: 4 },
    descEn: 'Land Rover Defender Bodykit, 525 hp, 240 km/h, 2025.',
    descFr: 'Land Rover Defender Bodykit, 525 ch, 240 km/h, 2025.',
    bodyEn: bodyEn('Land Rover Defender Bodykit'),
    bodyFr: bodyFrLong('Land Rover Defender Bodykit', 5, 525, 240, 2025, 'Carrosserie elargie avec ecope et finitions sur mesure.'),
    images: [
      'YASSINE:27-6-', 'YASSINE:27-8-', 'YASSINE:27-9-',
      'YASSINE:28-7-', 'YASSINE:28-9-', 'YASSINE:28',
    ],
    source: 'yassine',
  },
];

// === DOWNLOAD ===

const RAW_DIR = '/Users/nayar/Desktop/misana-v2/fleet-raw';
const YASSINE_DIR = '/Users/nayar/Desktop/misana-v2/voiture yassine';

async function downloadAll() {
  for (const car of FLEET) {
    const dir = join(RAW_DIR, car.slug);
    await mkdir(dir, { recursive: true });
    for (let i = 0; i < car.images.length; i++) {
      const url = car.images[i];
      if (url.startsWith('YASSINE:')) continue; // copie locale ulterieure
      const ext = extname(new URL(url).pathname) || '.webp';
      const dest = join(dir, `${i.toString().padStart(2, '0')}${ext}`);
      if (existsSync(dest)) {
        process.stdout.write(`. ${car.slug}/${i.toString().padStart(2, '0')}${ext} (deja la)\n`);
        continue;
      }
      try {
        const res = await fetch(url);
        if (!res.ok) {
          console.log(`X ${car.slug}/${i.toString().padStart(2, '0')} HTTP ${res.status}`);
          continue;
        }
        const buf = Buffer.from(await res.arrayBuffer());
        await writeFile(dest, buf);
        console.log(`OK ${car.slug}/${i.toString().padStart(2, '0')}${ext} ${(buf.length / 1024).toFixed(0)} KB`);
      } catch (e: any) {
        console.log(`X ${car.slug}/${i.toString().padStart(2, '0')} ${e.message}`);
      }
    }
  }
}

const cmd = process.argv[2];
if (cmd === 'download') {
  downloadAll().catch((e) => { console.error(e); process.exit(1); });
} else {
  console.log(`Catalogue : ${FLEET.length} fiches`);
  console.log(`Sources : flm=${FLEET.filter((c) => c.source === 'flm').length}, perfgt=${FLEET.filter((c) => c.source === 'perfgt').length}, yassine=${FLEET.filter((c) => c.source === 'yassine').length}`);
  const totalImg = FLEET.reduce((s, c) => s + c.images.length, 0);
  console.log(`Images totales : ${totalImg}`);
}
