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

  // ============================================
  // CARS · FESTIVAL DE CANNES
  // ============================================
  'cars:festival-de-cannes': {
    heroImage: 'https://excellenceriviera.com/wp-content/uploads/2020/05/Bentley-Continental-GTC-4.jpg',
    heroTitle: { fr: 'Location voiture de luxe Festival de Cannes', en: 'Luxury car rental during Cannes Film Festival' },
    signature: {
      fr: 'Convertibles, supercars, GT. Pour la Croisette et les soirées privées du Festival.',
      en: 'Convertibles, supercars, GT. For the Croisette and Festival private parties.',
    },
    aboutImage: 'https://excellenceriviera.com/wp-content/uploads/2020/06/Ferrari-812-Superfast-Featured.jpg',
    aboutTitle: { fr: 'Location voiture pendant le Festival', en: 'Car rental during the Festival' },
    aboutText: {
      fr: 'Pendant les dix jours du Festival de Cannes, notre flotte de location est étendue et pré-positionnée à Cannes : Ferrari, Lamborghini, Bentley, Rolls-Royce, Aston Martin, livrées au Carlton, Martinez, Majestic ou directement à votre adresse. Idéal pour les arrivées tapis rouge, les soirées sur les plages d\'agences, les déplacements vers les villas de la presqu\'île. Tarif majoré de 15-20% pendant l\'événement, livraison gratuite Cannes intra-muros. Réservation conseillée trois semaines avant minimum pour les modèles flagship.',
      en: 'During the ten days of the Cannes Film Festival, our rental fleet is extended and pre-positioned in Cannes: Ferrari, Lamborghini, Bentley, Rolls-Royce, Aston Martin, delivered to Carlton, Martinez, Majestic or directly to your address. Ideal for red carpet arrivals, agency beach parties, drives to peninsula villas. Rates +15-20% during the event, free delivery in central Cannes. Booking advised three weeks ahead minimum for flagship models.',
    },
    offerings: [
      {
        titleFr: 'Tapis rouge',
        titleEn: 'Red carpet',
        descFr: 'Convertible ou supercar pour arrivée Palais des Festivals. Coordination avec sécurité, dépose tapis rouge.',
        descEn: 'Convertible or supercar for Palais des Festivals arrival. Security coordination, red carpet drop.',
        image: 'https://excellenceriviera.com/wp-content/uploads/2020/05/Bentley-Continental-GTC-4.jpg',
      },
      {
        titleFr: 'Soirées plages',
        titleEn: 'Beach parties',
        descFr: 'Spotify Beach, Google Beach, plages privées. SUV ou GT pour les déplacements rapides Croisette-plage.',
        descEn: 'Spotify Beach, Google Beach, private beaches. SUV or GT for fast Croisette-beach moves.',
        image: 'https://excellenceriviera.com/wp-content/uploads/2020/05/bentley-bentayga-4-1.jpg',
      },
      {
        titleFr: 'Villas presqu\'île',
        titleEn: 'Peninsula villas',
        descFr: 'Cap d\'Antibes, Mougins, Le Cannet. SUV ou GT pour les routes en hauteur et les soirées privées.',
        descEn: 'Cap d\'Antibes, Mougins, Le Cannet. SUV or GT for the heights and private parties.',
        image: 'https://excellenceriviera.com/wp-content/uploads/2020/06/Ferrari-812-Superfast-Featured.jpg',
      },
      {
        titleFr: 'Forfait Festival',
        titleEn: 'Festival package',
        descFr: 'Location 5, 7 ou 10 jours avec tarif dégressif. Voiture de remplacement disponible sous 2h.',
        descEn: '5, 7 or 10-day rental with degressive pricing. Replacement car available within 2 hours.',
        image: 'https://excellenceriviera.com/wp-content/uploads/2020/05/ferrari-portofino-6.jpg',
      },
    ],
    whyHere: {
      fr: [
        'Flotte étendue pendant les 10 jours du Festival : convertibles, supercars, GT, SUV supplémentaires.',
        'Livraison Carlton, Martinez, Majestic, Grand Hyatt et villas privées.',
        'Coordination avec studios, agences ou productions pour les arrivées coordonnées.',
        'Plein offert pour la première sortie, rachat franchise inclus, voiture de remplacement sous 2h.',
        'Modèles immatriculés Monaco ou Saint-Tropez disponibles pour l\'authenticité Riviera.',
      ],
      en: [
        'Extended fleet during the 10 Festival days: additional convertibles, supercars, GT, SUV.',
        'Delivery Carlton, Martinez, Majestic, Grand Hyatt and private villas.',
        'Coordination with studios, agencies or productions for coordinated arrivals.',
        'Free fuel tank for the first drive, excess waiver included, replacement car within 2h.',
        'Monaco or Saint-Tropez registered models available for Riviera authenticity.',
      ],
    },
    popularTransferSlugs: ['nice-airport-cannes', 'cannes-monaco', 'cannes-saint-tropez'],
    faq: [
      {
        q: { fr: 'Combien coûte une voiture de luxe pendant le Festival ?', en: 'How much does a luxury car cost during the Festival?' },
        a: {
          fr: 'À partir de €950/jour pour une berline, €1,400 pour une convertible, €2,300 pour une supercar pendant le Festival (+15-20% vs hors événement).',
          en: 'From €950/day for a sedan, €1,400 for a convertible, €2,300 for a supercar during the Festival (+15-20% vs outside event).',
        },
      },
      {
        q: { fr: 'Combien de temps avant réserver ?', en: 'How far in advance to book?' },
        a: {
          fr: 'Trois semaines minimum pour les flagship (Ferrari, Lamborghini, Rolls-Royce). Convertibles flagship : 4 semaines.',
          en: 'Three weeks minimum for flagships (Ferrari, Lamborghini, Rolls-Royce). Flagship convertibles: 4 weeks.',
        },
      },
      {
        q: { fr: 'Voiture immatriculée Monaco ?', en: 'Monaco-registered car?' },
        a: {
          fr: 'Disponible sur demande préalable, sans surcoût. Plaque MC pour les modèles phares.',
          en: 'Available on prior request, no surcharge. MC plate for flagship models.',
        },
      },
      {
        q: { fr: 'Tapis rouge avec la voiture ?', en: 'Red carpet with the car?' },
        a: {
          fr: 'Oui, dépose Palais avec coordination sécurité. Notre équipe synchronise avec votre attaché de presse ou agent.',
          en: 'Yes, Palais drop-off with security coordination. Our team syncs with your publicist or agent.',
        },
      },
      {
        q: { fr: 'Plein de carburant ?', en: 'Fuel tank?' },
        a: {
          fr: 'Plein offert à la livraison. Restitution avec même niveau ou facturation au tarif station.',
          en: 'Full tank at delivery. Return with same level or station-rate billing.',
        },
      },
    ],
    priceFrom: 950,
    priceUnit: { fr: 'par jour', en: 'per day' },
  },

  // ============================================
  // CARS · GRAND PRIX MONACO
  // ============================================
  'cars:monaco-grand-prix': {
    heroImage: 'https://excellenceriviera.com/wp-content/uploads/2020/06/Ferrari-812-Superfast-Featured.jpg',
    heroTitle: { fr: 'Location voiture de luxe Grand Prix Monaco', en: 'Luxury car rental during Monaco Grand Prix' },
    signature: {
      fr: 'Ferrari, Lamborghini, Rolls-Royce. Pour le paddock et les soirées de la Principauté.',
      en: 'Ferrari, Lamborghini, Rolls-Royce. For the paddock and Principality evenings.',
    },
    aboutImage: 'https://excellenceriviera.com/wp-content/uploads/2020/05/bentley-bentayga-4-1.jpg',
    aboutTitle: { fr: 'Location voiture pendant le Grand Prix', en: 'Car rental during the Grand Prix' },
    aboutText: {
      fr: 'Le Grand Prix de Monaco concentre la flotte la plus exceptionnelle de l\'année dans la Principauté. Notre service de location étend sa flotte sur Monaco et Beausoleil avec Ferrari, Lamborghini, Bentley, Rolls-Royce, Aston Martin, livrées à l\'Hôtel de Paris, Métropole, Hermitage, Fairmont. Routes restreintes pendant les six jours d\'événement : conduisez plutôt sur la basse corniche vers Beaulieu et Cap-Ferrat, ou rejoignez Cannes et Saint-Tropez après la course. Tarif majoré de 25-30%, réservation six semaines avant.',
      en: 'The Monaco Grand Prix gathers the most exceptional fleet of the year in the Principality. Our rental service extends its fleet to Monaco and Beausoleil with Ferrari, Lamborghini, Bentley, Rolls-Royce, Aston Martin, delivered to Hôtel de Paris, Métropole, Hermitage, Fairmont. Restricted roads during the six event days: drive instead on the lower corniche to Beaulieu and Cap-Ferrat, or reach Cannes and Saint-Tropez after the race. Rates +25-30%, book six weeks ahead.',
    },
    offerings: [
      {
        titleFr: 'Hôtels du Casino',
        titleEn: 'Casino hotels',
        descFr: 'Hôtel de Paris, Métropole, Hermitage, Fairmont. Voiturier officiel, livraison synchronisée avec l\'événement.',
        descEn: 'Hôtel de Paris, Métropole, Hermitage, Fairmont. Official valet, delivery synced with the event.',
        image: 'https://excellenceriviera.com/wp-content/uploads/2020/05/bentley-bentayga-4-1.jpg',
      },
      {
        titleFr: 'Basse corniche',
        titleEn: 'Lower corniche',
        descFr: 'Beaulieu, Villefranche, Cap-Ferrat. Conduite cabriolet quand le circuit est fermé en centre-ville.',
        descEn: 'Beaulieu, Villefranche, Cap-Ferrat. Convertible drive when circuit is closed downtown.',
        image: 'https://excellenceriviera.com/wp-content/uploads/2020/05/Bentley-Continental-GTC-4.jpg',
      },
      {
        titleFr: 'Soirées privées',
        titleEn: 'Private parties',
        descFr: 'Sporting, Jimmy\'z, soirées sur yachts. Modèles flagship pour les arrivées remarquées.',
        descEn: 'Sporting, Jimmy\'z, yacht parties. Flagship models for remarkable arrivals.',
        image: 'https://excellenceriviera.com/wp-content/uploads/2020/06/Ferrari-812-Superfast-Featured.jpg',
      },
      {
        titleFr: 'Riviera après course',
        titleEn: 'Post-race Riviera',
        descFr: 'Saint-Tropez par la corniche, Cannes par l\'A8. Aller-retour journée ou week-end après le Grand Prix.',
        descEn: 'Saint-Tropez via the corniche, Cannes via the A8. Day round-trip or weekend after the Grand Prix.',
        image: 'https://excellenceriviera.com/wp-content/uploads/2020/05/ferrari-portofino-6.jpg',
      },
    ],
    whyHere: {
      fr: [
        'Flotte étendue pendant les 6 jours du Grand Prix : modèles flagship pré-positionnés à Monaco.',
        'Livraison Hôtel de Paris, Métropole, Hermitage, Fairmont avec coordination voiturier.',
        'Connaissance des fermetures de routes par jour : pickups adaptés aux ouvertures du circuit.',
        'Modèles immatriculés Monaco disponibles pour l\'authenticité locale (Ferrari, Lamborghini, Rolls-Royce).',
        'Livraison à Beausoleil possible pour éviter le centre-ville saturé.',
      ],
      en: [
        'Extended fleet during the 6 Grand Prix days: flagship models pre-positioned in Monaco.',
        'Delivery Hôtel de Paris, Métropole, Hermitage, Fairmont with valet coordination.',
        'Road closure knowledge by day: pickups adapted to circuit opening windows.',
        'Monaco-registered models available for local authenticity (Ferrari, Lamborghini, Rolls-Royce).',
        'Beausoleil delivery possible to avoid saturated downtown.',
      ],
    },
    popularTransferSlugs: ['nice-airport-monaco', 'cannes-monaco', 'monaco-saint-tropez'],
    faq: [
      {
        q: { fr: 'Combien coûte pendant le Grand Prix ?', en: 'How much during the Grand Prix?' },
        a: {
          fr: 'À partir de €1,100/jour pour une berline, €1,600 pour une convertible, €2,800 pour une supercar (+25-30% vs hors événement).',
          en: 'From €1,100/day for a sedan, €1,600 for a convertible, €2,800 for a supercar (+25-30% vs outside event).',
        },
      },
      {
        q: { fr: 'Combien de temps avant réserver ?', en: 'How far in advance to book?' },
        a: {
          fr: 'Six semaines minimum. Pour les flagship (Ferrari, Lamborghini, Rolls-Royce) pendant la qualif et la course, trois mois.',
          en: 'Six weeks minimum. For flagships (Ferrari, Lamborghini, Rolls-Royce) during qualifying and the race, three months.',
        },
      },
      {
        q: { fr: 'Routes du circuit fermées ?', en: 'Circuit roads closed?' },
        a: {
          fr: 'Oui, 6 jours au centre-ville. Notre équipe livre à Beausoleil ou à votre hôtel pendant les ouvertures et basses corniches privilégiées.',
          en: 'Yes, 6 days downtown. Our team delivers to Beausoleil or your hotel during openings, lower corniche preferred.',
        },
      },
      {
        q: { fr: 'Plaque Monaco ?', en: 'Monaco plate?' },
        a: {
          fr: 'Disponible sur demande pour les flagship. Plaque MC pour Ferrari, Lamborghini, Rolls-Royce.',
          en: 'Available on request for flagships. MC plate for Ferrari, Lamborghini, Rolls-Royce.',
        },
      },
      {
        q: { fr: 'Conduite vers l\'Italie ?', en: 'Drive to Italy?' },
        a: {
          fr: 'Autorisée sur demande préalable. Beaucoup font Monaco-Portofino en aller-retour journée pendant le GP.',
          en: 'Allowed on prior request. Many do Monaco-Portofino as a day round-trip during the GP.',
        },
      },
    ],
    priceFrom: 1100,
    priceUnit: { fr: 'par jour', en: 'per day' },
  },

  // ============================================
  // CARS · CANNES LIONS
  // ============================================
  'cars:cannes-lions': {
    heroImage: 'https://excellenceriviera.com/wp-content/uploads/2020/05/bentley-bentayga-4-1.jpg',
    heroTitle: { fr: 'Location voiture de luxe Cannes Lions', en: 'Luxury car rental during Cannes Lions' },
    signature: {
      fr: 'GT, SUV, convertibles. Pour les agences et les nuits du Lions sur la Croisette.',
      en: 'GT, SUV, convertibles. For agencies and Lions nights on the Croisette.',
    },
    aboutImage: 'https://excellenceriviera.com/wp-content/uploads/2020/05/Bentley-Continental-GTC-4.jpg',
    aboutTitle: { fr: 'Location voiture pendant Cannes Lions', en: 'Car rental during Cannes Lions' },
    aboutText: {
      fr: 'Cannes Lions transforme la Croisette en festival mondial de la création pendant cinq jours en juin. Notre flotte de location couvre les besoins business : SUV pour les délégations, GT pour les déplacements directeurs, convertibles pour les soirées sur les plages d\'agences (Spotify, Google, Meta, Pinterest, Snap). Livraison Carlton, Martinez, Majestic, Grand Hyatt et villas du Cannet. Tarif à partir de huit cent cinquante euros par jour, réservation trois semaines avant.',
      en: 'Cannes Lions turns the Croisette into a global creative festival for five days in June. Our rental fleet covers business needs: SUV for delegations, GT for executive travel, convertibles for parties on agency beaches (Spotify, Google, Meta, Pinterest, Snap). Delivery Carlton, Martinez, Majestic, Grand Hyatt and Cannet villas. From eight hundred fifty euros per day, book three weeks ahead.',
    },
    offerings: [
      {
        titleFr: 'Plages d\'agences',
        titleEn: 'Agency beaches',
        descFr: 'Spotify, Google, Meta, Pinterest, Snap. Convertible recommandée pour la dépose côté plage.',
        descEn: 'Spotify, Google, Meta, Pinterest, Snap. Convertible recommended for beach-side drop.',
        image: 'https://excellenceriviera.com/wp-content/uploads/2020/05/Bentley-Continental-GTC-4.jpg',
      },
      {
        titleFr: 'Délégations',
        titleEn: 'Delegations',
        descFr: 'SUV (Bentayga, Cullinan, Range Rover) pour 4 à 7 personnes. Groupe coordonné avec second véhicule.',
        descEn: 'SUV (Bentayga, Cullinan, Range Rover) for 4 to 7 people. Group coordinated with second vehicle.',
        image: 'https://excellenceriviera.com/wp-content/uploads/2020/05/bentley-bentayga-4-1.jpg',
      },
      {
        titleFr: 'After-parties',
        titleEn: 'After-parties',
        descFr: 'Yachts privatisés, villas Mougins, plages Pampelonne. Retour Cannes à 3h ou 5h du matin.',
        descEn: 'Private yachts, Mougins villas, Pampelonne beaches. Cannes return at 3am or 5am.',
        image: 'https://excellenceriviera.com/wp-content/uploads/2020/06/Ferrari-812-Superfast-Featured.jpg',
      },
      {
        titleFr: 'Forfait business',
        titleEn: 'Business package',
        descFr: 'Location 5 ou 7 jours avec tarif dégressif. Plein offert pour la première sortie.',
        descEn: '5 or 7-day rental with degressive pricing. Free fuel tank for the first drive.',
        image: 'https://excellenceriviera.com/wp-content/uploads/2020/05/ferrari-portofino-6.jpg',
      },
    ],
    whyHere: {
      fr: [
        'Flotte étendue pendant les 5 jours du Lions : SUV pour délégations, GT pour direction, convertibles pour soirées.',
        'Livraison Carlton, Martinez, Majestic, Grand Hyatt et villas Cannet/Mougins.',
        'Coordination préalable avec les agences sur demande pour les arrivées synchronisées.',
        'Forfait business 5 ou 7 jours avec tarif dégressif (jusqu\'à -15%).',
        'Plein offert, rachat franchise inclus, voiture de remplacement sous 2h.',
      ],
      en: [
        'Extended fleet during the 5 Lions days: SUV for delegations, GT for executives, convertibles for parties.',
        'Delivery Carlton, Martinez, Majestic, Grand Hyatt and Cannet/Mougins villas.',
        'Prior coordination with agencies on request for synchronised arrivals.',
        'Business package 5 or 7 days with degressive pricing (up to -15%).',
        'Free fuel tank, excess waiver included, replacement vehicle within 2h.',
      ],
    },
    popularTransferSlugs: ['nice-airport-cannes', 'cannes-monaco', 'cannes-saint-tropez'],
    faq: [
      {
        q: { fr: 'Combien coûte pendant Cannes Lions ?', en: 'How much during Cannes Lions?' },
        a: {
          fr: 'À partir de €850/jour pour une berline, €1,300 pour une convertible, €2,000 pour une supercar (+10-15% vs hors événement).',
          en: 'From €850/day for a sedan, €1,300 for a convertible, €2,000 for a supercar (+10-15% vs outside event).',
        },
      },
      {
        q: { fr: 'Forfait business 5 jours ?', en: '5-day business package?' },
        a: {
          fr: 'Disponible avec tarif dégressif (-10% sur 5 jours, -15% sur 7 jours). Plein offert et rachat franchise inclus.',
          en: 'Available with degressive pricing (-10% on 5 days, -15% on 7 days). Free fuel and excess waiver included.',
        },
      },
      {
        q: { fr: 'Délégation 4-7 personnes ?', en: '4-7 person delegation?' },
        a: {
          fr: 'SUV recommandés : Bentayga (5 pax + bagages), Cullinan (4 pax luxe), Range Rover Vogue (5 pax + bagages).',
          en: 'SUV recommended: Bentayga (5 pax + luggage), Cullinan (4 pax luxury), Range Rover Vogue (5 pax + luggage).',
        },
      },
      {
        q: { fr: 'Livraison plage agence ?', en: 'Agency beach delivery?' },
        a: {
          fr: 'Oui, coordination avec l\'équipe agence sur place. Drop-off côté Croisette, parking dédié si demandé.',
          en: 'Yes, coordination with on-site agency team. Croisette-side drop-off, dedicated parking if requested.',
        },
      },
      {
        q: { fr: 'Plein de carburant ?', en: 'Fuel tank?' },
        a: {
          fr: 'Plein offert à la livraison. Restitution avec même niveau ou facturation tarif station +5%.',
          en: 'Full tank at delivery. Return with same level or station rate billing +5%.',
        },
      },
    ],
    priceFrom: 850,
    priceUnit: { fr: 'par jour', en: 'per day' },
  },

  // ============================================
  // CARS · MONACO YACHT SHOW
  // ============================================
  'cars:monaco-yacht-show': {
    heroImage: 'https://excellenceriviera.com/wp-content/uploads/2020/05/Bentley-Continental-GTC-4.jpg',
    heroTitle: { fr: 'Location voiture de luxe Monaco Yacht Show', en: 'Luxury car rental during Monaco Yacht Show' },
    signature: {
      fr: 'Bentley, Rolls-Royce, Ferrari. Pour les brokers et les soirées sur ponts du Yacht Show.',
      en: 'Bentley, Rolls-Royce, Ferrari. For brokers and Yacht Show deck parties.',
    },
    aboutImage: 'https://excellenceriviera.com/wp-content/uploads/2020/06/Ferrari-812-Superfast-Featured.jpg',
    aboutTitle: { fr: 'Location voiture pendant le Yacht Show', en: 'Car rental during the Yacht Show' },
    aboutText: {
      fr: 'Le Monaco Yacht Show est le rendez-vous mondial du yachting de luxe. Notre flotte de location à Monaco supporte les déplacements brokers, presse et clients yacht : SUV pour les délégations, sedans flagship pour les rendez-vous business, convertibles pour les visites de yachts en journée. Livraison Hôtel de Paris, Métropole, Hermitage, Fairmont. Tarif à partir de neuf cents euros par jour, réservation six semaines avant pour les flagship.',
      en: 'The Monaco Yacht Show is the world rendez-vous of luxury yachting. Our rental fleet in Monaco supports broker, press and yacht client travel: SUV for delegations, flagship sedans for business meetings, convertibles for daytime yacht visits. Delivery Hôtel de Paris, Métropole, Hermitage, Fairmont. From nine hundred euros per day, book six weeks ahead for flagships.',
    },
    offerings: [
      {
        titleFr: 'Hôtels du Show',
        titleEn: 'Show hotels',
        descFr: 'Hôtel de Paris, Métropole, Hermitage, Fairmont. Voiturier officiel, livraison à votre arrivée.',
        descEn: 'Hôtel de Paris, Métropole, Hermitage, Fairmont. Official valet, delivery on arrival.',
        image: 'https://excellenceriviera.com/wp-content/uploads/2020/05/bentley-bentayga-4-1.jpg',
      },
      {
        titleFr: 'Visites yachts',
        titleEn: 'Yacht visits',
        descFr: 'Convertible ou GT pour les visites Port Hercule. Pickup à votre hôtel, dépose ponton.',
        descEn: 'Convertible or GT for Port Hercule visits. Hotel pickup, dock drop-off.',
        image: 'https://excellenceriviera.com/wp-content/uploads/2020/06/Ferrari-812-Superfast-Featured.jpg',
      },
      {
        titleFr: 'Soirées sur ponts',
        titleEn: 'Deck parties',
        descFr: 'Pickup hôtel, dépose ponton du yacht. Sedan ou flagship discret pour la coordination équipage.',
        descEn: 'Hotel pickup, yacht dock drop-off. Discreet sedan or flagship for crew coordination.',
        image: 'https://excellenceriviera.com/wp-content/uploads/2020/05/Bentley-Continental-GTC-4.jpg',
      },
      {
        titleFr: 'Cap Riviera',
        titleEn: 'Cap Riviera',
        descFr: 'Visite des chantiers Sanlorenzo Cap-Ferrat ou Lürssen Saint-Tropez. Aller-retour journée Monaco.',
        descEn: 'Visit Sanlorenzo Cap-Ferrat or Lürssen Saint-Tropez yards. Day round-trip from Monaco.',
        image: 'https://excellenceriviera.com/wp-content/uploads/2020/05/ferrari-portofino-6.jpg',
      },
    ],
    whyHere: {
      fr: [
        'Flotte étendue pendant les 4 jours du Yacht Show : Bentley, Rolls-Royce, Ferrari, Lamborghini, SUV.',
        'Livraison Hôtel de Paris, Métropole, Hermitage, Fairmont, Monte-Carlo Bay.',
        'Coordination port-hôtel maîtrisée : pickup hôtel, dépose ponton avec communication équipage.',
        'Forfait visite yachts (4-5 yachts/jour) avec voiture + chauffeur disponible si demandé.',
        'Modèles immatriculés Monaco pour les rendez-vous business avec brokers locaux.',
      ],
      en: [
        'Extended fleet during the 4 Yacht Show days: Bentley, Rolls-Royce, Ferrari, Lamborghini, SUV.',
        'Delivery Hôtel de Paris, Métropole, Hermitage, Fairmont, Monte-Carlo Bay.',
        'Mastered port-hotel coordination: hotel pickup, dock drop-off with crew communication.',
        'Yacht visits package (4-5 yachts/day) with car + driver available on request.',
        'Monaco-registered models for business meetings with local brokers.',
      ],
    },
    popularTransferSlugs: ['nice-airport-monaco', 'cannes-monaco', 'monaco-saint-tropez'],
    faq: [
      {
        q: { fr: 'Combien coûte pendant le Yacht Show ?', en: 'How much during the Yacht Show?' },
        a: {
          fr: 'À partir de €900/jour pour une berline, €1,400 pour une convertible, €2,200 pour une supercar.',
          en: 'From €900/day for a sedan, €1,400 for a convertible, €2,200 for a supercar.',
        },
      },
      {
        q: { fr: 'Combien de temps avant réserver ?', en: 'How far in advance to book?' },
        a: {
          fr: 'Six semaines minimum. Pour les flagship pendant les jours d\'événement, deux mois.',
          en: 'Six weeks minimum. For flagships during event days, two months.',
        },
      },
      {
        q: { fr: 'Livraison ponton ?', en: 'Dock delivery?' },
        a: {
          fr: 'Oui, dépose Port Hercule en coordination avec l\'équipage. Notre équipe attend selon les instructions du capitaine.',
          en: 'Yes, Port Hercule drop-off in coordination with the crew. Our team waits per captain instructions.',
        },
      },
      {
        q: { fr: 'Forfait visite yachts ?', en: 'Yacht visits package?' },
        a: {
          fr: 'Voiture + chauffeur sur demande pour visiter 4-5 yachts/jour avec coordination des rendez-vous brokers.',
          en: 'Car + driver on request to visit 4-5 yachts/day with broker meeting coordination.',
        },
      },
      {
        q: { fr: 'Visite Sanlorenzo Cap-Ferrat ?', en: 'Sanlorenzo Cap-Ferrat visit?' },
        a: {
          fr: 'Aller-retour journée Monaco-Cap-Ferrat possible. SUV recommandé pour la route sinueuse de la presqu\'île.',
          en: 'Monaco-Cap-Ferrat day round-trip possible. SUV recommended for the sinuous peninsula road.',
        },
      },
    ],
    priceFrom: 900,
    priceUnit: { fr: 'par jour', en: 'per day' },
  },

  // ============================================
  // YACHT · FESTIVAL DE CANNES
  // ============================================
  'yacht:festival-de-cannes': {
    heroImage: 'https://images.unsplash.com/photo-1551918120-9739cb430c6d?w=2400&q=85',
    heroTitle: { fr: 'Yacht charter Festival de Cannes', en: 'Yacht charter during Cannes Film Festival' },
    signature: {
      fr: 'Mouillage Croisette, réceptions privées. Yachts pour les soirées du Festival.',
      en: 'Croisette anchorage, private receptions. Yachts for Festival parties.',
    },
    aboutImage: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1600&q=80',
    aboutTitle: { fr: 'Yacht charter pendant le Festival', en: 'Yacht charter during the Festival' },
    aboutText: {
      fr: 'Le Festival de Cannes attire chaque année une concentration exceptionnelle de yachts en rade de Cannes. Notre service couvre la location à la semaine pour les studios et productions, le day cruise pour les invités, l\'hospitalité événementielle (réceptions à bord ancrées devant la Croisette), et la mise à disposition pour les après-cocktail. Yachts moteur 30 à 80 mètres, équipage complet, chef à bord. Réservation six mois avant minimum, à partir de quinze mille euros par jour pendant les dix jours.',
      en: 'The Cannes Festival draws an exceptional yacht concentration in Cannes bay each year. Our service covers weekly charter for studios and productions, day cruise for guests, event hospitality (receptions on board anchored off the Croisette), and post-cocktail availability. 30 to 80-metre motor yachts, full crew, chef on board. Book six months ahead minimum, from fifteen thousand euros per day during the ten days.',
    },
    offerings: [
      {
        titleFr: 'Mouillage Croisette',
        titleEn: 'Croisette anchorage',
        descFr: 'Yacht ancré devant le Palais. Tender vers la Croisette, accès direct tapis rouge.',
        descEn: 'Yacht anchored off the Palais. Tender to the Croisette, direct red carpet access.',
        image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80',
      },
      {
        titleFr: 'Réceptions privées',
        titleEn: 'Private receptions',
        descFr: 'Soirées à bord 50-150 invités, chef à demeure, service traiteur, sécurité coordonnée.',
        descEn: 'On-board parties 50-150 guests, on-board chef, catering, coordinated security.',
        image: 'https://images.unsplash.com/photo-1551918120-9739cb430c6d?w=800&q=80',
      },
      {
        titleFr: 'Charter studios',
        titleEn: 'Studios charter',
        descFr: 'Yacht 50m+ privatisé pour la durée du Festival. Hospitalité talents, réunions presse.',
        descEn: '50m+ yacht privatised for the Festival duration. Talent hospitality, press meetings.',
        image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&q=80',
      },
      {
        titleFr: 'Day cruise invités',
        titleEn: 'Guest day cruise',
        descFr: 'Sortie journée vers Lérins ou Saint-Tropez avec invités d'honneur. Déjeuner à bord, retour soirée.',
        descEn: 'Day trip to Lérins or Saint-Tropez with key guests. Lunch on board, evening return.',
        image: 'https://images.unsplash.com/photo-1505761671935-60b3a7427bad?w=800&q=80',
      },
    ],
    whyHere: {
      fr: [
        'Mouillage Croisette autorisé pendant le Festival : yacht 30-80m+ ancré devant le Palais.',
        'Coordination tender vers la Croisette, accès direct tapis rouge sur invitation.',
        'Chef à demeure, service traiteur 50-150 invités, sécurité coordonnée studios.',
        'Disponibilité post-cocktail : after-parties à bord jusqu\'à l\'aube.',
        'Combinaison yacht + chauffeur Cannes + hélicoptère Monaco pour la logistique multi-spots.',
      ],
      en: [
        'Croisette anchorage authorised during the Festival: 30-80m+ yacht anchored off the Palais.',
        'Tender coordination to the Croisette, direct red carpet access on invitation.',
        'On-board chef, catering for 50-150 guests, studio-coordinated security.',
        'Post-cocktail availability: on-board after-parties until dawn.',
        'Combine yacht + Cannes chauffeur + Monaco helicopter for multi-spot logistics.',
      ],
    },
    popularTransferSlugs: ['nice-airport-cannes', 'cannes-monaco', 'cannes-saint-tropez'],
    faq: [
      {
        q: { fr: 'Combien coûte un yacht pendant le Festival ?', en: 'How much does a yacht cost during the Festival?' },
        a: {
          fr: 'À partir de €15,000/jour pour 30-40m, €40,000+/jour pour 50m+, charter 10 jours à partir de €120,000.',
          en: 'From €15,000/day for 30-40m, €40,000+/day for 50m+, 10-day charter from €120,000.',
        },
      },
      {
        q: { fr: 'Combien de temps avant réserver ?', en: 'How far in advance to book?' },
        a: {
          fr: 'Six mois minimum pour les yachts 50m+. Charter studio dédié : un an avant.',
          en: 'Six months minimum for 50m+ yachts. Dedicated studio charter: one year ahead.',
        },
      },
      {
        q: { fr: 'Mouillage Croisette autorisé ?', en: 'Croisette anchorage authorised?' },
        a: {
          fr: 'Oui sur autorisation préalable de la Capitainerie. Notre équipe coordonne les démarches.',
          en: 'Yes on prior Harbour Master authorisation. Our team coordinates the paperwork.',
        },
      },
      {
        q: { fr: 'Capacité réception ?', en: 'Reception capacity?' },
        a: {
          fr: 'Yacht 40m : 50 invités cocktail. 60m : 100. 80m+ : 150-200. Chef et service traiteur inclus.',
          en: '40m yacht: 50 cocktail guests. 60m: 100. 80m+: 150-200. Chef and catering included.',
        },
      },
      {
        q: { fr: 'Sécurité studios ?', en: 'Studio security?' },
        a: {
          fr: 'Coordination préalable avec votre équipe sécurité. Accès filtrés, badges, drone surveillance disponible.',
          en: 'Prior coordination with your security team. Filtered access, badges, drone surveillance available.',
        },
      },
    ],
    priceFrom: 15000,
    priceUnit: { fr: 'par jour', en: 'per day' },
  },

  // ============================================
  // YACHT · GRAND PRIX MONACO
  // ============================================
  'yacht:monaco-grand-prix': {
    heroImage: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=2400&q=85',
    heroTitle: { fr: 'Yacht charter Grand Prix Monaco', en: 'Yacht charter during Monaco Grand Prix' },
    signature: {
      fr: 'Yacht au Port Hercule. La meilleure tribune flottante du Grand Prix.',
      en: 'Yacht at Port Hercule. The best floating grandstand of the Grand Prix.',
    },
    aboutImage: 'https://images.unsplash.com/photo-1605641532883-7ec48ed6800c?w=1600&q=80',
    aboutTitle: { fr: 'Yacht hospitality pendant le Grand Prix', en: 'Yacht hospitality during the Grand Prix' },
    aboutText: {
      fr: 'Pendant les six jours du Grand Prix de Monaco, le Port Hercule devient la meilleure tribune flottante du monde du sport automobile. Le circuit longe les pontons : depuis le pont d\'un yacht ancré au port, vous voyez le virage de la Rascasse, la chicane et la sortie tunnel. Notre service yacht couvre la location de yachts 40-100m+ au Port Hercule pour la durée du Grand Prix, avec hospitalité complète : chef à demeure, retransmission live à bord, accès paddock coordonné. Réservation un an à l\'avance, à partir de trente mille euros par jour pendant l\'événement.',
      en: 'During the six Monaco Grand Prix days, Port Hercule becomes the world\'s best floating grandstand for motorsport. The circuit runs along the docks: from the deck of a yacht anchored at the port, you see the Rascasse corner, the chicane and the tunnel exit. Our yacht service covers 40-100m+ yacht charter at Port Hercule for the Grand Prix duration, with full hospitality: on-board chef, live broadcast on board, coordinated paddock access. Book one year ahead, from thirty thousand euros per day during the event.',
    },
    offerings: [
      {
        titleFr: 'Yacht Port Hercule',
        titleEn: 'Port Hercule yacht',
        descFr: 'Yacht 40-100m+ ancré au port pour les 6 jours. Vue circuit depuis le pont, retransmission live.',
        descEn: '40-100m+ yacht anchored at the port for the 6 days. Circuit view from the deck, live broadcast.',
        image: 'https://images.unsplash.com/photo-1605641532883-7ec48ed6800c?w=800&q=80',
      },
      {
        titleFr: 'Hospitalité paddock',
        titleEn: 'Paddock hospitality',
        descFr: 'Yacht + accès paddock coordonné via team. Pickup tender depuis le yacht, retour discret.',
        descEn: 'Yacht + coordinated paddock access via team. Tender pickup from the yacht, discreet return.',
        image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&q=80',
      },
      {
        titleFr: 'Réceptions privées',
        titleEn: 'Private receptions',
        descFr: 'Soirées à bord post-course, gala AmFAR. Chef à demeure, service traiteur 50-200 invités.',
        descEn: 'On-board post-race parties, AmFAR gala. On-board chef, catering 50-200 guests.',
        image: 'https://images.unsplash.com/photo-1551918120-9739cb430c6d?w=800&q=80',
      },
      {
        titleFr: 'Charter post-GP',
        titleEn: 'Post-GP charter',
        descFr: 'Continuation après le Grand Prix : Saint-Tropez, Portofino, Riviera complète en charter semaine.',
        descEn: 'Continuation after the Grand Prix: Saint-Tropez, Portofino, full Riviera in weekly charter.',
        image: 'https://images.unsplash.com/photo-1530541930197-ff16ac917b0e?w=800&q=80',
      },
    ],
    whyHere: {
      fr: [
        'Port Hercule : tribune flottante directe sur le circuit du Grand Prix. Vue Rascasse, chicane, tunnel.',
        'Yacht 40-100m+ disponibles, réservation un an à l\'avance pour les meilleures places.',
        'Coordination paddock + tender depuis le yacht pour les hospitalités équipes.',
        'Chef à demeure, service traiteur 50-200 invités, retransmission live à bord.',
        'Continuation charter post-GP vers Saint-Tropez ou Portofino possible (économies tarifaires).',
      ],
      en: [
        'Port Hercule: floating grandstand directly on the Grand Prix circuit. Rascasse, chicane, tunnel views.',
        '40-100m+ yachts available, book one year ahead for the best slots.',
        'Paddock + tender coordination from the yacht for team hospitality.',
        'On-board chef, catering 50-200 guests, live broadcast on board.',
        'Post-GP charter continuation to Saint-Tropez or Portofino possible (rate savings).',
      ],
    },
    popularTransferSlugs: ['nice-airport-monaco', 'cannes-monaco', 'monaco-saint-tropez'],
    faq: [
      {
        q: { fr: 'Combien coûte un yacht au Grand Prix ?', en: 'How much does a yacht cost at the Grand Prix?' },
        a: {
          fr: 'À partir de €30,000/jour pour 40m, €60,000/jour pour 60m, €120,000+/jour pour 80m+. Charter 6 jours à partir de €180,000.',
          en: 'From €30,000/day for 40m, €60,000/day for 60m, €120,000+/day for 80m+. 6-day charter from €180,000.',
        },
      },
      {
        q: { fr: 'Combien de temps avant réserver ?', en: 'How far in advance?' },
        a: {
          fr: 'Un an minimum pour les yachts 60m+. Les meilleures places (proche tunnel ou Rascasse) : 18 mois.',
          en: 'One year minimum for 60m+ yachts. Best slots (near tunnel or Rascasse): 18 months.',
        },
      },
      {
        q: { fr: 'Vue circuit depuis le pont ?', en: 'Circuit view from the deck?' },
        a: {
          fr: 'Oui : Port Hercule longe le circuit. Vue selon emplacement : virage Rascasse, chicane, sortie tunnel.',
          en: 'Yes: Port Hercule runs along the circuit. View per slot: Rascasse corner, chicane, tunnel exit.',
        },
      },
      {
        q: { fr: 'Accès paddock ?', en: 'Paddock access?' },
        a: {
          fr: 'Sur invitation team uniquement. Notre équipe coordonne le tender depuis le yacht et le retour discret.',
          en: 'On team invitation only. Our team coordinates tender from the yacht and discreet return.',
        },
      },
      {
        q: { fr: 'Continuation post-GP ?', en: 'Post-GP continuation?' },
        a: {
          fr: 'Oui, charter semaine post-événement à tarif réduit (-30%) vers Saint-Tropez, Portofino, ou Corse.',
          en: 'Yes, post-event weekly charter at reduced rate (-30%) to Saint-Tropez, Portofino, or Corsica.',
        },
      },
    ],
    priceFrom: 30000,
    priceUnit: { fr: 'par jour', en: 'per day' },
  },

  // ============================================
  // YACHT · CANNES LIONS
  // ============================================
  'yacht:cannes-lions': {
    heroImage: 'https://images.unsplash.com/photo-1505761671935-60b3a7427bad?w=2400&q=85',
    heroTitle: { fr: 'Yacht charter Cannes Lions', en: 'Yacht charter during Cannes Lions' },
    signature: {
      fr: 'Yacht-bureau, after-parties à bord. La Croisette vue du pont.',
      en: 'Yacht-office, on-board after-parties. The Croisette from the deck.',
    },
    aboutImage: 'https://images.unsplash.com/photo-1530541930197-ff16ac917b0e?w=1600&q=80',
    aboutTitle: { fr: 'Yacht charter pendant Cannes Lions', en: 'Yacht charter during Cannes Lions' },
    aboutText: {
      fr: 'Cannes Lions transforme la Croisette en festival mondial de la création. Les agences (Spotify, Google, Meta, Pinterest) prennent des plages, les studios prennent des yachts. Notre service yacht couvre la location à la semaine pour les agences (yacht-bureau et hospitalité), le day cruise pour les délégations privées, l\'hospitalité événementielle (réceptions à bord ancrées devant la Croisette pendant les award nights). Yachts moteur 25-60m, équipage complet. Réservation trois mois avant, à partir de huit mille euros par jour pendant les cinq jours.',
      en: 'Cannes Lions turns the Croisette into a global creative festival. Agencies (Spotify, Google, Meta, Pinterest) take beaches, studios take yachts. Our yacht service covers weekly charter for agencies (yacht-office and hospitality), day cruise for private delegations, event hospitality (on-board receptions anchored off the Croisette during award nights). 25-60m motor yachts, full crew. Book three months ahead, from eight thousand euros per day during the five days.',
    },
    offerings: [
      {
        titleFr: 'Yacht-bureau',
        titleEn: 'Yacht-office',
        descFr: 'Charter semaine pour agence : meetings clients à bord, déjeuners brokers, after-parties.',
        descEn: 'Weekly agency charter: client meetings on board, broker lunches, after-parties.',
        image: 'https://images.unsplash.com/photo-1505761671935-60b3a7427bad?w=800&q=80',
      },
      {
        titleFr: 'Mouillage Croisette',
        titleEn: 'Croisette anchorage',
        descFr: 'Yacht ancré devant le Palais pour les award nights. Tender vers la cérémonie ou la plage.',
        descEn: 'Yacht anchored off the Palais for award nights. Tender to the ceremony or the beach.',
        image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80',
      },
      {
        titleFr: 'Réceptions agences',
        titleEn: 'Agency receptions',
        descFr: 'Soirées à bord 30-80 invités. Chef, traiteur, animations brand activation.',
        descEn: 'On-board parties 30-80 guests. Chef, catering, brand activation animations.',
        image: 'https://images.unsplash.com/photo-1551918120-9739cb430c6d?w=800&q=80',
      },
      {
        titleFr: 'Day cruise privé',
        titleEn: 'Private day cruise',
        descFr: 'Sortie journée vers Lérins ou Saint-Tropez avec invités. Format business + détente.',
        descEn: 'Day trip to Lérins or Saint-Tropez with guests. Business + leisure format.',
        image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&q=80',
      },
    ],
    whyHere: {
      fr: [
        'Yachts disponibles à Cannes pendant les 5 jours du Lions, 25 à 60m+.',
        'Coordination préalable avec agences sur demande pour les invitations à bord.',
        'Chef et service traiteur 30-80 invités pour les réceptions sur ponts.',
        'Mouillage Croisette autorisé pour les award nights, tender vers le Palais.',
        'Combinaison yacht + chauffeur + helico Monaco pour la logistique multi-spots.',
      ],
      en: [
        'Yachts available in Cannes during the 5 Lions days, 25 to 60m+.',
        'Prior coordination with agencies on request for on-board invitations.',
        'Chef and catering for 30-80 guests for deck receptions.',
        'Croisette anchorage authorised for award nights, tender to the Palais.',
        'Combine yacht + chauffeur + Monaco helicopter for multi-spot logistics.',
      ],
    },
    popularTransferSlugs: ['nice-airport-cannes', 'cannes-monaco', 'cannes-saint-tropez'],
    faq: [
      {
        q: { fr: 'Combien coûte un yacht pendant le Lions ?', en: 'How much during the Lions?' },
        a: {
          fr: 'À partir de €8,000/jour pour 25m, €20,000/jour pour 40m, €50,000+/jour pour 60m+. Charter semaine à partir de €60,000.',
          en: 'From €8,000/day for 25m, €20,000/day for 40m, €50,000+/day for 60m+. Weekly from €60,000.',
        },
      },
      {
        q: { fr: 'Combien de temps avant réserver ?', en: 'How far in advance?' },
        a: {
          fr: 'Trois mois minimum. Pour les yachts 50m+ pendant les award nights : six mois.',
          en: 'Three months minimum. For 50m+ yachts during award nights: six months.',
        },
      },
      {
        q: { fr: 'Capacité réception agence ?', en: 'Agency reception capacity?' },
        a: {
          fr: 'Yacht 30m : 30 invités cocktail. 40m : 50. 60m : 80. Chef à bord et service traiteur inclus.',
          en: '30m yacht: 30 cocktail guests. 40m: 50. 60m: 80. On-board chef and catering included.',
        },
      },
      {
        q: { fr: 'Yacht-bureau possible ?', en: 'Yacht-office possible?' },
        a: {
          fr: 'Oui : yacht charter 5 jours pour usage business, équipement Wi-Fi haut débit, salle de réunion.',
          en: 'Yes: 5-day charter for business use, high-speed Wi-Fi, meeting room.',
        },
      },
      {
        q: { fr: 'Annulation ?', en: 'Cancellation?' },
        a: {
          fr: '30% retenus 60+ jours, 50% entre 60-30 jours, 100% moins de 30 jours.',
          en: '30% retained 60+ days, 50% between 60-30 days, 100% less than 30 days.',
        },
      },
    ],
    priceFrom: 8000,
    priceUnit: { fr: 'par jour', en: 'per day' },
  },

  // ============================================
  // YACHT · MONACO YACHT SHOW
  // ============================================
  'yacht:monaco-yacht-show': {
    heroImage: 'https://images.unsplash.com/photo-1551918120-9739cb430c6d?w=2400&q=85',
    heroTitle: { fr: 'Yacht charter Monaco Yacht Show', en: 'Yacht charter during Monaco Yacht Show' },
    signature: {
      fr: 'L\'événement yacht de l\'année. Visites privées et hospitalité au Port Hercule.',
      en: 'The yacht event of the year. Private visits and hospitality at Port Hercule.',
    },
    aboutImage: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=1600&q=80',
    aboutTitle: { fr: 'Yacht service pendant le Yacht Show', en: 'Yacht service during the Yacht Show' },
    aboutText: {
      fr: 'Le Monaco Yacht Show est l\'événement mondial du yachting de luxe : quatre jours fin septembre, cent vingt yachts au Port Hercule, brokers internationaux, chantiers, presse. Notre service yacht à Monaco combine l\'accompagnement broker pour les visites privées de yachts en vente, l\'hospitalité événementielle à bord pour les rendez-vous business, et la mise en relation avec les armateurs et chantiers (Sanlorenzo, Lürssen, Feadship). À partir de douze mille euros par jour pour le charter, accompagnement broker sur tarif négocié.',
      en: 'The Monaco Yacht Show is the world yachting event: four days late September, one hundred twenty yachts at Port Hercule, international brokers, yards, press. Our Monaco yacht service combines broker support for private visits to yachts for sale, on-board event hospitality for business meetings, and connection with owners and yards (Sanlorenzo, Lürssen, Feadship). From twelve thousand euros per day for charter, broker support on negotiated rate.',
    },
    offerings: [
      {
        titleFr: 'Visites privées',
        titleEn: 'Private visits',
        descFr: 'Visite de 4-5 yachts/jour avec accompagnement broker. Coordination des rendez-vous et tour des chantiers.',
        descEn: '4-5 yacht visits/day with broker support. Appointment coordination and yard tour.',
        image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&q=80',
      },
      {
        titleFr: 'Hospitalité business',
        titleEn: 'Business hospitality',
        descFr: 'Yacht charter pour 4 jours, rendez-vous brokers à bord, déjeuners business, soirées privées.',
        descEn: '4-day yacht charter, on-board broker meetings, business lunches, private parties.',
        image: 'https://images.unsplash.com/photo-1551918120-9739cb430c6d?w=800&q=80',
      },
      {
        titleFr: 'Soirées sur ponts',
        titleEn: 'Deck parties',
        descFr: 'Yachts privatisés en soirée. Coordination équipage, accès tender, sécurité préalable.',
        descEn: 'Privatised evening yachts. Crew coordination, tender access, prior security.',
        image: 'https://images.unsplash.com/photo-1530541930197-ff16ac917b0e?w=800&q=80',
      },
      {
        titleFr: 'Mise en relation chantiers',
        titleEn: 'Yard introductions',
        descFr: 'Sanlorenzo, Lürssen, Feadship, Heesen. Rendez-vous directs avec armateurs et constructeurs.',
        descEn: 'Sanlorenzo, Lürssen, Feadship, Heesen. Direct meetings with owners and builders.',
        image: 'https://images.unsplash.com/photo-1505761671935-60b3a7427bad?w=800&q=80',
      },
    ],
    whyHere: {
      fr: [
        'Cent vingt yachts au Port Hercule pendant 4 jours : la concentration mondiale de l\'année.',
        'Accompagnement broker monégasque pour les visites privées et négociations.',
        'Yacht charter 4 jours avec rendez-vous brokers à bord, hospitalité business.',
        'Mise en relation directe avec chantiers Sanlorenzo, Lürssen, Feadship, Heesen.',
        'Coordination yacht + hélicoptère + chauffeur pour la logistique des visites multi-yachts.',
      ],
      en: [
        'One hundred twenty yachts at Port Hercule for 4 days: the world\'s yearly concentration.',
        'Monaco broker support for private visits and negotiations.',
        '4-day yacht charter with on-board broker meetings, business hospitality.',
        'Direct connection with Sanlorenzo, Lürssen, Feadship, Heesen yards.',
        'Yacht + helicopter + chauffeur coordination for multi-yacht visits logistics.',
      ],
    },
    popularTransferSlugs: ['nice-airport-monaco', 'cannes-monaco', 'monaco-saint-tropez'],
    faq: [
      {
        q: { fr: 'Combien coûte un yacht au Yacht Show ?', en: 'How much during the Yacht Show?' },
        a: {
          fr: 'À partir de €12,000/jour pour 30m, €30,000+/jour pour 50m, €70,000+/jour pour 80m+. Charter 4 jours à partir de €50,000.',
          en: 'From €12,000/day for 30m, €30,000+/day for 50m, €70,000+/day for 80m+. 4-day charter from €50,000.',
        },
      },
      {
        q: { fr: 'Visites yachts en vente ?', en: 'Yachts for sale visits?' },
        a: {
          fr: 'Notre équipe coordonne 4-5 visites/jour avec accompagnement broker. Rendez-vous chantiers possible.',
          en: 'Our team coordinates 4-5 visits/day with broker support. Yard appointments possible.',
        },
      },
      {
        q: { fr: 'Combien de temps avant réserver ?', en: 'How far in advance?' },
        a: {
          fr: 'Six mois pour les yachts du Show. Charter ailleurs au Port Hercule : trois mois.',
          en: 'Six months for Show yachts. Charter elsewhere at Port Hercule: three months.',
        },
      },
      {
        q: { fr: 'Mise en relation chantiers ?', en: 'Yard connections?' },
        a: {
          fr: 'Oui : Sanlorenzo Cap-Ferrat, Lürssen Saint-Tropez, Feadship Amsterdam, Heesen Oss. Rendez-vous directs.',
          en: 'Yes: Sanlorenzo Cap-Ferrat, Lürssen Saint-Tropez, Feadship Amsterdam, Heesen Oss. Direct meetings.',
        },
      },
      {
        q: { fr: 'Annulation ?', en: 'Cancellation?' },
        a: {
          fr: '30% retenus 60+ jours, 50% entre 60-30 jours, 100% moins de 30 jours.',
          en: '30% retained 60+ days, 50% between 60-30 days, 100% less than 30 days.',
        },
      },
    ],
    priceFrom: 12000,
    priceUnit: { fr: 'par jour', en: 'per day' },
  },

  // ============================================
  // HELICOPTER · FESTIVAL DE CANNES
  // ============================================
  'helicopter:festival-de-cannes': {
    heroImage: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=2400&q=85',
    heroTitle: { fr: 'Hélicoptère Festival de Cannes', en: 'Helicopter during Cannes Film Festival' },
    signature: {
      fr: 'Pendant le Festival, l\'A8 est saturée. L\'hélicoptère contourne tout en 5 minutes.',
      en: 'During the Festival, the A8 is saturated. The helicopter bypasses everything in 5 minutes.',
    },
    aboutImage: 'https://images.unsplash.com/photo-1543874768-2df4cdc1ddc8?w=1600&q=80',
    aboutTitle: { fr: 'Hélicoptère pendant le Festival', en: 'Helicopter during the Festival' },
    aboutText: {
      fr: 'Pendant les dix jours du Festival de Cannes, l\'A8 est saturée toute la journée et la nuit. L\'hélicoptère devient l\'option la plus rapide pour rejoindre Cannes depuis Nice (5 min), Monaco (5 min) ou Saint-Tropez (15 min). Notre service couvre les arrivées tapis rouge, les transferts entre projections, l\'évacuation après-soirées vers les villas Cap-d\'Antibes ou Saint-Tropez. Quai du Large pour la Croisette, Mandelieu pour l\'arrière-pays. Réservation trois semaines avant minimum, à partir de mille deux cents euros par vol.',
      en: 'During the ten Cannes Festival days, the A8 is saturated day and night. The helicopter becomes the fastest option to reach Cannes from Nice (5 min), Monaco (5 min) or Saint-Tropez (15 min). Our service covers red carpet arrivals, transfers between screenings, after-party evacuation to Cap-d\'Antibes or Saint-Tropez villas. Quai du Large for the Croisette, Mandelieu for inland. Book three weeks ahead minimum, from one thousand two hundred euros per flight.',
    },
    offerings: [
      {
        titleFr: 'Tapis rouge',
        titleEn: 'Red carpet',
        descFr: 'Arrivée Cannes en 5 min depuis Nice ou Monaco. Mercedes V-Class du heliport au Palais des Festivals.',
        descEn: 'Arrival in Cannes in 5 min from Nice or Monaco. Mercedes V-Class from heliport to Palais des Festivals.',
        image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80',
      },
      {
        titleFr: 'Transferts projections',
        titleEn: 'Screening transfers',
        descFr: 'Aller-retour Cannes-Cap-Antibes ou Cannes-Mougins entre projections. Évite l\'A8 saturée.',
        descEn: 'Cannes-Cap-Antibes or Cannes-Mougins round-trip between screenings. Bypasses saturated A8.',
        image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80',
      },
      {
        titleFr: 'After-parties',
        titleEn: 'After-parties',
        descFr: 'Retour villa Cap-d\'Antibes 5 min, Saint-Tropez 15 min, Monaco 5 min. Vols nocturnes en VFR.',
        descEn: 'Return to Cap-d\'Antibes villa 5 min, Saint-Tropez 15 min, Monaco 5 min. Night flights in VFR.',
        image: 'https://images.unsplash.com/photo-1583373834259-46cc92173cb7?w=800&q=80',
      },
      {
        titleFr: 'Coordination studios',
        titleEn: 'Studios coordination',
        descFr: 'Forfait studio : 3-5 vols par jour avec aéronef dédié. Coordination presse, sécurité, talents.',
        descEn: 'Studio package: 3-5 flights per day with dedicated aircraft. Press, security, talent coordination.',
        image: 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?w=800&q=80',
      },
    ],
    whyHere: {
      fr: [
        'Pendant le Festival, hélico = seule option fluide. A8 saturée toute la journée.',
        'Quai du Large heliport en cœur de Croisette : 2 min du Palais des Festivals en chauffeur.',
        'Mandelieu heliport pour l\'arrière-pays et Cap d\'Antibes.',
        'Mercedes V-Class incluse aux deux extrémités, coordination préalable studios.',
        'Vols nocturnes en VFR autorisés pour les retours after-parties tardifs.',
      ],
      en: [
        'During the Festival, helicopter = only fluid option. A8 saturated all day.',
        'Quai du Large heliport at the heart of the Croisette: 2 min from Palais des Festivals by chauffeur.',
        'Mandelieu heliport for inland and Cap d\'Antibes.',
        'Mercedes V-Class included at both ends, prior studio coordination.',
        'Night flights in VFR authorised for late after-party returns.',
      ],
    },
    popularTransferSlugs: ['nice-cannes', 'cannes-monaco', 'cannes-saint-tropez'],
    faq: [
      {
        q: { fr: 'Combien coûte un vol pendant le Festival ?', en: 'How much during the Festival?' },
        a: {
          fr: 'À partir de €1,200 pour Nice-Cannes (5 min), €1,500 pour Cannes-Monaco (5 min), €2,000+ pour Saint-Tropez (15 min).',
          en: 'From €1,200 for Nice-Cannes (5 min), €1,500 for Cannes-Monaco (5 min), €2,000+ for Saint-Tropez (15 min).',
        },
      },
      {
        q: { fr: 'Combien de temps avant réserver ?', en: 'How far in advance?' },
        a: {
          fr: 'Trois semaines minimum. Pour la quinzaine d\'ouverture et les jours de tapis rouge majeurs : six semaines.',
          en: 'Three weeks minimum. For opening fortnight and major red carpet days: six weeks.',
        },
      },
      {
        q: { fr: 'Vols nocturnes ?', en: 'Night flights?' },
        a: {
          fr: 'Oui en VFR pendant le Festival, sur autorisation préalable. Quai du Large jusqu\'à minuit, Mandelieu plus restrictif.',
          en: 'Yes in VFR during the Festival, on prior authorisation. Quai du Large until midnight, Mandelieu more restrictive.',
        },
      },
      {
        q: { fr: 'Forfait studio ?', en: 'Studio package?' },
        a: {
          fr: 'Aéronef dédié 3-5 vols/jour, coordination presse, sécurité, talents. Sur devis selon programmation.',
          en: 'Dedicated aircraft 3-5 flights/day, press, security, talent coordination. Quote based on programme.',
        },
      },
      {
        q: { fr: 'Météo défavorable ?', en: 'Bad weather?' },
        a: {
          fr: 'Bascule chauffeur Mercedes V-Class. Pendant le Festival, plan B systématique car A8 imprévisible.',
          en: 'Mercedes V-Class chauffeur switch. During the Festival, systematic plan B as A8 unpredictable.',
        },
      },
    ],
    priceFrom: 1200,
    priceUnit: { fr: 'par vol', en: 'per flight' },
  },

  // ============================================
  // HELICOPTER · GRAND PRIX MONACO
  // ============================================
  'helicopter:monaco-grand-prix': {
    heroImage: 'https://images.unsplash.com/photo-1605641532883-7ec48ed6800c?w=2400&q=85',
    heroTitle: { fr: 'Hélicoptère Grand Prix Monaco', en: 'Helicopter during Monaco Grand Prix' },
    signature: {
      fr: 'Pendant le Grand Prix, les routes Monaco sont fermées. L\'hélico est la seule option.',
      en: 'During the Grand Prix, Monaco roads are closed. Helicopter is the only option.',
    },
    aboutImage: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=1600&q=80',
    aboutTitle: { fr: 'Hélicoptère pendant le Grand Prix', en: 'Helicopter during the Grand Prix' },
    aboutText: {
      fr: 'Pendant les six jours du Grand Prix de Monaco, la moitié du centre-ville est fermée pour le circuit. L\'hélicoptère devient l\'option principale pour les arrivées et départs : Nice-Monaco en sept minutes, Cannes-Monaco en cinq minutes. L\'heliport de Fontvieille opère à plein rendement, avec créneaux saturés autour de la course du dimanche. Réservation six semaines avant minimum pour les jours événement. À partir de mille deux cents euros par vol.',
      en: 'During the six Monaco Grand Prix days, half of downtown is closed for the circuit. The helicopter becomes the main option for arrivals and departures: Nice-Monaco in seven minutes, Cannes-Monaco in five minutes. Fontvieille heliport runs at full capacity, with saturated slots around Sunday\'s race. Book six weeks ahead minimum for event days. From one thousand two hundred euros per flight.',
    },
    offerings: [
      {
        titleFr: 'Arrivées événement',
        titleEn: 'Event arrivals',
        descFr: 'Nice-Monaco 7 min, Cannes-Monaco 5 min. Évite les routes fermées et accès restreints.',
        descEn: 'Nice-Monaco 7 min, Cannes-Monaco 5 min. Bypasses closed roads and restricted access.',
        image: 'https://images.unsplash.com/photo-1605641532883-7ec48ed6800c?w=800&q=80',
      },
      {
        titleFr: 'Hospitalité yachts',
        titleEn: 'Yacht hospitality',
        descFr: 'Transfert hélico vers le yacht ancré au Port Hercule. Tender depuis Fontvieille pour rejoindre le pont.',
        descEn: 'Helicopter transfer to the yacht anchored at Port Hercule. Tender from Fontvieille to reach the deck.',
        image: 'https://images.unsplash.com/photo-1551918120-9739cb430c6d?w=800&q=80',
      },
      {
        titleFr: 'Hôtel-circuit',
        titleEn: 'Hotel-circuit',
        descFr: 'Aller-retour quotidien Monaco-Cannes ou Monaco-Saint-Tropez pour les invités hors Principauté.',
        descEn: 'Daily round-trip Monaco-Cannes or Monaco-Saint-Tropez for non-Monaco guests.',
        image: 'https://images.unsplash.com/photo-1583373834259-46cc92173cb7?w=800&q=80',
      },
      {
        titleFr: 'Soirées tardives',
        titleEn: 'Late parties',
        descFr: 'Retour Cannes ou Saint-Tropez après gala AmFAR ou soirées Casino. Vols nocturnes VFR.',
        descEn: 'Return to Cannes or Saint-Tropez after AmFAR gala or Casino parties. VFR night flights.',
        image: 'https://images.unsplash.com/photo-1571266028243-e1c2c5b15e2d?w=800&q=80',
      },
    ],
    whyHere: {
      fr: [
        'Pendant le Grand Prix, hélicoptère = seule option fluide. Routes Monaco fermées 6 jours.',
        'Heliport Fontvieille opère à plein rendement, créneaux saturés autour de la course.',
        'Combinaison hélico + tender vers les yachts ancrés au Port Hercule.',
        'Mercedes V-Class incluse aux deux extrémités, coordination écuries sur invitation.',
        'Vols nocturnes VFR autorisés pour les retours gala AmFAR ou soirées tardives.',
      ],
      en: [
        'During the Grand Prix, helicopter = only fluid option. Monaco roads closed 6 days.',
        'Fontvieille heliport runs at full capacity, saturated slots around the race.',
        'Helicopter + tender combination to yachts anchored at Port Hercule.',
        'Mercedes V-Class included at both ends, team coordination on invitation.',
        'VFR night flights authorised for AmFAR gala or late party returns.',
      ],
    },
    popularTransferSlugs: ['nice-monaco', 'cannes-monaco', 'monaco-saint-tropez'],
    faq: [
      {
        q: { fr: 'Combien coûte un vol pendant le Grand Prix ?', en: 'How much during the Grand Prix?' },
        a: {
          fr: 'À partir de €1,200 pour Nice-Monaco (7 min), €1,500 pour Cannes-Monaco (5 min), €2,400 pour Saint-Tropez (18 min).',
          en: 'From €1,200 for Nice-Monaco (7 min), €1,500 for Cannes-Monaco (5 min), €2,400 for Saint-Tropez (18 min).',
        },
      },
      {
        q: { fr: 'Combien de temps avant réserver ?', en: 'How far in advance?' },
        a: {
          fr: 'Six semaines minimum. Pour les jours qualif/course/AmFAR : trois mois.',
          en: 'Six weeks minimum. For qualifying/race/AmFAR days: three months.',
        },
      },
      {
        q: { fr: 'Tender vers le yacht ?', en: 'Tender to the yacht?' },
        a: {
          fr: 'Coordination Fontvieille + tender depuis le yacht. Notre équipe synchronise avec capitaine et équipage.',
          en: 'Fontvieille + tender from the yacht coordination. Our team syncs with captain and crew.',
        },
      },
      {
        q: { fr: 'Vols nocturnes ?', en: 'Night flights?' },
        a: {
          fr: 'Oui en VFR sur autorisation. Fontvieille jusqu\'à minuit pendant l\'événement.',
          en: 'Yes in VFR on authorisation. Fontvieille until midnight during the event.',
        },
      },
      {
        q: { fr: 'Annulation ?', en: 'Cancellation?' },
        a: {
          fr: 'Gratuite jusqu\'à 24h avant. Météo : remboursement total ou bascule chauffeur (mais routes fermées limitent l\'option).',
          en: 'Free up to 24h before. Weather: full refund or chauffeur switch (but closed roads limit the option).',
        },
      },
    ],
    priceFrom: 1200,
    priceUnit: { fr: 'par vol', en: 'per flight' },
  },

  // ============================================
  // HELICOPTER · CANNES LIONS
  // ============================================
  'helicopter:cannes-lions': {
    heroImage: 'https://images.unsplash.com/photo-1543874768-2df4cdc1ddc8?w=2400&q=85',
    heroTitle: { fr: 'Hélicoptère Cannes Lions', en: 'Helicopter during Cannes Lions' },
    signature: {
      fr: 'Hub Riviera. Monaco en 5 min, Saint-Tropez en 15. Idéal pour les délégations.',
      en: 'Riviera hub. Monaco in 5 min, Saint-Tropez in 15. Ideal for delegations.',
    },
    aboutImage: 'https://images.unsplash.com/photo-1583373834259-46cc92173cb7?w=1600&q=80',
    aboutTitle: { fr: 'Hélicoptère pendant Cannes Lions', en: 'Helicopter during Cannes Lions' },
    aboutText: {
      fr: 'Cannes Lions concentre cinq jours de business sur la Croisette. L\'hélicoptère accompagne les délégations agencies (Spotify, Google, Meta) entre Cannes et les villas Cap d\'Antibes ou Mougins, les arrivées rapides depuis Nice aéroport, et les soirées privées sur yachts à Monaco. Quai du Large heliport en cœur de Croisette à 2 min du Palais. Réservation trois semaines avant, à partir de mille deux cents euros par vol.',
      en: 'Cannes Lions packs five business days on the Croisette. The helicopter supports agency delegations (Spotify, Google, Meta) between Cannes and Cap d\'Antibes or Mougins villas, fast arrivals from Nice airport, and private parties on yachts in Monaco. Quai du Large heliport at the heart of the Croisette, 2 min from the Palais. Book three weeks ahead, from one thousand two hundred euros per flight.',
    },
    offerings: [
      {
        titleFr: 'Arrivée Nice',
        titleEn: 'Nice arrival',
        descFr: 'Vol commercial + hélicoptère depuis Nice : 5 min vs 30-50 min en chauffeur pendant le Lions.',
        descEn: 'Commercial flight + helicopter from Nice: 5 min vs 30-50 min by chauffeur during Lions.',
        image: 'https://images.unsplash.com/photo-1543874768-2df4cdc1ddc8?w=800&q=80',
      },
      {
        titleFr: 'Délégations agencies',
        titleEn: 'Agency delegations',
        descFr: 'Aéronef dédié 5-6 pax pour transferts coordonnés Cannes-Cap-Antibes-Mougins-Monaco.',
        descEn: 'Dedicated aircraft 5-6 pax for coordinated Cannes-Cap-Antibes-Mougins-Monaco transfers.',
        image: 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?w=800&q=80',
      },
      {
        titleFr: 'Soirées Monaco',
        titleEn: 'Monaco evenings',
        descFr: 'Cannes-Monaco 5 min pour les soirées Casino ou yachts au Port Hercule. Retour nocturne en VFR.',
        descEn: 'Cannes-Monaco 5 min for Casino or yacht parties at Port Hercule. VFR night return.',
        image: 'https://images.unsplash.com/photo-1605641532883-7ec48ed6800c?w=800&q=80',
      },
      {
        titleFr: 'Vol touristique',
        titleEn: 'Scenic flight',
        descFr: 'Tour Riviera 30 min pour invités d'honneur : Cap d\'Antibes, Lérins, Saint-Tropez vu du ciel.',
        descEn: 'Riviera tour 30 min for key guests: Cap d\'Antibes, Lérins, Saint-Tropez from the sky.',
        image: 'https://images.unsplash.com/photo-1583373834259-46cc92173cb7?w=800&q=80',
      },
    ],
    whyHere: {
      fr: [
        'Quai du Large à 2 min du Palais des Festivals : embarquement urbain pour la Croisette.',
        'Pendant le Lions, A8 saturée le matin et le soir. Hélicoptère évite tout.',
        'Aéronef dédié pour délégations agencies, capacité 5-6 pax.',
        'Mercedes V-Class incluse aux deux extrémités, coordination préalable agencies.',
        'Vols nocturnes VFR pour retour Cannes après soirées Monaco ou yachts.',
      ],
      en: [
        'Quai du Large 2 min from Palais des Festivals: urban boarding for the Croisette.',
        'During Lions, A8 saturated morning and evening. Helicopter bypasses everything.',
        'Dedicated aircraft for agency delegations, 5-6 pax capacity.',
        'Mercedes V-Class included at both ends, prior agency coordination.',
        'VFR night flights for Cannes return after Monaco or yacht parties.',
      ],
    },
    popularTransferSlugs: ['nice-cannes', 'cannes-monaco', 'cannes-saint-tropez'],
    faq: [
      {
        q: { fr: 'Combien coûte un vol pendant Cannes Lions ?', en: 'How much during Cannes Lions?' },
        a: {
          fr: 'À partir de €1,200 pour Nice-Cannes (5 min), €1,500 pour Cannes-Monaco (5 min), €2,000 pour Cannes-Saint-Tropez (15 min).',
          en: 'From €1,200 for Nice-Cannes (5 min), €1,500 for Cannes-Monaco (5 min), €2,000 for Cannes-Saint-Tropez (15 min).',
        },
      },
      {
        q: { fr: 'Aéronef dédié agence ?', en: 'Dedicated agency aircraft?' },
        a: {
          fr: 'Yes, helicopter privatisation 5 jours du Lions. 5-6 pax par vol, multiple flights per day. Sur devis.',
          en: 'Yes, helicopter privatisation 5 Lions days. 5-6 pax per flight, multiple flights per day. Quote-based.',
        },
      },
      {
        q: { fr: 'Vol depuis aéroport Nice ?', en: 'Flight from Nice airport?' },
        a: {
          fr: '10 min en chauffeur de l\'aéroport au heliport Nice + 5 min de vol = 15 min total porte-à-porte.',
          en: '10 min chauffeur from airport to Nice heliport + 5 min flight = 15 min total door-to-door.',
        },
      },
      {
        q: { fr: 'Combien de temps avant réserver ?', en: 'How far in advance?' },
        a: {
          fr: 'Trois semaines minimum. Pour les jours d\'ouverture et grands prix : six semaines.',
          en: 'Three weeks minimum. For opening days and grand prix: six weeks.',
        },
      },
      {
        q: { fr: 'Météo défavorable ?', en: 'Bad weather?' },
        a: {
          fr: 'Bascule chauffeur Mercedes V-Class préparée. Routes saturées : prévoir 30 min supplémentaires.',
          en: 'Mercedes V-Class chauffeur switch prepared. Saturated roads: plan 30 extra minutes.',
        },
      },
    ],
    priceFrom: 1200,
    priceUnit: { fr: 'par vol', en: 'per flight' },
  },

  // ============================================
  // HELICOPTER · MONACO YACHT SHOW
  // ============================================
  'helicopter:monaco-yacht-show': {
    heroImage: 'https://images.unsplash.com/photo-1551918120-9739cb430c6d?w=2400&q=85',
    heroTitle: { fr: 'Hélicoptère Monaco Yacht Show', en: 'Helicopter during Monaco Yacht Show' },
    signature: {
      fr: 'Visites yachts en aérien. Cap-Ferrat, Saint-Tropez, Cannes en moins de 20 minutes.',
      en: 'Yacht visits by air. Cap-Ferrat, Saint-Tropez, Cannes in under 20 minutes.',
    },
    aboutImage: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=1600&q=80',
    aboutTitle: { fr: 'Hélicoptère pendant le Yacht Show', en: 'Helicopter during the Yacht Show' },
    aboutText: {
      fr: 'Le Monaco Yacht Show concentre quatre jours de visites yachts à Monaco. L\'hélicoptère accompagne les brokers et clients pour les visites de chantiers à Cap-Ferrat (Sanlorenzo), Saint-Tropez (Lürssen), ou Cannes en aérien rapide. Heliport Fontvieille à 5 min du Port Hercule, capacité 4 aéronefs. Combinaison parfaite avec les yachts ancrés au port. Réservation six semaines avant minimum, à partir de mille euros par vol.',
      en: 'The Monaco Yacht Show packs four days of yacht visits in Monaco. The helicopter supports brokers and clients for yard visits at Cap-Ferrat (Sanlorenzo), Saint-Tropez (Lürssen), or Cannes by fast air. Fontvieille heliport 5 min from Port Hercule, 4-aircraft capacity. Perfect combination with yachts anchored at the port. Book six weeks ahead minimum, from one thousand euros per flight.',
    },
    offerings: [
      {
        titleFr: 'Visites chantiers',
        titleEn: 'Yard visits',
        descFr: 'Sanlorenzo Cap-Ferrat (5 min), Lürssen Saint-Tropez (18 min). Aller-retour journée pour brokers.',
        descEn: 'Sanlorenzo Cap-Ferrat (5 min), Lürssen Saint-Tropez (18 min). Day round-trip for brokers.',
        image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&q=80',
      },
      {
        titleFr: 'Hôtel-port',
        titleEn: 'Hotel-port',
        descFr: 'Hôtel de Paris au heliport en 3 min chauffeur, puis 5 min de vol vers Saint-Tropez ou Cannes.',
        descEn: 'Hôtel de Paris to heliport in 3 min chauffeur, then 5 min flight to Saint-Tropez or Cannes.',
        image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&q=80',
      },
      {
        titleFr: 'Soirées sur ponts',
        titleEn: 'Deck parties',
        descFr: 'Yachts privatisés en soirée à Monaco, Cannes ou Saint-Tropez. Hélicoptère pour rejoindre rapidement.',
        descEn: 'Privatised evening yachts in Monaco, Cannes or Saint-Tropez. Helicopter for fast access.',
        image: 'https://images.unsplash.com/photo-1551918120-9739cb430c6d?w=800&q=80',
      },
      {
        titleFr: 'Visite aérienne',
        titleEn: 'Aerial visit',
        descFr: 'Tour de la Riviera 30 min vu du ciel pour invités d'honneur. Pampelonne, Cap-Ferrat, Cap d\'Antibes.',
        descEn: 'Riviera tour 30 min from the sky for key guests. Pampelonne, Cap-Ferrat, Cap d\'Antibes.',
        image: 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?w=800&q=80',
      },
    ],
    whyHere: {
      fr: [
        'Heliport Fontvieille à 5 min du Port Hercule en chauffeur : combinaison parfaite avec yachts.',
        'Visites chantiers Riviera en aérien : Sanlorenzo Cap-Ferrat, Lürssen Saint-Tropez.',
        'Aéronef dédié 5-6 pax pour brokers + clients sur la durée du Show (4 jours).',
        'Mercedes V-Class incluse aux deux extrémités, coordination port-heliport.',
        'Combinaison hélicoptère + yacht charter pour les démos de yachts en mouvement.',
      ],
      en: [
        'Fontvieille heliport 5 min from Port Hercule by chauffeur: perfect yacht combination.',
        'Aerial Riviera yard visits: Sanlorenzo Cap-Ferrat, Lürssen Saint-Tropez.',
        'Dedicated aircraft 5-6 pax for brokers + clients over the Show duration (4 days).',
        'Mercedes V-Class included at both ends, port-heliport coordination.',
        'Helicopter + yacht charter combination for moving yacht demos.',
      ],
    },
    popularTransferSlugs: ['nice-monaco', 'cannes-monaco', 'monaco-saint-tropez'],
    faq: [
      {
        q: { fr: 'Combien coûte un vol pendant le Yacht Show ?', en: 'How much during the Yacht Show?' },
        a: {
          fr: 'À partir de €1,000 pour Monaco-Cap-Ferrat (5 min), €1,200 pour Monaco-Cannes (5 min), €1,800 pour Monaco-Saint-Tropez (18 min).',
          en: 'From €1,000 for Monaco-Cap-Ferrat (5 min), €1,200 for Monaco-Cannes (5 min), €1,800 for Monaco-Saint-Tropez (18 min).',
        },
      },
      {
        q: { fr: 'Visites chantiers ?', en: 'Yard visits?' },
        a: {
          fr: 'Sanlorenzo Cap-Ferrat (5 min vol), Lürssen Saint-Tropez (18 min). Notre équipe coordonne rendez-vous chantier.',
          en: 'Sanlorenzo Cap-Ferrat (5 min flight), Lürssen Saint-Tropez (18 min). Our team coordinates yard appointments.',
        },
      },
      {
        q: { fr: 'Aéronef dédié 4 jours ?', en: 'Dedicated aircraft 4 days?' },
        a: {
          fr: 'Oui, privatisation hélicoptère pour brokers : multiple flights par jour, capacité 5-6 pax. Sur devis.',
          en: 'Yes, helicopter privatisation for brokers: multiple flights per day, 5-6 pax capacity. Quote-based.',
        },
      },
      {
        q: { fr: 'Combien de temps avant réserver ?', en: 'How far in advance?' },
        a: {
          fr: 'Six semaines minimum. Pour aéronef dédié pendant les 4 jours : trois mois avant.',
          en: 'Six weeks minimum. For dedicated aircraft during the 4 days: three months ahead.',
        },
      },
      {
        q: { fr: 'Météo défavorable ?', en: 'Bad weather?' },
        a: {
          fr: 'Bascule chauffeur. Hélico souvent privilégié pendant le Show car routes Monaco saturées.',
          en: 'Chauffeur switch. Helicopter often preferred during the Show as Monaco roads saturated.',
        },
      },
    ],
    priceFrom: 1000,
    priceUnit: { fr: 'par vol', en: 'per flight' },
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
