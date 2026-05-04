// Catalogue flotte Misana V1, calque depuis Leader Limousines (operateurs Riviera
// communs, pas de duplication metier). Aucune image V1 : placeholders typo
// jusqu au photoshoot. Aucun prix : regle voix de marque Misana.

export type Vehicle = {
  id: string;
  name: string;
  sub: string; // sub-label EN
  subFr: string;
  pax: number;
  luggage: number;
  features: string[];
  featuresFr: string[];
  badge?: 'popular' | 'flagship';
  image?: string;        // photo principale (compat anciens callers)
  images?: string[];     // carousel exterieur + interieur
  // contain (default) pour PNG transparents Leader, cover pour photos
  // realistes avec backdrop (ex Sprinter passenger).
  imageMode?: 'contain' | 'cover';
};

// Images : reference Leader Limousines (operateurs/vehicules communs sur la
// Riviera). A remplacer par photoshoot Misana en V1.5.
export const VEHICLES: Vehicle[] = [
  {
    id: 'e-class',
    name: 'Mercedes E-Class',
    sub: 'Executive sedan',
    subFr: 'Berline executive',
    pax: 3,
    luggage: 3,
    features: ['Leather', 'Climate', 'WiFi'],
    featuresFr: ['Cuir', 'Climatisation', 'WiFi'],
    image: 'https://www.leaderlimousines.com/cdn/shop/files/Mercedes_E-Class_Side_Chauffeur_2.png?v=1709116415&width=1500',
    images: [
      'https://www.leaderlimousines.com/cdn/shop/files/Mercedes_E-Class_Side_Chauffeur_2.png?v=1709116415&width=1500',
      'https://www.leaderlimousines.com/cdn/shop/files/Mercedes_interieur_zoom_volant.jpg?v=1700607572&width=1500',
      'https://www.leaderlimousines.com/cdn/shop/files/Mercedes_interieur_zoom_portiere.jpg?v=1700607678&width=1500',
    ],
  },
  {
    id: 'v-class',
    name: 'Mercedes V-Class',
    sub: 'Seven seats',
    subFr: 'Van sept places',
    pax: 7,
    luggage: 7,
    features: ['Captain seats', 'Privacy glass'],
    featuresFr: ['Sieges captain', 'Vitres teintees'],
    badge: 'popular',
    image: 'https://www.leaderlimousines.com/cdn/shop/files/V_Class_png_side_817c9155-c0c4-470e-8000-1c14c7279a03.png?v=1729808886&width=1500',
    images: [
      'https://www.leaderlimousines.com/cdn/shop/files/V_Class_png_side_817c9155-c0c4-470e-8000-1c14c7279a03.png?v=1729808886&width=1500',
      'https://www.leaderlimousines.com/cdn/shop/files/Mercedes_V_Class_conference_seating_Leader_Limousines.jpg?v=1699546230&width=1500',
      'https://www.leaderlimousines.com/cdn/shop/files/Van_Mercedes_Trunk_Luggages_Chauffeur_Service.jpg?v=1700610861&width=1500',
    ],
  },
  {
    id: 's-class',
    name: 'Mercedes S-Class',
    sub: 'Limousine',
    subFr: 'Limousine',
    pax: 3,
    luggage: 3,
    features: ['Massage', 'Ambient', 'Bar'],
    featuresFr: ['Massage', 'Ambient', 'Bar'],
    badge: 'flagship',
    image: 'https://www.leaderlimousines.com/cdn/shop/files/Mercedes_S-Class_Side_Chauffeur_2.png?v=1709115636&width=1500',
    images: [
      'https://www.leaderlimousines.com/cdn/shop/files/Mercedes_S-Class_Side_Chauffeur_2.png?v=1709115636&width=1500',
      'https://www.leaderlimousines.com/cdn/shop/files/Mercedes_Classe-S_3.jpg?v=1733442767&width=1500',
      'https://www.leaderlimousines.com/cdn/shop/files/Mercedes_Classe-S_5.jpg?v=1733442767&width=1500',
    ],
  },
  {
    id: 'range-rover',
    name: 'Range Rover Vogue',
    sub: 'All-terrain',
    subFr: 'Tout-terrain',
    pax: 4,
    luggage: 4,
    features: ['Air suspension', 'Off-road'],
    featuresFr: ['Suspension air', 'Tout-terrain'],
    image: 'https://www.leaderlimousines.com/cdn/shop/files/Range_Rover_Side_View_2_Chauffeur_Service.png',
    images: [
      'https://www.leaderlimousines.com/cdn/shop/files/Range_Rover_Vogue_Side_979b4478-c93c-4949-b2e8-ccba2888906c.jpg',
      'https://www.leaderlimousines.com/cdn/shop/files/Range_Rover_Vogue_Interior_Rear.jpg',
      'https://www.leaderlimousines.com/cdn/shop/files/the-new-range-rover-on-board-technology.jpg',
    ],
  },
  {
    id: 'maybach',
    name: 'Mercedes-Maybach S 680',
    sub: 'Top of the line',
    subFr: 'Haut de gamme',
    pax: 3,
    luggage: 3,
    features: ['Soundproofed cabin', 'Massage', 'Bar'],
    featuresFr: ['Cabine insonorisée', 'Massage', 'Bar'],
    badge: 'flagship',
    image: 'https://www.leaderlimousines.com/cdn/shop/files/Mercedes_Maybach_S680_Black_-_Chauffeur_service_49a51ad3-8a8c-457e-ad8d-d46cc5b453d9.png',
    images: [
      'https://www.leaderlimousines.com/cdn/shop/files/Mercedes_Maybach_S680_Black_-_Chauffeur_service_49a51ad3-8a8c-457e-ad8d-d46cc5b453d9.png',
      'https://www.leaderlimousines.com/cdn/shop/files/3d73a7a4-6175-4b22-ab47-54096d4e9135.jpg',
      'https://www.leaderlimousines.com/cdn/shop/files/74fabf4a-7b5b-47b2-838c-ac73e75d3a18.jpg',
    ],
  },
  {
    id: 'minibus',
    name: 'Mercedes Sprinter VIP',
    sub: 'Minibus',
    subFr: 'Minibus',
    pax: 16,
    luggage: 16,
    features: ['Reclining seats', 'Privacy glass', 'WiFi'],
    featuresFr: ['Sièges inclinables', 'Vitres teintées', 'WiFi'],
    // Photo realiste Sprinter Passenger (Adventure Masters).
    // Backdrop sky -> imageMode cover sur fond stone dans la card.
    image: 'https://adventuremasters.ma/wp-content/uploads/2025/05/XXL_MB_Sprinter_Passenger_EXT_1.jpg',
    images: [
      'https://adventuremasters.ma/wp-content/uploads/2025/05/XXL_MB_Sprinter_Passenger_EXT_1.jpg',
    ],
    imageMode: 'cover',
  },
];

// Tarification chauffeur Misana V1 :
// prix indicatif = max(minFare, baseFare + km * perKm).
// Aller simple, taxes incluses, accueil a la porte + assistance bagages inclus.
// Source : marche haut de gamme Riviera (Welcome Pickups, SIXT Ride, op locaux).
export const VEHICLE_PRICING: Record<string, { baseFare: number; perKm: number; minFare: number }> = {
  'e-class':     { baseFare: 70, perKm: 2.5, minFare: 110 },
  'v-class':     { baseFare: 90, perKm: 3.0, minFare: 140 },
  's-class':     { baseFare: 110, perKm: 3.5, minFare: 170 },
  'range-rover': { baseFare: 110, perKm: 3.5, minFare: 170 },
  'maybach':     { baseFare: 160, perKm: 5.0, minFare: 250 },
  'minibus':     { baseFare: 150, perKm: 4.0, minFare: 250 },
};

export function priceForVehicleByKm(vehicleId: string, distanceKm: number | undefined | null): number | null {
  if (!distanceKm || distanceKm <= 0) return null;
  const p = VEHICLE_PRICING[vehicleId];
  if (!p) return null;
  return Math.round(Math.max(p.minFare, p.baseFare + distanceKm * p.perKm));
}

export type Helicopter = {
  id: string;
  name: string;
  engine: string; // sub
  engineFr: string;
  pax: number;
  speedKmh: number;
  luggage: string; // ex "3·2 bags"
  desc: string;
  descFr: string;
  badge?: 'flagship';
  image?: string;        // photo exterieure principale
  images?: string[];     // carousel exterieur + interieur
};

export const HELICOPTERS: Helicopter[] = [
  {
    id: 'h125',
    name: 'Airbus H125',
    engine: 'Single-engine',
    engineFr: 'Monomoteur',
    pax: 5,
    speedKmh: 230,
    luggage: '3·2 bags',
    desc: 'Flagship light utility.',
    descFr: 'Utilitaire leger de reference.',
    image: 'https://www.leaderlimousines.com/cdn/shop/files/Helicopter_H125_flying_over_the_sea.jpg?v=1773610994&width=800',
    images: [
      'https://www.leaderlimousines.com/cdn/shop/files/Helicopter_H125_flying_over_the_sea.jpg?v=1773610994&width=800',
      'https://www.leaderlimousines.com/cdn/shop/files/Interior_Helicopter_Airbus_H_125_6a5a2b1a-0042-4b40-80e4-88512e229f76.jpg?v=1773532778&width=800',
    ],
  },
  {
    id: 'h130',
    name: 'Airbus H130',
    engine: 'Single-engine',
    engineFr: 'Monomoteur',
    pax: 6,
    speedKmh: 230,
    luggage: '3·3 bags',
    desc: 'Panoramic windows, wider cabin.',
    descFr: 'Vitres panoramiques, cabine plus large.',
    image: 'https://www.leaderlimousines.com/cdn/shop/files/Helicopter_H130_Single_engine.webp?v=1773612506&width=800',
    images: [
      'https://www.leaderlimousines.com/cdn/shop/files/Helicopter_H130_Single_engine.webp?v=1773612506&width=800',
      'https://www.leaderlimousines.com/cdn/shop/files/Interior_Helicopter_Airbus_H_130_2acafb6b-cb03-4019-975c-feb2c49e8724.jpg?v=1773533019&width=800',
    ],
  },
  {
    id: 'as355',
    name: 'Airbus AS355',
    engine: 'Twin-engine',
    engineFr: 'Bimoteur',
    pax: 5,
    speedKmh: 220,
    luggage: '3·2 bags',
    desc: 'Twin-engine reliability.',
    descFr: 'Fiabilite bimoteur.',
    image: 'https://www.leaderlimousines.com/cdn/shop/files/Helicopter_AS355_flying_over_the_sea.jpg?v=1773611237&width=800',
    images: [
      'https://www.leaderlimousines.com/cdn/shop/files/Helicopter_AS355_flying_over_the_sea.jpg?v=1773611237&width=800',
      'https://www.leaderlimousines.com/cdn/shop/files/Interior_Helicopter_Airbus_AS_355_0f66714c-902b-4178-83d5-ea9a3a82fb1e.jpg?v=1773533158&width=800',
    ],
  },
  {
    id: 'h135',
    name: 'Airbus H135',
    engine: 'Twin-engine',
    engineFr: 'Bimoteur',
    pax: 5,
    speedKmh: 220,
    luggage: '3·2 bags',
    desc: 'Fast, silent, agile.',
    descFr: 'Rapide, silencieux, agile.',
    image: 'https://www.leaderlimousines.com/cdn/shop/files/Helicopter_H135.jpg?v=1773612598&width=800',
    images: [
      'https://www.leaderlimousines.com/cdn/shop/files/Helicopter_H135.jpg?v=1773612598&width=800',
      'https://www.leaderlimousines.com/cdn/shop/files/Airbus_H135_interior.webp?v=1773541534&width=800',
    ],
  },
  {
    id: 'bell429',
    name: 'Bell 429',
    engine: 'Twin-engine',
    engineFr: 'Bimoteur',
    pax: 6,
    speedKmh: 250,
    luggage: '4·4 bags',
    desc: 'Spacious cabin, 722 km range.',
    descFr: 'Cabine spacieuse, autonomie 722 km.',
    image: 'https://www.leaderlimousines.com/cdn/shop/files/Bell_429.webp?v=1773612671&width=800',
    images: [
      'https://www.leaderlimousines.com/cdn/shop/files/Bell_429.webp?v=1773612671&width=800',
      'https://www.leaderlimousines.com/cdn/shop/files/Interior_Helicopter_Bell_429.jpg?v=1733993759&width=800',
    ],
  },
  {
    id: 'h155',
    name: 'Airbus H155',
    engine: 'Twin-engine',
    engineFr: 'Bimoteur',
    pax: 6,
    speedKmh: 280,
    luggage: '5·5 bags',
    desc: 'Ultra-quiet flagship, 280 km/h.',
    descFr: 'Haut de gamme ultra-silencieux, 280 km/h.',
    badge: 'flagship',
    image: 'https://www.leaderlimousines.com/cdn/shop/files/Airbus_H155.webp?v=1773541829&width=800',
    images: [
      'https://www.leaderlimousines.com/cdn/shop/files/Airbus_H155.webp?v=1773541829&width=800',
      'https://www.leaderlimousines.com/cdn/shop/files/Airbus_H155_interior.webp?v=1773541852&width=800',
    ],
  },
];

export type CarBrandCard = {
  id:
    | 'ferrari'
    | 'lamborghini'
    | 'bentley'
    | 'rolls-royce'
    | 'aston-martin'
    | 'porsche'
    | 'maybach'
    | 'mercedes';
  name: string;
  models: string;
  modelsFr: string;
  vibe: string;
  vibeFr: string;
};

export const CAR_BRAND_CARDS: CarBrandCard[] = [
  {
    id: 'ferrari',
    name: 'Ferrari',
    models: 'Roma, SF90, 296, Purosangue',
    modelsFr: 'Roma, SF90, 296, Purosangue',
    vibe: 'Italian fire on the corniche.',
    vibeFr: 'Le feu italien sur la corniche.',
  },
  {
    id: 'lamborghini',
    name: 'Lamborghini',
    models: 'Huracan, Urus, Revuelto',
    modelsFr: 'Huracan, Urus, Revuelto',
    vibe: 'Theatrical, head-turning.',
    vibeFr: 'Theatre, presence sur la route.',
  },
  {
    id: 'bentley',
    name: 'Bentley',
    models: 'Continental GT, Bentayga, Flying Spur',
    modelsFr: 'Continental GT, Bentayga, Flying Spur',
    vibe: 'Quiet British power.',
    vibeFr: 'Puissance britannique discrete.',
  },
  {
    id: 'rolls-royce',
    name: 'Rolls-Royce',
    models: 'Cullinan, Ghost, Spectre',
    modelsFr: 'Cullinan, Ghost, Spectre',
    vibe: 'The arrival makes itself felt.',
    vibeFr: "L'arrivee se fait sentir.",
  },
  {
    id: 'aston-martin',
    name: 'Aston Martin',
    models: 'DB12, Vantage, DBX',
    modelsFr: 'DB12, Vantage, DBX',
    vibe: 'British grand tourer.',
    vibeFr: 'Grand tourer britannique.',
  },
  {
    id: 'porsche',
    name: 'Porsche',
    models: '911 Turbo S, 992 GTS, Taycan',
    modelsFr: '911 Turbo S, 992 GTS, Taycan',
    vibe: 'Engineering as restraint.',
    vibeFr: "L'ingenierie comme retenue.",
  },
  {
    id: 'maybach',
    name: 'Mercedes-Maybach',
    models: 'S 680, GLS 600',
    modelsFr: 'S 680, GLS 600',
    vibe: 'Cabin as private salon.',
    vibeFr: 'Cabine comme salon prive.',
  },
  {
    id: 'mercedes',
    name: 'Mercedes-Benz',
    models: 'S-Class, AMG GT, EQS',
    modelsFr: 'S-Class, AMG GT, EQS',
    vibe: 'Daily benchmark.',
    vibeFr: 'Reference quotidienne.',
  },
];

export type YachtSizeCard = {
  id: '15-20m' | '20-30m' | '30-50m' | '50m+';
  label: string;
  pax: string;
  vibe: string;
  vibeFr: string;
  image?: string;
};

export const YACHT_SIZE_CARDS: YachtSizeCard[] = [
  {
    id: '15-20m',
    label: '15 to 20 m',
    pax: 'Up to 8 guests',
    vibe: 'Day cruise along Pampelonne or Cap-Ferrat.',
    vibeFr: 'Journee Pampelonne ou Cap-Ferrat.',
    image: 'https://www.leaderlimousines.com/cdn/shop/files/Yacht_monaco_673102a3-8e25-49d2-8df9-b80b5a23d9da.jpg?v=1705761087&width=1500',
  },
  {
    id: '20-30m',
    label: '20 to 30 m',
    pax: 'Up to 10 guests',
    vibe: 'A weekend at sea, with cabins.',
    vibeFr: 'Un weekend en mer, cabines a bord.',
    image: 'https://www.leaderlimousines.com/cdn/shop/files/yacht_paddle.jpg?v=1680700129&width=1500',
  },
  {
    id: '30-50m',
    label: '30 to 50 m',
    pax: 'Up to 12 guests',
    vibe: 'Mediterranean week. Crew of six.',
    vibeFr: 'Semaine en Mediterranee. Equipage de six.',
    image: 'https://www.leaderlimousines.com/cdn/shop/files/best-luxury-concierge-service-reviews-luxe-digital_jpg.webp?v=1680945305&width=1500',
  },
  {
    id: '50m+',
    label: '50 m and more',
    pax: 'Up to 12 guests, six suites',
    vibe: 'A floating maison.',
    vibeFr: 'Une maison flottante.',
    image: 'https://www.leaderlimousines.com/cdn/shop/files/HD-wallpaper-luxury-white-yacht-aerial-view-sea-waves-boat-large-yacht-summer-travel-travel-concepts.jpg?v=1680905163&width=1500',
  },
];
