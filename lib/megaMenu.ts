// Mega menu V1 : navigation principale uniquement.
// Les pages service x ville et service x event sont des landings SEO,
// trouvees via Google, pas via le menu. On ne les link pas ici.

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

const HEAVY_EVENTS = EVENTS.filter((e) => e.tier === 'heavy');

export function getMega(key: MegaKey, locale: Locale): MegaContent {
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
            titleEn: 'By type',
            titleFr: 'Par type',
            items: [
              { label: locale === 'fr' ? 'Yachts moteur' : 'Motor yachts', href: '/services/yacht/all?type=motor' },
              { label: locale === 'fr' ? 'Voiliers' : 'Sailing yachts', href: '/services/yacht/all?type=sail' },
              { label: 'Catamarans', href: '/services/yacht/all?type=catamaran' },
            ],
          },
          {
            titleEn: 'By port of departure',
            titleFr: 'Par port de départ',
            items: [
              { label: 'Cannes', href: '/services/yacht/all?port=cannes' },
              { label: 'Monaco', href: '/services/yacht/all?port=monaco' },
              { label: 'Saint-Tropez', href: '/services/yacht/all?port=saint-tropez' },
            ],
          },
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
            titleEn: 'Highlights',
            titleFr: 'Phares',
            items: HEAVY_EVENTS.map((e) => ({
              label: locale === 'fr' ? e.fr : e.en,
              href: `/events/${e.slug}`,
            })),
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
        ],
        cta: { en: 'About Misana', fr: 'À propos de Misana', href: '/about' },
      };
  }
}
