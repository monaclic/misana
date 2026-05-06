// Optimise les assets image Sanity en place : telecharge, resize/convert
// en WebP avec sharp, upload comme nouvel asset, replace les references
// dans tous les documents qui pointent vers l'ancien asset.
//
// Usage :
//   pnpm tsx --dotenv .env.local scripts/optimize-sanity-images.ts        # dry run
//   pnpm tsx --dotenv .env.local scripts/optimize-sanity-images.ts --apply  # execute
//
// Parametres ajustables en haut du fichier (seuil, max width, quality).
//
// Apres execution :
// - Anciens assets RESTENT dans Sanity (orphelins). Un nettoyage manuel
//   peut etre fait dans Studio si besoin.
// - Cache CDN Sanity peut servir l'ancienne URL pendant ~1h. Forcer
//   reload via ?cache-bust=N en query string.

import sharp from 'sharp';
import { client } from './sanity-migrate/_client';

// === Parametres ===
const SIZE_THRESHOLD_KB = 500;  // Optimise les assets > 500 KiB
const MAX_WIDTH = 2400;          // Max largeur (les hero plein-ecran ne necessitent pas plus)
const QUALITY = 85;              // WebP q=85 = bon compromis qualite/poids
const APPLY = process.argv.includes('--apply');

// === Types ===
type ImageAsset = {
  _id: string;
  url: string;
  originalFilename?: string;
  size: number;
  mimeType: string;
  metadata?: { dimensions?: { width: number; height: number } };
};

type DocRef = { _id: string; _type: string };

// Walk recursive sur un objet et remplace les refs `_ref: oldId` par `newId`.
// Retourne true si au moins une modification a ete faite.
function replaceRefDeep(obj: any, oldId: string, newId: string): boolean {
  let modified = false;
  if (Array.isArray(obj)) {
    for (const item of obj) {
      if (replaceRefDeep(item, oldId, newId)) modified = true;
    }
  } else if (obj && typeof obj === 'object') {
    if (obj._ref === oldId) {
      obj._ref = newId;
      modified = true;
    }
    for (const key of Object.keys(obj)) {
      if (key.startsWith('_') && key !== '_ref') continue;
      if (replaceRefDeep(obj[key], oldId, newId)) modified = true;
    }
  }
  return modified;
}

async function optimizeAsset(asset: ImageAsset) {
  const sizeKb = Math.round(asset.size / 1024);
  const filename = asset.originalFilename || asset._id;
  const dims = asset.metadata?.dimensions;
  const dimStr = dims ? `${dims.width}x${dims.height}` : '?';

  console.log(`\n--- ${filename} ---`);
  console.log(`  asset _id  : ${asset._id}`);
  console.log(`  taille     : ${sizeKb} KiB (${dimStr})`);
  console.log(`  format     : ${asset.mimeType}`);

  // 1. Download
  const res = await fetch(asset.url);
  if (!res.ok) {
    console.log(`  KO download : ${res.status}`);
    return { saved: 0, skipped: true };
  }
  const buf = Buffer.from(await res.arrayBuffer());

  // 2. Optimise
  let pipeline = sharp(buf).rotate(); // rotate() applique l'orientation EXIF
  if (dims && dims.width > MAX_WIDTH) {
    pipeline = pipeline.resize(MAX_WIDTH, null, { withoutEnlargement: true });
  }
  const optimized = await pipeline
    .webp({ quality: QUALITY, effort: 6 })
    .toBuffer();

  const newSizeKb = Math.round(optimized.length / 1024);
  const saved = sizeKb - newSizeKb;
  const ratio = Math.round((1 - newSizeKb / sizeKb) * 100);
  console.log(`  optimise   : ${newSizeKb} KiB WebP (-${saved} KiB / -${ratio}%)`);

  if (saved <= 0) {
    console.log('  pas d\'amelioration, skip');
    return { saved: 0, skipped: true };
  }

  if (!APPLY) {
    console.log('  [DRY RUN] pas d\'upload');
    return { saved, skipped: false };
  }

  // 3. Upload nouvel asset
  const newName = (filename.replace(/\.[^.]+$/, '') || 'image') + '.webp';
  const newAsset = await client.assets.upload('image', optimized, {
    filename: newName,
  });
  console.log(`  uploaded   : ${newAsset._id}`);

  // 4. Find docs referencant l'ancien
  const docs = await client.fetch<DocRef[]>(
    `*[references($id)]{ _id, _type }`,
    { id: asset._id },
  );
  console.log(`  ${docs.length} documents a patcher`);

  // 5. Patch chaque doc : walk + replace ref
  for (const docRef of docs) {
    const doc = await client.getDocument(docRef._id);
    if (!doc) continue;
    const cloned = JSON.parse(JSON.stringify(doc));
    const modified = replaceRefDeep(cloned, asset._id, newAsset._id);
    if (!modified) {
      console.log(`    SKIP ${docRef._type}/${docRef._id} : aucune ref trouvee`);
      continue;
    }
    // Remove read-only fields avant createOrReplace
    delete cloned._rev;
    delete cloned._updatedAt;
    await client.createOrReplace(cloned);
    console.log(`    OK ${docRef._type}/${docRef._id}`);
  }

  return { saved, skipped: false };
}

async function main() {
  console.log('=== Optimisation des assets image Sanity ===');
  console.log(`Seuil          : ${SIZE_THRESHOLD_KB} KiB`);
  console.log(`Max width      : ${MAX_WIDTH}px`);
  console.log(`Quality WebP   : ${QUALITY}`);
  console.log(`Mode           : ${APPLY ? 'APPLY' : 'DRY RUN'}`);

  const allAssets = await client.fetch<ImageAsset[]>(
    `*[_type == "sanity.imageAsset"]{
      _id, url, originalFilename, size, mimeType, metadata { dimensions }
    }`,
  );
  const candidates = allAssets
    .filter((a) => a.size > SIZE_THRESHOLD_KB * 1024)
    .sort((a, b) => b.size - a.size);

  console.log(`\n${candidates.length} / ${allAssets.length} assets > ${SIZE_THRESHOLD_KB} KiB`);
  if (candidates.length === 0) {
    console.log('Rien a optimiser. Sortie.');
    return;
  }

  let totalSaved = 0;
  let processed = 0;
  let skipped = 0;
  for (const asset of candidates) {
    try {
      const { saved, skipped: skip } = await optimizeAsset(asset);
      totalSaved += saved;
      if (skip) skipped++;
      else processed++;
    } catch (err: any) {
      console.error(`  ERREUR ${asset._id} : ${err.message}`);
      skipped++;
    }
  }

  console.log('\n=== Resume ===');
  console.log(`Traites    : ${processed}`);
  console.log(`Skip       : ${skipped}`);
  console.log(`Total saved: ${Math.round(totalSaved / 1024)} MiB (${totalSaved} KiB)`);
  if (!APPLY) console.log('\nDRY RUN. Relance avec --apply pour executer.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
