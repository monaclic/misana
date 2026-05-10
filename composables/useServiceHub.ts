// Composable pour les hubs services (chauffeur, cars, yacht, helicopter, access).
// 5 docs en base, queryes par `service`. Retourne null si pas en base
// (la page utilise alors les fallbacks).
import { sanityImage, sanityImageWith } from '~/composables/useSanityImage';

export type ServiceSlug = 'chauffeur' | 'cars' | 'yacht' | 'helicopter' | 'access';

export type ServiceHubData = {
  service: ServiceSlug;
  heroImage: string | null;
  // Variante 1200x630 cropee, format requis pour og:image / twitter:image
  // (Facebook, LinkedIn, WhatsApp, Twitter). Servir l'image native (1920x1440
  // ou autre) en og donne des previews croppees aleatoirement.
  heroImageOg: string | null;
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
    heroImageOg: d.heroImage
      ? sanityImageWith(d.heroImage, { w: 1200, h: 630, fit: 'crop', q: 80 })
      : null,
    heroTitleOverride: d.heroTitleOverride,
    heroLeadOverride: d.heroLeadOverride,
    seo: d.seo
      ? {
          ...d.seo,
          ogImage: d.seo.ogImage ? sanityImageWith(d.seo.ogImage, { w: 1200, h: 630, fit: 'crop', q: 80 }) : undefined,
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
