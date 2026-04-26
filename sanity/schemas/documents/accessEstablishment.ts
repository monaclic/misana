import { defineType, defineField } from 'sanity';

export const accessEstablishment = defineType({
  name: 'accessEstablishment',
  title: 'Access establishment',
  type: 'document',
  fields: [
    defineField({
      name: 'slug',
      type: 'slug',
      options: { source: 'name' },
      validation: (r) => r.required(),
    }),
    defineField({ name: 'name', type: 'string', title: 'Name' }),
    defineField({
      name: 'category',
      type: 'string',
      options: {
        list: [
          { title: 'Restaurant', value: 'restaurant' },
          { title: 'Palace', value: 'palace' },
          { title: 'Beach club', value: 'beach-club' },
          { title: 'Nightclub', value: 'nightclub' },
        ],
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'destination',
      type: 'reference',
      to: [{ type: 'destination' }],
    }),
    defineField({ name: 'shortEn', type: 'text', rows: 2 }),
    defineField({ name: 'shortFr', type: 'text', rows: 2 }),
    defineField({
      name: 'bodyEn',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'bodyFr',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({ name: 'heroImage', type: 'image', options: { hotspot: true } }),
    defineField({ name: 'seo', type: 'seoMeta' }),
  ],
  preview: {
    select: { title: 'name', subtitle: 'category' },
  },
});
