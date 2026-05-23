// Mapping service canonique (slug Sanity) -> segment URL par locale.
// Aligne sur les defineI18nRoute() des pages hub canoniques production :
//   pages/yacht/index.vue       -> en: /yacht-charter,        fr: /location-yacht
//   pages/cars/index.vue        -> en: /car-rental,           fr: /location-voiture
//   pages/chauffeur/index.vue   -> en: /private-chauffeur,    fr: /chauffeur-prive
//   pages/helicopter/index.vue  -> en: /helicopter-transfer,  fr: /transfert-helicoptere
//   pages/reservations/index.vue-> en: /reservations,         fr: /reservations
export const SERVICE_URL_SEGMENT: Record<
  'yacht' | 'cars' | 'chauffeur' | 'helicopter' | 'access',
  { fr: string; en: string }
> = {
  yacht: { fr: 'location-yacht', en: 'yacht-charter' },
  cars: { fr: 'location-voiture', en: 'car-rental' },
  chauffeur: { fr: 'chauffeur-prive', en: 'private-chauffeur' },
  helicopter: { fr: 'transfert-helicoptere', en: 'helicopter-transfer' },
  access: { fr: 'reservations', en: 'reservations' },
};

type CanonicalService = keyof typeof SERVICE_URL_SEGMENT;
type Locale = 'fr' | 'en';

function isCanonical(s: string): s is CanonicalService {
  return s in SERVICE_URL_SEGMENT;
}

// Mapping canonical -> nom de route Nuxt du hub correspondant.
// Aligne sur les noms generes par Vue Router depuis le filesystem
// (pages/yacht/index.vue -> 'yacht', pages/cars/index.vue -> 'cars', etc.).
const SERVICE_HUB_NAME: Record<CanonicalService, string> = {
  yacht: 'yacht',
  cars: 'cars',
  chauffeur: 'chauffeur',
  helicopter: 'helicopter',
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
// Construit en file-based avec le segment file-system des pages canoniques :
//   pages/yacht/[yacht].vue        -> /yacht/...     (defineI18nRoute resout en /yacht-charter, /location-yacht)
//   pages/cars/[brandModel].vue    -> /cars/...      (resout en /car-rental, /location-voiture)
//   pages/reservations/[slug].vue  -> /reservations/...
//   pages/helicopter/index.vue     -> /helicopter    (resout en /helicopter-transfer, /transfert-helicoptere)
// localePath() resout vers le bon path localise selon defineI18nRoute.
export function productHubPath(kind: 'yacht' | 'cars' | 'access' | 'helicopter', slug: string): string {
  if (kind === 'yacht') return `/yacht/${slug}`;
  if (kind === 'cars') return `/cars/${slug}`;
  if (kind === 'access') return `/reservations/${slug}`;
  // helicopter : pas de fiche dediee V1, fallback hub
  return `/helicopter`;
}
