// Donnees enrichies par etablissement V1 hardcoded, en attendant Sanity.
// Voix Misana : factuelle, sobre, sans superlatif, sans tiret long.

import type { EstablishmentSlug } from '~/lib/constants';

export type ServiceOption = 'lunch' | 'dinner' | 'evening' | 'stay';

export type EstablishmentDetail = {
  hero: string;
  thumbs: string[];
  signature: { fr: string; en: string };
  housePick: boolean;
  factualLabels?: { fr: string[]; en: string[] };
  bestFor?: { fr: string[]; en: string[] };
  about?: { fr: string; en: string };
  practical: {
    address: { fr: string; en: string };
    cuisine?: { fr: string; en: string };
    chef?: string;
    hours?: { fr: string; en: string };
    dressCode?: { fr: string; en: string };
    year?: number;
  };
  teamNotes?: { fr: string; en: string };
  faq?: { question: { fr: string; en: string }; answer: { fr: string; en: string } }[];
  reservation: {
    enabled: boolean;
    minGuests: number;
    maxGuests: number;
    leadTimeHours: number;
    serviceOptions: ServiceOption[];
  };
};

export const HOUSE_PICKS: EstablishmentSlug[] = ['mirazur', 'grand-hotel-cap-ferrat', 'club-55'];

export const ESTABLISHMENT_IMAGES: Record<string, string> = {
  'le-louis-xv': 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1600&q=80',
  'la-vague-d-or': 'https://images.unsplash.com/photo-1551918120-9739cb430c6d?w=1600&q=80',
  'mirazur': 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=1600&q=80',
  'la-palme-d-or': 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=1600&q=80',
  'le-chantecler': 'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=1600&q=80',
  'cap-eden-roc': 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1600&q=80',
  'carlton-cannes': 'https://images.unsplash.com/photo-1519452575417-564c1401ecc0?w=1600&q=80',
  'martinez-cannes': 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1600&q=80',
  'grand-hotel-cap-ferrat': 'https://images.unsplash.com/photo-1551918120-9739cb430c6d?w=1600&q=80',
  'hotel-de-paris-monte-carlo': 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=1600&q=80',
  'club-55': 'https://images.unsplash.com/photo-1530541930197-ff16ac917b0e?w=1600&q=80',
  'bagatelle': 'https://images.unsplash.com/photo-1505761671935-60b3a7427bad?w=1600&q=80',
  'plage-beau-rivage': 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1600&q=80',
  'jimmy-z': 'https://images.unsplash.com/photo-1571266028243-e1c2c5b15e2d?w=1600&q=80',
  'baoli': 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=1600&q=80',
};

const SIGNATURES: Record<string, { fr: string; en: string }> = {
  'le-louis-xv': { fr: 'Trois étoiles à Monte-Carlo, depuis 1987.', en: 'Three stars in Monte-Carlo, since 1987.' },
  'la-vague-d-or': { fr: 'Trois étoiles, face à la baie de Saint-Tropez.', en: 'Three stars, facing the bay of Saint-Tropez.' },
  'mirazur': { fr: 'Là où la Riviera s\'achève et le potager commence.', en: 'Where the Riviera ends, and the potager begins.' },
  'la-palme-d-or': { fr: 'Au Martinez, sur la Croisette.', en: 'At the Martinez, on the Croisette.' },
  'le-chantecler': { fr: 'Au Negresco, sur la Promenade des Anglais.', en: 'At the Negresco, on the Promenade des Anglais.' },
  'cap-eden-roc': { fr: 'Sur la pointe d\'Antibes, ouvert depuis 1870.', en: 'On the tip of Antibes, open since 1870.' },
  'carlton-cannes': { fr: 'Façade blanche sur la Croisette.', en: 'White facade on the Croisette.' },
  'martinez-cannes': { fr: 'Art déco face au tapis rouge.', en: 'Art deco facing the red carpet.' },
  'grand-hotel-cap-ferrat': { fr: 'Grand parc, vue sur la baie de Beaulieu.', en: 'Wide grounds, a view over Beaulieu bay.' },
  'hotel-de-paris-monte-carlo': { fr: 'Place du Casino, l\'adresse de Monaco.', en: 'Place du Casino, the address in Monaco.' },
  'club-55': { fr: 'Pampelonne, le déjeuner depuis 1955.', en: 'Pampelonne, lunch since 1955.' },
  'bagatelle': { fr: 'L\'après-midi qui s\'étire, à Saint-Tropez.', en: 'An afternoon that stretches, in Saint-Tropez.' },
  'plage-beau-rivage': { fr: 'Promenade des Anglais, sur le sable.', en: 'Promenade des Anglais, on the sand.' },
  'jimmy-z': { fr: 'Au Sporting, l\'heure tardive de Monte-Carlo.', en: 'At the Sporting, the late hour of Monte-Carlo.' },
  'baoli': { fr: 'Port Canto, la nuit de Cannes.', en: 'Port Canto, the night of Cannes.' },
};

// Pools de thumbs V1 par categorie. A remplacer en photoshoot V1.5.
const RESTO_THUMBS = [
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80',
  'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=600&q=80',
  'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600&q=80',
];
const PALACE_THUMBS = [
  'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600&q=80',
  'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=600&q=80',
  'https://images.unsplash.com/photo-1551918120-9739cb430c6d?w=600&q=80',
];
const BEACH_THUMBS = [
  'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&q=80',
  'https://images.unsplash.com/photo-1505761671935-60b3a7427bad?w=600&q=80',
  'https://images.unsplash.com/photo-1530541930197-ff16ac917b0e?w=600&q=80',
];
const NIGHT_THUMBS = [
  'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=600&q=80',
  'https://images.unsplash.com/photo-1571266028243-e1c2c5b15e2d?w=600&q=80',
];

const DETAILS: Partial<Record<EstablishmentSlug, EstablishmentDetail>> = {
  // ============================================
  // RESTAURANTS
  // ============================================
  'le-louis-xv': {
    hero: ESTABLISHMENT_IMAGES['le-louis-xv'] as string,
    thumbs: RESTO_THUMBS,
    signature: SIGNATURES['le-louis-xv'] as { fr: string; en: string },
    housePick: false,
    factualLabels: {
      fr: ['Trois étoiles Michelin', 'Hôtel de Paris', 'Depuis 1987'],
      en: ['Three Michelin Stars', 'Hôtel de Paris', 'Since 1987'],
    },
    bestFor: {
      fr: ['dîner d\'occasion', 'rendez-vous d\'affaires', 'anniversaire'],
      en: ['special dinner', 'business', 'anniversary'],
    },
    about: {
      fr: 'Au sein de l\'Hôtel de Paris, à Monte-Carlo, la salle Louis XV ouvre sur la Place du Casino. Cuisine méditerranéenne, produits de la côte et de l\'arrière-pays. Ouvert en 1987 sous Alain Ducasse, l\'adresse a obtenu sa troisième étoile en 1990, première table d\'hôtel à atteindre ce niveau.',
      en: 'Within the Hôtel de Paris in Monte-Carlo, the Louis XV dining room opens onto the Place du Casino. Mediterranean cuisine, produce from the coast and inland. Opened in 1987 under Alain Ducasse, the address gained its third star in 1990, the first hotel restaurant to do so.',
    },
    practical: {
      address: { fr: 'Place du Casino, 98000 Monaco', en: 'Place du Casino, 98000 Monaco' },
      cuisine: { fr: 'Méditerranéenne', en: 'Mediterranean' },
      hours: { fr: 'Jeudi à lundi · déjeuner et dîner', en: 'Thu to Mon · Lunch and dinner' },
      dressCode: { fr: 'Veste appréciée', en: 'Jacket appreciated' },
      year: 1987,
    },
    teamNotes: {
      fr: 'Le menu signature reste plus aisé à obtenir au déjeuner. Pour le dîner en saison, six à huit semaines en avance. Le bar de l\'hôtel peut accueillir un apéritif avant le dîner si l\'horaire le permet.',
      en: 'The signature menu remains easier to obtain at lunch. For dinner in season, six to eight weeks ahead. The hotel bar can accommodate an aperitif before dinner when timing permits.',
    },
    faq: [
      {
        question: { fr: 'Combien de temps à l\'avance ?', en: 'How far in advance?' },
        answer: {
          fr: 'En haute saison, six à huit semaines pour le dîner, deux à trois pour le déjeuner. Hors saison, deux à trois semaines suffisent.',
          en: 'In high season, six to eight weeks for dinner, two to three for lunch. Off season, two to three weeks usually suffice.',
        },
      },
      {
        question: { fr: 'Quelle est la tenue requise ?', en: 'What is the dress code?' },
        answer: {
          fr: 'Tenue soignée. La veste pour les messieurs est appréciée au dîner, sans être strictement imposée.',
          en: 'Smart dress. A jacket for gentlemen at dinner is appreciated, though not strictly required.',
        },
      },
      {
        question: { fr: 'Les enfants sont-ils accueillis ?', en: 'Are children welcomed?' },
        answer: {
          fr: 'Oui, à partir de huit à dix ans. Un menu adapté peut être préparé sur demande, à signaler à la réservation.',
          en: 'Yes, generally from age eight to ten. A children\'s menu can be prepared on request, to be flagged at booking.',
        },
      },
    ],
    reservation: {
      enabled: true, minGuests: 1, maxGuests: 12, leadTimeHours: 72, serviceOptions: ['lunch', 'dinner'],
    },
  },

  'la-vague-d-or': {
    hero: ESTABLISHMENT_IMAGES['la-vague-d-or'] as string,
    thumbs: RESTO_THUMBS,
    signature: SIGNATURES['la-vague-d-or'] as { fr: string; en: string },
    housePick: false,
    factualLabels: {
      fr: ['Trois étoiles Michelin', 'Cheval Blanc Saint-Tropez', 'Pieds dans l\'eau'],
      en: ['Three Michelin Stars', 'Cheval Blanc Saint-Tropez', 'On the bay'],
    },
    bestFor: {
      fr: ['dîner romantique', 'soirée d\'été', 'occasion'],
      en: ['romantic dinner', 'summer evening', 'occasion'],
    },
    about: {
      fr: 'Au Cheval Blanc Saint-Tropez, La Vague d\'Or surplombe la baie de la Bouillabaisse. Cuisine méditerranéenne, produits du marché de Saint-Tropez et des fermes de l\'arrière-pays. Ouvert de mai à octobre, suivant la saison du village.',
      en: 'At Cheval Blanc Saint-Tropez, La Vague d\'Or sits above the bay of La Bouillabaisse. Mediterranean cuisine, produce from the Saint-Tropez market and inland farms. Open from May to October, following the village season.',
    },
    practical: {
      address: { fr: 'Plage de la Bouillabaisse, 83990 Saint-Tropez', en: 'Plage de la Bouillabaisse, 83990 Saint-Tropez' },
      cuisine: { fr: 'Méditerranéenne', en: 'Mediterranean' },
      hours: { fr: 'Mai à octobre · dîner uniquement', en: 'May to October · Dinner only' },
      dressCode: { fr: 'Tenue soignée', en: 'Smart' },
    },
    teamNotes: {
      fr: 'La pleine saison va de mi-juillet à fin août, où la table se réserve six à huit semaines avant. Mai et début juin restent les fenêtres les plus discrètes, avec disponibilité parfois à dix jours.',
      en: 'Peak runs mid-July to end of August, when the table books six to eight weeks ahead. May and early June remain the quieter windows, with availability sometimes within ten days.',
    },
    faq: [
      {
        question: { fr: 'Quelle est la saison ?', en: 'What is the season?' },
        answer: {
          fr: 'Mi-mai à fin octobre. Fermeture annuelle l\'hiver. Le pic va de mi-juillet à fin août.',
          en: 'Mid-May to end of October. Closed in winter. Peak runs mid-July to end of August.',
        },
      },
      {
        question: { fr: 'Le déjeuner est-il servi ?', en: 'Is lunch served?' },
        answer: {
          fr: 'La Vague d\'Or sert le dîner uniquement. Les autres tables du Cheval Blanc Saint-Tropez peuvent accueillir au déjeuner sur demande.',
          en: 'La Vague d\'Or serves dinner only. Other tables at Cheval Blanc Saint-Tropez can host lunch on request.',
        },
      },
      {
        question: { fr: 'Combien de temps à l\'avance ?', en: 'How far in advance?' },
        answer: {
          fr: 'Pleine saison, six à huit semaines. Mai et début juin, deux à trois semaines suffisent.',
          en: 'Peak season, six to eight weeks. May and early June, two to three weeks usually suffice.',
        },
      },
    ],
    reservation: {
      enabled: true, minGuests: 2, maxGuests: 10, leadTimeHours: 48, serviceOptions: ['dinner'],
    },
  },

  'mirazur': {
    hero: ESTABLISHMENT_IMAGES['mirazur'] as string,
    thumbs: [
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80',
      'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600&q=80',
      'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=600&q=80',
    ],
    signature: SIGNATURES['mirazur'] as { fr: string; en: string },
    housePick: true,
    factualLabels: {
      fr: ['Trois étoiles Michelin', 'World\'s 50 Best #1 (2019)', 'Cuisine du potager'],
      en: ['Three Michelin Stars', 'World\'s 50 Best #1 (2019)', 'Garden-driven cuisine'],
    },
    bestFor: {
      fr: ['déjeuner long', 'terrasse d\'été', 'anniversaire'],
      en: ['long lunches', 'summer terrace', 'anniversary'],
    },
    about: {
      fr: 'La cuisine de Mauro Colagreco surplombe la frontière italienne, avec un jardin qui fournit la majeure partie de ce qui arrive en salle. Le menu suit le calendrier lunaire, en quatre chapitres au fil de l\'année. La salle ouvre sur la baie, la terrasse sur les jardins en restanques.',
      en: 'Mauro Colagreco\'s kitchen sits above the Italian border, with a garden that supplies most of what reaches the table. The menu follows the lunar calendar, four chapters across the year. The dining room opens on the bay, the terrace on the terraced gardens.',
    },
    practical: {
      address: { fr: '30 avenue Aristide Briand, 06500 Menton', en: '30 avenue Aristide Briand, 06500 Menton' },
      cuisine: { fr: 'Méditerranéenne · calendrier lunaire', en: 'Mediterranean · lunar calendar' },
      chef: 'Mauro Colagreco',
      hours: { fr: 'Mardi à samedi · déjeuner et dîner', en: 'Tue to Sat · Lunch and dinner' },
      dressCode: { fr: 'Tenue soignée', en: 'Smart' },
      year: 2006,
    },
    teamNotes: {
      fr: 'Le chapitre déjeuner est plus accessible que le dîner, et la visite des jardins peut être demandée à l\'avance. Allergies et restrictions liées au calendrier lunaire à communiquer 72 heures avant.',
      en: 'The lunch chapter is more accessible than dinner, and the garden tour can be requested ahead. Allergies and lunar-calendar restrictions are best communicated 72 hours prior.',
    },
    faq: [
      {
        question: { fr: 'Combien de temps à l\'avance dois-je demander une table ?', en: 'How far in advance should I request a table?' },
        answer: {
          fr: 'En haute saison, six à huit semaines pour le dîner. Le déjeuner ouvre parfois deux à trois semaines avant. Hors saison, deux semaines suffisent.',
          en: 'In high season, six to eight weeks for dinner. Lunch can open two to three weeks ahead. Off season, two weeks usually suffice.',
        },
      },
      {
        question: { fr: 'Les préférences alimentaires peuvent-elles être communiquées ?', en: 'Can dietary preferences be communicated?' },
        answer: {
          fr: 'Oui. Allergies, intolérances, régimes spécifiques. Nous transmettons en amont. Le menu est adapté quand c\'est possible.',
          en: 'Yes. Allergies, intolerances, specific diets. We pass them on in advance. The menu is adapted when possible.',
        },
      },
      {
        question: { fr: 'Et si la disponibilité du jour est impossible ?', en: 'What if same-day availability is impossible?' },
        answer: {
          fr: 'Nous proposons une autre adresse de la côte, du même niveau, pour le même créneau. La Palme d\'Or à Cannes ou Le Louis XV à Monaco si la fenêtre s\'y prête.',
          en: 'We propose another address on the coast, of the same level, for the same window. La Palme d\'Or in Cannes or Le Louis XV in Monaco when the timing fits.',
        },
      },
      {
        question: { fr: 'Les enfants sont-ils accueillis ?', en: 'Are children welcomed?' },
        answer: {
          fr: 'Oui, à partir de huit ans en règle générale. Un menu enfant peut être préparé sur demande, à signaler à la réservation.',
          en: 'Yes, generally from age eight. A children\'s menu can be prepared on request, to be flagged at booking.',
        },
      },
      {
        question: { fr: 'Une privatisation peut-elle être organisée ?', en: 'Can a private room be arranged?' },
        answer: {
          fr: 'Une salle privative existe, capacité jusqu\'à douze convives. Disponibilité limitée, à demander au moins six semaines à l\'avance.',
          en: 'A private room is available, up to twelve guests. Limited availability, ask at least six weeks ahead.',
        },
      },
    ],
    reservation: {
      enabled: true, minGuests: 1, maxGuests: 12, leadTimeHours: 48, serviceOptions: ['lunch', 'dinner'],
    },
  },

  'la-palme-d-or': {
    hero: ESTABLISHMENT_IMAGES['la-palme-d-or'] as string,
    thumbs: RESTO_THUMBS,
    signature: SIGNATURES['la-palme-d-or'] as { fr: string; en: string },
    housePick: false,
    factualLabels: {
      fr: ['Deux étoiles Michelin', 'Hôtel Martinez', 'Vue sur la Croisette'],
      en: ['Two Michelin Stars', 'Hôtel Martinez', 'Croisette view'],
    },
    bestFor: {
      fr: ['Festival de Cannes', 'dîner de gala', 'occasion'],
      en: ['Cannes Film Festival', 'gala dinner', 'occasion'],
    },
    about: {
      fr: 'Au septième étage de l\'Hôtel Martinez, La Palme d\'Or fait face à la baie de Cannes. Salle art déco, terrasse sur la Croisette, cuisine du sud. La table tient ses deux étoiles depuis plus de trente ans.',
      en: 'On the seventh floor of the Hôtel Martinez, La Palme d\'Or faces the bay of Cannes. Art deco dining room, terrace on the Croisette, southern cuisine. The table has held its two stars for over thirty years.',
    },
    practical: {
      address: { fr: '73 La Croisette, 06400 Cannes', en: '73 La Croisette, 06400 Cannes' },
      cuisine: { fr: 'Méditerranéenne', en: 'Mediterranean' },
      hours: { fr: 'Mardi à samedi · dîner', en: 'Tue to Sat · Dinner' },
      dressCode: { fr: 'Tenue soignée', en: 'Smart' },
    },
    teamNotes: {
      fr: 'Pendant le Festival, la table est souvent privatisée par les studios. La fenêtre la plus utile s\'ouvre la dernière semaine de mai, après la cérémonie. Hors festival, deux semaines à l\'avance suffisent.',
      en: 'During the Festival, the table is often privatised by the studios. The most useful window opens the last week of May, after the ceremony. Outside the festival, two weeks in advance usually suffice.',
    },
    faq: [
      {
        question: { fr: 'Pendant le Festival de Cannes ?', en: 'During the Cannes Film Festival?' },
        answer: {
          fr: 'Disponibilité très restreinte. Nous tentons après vingt-deux heures, ou la dernière semaine de mai. À demander quatre à six semaines avant.',
          en: 'Availability is very limited. We try after ten in the evening, or the last week of May. Best asked four to six weeks ahead.',
        },
      },
      {
        question: { fr: 'Une privatisation est-elle possible ?', en: 'Can the room be privatised?' },
        answer: {
          fr: 'La salle privative accueille jusqu\'à vingt convives. La privatisation totale est possible hors haute saison, à demander deux mois avant.',
          en: 'The private room hosts up to twenty guests. Full privatisation is possible outside peak season, to be requested two months ahead.',
        },
      },
      {
        question: { fr: 'Y a-t-il une terrasse ?', en: 'Is there a terrace?' },
        answer: {
          fr: 'Oui, sur le toit, vue sur la baie. Service à la belle saison, à demander à la réservation.',
          en: 'Yes, on the roof, view over the bay. Service in fair weather, to be requested at booking.',
        },
      },
    ],
    reservation: {
      enabled: true, minGuests: 2, maxGuests: 12, leadTimeHours: 48, serviceOptions: ['dinner'],
    },
  },

  'le-chantecler': {
    hero: ESTABLISHMENT_IMAGES['le-chantecler'] as string,
    thumbs: RESTO_THUMBS,
    signature: SIGNATURES['le-chantecler'] as { fr: string; en: string },
    housePick: false,
    factualLabels: {
      fr: ['Deux étoiles Michelin', 'Le Negresco', 'Sur la Promenade'],
      en: ['Two Michelin Stars', 'Le Negresco', 'On the Promenade'],
    },
    bestFor: {
      fr: ['déjeuner d\'affaires', 'dîner classique', 'fin de semaine'],
      en: ['business lunch', 'classic dinner', 'weekend'],
    },
    about: {
      fr: 'Au Negresco, sur la Promenade des Anglais, Le Chantecler tient ses deux étoiles dans une salle classique. Cuisine française du sud, carte des vins riche en crus de Provence et de la vallée du Rhône.',
      en: 'At Le Negresco, on the Promenade des Anglais, Le Chantecler holds its two stars in a classical dining room. Southern French cuisine, wine list rich in Provence and Rhône valley vintages.',
    },
    practical: {
      address: { fr: '37 Promenade des Anglais, 06000 Nice', en: '37 Promenade des Anglais, 06000 Nice' },
      cuisine: { fr: 'Française · classique', en: 'French · classical' },
      hours: { fr: 'Mercredi à dimanche · déjeuner et dîner', en: 'Wed to Sun · Lunch and dinner' },
      dressCode: { fr: 'Tenue soignée', en: 'Smart' },
    },
    teamNotes: {
      fr: 'Pour les rendez-vous d\'affaires, la salle se prête mieux au déjeuner qu\'au dîner. Le bar du Negresco offre un cadre plus discret pour terminer la soirée si la table se libère tôt.',
      en: 'For business meetings, the room suits lunch better than dinner. Le Negresco\'s bar offers a quieter setting to end the evening if the table releases early.',
    },
    faq: [
      {
        question: { fr: 'Combien de temps à l\'avance ?', en: 'How far in advance?' },
        answer: {
          fr: 'Une à deux semaines suffisent en règle générale. Le festival de jazz et l\'été tendent l\'agenda, à demander trois semaines avant.',
          en: 'One to two weeks usually suffice. The jazz festival and summer tighten the calendar, ask three weeks ahead.',
        },
      },
      {
        question: { fr: 'Y a-t-il une carte végétarienne ?', en: 'Is there a vegetarian menu?' },
        answer: {
          fr: 'Oui, à demander à la réservation. Le chef adapte un menu complet sur demande préalable de 24 heures.',
          en: 'Yes, to be flagged at booking. The chef adapts a full menu with 24 hours notice.',
        },
      },
      {
        question: { fr: 'Une privatisation est-elle possible ?', en: 'Can the room be privatised?' },
        answer: {
          fr: 'Le salon privé du Negresco accueille jusqu\'à seize convives. À réserver six à huit semaines avant.',
          en: 'The private salon at Le Negresco hosts up to sixteen guests. To be reserved six to eight weeks ahead.',
        },
      },
    ],
    reservation: {
      enabled: true, minGuests: 1, maxGuests: 12, leadTimeHours: 24, serviceOptions: ['lunch', 'dinner'],
    },
  },

  // ============================================
  // PALACES
  // ============================================
  'cap-eden-roc': {
    hero: ESTABLISHMENT_IMAGES['cap-eden-roc'] as string,
    thumbs: PALACE_THUMBS,
    signature: SIGNATURES['cap-eden-roc'] as { fr: string; en: string },
    housePick: false,
    factualLabels: {
      fr: ['Palace Riviera', 'Depuis 1870', 'Pavillon Eden-Roc'],
      en: ['Riviera palace', 'Since 1870', 'Eden-Roc Pavillon'],
    },
    bestFor: {
      fr: ['Festival de Cannes', 'séjour d\'été', 'famille'],
      en: ['Cannes Film Festival', 'summer stay', 'family'],
    },
    about: {
      fr: 'Sur la pointe d\'Antibes depuis 1870. Onze hectares de jardins, piscine taillée dans le roc, cabanas privées au pavillon Eden-Roc. Ouverture saisonnière, d\'avril à octobre. Lieu de séjour de la jet-set internationale depuis le siècle dernier.',
      en: 'On the tip of Antibes since 1870. Eleven hectares of gardens, a pool carved into the rock, private cabanas at the Eden-Roc Pavillon. Seasonal opening, April to October. A stay house for the international set since the last century.',
    },
    practical: {
      address: { fr: 'Boulevard JF Kennedy, 06160 Cap-d\'Antibes', en: 'Boulevard JF Kennedy, 06160 Cap-d\'Antibes' },
      hours: { fr: 'Avril à octobre', en: 'April to October' },
      year: 1870,
    },
    teamNotes: {
      fr: 'Les suites du pavillon Eden-Roc sont les plus rares. À demander six mois à l\'avance pour la pleine saison. Pendant le Festival, l\'hôtel est entièrement privatisé : nous travaillons avec les autres palaces de la Côte.',
      en: 'The Eden-Roc Pavillon suites are the rarest. Ask six months ahead for peak season. During the Festival, the hotel is fully privatised; we work with the other palaces on the Coast.',
    },
    faq: [
      {
        question: { fr: 'Quelle est la saison ?', en: 'What is the season?' },
        answer: {
          fr: 'Avril à octobre. Fermeture totale de novembre à mars. Pic de fréquentation pendant le Festival de Cannes et l\'été.',
          en: 'April to October. Fully closed November to March. Peak during the Cannes Film Festival and summer.',
        },
      },
      {
        question: { fr: 'Pendant le Festival de Cannes ?', en: 'During the Cannes Film Festival?' },
        answer: {
          fr: 'L\'hôtel est largement privatisé par les studios. Nous orientons vers le Carlton, le Martinez, ou le Grand-Hôtel du Cap-Ferrat selon la fenêtre.',
          en: 'The hotel is largely privatised by the studios. We orient toward the Carlton, the Martinez, or the Grand-Hôtel du Cap-Ferrat depending on the window.',
        },
      },
      {
        question: { fr: 'Les transferts depuis Nice sont-ils inclus ?', en: 'Are transfers from Nice included?' },
        answer: {
          fr: 'Sur demande, nous arrangeons un chauffeur Mercedes V-Class depuis l\'aéroport de Nice ou un hélicoptère depuis Mandelieu.',
          en: 'On request, we arrange a Mercedes V-Class chauffeur from Nice airport or a helicopter from Mandelieu.',
        },
      },
    ],
    reservation: {
      enabled: true, minGuests: 1, maxGuests: 8, leadTimeHours: 72, serviceOptions: ['stay'],
    },
  },

  'carlton-cannes': {
    hero: ESTABLISHMENT_IMAGES['carlton-cannes'] as string,
    thumbs: PALACE_THUMBS,
    signature: SIGNATURES['carlton-cannes'] as { fr: string; en: string },
    housePick: false,
    factualLabels: {
      fr: ['Belle Époque', 'Sur la Croisette', 'Rénové en 2023'],
      en: ['Belle Époque', 'On the Croisette', 'Renovated 2023'],
    },
    bestFor: {
      fr: ['Festival de Cannes', 'business', 'séjour court'],
      en: ['Cannes Film Festival', 'business', 'short stay'],
    },
    about: {
      fr: 'Sur la Croisette depuis 1913, façade blanche emblématique de Cannes. Réouverture en 2023 après une rénovation complète. Suites donnant sur la baie, jardins suspendus, plage privée. Programmation événementielle pendant le Festival.',
      en: 'On the Croisette since 1913, the white facade emblematic of Cannes. Reopened in 2023 after a complete renovation. Suites overlooking the bay, hanging gardens, private beach. Event-driven programming during the Festival.',
    },
    practical: {
      address: { fr: '58 La Croisette, 06400 Cannes', en: '58 La Croisette, 06400 Cannes' },
      year: 1913,
    },
    teamNotes: {
      fr: 'Les chambres côté mer sont les plus rares en Festival. Hors festival, la disponibilité s\'ouvre à dix jours. Le bar du Carlton tient un programme cocktail intéressant en pré-soirée.',
      en: 'Sea-facing rooms are the rarest during the Festival. Outside it, availability opens within ten days. The Carlton bar holds a strong pre-dinner cocktail programme.',
    },
    faq: [
      {
        question: { fr: 'Pendant le Festival ?', en: 'During the Festival?' },
        answer: {
          fr: 'Réservé six mois avant, souvent plus tôt pour les suites. Nous orientons vers le Martinez ou le Majestic si le Carlton est complet.',
          en: 'Booked six months ahead, often earlier for suites. We orient toward the Martinez or the Majestic if the Carlton is full.',
        },
      },
      {
        question: { fr: 'Y a-t-il une plage privée ?', en: 'Is there a private beach?' },
        answer: {
          fr: 'Oui, en face de l\'hôtel, accessible aux résidents. Restaurant La Plage Carlton ouvert d\'avril à octobre.',
          en: 'Yes, opposite the hotel, accessible to guests. La Plage Carlton restaurant open April to October.',
        },
      },
      {
        question: { fr: 'Animaux acceptés ?', en: 'Pets allowed?' },
        answer: {
          fr: 'Oui, sur demande, jusqu\'à deux animaux de moins de huit kilogrammes. À signaler à la réservation.',
          en: 'Yes, on request, up to two animals under eight kilograms. To be flagged at booking.',
        },
      },
    ],
    reservation: {
      enabled: true, minGuests: 1, maxGuests: 8, leadTimeHours: 24, serviceOptions: ['stay'],
    },
  },

  'martinez-cannes': {
    hero: ESTABLISHMENT_IMAGES['martinez-cannes'] as string,
    thumbs: PALACE_THUMBS,
    signature: SIGNATURES['martinez-cannes'] as { fr: string; en: string },
    housePick: false,
    factualLabels: {
      fr: ['Art déco', 'Depuis 1929', 'Hyatt Unbound'],
      en: ['Art deco', 'Since 1929', 'Hyatt Unbound'],
    },
    bestFor: {
      fr: ['Festival de Cannes', 'dîner gastronomique', 'séjour court'],
      en: ['Cannes Film Festival', 'fine dining', 'short stay'],
    },
    about: {
      fr: 'Sur la Croisette depuis 1929. Architecture art déco, chambres rénovées en 2018, deux restaurants étoilés dont La Palme d\'Or. Suites avec balcon donnant sur la baie. Plage privée à cinquante mètres.',
      en: 'On the Croisette since 1929. Art deco architecture, rooms renovated in 2018, two starred restaurants including La Palme d\'Or. Suites with balconies over the bay. Private beach fifty metres away.',
    },
    practical: {
      address: { fr: '73 La Croisette, 06400 Cannes', en: '73 La Croisette, 06400 Cannes' },
      year: 1929,
    },
    teamNotes: {
      fr: 'La suite Penthouse au septième étage donne sur l\'embarcadère et la baie. Pendant le Festival, elle est privatisée par les studios : à anticiper six mois à l\'avance pour les autres dates.',
      en: 'The seventh-floor Penthouse suite overlooks the pier and the bay. During the Festival, it is privatised by the studios; for other dates, anticipate six months ahead.',
    },
    faq: [
      {
        question: { fr: 'Pendant le Festival ?', en: 'During the Festival?' },
        answer: {
          fr: 'Suites complètes six mois à l\'avance. Chambres standard parfois disponibles à trois mois.',
          en: 'Suites fully booked six months ahead. Standard rooms occasionally available at three months.',
        },
      },
      {
        question: { fr: 'Combien de restaurants ?', en: 'How many restaurants?' },
        answer: {
          fr: 'Deux restaurants étoilés (La Palme d\'Or, deux étoiles ; Le Sud, une étoile), plus la plage privée et le rooftop bar.',
          en: 'Two starred restaurants (La Palme d\'Or, two stars; Le Sud, one star), plus the private beach and the rooftop bar.',
        },
      },
      {
        question: { fr: 'Le rooftop bar est-il accessible ?', en: 'Is the rooftop bar accessible?' },
        answer: {
          fr: 'Oui, aux résidents et aux visiteurs sur réservation. Vue panoramique sur la baie, ouvert d\'avril à octobre.',
          en: 'Yes, to guests and visitors on reservation. Panoramic view over the bay, open April to October.',
        },
      },
    ],
    reservation: {
      enabled: true, minGuests: 1, maxGuests: 8, leadTimeHours: 24, serviceOptions: ['stay'],
    },
  },

  'grand-hotel-cap-ferrat': {
    hero: ESTABLISHMENT_IMAGES['grand-hotel-cap-ferrat'] as string,
    thumbs: PALACE_THUMBS,
    signature: SIGNATURES['grand-hotel-cap-ferrat'] as { fr: string; en: string },
    housePick: true,
    factualLabels: {
      fr: ['Four Seasons', 'Depuis 1908', 'Sept hectares de jardins'],
      en: ['Four Seasons', 'Since 1908', 'Seven hectares of gardens'],
    },
    bestFor: {
      fr: ['séjour de famille', 'lune de miel', 'retraite'],
      en: ['family stay', 'honeymoon', 'retreat'],
    },
    about: {
      fr: 'Sur la presqu\'île du Cap-Ferrat depuis 1908. Sept hectares de jardins en restanques, piscine olympique creusée dans le roc, vue sur la baie de Beaulieu et la rade de Villefranche. Géré par Four Seasons depuis 2015. Discrétion historique, fréquenté de longue date par les familles européennes en villégiature.',
      en: 'On the Cap-Ferrat peninsula since 1908. Seven hectares of terraced gardens, an Olympic pool carved into the rock, a view over the bay of Beaulieu and the Villefranche harbour. Operated by Four Seasons since 2015. Historic discretion, long favoured by European families on stay.',
    },
    practical: {
      address: { fr: '71 Boulevard Charles de Gaulle, 06230 Saint-Jean-Cap-Ferrat', en: '71 Boulevard Charles de Gaulle, 06230 Saint-Jean-Cap-Ferrat' },
      hours: { fr: 'Mars à novembre', en: 'March to November' },
      year: 1908,
    },
    teamNotes: {
      fr: 'La maison se prête au séjour long, plus qu\'à la nuit unique. Les villas Le Cap, La Veranda et Athena Royal Beach sont les plus rares. Demander quatre à six mois en avance pour juillet et août.',
      en: 'The house suits long stays more than single nights. The Le Cap, La Veranda and Athena Royal Beach villas are the rarest. Ask four to six months in advance for July and August.',
    },
    faq: [
      {
        question: { fr: 'Quelle est la saison ?', en: 'What is the season?' },
        answer: {
          fr: 'Mars à novembre. Fermeture annuelle décembre-février. Pic de fréquentation juillet et août.',
          en: 'March to November. Annual closure December to February. Peak July and August.',
        },
      },
      {
        question: { fr: 'Y a-t-il une plage ?', en: 'Is there a beach?' },
        answer: {
          fr: 'L\'hôtel donne sur Beaulieu, la plage privée Athena Royal est à dix minutes en navette. Piscine olympique au coeur du parc.',
          en: 'The hotel overlooks Beaulieu; the Athena Royal private beach is ten minutes by shuttle. An Olympic pool sits at the heart of the gardens.',
        },
      },
      {
        question: { fr: 'Les enfants sont-ils bienvenus ?', en: 'Are children welcomed?' },
        answer: {
          fr: 'Oui, le club enfants accueille à partir de quatre ans. Programme dédié en haute saison, baby-sitting sur demande.',
          en: 'Yes, the children\'s club hosts from age four. Dedicated programme in high season, babysitting on request.',
        },
      },
    ],
    reservation: {
      enabled: true, minGuests: 1, maxGuests: 8, leadTimeHours: 72, serviceOptions: ['stay'],
    },
  },

  'hotel-de-paris-monte-carlo': {
    hero: ESTABLISHMENT_IMAGES['hotel-de-paris-monte-carlo'] as string,
    thumbs: PALACE_THUMBS,
    signature: SIGNATURES['hotel-de-paris-monte-carlo'] as { fr: string; en: string },
    housePick: false,
    factualLabels: {
      fr: ['Place du Casino', 'Depuis 1864', 'Société des Bains de Mer'],
      en: ['Place du Casino', 'Since 1864', 'Société des Bains de Mer'],
    },
    bestFor: {
      fr: ['Grand Prix', 'soirée au Casino', 'business'],
      en: ['Grand Prix', 'Casino evening', 'business'],
    },
    about: {
      fr: 'Place du Casino, à Monte-Carlo, depuis 1864. Adresse historique de la principauté. Rénovation complète achevée en 2018. Suites diplomatiques, jardins privés au cinquième étage, accès direct au Casino. Restaurant Le Louis XV au rez-de-chaussée.',
      en: 'Place du Casino, in Monte-Carlo, since 1864. The historic address of the principality. Full renovation completed in 2018. Diplomatic suites, private gardens on the fifth floor, direct access to the Casino. Le Louis XV restaurant on the ground floor.',
    },
    practical: {
      address: { fr: 'Place du Casino, 98000 Monaco', en: 'Place du Casino, 98000 Monaco' },
      year: 1864,
    },
    teamNotes: {
      fr: 'Pendant le Grand Prix, les suites donnant sur le virage du Casino sont prises six mois à l\'avance. Hors Grand Prix, la disponibilité s\'ouvre à deux semaines. Accès direct au Casino par passage couvert.',
      en: 'During the Grand Prix, suites overlooking the Casino corner are taken six months ahead. Outside the Grand Prix, availability opens within two weeks. Direct access to the Casino through a covered passage.',
    },
    faq: [
      {
        question: { fr: 'Pendant le Grand Prix ?', en: 'During the Grand Prix?' },
        answer: {
          fr: 'Suites les plus rares de l\'année. Réservation à six mois en avance, souvent par packages avec accès paddock.',
          en: 'The rarest suites of the year. Booked six months in advance, often as packages with paddock access.',
        },
      },
      {
        question: { fr: 'Le Casino est-il accessible ?', en: 'Is the Casino accessible?' },
        answer: {
          fr: 'Oui, par passage couvert depuis l\'hôtel. Tenue requise. Pièce d\'identité demandée à l\'entrée.',
          en: 'Yes, by covered passage from the hotel. Dress code required. ID requested at entry.',
        },
      },
      {
        question: { fr: 'Y a-t-il un spa ?', en: 'Is there a spa?' },
        answer: {
          fr: 'Les Thermes Marins de Monte-Carlo, attenants à l\'hôtel. Accès résidents et visiteurs sur réservation.',
          en: 'The Thermes Marins de Monte-Carlo, adjoining the hotel. Access for guests and visitors on reservation.',
        },
      },
    ],
    reservation: {
      enabled: true, minGuests: 1, maxGuests: 8, leadTimeHours: 48, serviceOptions: ['stay'],
    },
  },

  // ============================================
  // BEACH CLUBS
  // ============================================
  'club-55': {
    hero: ESTABLISHMENT_IMAGES['club-55'] as string,
    thumbs: BEACH_THUMBS,
    signature: SIGNATURES['club-55'] as { fr: string; en: string },
    housePick: true,
    factualLabels: {
      fr: ['Pampelonne', 'Depuis 1955', 'Famille de Colmont'],
      en: ['Pampelonne', 'Since 1955', 'De Colmont family'],
    },
    bestFor: {
      fr: ['déjeuner d\'été', 'longue table', 'famille'],
      en: ['summer lunch', 'long table', 'family'],
    },
    about: {
      fr: 'Sur la plage de Pampelonne depuis le tournage de "Et Dieu créa la femme" en 1955. Géré par la famille de Colmont depuis trois générations. Déjeuner uniquement, cuisine sobre, anti-bling assumé. Saison Pâques à octobre. La table est tenue dans un esprit de pension de famille du Sud, élargie à la côte.',
      en: 'On Pampelonne beach since the filming of "And God Created Woman" in 1955. Run by the de Colmont family for three generations. Lunch only, sober cuisine, intentionally anti-bling. Season Easter to October. The table is held in the spirit of a southern family pension, opened to the coast.',
    },
    practical: {
      address: { fr: '43 Boulevard Patch, 83350 Ramatuelle', en: '43 Boulevard Patch, 83350 Ramatuelle' },
      cuisine: { fr: 'Méditerranéenne · sobre', en: 'Mediterranean · sober' },
      hours: { fr: 'Pâques à octobre · déjeuner uniquement', en: 'Easter to October · Lunch only' },
      year: 1955,
    },
    teamNotes: {
      fr: 'La table à l\'ombre des tamaris se réserve dix jours en avance, plus en pleine saison. Il n\'y a pas de transats Club 55 : pour la plage, voir les paillotes voisines. Le service de tender vers les yachts mouillés est arrangé sur demande.',
      en: 'The tamarisk-shaded table books ten days ahead, more in peak season. Club 55 has no loungers; for the beach, see neighbouring concessions. Tender service to anchored yachts is arranged on request.',
    },
    faq: [
      {
        question: { fr: 'Quelle est la saison ?', en: 'What is the season?' },
        answer: {
          fr: 'Pâques à fin octobre. Pic juillet et août. Mai et septembre restent les fenêtres les plus discrètes.',
          en: 'Easter to end of October. Peak July and August. May and September remain the quieter windows.',
        },
      },
      {
        question: { fr: 'Y a-t-il des transats ?', en: 'Are there loungers?' },
        answer: {
          fr: 'Non. Club 55 est un déjeuner uniquement, pas un beach club au sens classique. Pour la plage, voir Tahiti ou Nikki Beach voisins.',
          en: 'No. Club 55 is lunch only, not a beach club in the classical sense. For the beach, see Tahiti or Nikki Beach next door.',
        },
      },
      {
        question: { fr: 'Le tender depuis le yacht est-il possible ?', en: 'Is tender service from the yacht possible?' },
        answer: {
          fr: 'Oui. Notre équipe arrange le débarquement à la cale Club 55 sur demande, avec retour à votre yacht à l\'issue du déjeuner.',
          en: 'Yes. Our team arranges drop-off at the Club 55 jetty on request, with return to your yacht after lunch.',
        },
      },
    ],
    reservation: {
      enabled: true, minGuests: 2, maxGuests: 12, leadTimeHours: 48, serviceOptions: ['lunch'],
    },
  },

  'bagatelle': {
    hero: ESTABLISHMENT_IMAGES['bagatelle'] as string,
    thumbs: BEACH_THUMBS,
    signature: SIGNATURES['bagatelle'] as { fr: string; en: string },
    housePick: false,
    factualLabels: {
      fr: ['Saint-Tropez', 'Day-to-night', 'International'],
      en: ['Saint-Tropez', 'Day-to-night', 'International'],
    },
    bestFor: {
      fr: ['déjeuner long', 'après-midi', 'groupe'],
      en: ['long lunch', 'afternoon', 'group'],
    },
    about: {
      fr: 'Bagatelle Saint-Tropez s\'inscrit dans la tradition du déjeuner-fête de Pampelonne. L\'après-midi s\'étire, la musique monte, le service reste constant. Maison internationale, présente aussi à New York, Miami, Saint-Barth, Mykonos.',
      en: 'Bagatelle Saint-Tropez sits in the tradition of the Pampelonne lunch-party. The afternoon stretches, the music rises, the service stays steady. International house, also present in New York, Miami, Saint Barths, Mykonos.',
    },
    practical: {
      address: { fr: 'Plage de Pampelonne, 83350 Ramatuelle', en: 'Plage de Pampelonne, 83350 Ramatuelle' },
      cuisine: { fr: 'Méditerranéenne', en: 'Mediterranean' },
      hours: { fr: 'Mai à septembre · déjeuner', en: 'May to September · Lunch' },
    },
    teamNotes: {
      fr: 'Pleine saison, la table front de mer se prend deux à trois semaines en avance. Le déjeuner peut s\'étirer jusqu\'à dix-neuf heures pendant l\'été. Service de tender sur demande.',
      en: 'In peak season, the seafront table books two to three weeks ahead. Lunch can stretch to seven in the evening through summer. Tender service on request.',
    },
    faq: [
      {
        question: { fr: 'Y a-t-il des transats ?', en: 'Are there loungers?' },
        answer: {
          fr: 'Oui, en complément du restaurant. À réserver séparément, accès journalier.',
          en: 'Yes, alongside the restaurant. To be booked separately, daily access.',
        },
      },
      {
        question: { fr: 'Quelle est la saison ?', en: 'What is the season?' },
        answer: {
          fr: 'Mai à fin septembre. Pic juillet et août, où la table front de mer demande deux à trois semaines en avance.',
          en: 'May to end of September. Peak July and August, when the seafront table needs two to three weeks ahead.',
        },
      },
      {
        question: { fr: 'Le tender est-il possible ?', en: 'Is tender access possible?' },
        answer: {
          fr: 'Oui, débarquement direct à la plage. Notre équipe coordonne avec le bord et la plage.',
          en: 'Yes, direct drop-off on the beach. Our team coordinates between the boat and the beach.',
        },
      },
    ],
    reservation: {
      enabled: true, minGuests: 2, maxGuests: 12, leadTimeHours: 24, serviceOptions: ['lunch'],
    },
  },

  'plage-beau-rivage': {
    hero: ESTABLISHMENT_IMAGES['plage-beau-rivage'] as string,
    thumbs: BEACH_THUMBS,
    signature: SIGNATURES['plage-beau-rivage'] as { fr: string; en: string },
    housePick: false,
    factualLabels: {
      fr: ['Promenade des Anglais', 'Plage privée', 'Restaurant'],
      en: ['Promenade des Anglais', 'Private beach', 'Restaurant'],
    },
    bestFor: {
      fr: ['déjeuner', 'pause urbaine', 'famille'],
      en: ['lunch', 'urban pause', 'family'],
    },
    about: {
      fr: 'Sur la Promenade des Anglais, à Nice. Plage privée et restaurant ouverts d\'avril à septembre. Service simple, accessible depuis le centre-ville. Une bonne adresse pour une journée à Nice sans s\'éloigner du Vieux-Nice.',
      en: 'On the Promenade des Anglais, in Nice. Private beach and restaurant open April to September. Simple service, accessible from the city centre. A solid choice for a day in Nice without leaving the old town behind.',
    },
    practical: {
      address: { fr: '107 Quai des États-Unis, 06300 Nice', en: '107 Quai des États-Unis, 06300 Nice' },
      cuisine: { fr: 'Méditerranéenne', en: 'Mediterranean' },
      hours: { fr: 'Avril à septembre · déjeuner', en: 'April to September · Lunch' },
    },
    teamNotes: {
      fr: 'À deux pas du Negresco. La table en bord de plage se prend une semaine en avance hors juillet-août, deux à trois pour la pleine saison. Compatible avec un déjeuner avant un déplacement à l\'aéroport.',
      en: 'A short walk from Le Negresco. The beachside table books one week ahead outside July and August, two to three in peak season. Compatible with a lunch before an airport transfer.',
    },
    faq: [
      {
        question: { fr: 'Quelle est la saison ?', en: 'What is the season?' },
        answer: {
          fr: 'Avril à fin septembre. Pic juillet-août, mais la fréquentation reste plus mesurée que sur Pampelonne.',
          en: 'April to end of September. Peak July to August, though traffic stays more measured than on Pampelonne.',
        },
      },
      {
        question: { fr: 'Transferts depuis l\'aéroport ?', en: 'Transfers from the airport?' },
        answer: {
          fr: 'Quinze minutes par chauffeur depuis l\'aéroport de Nice. Lieu compatible avec une escale en transit.',
          en: 'Fifteen minutes by chauffeur from Nice airport. A spot compatible with a layover.',
        },
      },
      {
        question: { fr: 'Y a-t-il des transats ?', en: 'Are there loungers?' },
        answer: {
          fr: 'Oui, en complément du restaurant, accès journalier sur réservation.',
          en: 'Yes, alongside the restaurant, daily access on reservation.',
        },
      },
    ],
    reservation: {
      enabled: true, minGuests: 2, maxGuests: 10, leadTimeHours: 24, serviceOptions: ['lunch'],
    },
  },

  // ============================================
  // NIGHTLIFE
  // ============================================
  'jimmy-z': {
    hero: ESTABLISHMENT_IMAGES['jimmy-z'] as string,
    thumbs: NIGHT_THUMBS,
    signature: SIGNATURES['jimmy-z'] as { fr: string; en: string },
    housePick: false,
    factualLabels: {
      fr: ['Sporting Monte-Carlo', 'Depuis 1971', 'SBM'],
      en: ['Sporting Monte-Carlo', 'Since 1971', 'SBM'],
    },
    bestFor: {
      fr: ['Grand Prix', 'soirée d\'été', 'fin de soirée'],
      en: ['Grand Prix', 'summer evening', 'late hour'],
    },
    about: {
      fr: 'Au Sporting Monte-Carlo, depuis 1971. Adresse historique de la nuit monégasque. Programmation DJ d\'été, terrasse panoramique sur le port. Saisonnier, ouvert de mai à septembre principalement, plus quelques week-ends hors saison.',
      en: 'At the Sporting Monte-Carlo, since 1971. The historic address of Monaco nights. Summer DJ programming, panoramic terrace over the harbour. Seasonal, open mainly May to September, plus selected off-season weekends.',
    },
    practical: {
      address: { fr: 'Avenue Princesse Grace, 98000 Monaco', en: 'Avenue Princesse Grace, 98000 Monaco' },
      hours: { fr: 'Mai à septembre · à partir de 23h30', en: 'May to September · From 11:30pm' },
      dressCode: { fr: 'Tenue de soirée', en: 'Evening attire' },
      year: 1971,
    },
    teamNotes: {
      fr: 'Pendant le Grand Prix, l\'entrée est sur invitation aux moments clés. Les tables tenues sont prises six semaines avant. Le retour vers l\'hôtel par chauffeur est arrangé sur demande, à toute heure.',
      en: 'During the Grand Prix, entry is by invitation at key moments. tables held are taken six weeks in advance. The return to the hotel by chauffeur is arranged on request, at any hour.',
    },
    faq: [
      {
        question: { fr: 'Quelle est la tenue ?', en: 'What is the dress code?' },
        answer: {
          fr: 'Tenue de soirée. Veste recommandée pour les messieurs. Refus possible à l\'entrée selon l\'affluence.',
          en: 'Evening attire. Jacket recommended for gentlemen. Entry can be refused depending on the crowd.',
        },
      },
      {
        question: { fr: 'Une table peut-elle être réservée ?', en: 'Can a table be reserved?' },
        answer: {
          fr: 'Oui, table avec service bouteille. Plancher minimum à demander à la réservation.',
          en: 'Yes, table with bottle service. Minimum spend to be confirmed at booking.',
        },
      },
      {
        question: { fr: 'Le retour est-il arrangé ?', en: 'Is the return arranged?' },
        answer: {
          fr: 'Oui. Notre équipe pose un chauffeur à toute heure pour le retour vers votre hôtel ou villa.',
          en: 'Yes. Our team places a chauffeur at any hour for the return to your hotel or villa.',
        },
      },
    ],
    reservation: {
      enabled: true, minGuests: 2, maxGuests: 10, leadTimeHours: 48, serviceOptions: ['evening'],
    },
  },

  'baoli': {
    hero: ESTABLISHMENT_IMAGES['baoli'] as string,
    thumbs: NIGHT_THUMBS,
    signature: SIGNATURES['baoli'] as { fr: string; en: string },
    housePick: false,
    factualLabels: {
      fr: ['Port Canto', 'Restaurant + nightclub', 'Depuis 2003'],
      en: ['Port Canto', 'Restaurant + nightclub', 'Since 2003'],
    },
    bestFor: {
      fr: ['Festival de Cannes', 'soirée tardive', 'after-dîner'],
      en: ['Cannes Film Festival', 'late evening', 'post-dinner'],
    },
    about: {
      fr: 'Au Port Canto, à Cannes. Restaurant en début de soirée, club après minuit. Adresse de la nuit cannoise, particulièrement active pendant le Festival. Programmation DJ régulière, terrasse en bord de port.',
      en: 'At Port Canto, in Cannes. Restaurant in early evening, club after midnight. The Cannes night address, particularly active during the Festival. Regular DJ programming, terrace on the harbour.',
    },
    practical: {
      address: { fr: 'Port Pierre Canto, Boulevard de la Croisette, 06400 Cannes', en: 'Port Pierre Canto, Boulevard de la Croisette, 06400 Cannes' },
      hours: { fr: 'Avril à octobre · à partir de 20h', en: 'April to October · From 8pm' },
      dressCode: { fr: 'Tenue de soirée', en: 'Evening attire' },
      year: 2003,
    },
    teamNotes: {
      fr: 'La salle restaurant accueille jusqu\'à 21h, le club prend la suite. Pendant le Festival, l\'entrée passe par invitations aux nuits officielles. Tables avec service bouteille à demander deux semaines en avance.',
      en: 'The restaurant room runs until 9pm, the club takes over after. During the Festival, entry on official nights goes by invitation. Tables with bottle service to be requested two weeks ahead.',
    },
    faq: [
      {
        question: { fr: 'Pendant le Festival ?', en: 'During the Festival?' },
        answer: {
          fr: 'Une des adresses les plus actives de la nuit cannoise. Tables prises quatre à six semaines avant la cérémonie.',
          en: 'One of the most active addresses of the Cannes nights. Tables booked four to six weeks before the ceremony.',
        },
      },
      {
        question: { fr: 'Y a-t-il un dress code ?', en: 'Is there a dress code?' },
        answer: {
          fr: 'Tenue de soirée. Refus possible selon l\'affluence et l\'événement de la nuit.',
          en: 'Evening attire. Entry can be refused depending on the crowd and the event of the night.',
        },
      },
      {
        question: { fr: 'Peut-on dîner avant ?', en: 'Can we dine before?' },
        answer: {
          fr: 'Oui, le restaurant fonctionne jusqu\'à 21h, avec passage progressif vers le club. Réservation conseillée.',
          en: 'Yes, the restaurant runs until 9pm, with a gradual transition to the club. Reservation advised.',
        },
      },
    ],
    reservation: {
      enabled: true, minGuests: 2, maxGuests: 12, leadTimeHours: 24, serviceOptions: ['evening'],
    },
  },
};

export function getEstablishmentDetail(slug: string, category: string): EstablishmentDetail {
  const rich = DETAILS[slug as EstablishmentSlug];
  if (rich) return rich;

  // Fallback stub (ne devrait plus etre atteint maintenant que les 15 ont leur entree).
  const sig = SIGNATURES[slug] ?? { fr: '', en: '' };
  const isPalace = category === 'palace';
  const isNightclub = category === 'nightclub';
  const isBeach = category === 'beach-club';
  const isResto = category === 'restaurant';
  return {
    hero: ESTABLISHMENT_IMAGES[slug] ?? '',
    thumbs: [],
    signature: sig,
    housePick: HOUSE_PICKS.includes(slug as EstablishmentSlug),
    practical: { address: { fr: '', en: '' } },
    reservation: {
      enabled: true,
      minGuests: isPalace ? 1 : 2,
      maxGuests: isPalace ? 8 : 12,
      leadTimeHours: 24,
      serviceOptions: isPalace ? ['stay']
        : isResto ? ['lunch', 'dinner']
        : isBeach ? ['lunch']
        : isNightclub ? ['evening']
        : ['lunch'],
    },
  };
}
