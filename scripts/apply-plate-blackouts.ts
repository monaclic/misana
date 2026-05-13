// Applique des rectangles noirs sur les plaques d'immatriculation des images
// Sanity, puis re-upload et patche les references dans les fiches rentalCar.
//
// Workflow :
//  1. Lance scripts/plates-manifest.ts pour generer manifest.json
//  2. Ouvre scripts/annotate-plates/index.html dans un browser
//     (servir le dossier via : `npx serve scripts/annotate-plates`)
//  3. Annote les plaques, clique "Exporter plates.json"
//  4. Place le plates.json telecharge dans scripts/annotate-plates/
//  5. Run : pnpm tsx --env-file=.env.local scripts/apply-plate-blackouts.ts
//
// Format plates.json attendu :
//   { "image-abc123-1500x900-webp": [{x: 0.42, y: 0.65, w: 0.12, h: 0.05}, ...], ... }
//   x,y,w,h en ratio 0-1 par rapport a l'image originale.
import { client } from './sanity-migrate/_client';
import sharp from 'sharp';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

type Rect = { x: number; y: number; w: number; h: number };
type PlatesJson = Record<string, Rect[]>;

const PLATES_PATH = resolve(process.cwd(), 'scripts/annotate-plates/plates.json');

if (!existsSync(PLATES_PATH)) {
  console.error(`✗ ${PLATES_PATH} introuvable. Annote d'abord via l'outil web.`);
  process.exit(1);
}

const PLATES: PlatesJson = JSON.parse(readFileSync(PLATES_PATH, 'utf8'));

function assetUrl(ref: string): string {
  const m = ref.match(/^image-([a-f0-9]+)-(\d+)x(\d+)-(\w+)$/);
  if (!m) throw new Error(`Asset ref invalide : ${ref}`);
  return `https://cdn.sanity.io/images/akpi9bfm/production/${m[1]}-${m[2]}x${m[3]}.${m[4]}`;
}

async function processAsset(oldRef: string, rects: Rect[]): Promise<string> {
  // 1. Download original
  const url = assetUrl(oldRef);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download ${url} : ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());

  // 2. Get dimensions
  const meta = await sharp(buf).metadata();
  const W = meta.width!;
  const H = meta.height!;

  // 3. Compose rectangles noirs uniformes (pas de texte, juste fill #000)
  const overlays = rects.map((r) => {
    const w = Math.max(1, Math.round(r.w * W));
    const h = Math.max(1, Math.round(r.h * H));
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="100%" height="100%" fill="#000000"/></svg>`;
    return {
      input: Buffer.from(svg),
      left: Math.max(0, Math.round(r.x * W)),
      top: Math.max(0, Math.round(r.y * H)),
    };
  });

  // 4. Re-encode en webp HD (preserve quality, plates discretes)
  const out = await sharp(buf).composite(overlays).webp({ quality: 88 }).toBuffer();

  // 5. Upload nouvel asset
  const filename = oldRef.replace(/^image-/, '').replace(/-\d+x\d+-\w+$/, '') + '-blackout.webp';
  const asset = await client.assets.upload('image', out, { filename });
  return asset._id;
}

async function patchReferences(oldRef: string, newRef: string): Promise<number> {
  // Trouve toutes les fiches rentalCar qui referencent oldRef (hero ou gallery)
  const docs = await client.fetch(
    `*[_type == "rentalCar" && (hero.asset._ref == $ref || $ref in gallery[].asset._ref)]{ _id, hero, gallery }`,
    { ref: oldRef },
  );

  let patched = 0;
  for (const doc of docs as Array<{ _id: string; hero?: any; gallery?: any[] }>) {
    const patches: any = {};
    // Hero
    if (doc.hero?.asset?._ref === oldRef) {
      patches.hero = { ...doc.hero, asset: { ...doc.hero.asset, _ref: newRef } };
    }
    // Gallery
    if (Array.isArray(doc.gallery)) {
      const newGallery = doc.gallery.map((g) =>
        g?.asset?._ref === oldRef ? { ...g, asset: { ...g.asset, _ref: newRef } } : g,
      );
      if (JSON.stringify(newGallery) !== JSON.stringify(doc.gallery)) {
        patches.gallery = newGallery;
      }
    }
    if (Object.keys(patches).length > 0) {
      await client.patch(doc._id).set(patches).commit();
      patched++;
    }
  }
  return patched;
}

async function main() {
  const entries = Object.entries(PLATES).filter(([, rects]) => rects.length > 0);
  console.log(`→ ${entries.length} images a traiter\n`);

  let i = 0;
  for (const [oldRef, rects] of entries) {
    i++;
    process.stdout.write(`[${i}/${entries.length}] ${oldRef} (${rects.length} plaque${rects.length > 1 ? 's' : ''})... `);
    try {
      const newRef = await processAsset(oldRef, rects);
      const patched = await patchReferences(oldRef, newRef);
      console.log(`OK → ${newRef} (${patched} doc${patched > 1 ? 's' : ''} patche${patched > 1 ? 's' : ''})`);
    } catch (e: any) {
      console.log(`ERREUR : ${e?.message || e}`);
    }
  }

  console.log(`\n✓ Termine. Pense a lancer le cleanup des assets orphelins ensuite.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
