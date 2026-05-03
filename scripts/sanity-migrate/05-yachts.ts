// Migration des fiches yacht vers Sanity. Memes regles que pour cars :
// _id auto (UUID) sinon Sanity v4 filtre des reads publics, _key par
// item de gallery, upload des images (hero + galerie) en assets.
import { client, uploadImageFromUrl } from './_client';
import { YACHTS } from '../../lib/yachts';

function imgRef(assetId: string, idx: number) {
  return {
    _type: 'image',
    _key: `img-${idx}-${Math.random().toString(36).slice(2, 8)}`,
    asset: { _type: 'reference', _ref: assetId },
  };
}

async function main() {
  console.log(`Migration de ${YACHTS.length} yachts...`);

  // Idempotence : ignore les yachts deja en base (matche par slug).
  const existing = await client.fetch<string[]>(`*[_type == "yacht"].slug.current`);
  const existingSet = new Set(existing);
  console.log(`  Deja en base : ${existing.length}`);

  const uploadCache = new Map<string, string>();
  async function upload(url: string): Promise<string> {
    if (uploadCache.has(url)) return uploadCache.get(url)!;
    const id = await uploadImageFromUrl(url);
    uploadCache.set(url, id);
    return id;
  }

  for (let i = 0; i < YACHTS.length; i++) {
    const y = YACHTS[i];
    if (existingSet.has(y.id)) {
      console.log(`[${i + 1}/${YACHTS.length}] skip ${y.fullName} (deja migre)`);
      continue;
    }
    console.log(`[${i + 1}/${YACHTS.length}] ${y.fullName}`);

    const heroId = y.hero ? await upload(y.hero) : null;
    const galleryAssetIds: string[] = [];
    for (const url of y.images || []) {
      try {
        galleryAssetIds.push(await upload(url));
      } catch (e) {
        console.warn(`    Image fail : ${url}`, e);
      }
    }

    const doc: any = {
      _type: 'yacht',
      slug: { _type: 'slug', current: y.id },
      name: y.name,
      builder: y.builder,
      model: y.model,
      fullName: y.fullName,
      type: y.type,
      size: y.size,
      badge: y.badge || '',
      order: i,
      published: true,
      lengthM: y.lengthM,
      cabins: y.cabins,
      cabinDetail: y.cabinDetail,
      guests: y.guests,
      crew: y.crew,
      cruisingKnots: y.cruisingKnots,
      maxKnots: y.maxKnots,
      year: y.year,
      hero: heroId ? imgRef(heroId, 0) : undefined,
      gallery: galleryAssetIds.map((id, idx) => imgRef(id, idx)),
      pricePerDay: y.pricePerDay,
      pricePerWeekFrom: y.pricePerWeekFrom,
      pricePerWeekTo: y.pricePerWeekTo,
      ports: y.ports,
      cruisingAreas: y.cruisingAreas,
      amenities: y.amenities,
      shortDesc: { _type: 'localizedString', en: y.desc, fr: y.descFr },
      body: { _type: 'localizedText', en: y.bodyEn, fr: y.bodyFr },
    };

    await client.create(doc);
  }

  console.log('Termine.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
