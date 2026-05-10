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

const LIST_QUERY = /* groq */ `*[_type == "accessEstablishment" && published == true] | order(order asc) {
  "slug": slug.current,
  name,
  category,
  city,
  hero,
  housePick,
  // Lecture prioritaire nouveau schema, fallback legacy
  "signature": coalesce(shortLine, signature)
}`;

const FULL_QUERY = /* groq */ `*[_type == "accessEstablishment" && slug.current == $slug && published == true][0] {
  "slug": slug.current,
  name,
  category,
  city,
  hero,
  housePick,
  // Nouveau schema
  shortLine,
  aboutText,
  longDescription,
  signatureTags,
  occasions,
  imageGallery,
  address,
  ambiance,
  cuisineType,
  establishmentType,
  horaires,
  tenue,
  // Legacy (fallback pour Le Louis XV s'il revient)
  signature,
  about,
  thumbs,
  factualLabelsFr,
  factualLabelsEn,
  bestForFr,
  bestForEn,
  cuisine,
  hours,
  dressCode,
  // Inchange
  chef,
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

// Adresse : nouveau schema = string multi-ligne (text). Legacy = localizedString.
function adaptAddress(e: any): { fr: string; en: string } {
  if (typeof e.address === 'string') return { fr: e.address, en: e.address };
  if (e.address && typeof e.address === 'object') {
    return { fr: e.address.fr || '', en: e.address.en || e.address.fr || '' };
  }
  return { fr: '', en: '' };
}

// Cuisine : nouveau schema = array of strings (cuisineType). Legacy = localizedString.
function adaptCuisine(e: any): { fr: string; en: string } | undefined {
  if (Array.isArray(e.cuisineType) && e.cuisineType.length) {
    const joined = e.cuisineType.join(', ');
    return { fr: joined, en: joined };
  }
  if (e.cuisine) return e.cuisine;
  return undefined;
}

// Tags signature : nouveau localizedStringArray, fallback legacy factualLabels.
function adaptSignatureTags(e: any): { fr: string[]; en: string[] } | undefined {
  const newFr = e.signatureTags?.fr;
  const newEn = e.signatureTags?.en;
  if ((newFr?.length ?? 0) || (newEn?.length ?? 0)) {
    return { fr: newFr || [], en: newEn || newFr || [] };
  }
  if ((e.factualLabelsFr?.length ?? 0) || (e.factualLabelsEn?.length ?? 0)) {
    return { fr: e.factualLabelsFr || [], en: e.factualLabelsEn || [] };
  }
  // Fallback : derive depuis ambiance Excellence si rien d'autre
  if (Array.isArray(e.ambiance) && e.ambiance.length) {
    return { fr: e.ambiance, en: e.ambiance };
  }
  return undefined;
}

// Occasions : nouveau schema, fallback legacy bestFor.
function adaptOccasions(e: any): { fr: string[]; en: string[] } | undefined {
  const newFr = e.occasions?.fr;
  const newEn = e.occasions?.en;
  if ((newFr?.length ?? 0) || (newEn?.length ?? 0)) {
    return { fr: newFr || [], en: newEn || newFr || [] };
  }
  if ((e.bestForFr?.length ?? 0) || (e.bestForEn?.length ?? 0)) {
    return { fr: e.bestForFr || [], en: e.bestForEn || [] };
  }
  return undefined;
}

function adaptFull(e: any): EstablishmentFull {
  // Galerie : nouveau imageGallery prioritaire, fallback legacy thumbs.
  const galleryRaw = (e.imageGallery?.length ? e.imageGallery : e.thumbs) || [];
  const thumbs = galleryRaw.map((t: any) => sanityImage(t)).filter(Boolean);

  // shortLine prioritaire, fallback signature legacy
  const lite = adaptLite(e);
  if ((e.shortLine?.fr || e.shortLine?.en) && !(e.signature?.fr || e.signature?.en)) {
    lite.signature = { fr: e.shortLine.fr || '', en: e.shortLine.en || e.shortLine.fr || '' };
  }

  return {
    ...lite,
    thumbs,
    // about : nouveau aboutText prioritaire, sinon longDescription, sinon legacy about
    about: e.aboutText?.fr || e.aboutText?.en
      ? e.aboutText
      : (e.longDescription?.fr || e.longDescription?.en ? e.longDescription : e.about),
    factualLabels: adaptSignatureTags(e),
    bestFor: adaptOccasions(e),
    practical: {
      address: adaptAddress(e),
      cuisine: adaptCuisine(e),
      chef: e.chef,
      hours: e.horaires || e.hours,
      dressCode: e.tenue || e.dressCode,
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
  const { data, error, refresh } = useLazyAsyncData('establishments', () =>
    (sanity.client as any).fetch(LIST_QUERY),
  );
  const establishments = computed<EstablishmentLite[]>(() => asArray(data.value).map(adaptLite));
  return { establishments, error, refresh };
}

export async function useEstablishment(slug: string) {
  const sanity = useSanity();
  const { data, error, refresh } = await useAsyncData(`establishment:${slug}`, () =>
    (sanity.client as any).fetch(FULL_QUERY, { slug }),
  );
  const establishment = computed<EstablishmentFull | null>(() =>
    data.value ? adaptFull(data.value) : null,
  );
  return { establishment, error, refresh };
}
