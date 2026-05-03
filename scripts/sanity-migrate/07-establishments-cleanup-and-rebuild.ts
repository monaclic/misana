// Les 15 docs accessEstablishment existants sont des stubs minimaux
// crees avec une ancienne version du schema (name, category, slug,
// shortEn/Fr seulement, pas de hero/thumbs). On les supprime et on
// laisse 06-establishments.ts les recreer avec le full schema.
import { client } from './_client';

async function main() {
  const docs = await client.fetch<{ _id: string }[]>(
    `*[_type == "accessEstablishment"]{ _id }`,
  );
  console.log(`Suppression de ${docs.length} stubs...`);
  for (const d of docs) {
    await client.delete(d._id);
    console.log(`  - ${d._id}`);
  }
  console.log('Termine. Relance maintenant 06-establishments.ts');
}

main().catch((e) => { console.error(e); process.exit(1); });
