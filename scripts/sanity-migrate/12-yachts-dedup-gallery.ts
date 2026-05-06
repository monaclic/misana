// Patch one-shot : retire gallery[0] de chaque yacht Sanity car ce
// premier item est toujours un duplicate visuel de hero (heritage
// de lib/yachts.ts ou images[0] etait egal a hero URL).
//
// Effet : sur les fiches /yacht/[yacht], le slider gallery
// commence par la premiere VRAIE image differente de hero, plus de
// doublon.
import { client } from './_client';

async function main() {
  console.log('Dedup gallery yachts (retire gallery[0])...');

  const yachts = await client.fetch<Array<{ _id: string; gallery?: Array<{ _key: string }>; name: string }>>(
    `*[_type == "yacht" && published == true]{ _id, name, gallery }`,
  );
  console.log(`  ${yachts.length} yachts a traiter.`);

  let updated = 0;
  let skipped = 0;
  for (const y of yachts) {
    if (!y.gallery || y.gallery.length < 2) {
      skipped++;
      continue;
    }
    const newGallery = y.gallery.slice(1);
    await client.patch(y._id).set({ gallery: newGallery }).commit();
    updated++;
    console.log(`  ✓ ${y.name} : ${y.gallery.length} -> ${newGallery.length} images`);
  }

  console.log(`Termine. ${updated} updates, ${skipped} skip (galerie vide ou 1 image).`);
}

main().catch((e) => { console.error(e); process.exit(1); });
