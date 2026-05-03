// Bloc faits / chiffres cles. Plusieurs items (label + valeur).
import { defineType, defineField } from 'sanity';

export const factsBlock = defineType({
  name: 'factsBlock',
  title: 'Bloc faits / chiffres',
  type: 'object',
  fields: [
    defineField({ name: 'eyebrow', type: 'localizedString', title: 'Petite ligne (optionnelle)' }),
    defineField({ name: 'heading', type: 'localizedString', title: 'Titre (optionnel)' }),
    defineField({
      name: 'items',
      type: 'array',
      title: 'Faits',
      of: [{
        type: 'object',
        name: 'fact',
        fields: [
          defineField({ name: 'value', type: 'localizedString', title: 'Valeur (ex. "80 km", "8")' }),
          defineField({ name: 'label', type: 'localizedString', title: 'Label (ex. "destinations")' }),
        ],
        preview: { select: { title: 'value.en', subtitle: 'label.en' } },
      }],
    }),
  ],
  preview: {
    select: { title: 'heading.en', count: 'items' },
    prepare({ title, count }) {
      return { title: title || '(faits)', subtitle: `${(count as any[])?.length || 0} items` };
    },
  },
});
