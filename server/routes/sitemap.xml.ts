// Sitemap restreint aux pages production-ready :
// - Home (1)
// - 5 hubs services (chauffeur, cars, yacht, helicopter, access)
// - 32 fiches access (fetch live Sanity)
//
// 38 paths x 2 locales (en + fr) = 76 URLs, avec hreflang cross-locale.
//
// Pages exclues volontairement : about, contact, request, legal, destinations,
// events, transfers, cars-catalog, yacht-catalog (stubs ou WIP).

import { createClient } from '@sanity/client';

const SITE_URL = 'https://misana-group.com';

type Entry = { path: string; priority?: number };

// Canonical slug (id route) -> public slug par locale (SEO).
// Source de verite : feat(seo): SEO-optimized slugs for service hubs (EN+FR).
const HUB_SLUGS: Record<string, { en: string; fr: string }> = {
  chauffeur:  { en: 'private-chauffeur', fr: 'chauffeur-prive' },
  cars:       { en: 'car-rental',        fr: 'location-voiture' },
  yacht:      { en: 'yacht-charter',     fr: 'location-yacht' },
  helicopter: { en: 'helicopter-transfer', fr: 'transfert-helicoptere' },
  access:     { en: 'reservations',      fr: 'reservations' },
};

function localize(path: string, locale: 'en' | 'fr'): string {
  // /chauffeur -> /private-chauffeur (en) ou /chauffeur-prive (fr)
  // /chauffeur/foo -> /private-chauffeur/foo
  // Le slug 'access' -> 'reservations' identique dans les 2 langues.
  for (const [canonical, slugs] of Object.entries(HUB_SLUGS)) {
    const re = new RegExp(`^/${canonical}(/|$)`);
    if (re.test(path)) return path.replace(re, `/${slugs[locale]}$1`);
  }
  return path;
}

function urlEntry(e: Entry, lastmod: string): string {
  const loc_en = `${SITE_URL}/en${localize(e.path, 'en')}`;
  const loc_fr = `${SITE_URL}/fr${localize(e.path, 'fr')}`;
  const priority = e.priority ? `<priority>${e.priority.toFixed(1)}</priority>` : '';
  // 2 entries (en + fr), chacune declarant ses 2 alternates + x-default vers EN.
  return [
    `  <url>`,
    `    <loc>${loc_en}</loc>`,
    `    <xhtml:link rel="alternate" hreflang="en" href="${loc_en}"/>`,
    `    <xhtml:link rel="alternate" hreflang="fr" href="${loc_fr}"/>`,
    `    <xhtml:link rel="alternate" hreflang="x-default" href="${loc_en}"/>`,
    `    <lastmod>${lastmod}</lastmod>${priority}`,
    `  </url>`,
    `  <url>`,
    `    <loc>${loc_fr}</loc>`,
    `    <xhtml:link rel="alternate" hreflang="en" href="${loc_en}"/>`,
    `    <xhtml:link rel="alternate" hreflang="fr" href="${loc_fr}"/>`,
    `    <xhtml:link rel="alternate" hreflang="x-default" href="${loc_en}"/>`,
    `    <lastmod>${lastmod}</lastmod>${priority}`,
    `  </url>`,
  ].join('\n');
}

// Sanity client server-side (anonyme, lit la dataset publique).
const sanityClient = createClient({
  projectId: 'akpi9bfm',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: true,
});

export default defineEventHandler(async (event) => {
  const today = new Date().toISOString().slice(0, 10);
  const entries: Entry[] = [];

  // Home
  entries.push({ path: '/', priority: 1.0 });

  // 5 hubs services
  for (const canonical of Object.keys(HUB_SLUGS)) {
    entries.push({ path: `/${canonical}`, priority: 0.9 });
  }

  // 4 fiches helicopter-transfer prioritaires V1.
  // localize() reecrit `/helicopter/X` en `/helicopter-transfer/X` (EN) et
  // `/transfert-helicoptere/X` (FR), miroir des defineI18nRoute des pages.
  const HELICOPTER_ROUTES = [
    'nice-monaco',
    'nice-cannes',
    'nice-saint-tropez',
    'monaco-saint-tropez',
  ];
  for (const slug of HELICOPTER_ROUTES) {
    entries.push({ path: `/helicopter/${slug}`, priority: 0.8 });
  }

  // Fiches access live depuis Sanity
  try {
    const fiches = await sanityClient.fetch<Array<{ slug: string }>>(
      `*[_type == "accessEstablishment" && published == true] | order(name asc) {
        "slug": slug.current
      }`,
    );
    for (const f of fiches) {
      if (f.slug) entries.push({ path: `/access/${f.slug}`, priority: 0.7 });
    }
  } catch (err) {
    // Si Sanity tombe, on serve le sitemap des hubs + home plutot que de 500.
    console.error('[sitemap] Sanity fetch failed:', err);
  }

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...entries.map((e) => urlEntry(e, today)),
    '</urlset>',
  ].join('\n');

  setHeader(event, 'Content-Type', 'application/xml; charset=utf-8');
  return xml;
});
