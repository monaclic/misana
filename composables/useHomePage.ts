// Composable pour la page d'accueil. Lit le singleton homePage depuis
// Sanity et expose un helper `imageFor(slug)` qui renvoie l'URL CDN
// de l'image associee au panel demande, ou null si pas en base.
//
// Pattern : on retourne `null` plutot que de throw, ce qui permet a
// la page d'avoir un fallback simple (image en dur). Pendant la
// transition CMS, le site ne peut pas casser.
import { sanityImageWith } from '~/composables/useSanityImage';

// Hero panels : full-screen background. 1600x900 = 16:9 ratio cible pour
// les hero plein ecran. fit('crop') est obligatoire quand l'asset Sanity a
// un hotspot/crop : sans fit, le builder retourne juste rect= et ignore
// width/height (= image originale 3500x2207 servie inchangee).
// Quality 75 + auto=format -> webp/avif. Reduction poids ~70%.
const HERO_OPTS = { w: 1600, h: 900, q: 75, fit: 'crop' as const };

export type HomePagePanel = {
  service: 'chauffeur' | 'cars' | 'yacht' | 'helicopter' | 'access';
  image: string;
  titleOverride?: { fr?: string; en?: string };
  bodyOverride?: { fr?: string; en?: string };
  ctaLabelOverride?: { fr?: string; en?: string };
};

export type HomePageData = {
  heroImage: string | null;
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
    heroImage: d.heroImage ? sanityImageWith(d.heroImage, HERO_OPTS) : null,
    heroTitleOverride: d.heroTitleOverride,
    heroBodyOverride: d.heroBodyOverride,
    heroSubOverride: d.heroSubOverride,
    panels: (d.servicePanels || []).map((p: any) => ({
      service: p.service,
      image: p.image ? sanityImageWith(p.image, HERO_OPTS) : '',
      titleOverride: p.titleOverride,
      bodyOverride: p.bodyOverride,
      ctaLabelOverride: p.ctaLabelOverride,
    })).filter((p: HomePagePanel) => p.service && p.image),
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
