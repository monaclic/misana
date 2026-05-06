// 301 permanent redirects des anciens slugs vers les nouveaux.
// Preserve le SEO et evite les 404 sur d'anciens liens externes ou caches.
//
// Historique :
// - V1 : /services/<X>  ->  /<X>
// - V2 : /<X>           ->  /<long-keyword-slug> (SEO optim)
//
// Conserve query string et segments dynamiques.

const REDIRECTS: { from: RegExp; to: string }[] = [
  // === V2 : EN slugs courts -> longs SEO (i18n strategy=prefix donc /en/X) ===
  // /en/cars -> /en/car-rental
  { from: /^\/en\/cars\/all\/?$/, to: '/en/car-rental/all' },
  { from: /^\/en\/cars\/([^/]+)\/?$/, to: '/en/car-rental/$1' },
  { from: /^\/en\/cars\/?$/, to: '/en/car-rental' },
  // /en/yacht -> /en/yacht-charter
  { from: /^\/en\/yacht\/all\/?$/, to: '/en/yacht-charter/all' },
  { from: /^\/en\/yacht\/([^/]+)\/?$/, to: '/en/yacht-charter/$1' },
  { from: /^\/en\/yacht\/?$/, to: '/en/yacht-charter' },
  // /en/chauffeur -> /en/private-chauffeur
  { from: /^\/en\/chauffeur\/?$/, to: '/en/private-chauffeur' },
  // /en/helicopter -> /en/helicopter-transfer
  { from: /^\/en\/helicopter\/?$/, to: '/en/helicopter-transfer' },
  // /en/access -> /en/reservations
  { from: /^\/en\/access\/([^/]+)\/?$/, to: '/en/reservations/$1' },
  { from: /^\/en\/access\/?$/, to: '/en/reservations' },

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

  // === V1 legacy : /en/services/* -> nouveaux slugs longs SEO ===
  { from: /^\/en\/services\/cars\/all\/?$/, to: '/en/car-rental/all' },
  { from: /^\/en\/services\/cars\/([^/]+)\/?$/, to: '/en/car-rental/$1' },
  { from: /^\/en\/services\/cars\/?$/, to: '/en/car-rental' },
  { from: /^\/en\/services\/yacht\/all\/?$/, to: '/en/yacht-charter/all' },
  { from: /^\/en\/services\/yacht\/([^/]+)\/?$/, to: '/en/yacht-charter/$1' },
  { from: /^\/en\/services\/yacht\/?$/, to: '/en/yacht-charter' },
  { from: /^\/en\/services\/chauffeur\/?$/, to: '/en/private-chauffeur' },
  { from: /^\/en\/services\/helicopter\/?$/, to: '/en/helicopter-transfer' },
  { from: /^\/en\/services\/access\/([^/]+)\/?$/, to: '/en/reservations/$1' },
  { from: /^\/en\/services\/access\/?$/, to: '/en/reservations' },
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
