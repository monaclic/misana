// Catalogue charter yacht Misana V1.
// Selection 4 yachts couvrant les 4 brackets de taille (15-20m, 20-30m,
// 30-50m, 50m+). Sources : Excellence Riviera (operateur premium Riviera).
// Tous bases sur la Cote d Azur, possibilite Corse/Sardaigne sur demande.

import type { YachtSize } from '~/types/request';

export type Yacht = {
  id: string;
  name: string;          // affiche en titre (M/Y FORZA, etc.)
  builder: string;       // Sunseeker, Sanlorenzo, Amels, etc.
  model: string;         // 65 Sport, SL90 A, 131, 180
  fullName: string;      // ex Sunseeker 65 Sport
  size: YachtSize;       // bracket
  lengthM: number;       // longueur en metres
  cabins: number;
  guests: number;
  crew: number;
  cruisingKnots: number;
  year: number;
  hero: string;
  images: string[];
  // prix indicatifs en EUR
  pricePerDay: number | null;
  pricePerWeekFrom: number;
  pricePerWeekTo: number | null;
  // ports possibles V1 = Riviera Misana (Cannes / Monaco / Saint-Tropez / Antibes)
  ports: string[];
  badge?: 'popular' | 'flagship';
  desc: string;
  descFr: string;
};

export const YACHTS: Yacht[] = [
  {
    id: 'forza-sunseeker-65',
    name: 'M/Y Forza',
    builder: 'Sunseeker',
    model: '65 Sport',
    fullName: 'Sunseeker 65 Sport · M/Y Forza',
    size: '15-20m',
    lengthM: 20.46,
    cabins: 3,
    guests: 6,
    crew: 1,
    cruisingKnots: 25,
    year: 2022,
    hero: 'https://excellenceriviera.com/wp-content/uploads/2024/04/Yacht-Forza-Sunseeker-65-Sport-1.jpg',
    images: [
      'https://excellenceriviera.com/wp-content/uploads/2024/04/Yacht-Forza-Sunseeker-65-Sport-1.jpg',
      'https://excellenceriviera.com/wp-content/uploads/2024/04/Yacht-Forza-Sunseeker-65-Sport-2.jpg',
      'https://excellenceriviera.com/wp-content/uploads/2024/04/Yacht-Forza-Sunseeker-65-Sport-3.jpg',
    ],
    pricePerDay: 4600,
    pricePerWeekFrom: 27600,
    pricePerWeekTo: 33600,
    ports: ['cannes', 'monaco', 'saint-tropez'],
    desc: 'Day cruise along Pampelonne or Cap-Ferrat. Six guests, sport hull, twenty-five knots.',
    descFr: 'Journee Pampelonne ou Cap-Ferrat. Six personnes, coque sport, vingt-cinq nœuds.',
  },
  {
    id: 'pause-sanlorenzo-sl90a',
    name: 'M/Y Pause',
    builder: 'Sanlorenzo',
    model: 'SL90 A',
    fullName: 'Sanlorenzo SL90 A · M/Y Pause',
    size: '20-30m',
    lengthM: 27.6,
    cabins: 4,
    guests: 8,
    crew: 4,
    cruisingKnots: 22,
    year: 2023,
    hero: 'https://excellenceriviera.com/wp-content/uploads/2024/03/Yacht-Pause-Sanlorenzo-SL90-A-Featured-JPG.jpg',
    images: [
      'https://excellenceriviera.com/wp-content/uploads/2024/03/Yacht-Pause-Sanlorenzo-SL90-A-Featured-JPG.jpg',
      'https://excellenceriviera.com/wp-content/uploads/2024/03/Yacht-Pause-Sanlorenzo-SL90-A-1.png',
    ],
    pricePerDay: 12500,
    pricePerWeekFrom: 75000,
    pricePerWeekTo: 80000,
    ports: ['cannes', 'monaco', 'saint-tropez'],
    badge: 'popular',
    desc: 'A weekend at sea, with cabins. Eight guests, four crew, modern Sanlorenzo lines.',
    descFr: 'Un weekend en mer, cabines a bord. Huit personnes, quatre equipage, lignes modernes Sanlorenzo.',
  },
  {
    id: 'sonishi-sunseeker-131',
    name: 'M/Y Sonishi',
    builder: 'Sunseeker',
    model: '131 Yacht',
    fullName: 'Sunseeker 131 · M/Y Sonishi',
    size: '30-50m',
    lengthM: 40,
    cabins: 5,
    guests: 10,
    crew: 8,
    cruisingKnots: 12,
    year: 2019,
    hero: 'https://excellenceriviera.com/wp-content/uploads/2022/02/Yacht-Sonishi-Sunkeeper-Featured.jpg',
    images: [
      'https://excellenceriviera.com/wp-content/uploads/2022/02/Yacht-Sonishi-Sunkeeper-Featured.jpg',
      'https://excellenceriviera.com/wp-content/uploads/2022/02/Yacht-Sonishi-Sunkeeper-1.jpg',
      'https://excellenceriviera.com/wp-content/uploads/2022/02/Yacht-Sonishi-Sunkeeper-12.jpg',
    ],
    pricePerDay: null,
    pricePerWeekFrom: 175000,
    pricePerWeekTo: 190000,
    ports: ['cannes', 'monaco', 'saint-tropez'],
    desc: 'Mediterranean week. Forty metres, ten guests, crew of eight.',
    descFr: 'Semaine en Mediterranee. Quarante metres, dix personnes, equipage de huit.',
  },
  {
    id: 'lili-amels-180',
    name: 'M/Y Lili',
    builder: 'Amels',
    model: '180',
    fullName: 'Amels 180 · M/Y Lili',
    size: '50m+',
    lengthM: 55,
    cabins: 6,
    guests: 12,
    crew: 13,
    cruisingKnots: 13,
    year: 2017,
    hero: 'https://excellenceriviera.com/wp-content/uploads/2022/01/Yacht-Lili-Amels-Featured.jpg',
    images: [
      'https://excellenceriviera.com/wp-content/uploads/2022/01/Yacht-Lili-Amels-Featured.jpg',
      'https://excellenceriviera.com/wp-content/uploads/2022/01/Yacht-Lili-Amels-3.jpg',
    ],
    pricePerDay: 53350,
    pricePerWeekFrom: 320000,
    pricePerWeekTo: null,
    ports: ['cannes', 'monaco', 'saint-tropez'],
    badge: 'flagship',
    desc: 'A floating maison. Fifty-five metres, twelve guests, master suite plus five cabins.',
    descFr: 'Une maison flottante. Cinquante-cinq metres, douze personnes, suite armateur plus cinq cabines.',
  },
];

export function findYachtById(id: string | undefined) {
  if (!id) return undefined;
  return YACHTS.find((y) => y.id === id);
}

export function yachtsBySize(size: YachtSize) {
  return YACHTS.filter((y) => y.size === size);
}

export function yachtsByPort(port: string) {
  return YACHTS.filter((y) => y.ports.includes(port));
}
