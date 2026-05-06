// Sitemap dynamique multilocale (en + fr) avec hreflang.
//
// V1 : sitemap RESTREINT volontairement aux pages indexables sures :
// header nav (home + 5 services + contact + about), footer legal
// (mentions/cgv/privacy/cookies).
//
// EXCLU intentionnellement :
//   - Listings catalogues (yacht/all, voitures/all) : query params filtrent
//   - Fiches produits (yacht/[slug], voitures/[slug], reservations/[slug])
//   - Destinations + fiches villes
//   - Events + fiches events
//   - Transfers + fiches routes
//   - /request (deja en robots:noindex)
// Ces pages seront re-indexees plus tard une fois le contenu valide.
import { SERVICE_URL_SEGMENT } from '~/lib/serviceRoutes';

const SITE_URL = 'https://misana-group.com';

type Entry = { en: string; fr: string; lastmod?: string; priority?: number };

function urlEntry(e: Entry): string {
  const loc_en = `${SITE_URL}/en${e.en}`;
  const loc_fr = `${SITE_URL}/fr${e.fr}`;
  const lastmod = e.lastmod ? `<lastmod>${e.lastmod}</lastmod>` : '';
  const priority = e.priority ? `<priority>${e.priority.toFixed(1)}</priority>` : '';
  return [
    `  <url>`,
    `    <loc>${loc_en}</loc>`,
    `    <xhtml:link rel="alternate" hreflang="en" href="${loc_en}"/>`,
    `    <xhtml:link rel="alternate" hreflang="fr" href="${loc_fr}"/>`,
    `    <xhtml:link rel="alternate" hreflang="x-default" href="${loc_en}"/>`,
    `    ${lastmod}${priority}`,
    `  </url>`,
    `  <url>`,
    `    <loc>${loc_fr}</loc>`,
    `    <xhtml:link rel="alternate" hreflang="en" href="${loc_en}"/>`,
    `    <xhtml:link rel="alternate" hreflang="fr" href="${loc_fr}"/>`,
    `    <xhtml:link rel="alternate" hreflang="x-default" href="${loc_en}"/>`,
    `    ${lastmod}${priority}`,
    `  </url>`,
  ].join('\n');
}

// Helper : entry mono-path identique FR/EN (ex /contact, /about, /legal/*).
function same(path: string, lastmod?: string, priority?: number): Entry {
  return { en: path, fr: path, lastmod, priority };
}

// Helper : entry pour service hub avec slug FR + EN distincts.
function svc(canonical: keyof typeof SERVICE_URL_SEGMENT, lastmod?: string, priority?: number): Entry {
  const seg = SERVICE_URL_SEGMENT[canonical];
  return { en: `/${seg.en}`, fr: `/${seg.fr}`, lastmod, priority };
}

export default defineEventHandler((event) => {
  const today = new Date().toISOString().slice(0, 10);
  const entries: Entry[] = [];

  // Homepage
  entries.push(same('/', today, 1.0));

  // About + Contact (header secondaire + footer)
  entries.push(same('/about', today, 0.8));
  entries.push(same('/contact', today, 0.9));

  // 5 hubs services (header nav principal)
  entries.push(svc('chauffeur', today, 0.9));
  entries.push(svc('cars', today, 0.9));
  entries.push(svc('yacht', today, 0.9));
  entries.push(svc('helicopter', today, 0.9));
  entries.push(svc('access', today, 0.9));

  // Legal (footer)
  entries.push(same('/legal/mentions', today, 0.3));
  entries.push(same('/legal/cgv', today, 0.3));
  entries.push(same('/legal/privacy', today, 0.3));
  entries.push(same('/legal/cookies', today, 0.3));

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...entries.map(urlEntry),
    '</urlset>',
  ].join('\n');

  setHeader(event, 'Content-Type', 'application/xml; charset=utf-8');
  return xml;
});
