// Sitemap dynamique multilocale (en + fr) avec hreflang.
// Liste : homepage, hubs services, fiches dynamiques cars / yachts / access /
// transfers / events / destinations.
import { SERVICES, CITIES, EVENTS, ESTABLISHMENTS, TRANSFERS } from '~/lib/constants';
import { RENTAL_CARS } from '~/lib/rentalCars';
import { YACHTS } from '~/lib/yachts';

const SITE_URL = 'https://misana.com';

type Entry = { path: string; lastmod?: string; priority?: number };

function urlEntry(e: Entry): string {
  const loc_en = `${SITE_URL}/en${e.path}`;
  const loc_fr = `${SITE_URL}/fr${e.path}`;
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

  // Cars catalog
  for (const c of RENTAL_CARS) {
    entries.push({ path: `/services/cars/${c.id}`, lastmod: today, priority: 0.7 });
  }

  // Yachts catalog
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
