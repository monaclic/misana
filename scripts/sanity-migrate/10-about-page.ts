// Migration page About vers Sanity (singleton aboutPage).
// Idempotent : skip si le doc existe deja avec hero. Pour repartir
// de zero : delete depuis Studio puis relance.
import { client, uploadImageFromUrl } from './_client';

function imgRef(assetId: string) {
  return { _type: 'image', asset: { _type: 'reference', _ref: assetId } };
}

const IMAGES = {
  hero:        'https://images.unsplash.com/photo-1499678329028-101435549a4e?w=2400&q=80',
  philosophy:  'https://images.unsplash.com/photo-1566041510639-8d95a2490bfb?w=2400&q=80',
  spacesLeft:  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1400&q=80',
  spacesRight: 'https://images.unsplash.com/photo-1605515298946-d062f2e9da53?w=900&q=80',
  cta:         'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=2400&q=80',
} as const;

const GALLERY = [
  { src: 'https://images.unsplash.com/photo-1505761671935-60b3a7427bad?w=1200&q=80', ratio: '0.75' },
  { src: 'https://images.unsplash.com/photo-1473093226795-af9932fe5856?w=1500&q=80', ratio: '1.5' },
  { src: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&q=80', ratio: '0.667' },
  { src: 'https://images.unsplash.com/photo-1530541930197-ff16ac917b0e?w=1200&q=80', ratio: '0.75' },
  { src: 'https://images.unsplash.com/photo-1520637836862-4d197d17c25a?w=1500&q=80', ratio: '1.5' },
];

async function main() {
  console.log('Migration page About...');

  const existing = await client.fetch<any>(`*[_id == "aboutPage"][0]`);
  if (existing && existing.heroImage?.asset?._ref) {
    console.log('  aboutPage existe deja avec hero. Skip.');
    return;
  }

  console.log('  upload hero...');
  const heroId = await uploadImageFromUrl(IMAGES.hero, 'about-hero.jpg');
  console.log('  upload philosophy...');
  const philoId = await uploadImageFromUrl(IMAGES.philosophy, 'about-philosophy.jpg');
  console.log('  upload spaces left...');
  const slId = await uploadImageFromUrl(IMAGES.spacesLeft, 'about-spaces-left.jpg');
  console.log('  upload spaces right...');
  const srId = await uploadImageFromUrl(IMAGES.spacesRight, 'about-spaces-right.jpg');
  console.log('  upload cta...');
  const ctaId = await uploadImageFromUrl(IMAGES.cta, 'about-cta.jpg');

  console.log('  upload gallery (5 images)...');
  const galleryItems: any[] = [];
  for (let i = 0; i < GALLERY.length; i++) {
    const g = GALLERY[i];
    try {
      const id = await uploadImageFromUrl(g.src, `about-gallery-${i + 1}.jpg`);
      galleryItems.push({
        _type: 'tickerItem',
        _key: `tk-${i}`,
        image: imgRef(id),
        aspectRatio: g.ratio,
      });
    } catch (e) {
      console.warn(`  gallery ${i + 1} fail :`, (e as Error).message);
    }
  }

  const doc = {
    _id: 'aboutPage',
    _type: 'aboutPage',
    heroImage: imgRef(heroId),
    philosophyImage: imgRef(philoId),
    spacesLeftImage: imgRef(slId),
    spacesRightImage: imgRef(srId),
    ctaImage: imgRef(ctaId),
    galleryImages: galleryItems,
    sections: [],
  };

  await client.createOrReplace(doc);
  console.log('Termine.');
}

main().catch((e) => { console.error(e); process.exit(1); });
