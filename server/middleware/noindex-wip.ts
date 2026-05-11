// Marque les pages WIP / stub / non-retravaillees comme noindex via le
// header X-Robots-Tag. Google revisite ces pages, voit le header, et les
// supprime de l'index. Empeche aussi les nouvelles pages WIP d'etre indexees.
//
// IMPORTANT : ne pas combiner avec robots.txt Disallow pour ces memes paths.
// Si robots.txt bloque le crawl, Google ne voit jamais le X-Robots-Tag et
// les pages restent indexees. Le header noindex doit pouvoir etre lu.
//
// Pages KEEP indexed (production-ready) :
// - / (home)
// - /chauffeur-prive, /private-chauffeur, /chauffeur (hub)
// - /location-voiture, /car-rental, /cars (hub)
// - /location-yacht, /yacht-charter, /yacht (hub)
// - /transfert-helicoptere, /helicopter-transfer, /helicopter (hub)
// - /reservations (hub access)
// - /reservations/{slug} (32 fiches)
// - /legal/{mentions,cgv,privacy,cookies}
//
// Pages NOINDEX (WIP / stub) :
// - /services/* (ancienne structure de route)
// - /destinations, /destinations/*
// - /events, /events/*
// - /transfers, /transfers/*
// - /about, /contact
// - /cars/all, /cars/{model} (catalog WIP, hub /car-rental OK)
// - /yacht/all, /yacht/{id} (catalog WIP, hub /yacht-charter OK)
// - /request/thanks (page de confirmation, pas de valeur SEO)

const NOINDEX_PATTERNS: RegExp[] = [
  // Ancienne structure /services/...
  /^\/(en|fr)\/services(\/|$)/i,
  // Sections editoriales stub
  /^\/(en|fr)\/destinations(\/|$)/i,
  /^\/(en|fr)\/events(\/|$)/i,
  /^\/(en|fr)\/transfers(\/|$)/i,
  // Pages non retravaillees
  /^\/(en|fr)\/about(\/|$)/i,
  /^\/(en|fr)\/contact(\/|$)/i,
  // Cars : sub-paths catalog/detail (hub /car-rental ou /cars reste indexe)
  /^\/(en|fr)\/(cars|car-rental|location-voiture)\/.+$/i,
  // Yacht : idem
  /^\/(en|fr)\/(yacht|yacht-charter|location-yacht)\/.+$/i,
  // Confirmation /request
  /^\/(en|fr)\/request\/thanks(\/|$)/i,
];

export default defineEventHandler((event) => {
  const url = event.node.req.url || '';
  const path = url.split('?')[0];

  for (const re of NOINDEX_PATTERNS) {
    if (re.test(path)) {
      setHeader(event, 'X-Robots-Tag', 'noindex, follow');
      return;
    }
  }
});
