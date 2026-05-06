// Determine si l'utilisateur a besoin de voir le CTA contact (header
// "Faire une demande", sticky bottom WhatsApp/Call/Request).
//
// Logique : on cache sur les pages ou l'action est deja contextuelle
// ou redondante :
//  - /request, /demande (deja dans le form)
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
  // prefixes i18n /fr et /en). Slugs FR + EN gere pour chaque page.
  const HIDE_PATTERNS = [
    /^\/(?:fr|en)?\/?request(?:\/|$)/,         // EN: /request, /request/thanks
    /^\/(?:fr|en)?\/?demande(?:\/|$)/,          // FR: /demande, /demande/merci
    /^\/(?:fr|en)?\/?contact(?:\/|$)/,
    // Fiches yacht : /yacht/{slug} ou /yacht-charter/{slug}
    /^\/(?:fr|en)?\/?yacht\/(?!all|tous|index|in|event|$)[^/]+\/?$/,
    /^\/(?:fr|en)?\/?yacht-charter\/(?!all|tous|index|in|event|$)[^/]+\/?$/,
    // Fiches cars : /voitures/{brandModel} ou /luxury-cars/{brandModel}
    /^\/(?:fr|en)?\/?voitures\/(?!all|tous|index|in|event|$)[^/]+\/?$/,
    /^\/(?:fr|en)?\/?luxury-cars\/(?!all|tous|index|in|event|$)[^/]+\/?$/,
    // Fiches access : /reservations/{establishment} (FR=EN)
    /^\/(?:fr|en)?\/?reservations\/(?!index|$)[^/]+\/?$/,
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
