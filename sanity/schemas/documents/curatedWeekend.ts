import { defineType, defineField } from 'sanity';

export const curatedWeekend = defineType({
  name: 'curatedWeekend',
  title: 'Curated weekend',
  type: 'document',
  fields: [
    defineField({
      name: 'slug',
      type: 'slug',
      options: { source: 'nameEn' },
      validation: (r) => r.required(),
    }),
    defineField({ name: 'nameEn', type: 'string' }),
    defineField({ name: 'nameFr', type: 'string' }),
    defineField({
      name: 'destinations',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'destination' }] }],
    }),
    defineField({
      name: 'event',
      type: 'reference',
      to: [{ type: 'event' }],
      title: 'Anchor event (optional)',
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
  preview: { select: { title: 'nameEn' } },
});
