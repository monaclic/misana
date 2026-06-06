// Determine si l'utilisateur a besoin de voir le CTA contact (header
// "Faire une demande", sticky bottom WhatsApp/Call/Request).
//
// Logique : on cache sur les pages ou l'action est deja contextuelle
// ou redondante :
//  - /request (deja dans le form)
//  - /contact (deja en contact)
//  - fiches produits avec leurs propres CTA dedies (yacht, cars, access)
//
// La home garde son override via useState('sticky-contact-visible') :
// elle cache la barre tant que l'utilisateur n'a pas scrolle hors du hero.
export function useContactCTA() {
  const route = useRoute();
  const overrideVisible = useState<boolean>('sticky-contact-visible', () => true);
  const footerOverlap = useState<boolean>('footer-overlap', () => false);

  // Routes ou le CTA est cache : matched sur le path (en gerant les
  // prefixes i18n /fr et /en).
  const HIDE_PATTERNS = [
    /^\/(?:fr|en)?\/?request(?:\/|$)/,        // /request, /request/thanks
    /^\/(?:fr|en)?\/?contact(?:\/|$)/,         // /contact
    // Fiches yacht : /yacht-charter/{slug} ou /location-yacht/{slug}
    /^\/(?:fr|en)?\/?yacht-charter\/(?!all|index|$)[^/]+\/?$/,
    /^\/(?:fr|en)?\/?location-yacht\/(?!all|index|$)[^/]+\/?$/,
    // Fiches cars : /car-rental/{brandModel} ou /location-voiture/{brandModel}
    /^\/(?:fr|en)?\/?car-rental\/(?!all|index|$)[^/]+\/?$/,
    /^\/(?:fr|en)?\/?location-voiture\/(?!all|index|$)[^/]+\/?$/,
    // Fiches reservations : /reservations/{establishment}
    /^\/(?:fr|en)?\/?reservations\/(?!index|$)[^/]+\/?$/,
    // Fiches villa : /luxury-villa-rental/{slug} ou /location-villa-de-luxe/{slug}
    // (barre sticky prix/CTA dediee en mobile, comme yacht/cars)
    /^\/(?:fr|en)?\/?luxury-villa-rental\/(?!all|index|$)[^/]+\/?$/,
    /^\/(?:fr|en)?\/?location-villa-de-luxe\/(?!all|index|$)[^/]+\/?$/,
  ];

  const isHiddenRoute = computed(() => {
    const p = route.path;
    return HIDE_PATTERNS.some((re) => re.test(p));
  });

  const visible = computed(() => {
    if (isHiddenRoute.value) return false;
    if (footerOverlap.value) return false;
    return overrideVisible.value;
  });

  return { visible, isHiddenRoute };
}
