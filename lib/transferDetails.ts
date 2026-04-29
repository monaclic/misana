// Donnees enrichies par fiche transfer V1 hardcoded.
// Cle de lookup : `${mode}:${slug}` car une route 'both' peut avoir 2 fiches distinctes.
// Voix Misana : factuelle, sobre, sans superlatif.

import type { TransferSlug } from '~/lib/constants';

export type TransferDetail = {
  hero: string;
  thumbs: string[];
  durationChauffeur?: number;
  durationHelicopter?: number;
  distanceKm?: number;
  heliportFrom?: { fr: string; en: string };
  heliportTo?: { fr: string; en: string };
  vehicleType?: { fr: string; en: string };
  aircraftType?: { fr: string; en: string };
  signature: { fr: string; en: string };
  about?: { fr: string; en: string };
  practical: {
    pickup?: { fr: string; en: string };
    dropoff?: { fr: string; en: string };
    luggage?: { fr: string; en: string };
    pax?: { fr: string; en: string };
  };
  teamNotes?: { fr: string; en: string };
  faq?: { question: { fr: string; en: string }; answer: { fr: string; en: string } }[];
};

const TRANSFER_HEROES = {
  helicopter: 'https://images.unsplash.com/photo-1583373834259-46cc92173cb7?w=1600&q=80',
  chauffeur: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=1600&q=80',
};

const HELI_THUMBS = [
  'https://images.unsplash.com/photo-1521295121783-8a321d551ad2?w=600&q=80',
  'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?w=600&q=80',
];

const CHAUFFEUR_THUMBS = [
  'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600&q=80',
  'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&q=80',
];

const DETAILS: Record<string, TransferDetail> = {
  // ===== HELICOPTERE — fiche full pour test design =====
  'helicopter:monaco-saint-tropez': {
    hero: TRANSFER_HEROES.helicopter,
    thumbs: HELI_THUMBS,
    durationHelicopter: 18,
    distanceKm: 65,
    heliportFrom: { fr: 'Heliport de Monaco · Fontvieille', en: 'Monaco heliport · Fontvieille' },
    heliportTo: { fr: 'Heliport de La Mole · Saint-Tropez', en: 'La Mole heliport · Saint-Tropez' },
    aircraftType: { fr: 'Airbus H125, H130, H135', en: 'Airbus H125, H130, H135' },
    signature: {
      fr: 'Dix-huit minutes de vol, heliport à heliport.',
      en: 'Eighteen minutes of flight, heliport to heliport.',
    },
    about: {
      fr: 'Le vol direct entre Monaco et Saint-Tropez prend dix-huit minutes en hélicoptère, contre une heure quarante par la route. Décollage de Fontvieille à Monaco, arrivée à La Mole, dans la plaine de Saint-Tropez. Mercedes V-Class aux deux extrémités, transferts inclus jusqu\'à votre adresse à Saint-Tropez.',
      en: 'The direct flight between Monaco and Saint-Tropez takes eighteen minutes by helicopter, against one hour forty by road. Takeoff from Fontvieille in Monaco, arrival at La Mole, in the Saint-Tropez plain. Mercedes V-Class at both ends, transfers included to your address in Saint-Tropez.',
    },
    practical: {
      pickup: { fr: 'Heliport de Monaco · Fontvieille', en: 'Monaco heliport · Fontvieille' },
      dropoff: { fr: 'Heliport de La Mole + chauffeur Mercedes V-Class', en: 'La Mole heliport + Mercedes V-Class chauffeur' },
      luggage: { fr: 'Deux valises moyennes par passager', en: 'Two medium suitcases per passenger' },
      pax: { fr: 'Jusqu\'à 6 passagers selon aéronef', en: 'Up to 6 passengers depending on aircraft' },
    },
    teamNotes: {
      fr: 'En haute saison, l\'heliport de La Mole se sature en fin de matinée et début de soirée. Demander quarante-huit heures à l\'avance pour ces fenêtres. Les vols sont soumis aux conditions météo : nous prévoyons toujours un plan B chauffeur si la météo se dégrade le jour J.',
      en: 'In peak season, La Mole heliport saturates late morning and early evening. Ask forty-eight hours ahead for these windows. Flights are weather-dependent: we always prepare a chauffeur backup if conditions deteriorate on the day.',
    },
    faq: [
      {
        question: { fr: 'Quelle est la durée exacte ?', en: 'What is the exact duration?' },
        answer: {
          fr: 'Dix-huit à vingt minutes de vol selon le vent et le couloir aérien attribué. Embarquement quinze minutes avant le décollage.',
          en: 'Eighteen to twenty minutes of flight depending on wind and assigned corridor. Boarding fifteen minutes before takeoff.',
        },
      },
      {
        question: { fr: 'Et si la météo se dégrade ?', en: 'What if the weather deteriorates?' },
        answer: {
          fr: 'Le vol est annulé pour des raisons de sécurité. Nous basculons sur un transfert chauffeur en V-Class, prévu en backup, qui rejoint Saint-Tropez en environ une heure quarante.',
          en: 'The flight is cancelled for safety reasons. We switch to a V-Class chauffeur transfer, prepared as backup, which reaches Saint-Tropez in about one hour forty.',
        },
      },
      {
        question: { fr: 'Combien de bagages par personne ?', en: 'How much luggage per person?' },
        answer: {
          fr: 'Deux valises moyennes (jusqu\'à 23 kg chacune) par passager. Bagages encombrants à signaler à la réservation.',
          en: 'Two medium suitcases (up to 23 kg each) per passenger. Bulky luggage to be flagged at booking.',
        },
      },
      {
        question: { fr: 'Le chauffeur est-il inclus ?', en: 'Is the chauffeur included?' },
        answer: {
          fr: 'Oui. Mercedes V-Class à Monaco pour rejoindre l\'heliport, V-Class à La Mole pour rejoindre votre adresse à Saint-Tropez.',
          en: 'Yes. Mercedes V-Class in Monaco to reach the heliport, V-Class at La Mole to reach your address in Saint-Tropez.',
        },
      },
    ],
  },

  'helicopter:cannes-monaco': {
    hero: TRANSFER_HEROES.helicopter,
    thumbs: HELI_THUMBS,
    durationHelicopter: 10,
    distanceKm: 56,
    heliportFrom: { fr: 'Cannes Mandelieu ou Quai du Large', en: 'Cannes Mandelieu or Quai du Large' },
    heliportTo: { fr: 'Heliport de Monaco · Fontvieille', en: 'Monaco heliport · Fontvieille' },
    aircraftType: { fr: 'Airbus H125, H130', en: 'Airbus H125, H130' },
    signature: {
      fr: 'Dix minutes de vol entre Cannes et Monaco.',
      en: 'Ten minutes of flight between Cannes and Monaco.',
    },
    about: {
      fr: 'Le vol Cannes-Monaco prend dix minutes au lieu d\'une heure par la route. Décollage de Mandelieu ou Quai du Large à Cannes, arrivée à Fontvieille. Mercedes V-Class aux deux extrémités, transferts inclus jusqu\'à votre adresse.',
      en: 'The Cannes-Monaco flight takes ten minutes instead of an hour by road. Takeoff from Mandelieu or Quai du Large in Cannes, arrival at Fontvieille. Mercedes V-Class at both ends, transfers included to your address.',
    },
    practical: {
      pickup: { fr: 'Heliport de Cannes · Mandelieu ou Quai du Large', en: 'Cannes heliport · Mandelieu or Quai du Large' },
      dropoff: { fr: 'Heliport de Fontvieille + chauffeur', en: 'Fontvieille heliport + chauffeur' },
      luggage: { fr: 'Deux valises moyennes par passager', en: 'Two medium suitcases per passenger' },
      pax: { fr: 'Jusqu\'à 6 passagers selon aéronef', en: 'Up to 6 passengers depending on aircraft' },
    },
    teamNotes: {
      fr: 'Quai du Large est plus pratique depuis la Croisette (cinq minutes en chauffeur), Mandelieu mieux pour les départs depuis l\'arrière-pays. Pendant le Grand Prix, l\'heliport de Fontvieille fonctionne à plein rendement, à anticiper deux à trois jours avant.',
      en: 'Quai du Large is more convenient from the Croisette (five minutes by chauffeur), Mandelieu better for departures from inland. During the Grand Prix, Fontvieille heliport runs at full capacity, anticipate two to three days ahead.',
    },
    faq: [
      {
        question: { fr: 'Mandelieu ou Quai du Large ?', en: 'Mandelieu or Quai du Large?' },
        answer: {
          fr: 'Quai du Large est plus proche de la Croisette. Mandelieu est plus rapide depuis l\'arrière-pays. Notre équipe choisit selon votre point de départ.',
          en: 'Quai du Large is closer to the Croisette. Mandelieu is faster from inland. Our team picks based on your starting point.',
        },
      },
      {
        question: { fr: 'Et si la météo se dégrade ?', en: 'What if the weather deteriorates?' },
        answer: {
          fr: 'Bascule automatique sur transfert chauffeur en V-Class. Cannes-Monaco par la route en environ une heure.',
          en: 'Automatic switch to V-Class chauffeur transfer. Cannes-Monaco by road in about one hour.',
        },
      },
      {
        question: { fr: 'Pendant le Grand Prix ?', en: 'During the Grand Prix?' },
        answer: {
          fr: 'Heliport de Fontvieille saturé pendant les jours d\'événement. Réservation deux à trois jours avant minimum.',
          en: 'Fontvieille heliport saturated on event days. Booking two to three days ahead minimum.',
        },
      },
    ],
  },

  'helicopter:cap-ferrat-saint-tropez': {
    hero: TRANSFER_HEROES.helicopter,
    thumbs: HELI_THUMBS,
    durationHelicopter: 20,
    distanceKm: 75,
    heliportFrom: { fr: 'Heliport de Nice', en: 'Nice heliport' },
    heliportTo: { fr: 'Heliport de La Mole · Saint-Tropez', en: 'La Mole heliport · Saint-Tropez' },
    aircraftType: { fr: 'Airbus H125, H130', en: 'Airbus H125, H130' },
    signature: {
      fr: 'Vingt minutes de vol depuis Nice, chauffeur depuis le Cap-Ferrat.',
      en: 'Twenty minutes of flight from Nice, chauffeur from Cap-Ferrat.',
    },
    about: {
      fr: 'Le Cap-Ferrat n\'a pas son propre heliport : nous arrangeons un chauffeur Mercedes V-Class du Cap à l\'heliport de Nice (quinze minutes), puis vol direct vers La Mole. Vol total porte-à-porte : environ cinquante minutes contre deux heures quinze par la route.',
      en: 'Cap-Ferrat has no heliport of its own: we arrange a Mercedes V-Class chauffeur from the Cap to Nice heliport (fifteen minutes), then a direct flight to La Mole. Total door-to-door: about fifty minutes against two hours fifteen by road.',
    },
    practical: {
      pickup: { fr: 'Votre adresse au Cap-Ferrat', en: 'Your address at Cap-Ferrat' },
      dropoff: { fr: 'Heliport de La Mole + chauffeur Mercedes V-Class', en: 'La Mole heliport + Mercedes V-Class chauffeur' },
      luggage: { fr: 'Deux valises moyennes par passager', en: 'Two medium suitcases per passenger' },
      pax: { fr: 'Jusqu\'à 6 passagers selon aéronef', en: 'Up to 6 passengers depending on aircraft' },
    },
    teamNotes: {
      fr: 'Le créneau idéal de départ est entre 10h et 12h, ou après 17h. En milieu de journée, l\'heliport de Nice est saturé par les vols entrants. Prévoir une heure de battement avec le vol commercial éventuel.',
      en: 'The ideal departure window is between 10am and 12pm, or after 5pm. Mid-day, Nice heliport is saturated by inbound flights. Plan one hour of buffer with any commercial flight.',
    },
    faq: [
      {
        question: { fr: 'Le chauffeur est-il inclus ?', en: 'Is the chauffeur included?' },
        answer: {
          fr: 'Oui, du Cap-Ferrat à Nice et de La Mole à Saint-Tropez. Mercedes V-Class aux deux extrémités.',
          en: 'Yes, from Cap-Ferrat to Nice and from La Mole to Saint-Tropez. Mercedes V-Class at both ends.',
        },
      },
      {
        question: { fr: 'Combien de temps porte-à-porte ?', en: 'How long door-to-door?' },
        answer: {
          fr: 'Cinquante minutes en moyenne. Quinze minutes de chauffeur, vingt minutes de vol, le reste en battement et trajet final.',
          en: 'Fifty minutes on average. Fifteen minutes by chauffeur, twenty minutes of flight, the rest in buffer and final transfer.',
        },
      },
      {
        question: { fr: 'Météo défavorable ?', en: 'Bad weather?' },
        answer: {
          fr: 'Bascule sur un transfert chauffeur en V-Class direct depuis le Cap-Ferrat. Trajet de deux heures quinze.',
          en: 'Switch to V-Class chauffeur transfer direct from Cap-Ferrat. Two hours fifteen drive.',
        },
      },
    ],
  },

  // ===== CHAUFFEUR — fiche full pour test design =====
  'chauffeur:nice-airport-cannes': {
    hero: TRANSFER_HEROES.chauffeur,
    thumbs: CHAUFFEUR_THUMBS,
    durationChauffeur: 30,
    distanceKm: 32,
    vehicleType: { fr: 'Mercedes V-Class · S-Class · E-Class', en: 'Mercedes V-Class · S-Class · E-Class' },
    signature: {
      fr: 'Trente minutes par l\'autoroute, accueil à la sortie des bagages.',
      en: 'Thirty minutes by motorway, welcome at the baggage hall exit.',
    },
    about: {
      fr: 'L\'aéroport de Nice se rejoint à Cannes en trente minutes par l\'A8, hors heures de pointe. En heure de pointe, comptez quarante-cinq à cinquante minutes. Mercedes V-Class par défaut, S-Class à la demande. Accueil à la sortie des bagages, suivi des vols, attente gratuite jusqu\'à une heure si retard.',
      en: 'Nice airport reaches Cannes in thirty minutes via the A8, outside peak hours. In peak hours, allow forty-five to fifty minutes. Mercedes V-Class by default, S-Class on request. Welcome at the baggage hall exit, flight tracking, free waiting up to one hour for delays.',
    },
    practical: {
      pickup: { fr: 'Aéroport de Nice · Terminaux 1 et 2', en: 'Nice Airport · Terminals 1 and 2' },
      dropoff: { fr: 'Votre adresse à Cannes', en: 'Your address in Cannes' },
      luggage: { fr: 'Jusqu\'à 4 grandes valises (V-Class)', en: 'Up to 4 large suitcases (V-Class)' },
      pax: { fr: 'Jusqu\'à 7 passagers (V-Class)', en: 'Up to 7 passengers (V-Class)' },
    },
    teamNotes: {
      fr: 'Pendant le Festival de Cannes, l\'A8 est saturée la journée. Nous prévoyons un départ trente minutes plus tôt, ou bascule sur la basse corniche selon le trafic. Pour les vols qui arrivent après 23h, le chauffeur attend gratuitement jusqu\'à une heure trente.',
      en: 'During the Cannes Festival, the A8 is saturated during the day. We schedule departure thirty minutes earlier, or switch to the lower corniche depending on traffic. For flights landing after 11pm, the chauffeur waits free of charge up to one hour thirty.',
    },
    faq: [
      {
        question: { fr: 'Le chauffeur attend-il en cas de retard ?', en: 'Does the chauffeur wait if my flight is delayed?' },
        answer: {
          fr: 'Oui, suivi en temps réel des vols. Une heure d\'attente gratuite à compter de l\'heure d\'arrivée prévue.',
          en: 'Yes, real-time flight tracking. One hour of free waiting from scheduled arrival time.',
        },
      },
      {
        question: { fr: 'Pendant le Festival ?', en: 'During the Festival?' },
        answer: {
          fr: 'L\'A8 est saturée. Nous décalons le départ ou basculons sur la basse corniche. Réservation conseillée trois à cinq jours avant.',
          en: 'The A8 is saturated. We shift departure or switch to the lower corniche. Reservation advised three to five days ahead.',
        },
      },
      {
        question: { fr: 'Y a-t-il un panneau à l\'arrivée ?', en: 'Is there a name sign on arrival?' },
        answer: {
          fr: 'Oui, panneau au nom du voyageur à la sortie des bagages, terminal 1 ou 2 selon le vol.',
          en: 'Yes, a name sign at the baggage hall exit, terminal 1 or 2 depending on the flight.',
        },
      },
    ],
  },

  'chauffeur:cannes-monaco': {
    hero: TRANSFER_HEROES.chauffeur,
    thumbs: CHAUFFEUR_THUMBS,
    durationChauffeur: 60,
    distanceKm: 56,
    vehicleType: { fr: 'Mercedes V-Class · S-Class', en: 'Mercedes V-Class · S-Class' },
    signature: {
      fr: 'Une heure par l\'autoroute, plus selon le trafic.',
      en: 'One hour by motorway, more depending on traffic.',
    },
    about: {
      fr: 'Cannes-Monaco par la route, c\'est l\'A8 et la basse corniche. Une heure hors heure de pointe, quarante minutes de plus en pleine journée. Mercedes V-Class par défaut, idéale pour les transferts en groupe ou avec bagages volumineux. Si l\'horaire est serré, l\'hélicoptère ramène le trajet à dix minutes.',
      en: 'Cannes to Monaco by road, that\'s the A8 and the lower corniche. One hour outside peak, forty minutes more in mid-day. Mercedes V-Class by default, ideal for group transfers or bulky luggage. If timing is tight, the helicopter brings it down to ten minutes.',
    },
    practical: {
      pickup: { fr: 'Votre adresse à Cannes', en: 'Your address in Cannes' },
      dropoff: { fr: 'Votre adresse à Monaco', en: 'Your address in Monaco' },
      luggage: { fr: 'Jusqu\'à 4 grandes valises (V-Class)', en: 'Up to 4 large suitcases (V-Class)' },
      pax: { fr: 'Jusqu\'à 7 passagers (V-Class)', en: 'Up to 7 passengers (V-Class)' },
    },
    teamNotes: {
      fr: 'Pour un dîner à Monaco au départ de Cannes, nous suggérons un départ deux heures avant la réservation. La basse corniche se sature plus vite que l\'A8 en juillet et août. Pour la pression horaire, l\'hélicoptère reste la meilleure option.',
      en: 'For a Monaco dinner from Cannes, we suggest a departure two hours before the booking. The lower corniche saturates faster than the A8 in July and August. For time pressure, helicopter remains the best option.',
    },
    faq: [
      {
        question: { fr: 'Combien de temps faut-il prévoir ?', en: 'How long should I plan?' },
        answer: {
          fr: 'Une heure hors heure de pointe, une heure trente à quarante en saison. Pour un dîner, partir deux heures avant.',
          en: 'One hour outside peak, one hour thirty to forty in season. For a dinner, leave two hours ahead.',
        },
      },
      {
        question: { fr: 'L\'hélicoptère est-il plus rapide ?', en: 'Is the helicopter faster?' },
        answer: {
          fr: 'Largement. Dix minutes de vol entre Cannes Mandelieu et Fontvieille.',
          en: 'Considerably. Ten minutes of flight between Cannes Mandelieu and Fontvieille.',
        },
      },
      {
        question: { fr: 'Pendant le Grand Prix ?', en: 'During the Grand Prix?' },
        answer: {
          fr: 'Routes saturées, prévoir au moins deux heures. Hélicoptère privilégié si possible.',
          en: 'Roads saturated, plan at least two hours. Helicopter preferred if possible.',
        },
      },
    ],
  },
};

export function getTransferDetail(mode: 'chauffeur' | 'helicopter', slug: TransferSlug | string): TransferDetail | null {
  return DETAILS[`${mode}:${slug}`] ?? null;
}

// Stub fallback : utilise quand il n'y a pas encore de detail riche pour la route.
// Utilise le hero generique du mode + un signature minimal genere a partir des villes.
export function getStubDetail(mode: 'chauffeur' | 'helicopter'): Pick<TransferDetail, 'hero' | 'thumbs'> {
  return {
    hero: TRANSFER_HEROES[mode],
    thumbs: mode === 'helicopter' ? HELI_THUMBS : CHAUFFEUR_THUMBS,
  };
}
