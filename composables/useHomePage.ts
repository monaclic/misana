// Composable pour la page d'accueil. Lit le singleton homePage depuis
// Sanity et expose un helper `imageFor(slug)` qui renvoie l'URL CDN
// de l'image associee au panel demande, ou null si pas en base.
//
// Pattern : on retourne `null` plutot que de throw, ce qui permet a
// la page d'avoir un fallback simple (image en dur). Pendant la
// transition CMS, le site ne peut pas casser.
import { sanityImageSrcSet, sanityImageWith } from '~/composables/useSanityImage';

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
  // 1200x630 cropee, dediee og:image / twitter:image (preview social platforms)
  heroImageOg: string | null;
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
    heroImage: d.heroImage ? sanityImageSrcSet(d.heroImage, { ratio: 'wide', q: 60 }) : null,
    heroImageOg: d.heroImage
      ? sanityImageWith(d.heroImage, { w: 1200, h: 630, fit: 'crop', q: 80 })
      : null,
    heroTitleOverride: d.heroTitleOverride,
    heroBodyOverride: d.heroBodyOverride,
    heroSubOverride: d.heroSubOverride,
    panels: (d.servicePanels || []).map((p: any) => ({
      service: p.service,
      image: p.image ? sanityImageSrcSet(p.image, { ratio: 'wide', q: 60 }) : { src: '', srcset: '', sizes: '' },
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
  // Timeout 3s sur le fetch Sanity en SSR : evite que la fonction Vercel
  // timeout (et retourne 500) si Sanity tarde au cold start. Au-dela on
  // retombe sur le fallback (home null) et les pages qui appellent ce
  // composable rendent leur defaut hardcode (ex fiches chauffeur :
  // HOME_CHAUFFEUR_FALLBACK). Meme pattern que useServiceHub.
  const { data, error, refresh } = useLazyAsyncData('homePage', async () => {
    try {
      return await Promise.race([
        (sanity.client as any).fetch(QUERY),
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 3000)),
      ]);
    } catch (err: any) {
      console.error('[useHomePage] Sanity fetch failed:', err?.message ?? err);
      return null;
    }
  });
  const home = computed<HomePageData | null>(() => adapt(data.value));
  return { home, error, refresh };
}
