// Citation anonymisee (profession + nationalite uniquement, pas de nom).
import { defineType, defineField } from 'sanity';

export const quoteBlock = defineType({
  name: 'quoteBlock',
  title: 'Bloc citation',
  type: 'object',
  fields: [
    defineField({ name: 'quote', type: 'localizedText', title: 'Citation' }),
    defineField({ name: 'attribution', type: 'localizedString',
      title: 'Attribution (profession + nationalite, anonymisee)' }),
  ],
  preview: {
    select: { title: 'quote.en' },
    prepare({ title }) {
      return { title: (title || '(citation)').slice(0, 60) };
    },
  },
});
