import { defineType, defineField } from 'sanity';

// Object localise pour stocker un tableau de strings dans 2 langues.
// Utilise pour signatureTags, occasions sur accessEstablishment.
// Garde la coherence avec localizedString / localizedText : un seul object
// {fr, en} plutot que deux fields separes (factualLabelsFr / factualLabelsEn).
export const localizedStringArray = defineType({
  name: 'localizedStringArray',
  title: 'Localized string array',
  type: 'object',
  fields: [
    defineField({
      name: 'en',
      type: 'array',
      title: 'English',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
    }),
    defineField({
      name: 'fr',
      type: 'array',
      title: 'Français',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
    }),
  ],
});
