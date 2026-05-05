import { defineType, defineField } from 'sanity';

export const event = defineType({
  name: 'event',
  title: 'Event',
  type: 'document',
  fields: [
    defineField({
      name: 'slug',
      type: 'slug',
      title: 'Slug (legacy, à supprimer après refonte)',
      options: { source: 'nameEn' },
    }),
    defineField({
      name: 'slugI18n',
      type: 'localizedSlug',
      title: 'Slug i18n (URL FR / EN)',
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
      name: 'monthOrder',
      type: 'number',
      title: 'Ordre du mois (1=Jan, 12=Dec)',
      validation: (r) => r.required().min(1).max(12),
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
