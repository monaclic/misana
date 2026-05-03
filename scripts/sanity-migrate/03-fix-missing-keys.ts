// One-shot : ajoute des _key aux items des arrays gallery / hero pour les
// documents rentalCar existants. Sanity Studio refuse d'editer les arrays
// d'objets sans _key. Pas de re-upload d'images, juste un patch.
import { client } from './_client';

type AnyDoc = {
  _id: string;
  _type: string;
  hero?: any;
  gallery?: any[];
};

function withKey(obj: any, idx: number) {
  if (!obj || typeof obj !== 'object') return obj;
  if (obj._key) return obj;
  return { ...obj, _key: `img-${idx}-${Math.random().toString(36).slice(2, 8)}` };
}

async function main() {
  const docs: AnyDoc[] = await client.fetch(
    `*[_type == "rentalCar"]{ _id, _type, hero, gallery }`,
  );
  console.log(`A patcher : ${docs.length} fiches`);

  for (const doc of docs) {
    const patches: Record<string, any> = {};
    if (Array.isArray(doc.gallery)) {
      const fixed = doc.gallery.map((g, i) => withKey(g, i));
      const needs = fixed.some((g, i) => g !== doc.gallery![i]);
      if (needs) patches.gallery = fixed;
    }
    if (Object.keys(patches).length === 0) {
      console.log(`  skip ${doc._id} (rien a faire)`);
      continue;
    }
    await client.patch(doc._id).set(patches).commit();
    console.log(`  OK ${doc._id}`);
  }

  console.log('Termine.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
