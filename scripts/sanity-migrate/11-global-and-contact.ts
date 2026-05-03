// Migration : globalSettings (phone, email, social) + contactPage (overrides vides).
// On pre-remplit globalSettings avec les valeurs actuellement en dur dans
// le code, l'associee pourra ensuite les modifier depuis Studio.
import { client } from './_client';

async function main() {
  console.log('Migration globalSettings + contactPage...');

  // --- globalSettings ---
  const existingGS = await client.fetch<any>(`*[_id == "globalSettings"][0]`);
  if (existingGS && existingGS.contactPhone) {
    console.log('  globalSettings deja en base, skip.');
  } else {
    await client.createOrReplace({
      _id: 'globalSettings',
      _type: 'globalSettings',
      contactPhone: '+33 4 00 00 00 00',
      contactPhoneHref: 'tel:+33400000000',
      contactEmail: 'hello@misana.com',
      whatsappNumber: '',
      address: { _type: 'localizedString', en: '', fr: '' },
      instagram: '',
      linkedin: '',
    });
    console.log('  globalSettings cree.');
  }

  // --- contactPage ---
  const existingCP = await client.fetch<any>(`*[_id == "contactPage"][0]`);
  if (existingCP) {
    console.log('  contactPage deja en base, skip.');
  } else {
    await client.createOrReplace({
      _id: 'contactPage',
      _type: 'contactPage',
    });
    console.log('  contactPage cree (overrides vides).');
  }

  console.log('Termine.');
}

main().catch((e) => { console.error(e); process.exit(1); });
