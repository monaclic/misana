// Migration des categories de voitures de location vers Sanity.
import { client } from './_client';
import { RENTAL_CATEGORIES } from '../../lib/rentalCars';

async function main() {
  console.log(`Migration de ${RENTAL_CATEGORIES.length} categories...`);

  for (let i = 0; i < RENTAL_CATEGORIES.length; i++) {
    const cat = RENTAL_CATEGORIES[i];
    const doc = {
      _id: `rentalCarCategory.${cat.id}`,
      _type: 'rentalCarCategory',
      slug: { _type: 'slug', current: cat.id },
      name: { _type: 'localizedString', en: cat.label, fr: cat.labelFr },
      order: i,
    };
    await client.createOrReplace(doc);
    console.log(`  OK ${cat.id} (${cat.labelFr})`);
  }

  console.log('Termine.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
