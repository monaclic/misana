// Catalogue location voitures Misana V1.
// Selection equilibree couvrant les standards de prix Riviera :
// SUV iconic (G63), SUV luxe (Range Rover Vogue, Cullinan),
// performance daily (RS6), supercars (Ferrari Roma Spider, Lambo Urus),
// GT (911 Turbo S), prestige limousine (Maybach S).
// Sources prix/specs : Excellence Riviera (operateur premium Riviera).

export type RentalCarCategory = 'supercar' | 'sport' | 'suv' | 'sedan' | 'convertible';

export type RentalPriceTiers = {
  oneToThreeDays: number;   // EUR par jour, 1-3 jours
  fourToSevenDays: number;  // EUR par jour, 4-7 jours
  weekPlus: number;         // EUR par jour, 7+ jours
};

export type RentalCar = {
  id: string;
  brand: string;
  model: string;
  fullName: string;        // affiche dans le titre de card
  category: RentalCarCategory;
  pax: number;
  hp: number;
  topSpeedKmh: number;
  transmission: 'auto' | 'manual';
  hero: string;            // image principale
  images: string[];        // carousel
  prices: RentalPriceTiers;
  badge?: 'popular' | 'flagship';
  desc: string;
  descFr: string;
};

export const RENTAL_CARS: RentalCar[] = [
  {
    id: 'audi-rs6-performance',
    brand: 'Audi',
    model: 'RS 6 Performance',
    fullName: 'Audi RS 6 Performance',
    category: 'sport',
    pax: 5,
    hp: 630,
    topSpeedKmh: 250,
    transmission: 'auto',
    hero: 'https://excellenceriviera.com/wp-content/uploads/2024/04/audi-rs6-performance-1.png',
    images: [
      'https://excellenceriviera.com/wp-content/uploads/2024/04/audi-rs6-performance-1.png',
      'https://excellenceriviera.com/wp-content/uploads/2024/04/audi-rs6-performance-2.jpg',
      'https://excellenceriviera.com/wp-content/uploads/2024/04/audi-rs6-performance-3.jpg',
    ],
    prices: { oneToThreeDays: 1500, fourToSevenDays: 1300, weekPlus: 1100 },
    badge: 'popular',
    desc: 'Daily reference. Five seats, 630 hp, four wheels.',
    descFr: 'La reference au quotidien. Cinq places, 630 ch, quatre roues.',
  },
  {
    id: 'mercedes-g63-amg',
    brand: 'Mercedes-Benz',
    model: 'G 63 AMG',
    fullName: 'Mercedes-AMG G 63',
    category: 'suv',
    pax: 4,
    hp: 585,
    topSpeedKmh: 220,
    transmission: 'auto',
    hero: 'https://excellenceriviera.com/wp-content/uploads/2020/05/Mercedes-G63-AMG-1-1.jpg',
    images: [
      'https://excellenceriviera.com/wp-content/uploads/2020/05/Mercedes-G63-AMG-1-1.jpg',
      'https://excellenceriviera.com/wp-content/uploads/2020/05/Mercedes-G63-AMG-1-2.jpg',
      'https://excellenceriviera.com/wp-content/uploads/2020/05/Mercedes-G63-AMG-1-3.jpg',
    ],
    prices: { oneToThreeDays: 1300, fourToSevenDays: 1100, weekPlus: 950 },
    desc: 'The icon. Square shoulders, 585 hp, the Riviera in stride.',
    descFr: "L'icone. Epaules carrees, 585 ch, la Riviera au pas.",
  },
  {
    id: 'range-rover-vogue-l',
    brand: 'Land Rover',
    model: 'Range Rover Vogue L',
    fullName: 'Range Rover Vogue Long',
    category: 'suv',
    pax: 7,
    hp: 530,
    topSpeedKmh: 250,
    transmission: 'auto',
    hero: 'https://excellenceriviera.com/wp-content/uploads/2023/04/Range-Rover-Vogue-L-1.jpeg',
    images: [
      'https://excellenceriviera.com/wp-content/uploads/2023/04/Range-Rover-Vogue-L-1.jpeg',
      'https://excellenceriviera.com/wp-content/uploads/2023/04/Range-Rover-Vogue-L-2.jpeg',
      'https://excellenceriviera.com/wp-content/uploads/2023/04/Range-Rover-Vogue-L-3.jpeg',
    ],
    prices: { oneToThreeDays: 950, fourToSevenDays: 850, weekPlus: 720 },
    desc: 'Seven seats, air suspension, the road quietly mastered.',
    descFr: 'Sept places, suspension air, la route maitrisee dans le silence.',
  },
  {
    id: 'mercedes-maybach-s',
    brand: 'Mercedes-Maybach',
    model: 'Classe S',
    fullName: 'Mercedes-Maybach S-Class',
    category: 'sedan',
    pax: 5,
    hp: 286,
    topSpeedKmh: 250,
    transmission: 'auto',
    hero: 'https://excellenceriviera.com/wp-content/uploads/2020/06/Mercedes-Maybach-Classe-S-1.png',
    images: [
      'https://excellenceriviera.com/wp-content/uploads/2020/06/Mercedes-Maybach-Classe-S-1.png',
      'https://excellenceriviera.com/wp-content/uploads/2020/06/Mercedes-Maybach-Classe-S-2.jpg',
      'https://excellenceriviera.com/wp-content/uploads/2020/06/Mercedes-Maybach-Classe-S-3.png',
    ],
    prices: { oneToThreeDays: 1300, fourToSevenDays: 900, weekPlus: 790 },
    desc: 'The cabin as a private salon.',
    descFr: 'La cabine comme un salon prive.',
  },
  {
    id: 'porsche-992-turbo-s',
    brand: 'Porsche',
    model: '911 Turbo S (992)',
    fullName: 'Porsche 911 Turbo S',
    category: 'sport',
    pax: 4,
    hp: 650,
    topSpeedKmh: 330,
    transmission: 'auto',
    hero: 'https://excellenceriviera.com/wp-content/uploads/2024/04/Porsche-991-Turbo-S-992-1.jpg',
    images: [
      'https://excellenceriviera.com/wp-content/uploads/2024/04/Porsche-991-Turbo-S-992-1.jpg',
      'https://excellenceriviera.com/wp-content/uploads/2024/04/Porsche-991-Turbo-S-992-2.jpg',
      'https://excellenceriviera.com/wp-content/uploads/2024/04/Porsche-991-Turbo-S-992-3.jpg',
    ],
    prices: { oneToThreeDays: 1930, fourToSevenDays: 1740, weekPlus: 1460 },
    desc: 'Engineering as restraint. 650 hp, 330 km/h.',
    descFr: "L'ingenierie comme retenue. 650 ch, 330 km/h.",
  },
  {
    id: 'lamborghini-urus',
    brand: 'Lamborghini',
    model: 'Urus S',
    fullName: 'Lamborghini Urus S',
    category: 'suv',
    pax: 5,
    hp: 666,
    topSpeedKmh: 305,
    transmission: 'auto',
    hero: 'https://excellenceriviera.com/wp-content/uploads/2020/05/Lamborghini-Urus.jpg',
    images: [
      'https://excellenceriviera.com/wp-content/uploads/2020/05/Lamborghini-Urus.jpg',
      'https://excellenceriviera.com/wp-content/uploads/2020/05/Lamborghini-Urus-1.jpg',
      'https://excellenceriviera.com/wp-content/uploads/2020/05/Lamborghini-Urus-2.jpg',
    ],
    prices: { oneToThreeDays: 2120, fourToSevenDays: 1910, weekPlus: 1800 },
    desc: 'Theatrical, head-turning, surprisingly civil.',
    descFr: 'Theatre, presence sur la route, etonnamment civil.',
  },
  {
    id: 'ferrari-roma-spider',
    brand: 'Ferrari',
    model: 'Roma Spider',
    fullName: 'Ferrari Roma Spider',
    category: 'convertible',
    pax: 2,
    hp: 620,
    topSpeedKmh: 320,
    transmission: 'auto',
    hero: 'https://excellenceriviera.com/wp-content/uploads/2024/04/Ferrari-roma-spider-1.jpg',
    images: [
      'https://excellenceriviera.com/wp-content/uploads/2024/04/Ferrari-roma-spider-1.jpg',
      'https://excellenceriviera.com/wp-content/uploads/2024/04/Ferrari-roma-spider-2.jpg',
      'https://excellenceriviera.com/wp-content/uploads/2024/04/Ferrari-roma-spider-3.jpg',
    ],
    prices: { oneToThreeDays: 2190, fourToSevenDays: 1990, weekPlus: 1800 },
    desc: 'Italian fire on the corniche. Top down.',
    descFr: 'Le feu italien sur la corniche. Capote ouverte.',
  },
  {
    id: 'porsche-cayenne-turbo',
    brand: 'Porsche',
    model: 'Cayenne Turbo',
    fullName: 'Porsche Cayenne Turbo',
    category: 'suv',
    pax: 5,
    hp: 550,
    topSpeedKmh: 286,
    transmission: 'auto',
    hero: 'https://excellenceriviera.com/wp-content/uploads/2020/05/Porsche-Cayenne-Turbo-Featured.jpg',
    images: [
      'https://excellenceriviera.com/wp-content/uploads/2020/05/Porsche-Cayenne-Turbo-Featured.jpg',
      'https://excellenceriviera.com/wp-content/uploads/2020/05/Porsche-Cayenne-Turbo-01.jpg',
      'https://excellenceriviera.com/wp-content/uploads/2020/05/Porsche-Cayenne-Turbo-02.jpg',
    ],
    prices: { oneToThreeDays: 910, fourToSevenDays: 860, weekPlus: 810 },
    desc: 'SUV daily reference. 550 hp, all-season.',
    descFr: 'Le SUV de reference au quotidien. 550 ch, toutes saisons.',
  },
  {
    id: 'bentley-continental-gtc',
    brand: 'Bentley',
    model: 'Continental GTC',
    fullName: 'Bentley Continental GTC',
    category: 'convertible',
    pax: 4,
    hp: 550,
    topSpeedKmh: 318,
    transmission: 'auto',
    hero: 'https://excellenceriviera.com/wp-content/uploads/2020/05/Bentley-Continental-GTC-1.jpg',
    images: [
      'https://excellenceriviera.com/wp-content/uploads/2020/05/Bentley-Continental-GTC-1.jpg',
      'https://excellenceriviera.com/wp-content/uploads/2020/05/Bentley-Continental-GTC-2.jpg',
      'https://excellenceriviera.com/wp-content/uploads/2020/05/Bentley-Continental-GTC-3.jpg',
    ],
    prices: { oneToThreeDays: 2250, fourToSevenDays: 2100, weekPlus: 1800 },
    desc: 'Quiet British power, top down.',
    descFr: 'Puissance britannique discrete, capote ouverte.',
  },
  {
    id: 'ferrari-296-gts',
    brand: 'Ferrari',
    model: '296 GTS',
    fullName: 'Ferrari 296 GTS',
    category: 'supercar',
    pax: 2,
    hp: 830,
    topSpeedKmh: 330,
    transmission: 'auto',
    hero: 'https://excellenceriviera.com/wp-content/uploads/2024/04/Ferrari-296-GTS.jpg',
    images: [
      'https://excellenceriviera.com/wp-content/uploads/2024/04/Ferrari-296-GTS.jpg',
      'https://excellenceriviera.com/wp-content/uploads/2024/04/Ferrari-296-GTS.1.jpg',
      'https://excellenceriviera.com/wp-content/uploads/2024/04/Ferrari-296-GTS.2.jpg',
    ],
    prices: { oneToThreeDays: 2490, fourToSevenDays: 2280, weekPlus: 1950 },
    desc: 'Hybrid V6 supercar, 830 hp, top down.',
    descFr: 'Supercar V6 hybride, 830 ch, capote ouverte.',
  },
  {
    id: 'aston-martin-db12-volante',
    brand: 'Aston Martin',
    model: 'DB12 Volante',
    fullName: 'Aston Martin DB12 Volante',
    category: 'convertible',
    pax: 4,
    hp: 680,
    topSpeedKmh: 325,
    transmission: 'auto',
    hero: 'https://excellenceriviera.com/wp-content/uploads/2020/05/aston-martin-db12-volante-1.jpeg',
    images: [
      'https://excellenceriviera.com/wp-content/uploads/2020/05/aston-martin-db12-volante-1.jpeg',
      'https://excellenceriviera.com/wp-content/uploads/2020/05/aston-martin-db12-volante-2.jpg',
      'https://excellenceriviera.com/wp-content/uploads/2020/05/aston-martin-db12-volante-3.jpeg',
    ],
    prices: { oneToThreeDays: 2500, fourToSevenDays: 2270, weekPlus: 1950 },
    desc: 'British grand tourer, 680 hp, sky open.',
    descFr: 'Grand tourer britannique, 680 ch, ciel ouvert.',
  },
  {
    id: 'rolls-royce-cullinan',
    brand: 'Rolls-Royce',
    model: 'Cullinan',
    fullName: 'Rolls-Royce Cullinan',
    category: 'suv',
    pax: 5,
    hp: 571,
    topSpeedKmh: 250,
    transmission: 'auto',
    hero: 'https://excellenceriviera.com/wp-content/uploads/2020/05/Rolls-Royce-Cullinan-Featured.jpg',
    images: [
      'https://excellenceriviera.com/wp-content/uploads/2020/05/Rolls-Royce-Cullinan-Featured.jpg',
      'https://excellenceriviera.com/wp-content/uploads/2020/05/Rolls-Royce-Cullinan-01.jpg',
      'https://excellenceriviera.com/wp-content/uploads/2020/05/Rolls-Royce-Cullinan-02.jpg',
    ],
    prices: { oneToThreeDays: 3300, fourToSevenDays: 3100, weekPlus: 2900 },
    badge: 'flagship',
    desc: 'The arrival makes itself felt.',
    descFr: "L'arrivee se fait sentir.",
  },
];

export function findRentalCarById(id: string | undefined) {
  if (!id) return undefined;
  return RENTAL_CARS.find((c) => c.id === id);
}

// Prix pour une duree donnee (jours).
// Renvoie EUR par jour selon le tier applicable.
export function rentalDailyRate(car: RentalCar, days: number): number {
  if (days >= 7) return car.prices.weekPlus;
  if (days >= 4) return car.prices.fourToSevenDays;
  return car.prices.oneToThreeDays;
}

// Total pour une duree donnee.
export function rentalTotal(car: RentalCar, days: number): number {
  return rentalDailyRate(car, days) * Math.max(1, days);
}

export const RENTAL_CATEGORIES: { id: RentalCarCategory; label: string; labelFr: string }[] = [
  { id: 'sport', label: 'Performance', labelFr: 'Performance' },
  { id: 'supercar', label: 'Supercar', labelFr: 'Supercar' },
  { id: 'suv', label: 'SUV', labelFr: 'SUV' },
  { id: 'convertible', label: 'Convertible', labelFr: 'Cabriolet' },
  { id: 'sedan', label: 'Sedan', labelFr: 'Berline' },
];
