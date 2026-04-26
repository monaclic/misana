import { defineType, defineField } from 'sanity';

export const heliport = defineType({
  name: 'heliport',
  title: 'Heliport',
  type: 'document',
  fields: [
    defineField({
      name: 'iata',
      type: 'string',
      title: 'IATA code',
      description: 'NCE, MCM, CEQ, CNQ, LTT, STG…',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: { source: 'iata' },
      validation: (r) => r.required(),
    }),
    defineField({ name: 'name', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'shortEn', type: 'text', rows: 2 }),
    defineField({ name: 'shortFr', type: 'text', rows: 2 }),
    defineField({
      name: 'destination',
      type: 'reference',
      to: [{ type: 'destination' }],
      title: 'Linked destination',
    }),
    defineField({ name: 'heroImage', type: 'image', options: { hotspot: true } }),
  ],
  preview: { select: { title: 'name', subtitle: 'iata' } },
});
