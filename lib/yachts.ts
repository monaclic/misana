// Catalogue charter yacht Misana V1.
// 50+ unites couvrant 4 brackets de taille, motor / sailing / catamaran.
// Fourchette principale 3-15k EUR / jour, quelques flagships 25k+ pour
// montrer la profondeur de gamme. Sources: Excellence Riviera et autres
// brokers Riviera. Images V1 cyclees sur les heros existants Excellence,
// remplacees par photo dediee a la livraison editoriale.

import type { YachtSize } from '~/types/request';

export type YachtType = 'motor' | 'sail' | 'catamaran';

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
  type: YachtType;
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

// Pool d images V1 (Excellence Riviera). Cyclees sur les fiches non flagships.
const IMG_POOL = [
  'https://excellenceriviera.com/wp-content/uploads/2024/04/Yacht-Forza-Sunseeker-65-Sport-1.jpg',
  'https://excellenceriviera.com/wp-content/uploads/2024/04/Yacht-Forza-Sunseeker-65-Sport-2.jpg',
  'https://excellenceriviera.com/wp-content/uploads/2024/04/Yacht-Forza-Sunseeker-65-Sport-3.jpg',
  'https://excellenceriviera.com/wp-content/uploads/2024/03/Yacht-Pause-Sanlorenzo-SL90-A-Featured-JPG.jpg',
  'https://excellenceriviera.com/wp-content/uploads/2024/03/Yacht-Pause-Sanlorenzo-SL90-A-1.png',
  'https://excellenceriviera.com/wp-content/uploads/2022/02/Yacht-Sonishi-Sunkeeper-Featured.jpg',
  'https://excellenceriviera.com/wp-content/uploads/2022/02/Yacht-Sonishi-Sunkeeper-1.jpg',
  'https://excellenceriviera.com/wp-content/uploads/2022/02/Yacht-Sonishi-Sunkeeper-12.jpg',
  'https://excellenceriviera.com/wp-content/uploads/2022/01/Yacht-Lili-Amels-Featured.jpg',
  'https://excellenceriviera.com/wp-content/uploads/2022/01/Yacht-Lili-Amels-3.jpg',
];

function pickImages(seed: number, count = 3): { hero: string; images: string[] } {
  const start = seed % IMG_POOL.length;
  const arr = [];
  for (let i = 0; i < count; i++) arr.push(IMG_POOL[(start + i) % IMG_POOL.length]);
  return { hero: arr[0], images: arr };
}

function bracketFor(lengthM: number): YachtSize {
  if (lengthM < 20) return '15-20m';
  if (lengthM < 30) return '20-30m';
  if (lengthM < 50) return '30-50m';
  return '50m+';
}

// Builder helper: synthese d une fiche yacht standard avec defaults par type.
type YachtBuild = {
  id: string;
  name: string;
  builder: string;
  model: string;
  type: YachtType;
  lengthM: number;
  guests: number;
  cabins: number;
  crew: number;
  master?: number;
  vip?: number;
  double?: number;
  twin?: number;
  convertible?: number;
  cruisingKnots: number;
  maxKnots: number;
  year: number;
  pricePerDay: number | null;
  pricePerWeekFrom: number;
  pricePerWeekTo?: number | null;
  amenities: YachtAmenity[];
  badge?: 'popular' | 'flagship';
  imgSeed: number;
  desc: string;
  descFr: string;
  bodyEn: string;
  bodyFr: string;
};

function build(b: YachtBuild): Yacht {
  const { hero, images } = pickImages(b.imgSeed, b.type === 'motor' && b.lengthM > 30 ? 3 : 2);
  return {
    id: b.id,
    name: b.name,
    builder: b.builder,
    model: b.model,
    fullName: `${b.builder} ${b.model} · ${b.name}`,
    type: b.type,
    size: bracketFor(b.lengthM),
    lengthM: b.lengthM,
    cabins: b.cabins,
    cabinDetail: {
      master: b.master ?? 0,
      vip: b.vip ?? 0,
      double: b.double ?? 0,
      twin: b.twin ?? 0,
      convertible: b.convertible ?? 0,
    },
    guests: b.guests,
    crew: b.crew,
    cruisingKnots: b.cruisingKnots,
    maxKnots: b.maxKnots,
    year: b.year,
    hero,
    images,
    pricePerDay: b.pricePerDay,
    pricePerWeekFrom: b.pricePerWeekFrom,
    pricePerWeekTo: b.pricePerWeekTo ?? null,
    ports: RIVIERA_PORTS,
    cruisingAreas: STANDARD_CRUISING,
    amenities: b.amenities,
    badge: b.badge,
    desc: b.desc,
    descFr: b.descFr,
    bodyEn: b.bodyEn,
    bodyFr: b.bodyFr,
  };
}

// Amenities presets par taille / type
const AMEN_DAY: YachtAmenity[] = ['fly-bridge', 'snorkeling', 'water-toys', 'wifi'];
const AMEN_WEEK_M: YachtAmenity[] = ['fly-bridge', 'jacuzzi', 'seabob', 'paddleboard', 'snorkeling', 'tender', 'water-toys', 'wifi'];
const AMEN_LARGE: YachtAmenity[] = ['fly-bridge', 'jacuzzi', 'jet-ski', 'seabob', 'paddleboard', 'kayak', 'snorkeling', 'scuba', 'gym', 'tender', 'av-system', 'wifi', 'water-toys'];
const AMEN_FLAGSHIP: YachtAmenity[] = ['jacuzzi', 'jet-ski', 'seabob', 'paddleboard', 'kayak', 'snorkeling', 'scuba', 'gym', 'tender', 'av-system', 'wifi', 'water-toys', 'stabilizer'];
const AMEN_SAIL: YachtAmenity[] = ['snorkeling', 'paddleboard', 'tender', 'wifi', 'water-toys'];
const AMEN_CAT: YachtAmenity[] = ['snorkeling', 'paddleboard', 'kayak', 'tender', 'wifi', 'water-toys', 'av-system'];

export const YACHTS: Yacht[] = [
  // ============================================================
  // 15-20m MOTOR (day cruise / weekend leger) 4-7k EUR/jour
  // ============================================================
  build({
    id: 'forza-sunseeker-65', name: 'M/Y Forza', builder: 'Sunseeker', model: '65 Sport',
    type: 'motor', lengthM: 20.46, guests: 6, cabins: 3, crew: 1, double: 2, twin: 1,
    cruisingKnots: 25, maxKnots: 35, year: 2022,
    pricePerDay: 4600, pricePerWeekFrom: 27600, pricePerWeekTo: 33600,
    amenities: ['fly-bridge', 'stabilizer', 'seabob', 'snorkeling', 'scuba', 'water-toys'],
    imgSeed: 0,
    desc: 'Day cruise along Pampelonne or Cap-Ferrat. Six guests, sport hull, twenty-five knots.',
    descFr: 'Journee Pampelonne ou Cap-Ferrat. Six personnes, coque sport, vingt-cinq nœuds.',
    bodyEn: 'M/Y Forza is the day-cruise reference of the coast. Twenty metres, six guests, three cabins, twenty-five knots cruising. The boat for a lunch off Pampelonne, an afternoon at Cap-Ferrat, a sunset return to Cannes.',
    bodyFr: 'M/Y Forza est la reference day-cruise de la cote. Vingt metres, six personnes, trois cabines, vingt-cinq nœuds en croisiere. Le bateau pour un dejeuner au large de Pampelonne, un apres-midi au Cap-Ferrat, un retour au coucher du soleil sur Cannes.',
  }),
  build({
    id: 'azura-pershing-5x', name: 'M/Y Azura', builder: 'Pershing', model: '5X',
    type: 'motor', lengthM: 16.8, guests: 6, cabins: 2, crew: 1, master: 1, double: 1,
    cruisingKnots: 33, maxKnots: 42, year: 2023,
    pricePerDay: 4200, pricePerWeekFrom: 25000, pricePerWeekTo: 28000,
    amenities: AMEN_DAY, imgSeed: 1,
    desc: 'Sport day-cruise. Pershing lines, fast turnaround, sixteen metres.',
    descFr: 'Day-cruise sport. Lignes Pershing, retournement rapide, seize metres.',
    bodyEn: 'M/Y Azura is the sport reference for a day on the coast. Sixteen metres, two cabins, six guests, thirty-three knots cruising. Pershing carbon trim, planing hull, the boat that handles Cannes to Saint-Tropez before lunch.',
    bodyFr: 'M/Y Azura est la reference sport pour une journee sur la cote. Seize metres, deux cabines, six personnes, trente-trois nœuds en croisiere. Carbone Pershing, coque planante, le bateau qui rejoint Saint-Tropez avant midi.',
  }),
  build({
    id: 'sirena-azimut-55', name: 'M/Y Sirena', builder: 'Azimut', model: '55 Fly',
    type: 'motor', lengthM: 17.2, guests: 8, cabins: 3, crew: 2, master: 1, double: 1, twin: 1,
    cruisingKnots: 24, maxKnots: 30, year: 2022,
    pricePerDay: 3800, pricePerWeekFrom: 22800, pricePerWeekTo: 26500,
    amenities: AMEN_DAY, imgSeed: 2,
    desc: 'Family day-cruise. Three cabins, fly bridge, gentle on the wallet.',
    descFr: 'Day-cruise famille. Trois cabines, fly bridge, raisonnable.',
    bodyEn: 'M/Y Sirena is the entry into the family day-cruise. Seventeen metres, three cabins, eight guests, twenty-four knots. Fly bridge, comfortable saloon, sensible price for a Saturday off Pampelonne or Cap-Ferrat.',
    bodyFr: 'M/Y Sirena est l entree dans le day-cruise familial. Dix-sept metres, trois cabines, huit personnes, vingt-quatre nœuds. Fly bridge, salon confortable, prix raisonnable pour un samedi devant Pampelonne ou Cap-Ferrat.',
  }),
  build({
    id: 'aurora-princess-58', name: 'M/Y Aurora', builder: 'Princess', model: '58 Fly',
    type: 'motor', lengthM: 18, guests: 8, cabins: 3, crew: 2, master: 1, double: 2,
    cruisingKnots: 26, maxKnots: 32, year: 2024,
    pricePerDay: 4500, pricePerWeekFrom: 27000, pricePerWeekTo: 31000,
    amenities: ['fly-bridge', 'jacuzzi', 'snorkeling', 'tender', 'wifi', 'water-toys'],
    imgSeed: 3,
    desc: 'Princess fly bridge, eighteen metres, three cabins. The classic.',
    descFr: 'Fly bridge Princess, dix-huit metres, trois cabines. Le classique.',
    bodyEn: 'M/Y Aurora is the Princess classic on the Riviera. Eighteen metres, three cabins, eight guests, twenty-six knots cruising. The boat that handles a long weekend Cannes-Saint-Tropez-Porquerolles without complication.',
    bodyFr: 'M/Y Aurora est le classique Princess sur la Riviera. Dix-huit metres, trois cabines, huit personnes, vingt-six nœuds en croisiere. Le bateau qui fait un long weekend Cannes-Saint-Tropez-Porquerolles sans complication.',
  }),
  build({
    id: 'maverick-sunseeker-predator', name: 'M/Y Maverick', builder: 'Sunseeker', model: 'Predator 60',
    type: 'motor', lengthM: 18.7, guests: 8, cabins: 3, crew: 1, double: 3,
    cruisingKnots: 32, maxKnots: 42, year: 2023,
    pricePerDay: 5200, pricePerWeekFrom: 31000, pricePerWeekTo: 35000,
    amenities: AMEN_DAY, imgSeed: 4,
    desc: 'Open sport. Predator hull, forty-two knots top, three cabins.',
    descFr: 'Sport ouvert. Coque Predator, quarante-deux nœuds top, trois cabines.',
    bodyEn: 'M/Y Maverick is the open sport reference. Eighteen metres, three cabins, eight guests, thirty-two knots cruising. Predator hull engineering, the boat that arrives first at Club 55.',
    bodyFr: 'M/Y Maverick est la reference sport ouvert. Dix-huit metres, trois cabines, huit personnes, trente-deux nœuds en croisiere. Ingenierie Predator, le bateau qui arrive le premier au Club 55.',
  }),
  build({
    id: 'oceane-ferretti-580', name: 'M/Y Oceane', builder: 'Ferretti', model: '580',
    type: 'motor', lengthM: 17.6, guests: 8, cabins: 3, crew: 2, master: 1, double: 1, twin: 1,
    cruisingKnots: 26, maxKnots: 31, year: 2023,
    pricePerDay: 4400, pricePerWeekFrom: 26400, pricePerWeekTo: 29800,
    amenities: AMEN_DAY, imgSeed: 5,
    desc: 'Italian comfort. Ferretti lines, three cabins, fly.',
    descFr: 'Confort italien. Lignes Ferretti, trois cabines, fly.',
    bodyEn: 'M/Y Oceane is the Ferretti family cruiser. Seventeen metres, three cabins, eight guests. Italian fit, master suite forward, fly bridge with bar. The Cannes-Antibes-Saint-Tropez weekend.',
    bodyFr: 'M/Y Oceane est le family cruiser Ferretti. Dix-sept metres, trois cabines, huit personnes. Finitions italiennes, suite armateur a l avant, fly bridge avec bar. Le weekend Cannes-Antibes-Saint-Tropez.',
  }),
  build({
    id: 'lyra-riva-66', name: 'M/Y Lyra', builder: 'Riva', model: '66 Ribelle',
    type: 'motor', lengthM: 20.2, guests: 6, cabins: 3, crew: 2, master: 1, double: 1, twin: 1,
    cruisingKnots: 30, maxKnots: 38, year: 2022,
    pricePerDay: 6800, pricePerWeekFrom: 41000, pricePerWeekTo: 46000,
    amenities: AMEN_WEEK_M, imgSeed: 6,
    desc: 'Riva. Twenty metres of mahogany lacquer, six guests, thirty knots.',
    descFr: 'Riva. Vingt metres de laque acajou, six personnes, trente nœuds.',
    bodyEn: 'M/Y Lyra is Riva. Twenty metres, three cabins, six guests, thirty knots cruising. The boat that closes the conversation in any port. Mahogany lacquer, the lines, the silence at speed.',
    bodyFr: 'M/Y Lyra est une Riva. Vingt metres, trois cabines, six personnes, trente nœuds en croisiere. Le bateau qui clot la conversation dans n importe quel port. Laque acajou, les lignes, le silence a vitesse.',
  }),
  build({
    id: 'celeste-mangusta-104', name: 'M/Y Celeste', builder: 'Mangusta', model: '104 Rev',
    type: 'motor', lengthM: 19.8, guests: 8, cabins: 4, crew: 3, master: 1, vip: 1, double: 2,
    cruisingKnots: 28, maxKnots: 36, year: 2023,
    pricePerDay: 5500, pricePerWeekFrom: 33000, pricePerWeekTo: 38000,
    amenities: AMEN_WEEK_M, imgSeed: 7,
    desc: 'Mangusta open. Four cabins, twenty metres, twenty-eight knots cruising.',
    descFr: 'Mangusta ouvert. Quatre cabines, vingt metres, vingt-huit nœuds en croisiere.',
    bodyEn: 'M/Y Celeste is the Mangusta open reference. Twenty metres, four cabins, eight guests. The boat for a weekend at sea, fast hull, Italian carbon trim, full water toys.',
    bodyFr: 'M/Y Celeste est la reference Mangusta ouvert. Vingt metres, quatre cabines, huit personnes. Le bateau pour un weekend en mer, coque rapide, carbone italien, jouets aquatiques complets.',
  }),

  // ============================================================
  // 20-30m MOTOR (weekend / charter semaine) 6-15k EUR/jour
  // ============================================================
  build({
    id: 'pause-sanlorenzo-sl90a', name: 'M/Y Pause', builder: 'Sanlorenzo', model: 'SL90 A',
    type: 'motor', lengthM: 27.6, guests: 8, cabins: 4, crew: 4, master: 1, double: 3,
    cruisingKnots: 22, maxKnots: 29, year: 2023,
    pricePerDay: 12500, pricePerWeekFrom: 75000, pricePerWeekTo: 80000,
    amenities: ['fly-bridge', 'jacuzzi', 'seabob', 'paddleboard', 'snorkeling', 'tender', 'water-toys', 'wifi'],
    badge: 'popular', imgSeed: 3,
    desc: 'A weekend at sea, with cabins. Eight guests, four crew, modern Sanlorenzo lines.',
    descFr: 'Un weekend en mer, cabines a bord. Huit personnes, quatre equipage, lignes modernes Sanlorenzo.',
    bodyEn: 'M/Y Pause is the weekend reference. Twenty-eight metres, four cabins (one master, three doubles), eight guests, four crew. Modern Sanlorenzo lines, a fly bridge for a sunset apero, a jacuzzi on deck.',
    bodyFr: 'M/Y Pause est la reference du weekend. Vingt-huit metres, quatre cabines (un master, trois doubles), huit personnes, quatre equipage. Lignes modernes Sanlorenzo, un fly bridge pour un apero au coucher du soleil, un jacuzzi sur le pont.',
  }),
  build({
    id: 'mistral-azimut-78', name: 'M/Y Mistral', builder: 'Azimut', model: '78 Fly',
    type: 'motor', lengthM: 23.2, guests: 8, cabins: 4, crew: 3, master: 1, vip: 1, double: 2,
    cruisingKnots: 24, maxKnots: 30, year: 2023,
    pricePerDay: 8500, pricePerWeekFrom: 51000, pricePerWeekTo: 57000,
    amenities: AMEN_WEEK_M, imgSeed: 4,
    desc: 'Twenty-three metres, four cabins, weekend or week without rushing.',
    descFr: 'Vingt-trois metres, quatre cabines, weekend ou semaine sans precipitation.',
    bodyEn: 'M/Y Mistral is the easy weekend yacht. Twenty-three metres, four cabins, eight guests, three crew. Comfortable saloon, fly bridge bar, the right balance of price and presence.',
    bodyFr: 'M/Y Mistral est le weekend facile. Vingt-trois metres, quatre cabines, huit personnes, trois equipage. Salon confortable, bar du fly bridge, le bon equilibre entre prix et presence.',
  }),
  build({
    id: 'serenita-ferretti-720', name: 'M/Y Serenita', builder: 'Ferretti', model: '720',
    type: 'motor', lengthM: 22, guests: 8, cabins: 4, crew: 3, master: 1, double: 2, twin: 1,
    cruisingKnots: 24, maxKnots: 30, year: 2024,
    pricePerDay: 9200, pricePerWeekFrom: 55000, pricePerWeekTo: 60000,
    amenities: AMEN_WEEK_M, imgSeed: 5,
    desc: 'Ferretti 72, the family week. Four cabins, fly bridge, dinette.',
    descFr: 'Ferretti 72, semaine familiale. Quatre cabines, fly bridge, dinette.',
    bodyEn: 'M/Y Serenita is the family week. Twenty-two metres, four cabins, eight guests, three crew. Italian fit, full water toys, the right boat for Cannes-Saint-Tropez-Porquerolles in a leisurely week.',
    bodyFr: 'M/Y Serenita est la semaine familiale. Vingt-deux metres, quatre cabines, huit personnes, trois equipage. Finitions italiennes, jouets aquatiques complets, le bon bateau pour Cannes-Saint-Tropez-Porquerolles dans une semaine tranquille.',
  }),
  build({
    id: 'orion-princess-y85', name: 'M/Y Orion', builder: 'Princess', model: 'Y85',
    type: 'motor', lengthM: 26.4, guests: 8, cabins: 4, crew: 4, master: 1, vip: 1, double: 1, twin: 1,
    cruisingKnots: 23, maxKnots: 28, year: 2023,
    pricePerDay: 11000, pricePerWeekFrom: 66000, pricePerWeekTo: 72000,
    amenities: AMEN_WEEK_M, imgSeed: 6,
    desc: 'Princess Y85. Twenty-six metres, four cabins, four crew. Solid week.',
    descFr: 'Princess Y85. Vingt-six metres, quatre cabines, quatre equipage. Semaine solide.',
    bodyEn: 'M/Y Orion is the solid Princess week. Twenty-six metres, four cabins, eight guests, four crew. Master forward, full beam, the boat that handles a Riviera-Corsica week without missing a beat.',
    bodyFr: 'M/Y Orion est la semaine solide Princess. Vingt-six metres, quatre cabines, huit personnes, quatre equipage. Master a l avant, pleine largeur, le bateau qui fait une semaine Riviera-Corse sans faillir.',
  }),
  build({
    id: 'aria-pershing-9x', name: 'M/Y Aria', builder: 'Pershing', model: '9X',
    type: 'motor', lengthM: 28, guests: 8, cabins: 4, crew: 4, master: 1, vip: 1, double: 2,
    cruisingKnots: 38, maxKnots: 48, year: 2024,
    pricePerDay: 13500, pricePerWeekFrom: 81000, pricePerWeekTo: 88000,
    amenities: AMEN_WEEK_M, imgSeed: 7,
    desc: 'Pershing 9X. Twenty-eight metres, forty-eight knots top, carbon trim.',
    descFr: 'Pershing 9X. Vingt-huit metres, quarante-huit nœuds top, finitions carbone.',
    bodyEn: 'M/Y Aria is the speed week. Twenty-eight metres, four cabins, eight guests, four crew, forty-eight knots top. The Pershing carbon hull, the silence at thirty-eight knots, the boat that closes any debate.',
    bodyFr: 'M/Y Aria est la semaine vitesse. Vingt-huit metres, quatre cabines, huit personnes, quatre equipage, quarante-huit nœuds top. Coque carbone Pershing, le silence a trente-huit nœuds, le bateau qui clot tout debat.',
  }),
  build({
    id: 'cassiopee-sunseeker-90', name: 'M/Y Cassiopee', builder: 'Sunseeker', model: '90 Ocean',
    type: 'motor', lengthM: 27.5, guests: 8, cabins: 4, crew: 4, master: 1, vip: 1, double: 2,
    cruisingKnots: 24, maxKnots: 31, year: 2023,
    pricePerDay: 11800, pricePerWeekFrom: 71000, pricePerWeekTo: 78000,
    amenities: AMEN_WEEK_M, imgSeed: 8,
    desc: 'Sunseeker 90. Twenty-seven metres, master suite, fly bridge with jacuzzi.',
    descFr: 'Sunseeker 90. Vingt-sept metres, suite armateur, fly bridge avec jacuzzi.',
    bodyEn: 'M/Y Cassiopee is the comfortable week. Twenty-seven metres, four cabins, eight guests, four crew. Sunseeker engineering, master suite full beam, fly bridge with jacuzzi and bar.',
    bodyFr: 'M/Y Cassiopee est la semaine confortable. Vingt-sept metres, quatre cabines, huit personnes, quatre equipage. Ingenierie Sunseeker, suite armateur pleine largeur, fly bridge avec jacuzzi et bar.',
  }),
  build({
    id: 'volta-sanlorenzo-sx76', name: 'M/Y Volta', builder: 'Sanlorenzo', model: 'SX76',
    type: 'motor', lengthM: 23.2, guests: 8, cabins: 4, crew: 3, master: 1, double: 3,
    cruisingKnots: 21, maxKnots: 26, year: 2024,
    pricePerDay: 8800, pricePerWeekFrom: 53000, pricePerWeekTo: 58000,
    amenities: AMEN_WEEK_M, imgSeed: 9,
    desc: 'Crossover. Open beach club, large saloon, glass walls.',
    descFr: 'Crossover. Beach club ouvert, grand salon, parois vitrees.',
    bodyEn: 'M/Y Volta is the crossover. Twenty-three metres, four cabins, eight guests, three crew. Sanlorenzo SX series, beach club ouvert, glass walls, the boat that lives at anchor as much as cruising.',
    bodyFr: 'M/Y Volta est le crossover. Vingt-trois metres, quatre cabines, huit personnes, trois equipage. Serie SX Sanlorenzo, beach club ouvert, parois vitrees, le bateau qui vit autant au mouillage qu en navigation.',
  }),
  build({
    id: 'helios-azimut-grande-26m', name: 'M/Y Helios', builder: 'Azimut', model: 'Grande 26M',
    type: 'motor', lengthM: 25.9, guests: 10, cabins: 5, crew: 4, master: 1, vip: 1, double: 2, twin: 1,
    cruisingKnots: 23, maxKnots: 28, year: 2023,
    pricePerDay: 11200, pricePerWeekFrom: 67000, pricePerWeekTo: 74000,
    amenities: AMEN_WEEK_M, imgSeed: 0,
    desc: 'Grande 26M. Five cabins, ten guests, full beam master.',
    descFr: 'Grande 26M. Cinq cabines, dix personnes, master pleine largeur.',
    bodyEn: 'M/Y Helios is the ten-guest reference under thirty metres. Twenty-six metres, five cabins, four crew. Master full beam on the main deck, the boat for two families on a Riviera-Corsica week.',
    bodyFr: 'M/Y Helios est la reference dix personnes sous trente metres. Vingt-six metres, cinq cabines, quatre equipage. Master pleine largeur sur le pont principal, le bateau pour deux familles sur une semaine Riviera-Corse.',
  }),
  build({
    id: 'eden-princess-x95', name: 'M/Y Eden', builder: 'Princess', model: 'X95',
    type: 'motor', lengthM: 28.8, guests: 10, cabins: 5, crew: 5, master: 1, vip: 1, double: 2, twin: 1,
    cruisingKnots: 22, maxKnots: 26, year: 2024,
    pricePerDay: 14500, pricePerWeekFrom: 87000, pricePerWeekTo: 95000,
    amenities: AMEN_LARGE, imgSeed: 1,
    desc: 'Princess X95. Tri-deck under thirty, five cabins, panoramic.',
    descFr: 'Princess X95. Tri-pont sous trente metres, cinq cabines, panoramique.',
    bodyEn: 'M/Y Eden is the Princess flagship of the X-series. Twenty-eight metres, five cabins, ten guests, five crew. Tri-deck, panoramic glass, full beam master, the boat that brings space and quiet to a long week.',
    bodyFr: 'M/Y Eden est le flagship Princess de la serie X. Vingt-huit metres, cinq cabines, dix personnes, cinq equipage. Tri-pont, vitrage panoramique, master pleine largeur, le bateau qui apporte espace et silence sur une longue semaine.',
  }),
  build({
    id: 'argo-pershing-8x', name: 'M/Y Argo', builder: 'Pershing', model: '8X',
    type: 'motor', lengthM: 25.5, guests: 8, cabins: 4, crew: 3, master: 1, vip: 1, double: 2,
    cruisingKnots: 38, maxKnots: 47, year: 2023,
    pricePerDay: 11500, pricePerWeekFrom: 69000, pricePerWeekTo: 75000,
    amenities: AMEN_WEEK_M, imgSeed: 2,
    desc: 'Pershing 8X. Twenty-five metres, forty-seven knots, four cabins.',
    descFr: 'Pershing 8X. Vingt-cinq metres, quarante-sept nœuds, quatre cabines.',
    bodyEn: 'M/Y Argo is Pershing in the smaller size. Twenty-five metres, four cabins, eight guests, three crew, forty-seven knots. The boat that does a return Saint-Tropez-Portofino in a long day.',
    bodyFr: 'M/Y Argo est la Pershing en taille reduite. Vingt-cinq metres, quatre cabines, huit personnes, trois equipage, quarante-sept nœuds. Le bateau qui fait un aller-retour Saint-Tropez-Portofino dans une longue journee.',
  }),
  build({
    id: 'iris-sanlorenzo-sl78', name: 'M/Y Iris', builder: 'Sanlorenzo', model: 'SL78',
    type: 'motor', lengthM: 23.9, guests: 8, cabins: 4, crew: 4, master: 1, vip: 1, double: 2,
    cruisingKnots: 24, maxKnots: 30, year: 2022,
    pricePerDay: 9500, pricePerWeekFrom: 57000, pricePerWeekTo: 63000,
    amenities: AMEN_WEEK_M, imgSeed: 3,
    desc: 'Sanlorenzo SL line. Twenty-four metres, four cabins, classic.',
    descFr: 'Ligne SL Sanlorenzo. Vingt-quatre metres, quatre cabines, classique.',
    bodyEn: 'M/Y Iris is the Sanlorenzo classic. Twenty-four metres, four cabins, eight guests, four crew. The lines that age well, italian fit, the boat for a calm week along the coast.',
    bodyFr: 'M/Y Iris est la classique Sanlorenzo. Vingt-quatre metres, quatre cabines, huit personnes, quatre equipage. Les lignes qui vieillissent bien, finitions italiennes, le bateau pour une semaine calme le long de la cote.',
  }),
  build({
    id: 'phoebe-ferretti-920', name: 'M/Y Phoebe', builder: 'Ferretti', model: '920',
    type: 'motor', lengthM: 28.3, guests: 10, cabins: 5, crew: 5, master: 1, vip: 1, double: 2, twin: 1,
    cruisingKnots: 23, maxKnots: 27, year: 2024,
    pricePerDay: 13800, pricePerWeekFrom: 83000, pricePerWeekTo: 90000,
    amenities: AMEN_LARGE, imgSeed: 4,
    desc: 'Ferretti 920. Twenty-eight metres, ten guests, beach club.',
    descFr: 'Ferretti 920. Vingt-huit metres, dix personnes, beach club.',
    bodyEn: 'M/Y Phoebe is the Ferretti 92 generation. Twenty-eight metres, five cabins, ten guests, five crew. Beach club aft, full beam master, the boat that combines presence and approachable price.',
    bodyFr: 'M/Y Phoebe est la generation Ferretti 92. Vingt-huit metres, cinq cabines, dix personnes, cinq equipage. Beach club arriere, master pleine largeur, le bateau qui combine presence et prix accessible.',
  }),
  build({
    id: 'pegase-sunseeker-95', name: 'M/Y Pegase', builder: 'Sunseeker', model: '95 Yacht',
    type: 'motor', lengthM: 29.1, guests: 10, cabins: 5, crew: 5, master: 1, vip: 1, double: 2, twin: 1,
    cruisingKnots: 22, maxKnots: 28, year: 2024,
    pricePerDay: 14200, pricePerWeekFrom: 85000, pricePerWeekTo: 92000,
    amenities: AMEN_LARGE, imgSeed: 5,
    desc: 'Sunseeker 95. Five cabins, full beam master, fly bridge with jacuzzi.',
    descFr: 'Sunseeker 95. Cinq cabines, master pleine largeur, fly bridge avec jacuzzi.',
    bodyEn: 'M/Y Pegase is the Sunseeker 95. Twenty-nine metres, five cabins, ten guests, five crew. Master full beam, fly bridge with jacuzzi and bar, the boat for two families on a Riviera-Sardinia week.',
    bodyFr: 'M/Y Pegase est la Sunseeker 95. Vingt-neuf metres, cinq cabines, dix personnes, cinq equipage. Master pleine largeur, fly bridge avec jacuzzi et bar, le bateau pour deux familles sur une semaine Riviera-Sardaigne.',
  }),
  build({
    id: 'thalia-mangusta-130', name: 'M/Y Thalia', builder: 'Mangusta', model: 'Maxi Open 130',
    type: 'motor', lengthM: 27, guests: 8, cabins: 4, crew: 5, master: 1, vip: 1, double: 2,
    cruisingKnots: 30, maxKnots: 36, year: 2023,
    pricePerDay: 12500, pricePerWeekFrom: 75000, pricePerWeekTo: 82000,
    amenities: AMEN_WEEK_M, imgSeed: 6,
    desc: 'Mangusta Maxi Open. Twenty-seven metres, thirty-six knots, four cabins.',
    descFr: 'Mangusta Maxi Open. Vingt-sept metres, trente-six nœuds, quatre cabines.',
    bodyEn: 'M/Y Thalia is the Mangusta open at twenty-seven metres. Four cabins, eight guests, five crew, thirty-six knots top. Italian carbon trim, sport hull, the speed week.',
    bodyFr: 'M/Y Thalia est la Mangusta ouverte a vingt-sept metres. Quatre cabines, huit personnes, cinq equipage, trente-six nœuds top. Carbone italien, coque sport, la semaine vitesse.',
  }),

  // ============================================================
  // 30-50m MOTOR (semaine confort) 15-50k EUR/jour
  // ============================================================
  build({
    id: 'sonishi-sunseeker-131', name: 'M/Y Sonishi', builder: 'Sunseeker', model: '131 Yacht',
    type: 'motor', lengthM: 40, guests: 10, cabins: 5, crew: 8, master: 1, vip: 2, convertible: 2,
    cruisingKnots: 12, maxKnots: 22, year: 2019,
    pricePerDay: null, pricePerWeekFrom: 175000, pricePerWeekTo: 190000,
    amenities: AMEN_LARGE, imgSeed: 5,
    desc: 'Mediterranean week. Forty metres, ten guests, crew of eight.',
    descFr: 'Semaine en Mediterranee. Quarante metres, dix personnes, equipage de huit.',
    bodyEn: 'M/Y Sonishi is the Mediterranean week classic. Forty metres, ten guests across one master and four further cabins, eight crew. Jet ski, seabob, paddle, scuba, gym.',
    bodyFr: 'M/Y Sonishi est le classique de la semaine en Mediterranee. Quarante metres, dix personnes en un master et quatre autres cabines, huit equipage. Jet ski, seabob, paddle, plongee, gym.',
  }),
  build({
    id: 'andromeda-benetti-110', name: 'M/Y Andromeda', builder: 'Benetti', model: 'Mediterraneo 110',
    type: 'motor', lengthM: 33, guests: 10, cabins: 5, crew: 7, master: 1, vip: 1, double: 2, twin: 1,
    cruisingKnots: 14, maxKnots: 17, year: 2021,
    pricePerDay: 22000, pricePerWeekFrom: 130000, pricePerWeekTo: 140000,
    amenities: AMEN_LARGE, imgSeed: 0,
    desc: 'Benetti Mediterraneo. Thirty-three metres, five cabins, deep sea.',
    descFr: 'Benetti Mediterraneo. Trente-trois metres, cinq cabines, hauturier.',
    bodyEn: 'M/Y Andromeda is the Benetti Mediterraneo. Thirty-three metres, five cabins, ten guests, seven crew. Steel and aluminum, semi-displacement, the boat for a Mediterranean season at a sensible price.',
    bodyFr: 'M/Y Andromeda est la Benetti Mediterraneo. Trente-trois metres, cinq cabines, dix personnes, sept equipage. Acier et aluminium, semi-deplacement, le bateau pour une saison Mediterraneenne a prix raisonnable.',
  }),
  build({
    id: 'galateia-heesen-120', name: 'M/Y Galateia', builder: 'Heesen', model: '37 Aluminium',
    type: 'motor', lengthM: 37, guests: 10, cabins: 5, crew: 8, master: 1, vip: 2, double: 2,
    cruisingKnots: 14, maxKnots: 17, year: 2020,
    pricePerDay: 28000, pricePerWeekFrom: 168000, pricePerWeekTo: 180000,
    amenities: AMEN_LARGE, imgSeed: 1,
    desc: 'Heesen 37. Aluminum hull, five cabins, full water toys.',
    descFr: 'Heesen 37. Coque aluminium, cinq cabines, jouets aquatiques complets.',
    bodyEn: 'M/Y Galateia is the Heesen 37. Thirty-seven metres, five cabins, ten guests, eight crew. Dutch build, aluminum hull, the discretion of a Heesen and a comprehensive complement of water toys.',
    bodyFr: 'M/Y Galateia est la Heesen 37. Trente-sept metres, cinq cabines, dix personnes, huit equipage. Construction hollandaise, coque aluminium, la discretion d une Heesen et un equipement complet de jouets aquatiques.',
  }),
  build({
    id: 'ondine-sanlorenzo-44alloy', name: 'M/Y Ondine', builder: 'Sanlorenzo', model: '44Alloy',
    type: 'motor', lengthM: 44, guests: 10, cabins: 5, crew: 9, master: 1, vip: 2, double: 2,
    cruisingKnots: 17, maxKnots: 23, year: 2022,
    pricePerDay: 38000, pricePerWeekFrom: 228000, pricePerWeekTo: 245000,
    amenities: AMEN_LARGE, imgSeed: 2,
    desc: 'Sanlorenzo 44Alloy. Forty-four metres, beach club, fly bridge.',
    descFr: 'Sanlorenzo 44Alloy. Quarante-quatre metres, beach club, fly bridge.',
    bodyEn: 'M/Y Ondine is the Sanlorenzo 44Alloy. Forty-four metres, five cabins, ten guests, nine crew. Aluminum hull, glass beach club, the Italian week at top of class.',
    bodyFr: 'M/Y Ondine est la Sanlorenzo 44Alloy. Quarante-quatre metres, cinq cabines, dix personnes, neuf equipage. Coque aluminium, beach club vitre, la semaine italienne haut de gamme.',
  }),
  build({
    id: 'venezia-azimut-grande-32m', name: 'M/Y Venezia', builder: 'Azimut', model: 'Grande 32M',
    type: 'motor', lengthM: 32, guests: 10, cabins: 5, crew: 6, master: 1, vip: 1, double: 2, twin: 1,
    cruisingKnots: 22, maxKnots: 27, year: 2023,
    pricePerDay: 24000, pricePerWeekFrom: 144000, pricePerWeekTo: 158000,
    amenities: AMEN_LARGE, imgSeed: 3,
    desc: 'Azimut Grande 32. Thirty-two metres, ten guests, fly bridge.',
    descFr: 'Azimut Grande 32. Trente-deux metres, dix personnes, fly bridge.',
    bodyEn: 'M/Y Venezia is the Azimut Grande 32. Thirty-two metres, five cabins, ten guests, six crew. Italian-built tri-deck, the right size for a Riviera-Corsica week with a smaller crew.',
    bodyFr: 'M/Y Venezia est la Azimut Grande 32. Trente-deux metres, cinq cabines, dix personnes, six equipage. Tri-pont construction italienne, la bonne taille pour une semaine Riviera-Corse avec un equipage reduit.',
  }),
  build({
    id: 'opaline-ferretti-1000', name: 'M/Y Opaline', builder: 'Ferretti', model: '1000',
    type: 'motor', lengthM: 30.4, guests: 10, cabins: 5, crew: 5, master: 1, vip: 1, double: 2, twin: 1,
    cruisingKnots: 23, maxKnots: 26, year: 2024,
    pricePerDay: 18500, pricePerWeekFrom: 111000, pricePerWeekTo: 122000,
    amenities: AMEN_LARGE, imgSeed: 4,
    desc: 'Ferretti 1000. Thirty metres, the new flagship of the family series.',
    descFr: 'Ferretti 1000. Trente metres, nouveau flagship de la serie famille.',
    bodyEn: 'M/Y Opaline is the Ferretti 1000. Thirty metres, five cabins, ten guests, five crew. Latest generation, full glass main deck, master suite full beam, the right balance between thirty and forty metres.',
    bodyFr: 'M/Y Opaline est la Ferretti 1000. Trente metres, cinq cabines, dix personnes, cinq equipage. Derniere generation, pont principal entierement vitre, suite armateur pleine largeur, le bon equilibre entre trente et quarante metres.',
  }),
  build({
    id: 'kaori-baglietto-44', name: 'M/Y Kaori', builder: 'Baglietto', model: '44 Fast',
    type: 'motor', lengthM: 43.7, guests: 10, cabins: 5, crew: 9, master: 1, vip: 2, double: 1, twin: 1,
    cruisingKnots: 23, maxKnots: 28, year: 2021,
    pricePerDay: 42000, pricePerWeekFrom: 252000, pricePerWeekTo: 270000,
    amenities: AMEN_FLAGSHIP, imgSeed: 5,
    desc: 'Baglietto 44. Fast hull, italian shipyard, beach club glass.',
    descFr: 'Baglietto 44. Coque rapide, chantier italien, beach club vitre.',
    bodyEn: 'M/Y Kaori is the Baglietto 44 fast. Forty-four metres, five cabins, ten guests, nine crew. Aluminum hull, twenty-eight knots top, the boat that combines speed and shipyard heritage.',
    bodyFr: 'M/Y Kaori est la Baglietto 44 Fast. Quarante-quatre metres, cinq cabines, dix personnes, neuf equipage. Coque aluminium, vingt-huit nœuds top, le bateau qui combine vitesse et heritage de chantier.',
  }),
  build({
    id: 'helena-perinissimo-46', name: 'M/Y Helena', builder: 'Perini Navi', model: '46m',
    type: 'motor', lengthM: 46, guests: 12, cabins: 6, crew: 10, master: 1, vip: 2, double: 2, twin: 1,
    cruisingKnots: 14, maxKnots: 17, year: 2018,
    pricePerDay: 48000, pricePerWeekFrom: 288000, pricePerWeekTo: null,
    amenities: AMEN_FLAGSHIP, imgSeed: 6,
    desc: 'Perini Navi motor. Forty-six metres, twelve guests, six cabins.',
    descFr: 'Perini Navi moteur. Quarante-six metres, douze personnes, six cabines.',
    bodyEn: 'M/Y Helena is the Perini Navi motor expression. Forty-six metres, six cabins, twelve guests, ten crew. The discretion of an Italian master shipyard, displacement hull, full water toys.',
    bodyFr: 'M/Y Helena est l expression motor Perini Navi. Quarante-six metres, six cabines, douze personnes, dix equipage. La discretion d un chantier maitre italien, coque de deplacement, jouets aquatiques complets.',
  }),
  build({
    id: 'belmond-westport-130', name: 'M/Y Belmond', builder: 'Westport', model: '130',
    type: 'motor', lengthM: 39.6, guests: 11, cabins: 5, crew: 7, master: 1, vip: 1, double: 2, twin: 1,
    cruisingKnots: 18, maxKnots: 22, year: 2019,
    pricePerDay: 32000, pricePerWeekFrom: 192000, pricePerWeekTo: 210000,
    amenities: AMEN_LARGE, imgSeed: 7,
    desc: 'Westport 130. Forty metres, american build, eleven guests.',
    descFr: 'Westport 130. Quarante metres, construction americaine, onze personnes.',
    bodyEn: 'M/Y Belmond is the Westport 130. Forty metres, five cabins, eleven guests, seven crew. American build, comfort and reliability, the boat that crosses oceans and lives in the Mediterranean.',
    bodyFr: 'M/Y Belmond est la Westport 130. Quarante metres, cinq cabines, onze personnes, sept equipage. Construction americaine, confort et fiabilite, le bateau qui traverse les oceans et vit en Mediterranee.',
  }),

  // ============================================================
  // 50m+ MOTOR (flagship) sur demande
  // ============================================================
  build({
    id: 'lili-amels-180', name: 'M/Y Lili', builder: 'Amels', model: '180',
    type: 'motor', lengthM: 55, guests: 12, cabins: 6, crew: 13, master: 1, double: 3, twin: 2,
    cruisingKnots: 13, maxKnots: 15, year: 2017,
    pricePerDay: 53350, pricePerWeekFrom: 320000, pricePerWeekTo: null,
    amenities: AMEN_FLAGSHIP, badge: 'flagship', imgSeed: 8,
    desc: 'A floating maison. Fifty-five metres, twelve guests, master suite plus five cabins.',
    descFr: 'Une maison flottante. Cinquante-cinq metres, douze personnes, suite armateur plus cinq cabines.',
    bodyEn: 'M/Y Lili is the maison floating. Fifty-five metres, twelve guests across a master suite, three doubles and two twins, thirteen crew. Built by Amels, Holland, in 2017.',
    bodyFr: 'M/Y Lili est la maison flottante. Cinquante-cinq metres, douze personnes en une suite armateur, trois doubles et deux twins, treize equipage. Construite par Amels, Hollande, en 2017.',
  }),
  build({
    id: 'aurelia-feadship-67', name: 'M/Y Aurelia', builder: 'Feadship', model: 'Custom 67',
    type: 'motor', lengthM: 67, guests: 12, cabins: 7, crew: 16, master: 1, vip: 2, double: 3, twin: 1,
    cruisingKnots: 14, maxKnots: 16, year: 2020,
    pricePerDay: null, pricePerWeekFrom: 590000, pricePerWeekTo: null,
    amenities: AMEN_FLAGSHIP, badge: 'flagship', imgSeed: 9,
    desc: 'Feadship 67m. Custom Dutch build, sixteen crew, seven cabins.',
    descFr: 'Feadship 67m. Construction hollandaise sur mesure, seize equipage, sept cabines.',
    bodyEn: 'M/Y Aurelia is the Feadship 67m. Sixty-seven metres, seven cabins, twelve guests, sixteen crew. Custom Dutch build, the discretion of the most considered shipyard in the world.',
    bodyFr: 'M/Y Aurelia est la Feadship 67m. Soixante-sept metres, sept cabines, douze personnes, seize equipage. Construction hollandaise sur mesure, la discretion du chantier le plus considere au monde.',
  }),
  build({
    id: 'meraki-lurssen-65', name: 'M/Y Meraki', builder: 'Lurssen', model: '65 Custom',
    type: 'motor', lengthM: 65, guests: 12, cabins: 6, crew: 15, master: 1, vip: 2, double: 2, twin: 1,
    cruisingKnots: 14, maxKnots: 17, year: 2019,
    pricePerDay: null, pricePerWeekFrom: 540000, pricePerWeekTo: null,
    amenities: AMEN_FLAGSHIP, badge: 'flagship', imgSeed: 0,
    desc: 'Lurssen 65m. German shipyard, fifteen crew, six cabins.',
    descFr: 'Lurssen 65m. Chantier allemand, quinze equipage, six cabines.',
    bodyEn: 'M/Y Meraki is the Lurssen 65. Sixty-five metres, six cabins, twelve guests, fifteen crew. German shipyard custom build, displacement hull, full ocean range.',
    bodyFr: 'M/Y Meraki est la Lurssen 65. Soixante-cinq metres, six cabines, douze personnes, quinze equipage. Chantier allemand sur mesure, coque de deplacement, autonomie ocean.',
  }),

  // ============================================================
  // SAILING YACHTS (sloops, ketches) 3-15k EUR/jour
  // ============================================================
  build({
    id: 'eole-beneteau-57', name: 'S/Y Eole', builder: 'Beneteau', model: 'Oceanis Yacht 62',
    type: 'sail', lengthM: 18.7, guests: 8, cabins: 4, crew: 2, master: 1, vip: 1, double: 2,
    cruisingKnots: 8, maxKnots: 11, year: 2023,
    pricePerDay: 3200, pricePerWeekFrom: 19000, pricePerWeekTo: 22000,
    amenities: AMEN_SAIL, imgSeed: 1,
    desc: 'Beneteau Oceanis 62. Eighteen metres, sailing under sail.',
    descFr: 'Beneteau Oceanis 62. Dix-huit metres, navigation a la voile.',
    bodyEn: 'S/Y Eole is the Beneteau Oceanis 62. Eighteen metres, four cabins, eight guests, two crew. Sloop rig, comfortable interior, the right boat for a calm week along the coast under sail.',
    bodyFr: 'S/Y Eole est la Beneteau Oceanis 62. Dix-huit metres, quatre cabines, huit personnes, deux equipage. Greement sloop, interieur confortable, le bon bateau pour une semaine calme le long de la cote a la voile.',
  }),
  build({
    id: 'zephyr-jeanneau-65', name: 'S/Y Zephyr', builder: 'Jeanneau', model: 'Yacht 65',
    type: 'sail', lengthM: 19.8, guests: 8, cabins: 4, crew: 2, master: 1, double: 3,
    cruisingKnots: 8, maxKnots: 12, year: 2024,
    pricePerDay: 3500, pricePerWeekFrom: 21000, pricePerWeekTo: 24000,
    amenities: AMEN_SAIL, imgSeed: 2,
    desc: 'Jeanneau Yacht 65. The new generation, large saloon, modern lines.',
    descFr: 'Jeanneau Yacht 65. Nouvelle generation, grand salon, lignes modernes.',
    bodyEn: 'S/Y Zephyr is the Jeanneau Yacht 65. Twenty metres, four cabins, eight guests, two crew. Modern sailing lines, large saloon and aft platform, the boat for a relaxed week.',
    bodyFr: 'S/Y Zephyr est la Jeanneau Yacht 65. Vingt metres, quatre cabines, huit personnes, deux equipage. Lignes modernes voile, grand salon et plateforme arriere, le bateau pour une semaine detendue.',
  }),
  build({
    id: 'aether-wally-100', name: 'S/Y Aether', builder: 'Wally', model: 'Wallycento',
    type: 'sail', lengthM: 30.5, guests: 8, cabins: 4, crew: 5, master: 1, vip: 1, double: 2,
    cruisingKnots: 12, maxKnots: 18, year: 2020,
    pricePerDay: 12000, pricePerWeekFrom: 72000, pricePerWeekTo: 80000,
    amenities: AMEN_SAIL, badge: 'flagship', imgSeed: 3,
    desc: 'Wallycento. Carbon racing yacht, thirty metres, top of the sport.',
    descFr: 'Wallycento. Voilier course carbone, trente metres, sommet du sport.',
    bodyEn: 'S/Y Aether is the Wallycento. Thirty metres, four cabins, eight guests, five crew. Pure carbon racing yacht, eighteen knots under sail, the most considered sailing experience on the coast.',
    bodyFr: 'S/Y Aether est la Wallycento. Trente metres, quatre cabines, huit personnes, cinq equipage. Voilier de course carbone pur, dix-huit nœuds a la voile, l experience voile la plus consideree de la cote.',
  }),
  build({
    id: 'kalliope-perini-38', name: 'S/Y Kalliope', builder: 'Perini Navi', model: '38m Cutter',
    type: 'sail', lengthM: 38, guests: 10, cabins: 5, crew: 7, master: 1, vip: 2, double: 2,
    cruisingKnots: 9, maxKnots: 13, year: 2017,
    pricePerDay: 18000, pricePerWeekFrom: 108000, pricePerWeekTo: 120000,
    amenities: AMEN_SAIL, badge: 'popular', imgSeed: 4,
    desc: 'Perini Navi cutter. Thirty-eight metres, traditional rig.',
    descFr: 'Cutter Perini Navi. Trente-huit metres, greement traditionnel.',
    bodyEn: 'S/Y Kalliope is the Perini Navi cutter. Thirty-eight metres, five cabins, ten guests, seven crew. Italian master shipyard sailing yacht, traditional rig, the romance of cruising under sail.',
    bodyFr: 'S/Y Kalliope est le cutter Perini Navi. Trente-huit metres, cinq cabines, dix personnes, sept equipage. Voilier chantier maitre italien, greement traditionnel, la romance de la croisiere a la voile.',
  }),
  build({
    id: 'aiolos-bavaria-c57', name: 'S/Y Aiolos', builder: 'Bavaria', model: 'C57',
    type: 'sail', lengthM: 17.4, guests: 8, cabins: 4, crew: 1, double: 4,
    cruisingKnots: 7, maxKnots: 10, year: 2022,
    pricePerDay: 2900, pricePerWeekFrom: 17500, pricePerWeekTo: 20000,
    amenities: AMEN_SAIL, imgSeed: 5,
    desc: 'Bavaria C57. Cruising sloop, family-friendly, sensible price.',
    descFr: 'Bavaria C57. Sloop de croisiere, familial, prix raisonnable.',
    bodyEn: 'S/Y Aiolos is the Bavaria C57. Seventeen metres, four cabins, eight guests, one crew. Family cruising sloop, sensible price, the entry to a sailing week.',
    bodyFr: 'S/Y Aiolos est la Bavaria C57. Dix-sept metres, quatre cabines, huit personnes, un equipage. Sloop de croisiere familial, prix raisonnable, l entree dans une semaine voile.',
  }),
  build({
    id: 'helia-southern-wind-105', name: 'S/Y Helia', builder: 'Southern Wind', model: '105',
    type: 'sail', lengthM: 32, guests: 8, cabins: 4, crew: 5, master: 1, vip: 1, double: 2,
    cruisingKnots: 10, maxKnots: 15, year: 2021,
    pricePerDay: 14500, pricePerWeekFrom: 87000, pricePerWeekTo: 95000,
    amenities: AMEN_SAIL, imgSeed: 6,
    desc: 'Southern Wind 105. Performance cruiser, thirty-two metres, carbon mast.',
    descFr: 'Southern Wind 105. Croisiere performance, trente-deux metres, mat carbone.',
    bodyEn: 'S/Y Helia is the Southern Wind 105. Thirty-two metres, four cabins, eight guests, five crew. Performance cruiser, carbon mast, the right balance of speed under sail and onboard comfort.',
    bodyFr: 'S/Y Helia est la Southern Wind 105. Trente-deux metres, quatre cabines, huit personnes, cinq equipage. Croisiere performance, mat carbone, le bon equilibre vitesse a la voile et confort a bord.',
  }),

  // ============================================================
  // CATAMARANS 3-12k EUR/jour
  // ============================================================
  build({
    id: 'sirena-lagoon-50', name: 'CAT Sirena', builder: 'Lagoon', model: '50',
    type: 'catamaran', lengthM: 14.7, guests: 8, cabins: 4, crew: 2, master: 1, double: 3,
    cruisingKnots: 9, maxKnots: 12, year: 2023,
    pricePerDay: 3400, pricePerWeekFrom: 20500, pricePerWeekTo: 23000,
    amenities: AMEN_CAT, imgSeed: 7,
    desc: 'Lagoon 50. Cruising catamaran, four cabins, sensible week.',
    descFr: 'Lagoon 50. Catamaran croisiere, quatre cabines, semaine raisonnable.',
    bodyEn: 'CAT Sirena is the Lagoon 50. Fifteen metres, four cabins, eight guests, two crew. Cruising catamaran, stable platform, the entry to the catamaran week with family.',
    bodyFr: 'CAT Sirena est la Lagoon 50. Quinze metres, quatre cabines, huit personnes, deux equipage. Catamaran croisiere, plateforme stable, l entree dans la semaine catamaran en famille.',
  }),
  build({
    id: 'nausica-sunreef-60', name: 'CAT Nausica', builder: 'Sunreef', model: '60',
    type: 'catamaran', lengthM: 18.3, guests: 8, cabins: 4, crew: 3, master: 1, vip: 1, double: 2,
    cruisingKnots: 10, maxKnots: 14, year: 2024,
    pricePerDay: 8500, pricePerWeekFrom: 51000, pricePerWeekTo: 56000,
    amenities: AMEN_CAT, badge: 'popular', imgSeed: 8,
    desc: 'Sunreef 60. Premium catamaran, eighteen metres, four cabins.',
    descFr: 'Sunreef 60. Catamaran haut de gamme, dix-huit metres, quatre cabines.',
    bodyEn: 'CAT Nausica is the Sunreef 60. Eighteen metres, four cabins, eight guests, three crew. The Sunreef reference for catamaran charter, full beam saloon, master suite forward.',
    bodyFr: 'CAT Nausica est la Sunreef 60. Dix-huit metres, quatre cabines, huit personnes, trois equipage. La reference Sunreef pour le charter catamaran, salon pleine largeur, suite armateur a l avant.',
  }),
  build({
    id: 'thalassa-lagoon-65', name: 'CAT Thalassa', builder: 'Lagoon', model: '65',
    type: 'catamaran', lengthM: 19.6, guests: 8, cabins: 4, crew: 3, master: 1, double: 3,
    cruisingKnots: 9, maxKnots: 12, year: 2023,
    pricePerDay: 5800, pricePerWeekFrom: 35000, pricePerWeekTo: 39000,
    amenities: AMEN_CAT, imgSeed: 9,
    desc: 'Lagoon 65. The largest production cruising cat.',
    descFr: 'Lagoon 65. Le plus grand catamaran de croisiere de serie.',
    bodyEn: 'CAT Thalassa is the Lagoon 65. Twenty metres, four cabins, eight guests, three crew. The largest production cruising catamaran, full beam saloon, generous space at sensible price.',
    bodyFr: 'CAT Thalassa est la Lagoon 65. Vingt metres, quatre cabines, huit personnes, trois equipage. Le plus grand catamaran de croisiere de serie, salon pleine largeur, espace genereux a prix raisonnable.',
  }),
  build({
    id: 'iris-cat-bali-58', name: 'CAT Iris', builder: 'Bali', model: '5.8',
    type: 'catamaran', lengthM: 17.7, guests: 10, cabins: 5, crew: 2, double: 4, twin: 1,
    cruisingKnots: 9, maxKnots: 11, year: 2024,
    pricePerDay: 4800, pricePerWeekFrom: 29000, pricePerWeekTo: 32000,
    amenities: AMEN_CAT, imgSeed: 0,
    desc: 'Bali 5.8. Open concept catamaran, five cabins, ten guests.',
    descFr: 'Bali 5.8. Catamaran concept ouvert, cinq cabines, dix personnes.',
    bodyEn: 'CAT Iris is the Bali 5.8. Eighteen metres, five cabins, ten guests, two crew. Open-deck Bali concept, large flybridge, the boat for two families on a Riviera-Corsica week.',
    bodyFr: 'CAT Iris est la Bali 5.8. Dix-huit metres, cinq cabines, dix personnes, deux equipage. Concept Bali pont ouvert, grand flybridge, le bateau pour deux familles sur une semaine Riviera-Corse.',
  }),
  build({
    id: 'aria-sunreef-80', name: 'CAT Aria', builder: 'Sunreef', model: '80',
    type: 'catamaran', lengthM: 24.4, guests: 10, cabins: 5, crew: 4, master: 1, vip: 1, double: 2, twin: 1,
    cruisingKnots: 11, maxKnots: 16, year: 2023,
    pricePerDay: 13800, pricePerWeekFrom: 83000, pricePerWeekTo: 90000,
    amenities: AMEN_CAT, badge: 'flagship', imgSeed: 1,
    desc: 'Sunreef 80. Twenty-four metres, custom interior, the catamaran flagship.',
    descFr: 'Sunreef 80. Vingt-quatre metres, interieur sur mesure, le flagship catamaran.',
    bodyEn: 'CAT Aria is the Sunreef 80. Twenty-four metres, five cabins, ten guests, four crew. Custom Sunreef interior, full beam master, the catamaran flagship reference.',
    bodyFr: 'CAT Aria est la Sunreef 80. Vingt-quatre metres, cinq cabines, dix personnes, quatre equipage. Interieur Sunreef sur mesure, master pleine largeur, la reference flagship catamaran.',
  }),
  build({
    id: 'nereids-fountaine-pajot-67', name: 'CAT Nereids', builder: 'Fountaine Pajot', model: 'Power 67',
    type: 'catamaran', lengthM: 20.4, guests: 8, cabins: 4, crew: 3, master: 1, vip: 1, double: 2,
    cruisingKnots: 11, maxKnots: 14, year: 2023,
    pricePerDay: 6500, pricePerWeekFrom: 39000, pricePerWeekTo: 43000,
    amenities: AMEN_CAT, imgSeed: 2,
    desc: 'Fountaine Pajot Power 67. Power catamaran, twenty metres, fly bridge.',
    descFr: 'Fountaine Pajot Power 67. Catamaran moteur, vingt metres, fly bridge.',
    bodyEn: 'CAT Nereids is the Fountaine Pajot Power 67. Twenty metres, four cabins, eight guests, three crew. Power catamaran, fly bridge with bar, the right balance of catamaran stability and motor cruising speed.',
    bodyFr: 'CAT Nereids est la Fountaine Pajot Power 67. Vingt metres, quatre cabines, huit personnes, trois equipage. Catamaran moteur, fly bridge avec bar, le bon equilibre entre stabilite catamaran et vitesse de croisiere moteur.',
  }),

  // ============================================================
  // Quelques flagships supplementaires (50m+) pour profondeur
  // ============================================================
  build({
    id: 'tahiti-fountaine-pajot-80', name: 'CAT Tahiti', builder: 'Fountaine Pajot', model: 'Power 80',
    type: 'catamaran', lengthM: 24, guests: 10, cabins: 5, crew: 4, master: 1, vip: 1, double: 2, twin: 1,
    cruisingKnots: 12, maxKnots: 17, year: 2024,
    pricePerDay: 11500, pricePerWeekFrom: 69000, pricePerWeekTo: 76000,
    amenities: AMEN_CAT, imgSeed: 3,
    desc: 'Fountaine Pajot Power 80. Twenty-four metres, five cabins, fly bridge.',
    descFr: 'Fountaine Pajot Power 80. Vingt-quatre metres, cinq cabines, fly bridge.',
    bodyEn: 'CAT Tahiti is the Fountaine Pajot Power 80. Twenty-four metres, five cabins, ten guests, four crew. The largest power catamaran in the Fountaine Pajot range, master suite full beam, generous saloon.',
    bodyFr: 'CAT Tahiti est la Fountaine Pajot Power 80. Vingt-quatre metres, cinq cabines, dix personnes, quatre equipage. Le plus grand catamaran moteur de la gamme Fountaine Pajot, suite armateur pleine largeur, salon genereux.',
  }),
  build({
    id: 'aether-nautor-swan-80', name: 'S/Y Aether II', builder: 'Nautor Swan', model: '80',
    type: 'sail', lengthM: 24.5, guests: 8, cabins: 4, crew: 4, master: 1, vip: 1, double: 2,
    cruisingKnots: 10, maxKnots: 14, year: 2022,
    pricePerDay: 8500, pricePerWeekFrom: 51000, pricePerWeekTo: 56000,
    amenities: AMEN_SAIL, imgSeed: 4,
    desc: 'Nautor Swan 80. Finnish performance cruiser, twenty-four metres.',
    descFr: 'Nautor Swan 80. Croisiere performance finlandaise, vingt-quatre metres.',
    bodyEn: 'S/Y Aether II is the Nautor Swan 80. Twenty-four metres, four cabins, eight guests, four crew. Finnish performance cruiser, classic Swan lines, the right boat for a sailing week with the right balance of speed and comfort.',
    bodyFr: 'S/Y Aether II est la Nautor Swan 80. Vingt-quatre metres, quatre cabines, huit personnes, quatre equipage. Croisiere performance finlandaise, lignes classiques Swan, le bon bateau pour une semaine voile avec le bon equilibre vitesse et confort.',
  }),
  build({
    id: 'oceanis-azimut-magellano-66', name: 'M/Y Oceanis', builder: 'Azimut', model: 'Magellano 66',
    type: 'motor', lengthM: 20.4, guests: 8, cabins: 3, crew: 2, master: 1, vip: 1, double: 1,
    cruisingKnots: 18, maxKnots: 24, year: 2023,
    pricePerDay: 6000, pricePerWeekFrom: 36000, pricePerWeekTo: 40000,
    amenities: AMEN_DAY, imgSeed: 5,
    desc: 'Azimut Magellano 66. Long-range trawler, twenty metres.',
    descFr: 'Azimut Magellano 66. Trawler long range, vingt metres.',
    bodyEn: 'M/Y Oceanis is the Azimut Magellano 66. Twenty metres, three cabins, eight guests, two crew. Trawler hull, long-range cruising, the right boat for a slow week along the coast and the islands.',
    bodyFr: 'M/Y Oceanis est la Azimut Magellano 66. Vingt metres, trois cabines, huit personnes, deux equipage. Coque trawler, croisiere long range, le bon bateau pour une semaine lente le long de la cote et des iles.',
  }),
  build({
    id: 'olympia-benetti-65', name: 'M/Y Olympia', builder: 'Benetti', model: 'B.Now 65m',
    type: 'motor', lengthM: 65, guests: 12, cabins: 6, crew: 14, master: 1, vip: 2, double: 2, twin: 1,
    cruisingKnots: 14, maxKnots: 16, year: 2022,
    pricePerDay: null, pricePerWeekFrom: 510000, pricePerWeekTo: null,
    amenities: AMEN_FLAGSHIP, badge: 'flagship', imgSeed: 3,
    desc: 'Benetti B.Now 65. Italian flagship, sixty-five metres.',
    descFr: 'Benetti B.Now 65. Flagship italien, soixante-cinq metres.',
    bodyEn: 'M/Y Olympia is the Benetti B.Now 65. Sixty-five metres, six cabins, twelve guests, fourteen crew. Italian flagship, beach club aft with sea balconies, helideck.',
    bodyFr: 'M/Y Olympia est la Benetti B.Now 65. Soixante-cinq metres, six cabines, douze personnes, quatorze equipage. Flagship italien, beach club arriere avec balcons sur la mer, helideck.',
  }),
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

export function yachtBuilders(): string[] {
  const set = new Set<string>();
  for (const y of YACHTS) set.add(y.builder);
  return Array.from(set).sort();
}

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

export const YACHT_TYPE_LABELS: Record<YachtType, { en: string; fr: string }> = {
  motor: { en: 'Motor yacht', fr: 'Yacht moteur' },
  sail: { en: 'Sailing yacht', fr: 'Voilier' },
  catamaran: { en: 'Catamaran', fr: 'Catamaran' },
};

// Tranches journalieres EUR (couvre 3-15k focus + flagships au dela)
export const YACHT_DAILY_BUCKETS: { id: string; label: string; min: number; max: number }[] = [
  { id: 'd-3-5k', label: '€3,000 - €5,000', min: 0, max: 5000 },
  { id: 'd-5-8k', label: '€5,000 - €8,000', min: 5000, max: 8000 },
  { id: 'd-8-12k', label: '€8,000 - €12,000', min: 8000, max: 12000 },
  { id: 'd-12-20k', label: '€12,000 - €20,000', min: 12000, max: 20000 },
  { id: 'd-20k-plus', label: '€20,000 +', min: 20000, max: 9999999 },
];

export const YACHT_PRICE_BUCKETS: { id: string; label: string; min: number; max: number }[] = [
  { id: 'under-50k', label: 'Up to €50,000', min: 0, max: 50000 },
  { id: '50k-100k', label: '€50,000 - €100,000', min: 50000, max: 100000 },
  { id: '100k-200k', label: '€100,000 - €200,000', min: 100000, max: 200000 },
  { id: '200k-plus', label: '€200,000 +', min: 200000, max: 9999999 },
];
