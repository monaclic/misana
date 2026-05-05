// MIGRATION REELLE : peuple slugI18n { fr, en } sur les 184 docs cibles.
// Option A (sécurisée) : l'ancien champ `slug` est CONSERVE intact.
//
// Calcul du mapping identique au DRY-RUN (script 13). Toutes les
// mutations sont groupees dans UNE transaction Sanity. Si une mutation
// échoue → la transaction entière est rollback automatiquement.
//
// Pré-requis : backup Sanity OBLIGATOIRE (.sanity-backups/...).
//
// Usage :
//   pnpm exec tsx scripts/sanity-migrate/14-localized-slugs-apply.ts
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

function extractYachtName(doc: any): string {
  const full = String(doc.fullName || '');
  const m = full.match(/·\s*(?:M\/Y|S\/Y|CAT)\s+(.+)$/i);
  if (m) return m[1].trim();
  return String(doc.name || full || '').trim();
}

function extractYachtModel(doc: any): string {
  const full = String(doc.fullName || '');
  const parts = full.split('·').map((s) => s.trim());
  return parts[0] || '';
}

// Cas particuliers yachts ambigus (resolved par le user au step 5).
// Source : decisions M1+ post-DRY-RUN. Cle = nom propre slug-ifie.
const YACHT_AMBIGUOUS_OVERRIDES: Record<string, string> = {
  'a4a': 'a4a-absolute-navetta-68',
  'x': 'sanlorenzo-460exp', // drop "x" prefix
  'kar': 'kar-riva-88-folgore',
  'dar': 'dar-oceanco', // drop "-custom"
  'jff': 'jff-mangusta-108',
  'lel': 'lel-rossinavi', // drop "-custom"
};

type Mut = {
  type: string;
  _id: string;
  label: string;
  oldSlug: string;
  newFr: string;
  newEn: string;
};

const mutations: Mut[] = [];

// --- collectors par type (logique miroir du DRY-RUN) -------------------
async function collectYachts() {
  const docs = await client.fetch(
    `*[_type == "yacht"]{ _id, name, fullName, slug }`,
  );
  for (const d of docs) {
    const oldSlug = d.slug?.current || '';
    const yachtName = extractYachtName(d);
    let newSlug = slugify(yachtName);
    if (YACHT_AMBIGUOUS_OVERRIDES[newSlug]) {
      newSlug = YACHT_AMBIGUOUS_OVERRIDES[newSlug];
    }
    mutations.push({
      type: 'yacht',
      _id: d._id,
      label: d.fullName || d.name || '',
      oldSlug,
      newFr: newSlug,
      newEn: newSlug,
    });
  }
}

async function collectRentalCars() {
  const docs = await client.fetch(
    `*[_type == "rentalCar"]{ _id, name, fullName, slug }`,
  );
  for (const d of docs) {
    const oldSlug = d.slug?.current || '';
    const newSlug = slugify(d.fullName || d.name || '');
    mutations.push({
      type: 'rentalCar',
      _id: d._id,
      label: d.fullName || d.name || '',
      oldSlug,
      newFr: newSlug,
      newEn: newSlug,
    });
  }
}

async function collectAccess() {
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
    });
  }
}

async function collectDestinations() {
  const docs = await client.fetch(
    `*[_type == "destination"]{ _id, nameEn, slug }`,
  );
  for (const d of docs) {
    const oldSlug = d.slug?.current || '';
    mutations.push({
      type: 'destination',
      _id: d._id,
      label: d.nameEn || '',
      oldSlug,
      newFr: oldSlug,
      newEn: oldSlug,
    });
  }
}

async function collectEvents() {
  const docs = await client.fetch(
    `*[_type == "event"]{ _id, nameEn, slug }`,
  );
  for (const d of docs) {
    const oldSlug = d.slug?.current || '';
    const newSlug = oldSlug === 'saint-tropez-voiles'
      ? 'voiles-de-saint-tropez'
      : oldSlug;
    mutations.push({
      type: 'event',
      _id: d._id,
      label: d.nameEn || '',
      oldSlug,
      newFr: newSlug,
      newEn: newSlug,
    });
  }
}

async function collectServices() {
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
      throw new Error(`Service inconnu : ${oldSlug} (id ${d._id})`);
    }
    mutations.push({
      type: 'service',
      _id: d._id,
      label: d.nameEn || '',
      oldSlug,
      newFr: m.fr,
      newEn: m.en,
    });
  }
}

async function collectTransferRoutes() {
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
    });
  }
}
async function collectRoutes() {
  const docs = await client.fetch(`*[_type == "route"]{ _id, name, slug }`);
  for (const d of docs) {
    const oldSlug = d.slug?.current || '';
    mutations.push({
      type: 'route',
      _id: d._id,
      label: d.name || '',
      oldSlug,
      newFr: oldSlug,
      newEn: oldSlug,
    });
  }
}

async function collectWeekends() {
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
    });
  }
}

// --- main ---------------------------------------------------------------
async function main() {
  console.log('Collecte des documents et calcul des nouveaux slugs...');
  await collectYachts();
  await collectRentalCars();
  await collectAccess();
  await collectDestinations();
  await collectEvents();
  await collectServices();
  await collectTransferRoutes();
  await collectRoutes();
  await collectWeekends();
  console.log(`  ${mutations.length} mutations préparées.`);

  // Anti-"-custom" check
  const customLeftovers = mutations.filter(
    (m) => m.newFr.includes('-custom') || m.newEn.includes('-custom'),
  );
  if (customLeftovers.length > 0) {
    console.error('STOP : "-custom" présent dans des slugs cibles :');
    for (const m of customLeftovers) {
      console.error(`  ${m._id}  ${m.label}  fr=${m.newFr}  en=${m.newEn}`);
    }
    process.exit(1);
  }
  console.log('  ✓ Anti-"-custom" check passé : aucun slug ne contient "-custom".');

  // Construction de la transaction
  console.log('Construction de la transaction Sanity...');
  const tx = client.transaction();
  for (const m of mutations) {
    tx.patch(m._id, {
      set: {
        slugI18n: {
          _type: 'localizedSlug',
          fr: { _type: 'slug', current: m.newFr },
          en: { _type: 'slug', current: m.newEn },
        },
      },
    });
  }

  console.log('Commit de la transaction...');
  const before = Date.now();
  let result;
  try {
    result = await tx.commit({ visibility: 'sync' });
  } catch (e: any) {
    console.error('ERREUR transaction :', e?.message || e);
    if (e?.details) console.error('Détails :', JSON.stringify(e.details, null, 2));
    console.error('Rollback automatique Sanity. Aucune mutation appliquée.');
    process.exit(1);
  }
  const ms = Date.now() - before;
  const applied = result?.results?.length ?? 0;

  console.log('');
  console.log('='.repeat(78));
  console.log(`  ✓ Transaction commitée en ${ms}ms`);
  console.log(`  Mutations appliquées : ${applied} / ${mutations.length}`);
  console.log(`  Transaction id : ${result?.transactionId || '(n/a)'}`);
  console.log('='.repeat(78));

  if (applied !== mutations.length) {
    console.error('⚠ Mismatch applied vs prévu — vérifier en post-migration.');
    process.exit(2);
  }
}

main().catch((e) => {
  console.error('ERR fatal :', e?.message || e);
  process.exit(1);
});
