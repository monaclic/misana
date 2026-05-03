// Migration des fiches voitures vers Sanity.
// Upload chaque image (hero + galerie) vers les assets Sanity.
// Reutilise les categories deja migrees (script 01).
import { client, uploadImageFromUrl } from './_client';
import { RENTAL_CARS } from '../../lib/rentalCars';

function imgRef(assetId: string, idx: number) {
  return {
    _type: 'image',
    _key: `img-${idx}-${Math.random().toString(36).slice(2, 8)}`,
    asset: { _type: 'reference', _ref: assetId },
  };
}

async function main() {
  console.log(`Migration de ${RENTAL_CARS.length} voitures...`);

  // Resolution des _id de categories par slug (les categories ont
  // ete creees par 01- avec UUID auto).
  const cats = await client.fetch<{ _id: string; slug: string }[]>(
    `*[_type == "rentalCarCategory"]{_id, "slug": slug.current}`,
  );
  const catIdBySlug = new Map(cats.map((c) => [c.slug, c._id]));

  // Cache pour ne pas re-uploader la meme URL.
  const uploadCache = new Map<string, string>();
  async function upload(url: string): Promise<string> {
    if (uploadCache.has(url)) return uploadCache.get(url)!;
    const id = await uploadImageFromUrl(url);
    uploadCache.set(url, id);
    return id;
  }

  for (let i = 0; i < RENTAL_CARS.length; i++) {
    const c = RENTAL_CARS[i];
    console.log(`[${i + 1}/${RENTAL_CARS.length}] ${c.fullName}`);

    // Upload hero
    const heroId = c.hero ? await upload(c.hero) : null;
    // Upload galerie (deduplique cote uploadCache)
    const galleryAssetIds: string[] = [];
    for (const url of c.images || []) {
      try {
        const id = await upload(url);
        galleryAssetIds.push(id);
      } catch (e) {
        console.warn(`    Image fail : ${url}`, e);
      }
    }

    // Pas d'_id custom : Sanity v4 filtre les docs avec '.' dans _id.
    const doc = {
      _type: 'rentalCar',
      slug: { _type: 'slug', current: c.id },
      brand: c.brand,
      model: c.model,
      fullName: c.fullName,
      category: catIdBySlug.has(c.category)
        ? { _type: 'reference', _ref: catIdBySlug.get(c.category) }
        : undefined,
      badge: c.badge || '',
      order: i,
      published: true,
      pax: c.pax,
      hp: c.hp,
      topSpeedKmh: c.topSpeedKmh,
      transmission: c.transmission,
      fuelType: c.fuelType,
      year: c.year,
      hero: heroId ? imgRef(heroId, 0) : undefined,
      gallery: galleryAssetIds.map((id, idx) => imgRef(id, idx)),
      prices: {
        oneToThreeDays: c.prices.oneToThreeDays,
        fourToSevenDays: c.prices.fourToSevenDays,
        weekPlus: c.prices.weekPlus,
      },
      conditions: {
        minAge: c.conditions.minAge,
        securityDeposit: c.conditions.securityDeposit,
        minDays: c.conditions.minDays,
        includedKmPerDay: c.conditions.includedKmPerDay,
        overageRatePerKm: c.conditions.overageRatePerKm,
      },
      availableCities: c.availableCities,
      shortDesc: { _type: 'localizedString', en: c.desc, fr: c.descFr },
      body: { _type: 'localizedText', en: c.bodyEn, fr: c.bodyFr },
    };

    await client.createOrReplace(doc);
  }

  console.log('Termine. Vehicules dans Sanity.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
