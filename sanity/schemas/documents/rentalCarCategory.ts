import { defineType, defineField } from 'sanity';

export const rentalCarCategory = defineType({
  name: 'rentalCarCategory',
  title: 'Rental car category',
  type: 'document',
  fields: [
    defineField({
      name: 'slug',
      type: 'slug',
      options: { source: 'name.en' },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'name',
      type: 'localizedString',
      title: 'Nom (FR/EN)',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'order',
      type: 'number',
      title: 'Ordre d\'affichage',
      initialValue: 0,
    }),
  ],
  preview: {
    select: { title: 'name.fr', subtitle: 'name.en' },
  },
});
