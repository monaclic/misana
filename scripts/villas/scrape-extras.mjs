/**
 * Scrape des donnees non exposees par l'API v3 publique :
 *   - keyFeatures officielles ("Les incontournables")
 *   - goodToKnow ("Bon a savoir")
 *
 * Ces deux blocs sont rendus cote serveur dans le payload Nuxt
 * (__NUXT_DATA__, format devalue indexe) de chaque fiche LC, deja bilingues.
 * On fetch le HTML, on parse le payload, on extrait, on patch Sanity.
 *
 * Usage :
 *   node --env-file=.env.local scripts/villas/scrape-extras.mjs --slug villa-mala-cannes   (test 1 slug, print)
 *   node --env-file=.env.local scripts/villas/scrape-extras.mjs            (dry-run toutes villas)
 *   node --env-file=.env.local scripts/villas/scrape-extras.mjs --write    (patch Sanity)
 */

const DRY_RUN = !process.argv.includes('--write');
const TEST_SLUG = (() => { const i = process.argv.indexOf('--slug'); return i >= 0 ? process.argv[i + 1] : null; })();

const BASE = 'https://www.lecollectionist.com/fr/location-luxe/';
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const RATE_MS = 2500;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchHtml(slug) {
  const controller = new AbortController();
  const to = setTimeout(() => controller.abort(), 30000);
  try {
    const res = await fetch(BASE + slug, { headers: { 'User-Agent': UA, Accept: 'text/html' }, redirect: 'follow', signal: controller.signal });
    clearTimeout(to);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.text();
  } finally { clearTimeout(to); }
}

// Resolveur devalue (Nuxt __NUXT_DATA__) : chaque valeur dans un objet/array
// est un index dans le tableau racine. On ne resout que les sous-arbres
// demandes (donnees plates, acycliques).
function makeResolver(arr) {
  const SKIP = new Set(['Reactive', 'ShallowReactive', 'Set', 'Map', 'Date', 'NaN']);
  const cache = new Map();
  function resolve(idx, depth = 0) {
    if (typeof idx !== 'number' || idx < 0 || depth > 60) return undefined;
    if (cache.has(idx)) return cache.get(idx);
    const v = arr[idx];
    if (v === null || typeof v !== 'object') return v;
    if (Array.isArray(v)) {
      if (typeof v[0] === 'string' && SKIP.has(v[0])) return undefined;
      const out = [];
      cache.set(idx, out);
      for (const el of v) out.push(resolve(el, depth + 1));
      return out;
    }
    const out = {};
    cache.set(idx, out);
    for (const [k, val] of Object.entries(v)) out[k] = resolve(val, depth + 1);
    return out;
  }
  return resolve;
}

function extract(html) {
  const m = html.match(/<script[^>]*id="__NUXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  if (!m) throw new Error('payload __NUXT_DATA__ introuvable');
  const arr = JSON.parse(m[1]);
  const resolve = makeResolver(arr);

  // Trouver le noeud objet contenant houseKeyFeatures / houseTruthLinks
  let kfIdx = null; let tlIdx = null;
  for (const node of arr) {
    if (node && typeof node === 'object' && !Array.isArray(node)) {
      if ('houseKeyFeatures' in node) kfIdx = node.houseKeyFeatures;
      if ('houseTruthLinks' in node) tlIdx = node.houseTruthLinks;
      if (kfIdx != null && tlIdx != null) break;
    }
  }

  // keyFeatures
  let keyFeatures = null;
  if (kfIdx != null) {
    const kf = resolve(kfIdx);
    const featured = kf?.featured ?? [];
    const fr = []; const en = [];
    for (const f of featured) {
      if (f?.name?.fr) fr.push(f.name.fr);
      if (f?.name?.en) en.push(f.name.en);
    }
    if (fr.length) keyFeatures = { fr, en };
  }

  // goodToKnow
  let goodToKnow = null;
  if (tlIdx != null) {
    const tl = resolve(tlIdx) ?? [];
    const fr = []; const en = [];
    for (const t of tl) {
      if (t?.description?.fr) fr.push(t.description.fr);
      if (t?.description?.en) en.push(t.description.en);
    }
    if (fr.length) goodToKnow = { fr: fr.join('\n'), en: en.join('\n') };
  }

  return { keyFeatures, goodToKnow };
}

async function loadClient() {
  const { createClient } = await import('@sanity/client');
  const env = process.env;
  return createClient({
    projectId: env.NUXT_PUBLIC_SANITY_PROJECT_ID ?? 'akpi9bfm',
    dataset: env.NUXT_PUBLIC_SANITY_DATASET ?? 'production',
    token: env.SANITY_AUTH_TOKEN ?? env.SANITY_WRITE_TOKEN,
    apiVersion: '2024-01-01', useCdn: false,
  });
}

async function main() {
  if (TEST_SLUG) {
    const html = await fetchHtml(TEST_SLUG);
    const { keyFeatures, goodToKnow } = extract(html);
    console.log('=== keyFeatures FR ===', JSON.stringify(keyFeatures?.fr));
    console.log('=== keyFeatures EN ===', JSON.stringify(keyFeatures?.en));
    console.log('=== goodToKnow FR ===\n' + (goodToKnow?.fr ?? '(vide)'));
    console.log('=== goodToKnow EN ===\n' + (goodToKnow?.en ?? '(vide)'));
    return;
  }

  console.log(`\n=== Scrape extras ${DRY_RUN ? '(DRY-RUN)' : '(WRITE)'} ===\n`);
  const client = await loadClient();
  const villas = await client.fetch('*[_type=="villa" && defined(lcSlugFr)]{_id, name, lcSlugFr} | order(name asc)');
  console.log(`${villas.length} villa(s)\n`);

  let ok = 0; const failures = [];
  for (let i = 0; i < villas.length; i++) {
    const v = villas[i];
    process.stdout.write(`  [${i + 1}/${villas.length}] ${(v.name ?? '').padEnd(28)} ... `);
    try {
      const html = await fetchHtml(v.lcSlugFr);
      const { keyFeatures, goodToKnow } = extract(html);
      const patch = {};
      if (keyFeatures) patch.keyFeatures = { _type: 'localizedStringArray', fr: keyFeatures.fr, en: keyFeatures.en };
      if (goodToKnow) patch.goodToKnow = { _type: 'localizedText', fr: goodToKnow.fr, en: goodToKnow.en };
      console.log(`key=${keyFeatures?.fr?.length ?? 0} gtk=${goodToKnow ? goodToKnow.fr.split('\n').length : 0}`);
      if (!DRY_RUN && Object.keys(patch).length) await client.patch(v._id).set(patch).commit();
      ok++;
    } catch (e) {
      console.log(`✗ ${e.message}`);
      failures.push({ name: v.name, reason: e.message });
    }
    await sleep(RATE_MS);
  }
  console.log(`\n=== Termine : ${ok}/${villas.length} ===`);
  if (failures.length) console.log('Echecs :', JSON.stringify(failures, null, 2));
  if (DRY_RUN) console.log('\nDry-run : relancer avec --write pour patcher Sanity.');
}

main().catch((e) => { console.error('FATAL', e); process.exit(1); });
