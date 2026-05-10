// Migration ponctuelle : remplit les champs EN bilingues des 32 fiches access
// avec de vraies traductions EN (au lieu du FR brut copie par le scraper
// Excellence). Une fois la migration appliquee, le composable peut lire les
// vraies valeurs Sanity sans logique de traduction runtime.
//
// Champs ecrits :
// - shortLine.en : vraie EN (ex : "French, chic & casual" au lieu de FR copie)
// - signatureTags.fr : ambiance FR (preserve)
// - signatureTags.en : ambiance traduite EN
// - cuisine.fr : cuisineType.join(', ') (FR)
// - cuisine.en : cuisineType traduit EN, joine
//
// shortLine.fr est aussi corrige : on lowercase la 2e partie pour matcher le
// pattern FR original tel qu'il etait scrappe.
//
// Run : pnpm tsx scripts/migrate-access-en.ts --dotenv .env.local
//
// Le script patch + publish chaque fiche. Idempotent : relancable sans risque.

import { createClient } from '@sanity/client';

const SANITY_WRITE_TOKEN = process.env.SANITY_WRITE_TOKEN;
if (!SANITY_WRITE_TOKEN) {
  console.error('Missing SANITY_WRITE_TOKEN');
  process.exit(1);
}

const client = createClient({
  projectId: 'akpi9bfm',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: SANITY_WRITE_TOKEN,
  useCdn: false,
});

const CUISINE_FR_EN: Record<string, string> = {
  'Argentine': 'Argentinian',
  'Asiatique': 'Asian',
  'Méditerranéenne': 'Mediterranean',
  'Péruvienne': 'Peruvian',
  'Française': 'French',
  'Italienne': 'Italian',
  'Internationale': 'International',
  'Grecque': 'Greek',
  'Japonais': 'Japanese',
  'Japonaise': 'Japanese',
  'Mexicaine': 'Mexican',
  'Marocaine': 'Moroccan',
  'Espagnole': 'Spanish',
};

const AMBIANCE_FR_EN: Record<string, string> = {
  'Élegante & raffinée': 'Elegant & refined',
  'Élégante & raffinée': 'Elegant & refined',
  'Chic & décontractée': 'Chic & casual',
  'Festive': 'Lively',
  'Musique live': 'Live music',
  'Ouvert le soir': 'Open in the evening',
  'Familiale': 'Family',
  'Sunset': 'Sunset',
  'Romantique': 'Romantic',
  'Calme & intime': 'Quiet & intimate',
  'Décontractée': 'Casual',
};

const ALL: Record<string, string> = { ...CUISINE_FR_EN, ...AMBIANCE_FR_EN };

function tr(s: string): string {
  return ALL[s] ?? s;
}

function trArr(arr: string[] | undefined): string[] {
  return Array.isArray(arr) ? arr.map(tr) : [];
}

// Recompose une signature courte au format FR original :
// "{Cuisine[0]}, {ambiance[0].lower}". Identique cote EN avec les valeurs
// traduites. Si pas de cuisine, fallback sur ambiance[0] capitalise.
function buildShortLine(cuisine0: string | undefined, ambiance0: string | undefined): string {
  if (cuisine0 && ambiance0) {
    const lowered = ambiance0.charAt(0).toLowerCase() + ambiance0.slice(1);
    return `${cuisine0}, ${lowered}`;
  }
  if (cuisine0) return cuisine0;
  if (ambiance0) return ambiance0;
  return '';
}

type Doc = {
  _id: string;
  slug: string;
  cuisineType?: string[];
  ambiance?: string[];
  shortLineFr?: string;
};

async function main() {
  console.log('Fetching 32 establishments...');
  const docs: Doc[] = await client.fetch(
    `*[_type == "accessEstablishment" && published == true] {
      _id,
      "slug": slug.current,
      cuisineType,
      ambiance,
      "shortLineFr": shortLine.fr,
    }`,
  );
  console.log(`Got ${docs.length} docs.`);

  let ok = 0;
  let fail = 0;

  for (const doc of docs) {
    const cuisineFr = doc.cuisineType ?? [];
    const ambianceFr = doc.ambiance ?? [];
    const cuisineEn = trArr(cuisineFr);
    const ambianceEn = trArr(ambianceFr);

    const shortLineEn = buildShortLine(cuisineEn[0], ambianceEn[0]);
    const shortLineFrRebuilt = buildShortLine(cuisineFr[0], ambianceFr[0]);

    const cuisineLocFr = cuisineFr.join(', ');
    const cuisineLocEn = cuisineEn.join(', ');

    const set: Record<string, any> = {
      'shortLine.en': shortLineEn,
      'signatureTags': {
        _type: 'localizedStringArray',
        fr: ambianceFr,
        en: ambianceEn,
      },
    };
    if (cuisineLocFr || cuisineLocEn) {
      set['cuisine'] = {
        _type: 'localizedString',
        fr: cuisineLocFr,
        en: cuisineLocEn,
      };
    }
    // On corrige aussi shortLine.fr si le pattern n'etait pas applique correctement
    // (cas typique : le scraper a renvoye une string deja construite mais avec
    // capitalisation incoherente). On reconstruit a partir des sources.
    if (shortLineFrRebuilt) {
      set['shortLine.fr'] = shortLineFrRebuilt;
    }

    try {
      // patch publie + cree/maj draft. On veut que la valeur soit en prod : on
      // publie ensuite le draft via createOrReplace de la version published.
      // Methode simple : patch published directement via .patch().
      await client.patch(doc._id).set(set).commit();
      console.log(`✓ ${doc._id} (${doc.slug})`);
      ok++;
    } catch (err: any) {
      console.error(`✗ ${doc._id}: ${err?.message ?? err}`);
      fail++;
    }
  }

  console.log(`\nDone: ${ok} ok, ${fail} fail.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
