// Donnees enrichies par etablissement V1 hardcoded, en attendant Sanity.
// Mirazur en pleine donnee (test design). Les 14 autres en stub.
// Le template gere les blocs conditionnels (about, notes, faq, etc.).

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

// Signatures par defaut (reprise des PLACE_NOTES de access/index.vue).
const SIGNATURES: Record<string, { fr: string; en: string }> = {
  'le-louis-xv': { fr: 'Trois étoiles à Monte-Carlo, depuis 1987.', en: 'Three stars in Monte-Carlo, since 1987.' },
  'la-vague-d-or': { fr: 'Trois étoiles, face à la baie de Saint-Tropez.', en: 'Three stars, facing the bay of Saint-Tropez.' },
  'mirazur': { fr: 'Là où la Riviera s\'achève et le potager commence.', en: 'Where the Riviera ends, and the potager begins.' },
  'la-palme-d-or': { fr: 'Au Martinez, signature Christian Sinicropi.', en: 'At the Martinez, by Christian Sinicropi.' },
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

const DETAILS: Partial<Record<EstablishmentSlug, EstablishmentDetail>> = {
  // Coup de coeur Restaurant — donnee complete pour test design.
  mirazur: {
    hero: ESTABLISHMENT_IMAGES.mirazur as string,
    thumbs: [
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80',
      'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600&q=80',
      'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=600&q=80',
    ],
    signature: SIGNATURES.mirazur as { fr: string; en: string },
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
      address: {
        fr: '30 avenue Aristide Briand, 06500 Menton',
        en: '30 avenue Aristide Briand, 06500 Menton',
      },
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
      enabled: true,
      minGuests: 1,
      maxGuests: 12,
      leadTimeHours: 48,
      serviceOptions: ['lunch', 'dinner'],
    },
  },
};

export function getEstablishmentDetail(slug: string, category: string): EstablishmentDetail {
  const rich = DETAILS[slug as EstablishmentSlug];
  if (rich) return rich;

  // Stub par defaut : signature seule + reservation activee.
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
    practical: {
      address: { fr: '', en: '' },
    },
    reservation: {
      enabled: true,
      minGuests: isPalace ? 1 : 2,
      maxGuests: isPalace ? 8 : 12,
      leadTimeHours: 24,
      serviceOptions: isPalace
        ? ['stay']
        : isResto
          ? ['lunch', 'dinner']
          : isBeach
            ? ['lunch']
            : isNightclub
              ? ['evening']
              : ['lunch'],
    },
  };
}
