// Composable pour fetch les events depuis Sanity, ordonnes par monthOrder.
// Expose une liste prete a render avec heroImage en URL CDN.
import { sanityImage } from '~/composables/useSanityImage';

export type EventItem = {
  slug: string;
  nameEn: string;
  nameFr: string;
  monthEn: string;
  monthFr: string;
  monthOrder: number;
  tier: 'heavy' | 'stub';
  citySlug: string | null;
  cityEn: string;
  cityFr: string;
  heroImage: string | null;
};

// Phase 2.2 : slug + citySlug lisent slugI18n localisé avec fallback.
const QUERY = /* groq */ `*[_type == "event"] | order(monthOrder asc) {
  "slug": coalesce(slugI18n[$locale].current, slug.current),
  nameEn, nameFr,
  monthEn, monthFr, monthOrder,
  tier,
  "citySlug": coalesce(destination->slugI18n[$locale].current, destination->slug.current),
  "cityEn": destination->nameEn,
  "cityFr": destination->nameFr,
  heroImage
}`;

function adapt(d: any[]): EventItem[] {
  return (d || []).map((e: any) => ({
    slug: e.slug || '',
    nameEn: e.nameEn || '',
    nameFr: e.nameFr || e.nameEn || '',
    monthEn: e.monthEn || '',
    monthFr: e.monthFr || e.monthEn || '',
    monthOrder: e.monthOrder || 0,
    tier: e.tier === 'stub' ? 'stub' : 'heavy',
    citySlug: e.citySlug || null,
    cityEn: e.cityEn || '',
    cityFr: e.cityFr || e.cityEn || '',
    heroImage: e.heroImage ? sanityImage(e.heroImage) : null,
  })).filter((e: EventItem) => e.slug);
}

export function useEvents() {
  const sanity = useSanity();
  const { locale } = useI18n();
  const { data, error, refresh } = useLazyAsyncData(
    `events:${locale.value}`,
    () => (sanity.client as any).fetch(QUERY, { locale: locale.value }),
    { watch: [locale] },
  );
  const events = computed<EventItem[]>(() => adapt(data.value as any[]));
  return { events, error, refresh };
}
