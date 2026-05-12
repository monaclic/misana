// Upload les 191 webp processees vers Sanity, puis cree/patche les 32
// fiches rentalCar. Mode strict : si fiche existe deja, gallery
// entierement remplacee par notre nouvelle source.
//
// Usage : pnpm tsx scripts/fleet-upload-create.ts

import { client } from './sanity-migrate/_client';
import { FLEET, type FleetCar } from './fleet-pipeline';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const PROCESSED_DIR = '/Users/nayar/Desktop/misana-v2/fleet-processed';
const MANIFEST = '/Users/nayar/Desktop/misana-v2/scripts/fleet-assets.json';

type AssetEntry = { slug: string; file: string; assetId: string; url: string };

function loadManifest(): AssetEntry[] {
  if (!existsSync(MANIFEST)) return [];
  return JSON.parse(readFileSync(MANIFEST, 'utf8'));
}

async function saveManifest(m: AssetEntry[]) {
  await writeFile(MANIFEST, JSON.stringify(m, null, 2));
}

async function uploadWithRetry(buf: Buffer, filename: string, attempt = 1): Promise<{ _id: string; url: string }> {
  try {
    const asset = await client.assets.upload('image', buf, { filename });
    return { _id: asset._id, url: asset.url };
  } catch (e: any) {
    const code = e?.statusCode || e?.response?.statusCode;
    if (attempt < 5 && (code === 502 || code === 503 || code === 504 || code === 429)) {
      const wait = 1000 * 2 ** (attempt - 1);
      await new Promise((r) => setTimeout(r, wait));
      return uploadWithRetry(buf, filename, attempt + 1);
    }
    throw e;
  }
}

async function uploadAll(): Promise<AssetEntry[]> {
  const manifest = loadManifest();
  const doneKeys = new Set(manifest.map((m) => `${m.slug}/${m.file}`));

  const slugs = await readdir(PROCESSED_DIR);
  let totalNew = 0;
  let totalSkip = 0;

  for (const slug of slugs) {
    const dir = join(PROCESSED_DIR, slug);
    const files = (await readdir(dir)).filter((f) => f.endsWith('.webp')).sort();
    for (const f of files) {
      const key = `${slug}/${f}`;
      if (doneKeys.has(key)) { totalSkip++; continue; }
      const buf = await readFile(join(dir, f));
      const asset = await uploadWithRetry(buf, `${slug}-${f}`);
      manifest.push({ slug, file: f, assetId: asset._id, url: asset.url });
      await saveManifest(manifest);
      totalNew++;
      console.log(`up ${slug}/${f} -> ${asset._id.slice(0, 30)}...`);
      await new Promise((r) => setTimeout(r, 200));
    }
  }
  console.log(`\nUpload : ${totalNew} nouveaux, ${totalSkip} deja faits, total ${manifest.length}`);
  return manifest;
}

function imgRef(assetId: string, key: string) {
  return {
    _key: key,
    _type: 'image',
    asset: { _type: 'reference', _ref: assetId },
  };
}

function heroRef(assetId: string) {
  return { _type: 'image', asset: { _type: 'reference', _ref: assetId } };
}

async function createOrPatch(car: FleetCar, manifest: AssetEntry[]) {
  const carAssets = manifest.filter((m) => m.slug === car.slug).sort((a, b) => a.file.localeCompare(b.file));
  if (carAssets.length === 0) {
    console.log(`SKIP ${car.slug} : aucun asset`);
    return;
  }
  const heroAsset = carAssets[0];
  const galleryAssets = carAssets;

  const existing = await client.fetch('*[_type == "rentalCar" && slug.current == $slug][0]{_id}', { slug: car.slug });

  const baseFields = {
    brand: car.brand,
    model: car.model,
    fullName: car.fullName,
    category: { _type: 'reference', _ref: car.categoryId },
    published: true,
    pax: car.pax,
    hp: car.hp,
    topSpeedKmh: car.topSpeedKmh,
    transmission: car.transmission,
    fuelType: car.fuelType,
    year: car.year,
    hero: heroRef(heroAsset.assetId),
    gallery: galleryAssets.map((a, i) => imgRef(a.assetId, `gal-${car.slug}-${i}`)),
    prices: car.prices,
    conditions: car.conditions,
    availableCities: ['nice', 'cannes', 'monaco', 'saint-tropez', 'cap-ferrat', 'cap-d-antibes', 'eze', 'menton'],
    shortDesc: { _type: 'localizedString', en: car.descEn, fr: car.descFr },
    body: { _type: 'localizedText', en: car.bodyEn, fr: car.bodyFr },
  };
  const optionalFields: any = {};
  if (car.badge) optionalFields.badge = car.badge;

  if (existing) {
    await client.patch(existing._id).set({ ...baseFields, ...optionalFields }).commit();
    console.log(`patch ${car.slug} (${carAssets.length} images)`);
  } else {
    const maxOrder = await client.fetch('*[_type == "rentalCar"] | order(order desc)[0].order');
    const nextOrder = (typeof maxOrder === 'number' ? maxOrder : 0) + 1;
    const doc: any = {
      _type: 'rentalCar',
      slug: { _type: 'slug', current: car.slug },
      slugI18n: {
        _type: 'localizedSlug',
        en: { _type: 'slug', current: car.slug },
        fr: { _type: 'slug', current: car.slug },
      },
      order: nextOrder,
      ...baseFields,
      ...optionalFields,
    };
    const created = await client.create(doc);
    console.log(`create ${car.slug} -> ${created._id} (${carAssets.length} images)`);
  }
}

async function main() {
  console.log('=== UPLOAD ASSETS ===');
  const manifest = await uploadAll();

  console.log('\n=== CREATE / PATCH FICHES ===');
  for (const car of FLEET) {
    try {
      await createOrPatch(car, manifest);
    } catch (e: any) {
      console.log(`ERR ${car.slug} : ${e.message}`);
    }
  }
  console.log('\nFini.');
}

main().catch((e) => { console.error(e); process.exit(1); });
