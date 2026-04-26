import { defineType, defineField } from 'sanity';

export const testimonial = defineType({
  name: 'testimonial',
  title: 'Testimonial (anonymized)',
  type: 'document',
  fields: [
    defineField({
      name: 'quoteEn',
      type: 'text',
      rows: 4,
      title: 'Quote (EN)',
      validation: (r) => r.required(),
    }),
    defineField({ name: 'quoteFr', type: 'text', rows: 4, title: 'Citation (FR)' }),
    defineField({
      name: 'attributionEn',
      type: 'string',
      title: 'Attribution (EN, e.g. "A Geneva-based investor")',
      description: 'Anonymized: profession + nationality. No real names.',
      validation: (r) => r.required(),
    }),
    defineField({ name: 'attributionFr', type: 'string' }),
    defineField({
      name: 'tags',
      type: 'array',
      of: [{ type: 'string' }],
      title: 'Tags (service, sub-service, route, city)',
    }),
  ],
  preview: { select: { title: 'attributionEn', subtitle: 'quoteEn' } },
});
