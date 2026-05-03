// Migration des 5 service hubs vers Sanity.
// Pour chauffeur et helicopter : on uploade l'image hero hardcodee.
// Pour cars/yacht/access : pas d'image en dur (le hero vient d'une fiche),
// on cree quand meme le doc pour permettre l'override depuis Studio.
import { client, uploadImageFromUrl } from './_client';

function imgRef(assetId: string) {
  return { _type: 'image', asset: { _type: 'reference', _ref: assetId } };
}

const HERO_IMAGES: Record<string, string | null> = {
  chauffeur:  'https://images.unsplash.com/photo-1485291571150-772bcfc10da5?w=2400&q=80',
  helicopter: 'https://www.leaderlimousines.com/cdn/shop/files/Helicopter_H125_flying_over_the_sea.jpg?v=1773610994&width=1500',
  cars:       null,
  yacht:      null,
  access:     null,
};

const SERVICES = ['chauffeur', 'cars', 'yacht', 'helicopter', 'access'] as const;

async function main() {
  console.log('Migration des 5 service hubs...');
  for (const service of SERVICES) {
    const id = `serviceHub-${service}`;
    const existing = await client.fetch<any>(
      `*[_id == $id][0]`, { id },
    );
    if (existing && existing.heroImage?.asset?._ref) {
      console.log(`  skip ${service} (deja en base avec hero)`);
      continue;
    }

    let heroAsset: string | null = null;
    const url = HERO_IMAGES[service];
    if (url) {
      try {
        console.log(`  upload hero ${service}...`);
        heroAsset = await uploadImageFromUrl(url, `hub-${service}-hero.jpg`);
      } catch (e) {
        console.warn(`  hero fail ${service} :`, (e as Error).message);
      }
    } else {
      console.log(`  ${service} : pas d'image en dur, doc cree vide.`);
    }

    const doc: any = {
      _id: id,
      _type: 'serviceHub',
      service,
      sections: [],
    };
    if (heroAsset) doc.heroImage = imgRef(heroAsset);

    await client.createOrReplace(doc);
  }
  console.log('Termine.');
}

main().catch((e) => { console.error(e); process.exit(1); });
