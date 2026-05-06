// 301 permanent redirects des anciens slugs vers les nouveaux.
// Preserve le SEO et evite les 404 sur d'anciens liens externes ou caches.
//
// Historique :
// - V1 : /services/<X>  ->  /<X>
// - V2 : /<X>           ->  /<long-keyword-slug> (SEO optim)
//
// Conserve query string et segments dynamiques.

const REDIRECTS: { from: RegExp; to: string }[] = [
  // === V2 : EN slugs courts -> longs SEO ===
  // /cars -> /car-rental
  { from: /^\/cars\/all\/?$/, to: '/car-rental/all' },
  { from: /^\/cars\/([^/]+)\/?$/, to: '/car-rental/$1' },
  { from: /^\/cars\/?$/, to: '/car-rental' },
  // /yacht -> /yacht-charter
  { from: /^\/yacht\/all\/?$/, to: '/yacht-charter/all' },
  { from: /^\/yacht\/([^/]+)\/?$/, to: '/yacht-charter/$1' },
  { from: /^\/yacht\/?$/, to: '/yacht-charter' },
  // /chauffeur -> /private-chauffeur
  { from: /^\/chauffeur\/?$/, to: '/private-chauffeur' },
  // /helicopter -> /helicopter-transfer
  { from: /^\/helicopter\/?$/, to: '/helicopter-transfer' },
  // /access -> /reservations
  { from: /^\/access\/([^/]+)\/?$/, to: '/reservations/$1' },
  { from: /^\/access\/?$/, to: '/reservations' },

  // === V2 : FR slugs courts -> longs SEO ===
  // /fr/voitures -> /fr/location-voiture
  { from: /^\/fr\/voitures\/all\/?$/, to: '/fr/location-voiture/all' },
  { from: /^\/fr\/voitures\/([^/]+)\/?$/, to: '/fr/location-voiture/$1' },
  { from: /^\/fr\/voitures\/?$/, to: '/fr/location-voiture' },
  // /fr/yacht -> /fr/location-yacht
  { from: /^\/fr\/yacht\/all\/?$/, to: '/fr/location-yacht/all' },
  { from: /^\/fr\/yacht\/([^/]+)\/?$/, to: '/fr/location-yacht/$1' },
  { from: /^\/fr\/yacht\/?$/, to: '/fr/location-yacht' },
  // /fr/chauffeur -> /fr/chauffeur-prive
  { from: /^\/fr\/chauffeur\/?$/, to: '/fr/chauffeur-prive' },
  // /fr/helicoptere -> /fr/transfert-helicoptere
  { from: /^\/fr\/helicoptere\/?$/, to: '/fr/transfert-helicoptere' },
  // /fr/acces -> /fr/reservations
  { from: /^\/fr\/acces\/([^/]+)\/?$/, to: '/fr/reservations/$1' },
  { from: /^\/fr\/acces\/?$/, to: '/fr/reservations' },

  // === V1 legacy : /services/* -> nouveaux slugs longs SEO ===
  { from: /^\/services\/cars\/all\/?$/, to: '/car-rental/all' },
  { from: /^\/services\/cars\/([^/]+)\/?$/, to: '/car-rental/$1' },
  { from: /^\/services\/cars\/?$/, to: '/car-rental' },
  { from: /^\/services\/yacht\/all\/?$/, to: '/yacht-charter/all' },
  { from: /^\/services\/yacht\/([^/]+)\/?$/, to: '/yacht-charter/$1' },
  { from: /^\/services\/yacht\/?$/, to: '/yacht-charter' },
  { from: /^\/services\/chauffeur\/?$/, to: '/private-chauffeur' },
  { from: /^\/services\/helicopter\/?$/, to: '/helicopter-transfer' },
  { from: /^\/services\/access\/([^/]+)\/?$/, to: '/reservations/$1' },
  { from: /^\/services\/access\/?$/, to: '/reservations' },
  { from: /^\/fr\/services\/voitures\/all\/?$/, to: '/fr/location-voiture/all' },
  { from: /^\/fr\/services\/voitures\/([^/]+)\/?$/, to: '/fr/location-voiture/$1' },
  { from: /^\/fr\/services\/voitures\/?$/, to: '/fr/location-voiture' },
  { from: /^\/fr\/services\/yacht\/all\/?$/, to: '/fr/location-yacht/all' },
  { from: /^\/fr\/services\/yacht\/([^/]+)\/?$/, to: '/fr/location-yacht/$1' },
  { from: /^\/fr\/services\/yacht\/?$/, to: '/fr/location-yacht' },
  { from: /^\/fr\/services\/chauffeur\/?$/, to: '/fr/chauffeur-prive' },
  { from: /^\/fr\/services\/helicoptere\/?$/, to: '/fr/transfert-helicoptere' },
  { from: /^\/fr\/services\/helicopter\/?$/, to: '/fr/transfert-helicoptere' },
  { from: /^\/fr\/services\/acces\/([^/]+)\/?$/, to: '/fr/reservations/$1' },
  { from: /^\/fr\/services\/acces\/?$/, to: '/fr/reservations' },
];

export default defineEventHandler((event) => {
  const url = event.node.req.url || '';
  const parts = url.split('?');
  const pathname = parts[0] || '';
  const search = parts[1] || '';
  for (const r of REDIRECTS) {
    const match = pathname.match(r.from);
    if (match) {
      const target = pathname.replace(r.from, r.to) + (search ? `?${search}` : '');
      return sendRedirect(event, target, 301);
    }
  }
});
