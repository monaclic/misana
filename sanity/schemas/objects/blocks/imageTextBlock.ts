// Bloc editorial image + texte. Image gauche/droite, copy bilingue.
import { defineType, defineField } from 'sanity';

export const imageTextBlock = defineType({
  name: 'imageTextBlock',
  title: 'Bloc image + texte',
  type: 'object',
  fields: [
    defineField({ name: 'image', type: 'image', options: { hotspot: true } }),
    defineField({ name: 'imageAlign', type: 'string', title: 'Cote image',
      options: { list: [
        { title: 'Gauche', value: 'left' },
        { title: 'Droite', value: 'right' },
      ]}, initialValue: 'left',
    }),
    defineField({ name: 'eyebrow', type: 'localizedString', title: 'Petite ligne au-dessus' }),
    defineField({ name: 'heading', type: 'localizedString', title: 'Titre' }),
    defineField({ name: 'body', type: 'localizedText', title: 'Corps' }),
    defineField({ name: 'ctaLabel', type: 'localizedString', title: 'CTA label (optionnel)' }),
    defineField({ name: 'ctaHref', type: 'string', title: 'CTA href (optionnel, slug ou URL)' }),
  ],
  preview: {
    select: { title: 'heading.en', media: 'image' },
    prepare({ title, media }) {
      return { title: title || '(image + texte)', media };
    },
  },
});
