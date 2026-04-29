// Donnees fiche event V1. Refonte de /events/[event] (squelettique)
// avec 4 events heavy en pleine donnee.

export type EventDetail = {
  heroImage: string;
  signature: { fr: string; en: string };
  aboutImage: string;
  aboutText: { fr: string; en: string };
  dates: { fr: string; en: string };
  duration: { fr: string; en: string };
  venues: { fr: string[]; en: string[] };
  whyMisana: { fr: string[]; en: string[] };
  faq: { q: { fr: string; en: string }; a: { fr: string; en: string } }[];
};

const DETAILS: Record<string, EventDetail> = {
  'festival-de-cannes': {
    heroImage: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=2400&q=85',
    signature: {
      fr: 'Dix jours de Croisette, deux mille projections, un tapis rouge.',
      en: 'Ten days of Croisette, two thousand screenings, one red carpet.',
    },
    aboutImage: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1600&q=80',
    aboutText: {
      fr: 'Le Festival de Cannes est le rendez-vous mondial du cinéma depuis 1946. Pendant dix jours en mai, la Croisette concentre studios, talents, presse internationale, agents, distributeurs. Le Palais des Festivals diffuse la sélection officielle, les plages d\'hôtels et yachts ancrés au large hébergent les soirées privées, les villas du Cap d\'Antibes et de Mougins accueillent les délégations. Notre service couvre les transferts (chauffeur, hélicoptère), la location de voitures de luxe pour les arrivées tapis rouge, le yacht charter avec mouillage Croisette, et l\'accès aux palaces et restaurants étoilés.',
      en: 'The Cannes Film Festival has been the world\'s cinema rendezvous since 1946. During ten days in May, the Croisette gathers studios, talents, international press, agents, distributors. The Palais des Festivals broadcasts the official selection, hotel beaches and yachts anchored offshore host private parties, Cap d\'Antibes and Mougins villas welcome delegations. Our service covers transfers (chauffeur, helicopter), luxury car rental for red carpet arrivals, yacht charter with Croisette anchorage, and access to palaces and starred restaurants.',
    },
    dates: { fr: 'Mai (10 jours)', en: 'May (10 days)' },
    duration: { fr: '10 jours', en: '10 days' },
    venues: {
      fr: ['Palais des Festivals', 'Croisette', 'Plages d\'hôtels (Carlton, Martinez, Majestic)', 'Cap d\'Antibes', 'Mougins'],
      en: ['Palais des Festivals', 'Croisette', 'Hotel beaches (Carlton, Martinez, Majestic)', 'Cap d\'Antibes', 'Mougins'],
    },
    whyMisana: {
      fr: [
        'Flotte chauffeur et hélicoptère étendue pendant les 10 jours, pré-positionnée sur la Croisette.',
        'Coordination préalable avec studios, agences et sécurité du Festival pour les arrivées tapis rouge.',
        'Yacht avec mouillage Croisette autorisé, hospitalité à bord 50-200 invités.',
        'Accès aux palaces (Carlton, Martinez, Majestic) et aux restaurants étoilés (La Palme d\'Or) malgré la sursaturation.',
        'Service nocturne 24/7 pendant la durée de l\'événement, pas de surcoût horaire.',
      ],
      en: [
        'Extended chauffeur and helicopter fleet during the 10 days, pre-positioned on the Croisette.',
        'Prior coordination with studios, agencies and Festival security for red carpet arrivals.',
        'Yacht with authorised Croisette anchorage, on-board hospitality 50-200 guests.',
        'Access to palaces (Carlton, Martinez, Majestic) and starred restaurants (La Palme d\'Or) despite oversaturation.',
        'Night service 24/7 during event duration, no hourly surcharge.',
      ],
    },
    faq: [
      {
        q: { fr: 'Quand a lieu le Festival de Cannes ?', en: 'When is the Cannes Film Festival?' },
        a: {
          fr: 'Mi-mai sur 10 jours, généralement du deuxième mardi au samedi suivant. Cérémonie d\'ouverture mardi, Palme d\'Or samedi.',
          en: 'Mid-May over 10 days, usually from the second Tuesday to the following Saturday. Opening ceremony Tuesday, Palme d\'Or Saturday.',
        },
      },
      {
        q: { fr: 'Combien de temps avant réserver ?', en: 'How far in advance to book?' },
        a: {
          fr: 'Hôtels et palaces : 3-6 mois avant. Yachts avec mouillage Croisette : 6 mois. Chauffeur et hélicoptère : 3 semaines minimum.',
          en: 'Hotels and palaces: 3-6 months ahead. Yachts with Croisette anchorage: 6 months. Chauffeur and helicopter: 3 weeks minimum.',
        },
      },
      {
        q: { fr: 'Accès tapis rouge ?', en: 'Red carpet access?' },
        a: {
          fr: 'Sur invitation officielle uniquement. Notre équipe coordonne le timing tapis rouge avec votre attaché de presse ou agent.',
          en: 'On official invitation only. Our team coordinates red carpet timing with your publicist or agent.',
        },
      },
      {
        q: { fr: 'Combien coûte un séjour pendant le Festival ?', en: 'How much for a Festival stay?' },
        a: {
          fr: 'Hôtel palace : €1,500-5,000/nuit. Chauffeur Mercedes V-Class : €140/transfert + €850/jour. Yacht 30m+ : €15,000+/jour.',
          en: 'Palace hotel: €1,500-5,000/night. Mercedes V-Class chauffeur: €140/transfer + €850/day. 30m+ yacht: €15,000+/day.',
        },
      },
      {
        q: { fr: 'Routes saturées ?', en: 'Saturated roads?' },
        a: {
          fr: 'A8 saturée toute la journée pendant les 10 jours. Hélicoptère évite tout (Nice-Cannes 5 min). Basse corniche en backup chauffeur.',
          en: 'A8 saturated all day during the 10 days. Helicopter bypasses everything (Nice-Cannes 5 min). Lower corniche as chauffeur backup.',
        },
      },
      {
        q: { fr: 'Tables Mirazur, Louis XV pendant le Festival ?', en: 'Mirazur, Louis XV tables during the Festival?' },
        a: {
          fr: 'Saturées 6 semaines avant. Notre équipe a des relations directes avec les maîtres d\'hôtel pour des fenêtres dernière minute.',
          en: 'Booked 6 weeks ahead. Our team holds direct relations with maîtres d\'hôtel for last-minute windows.',
        },
      },
    ],
  },

  'monaco-grand-prix': {
    heroImage: 'https://images.unsplash.com/photo-1605641532883-7ec48ed6800c?w=2400&q=85',
    signature: {
      fr: 'Six jours de circuit, soixante-huit tours, un Grand Prix.',
      en: 'Six days of circuit, sixty-eight laps, one Grand Prix.',
    },
    aboutImage: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=1600&q=80',
    aboutText: {
      fr: 'Le Grand Prix de Monaco est le rendez-vous le plus prestigieux de la Formule 1 depuis 1929. Pendant six jours fin mai, le circuit de 3,3 kilomètres ferme la moitié du centre-ville : virage du Casino, descente Mirabeau, hairpin Loews, tunnel, chicane Nouvelle, virages Tabac, piscine, Rascasse. Les écuries installent leurs paddocks à La Condamine et au Port Hercule, où les yachts servent de tribunes flottantes pour la course. Le gala AmFAR clôture la semaine. Notre service couvre les transferts (hélicoptère depuis Nice ou Cannes, chauffeur), la location de voitures de luxe immatriculées Monaco, le yacht charter avec emplacement circuit, et l\'accès aux soirées Casino et Sporting.',
      en: 'The Monaco Grand Prix is Formula 1\'s most prestigious rendez-vous since 1929. During six days late May, the 3.3-kilometre circuit closes half of downtown: Casino corner, Mirabeau descent, Loews hairpin, tunnel, Nouvelle chicane, Tabac corners, pool, Rascasse. Teams set their paddocks at La Condamine and Port Hercule, where yachts serve as floating grandstands for the race. The AmFAR gala closes the week. Our service covers transfers (helicopter from Nice or Cannes, chauffeur), Monaco-registered luxury car rental, yacht charter with circuit-side berth, and access to Casino and Sporting parties.',
    },
    dates: { fr: 'Mai (6 jours)', en: 'May (6 days)' },
    duration: { fr: '6 jours', en: '6 days' },
    venues: {
      fr: ['Circuit de Monaco', 'Port Hercule', 'Casino de Monte-Carlo', 'Sporting Monte-Carlo', 'Hôtel de Paris'],
      en: ['Monaco Circuit', 'Port Hercule', 'Monte-Carlo Casino', 'Sporting Monte-Carlo', 'Hôtel de Paris'],
    },
    whyMisana: {
      fr: [
        'Hélicoptère = seule option fluide. Routes Monaco fermées 6 jours, A8 saturée.',
        'Yacht au Port Hercule : tribune flottante directe sur le circuit (Rascasse, chicane, tunnel).',
        'Voitures de luxe immatriculées Monaco disponibles : Ferrari, Lamborghini, Rolls-Royce.',
        'Accès gala AmFAR et soirées Sporting/Jimmy\'z sur invitation, coordination préalable.',
        'Forfait studio écuries : aéronef dédié + chauffeurs + hospitalité yacht sur la durée.',
      ],
      en: [
        'Helicopter = only fluid option. Monaco roads closed 6 days, A8 saturated.',
        'Yacht at Port Hercule: floating grandstand directly on the circuit (Rascasse, chicane, tunnel).',
        'Monaco-registered luxury cars available: Ferrari, Lamborghini, Rolls-Royce.',
        'AmFAR gala access and Sporting/Jimmy\'z party access on invitation, prior coordination.',
        'Team studio package: dedicated aircraft + chauffeurs + yacht hospitality over the duration.',
      ],
    },
    faq: [
      {
        q: { fr: 'Quand a lieu le Grand Prix de Monaco ?', en: 'When is the Monaco Grand Prix?' },
        a: {
          fr: 'Fin mai sur 6 jours. Essais libres jeudi, qualifs samedi, course dimanche. Gala AmFAR le jeudi soir.',
          en: 'Late May over 6 days. Free practice Thursday, qualifying Saturday, race Sunday. AmFAR gala Thursday evening.',
        },
      },
      {
        q: { fr: 'Combien de temps avant réserver ?', en: 'How far in advance?' },
        a: {
          fr: 'Yachts au Port Hercule : 12 mois avant. Hôtels Monaco : 6 mois. Hélicoptère : 6 semaines minimum.',
          en: 'Port Hercule yachts: 12 months ahead. Monaco hotels: 6 months. Helicopter: 6 weeks minimum.',
        },
      },
      {
        q: { fr: 'Comment voir la course ?', en: 'How to watch the race?' },
        a: {
          fr: 'Tribunes officielles (sur invitation team), terrasse hôtel surplombant le circuit, ou yacht ancré au Port Hercule (vue Rascasse/chicane).',
          en: 'Official grandstands (on team invitation), hotel terrace overlooking the circuit, or yacht anchored at Port Hercule (Rascasse/chicane view).',
        },
      },
      {
        q: { fr: 'Combien coûte un séjour pendant le GP ?', en: 'How much for a GP stay?' },
        a: {
          fr: 'Hôtel Monaco : €2,000-8,000/nuit. Yacht 40m+ Port Hercule : €30,000+/jour. Forfait écurie : sur devis (€500k+).',
          en: 'Monaco hotel: €2,000-8,000/night. 40m+ Port Hercule yacht: €30,000+/day. Team package: quote-based (€500k+).',
        },
      },
      {
        q: { fr: 'Routes fermées ?', en: 'Closed roads?' },
        a: {
          fr: 'Moitié du centre-ville fermée 6 jours. Hélicoptère Fontvieille évite tout. Chauffeur depuis Nice difficile.',
          en: 'Half of downtown closed 6 days. Fontvieille helicopter bypasses everything. Chauffeur from Nice difficult.',
        },
      },
      {
        q: { fr: 'Accès paddock ?', en: 'Paddock access?' },
        a: {
          fr: 'Sur invitation team uniquement. Notre équipe coordonne tender depuis le yacht, pickup hélico depuis Fontvieille.',
          en: 'On team invitation only. Our team coordinates tender from yacht, helicopter pickup from Fontvieille.',
        },
      },
    ],
  },

  'cannes-lions': {
    heroImage: 'https://images.unsplash.com/photo-1543874768-2df4cdc1ddc8?w=2400&q=85',
    signature: {
      fr: 'Cinq jours de la Croisette en mode festival mondial de la création.',
      en: 'Five days of the Croisette as the global creative festival.',
    },
    aboutImage: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=1600&q=80',
    aboutText: {
      fr: 'Cannes Lions est le festival mondial de la créativité publicitaire et du marketing depuis 1954. Pendant cinq jours en juin, la Croisette accueille agences, marques, studios, plateformes (Spotify, Google, Meta, Pinterest, Snap, TikTok). Le Palais des Festivals diffuse les conférences, les plages d\'agences hébergent les activations brand, les yachts en rade servent de bureaux flottants. Notre service couvre les transferts business (chauffeur, hélicoptère depuis Nice), la location de SUV et GT pour les délégations, le yacht charter avec mouillage Croisette pour award nights, et l\'accès aux soirées agences sur invitation.',
      en: 'Cannes Lions is the global advertising and marketing creativity festival since 1954. During five days in June, the Croisette gathers agencies, brands, studios, platforms (Spotify, Google, Meta, Pinterest, Snap, TikTok). The Palais des Festivals hosts conferences, agency beaches host brand activations, anchored yachts serve as floating offices. Our service covers business transfers (chauffeur, helicopter from Nice), SUV and GT rental for delegations, yacht charter with Croisette anchorage for award nights, and access to agency parties on invitation.',
    },
    dates: { fr: 'Juin (5 jours)', en: 'June (5 days)' },
    duration: { fr: '5 jours', en: '5 days' },
    venues: {
      fr: ['Palais des Festivals', 'Croisette', 'Plages d\'agences (Spotify, Google, Meta, Pinterest, Snap)', 'Hôtels Carlton, Martinez, Majestic'],
      en: ['Palais des Festivals', 'Croisette', 'Agency beaches (Spotify, Google, Meta, Pinterest, Snap)', 'Carlton, Martinez, Majestic hotels'],
    },
    whyMisana: {
      fr: [
        'Forfait business : véhicule chauffeur dédié 5-7 jours, tarif dégressif (-15% sur 7j).',
        'SUV pour délégations 4-7 personnes, GT pour direction, convertibles pour soirées.',
        'Yacht-bureau : charter 5 jours pour usage business, équipement Wi-Fi, salle de réunion.',
        'Coordination préalable avec agences (Spotify, Google, Meta) pour les pickups synchronisés.',
        'Accès aux award nights et soirées privées sur invitation, mouillage Croisette autorisé.',
      ],
      en: [
        'Business package: dedicated chauffeur vehicle 5-7 days, degressive rate (-15% on 7d).',
        'SUV for 4-7 person delegations, GT for executives, convertibles for parties.',
        'Yacht-office: 5-day charter for business use, Wi-Fi equipment, meeting room.',
        'Prior coordination with agencies (Spotify, Google, Meta) for synchronised pickups.',
        'Award nights and private parties access on invitation, Croisette anchorage authorised.',
      ],
    },
    faq: [
      {
        q: { fr: 'Quand a lieu Cannes Lions ?', en: 'When is Cannes Lions?' },
        a: {
          fr: 'Mi-juin sur 5 jours, du lundi au vendredi. Award nights mardi, mercredi, jeudi soir au Palais.',
          en: 'Mid-June over 5 days, Monday to Friday. Award nights Tuesday, Wednesday, Thursday evening at the Palais.',
        },
      },
      {
        q: { fr: 'Combien de temps avant réserver ?', en: 'How far in advance to book?' },
        a: {
          fr: 'Yachts avec mouillage Croisette : 3 mois. Chauffeur dédié et hôtels : 3-6 semaines.',
          en: 'Yachts with Croisette anchorage: 3 months. Dedicated chauffeur and hotels: 3-6 weeks.',
        },
      },
      {
        q: { fr: 'Forfait business 5 jours ?', en: '5-day business package?' },
        a: {
          fr: 'Chauffeur + véhicule dédié pendant 5 jours (€3,500-5,000), aéronef dédié sur devis, yacht-bureau €40,000+.',
          en: 'Dedicated chauffeur + vehicle for 5 days (€3,500-5,000), dedicated aircraft quote-based, yacht-office €40,000+.',
        },
      },
      {
        q: { fr: 'Plages d\'agences ?', en: 'Agency beaches?' },
        a: {
          fr: 'Spotify, Google, Meta, Pinterest, Snap, TikTok privatisent les plages. Accès sur invitation, drop-off côté plage par notre équipe.',
          en: 'Spotify, Google, Meta, Pinterest, Snap, TikTok privatise the beaches. Access on invitation, beach-side drop-off by our team.',
        },
      },
      {
        q: { fr: 'Différence avec le Festival de Cannes ?', en: 'Difference with Cannes Film Festival?' },
        a: {
          fr: 'Cannes Lions = créativité pub + marketing (juin, 5 jours, agences). Festival = cinéma (mai, 10 jours, studios + talents).',
          en: 'Cannes Lions = ad + marketing creativity (June, 5 days, agencies). Festival = cinema (May, 10 days, studios + talents).',
        },
      },
      {
        q: { fr: 'Accès award nights ?', en: 'Award nights access?' },
        a: {
          fr: 'Sur badge Cannes Lions ou invitation directe. Notre équipe peut coordonner pickup post-cérémonie.',
          en: 'On Cannes Lions badge or direct invitation. Our team can coordinate post-ceremony pickup.',
        },
      },
    ],
  },

  'monaco-yacht-show': {
    heroImage: 'https://images.unsplash.com/photo-1551918120-9739cb430c6d?w=2400&q=85',
    signature: {
      fr: 'Quatre jours, cent vingt yachts, le rendez-vous du yachting mondial.',
      en: 'Four days, one hundred twenty yachts, the world yachting rendezvous.',
    },
    aboutImage: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=1600&q=80',
    aboutText: {
      fr: 'Le Monaco Yacht Show est le plus grand salon mondial du yachting de luxe depuis 1991. Pendant quatre jours fin septembre, le Port Hercule accueille cent vingt yachts en exposition (de quarante à cent vingt mètres), chantiers (Sanlorenzo, Lürssen, Feadship, Heesen, Benetti), équipementiers, brokers internationaux. Les ponts servent de salons d\'exposition, les hôtels de Paris, Métropole et Hermitage hébergent les rendez-vous business. Notre service couvre les visites yachts coordonnées brokers, le yacht charter pour hospitalité business, l\'hélicoptère vers les chantiers Riviera (Cap-Ferrat, Saint-Tropez), et l\'accès aux soirées sur ponts privatisés.',
      en: 'The Monaco Yacht Show is the world\'s largest luxury yachting show since 1991. During four days late September, Port Hercule hosts one hundred twenty yachts on display (from forty to one hundred twenty metres), yards (Sanlorenzo, Lürssen, Feadship, Heesen, Benetti), suppliers, international brokers. Decks serve as exhibition lounges, Hôtel de Paris, Métropole and Hermitage host business meetings. Our service covers broker-coordinated yacht visits, yacht charter for business hospitality, helicopter to Riviera yards (Cap-Ferrat, Saint-Tropez), and access to privatised deck parties.',
    },
    dates: { fr: 'Septembre (4 jours)', en: 'September (4 days)' },
    duration: { fr: '4 jours', en: '4 days' },
    venues: {
      fr: ['Port Hercule', 'Hôtel de Paris', 'Métropole', 'Hermitage', 'Chantiers Sanlorenzo Cap-Ferrat'],
      en: ['Port Hercule', 'Hôtel de Paris', 'Métropole', 'Hermitage', 'Sanlorenzo Cap-Ferrat yards'],
    },
    whyMisana: {
      fr: [
        'Visites yachts coordonnées : 4-5 yachts/jour avec accompagnement broker monégasque.',
        'Yacht charter pour hospitalité business : meetings brokers à bord, déjeuners armateurs.',
        'Hélicoptère 5 min vers chantiers Sanlorenzo Cap-Ferrat ou 18 min vers Lürssen Saint-Tropez.',
        'Coordination port-hôtel : pickups quai pour visites, transferts vers Hôtel de Paris.',
        'Accès aux soirées sur ponts privatisés et au gala officiel sur invitation.',
      ],
      en: [
        'Coordinated yacht visits: 4-5 yachts/day with Monaco broker support.',
        'Yacht charter for business hospitality: on-board broker meetings, owner lunches.',
        'Helicopter 5 min to Sanlorenzo Cap-Ferrat or 18 min to Lürssen Saint-Tropez yards.',
        'Port-hotel coordination: dock pickups for visits, transfers to Hôtel de Paris.',
        'Privatised deck parties and official gala access on invitation.',
      ],
    },
    faq: [
      {
        q: { fr: 'Quand a lieu le Monaco Yacht Show ?', en: 'When is the Monaco Yacht Show?' },
        a: {
          fr: 'Fin septembre sur 4 jours, généralement du mercredi au samedi. Gala officiel mercredi soir au Casino.',
          en: 'Late September over 4 days, usually Wednesday to Saturday. Official gala Wednesday evening at the Casino.',
        },
      },
      {
        q: { fr: 'Combien de temps avant réserver ?', en: 'How far in advance to book?' },
        a: {
          fr: 'Yachts du Show : 6 mois. Hôtels Monaco : 4-6 mois. Visites brokers : 3 mois.',
          en: 'Show yachts: 6 months. Monaco hotels: 4-6 months. Broker visits: 3 months.',
        },
      },
      {
        q: { fr: 'Visites yachts en vente ?', en: 'Yachts for sale visits?' },
        a: {
          fr: 'Notre équipe coordonne 4-5 visites par jour avec accompagnement broker. Possibilité d\'essais à bord pour les flagship.',
          en: 'Our team coordinates 4-5 visits per day with broker support. On-board trials possible for flagships.',
        },
      },
      {
        q: { fr: 'Mise en relation chantiers ?', en: 'Yard introductions?' },
        a: {
          fr: 'Sanlorenzo (Cap-Ferrat), Lürssen (Saint-Tropez), Feadship (Amsterdam), Heesen (Oss). Rendez-vous directs avec armateurs.',
          en: 'Sanlorenzo (Cap-Ferrat), Lürssen (Saint-Tropez), Feadship (Amsterdam), Heesen (Oss). Direct owner meetings.',
        },
      },
      {
        q: { fr: 'Combien coûte une visite ?', en: 'How much for a visit?' },
        a: {
          fr: 'Visite yacht : gratuite sur badge Show. Yacht charter 4 jours : €50,000+. Hélicoptère vers chantier : €1,000-2,000.',
          en: 'Yacht visit: free on Show badge. 4-day yacht charter: €50,000+. Helicopter to yard: €1,000-2,000.',
        },
      },
      {
        q: { fr: 'Soirées sur ponts ?', en: 'Deck parties?' },
        a: {
          fr: 'Yachts privatisés en soirée par chantiers ou brokers. Accès sur invitation, pickup tender depuis le quai.',
          en: 'Yachts privatised in the evening by yards or brokers. Access on invitation, tender pickup from the dock.',
        },
      },
    ],
  },
};

export function getEventDetail(slug: string): EventDetail | null {
  return DETAILS[slug] ?? null;
}
