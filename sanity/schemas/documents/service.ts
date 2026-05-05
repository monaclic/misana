import { defineType, defineField } from 'sanity';

export const service = defineType({
  name: 'service',
  title: 'Service',
  type: 'document',
  fields: [
    defineField({
      name: 'slug',
      type: 'slug',
      title: 'Slug (legacy, à supprimer après refonte)',
      options: { source: 'nameEn', maxLength: 64 },
    }),
    defineField({
      name: 'slugI18n',
      type: 'localizedSlug',
      title: 'Slug i18n (URL FR / EN)',
    }),
    defineField({
      name: 'order',
      type: 'number',
      title: 'Order in nav',
      initialValue: 0,
    }),
    defineField({ name: 'nameEn', type: 'string', title: 'Name (EN)' }),
    defineField({ name: 'nameFr', type: 'string', title: 'Nom (FR)' }),
    defineField({ name: 'taglineEn', type: 'string', title: 'Tagline (EN)' }),
    defineField({ name: 'taglineFr', type: 'string', title: 'Tagline (FR)' }),
    defineField({
      name: 'introEn',
      type: 'text',
      rows: 3,
      title: 'Intro paragraph (EN)',
    }),
    defineField({
      name: 'introFr',
      type: 'text',
      rows: 3,
      title: 'Paragraphe d\'intro (FR)',
    }),
    defineField({
      name: 'bodyEn',
      type: 'array',
      title: 'Body (EN)',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'bodyFr',
      type: 'array',
      title: 'Corps (FR)',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'availableInCities',
      type: 'array',
      title: 'Cities where this service operates',
      of: [{ type: 'reference', to: [{ type: 'destination' }] }],
    }),
    defineField({
      name: 'heroImage',
      type: 'image',
      title: 'Hero image',
      options: { hotspot: true },
    }),
    defineField({ name: 'seo', type: 'seoMeta', title: 'SEO' }),
  ],
  preview: {
    select: { title: 'nameEn', subtitle: 'slug.current' },
  },
});
