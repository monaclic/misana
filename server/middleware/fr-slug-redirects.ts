// 301 permanent redirects des anciens slugs FR (anglais) vers les nouveaux
// slugs FR localises. Preserve le SEO et evite les 404 sur les vieux liens.
//
// Conserve les query string et les segments dynamiques.

const REDIRECTS: { from: RegExp; to: string }[] = [
  { from: /^\/fr\/services\/cars\/all\/?$/, to: '/fr/services/voitures/all' },
  {
    from: /^\/fr\/services\/cars\/([^/]+)\/?$/,
    to: '/fr/services/voitures/$1',
  },
  { from: /^\/fr\/services\/cars\/?$/, to: '/fr/services/voitures' },
  { from: /^\/fr\/services\/helicopter\/?$/, to: '/fr/services/helicoptere' },
  {
    from: /^\/fr\/services\/access\/([^/]+)\/?$/,
    to: '/fr/services/acces/$1',
  },
  { from: /^\/fr\/services\/access\/?$/, to: '/fr/services/acces' },
];

export default defineEventHandler((event) => {
  const url = event.node.req.url || '';
  const [pathname, search = ''] = url.split('?');
  for (const r of REDIRECTS) {
    const match = pathname.match(r.from);
    if (match) {
      const target = pathname.replace(r.from, r.to) + (search ? `?${search}` : '');
      return sendRedirect(event, target, 301);
    }
  }
});
