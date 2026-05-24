// Composable singleton page Contact. Tous les overrides sont optionnels :
// la page utilise les traductions i18n par defaut.
export type ContactPageData = {
  heroTitleOverride?: { fr?: string; en?: string };
  heroLeadOverride?: { fr?: string; en?: string };
  phoneSectionLabelOverride?: { fr?: string; en?: string };
  phoneHoursOverride?: { fr?: string; en?: string };
  emailSectionLabelOverride?: { fr?: string; en?: string };
  emailIntroOverride?: { fr?: string; en?: string };
  seo?: {
    titleEn?: string; titleFr?: string;
    descriptionEn?: string; descriptionFr?: string;
  };
};

const QUERY = /* groq */ `*[_id == "contactPage"][0] {
  heroTitleOverride, heroLeadOverride,
  phoneSectionLabelOverride, phoneHoursOverride,
  emailSectionLabelOverride, emailIntroOverride,
  seo
}`;

export function useContactPage() {
  const sanity = useSanity();
  // Timeout 3s sur le fetch Sanity en SSR : evite 500 cold start Vercel.
  // Au-dela, on resolve null et la page contact rend avec son fallback.
  // Meme pattern que useServiceHub, useHomePage, useGlobalSettings.
  const { data } = useLazyAsyncData('contactPage', async () => {
    try {
      return await Promise.race([
        (sanity.client as any).fetch(QUERY),
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 3000)),
      ]);
    } catch (err: any) {
      console.error('[useContactPage] Sanity fetch failed:', err?.message ?? err);
      return null;
    }
  });
  const contact = computed<ContactPageData | null>(() => data.value || null);
  return { contact };
}
