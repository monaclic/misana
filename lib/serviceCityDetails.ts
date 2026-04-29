// Donnees fiche service x ville V1.
// 4 fiches chauffeur (Nice, Cannes, Monaco, Saint-Tropez) en pleine donnee.
// Voix Misana : factuelle, sobre, mots-cles SEO naturels par ville.

import { TRANSFERS } from '~/lib/constants';

export type ServiceCityDetail = {
  heroImage: string;
  heroTitle: { fr: string; en: string };
  signature: { fr: string; en: string };
  aboutImage: string;
  aboutTitle: { fr: string; en: string };
  aboutText: { fr: string; en: string };
  offerings: {
    titleFr: string;
    titleEn: string;
    descFr: string;
    descEn: string;
    image: string;
  }[];
  whyHere: { fr: string[]; en: string[] };
  popularTransferSlugs: string[];
  faq: { q: { fr: string; en: string }; a: { fr: string; en: string } }[];
  priceFrom: number;
  priceUnit: { fr: string; en: string };
};

const DETAILS: Record<string, ServiceCityDetail> = {
  // ============================================
  // CHAUFFEUR · CANNES
  // ============================================
  'chauffeur:cannes': {
    heroImage: 'https://images.unsplash.com/photo-1543874768-2df4cdc1ddc8?w=2400&q=85',
    heroTitle: { fr: 'Chauffeur Cannes', en: 'Chauffeur in Cannes' },
    signature: {
      fr: 'Mercedes V-Class à votre porte sur la Croisette.',
      en: 'Mercedes V-Class at your door on the Croisette.',
    },
    aboutImage: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=1600&q=80',
    aboutTitle: {
      fr: 'Notre service chauffeur à Cannes',
      en: 'Our chauffeur service in Cannes',
    },
    aboutText: {
      fr: 'Le service chauffeur Misana à Cannes opère sept jours sur sept, vingt-quatre heures sur vingt-quatre, avec une flotte Mercedes V-Class et S-Class pré-positionnée sur la Croisette en haute saison. Que ce soit pour un transfert depuis l\'aéroport de Nice, un déplacement vers Monaco ou Saint-Tropez, une mise à disposition à la journée, ou les besoins logistiques pendant le Festival de Cannes, notre équipe coordonne le chauffeur, la voiture, l\'itinéraire et l\'accueil. Tarif transparent à partir de cent vingt euros, réponse sous deux heures, annulation gratuite jusqu\'à vingt-quatre heures avant le départ.',
      en: 'Misana\'s chauffeur service in Cannes operates seven days a week, twenty-four hours a day, with a Mercedes V-Class and S-Class fleet pre-positioned on the Croisette in peak season. Whether for a transfer from Nice airport, a trip to Monaco or Saint-Tropez, a day disposal, or logistical needs during the Cannes Film Festival, our team coordinates the driver, the car, the route, and the welcome. Transparent pricing from one hundred twenty euros, reply within two hours, free cancellation up to twenty-four hours before departure.',
    },
    offerings: [
      {
        titleFr: 'Transferts hôtels',
        titleEn: 'Hotel transfers',
        descFr: 'Carlton, Martinez, Majestic, Grand Hyatt, Hôtel Barrière. Pickup et dépose à votre adresse exacte sur la Croisette.',
        descEn: 'Carlton, Martinez, Majestic, Grand Hyatt, Hôtel Barrière. Pickup and drop-off at your exact address on the Croisette.',
        image: 'https://images.unsplash.com/photo-1519452575417-564c1401ecc0?w=800&q=80',
      },
      {
        titleFr: 'Logistique Festival',
        titleEn: 'Festival logistics',
        descFr: 'Pickup tapis rouge, transferts entre projections, sécurisation des nuits tardives. Coordination avec studios.',
        descEn: 'Red carpet pickup, transfers between screenings, securing late nights. Coordination with studios.',
        image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80',
      },
      {
        titleFr: 'Mise à disposition',
        titleEn: 'Day disposal',
        descFr: 'Huit ou douze heures avec le même chauffeur, à votre rythme. Affaires, shopping, multi-visites.',
        descEn: 'Eight or twelve hours with the same driver, at your pace. Business, shopping, multi-visit days.',
        image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&q=80',
      },
      {
        titleFr: 'Aéroport de Nice',
        titleEn: 'Nice airport',
        descFr: 'Trente minutes par l\'A8 hors pointe. Suivi des vols, attente gratuite, panneau au nom du voyageur.',
        descEn: 'Thirty minutes via the A8 off-peak. Flight tracking, free waiting, name sign for the traveller.',
        image: 'https://images.unsplash.com/photo-1543874768-2df4cdc1ddc8?w=800&q=80',
      },
    ],
    whyHere: {
      fr: [
        'Flotte Mercedes V-Class et S-Class pré-positionnée sur la Croisette en haute saison.',
        'Relations directes avec les concierges du Carlton, Martinez, Majestic et Grand Hyatt.',
        'Opérations Festival de Cannes maîtrisées : protocoles tapis rouge, transferts entre projections, sécurité nocturne.',
        'Chauffeurs anglophones par défaut, multilingue sur demande (italien, allemand, arabe, mandarin).',
        'Véhicule de remplacement disponible sous quinze minutes en cas d\'imprévu.',
      ],
      en: [
        'Mercedes V-Class and S-Class fleet pre-positioned on the Croisette in peak season.',
        'Direct relationships with Carlton, Martinez, Majestic and Grand Hyatt concierges.',
        'Cannes Festival operations mastered: red carpet protocols, transfers between screenings, late-night security.',
        'English-speaking drivers by default, multilingual on request (Italian, German, Arabic, Mandarin).',
        'Replacement vehicle available within fifteen minutes in case of incident.',
      ],
    },
    popularTransferSlugs: ['nice-airport-cannes', 'cannes-monaco', 'cannes-saint-tropez', 'cannes-nice'],
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
          fr: 'Réservation conseillée trois à cinq jours avant. Trafic A8 saturé, basse corniche en backup. Coordination avec les studios sur demande.',
          en: 'Booking advised three to five days ahead. A8 traffic saturated, lower corniche as backup. Coordination with studios on request.',
        },
      },
      {
        q: { fr: 'Quels véhicules disponibles à Cannes ?', en: 'Which vehicles are available in Cannes?' },
        a: {
          fr: 'Mercedes V-Class par défaut (jusqu\'à 7 passagers, 4 grandes valises). Mercedes S-Class pour 3 pax discrets. Range Rover sur demande.',
          en: 'Mercedes V-Class by default (up to 7 passengers, 4 large suitcases). Mercedes S-Class for 3 discreet pax. Range Rover on request.',
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
          fr: 'Gratuite jusqu\'à 24h avant. 50% retenus entre 24h et 4h. 100% moins de 4h ou no-show.',
          en: 'Free up to 24h before. 50% retained between 24h and 4h. 100% less than 4h or no-show.',
        },
      },
    ],
    priceFrom: 120,
    priceUnit: { fr: 'par transfert', en: 'per transfer' },
  },

  // ============================================
  // CHAUFFEUR · MONACO
  // ============================================
  'chauffeur:monaco': {
    heroImage: 'https://images.unsplash.com/photo-1605641532883-7ec48ed6800c?w=2400&q=85',
    heroTitle: { fr: 'Chauffeur Monaco', en: 'Chauffeur in Monaco' },
    signature: {
      fr: 'Place du Casino, Larvotto, Fontvieille. Mercedes au cœur de la Principauté.',
      en: 'Place du Casino, Larvotto, Fontvieille. Mercedes at the heart of the Principality.',
    },
    aboutImage: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=1600&q=80',
    aboutTitle: {
      fr: 'Notre service chauffeur à Monaco',
      en: 'Our chauffeur service in Monaco',
    },
    aboutText: {
      fr: 'Le service chauffeur Misana à Monaco opère vingt-quatre heures sur vingt-quatre dans la Principauté et au-delà. Mercedes V-Class et S-Class disponibles à la Place du Casino, Larvotto, Fontvieille, La Condamine. Que ce soit pour un transfert depuis l\'aéroport de Nice, une soirée au Sporting, un dîner au Louis XV, ou la logistique du Grand Prix, notre équipe coordonne le pickup, l\'itinéraire et l\'accueil. Tarif à partir de cent trente euros par transfert, réponse sous deux heures, anglophone par défaut.',
      en: 'Misana\'s chauffeur service in Monaco operates twenty-four hours a day in the Principality and beyond. Mercedes V-Class and S-Class available at Place du Casino, Larvotto, Fontvieille, La Condamine. Whether for a transfer from Nice airport, an evening at the Sporting, a dinner at Le Louis XV, or Grand Prix logistics, our team coordinates pickup, route and welcome. From one hundred thirty euros per transfer, reply within two hours, English-speaking by default.',
    },
    offerings: [
      {
        titleFr: 'Hôtels & palaces',
        titleEn: 'Hotels & palaces',
        descFr: 'Hôtel de Paris, Métropole, Hermitage, Fairmont, Monte-Carlo Bay. Accès direct à votre adresse.',
        descEn: 'Hôtel de Paris, Métropole, Hermitage, Fairmont, Monte-Carlo Bay. Direct access to your address.',
        image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&q=80',
      },
      {
        titleFr: 'Grand Prix logistics',
        titleEn: 'Grand Prix logistics',
        descFr: 'Accès paddock, transferts entre événements, soirées tardives. Coordination préalable avec les écuries.',
        descEn: 'Paddock access, transfers between events, late nights. Prior coordination with teams.',
        image: 'https://images.unsplash.com/photo-1605641532883-7ec48ed6800c?w=800&q=80',
      },
      {
        titleFr: 'Casino & Sporting',
        titleEn: 'Casino & Sporting',
        descFr: 'Pickup et retour à toute heure du Casino de Monte-Carlo, Sporting, Jimmy\'z. Discret et ponctuel.',
        descEn: 'Pickup and return at any hour from Monte-Carlo Casino, Sporting, Jimmy\'z. Discreet and on time.',
        image: 'https://images.unsplash.com/photo-1571266028243-e1c2c5b15e2d?w=800&q=80',
      },
      {
        titleFr: 'Aéroport de Nice',
        titleEn: 'Nice airport',
        descFr: 'Trente minutes par l\'A8 hors pointe. Hélicoptère sept minutes en alternative pour la pression horaire.',
        descEn: 'Thirty minutes via the A8 off-peak. Helicopter seven minutes alternative for time pressure.',
        image: 'https://images.unsplash.com/photo-1543874768-2df4cdc1ddc8?w=800&q=80',
      },
    ],
    whyHere: {
      fr: [
        'Mercedes V-Class et S-Class pré-positionnées Place du Casino, Larvotto, Fontvieille.',
        'Relations directes avec les concierges du Hôtel de Paris, Métropole, Hermitage, Fairmont.',
        'Opérations Grand Prix : accès paddock, transferts entre événements, sécurité nocturne.',
        'Service nocturne 24/7 pour Casino, Sporting, Jimmy\'z. Retour à votre hôtel à toute heure.',
        'Hélicoptère 7 minutes vers Nice ou Saint-Tropez en alternative à la route quand requis.',
      ],
      en: [
        'Mercedes V-Class and S-Class pre-positioned at Place du Casino, Larvotto, Fontvieille.',
        'Direct relationships with Hôtel de Paris, Métropole, Hermitage, Fairmont concierges.',
        'Grand Prix operations: paddock access, transfers between events, late-night security.',
        'Night service 24/7 for Casino, Sporting, Jimmy\'z. Return to your hotel at any hour.',
        'Helicopter 7 minutes to Nice or Saint-Tropez as alternative to road when required.',
      ],
    },
    popularTransferSlugs: ['nice-airport-monaco', 'cannes-monaco', 'monaco-saint-tropez', 'monaco-menton'],
    faq: [
      {
        q: { fr: 'Combien coûte un chauffeur à Monaco ?', en: 'How much does a chauffeur in Monaco cost?' },
        a: {
          fr: 'À partir de €130 par transfert en Mercedes V-Class. €190 en S-Class. Mise à disposition à partir de €750 pour 8 heures.',
          en: 'From €130 per transfer in Mercedes V-Class. €190 in S-Class. Day disposal from €750 for 8 hours.',
        },
      },
      {
        q: { fr: 'Pendant le Grand Prix de Monaco ?', en: 'During the Monaco Grand Prix?' },
        a: {
          fr: 'Routes saturées, accès restreint en centre-ville. Réserver six semaines avant minimum. Hélicoptère privilégié.',
          en: 'Saturated roads, restricted downtown access. Book six weeks ahead minimum. Helicopter preferred.',
        },
      },
      {
        q: { fr: 'Service nocturne ?', en: 'Night service?' },
        a: {
          fr: 'Oui, 24/7 sur Monaco. Pickup au Casino, Sporting, Jimmy\'z à toute heure. Retour direct à votre hôtel ou villa.',
          en: 'Yes, 24/7 in Monaco. Pickup at Casino, Sporting, Jimmy\'z at any hour. Direct return to your hotel or villa.',
        },
      },
      {
        q: { fr: 'Aéroport de Nice ou hélicoptère ?', en: 'Nice airport or helicopter?' },
        a: {
          fr: 'Chauffeur 30 min hors pointe. Hélicoptère 7 min depuis Fontvieille. Hélico privilégié en saison ou pendant le Grand Prix.',
          en: 'Chauffeur 30 min off-peak. Helicopter 7 min from Fontvieille. Helicopter preferred in season or during the Grand Prix.',
        },
      },
      {
        q: { fr: 'Anglophone ?', en: 'English-speaking?' },
        a: {
          fr: 'Oui, par défaut. Italien, allemand, arabe, mandarin disponibles sur demande.',
          en: 'Yes, by default. Italian, German, Arabic, Mandarin available on request.',
        },
      },
      {
        q: { fr: 'Annulation ?', en: 'Cancellation?' },
        a: {
          fr: 'Gratuite jusqu\'à 24h avant. 50% retenus entre 24h et 4h. 100% moins de 4h.',
          en: 'Free up to 24h before. 50% retained between 24h and 4h. 100% less than 4h.',
        },
      },
    ],
    priceFrom: 130,
    priceUnit: { fr: 'par transfert', en: 'per transfer' },
  },

  // ============================================
  // CHAUFFEUR · NICE
  // ============================================
  'chauffeur:nice': {
    heroImage: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=2400&q=85',
    heroTitle: { fr: 'Chauffeur Nice', en: 'Chauffeur in Nice' },
    signature: {
      fr: 'Promenade des Anglais, aéroport, Vieux-Nice. La Côte d\'Azur depuis sa porte d\'entrée.',
      en: 'Promenade des Anglais, airport, Old Nice. The Riviera from its main gateway.',
    },
    aboutImage: 'https://images.unsplash.com/photo-1543874768-2df4cdc1ddc8?w=1600&q=80',
    aboutTitle: {
      fr: 'Notre service chauffeur à Nice',
      en: 'Our chauffeur service in Nice',
    },
    aboutText: {
      fr: 'Nice est le hub aéroportuaire de la Côte d\'Azur. Notre service chauffeur opère depuis l\'aéroport Nice Côte d\'Azur, deuxième plus grand de France, vers toutes les villes de la Riviera. Mercedes V-Class et S-Class avec accueil panneau au nom du voyageur, suivi des vols, attente gratuite jusqu\'à une heure. Sur Nice intra-muros, nous couvrons le Negresco, la Promenade, le Vieux-Nice, Cimiez. Tarif à partir de cent dix euros par transfert, réponse sous deux heures.',
      en: 'Nice is the airport hub of the French Riviera. Our chauffeur service operates from Nice Côte d\'Azur airport, France\'s second-largest, to all cities on the Riviera. Mercedes V-Class and S-Class with name-sign welcome, flight tracking, free waiting up to one hour. Within Nice, we cover the Negresco, the Promenade, Old Nice, Cimiez. From one hundred ten euros per transfer, reply within two hours.',
    },
    offerings: [
      {
        titleFr: 'Aéroport Nice Côte d\'Azur',
        titleEn: 'Nice Côte d\'Azur airport',
        descFr: 'Accueil sortie bagages, panneau au nom du voyageur, suivi temps réel des vols, attente gratuite 1h.',
        descEn: 'Welcome at baggage hall exit, name sign, real-time flight tracking, 1h free waiting.',
        image: 'https://images.unsplash.com/photo-1543874768-2df4cdc1ddc8?w=800&q=80',
      },
      {
        titleFr: 'Hôtels Promenade',
        titleEn: 'Promenade hotels',
        descFr: 'Negresco, Hyatt Regency, Boscolo, Anantara Plaza. Pickup et dépose face mer.',
        descEn: 'Negresco, Hyatt Regency, Boscolo, Anantara Plaza. Pickup and drop-off facing the sea.',
        image: 'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=800&q=80',
      },
      {
        titleFr: 'Mise à disposition',
        titleEn: 'Day disposal',
        descFr: 'Huit ou douze heures, idéal pour visiter le Vieux-Nice, Cimiez, Saint-Paul de Vence, l\'arrière-pays.',
        descEn: 'Eight or twelve hours, ideal for visiting Old Nice, Cimiez, Saint-Paul de Vence, the inland.',
        image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&q=80',
      },
      {
        titleFr: 'Transferts Riviera',
        titleEn: 'Riviera transfers',
        descFr: 'Monaco, Cannes, Saint-Tropez, Cap-Ferrat depuis Nice. A8 ou basse corniche selon trafic.',
        descEn: 'Monaco, Cannes, Saint-Tropez, Cap-Ferrat from Nice. A8 or lower corniche based on traffic.',
        image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80',
      },
    ],
    whyHere: {
      fr: [
        'Hub aéroportuaire principal : 14 millions de passagers par an, 100+ destinations directes.',
        'Mercedes V-Class et S-Class avec suivi des vols en temps réel, attente gratuite 1h.',
        'Couverture intégrale Nice intra-muros : Promenade, Vieux-Nice, Cimiez, Mont Boron, port.',
        'Transferts vers toute la Riviera : Cannes 30 min, Monaco 30 min, Saint-Tropez 1h30.',
        'Chauffeurs anglophones, multilingue sur demande. Sièges enfants gratuits sur demande préalable.',
      ],
      en: [
        'Main airport hub: 14 million passengers per year, 100+ direct destinations.',
        'Mercedes V-Class and S-Class with real-time flight tracking, 1h free waiting.',
        'Full coverage of Nice city: Promenade, Old Nice, Cimiez, Mont Boron, port.',
        'Transfers to the whole Riviera: Cannes 30 min, Monaco 30 min, Saint-Tropez 1h30.',
        'English-speaking drivers, multilingual on request. Free child seats on prior request.',
      ],
    },
    popularTransferSlugs: ['nice-airport-monaco', 'nice-airport-cannes', 'nice-airport-saint-tropez', 'nice-airport-cap-ferrat'],
    faq: [
      {
        q: { fr: 'Combien coûte un chauffeur à Nice ?', en: 'How much does a chauffeur in Nice cost?' },
        a: {
          fr: 'À partir de €110 pour un transfert simple en Mercedes V-Class. €170 en S-Class. Mise à disposition à partir de €650 pour 8 heures.',
          en: 'From €110 for a simple transfer in Mercedes V-Class. €170 in S-Class. Day disposal from €650 for 8 hours.',
        },
      },
      {
        q: { fr: 'Le chauffeur attend-il à l\'aéroport en cas de retard ?', en: 'Does the chauffeur wait at the airport for a delayed flight?' },
        a: {
          fr: 'Oui, suivi temps réel. Une heure d\'attente gratuite à compter de l\'heure d\'arrivée prévue.',
          en: 'Yes, real-time flight tracking. One hour of free waiting from scheduled arrival.',
        },
      },
      {
        q: { fr: 'Y a-t-il un panneau à l\'arrivée ?', en: 'Is there a name sign on arrival?' },
        a: {
          fr: 'Oui, panneau professionnel à la sortie des bagages, terminal 1 ou 2 selon le vol.',
          en: 'Yes, professional sign at the baggage hall exit, terminal 1 or 2 depending on the flight.',
        },
      },
      {
        q: { fr: 'Quels véhicules disponibles ?', en: 'Which vehicles are available?' },
        a: {
          fr: 'Mercedes V-Class jusqu\'à 7 passagers et 4 grandes valises. Mercedes S-Class pour 3 passagers. Range Rover sur demande.',
          en: 'Mercedes V-Class up to 7 passengers and 4 large suitcases. Mercedes S-Class for 3 passengers. Range Rover on request.',
        },
      },
      {
        q: { fr: 'Couverture arrière-pays ?', en: 'Inland coverage?' },
        a: {
          fr: 'Oui : Saint-Paul de Vence, Vence, Mougins, Grasse, Èze. Mise à disposition recommandée pour les visites multi-étapes.',
          en: 'Yes: Saint-Paul de Vence, Vence, Mougins, Grasse, Èze. Day disposal recommended for multi-stop visits.',
        },
      },
      {
        q: { fr: 'Annulation ?', en: 'Cancellation?' },
        a: {
          fr: 'Gratuite jusqu\'à 24h avant. 50% retenus entre 24h et 4h. 100% moins de 4h.',
          en: 'Free up to 24h before. 50% retained between 24h and 4h. 100% less than 4h.',
        },
      },
    ],
    priceFrom: 110,
    priceUnit: { fr: 'par transfert', en: 'per transfer' },
  },

  // ============================================
  // CHAUFFEUR · SAINT-TROPEZ
  // ============================================
  'chauffeur:saint-tropez': {
    heroImage: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=2400&q=85',
    heroTitle: { fr: 'Chauffeur Saint-Tropez', en: 'Chauffeur in Saint-Tropez' },
    signature: {
      fr: 'Pampelonne, le port, Cheval Blanc. Mercedes pour le village et les paillotes.',
      en: 'Pampelonne, the port, Cheval Blanc. Mercedes for the village and the beach clubs.',
    },
    aboutImage: 'https://images.unsplash.com/photo-1530541930197-ff16ac917b0e?w=1600&q=80',
    aboutTitle: {
      fr: 'Notre service chauffeur à Saint-Tropez',
      en: 'Our chauffeur service in Saint-Tropez',
    },
    aboutText: {
      fr: 'Saint-Tropez vit une saison concentrée de mai à octobre. Notre service chauffeur opère sur le village, la presqu\'île, Pampelonne, Ramatuelle, Gassin. Mercedes V-Class par défaut, idéale pour les transferts entre votre villa, le port et les paillotes (Club 55, Bagatelle, Cheval Blanc Plage). Pendant le pic d\'été, la flotte est pré-positionnée localement pour réagir aux demandes du jour. Tarif à partir de cent quarante euros, réponse sous deux heures, anglophone par défaut.',
      en: 'Saint-Tropez lives a concentrated season from May to October. Our chauffeur service operates on the village, the peninsula, Pampelonne, Ramatuelle, Gassin. Mercedes V-Class by default, ideal for transfers between your villa, the port and the beach clubs (Club 55, Bagatelle, Cheval Blanc Plage). During peak summer, the fleet is pre-positioned locally to handle same-day requests. From one hundred forty euros, reply within two hours, English-speaking by default.',
    },
    offerings: [
      {
        titleFr: 'Villas & paillotes',
        titleEn: 'Villas & beach clubs',
        descFr: 'Transferts villa au port, villa à Pampelonne. Club 55, Bagatelle, Verde, Cheval Blanc Plage.',
        descEn: 'Villa to port, villa to Pampelonne transfers. Club 55, Bagatelle, Verde, Cheval Blanc Plage.',
        image: 'https://images.unsplash.com/photo-1530541930197-ff16ac917b0e?w=800&q=80',
      },
      {
        titleFr: 'Hôtels du village',
        titleEn: 'Village hotels',
        descFr: 'Cheval Blanc Saint-Tropez, Byblos, Hotel de Paris, La Réserve Ramatuelle. Accès direct au village.',
        descEn: 'Cheval Blanc Saint-Tropez, Byblos, Hotel de Paris, La Réserve Ramatuelle. Direct village access.',
        image: 'https://images.unsplash.com/photo-1551918120-9739cb430c6d?w=800&q=80',
      },
      {
        titleFr: 'Aéroport de Nice',
        titleEn: 'Nice airport',
        descFr: '1h30 hors saison, jusqu\'à 2h30 en juillet-août sur l\'A8. Hélicoptère 18 min en alternative.',
        descEn: '1h30 off-season, up to 2h30 in July-August on the A8. Helicopter 18 min as alternative.',
        image: 'https://images.unsplash.com/photo-1543874768-2df4cdc1ddc8?w=800&q=80',
      },
      {
        titleFr: 'Mise à disposition',
        titleEn: 'Day disposal',
        descFr: 'Huit ou douze heures pour visiter Ramatuelle, Gassin, Port Grimaud, ou rester sur la presqu\'île.',
        descEn: 'Eight or twelve hours to visit Ramatuelle, Gassin, Port Grimaud, or stay on the peninsula.',
        image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&q=80',
      },
    ],
    whyHere: {
      fr: [
        'Flotte Mercedes V-Class pré-positionnée localement de mai à octobre.',
        'Connaissance fine des routes saturées de l\'été : routes des Plages, accès villas en hauteur.',
        'Relations directes avec les concierges Cheval Blanc, Byblos, La Réserve Ramatuelle.',
        'Coordination avec les paillotes Pampelonne pour dépose côté plage en saison.',
        'Hélicoptère 18 minutes vers Nice ou Monaco quand la pression horaire l\'exige.',
      ],
      en: [
        'Mercedes V-Class fleet pre-positioned locally from May to October.',
        'Detailed knowledge of saturated summer roads: route des Plages, hilltop villa access.',
        'Direct relationships with Cheval Blanc, Byblos, La Réserve Ramatuelle concierges.',
        'Coordination with Pampelonne beach clubs for beach-side drop-off in season.',
        'Helicopter 18 minutes to Nice or Monaco when time pressure demands.',
      ],
    },
    popularTransferSlugs: ['nice-airport-saint-tropez', 'cannes-saint-tropez', 'monaco-saint-tropez', 'cap-ferrat-saint-tropez'],
    faq: [
      {
        q: { fr: 'Combien coûte un chauffeur à Saint-Tropez ?', en: 'How much does a chauffeur in Saint-Tropez cost?' },
        a: {
          fr: 'À partir de €140 pour un transfert sur la presqu\'île en V-Class. €200 en S-Class. Mise à disposition à partir de €750 pour 8 heures.',
          en: 'From €140 for a transfer on the peninsula in V-Class. €200 in S-Class. Day disposal from €750 for 8 hours.',
        },
      },
      {
        q: { fr: 'Pendant la saison Pampelonne ?', en: 'During the Pampelonne season?' },
        a: {
          fr: 'Pic de mi-juillet à fin août. Réservation 3-5 jours avant. Routes saturées le week-end, départs anticipés recommandés.',
          en: 'Peak mid-July to end of August. Book 3-5 days ahead. Saturated roads on weekends, early departures recommended.',
        },
      },
      {
        q: { fr: 'Dépose directe à la paillote ?', en: 'Direct drop-off at the beach club?' },
        a: {
          fr: 'Oui, à Club 55, Bagatelle, Verde, Tahiti, Cheval Blanc Plage. Coordination préalable avec la paillote.',
          en: 'Yes, at Club 55, Bagatelle, Verde, Tahiti, Cheval Blanc Plage. Prior coordination with the beach club.',
        },
      },
      {
        q: { fr: 'Aéroport de Nice ou hélicoptère ?', en: 'Nice airport or helicopter?' },
        a: {
          fr: 'Chauffeur 1h30 hors saison, 2h30 en saison. Hélicoptère 18 min. Hélico privilégié en pleine saison.',
          en: 'Chauffeur 1h30 off-season, 2h30 in season. Helicopter 18 min. Helicopter preferred in peak season.',
        },
      },
      {
        q: { fr: 'Couverture hors saison ?', en: 'Off-season coverage?' },
        a: {
          fr: 'Oui, sur demande. Flotte sur Cannes ou Nice repositionnée selon la demande, pickup en 1h sur la presqu\'île.',
          en: 'Yes, on request. Fleet from Cannes or Nice repositioned per demand, pickup within 1h on the peninsula.',
        },
      },
      {
        q: { fr: 'Annulation ?', en: 'Cancellation?' },
        a: {
          fr: 'Gratuite jusqu\'à 24h avant. 50% retenus entre 24h et 4h. 100% moins de 4h.',
          en: 'Free up to 24h before. 50% retained between 24h and 4h. 100% less than 4h.',
        },
      },
    ],
    priceFrom: 140,
    priceUnit: { fr: 'par transfert', en: 'per transfer' },
  },

  // ============================================
  // CARS · CANNES
  // ============================================
  'cars:cannes': {
    heroImage: 'https://excellenceriviera.com/wp-content/uploads/2020/05/Bentley-Continental-GTC-4.jpg',
    heroTitle: { fr: 'Location voiture de luxe Cannes', en: 'Luxury car rental in Cannes' },
    signature: {
      fr: 'Ferrari, Lamborghini, Bentley. Livrées à votre hôtel sur la Croisette.',
      en: 'Ferrari, Lamborghini, Bentley. Delivered to your hotel on the Croisette.',
    },
    aboutImage: 'https://excellenceriviera.com/wp-content/uploads/2020/06/Ferrari-812-Superfast-Featured.jpg',
    aboutTitle: { fr: 'Notre location de luxe à Cannes', en: 'Our luxury rental in Cannes' },
    aboutText: {
      fr: 'La location de voiture de luxe à Cannes répond à plusieurs scénarios : descendre la Croisette en cabriolet, conduire jusqu\'à Monaco ou Saint-Tropez par la corniche, faire une arrivée remarquée pendant le Festival, ou simplement disposer d\'un véhicule pendant la durée du séjour. Notre flotte couvre Ferrari, Lamborghini, Bentley, Rolls-Royce, Range Rover, livrée directement à votre hôtel ou villa, sans surcoût de livraison sur Cannes intra-muros. Tarif à partir de huit cents euros par jour selon le modèle et la saison.',
      en: 'Luxury car rental in Cannes meets several scenarios: cruising the Croisette in a convertible, driving to Monaco or Saint-Tropez via the corniche, making an arrival during the Festival, or simply having a vehicle for the stay. Our fleet covers Ferrari, Lamborghini, Bentley, Rolls-Royce, Range Rover, delivered directly to your hotel or villa, no delivery surcharge in central Cannes. From eight hundred euros per day depending on model and season.',
    },
    offerings: [
      {
        titleFr: 'Livraison hôtel',
        titleEn: 'Hotel delivery',
        descFr: 'Carlton, Martinez, Majestic, Grand Hyatt, Barrière. Voiture livrée au voiturier, clés remises en main propre.',
        descEn: 'Carlton, Martinez, Majestic, Grand Hyatt, Barrière. Car delivered to the valet, keys handed over in person.',
        image: 'https://excellenceriviera.com/wp-content/uploads/2020/05/bentley-bentayga-4-1.jpg',
      },
      {
        titleFr: 'Drives Riviera',
        titleEn: 'Riviera drives',
        descFr: 'Cannes-Monaco par la corniche, Cannes-Saint-Tropez par l\'arrière-pays, montée à Èze ou Saint-Paul de Vence.',
        descEn: 'Cannes-Monaco via the corniche, Cannes-Saint-Tropez via the inland, climb to Èze or Saint-Paul de Vence.',
        image: 'https://excellenceriviera.com/wp-content/uploads/2020/06/Ferrari-812-Superfast-Featured.jpg',
      },
      {
        titleFr: 'Festival arrival',
        titleEn: 'Festival arrival',
        descFr: 'Convertibles et supercars disponibles pour les arrivées tapis rouge ou les soirées privées du Festival.',
        descEn: 'Convertibles and supercars available for red carpet arrivals or Festival private parties.',
        image: 'https://excellenceriviera.com/wp-content/uploads/2020/05/Bentley-Continental-GTC-4.jpg',
      },
      {
        titleFr: 'Location longue',
        titleEn: 'Long-term rental',
        descFr: 'Forfait semaine ou plus avec tarif dégressif. Voiture de remplacement disponible si imprévu.',
        descEn: 'Weekly or longer package with degressive pricing. Replacement vehicle available if needed.',
        image: 'https://excellenceriviera.com/wp-content/uploads/2020/05/ferrari-portofino-6.jpg',
      },
    ],
    whyHere: {
      fr: [
        'Flotte complète à Cannes : supercars, GT, SUV, convertibles, sedans de prestige.',
        'Livraison gratuite à votre adresse (Croisette, Suquet, Cannet, Mougins).',
        'Rachat de franchise inclus dans le tarif, pas de caution bloquée.',
        'Voiture de remplacement disponible sous 2 heures en cas d\'incident.',
        'Pendant le Festival : flotte étendue, réservation 3 semaines avant pour les modèles phares.',
      ],
      en: [
        'Complete fleet in Cannes: supercars, GT, SUV, convertibles, prestige sedans.',
        'Free delivery to your address (Croisette, Suquet, Cannet, Mougins).',
        'Excess waiver included in the price, no blocked deposit.',
        'Replacement vehicle available within 2 hours if incident.',
        'During the Festival: extended fleet, book 3 weeks ahead for flagship models.',
      ],
    },
    popularTransferSlugs: ['cannes-monaco', 'cannes-saint-tropez', 'cannes-nice'],
    faq: [
      {
        q: { fr: 'Combien coûte une voiture de luxe à Cannes ?', en: 'How much does a luxury car cost in Cannes?' },
        a: {
          fr: 'À partir de €800/jour pour une berline prestige (Mercedes Classe S), €1,200 pour une convertible (Bentley GTC), €2,000 pour une supercar (Ferrari 812).',
          en: 'From €800/day for a prestige sedan (Mercedes S-Class), €1,200 for a convertible (Bentley GTC), €2,000 for a supercar (Ferrari 812).',
        },
      },
      {
        q: { fr: 'Livraison à l\'hôtel ?', en: 'Hotel delivery?' },
        a: {
          fr: 'Oui, gratuite sur Cannes intra-muros. Le Cannet et Mougins en supplément 50€. Carlton, Martinez, Majestic, Grand Hyatt accessibles directement.',
          en: 'Yes, free in central Cannes. Le Cannet and Mougins +€50. Carlton, Martinez, Majestic, Grand Hyatt directly accessible.',
        },
      },
      {
        q: { fr: 'Quelle franchise ?', en: 'What deductible?' },
        a: {
          fr: 'Rachat de franchise total inclus dans le tarif. Pas de caution bloquée sur la carte. Couverture tous risques.',
          en: 'Total excess waiver included. No blocked deposit on the card. Comprehensive coverage.',
        },
      },
      {
        q: { fr: 'Pendant le Festival de Cannes ?', en: 'During the Cannes Festival?' },
        a: {
          fr: 'Réserver 3 semaines avant pour les modèles flagship (Ferrari, Lamborghini, Rolls-Royce). Tarifs majorés de 15-20% pendant l\'événement.',
          en: 'Book 3 weeks ahead for flagship models (Ferrari, Lamborghini, Rolls-Royce). Rates +15-20% during the event.',
        },
      },
      {
        q: { fr: 'Permis et conditions ?', en: 'License and conditions?' },
        a: {
          fr: 'Permis B depuis 5 ans minimum, 28 ans minimum pour les supercars. Caution carte bancaire à la livraison (déblocage à la restitution).',
          en: 'Class B license for 5 years minimum, 28 years old minimum for supercars. Card pre-authorisation at delivery (released on return).',
        },
      },
    ],
    priceFrom: 800,
    priceUnit: { fr: 'par jour', en: 'per day' },
  },

  // ============================================
  // CARS · MONACO
  // ============================================
  'cars:monaco': {
    heroImage: 'https://excellenceriviera.com/wp-content/uploads/2020/06/Ferrari-812-Superfast-Featured.jpg',
    heroTitle: { fr: 'Location voiture de luxe Monaco', en: 'Luxury car rental in Monaco' },
    signature: {
      fr: 'Place du Casino, Larvotto, Fontvieille. Voitures livrées au cœur de la Principauté.',
      en: 'Place du Casino, Larvotto, Fontvieille. Cars delivered at the heart of the Principality.',
    },
    aboutImage: 'https://excellenceriviera.com/wp-content/uploads/2020/05/Bentley-Continental-GTC-4.jpg',
    aboutTitle: { fr: 'Notre location de luxe à Monaco', en: 'Our luxury rental in Monaco' },
    aboutText: {
      fr: 'Monaco est la capitale mondiale de la voiture d\'exception. Notre service de location couvre Ferrari, Lamborghini, Bentley, Rolls-Royce, Aston Martin, livrée à l\'Hôtel de Paris, Métropole, Hermitage, Fairmont ou directement à votre adresse. Conduisez sur le circuit du Grand Prix hors événement, descendez vers Beausoleil et la Turbie, ou rejoignez Saint-Tropez en six heures par la corniche. Tarif à partir de huit cent cinquante euros par jour, livraison gratuite sur la Principauté.',
      en: 'Monaco is the world capital of exceptional cars. Our rental service covers Ferrari, Lamborghini, Bentley, Rolls-Royce, Aston Martin, delivered to Hôtel de Paris, Métropole, Hermitage, Fairmont or directly to your address. Drive the Grand Prix circuit outside the event, descend to Beausoleil and La Turbie, or reach Saint-Tropez in six hours via the corniche. From eight hundred fifty euros per day, free delivery in the Principality.',
    },
    offerings: [
      {
        titleFr: 'Hôtels du Casino',
        titleEn: 'Casino hotels',
        descFr: 'Hôtel de Paris, Métropole, Hermitage, Fairmont. Livraison voiturier, clés en main propre.',
        descEn: 'Hôtel de Paris, Métropole, Hermitage, Fairmont. Valet delivery, keys handed in person.',
        image: 'https://excellenceriviera.com/wp-content/uploads/2020/05/bentley-bentayga-4-1.jpg',
      },
      {
        titleFr: 'Circuit & corniche',
        titleEn: 'Circuit & corniche',
        descFr: 'Circuit GP hors événement, basse corniche vers Cap-Ferrat et Nice, moyenne corniche vers Èze et Roquebrune.',
        descEn: 'GP circuit outside event, lower corniche to Cap-Ferrat and Nice, middle corniche to Èze and Roquebrune.',
        image: 'https://excellenceriviera.com/wp-content/uploads/2020/06/Ferrari-812-Superfast-Featured.jpg',
      },
      {
        titleFr: 'Soirées Casino',
        titleEn: 'Casino evenings',
        descFr: 'Bentley, Rolls-Royce ou Ferrari pour arrivée Place du Casino. Voiturier officiel, vidéo discrète.',
        descEn: 'Bentley, Rolls-Royce or Ferrari for Casino Square arrival. Official valet, discreet drop.',
        image: 'https://excellenceriviera.com/wp-content/uploads/2020/05/Bentley-Continental-GTC-4.jpg',
      },
      {
        titleFr: 'Drives Riviera',
        titleEn: 'Riviera drives',
        descFr: 'Saint-Tropez par la corniche en aller-retour journée, ou Italie via Menton et la côte ligure.',
        descEn: 'Saint-Tropez via the corniche as a day round-trip, or Italy via Menton and the Ligurian coast.',
        image: 'https://excellenceriviera.com/wp-content/uploads/2020/05/ferrari-portofino-6.jpg',
      },
    ],
    whyHere: {
      fr: [
        'Concentration de modèles d\'exception à Monaco : flotte la plus large de la Riviera.',
        'Livraison gratuite Hôtel de Paris, Métropole, Hermitage, Fairmont, Monte-Carlo Bay.',
        'Voiture immatriculée Monaco disponible sur demande pour l\'authenticité locale.',
        'Pendant le Grand Prix : flotte étendue, réservation 6 semaines avant pour les flagship.',
        'Rachat franchise inclus, pas de caution bloquée, voiture de remplacement sous 2h.',
      ],
      en: [
        'Concentration of exceptional models in Monaco: the largest fleet of the Riviera.',
        'Free delivery Hôtel de Paris, Métropole, Hermitage, Fairmont, Monte-Carlo Bay.',
        'Monaco-registered car available on request for local authenticity.',
        'During the Grand Prix: extended fleet, book 6 weeks ahead for flagships.',
        'Excess waiver included, no blocked deposit, replacement car within 2 hours.',
      ],
    },
    popularTransferSlugs: ['cannes-monaco', 'monaco-saint-tropez', 'monaco-menton'],
    faq: [
      {
        q: { fr: 'Combien coûte une voiture de luxe à Monaco ?', en: 'How much does a luxury car cost in Monaco?' },
        a: {
          fr: 'À partir de €850/jour pour une berline prestige, €1,300 pour une convertible, €2,200 pour une supercar.',
          en: 'From €850/day for a prestige sedan, €1,300 for a convertible, €2,200 for a supercar.',
        },
      },
      {
        q: { fr: 'Voiture immatriculée Monaco ?', en: 'Monaco-registered car?' },
        a: {
          fr: 'Disponible sur demande préalable. Plaque MC pour les modèles phares (Ferrari, Lamborghini, Rolls-Royce).',
          en: 'Available on prior request. MC plate for flagship models (Ferrari, Lamborghini, Rolls-Royce).',
        },
      },
      {
        q: { fr: 'Pendant le Grand Prix ?', en: 'During the Grand Prix?' },
        a: {
          fr: 'Routes du circuit fermées 6 jours. Réserver 6 semaines avant pour les flagship. Tarifs majorés 25-30%.',
          en: 'Circuit roads closed 6 days. Book 6 weeks ahead for flagships. Rates +25-30%.',
        },
      },
      {
        q: { fr: 'Livraison Hôtel de Paris ?', en: 'Hôtel de Paris delivery?' },
        a: {
          fr: 'Oui, gratuite. Coordination avec le voiturier de l\'hôtel. Clés remises directement en main propre.',
          en: 'Yes, free. Coordination with the hotel valet. Keys handed in person.',
        },
      },
      {
        q: { fr: 'Conduite vers l\'Italie ?', en: 'Drive to Italy?' },
        a: {
          fr: 'Autorisée sur demande préalable, sans surcoût mais déclaration obligatoire 48h avant.',
          en: 'Allowed on prior request, no surcharge but mandatory declaration 48h ahead.',
        },
      },
    ],
    priceFrom: 850,
    priceUnit: { fr: 'par jour', en: 'per day' },
  },

  // ============================================
  // CARS · NICE
  // ============================================
  'cars:nice': {
    heroImage: 'https://excellenceriviera.com/wp-content/uploads/2020/05/ferrari-portofino-6.jpg',
    heroTitle: { fr: 'Location voiture de luxe Nice', en: 'Luxury car rental in Nice' },
    signature: {
      fr: 'Aéroport, Promenade, arrière-pays. Voiture livrée à votre arrivée.',
      en: 'Airport, Promenade, inland. Car delivered upon your arrival.',
    },
    aboutImage: 'https://excellenceriviera.com/wp-content/uploads/2020/05/bentley-bentayga-4-1.jpg',
    aboutTitle: { fr: 'Notre location de luxe à Nice', en: 'Our luxury rental in Nice' },
    aboutText: {
      fr: 'Nice est la porte d\'entrée de la Côte d\'Azur. Notre service de location livre votre voiture directement à l\'aéroport Nice Côte d\'Azur (terminal 1 ou 2) ou à votre hôtel sur la Promenade des Anglais. Une fois équipé, partez vers Monaco par la basse corniche, Cannes par l\'A8, ou explorez l\'arrière-pays : Saint-Paul de Vence, Èze, Mougins, Grasse. Tarif à partir de sept cent cinquante euros par jour, livraison aéroport gratuite.',
      en: 'Nice is the gateway to the French Riviera. Our rental service delivers your car directly to Nice Côte d\'Azur airport (terminal 1 or 2) or to your hotel on the Promenade des Anglais. Once equipped, head to Monaco via the lower corniche, Cannes via the A8, or explore the inland: Saint-Paul de Vence, Èze, Mougins, Grasse. From seven hundred fifty euros per day, free airport delivery.',
    },
    offerings: [
      {
        titleFr: 'Livraison aéroport',
        titleEn: 'Airport delivery',
        descFr: 'Terminal 1 ou 2 de l\'aéroport Nice Côte d\'Azur. Accueil panneau au nom du conducteur, clés remises au sortir des bagages.',
        descEn: 'Terminal 1 or 2 of Nice Côte d\'Azur airport. Name sign welcome, keys handed at baggage hall exit.',
        image: 'https://excellenceriviera.com/wp-content/uploads/2020/05/bentley-bentayga-4-1.jpg',
      },
      {
        titleFr: 'Hôtels Promenade',
        titleEn: 'Promenade hotels',
        descFr: 'Negresco, Hyatt Regency, Boscolo, Anantara Plaza. Livraison voiturier, retour à toute heure.',
        descEn: 'Negresco, Hyatt Regency, Boscolo, Anantara Plaza. Valet delivery, return at any hour.',
        image: 'https://excellenceriviera.com/wp-content/uploads/2020/05/Bentley-Continental-GTC-4.jpg',
      },
      {
        titleFr: 'Arrière-pays',
        titleEn: 'Inland',
        descFr: 'Saint-Paul de Vence, Vence, Mougins, Grasse, gorges du Verdon. SUV ou GT recommandés selon route.',
        descEn: 'Saint-Paul de Vence, Vence, Mougins, Grasse, Verdon gorges. SUV or GT recommended per route.',
        image: 'https://excellenceriviera.com/wp-content/uploads/2020/06/Ferrari-812-Superfast-Featured.jpg',
      },
      {
        titleFr: 'Riviera complète',
        titleEn: 'Full Riviera',
        descFr: 'Monaco 30 min, Cannes 30 min, Saint-Tropez 1h30. Forfait journée pour boucle complète.',
        descEn: 'Monaco 30 min, Cannes 30 min, Saint-Tropez 1h30. Day package for full loop.',
        image: 'https://excellenceriviera.com/wp-content/uploads/2020/05/ferrari-portofino-6.jpg',
      },
    ],
    whyHere: {
      fr: [
        'Livraison aéroport gratuite, terminal 1 ou 2, accueil panneau au nom du conducteur.',
        'Flotte large à Nice : supercars, SUV, convertibles, GT pour l\'arrière-pays sinueux.',
        'Plein de carburant offert pour la première sortie.',
        'Rachat franchise inclus dans le tarif, pas de caution bloquée.',
        'Couverture tous risques, voiture de remplacement disponible sous 2 heures.',
      ],
      en: [
        'Free airport delivery, terminal 1 or 2, name-sign welcome.',
        'Wide fleet in Nice: supercars, SUV, convertibles, GT for sinuous inland routes.',
        'Free fuel tank for the first drive.',
        'Excess waiver included in the price, no blocked deposit.',
        'Comprehensive coverage, replacement vehicle available within 2 hours.',
      ],
    },
    popularTransferSlugs: ['nice-airport-monaco', 'nice-airport-cannes', 'nice-airport-saint-tropez'],
    faq: [
      {
        q: { fr: 'Combien coûte une voiture de luxe à Nice ?', en: 'How much does a luxury car cost in Nice?' },
        a: {
          fr: 'À partir de €750/jour pour une berline, €1,100 pour une convertible, €1,800 pour une supercar.',
          en: 'From €750/day for a sedan, €1,100 for a convertible, €1,800 for a supercar.',
        },
      },
      {
        q: { fr: 'Livraison à l\'aéroport ?', en: 'Airport delivery?' },
        a: {
          fr: 'Oui, gratuite. Notre équipe attend à la sortie des bagages avec un panneau au nom du conducteur. Voiture stationnée parking courte durée.',
          en: 'Yes, free. Our team waits at the baggage hall exit with a name sign. Car parked short-term.',
        },
      },
      {
        q: { fr: 'Plein de carburant ?', en: 'Fuel tank?' },
        a: {
          fr: 'Plein offert pour la première sortie. Restitution avec le même niveau ou facturation au tarif station.',
          en: 'Free fuel tank for the first drive. Return with same level or station-rate billing.',
        },
      },
      {
        q: { fr: 'Quels modèles pour l\'arrière-pays ?', en: 'Which models for the inland?' },
        a: {
          fr: 'GT (Continental, DB12) pour les routes plates. SUV (Bentayga, Cullinan) pour les routes sinueuses ou pluvieuses.',
          en: 'GT (Continental, DB12) for flat roads. SUV (Bentayga, Cullinan) for sinuous or rainy roads.',
        },
      },
      {
        q: { fr: 'Vols de nuit ?', en: 'Night flights?' },
        a: {
          fr: 'Pas de surcoût. Notre équipe attend même à minuit ou plus tard si votre vol est en retard.',
          en: 'No surcharge. Our team waits even at midnight or later if your flight is delayed.',
        },
      },
    ],
    priceFrom: 750,
    priceUnit: { fr: 'par jour', en: 'per day' },
  },

  // ============================================
  // CARS · SAINT-TROPEZ
  // ============================================
  'cars:saint-tropez': {
    heroImage: 'https://excellenceriviera.com/wp-content/uploads/2020/05/Bentley-Continental-GTC-4.jpg',
    heroTitle: { fr: 'Location voiture de luxe Saint-Tropez', en: 'Luxury car rental in Saint-Tropez' },
    signature: {
      fr: 'Pampelonne, Cheval Blanc, port. Convertibles et supercars pour la saison.',
      en: 'Pampelonne, Cheval Blanc, port. Convertibles and supercars for the season.',
    },
    aboutImage: 'https://excellenceriviera.com/wp-content/uploads/2020/06/Ferrari-812-Superfast-Featured.jpg',
    aboutTitle: { fr: 'Notre location de luxe à Saint-Tropez', en: 'Our luxury rental in Saint-Tropez' },
    aboutText: {
      fr: 'Saint-Tropez vit une saison d\'été concentrée. Notre flotte de location est pré-positionnée localement de mai à octobre, avec convertibles (Bentley GTC, Aston Martin Volante), supercars (Ferrari, Lamborghini) et SUV (Bentayga, Cullinan) pour les routes des Plages. Livraison à votre villa, à Cheval Blanc, Byblos, La Réserve Ramatuelle, ou directement à la cale du port. Tarif à partir de huit cent cinquante euros par jour, livraison gratuite sur la presqu\'île.',
      en: 'Saint-Tropez lives a concentrated summer season. Our rental fleet is pre-positioned locally from May to October, with convertibles (Bentley GTC, Aston Martin Volante), supercars (Ferrari, Lamborghini) and SUV (Bentayga, Cullinan) for the beach roads. Delivery to your villa, Cheval Blanc, Byblos, La Réserve Ramatuelle, or directly to the port quay. From eight hundred fifty euros per day, free delivery on the peninsula.',
    },
    offerings: [
      {
        titleFr: 'Routes des Plages',
        titleEn: 'Beach roads',
        descFr: 'Pampelonne, Tahiti, Bagatelle, Club 55, Verde. SUV recommandé pour la D93 sinueuse en été.',
        descEn: 'Pampelonne, Tahiti, Bagatelle, Club 55, Verde. SUV recommended for the sinuous D93 in summer.',
        image: 'https://excellenceriviera.com/wp-content/uploads/2020/05/bentley-bentayga-4-1.jpg',
      },
      {
        titleFr: 'Hôtels du village',
        titleEn: 'Village hotels',
        descFr: 'Cheval Blanc, Byblos, Hotel de Paris, La Réserve Ramatuelle. Livraison voiturier ou directement villa.',
        descEn: 'Cheval Blanc, Byblos, Hotel de Paris, La Réserve Ramatuelle. Valet delivery or direct villa.',
        image: 'https://excellenceriviera.com/wp-content/uploads/2020/05/Bentley-Continental-GTC-4.jpg',
      },
      {
        titleFr: 'Cale du port',
        titleEn: 'Port quay',
        descFr: 'Voiture livrée à votre yacht, port de Saint-Tropez ou Marines de Cogolin. Coordination avec capitaine.',
        descEn: 'Car delivered to your yacht, Saint-Tropez port or Marines de Cogolin. Captain coordination.',
        image: 'https://excellenceriviera.com/wp-content/uploads/2020/06/Ferrari-812-Superfast-Featured.jpg',
      },
      {
        titleFr: 'Arrière-pays',
        titleEn: 'Inland',
        descFr: 'Ramatuelle, Gassin, Port Grimaud. Convertible idéale pour les routes côtières et les vignobles.',
        descEn: 'Ramatuelle, Gassin, Port Grimaud. Convertible ideal for coastal roads and vineyards.',
        image: 'https://excellenceriviera.com/wp-content/uploads/2020/05/ferrari-portofino-6.jpg',
      },
    ],
    whyHere: {
      fr: [
        'Flotte pré-positionnée à Saint-Tropez de mai à octobre.',
        'Convertibles privilégiées pour la saison : Bentley GTC, Aston Martin Volante, DB12.',
        'Livraison gratuite presqu\'île (village, Pampelonne, Ramatuelle, Gassin).',
        'Voiture livrée à votre yacht au port ou à Marines de Cogolin sur demande.',
        'Pendant le pic juillet-août : réservation 4 semaines avant pour les modèles phares.',
      ],
      en: [
        'Fleet pre-positioned in Saint-Tropez from May to October.',
        'Convertibles preferred for the season: Bentley GTC, Aston Martin Volante, DB12.',
        'Free delivery on the peninsula (village, Pampelonne, Ramatuelle, Gassin).',
        'Car delivered to your yacht at the port or Marines de Cogolin on request.',
        'During peak July-August: book 4 weeks ahead for flagship models.',
      ],
    },
    popularTransferSlugs: ['nice-airport-saint-tropez', 'cannes-saint-tropez', 'monaco-saint-tropez'],
    faq: [
      {
        q: { fr: 'Combien coûte une voiture de luxe à Saint-Tropez ?', en: 'How much does a luxury car cost in Saint-Tropez?' },
        a: {
          fr: 'À partir de €850/jour en saison. €1,400 pour une convertible flagship, €2,200 pour une supercar pendant juillet-août.',
          en: 'From €850/day in season. €1,400 for a flagship convertible, €2,200 for a supercar during July-August.',
        },
      },
      {
        q: { fr: 'Livraison à la villa ?', en: 'Villa delivery?' },
        a: {
          fr: 'Oui, gratuite sur la presqu\'île. Coordination avec votre concierge ou gardien pour la remise des clés.',
          en: 'Yes, free on the peninsula. Coordination with your concierge or caretaker for key handover.',
        },
      },
      {
        q: { fr: 'Pendant la saison Pampelonne ?', en: 'During the Pampelonne season?' },
        a: {
          fr: 'Réserver 4 semaines avant juillet-août pour les flagship. Routes saturées le week-end : prévoir départs tôt.',
          en: 'Book 4 weeks ahead July-August for flagships. Saturated roads on weekends: plan early departures.',
        },
      },
      {
        q: { fr: 'Voiture pour le yacht ?', en: 'Yacht car?' },
        a: {
          fr: 'Oui, livrée à la cale du port ou à Marines de Cogolin. Coordination avec capitaine ou équipage.',
          en: 'Yes, delivered to the port quay or Marines de Cogolin. Coordination with captain or crew.',
        },
      },
      {
        q: { fr: 'Hors saison ?', en: 'Off-season?' },
        a: {
          fr: 'Flotte plus restreinte. Modèles disponibles depuis Cannes ou Nice avec livraison Saint-Tropez (1h30 trajet).',
          en: 'Smaller fleet. Models available from Cannes or Nice with Saint-Tropez delivery (1h30 transit).',
        },
      },
    ],
    priceFrom: 850,
    priceUnit: { fr: 'par jour', en: 'per day' },
  },
};

export function getServiceCityDetail(service: string, city: string): ServiceCityDetail | null {
  return DETAILS[`${service}:${city}`] ?? null;
}

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
