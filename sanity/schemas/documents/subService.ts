import { defineType, defineField } from 'sanity';

export const subService = defineType({
  name: 'subService',
  title: 'Sub-service (level 2 page)',
  type: 'document',
  fields: [
    defineField({
      name: 'slug',
      type: 'slug',
      options: { source: 'nameEn' },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'parentService',
      type: 'reference',
      to: [{ type: 'service' }],
      validation: (r) => r.required(),
    }),
    defineField({ name: 'nameEn', type: 'string' }),
    defineField({ name: 'nameFr', type: 'string' }),
    defineField({ name: 'taglineEn', type: 'string' }),
    defineField({ name: 'taglineFr', type: 'string' }),
    defineField({ name: 'shortEn', type: 'text', rows: 2 }),
    defineField({ name: 'shortFr', type: 'text', rows: 2 }),
    defineField({
      name: 'whyCardsEn',
      type: 'array',
      title: 'Why this service (EN, 3 cards: title + body)',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'title', type: 'string' },
            { name: 'body', type: 'text', rows: 3 },
          ],
        },
      ],
    }),
    defineField({
      name: 'whyCardsFr',
      type: 'array',
      title: 'Why (FR)',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'title', type: 'string' },
            { name: 'body', type: 'text', rows: 3 },
          ],
        },
      ],
    }),
    defineField({
      name: 'howSteps',
      type: 'array',
      title: 'How it works (steps)',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'titleEn', type: 'string' },
            { name: 'titleFr', type: 'string' },
            { name: 'bodyEn', type: 'string' },
            { name: 'bodyFr', type: 'string' },
          ],
        },
      ],
    }),
    defineField({ name: 'bodyEn', type: 'array', of: [{ type: 'block' }] }),
    defineField({ name: 'bodyFr', type: 'array', of: [{ type: 'block' }] }),
    defineField({ name: 'heroImage', type: 'image', options: { hotspot: true } }),
    defineField({ name: 'seo', type: 'seoMeta' }),
  ],
  preview: {
    select: { title: 'nameEn', subtitle: 'parentService.nameEn' },
  },
});
