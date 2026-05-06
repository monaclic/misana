// Constants Misana V1, portées depuis le projet V1.
// Source de vérité fallback quand Sanity n'a pas de doc correspondant.
// Slugs verrouillés : ne JAMAIS les changer (URLs publiques + maillage interne).

export const SERVICES = [
  { slug: 'chauffeur', en: 'Chauffeur', fr: 'Chauffeur' },
  { slug: 'cars', en: 'Cars', fr: 'Voitures' },
  { slug: 'yacht', en: 'Yacht', fr: 'Yacht' },
  { slug: 'helicopter', en: 'Helicopter', fr: 'Hélicoptère' },
  { slug: 'access', en: 'Access', fr: 'Access' },
] as const;

export type ServiceSlug = (typeof SERVICES)[number]['slug'];
export const SERVICE_SLUGS = SERVICES.map((s) => s.slug);

export const CITIES = [
  {
    slug: 'monaco',
    en: 'Monaco',
    fr: 'Monaco',
    tier: 'heavy',
    blurbEn: 'Casino, Larvotto, Fontvieille, La Condamine, Monte-Carlo.',
    blurbFr: 'Casino, Larvotto, Fontvieille, la Condamine, Monte-Carlo.',
  },
  {
    slug: 'cannes',
    en: 'Cannes',
    fr: 'Cannes',
    tier: 'heavy',
    blurbEn: 'The Croisette, the Suquet, Californie, Palm Beach.',
    blurbFr: 'La Croisette, le Suquet, la Californie, Palm Beach.',
  },
  {
    slug: 'saint-tropez',
    en: 'Saint-Tropez',
    fr: 'Saint-Tropez',
    tier: 'heavy',
    blurbEn: 'Pampelonne, Ramatuelle, Gassin, the port and the streets behind it.',
    blurbFr: 'Pampelonne, Ramatuelle, Gassin, le port et les ruelles derrière.',
  },
  {
    slug: 'cap-d-antibes',
    en: "Cap d'Antibes",
    fr: "Cap d'Antibes",
    tier: 'stub',
    blurbEn: 'Eden Roc, La Garoupe, the Pinède.',
    blurbFr: 'Eden Roc, La Garoupe, la Pinède.',
  },
  {
    slug: 'nice',
    en: 'Nice',
    fr: 'Nice',
    tier: 'heavy',
    blurbEn: 'NCE airport, the Promenade, Vieux-Nice, Cimiez, Mont Boron.',
    blurbFr: 'Aéroport NCE, la Promenade, le Vieux-Nice, Cimiez, Mont Boron.',
  },
  {
    slug: 'cap-ferrat',
    en: 'Cap-Ferrat',
    fr: 'Cap-Ferrat',
    tier: 'stub',
    blurbEn: 'Cap-Ferrat, Beaulieu, Villefranche, the quiet bays.',
    blurbFr: 'Cap-Ferrat, Beaulieu, Villefranche, les baies discrètes.',
  },
  {
    slug: 'eze',
    en: 'Èze',
    fr: 'Èze',
    tier: 'stub',
    blurbEn: 'Èze village, La Turbie, Roquebrune-Cap-Martin.',
    blurbFr: 'Èze village, La Turbie, Roquebrune-Cap-Martin.',
  },
  {
    slug: 'menton',
    en: 'Menton',
    fr: 'Menton',
    tier: 'stub',
    blurbEn: 'On the Italian border. Palaces, gardens, gastronomy.',
    blurbFr: 'À la frontière italienne. Palaces, jardins, gastronomie.',
  },
] as const;

export type CitySlug = (typeof CITIES)[number]['slug'];
export const CITY_SLUGS = CITIES.map((c) => c.slug);

// EVENTS = source de verite unique pour l'ordre, les noms, les villes,
// et les dates exactes (startDate / endDate). Le contenu editorial
// (image hero, body) reste sur Sanity (mergé par slug dans useEvents).
//
// Ordre : editorial (pas chronologique). monthEn / monthFr / monthOrder
// sont conserves pour compat avec /events et /destinations qui les lisent.
// Le mois affiche sur la home est derive de startDate via Intl pour
// gerer la localisation et l'eventuel changement d'annee.
export const EVENTS = [
  { slug: 'cannes-yachting-festival', en: 'Cannes Yachting Festival', fr: 'Cannes Yachting Festival', monthEn: 'September', monthFr: 'Septembre', monthOrder: 9, tier: 'stub', city: 'cannes',       startDate: '2026-09-08', endDate: '2026-09-13' },
  { slug: 'cannes-lions',             en: 'Cannes Lions',             fr: 'Cannes Lions',             monthEn: 'June',      monthFr: 'Juin',      monthOrder: 6, tier: 'heavy', city: 'cannes',       startDate: '2026-06-22', endDate: '2026-06-26' },
  { slug: 'mipcom',                   en: 'MIPCOM',                   fr: 'MIPCOM',                   monthEn: 'October',   monthFr: 'Octobre',   monthOrder: 10, tier: 'stub', city: 'cannes',       startDate: '2026-10-12', endDate: '2026-10-15' },
  { slug: 'monaco-grand-prix',        en: 'Monaco Grand Prix',        fr: 'Grand Prix de Monaco',     monthEn: 'May',       monthFr: 'Mai',       monthOrder: 5, tier: 'heavy', city: 'monaco',       startDate: '2026-05-21', endDate: '2026-05-24' },
  { slug: 'saint-tropez-voiles',      en: 'Voiles de Saint-Tropez',   fr: 'Voiles de Saint-Tropez',   monthEn: 'October',   monthFr: 'Octobre',   monthOrder: 10, tier: 'stub', city: 'saint-tropez', startDate: '2026-09-26', endDate: '2026-10-03' },
  { slug: 'mipim',                    en: 'MIPIM',                    fr: 'MIPIM',                    monthEn: 'March',     monthFr: 'Mars',      monthOrder: 3, tier: 'stub', city: 'cannes',       startDate: '2026-03-10', endDate: '2026-03-13' },
  { slug: 'festival-de-cannes',       en: 'Festival de Cannes',       fr: 'Festival de Cannes',       monthEn: 'May',       monthFr: 'Mai',       monthOrder: 5, tier: 'heavy', city: 'cannes',       startDate: '2026-05-12', endDate: '2026-05-23' },
  { slug: 'monaco-yacht-show',        en: 'Monaco Yacht Show',        fr: 'Monaco Yacht Show',        monthEn: 'September', monthFr: 'Septembre', monthOrder: 9, tier: 'heavy', city: 'monaco',       startDate: '2026-09-23', endDate: '2026-09-26' },
] as const;

export type EventSlug = (typeof EVENTS)[number]['slug'];
export const EVENT_SLUGS = EVENTS.map((e) => e.slug);

export const WEEKENDS = [
  {
    slug: 'festival-edition',
    en: 'Festival Edition',
    fr: 'Édition Festival',
    blurbEn: 'Cannes during the Festival. Drivers in place by Tuesday. Tables held from Wednesday.',
    blurbFr: 'Cannes pendant le Festival. Chauffeurs en place le mardi. Tables tenues à partir du mercredi.',
    cities: ['cannes'],
    event: 'festival-de-cannes',
  },
  {
    slug: 'grand-prix-edition',
    en: 'Grand Prix Edition',
    fr: 'Édition Grand Prix',
    blurbEn: 'Monaco, race week. Apartment access, terrace tables, the helicopter on call.',
    blurbFr: 'Monaco, semaine de course. Accès appartements, terrasses tenues, hélicoptère en attente.',
    cities: ['monaco'],
    event: 'monaco-grand-prix',
  },
  {
    slug: 'three-days-cap-ferrat',
    en: 'Three Days in Cap-Ferrat',
    fr: 'Trois jours au Cap-Ferrat',
    blurbEn: 'A quieter Riviera. Boat lunches, garden walks, the right table on each evening.',
    blurbFr: 'Une Riviera plus calme. Déjeuners en mer, promenades dans les jardins, la bonne table chaque soir.',
    cities: ['cap-ferrat'],
    event: null,
  },
] as const;

export type WeekendSlug = (typeof WEEKENDS)[number]['slug'];
export const WEEKEND_SLUGS = WEEKENDS.map((w) => w.slug);

// Routes transferts. `bidirectional: true` indique une route symetrique
// (memes heliports / pickup / prix dans les 2 sens). Sur ces routes, le
// reverseSlug 301-redirige vers le slug canonique. Helico sur les 8 villes
// V1 : tout est bidirectional. Asymetrique = chauffeur airport (nice-airport-*).
export const TRANSFERS = [
  // Chauffeur depuis aeroport Nice : asymetrique, pas bidirectional (intent
  // arrivee de voyageur, distinct du sens inverse "vers aeroport").
  { slug: 'nice-airport-monaco', from: 'nice', to: 'monaco', mode: 'chauffeur', en: 'Nice airport to Monaco', fr: "De l'aéroport de Nice à Monaco" },
  { slug: 'nice-airport-cannes', from: 'nice', to: 'cannes', mode: 'chauffeur', en: 'Nice airport to Cannes', fr: "De l'aéroport de Nice à Cannes" },
  { slug: 'nice-airport-saint-tropez', from: 'nice', to: 'saint-tropez', mode: 'chauffeur', en: 'Nice airport to Saint-Tropez', fr: "De l'aéroport de Nice à Saint-Tropez" },
  { slug: 'nice-airport-cap-ferrat', from: 'nice', to: 'cap-ferrat', mode: 'chauffeur', en: 'Nice airport to Cap-Ferrat', fr: "De l'aéroport de Nice au Cap-Ferrat" },
  { slug: 'nice-airport-cap-d-antibes', from: 'nice', to: 'cap-d-antibes', mode: 'chauffeur', en: "Nice airport to Cap d'Antibes", fr: "De l'aéroport de Nice au Cap d'Antibes" },
  { slug: 'nice-airport-eze', from: 'nice', to: 'eze', mode: 'chauffeur', en: 'Nice airport to Èze', fr: "De l'aéroport de Nice à Èze" },
  { slug: 'nice-airport-menton', from: 'nice', to: 'menton', mode: 'chauffeur', en: 'Nice airport to Menton', fr: "De l'aéroport de Nice à Menton" },

  // Routes ville-a-ville : bidirectional (service symetrique). 1 page canonique
  // par paire, le reverseSlug 301-redirige vers le canonique avec ?from= pour
  // orienter le widget. SEO concentre, evite la cannibalisation.
  { slug: 'cannes-monaco', from: 'cannes', to: 'monaco', mode: 'both', bidirectional: true, reverseSlug: 'monaco-cannes', en: 'Cannes to Monaco', fr: 'Cannes à Monaco' },
  { slug: 'cannes-saint-tropez', from: 'cannes', to: 'saint-tropez', mode: 'both', bidirectional: true, reverseSlug: 'saint-tropez-cannes', en: 'Cannes to Saint-Tropez', fr: 'Cannes à Saint-Tropez' },
  { slug: 'cannes-nice', from: 'cannes', to: 'nice', mode: 'chauffeur', bidirectional: true, reverseSlug: 'nice-cannes', en: 'Cannes to Nice', fr: 'Cannes à Nice' },
  { slug: 'monaco-saint-tropez', from: 'monaco', to: 'saint-tropez', mode: 'helicopter', bidirectional: true, reverseSlug: 'saint-tropez-monaco', en: 'Monaco to Saint-Tropez', fr: 'Monaco à Saint-Tropez' },
  { slug: 'monaco-cap-ferrat', from: 'monaco', to: 'cap-ferrat', mode: 'chauffeur', bidirectional: true, reverseSlug: 'cap-ferrat-monaco', en: 'Monaco to Cap-Ferrat', fr: 'Monaco au Cap-Ferrat' },
  { slug: 'monaco-eze', from: 'monaco', to: 'eze', mode: 'chauffeur', bidirectional: true, reverseSlug: 'eze-monaco', en: 'Monaco to Èze', fr: 'Monaco à Èze' },
  { slug: 'monaco-menton', from: 'monaco', to: 'menton', mode: 'chauffeur', bidirectional: true, reverseSlug: 'menton-monaco', en: 'Monaco to Menton', fr: 'Monaco à Menton' },
  { slug: 'saint-tropez-cap-d-antibes', from: 'saint-tropez', to: 'cap-d-antibes', mode: 'chauffeur', bidirectional: true, reverseSlug: 'cap-d-antibes-saint-tropez', en: "Saint-Tropez to Cap d'Antibes", fr: "Saint-Tropez au Cap d'Antibes" },
  { slug: 'cap-ferrat-saint-tropez', from: 'cap-ferrat', to: 'saint-tropez', mode: 'helicopter', bidirectional: true, reverseSlug: 'saint-tropez-cap-ferrat', en: 'Cap-Ferrat to Saint-Tropez', fr: 'Cap-Ferrat à Saint-Tropez' },
  { slug: 'cap-d-antibes-monaco', from: 'cap-d-antibes', to: 'monaco', mode: 'chauffeur', bidirectional: true, reverseSlug: 'monaco-cap-d-antibes', en: "Cap d'Antibes to Monaco", fr: "Cap d'Antibes à Monaco" },
  { slug: 'cap-d-antibes-cannes', from: 'cap-d-antibes', to: 'cannes', mode: 'chauffeur', bidirectional: true, reverseSlug: 'cannes-cap-d-antibes', en: "Cap d'Antibes to Cannes", fr: "Cap d'Antibes à Cannes" },
  { slug: 'menton-cannes', from: 'menton', to: 'cannes', mode: 'chauffeur', bidirectional: true, reverseSlug: 'cannes-menton', en: 'Menton to Cannes', fr: 'Menton à Cannes' },
  { slug: 'eze-cap-ferrat', from: 'eze', to: 'cap-ferrat', mode: 'chauffeur', bidirectional: true, reverseSlug: 'cap-ferrat-eze', en: 'Èze to Cap-Ferrat', fr: 'Èze au Cap-Ferrat' },

  // Routes helicoptere strategiques V1 (cibles SEO Nice-Monaco, Nice-Cannes, etc.)
  { slug: 'nice-monaco', from: 'nice', to: 'monaco', mode: 'helicopter', bidirectional: true, reverseSlug: 'monaco-nice', en: 'Nice to Monaco', fr: 'Nice à Monaco' },
  { slug: 'nice-cannes', from: 'nice', to: 'cannes', mode: 'helicopter', bidirectional: true, reverseSlug: 'cannes-nice', en: 'Nice to Cannes', fr: 'Nice à Cannes' },
  { slug: 'nice-saint-tropez', from: 'nice', to: 'saint-tropez', mode: 'helicopter', bidirectional: true, reverseSlug: 'saint-tropez-nice', en: 'Nice to Saint-Tropez', fr: 'Nice à Saint-Tropez' },
] as const;

export type TransferSlug = (typeof TRANSFERS)[number]['slug'];
export const TRANSFER_SLUGS = TRANSFERS.map((t) => t.slug);

export const ESTABLISHMENTS = [
  { slug: 'le-louis-xv', name: 'Le Louis XV', category: 'restaurant', city: 'monaco' },
  { slug: 'la-vague-d-or', name: "La Vague d'Or", category: 'restaurant', city: 'saint-tropez' },
  { slug: 'mirazur', name: 'Mirazur', category: 'restaurant', city: 'menton' },
  { slug: 'la-palme-d-or', name: "La Palme d'Or", category: 'restaurant', city: 'cannes' },
  { slug: 'le-chantecler', name: 'Le Chantecler', category: 'restaurant', city: 'nice' },
  { slug: 'cap-eden-roc', name: 'Hôtel du Cap-Eden-Roc', category: 'palace', city: 'cap-d-antibes' },
  { slug: 'carlton-cannes', name: 'Hôtel Carlton', category: 'palace', city: 'cannes' },
  { slug: 'martinez-cannes', name: 'Hôtel Martinez', category: 'palace', city: 'cannes' },
  { slug: 'grand-hotel-cap-ferrat', name: 'Grand-Hôtel du Cap-Ferrat', category: 'palace', city: 'cap-ferrat' },
  { slug: 'hotel-de-paris-monte-carlo', name: 'Hôtel de Paris Monte-Carlo', category: 'palace', city: 'monaco' },
  { slug: 'club-55', name: 'Club 55', category: 'beach-club', city: 'saint-tropez' },
  { slug: 'bagatelle', name: 'Bagatelle', category: 'beach-club', city: 'saint-tropez' },
  { slug: 'jimmy-z', name: "Jimmy'z", category: 'nightclub', city: 'monaco' },
  { slug: 'baoli', name: 'Bâoli', category: 'nightclub', city: 'cannes' },
  { slug: 'plage-beau-rivage', name: 'La Plage Beau Rivage', category: 'beach-club', city: 'nice' },
] as const;

export type EstablishmentSlug = (typeof ESTABLISHMENTS)[number]['slug'];
export const ESTABLISHMENT_SLUGS = ESTABLISHMENTS.map((e) => e.slug);

// Service availability matrix : V1 = tous services dans toutes les villes (sauf yacht).
export const SERVICE_AVAILABILITY: Record<ServiceSlug, readonly CitySlug[]> = {
  chauffeur: CITY_SLUGS,
  cars: CITY_SLUGS,
  yacht: ['saint-tropez', 'cannes', 'cap-d-antibes', 'cap-ferrat', 'nice', 'monaco', 'menton'],
  helicopter: CITY_SLUGS,
  access: CITY_SLUGS,
};
