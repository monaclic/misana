// Singleton page Contact. La copy ici complete les reglages globaux
// (phone, email, address dans globalSettings) avec ce qui est specifique
// a la page : titre hero, lead, intro mail, horaires telephone.
import { defineType, defineField } from 'sanity';

export const contactPage = defineType({
  name: 'contactPage',
  title: 'Page Contact',
  type: 'document',
  groups: [
    { name: 'hero', title: 'Hero' },
    { name: 'phone', title: 'Section telephone' },
    { name: 'email', title: 'Section email' },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    // --- HERO ---
    defineField({ name: 'heroTitleOverride', type: 'localizedString', group: 'hero',
      title: 'Titre H1 override (sinon i18n)' }),
    defineField({ name: 'heroLeadOverride', type: 'localizedText', group: 'hero',
      title: 'Lead hero override (sinon i18n)' }),

    // --- PHONE ---
    defineField({ name: 'phoneSectionLabelOverride', type: 'localizedString', group: 'phone',
      title: 'Label "Par telephone" override (sinon i18n)' }),
    defineField({ name: 'phoneHoursOverride', type: 'localizedText', group: 'phone',
      title: 'Horaires d\'accueil override (sinon i18n)' }),

    // --- EMAIL ---
    defineField({ name: 'emailSectionLabelOverride', type: 'localizedString', group: 'email',
      title: 'Label "Par email" override (sinon i18n)' }),
    defineField({ name: 'emailIntroOverride', type: 'localizedText', group: 'email',
      title: 'Intro section email override (sinon i18n)' }),

    // --- SEO ---
    defineField({ name: 'seo', type: 'seoMeta', group: 'seo' }),
  ],
  preview: {
    prepare() { return { title: 'Page Contact' }; },
  },
});
