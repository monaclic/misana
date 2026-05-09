// FAQ datasets bilingues pour 6 pages : home + 5 services.
// Optim SEO + AEO (Perplexity, ChatGPT search, Google AI Overviews).
// Home expose 8 Q&A, pages services exposent 10 Q&A. Schema.org FAQPage
// genere automatiquement par <FaqSection /> a partir des items.

export type FaqItem = { question: string; answer: string };

type LocalizedFaq = { en: FaqItem[]; fr: FaqItem[] };

export const FAQ_HOME: LocalizedFaq = {
  en: [
    { question: 'What is Misana?', answer: 'A private services agency on the French Riviera. Five services from Saint-Tropez to Monaco: chauffeur, luxury car rental, yacht charter, helicopter transfers and access to restaurants, hotels and beach clubs.' },
    { question: 'What areas does Misana cover?', answer: 'Saint-Tropez, Cannes, Antibes, Cap d\'Antibes, Cap-Ferrat, Nice and Monaco. Other locations on the French Riviera and beyond on request.' },
    { question: 'How do I book a service?', answer: 'By phone, WhatsApp, email or online form. Reply within a few hours during business hours. One named contact handles your request from quotation to return.' },
    { question: 'When should I book?', answer: 'Last-minute requests are studied case by case. For peak weeks like the Cannes Film Festival, the Monaco Grand Prix, the Cannes Yachting Festival or the Monaco Yacht Show, earlier bookings increase availability.' },
    { question: 'Does Misana coordinate full stays?', answer: 'Yes. Chauffeur, car rental, yacht, helicopter and access can be combined in a single coordination, with one contact handling every booking and every change.' },
    { question: 'Does Misana operate year-round?', answer: 'Yes. The high season runs April to October, but the team operates twelve months a year for residents and winter visitors, including Christmas and February holidays.' },
    { question: 'What languages does Misana operate in?', answer: 'English and French daily. Italian, Arabic and German on request, including multilingual chauffeurs and crews.' },
    { question: 'How is pricing structured?', answer: 'Quoted per service, with all-inclusive rates covering everything required for the booking. Multi-day and full-stay arrangements quoted as a single proposal. The price is locked at booking, never after.' },
  ],
  fr: [
    { question: 'Qu\'est-ce que Misana ?', answer: 'Une agence de services privés sur la Côte d\'Azur. Cinq services de Saint-Tropez à Monaco : chauffeur, location de voitures de luxe, yacht, hélicoptère et accès aux restaurants, hôtels et beach clubs.' },
    { question: 'Quelle est la couverture territoriale ?', answer: 'Saint-Tropez, Cannes, Antibes, Cap d\'Antibes, Cap-Ferrat, Nice et Monaco. Autres lieux sur la Côte d\'Azur et au-delà sur demande.' },
    { question: 'Comment réserver un service ?', answer: 'Par téléphone, WhatsApp, email ou formulaire en ligne. Réponse en quelques heures en journée. Un seul interlocuteur suit votre demande du devis au retour.' },
    { question: 'Quel est le délai de réservation ?', answer: 'Demandes de dernière minute étudiées au cas par cas. Pour les semaines de pic comme le Festival de Cannes, le Grand Prix de Monaco, le Cannes Yachting Festival ou le Monaco Yacht Show, anticiper augmente les disponibilités.' },
    { question: 'Misana coordonne-t-il un séjour complet ?', answer: 'Oui. Chauffeur, voitures, yacht, hélicoptère et accès peuvent être combinés dans une seule coordination, avec un interlocuteur unique pour chaque réservation et chaque changement.' },
    { question: 'Misana opère-t-il toute l\'année ?', answer: 'Oui. La haute saison va d\'avril à octobre, mais l\'équipe opère douze mois par an pour les résidents et les visiteurs hors saison, vacances de Noël et de février incluses.' },
    { question: 'Dans quelles langues Misana opère-t-il ?', answer: 'Français et anglais au quotidien. Italien, arabe et allemand sur demande, y compris chauffeurs et équipages multilingues.' },
    { question: 'Comment fonctionnent les tarifs ?', answer: 'Devis par service, tarifs tout compris couvrant l\'intégralité de la prestation. Les séjours multi-services et les coordinations complètes sont chiffrés en une seule proposition. Le prix est arrêté à la réservation, jamais après.' },
  ],
};

export const FAQ_CHAUFFEUR: LocalizedFaq = {
  en: [
    { question: 'What does the Misana chauffeur service include?', answer: 'A professional driver, the vehicle of your choice, fuel, parking, tolls and taxes. Bottled water and Wi-Fi are standard. Child seats on request, no extra charge.' },
    { question: 'How does pricing work?', answer: 'Flat fare per route for airport transfers, taxes included. Hourly or daily rates for full-day hire. Quote confirmed at booking, never after.' },
    { question: 'What types of vehicles are available?', answer: 'Mercedes E-Class, V-Class, S-Class, Range Rover Vogue, Mercedes-Maybach S 680 and Mercedes Sprinter VIP. Other models on request.' },
    { question: 'Which airports do you cover?', answer: 'Nice Côte d\'Azur (NCE), Cannes Mandelieu (CEQ) and Saint-Tropez La Môle (LTT). Marseille (MRS), Genoa (GOA) and other airports on request. Drivers track flight arrival in real time.' },
    { question: 'Are Misana chauffeurs multilingual?', answer: 'French and English daily. Italian, Arabic and German on request.' },
    { question: 'Can the chauffeur wait during dinner or appointments?', answer: 'Yes. Wait time is included in hourly and daily bookings. The driver remains reachable throughout and repositions discreetly when needed.' },
    { question: 'Do you provide chauffeurs for multi-day stays?', answer: 'Yes. Multi-day arrangements typically use the same driver across the stay, ensuring continuity and knowledge of your preferences.' },
    { question: 'How do I book a chauffeur?', answer: 'Send dates, pickup point, drop-off and any preference through the request form, phone or WhatsApp. Confirmation with assigned driver name and contact within hours.' },
  ],
  fr: [
    { question: 'Que comprend le service chauffeur Misana ?', answer: 'Un chauffeur professionnel, le véhicule de votre choix, carburant, parking, péages et taxes. Bouteilles d\'eau et Wi-Fi inclus. Sièges enfants sur demande, sans supplément.' },
    { question: 'Comment fonctionnent les tarifs ?', answer: 'Forfait par trajet pour les transferts aéroport, taxes comprises. Tarif horaire ou journalier pour les mises à disposition. Devis arrêté à la réservation, jamais après.' },
    { question: 'Quels véhicules sont disponibles ?', answer: 'Mercedes E-Class, V-Class, S-Class, Range Rover Vogue, Mercedes-Maybach S 680 et Mercedes Sprinter VIP. Autres modèles sur demande.' },
    { question: 'Quels aéroports sont couverts ?', answer: 'Nice Côte d\'Azur (NCE), Cannes Mandelieu (CEQ) et Saint-Tropez La Môle (LTT). Marseille (MRS), Gênes (GOA) et autres aéroports sur demande. Les chauffeurs suivent l\'arrivée des vols en temps réel.' },
    { question: 'Les chauffeurs Misana sont-ils multilingues ?', answer: 'Français et anglais au quotidien. Italien, arabe et allemand sur demande.' },
    { question: 'Le chauffeur peut-il attendre pendant un dîner ou un rendez-vous ?', answer: 'Oui. L\'attente est comprise dans les forfaits horaires et journaliers. Le chauffeur reste joignable et se repositionne discrètement si besoin.' },
    { question: 'Proposez-vous des chauffeurs pour des séjours de plusieurs jours ?', answer: 'Oui. Les séjours multi-jours utilisent généralement le même chauffeur, pour la continuité et la connaissance de vos préférences.' },
    { question: 'Comment réserver un chauffeur ?', answer: 'Envoyez vos dates, points de prise en charge et de dépose, et toute préférence par formulaire, téléphone ou WhatsApp. Confirmation avec nom du chauffeur attribué et contact en quelques heures.' },
  ],
};

export const FAQ_CARS: LocalizedFaq = {
  en: [
    { question: 'What luxury cars can I rent on the French Riviera?', answer: 'Supercars, grand tourers, luxury sedans, SUVs and convertibles. Italian, German and British brands. Specific models on request.' },
    { question: 'How does pricing work?', answer: 'Daily rate per vehicle, taxes included. Multi-day rates degressive. Comprehensive insurance included. Quote confirmed at booking.' },
    { question: 'Where can the car be delivered?', answer: 'Across the French Riviera: Nice airport, hotels, villas, yacht slips, restaurants or any address you provide.' },
    { question: 'What is required to rent a luxury car?', answer: 'A valid driving licence, a passport or ID, and a credit card for the deposit. Specific requirements vary by vehicle category and are confirmed at booking.' },
    { question: 'Is insurance included?', answer: 'Yes. Comprehensive insurance is included in every rental. The deposit varies by vehicle category and is fully released upon return without incident.' },
    { question: 'Can I rent a car with a chauffeur?', answer: 'Yes. Any vehicle in the fleet can be booked with a chauffeur, recommended for summer traffic or unfamiliar mountain roads.' },
    { question: 'Can I cross into Italy or Switzerland?', answer: 'Yes, on request, with cross-border insurance extension. Day trips to Portofino, San Remo or the Italian lakes commonly arranged.' },
    { question: 'How do I book a luxury car?', answer: 'Send dates, vehicle preference, delivery and return points through the request form, phone or WhatsApp. Confirmation with the exact vehicle and pickup details within hours.' },
  ],
  fr: [
    { question: 'Quelles voitures de luxe puis-je louer sur la Côte d\'Azur ?', answer: 'Supercars, GT, berlines de luxe, SUV et cabriolets. Marques italiennes, allemandes et britanniques. Modèles spécifiques sur demande.' },
    { question: 'Comment fonctionnent les tarifs ?', answer: 'Tarif journalier par véhicule, taxes comprises. Tarif dégressif pour les locations multi-jours. Assurance tous risques incluse. Devis arrêté à la réservation.' },
    { question: 'Où la voiture peut-elle être livrée ?', answer: 'Sur l\'ensemble de la Côte d\'Azur : aéroport de Nice, hôtels, villas, ports, restaurants ou toute adresse de votre choix.' },
    { question: 'Que faut-il pour louer une voiture de luxe ?', answer: 'Un permis de conduire valide, un passeport ou pièce d\'identité, et une carte de crédit pour la caution. Les conditions précises varient selon la catégorie de véhicule et sont confirmées à la réservation.' },
    { question: 'L\'assurance est-elle incluse ?', answer: 'Oui. L\'assurance tous risques est incluse dans chaque location. La caution varie selon la catégorie de véhicule et est intégralement libérée au retour sans incident.' },
    { question: 'Puis-je louer une voiture avec chauffeur ?', answer: 'Oui. Tous les véhicules de la flotte peuvent être loués avec chauffeur, recommandé en été ou sur les routes de montagne.' },
    { question: 'Puis-je passer en Italie ou en Suisse ?', answer: 'Oui, sur demande, avec extension d\'assurance transfrontalière. Excursions à Portofino, San Remo ou les lacs italiens organisées régulièrement.' },
    { question: 'Comment réserver une voiture de luxe ?', answer: 'Envoyez vos dates, préférence de véhicule, points de livraison et de retour par formulaire, téléphone ou WhatsApp. Confirmation avec le véhicule exact et les détails de prise en charge en quelques heures.' },
  ],
};

export const FAQ_YACHT: LocalizedFaq = {
  en: [
    { question: 'What yachts can I charter with Misana on the French Riviera?', answer: 'Our charter selection ranges from 15-metre day yachts to 50-metre+ superyachts, including motor yachts, sailing yachts and catamarans. Crew is included on every charter.' },
    { question: 'How much does a yacht charter cost on the Côte d\'Azur?', answer: 'Day charters on a 15 to 20-metre motor yacht start at around €4,500 including crew, fuel surcharge excluded. Weekly charters on a 30-metre yacht typically range €60,000 to €120,000. Superyachts above 40 metres are quoted on request.' },
    { question: 'What is included in the charter price?', answer: 'Day charters generally include the yacht, full crew, water toys (paddleboards, snorkelling gear). Fuel, food and beverages are typically billed separately as APA (Advance Provisioning Allowance) for weekly charters.' },
    { question: 'Where do yacht charters depart from?', answer: 'Most departures are from Saint-Tropez, Cannes, Antibes, Nice or Monaco. We can also arrange embarkation at any port between Saint-Tropez and Menton, and one-way charters to Italy, Corsica or the Balearics.' },
    { question: 'How many guests can a yacht accommodate?', answer: 'Day charters typically host 8 to 12 guests. Overnight charters accommodate 6 to 12 guests in cabins, with crew quarters separate. Larger superyachts can host up to 18 guests overnight.' },
    { question: 'What is APA in a yacht charter?', answer: 'APA stands for Advance Provisioning Allowance, generally 25 to 35% of the charter fee, paid before departure. It covers fuel, food, drinks, port fees and any expense incurred during the charter. Unspent funds are refunded.' },
    { question: 'Do I need a licence to charter a yacht?', answer: 'No. Every charter includes a professional crew. Bareboat charters (without crew) require a valid skipper\'s licence and are arranged on request for sailing yachts under 24 metres.' },
    { question: 'What activities are available during a charter?', answer: 'Snorkelling, paddleboarding, jet skis (some yachts), seabobs, inflatable slides, fishing equipment, swim platforms. We can also arrange beach club access, restaurant tenders to shore and helicopter transfers to and from the yacht.' },
    { question: 'When should I book a yacht for July or August?', answer: 'For peak July and August, especially around Bastille Day and the August 15 weekend, we recommend booking 4 to 6 months ahead. Major event weeks (Cannes Lions, Cannes Yachting Festival, Monaco Yacht Show, Monaco Grand Prix) book 6 months in advance.' },
    { question: 'Can the yacht come to a specific port to pick us up?', answer: 'Yes. Subject to charter agreement and port availability, the yacht can reposition to your preferred embarkation point. Repositioning fuel costs may apply for distant pickups.' },
  ],
  fr: [
    { question: 'Quels yachts puis-je affréter avec Misana sur la Côte d\'Azur ?', answer: 'Notre sélection couvre des yachts de jour de 15 mètres jusqu\'aux superyachts de 50 mètres et plus, incluant yachts à moteur, voiliers et catamarans. L\'équipage est inclus sur chaque charter.' },
    { question: 'Combien coûte un charter de yacht sur la Côte d\'Azur ?', answer: 'Les charters journée sur un yacht à moteur de 15 à 20 mètres démarrent autour de 4 500 € équipage inclus, hors surcharge carburant. Les charters à la semaine sur un 30 mètres vont généralement de 60 000 € à 120 000 €. Les superyachts au-delà de 40 mètres sont chiffrés sur demande.' },
    { question: 'Qu\'est-ce qui est inclus dans le prix d\'un charter ?', answer: 'Les charters journée incluent généralement le yacht, l\'équipage complet et les jouets nautiques (paddles, équipement de snorkeling). Le carburant, la nourriture et les boissons sont généralement facturés séparément en APA (Advance Provisioning Allowance) pour les charters à la semaine.' },
    { question: 'D\'où partent les charters de yacht ?', answer: 'La plupart des départs se font depuis Saint-Tropez, Cannes, Antibes, Nice ou Monaco. Nous pouvons aussi arranger l\'embarquement dans tout port entre Saint-Tropez et Menton, ainsi que des charters one-way vers l\'Italie, la Corse ou les Baléares.' },
    { question: 'Combien de passagers un yacht peut-il accueillir ?', answer: 'Les charters journée accueillent généralement 8 à 12 invités. Les charters avec nuitées hébergent 6 à 12 invités en cabines, l\'équipage étant logé séparément. Les superyachts plus grands peuvent accueillir jusqu\'à 18 invités la nuit.' },
    { question: 'Qu\'est-ce que l\'APA dans un charter de yacht ?', answer: 'APA signifie Advance Provisioning Allowance, généralement 25 à 35 % du prix du charter, payée avant le départ. Elle couvre le carburant, la nourriture, les boissons, les taxes portuaires et toute dépense engagée durant le charter. Les fonds non dépensés sont remboursés.' },
    { question: 'Faut-il un permis pour affréter un yacht ?', answer: 'Non. Chaque charter inclut un équipage professionnel. Les charters sans équipage (bareboat) demandent un permis de skipper valide et sont arrangés sur demande pour les voiliers de moins de 24 mètres.' },
    { question: 'Quelles activités sont disponibles pendant un charter ?', answer: 'Snorkeling, paddle, jet skis (selon yacht), seabobs, toboggans gonflables, équipement de pêche, plateformes de bain. Nous pouvons aussi arranger l\'accès aux beach clubs, les tenders vers les restaurants et les transferts hélicoptère vers et depuis le yacht.' },
    { question: 'Quand faut-il réserver un yacht pour juillet ou août ?', answer: 'Pour les pics de juillet et août, notamment autour du 14 juillet et du week-end du 15 août, nous recommandons de réserver 4 à 6 mois à l\'avance. Les grandes semaines événementielles (Cannes Lions, Cannes Yachting Festival, Monaco Yacht Show, Grand Prix de Monaco) se réservent 6 mois à l\'avance.' },
    { question: 'Le yacht peut-il venir nous chercher dans un port spécifique ?', answer: 'Oui. Sous réserve du contrat de charter et de la disponibilité du port, le yacht peut se repositionner à votre point d\'embarquement préféré. Des frais de carburant de repositionnement peuvent s\'appliquer pour les prises en charge éloignées.' },
  ],
};

export const FAQ_HELICOPTER: LocalizedFaq = {
  en: [
    { question: 'How long is a helicopter transfer Nice to Monaco?', answer: 'The helicopter transfer between Nice Côte d\'Azur and Monaco takes 7 minutes in the air, 20 minutes total with boarding and disembarkation.' },
    { question: 'How long is a Nice Saint-Tropez helicopter transfer?', answer: 'The Nice Saint-Tropez helicopter transfer takes 20 minutes in the air, landing at Saint-Tropez-La Môle helipad.' },
    { question: 'How much does a helicopter transfer cost on the French Riviera?', answer: 'Helicopter transfers on the French Riviera are quoted as flat fares per route, taxes included, from €700 (Nice-Monaco) to €2,200 (Saint-Tropez-Monaco).' },
    { question: 'Which helipads operate on the French Riviera?', answer: 'Four main helipads: Nice Côte d\'Azur, Monaco, Cannes-Mandelieu and Saint-Tropez-La Môle. Private helipads at hotels, villas and yachts on request.' },
    { question: 'Which helicopters are used for transfers on the Côte d\'Azur?', answer: 'Airbus H125, H130, H135, H155, AS355 and Bell 429. Single-engine and twin-engine aircraft, 4 to 6 passengers per flight, larger aircraft on request.' },
    { question: 'Can a helicopter land on a yacht on the French Riviera?', answer: 'Yes if the yacht has a certified helideck or a touch-and-go pad. Clearance, weather and flight permissions verified before each transfer.' },
    { question: 'What happens to a helicopter transfer in bad weather?', answer: 'The pilot decides the flight based on visibility, wind and storms. In case of cancellation, automatic switch to a chauffeur transfer between the same two points.' },
    { question: 'How do I book a helicopter transfer on the French Riviera?', answer: 'Send the route, dates and number of passengers through the request form, phone or WhatsApp. Confirmation with aircraft type and pilot slot within hours.' },
  ],
  fr: [
    { question: 'Combien de temps dure un transfert hélicoptère Nice-Monaco ?', answer: 'Le transfert hélicoptère entre Nice Côte d\'Azur et Monaco dure 7 minutes en vol, 20 minutes au total avec embarquement et débarquement.' },
    { question: 'Combien de temps dure un transfert hélicoptère Nice-Saint-Tropez ?', answer: 'Le transfert hélicoptère Nice-Saint-Tropez dure 20 minutes en vol, atterrissage à l\'héliport de Saint-Tropez-La Môle.' },
    { question: 'Combien coûte un transfert hélicoptère sur la Côte d\'Azur ?', answer: 'Les transferts hélicoptère sur la Côte d\'Azur sont chiffrés au forfait par liaison, taxes comprises, à partir de 700 € (Nice-Monaco) jusqu\'à 2 200 € (Saint-Tropez-Monaco).' },
    { question: 'Quels héliports sont desservis sur la Côte d\'Azur ?', answer: 'Quatre héliports principaux : Nice Côte d\'Azur, Monaco, Cannes-Mandelieu et Saint-Tropez-La Môle. Héliports privés d\'hôtels, villas et yachts sur demande.' },
    { question: 'Quels hélicoptères sont utilisés pour les transferts sur la Côte d\'Azur ?', answer: 'Airbus H125, H130, H135, H155, AS355 et Bell 429. Appareils monomoteur et bimoteur, 4 à 6 passagers par vol, appareils plus grands sur demande.' },
    { question: 'Un hélicoptère peut-il se poser sur un yacht sur la Côte d\'Azur ?', answer: 'Oui si le yacht dispose d\'un helideck certifié ou d\'une plateforme touch-and-go. Autorisation, météo et permissions de vol vérifiées avant chaque transfert.' },
    { question: 'Que se passe-t-il en cas de mauvais temps pour un transfert hélicoptère ?', answer: 'Le pilote décide du vol selon la visibilité, le vent et la tempête. En cas d\'annulation, bascule automatique sur transfert chauffeur entre les deux mêmes points.' },
    { question: 'Comment réserver un transfert hélicoptère sur la Côte d\'Azur ?', answer: 'Envoyez la liaison, les dates et le nombre de passagers par formulaire, téléphone ou WhatsApp. Confirmation avec type d\'appareil et créneau pilote en quelques heures.' },
  ],
};

export const FAQ_ACCESS: LocalizedFaq = {
  en: [
    { question: 'How do I book a beach club in Saint-Tropez?', answer: 'Direct booking at Club 55, Bagatelle, Loulou, Verde, Nikki Beach, Indie Beach, La Plage des Jumeaux and other Pampelonne beach clubs. Tables, cabanas and lunches on request.' },
    { question: 'How do I book Jimmy\'z Monaco or Bâoli Cannes?', answer: 'Table bookings at Jimmy\'z Monaco, Bâoli Cannes and other French Riviera night clubs. VIP carrés and bottle service on request.' },
    { question: 'How do I book Le Louis XV, Mirazur or La Vague d\'Or?', answer: 'Direct booking at Le Louis XV (Monaco), Mirazur (Menton), La Vague d\'Or (Saint-Tropez), La Palme d\'Or (Cannes), Le Chantecler (Nice) and other Michelin-starred restaurants on the French Riviera.' },
    { question: 'How do I book a suite at Hôtel du Cap-Eden-Roc or Hôtel de Paris Monte-Carlo?', answer: 'Room and suite bookings at Hôtel du Cap-Eden-Roc, Hôtel de Paris Monte-Carlo, Carlton Cannes, Martinez Cannes, Grand-Hôtel du Cap-Ferrat and other palace hotels on the French Riviera.' },
    { question: 'Which beach clubs are covered in Pampelonne?', answer: 'Club 55, Bagatelle, Loulou, Verde, Nikki Beach, Indie Beach, La Plage des Jumeaux and the main beach clubs of Pampelonne. Day bookings and high-season reservations on request.' },
    { question: 'Can you get a table in a fully booked restaurant?', answer: 'Yes on request. Le Louis XV, Mirazur, La Vague d\'Or, La Palme d\'Or and other Michelin-starred addresses on the French Riviera, including peak season.' },
    { question: 'Do you book outside the French Riviera?', answer: 'Yes on request. Bookings in Paris, Saint-Moritz, Courchevel, Milan, Portofino, Capri, London and Marrakech via partner network.' },
    { question: 'How do I make an Access booking with Misana?', answer: 'Send the venue, date and number of guests through the request form, phone or WhatsApp. Confirmation within hours.' },
  ],
  fr: [
    { question: 'Comment réserver une table dans un beach club à Saint-Tropez ?', answer: 'Réservation directe au Club 55, Bagatelle, Loulou, Verde, Nikki Beach, Indie Beach, La Plage des Jumeaux et autres beach clubs de Pampelonne. Tables, cabanas et déjeuners sur demande.' },
    { question: 'Comment réserver à Jimmy\'z Monaco ou Bâoli Cannes ?', answer: 'Réservation de tables au Jimmy\'z Monaco, Bâoli Cannes et autres night clubs de la Côte d\'Azur. Carrés VIP et formats bouteille sur demande.' },
    { question: 'Comment réserver Le Louis XV, Mirazur ou La Vague d\'Or ?', answer: 'Réservation directe au Louis XV (Monaco), Mirazur (Menton), La Vague d\'Or (Saint-Tropez), La Palme d\'Or (Cannes), Le Chantecler (Nice) et autres restaurants étoilés de la Côte d\'Azur.' },
    { question: 'Comment réserver une suite à l\'Hôtel du Cap-Eden-Roc ou à l\'Hôtel de Paris Monte-Carlo ?', answer: 'Réservation de chambres et suites à l\'Hôtel du Cap-Eden-Roc, Hôtel de Paris Monte-Carlo, Carlton Cannes, Martinez Cannes, Grand-Hôtel du Cap-Ferrat et autres palaces de la Côte d\'Azur.' },
    { question: 'Quels beach clubs sont couverts à Pampelonne ?', answer: 'Club 55, Bagatelle, Loulou, Verde, Nikki Beach, Indie Beach, La Plage des Jumeaux et les principaux beach clubs de Pampelonne. Réservations à la journée et en saison haute sur demande.' },
    { question: 'Pouvez-vous obtenir une table dans un restaurant complet ?', answer: 'Oui sur demande. Le Louis XV, Mirazur, La Vague d\'Or, La Palme d\'Or et autres adresses étoilées de la Côte d\'Azur sur demande, y compris en pic de saison.' },
    { question: 'Réservez-vous des accès en dehors de la Côte d\'Azur ?', answer: 'Oui sur demande. Réservations à Paris, Saint-Moritz, Courchevel, Milan, Portofino, Capri, Londres et Marrakech via réseau partenaire.' },
    { question: 'Comment réserver un accès Misana ?', answer: 'Envoyez le lieu, la date et le nombre de personnes par formulaire, téléphone ou WhatsApp. Confirmation en quelques heures.' },
  ],
};

// Selecteur par locale.
export function pickFaq(faq: LocalizedFaq, locale: string): FaqItem[] {
  return locale === 'fr' ? faq.fr : faq.en;
}
