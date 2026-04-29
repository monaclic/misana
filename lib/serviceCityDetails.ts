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
