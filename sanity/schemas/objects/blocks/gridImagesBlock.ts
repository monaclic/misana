// Galerie d'images en grille (2, 3 ou 4 colonnes). Pour panels home, galerie maison, etc.
import { defineType, defineField } from 'sanity';

export const gridImagesBlock = defineType({
  name: 'gridImagesBlock',
  title: 'Bloc galerie en grille',
  type: 'object',
  fields: [
    defineField({ name: 'eyebrow', type: 'localizedString', title: 'Petite ligne (optionnelle)' }),
    defineField({ name: 'heading', type: 'localizedString', title: 'Titre (optionnel)' }),
    defineField({ name: 'columns', type: 'number', title: 'Colonnes desktop',
      validation: (r) => r.min(1).max(6), initialValue: 3,
    }),
    defineField({
      name: 'items',
      type: 'array',
      title: 'Images',
      of: [{
        type: 'object',
        name: 'gridImage',
        fields: [
          defineField({ name: 'image', type: 'image', options: { hotspot: true } }),
          defineField({ name: 'caption', type: 'localizedString', title: 'Legende (optionnelle)' }),
          defineField({ name: 'href', type: 'string', title: 'Lien (optionnel)' }),
        ],
        preview: { select: { title: 'caption.en', media: 'image' } },
      }],
    }),
  ],
  preview: {
    select: { title: 'heading.en', count: 'items' },
    prepare({ title, count }) {
      return { title: title || '(galerie)', subtitle: `${(count as any[])?.length || 0} images` };
    },
  },
});
