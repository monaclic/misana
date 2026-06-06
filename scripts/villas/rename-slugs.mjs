/**
 * Renomme les slugs des 28 villas selon l'architecture SEO finale :
 *   - "Villa" strippe du slug (mais garde dans le nom/H1)
 *   - nom distinctif + ville (champ city), kebab, sans accent
 *   - slug IDENTIQUE EN et FR
 *
 * Table explicite (validee avec l'utilisateur). "Villa de l'Oumede" -> l-oumede.
 *
 * Usage :
 *   node --env-file=.env.local scripts/villas/rename-slugs.mjs          (dry-run)
 *   node --env-file=.env.local scripts/villas/rename-slugs.mjs --write  (patch)
 */

const DRY_RUN = !process.argv.includes('--write');

const SLUGS = {
  'Château Fiora': 'chateau-fiora-cannes',
  'Domaine des Cistes': 'domaine-des-cistes-sainte-maxime',
  "Domaine des Palmes d'Or": 'domaine-des-palmes-d-or-antibes',
  'Loft Clemenceau': 'loft-clemenceau-saint-tropez',
  'The Beach House': 'the-beach-house-la-croix-valmer',
  'Villa Alba': 'alba-ramatuelle',
  'Villa Castel': 'castel-cannes',
  'Villa Cobain': 'cobain-saint-tropez',
  'Villa Costa Azzurra': 'costa-azzurra-cap-d-antibes',
  'Villa Dalya': 'dalya-mougins',
  'Villa Ema': 'ema-villefranche-sur-mer',
  'Villa Euphoria': 'euphoria-gassin',
  'Villa Evissa': 'evissa-sainte-maxime',
  'Villa Five Senses': 'five-senses-villefranche-sur-mer',
  'Villa Garoupa': 'garoupa-cap-d-antibes',
  'Villa Giuseppa': 'giuseppa-la-croix-valmer',
  'Villa Grant': 'grant-ramatuelle',
  'Villa Jungle': 'jungle-saint-tropez',
  'Villa Lyra': 'lyra-saint-tropez',
  'Villa Malenna': 'malenna-grimaud',
  'Villa Marine': 'marine-saint-tropez',
  'Villa Olympéa': 'olympea-grimaud',
  'Villa Pulpito': 'pulpito-cavalaire-sur-mer',
  'Villa Rive Bleue': 'rive-bleue-cap-d-antibes',
  'Villa Stefanie': 'stefanie-antibes',
  'Villa Sérénité': 'serenite-cannes',
  "Villa de l'Oumede": 'l-oumede-ramatuelle',
  "l'Oasis des Pins": 'l-oasis-des-pins-saint-tropez',
};

async function loadClient() {
  const { createClient } = await import('@sanity/client');
  const env = process.env;
  return createClient({
    projectId: env.NUXT_PUBLIC_SANITY_PROJECT_ID ?? 'akpi9bfm',
    dataset: env.NUXT_PUBLIC_SANITY_DATASET ?? 'production',
    token: env.SANITY_AUTH_TOKEN ?? env.SANITY_WRITE_TOKEN,
    apiVersion: '2024-01-01', useCdn: false,
  });
}

async function main() {
  console.log(`\n=== Rename slugs villas ${DRY_RUN ? '(DRY-RUN)' : '(WRITE)'} ===\n`);
  const client = await loadClient();
  const villas = await client.fetch('*[_type=="villa"]{_id, name, "fr": slugI18n.fr.current, "en": slugI18n.en.current} | order(name asc)');

  // Verification : chaque villa Sanity a une entree dans SLUGS, et inversement.
  const missing = villas.filter((v) => !SLUGS[v.name]);
  const extra = Object.keys(SLUGS).filter((n) => !villas.some((v) => v.name === n));
  if (missing.length) { console.error('VILLAS SANS SLUG CIBLE :', missing.map((v) => v.name)); process.exit(1); }
  if (extra.length) { console.error('SLUGS SANS VILLA CORRESPONDANTE :', extra); process.exit(1); }
  if (villas.length !== 28) console.warn(`ATTENTION : ${villas.length} villas (attendu 28)`);

  let changed = 0;
  for (const v of villas) {
    const next = SLUGS[v.name];
    const same = v.fr === next && v.en === next;
    console.log(`${same ? '=' : '→'} ${v.name.padEnd(26)} ${v.fr} | ${v.en}  =>  ${next}`);
    if (same) continue;
    changed++;
    if (!DRY_RUN) {
      await client.patch(v._id).set({ 'slugI18n.fr.current': next, 'slugI18n.en.current': next }).commit();
    }
  }
  console.log(`\n=== ${changed}/${villas.length} a changer ===`);
  if (DRY_RUN) console.log('Dry-run : relancer avec --write pour patcher.');
}

main().catch((e) => { console.error('FATAL', e); process.exit(1); });
