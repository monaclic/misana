import { defineType, defineField } from 'sanity';

export const transferRoute = defineType({
  name: 'transferRoute',
  title: 'Transfer route',
  type: 'document',
  fields: [
    defineField({
      name: 'slug',
      type: 'slug',
      title: 'Slug (e.g. nice-airport-monaco)',
      options: { source: 'nameEn' },
      validation: (r) => r.required(),
    }),
    defineField({ name: 'nameEn', type: 'string', title: 'Route name (EN)' }),
    defineField({ name: 'nameFr', type: 'string', title: 'Nom de la route (FR)' }),
    defineField({
      name: 'from',
      type: 'reference',
      to: [{ type: 'destination' }],
    }),
    defineField({
      name: 'to',
      type: 'reference',
      to: [{ type: 'destination' }],
    }),
    defineField({
      name: 'mode',
      type: 'string',
      options: {
        list: [
          { title: 'Chauffeur', value: 'chauffeur' },
          { title: 'Helicopter', value: 'helicopter' },
          { title: 'Both', value: 'both' },
        ],
      },
      initialValue: 'chauffeur',
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
    select: { title: 'nameEn', subtitle: 'mode' },
  },
});
