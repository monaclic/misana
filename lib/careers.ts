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
    locationEN: 'French Riviera — Nice, Cannes, Monaco, Saint-Tropez',
    locationFR: "Côte d'Azur — Nice, Cannes, Monaco, Saint-Tropez",
    datePosted: DATE_POSTED,
    validThrough: VALID_THROUGH,
    hiringOrganization: ORG,
    en: {
      title: 'Private Chauffeur Partner',
      seoTitle: 'Private Chauffeur Partner — French Riviera | Misana Group',
      metaDescription:
        'Join Misana as a private chauffeur partner on the French Riviera. Work with high-profile guests between Saint-Tropez and Monaco. Apply now.',
      kicker: 'On the road',
      intro:
        'Misana orchestrates private services across eighty kilometres of the French Riviera, from Saint-Tropez to Menton. We work with a small number of trusted partners who hold the road with the same discretion we hold the coast.',
      aboutRole: [
        'As a Private Chauffeur Partner, you operate independently across the Côte d\'Azur on a per-mission basis, covering airport transfers, inter-city routes, and multi-day disposals for Misana guests. Missions span Nice Côte d\'Azur Airport to Monaco, Cannes to Saint-Tropez, and the full corridor in between.',
        'You are the first and last contact a guest has on the ground. Punctuality, presentation, and silence when silence is required define the role. Guests range from festival delegates during the Cannes Film Festival and Monaco Grand Prix to regulars who return each summer with the same expectations.',
        'Missions are confirmed forty-eight hours in advance. You hold a clean VTC licence and operate your own or a partner vehicle. Preferred profile: E-Class, V-Class, S-Class, or Range Rover in dark neutral colours. The vehicle is presented immaculate at every pickup.',
      ],
      expectations: [
        'Valid French VTC or taxi licence (licence de transport public particulier de personnes)',
        'Minimum three years of professional chauffeur experience in the luxury or hospitality sector',
        'Fluent French, conversational English — additional languages a strong plus',
        'Own or access to a representative vehicle (Mercedes, BMW, Range Rover — 3 years or newer)',
        'Impeccable presentation, discretion at all times, zero tolerance for breach of client confidentiality',
        'Available for peak season: May to September, with priority on Festival de Cannes and Monaco Grand Prix dates',
        'Smartphone with WhatsApp for mission coordination. GPS and mapping tools at your standard',
        'Verifiable references from previous hospitality or transport clients',
      ],
      offer: [
        'Per-mission remuneration at rates above market, settled within five business days',
        'Consistent volume during peak season from a single trusted partner, no intermediaries',
        'Access to a guest profile that does not negotiate on service quality',
        'Long-term relationship built on repeat business — most of our chauffeur partners work with us across multiple seasons',
        'No marketing, no client acquisition on your end. We hold the relationship and the request flow',
        'A named Misana contact available seven days during the season for coordination',
      ],
      aboutCompany:
        'Misana is a private services house operating across the French Riviera, from Saint-Tropez to Menton. We orchestrate chauffeur, helicopter, yacht, car rental, and access to the right tables and addresses. Our guests are regulars on the coast — not first-timers. We do not extend beyond eighty kilometres, and we do not lower the standard.',
      cta: 'Apply for this role',
      internalLinks: [
        { label: 'Our chauffeur service', path: '/private-chauffeur' },
        { label: 'Nice and the coast', path: '/destinations/nice' },
        { label: 'Monaco transfers', path: '/destinations/monaco' },
      ],
      serviceNote: 'Familiarise yourself with our chauffeur service before applying.',
    },
    fr: {
      title: 'Partenaire Chauffeur Privé',
      seoTitle: "Partenaire Chauffeur Privé — Côte d'Azur | Misana Group",
      metaDescription:
        "Rejoignez Misana comme partenaire chauffeur privé sur la Côte d'Azur. Missions de Saint-Tropez à Monaco avec une clientèle haut de gamme. Postulez.",
      kicker: 'Sur la route',
      intro:
        "Misana orchestre des services privés sur quatre-vingts kilomètres de Côte d'Azur, de Saint-Tropez à Menton. Nous travaillons avec un nombre limité de partenaires de confiance qui tiennent la route avec la même discrétion que nous tenons la côte.",
      aboutRole: [
        "En tant que Partenaire Chauffeur Privé, vous opérez de façon indépendante sur la Côte d'Azur à la mission, couvrant les transferts aéroport, les liaisons inter-villes et les mises à disposition longue durée pour les clients Misana. Les missions couvrent l'aéroport de Nice Côte d'Azur vers Monaco, Cannes vers Saint-Tropez, et l'ensemble du corridor entre les deux.",
        "Vous êtes le premier et le dernier contact d'un client sur le terrain. La ponctualité, la présentation et le silence quand il est de mise définissent le poste. Les clients vont des délégués au Festival de Cannes et au Grand Prix de Monaco aux habitués qui reviennent chaque été avec les mêmes attentes.",
        "Les missions sont confirmées quarante-huit heures à l'avance. Vous détenez une carte VTC en règle et opérez avec votre propre véhicule ou un véhicule partenaire. Profil privilégié : E-Class, V-Class, S-Class ou Range Rover en couleurs sombres neutres. Le véhicule est présenté impeccable à chaque prise en charge.",
      ],
      expectations: [
        "Carte professionnelle VTC ou taxi valide (licence de transport public particulier de personnes)",
        "Minimum trois ans d'expérience professionnelle en tant que chauffeur dans le secteur du luxe ou de l'hôtellerie",
        "Français courant, anglais conversationnel — d'autres langues sont un atout fort",
        "Propriétaire ou accès à un véhicule représentatif (Mercedes, BMW, Range Rover — 3 ans ou moins)",
        "Présentation irréprochable, discrétion en toutes circonstances, zéro tolérance pour toute violation de la confidentialité client",
        "Disponible en haute saison : mai à septembre, avec priorité sur les dates du Festival de Cannes et du Grand Prix de Monaco",
        "Smartphone avec WhatsApp pour la coordination des missions. Outils GPS et cartographie maîtrisés",
        "Références vérifiables auprès d'anciens clients hôtellerie ou transport",
      ],
      offer: [
        "Rémunération à la mission au-dessus des tarifs du marché, réglée sous cinq jours ouvrés",
        "Volume régulier en haute saison auprès d'un seul partenaire de confiance, sans intermédiaire",
        "Accès à une clientèle qui ne négocie pas sur la qualité de service",
        "Relation long terme construite sur la fidélisation — la plupart de nos partenaires chauffeurs travaillent avec nous sur plusieurs saisons",
        "Aucune démarche marketing ou commerciale de votre côté. Nous gérons la relation client et le flux de demandes",
        "Un interlocuteur Misana identifié disponible sept jours sur sept pendant la saison",
      ],
      aboutCompany:
        "Misana est une maison de services privés opérant sur la Côte d'Azur, de Saint-Tropez à Menton. Nous orchestrons chauffeur, hélicoptère, yacht, location de voitures et accès aux bonnes tables et adresses. Nos clients sont des habitués de la côte, pas des premières fois. Nous ne dépassons pas les quatre-vingts kilomètres et nous ne baissons pas le standard.",
      cta: 'Postuler pour ce poste',
      internalLinks: [
        { label: 'Notre service chauffeur', path: '/private-chauffeur' },
        { label: 'Nice et la côte', path: '/destinations/nice' },
        { label: 'Transferts Monaco', path: '/destinations/monaco' },
      ],
      serviceNote: 'Prenez connaissance de notre service chauffeur avant de postuler.',
    },
  },

  {
    slug: 'b2b-business-developer',
    employmentType: 'FULL_TIME',
    locationEN: 'Monaco / Nice — French Riviera',
    locationFR: "Monaco / Nice — Côte d'Azur",
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
      seoTitle: 'B2B Business Developer — Monaco / Nice | Misana Group',
      metaDescription:
        'Develop B2B partnerships for Misana across the French Riviera. Hotels, palaces, yacht brokers, event agencies. Based Monaco or Nice. Apply now.',
      kicker: 'On the ground',
      intro:
        'Misana builds quiet, long-term relationships with the right addresses across the Côte d\'Azur. We are looking for a Business Developer who understands that in this market, reputation opens more doors than any sales deck.',
      aboutRole: [
        'You develop and maintain Misana\'s B2B partner network across the French Riviera: palaces and five-star hotels, yacht brokers and management companies, event agencies producing festivals and private events, corporate travel departments, and high-end real estate agencies operating between Cannes and Monaco.',
        'Your role is relational, not transactional. You are present at the right industry events — Monaco Yacht Show, MIPIM, Cannes Film Festival accreditation circles — and you build the kind of trust that results in preferred vendor status. A warm introduction from a Palace concierge director is worth more than any advertising spend.',
        'You report directly to the founder and work in close coordination with the operations team. The role is Monaco or Nice-based with frequent travel along the corridor. Presence in Monaco is a significant advantage given the density of the target partner base.',
        'KPIs focus on active partner count, referral volume, and partner retention — not cold contact volume. Quality of relationship over quantity of meetings.',
      ],
      expectations: [
        'Three to five years of B2B business development experience in luxury hospitality, travel, or adjacent sectors',
        'Existing network on the Riviera — hotel concierge contacts, yacht management relationships, event agency directory',
        'Fluent English and French, conversational Italian a strong advantage in this corridor',
        'Comfort operating without a large team or extensive process: autonomy, judgment, initiative',
        'Exceptional interpersonal discretion — you represent a house that does not trade on names',
        'Familiarity with the seasonal rhythm of the coast: high season, festival windows, shoulder season',
        'Based in Monaco or Nice, or willing to relocate',
      ],
      offer: [
        'Competitive base salary (€45,000 to €65,000) with performance variable tied to partner referral revenue',
        'Direct access to founder — no layers, fast decisions, flat structure',
        'Accreditations and event access for the major Riviera events: Cannes Film Festival, Monaco Grand Prix, Monaco Yacht Show',
        'A differentiated product to represent: Misana holds the full stack (chauffeur, helicopter, yacht, cars, access) which makes for a stronger partner proposition than a single-service operator',
        'Full expense account for partner relationship activities. No nickel-and-diming on meals or events within reason',
        'Long-term equity conversation possible after twelve months for the right profile',
      ],
      aboutCompany:
        'Misana is a private services house operating across the French Riviera, from Saint-Tropez to Menton. We orchestrate chauffeur, helicopter, yacht, car rental, and access to the right tables and addresses. We hold five services, eight destinations, and a guest roster that returns season after season. Growth in V2 is transactional and service-by-service.',
      cta: 'Apply for this role',
      internalLinks: [
        { label: 'Our access service — tables, palaces, beach clubs', path: '/access' },
        { label: 'Monaco on the coast', path: '/destinations/monaco' },
        { label: 'The Cannes Film Festival', path: '/events/festival-de-cannes' },
      ],
      serviceNote: 'Familiarise yourself with our full service offer before applying.',
    },
    fr: {
      title: 'Business Developer B2B',
      seoTitle: "Business Developer B2B — Monaco / Nice | Misana Group",
      metaDescription:
        "Développez les partenariats B2B de Misana sur la Côte d'Azur. Hôtels, palaces, courtiers yacht, agences événementielles. Basé Monaco ou Nice. Postulez.",
      kicker: 'Sur le terrain',
      intro:
        "Misana construit des relations discrètes et durables avec les bonnes adresses de la Côte d'Azur. Nous recherchons un Business Developer qui comprend que sur ce marché, la réputation ouvre plus de portes que n'importe quel dossier commercial.",
      aboutRole: [
        "Vous développez et entretenez le réseau de partenaires B2B de Misana sur la Côte d'Azur : palaces et hôtels cinq étoiles, courtiers et sociétés de gestion yacht, agences événementielles produisant des festivals et des événements privés, départements de voyage corporate, et agences immobilières haut de gamme opérant entre Cannes et Monaco.",
        "Votre rôle est relationnel, pas transactionnel. Vous êtes présent aux bons événements sectoriels — Monaco Yacht Show, MIPIM, cercles d'accréditation du Festival de Cannes — et vous construisez le type de confiance qui aboutit à un statut de prestataire privilégié. Une introduction chaleureuse d'un directeur concierge de Palace vaut plus que n'importe quelle dépense publicitaire.",
        "Vous reportez directement au fondateur et travaillez en étroite coordination avec l'équipe opérations. Le poste est basé à Monaco ou Nice avec des déplacements fréquents sur le corridor. La présence à Monaco est un avantage significatif étant donné la densité de la base partenaires cible.",
        "Les KPIs se concentrent sur le nombre de partenaires actifs, le volume de référencement et la rétention partenaires — pas sur le volume de contacts froids. Qualité de la relation sur quantité de réunions.",
      ],
      expectations: [
        "Trois à cinq ans d'expérience en développement commercial B2B dans l'hôtellerie de luxe, le voyage ou des secteurs adjacents",
        "Réseau existant sur la Riviera — contacts concierges d'hôtels, relations gestion yacht, répertoire agences événementielles",
        "Anglais et français courants, italien conversationnel fort atout sur ce corridor",
        "À l'aise pour opérer sans grande équipe ni processus extensif : autonomie, jugement, initiative",
        "Discrétion interpersonnelle exceptionnelle — vous représentez une maison qui ne commerce pas avec les noms",
        "Familiarité avec le rythme saisonnier de la côte : haute saison, fenêtres festival, intersaison",
        "Basé à Monaco ou Nice, ou prêt à se relocaliser",
      ],
      offer: [
        "Salaire de base compétitif (45 000 à 65 000 €) avec variable de performance lié au chiffre d'affaires de référencement partenaires",
        "Accès direct au fondateur — aucune strate, décisions rapides, structure plate",
        "Accréditations et accès événements pour les grands événements de la Riviera : Festival de Cannes, Grand Prix de Monaco, Monaco Yacht Show",
        "Un produit différencié à représenter : Misana tient la pile complète (chauffeur, hélicoptère, yacht, voitures, accès) ce qui fait une proposition partenaire plus forte qu'un opérateur mono-service",
        "Note de frais complète pour les activités de relation partenaires. Pas de pinaillage sur les repas ou les événements dans les limites du raisonnable",
        "Conversation equity long terme possible après douze mois pour le bon profil",
      ],
      aboutCompany:
        "Misana est une maison de services privés opérant sur la Côte d'Azur, de Saint-Tropez à Menton. Nous orchestrons chauffeur, hélicoptère, yacht, location de voitures et accès aux bonnes tables et adresses. Nous tenons cinq services, huit destinations et une liste de clients qui reviennent saison après saison. La croissance en V2 est transactionnelle et service par service.",
      cta: 'Postuler pour ce poste',
      internalLinks: [
        { label: 'Notre service Accès — tables, palaces, plages', path: '/access' },
        { label: 'Monaco sur la côte', path: '/destinations/monaco' },
        { label: 'Le Festival de Cannes', path: '/events/festival-de-cannes' },
      ],
      serviceNote: 'Prenez connaissance de notre offre de services complète avant de postuler.',
    },
  },

  {
    slug: 'digital-marketing-seo-alternant',
    employmentType: 'PART_TIME',
    locationEN: 'Nice / Hybrid — French Riviera',
    locationFR: "Nice / Hybride — Côte d'Azur",
    datePosted: DATE_POSTED,
    validThrough: VALID_THROUGH,
    hiringOrganization: ORG,
    en: {
      title: 'Digital Marketing & SEO Alternant',
      seoTitle: 'Digital Marketing & SEO Alternant — Nice | Misana Group',
      metaDescription:
        'Work-study position in digital marketing and SEO at Misana, French Riviera luxury services. Nice-based, hybrid. Apply now.',
      kicker: 'On the screen',
      intro:
        'Misana is building its digital presence from the ground up, with a focus on organic search, editorial content, and considered social presence across the French Riviera. We are looking for an alternant who wants to build something real, not manage existing templates.',
      aboutRole: [
        'You work directly with the founding team on Misana\'s digital marketing and SEO strategy. The site is built on Nuxt 3 and structured around five core services — chauffeur, helicopter, yacht, car rental, and access — across eight Riviera destinations. The SEO architecture is already in place; your role is to help execute and iterate on it.',
        'Content is at the core of the role. You write and optimise editorial pages: destination guides, service pages, event coverage for Festival de Cannes, Monaco Grand Prix, and Monaco Yacht Show. You understand that long-form, accurate, locally-grounded content outperforms generic luxury copy at every keyword.',
        'On the technical side, you monitor Core Web Vitals, manage structured data (Schema.org), run crawl audits, and track rank movements. You are the person in the room who reads a Search Console export and knows what it means.',
        'Social presence is secondary but present: a considered Instagram and LinkedIn feed, aligned to the editorial tone of the house. No engagement-bait, no trend-chasing. Slow, accurate, precise.',
      ],
      expectations: [
        'Enrolled in a Bac+3 to Bac+5 programme with a valid alternance contract (marketing, digital, communication, or SEO specialisation)',
        'Solid understanding of on-page SEO: keyword research, semantic structuring, meta optimisation, internal linking',
        'Comfortable with Google Search Console, Semrush or Ahrefs, and Google Analytics 4',
        'Strong written English — content production is primarily in English',
        'Interest in or knowledge of the luxury and hospitality sector',
        'Attention to detail that extends to typography, tone, and factual accuracy in copy',
        'Familiarity with Notion or similar tools for editorial planning',
        'Technical SEO basics: crawl reports, page speed, structured data — a genuine plus, not a nice-to-have',
      ],
      offer: [
        'Legal alternance compensation in line with the French scale for your level and year',
        'Direct involvement in building a brand from near-zero to its full SEO potential across 115 pages',
        'A real brief: every page you optimise is a page that ranks or does not. No vanity metrics, no internal playbook divorced from results',
        'Access to premium SEO tools on the Misana account',
        'Hybrid working arrangement: two to three days per week in Nice, remaining remote',
        'Reference from the founder on completion, if merited',
      ],
      aboutCompany:
        'Misana is a private services house operating across the French Riviera, from Saint-Tropez to Menton. We orchestrate chauffeur, helicopter, yacht, car rental, and access to the right tables and addresses. V1 is live. V2 is being built. The digital presence is an open field for someone who knows what they are doing.',
      cta: 'Apply for this role',
      internalLinks: [
        { label: 'Our services on the Riviera', path: '/' },
        { label: 'Eight destinations we hold', path: '/destinations' },
        { label: 'Events we cover', path: '/events' },
      ],
      serviceNote: 'Read through the full site before applying — the editorial tone is the brief.',
    },
    fr: {
      title: 'Alternant Marketing Digital & SEO',
      seoTitle: "Alternant Marketing Digital & SEO — Nice | Misana Group",
      metaDescription:
        "Poste en alternance marketing digital et SEO chez Misana, services privés sur la Côte d'Azur. Basé Nice, hybride. Postulez.",
      kicker: "À l'écran",
      intro:
        "Misana construit sa présence digitale depuis le début, avec une priorité sur le référencement naturel, le contenu éditorial et une présence sociale considérée sur la Côte d'Azur. Nous recherchons un alternant qui veut construire quelque chose de réel, pas gérer des templates existants.",
      aboutRole: [
        "Vous travaillez directement avec l'équipe fondatrice sur la stratégie marketing digital et SEO de Misana. Le site est construit sur Nuxt 3 et structuré autour de cinq services principaux — chauffeur, hélicoptère, yacht, location de voitures et accès — sur huit destinations de la Riviera. L'architecture SEO est déjà en place ; votre rôle est d'aider à l'exécuter et à l'itérer.",
        "Le contenu est au coeur du poste. Vous rédigez et optimisez des pages éditoriales : guides de destinations, pages de services, couverture d'événements pour le Festival de Cannes, le Grand Prix de Monaco et le Monaco Yacht Show. Vous comprenez que le contenu long format, précis et ancré localement surpasse le copywriting luxe générique sur chaque mot-clé.",
        "Côté technique, vous surveillez les Core Web Vitals, gérez les données structurées (Schema.org), effectuez des audits de crawl et suivez les évolutions de positionnement. Vous êtes la personne dans la salle qui lit un export Search Console et sait ce qu'il signifie.",
        "La présence sociale est secondaire mais présente : un feed Instagram et LinkedIn considéré, aligné sur la tonalité éditoriale de la maison. Pas d'engagement bait, pas de course aux tendances. Lent, précis, exact.",
      ],
      expectations: [
        "Inscrit dans un programme Bac+3 à Bac+5 avec un contrat d'alternance valide (spécialisation marketing, digital, communication ou SEO)",
        "Bonne maîtrise du SEO on-page : recherche de mots-clés, structuration sémantique, optimisation des metas, maillage interne",
        "À l'aise avec Google Search Console, Semrush ou Ahrefs, et Google Analytics 4",
        "Anglais écrit fort — la production de contenu est principalement en anglais",
        "Intérêt ou connaissance du secteur du luxe et de l'hôtellerie",
        "Attention au détail s'étendant à la typographie, au ton et à l'exactitude factuelle du contenu",
        "Familiarité avec Notion ou outils similaires pour la planification éditoriale",
        "Bases de SEO technique : rapports de crawl, vitesse de page, données structurées — un vrai plus, pas un souhaitable",
      ],
      offer: [
        "Rémunération d'alternance légale conforme au barème français pour votre niveau et année",
        "Implication directe dans la construction d'une marque de quasi-zéro à son plein potentiel SEO sur 115 pages",
        "Un vrai brief : chaque page que vous optimisez est une page qui se positionne ou non. Pas de métriques de vanité, pas de playbook interne déconnecté des résultats",
        "Accès aux outils SEO premium sur le compte Misana",
        "Organisation hybride : deux à trois jours par semaine à Nice, reste en télétravail",
        "Référence du fondateur à l'issue, si méritée",
      ],
      aboutCompany:
        "Misana est une maison de services privés opérant sur la Côte d'Azur, de Saint-Tropez à Menton. Nous orchestrons chauffeur, hélicoptère, yacht, location de voitures et accès aux bonnes tables et adresses. La V1 est en ligne. La V2 est en construction. La présence digitale est un champ ouvert pour quelqu'un qui sait ce qu'il fait.",
      cta: 'Postuler pour ce poste',
      internalLinks: [
        { label: 'Nos services sur la Riviera', path: '/' },
        { label: 'Les huit destinations que nous tenons', path: '/destinations' },
        { label: 'Les événements que nous couvrons', path: '/events' },
      ],
      serviceNote: "Parcourez l'intégralité du site avant de postuler — la tonalité éditoriale est le brief.",
    },
  },

  {
    slug: 'yacht-villa-concierge-coordinator',
    employmentType: 'FULL_TIME',
    locationEN: 'Cannes / Saint-Tropez — French Riviera',
    locationFR: "Cannes / Saint-Tropez — Côte d'Azur",
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
      seoTitle: 'Yacht & Villa Concierge Coordinator — Cannes / Saint-Tropez | Misana Group',
      metaDescription:
        'Coordinate yacht charters and villa stays for Misana guests between Cannes and Saint-Tropez. Full-time, French Riviera. Apply now.',
      kicker: 'On the water',
      intro:
        'Misana orchestrates yacht charters and villa stays across the French Riviera for guests who do not want to manage logistics. We are looking for a Coordinator who holds the file from first request to last return, without the guest needing to follow up once.',
      aboutRole: [
        'As Yacht & Villa Concierge Coordinator, you manage the operational side of yacht charters and villa bookings for Misana guests. You liaise with yacht management companies and brokers across the ports of Cannes, Antibes, and Saint-Tropez, and with villa owners and rental agencies between Cap-Ferrat and Ramatuelle.',
        'Each guest file runs from initial brief through provider selection, contract coordination, crew provisioning, and on-water or on-property support during the stay. You hold the file, not the guest. The guest should never have to call twice to get the same answer.',
        'In peak season, you manage three to six active files simultaneously. Priorities shift daily — a weather window that changes a departure, a crew member replaced forty-eight hours out, a provisioning request received the morning of embarkation. You make these calls without escalating everything.',
        'You work in close coordination with the chauffeur and helicopter teams for port transfers and inter-destination movements. The corridor from Nice airport to Saint-Tropez via Cannes is the daily geography.',
      ],
      expectations: [
        'Two to four years in yacht charter operations, marina management, luxury villa coordination, or high-end travel management',
        'Practical knowledge of the ports and anchorages between Cannes and Saint-Tropez: Vieux-Port de Cannes, Port Vauban, Port de Saint-Tropez',
        'Strong vendor coordination skills: you manage brokers, crew, provisioners, and property managers without creating chaos',
        'Fluent English and French. Italian is a working advantage in this corridor',
        'High availability during peak season: May to September. The role is not nine to five in high summer',
        'Reliable under operational pressure: when three things go wrong on the same morning, you fix them in sequence without drama',
        'Driving licence and comfort navigating the Var and Alpes-Maritimes departments',
      ],
      offer: [
        'Full-time permanent contract (CDI), €32,000 to €42,000 depending on experience',
        'A role with direct operational impact: the guest experience you deliver is the product',
        'Season access to the ports and properties you coordinate — you know the product from the inside',
        'Close-knit team with direct lines to the founder. No corporate layers',
        'Participation in provider selection and relationship building — not just execution of a fixed list',
        'Potential to grow into a senior operations role as the yacht and villa service scales in V2',
      ],
      aboutCompany:
        'Misana is a private services house operating across the French Riviera, from Saint-Tropez to Menton. We orchestrate chauffeur, helicopter, yacht, car rental, and access to the right tables and addresses. The yacht and villa services are expanding in V2, and this coordinator role is the operational foundation for that growth.',
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
      seoTitle: "Coordinateur Conciergerie Yacht & Villas — Cannes / Saint-Tropez | Misana Group",
      metaDescription:
        "Coordonnez les locations de yachts et séjours en villa pour les clients Misana entre Cannes et Saint-Tropez. CDI, Côte d'Azur. Postulez.",
      kicker: "Sur l'eau",
      intro:
        "Misana orchestre des locations de yachts et des séjours en villa sur la Côte d'Azur pour des clients qui ne veulent pas gérer la logistique. Nous recherchons un Coordinateur qui tient le dossier de la première demande au dernier retour, sans que le client ait besoin de relancer une seule fois.",
      aboutRole: [
        "En tant que Coordinateur Conciergerie Yacht & Villas, vous gérez le volet opérationnel des locations de yachts et des réservations de villas pour les clients Misana. Vous êtes en liaison avec les sociétés de gestion et courtiers yacht dans les ports de Cannes, Antibes et Saint-Tropez, et avec les propriétaires de villas et agences de location entre Cap-Ferrat et Ramatuelle.",
        "Chaque dossier client va du brief initial jusqu'à la sélection du prestataire, la coordination des contrats, l'approvisionnement de l'équipage et le suivi sur l'eau ou sur site pendant le séjour. Vous tenez le dossier, pas le client. Le client ne devrait jamais avoir à appeler deux fois pour obtenir la même réponse.",
        "En haute saison, vous gérez trois à six dossiers actifs simultanément. Les priorités changent quotidiennement — une fenêtre météo qui modifie un départ, un membre d'équipage remplacé quarante-huit heures avant, une demande d'approvisionnement reçue le matin de l'embarquement. Vous prenez ces décisions sans tout escalader.",
        "Vous travaillez en étroite coordination avec les équipes chauffeur et hélicoptère pour les transferts portuaires et les déplacements inter-destinations. Le corridor de l'aéroport de Nice à Saint-Tropez via Cannes est la géographie quotidienne.",
      ],
      expectations: [
        "Deux à quatre ans dans les opérations de location de yachts, la gestion de marina, la coordination de villas de luxe ou la gestion de voyages haut de gamme",
        "Connaissance pratique des ports et mouillages entre Cannes et Saint-Tropez : Vieux-Port de Cannes, Port Vauban, Port de Saint-Tropez",
        "Solides compétences en coordination prestataires : vous gérez courtiers, équipages, approvisionneurs et gestionnaires de biens sans créer le chaos",
        "Anglais et français courants. L'italien est un avantage opérationnel sur ce corridor",
        "Forte disponibilité en haute saison : mai à septembre. Le poste n'est pas 9h-18h en plein été",
        "Fiable sous pression opérationnelle : quand trois choses se déroulent en même temps le matin, vous les réglez en séquence sans drame",
        "Permis de conduire et aisance pour naviguer dans le Var et les Alpes-Maritimes",
      ],
      offer: [
        "CDI, 32 000 à 42 000 € selon l'expérience",
        "Un rôle à impact opérationnel direct : l'expérience client que vous délivrez est le produit",
        "Accès saisonnier aux ports et propriétés que vous coordonnez — vous connaissez le produit de l'intérieur",
        "Équipe resserrée avec des lignes directes vers le fondateur. Aucune strate corporate",
        "Participation à la sélection des prestataires et à la construction des relations — pas seulement l'exécution d'une liste fixe",
        "Potentiel d'évolution vers un poste d'opérations senior à mesure que le service yacht et villa se développe en V2",
      ],
      aboutCompany:
        "Misana est une maison de services privés opérant sur la Côte d'Azur, de Saint-Tropez à Menton. Nous orchestrons chauffeur, hélicoptère, yacht, location de voitures et accès aux bonnes tables et adresses. Les services yacht et villa se développent en V2, et ce poste de coordinateur est le fondement opérationnel de cette croissance.",
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
