// Patch ponctuel : globalSettings.contactPhone / contactPhoneHref /
// whatsappNumber / contactEmail. Le doc Sanity est utilise par AppFooter
// (Reach us) et la page Contact via le composable useGlobalSettings.

import { createClient } from '@sanity/client';

const TOKEN = process.env.SANITY_WRITE_TOKEN;
if (!TOKEN) {
  console.error('Missing SANITY_WRITE_TOKEN');
  process.exit(1);
}

const client = createClient({
  projectId: 'akpi9bfm',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: TOKEN,
  useCdn: false,
});

async function main() {
  const before = await client.fetch(
    `*[_id == "globalSettings"][0] { contactPhone, contactPhoneHref, contactEmail, whatsappNumber }`,
  );
  console.log('Before:', before);

  const patched = await client
    .patch('globalSettings')
    .set({
      contactPhone: '+33 6 34 12 33 93',
      contactPhoneHref: 'tel:+33634123393',
      whatsappNumber: '+33634123393',
      contactEmail: 'contact@misana-group.com',
    })
    .commit();

  console.log('Done. Doc revision:', patched._rev);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
