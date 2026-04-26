import { defineType, defineField } from 'sanity';

export const event = defineType({
  name: 'event',
  title: 'Event',
  type: 'document',
  fields: [
    defineField({
      name: 'slug',
      type: 'slug',
      options: { source: 'nameEn' },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'tier',
      type: 'string',
      options: {
        list: [
          { title: 'Heavy', value: 'heavy' },
          { title: 'Stub', value: 'stub' },
        ],
      },
      initialValue: 'heavy',
    }),
    defineField({ name: 'nameEn', type: 'string' }),
    defineField({ name: 'nameFr', type: 'string' }),
    defineField({
      name: 'monthEn',
      type: 'string',
      title: 'Month (EN, e.g. May)',
    }),
    defineField({
      name: 'monthFr',
      type: 'string',
      title: 'Mois (FR, e.g. Mai)',
    }),
    defineField({
      name: 'destination',
      type: 'reference',
      to: [{ type: 'destination' }],
      title: 'Primary destination',
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
  preview: { select: { title: 'nameEn', subtitle: 'monthEn' } },
});
