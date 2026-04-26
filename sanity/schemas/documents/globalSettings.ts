import { defineType, defineField } from 'sanity';

export const globalSettings = defineType({
  name: 'globalSettings',
  title: 'Global settings',
  type: 'document',
  fields: [
    defineField({ name: 'contactEmail', type: 'string' }),
    defineField({ name: 'contactPhone', type: 'string' }),
    defineField({ name: 'whatsappNumber', type: 'string', title: 'WhatsApp E.164' }),
    defineField({ name: 'instagram', type: 'url' }),
    defineField({ name: 'linkedin', type: 'url' }),
    defineField({
      name: 'heroImageEn',
      type: 'image',
      title: 'Homepage hero image',
      options: { hotspot: true },
    }),
    defineField({ name: 'heroTitleEn', type: 'string' }),
    defineField({ name: 'heroTitleFr', type: 'string' }),
    defineField({ name: 'heroSubEn', type: 'text', rows: 2 }),
    defineField({ name: 'heroSubFr', type: 'text', rows: 2 }),
  ],
});
