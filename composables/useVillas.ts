// Fetch des villas depuis Sanity. Pattern identique à useYachts /
// useRentalCars : useLazyAsyncData + Promise.race timeout 3s pour
// éviter les 500 cold start Vercel sur les fetch SSR.
import { sanityImageWith, resizeSanityUrl } from '~/composables/useSanityImage';

export type VillaCity =
  | 'saint-tropez' | 'ramatuelle' | 'gassin' | 'grimaud' | 'la-croix-valmer'
  | 'sainte-maxime' | 'cavalaire-sur-mer' | 'cannes' | 'mougins' | 'antibes'
  | 'cap-d-antibes' | 'villefranche-sur-mer' | 'nice' | 'eze' | 'monaco'
  | 'menton' | 'cap-ferrat';

export type VillaSetting = 'out-of-town' | 'beachfront' | 'in-city' | 'countryside';

export type Villa = {
  _id: string;
  name: string;
  city: VillaCity;
  slug: { fr: string; en: string };
  hero: string;
  bedrooms: number | null;
  bathrooms: number | null;
  capacity: number | null;
  surface: number | null;
  pricePerWeekFrom: number | null;
  pricePerWeekTo: number | null;
  displayPrices: boolean;
  seaView: boolean;
  setting: VillaSetting | null;
  keyFeatures: { fr: string[] | null; en: string[] | null } | null;
  featured: boolean;
  order: number;
  gpsLat: number | null;
  gpsLng: number | null;
  collection: string | null;
  gallery: string[];
};

type SanityImageRef = { asset?: { _ref?: string } };

type VillaRaw = Omit<Villa, 'hero' | 'gallery'> & {
  hero?: SanityImageRef;
  gallery?: { url?: string }[];
};

const VILLAS_QUERY = /* groq */ `*[_type == "villa" && published == true]{
  _id,
  name,
  city,
  "slug": {
    "fr": slugI18n.fr.current,
    "en": slugI18n.en.current
  },
  hero,
  bedrooms,
  bathrooms,
  capacity,
  surface,
  pricePerWeekFrom,
  pricePerWeekTo,
  displayPrices,
  seaView,
  setting,
  keyFeatures,
  featured,
  order,
  gpsLat,
  gpsLng,
  collection,
  "gallery": gallery[]{ "url": asset->url }
} | order(order asc, name asc)`;

function asArray(v: unknown): any[] {
  if (Array.isArray(v)) return v;
  if (v && typeof v === 'object' && Array.isArray((v as any).result)) return (v as any).result;
  if (v && typeof v === 'object' && Array.isArray((v as any).data)) return (v as any).data;
  return [];
}

function adapt(v: VillaRaw): Villa {
  return {
    _id: v._id,
    name: v.name,
    city: v.city,
    slug: v.slug,
    hero: sanityImageWith(v.hero, { w: 1600, q: 75, fit: 'crop' }) || '',
    bedrooms: v.bedrooms ?? null,
    bathrooms: v.bathrooms ?? null,
    capacity: v.capacity ?? null,
    surface: v.surface ?? null,
    pricePerWeekFrom: v.pricePerWeekFrom ?? null,
    pricePerWeekTo: v.pricePerWeekTo ?? null,
    displayPrices: v.displayPrices ?? true,
    seaView: v.seaView ?? false,
    setting: v.setting ?? null,
    keyFeatures: v.keyFeatures ?? null,
    featured: v.featured ?? false,
    order: v.order ?? 0,
    gpsLat: typeof v.gpsLat === 'number' ? v.gpsLat : null,
    gpsLng: typeof v.gpsLng === 'number' ? v.gpsLng : null,
    collection: typeof v.collection === 'string' ? v.collection : null,
    gallery: Array.isArray(v.gallery)
      ? v.gallery.map((g) => resizeSanityUrl(g?.url, 1600, 75)).filter(Boolean)
      : [],
  };
}

export function useVillas() {
  const sanity = useSanity();
  const { data, error, refresh } = useLazyAsyncData('villas', async () => {
    try {
      return await Promise.race([
        (sanity.client as any).fetch(VILLAS_QUERY),
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 3000)),
      ]);
    } catch (err: any) {
      console.error('[useVillas] Sanity fetch failed:', err?.message ?? err);
      return null;
    }
  });
  const villas = computed<Villa[]>(() => asArray(data.value).map(adapt));
  return { villas, error, refresh };
}
