import { defineType, defineField } from 'sanity';

export const helicopter = defineType({
  name: 'helicopter',
  title: 'Helicopter model',
  type: 'document',
  fields: [
    defineField({
      name: 'slug',
      type: 'slug',
      options: { source: 'name' },
      validation: (r) => r.required(),
    }),
    defineField({ name: 'name', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'subTitle', type: 'string', title: 'Sub (Single-engine / Twin-engine / VIP)' }),
    defineField({ name: 'pax', type: 'number', title: 'Passenger capacity' }),
    defineField({ name: 'speed', type: 'number', title: 'Cruise speed (km/h)' }),
    defineField({ name: 'range', type: 'number', title: 'Range (km)' }),
    defineField({ name: 'luggage', type: 'string', title: 'Luggage spec (e.g. 3·2 bags)' }),
    defineField({ name: 'shortEn', type: 'text', rows: 2 }),
    defineField({ name: 'shortFr', type: 'text', rows: 2 }),
    defineField({ name: 'bodyEn', type: 'array', of: [{ type: 'block' }] }),
    defineField({ name: 'bodyFr', type: 'array', of: [{ type: 'block' }] }),
    defineField({
      name: 'badge',
      type: 'string',
      title: 'Badge (Premium, VIP, Most popular…)',
    }),
    defineField({ name: 'heroImage', type: 'image', options: { hotspot: true } }),
    defineField({
      name: 'gallery',
      type: 'array',
      of: [{ type: 'image', options: { hotspot: true } }],
    }),
    defineField({ name: 'seo', type: 'seoMeta' }),
  ],
  preview: { select: { title: 'name', subtitle: 'subTitle' } },
});
