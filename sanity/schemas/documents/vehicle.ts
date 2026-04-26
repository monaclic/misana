import { defineType, defineField } from 'sanity';

export const vehicle = defineType({
  name: 'vehicle',
  title: 'Vehicle (chauffeur fleet & rental cars)',
  type: 'document',
  fields: [
    defineField({
      name: 'slug',
      type: 'slug',
      options: { source: 'name' },
      validation: (r) => r.required(),
    }),
    defineField({ name: 'name', type: 'string', title: 'Name', validation: (r) => r.required() }),
    defineField({
      name: 'segment',
      type: 'string',
      title: 'Segment',
      options: {
        list: [
          { title: 'Chauffeur fleet (driven)', value: 'chauffeur' },
          { title: 'Grand Tourer (self-drive)', value: 'grand-tourer' },
          { title: 'Supercar (self-drive)', value: 'supercar' },
        ],
      },
      validation: (r) => r.required(),
    }),
    defineField({ name: 'subTitle', type: 'string', title: 'Sub title (Executive Sedan, Luxury SUV…)' }),
    defineField({ name: 'brand', type: 'string', title: 'Brand' }),
    defineField({ name: 'pax', type: 'number', title: 'Passenger capacity' }),
    defineField({ name: 'luggage', type: 'string', title: 'Luggage spec (e.g. 7 bags, 3 bags)' }),
    defineField({
      name: 'features',
      type: 'array',
      of: [{ type: 'string' }],
      title: 'Features (one per item, e.g. "Massage seats")',
    }),
    defineField({ name: 'shortEn', type: 'text', rows: 2, title: 'Short blurb (EN)' }),
    defineField({ name: 'shortFr', type: 'text', rows: 2, title: 'Short (FR)' }),
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
    }),
    defineField({
      name: 'badge',
      type: 'string',
      title: 'Badge (Most popular, Premium…)',
    }),
    defineField({ name: 'heroImage', type: 'image', options: { hotspot: true } }),
    defineField({
      name: 'gallery',
      type: 'array',
      of: [{ type: 'image', options: { hotspot: true } }],
    }),
    defineField({ name: 'seo', type: 'seoMeta' }),
  ],
  preview: { select: { title: 'name', subtitle: 'segment' } },
});
