// Mega menu data, porté tel quel depuis V1.
// Les hrefs sont sans préfixe locale ; le composant Header ajoute le préfixe via
// useLocalePath() de @nuxtjs/i18n.

import { CITIES, EVENTS, WEEKENDS, type ServiceSlug } from '~/lib/constants';

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

export function getMega(key: MegaKey, locale: Locale): MegaContent {
  const cityCol = (servicesSlug: ServiceSlug | null): Col => ({
    titleEn: 'By city',
    titleFr: 'Par ville',
    items: CITIES.map((c) => ({
      label: locale === 'fr' ? c.fr : c.en,
      href: servicesSlug ? `/services/${servicesSlug}/${c.slug}` : `/destinations/${c.slug}`,
    })),
  });

  switch (key) {
    case 'chauffeur':
      return {
        columns: [
          cityCol('chauffeur'),
          {
            titleEn: 'Type of service',
            titleFr: 'Type de service',
            items: [
              { label: locale === 'fr' ? 'Transfert aéroport' : 'Airport transfer', href: '/services/chauffeur#airport' },
              { label: locale === 'fr' ? 'Chauffeur à l\'heure' : 'Hourly chauffeur', href: '/services/chauffeur#hourly' },
              { label: locale === 'fr' ? 'Mise à disposition journée' : 'Daily disposal', href: '/services/chauffeur#daily' },
              { label: locale === 'fr' ? 'Longue distance' : 'Long distance', href: '/services/chauffeur#long-distance' },
              { label: 'Yacht-limo', href: '/services/chauffeur#yacht-limo' },
            ],
          },
          {
            titleEn: 'For events',
            titleFr: 'Évènements',
            items: [
              { label: 'Festival de Cannes', href: '/events/festival-de-cannes' },
              { label: locale === 'fr' ? 'Grand Prix de Monaco' : 'Monaco Grand Prix', href: '/events/monaco-grand-prix' },
              { label: 'Cannes Lions', href: '/events/cannes-lions' },
              { label: 'Monaco Yacht Show', href: '/events/monaco-yacht-show' },
            ],
          },
        ],
        cta: { en: 'Discover the service', fr: 'Découvrir le service', href: '/services/chauffeur' },
      };

    case 'cars':
      return {
        columns: [
          {
            titleEn: 'Grand Tourer',
            titleFr: 'Grand Tourer',
            items: [
              { label: 'Bentley Continental', href: '/services/cars#grand-tourer' },
              { label: 'Rolls-Royce Cullinan', href: '/services/cars#grand-tourer' },
              { label: 'Aston Martin DB12', href: '/services/cars#grand-tourer' },
              { label: 'Range Rover Vogue', href: '/services/cars#grand-tourer' },
              { label: 'Mercedes Maybach', href: '/services/cars#grand-tourer' },
              { label: 'Bentley Bentayga', href: '/services/cars#grand-tourer' },
            ],
          },
          {
            titleEn: 'Supercars',
            titleFr: 'Supercars',
            items: [
              { label: 'Ferrari Roma', href: '/services/cars#supercars' },
              { label: 'Ferrari SF90', href: '/services/cars#supercars' },
              { label: 'Lamborghini Urus', href: '/services/cars#supercars' },
              { label: 'Lamborghini Huracán', href: '/services/cars#supercars' },
              { label: 'McLaren Artura', href: '/services/cars#supercars' },
              { label: 'Porsche 911 Turbo S', href: '/services/cars#supercars' },
            ],
          },
          {
            titleEn: 'By occasion',
            titleFr: 'Par occasion',
            items: [
              { label: locale === 'fr' ? 'Arrivées Festival' : 'Festival arrivals', href: '/events/festival-de-cannes' },
              { label: locale === 'fr' ? 'Grand Prix' : 'Grand Prix', href: '/events/monaco-grand-prix' },
              { label: locale === 'fr' ? 'Mariage' : 'Wedding', href: '/services/cars#wedding' },
              { label: locale === 'fr' ? 'Long weekend' : 'Long weekend', href: '/services/cars#weekend' },
              { label: locale === 'fr' ? 'Semaine yacht' : 'Yacht week', href: '/services/cars#yacht-week' },
            ],
          },
        ],
        cta: { en: 'Discover the service', fr: 'Découvrir le service', href: '/services/cars' },
      };

    case 'yacht':
      return {
        columns: [
          {
            titleEn: 'Day cruise',
            titleFr: 'Journée',
            items: [
              { label: locale === 'fr' ? 'Demi-journée' : 'Half-day', href: '/services/yacht#day' },
              { label: locale === 'fr' ? 'Journée complète' : 'Full day', href: '/services/yacht#day' },
              { label: 'Sunset', href: '/services/yacht#day' },
              { label: locale === 'fr' ? 'Nuit privée' : 'Private overnight', href: '/services/yacht#overnight' },
            ],
          },
          {
            titleEn: 'Week charter',
            titleFr: 'Semaine',
            items: [
              { label: '36 to 60 ft', href: '/services/yacht#week' },
              { label: '60 to 100 ft', href: '/services/yacht#week' },
              { label: '100 ft and up', href: '/services/yacht#week' },
            ],
          },
          {
            titleEn: 'From',
            titleFr: 'Au départ de',
            items: [
              { label: 'Monaco', href: '/services/yacht/monaco' },
              { label: 'Cannes', href: '/services/yacht/cannes' },
              { label: 'Saint-Tropez', href: '/services/yacht/saint-tropez' },
              { label: 'Antibes', href: '/services/yacht/cap-d-antibes' },
            ],
          },
        ],
        cta: { en: 'Discover the service', fr: 'Découvrir le service', href: '/services/yacht' },
      };

    case 'helicopter':
      return {
        columns: [
          {
            titleEn: 'Routes',
            titleFr: 'Routes',
            items: [
              { label: 'Nice → Monaco', href: '/transfers/nice-airport-monaco' },
              { label: 'Nice → Cannes', href: '/transfers/nice-airport-cannes' },
              { label: 'Nice → Saint-Tropez', href: '/transfers/nice-airport-saint-tropez' },
              { label: 'Cannes → Saint-Tropez', href: '/transfers/cannes-saint-tropez' },
              { label: 'Cannes → Monaco', href: '/transfers/cannes-monaco' },
              { label: 'Saint-Tropez → Monaco', href: '/transfers/monaco-saint-tropez' },
            ],
          },
          {
            titleEn: 'Tours',
            titleFr: 'Tours',
            items: [
              { label: locale === 'fr' ? 'Cap-Ferrat panoramique' : 'Cap-Ferrat panoramic', href: '/services/helicopter#tours' },
              { label: 'Cannes Bay tour', href: '/services/helicopter#tours' },
              { label: locale === 'fr' ? 'Estérel et Lérins' : 'Estérel and Lérins', href: '/services/helicopter#tours' },
              { label: locale === 'fr' ? 'Provence' : 'Provence countryside', href: '/services/helicopter#tours' },
            ],
          },
          {
            titleEn: 'For events',
            titleFr: 'Évènements',
            items: [
              { label: 'Festival de Cannes', href: '/events/festival-de-cannes' },
              { label: locale === 'fr' ? 'Grand Prix de Monaco' : 'Monaco Grand Prix', href: '/events/monaco-grand-prix' },
              { label: 'Monaco Yacht Show', href: '/events/monaco-yacht-show' },
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
          {
            titleEn: 'By event',
            titleFr: 'Par évènement',
            items: EVENTS.filter((e) => e.tier === 'heavy').map((e) => ({
              label: locale === 'fr' ? e.fr : e.en,
              href: `/events/${e.slug}`,
            })),
          },
          {
            titleEn: 'Read',
            titleFr: 'Lire',
            items: [
              { label: locale === 'fr' ? 'Guide Cannes' : 'Cannes guide', href: '/journal' },
              { label: locale === 'fr' ? 'Monaco initié' : 'Monaco insider', href: '/journal' },
              { label: locale === 'fr' ? 'Restaurants Saint-Tropez' : 'Saint-Tropez restaurants', href: '/journal' },
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
            titleEn: 'Curated weekends',
            titleFr: 'Weekends curated',
            items: WEEKENDS.map((w) => ({
              label: locale === 'fr' ? w.fr : w.en,
              href: `/weekends/${w.slug}`,
            })),
          },
        ],
        cta: { en: 'All events', fr: 'Tous les évènements', href: '/events' },
      };

    case 'about':
      return {
        columns: [
          {
            titleEn: 'The Maison',
            titleFr: 'La Maison',
            items: [
              { label: locale === 'fr' ? 'Le récit' : 'The story', href: '/about#story' },
              { label: locale === 'fr' ? "L'équipe" : 'The team', href: '/about#team' },
              { label: locale === 'fr' ? 'La côte' : 'The coast', href: '/about#coast' },
            ],
          },
          {
            titleEn: 'Read',
            titleFr: 'Lire',
            items: [
              { label: 'Journal', href: '/journal' },
              { label: locale === 'fr' ? 'Guides Riviera' : 'Riviera guides', href: '/journal' },
              { label: locale === 'fr' ? 'Conseils initiés' : 'Insider tips', href: '/journal' },
              { label: locale === 'fr' ? 'Trois jours au Cap-Ferrat' : 'Cap-Ferrat 3 days', href: '/weekends/three-days-cap-ferrat' },
              { label: locale === 'fr' ? 'Cannes en mai' : 'Cannes during May', href: '/events/festival-de-cannes' },
            ],
          },
          {
            titleEn: 'Get in touch',
            titleFr: 'Nous joindre',
            items: [
              { label: 'Contact', href: '/contact' },
              { label: locale === 'fr' ? 'Presse' : 'Press', href: '/contact' },
            ],
          },
        ],
        cta: { en: 'The house', fr: 'La maison', href: '/about' },
      };
  }
}
