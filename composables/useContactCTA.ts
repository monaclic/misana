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
    // Fiches yacht : /yacht/{slug} mais pas /yacht ni /yacht/all
    /^\/(?:fr|en)?\/?services\/yacht\/(?!all|index|$)[^/]+\/?$/,
    // Fiches cars : /cars/{brandModel} mais pas /cars ni /all
    /^\/(?:fr|en)?\/?services\/cars\/(?!all|index|$)[^/]+\/?$/,
    /^\/(?:fr|en)?\/?services\/voitures\/(?!all|index|$)[^/]+\/?$/,
    // Fiches access : /access/{establishment}
    /^\/(?:fr|en)?\/?services\/access\/(?!index|$)[^/]+\/?$/,
    /^\/(?:fr|en)?\/?services\/acces\/(?!index|$)[^/]+\/?$/,
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
