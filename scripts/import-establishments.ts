/**
 * Import scripts/output/establishments.json vers Sanity en statut DRAFT.
 *
 * Comportement :
 *   1. Authentification via env SANITY_WRITE_TOKEN (jamais en clair)
 *   2. SUPPRIME TOUS les accessEstablishment existants (drafts + published)
 *      — Nayar a confirme "ecrase les etablissements deja listes ils sont pas bon".
 *   3. Pour chaque doc dans le JSON :
 *      - Upload chaque imageUrls vers Sanity assets (client.assets.upload)
 *      - Construit le document avec imageGallery = refs aux assets
 *      - Cree en DRAFT (id prefixe "drafts.{misanaSlug}")
 *
 * SAFETY :
 *   - Mode interactif par defaut : prompt y/N avant suppression
 *   - Pour automatiser : AUTO_CONFIRM=true en env
 *   - Mode dry-run : --dry-run pour valider sans ecrire
 *
 * Usage :
 *   pnpm tsx scripts/import-establishments.ts --dry-run    # preview
 *   pnpm tsx scripts/import-establishments.ts              # interactif
 *   AUTO_CONFIRM=true pnpm tsx scripts/import-establishments.ts  # auto
 */

import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { createClient, type SanityClient } from '@sanity/client';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPO_ROOT = join(__dirname, '..');
const INPUT_FILE = join(REPO_ROOT, 'scripts/output/establishments.json');

const PROJECT_ID = 'akpi9bfm';
const DATASET = 'production';
const API_VERSION = '2024-01-01';

const DRY_RUN = process.argv.includes('--dry-run');
const AUTO_CONFIRM = process.env.AUTO_CONFIRM === 'true';

type LocalizedString = { fr: string; en: string };
type LocalizedStringArray = { fr: string[]; en: string[] };

type EstablishmentDoc = {
  _type: 'establishment';
  _id: string;
  name: string;
  city: string;
  category: 'restaurant' | 'beach-club' | 'nightclub';
  shortLine: LocalizedString;
  signatureTags: LocalizedStringArray;
  occasions: LocalizedStringArray;
  aboutText: LocalizedString;
  longDescription: LocalizedString;
  horaires: LocalizedString;
  tenue: LocalizedString;
  teamNotes: LocalizedString;
  faq: { fr: { question: string; answer: string }[]; en: { question: string; answer: string }[] };
  slug: { _type: 'slug'; current: string };
  address: string;
  ambiance: string[];
  cuisineType: string[];
  establishmentType: string;
  imageUrls: string[];
  excellenceSourceUrl: string;
  scrapedAt: string;
};

type ImageRef = { _type: 'image'; _key: string; asset: { _ref: string; _type: 'reference' } };

const CITY_NAME_TO_SLUG: Record<string, string> = {
  'Saint-Tropez': 'saint-tropez',
  'Ramatuelle': 'ramatuelle',
  'Antibes': 'antibes',
  "Cap d'Antibes": 'cap-d-antibes',
  'Cannes': 'cannes',
  'Cap-Ferrat': 'cap-ferrat',
  'Nice': 'nice',
  'Eze': 'eze',
  'Monaco': 'monaco',
  'Menton': 'menton',
};

async function uploadImage(client: SanityClient, url: string, slug: string, idx: number) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const filename = `${slug}-${idx + 1}${url.endsWith('.png') ? '.png' : '.jpg'}`;
  const asset = await client.assets.upload('image', buf, { filename });
  return asset._id;
}

function buildSanityDoc(
  doc: EstablishmentDoc,
  galleryRefs: ImageRef[],
  hostHero: ImageRef | null,
): Record<string, unknown> {
  // _id prefixe avec "drafts." pour creer en DRAFT (jamais publie auto)
  const draftId = `drafts.${doc._id}`;
  const cityValue = CITY_NAME_TO_SLUG[doc.city] ?? doc.city.toLowerCase();
  // FAQ : convertir en format Sanity (array d'objects avec question/answer localises)
  const faqLength = Math.max(doc.faq.fr.length, doc.faq.en.length);
  const faq = Array.from({ length: faqLength }, (_, i) => ({
    _key: `faq-${i}`,
    _type: 'object',
    question: { _type: 'localizedString', fr: doc.faq.fr[i]?.question ?? '', en: doc.faq.en[i]?.question ?? '' },
    answer: { _type: 'localizedText', fr: doc.faq.fr[i]?.answer ?? '', en: doc.faq.en[i]?.answer ?? '' },
  }));

  return {
    _id: draftId,
    _type: 'accessEstablishment',
    name: doc.name,
    slug: { _type: 'slug', current: doc._id },
    category: doc.category,
    city: cityValue,
    published: false,
    order: 0,
    housePick: false,
    // === Nouveaux champs ===
    shortLine: { _type: 'localizedString', ...doc.shortLine },
    aboutText: { _type: 'localizedText', ...doc.aboutText },
    longDescription: { _type: 'localizedText', ...doc.longDescription },
    signatureTags: { _type: 'localizedStringArray', ...doc.signatureTags },
    occasions: { _type: 'localizedStringArray', ...doc.occasions },
    horaires: { _type: 'localizedString', ...doc.horaires },
    tenue: { _type: 'localizedString', ...doc.tenue },
    teamNotes: { _type: 'localizedText', ...doc.teamNotes },
    faq,
    address: doc.address,
    establishmentType: doc.establishmentType,
    ambiance: doc.ambiance,
    cuisineType: doc.cuisineType,
    seasonality: 'annuel',
    ...(hostHero ? { hero: hostHero } : {}),
    ...(galleryRefs.length ? { imageGallery: galleryRefs } : {}),
    excellenceSourceUrl: doc.excellenceSourceUrl,
    scrapedAt: doc.scrapedAt,
    // Reservation defaults (ne touche pas aux fiches existantes deja publiees)
    reservation: {
      enabled: true,
      minGuests: 1,
      maxGuests: 12,
      leadTimeHours: 48,
      serviceOptions: [],
    },
  };
}

async function main() {
  console.log(`\nSanity import — ${DRY_RUN ? 'DRY RUN' : 'LIVE'} mode\n`);

  if (!DRY_RUN && !process.env.SANITY_WRITE_TOKEN) {
    console.error('❌ SANITY_WRITE_TOKEN missing.');
    console.error('   Generate one : https://manage.sanity.io/project/akpi9bfm/api > Tokens');
    console.error('   Add to .env.local : SANITY_WRITE_TOKEN=<token>');
    console.error('   Or run with : SANITY_WRITE_TOKEN=<token> pnpm tsx scripts/import-establishments.ts');
    process.exit(1);
  }

  const raw = await readFile(INPUT_FILE, 'utf-8');
  const docs = JSON.parse(raw) as EstablishmentDoc[];
  console.log(`  Loaded ${docs.length} establishments from ${INPUT_FILE}`);

  const client = createClient({
    projectId: PROJECT_ID,
    dataset: DATASET,
    token: process.env.SANITY_WRITE_TOKEN,
    apiVersion: API_VERSION,
    useCdn: false,
  });

  // Query TOUS les accessEstablishment (drafts + published) pour suppression complete
  const existing = DRY_RUN
    ? []
    : await client.fetch<{ _id: string; name: string; slug?: { current?: string } }[]>(
        `*[_type == "accessEstablishment"]{ _id, name, "slug": slug }`,
      );
  console.log(`\n  Existing docs in Sanity : ${existing.length}`);
  for (const e of existing) console.log(`    - ${e._id} (${e.name})`);

  console.log(`\n  Will create new drafts : ${docs.length}`);
  for (const d of docs) console.log(`    + drafts.${d._id} (${d.name})`);

  if (DRY_RUN) {
    console.log('\n✅ Dry-run complete. No writes performed.');
    return;
  }

  // Confirmation
  if (!AUTO_CONFIRM) {
    const rl = createInterface({ input: stdin, output: stdout });
    const ans = await rl.question(
      `\n⚠ Continuer ? Cela va SUPPRIMER les ${existing.length} fiches existantes (drafts + published) ` +
        `et creer ${docs.length} nouveaux drafts. (y/N) `,
    );
    rl.close();
    if (ans.trim().toLowerCase() !== 'y') {
      console.log('Aborted by user.');
      return;
    }
  } else {
    console.log('\n  AUTO_CONFIRM=true — proceeding without prompt.');
  }

  // Supprime TOUS les accessEstablishment existants (drafts + published).
  // L'utilisateur a confirme "ecrase les etablissements deja listes ils sont
  // pas bon" — pas de preservation.
  if (existing.length) {
    console.log(`\n  Deleting ${existing.length} existing accessEstablishment docs...`);
    for (const e of existing) {
      try {
        await client.delete(e._id);
        console.log(`    ✓ deleted ${e._id}`);
      } catch (err) {
        console.warn(`    ⚠ could not delete ${e._id}: ${(err as Error).message}`);
      }
    }
  }

  // Import each document
  let success = 0;
  let failed = 0;
  for (let i = 0; i < docs.length; i++) {
    const d = docs[i];
    console.log(`\n[${i + 1}/${docs.length}] ${d._id} (${d.name})`);

    try {
      // Upload images
      const refs: ImageRef[] = [];
      for (let j = 0; j < d.imageUrls.length; j++) {
        const url = d.imageUrls[j];
        try {
          const assetId = await uploadImage(client, url, d._id, j);
          refs.push({
            _type: 'image',
            _key: `img-${j}`,
            asset: { _ref: assetId, _type: 'reference' },
          });
          console.log(`  ✓ image ${j + 1}/${d.imageUrls.length} uploaded`);
        } catch (err) {
          console.warn(`  ⚠ image ${j + 1} failed: ${(err as Error).message}`);
        }
      }

      // Use first image as hero, rest as gallery
      const hero = refs[0] ?? null;
      const gallery = refs;

      const sanityDoc = buildSanityDoc(d, gallery, hero);
      await client.createOrReplace(sanityDoc as Parameters<typeof client.createOrReplace>[0]);
      console.log(`  ✓ draft created : drafts.${d._id}`);
      success++;
    } catch (err) {
      console.error(`  ✗ failed : ${(err as Error).message}`);
      failed++;
    }
  }

  console.log(`\n=== Import summary ===`);
  console.log(`  ✓ ${success} drafts created`);
  console.log(`  ✗ ${failed} errors`);
  console.log(`\n  Reviewer le resultat dans Sanity Studio : pnpm studio`);
}

main().catch((e) => {
  console.error('Fatal error:', e);
  process.exit(1);
});
