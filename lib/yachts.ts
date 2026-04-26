// Catalogue charter yacht Misana V1.
// Selection 4 yachts couvrant les 4 brackets de taille. Sources : Excellence
// Riviera. Structure complete : description longue, cabin detail, amenities,
// cruising areas, charter conditions.

import type { YachtSize } from '~/types/request';

export type YachtAmenity =
  | 'jacuzzi'
  | 'jet-ski'
  | 'seabob'
  | 'paddleboard'
  | 'kayak'
  | 'snorkeling'
  | 'scuba'
  | 'gym'
  | 'fly-bridge'
  | 'stabilizer'
  | 'wifi'
  | 'av-system'
  | 'tender'
  | 'water-toys';

export type YachtCabinConfig = {
  master: number;
  vip: number;
  double: number;
  twin: number;
  convertible: number;
};

export type Yacht = {
  id: string;
  name: string;
  builder: string;
  model: string;
  fullName: string;
  size: YachtSize;
  lengthM: number;
  cabins: number;
  cabinDetail: YachtCabinConfig;
  guests: number;
  crew: number;
  cruisingKnots: number;
  maxKnots: number;
  year: number;
  hero: string;
  images: string[];
  pricePerDay: number | null;
  pricePerWeekFrom: number;
  pricePerWeekTo: number | null;
  ports: string[];
  cruisingAreas: string[];
  amenities: YachtAmenity[];
  badge?: 'popular' | 'flagship';
  desc: string;
  descFr: string;
  bodyEn: string;
  bodyFr: string;
};

const RIVIERA_PORTS = ['cannes', 'monaco', 'saint-tropez'];
const STANDARD_CRUISING = ['french-riviera', 'corsica', 'sardinia'];

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
    cabinDetail: { master: 0, vip: 0, double: 2, twin: 1, convertible: 0 },
    guests: 6,
    crew: 1,
    cruisingKnots: 25,
    maxKnots: 35,
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
    ports: RIVIERA_PORTS,
    cruisingAreas: STANDARD_CRUISING,
    amenities: ['fly-bridge', 'stabilizer', 'seabob', 'snorkeling', 'scuba', 'water-toys'],
    desc: 'Day cruise along Pampelonne or Cap-Ferrat. Six guests, sport hull, twenty-five knots.',
    descFr: 'Journee Pampelonne ou Cap-Ferrat. Six personnes, coque sport, vingt-cinq nœuds.',
    bodyEn: 'M/Y Forza is the day-cruise reference of the coast. Twenty metres, six guests, three cabins, twenty-five knots cruising. The boat for a lunch off Pampelonne, an afternoon at Cap-Ferrat, a sunset return to Cannes. Light crew, fast turnaround, Sunseeker hull engineering.',
    bodyFr: 'M/Y Forza est la reference day-cruise de la cote. Vingt metres, six personnes, trois cabines, vingt-cinq nœuds en croisiere. Le bateau pour un dejeuner au large de Pampelonne, un apres-midi au Cap-Ferrat, un retour au coucher du soleil sur Cannes. Equipage leger, retournement rapide, ingenierie de coque Sunseeker.',
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
    cabinDetail: { master: 1, vip: 0, double: 3, twin: 0, convertible: 0 },
    guests: 8,
    crew: 4,
    cruisingKnots: 22,
    maxKnots: 29,
    year: 2023,
    hero: 'https://excellenceriviera.com/wp-content/uploads/2024/03/Yacht-Pause-Sanlorenzo-SL90-A-Featured-JPG.jpg',
    images: [
      'https://excellenceriviera.com/wp-content/uploads/2024/03/Yacht-Pause-Sanlorenzo-SL90-A-Featured-JPG.jpg',
      'https://excellenceriviera.com/wp-content/uploads/2024/03/Yacht-Pause-Sanlorenzo-SL90-A-1.png',
    ],
    pricePerDay: 12500,
    pricePerWeekFrom: 75000,
    pricePerWeekTo: 80000,
    ports: RIVIERA_PORTS,
    cruisingAreas: STANDARD_CRUISING,
    amenities: ['fly-bridge', 'jacuzzi', 'seabob', 'paddleboard', 'snorkeling', 'tender', 'water-toys', 'wifi'],
    badge: 'popular',
    desc: 'A weekend at sea, with cabins. Eight guests, four crew, modern Sanlorenzo lines.',
    descFr: 'Un weekend en mer, cabines a bord. Huit personnes, quatre equipage, lignes modernes Sanlorenzo.',
    bodyEn: 'M/Y Pause is the weekend reference. Twenty-eight metres, four cabins (one master, three doubles), eight guests, four crew. Modern Sanlorenzo lines, a fly bridge for a sunset apero, a jacuzzi on deck. Cruising at twenty-two knots, two days from Cannes to Saint-Tropez and back without rushing.',
    bodyFr: 'M/Y Pause est la reference du weekend. Vingt-huit metres, quatre cabines (un master, trois doubles), huit personnes, quatre equipage. Lignes modernes Sanlorenzo, un fly bridge pour un apero au coucher du soleil, un jacuzzi sur le pont. Croisiere a vingt-deux nœuds, deux jours de Cannes a Saint-Tropez aller-retour sans precipitation.',
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
    cabinDetail: { master: 1, vip: 2, double: 0, twin: 0, convertible: 2 },
    guests: 10,
    crew: 8,
    cruisingKnots: 12,
    maxKnots: 22,
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
    ports: RIVIERA_PORTS,
    cruisingAreas: STANDARD_CRUISING,
    amenities: ['fly-bridge', 'jacuzzi', 'jet-ski', 'seabob', 'paddleboard', 'kayak', 'snorkeling', 'scuba', 'gym', 'tender', 'av-system', 'wifi', 'water-toys'],
    desc: 'Mediterranean week. Forty metres, ten guests, crew of eight.',
    descFr: 'Semaine en Mediterranee. Quarante metres, dix personnes, equipage de huit.',
    bodyEn: 'M/Y Sonishi is the Mediterranean week classic. Forty metres, ten guests across one master and four further cabins, eight crew. Jet ski, seabob, paddle, scuba, gym. The boat that handles a Cannes-Portofino-Saint-Tropez loop without you noticing the transit.',
    bodyFr: 'M/Y Sonishi est le classique de la semaine en Mediterranee. Quarante metres, dix personnes en un master et quatre autres cabines, huit equipage. Jet ski, seabob, paddle, plongee, gym. Le bateau qui fait une boucle Cannes-Portofino-Saint-Tropez sans que vous remarquiez le transit.',
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
    cabinDetail: { master: 1, vip: 0, double: 3, twin: 2, convertible: 0 },
    guests: 12,
    crew: 13,
    cruisingKnots: 13,
    maxKnots: 15,
    year: 2017,
    hero: 'https://excellenceriviera.com/wp-content/uploads/2022/01/Yacht-Lili-Amels-Featured.jpg',
    images: [
      'https://excellenceriviera.com/wp-content/uploads/2022/01/Yacht-Lili-Amels-Featured.jpg',
      'https://excellenceriviera.com/wp-content/uploads/2022/01/Yacht-Lili-Amels-3.jpg',
    ],
    pricePerDay: 53350,
    pricePerWeekFrom: 320000,
    pricePerWeekTo: null,
    ports: RIVIERA_PORTS,
    cruisingAreas: STANDARD_CRUISING,
    amenities: ['jacuzzi', 'jet-ski', 'seabob', 'paddleboard', 'kayak', 'snorkeling', 'scuba', 'gym', 'tender', 'av-system', 'wifi', 'water-toys', 'stabilizer'],
    badge: 'flagship',
    desc: 'A floating maison. Fifty-five metres, twelve guests, master suite plus five cabins.',
    descFr: 'Une maison flottante. Cinquante-cinq metres, douze personnes, suite armateur plus cinq cabines.',
    bodyEn: 'M/Y Lili is the maison floating. Fifty-five metres, twelve guests across a master suite, three doubles and two twins, thirteen crew. Built by Amels, Holland, in 2017. Full water toys complement, gym, stabilisers, the discretion that comes with this length. Cruising the French Riviera, Corsica or Sardinia.',
    bodyFr: 'M/Y Lili est la maison flottante. Cinquante-cinq metres, douze personnes en une suite armateur, trois doubles et deux twins, treize equipage. Construite par Amels, Hollande, en 2017. Equipement complet de jouets aquatiques, gym, stabilisateurs, la discretion qui vient avec cette longueur. Croisiere Cote d\'Azur, Corse ou Sardaigne.',
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

// Builders disponibles dans la flotte (derive)
export function yachtBuilders(): string[] {
  const set = new Set<string>();
  for (const y of YACHTS) set.add(y.builder);
  return Array.from(set).sort();
}

// Toutes les amenities disponibles avec leurs labels i18n keys
export const YACHT_AMENITY_LABELS: Record<YachtAmenity, { en: string; fr: string }> = {
  'jacuzzi': { en: 'Jacuzzi', fr: 'Jacuzzi' },
  'jet-ski': { en: 'Jet ski', fr: 'Jet ski' },
  'seabob': { en: 'Seabob', fr: 'Seabob' },
  'paddleboard': { en: 'Paddleboard', fr: 'Paddleboard' },
  'kayak': { en: 'Kayak', fr: 'Kayak' },
  'snorkeling': { en: 'Snorkeling gear', fr: 'Equipement snorkeling' },
  'scuba': { en: 'Scuba diving gear', fr: 'Equipement plongee' },
  'gym': { en: 'Gym', fr: 'Gym' },
  'fly-bridge': { en: 'Fly bridge', fr: 'Fly bridge' },
  'stabilizer': { en: 'Stabilisers', fr: 'Stabilisateurs' },
  'wifi': { en: 'WiFi', fr: 'WiFi' },
  'av-system': { en: 'AV system', fr: 'Systeme AV' },
  'tender': { en: 'Tender', fr: 'Annexe' },
  'water-toys': { en: 'Water toys', fr: 'Jouets aquatiques' },
};

// Tranches de prix semaine (en EUR)
export const YACHT_PRICE_BUCKETS: { id: string; label: string; min: number; max: number }[] = [
  { id: 'under-50k', label: 'Up to €50,000', min: 0, max: 50000 },
  { id: '50k-100k', label: '€50,000 to €100,000', min: 50000, max: 100000 },
  { id: '100k-200k', label: '€100,000 to €200,000', min: 100000, max: 200000 },
  { id: '200k-plus', label: '€200,000 and more', min: 200000, max: 9999999 },
];
