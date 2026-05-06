// Sitemap dynamique multilocale (en + fr) avec hreflang.
// Liste : homepage, hubs services, fiches dynamiques cars / yachts / access /
// transfers / events / destinations.
//
// Phase 2.6.3+ : plus de namespace /services/. Chaque service a un
// path FR et un path EN distincts (yacht/yacht-charter, voitures/luxury-cars,
// chauffeur/private-chauffeur, helicoptere/helicopter-transfers, reservations).
import { SERVICES, CITIES, EVENTS, ESTABLISHMENTS, TRANSFERS } from '~/lib/constants';
import { RENTAL_CARS, RENTAL_CATEGORIES, rentalBrands } from '~/lib/rentalCars';
import { YACHTS } from '~/lib/yachts';
import { YACHT_SIZES } from '~/types/request';
import { SERVICE_URL_SEGMENT } from '~/lib/serviceRoutes';

const SITE_URL = 'https://misana-group.com';

// Pour chaque entree on stocke les 2 paths (en + fr) explicitement.
// Aucune transformation regex : on construit les URL avec les segments
// localises de SERVICE_URL_SEGMENT.
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

// Helper : entry mono-path (FR == EN, ex /contact, /destinations, /events).
function same(path: string, lastmod?: string, priority?: number): Entry {
  return { en: path, fr: path, lastmod, priority };
}

// Helper : entry pour service hub (yacht, cars, chauffeur, helicopter, access).
function svc(canonical: keyof typeof SERVICE_URL_SEGMENT, suffix = '', lastmod?: string, priority?: number): Entry {
  const seg = SERVICE_URL_SEGMENT[canonical];
  return { en: `/${seg.en}${suffix}`, fr: `/${seg.fr}${suffix}`, lastmod, priority };
}

export default defineEventHandler((event) => {
  const today = new Date().toISOString().slice(0, 10);
  const entries: Entry[] = [];

  // Homepage
  entries.push(same('/', today, 1.0));

  // About + Contact + Request
  entries.push(same('/about', today, 0.8));
  entries.push(same('/contact', today, 0.7));
  entries.push({ en: '/request', fr: '/demande', lastmod: today, priority: 0.9 });

  // Hub services (yacht, cars, chauffeur, helicopter, access)
  entries.push(svc('chauffeur', '', today, 0.9));
  entries.push(svc('cars', '', today, 0.9));
  entries.push(svc('yacht', '', today, 0.9));
  entries.push(svc('helicopter', '', today, 0.9));
  entries.push(svc('access', '', today, 0.9));

  // Hub destinations + city pages
  entries.push(same('/destinations', today, 0.8));
  for (const c of CITIES) {
    entries.push(same(`/destinations/${c.slug}`, today, 0.8));
  }

  // Hub events + event pages (FR slug = /evenements)
  entries.push({ en: '/events', fr: '/evenements', lastmod: today, priority: 0.7 });
  for (const e of EVENTS) {
    entries.push({ en: `/events/${e.slug}`, fr: `/evenements/${e.slug}`, lastmod: today, priority: 0.7 });
  }

  // Transfers (FR == EN pour V1)
  entries.push(same('/transfers', today, 0.7));
  for (const t of TRANSFERS) {
    entries.push(same(`/transfers/${t.slug}`, today, 0.7));
  }

  // Cars : full catalog + canonical filtered URLs (en: /luxury-cars/all, fr: /voitures/tous)
  entries.push({ en: '/luxury-cars/all', fr: '/voitures/tous', lastmod: today, priority: 0.85 });
  for (const cat of RENTAL_CATEGORIES) {
    entries.push({ en: `/luxury-cars/all?category=${cat.id}`, fr: `/voitures/tous?category=${cat.id}`, lastmod: today, priority: 0.8 });
  }
  for (const brand of rentalBrands()) {
    const slug = brand.toLowerCase().replace(/\s+/g, '-');
    entries.push({ en: `/luxury-cars/all?brand=${slug}`, fr: `/voitures/tous?brand=${slug}`, lastmod: today, priority: 0.75 });
  }
  for (const c of RENTAL_CARS) {
    entries.push({ en: `/luxury-cars/${c.id}`, fr: `/voitures/${c.id}`, lastmod: today, priority: 0.7 });
  }

  // Yachts : full catalog + canonical filtered URLs
  entries.push({ en: '/yacht-charter/all', fr: '/yacht/tous', lastmod: today, priority: 0.85 });
  for (const size of YACHT_SIZES) {
    const q = `size=${encodeURIComponent(size)}`;
    entries.push({ en: `/yacht-charter/all?${q}`, fr: `/yacht/tous?${q}`, lastmod: today, priority: 0.8 });
  }
  for (const type of ['motor', 'sail', 'catamaran']) {
    entries.push({ en: `/yacht-charter/all?type=${type}`, fr: `/yacht/tous?type=${type}`, lastmod: today, priority: 0.8 });
  }
  for (const port of ['cannes', 'monaco', 'saint-tropez']) {
    entries.push({ en: `/yacht-charter/all?port=${port}`, fr: `/yacht/tous?port=${port}`, lastmod: today, priority: 0.8 });
  }
  for (const y of YACHTS) {
    entries.push({ en: `/yacht-charter/${y.id}`, fr: `/yacht/${y.id}`, lastmod: today, priority: 0.7 });
  }

  // Access establishments (FR == EN slug, segment hub differe pas vraiment)
  for (const e of ESTABLISHMENTS) {
    entries.push(same(`/reservations/${e.slug}`, today, 0.6));
  }

  // Legal
  entries.push(same('/legal/privacy', today, 0.3));
  entries.push(same('/legal/terms', today, 0.3));

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...entries.map(urlEntry),
    '</urlset>',
  ].join('\n');

  setHeader(event, 'Content-Type', 'application/xml; charset=utf-8');
  return xml;
});
