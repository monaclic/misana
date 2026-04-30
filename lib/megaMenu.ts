// Mega menu V1. Toujours 3 colonnes pleines (la grille AppHeader est grid-cols-3).
// Les pages service x ville et service x event sont des landings SEO,
// trouvees via Google, pas via le menu. On ne les link pas ici.
// Les fiches /events/[slug] sont des pages publiques V1, on peut y pointer.

import { CITIES, EVENTS } from '~/lib/constants';

type Locale = 'en' | 'fr';

type Col = {
  titleEn: string;
  titleFr: string;
  items: { label: string; href: string }[];
};

export type MegaContent = {
  columns: Col[];
  cta: { en: string; fr: string; href: string };
};

export type MegaKey =
  | 'chauffeur'
  | 'cars'
  | 'yacht'
  | 'helicopter'
  | 'access'
  | 'destinations'
  | 'events'
  | 'about';

export const NAV_ENTRIES: { key: MegaKey; en: string; fr: string }[] = [
  { key: 'chauffeur', en: 'Chauffeur', fr: 'Chauffeur' },
  { key: 'cars', en: 'Cars', fr: 'Voitures' },
  { key: 'yacht', en: 'Yacht', fr: 'Yacht' },
  { key: 'helicopter', en: 'Helicopter', fr: 'Hélicoptère' },
  { key: 'access', en: 'Access', fr: 'Access' },
  { key: 'destinations', en: 'Destinations', fr: 'Destinations' },
  { key: 'events', en: 'Events', fr: 'Évènements' },
  { key: 'about', en: 'About', fr: 'La Maison' },
];

const HEAVY_CITIES = CITIES.filter((c) => c.tier === 'heavy');
const HEAVY_EVENTS = EVENTS.filter((e) => e.tier === 'heavy');

export function getMega(key: MegaKey, locale: Locale): MegaContent {
  const eventsCol = (): Col => ({
    titleEn: 'For events',
    titleFr: 'Évènements',
    items: HEAVY_EVENTS.map((e) => ({
      label: locale === 'fr' ? e.fr : e.en,
      href: `/events/${e.slug}`,
    })),
  });

  switch (key) {
    case 'chauffeur':
      return {
        columns: [
          {
            titleEn: 'Popular routes',
            titleFr: 'Routes populaires',
            items: [
              { label: 'Nice Airport → Monaco', href: '/transfers/chauffeur/nice-airport-monaco' },
              { label: 'Nice Airport → Cannes', href: '/transfers/chauffeur/nice-airport-cannes' },
              { label: 'Nice Airport → Saint-Tropez', href: '/transfers/chauffeur/nice-airport-saint-tropez' },
              { label: 'Cannes ↔ Monaco', href: '/transfers/chauffeur/cannes-monaco' },
              { label: 'Cannes ↔ Saint-Tropez', href: '/transfers/chauffeur/cannes-saint-tropez' },
              { label: locale === 'fr' ? 'Tous les transferts' : 'All transfers', href: '/transfers' },
            ],
          },
          {
            titleEn: 'Use cases',
            titleFr: 'Cas d\'usage',
            items: [
              { label: locale === 'fr' ? 'Transferts aéroport' : 'Airport transfers', href: '/services/chauffeur' },
              { label: locale === 'fr' ? 'Mise à disposition journée' : 'Day at disposal', href: '/services/chauffeur' },
              { label: locale === 'fr' ? 'Évènements et galas' : 'Events and galas', href: '/services/chauffeur' },
              { label: locale === 'fr' ? 'Mariages' : 'Weddings', href: '/services/chauffeur' },
              { label: locale === 'fr' ? 'Séjours plusieurs jours' : 'Multi-day stays', href: '/services/chauffeur' },
            ],
          },
          eventsCol(),
        ],
        cta: { en: 'Discover the service', fr: 'Découvrir le service', href: '/services/chauffeur' },
      };

    case 'cars':
      return {
        columns: [
          {
            titleEn: 'By category',
            titleFr: 'Par catégorie',
            items: [
              { label: locale === 'fr' ? 'Supercars' : 'Supercars', href: '/services/cars/all?category=supercar' },
              { label: locale === 'fr' ? 'Performance' : 'Performance', href: '/services/cars/all?category=sport' },
              { label: 'SUV', href: '/services/cars/all?category=suv' },
              { label: locale === 'fr' ? 'Cabriolets' : 'Convertibles', href: '/services/cars/all?category=convertible' },
              { label: locale === 'fr' ? 'Berlines' : 'Sedans', href: '/services/cars/all?category=sedan' },
              { label: locale === 'fr' ? 'Toutes les voitures' : 'All cars', href: '/services/cars/all' },
            ],
          },
          {
            titleEn: 'By brand',
            titleFr: 'Par marque',
            items: [
              { label: 'Ferrari', href: '/services/cars/all?brand=ferrari' },
              { label: 'Lamborghini', href: '/services/cars/all?brand=lamborghini' },
              { label: 'Porsche', href: '/services/cars/all?brand=porsche' },
              { label: 'Bentley', href: '/services/cars/all?brand=bentley' },
              { label: 'Rolls Royce', href: '/services/cars/all?brand=rolls-royce' },
              { label: 'Mercedes', href: '/services/cars/all?brand=mercedes' },
            ],
          },
          eventsCol(),
        ],
        cta: { en: 'Discover the service', fr: 'Découvrir le service', href: '/services/cars' },
      };

    case 'yacht':
      return {
        columns: [
          {
            titleEn: 'By size',
            titleFr: 'Par taille',
            items: [
              { label: locale === 'fr' ? '15 à 20 mètres' : '15 to 20 metres', href: '/services/yacht/all?size=15-20m' },
              { label: locale === 'fr' ? '20 à 30 mètres' : '20 to 30 metres', href: '/services/yacht/all?size=20-30m' },
              { label: locale === 'fr' ? '30 à 50 mètres' : '30 to 50 metres', href: '/services/yacht/all?size=30-50m' },
              { label: locale === 'fr' ? 'Plus de 50 mètres' : 'Above 50 metres', href: '/services/yacht/all?size=50m%2B' },
              { label: locale === 'fr' ? 'Tous les yachts' : 'All yachts', href: '/services/yacht/all' },
            ],
          },
          {
            titleEn: 'By port and type',
            titleFr: 'Par port et type',
            items: [
              { label: 'Cannes', href: '/services/yacht/all?port=cannes' },
              { label: 'Monaco', href: '/services/yacht/all?port=monaco' },
              { label: 'Saint-Tropez', href: '/services/yacht/all?port=saint-tropez' },
              { label: locale === 'fr' ? 'Yachts moteur' : 'Motor yachts', href: '/services/yacht/all?type=motor' },
              { label: locale === 'fr' ? 'Voiliers' : 'Sailing yachts', href: '/services/yacht/all?type=sail' },
              { label: 'Catamarans', href: '/services/yacht/all?type=catamaran' },
            ],
          },
          eventsCol(),
        ],
        cta: { en: 'Discover the service', fr: 'Découvrir le service', href: '/services/yacht' },
      };

    case 'helicopter':
      return {
        columns: [
          {
            titleEn: 'Popular routes',
            titleFr: 'Routes populaires',
            items: [
              { label: 'Nice ↔ Monaco', href: '/transfers/helicopter/nice-monaco' },
              { label: 'Nice ↔ Cannes', href: '/transfers/helicopter/nice-cannes' },
              { label: 'Nice ↔ Saint-Tropez', href: '/transfers/helicopter/nice-saint-tropez' },
              { label: 'Cannes ↔ Saint-Tropez', href: '/transfers/helicopter/cannes-saint-tropez' },
              { label: 'Cannes ↔ Monaco', href: '/transfers/helicopter/cannes-monaco' },
              { label: 'Monaco ↔ Saint-Tropez', href: '/transfers/helicopter/monaco-saint-tropez' },
            ],
          },
          {
            titleEn: 'Heliports',
            titleFr: 'Héliports',
            items: [
              { label: locale === 'fr' ? 'Nice Aéroport' : 'Nice Airport', href: '/services/helicopter' },
              { label: 'Monaco Fontvieille', href: '/services/helicopter' },
              { label: 'Cannes Mandelieu', href: '/services/helicopter' },
              { label: 'Saint-Tropez La Mole', href: '/services/helicopter' },
            ],
          },
          eventsCol(),
        ],
        cta: { en: 'Discover the service', fr: 'Découvrir le service', href: '/services/helicopter' },
      };

    case 'access':
      return {
        columns: [
          {
            titleEn: 'Restaurants',
            titleFr: 'Restaurants',
            items: [
              { label: 'Le Louis XV', href: '/services/access/le-louis-xv' },
              { label: "La Vague d'Or", href: '/services/access/la-vague-d-or' },
              { label: 'Mirazur', href: '/services/access/mirazur' },
              { label: "La Palme d'Or", href: '/services/access/la-palme-d-or' },
              { label: 'Le Chantecler', href: '/services/access/le-chantecler' },
            ],
          },
          {
            titleEn: 'Palaces',
            titleFr: 'Palaces',
            items: [
              { label: 'Hôtel du Cap-Eden-Roc', href: '/services/access/cap-eden-roc' },
              { label: 'Hôtel Carlton', href: '/services/access/carlton-cannes' },
              { label: 'Hôtel Martinez', href: '/services/access/martinez-cannes' },
              { label: 'Grand-Hôtel du Cap-Ferrat', href: '/services/access/grand-hotel-cap-ferrat' },
              { label: 'Hôtel de Paris Monte-Carlo', href: '/services/access/hotel-de-paris-monte-carlo' },
            ],
          },
          {
            titleEn: 'Beach and clubs',
            titleFr: 'Plages et clubs',
            items: [
              { label: 'Club 55', href: '/services/access/club-55' },
              { label: 'Bagatelle', href: '/services/access/bagatelle' },
              { label: "Jimmy'z", href: '/services/access/jimmy-z' },
              { label: 'Bâoli', href: '/services/access/baoli' },
              { label: 'La Plage Beau Rivage', href: '/services/access/plage-beau-rivage' },
            ],
          },
        ],
        cta: { en: 'Discover the service', fr: 'Découvrir le service', href: '/services/access' },
      };

    case 'destinations':
      return {
        columns: [
          {
            titleEn: 'On the coast',
            titleFr: 'Sur la côte',
            items: CITIES.map((c) => ({
              label: locale === 'fr' ? c.fr : c.en,
              href: `/destinations/${c.slug}`,
            })),
          },
          eventsCol(),
          {
            titleEn: 'By service',
            titleFr: 'Par service',
            items: [
              { label: 'Chauffeur', href: '/services/chauffeur' },
              { label: locale === 'fr' ? 'Voitures' : 'Cars', href: '/services/cars' },
              { label: 'Yacht', href: '/services/yacht' },
              { label: locale === 'fr' ? 'Hélicoptère' : 'Helicopter', href: '/services/helicopter' },
              { label: 'Access', href: '/services/access' },
            ],
          },
        ],
        cta: { en: 'All destinations', fr: 'Toutes les destinations', href: '/destinations' },
      };

    case 'events':
      return {
        columns: [
          {
            titleEn: 'By date',
            titleFr: 'Par date',
            items: EVENTS.slice()
              .sort((a, b) => a.monthOrder - b.monthOrder)
              .map((e) => ({
                label: `${locale === 'fr' ? e.fr : e.en} (${locale === 'fr' ? e.monthFr : e.monthEn})`,
                href: `/events/${e.slug}`,
              })),
          },
          {
            titleEn: 'In the cities',
            titleFr: 'Dans les villes',
            items: HEAVY_CITIES.map((c) => ({
              label: locale === 'fr' ? c.fr : c.en,
              href: `/destinations/${c.slug}`,
            })),
          },
          {
            titleEn: 'By service',
            titleFr: 'Par service',
            items: [
              { label: 'Chauffeur', href: '/services/chauffeur' },
              { label: locale === 'fr' ? 'Voitures' : 'Cars', href: '/services/cars' },
              { label: 'Yacht', href: '/services/yacht' },
              { label: locale === 'fr' ? 'Hélicoptère' : 'Helicopter', href: '/services/helicopter' },
              { label: 'Access', href: '/services/access' },
            ],
          },
        ],
        cta: { en: 'All events', fr: 'Tous les évènements', href: '/events' },
      };

    case 'about':
      return {
        columns: [
          {
            titleEn: 'About Misana',
            titleFr: 'À propos de Misana',
            items: [
              { label: locale === 'fr' ? "L'approche" : 'Our approach', href: '/about#philosophy' },
              { label: locale === 'fr' ? "L'histoire" : 'Our story', href: '/about#story' },
              { label: locale === 'fr' ? 'Découvrir' : 'Discover', href: '/about' },
            ],
          },
          {
            titleEn: 'Get in touch',
            titleFr: 'Nous joindre',
            items: [
              { label: 'Contact', href: '/contact' },
              { label: locale === 'fr' ? 'Faire une demande' : 'Make a request', href: '/request' },
              { label: locale === 'fr' ? 'Presse' : 'Press', href: '/contact?subject=press' },
              { label: locale === 'fr' ? 'Carrières' : 'Careers', href: '/contact?subject=careers' },
              { label: locale === 'fr' ? 'Partenaires' : 'Partners', href: '/contact?subject=partners' },
            ],
          },
          {
            titleEn: 'Reach us',
            titleFr: 'Joindre',
            items: [
              { label: '+33 4 00 00 00 00', href: 'tel:+33400000000' },
              { label: 'WhatsApp +33 6 00 00 00 00', href: 'https://wa.me/33600000000' },
              { label: 'hello@misana.com', href: 'mailto:hello@misana.com' },
            ],
          },
        ],
        cta: { en: 'About Misana', fr: 'À propos de Misana', href: '/about' },
      };
  }
}
