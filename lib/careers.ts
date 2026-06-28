// Offres d'emploi statiques Misana. Modele : lib/fleet.ts.
// Contenu bilingue EN/FR inline, pas de CMS pour V1.
// Schema.org JobPosting data inclus pour chaque offre.

export type JobOffer = {
  slug: string;
  employmentType: 'CONTRACTOR' | 'FULL_TIME' | 'PART_TIME';
  locationEN: string;
  locationFR: string;
  // Schema.org
  datePosted: string;
  validThrough: string;
  hiringOrganization: {
    name: string;
    url: string;
    logo: string;
  };
  baseSalary?: {
    currency: string;
    minValue: number;
    maxValue: number;
    unitText: 'YEAR' | 'MONTH';
  };
  // Bilingual content
  en: JobContent;
  fr: JobContent;
};

export type JobContent = {
  title: string;
  seoTitle: string;
  metaDescription: string;
  kicker: string;
  intro: string;
  aboutRole: string[];
  expectations: string[];
  offer: string[];
  aboutCompany: string;
  cta: string;
  internalLinks: { label: string; path: string }[];
  serviceNote: string;
};

const ORG = {
  name: 'Misana',
  url: 'https://misana-group.com',
  logo: 'https://misana-group.com/og-default.jpg',
};

const DATE_POSTED = '2026-06-28';
const VALID_THROUGH = '2026-09-28';

export const CAREERS: JobOffer[] = [
  {
    slug: 'private-chauffeur-partner',
    employmentType: 'CONTRACTOR',
    locationEN: 'French Riviera: Nice, Cannes, Monaco, Saint-Tropez',
    locationFR: "Côte d'Azur: Nice, Cannes, Monaco, Saint-Tropez",
    datePosted: DATE_POSTED,
    validThrough: VALID_THROUGH,
    hiringOrganization: ORG,
    en: {
      title: 'Private Chauffeur Partner',
      seoTitle: 'Private Chauffeur Partner, French Riviera | Misana Group',
      metaDescription:
        'Partner chauffeur role on the French Riviera with Misana. Airport transfers, inter-city routes and disposals between Saint-Tropez and Monaco. Apply.',
      kicker: 'On the road',
      intro:
        'Misana provides private chauffeur, helicopter, yacht, and concierge services across the French Riviera, from Saint-Tropez to Menton. We work with a small number of independent chauffeur partners operating on a per-mission basis.',
      aboutRole: [
        'You operate independently on the Côte d\'Azur, covering airport transfers, inter-city routes, and multi-day disposals for Misana clients. Missions run between Nice Côte d\'Azur Airport and Monaco, Cannes and Saint-Tropez, and the full corridor in between.',
        'You are the primary ground contact for the client at pickup and drop-off. Punctuality and presentation are the baseline. Discretion is constant. Clients include corporate travellers, festival delegates during the Cannes Film Festival and Monaco Grand Prix, and private regulars.',
        'Missions are confirmed 48 hours in advance. You hold a valid VTC licence and operate your own vehicle or an approved partner vehicle. Preferred: E-Class, V-Class, S-Class, or Range Rover in dark neutral colours. The vehicle is presented clean at every pickup.',
      ],
      expectations: [
        'Valid French VTC or taxi licence (licence de transport public particulier de personnes)',
        'Minimum three years of professional chauffeur experience in transport or hospitality',
        'Fluent French and conversational English. Additional languages are a plus.',
        'Own or have access to a representative vehicle: Mercedes, BMW, or Range Rover, three years old or newer',
        'Clean presentation at all times. Client confidentiality is non-negotiable.',
        'Available from May to September. Priority availability on Festival de Cannes and Monaco Grand Prix dates.',
        'Smartphone with WhatsApp for mission coordination. GPS proficiency required.',
        'Verifiable professional references from transport or hospitality clients',
      ],
      offer: [
        'Per-mission remuneration above standard market rates, paid within five business days',
        'Regular volume during peak season from a single source, with no intermediaries',
        'Clients do not negotiate on service level',
        'Most partner chauffeurs work with us across multiple consecutive seasons',
        'No marketing or client acquisition required on your side. We manage the relationship and the request flow.',
        'A named Misana contact available seven days a week during the season',
      ],
      aboutCompany:
        'Misana operates across the French Riviera, from Saint-Tropez to Menton. Services include private chauffeur, helicopter transfers, yacht charter, car rental, and table reservations. The service area covers eighty kilometres of coast and does not extend beyond.',
      cta: 'Apply for this role',
      internalLinks: [
        { label: 'Our chauffeur service', path: '/private-chauffeur' },
        { label: 'Nice on the coast', path: '/destinations/nice' },
        { label: 'Monaco transfers', path: '/destinations/monaco' },
      ],
      serviceNote: 'Familiarise yourself with our chauffeur service before applying.',
    },
    fr: {
      title: 'Partenaire Chauffeur Privé',
      seoTitle: "Partenaire Chauffeur Privé, Côte d'Azur | Misana Group",
      metaDescription:
        "Partenaire chauffeur privé sur la Côte d'Azur avec Misana. Transferts aéroport, liaisons inter-villes et mises à disposition entre Saint-Tropez et Monaco. Postulez.",
      kicker: 'Sur la route',
      intro:
        "Misana fournit des services de chauffeur privé, hélicoptère, yacht et conciergerie sur la Côte d'Azur, de Saint-Tropez à Menton. Nous travaillons avec un nombre limité de partenaires chauffeurs indépendants opérant à la mission.",
      aboutRole: [
        "Vous opérez de façon indépendante sur la Côte d'Azur, couvrant les transferts aéroport, les liaisons inter-villes et les mises à disposition longue durée pour les clients Misana. Les missions couvrent l'aéroport de Nice Côte d'Azur vers Monaco, Cannes vers Saint-Tropez, et l'ensemble du corridor entre les deux.",
        "Vous êtes le contact principal du client au départ et à l'arrivée. La ponctualité et la présentation sont le minimum. La discrétion est constante. Les clients incluent des voyageurs corporate, des délégués au Festival de Cannes et au Grand Prix de Monaco, et des clients privés réguliers.",
        "Les missions sont confirmées 48 heures à l'avance. Vous détenez une carte VTC valide et opérez avec votre propre véhicule ou un véhicule partenaire approuvé. Profil préféré : E-Class, V-Class, S-Class ou Range Rover en couleurs sombres neutres. Le véhicule est présenté propre à chaque prise en charge.",
      ],
      expectations: [
        "Carte professionnelle VTC ou taxi valide (licence de transport public particulier de personnes)",
        "Minimum trois ans d'expérience professionnelle en tant que chauffeur dans le transport ou l'hôtellerie",
        "Français courant et anglais conversationnel. D'autres langues sont un plus.",
        "Propriétaire ou accès à un véhicule représentatif : Mercedes, BMW ou Range Rover, trois ans ou moins",
        "Présentation soignée en toutes circonstances. La confidentialité client est non négociable.",
        "Disponible de mai à septembre. Priorité sur les dates du Festival de Cannes et du Grand Prix de Monaco.",
        "Smartphone avec WhatsApp pour la coordination des missions. Maîtrise du GPS requise.",
        "Références professionnelles vérifiables dans le transport ou l'hôtellerie",
      ],
      offer: [
        "Rémunération à la mission au-dessus des tarifs du marché, réglée sous cinq jours ouvrés",
        "Volume régulier en haute saison auprès d'une seule source, sans intermédiaire",
        "Les clients ne négocient pas sur le niveau de service",
        "La plupart des partenaires chauffeurs travaillent avec nous sur plusieurs saisons consécutives",
        "Aucune démarche marketing ou commerciale de votre côté. Nous gérons la relation client et le flux de demandes.",
        "Un interlocuteur Misana identifié disponible sept jours sur sept pendant la saison",
      ],
      aboutCompany:
        "Misana opère sur la Côte d'Azur, de Saint-Tropez à Menton. Les services comprennent le chauffeur privé, les transferts hélicoptère, la location de yacht, la location de voitures et les réservations de tables. La zone couvre quatre-vingts kilomètres de côte.",
      cta: 'Postuler pour ce poste',
      internalLinks: [
        { label: 'Notre service chauffeur', path: '/private-chauffeur' },
        { label: 'Nice sur la côte', path: '/destinations/nice' },
        { label: 'Transferts Monaco', path: '/destinations/monaco' },
      ],
      serviceNote: 'Prenez connaissance de notre service chauffeur avant de postuler.',
    },
  },

  {
    slug: 'b2b-business-developer',
    employmentType: 'FULL_TIME',
    locationEN: 'Monaco / Nice, French Riviera',
    locationFR: "Monaco / Nice, Côte d'Azur",
    datePosted: DATE_POSTED,
    validThrough: VALID_THROUGH,
    hiringOrganization: ORG,
    baseSalary: {
      currency: 'EUR',
      minValue: 45000,
      maxValue: 65000,
      unitText: 'YEAR',
    },
    en: {
      title: 'B2B Business Developer',
      seoTitle: 'B2B Business Developer, Monaco / Nice | Misana Group',
      metaDescription:
        'B2B business development role at Misana, French Riviera. Build and manage partnerships with hotels, palaces, yacht brokers, and event agencies. Based Monaco or Nice.',
      kicker: 'On the ground',
      intro:
        'Misana works with palaces, hotels, event agencies, and yacht operators across the French Riviera through direct referral relationships. We are looking for a Business Developer to build and manage this partner network, based in Monaco or Nice.',
      aboutRole: [
        'You develop and maintain the Misana B2B partner network on the French Riviera. Target partners include five-star hotels and palaces, yacht brokers and management companies, event agencies producing festivals and private events, corporate travel departments, and high-end real estate agencies operating between Cannes and Monaco.',
        'The role is primarily relational. You attend industry events including the Monaco Yacht Show, MIPIM, and Cannes Film Festival, and build working relationships with concierge departments, event producers, and corporate travel managers. Preferred vendor agreements come from consistent follow-through, not volume outreach.',
        'You report directly to the founder and coordinate with the operations team. The role is based in Monaco or Nice, with regular travel along the corridor. Monaco presence is an advantage given the concentration of target partners there.',
        'KPIs cover active partner count, referral volume, and partner retention. Cold contact volume is not a target metric.',
      ],
      expectations: [
        'Three to five years of B2B business development in luxury hospitality, travel, or an adjacent sector',
        'Existing contacts on the Riviera: hotel concierge staff, yacht management, event agencies',
        'Fluent English and French. Conversational Italian is an advantage on this corridor.',
        'Comfortable working with limited process and a small team. Autonomous decision-making is expected.',
        'Strong interpersonal discretion. Client names are never shared or referenced externally.',
        'Familiar with the seasonal rhythm of the coast: high season, festival periods, shoulder season',
        'Based in Monaco or Nice, or able to relocate',
      ],
      offer: [
        'Base salary between €45,000 and €65,000, with a performance variable tied to partner referral revenue',
        'Direct access to the founder. Flat structure, no intermediary layers.',
        'Accreditations and event access for the Cannes Film Festival, Monaco Grand Prix, and Monaco Yacht Show',
        'Misana covers chauffeur, helicopter, yacht, cars, and table access in one offering. This simplifies the partner pitch compared to a single-service provider.',
        'Expense account for partner relationship activities, within agreed limits',
        'Equity discussion possible after twelve months, subject to performance and mutual agreement',
      ],
      aboutCompany:
        'Misana operates across the French Riviera, from Saint-Tropez to Menton. Services include private chauffeur, helicopter transfers, yacht charter, car rental, and table reservations. Five services, eight destinations, with a client base that returns each season.',
      cta: 'Apply for this role',
      internalLinks: [
        { label: 'Our access service: tables, palaces, beach clubs', path: '/access' },
        { label: 'Monaco on the coast', path: '/destinations/monaco' },
        { label: 'The Cannes Film Festival', path: '/events/festival-de-cannes' },
      ],
      serviceNote: 'Familiarise yourself with our full service offer before applying.',
    },
    fr: {
      title: 'Business Developer B2B',
      seoTitle: "Business Developer B2B, Monaco / Nice | Misana Group",
      metaDescription:
        "Poste de développement commercial B2B chez Misana, Côte d'Azur. Partenariats avec hôtels, palaces, courtiers yacht, agences événementielles. Basé Monaco ou Nice.",
      kicker: 'Sur le terrain',
      intro:
        "Misana travaille avec des palaces, hôtels, agences événementielles et opérateurs yacht sur la Côte d'Azur par le biais de relations de référencement direct. Nous recherchons un Business Developer pour développer et gérer ce réseau partenaires, basé à Monaco ou Nice.",
      aboutRole: [
        "Vous développez et entretenez le réseau de partenaires B2B de Misana sur la Côte d'Azur. Les partenaires cibles sont les hôtels et palaces cinq étoiles, les courtiers et sociétés de gestion yacht, les agences événementielles produisant festivals et événements privés, les départements de voyage corporate, et les agences immobilières haut de gamme opérant entre Cannes et Monaco.",
        "Le rôle est principalement relationnel. Vous êtes présent aux événements sectoriels, dont le Monaco Yacht Show, MIPIM et le Festival de Cannes, et vous construisez des relations de travail avec les départements conciergerie, les producteurs d'événements et les travel managers corporate. Les accords de prestataire privilégié viennent d'un suivi régulier, pas du volume de contacts.",
        "Vous reportez directement au fondateur et coordonnez avec l'équipe opérations. Le poste est basé à Monaco ou Nice, avec des déplacements réguliers sur le corridor. La présence à Monaco est un avantage vu la concentration des partenaires cibles.",
        "Les indicateurs couvrent le nombre de partenaires actifs, le volume de référencement et la rétention. Le volume de contacts froids n'est pas un objectif.",
      ],
      expectations: [
        "Trois à cinq ans de développement commercial B2B dans l'hôtellerie de luxe, le voyage ou un secteur adjacent",
        "Contacts existants sur la Riviera : personnels de conciergerie d'hôtels, gestion yacht, agences événementielles",
        "Anglais et français courants. L'italien conversationnel est un avantage sur ce corridor.",
        "À l'aise avec un processus limité et une petite équipe. L'autonomie de décision est attendue.",
        "Bonne discrétion interpersonnelle. Les noms clients ne sont jamais partagés ou référencés en externe.",
        "Familier avec le rythme saisonnier de la côte : haute saison, périodes festival, intersaison",
        "Basé à Monaco ou Nice, ou en mesure de se relocaliser",
      ],
      offer: [
        "Salaire de base entre 45 000 et 65 000 €, avec un variable de performance lié au chiffre d'affaires de référencement partenaires",
        "Accès direct au fondateur. Structure plate, sans strate intermédiaire.",
        "Accréditations et accès aux événements : Festival de Cannes, Grand Prix de Monaco, Monaco Yacht Show",
        "Misana couvre chauffeur, hélicoptère, yacht, voitures et accès aux tables en une seule offre. Cela simplifie la proposition partenaire par rapport à un opérateur mono-service.",
        "Note de frais pour les activités de relation partenaires, dans les limites convenues",
        "Discussion equity possible après douze mois, selon les résultats et accord mutuel",
      ],
      aboutCompany:
        "Misana opère sur la Côte d'Azur, de Saint-Tropez à Menton. Les services comprennent le chauffeur privé, les transferts hélicoptère, la location de yacht, la location de voitures et les réservations de tables. Cinq services, huit destinations, avec une clientèle qui revient chaque saison.",
      cta: 'Postuler pour ce poste',
      internalLinks: [
        { label: 'Notre service Accès: tables, palaces, plages', path: '/access' },
        { label: 'Monaco sur la côte', path: '/destinations/monaco' },
        { label: 'Le Festival de Cannes', path: '/events/festival-de-cannes' },
      ],
      serviceNote: 'Prenez connaissance de notre offre de services complète avant de postuler.',
    },
  },

  {
    slug: 'digital-marketing-seo-alternant',
    employmentType: 'PART_TIME',
    locationEN: 'Nice / Hybrid, French Riviera',
    locationFR: "Nice / Hybride, Côte d'Azur",
    datePosted: DATE_POSTED,
    validThrough: VALID_THROUGH,
    hiringOrganization: ORG,
    en: {
      title: 'Digital Marketing & SEO Alternant',
      seoTitle: 'Digital Marketing & SEO Alternant, Nice | Misana Group',
      metaDescription:
        'Work-study role in digital marketing and SEO at Misana, French Riviera. Nice-based, hybrid. Contribute to content production, technical SEO, and editorial planning.',
      kicker: 'On the screen',
      intro:
        'Misana is building its SEO and content presence across 115 pages covering five services and eight destinations on the French Riviera. We are looking for a work-study candidate to contribute to content production, technical SEO monitoring, and editorial planning.',
      aboutRole: [
        'You work with the founding team on digital marketing and SEO. The site runs on Nuxt 3 and covers five services (chauffeur, helicopter, yacht, car rental, access) across eight Riviera destinations. The site architecture and URL structure are in place. The role focuses on content production and performance iteration.',
        'Content production is the primary task. You write and optimise service pages, destination guides, and event coverage for the Festival de Cannes, Monaco Grand Prix, and Monaco Yacht Show. Content is in English first, long-form, and locally specific.',
        'On the technical side, you monitor Core Web Vitals, manage structured data (Schema.org), run crawl audits, and track rank movements. Comfort reading Search Console data is expected from the start.',
        'Social presence is a secondary task. The Instagram and LinkedIn feeds follow the same editorial tone as the site. No trend-chasing or engagement tactics.',
      ],
      expectations: [
        'Enrolled in a Bac+3 to Bac+5 programme with a valid alternance contract in marketing, digital, communication, or SEO',
        'Working knowledge of on-page SEO: keyword research, semantic structuring, meta optimisation, internal linking',
        'Comfortable with Google Search Console, Semrush or Ahrefs, and Google Analytics 4',
        'Strong written English. Content production is primarily in English.',
        'Interest in or knowledge of the hospitality or luxury travel sector',
        'Attention to detail in copy: tone, typography, factual accuracy',
        'Familiarity with Notion or similar tools for editorial planning',
        'Technical SEO basics (crawl reports, page speed, structured data) are a meaningful plus',
      ],
      offer: [
        'Legal alternance compensation in line with the French scale for your level and year',
        'Direct involvement in SEO and content work across 115 pages from early in the project',
        'Each page you work on is tracked for search performance. The feedback loop is short.',
        'Access to premium SEO tools on the Misana account',
        'Hybrid arrangement: two to three days per week in Nice, remainder remote',
        'Written reference from the founder at the end of the contract, if merited',
      ],
      aboutCompany:
        'Misana operates across the French Riviera, from Saint-Tropez to Menton. Services include private chauffeur, helicopter transfers, yacht charter, car rental, and table reservations. The V1 site is live across 115 pages. V2 is in active development.',
      cta: 'Apply for this role',
      internalLinks: [
        { label: 'Our services on the Riviera', path: '/' },
        { label: 'Eight destinations on the coast', path: '/destinations' },
        { label: 'Events we cover', path: '/events' },
      ],
      serviceNote: 'Read through the full site before applying. The editorial tone reflects what we expect from content contributions.',
    },
    fr: {
      title: 'Alternant Marketing Digital & SEO',
      seoTitle: "Alternant Marketing Digital & SEO, Nice | Misana Group",
      metaDescription:
        "Alternance marketing digital et SEO chez Misana, Côte d'Azur. Basé Nice, hybride. Production de contenu, SEO technique et planification éditoriale.",
      kicker: "À l'écran",
      intro:
        "Misana construit sa présence SEO et contenu sur 115 pages couvrant cinq services et huit destinations sur la Côte d'Azur. Nous recherchons un alternant pour contribuer à la production de contenu, au suivi SEO technique et à la planification éditoriale.",
      aboutRole: [
        "Vous travaillez avec l'équipe fondatrice sur le marketing digital et le SEO. Le site tourne sur Nuxt 3 et couvre cinq services (chauffeur, hélicoptère, yacht, location de voitures, accès) sur huit destinations de la Riviera. L'architecture du site et la structure des URLs sont en place. Le rôle porte sur la production de contenu et l'itération sur les performances.",
        "La production de contenu est la tâche principale. Vous rédigez et optimisez des pages de services, des guides de destinations et des dossiers événementiels pour le Festival de Cannes, le Grand Prix de Monaco et le Monaco Yacht Show. Le contenu est d'abord en anglais, long format, et spécifique à la géographie locale.",
        "Côté technique, vous surveillez les Core Web Vitals, gérez les données structurées (Schema.org), effectuez des audits de crawl et suivez les évolutions de positionnement. La lecture des données Search Console est attendue dès le départ.",
        "La présence sociale est une tâche secondaire. Les feeds Instagram et LinkedIn suivent la même tonalité éditoriale que le site. Pas de tactiques d'engagement ou de suivi des tendances.",
      ],
      expectations: [
        "Inscrit en Bac+3 à Bac+5 avec un contrat d'alternance valide en marketing, digital, communication ou SEO",
        "Connaissance opérationnelle du SEO on-page : recherche de mots-clés, structuration sémantique, optimisation des metas, maillage interne",
        "À l'aise avec Google Search Console, Semrush ou Ahrefs, et Google Analytics 4",
        "Anglais écrit solide. La production de contenu est principalement en anglais.",
        "Intérêt ou connaissance du secteur hôtellerie ou voyage de prestige",
        "Attention au détail dans le contenu : ton, typographie, exactitude factuelle",
        "Familiarité avec Notion ou des outils similaires pour la planification éditoriale",
        "Les bases du SEO technique (rapports de crawl, vitesse de page, données structurées) sont un vrai plus",
      ],
      offer: [
        "Rémunération d'alternance légale conforme au barème français pour votre niveau et année",
        "Implication directe sur le SEO et le contenu de 115 pages dès le début du projet",
        "Chaque page travaillée est suivie sur ses performances de recherche. La boucle de retour est courte.",
        "Accès aux outils SEO premium sur le compte Misana",
        "Organisation hybride : deux à trois jours par semaine à Nice, reste en télétravail",
        "Référence écrite du fondateur en fin de contrat, si méritée",
      ],
      aboutCompany:
        "Misana opère sur la Côte d'Azur, de Saint-Tropez à Menton. Les services comprennent le chauffeur privé, les transferts hélicoptère, la location de yacht, la location de voitures et les réservations de tables. Le site V1 est en ligne sur 115 pages. La V2 est en développement actif.",
      cta: 'Postuler pour ce poste',
      internalLinks: [
        { label: 'Nos services sur la Riviera', path: '/' },
        { label: 'Les huit destinations sur la côte', path: '/destinations' },
        { label: 'Les événements que nous couvrons', path: '/events' },
      ],
      serviceNote: "Parcourez l'intégralité du site avant de postuler. La tonalité éditoriale reflète ce que nous attendons des contributions de contenu.",
    },
  },

  {
    slug: 'yacht-villa-concierge-coordinator',
    employmentType: 'FULL_TIME',
    locationEN: 'Cannes / Saint-Tropez, French Riviera',
    locationFR: "Cannes / Saint-Tropez, Côte d'Azur",
    datePosted: DATE_POSTED,
    validThrough: VALID_THROUGH,
    hiringOrganization: ORG,
    baseSalary: {
      currency: 'EUR',
      minValue: 32000,
      maxValue: 42000,
      unitText: 'YEAR',
    },
    en: {
      title: 'Yacht & Villa Concierge Coordinator',
      seoTitle: 'Yacht & Villa Concierge Coordinator, Cannes / Saint-Tropez | Misana Group',
      metaDescription:
        'Concierge coordinator role at Misana. Manage yacht charter and villa files for private clients between Cannes and Saint-Tropez. Full-time CDI, French Riviera.',
      kicker: 'On the water',
      intro:
        'Misana manages yacht charter and villa bookings across the French Riviera for private clients. We are looking for a Coordinator to handle files from initial request through on-water or on-property support, with no requirement for the client to follow up.',
      aboutRole: [
        'You manage the operational side of yacht charter and villa bookings for Misana clients. You liaise with yacht management companies and brokers in the ports of Cannes, Antibes, and Saint-Tropez, and with villa owners and rental agencies between Cap-Ferrat and Ramatuelle.',
        'Each file runs from initial brief through provider selection, contract coordination, crew provisioning, and on-site support during the stay. Client contact is kept to a minimum once the file is open. Each question has one answer, delivered once.',
        'In peak season, you manage three to six active files at the same time. Daily priorities shift: departure windows change with weather, crew replacements happen at short notice, provisioning requests arrive the morning of embarkation. These decisions are yours to make without escalating each one.',
        'You coordinate with the chauffeur and helicopter teams for port transfers and inter-destination movements. The corridor from Nice airport to Saint-Tropez via Cannes is the primary geography.',
      ],
      expectations: [
        'Two to four years in yacht charter operations, marina management, luxury villa coordination, or high-end travel',
        'Practical knowledge of the ports between Cannes and Saint-Tropez: Vieux-Port de Cannes, Port Vauban, Port de Saint-Tropez',
        'Strong vendor coordination: you manage brokers, crew, provisioners, and property managers across multiple files simultaneously',
        'Fluent English and French. Italian is a working advantage in this corridor.',
        'High availability from May to September. Hours are irregular in July and August.',
        'Reliable under operational pressure. Multiple simultaneous issues in peak season are normal, not exceptional.',
        'Driving licence and familiarity with the Var and Alpes-Maritimes departments',
      ],
      offer: [
        'Full-time permanent contract (CDI), €32,000 to €42,000 depending on experience',
        'Direct operational responsibility. The quality of each client stay depends on how the file is managed.',
        'Seasonal access to the ports and properties you coordinate, with direct product knowledge',
        'Small team with direct reporting to the founder. No intermediary management.',
        'Involvement in provider selection and relationship management, not only execution of a fixed list',
        'Growth into a senior operations role is possible as the yacht and villa service expands in V2',
      ],
      aboutCompany:
        'Misana operates across the French Riviera, from Saint-Tropez to Menton. Services include private chauffeur, helicopter transfers, yacht charter, car rental, and table reservations. Yacht and villa operations are expanding in V2.',
      cta: 'Apply for this role',
      internalLinks: [
        { label: 'Our yacht charter service', path: '/yacht' },
        { label: 'Cannes on the coast', path: '/destinations/cannes' },
        { label: 'Saint-Tropez', path: '/destinations/saint-tropez' },
      ],
      serviceNote: 'Familiarise yourself with our yacht service before applying.',
    },
    fr: {
      title: 'Coordinateur Conciergerie Yacht & Villas',
      seoTitle: "Coordinateur Conciergerie Yacht & Villas, Cannes / Saint-Tropez | Misana Group",
      metaDescription:
        "Poste de coordinateur conciergerie chez Misana. Gestion des dossiers yacht et villa pour clients privés entre Cannes et Saint-Tropez. CDI, Côte d'Azur.",
      kicker: "Sur l'eau",
      intro:
        "Misana gère des locations de yachts et des réservations de villas sur la Côte d'Azur pour des clients privés. Nous recherchons un Coordinateur pour traiter les dossiers de la demande initiale au suivi sur site, sans relance de la part du client.",
      aboutRole: [
        "Vous gérez le volet opérationnel des locations de yachts et des réservations de villas pour les clients Misana. Vous êtes en liaison avec les sociétés de gestion et courtiers yacht dans les ports de Cannes, Antibes et Saint-Tropez, et avec les propriétaires de villas et agences de location entre Cap-Ferrat et Ramatuelle.",
        "Chaque dossier va du brief initial jusqu'à la sélection du prestataire, la coordination des contrats, l'approvisionnement de l'équipage et le suivi sur site pendant le séjour. Le contact client est limité une fois le dossier ouvert. Chaque question reçoit une réponse, transmise une seule fois.",
        "En haute saison, vous gérez trois à six dossiers actifs simultanément. Les priorités quotidiennes changent : les fenêtres de départ évoluent avec la météo, les remplacements d'équipage surviennent avec peu de préavis, les demandes d'approvisionnement arrivent le matin de l'embarquement. Ces décisions vous appartiennent sans escalade systématique.",
        "Vous coordonnez avec les équipes chauffeur et hélicoptère pour les transferts portuaires et les déplacements inter-destinations. Le corridor de l'aéroport de Nice à Saint-Tropez via Cannes est la géographie principale.",
      ],
      expectations: [
        "Deux à quatre ans dans les opérations de location de yachts, la gestion de marina, la coordination de villas de luxe ou le voyage haut de gamme",
        "Connaissance pratique des ports entre Cannes et Saint-Tropez : Vieux-Port de Cannes, Port Vauban, Port de Saint-Tropez",
        "Bonne coordination prestataires : vous gérez courtiers, équipages, approvisionneurs et gestionnaires de biens sur plusieurs dossiers simultanément",
        "Anglais et français courants. L'italien est un avantage opérationnel sur ce corridor.",
        "Forte disponibilité de mai à septembre. Les horaires sont irréguliers en juillet et août.",
        "Fiable sous pression opérationnelle. Les problèmes simultanés en haute saison sont normaux, pas exceptionnels.",
        "Permis de conduire et bonne connaissance du Var et des Alpes-Maritimes",
      ],
      offer: [
        "CDI, 32 000 à 42 000 € selon l'expérience",
        "Responsabilité opérationnelle directe. La qualité de chaque séjour client dépend de la gestion du dossier.",
        "Accès saisonnier aux ports et propriétés que vous coordonnez, avec une connaissance directe du produit",
        "Petite équipe avec reporting direct au fondateur. Pas de management intermédiaire.",
        "Participation à la sélection des prestataires et à la gestion des relations, pas seulement à l'exécution d'une liste fixe",
        "Évolution vers un poste d'opérations senior possible à mesure que le service yacht et villa se développe en V2",
      ],
      aboutCompany:
        "Misana opère sur la Côte d'Azur, de Saint-Tropez à Menton. Les services comprennent le chauffeur privé, les transferts hélicoptère, la location de yacht, la location de voitures et les réservations de tables. Les opérations yacht et villa se développent en V2.",
      cta: 'Postuler pour ce poste',
      internalLinks: [
        { label: 'Notre service location de yacht', path: '/yacht' },
        { label: 'Cannes sur la côte', path: '/destinations/cannes' },
        { label: 'Saint-Tropez', path: '/destinations/saint-tropez' },
      ],
      serviceNote: "Prenez connaissance de notre service yacht avant de postuler.",
    },
  },
];

export function findCareer(slug: string): JobOffer | undefined {
  return CAREERS.find((c) => c.slug === slug);
}
