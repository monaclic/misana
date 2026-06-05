/**
 * Enrichit le champ `nearby` (A proximite) des villas depuis l'API v3 LC.
 *
 * surrounding_information expose, par categorie : presence (bool),
 * accessibility ("on_foot" | "on_car") et timeInMinutes (souvent null).
 * On construit un tableau unifie {category, mode, min} pour les categories
 * presentes, dans l'ordre d'affichage LC. Le rendu fiche montre le chiffre
 * si dispo, sinon juste le mode (a pied / en voiture).
 *
 * Usage :
 *   node --env-file=.env.local scripts/villas/enrich-nearby.mjs            (dry-run)
 *   node --env-file=.env.local scripts/villas/enrich-nearby.mjs --write    (patch Sanity)
 */

const DRY_RUN = !process.argv.includes('--write');
const API = 'https://api.lecollectionist.com';
const RATE_MS = 700;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Ordre d'affichage LC + mapping vers nos categories.
const CATEGORIES = [
  { key: 'beach', present: 'beach', acc: 'beachAccessibility', min: 'beachAccessibilityTimeInMinutes' },
  { key: 'downtown', present: 'downtown', acc: 'downtownAccessibility', min: 'downtownAccessibilityTimeInMinutes' },
  { key: 'golf', present: 'golf', acc: 'golfAccessibility', min: 'golfAccessibilityTimeInMinutes' },
  { key: 'restaurants', present: 'restaurantsAndBars', acc: 'restaurantsAndBarsAccessibility', min: 'restaurantsAndBarsAccessibilityTimeInMinutes' },
  { key: 'shops', present: 'shops', acc: 'shopsAccessibility', min: 'shopsAccessibilityTimeInMinutes' },
];

function modeOf(acc) {
  if (acc === 'on_foot') return 'foot';
  if (acc === 'on_car') return 'car';
  return null;
}

async function fetchSurrounding(id) {
  const res = await fetch(`${API}/fr/api/v3/houses/${id}?include=surrounding_information`, {
    headers: { Accept: 'application/vnd.api+json' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const j = await res.json();
  const node = (j.included || []).find((x) => x.type && x.type.includes('surrounding'));
  return node?.attributes ?? null;
}

function buildNearby(attr) {
  if (!attr) return [];
  const out = [];
  for (const c of CATEGORIES) {
    if (attr[c.present] !== true) continue;
    const mode = modeOf(attr[c.acc]);
    const min = attr[c.min];
    const item = { _type: 'nearbyItem', _key: c.key, category: c.key };
    if (mode) item.mode = mode;
    if (typeof min === 'number') item.min = min;
    // On garde l'item meme si ni mode ni min (au moins la presence).
    out.push(item);
  }
  return out;
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
  console.log(`\n=== Enrich nearby ${DRY_RUN ? '(DRY-RUN)' : '(WRITE)'} ===\n`);
  const client = await loadClient();
  const villas = await client.fetch('*[_type=="villa" && defined(lcHouseId)]{_id, name, lcHouseId} | order(name asc)');
  console.log(`${villas.length} villa(s)\n`);

  let ok = 0; const failures = [];
  for (let i = 0; i < villas.length; i++) {
    const v = villas[i];
    process.stdout.write(`  [${i + 1}/${villas.length}] ${(v.name ?? '').padEnd(26)} ... `);
    try {
      const attr = await fetchSurrounding(v.lcHouseId);
      const nearby = buildNearby(attr);
      console.log(nearby.map((n) => `${n.category}${n.min != null ? `(${n.min})` : n.mode ? `(${n.mode})` : ''}`).join(', ') || '(vide)');
      if (!DRY_RUN) await client.patch(v._id).set({ nearby }).commit();
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
