// Composable events : lit la liste depuis EVENTS (constants.ts) qui est
// la source de verite unique pour l'ordre et les dates. Sanity n'est
// utilise que pour le heroImage editorial, mergé par slug.
//
// L'ordre est l'ordre EVENTS (editorial), PAS chronologique. monthOrder
// est conserve pour les pages /events et /destinations, mais le mois
// affiche sur la home est derive de startDate via Intl.
import { sanityImage } from '~/composables/useSanityImage';
import { EVENTS } from '~/lib/constants';
import { CITIES } from '~/lib/constants';

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
  startDate: string;  // ISO YYYY-MM-DD
  endDate: string;    // ISO YYYY-MM-DD
};

// Fetch Sanity uniquement pour les images, indexées par slug.
const QUERY = /* groq */ `*[_type == "event"]{
  "slug": slug.current,
  heroImage
}`;

function buildEvents(sanityImages: Record<string, any>): EventItem[] {
  return EVENTS.map((e) => {
    const city = CITIES.find((c) => c.slug === e.city);
    return {
      slug: e.slug,
      nameEn: e.en,
      nameFr: e.fr,
      monthEn: e.monthEn,
      monthFr: e.monthFr,
      monthOrder: e.monthOrder,
      tier: e.tier === 'heavy' ? 'heavy' as const : 'stub' as const,
      citySlug: e.city,
      cityEn: city?.en ?? e.city,
      cityFr: city?.fr ?? e.city,
      heroImage: sanityImages[e.slug] ? sanityImage(sanityImages[e.slug]) : null,
      startDate: e.startDate,
      endDate: e.endDate,
    };
  });
}

export function useEvents() {
  const sanity = useSanity();
  const { data, error, refresh } = useLazyAsyncData('events', () =>
    (sanity.client as any).fetch(QUERY),
  );
  const events = computed<EventItem[]>(() => {
    const map: Record<string, any> = {};
    for (const d of (data.value as any[]) || []) {
      if (d.slug) map[d.slug] = d.heroImage;
    }
    return buildEvents(map);
  });
  return { events, error, refresh };
}
