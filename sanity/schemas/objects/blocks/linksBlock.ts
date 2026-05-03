// Bloc liens internes. Refs vers fiches existantes (cars, yachts, accessEstablishment,
// destinations, etc.) ou items custom (title + href + image).
import { defineType, defineField } from 'sanity';

export const linksBlock = defineType({
  name: 'linksBlock',
  title: 'Bloc maillage interne',
  type: 'object',
  fields: [
    defineField({ name: 'eyebrow', type: 'localizedString', title: 'Petite ligne (optionnelle)' }),
    defineField({ name: 'heading', type: 'localizedString', title: 'Titre (optionnel)' }),
    defineField({
      name: 'refs',
      type: 'array',
      title: 'Refs vers fiches Sanity',
      of: [{ type: 'reference',
        to: [
          { type: 'rentalCar' },
          { type: 'yacht' },
          { type: 'accessEstablishment' },
        ],
      }],
    }),
    defineField({
      name: 'customItems',
      type: 'array',
      title: 'Items custom (si pas de fiche correspondante)',
      of: [{
        type: 'object',
        name: 'linkItem',
        fields: [
          defineField({ name: 'title', type: 'localizedString' }),
          defineField({ name: 'href', type: 'string' }),
          defineField({ name: 'image', type: 'image', options: { hotspot: true } }),
        ],
        preview: { select: { title: 'title.en', media: 'image' } },
      }],
    }),
  ],
  preview: {
    select: { title: 'heading.en' },
    prepare({ title }) {
      return { title: title || '(liens)' };
    },
  },
});
