// Test de l'endpoint POST /api/inquiries pour TOUS les services / scenarios.
//
// But : verifier que le payload produit par /request (buildPayload) passe la
// validation zod du serveur, pour chaque service et chaque variante (fiche,
// generique, sans item, cas limites).
//
// Lecture des resultats :
//   - 200  => zod OK + email envoye (Resend configure)
//   - 502  => zod OK mais envoi email echoue (Resend non configure en local)
//             => la VALIDATION est OK quand meme
//   - 400  => zod a REJETE le payload
//   - 429  => rate limit (5 req/min/IP) : le script attend puis reessaie
//
// Donc 200 ou 502 = "payload valide". 400 = "payload invalide".
//
// Usage :
//   node scripts/test-inquiries.mjs
//   BASE_URL=https://<preview>.vercel.app node scripts/test-inquiries.mjs
//   DELAY_MS=2000 node scripts/test-inquiries.mjs   (si rate limit relache)
//
// Par defaut on espace les requetes (13 s) pour rester sous 5 req/min.

const BASE_URL = (process.env.BASE_URL || 'http://localhost:3000').replace(/\/$/, '');
const DELAY_MS = Number(process.env.DELAY_MS || 13000);
const ENDPOINT = `${BASE_URL}/api/inquiries`;

// Contact valide commun a tous les cas.
const contact = {
  firstName: 'Test',
  lastName: 'QA',
  email: 'qa@example.com',
  phone: '612345678',
  phoneCode: '+33',
  preferredChannel: 'phone',
  whatsapp: false,
  replyLang: 'fr',
  isOther: false,
};
const c = (message) => ({ ...contact, message });

// Matrice : un cas par scenario + cas limites. `expect` = comportement ATTENDU.
const CASES = [
  // ---- Chauffeur ----
  { name: 'chauffeur-transfer', expect: 'valid', payload: {
    service: 'chauffeur', contact: c(),
    chauffeur: { mode: 'transfer', subtype: 'one-way', pickup: 'Aeroport de Nice', dropoff: 'Monaco',
      date: '2026-08-01', time: '14:00', passengers: { adults: 2, children: 0, babies: 0, pets: 0 } },
  } },
  { name: 'chauffeur-disposal', expect: 'valid', payload: {
    service: 'chauffeur', contact: c(),
    chauffeur: { mode: 'disposal', city: 'cannes', date: '2026-08-01', time: '10:00',
      passengers: { adults: 2, children: 0, babies: 0, pets: 0 } },
  } },
  { name: 'chauffeur-generic (fallback)', expect: 'valid', payload: {
    service: 'chauffeur', contact: c('Chauffeur une semaine, plusieurs trajets par jour.'),
  } },

  // ---- Cars ----
  { name: 'cars (fiche vehicule)', expect: 'valid', payload: {
    service: 'cars', contact: c(),
    cars: { rentalCarId: 'ferrari-roma', pickup: 'Nice', startDate: '2026-08-01' },
  } },
  { name: 'cars-generic', expect: 'valid', payload: {
    service: 'cars', contact: c(),
    cars: { type: 'suv', startDate: '2026-08-01', endDate: '2026-08-05', pickup: 'Cannes' },
  } },

  // ---- Yacht ----
  { name: 'yacht (fiche)', expect: 'valid', payload: {
    service: 'yacht', contact: c(),
    yacht: { yachtId: 'serenity', port: 'Cannes', startDate: '2026-08-01', guests: 6 },
  } },
  { name: 'yacht-generic (demande directe)', expect: 'valid', payload: {
    service: 'yacht', contact: c(),
    yacht: { port: 'Cannes', startDate: '2026-08-01', guests: 6 },
  } },

  // ---- Helicopter ----
  { name: 'helicopter-route', expect: 'valid', payload: {
    service: 'helicopter', contact: c(),
    helicopter: { departure: 'NCE', destination: 'MCM', date: '2026-08-01', time: '10:00',
      passengers: { adults: 2, children: 0, babies: 0, pets: 0 } },
  } },
  { name: 'helicopter dep==dest (refine doit refuser)', expect: 'invalid', payload: {
    service: 'helicopter', contact: c(),
    helicopter: { departure: 'NCE', destination: 'NCE' },
  } },

  // ---- Access ----
  { name: 'access (fiche etablissement)', expect: 'valid', payload: {
    service: 'access', contact: c(),
    access: { items: [{ establishment: 'le-louis-xv', city: 'monaco', date: '2026-08-01', guests: 4, occasion: 'none' }] },
  } },
  { name: 'access-generic', expect: 'valid', payload: {
    service: 'access', contact: c(),
    access: { items: [{ category: 'restaurant', city: 'cannes', date: '2026-08-01', guests: 2, occasion: 'none' }], notes: 'Terrasse si possible' },
  } },
  { name: 'access SANS items (superRefine doit refuser)', expect: 'invalid', payload: {
    service: 'access', contact: c('Une table quelque part'),
  } },

  // ---- Villa ----
  { name: 'villa (fiche)', expect: 'valid', payload: {
    service: 'villa', contact: c(),
    villa: { villaId: 'chateau-fiora-cannes', city: 'cannes', startDate: '2026-08-01', endDate: '2026-08-08', guests: 8 },
  } },
  { name: 'villa SANS slug (+ area)', expect: 'valid', payload: {
    service: 'villa', contact: c(),
    villa: { area: 'Saint-Tropez, 6 chambres, vue mer', startDate: '2026-08-01', endDate: '2026-08-08', guests: 8 },
  } },

  // ---- Event / Weekend / Multi (fallback => service:'multi') ----
  { name: 'event/multi (service:multi)', expect: 'valid', payload: {
    service: 'multi', event: 'festival-de-cannes', contact: c('Sejour autour du Festival de Cannes.'),
  } },

  // ---- Cas limites validation ----
  { name: 'contact tel sans indicatif (doit refuser)', expect: 'invalid', payload: {
    service: 'cars', cars: {}, contact: { ...c(), phoneCode: undefined },
  } },
  { name: 'honeypot rempli (bot, doit refuser)', expect: 'invalid', payload: {
    service: 'cars', cars: {}, contact: c(), honeypot: 'i-am-a-bot',
  } },
  { name: 'email invalide (doit refuser)', expect: 'invalid', payload: {
    service: 'cars', cars: {}, contact: { ...c(), email: 'pas-un-email' },
  } },
];

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

async function postOnce(payload) {
  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.status;
  } catch (e) {
    return `ERR:${e?.message || e}`;
  }
}

// 200/502 = valide ; 400 = invalide ; 429 = retente.
async function post(payload) {
  let status = await postOnce(payload);
  if (status === 429) {
    process.stdout.write(' [429 rate limit, attente 60s] ');
    await sleep(60000);
    status = await postOnce(payload);
  }
  return status;
}

function verdict(status) {
  if (status === 200 || status === 502) return 'valid';
  if (status === 400) return 'invalid';
  return 'unknown';
}

async function main() {
  console.log(`Endpoint : ${ENDPOINT}`);
  console.log(`Delai entre requetes : ${DELAY_MS} ms (5 req/min max)\n`);
  let pass = 0; let fail = 0;
  const fails = [];
  for (let i = 0; i < CASES.length; i++) {
    const t = CASES[i];
    const status = await post(t.payload);
    const v = verdict(status);
    const ok = v === t.expect;
    const mark = ok ? 'OK  ' : 'FAIL';
    console.log(`${mark} | http=${String(status).padEnd(6)} | attendu=${t.expect.padEnd(7)} obtenu=${v.padEnd(7)} | ${t.name}`);
    if (ok) pass++; else { fail++; fails.push({ ...t, status, v }); }
    if (i < CASES.length - 1) await sleep(DELAY_MS);
  }
  console.log(`\nResultat : ${pass}/${CASES.length} OK, ${fail} FAIL`);
  if (fails.length) {
    console.log('\nEchecs (a corriger) :');
    for (const f of fails) console.log(`  - ${f.name} : http=${f.status}, attendu=${f.expect}, obtenu=${f.v}`);
    process.exit(1);
  }
}

main();
