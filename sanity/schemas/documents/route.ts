import { defineType, defineField } from 'sanity';

export const route = defineType({
  name: 'route',
  title: 'Route (helicopter or chauffeur point-to-point)',
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
      name: 'mode',
      type: 'string',
      options: {
        list: [
          { title: 'Chauffeur (airport transfer)', value: 'chauffeur-airport' },
          { title: 'Chauffeur (city to city)', value: 'chauffeur-intercity' },
          { title: 'Helicopter', value: 'helicopter' },
          { title: 'Both (chauffeur + helicopter)', value: 'both' },
        ],
      },
      validation: (r) => r.required(),
    }),
    defineField({ name: 'nameEn', type: 'string', title: 'Name (EN, e.g. "Nice to Monaco")' }),
    defineField({ name: 'nameFr', type: 'string' }),
    defineField({
      name: 'fromCity',
      type: 'reference',
      to: [{ type: 'destination' }],
    }),
    defineField({
      name: 'toCity',
      type: 'reference',
      to: [{ type: 'destination' }],
    }),
    defineField({
      name: 'fromHeliport',
      type: 'reference',
      to: [{ type: 'heliport' }],
      title: 'From heliport (if helicopter mode)',
    }),
    defineField({
      name: 'toHeliport',
      type: 'reference',
      to: [{ type: 'heliport' }],
      title: 'To heliport (if helicopter mode)',
    }),
    defineField({ name: 'distanceKm', type: 'number', title: 'Distance (km)' }),
    defineField({
      name: 'durationMin',
      type: 'number',
      title: 'Typical duration (minutes)',
    }),
    defineField({
      name: 'priceFromEur',
      type: 'number',
      title: 'Price from (EUR, indicative)',
    }),
    defineField({
      name: 'aircraftAvailable',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'helicopter' }] }],
      title: 'Aircraft used on this route (if helicopter)',
    }),
    defineField({
      name: 'vehiclesAvailable',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'vehicle' }] }],
      title: 'Vehicles used on this route (if chauffeur)',
    }),
    defineField({ name: 'shortEn', type: 'text', rows: 2 }),
    defineField({ name: 'shortFr', type: 'text', rows: 2 }),
    defineField({ name: 'bodyEn', type: 'array', of: [{ type: 'block' }] }),
    defineField({ name: 'bodyFr', type: 'array', of: [{ type: 'block' }] }),
    defineField({ name: 'heroImage', type: 'image', options: { hotspot: true } }),
    defineField({ name: 'seo', type: 'seoMeta' }),
  ],
  preview: { select: { title: 'nameEn', subtitle: 'mode' } },
});
