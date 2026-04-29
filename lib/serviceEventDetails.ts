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
};

export function getServiceEventDetail(service: string, event: string): ServiceCityDetail | null {
  return DETAILS[`${service}:${event}`] ?? null;
}

export function getEventPopularTransfers(slugs: string[]): typeof TRANSFERS[number][] {
  return slugs
    .map((slug) => TRANSFERS.find((t) => t.slug === slug))
    .filter(Boolean) as typeof TRANSFERS[number][];
}
