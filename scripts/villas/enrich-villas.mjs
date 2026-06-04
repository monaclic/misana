/**
 * Enrichissement des villas deja importees dans Sanity.
 *
 * Probleme resolu : l'import initial (import-villas.mjs) n'a peuple que les
 * champs plats et a duplique le FR dans l'EN. Les relationships LC (areas,
 * equipments, pools, services, stayInformation) n'etaient pas mappees.
 *
 * Ce script, pour chaque villa publiee dans Sanity :
 *   - appelle l'API LC v3 en /fr/ ET /en/ (api.lecollectionist.com) avec les
 *     includes complets ;
 *   - reconstruit les champs manquants (keyFeatures, rooms, amenities, pools,
 *     includedServices, aLaCarteServices, housekeepingFrequency, checkInTime,
 *     checkOutTime) et corrige les champs bilingues (shortDesc, body,
 *     surroundingDescription) ;
 *   - PATCH uniquement ces champs. Ne touche pas hero/gallery/order/featured/
 *     published/slug (donc pas de re-upload de photos).
 *
 * Usage :
 *   node --env-file=.env.local scripts/villas/enrich-villas.mjs          (dry-run)
 *   node --env-file=.env.local scripts/villas/enrich-villas.mjs --write   (patch Sanity)
 *   ... --id 2419       (limite a une villa, debug)
 */

const DRY_RUN = !process.argv.includes('--write');
const ONLY_ID = (() => {
  const i = process.argv.indexOf('--id');
  return i >= 0 ? parseInt(process.argv[i + 1], 10) : null;
})();

const API = 'https://api.lecollectionist.com';
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const RATE_API_MS = 1500;
const FETCH_TIMEOUT_MS = 45000;
const INCLUDES = [
  'areas.equipments.equipment_type',
  'areas.area_type',
  'pools',
  'included_services',
  'stay_information',
  'surrounding_information',
  'collection',
].join(',');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// === Utils texte ===
function stripHtml(html) {
  if (!html) return '';
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'").replace(/[ \t]+/g, ' ').replace(/\n[ \t]+/g, '\n')
    .replace(/\n{3,}/g, '\n\n').trim();
}
function textToPortableText(text, lang) {
  if (!text) return [];
  return text.split(/\n\n+/).filter(Boolean).map((para, i) => ({
    _type: 'block', _key: `${lang}-b${i}`, style: 'normal', markDefs: [],
    children: [{ _type: 'span', _key: `${lang}-s${i}`, text: para.trim(), marks: [] }],
  }));
}

// === Fetch ===
async function fetchJson(url) {
  const backoffs = [0, 1500, 4000];
  let lastErr = null;
  for (let i = 0; i < backoffs.length; i++) {
    if (backoffs[i]) await sleep(backoffs[i]);
    const controller = new AbortController();
    const to = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    try {
      const res = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/json' }, signal: controller.signal });
      clearTimeout(to);
      if (res.status === 429) { await sleep(30000); continue; }
      if (res.status >= 500) { lastErr = new Error(`HTTP ${res.status}`); continue; }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    } catch (e) { clearTimeout(to); lastErr = e; }
  }
  throw lastErr ?? new Error('fetch failed');
}
const fetchHouse = (id, lang) =>
  fetchJson(`${API}/${lang}/api/v3/houses/${id}?include=${encodeURI(INCLUDES)}`);

// === Helpers JSON:API ===
function indexIncluded(json) {
  const map = new Map();
  for (const item of json.included ?? []) map.set(`${item.type}:${item.id}`, item);
  return map;
}
const ref = (map, r) => (r?.id && r?.type ? map.get(`${r.type}:${r.id}`) ?? null : null);
function eqTypeOf(map, equipment) {
  return ref(map, equipment?.relationships?.equipmentType?.data);
}
function areaEquipments(map, area) {
  return (area?.relationships?.equipments?.data ?? [])
    .map((d) => map.get(`equipment:${d.id}`))
    .filter(Boolean);
}

// === Mappers ===
const BED_RE = /bed|bunk|sofa_bed/;

function mapRooms(map, areas) {
  const beds = areas.filter((a) => a.attributes.identifier === 'adults_bedroom'
    || a.attributes.identifier === 'children_bedroom');
  return beds
    .sort((a, b) => (a.attributes.position ?? 0) - (b.attributes.position ?? 0))
    .map((a) => {
      const eqs = areaEquipments(map, a);
      const ids = eqs.map((e) => eqTypeOf(map, e)?.attributes?.identifier ?? '');
      const bedEq = eqs.find((e) => BED_RE.test(eqTypeOf(map, e)?.attributes?.identifier ?? ''));
      const bedNameRaw = bedEq ? eqTypeOf(map, bedEq)?.attributes?.name : null;
      const bedSize = bedEq?.attributes?.bedSize;
      const bedName = bedNameRaw ? {
        fr: bedNameRaw.fr + (bedSize ? ` (${bedSize})` : ''),
        en: bedNameRaw.en + (bedSize ? ` (${bedSize})` : ''),
      } : null;
      const seaView = a.attributes.view === 'sea' || a.attributes.viewType === 'seaview'
        || /sea|mer/i.test(a.attributes.view ?? '');
      return {
        _key: `room-${a.id}`,
        name: a.attributes.name ? { _type: 'localizedString', en: a.attributes.name.en, fr: a.attributes.name.fr } : undefined,
        bedType: bedName ? { _type: 'localizedString', en: bedName.en, fr: bedName.fr } : undefined,
        tv: ids.some((i) => /tv|television|screen/.test(i)),
        ac: ids.some((i) => /air_conditioning|conditioning/.test(i)),
        safe: ids.includes('strongbox'),
        terrace: ids.includes('terrace'),
        seaView,
        ensuiteBathroom: a.attributes.bathType != null,
      };
    });
}

function collectAmenities(map, areas) {
  const seen = new Map(); // identifier -> {en,fr}
  for (const a of areas) {
    for (const e of areaEquipments(map, a)) {
      const et = eqTypeOf(map, e);
      const id = et?.attributes?.identifier;
      const nm = et?.attributes?.name;
      if (id && nm && !seen.has(id)) seen.set(id, nm);
    }
  }
  const list = [...seen.values()];
  return {
    fr: list.map((n) => n.fr).filter(Boolean).sort((x, y) => x.localeCompare(y, 'fr')),
    en: list.map((n) => n.en).filter(Boolean).sort((x, y) => x.localeCompare(y, 'en')),
  };
}

// Equipements groupes par piece (structure type Le Collectionist).
const GARDEN_TAGS = {
  with_grass: { fr: 'Avec pelouse', en: 'With grass' },
  wooded_garden: { fr: 'Arboré', en: 'Wooded' },
  vegetable_garden: { fr: 'Potager', en: 'Vegetable garden' },
  flowered: { fr: 'Fleuri', en: 'Flowered' },
};
function poolEquipDetail(pools) {
  const p = pools[0]?.attributes;
  if (!p) return null;
  const fr = []; const en = [];
  if ((p.options ?? []).includes('infinite')) { fr.push('À débordement'); en.push('Infinity'); }
  if (p.heater && p.heater !== 'none') { fr.push('Chauffable'); en.push('Heatable'); }
  if (p.treatment === 'salt_water') { fr.push('Au sel'); en.push('Salt water'); }
  return fr.length ? { fr: fr.join(' · '), en: en.join(' · ') } : null;
}
function buildAreas(map, areas, pools) {
  const out = [];
  for (const a of areas) {
    const at = a.attributes;
    // Les chambres sont rendues a part (bloc "Decouvrez les chambres"),
    // comme sur LC : on les exclut des onglets equipements.
    if (at.accessibleToStaff || /bedroom/.test(at.identifier ?? '')) continue;
    const eqs = areaEquipments(map, a);
    const ids = eqs.map((e) => eqTypeOf(map, e)?.attributes?.identifier ?? '');

    const tagsFr = []; const tagsEn = [];
    if (at.view === 'sea' || at.viewType === 'seaview') { tagsFr.push('Vue mer'); tagsEn.push('Sea view'); }
    if (ids.some((i) => /air_conditioning|conditioning/.test(i))) { tagsFr.push('Climatisation'); tagsEn.push('Air conditioning'); }
    if ((at.kitchenType ?? []).includes('professional')) { tagsFr.push('Professionnelle'); tagsEn.push('Professional'); }
    for (const g of at.gardenType ?? []) { const m = GARDEN_TAGS[g]; if (m) { tagsFr.push(m.fr); tagsEn.push(m.en); } }
    if (at.bathType === 'attached') { tagsFr.push('Attenante'); tagsEn.push('Ensuite'); }

    const items = eqs.map((e) => {
      const t = eqTypeOf(map, e)?.attributes?.name;
      if (!t) return null;
      const ea = e.attributes;
      const qty = ea.quantity > 1 ? `${ea.quantity} ` : '';
      let detailFr = null; let detailEn = null;
      if (eqTypeOf(map, e)?.attributes?.identifier === 'pool') {
        const pd = poolEquipDetail(pools); if (pd) { detailFr = pd.fr; detailEn = pd.en; }
      } else if (ea.capacity) { detailFr = `${ea.capacity} places`; detailEn = `${ea.capacity} seats`; }
      else if (ea.brandModel) { detailFr = ea.brandModel; detailEn = ea.brandModel; }
      else if (ea.bedSize) { detailFr = ea.bedSize; detailEn = ea.bedSize; }
      else if (ea.comment) { detailFr = ea.comment; detailEn = ea.comment; }
      return { labelFr: `${qty}${t.fr}`.trim(), labelEn: `${qty}${t.en}`.trim(), detailFr: detailFr ?? undefined, detailEn: detailEn ?? undefined };
    }).filter(Boolean);

    if (!items.length && !tagsFr.length) continue;
    out.push({
      _key: `area-${a.id}`,
      identifier: at.identifier ?? null,
      nameFr: at.name?.fr ?? null,
      nameEn: at.name?.en ?? null,
      inside: !!at.inside,
      tagsFr, tagsEn,
      items,
      _pos: at.position ?? 0,
    });
  }
  // Exterieur d'abord, puis Interieur ; par position
  out.sort((x, y) => (x.inside === y.inside ? x._pos - y._pos : x.inside ? 1 : -1));
  return out.map(({ _pos, ...rest }) => rest);
}

function hasEqType(map, areas, re) {
  return areas.some((a) => areaEquipments(map, a)
    .some((e) => re.test(eqTypeOf(map, e)?.attributes?.identifier ?? '')));
}

function deriveKeyFeatures(map, areas, attrs, surr, pools) {
  const fr = []; const en = [];
  const push = (f, e) => { fr.push(f); en.push(e); };
  const pool = pools[0]?.attributes;
  if (pool) {
    if ((pool.options ?? []).includes('infinite')) push('Piscine à débordement', 'Infinity pool');
    else push('Piscine', 'Swimming pool');
    if (pool.heater && pool.heater !== 'none') push('Piscine chauffable', 'Heatable pool');
  }
  if (surr?.seaView) push('Vue panoramique sur la mer', 'Panoramic sea view');
  if (hasEqType(map, areas, /air_conditioning|conditioning/)) push('Climatisation', 'Air conditioning');
  if (hasEqType(map, areas, /barbecue/)) push('Barbecue', 'Barbecue');
  if (hasEqType(map, areas, /^plancha$/)) push('Plancha', 'Plancha');
  if (attrs.elevator) push('Ascenseur', 'Elevator');
  if (attrs.floorHeatingSystem) push('Chauffage au sol', 'Floor heating');
  if (surr?.golf) push("À proximité d'un golf", 'Golf nearby');
  if (areas.some((a) => a.attributes.identifier === 'garden')) push('Jardin', 'Garden');
  if (areas.some((a) => ['fitness_room', 'spa', 'hammam'].includes(a.attributes.identifier))) push('Espace bien-être', 'Wellness area');
  // dedupe (keep order)
  const outFr = []; const outEn = []; const s = new Set();
  for (let i = 0; i < fr.length; i++) { if (!s.has(fr[i])) { s.add(fr[i]); outFr.push(fr[i]); outEn.push(en[i]); } }
  return { fr: outFr, en: outEn };
}

function mapPools(map, pools) {
  return pools.map((p, i) => {
    const a = p.attributes;
    const sunbeds = null; // les loungers ne sont pas fiables par piscine
    return {
      _key: `pool-${p.id ?? i}`,
      heated: !!a.heater && a.heater !== 'none',
      indoor: a.poolType === 'interior' || a.poolType === 'indoor',
      lengthM: typeof a.length === 'number' ? a.length : null,
      widthM: typeof a.width === 'number' ? a.width : null,
      sunbeds,
    };
  });
}

function mapStay(stay) {
  if (!stay) return {};
  const parseH = (s) => {
    if (typeof s === 'number') return s;
    if (typeof s === 'string') { const m = s.match(/^(\d{1,2})/); return m ? parseInt(m[1], 10) : null; }
    return null;
  };
  const days = Array.isArray(stay.householdFrequency) ? stay.householdFrequency.length : null;
  const hk = days == null ? null
    : days >= 7 ? { _type: 'localizedString', fr: 'Tous les jours', en: 'Every day' }
    : { _type: 'localizedString', fr: `${days}x/semaine`, en: `${days}x/week` };
  return {
    checkInTime: parseH(stay.checkInTime),
    checkOutTime: parseH(stay.checkOutTime),
    petFriendly: stay.petFriendly ?? null,
    suitableForChildren: stay.suitableForChildren ?? null,
    suitableForPeopleWithReducedMobility: stay.suitableForPeopleWithReducedMobility ?? null,
    housekeepingFrequency: hk,
  };
}

// Services : catalogues standard Le Collectionist (Collection Signature /
// Iconic). Le ménage est injecte depuis stayInformation.
const INCLUDED_BASE = {
  fr: [
    'Concierge dédié avant et pendant votre séjour',
    'Accueil personnalisé',
    'Indispensables du quotidien fournis pour les premiers jours',
    'Recommandations et réservations de restaurants',
  ],
  en: [
    'Dedicated concierge before and during your stay',
    'Personalised welcome',
    'Daily essentials provided for the first few days',
    'Restaurant recommendations and bookings',
  ],
};
const A_LA_CARTE = {
  fr: [
    "Transfert à l'arrivée et au départ", "Courses livrées avant l'arrivée",
    'Location de voiture', 'Chef à domicile', 'Personnel de maison supplémentaire',
    'Bien-être à domicile', 'Babysitter', 'Location de vélo', 'Location de bateau',
    'Sports nautiques', 'Visites guidées et excursions', 'Visites gastronomiques',
  ],
  en: [
    'Arrival and departure transfer', 'Grocery delivery before arrival',
    'Car rental', 'Private chef', 'Additional household staff',
    'In-home wellness', 'Babysitter', 'Bike rental', 'Boat rental',
    'Water sports', 'Guided tours and excursions', 'Food tours',
  ],
};
function buildIncludedServices(hk) {
  const fr = []; const en = [];
  if (hk) { fr.push(`Ménage ${hk.fr.toLowerCase().includes('jour') ? hk.fr.toLowerCase() : hk.fr}`); en.push(`Housekeeping ${hk.en.toLowerCase()}`); }
  return { fr: [...fr, ...INCLUDED_BASE.fr], en: [...en, ...INCLUDED_BASE.en] };
}

// === Build patch ===
function buildEnrichment(fr, en) {
  const data = fr.data;
  const a = data.attributes ?? {};
  const map = indexIncluded(fr);
  const r = data.relationships ?? {};
  const areas = (r.areas?.data ?? []).map((d) => map.get(`area:${d.id}`)).filter(Boolean);
  const pools = (r.pools?.data ?? []).map((d) => map.get(`pool:${d.id}`)).filter(Boolean);
  const surr = ref(map, r.surroundingInformation?.data)?.attributes ?? null;
  const stay = ref(map, r.stayInformation?.data)?.attributes ?? null;

  const stayFields = mapStay(stay);
  const keyFeatures = deriveKeyFeatures(map, areas, a, surr, pools);
  const amenities = collectAmenities(map, areas);
  const rooms = mapRooms(map, areas);
  const areasDetail = buildAreas(map, areas, pools);
  const mappedPools = mapPools(map, pools);
  const included = buildIncludedServices(stayFields.housekeepingFrequency);

  // textes bilingues
  const ea = en.data.attributes ?? {};
  const shortDesc = (a.leadText || ea.leadText)
    ? { _type: 'localizedText', fr: a.leadText ?? '', en: ea.leadText ?? a.leadText ?? '' } : null;
  const bodyFr = textToPortableText(stripHtml(a.description), 'fr');
  const bodyEn = textToPortableText(stripHtml(ea.description), 'en');
  const body = bodyFr.length ? { _type: 'localizedPortableText', fr: bodyFr, en: bodyEn.length ? bodyEn : bodyFr } : null;
  const surrDesc = (a.surrounding || ea.surrounding)
    ? { _type: 'localizedText', fr: stripHtml(a.surrounding), en: stripHtml(ea.surrounding || a.surrounding) } : null;

  const patch = {
    keyFeatures: keyFeatures.fr.length ? { _type: 'localizedStringArray', fr: keyFeatures.fr, en: keyFeatures.en } : undefined,
    amenities: amenities.fr.length ? { _type: 'localizedStringArray', fr: amenities.fr, en: amenities.en } : undefined,
    rooms: rooms.length ? rooms : undefined,
    areasDetail: areasDetail.length ? areasDetail : undefined,
    pools: mappedPools.length ? mappedPools : undefined,
    includedServices: { _type: 'localizedStringArray', fr: included.fr, en: included.en },
    aLaCarteServices: { _type: 'localizedStringArray', fr: A_LA_CARTE.fr, en: A_LA_CARTE.en },
    housekeepingFrequency: stayFields.housekeepingFrequency ?? undefined,
    checkInTime: stayFields.checkInTime ?? undefined,
    checkOutTime: stayFields.checkOutTime ?? undefined,
    petFriendly: stayFields.petFriendly ?? undefined,
    suitableForChildren: stayFields.suitableForChildren ?? undefined,
    suitableForPeopleWithReducedMobility: stayFields.suitableForPeopleWithReducedMobility ?? undefined,
    matterportUrl: a.matterportUrl ?? undefined,
    shortDesc: shortDesc ?? undefined,
    body: body ?? undefined,
    surroundingDescription: surrDesc ?? undefined,
    lastSyncedAt: new Date().toISOString(),
  };
  // retirer les undefined
  for (const k of Object.keys(patch)) if (patch[k] === undefined) delete patch[k];
  return { patch, stats: { rooms: rooms.length, areas: areasDetail.length, amenities: amenities.fr.length, key: keyFeatures.fr.length, pools: mappedPools.length, checkIn: stayFields.checkInTime, hk: stayFields.housekeepingFrequency?.fr } };
}

// === Sanity ===
async function loadClient() {
  const { createClient } = await import('@sanity/client');
  const env = process.env;
  return createClient({
    projectId: env.NUXT_PUBLIC_SANITY_PROJECT_ID ?? 'akpi9bfm',
    dataset: env.NUXT_PUBLIC_SANITY_DATASET ?? 'production',
    token: env.SANITY_AUTH_TOKEN ?? env.SANITY_WRITE_TOKEN,
    apiVersion: '2024-01-01',
    useCdn: false,
  });
}

async function main() {
  console.log(`\n=== Enrichissement villas ${DRY_RUN ? '(DRY-RUN)' : '(WRITE)'} ===\n`);
  const client = await loadClient();
  let villas = await client.fetch('*[_type=="villa" && defined(lcHouseId)]{_id, name, lcHouseId} | order(name asc)');
  if (ONLY_ID) villas = villas.filter((v) => v.lcHouseId === ONLY_ID);
  console.log(`${villas.length} villa(s) a traiter\n`);

  let ok = 0; const failures = [];
  for (let i = 0; i < villas.length; i++) {
    const v = villas[i];
    process.stdout.write(`  [${i + 1}/${villas.length}] ${v.lcHouseId} ${(v.name ?? '').padEnd(28)} ... `);
    try {
      const fr = await fetchHouse(v.lcHouseId, 'fr');
      await sleep(RATE_API_MS);
      const en = await fetchHouse(v.lcHouseId, 'en');
      await sleep(RATE_API_MS);
      const { patch, stats } = buildEnrichment(fr, en);
      console.log(`rooms=${stats.rooms} areas=${stats.areas} amen=${stats.amenities} key=${stats.key} pools=${stats.pools} in=${stats.checkIn ?? '?'}h hk=${stats.hk ?? '?'}`);
      if (!DRY_RUN) {
        await client.patch(v._id).set(patch).commit();
      }
      ok++;
    } catch (e) {
      console.log(`✗ ${e.message}`);
      failures.push({ id: v.lcHouseId, reason: e.message });
    }
  }

  console.log(`\n=== Termine : ${ok}/${villas.length} ok ===`);
  if (failures.length) console.log('Echecs :', JSON.stringify(failures, null, 2));
  if (DRY_RUN) console.log('\nDry-run : aucun ecrit. Relancer avec --write pour patcher Sanity.');
}

main().catch((e) => { console.error('FATAL', e); process.exit(1); });
