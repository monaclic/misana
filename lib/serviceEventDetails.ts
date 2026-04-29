// Donnees fiche service x event V1.
// 4 fiches chauffeur (Festival de Cannes, Grand Prix Monaco, Cannes Lions,
// Monaco Yacht Show) en pleine donnee. Reuse le type ServiceCityDetail
// (la structure est identique : juste le contexte change ville -> event).

import { TRANSFERS } from '~/lib/constants';
import type { ServiceCityDetail } from '~/lib/serviceCityDetails';

const DETAILS: Record<string, ServiceCityDetail> = {
  // ============================================
  // CHAUFFEUR · FESTIVAL DE CANNES
  // ============================================
  'chauffeur:festival-de-cannes': {
    heroImage: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=2400&q=85',
    heroTitle: { fr: 'Chauffeur Festival de Cannes', en: 'Chauffeur during Cannes Film Festival' },
    signature: {
      fr: 'Tapis rouge, projections, after-parties. Mercedes coordonnée du matin à l\'aube.',
      en: 'Red carpet, screenings, after-parties. Mercedes coordinated from morning to dawn.',
    },
    aboutImage: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1600&q=80',
    aboutTitle: {
      fr: 'Notre service chauffeur pendant le Festival',
      en: 'Our chauffeur service during the Festival',
    },
    aboutText: {
      fr: 'Le Festival de Cannes concentre dix jours de logistique extrême sur deux kilomètres de Croisette. Notre service chauffeur opère en mode festival : flotte étendue Mercedes V-Class et S-Class pré-positionnée à Cannes, Mougins et Le Cannet, chauffeurs disponibles vingt-quatre heures sur vingt-quatre, coordination préalable avec les studios, sécurité tapis rouge, transferts entre projections, sorties d\'after-parties à trois ou cinq heures du matin. L\'A8 sature en journée : nous basculons sur la basse corniche selon le trafic. Réservation conseillée trois à cinq jours avant l\'arrivée, à partir de cent quarante euros par transfert.',
      en: 'The Cannes Film Festival concentrates ten days of extreme logistics on two kilometres of Croisette. Our chauffeur service operates in festival mode: extended Mercedes V-Class and S-Class fleet pre-positioned in Cannes, Mougins and Le Cannet, drivers available twenty-four hours a day, prior coordination with studios, red carpet security, transfers between screenings, after-party departures at three or five in the morning. The A8 saturates by day: we switch to the lower corniche based on traffic. Booking advised three to five days before arrival, from one hundred forty euros per transfer.',
    },
    offerings: [
      {
        titleFr: 'Tapis rouge',
        titleEn: 'Red carpet',
        descFr: 'Pickup hotel, dépose Palais des Festivals devant le tapis. Coordination avec la sécurité du Festival, timing à la minute.',
        descEn: 'Hotel pickup, drop-off at Palais des Festivals in front of the carpet. Coordination with Festival security, minute-precise timing.',
        image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80',
      },
      {
        titleFr: 'Entre projections',
        titleEn: 'Between screenings',
        descFr: 'Retour hôtel, déjeuners, plages privées. Le même chauffeur sur la durée du séjour pour anticiper vos déplacements.',
        descEn: 'Hotel return, lunches, private beaches. The same driver across your stay to anticipate your movements.',
        image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&q=80',
      },
      {
        titleFr: 'Soirées & after',
        titleEn: 'Parties & after',
        descFr: 'Plages, villas privées, yachts. Retour à l\'hôtel à 3h, 5h, ou plus tard si la nuit l\'exige. Sécurité et discrétion.',
        descEn: 'Beaches, private villas, yachts. Return to hotel at 3am, 5am, or later if the night demands. Security and discretion.',
        image: 'https://images.unsplash.com/photo-1571266028243-e1c2c5b15e2d?w=800&q=80',
      },
      {
        titleFr: 'Aéroport Festival',
        titleEn: 'Festival airport',
        descFr: 'Nice aéroport vers Cannes pendant le Festival : départ avancé 30 min, basse corniche en backup, hélico 5 min disponible.',
        descEn: 'Nice airport to Cannes during the Festival: 30-min earlier departure, lower corniche backup, helicopter 5 min available.',
        image: 'https://images.unsplash.com/photo-1543874768-2df4cdc1ddc8?w=800&q=80',
      },
    ],
    whyHere: {
      fr: [
        'Flotte étendue pendant les dix jours : V-Class, S-Class, Range Rover supplémentaires sur Cannes.',
        'Coordination préalable avec studios, agences et sécurité du Festival.',
        'Chauffeurs habitués au Festival : connaissance des accès, des protocoles tapis rouge, de la basse corniche.',
        'Service nocturne 24h sur 24 pendant la durée de l\'événement, pas de surcoût horaire.',
        'Hélicoptère 5 minutes vers Monaco ou 18 minutes vers Saint-Tropez en alternative aux routes saturées.',
      ],
      en: [
        'Extended fleet during the ten days: additional V-Class, S-Class, Range Rover in Cannes.',
        'Prior coordination with studios, agencies and Festival security.',
        'Drivers familiar with the Festival: access knowledge, red carpet protocols, lower corniche.',
        'Night service 24/7 for the duration of the event, no hourly surcharge.',
        'Helicopter 5 minutes to Monaco or 18 minutes to Saint-Tropez as alternative to saturated roads.',
      ],
    },
    popularTransferSlugs: ['nice-airport-cannes', 'cannes-monaco', 'cannes-saint-tropez', 'cannes-nice'],
    faq: [
      {
        q: { fr: 'Combien coûte un chauffeur pendant le Festival ?', en: 'How much does a chauffeur cost during the Festival?' },
        a: {
          fr: 'À partir de €140 par transfert pendant le Festival (+€20 vs hors événement). Mise à disposition à la journée à partir de €850 pour 12 heures.',
          en: 'From €140 per transfer during the Festival (+€20 vs outside event). Day disposal from €850 for 12 hours.',
        },
      },
      {
        q: { fr: 'Combien de temps avant réserver ?', en: 'How far in advance to book?' },
        a: {
          fr: 'Trois à cinq jours minimum. Pour la quinzaine d\'ouverture et les jours de tapis rouge, deux semaines avant.',
          en: 'Three to five days minimum. For opening fortnight and red carpet days, two weeks ahead.',
        },
      },
      {
        q: { fr: 'Le chauffeur connaît-il les protocoles tapis rouge ?', en: 'Does the chauffeur know red carpet protocols?' },
        a: {
          fr: 'Oui. Coordination préalable avec la sécurité du Festival, timing à la minute, accès aux zones réservées sur invitation.',
          en: 'Yes. Prior coordination with Festival security, minute-precise timing, access to reserved zones on invitation.',
        },
      },
      {
        q: { fr: 'Service nocturne ?', en: 'Night service?' },
        a: {
          fr: 'Oui, 24/7 pendant les dix jours. Pickup at after-parties, plages privées, villas. Retour à votre hôtel à toute heure.',
          en: 'Yes, 24/7 during the ten days. Pickup at after-parties, private beaches, villas. Return to your hotel at any hour.',
        },
      },
      {
        q: { fr: 'Coordination avec studios ?', en: 'Studios coordination?' },
        a: {
          fr: 'Oui. Forfait studio sur demande : 3 à 5 véhicules dédiés, briefing préalable, sécurité accompagnée.',
          en: 'Yes. Studio package on request: 3 to 5 dedicated vehicles, prior briefing, accompanying security.',
        },
      },
      {
        q: { fr: 'A8 ou basse corniche ?', en: 'A8 or lower corniche?' },
        a: {
          fr: 'A8 saturée en journée pendant le Festival. Bascule basse corniche selon trafic. Hélicoptère 5 min vers Monaco si besoin.',
          en: 'A8 saturated by day during the Festival. Lower corniche switch based on traffic. Helicopter 5 min to Monaco if needed.',
        },
      },
    ],
    priceFrom: 140,
    priceUnit: { fr: 'par transfert', en: 'per transfer' },
  },

  // ============================================
  // CHAUFFEUR · GRAND PRIX MONACO
  // ============================================
  'chauffeur:monaco-grand-prix': {
    heroImage: 'https://images.unsplash.com/photo-1605641532883-7ec48ed6800c?w=2400&q=85',
    heroTitle: { fr: 'Chauffeur Grand Prix Monaco', en: 'Chauffeur during Monaco Grand Prix' },
    signature: {
      fr: 'Paddock, Casino, Sporting. Six jours de logistique au cœur de la Principauté.',
      en: 'Paddock, Casino, Sporting. Six days of logistics at the heart of the Principality.',
    },
    aboutImage: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=1600&q=80',
    aboutTitle: {
      fr: 'Notre service chauffeur pendant le Grand Prix',
      en: 'Our chauffeur service during the Grand Prix',
    },
    aboutText: {
      fr: 'Le Grand Prix de Monaco est l\'événement le plus dense de la Principauté : six jours de circuit qui ferment la moitié du centre-ville, des paddocks à La Condamine et au Port Hercule, des soirées qui s\'étirent jusqu\'au matin. Notre service chauffeur opère vingt-quatre heures sur vingt-quatre avec une flotte Mercedes V-Class et S-Class étendue, accès paddock sur invitation, transferts entre événements, retours nocturnes du Sporting ou de Jimmy\'z. Anticipation indispensable : routes restreintes, accès limités, hélicoptère sept minutes vers Nice ou Cannes en alternative. À partir de cent cinquante euros par transfert.',
      en: 'The Monaco Grand Prix is the densest event of the Principality: six days of circuit closing half of downtown, paddocks at La Condamine and Port Hercule, parties stretching until morning. Our chauffeur service operates twenty-four hours a day with an extended Mercedes V-Class and S-Class fleet, paddock access on invitation, transfers between events, late returns from the Sporting or Jimmy\'z. Anticipation essential: restricted roads, limited access, helicopter seven minutes to Nice or Cannes as alternative. From one hundred fifty euros per transfer.',
    },
    offerings: [
      {
        titleFr: 'Accès paddock',
        titleEn: 'Paddock access',
        descFr: 'Transferts vers les paddocks La Condamine et Port Hercule, sur invitation team ou hospitalité officielle.',
        descEn: 'Transfers to La Condamine and Port Hercule paddocks, on team invitation or official hospitality.',
        image: 'https://images.unsplash.com/photo-1605641532883-7ec48ed6800c?w=800&q=80',
      },
      {
        titleFr: 'Hôtel & circuit',
        titleEn: 'Hotel & circuit',
        descFr: 'Hôtel de Paris, Métropole, Hermitage. Pickup ajusté aux heures de fermeture des routes du circuit.',
        descEn: 'Hôtel de Paris, Métropole, Hermitage. Pickup adjusted to circuit road closure times.',
        image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&q=80',
      },
      {
        titleFr: 'Soirées & gala',
        titleEn: 'Evenings & gala',
        descFr: 'Sporting, Jimmy\'z, gala AmFAR, soirées privées sur yachts. Retour discret à toute heure du matin.',
        descEn: 'Sporting, Jimmy\'z, AmFAR gala, private parties on yachts. Discreet return at any hour of the morning.',
        image: 'https://images.unsplash.com/photo-1571266028243-e1c2c5b15e2d?w=800&q=80',
      },
      {
        titleFr: 'Aéroport ou hélico',
        titleEn: 'Airport or helicopter',
        descFr: 'Chauffeur Nice-Monaco impossible certains horaires. Hélicoptère 7 min depuis Fontvieille en alternative directe.',
        descEn: 'Nice-Monaco chauffeur impossible at some hours. Helicopter 7 min from Fontvieille as direct alternative.',
        image: 'https://images.unsplash.com/photo-1543874768-2df4cdc1ddc8?w=800&q=80',
      },
    ],
    whyHere: {
      fr: [
        'Flotte étendue pendant les six jours du Grand Prix : V-Class, S-Class, Range Rover supplémentaires.',
        'Connaissance des fermetures de routes, horaires d\'ouverture, accès paddock par jour.',
        'Coordination avec les écuries, hôtels et organisateurs sur invitation : timing à la minute.',
        'Service nocturne 24/7 pour Casino, Sporting, Jimmy\'z et soirées privées sur yachts.',
        'Hélicoptère 7 min vers Nice quand l\'accès Monaco est saturé. Plan B systématique.',
      ],
      en: [
        'Extended fleet during the six Grand Prix days: additional V-Class, S-Class, Range Rover.',
        'Knowledge of road closures, opening hours, paddock access by day.',
        'Coordination with teams, hotels and organisers on invitation: minute-precise timing.',
        'Night service 24/7 for Casino, Sporting, Jimmy\'z and private yacht parties.',
        'Helicopter 7 min to Nice when Monaco access is saturated. Systematic plan B.',
      ],
    },
    popularTransferSlugs: ['nice-airport-monaco', 'cannes-monaco', 'monaco-saint-tropez', 'monaco-menton'],
    faq: [
      {
        q: { fr: 'Combien coûte un chauffeur pendant le Grand Prix ?', en: 'How much does a chauffeur cost during the Grand Prix?' },
        a: {
          fr: 'À partir de €150 par transfert pendant le Grand Prix (+€20 vs hors événement). Mise à disposition à partir de €900 pour 12 heures.',
          en: 'From €150 per transfer during the Grand Prix (+€20 vs outside event). Day disposal from €900 for 12 hours.',
        },
      },
      {
        q: { fr: 'Combien de temps avant réserver ?', en: 'How far in advance to book?' },
        a: {
          fr: 'Six semaines avant pour les jours d\'événement. Pour la qualif, course et gala AmFAR : trois mois minimum.',
          en: 'Six weeks ahead for event days. For qualifying, race and AmFAR gala: three months minimum.',
        },
      },
      {
        q: { fr: 'Routes restreintes ?', en: 'Restricted roads?' },
        a: {
          fr: 'La moitié du centre-ville est fermée pendant les six jours. Notre équipe connaît les ouvertures par horaire et adapte les pickups.',
          en: 'Half of downtown is closed during the six days. Our team knows openings by time slot and adapts pickups.',
        },
      },
      {
        q: { fr: 'Hélicoptère ou chauffeur ?', en: 'Helicopter or chauffeur?' },
        a: {
          fr: 'Hélicoptère privilégié pour Nice et Cannes pendant le Grand Prix. Chauffeur pour les transferts intra-Monaco et les pickups Sporting.',
          en: 'Helicopter preferred for Nice and Cannes during the Grand Prix. Chauffeur for intra-Monaco transfers and Sporting pickups.',
        },
      },
      {
        q: { fr: 'Accès paddock ?', en: 'Paddock access?' },
        a: {
          fr: 'Sur invitation team ou hospitalité officielle. Notre équipe coordonne les pickups depuis le paddock après la course.',
          en: 'On team invitation or official hospitality. Our team coordinates pickups from the paddock after the race.',
        },
      },
      {
        q: { fr: 'Service nocturne ?', en: 'Night service?' },
        a: {
          fr: 'Oui, 24/7 pendant les six jours. Pickup au Sporting, Jimmy\'z, soirées sur yachts à toute heure.',
          en: 'Yes, 24/7 during the six days. Pickup at Sporting, Jimmy\'z, yacht parties at any hour.',
        },
      },
    ],
    priceFrom: 150,
    priceUnit: { fr: 'par transfert', en: 'per transfer' },
  },

  // ============================================
  // CHAUFFEUR · CANNES LIONS
  // ============================================
  'chauffeur:cannes-lions': {
    heroImage: 'https://images.unsplash.com/photo-1543874768-2df4cdc1ddc8?w=2400&q=85',
    heroTitle: { fr: 'Chauffeur Cannes Lions', en: 'Chauffeur during Cannes Lions' },
    signature: {
      fr: 'Croisette, agences, plages privées. Cinq jours de business à toute heure.',
      en: 'Croisette, agencies, private beaches. Five days of business at every hour.',
    },
    aboutImage: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=1600&q=80',
    aboutTitle: {
      fr: 'Notre service chauffeur pendant Cannes Lions',
      en: 'Our chauffeur service during Cannes Lions',
    },
    aboutText: {
      fr: 'Cannes Lions transforme la Croisette en festival mondial de la création : cinq jours de conférences au Palais, plages privées d\'agences (Spotify, Google, Meta, Pinterest), soirées d\'after, transferts entre yachts. Notre service chauffeur opère en mode événement : flotte Mercedes V-Class et S-Class étendue, chauffeurs disponibles tôt et tard, coordination avec les agences sur demande. Tarif à partir de cent trente euros par transfert. Réservation conseillée trois semaines avant pour la semaine du Lions.',
      en: 'Cannes Lions turns the Croisette into a global creative festival: five days of conferences at the Palais, agency private beaches (Spotify, Google, Meta, Pinterest), after-parties, transfers between yachts. Our chauffeur service operates in event mode: extended Mercedes V-Class and S-Class fleet, drivers available early and late, coordination with agencies on request. From one hundred thirty euros per transfer. Booking advised three weeks ahead for Lions week.',
    },
    offerings: [
      {
        titleFr: 'Palais & Croisette',
        titleEn: 'Palais & Croisette',
        descFr: 'Transferts hôtel-Palais, hôtel-plages d\'agences. Coordination des allers-retours fréquents pendant la journée.',
        descEn: 'Hotel-Palais, hotel-agency beach transfers. Coordination of frequent back-and-forth during the day.',
        image: 'https://images.unsplash.com/photo-1543874768-2df4cdc1ddc8?w=800&q=80',
      },
      {
        titleFr: 'Plages d\'agences',
        titleEn: 'Agency beaches',
        descFr: 'Spotify Beach, Google Beach, Meta Beach, Plage Pinterest. Pickup et dépose côté plage en saison.',
        descEn: 'Spotify Beach, Google Beach, Meta Beach, Pinterest Beach. Beach-side pickup and drop-off in season.',
        image: 'https://images.unsplash.com/photo-1530541930197-ff16ac917b0e?w=800&q=80',
      },
      {
        titleFr: 'After-parties',
        titleEn: 'After-parties',
        descFr: 'Plages, yachts, villas. Retour à l\'hôtel à 2h ou 4h du matin selon les nuits. Discret et silencieux.',
        descEn: 'Beaches, yachts, villas. Return to hotel at 2am or 4am depending on nights. Discreet and silent.',
        image: 'https://images.unsplash.com/photo-1571266028243-e1c2c5b15e2d?w=800&q=80',
      },
      {
        titleFr: 'Aéroport business',
        titleEn: 'Business airport',
        descFr: 'Nice aéroport vers Cannes en V-Class, suivi des vols, attente gratuite 1h. Mise à dispo journée pour rendez-vous multi-stops.',
        descEn: 'Nice airport to Cannes in V-Class, flight tracking, 1h free waiting. Day disposal for multi-stop meetings.',
        image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&q=80',
      },
    ],
    whyHere: {
      fr: [
        'Flotte étendue pendant les cinq jours du Lions : V-Class et S-Class supplémentaires sur la Croisette.',
        'Coordination préalable avec les agences plages : Spotify, Google, Meta, Pinterest.',
        'Chauffeurs anglophones par défaut, multilingue sur demande pour les délégations internationales.',
        'Service early-morning et late-night sans surcoût horaire pendant la durée de l\'événement.',
        'Forfait business : véhicule dédié pendant 8 ou 12 heures avec le même chauffeur.',
      ],
      en: [
        'Extended fleet during the five Lions days: additional V-Class and S-Class on the Croisette.',
        'Prior coordination with agency beaches: Spotify, Google, Meta, Pinterest.',
        'English-speaking drivers by default, multilingual on request for international delegations.',
        'Early-morning and late-night service without hourly surcharge for event duration.',
        'Business package: dedicated vehicle for 8 or 12 hours with the same driver.',
      ],
    },
    popularTransferSlugs: ['nice-airport-cannes', 'cannes-monaco', 'cannes-saint-tropez', 'cannes-nice'],
    faq: [
      {
        q: { fr: 'Combien coûte un chauffeur pendant Cannes Lions ?', en: 'How much does a chauffeur cost during Cannes Lions?' },
        a: {
          fr: 'À partir de €130 par transfert pendant le Lions. Mise à disposition à la journée à partir de €750 pour 8 heures.',
          en: 'From €130 per transfer during Lions. Day disposal from €750 for 8 hours.',
        },
      },
      {
        q: { fr: 'Combien de temps avant réserver ?', en: 'How far in advance to book?' },
        a: {
          fr: 'Trois semaines minimum. Pour les jours d\'ouverture et grands prix, six semaines.',
          en: 'Three weeks minimum. For opening days and grand prix, six weeks.',
        },
      },
      {
        q: { fr: 'Forfait business 8 heures ?', en: '8-hour business package?' },
        a: {
          fr: 'Oui : véhicule + chauffeur dédié pendant 8 heures (€750) ou 12 heures (€1,050). Idéal pour multi-stops la même journée.',
          en: 'Yes: dedicated vehicle + driver for 8 hours (€750) or 12 hours (€1,050). Ideal for multi-stops in the same day.',
        },
      },
      {
        q: { fr: 'Plages d\'agences ?', en: 'Agency beaches?' },
        a: {
          fr: 'Pickup et dépose côté plage à Spotify, Google, Meta, Pinterest, Snap. Coordination avec l\'équipe sur place.',
          en: 'Beach-side pickup and drop-off at Spotify, Google, Meta, Pinterest, Snap. Coordination with on-site team.',
        },
      },
      {
        q: { fr: 'Multilingue ?', en: 'Multilingual?' },
        a: {
          fr: 'Anglais par défaut. Allemand, italien, espagnol, mandarin sur demande préalable de 48h.',
          en: 'English by default. German, Italian, Spanish, Mandarin on 48h prior request.',
        },
      },
      {
        q: { fr: 'After-parties tardives ?', en: 'Late after-parties?' },
        a: {
          fr: 'Service nocturne sans limite horaire pendant les cinq jours. Pickup à toute heure de votre soirée.',
          en: 'Night service without hourly limit during the five days. Pickup at any hour of your evening.',
        },
      },
    ],
    priceFrom: 130,
    priceUnit: { fr: 'par transfert', en: 'per transfer' },
  },

  // ============================================
  // CHAUFFEUR · MONACO YACHT SHOW
  // ============================================
  'chauffeur:monaco-yacht-show': {
    heroImage: 'https://images.unsplash.com/photo-1551918120-9739cb430c6d?w=2400&q=85',
    heroTitle: { fr: 'Chauffeur Monaco Yacht Show', en: 'Chauffeur during Monaco Yacht Show' },
    signature: {
      fr: 'Port Hercule, brokers, soirées. Quatre jours de transferts coordonnés.',
      en: 'Port Hercule, brokers, parties. Four days of coordinated transfers.',
    },
    aboutImage: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=1600&q=80',
    aboutTitle: {
      fr: 'Notre service chauffeur pendant le Yacht Show',
      en: 'Our chauffeur service during the Yacht Show',
    },
    aboutText: {
      fr: 'Le Monaco Yacht Show est le rendez-vous mondial du yachting de luxe : quatre jours fin septembre, cent vingt yachts au Port Hercule, brokers internationaux, presse, soirées sur les ponts. Notre service chauffeur opère en mode événement : flotte Mercedes V-Class et S-Class à Monaco et Beausoleil, chauffeurs habitués à la coordination port-hôtel, transferts vers les soirées privées en yacht. À partir de cent quarante euros par transfert. Réservation conseillée six semaines avant.',
      en: 'The Monaco Yacht Show is the world rendez-vous of luxury yachting: four days late September, one hundred twenty yachts at Port Hercule, international brokers, press, parties on decks. Our chauffeur service operates in event mode: Mercedes V-Class and S-Class fleet in Monaco and Beausoleil, drivers familiar with port-hotel coordination, transfers to private yacht parties. From one hundred forty euros per transfer. Booking advised six weeks ahead.',
    },
    offerings: [
      {
        titleFr: 'Port Hercule',
        titleEn: 'Port Hercule',
        descFr: 'Transferts vers les pontons, accès broker. Pickup et dépose à votre yacht en coordination avec l\'équipage.',
        descEn: 'Transfers to the docks, broker access. Pickup and drop-off at your yacht in coordination with the crew.',
        image: 'https://images.unsplash.com/photo-1551918120-9739cb430c6d?w=800&q=80',
      },
      {
        titleFr: 'Hôtels du Show',
        titleEn: 'Show hotels',
        descFr: 'Hôtel de Paris, Métropole, Hermitage, Fairmont. Transferts continus pendant les 4 jours.',
        descEn: 'Hôtel de Paris, Métropole, Hermitage, Fairmont. Continuous transfers during the 4 days.',
        image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&q=80',
      },
      {
        titleFr: 'Soirées sur ponts',
        titleEn: 'Deck parties',
        descFr: 'Yachts privatisés en soirée, pickup hôtel, accès tender vers le yacht. Coordination équipage et sécurité.',
        descEn: 'Private evening yachts, hotel pickup, tender access to the yacht. Crew and security coordination.',
        image: 'https://images.unsplash.com/photo-1530541930197-ff16ac917b0e?w=800&q=80',
      },
      {
        titleFr: 'Aéroport ou hélico',
        titleEn: 'Airport or helicopter',
        descFr: 'Nice aéroport en V-Class (30 min) ou hélicoptère depuis Fontvieille (7 min) pour les arrivées tardives.',
        descEn: 'Nice airport in V-Class (30 min) or helicopter from Fontvieille (7 min) for late arrivals.',
        image: 'https://images.unsplash.com/photo-1543874768-2df4cdc1ddc8?w=800&q=80',
      },
    ],
    whyHere: {
      fr: [
        'Flotte étendue pendant les quatre jours du Yacht Show : V-Class et S-Class à Monaco et Beausoleil.',
        'Coordination port-hôtel maîtrisée : pickups au ponton, communication équipage.',
        'Chauffeurs habitués au calendrier dense : visites yachts, déjeuners brokers, soirées sur ponts.',
        'Service early-morning pour les visites privées de yachts dès 8h, late-night pour les soirées.',
        'Hélicoptère 7 min vers Nice ou Cannes en alternative aux routes saturées du show.',
      ],
      en: [
        'Extended fleet during the four Yacht Show days: V-Class and S-Class in Monaco and Beausoleil.',
        'Mastered port-hotel coordination: pickups at the dock, crew communication.',
        'Drivers familiar with the dense calendar: yacht visits, broker lunches, deck parties.',
        'Early-morning service for private yacht visits from 8am, late-night for parties.',
        'Helicopter 7 min to Nice or Cannes as alternative to saturated show roads.',
      ],
    },
    popularTransferSlugs: ['nice-airport-monaco', 'cannes-monaco', 'monaco-saint-tropez', 'monaco-menton'],
    faq: [
      {
        q: { fr: 'Combien coûte un chauffeur pendant le Yacht Show ?', en: 'How much does a chauffeur cost during the Yacht Show?' },
        a: {
          fr: 'À partir de €140 par transfert. Mise à disposition à la journée à partir de €850 pour 12 heures.',
          en: 'From €140 per transfer. Day disposal from €850 for 12 hours.',
        },
      },
      {
        q: { fr: 'Combien de temps avant réserver ?', en: 'How far in advance to book?' },
        a: {
          fr: 'Six semaines minimum pour les jours d\'événement. Pour les soirées sur ponts, deux mois.',
          en: 'Six weeks minimum for event days. For deck parties, two months.',
        },
      },
      {
        q: { fr: 'Pickup au ponton ?', en: 'Pickup at the dock?' },
        a: {
          fr: 'Oui, en coordination avec l\'équipage du yacht. Notre chauffeur attend selon les instructions du capitaine.',
          en: 'Yes, in coordination with the yacht crew. Our driver waits per captain instructions.',
        },
      },
      {
        q: { fr: 'Visites privées de yachts ?', en: 'Private yacht visits?' },
        a: {
          fr: 'Service early-morning dès 7h pour les visites brokers. Forfait demi-journée recommandé pour multi-yachts.',
          en: 'Early-morning service from 7am for broker visits. Half-day package recommended for multi-yachts.',
        },
      },
      {
        q: { fr: 'Soirées sur ponts ?', en: 'Deck parties?' },
        a: {
          fr: 'Pickup hôtel, dépose ponton, attente jusqu\'à la fin de la soirée. Service silencieux et discret.',
          en: 'Hotel pickup, dock drop-off, wait until party end. Silent and discreet service.',
        },
      },
      {
        q: { fr: 'Routes saturées Monaco ?', en: 'Monaco saturated roads?' },
        a: {
          fr: 'Oui pendant le Show. Hélicoptère 7 min vers Nice ou Cannes recommandé pour les arrivées tardives.',
          en: 'Yes during the Show. Helicopter 7 min to Nice or Cannes recommended for late arrivals.',
        },
      },
    ],
    priceFrom: 140,
    priceUnit: { fr: 'par transfert', en: 'per transfer' },
  },
};

export function getServiceEventDetail(service: string, event: string): ServiceCityDetail | null {
  return DETAILS[`${service}:${event}`] ?? null;
}

export function getEventPopularTransfers(slugs: string[]): typeof TRANSFERS[number][] {
  return slugs
    .map((slug) => TRANSFERS.find((t) => t.slug === slug))
    .filter(Boolean) as typeof TRANSFERS[number][];
}
