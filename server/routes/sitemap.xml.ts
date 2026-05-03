// Sitemap dynamique multilocale (en + fr) avec hreflang.
// Liste : homepage, hubs services, fiches dynamiques cars / yachts / access /
// transfers / events / destinations.
import { SERVICES, CITIES, EVENTS, ESTABLISHMENTS, TRANSFERS } from '~/lib/constants';
import { RENTAL_CARS, RENTAL_CATEGORIES, rentalBrands } from '~/lib/rentalCars';
import { YACHTS } from '~/lib/yachts';
import { YACHT_SIZES } from '~/types/request';

const SITE_URL = 'https://misana.com';

type Entry = { path: string; lastmod?: string; priority?: number };

// Slugs FR localises : on remappe le path EN canonique vers son
// equivalent FR. Tout le reste du chemin (segments dynamiques,
// query string) est preserve.
const FR_SLUG_MAP: { from: RegExp; to: string }[] = [
  { from: /^\/services\/cars\b/, to: '/services/voitures' },
  { from: /^\/services\/helicopter\b/, to: '/services/helicoptere' },
  { from: /^\/services\/access\b/, to: '/services/acces' },
];

function localizeFr(path: string): string {
  for (const r of FR_SLUG_MAP) if (r.from.test(path)) return path.replace(r.from, r.to);
  return path;
}

function urlEntry(e: Entry): string {
  const loc_en = `${SITE_URL}/en${e.path}`;
  const loc_fr = `${SITE_URL}/fr${localizeFr(e.path)}`;
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

export default defineEventHandler((event) => {
  const today = new Date().toISOString().slice(0, 10);
  const entries: Entry[] = [];

  // Homepage
  entries.push({ path: '/', lastmod: today, priority: 1.0 });

  // About + Contact + Request
  entries.push({ path: '/about', lastmod: today, priority: 0.8 });
  entries.push({ path: '/contact', lastmod: today, priority: 0.7 });
  entries.push({ path: '/request', lastmod: today, priority: 0.9 });

  // Hub services
  for (const s of SERVICES) {
    entries.push({ path: `/services/${s.slug}`, lastmod: today, priority: 0.9 });
  }

  // Hub destinations + city pages
  entries.push({ path: '/destinations', lastmod: today, priority: 0.8 });
  for (const c of CITIES) {
    entries.push({ path: `/destinations/${c.slug}`, lastmod: today, priority: 0.8 });
  }

  // Hub events + event pages
  entries.push({ path: '/events', lastmod: today, priority: 0.7 });
  for (const e of EVENTS) {
    entries.push({ path: `/events/${e.slug}`, lastmod: today, priority: 0.7 });
  }

  // Transfers
  entries.push({ path: '/transfers', lastmod: today, priority: 0.7 });
  for (const t of TRANSFERS) {
    entries.push({ path: `/transfers/${t.slug}`, lastmod: today, priority: 0.7 });
  }

  // Cars : full catalog + canonical filtered URLs
  entries.push({ path: '/services/cars/all', lastmod: today, priority: 0.85 });
  for (const cat of RENTAL_CATEGORIES) {
    entries.push({ path: `/services/cars/all?category=${cat.id}`, lastmod: today, priority: 0.8 });
  }
  for (const brand of rentalBrands()) {
    const slug = brand.toLowerCase().replace(/\s+/g, '-');
    entries.push({ path: `/services/cars/all?brand=${slug}`, lastmod: today, priority: 0.75 });
  }
  for (const c of RENTAL_CARS) {
    entries.push({ path: `/services/cars/${c.id}`, lastmod: today, priority: 0.7 });
  }

  // Yachts : full catalog + canonical filtered URLs
  entries.push({ path: '/services/yacht/all', lastmod: today, priority: 0.85 });
  for (const size of YACHT_SIZES) {
    entries.push({ path: `/services/yacht/all?size=${encodeURIComponent(size)}`, lastmod: today, priority: 0.8 });
  }
  for (const type of ['motor', 'sail', 'catamaran']) {
    entries.push({ path: `/services/yacht/all?type=${type}`, lastmod: today, priority: 0.8 });
  }
  for (const port of ['cannes', 'monaco', 'saint-tropez']) {
    entries.push({ path: `/services/yacht/all?port=${port}`, lastmod: today, priority: 0.8 });
  }
  for (const y of YACHTS) {
    entries.push({ path: `/services/yacht/${y.id}`, lastmod: today, priority: 0.7 });
  }

  // Access establishments
  for (const e of ESTABLISHMENTS) {
    entries.push({ path: `/services/access/${e.slug}`, lastmod: today, priority: 0.6 });
  }

  // Legal
  entries.push({ path: '/legal/privacy', lastmod: today, priority: 0.3 });
  entries.push({ path: '/legal/terms', lastmod: today, priority: 0.3 });

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...entries.map(urlEntry),
    '</urlset>',
  ].join('\n');

  setHeader(event, 'Content-Type', 'application/xml; charset=utf-8');
  return xml;
});
