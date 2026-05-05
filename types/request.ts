// Misana V1 - tronc /request
// Enums et constantes partagés entre client (UI) et serveur (zod, persistence).

export const SERVICES = ['chauffeur', 'cars', 'yacht', 'helicopter', 'access'] as const;
export type Service = (typeof SERVICES)[number];

export const DESTINATIONS = [
  'saint-tropez',
  'cannes',
  'cap-d-antibes',
  'cap-ferrat',
  'nice',
  'eze',
  'monaco',
  'menton',
  'other',
] as const;
export type Destination = (typeof DESTINATIONS)[number];

// Heliports zone Riviera (codes IATA officiels).
// Note voix Misana : pas d em-dash. Le code IATA est ajoute en suffixe sobre.
export const HELIPORTS = [
  { id: 'NCE', city: 'nice', label: 'Nice · NCE' },
  { id: 'MCM', city: 'monaco', label: 'Monaco · MCM' },
  { id: 'CEQ', city: 'cannes', label: 'Cannes Mandelieu · CEQ' },
  { id: 'CNQ', city: 'cannes', label: 'Cannes Quai du Large · CNQ' },
  { id: 'LTT', city: 'saint-tropez', label: 'Saint-Tropez La Môle · LTT' },
  { id: 'STG', city: 'saint-tropez', label: 'Saint-Tropez Grimaud · STG' },
] as const;
export const HELIPORT_IDS = HELIPORTS.map((h) => h.id) as readonly string[];
export type HeliportId = (typeof HELIPORTS)[number]['id'];

// Chauffeur sub-types (One Way / By the Hour)
export const CHAUFFEUR_SUBTYPES = ['one-way', 'by-the-hour'] as const;
export type ChauffeurSubtype = (typeof CHAUFFEUR_SUBTYPES)[number];

// Cars : type + brand. Brand list filtrée luxe (no Lambo slang, full names).
export const CAR_TYPES = ['grand-tourer', 'supercar', 'convertible', 'suv', 'sedan'] as const;
export type CarType = (typeof CAR_TYPES)[number];

export const CAR_BRANDS = [
  'ferrari',
  'lamborghini',
  'bentley',
  'rolls-royce',
  'aston-martin',
  'porsche',
  'maybach',
  'mercedes',
] as const;
export type CarBrand = (typeof CAR_BRANDS)[number];

export const DRIVER_AGE_BRACKETS = ['21-25', '26-30', '31+'] as const;
export type DriverAgeBracket = (typeof DRIVER_AGE_BRACKETS)[number];

// Yacht : day vs week + size brackets en mètres.
export const YACHT_DURATIONS = ['day', 'multi-day', 'week'] as const;
export type YachtDuration = (typeof YACHT_DURATIONS)[number];

export const YACHT_SIZES = ['15-20m', '20-30m', '30-50m', '50m+'] as const;
export type YachtSize = (typeof YACHT_SIZES)[number];

// Access : occasion + categories.
export const OCCASIONS = [
  'none',
  'birthday',
  'anniversary',
  'proposal',
  'business-dinner',
  'celebration',
  'other',
] as const;
export type Occasion = (typeof OCCASIONS)[number];

export const ACCESS_CATEGORIES = ['restaurant', 'palace', 'beach-club', 'nightlife', 'other'] as const;
export type AccessCategory = (typeof ACCESS_CATEGORIES)[number];

// 4 etapes du tronc. Les dates sont integrees dans le panel du service, pas
// dans une etape generique : chaque service a sa propre logique de scheduling
// (chauffeur a un retour optionnel, yacht a une duree, cars a debut+fin, etc.).
export const REQUEST_STEPS = ['context', 'detail', 'contact', 'review'] as const;
export type RequestStep = (typeof REQUEST_STEPS)[number];

export const REPLY_LANGS = ['en', 'fr'] as const;
export type ReplyLang = (typeof REPLY_LANGS)[number];
