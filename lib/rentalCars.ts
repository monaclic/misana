// Catalogue location voitures Misana V1.
// Selection equilibree couvrant les standards de prix Riviera. Sources :
// Excellence Riviera (operateur premium Riviera).
// Structure complete copee Excellence : description longue, specs, conditions
// rental (caution, age, km, fuel), included services, available cities.

export type RentalCarCategory = 'supercar' | 'sport' | 'suv' | 'sedan' | 'convertible';

export type RentalPriceTiers = {
  oneToThreeDays: number;
  fourToSevenDays: number;
  weekPlus: number;
};

export type RentalConditions = {
  minAge: number;          // age minimum conducteur (annees)
  securityDeposit: number; // caution en EUR
  minDays: number;         // duration minimum jours
  includedKmPerDay: number;
  overageRatePerKm: number; // EUR par km supplementaire
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
  // villes Misana ou la voiture peut etre livree (default = 4 villes hub Riviera)
  availableCities: string[];
  badge?: 'popular' | 'flagship';
  // Description courte pour cards (1-2 phrases)
  desc: string;
  descFr: string;
  // Description longue pour fiche produit (1-2 paragraphes)
  bodyEn: string;
  bodyFr: string;
};

const DEFAULT_CITIES = ['nice', 'cannes', 'monaco', 'saint-tropez', 'cap-ferrat', 'cap-d-antibes', 'eze', 'menton'];

// Conditions par defaut par categorie. Standard marche premium Riviera.
const COND_DAILY: RentalConditions = { minAge: 25, securityDeposit: 5000, minDays: 1, includedKmPerDay: 200, overageRatePerKm: 3 };
const COND_SPORT: RentalConditions = { minAge: 30, securityDeposit: 10000, minDays: 3, includedKmPerDay: 150, overageRatePerKm: 4 };
const COND_SUV_PREMIUM: RentalConditions = { minAge: 30, securityDeposit: 8000, minDays: 2, includedKmPerDay: 200, overageRatePerKm: 3 };
const COND_SUV_ICONIC: RentalConditions = { minAge: 30, securityDeposit: 15000, minDays: 3, includedKmPerDay: 150, overageRatePerKm: 4 };
const COND_LIMO: RentalConditions = { minAge: 30, securityDeposit: 10000, minDays: 1, includedKmPerDay: 200, overageRatePerKm: 4 };
const COND_SUPERCAR: RentalConditions = { minAge: 30, securityDeposit: 30000, minDays: 3, includedKmPerDay: 150, overageRatePerKm: 7 };
const COND_GT: RentalConditions = { minAge: 30, securityDeposit: 25000, minDays: 3, includedKmPerDay: 150, overageRatePerKm: 5 };
const COND_FLAGSHIP: RentalConditions = { minAge: 30, securityDeposit: 50000, minDays: 3, includedKmPerDay: 100, overageRatePerKm: 7 };

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
    fuelType: 'gasoline',
    year: 2025,
    hero: 'https://excellenceriviera.com/wp-content/uploads/2024/04/audi-rs6-performance-1.png',
    images: [
      'https://excellenceriviera.com/wp-content/uploads/2024/04/audi-rs6-performance-1.png',
      'https://excellenceriviera.com/wp-content/uploads/2024/04/audi-rs6-performance-2.jpg',
      'https://excellenceriviera.com/wp-content/uploads/2024/04/audi-rs6-performance-3.jpg',
    ],
    prices: { oneToThreeDays: 1500, fourToSevenDays: 1300, weekPlus: 1100 },
    conditions: COND_SPORT,
    availableCities: DEFAULT_CITIES,
    badge: 'popular',
    desc: 'Daily reference. Five seats, 630 hp, four wheels.',
    descFr: 'La reference au quotidien. Cinq places, 630 ch, quatre roues.',
    bodyEn: 'The Audi RS 6 Performance combines all the comfort of an Audi with one of the most capable sports estates on the market. Five seats, six hundred and thirty horsepower, four-wheel drive that holds the corniche the same way it holds the autoroute. We deliver to airport, hotel, beach or villa across the eighty kilometres of the coast.',
    bodyFr: "L'Audi RS 6 Performance combine tout le confort d'une Audi avec l'un des breaks sportifs les plus capables du marche. Cinq places, six cent trente chevaux, quatre roues motrices qui tiennent la corniche comme elles tiennent l'autoroute. Nous livrons a l'aeroport, l'hotel, la plage ou la villa sur les quatre-vingts kilometres de la cote.",
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
    fuelType: 'gasoline',
    year: 2024,
    hero: 'https://excellenceriviera.com/wp-content/uploads/2020/05/Mercedes-G63-AMG-1-1.jpg',
    images: [
      'https://excellenceriviera.com/wp-content/uploads/2020/05/Mercedes-G63-AMG-1-1.jpg',
      'https://excellenceriviera.com/wp-content/uploads/2020/05/Mercedes-G63-AMG-1-2.jpg',
      'https://excellenceriviera.com/wp-content/uploads/2020/05/Mercedes-G63-AMG-1-3.jpg',
    ],
    prices: { oneToThreeDays: 1300, fourToSevenDays: 1100, weekPlus: 950 },
    conditions: COND_SUV_ICONIC,
    availableCities: DEFAULT_CITIES,
    desc: 'The icon. Square shoulders, 585 hp, the Riviera in stride.',
    descFr: "L'icone. Epaules carrees, 585 ch, la Riviera au pas.",
    bodyEn: 'The G 63 AMG is the icon among iconic SUVs. Square shoulders, twin-turbo V8, five hundred and eighty-five horsepower under a body that has barely changed in forty years. The presence on Cannes Croisette or Saint-Tropez quay needs no introduction. We deliver across the Riviera.',
    bodyFr: "Le G 63 AMG est l'icone parmi les SUV iconiques. Epaules carrees, V8 biturbo, cinq cent quatre-vingt-cinq chevaux sous une carrosserie qui n'a quasiment pas change en quarante ans. La presence sur la Croisette de Cannes ou le quai de Saint-Tropez n'a besoin d'aucune presentation. Nous livrons sur la Riviera.",
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
    fuelType: 'gasoline',
    year: 2024,
    hero: 'https://excellenceriviera.com/wp-content/uploads/2023/04/Range-Rover-Vogue-L-1.jpeg',
    images: [
      'https://excellenceriviera.com/wp-content/uploads/2023/04/Range-Rover-Vogue-L-1.jpeg',
      'https://excellenceriviera.com/wp-content/uploads/2023/04/Range-Rover-Vogue-L-2.jpeg',
      'https://excellenceriviera.com/wp-content/uploads/2023/04/Range-Rover-Vogue-L-3.jpeg',
    ],
    prices: { oneToThreeDays: 950, fourToSevenDays: 850, weekPlus: 720 },
    conditions: COND_SUV_PREMIUM,
    availableCities: DEFAULT_CITIES,
    desc: 'Seven seats, air suspension, the road quietly mastered.',
    descFr: 'Sept places, suspension air, la route maitrisee dans le silence.',
    bodyEn: 'The long-wheelbase Range Rover Vogue is the family flagship of the Riviera. Seven seats, air suspension, five hundred and thirty horsepower under a cabin that holds the silence the German competition cannot quite reach. The vehicle of choice from Nice airport to a villa above Saint-Jean-Cap-Ferrat.',
    bodyFr: 'Le Range Rover Vogue version longue est le vaisseau familial de la Riviera. Sept places, suspension air, cinq cent trente chevaux sous une cabine qui tient le silence que la concurrence allemande n\'atteint pas tout a fait. Le vehicule de choix de l\'aeroport de Nice a une villa au-dessus de Saint-Jean-Cap-Ferrat.',
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
    fuelType: 'diesel',
    year: 2025,
    hero: 'https://excellenceriviera.com/wp-content/uploads/2020/06/Mercedes-Maybach-Classe-S-1.png',
    images: [
      'https://excellenceriviera.com/wp-content/uploads/2020/06/Mercedes-Maybach-Classe-S-1.png',
      'https://excellenceriviera.com/wp-content/uploads/2020/06/Mercedes-Maybach-Classe-S-2.jpg',
      'https://excellenceriviera.com/wp-content/uploads/2020/06/Mercedes-Maybach-Classe-S-3.png',
    ],
    prices: { oneToThreeDays: 1300, fourToSevenDays: 900, weekPlus: 790 },
    conditions: COND_LIMO,
    availableCities: DEFAULT_CITIES,
    desc: 'The cabin as a private salon.',
    descFr: 'La cabine comme un salon prive.',
    bodyEn: 'The Maybach S-Class turns the rear cabin into a private salon. Soundproofed, two reclining seats with massage, a bar, ambient lighting, the small things that change a transfer. Designed to be driven in the back. We deliver across the Riviera.',
    bodyFr: 'La Maybach Classe S transforme la cabine arriere en salon prive. Insonorisee, deux sieges inclinables a massage, un bar, eclairage d\'ambiance, les petites attentions qui changent un transfert. Concue pour etre conduit a l\'arriere. Nous livrons sur la Riviera.',
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
    fuelType: 'gasoline',
    year: 2025,
    hero: 'https://excellenceriviera.com/wp-content/uploads/2024/04/Porsche-991-Turbo-S-992-1.jpg',
    images: [
      'https://excellenceriviera.com/wp-content/uploads/2024/04/Porsche-991-Turbo-S-992-1.jpg',
      'https://excellenceriviera.com/wp-content/uploads/2024/04/Porsche-991-Turbo-S-992-2.jpg',
      'https://excellenceriviera.com/wp-content/uploads/2024/04/Porsche-991-Turbo-S-992-3.jpg',
    ],
    prices: { oneToThreeDays: 1930, fourToSevenDays: 1740, weekPlus: 1460 },
    conditions: COND_SPORT,
    availableCities: DEFAULT_CITIES,
    desc: 'Engineering as restraint. 650 hp, 330 km/h.',
    descFr: "L'ingenierie comme retenue. 650 ch, 330 km/h.",
    bodyEn: 'The 992 Turbo S is engineering as restraint. Six hundred and fifty horsepower, three hundred and thirty kilometres an hour, all-wheel drive, four seats. The car that holds the corniche from Saint-Tropez to Menton without hesitation. We deliver across the Riviera, including direct from Nice airport.',
    bodyFr: 'La 992 Turbo S est l\'ingenierie comme retenue. Six cent cinquante chevaux, trois cent trente kilometres heure, transmission integrale, quatre places. La voiture qui tient la corniche de Saint-Tropez a Menton sans hesitation. Nous livrons sur la Riviera, y compris en direct depuis l\'aeroport de Nice.',
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
    fuelType: 'gasoline',
    year: 2024,
    hero: 'https://excellenceriviera.com/wp-content/uploads/2020/05/Porsche-Cayenne-Turbo-Featured.jpg',
    images: [
      'https://excellenceriviera.com/wp-content/uploads/2020/05/Porsche-Cayenne-Turbo-Featured.jpg',
      'https://excellenceriviera.com/wp-content/uploads/2020/05/Porsche-Cayenne-Turbo-01.jpg',
      'https://excellenceriviera.com/wp-content/uploads/2020/05/Porsche-Cayenne-Turbo-02.jpg',
    ],
    prices: { oneToThreeDays: 910, fourToSevenDays: 860, weekPlus: 810 },
    conditions: COND_SUV_PREMIUM,
    availableCities: DEFAULT_CITIES,
    desc: 'SUV daily reference. 550 hp, all-season.',
    descFr: 'Le SUV de reference au quotidien. 550 ch, toutes saisons.',
    bodyEn: 'The Cayenne Turbo is the daily SUV reference on the Riviera. Five hundred and fifty horsepower, all-wheel drive, five seats with luggage that fits actual luggage. The car you take if you want one car to handle the airport, the corniche, the marina and the dinner above Eze. We deliver across the coast.',
    bodyFr: 'Le Cayenne Turbo est le SUV de reference au quotidien sur la Riviera. Cinq cent cinquante chevaux, transmission integrale, cinq places avec un coffre qui prend de vrais bagages. La voiture que vous prenez si vous voulez une seule voiture pour l\'aeroport, la corniche, le port et le diner au-dessus d\'Eze. Nous livrons sur la cote.',
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
    fuelType: 'gasoline',
    year: 2024,
    hero: 'https://excellenceriviera.com/wp-content/uploads/2020/05/Lamborghini-Urus.jpg',
    images: [
      'https://excellenceriviera.com/wp-content/uploads/2020/05/Lamborghini-Urus.jpg',
      'https://excellenceriviera.com/wp-content/uploads/2020/05/Lamborghini-Urus-1.jpg',
      'https://excellenceriviera.com/wp-content/uploads/2020/05/Lamborghini-Urus-2.jpg',
    ],
    prices: { oneToThreeDays: 2120, fourToSevenDays: 1910, weekPlus: 1800 },
    conditions: COND_SUV_ICONIC,
    availableCities: DEFAULT_CITIES,
    desc: 'Theatrical, head-turning, surprisingly civil.',
    descFr: 'Theatre, presence sur la route, etonnamment civil.',
    bodyEn: 'The Urus is theatre. Six hundred and sixty-six horsepower, twin-turbo V8, four seats, four-wheel drive, three driving modes that go from civil to operatic. The arrival is impossible to miss. The drive is, surprisingly, calm.',
    bodyFr: 'L\'Urus est theatre. Six cent soixante-six chevaux, V8 biturbo, quatre places, transmission integrale, trois modes de conduite qui vont du civil a l\'opera. L\'arrivee est impossible a manquer. La conduite est, etonnamment, calme.',
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
    fuelType: 'gasoline',
    year: 2024,
    hero: 'https://excellenceriviera.com/wp-content/uploads/2020/05/Bentley-Continental-GTC-1.jpg',
    images: [
      'https://excellenceriviera.com/wp-content/uploads/2020/05/Bentley-Continental-GTC-1.jpg',
      'https://excellenceriviera.com/wp-content/uploads/2020/05/Bentley-Continental-GTC-2.jpg',
      'https://excellenceriviera.com/wp-content/uploads/2020/05/Bentley-Continental-GTC-3.jpg',
    ],
    prices: { oneToThreeDays: 2250, fourToSevenDays: 2100, weekPlus: 1800 },
    conditions: COND_GT,
    availableCities: DEFAULT_CITIES,
    desc: 'Quiet British power, top down.',
    descFr: 'Puissance britannique discrete, capote ouverte.',
    bodyEn: 'The Continental GTC is quiet British power, top down. Five hundred and fifty horsepower, four seats, the cabin lined the way Bentley still lines cabins. The Riviera convertible that does not shout. We deliver across the coast.',
    bodyFr: 'La Continental GTC est la puissance britannique discrete, capote ouverte. Cinq cent cinquante chevaux, quatre places, la cabine doublee comme Bentley double encore les cabines. Le cabriolet Riviera qui ne crie pas. Nous livrons sur la cote.',
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
    fuelType: 'hybrid',
    year: 2025,
    hero: 'https://excellenceriviera.com/wp-content/uploads/2024/04/Ferrari-296-GTS.jpg',
    images: [
      'https://excellenceriviera.com/wp-content/uploads/2024/04/Ferrari-296-GTS.jpg',
      'https://excellenceriviera.com/wp-content/uploads/2024/04/Ferrari-296-GTS.1.jpg',
      'https://excellenceriviera.com/wp-content/uploads/2024/04/Ferrari-296-GTS.2.jpg',
    ],
    prices: { oneToThreeDays: 2490, fourToSevenDays: 2280, weekPlus: 1950 },
    conditions: COND_SUPERCAR,
    availableCities: DEFAULT_CITIES,
    desc: 'Hybrid V6 supercar, 830 hp, top down.',
    descFr: 'Supercar V6 hybride, 830 ch, capote ouverte.',
    bodyEn: 'The 296 GTS is the new Ferrari benchmark on the corniche. V6 hybrid, eight hundred and thirty horsepower combined, top open in twelve seconds, two seats, three hundred and thirty kilometres an hour. The supercar that you can also drive into Cannes Croisette without anyone asking you to switch off.',
    bodyFr: 'La 296 GTS est la nouvelle reference Ferrari sur la corniche. V6 hybride, huit cent trente chevaux combines, toit ouvert en douze secondes, deux places, trois cent trente kilometres heure. La supercar que vous pouvez aussi entrer dans la Croisette de Cannes sans qu\'on vous demande d\'eteindre.',
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
    fuelType: 'gasoline',
    year: 2024,
    hero: 'https://excellenceriviera.com/wp-content/uploads/2024/04/Ferrari-roma-spider-1.jpg',
    images: [
      'https://excellenceriviera.com/wp-content/uploads/2024/04/Ferrari-roma-spider-1.jpg',
      'https://excellenceriviera.com/wp-content/uploads/2024/04/Ferrari-roma-spider-2.jpg',
      'https://excellenceriviera.com/wp-content/uploads/2024/04/Ferrari-roma-spider-3.jpg',
    ],
    prices: { oneToThreeDays: 2190, fourToSevenDays: 1990, weekPlus: 1800 },
    conditions: COND_SUPERCAR,
    availableCities: DEFAULT_CITIES,
    desc: 'Italian fire on the corniche. Top down.',
    descFr: 'Le feu italien sur la corniche. Capote ouverte.',
    bodyEn: 'The Roma Spider is the elegant Ferrari. Twin-turbo V8, six hundred and twenty horsepower, soft-top in fourteen seconds, two plus two seats. Less brutal than the 296, more grand tourer than supercar. The car for the corniche, with stops for lunch.',
    bodyFr: 'La Roma Spider est la Ferrari elegante. V8 biturbo, six cent vingt chevaux, capote souple en quatorze secondes, deux plus deux places. Moins brutale que la 296, plus grand tourer que supercar. La voiture pour la corniche, avec arrets pour le dejeuner.',
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
    fuelType: 'gasoline',
    year: 2025,
    hero: 'https://excellenceriviera.com/wp-content/uploads/2020/05/aston-martin-db12-volante-1.jpeg',
    images: [
      'https://excellenceriviera.com/wp-content/uploads/2020/05/aston-martin-db12-volante-1.jpeg',
      'https://excellenceriviera.com/wp-content/uploads/2020/05/aston-martin-db12-volante-2.jpg',
      'https://excellenceriviera.com/wp-content/uploads/2020/05/aston-martin-db12-volante-3.jpeg',
    ],
    prices: { oneToThreeDays: 2500, fourToSevenDays: 2270, weekPlus: 1950 },
    conditions: COND_GT,
    availableCities: DEFAULT_CITIES,
    desc: 'British grand tourer, 680 hp, sky open.',
    descFr: 'Grand tourer britannique, 680 ch, ciel ouvert.',
    bodyEn: 'The DB12 Volante is the Aston you actually drive every day. Twin-turbo V8, six hundred and eighty horsepower, four seats (two real, two more for the children or the bags), soft-top in fourteen seconds. Three hundred and twenty-five kilometres an hour with the sky open.',
    bodyFr: 'La DB12 Volante est l\'Aston que vous conduisez vraiment au quotidien. V8 biturbo, six cent quatre-vingts chevaux, quatre places (deux vraies, deux pour les enfants ou les bagages), capote souple en quatorze secondes. Trois cent vingt-cinq kilometres heure ciel ouvert.',
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
    fuelType: 'gasoline',
    year: 2024,
    hero: 'https://excellenceriviera.com/wp-content/uploads/2020/05/Rolls-Royce-Cullinan-Featured.jpg',
    images: [
      'https://excellenceriviera.com/wp-content/uploads/2020/05/Rolls-Royce-Cullinan-Featured.jpg',
      'https://excellenceriviera.com/wp-content/uploads/2020/05/Rolls-Royce-Cullinan-01.jpg',
      'https://excellenceriviera.com/wp-content/uploads/2020/05/Rolls-Royce-Cullinan-02.jpg',
    ],
    prices: { oneToThreeDays: 3300, fourToSevenDays: 3100, weekPlus: 2900 },
    conditions: COND_FLAGSHIP,
    availableCities: DEFAULT_CITIES,
    badge: 'flagship',
    desc: 'The arrival makes itself felt.',
    descFr: "L'arrivee se fait sentir.",
    bodyEn: 'The Cullinan is the first Rolls-Royce SUV and remains the reference. Twin-turbo V12, five hundred and seventy-one horsepower, five seats, the silence that no other manufacturer can quite match. The arrival makes itself felt without anyone having to say it.',
    bodyFr: 'Le Cullinan est le premier SUV Rolls-Royce et reste la reference. V12 biturbo, cinq cent soixante-et-onze chevaux, cinq places, le silence qu\'aucun autre constructeur n\'atteint tout a fait. L\'arrivee se fait sentir sans que personne n\'ait besoin de le dire.',
  },
];

export function findRentalCarById(id: string | undefined) {
  if (!id) return undefined;
  return RENTAL_CARS.find((c) => c.id === id);
}

export function rentalDailyRate(car: RentalCar, days: number): number {
  if (days >= 7) return car.prices.weekPlus;
  if (days >= 4) return car.prices.fourToSevenDays;
  return car.prices.oneToThreeDays;
}

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

// Marques disponibles dans la flotte (derive de RENTAL_CARS)
export function rentalBrands(): string[] {
  const set = new Set<string>();
  for (const c of RENTAL_CARS) set.add(c.brand);
  return Array.from(set).sort();
}

// Tranches de prix journalier (1-3j) pour filtre
export const RENTAL_PRICE_BUCKETS: { id: string; label: string; min: number; max: number }[] = [
  { id: 'under-1000', label: 'Up to €1,000', min: 0, max: 1000 },
  { id: '1000-2000', label: '€1,000 to €2,000', min: 1000, max: 2000 },
  { id: '2000-3000', label: '€2,000 to €3,000', min: 2000, max: 3000 },
  { id: '3000-plus', label: '€3,000 and more', min: 3000, max: 999999 },
];
