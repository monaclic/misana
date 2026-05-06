// 301 permanent redirects des anciennes URLs /services/* vers les nouvelles
// URLs sans prefix /services/. Preserve le SEO et evite les 404.
//
// Conserve les query string et les segments dynamiques.

const REDIRECTS: { from: RegExp; to: string }[] = [
  // EN : /services/<service>/...  ->  /<service>/...
  { from: /^\/services\/cars\/all\/?$/, to: '/cars/all' },
  { from: /^\/services\/cars\/([^/]+)\/?$/, to: '/cars/$1' },
  { from: /^\/services\/cars\/?$/, to: '/cars' },
  { from: /^\/services\/yacht\/all\/?$/, to: '/yacht/all' },
  { from: /^\/services\/yacht\/([^/]+)\/?$/, to: '/yacht/$1' },
  { from: /^\/services\/yacht\/?$/, to: '/yacht' },
  { from: /^\/services\/chauffeur\/?$/, to: '/chauffeur' },
  { from: /^\/services\/helicopter\/?$/, to: '/helicopter' },
  { from: /^\/services\/access\/([^/]+)\/?$/, to: '/access/$1' },
  { from: /^\/services\/access\/?$/, to: '/access' },

  // FR : /fr/services/<slug>/...  ->  /fr/<slug>/...
  { from: /^\/fr\/services\/voitures\/all\/?$/, to: '/fr/voitures/all' },
  { from: /^\/fr\/services\/voitures\/([^/]+)\/?$/, to: '/fr/voitures/$1' },
  { from: /^\/fr\/services\/voitures\/?$/, to: '/fr/voitures' },
  { from: /^\/fr\/services\/cars\/all\/?$/, to: '/fr/voitures/all' },
  { from: /^\/fr\/services\/cars\/([^/]+)\/?$/, to: '/fr/voitures/$1' },
  { from: /^\/fr\/services\/cars\/?$/, to: '/fr/voitures' },
  { from: /^\/fr\/services\/yacht\/all\/?$/, to: '/fr/yacht/all' },
  { from: /^\/fr\/services\/yacht\/([^/]+)\/?$/, to: '/fr/yacht/$1' },
  { from: /^\/fr\/services\/yacht\/?$/, to: '/fr/yacht' },
  { from: /^\/fr\/services\/chauffeur\/?$/, to: '/fr/chauffeur' },
  { from: /^\/fr\/services\/helicoptere\/?$/, to: '/fr/helicoptere' },
  { from: /^\/fr\/services\/helicopter\/?$/, to: '/fr/helicoptere' },
  { from: /^\/fr\/services\/acces\/([^/]+)\/?$/, to: '/fr/acces/$1' },
  { from: /^\/fr\/services\/acces\/?$/, to: '/fr/acces' },
  { from: /^\/fr\/services\/access\/([^/]+)\/?$/, to: '/fr/acces/$1' },
  { from: /^\/fr\/services\/access\/?$/, to: '/fr/acces' },
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
