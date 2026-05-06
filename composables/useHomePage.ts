// Composable pour la page d'accueil. Lit le singleton homePage depuis
// Sanity et expose un helper `imageFor(slug)` qui renvoie l'URL CDN
// de l'image associee au panel demande, ou null si pas en base.
//
// Pattern : on retourne `null` plutot que de throw, ce qui permet a
// la page d'avoir un fallback simple (image en dur). Pendant la
// transition CMS, le site ne peut pas casser.
import { sanityImageSrcSet } from '~/composables/useSanityImage';

export type ResponsiveImage = { src: string; srcset: string; sizes: string };

export type HomePagePanel = {
  service: 'chauffeur' | 'cars' | 'yacht' | 'helicopter' | 'access';
  image: ResponsiveImage;
  titleOverride?: { fr?: string; en?: string };
  bodyOverride?: { fr?: string; en?: string };
  ctaLabelOverride?: { fr?: string; en?: string };
};

export type HomePageData = {
  heroImage: ResponsiveImage | null;
  heroTitleOverride?: { fr?: string; en?: string };
  heroBodyOverride?: { fr?: string; en?: string };
  heroSubOverride?: { fr?: string; en?: string };
  panels: HomePagePanel[];
  agendaKickerOverride?: { fr?: string; en?: string };
  agendaTitleOverride?: { fr?: string; en?: string };
  agendaLeadOverride?: { fr?: string; en?: string };
  agendaFootnoteOverride?: { fr?: string; en?: string };
  testimonialsKickerOverride?: { fr?: string; en?: string };
  testimonialsTitleStartOverride?: { fr?: string; en?: string };
  testimonialsTitleAccentOverride?: { fr?: string; en?: string };
};

const QUERY = /* groq */ `*[_id == "homePage"][0] {
  heroImage,
  heroTitleOverride, heroBodyOverride, heroSubOverride,
  servicePanels[] {
    service,
    image,
    titleOverride, bodyOverride, ctaLabelOverride
  },
  agendaKickerOverride, agendaTitleOverride, agendaLeadOverride, agendaFootnoteOverride,
  testimonialsKickerOverride, testimonialsTitleStartOverride, testimonialsTitleAccentOverride
}`;

function adapt(d: any): HomePageData | null {
  if (!d) return null;
  return {
    heroImage: d.heroImage ? sanityImageSrcSet(d.heroImage, { ratio: 'wide', q: 70 }) : null,
    heroTitleOverride: d.heroTitleOverride,
    heroBodyOverride: d.heroBodyOverride,
    heroSubOverride: d.heroSubOverride,
    panels: (d.servicePanels || []).map((p: any) => ({
      service: p.service,
      image: p.image ? sanityImageSrcSet(p.image, { ratio: 'wide', q: 70 }) : { src: '', srcset: '', sizes: '' },
      titleOverride: p.titleOverride,
      bodyOverride: p.bodyOverride,
      ctaLabelOverride: p.ctaLabelOverride,
    })).filter((p: HomePagePanel) => p.service && p.image.src),
    agendaKickerOverride: d.agendaKickerOverride,
    agendaTitleOverride: d.agendaTitleOverride,
    agendaLeadOverride: d.agendaLeadOverride,
    agendaFootnoteOverride: d.agendaFootnoteOverride,
    testimonialsKickerOverride: d.testimonialsKickerOverride,
    testimonialsTitleStartOverride: d.testimonialsTitleStartOverride,
    testimonialsTitleAccentOverride: d.testimonialsTitleAccentOverride,
  };
}

export function useHomePage() {
  const sanity = useSanity();
  const { data, error, refresh } = useLazyAsyncData('homePage', () =>
    (sanity.client as any).fetch(QUERY),
  );
  const home = computed<HomePageData | null>(() => adapt(data.value));
  return { home, error, refresh };
}
