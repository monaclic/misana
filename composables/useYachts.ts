// Fetch des fiches yachts depuis Sanity et adaptation au shape Yacht
// (compatible avec lib/yachts.ts pour ne pas tout casser cote pages).
import { sanityImage } from '~/composables/useSanityImage';
import type { Yacht } from '~/lib/yachts';

// Phase 2.2 : "id" lit le slug i18n localisé d'abord, fallback sur l'ancien
// `slug.current` (Option A migration). Locale injectée via $locale en var.
const YACHT_QUERY = /* groq */ `*[_type == "yacht" && published == true] | order(order asc) {
  "id": coalesce(slugI18n[$locale].current, slug.current),
  name,
  builder,
  model,
  fullName,
  type,
  size,
  lengthM,
  cabins,
  cabinDetail,
  guests,
  crew,
  cruisingKnots,
  maxKnots,
  year,
  hero,
  gallery,
  pricePerDay,
  pricePerWeekFrom,
  pricePerWeekTo,
  ports,
  cruisingAreas,
  amenities,
  badge,
  "desc": shortDesc.en,
  "descFr": shortDesc.fr,
  "bodyEn": body.en,
  "bodyFr": body.fr
}`;

type SanityImageRef = { asset?: { _ref?: string } };

type YachtRaw = Omit<Yacht, 'hero' | 'images' | 'badge'> & {
  hero?: SanityImageRef;
  gallery?: SanityImageRef[];
  badge?: string;
};

function asArray(v: unknown): any[] {
  if (Array.isArray(v)) return v;
  if (v && typeof v === 'object' && Array.isArray((v as any).result)) return (v as any).result;
  if (v && typeof v === 'object' && Array.isArray((v as any).data)) return (v as any).data;
  return [];
}

function adapt(y: YachtRaw): Yacht {
  return {
    id: y.id,
    name: y.name,
    builder: y.builder,
    model: y.model,
    fullName: y.fullName,
    type: y.type,
    size: y.size,
    lengthM: y.lengthM,
    cabins: y.cabins,
    cabinDetail: y.cabinDetail,
    guests: y.guests,
    crew: y.crew,
    cruisingKnots: y.cruisingKnots,
    maxKnots: y.maxKnots,
    year: y.year,
    hero: sanityImage(y.hero),
    images: (y.gallery || []).map((g) => sanityImage(g)).filter(Boolean),
    pricePerDay: y.pricePerDay,
    pricePerWeekFrom: y.pricePerWeekFrom,
    pricePerWeekTo: y.pricePerWeekTo,
    ports: y.ports || [],
    cruisingAreas: y.cruisingAreas || [],
    amenities: y.amenities || [],
    badge: (y.badge && y.badge !== '' ? y.badge : undefined) as Yacht['badge'],
    desc: y.desc || '',
    descFr: y.descFr || '',
    bodyEn: y.bodyEn || '',
    bodyFr: y.bodyFr || '',
  };
}

export function useYachts() {
  const sanity = useSanity();
  const { locale } = useI18n();
  const { data, error, refresh } = useLazyAsyncData(
    `yachts:${locale.value}`,
    () => (sanity.client as any).fetch(YACHT_QUERY, { locale: locale.value }),
    { watch: [locale] },
  );
  const yachts = computed<Yacht[]>(() => asArray(data.value).map(adapt));
  return { yachts, error, refresh };
}

// Phase 2.2-fix : OR explicite (coalesce buggy quand slugI18n != id legacy).
// Le doc est trouvé si soit le nouveau slug, soit l'ancien match $id.
const SINGLE_YACHT_QUERY = /* groq */ `*[_type == "yacht" && (slugI18n[$locale].current == $id || slug.current == $id) && published == true][0] {
  "id": coalesce(slugI18n[$locale].current, slug.current),
  name,
  builder,
  model,
  fullName,
  type,
  size,
  lengthM,
  cabins,
  cabinDetail,
  guests,
  crew,
  cruisingKnots,
  maxKnots,
  year,
  hero,
  gallery,
  pricePerDay,
  pricePerWeekFrom,
  pricePerWeekTo,
  ports,
  cruisingAreas,
  amenities,
  badge,
  "desc": shortDesc.en,
  "descFr": shortDesc.fr,
  "bodyEn": body.en,
  "bodyFr": body.fr
}`;

export async function useYacht(id: string) {
  const sanity = useSanity();
  const { locale } = useI18n();
  const { data, error, refresh } = await useAsyncData(
    `yacht:${id}:${locale.value}`,
    () => (sanity.client as any).fetch(SINGLE_YACHT_QUERY, { id, locale: locale.value }),
  );
  const yacht = computed<Yacht | null>(() => (data.value ? adapt(data.value) : null));
  return { yacht, error, refresh };
}
