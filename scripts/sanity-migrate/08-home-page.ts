// Migration de la page d'accueil vers Sanity (singleton homePage).
// Idempotent : si le doc existe deja avec les memes images, on skip.
// Pour forcer un re-upload : delete le doc dans Studio puis relance.
//
// Toute la copy reste en i18n (fichiers locales/*.json) : on stocke
// uniquement les overrides explicites. Pour V1, on laisse les
// overrides vides : le site continue a utiliser les traductions.
import { client, uploadImageFromUrl } from './_client';

function imgRef(assetId: string) {
  return {
    _type: 'image',
    asset: { _type: 'reference', _ref: assetId },
  };
}

const HERO_IMAGES = {
  intro:      'https://images.unsplash.com/photo-1499678329028-101435549a4e?w=2400&q=80',
  helicopter: 'https://images.unsplash.com/photo-1540979388789-6cee28a1cdc9?w=2000&q=80',
  yacht:      'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=2000&q=80',
  cars:       'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=2000&q=80',
  chauffeur:  'https://images.unsplash.com/photo-1605515298946-d062f2e9da53?w=2000&q=80',
  access:     'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=2000&q=80',
} as const;

const PANEL_ORDER = ['helicopter', 'yacht', 'cars', 'chauffeur', 'access'] as const;

async function main() {
  console.log('Migration page d\'accueil...');

  const existing = await client.fetch<any>(`*[_id == "homePage"][0]`);
  if (existing && existing.heroImage?.asset?._ref) {
    console.log('  homePage existe deja avec hero. Skip (delete dans Studio pour forcer).');
    return;
  }

  console.log('  Upload hero intro...');
  const heroAsset = await uploadImageFromUrl(HERO_IMAGES.intro, 'home-hero-intro.jpg');

  const panels: any[] = [];
  for (const slug of PANEL_ORDER) {
    console.log(`  Upload panel ${slug}...`);
    const id = await uploadImageFromUrl(HERO_IMAGES[slug], `home-panel-${slug}.jpg`);
    panels.push({
      _type: 'servicePanel',
      _key: `panel-${slug}`,
      service: slug,
      image: imgRef(id),
    });
  }

  const doc = {
    _id: 'homePage',
    _type: 'homePage',
    heroImage: imgRef(heroAsset),
    servicePanels: panels,
    sections: [],
  };

  await client.createOrReplace(doc);
  console.log('Termine.');
}

main().catch((e) => { console.error(e); process.exit(1); });
