import { defineType, defineField } from 'sanity';

export const journalPost = defineType({
  name: 'journalPost',
  title: 'Journal post',
  type: 'document',
  fields: [
    defineField({
      name: 'slug',
      type: 'slug',
      options: { source: 'titleEn' },
      validation: (r) => r.required(),
    }),
    defineField({ name: 'titleEn', type: 'string' }),
    defineField({ name: 'titleFr', type: 'string' }),
    defineField({ name: 'excerptEn', type: 'text', rows: 3 }),
    defineField({ name: 'excerptFr', type: 'text', rows: 3 }),
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
    defineField({
      name: 'author',
      type: 'reference',
      to: [{ type: 'author' }],
    }),
    defineField({ name: 'publishedAt', type: 'datetime' }),
    defineField({
      name: 'relatedDestinations',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'destination' }] }],
    }),
    defineField({
      name: 'relatedServices',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'service' }] }],
    }),
    defineField({
      name: 'relatedEvent',
      type: 'reference',
      to: [{ type: 'event' }],
    }),
    defineField({ name: 'heroImage', type: 'image', options: { hotspot: true } }),
    defineField({ name: 'seo', type: 'seoMeta' }),
  ],
  preview: {
    select: { title: 'titleEn', subtitle: 'publishedAt' },
  },
});
