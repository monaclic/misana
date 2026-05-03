// Composable pour les hubs services (chauffeur, cars, yacht, helicopter, access).
// 5 docs en base, queryes par `service`. Retourne null si pas en base
// (la page utilise alors les fallbacks).
import { sanityImage } from '~/composables/useSanityImage';

export type ServiceSlug = 'chauffeur' | 'cars' | 'yacht' | 'helicopter' | 'access';

export type ServiceHubData = {
  service: ServiceSlug;
  heroImage: string | null;
  heroTitleOverride?: { fr?: string; en?: string };
  heroLeadOverride?: { fr?: string; en?: string };
  seo?: {
    titleEn?: string; titleFr?: string;
    descriptionEn?: string; descriptionFr?: string;
    ogImage?: string;
  };
};

const QUERY = /* groq */ `*[_type == "serviceHub" && service == $service][0] {
  service,
  heroImage,
  heroTitleOverride,
  heroLeadOverride,
  seo
}`;

function adapt(d: any): ServiceHubData | null {
  if (!d) return null;
  return {
    service: d.service,
    heroImage: d.heroImage ? sanityImage(d.heroImage) : null,
    heroTitleOverride: d.heroTitleOverride,
    heroLeadOverride: d.heroLeadOverride,
    seo: d.seo
      ? {
          ...d.seo,
          ogImage: d.seo.ogImage ? sanityImage(d.seo.ogImage) : undefined,
        }
      : undefined,
  };
}

export function useServiceHub(service: ServiceSlug) {
  const sanity = useSanity();
  const { data, error, refresh } = useLazyAsyncData(`serviceHub:${service}`, () =>
    (sanity.client as any).fetch(QUERY, { service }),
  );
  const hub = computed<ServiceHubData | null>(() => adapt(data.value));
  return { hub, error, refresh };
}
