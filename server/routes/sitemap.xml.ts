// Sitemap : uniquement les pages reellement LIEES depuis le site (zero
// orphelin, zero 404). Tout ce qui est ici est atteignable par un lien direct.
// - Home (1)
// - 5 hubs services (chauffeur, cars, yacht, helicopter, access) + hub villa
// - Listings catalogue : /villas/all, /cars/all, /yacht/all (lies depuis hubs)
// - Fiches produit (live Sanity, listees sur leur catalogue) :
//     villas, voitures (rentalCar), yachts, etablissements (accessEstablishment)
// - 6 fiches chauffeur + 6 fiches helicoptere (lies depuis leur hub)
//
// Chaque path est emis en 2 locales (en + fr) avec hreflang cross-locale.
// localize() reecrit le segment service vers son slug SEO localise.
//
// Exclus volontairement : about, contact, request, legal, destinations, events,
// et les cocons service x ville / service x event (pages orphelines, non liees
// depuis la nav/les hubs => hors sitemap tant qu'elles ne sont pas maillees).

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
  // villas : mapping localize() pour le hub, le listing et les fiches.
  villas:     { en: 'luxury-villa-rental', fr: 'location-villa-de-luxe' },
};
const SERVICE_HUBS = ['chauffeur', 'cars', 'yacht', 'helicopter', 'access'] as const;

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

  // 5 hubs services (villa exclu : hub = page future qui redirige)
  for (const canonical of SERVICE_HUBS) {
    entries.push({ path: `/${canonical}`, priority: 0.9 });
  }

  // Hub service villa + listing
  entries.push({ path: '/villas', priority: 0.9 });
  entries.push({ path: '/villas/all', priority: 0.8 });

  // 6 fiches helicopter-transfer prioritaires V1.
  // localize() reecrit `/helicopter/X` en `/helicopter-transfer/X` (EN) et
  // `/transfert-helicoptere/X` (FR), miroir des defineI18nRoute des pages.
  const HELICOPTER_ROUTES = [
    'nice-monaco',
    'nice-cannes',
    'nice-saint-tropez',
    'monaco-saint-tropez',
    'monaco-cannes',
    'cannes-saint-tropez',
  ];
  for (const slug of HELICOPTER_ROUTES) {
    entries.push({ path: `/helicopter/${slug}`, priority: 0.8 });
  }

  // 6 fiches chauffeur prioritaires V1.
  // localize() reecrit `/chauffeur/X` en `/private-chauffeur/X` (EN) et
  // `/chauffeur-prive/X` (FR).
  const CHAUFFEUR_FICHE_ROUTES = [
    'nice-airport-monaco',
    'nice-airport-cannes',
    'nice-airport-saint-tropez',
    'nice-airport-cap-ferrat',
    'cannes-saint-tropez',
    'saint-tropez-monaco',
  ];
  for (const slug of CHAUFFEUR_FICHE_ROUTES) {
    entries.push({ path: `/chauffeur/${slug}`, priority: 0.8 });
  }

  // Listings catalogue (lies depuis les hubs) : cars + yacht (villa/all deja
  // ajoute plus haut). localize() reecrit /cars/all -> /car-rental/all, etc.
  entries.push({ path: '/cars/all', priority: 0.8 });
  entries.push({ path: '/yacht/all', priority: 0.8 });

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

  // Fiches villa live depuis Sanity. Slug identique EN/FR (slugI18n.en.current).
  try {
    const villas = await sanityClient.fetch<Array<{ slug: string }>>(
      `*[_type == "villa" && published == true] | order(name asc) {
        "slug": slugI18n.en.current
      }`,
    );
    for (const v of villas) {
      if (v.slug) entries.push({ path: `/villas/${v.slug}`, priority: 0.7 });
    }
  } catch (err) {
    console.error('[sitemap] villa fetch failed:', err);
  }

  // Fiches voiture live depuis Sanity. localize() : /cars/X -> /car-rental/X.
  try {
    const cars = await sanityClient.fetch<Array<{ slug: string }>>(
      `*[_type == "rentalCar" && published == true] | order(order asc, brand asc) {
        "slug": slug.current
      }`,
    );
    for (const c of cars) {
      if (c.slug) entries.push({ path: `/cars/${c.slug}`, priority: 0.7 });
    }
  } catch (err) {
    console.error('[sitemap] cars fetch failed:', err);
  }

  // Fiches yacht live depuis Sanity. localize() : /yacht/X -> /yacht-charter/X.
  try {
    const yachts = await sanityClient.fetch<Array<{ slug: string }>>(
      `*[_type == "yacht" && published == true] | order(order asc, name asc) {
        "slug": slug.current
      }`,
    );
    for (const y of yachts) {
      if (y.slug) entries.push({ path: `/yacht/${y.slug}`, priority: 0.7 });
    }
  } catch (err) {
    console.error('[sitemap] yacht fetch failed:', err);
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
