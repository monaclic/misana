import { defineType, defineField } from 'sanity';

export const destination = defineType({
  name: 'destination',
  title: 'Destination',
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
      title: 'Editorial tier',
      options: {
        list: [
          { title: 'Heavy (2000+ words)', value: 'heavy' },
          { title: 'Stub (800-1200 words)', value: 'stub' },
        ],
      },
      initialValue: 'stub',
    }),
    defineField({ name: 'nameEn', type: 'string' }),
    defineField({ name: 'nameFr', type: 'string' }),
    defineField({
      name: 'shortDescriptionEn',
      type: 'text',
      rows: 2,
      title: 'Short description (EN, 1-2 lines)',
    }),
    defineField({
      name: 'shortDescriptionFr',
      type: 'text',
      rows: 2,
      title: 'Description courte (FR)',
    }),
    defineField({
      name: 'bodyEn',
      type: 'array',
      of: [{ type: 'block' }],
      title: 'Body (EN)',
    }),
    defineField({
      name: 'bodyFr',
      type: 'array',
      of: [{ type: 'block' }],
      title: 'Corps (FR)',
    }),
    defineField({
      name: 'adjacentDestinations',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'destination' }] }],
      title: 'Adjacent destinations',
    }),
    defineField({ name: 'heroImage', type: 'image', options: { hotspot: true } }),
    defineField({ name: 'seo', type: 'seoMeta' }),
  ],
  preview: {
    select: { title: 'nameEn', subtitle: 'tier' },
  },
});
