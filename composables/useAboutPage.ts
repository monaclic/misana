// Composable de la page About. Singleton Sanity. Retourne null si pas
// en base : la page utilise alors les fallbacks Unsplash en dur.
import { sanityImage } from '~/composables/useSanityImage';

export type AboutPageData = {
  heroImage: string | null;
  heroLeadOverride?: { fr?: string; en?: string };
  philosophyImage: string | null;
  spacesLeftImage: string | null;
  spacesRightImage: string | null;
  galleryImages: { src: string; ratio: string }[];
  ctaImage: string | null;
  ctaBodyOverride?: { fr?: string; en?: string };
  seo?: {
    titleEn?: string; titleFr?: string;
    descriptionEn?: string; descriptionFr?: string;
    ogImage?: string;
  };
};

const QUERY = /* groq */ `*[_id == "aboutPage"][0] {
  heroImage,
  heroLeadOverride,
  philosophyImage,
  spacesLeftImage,
  spacesRightImage,
  galleryImages[] { image, aspectRatio },
  ctaImage,
  ctaBodyOverride,
  seo
}`;

function adapt(d: any): AboutPageData | null {
  if (!d) return null;
  return {
    heroImage: d.heroImage ? sanityImage(d.heroImage) : null,
    heroLeadOverride: d.heroLeadOverride,
    philosophyImage: d.philosophyImage ? sanityImage(d.philosophyImage) : null,
    spacesLeftImage: d.spacesLeftImage ? sanityImage(d.spacesLeftImage) : null,
    spacesRightImage: d.spacesRightImage ? sanityImage(d.spacesRightImage) : null,
    galleryImages: (d.galleryImages || [])
      .filter((g: any) => g?.image)
      .map((g: any) => ({
        src: sanityImage(g.image),
        ratio: g.aspectRatio || '1',
      })),
    ctaImage: d.ctaImage ? sanityImage(d.ctaImage) : null,
    ctaBodyOverride: d.ctaBodyOverride,
    seo: d.seo
      ? {
          ...d.seo,
          ogImage: d.seo.ogImage ? sanityImage(d.seo.ogImage) : undefined,
        }
      : undefined,
  };
}

export function useAboutPage() {
  const sanity = useSanity();
  const { data, error, refresh } = useLazyAsyncData('aboutPage', () =>
    (sanity.client as any).fetch(QUERY),
  );
  const about = computed<AboutPageData | null>(() => adapt(data.value));
  return { about, error, refresh };
}
