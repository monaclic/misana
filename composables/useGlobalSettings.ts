// Composable lecture des reglages globaux (singleton). Header, footer
// et page contact lisent ici plutot que d'avoir des constantes en dur.
// Fallbacks par defaut pour ne jamais avoir un champ vide.
export type GlobalSettings = {
  contactPhone: string;
  contactPhoneHref: string;
  contactEmail: string;
  whatsappNumber: string;
  address: { fr?: string; en?: string };
  instagram: string;
  linkedin: string;
};

const DEFAULTS: GlobalSettings = {
  contactPhone: '+33 4 00 00 00 00',
  contactPhoneHref: 'tel:+33400000000',
  contactEmail: 'contact@misana-group.com',
  whatsappNumber: '',
  address: {},
  instagram: '',
  linkedin: '',
};

const QUERY = /* groq */ `*[_id == "globalSettings"][0] {
  contactPhone, contactPhoneHref, contactEmail,
  whatsappNumber, address, instagram, linkedin
}`;

function adapt(d: any): GlobalSettings {
  if (!d) return DEFAULTS;
  return {
    contactPhone: d.contactPhone || DEFAULTS.contactPhone,
    contactPhoneHref: d.contactPhoneHref
      || (d.contactPhone ? `tel:${d.contactPhone.replace(/\s+/g, '')}` : DEFAULTS.contactPhoneHref),
    contactEmail: d.contactEmail || DEFAULTS.contactEmail,
    whatsappNumber: d.whatsappNumber || DEFAULTS.whatsappNumber,
    address: d.address || DEFAULTS.address,
    instagram: d.instagram || DEFAULTS.instagram,
    linkedin: d.linkedin || DEFAULTS.linkedin,
  };
}

export function useGlobalSettings() {
  const sanity = useSanity();
  // Timeout 3s sur le fetch Sanity en SSR : ce composable est appele
  // dans AppHeader + AppFooter, donc charge sur TOUTES les pages via le
  // layout default. Sans cette protection, n'importe quelle URL retourne
  // 500 au cold start Vercel si Sanity tarde. Au-dela du timeout, on
  // retombe sur DEFAULTS (constantes en dur dans adapt()).
  // Meme pattern que useServiceHub et useHomePage.
  const { data } = useLazyAsyncData('globalSettings', async () => {
    try {
      return await Promise.race([
        (sanity.client as any).fetch(QUERY),
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 3000)),
      ]);
    } catch (err: any) {
      console.error('[useGlobalSettings] Sanity fetch failed:', err?.message ?? err);
      return null;
    }
  });
  const settings = computed<GlobalSettings>(() => adapt(data.value));
  return { settings };
}
