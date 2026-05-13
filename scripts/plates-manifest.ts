// Genere le manifest des images FLM a annoter pour le masquage de plaques.
// Output : scripts/annotate-plates/manifest.json
//
// Run : pnpm tsx --env-file=.env.local scripts/plates-manifest.ts
import { client } from './sanity-migrate/_client';
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const FLM_SLUGS = [
  'ferrari-296-gts',
  'ferrari-roma-spider',
  'ferrari-portofino-m',
  'lamborghini-huracan-evo-spyder',
  'lamborghini-huracan-tecnica',
  'mercedes-sl-63-amg-roadster',
  'bentley-continental-gtc',
  'porsche-911-carrera-4s-cabriolet',
  'porsche-911-carrera-4-gts-cabriolet',
  'aston-martin-db12',
  'porsche-911-gt3-rs',
  'lamborghini-urus-se',
  'lamborghini-urus-s',
  'mercedes-classe-g63-amg',
  'mercedes-gle-53-amg',
  'mercedes-maybach-gls-600',
  'range-rover-vogue-l',
  'range-rover-sport',
  'land-rover-defender-110',
];

type ManifestEntry = {
  carSlug: string;
  carName: string;
  imageId: string; // identifiant unique : `${carSlug}--hero` ou `${carSlug}--gallery-${i}`
  assetRef: string;
  type: 'hero' | 'gallery';
  index?: number;
  url: string; // URL CDN pour fetch dans le browser
};

function assetUrl(ref: string): string {
  // Sanity image ref pattern : image-{hash}-{width}x{height}-{format}
  const m = ref.match(/^image-([a-f0-9]+)-(\d+)x(\d+)-(\w+)$/);
  if (!m) return ref;
  return `https://cdn.sanity.io/images/akpi9bfm/production/${m[1]}-${m[2]}x${m[3]}.${m[4]}`;
}

async function main() {
  const cars = await client.fetch(
    `*[_type == "rentalCar" && slug.current in $slugs && published == true] | order(fullName asc) {
      "slug": slug.current,
      "name": fullName,
      hero,
      gallery
    }`,
    { slugs: FLM_SLUGS },
  );

  const manifest: ManifestEntry[] = [];
  for (const c of cars as Array<{ slug: string; name: string; hero?: any; gallery?: any[] }>) {
    if (c.hero?.asset?._ref) {
      manifest.push({
        carSlug: c.slug,
        carName: c.name,
        imageId: `${c.slug}--hero`,
        assetRef: c.hero.asset._ref,
        type: 'hero',
        url: assetUrl(c.hero.asset._ref),
      });
    }
    for (let i = 0; i < (c.gallery || []).length; i++) {
      const g = c.gallery[i];
      if (g?.asset?._ref) {
        manifest.push({
          carSlug: c.slug,
          carName: c.name,
          imageId: `${c.slug}--gallery-${i}`,
          assetRef: g.asset._ref,
          type: 'gallery',
          index: i,
          url: assetUrl(g.asset._ref),
        });
      }
    }
  }

  // De-dup par assetRef (si hero === gallery[0])
  const seen = new Set<string>();
  const deduped = manifest.filter((e) => {
    if (seen.has(e.assetRef)) return false;
    seen.add(e.assetRef);
    return true;
  });

  const out = resolve(process.cwd(), 'scripts/annotate-plates/manifest.json');
  writeFileSync(out, JSON.stringify(deduped, null, 2));
  console.log(`✓ ${deduped.length} images (${manifest.length - deduped.length} dedupliquees) dans ${out}`);
  console.log(`  ${cars.length} fiches FLM trouvees.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
