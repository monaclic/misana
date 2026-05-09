/**
 * Scrape Excellence Riviera fiches → JSON Sanity-ready.
 *
 * Lit scripts/excellence-urls.json, fetch chaque URL FR + EN equivalent,
 * extrait les champs informationnels (name, address, type, ambiance, cuisine,
 * description, max 4 photos), produit scripts/output/establishments.json.
 *
 * Champs Misana proprietaires (shortLine, signatureTags, occasions, aboutText,
 * horaires, tenue, teamNotes, faq) sont laisses VIDES : ils seront remplis a
 * la main dans Sanity Studio.
 *
 * Champs explicitement exclus (jamais scrapes) :
 *   - telephone, site officiel, Google Maps, reseaux sociaux, logo etablissement
 *
 * Usage : pnpm tsx scripts/scrape-excellence.ts
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPO_ROOT = join(__dirname, '..');

const URLS_FILE = join(REPO_ROOT, 'scripts/excellence-urls.json');
const OUT_DIR = join(REPO_ROOT, 'scripts/output');
const OUT_FILE = join(OUT_DIR, 'establishments.json');
const ERR_FILE = join(OUT_DIR, 'scraping-errors.json');

const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

const FETCH_DELAY_MS = 1000;
const MAX_ERRORS = 5;
const MAX_IMAGES = 4;

type UrlEntry = {
  url: string;
  city: string;
  category: 'restaurant' | 'beach-club' | 'nightclub';
  misanaSlug: string;
};

type LocalizedString = { fr: string; en: string };
type LocalizedStringArray = { fr: string[]; en: string[] };
type LocalizedFaq = { fr: { question: string; answer: string }[]; en: { question: string; answer: string }[] };

type EstablishmentDoc = {
  _type: 'establishment';
  _id: string;
  name: string;
  city: string;
  category: 'restaurant' | 'beach-club' | 'nightclub';
  // Champs proprietaires Misana (vides apres scraping, remplis manuellement)
  shortLine: LocalizedString;
  signatureTags: LocalizedStringArray;
  occasions: LocalizedStringArray;
  aboutText: LocalizedString;
  longDescription: LocalizedString;
  horaires: LocalizedString;
  tenue: LocalizedString;
  teamNotes: LocalizedString;
  faq: LocalizedFaq;
  slug: { _type: 'slug'; current: string };
  // Donnees scrapees Excellence
  address: string;
  ambiance: string[];
  cuisineType: string[];
  establishmentType: string;
  imageUrls: string[];
  excellenceSourceUrl: string;
  scrapedAt: string;
};

type ScrapingError = {
  url: string;
  misanaSlug: string;
  error: string;
  timestamp: string;
};

function decodeHtmlEntities(s: string): string {
  return s
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(parseInt(d, 10)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)));
}

function stripTags(s: string): string {
  return s.replace(/<[^>]+>/g, '');
}

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      'User-Agent': USER_AGENT,
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return await res.text();
}

// Extrait la valeur d'une section "exnc-post-info__section" par son label.
// Pattern HTML :
//   <div class="exnc-post-info__section">
//     <p class="exnc-post-info__title"> LABEL</p>
//     <div class="exnc-post-info__section-content"> VALUE</div>
//   </div>
function extractSection(html: string, labelPattern: RegExp): string | null {
  const sectionRe = /<div class="exnc-post-info__section"[^>]*>\s*<p class="exnc-post-info__title"[^>]*>\s*([^<]+?)\s*<\/p>\s*<div class="exnc-post-info__section-content"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/g;
  let m: RegExpExecArray | null;
  while ((m = sectionRe.exec(html)) !== null) {
    const label = decodeHtmlEntities(m[1].trim());
    if (labelPattern.test(label)) return m[2];
  }
  return null;
}

function extractName(html: string): string {
  const m = html.match(/<h1[^>]*class="[^"]*exnc-post-info__heading[^"]*"[^>]*>\s*([^<]+?)\s*<\/h1>/);
  return m ? decodeHtmlEntities(m[1]).trim() : '';
}

function extractAddress(html: string): string {
  const raw = extractSection(html, /^Adresse$/i);
  if (!raw) return '';
  // Preserve les retours a la ligne (<br/> -> \n)
  const withBreaks = raw.replace(/<br\s*\/?>/gi, '\n');
  return decodeHtmlEntities(stripTags(withBreaks))
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .join('\n');
}

function extractCommaList(html: string, labelPattern: RegExp): string[] {
  const raw = extractSection(html, labelPattern);
  if (!raw) return [];
  const text = decodeHtmlEntities(stripTags(raw)).trim();
  if (!text) return [];
  return text
    .split(/,/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function extractEstablishmentType(html: string): string {
  const raw = extractSection(html, /Type d.+tablissement/i);
  if (!raw) return '';
  return decodeHtmlEntities(stripTags(raw)).trim();
}

// Description : contenu de div.exnc-post-description__content. Souvent vide
// ou minimal sur Excellence (juste un credit photo). On extrait ce qui est
// la, le reste sera ajoute manuellement.
function extractLongDescription(html: string): string {
  const m = html.match(
    /<div class="exnc-post-description__content"[^>]*>([\s\S]*?)<\/div>\s*<div class="more-btn-holder"/,
  );
  if (!m) return '';
  // Preserver les paragraphes en double-newline
  const paras = m[1].match(/<p[^>]*>([\s\S]*?)<\/p>/g) || [];
  const texts = paras
    .map((p) => decodeHtmlEntities(stripTags(p)).trim())
    .filter(Boolean);
  return texts.join('\n\n');
}

// Galerie : recherche les images sous /wp-content/uploads/ avec le slug du
// post dans le nom. Filtre les icones/logos generiques. Dedupe + limite a 4.
function extractGalleryImages(html: string, misanaSlug: string): string[] {
  // Regex permissive : toute image wp-content/uploads recente avec un nom
  // qui ressemble au slug. Excellence numerote {category}-{slug}-N.jpg.
  const all = Array.from(
    html.matchAll(/src="(https:\/\/excellenceriviera\.com\/wp-content\/uploads\/[^"]+\.(?:jpg|jpeg|png|webp))"/gi),
  ).map((m) => m[1]);

  const slugWords = misanaSlug.split('-').filter((w) => w.length > 2);
  const isLikelyGallery = (url: string): boolean => {
    const lower = url.toLowerCase();
    // Exclure logos/icones/banners generiques
    if (/logo|favicon|\/ic\d+\.png|placeholder|banner/.test(lower)) return false;
    if (/(?:location-villa|location-yacht|hotel-luxe|location-voiture|transfert|plage-privee)/i.test(lower)) return false;
    // Privilegie images dont l'URL contient un mot du slug
    if (slugWords.some((w) => lower.includes(w))) return true;
    // Sinon : images recentes (>= 2024)
    return /\/uploads\/202[4-9]\//.test(lower);
  };

  const seen = new Set<string>();
  const out: string[] = [];
  for (const u of all) {
    if (out.length >= MAX_IMAGES) break;
    if (seen.has(u)) continue;
    seen.add(u);
    if (isLikelyGallery(u)) out.push(u);
  }
  return out;
}

async function scrapeOne(entry: UrlEntry): Promise<EstablishmentDoc> {
  // FR
  const htmlFr = await fetchHtml(entry.url);
  const name = extractName(htmlFr);
  if (!name) throw new Error(`Empty name extracted from ${entry.url}`);

  const address = extractAddress(htmlFr);
  const establishmentType = extractEstablishmentType(htmlFr);
  const ambiance = extractCommaList(htmlFr, /^Ambiance$/i);
  const cuisineType = extractCommaList(htmlFr, /Type de cuisine/i);
  const longDescriptionFr = extractLongDescription(htmlFr);
  const imageUrls = extractGalleryImages(htmlFr, entry.misanaSlug);

  // EN — meme URL avec /discover/ a la place de /fr/decouvrir/
  await sleep(FETCH_DELAY_MS);
  const enUrl = entry.url.replace('/fr/decouvrir/', '/discover/');
  let longDescriptionEn = '';
  try {
    const htmlEn = await fetchHtml(enUrl);
    longDescriptionEn = extractLongDescription(htmlEn);
  } catch (e) {
    // EN absent : pas bloquant, on continue avec FR uniquement
    console.warn(`  ⚠ EN version unavailable for ${entry.misanaSlug} (${(e as Error).message})`);
  }

  return {
    _type: 'establishment',
    _id: entry.misanaSlug,
    name,
    city: entry.city,
    category: entry.category,
    shortLine: { fr: '', en: '' },
    signatureTags: { fr: [], en: [] },
    occasions: { fr: [], en: [] },
    aboutText: { fr: '', en: '' },
    longDescription: { fr: longDescriptionFr, en: longDescriptionEn },
    horaires: { fr: '', en: '' },
    tenue: { fr: '', en: '' },
    teamNotes: { fr: '', en: '' },
    faq: { fr: [], en: [] },
    slug: { _type: 'slug', current: entry.misanaSlug },
    address,
    ambiance,
    cuisineType,
    establishmentType,
    imageUrls,
    excellenceSourceUrl: entry.url,
    scrapedAt: new Date().toISOString(),
  };
}

async function main() {
  const raw = await readFile(URLS_FILE, 'utf-8');
  const grouped = JSON.parse(raw) as Record<string, UrlEntry[]>;
  const allEntries: UrlEntry[] = Object.values(grouped).flat();

  console.log(`\nScraping ${allEntries.length} establishments from Excellence Riviera...\n`);

  await mkdir(OUT_DIR, { recursive: true });

  const docs: EstablishmentDoc[] = [];
  const errors: ScrapingError[] = [];

  for (let i = 0; i < allEntries.length; i++) {
    const entry = allEntries[i];
    const prefix = `[${i + 1}/${allEntries.length}] ${entry.misanaSlug}`;
    try {
      console.log(`${prefix} ...`);
      const doc = await scrapeOne(entry);
      docs.push(doc);
      console.log(
        `  ✓ "${doc.name}" — ${doc.imageUrls.length} images, ` +
          `${doc.ambiance.length} ambiance, ${doc.cuisineType.length} cuisine`,
      );
    } catch (e) {
      const msg = (e as Error).message;
      console.error(`  ✗ ${msg}`);
      errors.push({
        url: entry.url,
        misanaSlug: entry.misanaSlug,
        error: msg,
        timestamp: new Date().toISOString(),
      });
      if (errors.length > MAX_ERRORS) {
        console.error(`\n❌ More than ${MAX_ERRORS} errors. Stopping. Check ${ERR_FILE}.`);
        break;
      }
    }
    await sleep(FETCH_DELAY_MS);
  }

  await writeFile(OUT_FILE, JSON.stringify(docs, null, 2), 'utf-8');
  await writeFile(ERR_FILE, JSON.stringify(errors, null, 2), 'utf-8');

  console.log(`\n=== Summary ===`);
  console.log(`  Scraped : ${docs.length} / ${allEntries.length}`);
  console.log(`  Errors  : ${errors.length}`);
  console.log(`  Output  : ${OUT_FILE}`);
  if (errors.length) console.log(`  Errors log : ${ERR_FILE}`);
}

main().catch((e) => {
  console.error('Fatal error:', e);
  process.exit(1);
});
