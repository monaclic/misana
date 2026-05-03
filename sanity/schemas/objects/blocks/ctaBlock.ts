// Bandeau CTA. Heading + body court + un ou deux boutons.
import { defineType, defineField } from 'sanity';

export const ctaBlock = defineType({
  name: 'ctaBlock',
  title: 'Bloc CTA',
  type: 'object',
  fields: [
    defineField({ name: 'heading', type: 'localizedString', title: 'Titre' }),
    defineField({ name: 'body', type: 'localizedText', title: 'Corps (optionnel)' }),
    defineField({ name: 'primaryLabel', type: 'localizedString', title: 'CTA principal label' }),
    defineField({ name: 'primaryHref', type: 'string', title: 'CTA principal href' }),
    defineField({ name: 'secondaryLabel', type: 'localizedString', title: 'CTA secondaire label (optionnel)' }),
    defineField({ name: 'secondaryHref', type: 'string', title: 'CTA secondaire href (optionnel)' }),
  ],
  preview: {
    select: { title: 'heading.en' },
    prepare({ title }) {
      return { title: title || '(CTA)' };
    },
  },
});
