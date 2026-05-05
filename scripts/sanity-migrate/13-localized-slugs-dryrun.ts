// DRY-RUN : migration vers localizedSlug { fr, en } selon les regles
// validees M1-M9. AUCUNE ecriture Sanity (pas de .commit, pas de .patch
// reel). Lit tous les docs concernes, calcule les nouveaux slugs,
// detecte collisions et cas particuliers, sort un rapport.
//
// Usage : pnpm exec tsx scripts/sanity-migrate/13-localized-slugs-dryrun.ts
import { createClient } from '@sanity/client';
import fs from 'node:fs';

// --- env ----------------------------------------------------------------
const dotenvRaw = fs.readFileSync('.env.local', 'utf8');
const env = Object.fromEntries(
  dotenvRaw
    .split('\n')
    .filter((l) => l && !l.startsWith('#'))
    .map((l) => {
      const i = l.indexOf('=');
      return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^"|"$/g, '')];
    }),
);

const client = createClient({
  projectId: env.NUXT_PUBLIC_SANITY_PROJECT_ID || 'akpi9bfm',
  dataset: env.NUXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2026-04-26',
  token: env.SANITY_AUTH_TOKEN,
  useCdn: false,
});

// --- helpers ------------------------------------------------------------
function slugify(s: string): string {
  return String(s || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Extract le nom propre du yacht depuis fullName ou name.
// fullName ex : "Olympic Yacht · M/Y DREAM" -> "DREAM"
//                "Lagoon 50 · CAT Sirena" -> "Sirena"
//                "Jeanneau Yacht 65 · S/Y Zephyr" -> "Zephyr"
function extractYachtName(doc: any): string {
  const full = String(doc.fullName || '');
  const m = full.match(/·\s*(?:M\/Y|S\/Y|CAT)\s+(.+)$/i);
  if (m) return m[1].trim();
  return String(doc.name || full || '').trim();
}

// Si fullName a un model "Sanlorenzo 460Exp" avant le · , on l'extrait
// pour les yachts au slug ambigu (X, A4A, JFF, KAR).
function extractYachtModel(doc: any): string {
  const full = String(doc.fullName || '');
  const parts = full.split('·').map((s) => s.trim());
  return parts[0] || '';
}

type Mut = {
  type: string;
  _id: string;
  label: string;
  oldSlug: string;
  newFr: string;
  newEn: string;
  changed: boolean;
  flags: string[];
};

const mutations: Mut[] = [];

// --- YACHT (M1 : slug nu, sans préfixe my-/sy-/cat-) -------------------
async function processYachts() {
  const docs = await client.fetch(
    `*[_type == "yacht"]{ _id, name, fullName, slug }`,
  );
  for (const d of docs) {
    const oldSlug = d.slug?.current || '';
    const yachtName = extractYachtName(d);
    let newSlug = slugify(yachtName);
    const flags: string[] = [];

    if (newSlug.length < 4) {
      // Cas particulier : slug trop court (X, A4A, JFF, KAR…).
      // Proposition alternative basée sur le model.
      const model = extractYachtModel(d);
      const modelSlug = slugify(model);
      const alt = modelSlug ? `${newSlug ? newSlug + '-' : ''}${modelSlug}` : newSlug;
      flags.push(`SHORT_SLUG (${newSlug.length} chars) → alt="${alt}"`);
      newSlug = alt;
    }
    if (!newSlug) {
      flags.push('EMPTY_SLUG (no name/fullName)');
    }
    mutations.push({
      type: 'yacht',
      _id: d._id,
      label: d.fullName || d.name || '(no label)',
      oldSlug,
      newFr: newSlug,
      newEn: newSlug,
      changed: newSlug !== oldSlug,
      flags,
    });
  }
}

// --- RENTAL CAR (M2 : [brand]-[model] propre, fix accents) -------------
async function processRentalCars() {
  const docs = await client.fetch(
    `*[_type == "rentalCar"]{ _id, name, fullName, slug }`,
  );
  for (const d of docs) {
    const oldSlug = d.slug?.current || '';
    const source = d.fullName || d.name || '';
    const newSlug = slugify(source);
    const flags: string[] = [];
    // Detection bug accent : si oldSlug contient `-coup` ou `-hurac-n-`
    if (oldSlug && oldSlug !== newSlug && (oldSlug.match(/-coup$/) || oldSlug.includes('hurac-n'))) {
      flags.push('ACCENT_BUG_FIXED');
    }
    mutations.push({
      type: 'rentalCar',
      _id: d._id,
      label: source,
      oldSlug,
      newFr: newSlug,
      newEn: newSlug,
      changed: newSlug !== oldSlug,
      flags,
    });
  }
}

// --- ACCESS ESTABLISHMENT (M3 : aucun changement) ----------------------
async function processAccess() {
  const docs = await client.fetch(
    `*[_type == "accessEstablishment"]{ _id, name, slug }`,
  );
  for (const d of docs) {
    const oldSlug = d.slug?.current || '';
    mutations.push({
      type: 'accessEstablishment',
      _id: d._id,
      label: d.name || '',
      oldSlug,
      newFr: oldSlug,
      newEn: oldSlug,
      changed: false,
      flags: [],
    });
  }
}

// --- DESTINATION (M4 : aucun changement) -------------------------------
async function processDestinations() {
  const docs = await client.fetch(
    `*[_type == "destination"]{ _id, nameEn, nameFr, slug }`,
  );
  for (const d of docs) {
    const oldSlug = d.slug?.current || '';
    mutations.push({
      type: 'destination',
      _id: d._id,
      label: d.nameEn || d.nameFr || '',
      oldSlug,
      newFr: oldSlug,
      newEn: oldSlug,
      changed: false,
      flags: [],
    });
  }
}

// --- EVENT (M5 : saint-tropez-voiles -> voiles-de-saint-tropez) -------
async function processEvents() {
  const docs = await client.fetch(
    `*[_type == "event"]{ _id, nameEn, nameFr, slug }`,
  );
  for (const d of docs) {
    const oldSlug = d.slug?.current || '';
    let newSlug = oldSlug;
    const flags: string[] = [];
    if (oldSlug === 'saint-tropez-voiles') {
      newSlug = 'voiles-de-saint-tropez';
      flags.push('M5_RENAMED');
    }
    mutations.push({
      type: 'event',
      _id: d._id,
      label: d.nameEn || d.nameFr || '',
      oldSlug,
      newFr: newSlug,
      newEn: newSlug,
      changed: newSlug !== oldSlug,
      flags,
    });
  }
}

// --- SERVICE (M6 : slugs FR/EN différents D2-D7) -----------------------
async function processServices() {
  const docs = await client.fetch(
    `*[_type == "service"]{ _id, nameEn, slug }`,
  );
  const MAP: Record<string, { fr: string; en: string }> = {
    chauffeur: { fr: 'chauffeur', en: 'private-chauffeur' },
    cars: { fr: 'voitures', en: 'luxury-cars' },
    yacht: { fr: 'yacht', en: 'yacht-charter' },
    helicopter: { fr: 'helicoptere', en: 'helicopter-transfers' },
    access: { fr: 'reservations', en: 'reservations' },
  };
  for (const d of docs) {
    const oldSlug = d.slug?.current || '';
    const m = MAP[oldSlug];
    if (!m) {
      mutations.push({
        type: 'service',
        _id: d._id,
        label: d.nameEn || '',
        oldSlug,
        newFr: oldSlug,
        newEn: oldSlug,
        changed: false,
        flags: ['UNKNOWN_SERVICE'],
      });
      continue;
    }
    mutations.push({
      type: 'service',
      _id: d._id,
      label: d.nameEn || '',
      oldSlug,
      newFr: m.fr,
      newEn: m.en,
      changed: m.fr !== oldSlug || m.en !== oldSlug,
      flags: [],
    });
  }
}

// --- TRANSFER ROUTE + ROUTE (M7 : aucun changement) -------------------
async function processTransferRoutes() {
  const docs = await client.fetch(
    `*[_type == "transferRoute"]{ _id, name, slug }`,
  );
  for (const d of docs) {
    const oldSlug = d.slug?.current || '';
    mutations.push({
      type: 'transferRoute',
      _id: d._id,
      label: d.name || '',
      oldSlug,
      newFr: oldSlug,
      newEn: oldSlug,
      changed: false,
      flags: [],
    });
  }
}
async function processRoutes() {
  const docs = await client.fetch(
    `*[_type == "route"]{ _id, name, slug }`,
  );
  for (const d of docs) {
    const oldSlug = d.slug?.current || '';
    mutations.push({
      type: 'route',
      _id: d._id,
      label: d.name || '',
      oldSlug,
      newFr: oldSlug,
      newEn: oldSlug,
      changed: false,
      flags: [],
    });
  }
}

// --- CURATED WEEKEND (M8 : FR=EN identiques V1) ------------------------
async function processWeekends() {
  const docs = await client.fetch(
    `*[_type == "curatedWeekend"]{ _id, name, slug }`,
  );
  for (const d of docs) {
    const oldSlug = d.slug?.current || '';
    mutations.push({
      type: 'curatedWeekend',
      _id: d._id,
      label: d.name || '',
      oldSlug,
      newFr: oldSlug,
      newEn: oldSlug,
      changed: false,
      flags: [],
    });
  }
}

// --- main ---------------------------------------------------------------
async function main() {
  await processYachts();
  await processRentalCars();
  await processAccess();
  await processDestinations();
  await processEvents();
  await processServices();
  await processTransferRoutes();
  await processRoutes();
  await processWeekends();

  // Détection de collisions par type, par locale.
  const collisions: Record<string, Record<string, Mut[]>> = {};
  const byType = new Map<string, Mut[]>();
  for (const m of mutations) {
    if (!byType.has(m.type)) byType.set(m.type, []);
    byType.get(m.type)!.push(m);
  }
  for (const [type, list] of byType.entries()) {
    for (const locale of ['fr', 'en'] as const) {
      const seen = new Map<string, Mut[]>();
      for (const m of list) {
        const slug = locale === 'fr' ? m.newFr : m.newEn;
        if (!slug) continue;
        if (!seen.has(slug)) seen.set(slug, []);
        seen.get(slug)!.push(m);
      }
      for (const [slug, items] of seen.entries()) {
        if (items.length > 1) {
          collisions[type] = collisions[type] || {};
          collisions[type][`${locale}:${slug}`] = items;
        }
      }
    }
  }

  // Cas particuliers : flags
  const flagged = mutations.filter((m) => m.flags.length > 0);

  // Stats
  const total = mutations.length;
  const changed = mutations.filter((m) => m.changed).length;
  const unchanged = total - changed;
  const accentFixed = mutations.filter((m) => m.flags.includes('ACCENT_BUG_FIXED')).length;
  const shortSlug = mutations.filter((m) => m.flags.some((f) => f.startsWith('SHORT_SLUG'))).length;

  // --- Rapport ----------------------------------------------------------
  console.log('='.repeat(78));
  console.log('DRY-RUN — Migration vers localizedSlug { fr, en }');
  console.log('='.repeat(78));
  console.log('');
  console.log('VOLUMES PAR TYPE');
  console.log('-'.repeat(78));
  for (const [type, list] of byType.entries()) {
    console.log(`  ${type.padEnd(28)} ${list.length}`);
  }
  console.log(`  ${'TOTAL'.padEnd(28)} ${total}`);
  console.log('');
  console.log('STATISTIQUES');
  console.log('-'.repeat(78));
  console.log(`  Slugs inchangés       : ${unchanged}`);
  console.log(`  Slugs modifiés        : ${changed}`);
  console.log(`  Bugs accents corrigés : ${accentFixed}`);
  console.log(`  Slugs courts flaggés  : ${shortSlug}`);
  console.log('');

  console.log('COLLISIONS DÉTECTÉES');
  console.log('-'.repeat(78));
  if (Object.keys(collisions).length === 0) {
    console.log('  Aucune collision.');
  } else {
    for (const [type, byLocaleSlug] of Object.entries(collisions)) {
      for (const [key, items] of Object.entries(byLocaleSlug)) {
        console.log(`  [${type}] ${key} — ${items.length} docs en conflit :`);
        items.forEach((it) => {
          console.log(`    - ${it._id}  ${it.label}  (oldSlug: ${it.oldSlug})`);
        });
      }
    }
  }
  console.log('');

  console.log('CAS PARTICULIERS');
  console.log('-'.repeat(78));
  if (flagged.length === 0) {
    console.log('  Aucun.');
  } else {
    for (const m of flagged) {
      console.log(`  [${m.type}] ${m._id}`);
      console.log(`    label   : ${m.label}`);
      console.log(`    old     : ${m.oldSlug}`);
      console.log(`    new fr  : ${m.newFr}`);
      console.log(`    new en  : ${m.newEn}`);
      console.log(`    flags   : ${m.flags.join(', ')}`);
    }
  }
  console.log('');

  console.log('MUTATIONS COMPLÈTES (extrait des changements uniquement)');
  console.log('-'.repeat(78));
  const onlyChanged = mutations.filter((m) => m.changed);
  for (const m of onlyChanged) {
    const fr = m.newFr;
    const en = m.newEn;
    const same = fr === en ? '(fr=en)' : `(fr≠en)`;
    console.log(
      `  [${m.type.padEnd(20)}] ${m._id.slice(0, 12).padEnd(13)} ${m.label.slice(0, 36).padEnd(38)} ${m.oldSlug.padEnd(40)} → fr=${fr}  en=${en}  ${same}`,
    );
  }
  console.log('');
  console.log(`  ${onlyChanged.length} changements totaux.`);
  console.log('');
  console.log('AUCUNE ÉCRITURE SANITY EFFECTUÉE.');
}

main().catch((e) => {
  console.error('ERR', e);
  process.exit(1);
});
