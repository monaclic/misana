// Migration des etablissements Access vers Sanity. Source data en deux
// fichiers : ESTABLISHMENTS (constants.ts) pour basics, et
// getEstablishmentDetail (establishmentDetails.ts) pour le detail.
import { client, uploadImageFromUrl } from './_client';
import { ESTABLISHMENTS } from '../../lib/constants';
import { getEstablishmentDetail } from '../../lib/establishmentDetails';

function imgRef(assetId: string, idx: number) {
  return {
    _type: 'image',
    _key: `img-${idx}-${Math.random().toString(36).slice(2, 8)}`,
    asset: { _type: 'reference', _ref: assetId },
  };
}

async function main() {
  console.log(`Migration de ${ESTABLISHMENTS.length} etablissements...`);

  const existing = await client.fetch<string[]>(`*[_type == "accessEstablishment"].slug.current`);
  const existingSet = new Set(existing);
  console.log(`  Deja en base : ${existing.length}`);

  const uploadCache = new Map<string, string>();
  async function upload(url: string): Promise<string> {
    if (uploadCache.has(url)) return uploadCache.get(url)!;
    const id = await uploadImageFromUrl(url);
    uploadCache.set(url, id);
    return id;
  }

  for (let i = 0; i < ESTABLISHMENTS.length; i++) {
    const e = ESTABLISHMENTS[i];
    if (existingSet.has(e.slug)) {
      console.log(`[${i + 1}/${ESTABLISHMENTS.length}] skip ${e.name}`);
      continue;
    }
    console.log(`[${i + 1}/${ESTABLISHMENTS.length}] ${e.name}`);

    const d = getEstablishmentDetail(e.slug, e.category);

    let heroId: string | null = null;
    if (d.hero) {
      try {
        heroId = await upload(d.hero);
      } catch (err) {
        console.warn('  hero fail', d.hero);
      }
    }
    const thumbsAssetIds: string[] = [];
    for (const url of d.thumbs || []) {
      try { thumbsAssetIds.push(await upload(url)); } catch (err) { console.warn('  thumb fail', url); }
    }

    const doc: any = {
      _type: 'accessEstablishment',
      slug: { _type: 'slug', current: e.slug },
      name: e.name,
      category: e.category,
      city: e.city,
      housePick: d.housePick,
      order: i,
      published: true,
      hero: heroId ? imgRef(heroId, 0) : undefined,
      thumbs: thumbsAssetIds.map((id, idx) => imgRef(id, idx)),
      signature: { _type: 'localizedString', en: d.signature.en, fr: d.signature.fr },
      about: d.about ? { _type: 'localizedText', en: d.about.en, fr: d.about.fr } : undefined,
      factualLabelsFr: d.factualLabels?.fr || [],
      factualLabelsEn: d.factualLabels?.en || [],
      bestForFr: d.bestFor?.fr || [],
      bestForEn: d.bestFor?.en || [],
      address: { _type: 'localizedString', en: d.practical.address.en, fr: d.practical.address.fr },
      cuisine: d.practical.cuisine
        ? { _type: 'localizedString', en: d.practical.cuisine.en, fr: d.practical.cuisine.fr }
        : undefined,
      chef: d.practical.chef,
      hours: d.practical.hours
        ? { _type: 'localizedString', en: d.practical.hours.en, fr: d.practical.hours.fr }
        : undefined,
      dressCode: d.practical.dressCode
        ? { _type: 'localizedString', en: d.practical.dressCode.en, fr: d.practical.dressCode.fr }
        : undefined,
      year: d.practical.year,
      reservation: d.reservation,
      teamNotes: d.teamNotes ? { _type: 'localizedText', en: d.teamNotes.en, fr: d.teamNotes.fr } : undefined,
      faq: (d.faq || []).map((f, idx) => ({
        _type: 'object',
        _key: `faq-${idx}-${Math.random().toString(36).slice(2, 6)}`,
        question: { _type: 'localizedString', en: f.question.en, fr: f.question.fr },
        answer: { _type: 'localizedText', en: f.answer.en, fr: f.answer.fr },
      })),
    };

    await client.create(doc);
  }

  console.log('Termine.');
}

main().catch((e) => { console.error(e); process.exit(1); });
