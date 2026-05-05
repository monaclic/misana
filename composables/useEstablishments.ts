// Fetch des fiches access (etablissements) depuis Sanity et adaptation
// au shape attendu par les pages (combine ESTABLISHMENTS + EstablishmentDetail).
import { sanityImage } from '~/composables/useSanityImage';

export type EstablishmentLite = {
  slug: string;
  name: string;
  category: 'restaurant' | 'palace' | 'beach-club' | 'nightclub';
  city: string;
  hero: string;
  housePick: boolean;
  signature: { fr: string; en: string };
};

export type EstablishmentFull = EstablishmentLite & {
  thumbs: string[];
  factualLabels?: { fr: string[]; en: string[] };
  bestFor?: { fr: string[]; en: string[] };
  about?: { fr: string; en: string };
  practical: {
    address: { fr: string; en: string };
    cuisine?: { fr: string; en: string };
    chef?: string;
    hours?: { fr: string; en: string };
    dressCode?: { fr: string; en: string };
    year?: number;
  };
  teamNotes?: { fr: string; en: string };
  faq?: { question: { fr: string; en: string }; answer: { fr: string; en: string } }[];
  reservation: {
    enabled: boolean;
    minGuests: number;
    maxGuests: number;
    leadTimeHours: number;
    serviceOptions: string[];
  };
};

// Phase 2.2 : slug lit slugI18n localisé avec fallback `slug.current`.
const LIST_QUERY = /* groq */ `*[_type == "accessEstablishment" && published == true] | order(order asc) {
  "slug": coalesce(slugI18n[$locale].current, slug.current),
  name,
  category,
  city,
  hero,
  housePick,
  signature
}`;

const FULL_QUERY = /* groq */ `*[_type == "accessEstablishment" && coalesce(slugI18n[$locale].current, slug.current) == $slug && published == true][0] {
  "slug": coalesce(slugI18n[$locale].current, slug.current),
  name,
  category,
  city,
  hero,
  thumbs,
  housePick,
  signature,
  about,
  factualLabelsFr,
  factualLabelsEn,
  bestForFr,
  bestForEn,
  address,
  cuisine,
  chef,
  hours,
  dressCode,
  year,
  reservation,
  teamNotes,
  faq
}`;

function asArray(v: unknown): any[] {
  if (Array.isArray(v)) return v;
  if (v && typeof v === 'object' && Array.isArray((v as any).result)) return (v as any).result;
  if (v && typeof v === 'object' && Array.isArray((v as any).data)) return (v as any).data;
  return [];
}

function adaptLite(e: any): EstablishmentLite {
  return {
    slug: e.slug,
    name: e.name,
    category: e.category,
    city: e.city,
    hero: sanityImage(e.hero),
    housePick: !!e.housePick,
    signature: e.signature || { fr: '', en: '' },
  };
}

function adaptFull(e: any): EstablishmentFull {
  return {
    ...adaptLite(e),
    thumbs: (e.thumbs || []).map((t: any) => sanityImage(t)).filter(Boolean),
    about: e.about,
    factualLabels: (e.factualLabelsFr?.length || e.factualLabelsEn?.length)
      ? { fr: e.factualLabelsFr || [], en: e.factualLabelsEn || [] }
      : undefined,
    bestFor: (e.bestForFr?.length || e.bestForEn?.length)
      ? { fr: e.bestForFr || [], en: e.bestForEn || [] }
      : undefined,
    practical: {
      address: e.address || { fr: '', en: '' },
      cuisine: e.cuisine,
      chef: e.chef,
      hours: e.hours,
      dressCode: e.dressCode,
      year: e.year,
    },
    teamNotes: e.teamNotes,
    faq: e.faq,
    reservation: e.reservation || {
      enabled: true,
      minGuests: 1,
      maxGuests: 12,
      leadTimeHours: 48,
      serviceOptions: [],
    },
  };
}

export function useEstablishments() {
  const sanity = useSanity();
  const { locale } = useI18n();
  const { data, error, refresh } = useLazyAsyncData(
    `establishments:${locale.value}`,
    () => (sanity.client as any).fetch(LIST_QUERY, { locale: locale.value }),
    { watch: [locale] },
  );
  const establishments = computed<EstablishmentLite[]>(() => asArray(data.value).map(adaptLite));
  return { establishments, error, refresh };
}

export async function useEstablishment(slug: string) {
  const sanity = useSanity();
  const { locale } = useI18n();
  const { data, error, refresh } = await useAsyncData(
    `establishment:${slug}:${locale.value}`,
    () => (sanity.client as any).fetch(FULL_QUERY, { slug, locale: locale.value }),
  );
  const establishment = computed<EstablishmentFull | null>(() =>
    data.value ? adaptFull(data.value) : null,
  );
  return { establishment, error, refresh };
}
