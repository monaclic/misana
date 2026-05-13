// Fetch des fiches voitures depuis Sanity et adaptation au shape attendu
// par les pages (compatible RentalCar de lib/rentalCars.ts).
//
// Usage :
//   const { data: cars } = await useRentalCars();
//
// Le composable renvoie un useAsyncData -> SSR + cache automatique.
import { sanityImage } from '~/composables/useSanityImage';
import type { RentalCar, RentalCarCategory } from '~/lib/rentalCars';

const CAR_QUERY = /* groq */ `*[_type == "rentalCar" && published == true] | order(order asc) {
  "id": slug.current,
  brand,
  model,
  fullName,
  "category": category->slug.current,
  pax,
  hp,
  topSpeedKmh,
  transmission,
  fuelType,
  year,
  hero,
  gallery,
  prices,
  conditions,
  availableCities,
  badge,
  "desc": shortDesc.en,
  "descFr": shortDesc.fr,
  "bodyEn": body.en,
  "bodyFr": body.fr
}`;

type SanityImageRef = { asset?: { _ref?: string } };

type CarRaw = Omit<RentalCar, 'hero' | 'images' | 'badge'> & {
  hero?: SanityImageRef;
  gallery?: SanityImageRef[];
  badge?: string;
};

function adapt(c: CarRaw): RentalCar {
  return {
    id: c.id,
    brand: c.brand,
    model: c.model,
    fullName: c.fullName,
    category: c.category as RentalCarCategory,
    pax: c.pax,
    hp: c.hp,
    topSpeedKmh: c.topSpeedKmh,
    transmission: c.transmission,
    fuelType: c.fuelType,
    year: c.year,
    hero: sanityImage(c.hero),
    images: (c.gallery || []).map((g) => sanityImage(g)).filter(Boolean),
    prices: c.prices,
    conditions: c.conditions,
    availableCities: c.availableCities || [],
    badge: (c.badge && c.badge !== '' ? c.badge : undefined) as RentalCar['badge'],
    desc: c.desc || '',
    descFr: c.descFr || '',
    bodyEn: c.bodyEn || '',
    bodyFr: c.bodyFr || '',
  };
}

function asArray(v: unknown): any[] {
  if (Array.isArray(v)) return v;
  if (v && typeof v === 'object' && Array.isArray((v as any).result)) return (v as any).result;
  if (v && typeof v === 'object' && Array.isArray((v as any).data)) return (v as any).data;
  return [];
}

// Wrapper sanity.fetch() direct (et non useSanityQuery) : useSanityQuery
// renvoie un objet wrappe non-trivial (data, sourceMap) qui complique le
// derefencement en SSR. fetch() rend simplement le resultat GROQ.
//
// Ordre business du listing (override du champ Sanity order).
// Logique : icones GT/supercar avec belles photos FLM en haut, SUV ultra-luxe
// (Cullinan, Purosangue, Maybach) ensuite, SUV premium, entry-level en bas.
const DEFAULT_ORDER: string[] = [
  // Tier S : GT / supercar icones, photos FLM hero pro
  'aston-martin-db12',
  'ferrari-roma-spider',
  'ferrari-296-gts',
  'ferrari-portofino-m',
  'bentley-continental-gtc',
  'lamborghini-huracan-tecnica',
  'lamborghini-huracan-evo-spyder',
  'mercedes-sl-63-amg-roadster',
  'porsche-911-gt3-rs',
  'porsche-911-carrera-4-gts-cabriolet',
  'porsche-911-carrera-4s-cabriolet',
  // Tier A : SUV ultra-luxe + iconique
  'rolls-royce-cullinan',
  'ferrari-purosangue',
  'mercedes-classe-g63-amg',
  'lamborghini-urus-performante',
  'lamborghini-urus-se',
  'lamborghini-urus-s',
  'mercedes-maybach-gls-600',
  'range-rover-vogue-l',
  // Tier B : supercar/SUV moins iconiques
  'lamborghini-huracan-performante-spyder',
  'lamborghini-huracan-sterrato',
  'range-rover-sport',
  'mercedes-gle-53-amg',
  'porsche-cayenne-coupe',
  'land-rover-defender-bodykit',
  'land-rover-defender-110',
  // Tier C : entry / fun
  'audi-rs3',
  'mini-cooper-s-cabriolet',
  'volkswagen-golf-gti',
];

function orderIndex(id: string): number {
  const i = DEFAULT_ORDER.indexOf(id);
  return i === -1 ? 9999 : i;
}

// SYNCHRONE (pas async) : useLazyAsyncData ne bloque pas le rendu et
// la fonction reste synchrone -> aucun await dans le setup parent ->
// pas de Suspense qui freeze la nav client.
export function useRentalCars() {
  const sanity = useSanity();
  const { data, error, refresh } = useLazyAsyncData('rentalCars', () =>
    (sanity.client as any).fetch(CAR_QUERY),
  );
  const cars = computed<RentalCar[]>(() =>
    asArray(data.value).map(adapt).sort((a, b) => orderIndex(a.id) - orderIndex(b.id)),
  );
  return { cars, error, refresh };
}

const SINGLE_CAR_QUERY = /* groq */ `*[_type == "rentalCar" && slug.current == $id && published == true][0] {
  "id": slug.current,
  brand,
  model,
  fullName,
  "category": category->slug.current,
  pax,
  hp,
  topSpeedKmh,
  transmission,
  fuelType,
  year,
  hero,
  gallery,
  prices,
  conditions,
  availableCities,
  badge,
  "desc": shortDesc.en,
  "descFr": shortDesc.fr,
  "bodyEn": body.en,
  "bodyFr": body.fr
}`;

// Pour la fiche unique on garde le await bloquant (le 404 doit se
// declencher en SSR pour les crawlers, et la fiche se rend toujours
// avec sa data complete au premier render).
export async function useRentalCar(id: string) {
  const sanity = useSanity();
  const { data, error, refresh } = await useAsyncData(`rentalCar:${id}`, () =>
    (sanity.client as any).fetch(SINGLE_CAR_QUERY, { id }),
  );
  const car = computed<RentalCar | null>(() => (data.value ? adapt(data.value) : null));
  return { car, error, refresh };
}

const CATEGORY_QUERY = /* groq */ `*[_type == "rentalCarCategory"] | order(order asc) {
  "id": slug.current,
  "label": name.en,
  "labelFr": name.fr
}`;

type CategoryRaw = { id: string; label: string; labelFr: string };

export function useRentalCarCategories() {
  const sanity = useSanity();
  const { data, error, refresh } = useLazyAsyncData('rentalCarCategories', () =>
    (sanity.client as any).fetch(CATEGORY_QUERY),
  );
  const categories = computed<CategoryRaw[]>(() => asArray(data.value));
  return { categories, error, refresh };
}
