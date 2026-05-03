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
  const { data } = useLazyAsyncData('contactPage', () =>
    (sanity.client as any).fetch(QUERY),
  );
  const contact = computed<ContactPageData | null>(() => data.value || null);
  return { contact };
}
