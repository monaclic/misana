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

// Path file-based (segment FR) du hub d'un service.
// A passer a localePath() : i18n l'utilisera pour resoudre le path
// localise via le defineI18nRoute de la page cible.
// Ex: serviceHubPath('yacht') -> '/yacht'
//     localePath(serviceHubPath('yacht')) -> '/fr/yacht' ou '/en/yacht-charter'
export function serviceHubPath(canonical: string): string {
  if (!isCanonical(canonical)) return `/${canonical}`;
  return `/${SERVICE_URL_SEGMENT[canonical].fr}`;
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
