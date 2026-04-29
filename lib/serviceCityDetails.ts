// Donnees fiche service x ville V1 hardcoded.
// 1 fiche full pour test design (chauffeur:cannes), stub procedural ensuite.
// Voix Misana : factuelle, sobre, mots-cles SEO naturels.

import { TRANSFERS } from '~/lib/constants';

export type ServiceCityDetail = {
  heroImage: string;
  illustration: string;
  signature: { fr: string; en: string };
  about: { fr: string; en: string };
  whyHere: { fr: string[]; en: string[] };
  whatWeOrchestrate: {
    titleFr: string;
    titleEn: string;
    descFr: string;
    descEn: string;
  }[];
  popularTransferSlugs: string[];
  faq: { q: { fr: string; en: string }; a: { fr: string; en: string } }[];
  priceFrom: number;
  priceUnit: { fr: string; en: string };
  metrics: { labelFr: string; labelEn: string; value: string }[];
};

const DETAILS: Record<string, ServiceCityDetail> = {
  'chauffeur:cannes': {
    heroImage: 'https://images.unsplash.com/photo-1543874768-2df4cdc1ddc8?w=2000&q=85',
    illustration: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=1600&q=80',
    signature: {
      fr: 'Mercedes V-Class à votre porte sur la Croisette.',
      en: 'Mercedes V-Class at your door on the Croisette.',
    },
    about: {
      fr: 'Le service chauffeur Misana à Cannes opère sept jours sur sept, vingt-quatre heures sur vingt-quatre, avec une flotte Mercedes V-Class et S-Class pré-positionnée sur la Croisette en haute saison. Que ce soit pour un transfert depuis l\'aéroport de Nice, un déplacement vers Monaco ou Saint-Tropez, une mise à disposition à la journée, ou les besoins logistiques pendant le Festival de Cannes, notre équipe coordonne le chauffeur, la voiture, l\'itinéraire et l\'accueil. Tarif transparent à partir de cent vingt euros par transfert, réponse sous deux heures en jours ouvrés, annulation gratuite jusqu\'à vingt-quatre heures avant le départ.',
      en: 'Misana\'s chauffeur service in Cannes operates seven days a week, twenty-four hours a day, with a Mercedes V-Class and S-Class fleet pre-positioned on the Croisette in peak season. Whether for a transfer from Nice airport, a trip to Monaco or Saint-Tropez, a day disposal, or logistical needs during the Cannes Film Festival, our team coordinates the driver, the car, the route, and the welcome. Transparent pricing from one hundred twenty euros per transfer, reply within two hours on business days, free cancellation up to twenty-four hours before departure.',
    },
    whyHere: {
      fr: [
        'Flotte Mercedes V-Class et S-Class pré-positionnée sur la Croisette en haute saison.',
        'Relations directes avec les concierges du Carlton, Martinez, Majestic et Grand Hyatt.',
        'Opérations Festival de Cannes maîtrisées : protocoles tapis rouge, sécurité nocturne, transferts entre projections.',
        'Chauffeurs anglophones par défaut, multilingue sur demande (italien, allemand, arabe, mandarin).',
        'Véhicule de remplacement disponible sous quinze minutes en cas d\'imprévu.',
      ],
      en: [
        'Mercedes V-Class and S-Class fleet pre-positioned on the Croisette in peak season.',
        'Direct relationships with Carlton, Martinez, Majestic and Grand Hyatt concierges.',
        'Cannes Festival operations mastered: red carpet protocols, late-night security, transfers between screenings.',
        'English-speaking drivers by default, multilingual on request (Italian, German, Arabic, Mandarin).',
        'Replacement vehicle available within fifteen minutes in case of incident.',
      ],
    },
    whatWeOrchestrate: [
      {
        titleFr: 'Transferts hôtels',
        titleEn: 'Hotel transfers',
        descFr: 'Pickup et dépose à votre adresse exacte sur la Croisette ou dans les hauteurs cannoises. Carlton, Martinez, Majestic, Grand Hyatt accessibles directement.',
        descEn: 'Pickup and drop-off at your exact address on the Croisette or in the Cannes hills. Carlton, Martinez, Majestic, Grand Hyatt directly accessible.',
      },
      {
        titleFr: 'Logistique Festival',
        titleEn: 'Festival logistics',
        descFr: 'Pickup tapis rouge, transferts entre projections, sécurisation des nuits tardives. Coordination préalable avec les studios et agences.',
        descEn: 'Red carpet pickup, transfers between screenings, securing late nights. Prior coordination with studios and agencies.',
      },
      {
        titleFr: 'Mise à disposition',
        titleEn: 'Day disposal',
        descFr: 'Huit heures ou douze heures avec le même chauffeur, à votre rythme. Idéal pour rendez-vous d\'affaires, shopping, ou journées multi-visites.',
        descEn: 'Eight or twelve hours with the same driver, at your pace. Ideal for business meetings, shopping, or multi-visit days.',
      },
      {
        titleFr: 'Transferts aéroport',
        titleEn: 'Airport transfers',
        descFr: 'Aéroport de Nice en trente minutes hors pointe par l\'A8. Suivi des vols, attente gratuite jusqu\'à une heure, panneau au nom du voyageur.',
        descEn: 'Nice airport in thirty minutes off-peak via the A8. Flight tracking, one hour of free waiting, name sign for the traveller.',
      },
    ],
    popularTransferSlugs: [
      'nice-airport-cannes',
      'cannes-monaco',
      'cannes-saint-tropez',
      'cannes-nice',
    ],
    faq: [
      {
        q: { fr: 'Combien coûte un chauffeur à Cannes ?', en: 'How much does a chauffeur in Cannes cost?' },
        a: {
          fr: 'À partir de €120 pour un transfert simple en Mercedes V-Class. €180 en S-Class. Mise à disposition à la journée à partir de €700 pour 8 heures.',
          en: 'From €120 for a simple transfer in Mercedes V-Class. €180 in S-Class. Day disposal from €700 for 8 hours.',
        },
      },
      {
        q: { fr: 'Pendant le Festival de Cannes ?', en: 'During the Cannes Film Festival?' },
        a: {
          fr: 'Réservation conseillée trois à cinq jours avant minimum. Trafic A8 saturé, basse corniche en backup. Coordination avec les studios sur demande.',
          en: 'Booking advised three to five days ahead minimum. A8 traffic saturated, lower corniche as backup. Coordination with studios on request.',
        },
      },
      {
        q: { fr: 'Quels véhicules disponibles à Cannes ?', en: 'Which vehicles are available in Cannes?' },
        a: {
          fr: 'Mercedes V-Class par défaut (jusqu\'à 7 passagers, 4 grandes valises). Mercedes S-Class pour 3 passagers discrets. Range Rover sur demande pour terrain ou prestige.',
          en: 'Mercedes V-Class by default (up to 7 passengers, 4 large suitcases). Mercedes S-Class for 3 discreet passengers. Range Rover on request for terrain or prestige.',
        },
      },
      {
        q: { fr: 'Sièges enfants disponibles ?', en: 'Child seats available?' },
        a: {
          fr: 'Oui, sur demande à la réservation. Sièges bébé, rehausseurs, configuration deux ou trois enfants possible.',
          en: 'Yes, on request at booking. Baby seats, boosters, two or three children configuration possible.',
        },
      },
      {
        q: { fr: 'Le chauffeur parle-t-il anglais ?', en: 'Does the chauffeur speak English?' },
        a: {
          fr: 'Oui, par défaut. Italien, allemand, arabe, mandarin disponibles sur demande préalable.',
          en: 'Yes, by default. Italian, German, Arabic, Mandarin available on prior request.',
        },
      },
      {
        q: { fr: 'Annulation ?', en: 'Cancellation?' },
        a: {
          fr: 'Gratuite jusqu\'à vingt-quatre heures avant. 50% retenus entre 24h et 4h. 100% moins de 4h ou no-show.',
          en: 'Free up to twenty-four hours before. 50% retained between 24h and 4h. 100% less than 4h or no-show.',
        },
      },
    ],
    priceFrom: 120,
    priceUnit: { fr: 'par transfert', en: 'per transfer' },
    metrics: [
      { labelFr: 'À partir de', labelEn: 'From', value: '€120' },
      { labelFr: 'Véhicule', labelEn: 'Vehicle', value: 'V-Class · S-Class' },
      { labelFr: 'Service', labelEn: 'Service', value: '24/7' },
      { labelFr: 'Couverture', labelEn: 'Coverage', value: '8 cities · 80km' },
    ],
  },
};

export function getServiceCityDetail(service: string, city: string): ServiceCityDetail | null {
  return DETAILS[`${service}:${city}`] ?? null;
}

// Pour les options populaires : recupere les TransferEntry referencees.
export function getPopularTransfers(slugs: string[]): typeof TRANSFERS[number][] {
  return slugs
    .map((slug) => TRANSFERS.find((t) => t.slug === slug))
    .filter(Boolean) as typeof TRANSFERS[number][];
}

export function formatPrice(price: number, locale: 'fr' | 'en'): string {
  return new Intl.NumberFormat(locale === 'fr' ? 'fr-FR' : 'en-GB', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(price);
}
