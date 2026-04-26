import { defineType, defineField } from 'sanity';

export const serviceVariant = defineType({
  name: 'serviceVariant',
  title: 'Service variant',
  type: 'document',
  fields: [
    defineField({
      name: 'service',
      type: 'reference',
      to: [{ type: 'service' }],
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: { source: 'nameEn' },
      validation: (r) => r.required(),
    }),
    defineField({ name: 'nameEn', type: 'string', title: 'Name (EN)' }),
    defineField({ name: 'nameFr', type: 'string', title: 'Nom (FR)' }),
    defineField({ name: 'descriptionEn', type: 'text', rows: 3 }),
    defineField({ name: 'descriptionFr', type: 'text', rows: 3 }),
    defineField({
      name: 'category',
      type: 'string',
      options: {
        list: [
          { title: 'Grand Tourer', value: 'grand-tourer' },
          { title: 'Supercar', value: 'supercar' },
          { title: 'Day cruise', value: 'day-cruise' },
          { title: 'Week charter', value: 'week-charter' },
          { title: 'Transfer', value: 'transfer' },
          { title: 'Tour', value: 'tour' },
          { title: 'Restaurant', value: 'restaurant' },
          { title: 'Palace', value: 'palace' },
          { title: 'Beach club', value: 'beach-club' },
          { title: 'Nightclub', value: 'nightclub' },
        ],
      },
    }),
    defineField({ name: 'image', type: 'image', options: { hotspot: true } }),
  ],
  preview: {
    select: { title: 'nameEn', subtitle: 'category' },
  },
});
