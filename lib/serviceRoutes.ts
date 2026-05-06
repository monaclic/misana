// Mapping service canonique (slug Sanity) -> segment URL par locale.
// Doit rester aligne avec les defineI18nRoute() des pages hub :
//   pages/yacht/index.vue       -> en: /yacht-charter, fr: /yacht
//   pages/voitures/index.vue    -> en: /luxury-cars,   fr: /voitures
//   pages/chauffeur/index.vue   -> en: /private-chauffeur, fr: /chauffeur
//   pages/helicoptere/index.vue -> en: /helicopter-transfers, fr: /helicoptere
//   pages/reservations/index.vue-> en: /reservations,  fr: /reservations
export const SERVICE_URL_SEGMENT: Record<
  'yacht' | 'cars' | 'chauffeur' | 'helicopter' | 'access',
  { fr: string; en: string }
> = {
  yacht: { fr: 'yacht', en: 'yacht-charter' },
  cars: { fr: 'voitures', en: 'luxury-cars' },
  chauffeur: { fr: 'chauffeur', en: 'private-chauffeur' },
  helicopter: { fr: 'helicoptere', en: 'helicopter-transfers' },
  access: { fr: 'reservations', en: 'reservations' },
};

type CanonicalService = keyof typeof SERVICE_URL_SEGMENT;
type Locale = 'fr' | 'en';

function isCanonical(s: string): s is CanonicalService {
  return s in SERVICE_URL_SEGMENT;
}

// Mapping canonical -> nom de route Nuxt du hub correspondant.
// Doit rester aligne avec les noms generes par Vue Router depuis
// le filesystem (pages/yacht/index.vue -> 'yacht', etc.).
const SERVICE_HUB_NAME: Record<CanonicalService, string> = {
  yacht: 'yacht',
  cars: 'voitures',
  chauffeur: 'chauffeur',
  helicopter: 'helicoptere',
  access: 'reservations',
};

// Lien { name } du hub d'un service. A passer a NuxtLink :to ou
// localePath({ name }). Pourquoi pas un string path ? Parce que
// localePath('/yacht') rate en EN car le path EN est /yacht-charter,
// pas /yacht (cf bug systemique localePath defineI18nRoute paths
// divergents).
export function serviceHubLink(canonical: string): { name: string } {
  if (!isCanonical(canonical)) return { name: canonical };
  return { name: SERVICE_HUB_NAME[canonical] };
}

// Path cocon ville pour un service. La page pages/[service]/in/[city].vue
// n'a pas de defineI18nRoute, donc le segment URL est literal.
// Pour SEO consistent FR/EN, on construit le path avec le segment de
// la locale courante (yacht-charter en EN, yacht en FR, etc.).
export function serviceCityPath(canonical: string, citySlug: string, locale: Locale): string {
  const seg = isCanonical(canonical) ? SERVICE_URL_SEGMENT[canonical][locale] : canonical;
  return `/${seg}/in/${citySlug}`;
}

// Idem pour cocon event (pages/[service]/event/[event].vue).
export function serviceEventPath(canonical: string, eventSlug: string, locale: Locale): string {
  const seg = isCanonical(canonical) ? SERVICE_URL_SEGMENT[canonical][locale] : canonical;
  return `/${seg}/event/${eventSlug}`;
}

// Path d'une fiche produit (yacht / voiture / etablissement / helicoptere).
// Construit en file-based (segment FR), localePath() resout via les
// defineI18nRoute des pages dynamiques (/yacht/[yacht], /voitures/[brandModel],
// /reservations/[establishment]).
export function productHubPath(kind: 'yacht' | 'cars' | 'access' | 'helicopter', slug: string): string {
  if (kind === 'yacht') return `/yacht/${slug}`;
  if (kind === 'cars') return `/voitures/${slug}`;
  if (kind === 'access') return `/reservations/${slug}`;
  // helicopter : pas de fiche dediee V1, fallback hub
  return `/helicoptere`;
}
