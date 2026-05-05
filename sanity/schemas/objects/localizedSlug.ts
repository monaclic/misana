import { defineType, defineField } from 'sanity';

// localizedSlug : objet reutilisable pour stocker un slug par locale.
// Cohérent avec les autres objets i18n (localizedString, localizedText,
// localizedPortableText). Utilise dans tous les schemas qui ont une URL
// publique (yacht, rentalCar, accessEstablishment, destination, event,
// service, journalPost, transferRoute, route, curatedWeekend).
//
// Editable manuellement en studio : pas de auto-source pour permettre
// le controle SEO complet (slug FR != slug EN si besoin).
export const localizedSlug = defineType({
  name: 'localizedSlug',
  title: 'Localized slug',
  type: 'object',
  fields: [
    defineField({
      name: 'en',
      title: 'EN slug',
      type: 'slug',
      options: { maxLength: 80 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'fr',
      title: 'FR slug',
      type: 'slug',
      options: { maxLength: 80 },
      validation: (r) => r.required(),
    }),
  ],
});
