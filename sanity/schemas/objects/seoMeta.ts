import { defineType, defineField } from 'sanity';

export const seoMeta = defineType({
  name: 'seoMeta',
  title: 'SEO',
  type: 'object',
  fields: [
    defineField({
      name: 'titleEn',
      type: 'string',
      title: 'Title (EN, 50 to 60 chars)',
      validation: (r) => r.max(70),
    }),
    defineField({
      name: 'titleFr',
      type: 'string',
      title: 'Titre (FR, 50 à 60 car.)',
      validation: (r) => r.max(70),
    }),
    defineField({
      name: 'descriptionEn',
      type: 'text',
      rows: 2,
      title: 'Description (EN, 150 to 160 chars)',
      validation: (r) => r.max(180),
    }),
    defineField({
      name: 'descriptionFr',
      type: 'text',
      rows: 2,
      title: 'Description (FR, 150 à 160 car.)',
      validation: (r) => r.max(180),
    }),
    defineField({
      name: 'ogImage',
      type: 'image',
      title: 'Open Graph image (1200×630)',
      options: { hotspot: true },
    }),
  ],
});
